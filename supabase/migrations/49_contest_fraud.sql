-- =========================================================================
-- Migration 49: contest fraud review
--
-- Two additive pieces, neither of which changes how the contest SCORES:
--
--   1. quiz_results.ip_hash  -- a salted SHA-256 of the request IP, truncated
--      to 16 hex characters. The RAW IP IS NEVER STORED, never logged, and
--      never leaves the request. The hash exists for exactly one purpose: to
--      tell whether two "different people" are the same machine.
--
--   2. quiz_contest_referrals() -- one row per referral credited inside the
--      contest window, with the referred person's play counts and their
--      device/geo fingerprint already folded in, plus the REFERRER's own
--      fingerprint alongside it for comparison.
--
-- WHY A FUNCTION RATHER THAN READING THE TABLES:
--
-- The interesting join is "for each referral, summarise every game that person
-- ever finished". Done from the app that means pulling all of quiz_results
-- (33,800 rows and growing) to compute a few dozen numbers. Done here it is one
-- indexed lateral per referral, and the result set is the size of the referral
-- table, which is small. The indexes migration 46 added
-- (quiz_results_anon_live_idx, quiz_results_user_live_idx) are exactly the ones
-- this needs, so it is cheap.
--
-- WHY IT RETURNS ROWS RATHER THAN A VERDICT:
--
-- The scoring lives in lib/contest-fraud.js, in JavaScript, on purpose. Fraud
-- weights are judgement calls that will be tuned while staring at real data,
-- and tuning a heuristic should not mean a hand-run SQL migration each time.
-- SQL does the expensive join; JS decides what looks wrong.
--
-- NOTHING HERE IS A VERDICT ANYWAY. Every signal has an innocent explanation
-- (a family shares a router, a college dorm shares a city and a laptop model,
-- a popular post lands everyone on the same day from the same referrer). The
-- output is a queue to LOOK at, ordered so the worst-looking accounts surface
-- first, and it should never be wired to an automatic disqualification.
--
-- Run this whole file in your Supabase project's SQL Editor. The app tolerates
-- it not being applied yet: the admin page shows a "waiting on the database"
-- state and the result route drops ip_hash from its insert.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. The column.
--
-- NULLABLE on purpose, and it will stay null for every row written before this
-- migration ran. That is not a gap to be backfilled: the raw IPs were never
-- recorded, so those hashes do not exist and cannot be reconstructed. The
-- admin page states the coverage date rather than pretending the history is
-- complete.
-- -------------------------------------------------------------------------
alter table quiz_results add column if not exists ip_hash text;

-- Partial: the overwhelming majority of historical rows are null, and every
-- query here asks "who else shares this hash", never "which rows are null".
create index if not exists quiz_results_ip_hash
  on quiz_results (ip_hash) where ip_hash is not null;

