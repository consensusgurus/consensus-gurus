-- Referral contest board: a FIXED-window, email-gated, weighted board.
-- Run in the Supabase SQL Editor.
--
-- Why this is not quiz_top_referrers (migration 38 / 41):
--
--   1. FIXED window, not rolling. quiz_top_referrers takes p_days and counts
--      back from now(), so on day 3 of a 14-day contest it would still be
--      counting credits earned before the contest began. A contest needs hard
--      start/end instants, passed in from lib/contest.js.
--   2. WEIGHTED score, not a credit count. Owner formula (2026-08-05):
--          score = users x 1 + sessions x 0.5 + plays x 0.025
--      summed over the people a referrer brought in during the window. Plays
--      are deliberately tiny (40 games = 1 player) so grinding cannot outrun
--      genuine word of mouth; sessions carry the weight.
--   3. EMAIL REQUIRED. Prize money is paid by Venmo, so an account with no
--      email on file cannot be contacted or paid, and per the known sign-in
--      lockout it cannot even get back into its own account. Such accounts are
--      excluded from the board rather than ranked and then disqualified.
--
-- Definitions, and why:
--   users    = distinct referred people credited to the referrer IN the window.
--              Already deduped at the source: quiz_referrals has a unique index
--              on referred_key, so one person can only ever credit one referrer
--              once, however much they play.
--   sessions = distinct DAYS (UTC) on which a referred person finished a game.
--              The schema has no session concept, and days are the better
--              metric anyway: page views are trivially spammable, whereas
--              nobody can manufacture five separate days on the last night.
--   plays    = non-abandoned rows in quiz_results for that person.
--
-- A referred person's plays/sessions count for their WHOLE history, not just
-- the contest window. Someone who brings in a lapsed player who then returns
-- and plays for a week should get credit for that week. The WINDOW bounds when
-- the REFERRAL was earned, which is the thing the contest is actually about.

