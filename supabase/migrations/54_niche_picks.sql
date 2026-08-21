-- Niche (the daily trivia grid): every player's picks, one row per
-- (quiz_id, anon_id). answers = the per-cell array of canonical member names
-- (null for an unfilled cell), e.g. ["Switzerland", null, "Brazil", ...].
-- The /api/niche route tallies each cell's picks across today's rows to
-- answer "what share of players picked the same thing here" — the rarity
-- number the game shows after every correct pick. Rarity is display and share
-- flair ONLY; scoring never reads this table.
-- Run in the Supabase SQL Editor BEFORE launch (see the outrank_picks lesson:
-- until this exists the game plays fine and simply shows no percentages).
--
-- No RLS policies on purpose: like quiz_results, outwit_picks, outrank_picks
-- and feud_picks, all access goes through the service-role key in the API
-- route. The anon key can't read or write it.

create table if not exists niche_picks (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  anon_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists niche_picks_quiz_anon on niche_picks (quiz_id, anon_id);
create index if not exists niche_picks_quiz on niche_picks (quiz_id);

alter table niche_picks enable row level security;
