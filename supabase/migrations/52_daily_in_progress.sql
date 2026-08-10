-- 52_daily_in_progress.sql
--
-- A DAILY GAME THE PLAYER HAS STARTED AND NOT FINISHED, ACROSS DEVICES.
--
-- In-progress used to be two things, and neither of them travelled:
--
--   1. sot_<key>_day in localStorage, which is per-BROWSER by definition.
--   2. An abandoned row in quiz_results, filed by useAbandonFlush on the
--      pagehide event.
--
-- (2) is the only one that crosses devices, and on a phone it frequently never
-- happens: backgrounding the browser (home button, app switch, the tab getting
-- evicted) does not reliably fire pagehide. So a game paused on a phone stays
-- invisible everywhere else. Verified on the owner's own account 2026-08-10:
-- 14 abandoned rows existed overall, so the flush works, but that day's paused
-- game had no row at all and lived only in that browser's localStorage.
--
-- WHY NOT JUST FLUSH ON visibilitychange TOO: an abandoned row is a SCORED
-- RESULT. lib/daily-combined.js is explicit that a player who only ever
-- abandoned still appears on the board via that abandon. Firing it every time
-- someone glances at another app would bank a partial score for a game they are
-- still playing, which is exactly the false abandon pagehide was chosen to
-- avoid. The two concerns are different and now have different homes: the
-- abandon row still means "this attempt is over", this table means "this
-- attempt is still open".
--
-- A row here is a HINT, never a result. It carries no score, no time and no
-- verdict, it never enters scoring, IQ Points, averages or any leaderboard, and
-- it is superseded rather than deleted: /api/quiz/daily-status drops any
-- quiz_id the player also has a played / completed / abandoned row for, so
-- finishing a game retires its hint with no write.
--
-- player_key is the same u:<id> / a:<anon> shape the rest of the code
-- identifies players by, so a lookup can match EVERY key an account's rows are
-- filed under (resolvePlayerKeys) rather than one, which is the bug that hid a
-- game played on one device from every other one. user_id and anon_id are kept
-- alongside it for the same reason quiz_results keeps both, so a later account
-- merge can re-key these rows.
--
-- No RLS policies on purpose: like quiz_results, feud_picks and outrank_picks,
-- all access goes through the service-role key in the API route.

create table if not exists daily_in_progress (
  id bigint generated always as identity primary key,
  quiz_id text not null,
  player_key text not null,
  anon_id text,
  user_id uuid references quiz_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- One row per player per drop. The route upserts on this, so a player who opens
-- the same board five times still has exactly one row.
create unique index if not exists daily_in_progress_quiz_player
  on daily_in_progress (quiz_id, player_key);
create index if not exists daily_in_progress_player on daily_in_progress (player_key);
-- Drives the opportunistic sweep in the POST route.
create index if not exists daily_in_progress_created on daily_in_progress (created_at);

alter table daily_in_progress enable row level security;
