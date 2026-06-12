-- =========================================================================
-- Migration: quiz page view tracking (admin analytics)
-- Mirrors the list view-tracking pair (views + view_events / increment_view +
-- trending_views) for quiz pages, so the admin "Quiz Stats" tab can show
-- per-quiz visitors (rolling 24h + all-time) alongside play counts.
--
--   quiz_views        : running total per quiz_id (one row per quiz).
--   quiz_view_events  : one timestamped row per view, for the rolling-24h window.
--
-- Run this in your Supabase project's SQL Editor.
-- =========================================================================

-- All-time view total per quiz.
create table if not exists quiz_views (
  quiz_id text primary key,
  count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- One timestamped row per view, for time-windowed (24h) counts.
create table if not exists quiz_view_events (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  created_at timestamptz not null default now()
);

-- Supports the "since timestamp, grouped by quiz" aggregate.
create index if not exists quiz_view_events_recent_idx on quiz_view_events (created_at desc, quiz_id);

alter table quiz_views enable row level security;
alter table quiz_view_events enable row level security;

-- Anyone can read the totals; only the security-definer RPC writes them.
create policy "quiz views are public" on quiz_views for select using (true);

-- Anyone can read events and log one (with a length cap on quiz_id).
create policy "quiz view events are public" on quiz_view_events
  for select using (true);
create policy "anyone can log a quiz view event" on quiz_view_events
  for insert with check (length(quiz_id) > 0 and length(quiz_id) <= 100);

-- =========================================================================
-- RPC: increment a quiz's all-time view count atomically.
-- =========================================================================
create or replace function increment_quiz_view(p_quiz_id text)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  insert into quiz_views (quiz_id, count, updated_at)
  values (p_quiz_id, 1, now())
  on conflict (quiz_id)
  do update set count = quiz_views.count + 1, updated_at = now()
  returning count into new_count;
  return new_count;
end;
$$;

-- =========================================================================
-- RPC: rolling-window view counts per quiz (defaults to the last 24 hours).
-- =========================================================================
create or replace function quiz_trending_views(p_hours int default 24)
returns table(quiz_id text, cnt bigint)
language sql
stable
as $$
  select quiz_id, count(*)::bigint as cnt
  from quiz_view_events
  where created_at >= now() - make_interval(hours => p_hours)
  group by quiz_id;
$$;

grant execute on function increment_quiz_view(text) to anon;
grant execute on function quiz_trending_views(int) to anon;

-- Optional housekeeping (counts only look back 24h). Prune periodically:
--   delete from quiz_view_events where created_at < now() - interval '7 days';
