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
// A player's DAILY total is the sum of their BEST N game scores: best 10 from the
// 2026-07-24 slate onward (150 ceiling), best 5 on earlier days (75 ceiling), so
// historical boards never recompute. Diehards drop their weakest; skipping a game
// earns 0 for it; playing fewer than N just leaves empty slots at 0.
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
export const BEST_N = 10;                               // current: best 10 of the day's games
export const BEST_N_PRIOR = 5;                          // days before the cutover stay best 5
export const DAILY_MAX = BEST_N * GAME_MAX;             // 150

// Best-N rose from 5 to 10 for the daily slate of 2026-07-24 (the first day scored
// on the new scale). Days ON OR AFTER the cutover use best 10 (150 max); every
// EARLIER day stays best 5 (75 max) so past boards never recompute. `suffix` is a
// daily quizId date tag "M-D-YY" (e.g. "7-24-26"); unknown/absent -> current scale.
export const BESTN_CUTOVER = { y: 2026, m: 7, d: 24 };
export function bestNForSuffix(suffix) {
  const mm = /^(\d+)-(\d+)-(\d+)$/.exec(String(suffix || ''));
  if (!mm) return BEST_N;
  const mo = +mm[1], da = +mm[2], y = 2000 + +mm[3], c = BESTN_CUTOVER;
  const onOrAfter = y > c.y || (y === c.y && (mo > c.m || (mo === c.m && da >= c.d)));
  return onOrAfter ? BEST_N : BEST_N_PRIOR;
}

// The daily game keys, in CANONICAL order. Since 2026-07-17 the player-facing
// display order is popularity-driven (/api/quiz/daily-order sorts by
// yesterday's play counts, this order as the tiebreak) — canonical order is
// the fallback and the tie order. Keep in sync with the daily registries (see
// the daily-game-registries note): crux, emcee, garble, links, span, dating,
// tally, suds, circa, extra, carve, stet, outwit, tuck, alibi, cipher, ping,
// warmer, jester, sworn, outrank. `closer` is NOT a daily and
// is intentionally absent. Circa is RETIRED (2026-07-20, last puzzle No. 7):
// it stays in DAILY_KEYS so its archived days keep scoring, but its bank is
// capped, so it never appears in a future day's slate.
export const DAILY_KEYS = ['crux', 'emcee', 'garble', 'links', 'span', 'dating', 'tally', 'suds', 'circa', 'extra', 'carve', 'stet', 'outwit', 'tuck', 'alibi', 'cipher', 'ping', 'warmer', 'jester', 'sworn', 'outrank', 'shards', 'axiom', 'hearsay', 'venn', 'form', 'bracket'];

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
        abandoned: !!r.abandoned,
      });
    }
    i = j;
  }
  return { field: N, players };
}

// Combine per-game results into the overall best-N standings (bestN, default 10).
// gameResults: [{ key, quizId, field, players: Map }] for the games with a live
// puzzle today. Returns rows sorted best-first with a shared-rank `rank`.
export function combineDaily(gameResults, bestN = BEST_N) {
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
        abandoned: !!p.abandoned,
      });
    }
  }

  const overall = [];
  for (const u of byUser.values()) {
    const sorted = u.games.slice().sort((a, b) => b.points - a.points);
    const best = sorted.slice(0, bestN);
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
        abandoned: !!x.abandoned,
      };
    }
    overall.push({
      userKey: u.userKey,
      username: u.username,
      total: r1(total),
      gamesPlayed: u.games.length,
      gamesFinished: u.games.filter((x) => !x.abandoned).length,
      counted: best.map((x) => x.key),   // which games contributed (up to bestN)
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

// --- Guest provisional standing (end-card "if you register" prompt) ----------
// A guest (anon, no account) is never scored onto the board, but we can show
// them where their play WOULD land if they registered. Score one guest game the
// same way scoreGame does, inserting the guest into that game's registered
// field, and report BOTH the points (for a combined total) and the guest's rank
// within that single game (the number the end card actually shows, per game).
export function guestGameResult(guestRow, game) {
  const N = game.field || 0;
  const newN = N + 1; // the guest joining grows the field by one
  const regs = [...game.players.values()];
  const total = regs.reduce((m, p) => Math.max(m, Number(p.total) || 0), 0) || (Number(guestRow.total) || 0);
  const score = Number(guestRow.score) || 0;
  const ratio = total > 0 ? Math.max(0, Math.min(1, score / total)) : 0;
  const completion = COMPLETION_MAX * ratio;
  const gG = guestRow.guesses_used ?? 1e9, gT = guestRow.time_elapsed ?? 0;
  let better = 0; // registered players who beat the guest on the same tiebreak
  for (const p of regs) {
    const pG = p.guessesUsed ?? 1e9, pT = p.timeElapsed ?? 0;
    if (p.score > score || (p.score === score && (pG < gG || (pG === gG && pT < gT)))) better++;
  }
  const rank = better + 1; // where the guest would sit in this game's field
  const placement = newN > 1 ? PLACEMENT_MAX * (newN - rank) / (newN - 1) : PLACEMENT_MAX;
  return { points: completion + placement, rank, field: newN };
}

// guestByGame: Map(gameKey -> the guest's chosen quiz_results row). gameResults
// and overallFull are as built by the daily-combined route. Returns
//   { rank, total, gamesPlayed, perGame: { key: { rank, field } } }
// where `rank` is where the guest's best-N total would sit on the registered
// combined board and perGame[key].rank is their would-be rank in that one game.
// Null when the guest has no scored rows.
export function guestProvisional(guestByGame, gameResults, overallFull, bestN = BEST_N) {
  const pts = [];
  const perGame = {};
  for (const g of (gameResults || [])) {
    const row = guestByGame.get(g.key);
    if (!row) continue;
    const res = guestGameResult(row, g);
    pts.push(res.points);
    perGame[g.key] = { rank: res.rank, field: res.field };
  }
  if (!pts.length) return null;
  pts.sort((a, b) => b - a);
  const total = pts.slice(0, bestN).reduce((sum, x) => sum + x, 0);
  const rank = (overallFull || []).filter((r) => r.total > total).length + 1;
  return { rank, total: Math.round(total * 10) / 10, gamesPlayed: pts.length, perGame };
}
