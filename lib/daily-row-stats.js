// ONE READING OF A BOARD ROW, shared by every surface that shows a result.
//
// A daily leaderboard row carries two completely different numbers and only one
// of them means anything to a player looking at the game they just played:
//
//   points  the 0-15 placement ladder (lib/daily-combined gamePoints). It ranks
//           you against the field and is identical in shape for all 80 games.
//   score   what you actually did on THIS board, out of THIS board's total.
//
// The stage's leader strip was rendering `points` with the word "points" after
// it, so Suds read "Gator88 · 10 points" — a figure with no relationship to a
// sudoku, and no way for a reader to translate it back into the grid they had
// just filled (owner, 2026-08-31). The tile panel had already solved this in
// 2026-08 with a `gameStats` helper, but it was module-local, so the second
// surface to want it re-invented the wrong answer instead of reusing the right
// one. It lives here now and both import it.
//
// Every field is optional: a row missing a clock, or a score, simply says less.
// Returns null when there is nothing honest to say.

export function mmss(sec) {
  const x = Math.max(0, Math.round(Number(sec) || 0));
  if (!x) return null;
  const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = x % 60;
  const two = (v) => String(v).padStart(2, '0');
  return h ? h + ':' + two(m) + ':' + two(s) : m + ':' + two(s);
}

// The game's own result for one board row: what they scored, not the points
// that rank them.
export function gameStats(r) {
  if (!r || r.score == null || !r.total) return null;
  const bits = [r.score + '/' + r.total];
  // END GAME rows report the attempt the solve landed on (owner, 2026-08-12),
  // which is what their board ranks on; the per-run error count no longer
  // decides anything there. `tries` is null on every other game, which falls
  // through to the guess count exactly as before.
  if (r.tries != null) bits.push(r.tries + (r.tries === 1 ? ' try' : ' tries'));
  else if (r.guessesUsed > 0) bits.push(r.guessesUsed + (r.guessesUsed === 1 ? ' guess' : ' guesses'));
  const clock = mmss(r.timeElapsed);
  if (clock) bits.push(clock);
  return bits.join(' · ');
}

// The same result with the middle term dropped — for a one-line strip where the
// guess count is the least useful of the three and the first thing that should
// go when space runs out. Score and clock are what a player compares.
export function gameStatsShort(r) {
  if (!r || r.score == null || !r.total) return null;
  const clock = mmss(r.timeElapsed);
  return clock ? `${r.score}/${r.total} · ${clock}` : `${r.score}/${r.total}`;
}
