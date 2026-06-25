-- Tag each completed quiz game with the device it was played on, so the
-- per-quiz leaderboard can offer a "Mobile" view alongside Registered / All.
-- Run in the Supabase SQL Editor (after 24_quiz_correct_count.sql).
--
-- is_mobile is a best-effort client classification (user-agent / coarse pointer)
-- sent with every result. It is NULLABLE on purpose: rows that predate this
-- column, and any client that omits the flag, stay NULL. The "Mobile"
-- leaderboard counts ONLY rows where is_mobile is explicitly true, so unknown /
-- legacy games are simply excluded (never miscounted as desktop or mobile).
--
-- The API routes already tolerate this column being absent (they fall back to
-- inserting without is_mobile and to selecting without it), so deploying the
-- code before this migration is safe; the Mobile view fills in once it exists.

alter table quiz_results add column if not exists is_mobile boolean;

create index if not exists quiz_results_quiz_mobile
  on quiz_results (quiz_id)
  where is_mobile = true;
