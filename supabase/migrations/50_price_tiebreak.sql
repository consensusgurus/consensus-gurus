-- Add price_tiebreak to quiz_results for the Pricer tiebreaker.
-- Stores the absolute difference between the player's guess at the champion's
-- figure and its real value, so a tie on score is broken by whoever guessed
-- closest. NULL for non-Pricer quizzes and for a player who skipped the guess;
-- NULL therefore has to sort LAST, never first, or a skip would win every tie.
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS price_tiebreak DOUBLE PRECISION;

-- Leaderboard ordering for Pricer boards: score desc, then closest guess, then
-- the existing time tiebreak.
CREATE INDEX IF NOT EXISTS idx_quiz_results_pricer_lb
  ON quiz_results (quiz_id, score DESC, price_tiebreak ASC NULLS LAST, time_elapsed ASC)
  WHERE price_tiebreak IS NOT NULL;
