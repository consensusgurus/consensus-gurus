// Unified daily leaderboard scoring (2026-07-16, owner design with Marshall).
//
// The problem: the ten daily games (crux, garble, links, span, dating, tally,
// suds, circa, extra, carve) each score on their own scale, and a hard puzzle
// day is not comparable to an easy one. Raw scores cannot be summed fairly.
//
// The fix: score every game on the SAME 15-point scale, split into two halves:
//   completion = 5 * (score / total)          -> absolute: how much you got right
//   placement  = 10 * (N - avgPos) / (N - 1)   -> relative: where you finished in
//                                                 that game's field for the day
// A player's DAILY total is the sum of their BEST FIVE game scores (best 5 of 10),
// so the ceiling is a clean 75 and diehards drop their two worst. Skipping a game
// simply earns 0 for it; playing fewer than five just leaves empty slots at 0.
//
// Placement is field-relative on purpose: 1st of 5 and 1st of 500 both earn 10,
// last earns 0, and the day's difficulty is absorbed because everyone faced the
// same puzzle. Eligibility mirrors the per-game daily boards exactly: REGISTERED
// players, FIRST attempt only, ranked by the SAME tiebreak buildLeaderboard uses
// (score desc, fewest guesses, fastest time, then name). Guests are recorded but
// never shown, per the daily-games owner ruling.

export const COMPLETION_MAX = 5;
export const PLACEMENT_MAX = 10;
export const GAME_MAX = COMPLETION_MAX + PLACEMENT_MAX; // 15
export const BEST_N = 5;
export const DAILY_MAX = BEST_N * GAME_MAX;             // 75

// The daily game keys, in CANONICAL order. Since 2026-07-17 the player-facing
// display order is popularity-driven (/api/quiz/daily-order sorts by
// yesterday's play counts, this order as the tiebreak) — canonical order is
// the fallback and the tie order. Keep in sync with the daily registries (see
// the daily-game-registries note): crux, emcee, garble, links, span, dating,
// tally, suds, circa, extra, carve, stet, outwit, tuck, alibi, cipher, ping,
// warmer, jester, sworn. `closer` is NOT a daily and
// is intentionally absent.
export const DAILY_KEYS = ['crux', 'emcee', 'garble', 'links', 'span', 'dating', 'tally', 'suds', 'circa', 'extra', 'carve', 'stet', 'outwit', 'tuck', 'alibi', 'cipher', 'ping', 'warmer', 'jester', 'sworn'];

const r1 = (x) => Math.round(x * 10) / 10; // one decimal place

