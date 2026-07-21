-- Outrank (the daily crowd-ranking game): every player's raw ballot, one row
-- per (quiz_id, anon_id). answers = [fav, r1..rN]: the favorite-item vote that
-- feeds the crowd order, then the predicted order. The /api/outrank route
-- scores each submission against the pre-written house crowd + every row here,
-- then inserts the newcomer's ballot. Run in the Supabase SQL Editor.
--
-- No RLS policies on purpose: like quiz_results and outwit_picks, all access
-- goes through the service-role key in the API route. The anon key can't read
-- or write it.

create table if not exists outrank_picks (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  anon_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists outrank_picks_quiz_anon on outrank_picks (quiz_id, anon_id);
create index if not exists outrank_picks_quiz on outrank_picks (quiz_id);

alter table outrank_picks enable row level security;
