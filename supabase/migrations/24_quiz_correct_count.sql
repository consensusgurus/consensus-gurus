-- Store the TRUE correct-answer count for timed-mcq (points-based) quiz results.
-- Those rows store `score` as a time-decayed points total, so the correct count
-- can't be recovered from it; skill stats had to ESTIMATE correctness. With this
-- column the client reports the exact count and stats become exact.
-- Nullable: old rows (and ordinary count-based quizzes) leave it null and fall
-- back to score/estimate, so this is safe to apply before or after the deploy.
alter table public.quiz_results add column if not exists correct_count integer;
