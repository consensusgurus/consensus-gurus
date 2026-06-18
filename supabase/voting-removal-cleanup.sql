-- =========================================================================
-- MANUAL CLEANUP — NATIVE VOTING REMOVAL (2026-06-18)
-- =========================================================================
-- ⚠️  DESTRUCTIVE. DO NOT run automatically and DO NOT add to the numbered
--     migrations. The application code no longer reads or writes any of the
--     objects below, so the site runs correctly WITHOUT this script. Run it
--     only when you (the owner) are ready to permanently drop the legacy
--     voting data from the database.
--
-- What it does:
--   1. Removes activity-feed rows attributed to votes (consensus_alerts where
--      cause = 'votes'). These no longer render (the feed filters them out),
--      this just deletes them for good.
--   2. Drops the per-vote event log table (vote_events).
--   3. Drops the aggregate votes table (votes).
--
-- What it intentionally KEEPS:
--   - extras (user-added items) — still used by the consensus engine.
--   - consensus_alerts table and its cause column — still used for 'edit'
--     and null-cause ranking-change events.
--
-- Run in the Supabase SQL Editor. Wrapped in a transaction so it is all-or-
-- nothing; review the row counts from the SELECTs before committing if you
-- run the steps interactively.
-- =========================================================================

begin;

-- 1. Purge vote-caused activity rows. (Optional preview before deleting:)
--      select count(*) from consensus_alerts where cause = 'votes';
delete from consensus_alerts where cause = 'votes';

-- 2. Drop the per-vote event log (policies/indexes drop with the table).
drop table if exists vote_events cascade;

-- 3. Drop the aggregate votes table.
drop table if exists votes cascade;

commit;

-- =========================================================================
-- Post-run sanity checks (run separately, after COMMIT):
--   select to_regclass('public.votes')        as votes_table;        -- expect NULL
--   select to_regclass('public.vote_events')  as vote_events_table;  -- expect NULL
--   select count(*) from consensus_alerts where cause = 'votes';     -- expect 0
-- =========================================================================
