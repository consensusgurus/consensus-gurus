-- =========================================================================
-- Migration: track source label refreshes ("Updated sources" feed events)
--
-- Adds label_updated_at to list_sources_seen. Stamped (by the daily cron and
-- the per-list feed route) whenever an already-tracked source's display label
-- changes -- a re-gathered ratings source ("May 2026" -> "June 2026") or a
-- publication swapped to a new year's edition -- or when a removed source is
-- re-added. A null stored label is backfilled silently with NO stamp, so the
-- first run after this migration does not flood the ledger with fake events.
--
-- Run this in your Supabase SQL Editor. (Run 2026-06-07 via dashboard.)
-- =========================================================================

alter table public.list_sources_seen
  add column if not exists label_updated_at timestamptz;
