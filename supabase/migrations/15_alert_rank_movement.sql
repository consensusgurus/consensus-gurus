-- 15: Exact rank movement on consensus alerts. Run in the Supabase SQL Editor.
-- (Already applied 2026-06-07.)
--
-- prev_rank records where an item sat before the change; rank where it landed.
-- 0 means unranked (outside the top 10). 'moved' covers shifts within the
-- top 10 that cross no boundary (e.g. #4 -> #7); like the exit types it is
-- inserted resolved=true so it never enters the research queue.

alter table consensus_alerts add column if not exists prev_rank integer;
alter table consensus_alerts drop constraint if exists consensus_alerts_change_type_check;
alter table consensus_alerts add constraint consensus_alerts_change_type_check
  check (change_type in ('entered_top10','entered_top3','exited_top10','exited_top3','moved'));
