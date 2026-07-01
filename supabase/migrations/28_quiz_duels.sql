-- =========================================================================
-- Migration 28: quiz_duels  (async head-to-head duels)
-- A duel pairs two players on the SAME quiz. The challenger creates a duel
-- (status 'open'), plays a round, and submits; the opponent opens the invite
-- link, plays, and submits. When both scores are in the duel is 'complete'
-- and a winner is decided (higher score, then faster time, else tie).
--
-- Scores are pulled server-side from each player's own quiz_results row for
-- the quiz (recorded by the normal /api/quiz/result flow), so no quiz board
-- needs to change. Players are identified by the browser anon token
-- (quiz_results.anon_id) plus a display name. Run in the Supabase SQL Editor
-- after 27_traffic_city.sql.
-- =========================================================================

create table if not exists quiz_duels (
  id               bigserial primary key,
  token            text not null unique,
  quiz_id          text not null,
  challenger_anon  text,
  challenger_name  text not null,
  challenger_score int,
  challenger_total int,
  challenger_time  int,
  opponent_anon    text,
  opponent_name    text,
  opponent_score   int,
  opponent_total   int,
  opponent_time    int,
  status           text not null default 'open',   -- open | awaiting_opponent | complete
  winner           text,                            -- challenger | opponent | tie
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

create index if not exists idx_quiz_duels_token           on quiz_duels (token);
create index if not exists idx_quiz_duels_opponent_anon   on quiz_duels (opponent_anon);
create index if not exists idx_quiz_duels_challenger_anon on quiz_duels (challenger_anon);
