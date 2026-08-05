-- "Unclaimed" standings: referrers who would place but cannot be paid.
-- Run in the Supabase SQL Editor. Additive only, nothing in migration 46 changes.
--
-- WHY: migration 46 filters accounts with no email out of the board entirely,
-- because a prize cannot be paid to someone who cannot be contacted. That is
-- correct for the RANKING, but it made the exclusion invisible: a real referrer
-- with three players simply was not there, with no hint that a missing email
-- was the reason or that adding one would fix it.
--
-- These two functions are the SAME queries as quiz_contest_board and
-- quiz_contest_carryin with the email filter REMOVED and a has_email flag
-- added, so the API can compute a merged field, rank everyone in it, and then
-- show the ineligible ones separately alongside the position they would hold.
--
-- New functions rather than an edit to the originals: Postgres cannot change a
-- function's return signature with CREATE OR REPLACE (it needs DROP + CREATE),
-- and dropping a live function that the API depends on would break the board
-- for as long as the deploy took. Additive is the safe path.
--
-- The per-person caps (5 sessions, 25 plays) and the weights are IDENTICAL to
-- migration 46. If those ever change, both files must change together, or the
-- unclaimed placement would be computed on a different scale than the board it
-- is being slotted into.

create or replace function quiz_contest_board_all(
  p_start timestamptz,
  p_end   timestamptz,
  p_limit int default 100000
)
returns table(
  username  text,
  ref_code  text,
  has_email boolean,
  users     bigint,
  sessions  bigint,
  plays     bigint,
  score     numeric
)
language sql stable security definer as $$
  with win as (
    select r.referrer_user_id, r.referred_key, r.referred_user_id
    from quiz_referrals r
    join quiz_users u on u.id = r.referrer_user_id
    where r.created_at >= p_start
      and r.created_at <= p_end
  ),
  per_person as (
    select
      w.referrer_user_id,
      w.referred_key,
      least(coalesce((
        select count(distinct date_trunc('day', qr.created_at))
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 5) as sessions,
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
    (u.email is not null and length(trim(u.email)) > 0) as has_email,
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
  group by u.id, u.username, u.ref_code, has_email
  order by score desc, users desc
  limit p_limit;
$$;

grant execute on function quiz_contest_board_all(timestamptz, timestamptz, int) to anon, authenticated;

create or replace function quiz_contest_carryin_all(
  p_before timestamptz,
  p_limit  int default 100000
)
returns table(
  username  text,
  ref_code  text,
  has_email boolean,
  users     bigint,
  sessions  bigint,
  plays     bigint,
  score     numeric
)
language sql stable security definer as $$
  with win as (
    select r.referrer_user_id, r.referred_key, r.referred_user_id
    from quiz_referrals r
    join quiz_users u on u.id = r.referrer_user_id
    where r.created_at < p_before
      and coalesce(r.seeded, false) = false
  ),
  per_person as (
    select
      w.referrer_user_id,
      w.referred_key,
      least(coalesce((
        select count(distinct date_trunc('day', qr.created_at))
        from quiz_results qr
        where coalesce(qr.abandoned, false) = false
          and (qr.anon_id = w.referred_key
               or (w.referred_user_id is not null and qr.user_id = w.referred_user_id))
      ), 0), 5) as sessions,
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
    (u.email is not null and length(trim(u.email)) > 0) as has_email,
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
  group by u.id, u.username, u.ref_code, has_email
  order by score desc
  limit p_limit;
$$;

grant execute on function quiz_contest_carryin_all(timestamptz, int) to anon, authenticated;
