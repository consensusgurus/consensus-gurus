-- Cold-start snapshot for the admin panel's wide quiz_results read (2026-08-28).
-- Run in the Supabase SQL Editor.
--
-- WHY A SECOND SNAPSHOT TABLE, given 44 already exists: the two reads want
-- different columns. Migration 44 persists the narrow scoring column set that
-- every hot /api/quiz/* route needs. The admin panel additionally needs the
-- traffic-metadata columns from migrations 26 and 27 (country, region, city,
-- timezone, referrer, language, ua_browser, ua_os) for its per-player device and
-- geo breakdowns and the player map.
--
-- Widening migration 44's payload to cover the admin would make every hot route
-- on the site ship referrer URLs it never reads, to make one page faster for one
-- person. So the admin keeps its own payload here, and lib/quiz-results-cache.js
-- is untouched.
--
-- CONTEXT: before this work /admin paged the whole table on every single load,
-- measured at 34.9s TTFB on three consecutive live loads (no warm benefit, since
-- the page is force-dynamic and had no cache at all). lib/admin-results-cache.js
-- adds the in-process count+delta cache that fixes the warm case; this table
-- fixes the cold case, which matters because this project deploys often enough
-- (~42/day measured in August 2026) that cold is the common case.
--
-- SAFE TO APPLY LATE: lib/admin-results-cache.js wraps every read and write here
-- in try/catch and falls back to a plain keyset load, so the deploy works
-- unchanged before this migration runs. It simply gets faster afterwards.

create table if not exists quiz_results_admin_snapshot (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  -- Highest quiz_results.id contained in `payload`. A reader fetches only rows
  -- above this, so a stale snapshot stays correct, just with a longer delta.
  max_row_id  bigint not null,
  row_count   int not null,
  -- Which COL_TIERS index built this payload. The column list degrades on a
  -- database that predates migrations 27/26/25/24, and a snapshot written with
  -- one tier must never be handed to a reader expecting another, so a mismatch
  -- makes the reader fall back to a full load.
  cols_idx    int not null,
  -- base64(gzip(JSON.stringify(rows))). Text rather than bytea so it survives
  -- PostgREST's JSON transport without a hex round trip.
  payload     text not null
);

-- The only access pattern: newest first, limit 1.
create index if not exists quiz_results_admin_snapshot_recent
  on quiz_results_admin_snapshot (id desc);

-- Service-role only, exactly like the rest of the quiz tables: RLS on, no
-- policies, so the anon key cannot read or write it. This payload carries
-- per-play referrer, city and user-agent data, so it must never be readable by
-- the anon key.
alter table quiz_results_admin_snapshot enable row level security;
