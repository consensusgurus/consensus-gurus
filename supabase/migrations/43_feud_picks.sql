-- Feud (the daily crowd-survey game): every player's raw ballot, one row per
-- (quiz_id, anon_id). answers = an array of per-prompt answer arrays (up to
-- three free-text answers a prompt): [["scroll my phone","watch tv"],...].
-- The /api/feud route buckets and scores each submission against the
-- pre-written house pool + every row here, then inserts the newcomer's ballot.
-- Run in the Supabase SQL Editor BEFORE launch (see the outrank_picks lesson:
-- until this exists the game degrades to house-pool-only and ballots are not
-- stored).
--
-- No RLS policies on purpose: like quiz_results, outwit_picks and
-- outrank_picks, all access goes through the service-role key in the API
-- route. The anon key can't read or write it.

create table if not exists feud_picks (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  anon_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists feud_picks_quiz_anon on feud_picks (quiz_id, anon_id);
create index if not exists feud_picks_quiz on feud_picks (quiz_id);

alter table feud_picks enable row level security;
