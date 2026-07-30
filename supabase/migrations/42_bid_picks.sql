-- Bid (the daily auction): every player's raw allocation, one row per
-- (quiz_id, anon_id). The /api/bid route scores each submission against the
-- pre-written opening crowd plus every row here, then inserts the newcomer's
-- bids. Run in the Supabase SQL Editor.
--
-- Same shape and the same reasoning as 35_outwit_picks and 39_outrank_picks.
--
-- No RLS policies on purpose: like quiz_results, all access goes through the
-- service-role key in the API route. The anon key can't read or write it.
--
-- The game degrades gracefully if this is never run: /api/bid catches the
-- missing table, the pool falls back to the opening crowd alone, and the live
-- board comes back empty. Nothing 500s.

create table if not exists bid_picks (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  anon_id text not null,
  user_id uuid references quiz_users(id) on delete set null,
  bids jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bid_picks_quiz_anon on bid_picks (quiz_id, anon_id);
create index if not exists bid_picks_quiz on bid_picks (quiz_id);

alter table bid_picks enable row level security;