// Score one game from its raw quiz_results rows (any population; this filters to
// registered + first attempt internally). Returns the field size N and a Map of
// userKey -> per-player game result. `points` is on the 0..15 scale.
export function scoreGame(rows) {
  // One row per registered user, guests dropped. A COMPLETED attempt beats an
  // abandoned one (a real finish supersedes an earlier abandon); within the same
  // completion status the FIRST attempt wins (lowest row id), so you still can't
  // replay to improve, and a player who only ever abandoned still appears via
  // their abandon. `abandoned` defaults false pre-migration, so this reduces to
  // plain first-attempt until the flag ships.
  const chosenByUser = new Map();
  for (const r of (rows || [])) {
    if (!r || !r.user_id) continue;
    const k = `u:${r.user_id}`;
    const prev = chosenByUser.get(k);
    if (!prev) { chosenByUser.set(k, r); continue; }
    const rDone = !r.abandoned, pDone = !prev.abandoned;
    if (rDone !== pDone) { if (rDone) chosenByUser.set(k, r); continue; }
    if ((r.id || 0) < (prev.id || 0)) chosenByUser.set(k, r);
  }
  const entries = [...chosenByUser.values()];
  // Same tiebreak as lib/quiz-anon buildLeaderboard so the combined board and the
  // per-game board never disagree on order.
  entries.sort((a, b) =>
    b.score - a.score
    || ((a.guesses_used ?? 1e9) - (b.guesses_used ?? 1e9))
    || ((a.time_elapsed ?? 0) - (b.time_elapsed ?? 0))
    || String(a.username || '').localeCompare(String(b.username || '')));

  const N = entries.length;
  // Canonical per-day denominator: the largest `total` any player recorded for
  // this puzzle. Every row for one day's puzzle SHOULD carry the same total, but
  // early days can mix denominators (day-one Crux has both 8 and 16 from an early
  // scoring change), which would let a stale small total inflate completion. Using
  // the field max normalizes those, so completion depends only on RAW score. That
  // also keeps the combined (points) order identical to the game's own (rank)
  // order — otherwise the two boards can disagree at the cutoff. Falls back to the
  // row's own total if the field somehow has none.
  const fieldMaxTotal = entries.reduce((m, r) => Math.max(m, Number(r.total) || 0), 0);

  // Tie-averaging: players with identical (score, guesses, time) share the same
  // placement points (the average of the positions they span), so two truly-equal
  // runs are not split apart by an alphabetical name tiebreak. Displayed `rank`
  // is the top position of the tie group (standard competition ranking).
  const perfKey = (r) => `${r.score}|${r.guesses_used ?? ''}|${r.time_elapsed ?? ''}`;
  const players = new Map();
  let i = 0;
  while (i < N) {
    let j = i;
    while (j < N && perfKey(entries[j]) === perfKey(entries[i])) j++;
    const displayRank = i + 1;                 // 1-based top of the group
    const avgPos = ((i + 1) + j) / 2;          // mean 1-based position in the group
    for (let k = i; k < j; k++) {
      const r = entries[k];
      const uk = `u:${r.user_id}`;
      const total = fieldMaxTotal > 0 ? fieldMaxTotal : (Number(r.total) || 0);
      const ratio = total > 0 ? Math.max(0, Math.min(1, Number(r.score) / total)) : 0;
      const completion = COMPLETION_MAX * ratio;
      const placement = N > 1 ? PLACEMENT_MAX * (N - avgPos) / (N - 1) : PLACEMENT_MAX;
      players.set(uk, {
        userKey: uk,
        username: r.username,
        score: Number(r.score) || 0,
        total,
        guessesUsed: r.guesses_used ?? null,
        timeElapsed: r.time_elapsed ?? null,
        completion,
        placement,
        points: completion + placement,
        rank: displayRank,
        field: N,
      });
    }
    i = j;
  }
  return { field: N, players };
}

// Combine per-game results into the overall best-5-of-10 standings.
// gameResults: [{ key, quizId, field, players: Map }] for the games with a live
// puzzle today. Returns rows sorted best-first with a shared-rank `rank`.
export function combineDaily(gameResults) {
  const byUser = new Map();
  for (const g of (gameResults || [])) {
    for (const p of g.players.values()) {
      let u = byUser.get(p.userKey);
      if (!u) { u = { userKey: p.userKey, username: p.username, games: [] }; byUser.set(p.userKey, u); }
      u.username = p.username; // keep the latest label
      u.games.push({
        key: g.key,
        quizId: g.quizId,
        points: p.points,
        completion: p.completion,
        placement: p.placement,
        rank: p.rank,
        field: g.field,
        score: p.score,
        total: p.total,
      });
    }
  }

  const overall = [];
  for (const u of byUser.values()) {
    const sorted = u.games.slice().sort((a, b) => b.points - a.points);
    const best = sorted.slice(0, BEST_N);
    const total = best.reduce((s, x) => s + x.points, 0);
    const bestSingle = sorted.length ? sorted[0].points : 0;
    const perGame = {};
    for (const x of u.games) {
      perGame[x.key] = {
        points: r1(x.points),
        completion: r1(x.completion),
        placement: r1(x.placement),
        rank: x.rank,
        field: x.field,
        score: x.score,
        total: x.total,
      };
    }
    overall.push({
      userKey: u.userKey,
      username: u.username,
      total: r1(total),
      gamesPlayed: u.games.length,
      counted: best.map((x) => x.key),   // which 5 games contributed
      bestSingle: r1(bestSingle),
      perGame,
    });
  }

  overall.sort((a, b) =>
    b.total - a.total
    || b.gamesPlayed - a.gamesPlayed
    || b.bestSingle - a.bestSingle
    || String(a.username || '').localeCompare(String(b.username || '')));

  // Shared competition rank on the combined total (ties share a rank).
  let rank = 0, prev = null, seen = 0;
  for (const row of overall) {
    seen += 1;
    if (prev === null || row.total !== prev) { rank = seen; prev = row.total; }
    row.rank = rank;
  }
  return overall;
}
