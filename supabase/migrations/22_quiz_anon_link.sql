-- Link a browser's pre-signup anonymous games to the account it later creates.
-- Run in the Supabase SQL Editor (after 21_quiz_views.sql).
--
-- Why: a player can finish a quiz anonymously, then sign up (via /api/quiz/join
-- or /api/quiz/claim). Without a stable handle on those anonymous rows we can't
-- attribute them, which lets someone "warm up" anonymously and then post a
-- single great run as their 1st Try. anon_id is a random per-browser token
-- (stored in localStorage as sot_quiz_anon) sent with every result; on join and
-- claim the app attributes every unattributed row sharing that token to the new
-- user, so the earlier attempts get linked and count toward the per-user attempt
-- number shown on the leaderboard ("1st Try", "2nd Try", ...).
--
-- The API routes already tolerate this column being absent (they fall back to
-- inserting without anon_id), so deploying the code before this migration is
-- safe; linkage simply activates once the column exists.

alter table quiz_results add column if not exists anon_id text;

create index if not exists quiz_results_anon
  on quiz_results (anon_id)
  where anon_id is not null;
