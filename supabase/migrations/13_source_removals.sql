-- =========================================================================
-- Migration: document source removals in the activity feed
--
-- Adds the source's display label and a removed_at timestamp to
-- list_sources_seen. The label is stored so a removed source can still be
-- named in the feed after it's gone from lib/data.js; removed_at is set the
-- first time the feed (or cron) notices a previously-tracked source is no
-- longer on the list. The feed then shows "Source removed: <label>".
--
-- Run this in your Supabase SQL Editor.
-- =========================================================================

alter table public.list_sources_seen
  add column if not exists label      text,
  add column if not exists removed_at  timestamptz;