-- ---------------------------------------------------------------------------
-- The board.
-- ---------------------------------------------------------------------------
create or replace function quiz_contest_board(
  p_start timestamptz,
  p_end   timestamptz,
  p_limit int default 25
)
returns table(
  username text,
  ref_code text,
  users    bigint,
  sessions bigint,
  plays    bigint,
  score    numeric
)
language sql stable security definer as $$
  with win as (
    -- Referrals earned inside the contest window, by a referrer who can be paid.
    select r.referrer_user_id, r.referred_key, r.referred_user_id, r.created_at
    from quiz_referrals r
    join quiz_users u on u.id = r.referrer_user_id
    where r.created_at >= p_start
      and r.created_at <= p_end
      and u.email is not null
      and length(trim(u.email)) > 0
  ),
  per_person as (
    select
      w.referrer_user_id,
      w.referred_key,
      -- Distinct UTC days this referred person finished a game, CAPPED AT 5.
      -- The cap is per person and must be applied before the sum: uncapped, one
      -- devoted referral outweighs several real new players, which inverts the
      -- intent that headcount leads.
      least(coalesce((
        select count(distinct date_trunc('day', qr.created_at))
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 5) as sessions,
      -- Plays capped per person at 25, same reasoning as the session cap: a
      -- single superfan must not be able to outweigh several real new players.
      least(coalesce((
        select count(*)
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 25) as plays
    from win w
  )
  select
    u.username,
    u.ref_code,
    count(*)::bigint                as users,
    sum(p.sessions)::bigint         as sessions,
    sum(p.plays)::bigint            as plays,
    round(
      count(*)::numeric * 1.0
      + sum(p.sessions)::numeric * 0.5
      + sum(p.plays)::numeric * 0.025
    , 3)                            as score
  from per_person p
  join quiz_users u on u.id = p.referrer_user_id
  group by u.id, u.username, u.ref_code
  -- Ties break to whoever got there first, so a leader cannot be displaced by
  -- someone merely matching them on the last day.
  order by score desc, users desc, min(p.referred_key) asc
  limit p_limit;
$$;

grant execute on function quiz_contest_board(timestamptz, timestamptz, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- One referrer's own standing, including their rank. Separate from the board
-- because the viewer is usually NOT in the top N and still needs their number.
-- ---------------------------------------------------------------------------
create or replace function quiz_contest_standing(
  p_user_id uuid,
  p_start   timestamptz,
  p_end     timestamptz
)
returns table(
  users    bigint,
  sessions bigint,
  plays    bigint,
  score    numeric,
  rank     bigint
)
language sql stable security definer as $$
  with board as (
    -- Unlimited board, so the rank is a true rank and not capped at the page
    -- size. (This is the bug that once capped quiz placements at #11.)
    select b.ref_code, b.users, b.sessions, b.plays, b.score,
           row_number() over (order by b.score desc, b.users desc) as rank
    from quiz_contest_board(p_start, p_end, 100000) b
  )
  select b.users, b.sessions, b.plays, b.score, b.rank
  from board b
  join quiz_users u on lower(u.ref_code) = lower(b.ref_code)
  where u.id = p_user_id;
$$;

grant execute on function quiz_contest_standing(uuid, timestamptz, timestamptz) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Backfill: credit existing referrers for what they already brought in.
--
-- Owner decision (2026-08-05): players who referred people BEFORE the contest
-- started keep those contributions rather than being reset to zero. Without
-- this, everyone who did the work during the soft launch starts the contest
-- level with someone who has done nothing, which punishes exactly the people
-- the contest is meant to reward.
--
-- Implementation: rather than rewriting history (which would corrupt the
-- created_at audit trail that the anti-fraud review depends on), pre-contest
-- referrals are folded in by BACKDATING the contest's effective start for
-- scoring purposes to the epoch, via a separate carry-in function. The API
-- calls quiz_contest_board with the real window for the "earned this week"
-- number and adds the carry-in below. Both are shown separately on the surface
-- so nobody thinks their history was erased or double-counted.
--
-- Seeded rows (the Gator85 launch seed from migration 38) are EXCLUDED: they
-- are display scaffolding, not real referrals, and must not win money.
-- ---------------------------------------------------------------------------
create or replace function quiz_contest_carryin(
  p_before timestamptz,
  p_limit  int default 100000
)
returns table(
  username text,
  ref_code text,
  users    bigint,
  sessions bigint,
  plays    bigint,
  score    numeric
)
language sql stable security definer as $$
  with win as (
    select r.referrer_user_id, r.referred_key, r.referred_user_id
    from quiz_referrals r
    join quiz_users u on u.id = r.referrer_user_id
    where r.created_at < p_before
      and coalesce(r.seeded, false) = false
      and u.email is not null
      and length(trim(u.email)) > 0
  ),
  per_person as (
    select
      w.referrer_user_id,
      w.referred_key,
      -- Same per-person cap as the window board. Both functions must apply it
      -- or the carry-in would score on a different scale than the contest.
      least(coalesce((
        select count(distinct date_trunc('day', qr.created_at))
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 5) as sessions,
      -- Plays capped per person at 25, same reasoning as the session cap: a
      -- single superfan must not be able to outweigh several real new players.
      least(coalesce((
        select count(*)
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 25) as plays
    from win w
  )
  select
    u.username,
    u.ref_code,
    count(*)::bigint        as users,
    sum(p.sessions)::bigint as sessions,
    sum(p.plays)::bigint    as plays,
    round(
      count(*)::numeric * 1.0
      + sum(p.sessions)::numeric * 0.5
      + sum(p.plays)::numeric * 0.025
    , 3)                    as score
  from per_person p
  join quiz_users u on u.id = p.referrer_user_id
  group by u.id, u.username, u.ref_code
  order by score desc
  limit p_limit;
$$;

grant execute on function quiz_contest_carryin(timestamptz, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Index support. The board scans quiz_results by anon_id and by user_id for
-- every referred person; without these it is a sequential scan per person.
-- ---------------------------------------------------------------------------
create index if not exists quiz_results_anon_live_idx
  on quiz_results (anon_id, created_at)
  where coalesce(abandoned, false) = false;

create index if not exists quiz_results_user_live_idx
  on quiz_results (user_id, created_at)
  where coalesce(abandoned, false) = false;
