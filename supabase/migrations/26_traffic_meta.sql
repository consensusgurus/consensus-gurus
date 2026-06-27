-- =========================================================================
-- Migration: traffic metadata (country + browser/OS) for admin analytics
-- Adds best-effort country and parsed browser/OS columns to the three traffic
-- sinks so the admin Analytics tables can show where players come from and what
-- they play on. All columns are NULLABLE on purpose: rows written before this
-- migration, and any request that lacks the source signal (local dev, missing
-- header), stay NULL and are simply shown as "—".
--
-- country     : ISO-3166 alpha-2 from Vercel's x-vercel-ip-country edge header.
-- region      : subdivision code (state/province) from x-vercel-ip-country-region.
-- ua_browser  : coarse browser name parsed from the user-agent (Chrome, Safari…).
-- ua_os       : coarse OS name parsed from the user-agent (iOS, Windows…).
-- (quiz_results.is_mobile already exists from migration 25_quiz_device.sql.)
--
-- The API routes tolerate these columns being absent (they retry the insert
-- without them and the admin read falls back to the base column set), so the
-- code is safe to deploy before this migration is run. Run it in the Supabase
-- SQL Editor after 25_quiz_device.sql; the new columns simply start filling in.
-- =========================================================================

-- Completed quiz games (one row per play) — drives the player tables.
alter table quiz_results    add column if not exists country    text;
alter table quiz_results    add column if not exists region     text;
alter table quiz_results    add column if not exists ua_browser text;
alter table quiz_results    add column if not exists ua_os      text;

-- List page views (one timestamped row per view).
alter table view_events     add column if not exists country    text;
alter table view_events     add column if not exists region     text;
alter table view_events     add column if not exists ua_browser text;
alter table view_events     add column if not exists ua_os      text;

-- Quiz page views (one timestamped row per view).
alter table quiz_view_events add column if not exists country    text;
alter table quiz_view_events add column if not exists region     text;
alter table quiz_view_events add column if not exists ua_browser text;
alter table quiz_view_events add column if not exists ua_os      text;
