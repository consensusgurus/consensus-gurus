-- Record whether a quiz_results row came from an ABANDONED in-progress game (the
-- player interacted with the board, then left before finishing) versus a normal
-- completion. The daily leaderboard prefers each player's first COMPLETED attempt
-- and only falls back to an abandoned row when they never finished, so a real
-- finish supersedes an earlier abandon while a pure abandon still counts as a
-- play. Defaults false, so every existing row and every ordinary finish reads as
-- completed; safe to apply before or after the deploy.
alter table public.quiz_results add column if not exists abandoned boolean not null default false;
