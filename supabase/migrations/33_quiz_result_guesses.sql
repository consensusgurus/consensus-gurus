-- Crux (and any future guess-budget format): record guesses used per result so
-- leaderboards can rank score DESC, guesses ASC, time ASC. Null for formats
-- that don't report it (ranking passes through to time unchanged).
alter table public.quiz_results add column if not exists guesses_used integer;