-- -------------------------------------------------------------------------
-- 2. One row per credited referral, with both fingerprints.
--
-- Seeded rows (the Gator85 launch scaffolding from migration 38) are excluded,
-- matching quiz_contest_carryin. They are display furniture, not referrals, and
-- would otherwise show up as a perfect 17-referral fraud cluster.
--
-- The fingerprint is taken from the referred person's FIRST finished game,
-- because that is the play that earned the credit and the one an account farmer
-- has to produce. Later plays can legitimately come from anywhere (a real
-- player travels, switches to their phone); the first one is the tell.
--
-- p_start / p_end bound when the REFERRAL was earned, exactly as in migration
-- 46, so this view lines up with the board it is reviewing. Pass a wide window
-- to review carry-in referrals too.
-- -------------------------------------------------------------------------
create or replace function quiz_contest_referrals(
  p_start timestamptz,
  p_end   timestamptz
)
returns table(
  referrer_user_id    uuid,
  username            text,
  ref_code            text,
  has_email           boolean,
  referrer_created_at timestamptz,
  referred_key        text,
  referred_user_id    uuid,
  referred_username   text,
  credited_at         timestamptz,
  quiz_id             text,
  first_play          timestamptz,
  last_play           timestamptz,
  plays               bigint,
  sessions            bigint,
  city                text,
  region              text,
  country             text,
  timezone            text,
  ua_browser          text,
  ua_os               text,
  is_mobile           boolean,
  language            text,
  referrer_host       text,
  campaign            text,
  ip_hash             text,
  ip_match_referrer   boolean,
  self_city           text,
  self_region         text,
  self_country        text,
  self_timezone       text,
  self_ua_browser     text,
  self_ua_os          text,
  self_is_mobile      boolean
)
language sql stable security definer as $$
  select
    r.referrer_user_id,
    u.username,
    u.ref_code,
    (u.email is not null and length(trim(u.email)) > 0) as has_email,
    u.created_at as referrer_created_at,
    r.referred_key,
    r.referred_user_id,
    ru.username as referred_username,
    r.created_at as credited_at,
    r.quiz_id,
    agg.first_play,
    agg.last_play,
    coalesce(agg.plays, 0)    as plays,
    coalesce(agg.sessions, 0) as sessions,
    fp.city, fp.region, fp.country, fp.timezone,
    fp.ua_browser, fp.ua_os, fp.is_mobile, fp.language,
    fp.referrer as referrer_host,
    fp.campaign,
    fp.ip_hash,
    -- Does ANY game this person finished share a machine with ANY game the
    -- REFERRER finished? This is the single strongest signal available, and the
    -- reason the column was added: the cheap attack is private windows on one
    -- laptop, which mints a fresh visitor id every time but cannot change the
    -- IP. Null-safe on both sides, so a pre-migration row never matches.
    coalesce((
      select true
      from quiz_results a
      join quiz_results b on b.ip_hash = a.ip_hash
      where a.ip_hash is not null
        and (a.anon_id = r.referred_key
             or (r.referred_user_id is not null and a.user_id = r.referred_user_id))
        and (b.user_id = r.referrer_user_id
             or (u.anon_id is not null and b.anon_id = u.anon_id))
      limit 1
    ), false) as ip_match_referrer,
    self.city, self.region, self.country, self.timezone,
    self.ua_browser, self.ua_os, self.is_mobile
  from quiz_referrals r
  join quiz_users u on u.id = r.referrer_user_id
  left join quiz_users ru on ru.id = r.referred_user_id
  -- Lifetime activity of the referred person. Matches on the browser key AND,
  -- once they register, their user id, exactly as the scoring board does, so
  -- the plays/sessions here reconcile with the score they produced.
  left join lateral (
    select count(*)                                          as plays,
           count(distinct date_trunc('day', qr.created_at))  as sessions,
           min(qr.created_at)                                as first_play,
           max(qr.created_at)                                as last_play
    from quiz_results qr
    where coalesce(qr.abandoned, false) = false
      and (qr.anon_id = r.referred_key
           or (r.referred_user_id is not null and qr.user_id = r.referred_user_id))
  ) agg on true
  -- The referred person's first finished game: the credit-earning play.
  left join lateral (
    select qr.city, qr.region, qr.country, qr.timezone, qr.ua_browser,
           qr.ua_os, qr.is_mobile, qr.language, qr.referrer, qr.campaign, qr.ip_hash
    from quiz_results qr
    where coalesce(qr.abandoned, false) = false
      and (qr.anon_id = r.referred_key
           or (r.referred_user_id is not null and qr.user_id = r.referred_user_id))
    order by qr.created_at asc
    limit 1
  ) fp on true
  -- The REFERRER's own most recent game, so the page can put "where they play"
  -- next to "where the people they brought in play" on the same line.
  left join lateral (
    select qr.city, qr.region, qr.country, qr.timezone,
           qr.ua_browser, qr.ua_os, qr.is_mobile
    from quiz_results qr
    where coalesce(qr.abandoned, false) = false
      and (qr.user_id = r.referrer_user_id
           or (u.anon_id is not null and qr.anon_id = u.anon_id))
    order by qr.created_at desc
    limit 1
  ) self on true
  where r.created_at >= p_start
    and r.created_at <= p_end
    and coalesce(r.seeded, false) = false
  order by u.username asc, r.created_at asc;
$$;

-- ADMIN ONLY. Unlike the board functions in migrations 46 and 47, this one
-- returns referred_key and ip_hash, which are per-person identifiers. It is
-- read exclusively by app/admin/contest through the service-role client, so the
-- public roles are revoked rather than granted.
revoke all on function quiz_contest_referrals(timestamptz, timestamptz) from public;
revoke all on function quiz_contest_referrals(timestamptz, timestamptz) from anon;
revoke all on function quiz_contest_referrals(timestamptz, timestamptz) from authenticated;
grant execute on function quiz_contest_referrals(timestamptz, timestamptz) to service_role;
