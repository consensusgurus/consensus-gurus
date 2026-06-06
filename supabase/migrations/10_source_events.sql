-- =========================================================================
-- Migration: source-added tracking for the list Activity feed
--
-- Records the first time each source appears on a list, so the feed can show
-- "New source added <date>" as a real news event. Populated by the daily
-- consensus-check cron (app/api/cron/consensus-check): on each run it upserts
-- every current (list_id, source_id) with ignoreDuplicates, so first_seen_at
-- is stamped once and never overwritten. The first run backfills all existing
-- sources to that run's timestamp (they group as "N sources at launch").
--
-- Read by /api/list-feed (service-role), which maps source_id -> the current
-- label in lib/data.js. No public policy needed.
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

create table if not exists public.list_sources_seen (
  id            bigint generated always as identity primary key,
  list_id       text not null,
  source_id     text not null,
  first_seen_at timestamptz not null default now(),
  unique (list_id, source_id)
);

create index if not exists list_sources_seen_idx
  on public.list_sources_seen (list_id, first_seen_at desc);

alter table public.list_sources_seen enable row level security;
-- Writes happen via the service-role key in the cron; reads via service-role
-- in /api/list-feed. No anon policy is required.
