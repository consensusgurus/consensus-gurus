-- Cold-start snapshot for quiz_results (2026-08-01).
-- Run in the Supabase SQL Editor.
--
-- WHY: every hot quiz route keeps its own in-process copy of quiz_results, so a
-- cold deploy has each of them independently page the whole table at the same
-- moment. Measured on one live cold load: daily-status 16.2s, xp 12.7s,
-- xp-categories 12.5s, totals 12.5s, me 11.3s — roughly 200,000 rows of
-- concurrent egress to render one page. Paging strategy cannot fix that; the
-- contended resource is the database, and the work is duplicated six ways.
--
-- WHAT THIS IS: one row holding the entire result set as gzipped JSON. A cold
-- instance reads that single row (about a megabyte) and then asks only for rows
-- newer than the snapshot's max id, instead of walking 33,800 rows in 34 paged
-- queries. The scoring code is untouched: this caches the ROWS, not any derived
-- figure, so nothing about IQ Points, trophies or ranks can drift.
--
-- Written by whichever request performs a full load, and refreshed when it goes
-- stale (see SNAP_MAX_AGE_MS / SNAP_MAX_LAG in lib/quiz-results-cache.js). The
-- app keeps only the two newest rows.
--
-- SAFE TO APPLY LATE: lib/quiz-results-cache.js wraps every read and write here
-- in try/catch and falls back to the plain keyset load, so the deploy works
-- unchanged before this migration runs. It simply gets faster afterwards.

create table if not exists quiz_results_snapshot (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  -- Highest quiz_results.id contained in `payload`. A reader fetches only rows
  -- above this, so a stale snapshot stays correct, just with a longer delta.
  max_row_id  bigint not null,
  row_count   int not null,
  -- Which COL_TIERS index built this payload. The column list degrades on a
  -- database that predates migrations 37/33/25/24, and a snapshot written with
  -- one tier must never be handed to a reader expecting another, so a mismatch
  -- makes the reader fall back to a full load.
  cols_idx    int not null,
  -- base64(gzip(JSON.stringify(rows))). Text rather than bytea so it survives
  -- PostgREST's JSON transport without a hex round trip.
  payload     text not null
);

-- The only access pattern: newest first, limit 1.
create index if not exists quiz_results_snapshot_recent
  on quiz_results_snapshot (id desc);

-- Service-role only, exactly like the rest of the quiz tables: RLS on, no
-- policies, so the anon key cannot read or write it.
alter table quiz_results_snapshot enable row level security;
