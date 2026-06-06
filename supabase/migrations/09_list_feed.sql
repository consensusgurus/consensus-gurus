-- =========================================================================
-- Migration: list activity feed (public comments + feed moderation)
--
-- Powers the "Activity" tab on each list page (ActivityFeed.jsx, served by
-- /api/list-feed and /api/comments). The feed surfaces four streams:
--   1. Live votes        -> existing vote_events table (06_vote_events.sql)
--   2. Manager notes      -> existing complaints table, message + created_at
--                            ONLY (name/email are NEVER selected by the public
--                            read route). A feed_hidden flag lets the editor
--                            suppress any specific note from the public feed.
--   3. Re-research events -> existing consensus_alerts table (08).
--   4. Public comments    -> the new list_comments table below.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

-- 1. Public comments left on a list. Name is optional (renders as "Guest").
create table if not exists public.list_comments (
  id          bigint generated always as identity primary key,
  list_id     text not null,
  name        text,
  body        text not null,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists list_comments_recent_idx
  on public.list_comments (list_id, created_at desc);

alter table public.list_comments enable row level security;

-- Readers (anon key, via /api/comments) may post a comment, nothing else.
-- Reads run through the service-role key in /api/list-feed, which bypasses
-- RLS and selects only the public columns, so no select policy is needed.
create policy "anon can insert list comments"
  on public.list_comments
  for insert
  to anon
  with check (
    length(list_id) > 0 and length(list_id) <= 100
    and length(coalesce(name, '')) <= 120
    and length(body) > 0 and length(body) <= 1000
  );

-- 2. Moderation kill-switch for manager notes shown in the public feed.
-- Defaults to visible (false). Flip to true to hide a specific complaint
-- from the public Activity feed (it still appears in the admin Notices tab).
alter table public.complaints
  add column if not exists feed_hidden boolean not null default false;
