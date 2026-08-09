-- 51_endgame_progress.sql
--
-- HOW FAR A LOSING PLAYER GOT.
--
-- The End Game titles (Mate, Check, Four, Chain, Turn) are binary: you either
-- solve the position or you do not, and a loss posts score 0. That left the
-- whole losing cohort tied at zero, so the board fell through to its next
-- terms, guesses_used then time_elapsed, and ranked the losers by who lost
-- FASTEST. Two consequences the owner flagged (2026-08-09): on a day nobody
-- solves, the player who threw it away in four seconds tops the leaderboard,
-- and a give-up (which records no errors) outranks somebody who genuinely
-- played on and missed by one move.
--
-- `progress` is how far into the puzzle the player actually got, in whatever
-- unit that game measures itself in (key moves found, pieces swept, boxes won,
-- discs held). It is a RANKING term only: score stays 0 on a loss, so the
-- "a loss scores zero" ruling is untouched and no losing run earns completion
-- points or IQ Points. It simply orders the losers among themselves, deepest
-- run first, with the clock settling the rest.
--
-- Nullable on purpose. Every historical row, and every game that does not post
-- the field, stays null and the comparator falls straight back to its existing
-- guesses term, so no already-played day can be reordered by this.

ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS progress integer;

-- The board reads one puzzle at a time, ordering score desc, then progress
-- desc, then the clock. Partial: only a handful of games populate it.
CREATE INDEX IF NOT EXISTS idx_quiz_results_progress_lb
  ON quiz_results (quiz_id, score DESC, progress DESC NULLS LAST, time_elapsed ASC)
  WHERE progress IS NOT NULL;
