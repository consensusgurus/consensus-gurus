-- =========================================================================
-- Migration: rolling-24h "Trending" support
-- The views table only stores a running total per list, so time-windowed
-- counts are impossible from it. view_events records one timestamped row
-- per view, and trending_views() aggregates the last N hours.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

create table if not exists view_events (
  id bigint generated always as identity primary key,
  list_id text not null,
  created_at timestamptz not null default now()
);

-- Supports the "since timestamp, grouped by list" aggregate.
create index if not exists view_events_recent_idx on view_events (created_at desc, list_id);

alter table view_events enable row level security;

create policy "anyone can log a view event" on view_events
  for insert with check (length(list_id) > 0 and length(list_id) <= 100);

create policy "view events are public" on view_events
  for select using (true);

-- Rolling-window view counts per list (defaults to the last 24 hours).
create or replace function trending_views(p_hours int default 24)
returns table(list_id text, cnt bigint)
language sql
stable
as $$
  select list_id, count(*)::bigint as cnt
  from view_events
  where created_at >= now() - make_interval(hours => p_hours)
  group by list_id;
$$;

grant execute on function trending_views(int) to anon;

-- Optional housekeeping (counts only look back 24h). Prune periodically:
--   delete from view_events where created_at < now() - interval '7 days';
