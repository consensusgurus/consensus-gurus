-- Referral board tie-break: reward bringing in ENGAGED players, then recency.
-- Run in the Supabase SQL Editor. Replaces the quiz_top_referrers function from
-- migration 38 (no schema change; only the ORDER BY of the same result shape).
--
-- Old rule: credits DESC, then whoever got there first (min created_at ASC).
-- New rule (owner, 2026-07-24): among referrers tied on credit count, rank by
--   1. the total ENGAGEMENT of the people they brought in (how many games those
--      referred players have finished), DESC. A referrer whose referral plays 40
--      quizzes outranks one whose referral played once and vanished, so the board
--      rewards real word-of-mouth, not link-spraying.
--   2. then MOST RECENT referral, DESC, so a live board favors current momentum
--      over seniority.
--
-- Engagement is a referred person's lifetime finished games, matched by their
-- browser visitor id (quiz_results.anon_id = quiz_referrals.referred_key) and,
-- once they register, their user id (quiz_results.user_id = referred_user_id).

create or replace function quiz_top_referrers(p_days int default 30, p_limit int default 10)
returns table(username text, ref_code text, credits bigint)
language sql stable security definer as $$
  with win as (
    select r.referrer_user_id, r.referred_key, r.referred_user_id, r.created_at
    from quiz_referrals r
    where r.created_at >= now() - make_interval(days => p_days)
  ),
  scored as (
    select w.referrer_user_id,
           w.created_at,
           coalesce((
             select count(*) from quiz_results qr
             where qr.anon_id = w.referred_key
                or (w.referred_user_id is not null and qr.user_id = w.referred_user_id)
           ), 0) as plays
    from win w
  )
  select u.username, u.ref_code, count(*)::bigint as credits
  from scored s
  join quiz_users u on u.id = s.referrer_user_id
  group by u.id, u.username, u.ref_code
  order by credits desc,
           sum(s.plays) desc,
           max(s.created_at) desc
  limit p_limit;
$$;

grant execute on function quiz_top_referrers(int, int) to anon, authenticated;
