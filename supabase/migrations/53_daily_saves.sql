-- 53_daily_saves.sql
--
-- THE BOARD ITSELF, ACROSS DEVICES.
--
-- Migration 52 made "in progress" travel. It did not make the GAME travel: a
-- daily_in_progress row is a marker with no payload, so a player who starts on
-- a phone and opens the same game on a laptop correctly sees "in progress" and
-- then gets a blank board. Reported by the owner 2026-08-10. This table is the
-- missing half.
--
-- WHAT IS STORED: `state` is the EXACT string the game wrote to localStorage
-- under `store_key`, byte for byte, never a parsed or reshaped copy. All 58
-- daily clients hand-roll their own save shape (there is no shared persistence
-- hook), and several carry inline format migrations keyed on their own `v`
-- field, so anything that understood the contents here would have to be kept in
-- sync with 58 clients forever. Treating it as an opaque blob means this table
-- never needs to change when a game changes its state shape, and a new daily is
-- covered the day it ships.
--
-- WHY store_key AND NOT quiz_id: the localStorage key (`sot_crux_312`,
-- `sot_crux_312_r2`) is what the client actually has to write back, it already
-- encodes the puzzle number, and it carries Crux's `_r<rev>` namespace suffix
-- for free. `game_key` and `ymd` are stored alongside purely so a lookup can
-- ask "this player's open board for THIS game TODAY" without parsing the key.
--
-- WHY ymd IS CLIENT-SUPPLIED: a daily rolls at Eastern midnight, and a save is
-- only ever offered back on the day it belongs to (offering yesterday's board
-- would write a key today's board never reads, and appear to do nothing). The
-- client sends the same ET date its own breadcrumb uses, exactly as
-- DailyStartPing builds a quizId from the crumb's own date rather than the
-- clock, so both devices agree on which drop a save belongs to.
--
-- A row here is NOT a result. It carries no score, no time and no verdict, it
-- enters no leaderboard, no average and no IQ total, and nothing that scores
-- reads it. It is written only while `status === 'playing'` and the board has a
-- real `t0`, so opening a game and leaving stores nothing, per the
-- "opening a game is not starting it" rule.
--
-- CROSS-DEVICE IS AN ACCOUNT FEATURE, by definition: player_key is the same
-- u:<id> / a:<anon> shape used everywhere else, and a guest's anon key is per
-- BROWSER, so a guest gets same-device durability (which is worth having on its
-- own: iOS Safari evicts localStorage after 7 days of no visits) but no second
-- device. The read path resolves every key an account is filed under, so a
-- board saved before signing in is still found afterwards.
--
-- No RLS policies on purpose: like quiz_results, daily_in_progress and
-- outrank_picks, all access goes through the service-role key in the API route.

create table if not exists daily_saves (
  id bigint generated always as identity primary key,
  store_key text not null,
  game_key text not null,
  ymd text not null,
  player_key text not null,
  anon_id text,
  user_id uuid references quiz_users(id) on delete cascade,
  state text not null,
  bytes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per player per board. The route upserts on this, so a player who
-- makes two hundred moves still has exactly one row, rewritten in place.
create unique index if not exists daily_saves_store_player
  on daily_saves (store_key, player_key);
-- The read path: "my open board for this game on this date."
create index if not exists daily_saves_player_game
  on daily_saves (player_key, game_key, ymd);
-- Drives the opportunistic sweep in the POST route.
create index if not exists daily_saves_updated on daily_saves (updated_at);

alter table daily_saves enable row level security;
