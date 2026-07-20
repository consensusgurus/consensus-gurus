// Shared config for the composable quiz leaderboard toggle. Two axes that
// intersect: `population` picks WHO is listed, `filter` narrows to a subset.
// The board/result APIs return every combination in `board.leaderboards`, keyed
// "<population>:<filter>" (see lib/quiz-anon buildLeaderboardMatrix). Anonymous
// players appear in every view EXCEPT the 'registered' population, so e.g.
// "All players" + "First try" lists everyone's first attempt (anon included).
// Used by every quiz board client so the toggle stays consistent.
export const LB_POPS = [['registered', 'Registered'], ['all', 'All players']];
export const LB_FILTERS = [['all', 'All'], ['mobile', 'Mobile'], ['first', 'First try']];

// Rows for the chosen (population, filter). Falls back to the legacy flat keys
// so a board response from an older deploy (no `leaderboards` map) still renders.
export function pickLb(board, pop, filter) {
  if (!board) return [];
  const m = board.leaderboards;
  if (m && m[`${pop}:${filter}`]) return m[`${pop}:${filter}`];
  if (pop === 'all' && filter === 'mobile') return board.leaderboardMobile || [];
  if (filter === 'first') return board.leaderboardFirst || [];
  if (pop === 'all') return board.leaderboardAll || [];
  return board.leaderboard || [];
}

// Empty-state line for a filtered view, or null to show the default Join CTA.
export function lbEmptyNote(filter) {
  if (filter === 'mobile') return 'No mobile games on the board yet.';
  if (filter === 'first') return 'No first-attempt scores on the board yet.';
  return null;
}

// Rank a just-finished score would earn on a given leaderboard's rows (1-based),
// using the same score-then-faster-time ordering the boards use everywhere.
// Used to tell an unregistered player where they'd land among registered
// players if they join. Returns null when there's nothing to compare a score to.
export function wouldBeRank(rows, score, elapsed) {
  if (!Array.isArray(rows) || score == null) return null;
  const me = elapsed != null ? elapsed : Infinity;
  let better = 0;
  for (const r of rows) {
    const t = r.timeElapsed != null ? r.timeElapsed : Infinity;
    if (r.score > score || (r.score === score && t < me)) better++;
  }
  return better + 1;
}
