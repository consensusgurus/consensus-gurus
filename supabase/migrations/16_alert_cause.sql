-- 16: Cause attribution for consensus alerts. Run in the Supabase SQL Editor.
-- (Already applied 2026-06-07.)
--
-- The cron fingerprints each list's source data and stores it on the
-- snapshot. When the fingerprint changes between runs, that run's ranking
-- changes were caused by a deploy edit (cause 'edit'); otherwise only votes
-- could have moved the consensus (cause 'votes'). The ledgers chip loose
-- changes accordingly ("List edited" vs "Votes"). Null cause = legacy row.

alter table consensus_snapshots add column if not exists sources_hash text;
alter table consensus_alerts add column if not exists cause text;

-- Backfill the known deploy-edit rows that predate cause tracking:
-- trustworthy-twitter-accounts rework (6a6da60, Jun 5) -> alerts Jun 6 09:00
update consensus_alerts set cause='edit'
  where list_id='trustworthy-twitter-accounts'
    and detected_at >= '2026-06-06T08:59:00Z' and detected_at < '2026-06-06T09:02:00Z';
-- caesar-wraps-la off-scope item purge (f508749, Jun 6) -> alerts Jun 7 09:00
update consensus_alerts set cause='edit'
  where list_id='caesar-wraps-la'
    and detected_at >= '2026-06-07T08:59:00Z' and detected_at < '2026-06-07T09:02:00Z';
