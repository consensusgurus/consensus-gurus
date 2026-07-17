-- Outwit (the daily crowd game): every player's raw picks, one row per
-- (quiz_id, anon_id). The /api/outwit route scores each submission against the
-- pre-written house crowd + every row here, then inserts the newcomer's picks.
-- Run in the Supabase SQL Editor.
--
-- No RLS policies on purpose: like quiz_results, all access goes through the
-- service-role key in the API route. The anon key can't read or write it.

create table if not exists outwit_picks (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  anon_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists outwit_picks_quiz_anon on outwit_picks (quiz_id, anon_id);
create index if not exists outwit_picks_quiz on outwit_picks (quiz_id);

alter table outwit_picks enable row level security;
