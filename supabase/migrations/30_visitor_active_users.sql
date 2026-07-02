-- =========================================================================
-- Migration 30: site-wide unique-visitor tracking for DAU / WAU / MAU
--
-- view_events and quiz_view_events record one timestamped row per page view
-- but carried NO per-visitor identity, so only raw view COUNTS were possible,
-- not distinct-people counts. This adds a stable per-browser visitor_id to both
-- event streams (written server-side from the sot_vid cookie set by
-- VisitorBeacon, which reuses the quiz anon id) and a single RPC that returns
-- distinct-visitor active-user counts over the standard rolling windows.
--
-- Historical rows (logged before this migration) have a NULL visitor_id and are
-- ignored by the counts, so the numbers fill in over the first 30 days.
--
-- Run this in your Supabase project's SQL Editor.
-- =========================================================================

alter table view_events       add column if not exists visitor_id text;
alter table quiz_view_events  add column if not exists visitor_id text;

create index if not exists view_events_visitor_idx
  on view_events (created_at desc, visitor_id);
create index if not exists quiz_view_events_visitor_idx
  on quiz_view_events (created_at desc, visitor_id);

-- Distinct-visitor active-user counts across BOTH page-view streams:
--   DAU = last 1 day, WAU = last 7 days, MAU = last 30 days.
-- A visitor active on any page (list, quiz, home, kids) counts once per window.
create or replace function visitor_active_counts()
returns table(dau bigint, wau bigint, mau bigint)
language sql
stable
as $$
  with ev as (
    select visitor_id, created_at
      from view_events
     where visitor_id is not null
       and created_at >= now() - interval '30 days'
    union all
    select visitor_id, created_at
      from quiz_view_events
     where visitor_id is not null
       and created_at >= now() - interval '30 days'
  )
  select
    count(distinct visitor_id) filter (where created_at >= now() - interval '1 day')  as dau,
    count(distinct visitor_id) filter (where created_at >= now() - interval '7 days')  as wau,
    count(distinct visitor_id)                                                          as mau
  from ev;
$$;

grant execute on function visitor_active_counts() to anon;
