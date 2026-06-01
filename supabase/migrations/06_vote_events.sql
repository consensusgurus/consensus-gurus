-- =========================================================================
-- Migration: per-vote event log for the admin "Votes" tab
-- The votes table only stores a running aggregate score per (list_id,
-- item_name). vote_events records one timestamped row per vote so the admin
-- panel can show an event stream. Mirrors the view_events pattern.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

create table if not exists vote_events (
  id         bigint generated always as identity primary key,
  list_id    text not null,
  item_name  text not null,
  delta      int  not null,
  created_at timestamptz not null default now()
);

create index if not exists vote_events_recent_idx on vote_events (created_at desc);

alter table vote_events enable row level security;

-- Readers (anon key, via /api/votes) may log a vote event, nothing else.
-- Reads run through the service-role key in the admin page, which bypasses
-- RLS, so no select policy is needed.
create policy "anyone can log a vote event"
  on vote_events
  for insert
  with check (
    length(list_id) > 0 and length(list_id) <= 100
    and length(item_name) > 0 and length(item_name) <= 100
    and delta >= -3 and delta <= 3
  );
