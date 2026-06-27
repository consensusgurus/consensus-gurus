-- =========================================================================
-- Migration: city / timezone / referrer / language for player analytics
-- Extends the per-play traffic metadata (migrations 25 + 26) with four more
-- best-effort, NULLABLE columns on quiz_results, so the admin player tables can
-- show finer location, the player's timezone, where they came from, and their
-- language. Rows written before this migration stay NULL ("—").
--
-- city      : Vercel x-vercel-ip-city edge header (free on all plans).
-- timezone  : Vercel x-vercel-ip-timezone edge header (free), e.g. America/Chicago.
-- referrer  : host of the browser's document.referrer at play time (e.g.
--             google.com), sent in the result body; "direct" when empty.
-- language  : first tag of the Accept-Language request header, e.g. en-US.
--
-- The result route tolerates these columns being absent (it retries the insert
-- without them), so deploying the code before this migration is safe; the new
-- columns simply start filling in. Run in the Supabase SQL Editor after
-- 26_traffic_meta.sql.
-- =========================================================================

alter table quiz_results add column if not exists city     text;
alter table quiz_results add column if not exists timezone text;
alter table quiz_results add column if not exists referrer text;
alter table quiz_results add column if not exists language text;
