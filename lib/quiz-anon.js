// Shared anonymous-player aggregation for the quiz leaderboard + admin panel.
//
// An "anonymous player" is someone who completed quizzes WITHOUT signing up.
// Their games are batched by the per-browser anon_id token (quiz_results.anon_id,
// added in migration 22). Each player is shown under a STABLE pseudo-random
// 5-digit number ("Player #48217") derived from a hash of their anon_id, so the
// same browser maps to the same label everywhere (leaderboard + admin). Rows
// with no anon_id (pre-migration plays) can't be batched, so each such row is
// its own one-off player keyed by its row id.

import { correctAnswersOf } from './quiz-scoring.js';
import { guestHandleFromAnon } from './quiz-xp.js';
// The tally tiebreak below reads a game's `unit` off its quiz_id. This import
// was missing when that rule shipped (2026-08-08), which made buildLeaderboard
// throw a ReferenceError on any non-empty board: /api/quiz/board 500'd for
// EVERY quiz and /api/quiz/result 400'd on every finish (the row still saved,
// but the client never got its board back).
import { dailyUnitOfQuizId } from './daily-games.js';

export function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// rows: quiz_results rows, each at least { id, user_id, quiz_id, score, total, anon_id, created_at? }
// Returns one object per anonymous player:
//   { key, num, label, plays, quizzes, correct, perfect, accuracy, weighted, lastPlayed }
export function buildAnonPlayers(rows) {
  const anonRows = (rows || []).filter((r) => !r.user_id);
  const byKey = new Map();
  for (const r of anonRows) {
    const key = r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    let g = byKey.get(key);
    if (!g) { g = []; byKey.set(key, g); }
    g.push(r);
  }
  // Sorted keys so number assignment + collision resolution is deterministic
  // (identical between the leaderboard route and the admin page).
  const keys = [...byKey.keys()].sort();
  const used = new Set();
  const players = [];
  for (const key of keys) {
    const grp = byKey.get(key);
    let plays = 0, correct = 0, lastPlayed = '';
    const quizSet = new Set();
    const perfectSet = new Set();
    const firstByQuiz = new Map(); // first attempt per quiz, for accuracy
    for (const r of grp) {
      plays += 1;
      correct += correctAnswersOf(r);
      quizSet.add(r.quiz_id);
      if (r.total > 0 && r.score === r.total) perfectSet.add(r.quiz_id);
      const prev = firstByQuiz.get(r.quiz_id);
      if (!prev || (r.id || 0) < (prev.id || 0)) firstByQuiz.set(r.quiz_id, r);
      const c = String(r.created_at || '');
      if (c > lastPlayed) lastPlayed = c;
    }
    let accSum = 0, accN = 0;
    for (const r of firstByQuiz.values()) { if (r.total > 0) { accSum += r.score / r.total; accN += 1; } }
    const accuracy = accN ? Math.round((accSum / accN) * 100) : 0; // percent, 1dp
    const weighted = Math.round(accSum * 10) / 10;                       // accuracy x quizzes
    let n = (hashStr(key) % 90000) + 10000;
    while (used.has(n)) { n = n >= 99999 ? 10000 : n + 1; }
    used.add(n);
    players.push({
      key, num: n, label: guestHandleFromAnon(key.startsWith('a:') ? key.slice(2) : key),
      plays, quizzes: quizSet.size, correct, perfect: perfectSet.size,
      accuracy, weighted, lastPlayed: lastPlayed || null,
    });
  }
  return players;
}

// Stable pseudo-random 5-digit number for an anonymous player key (no global
// collision resolution; cosmetic per-quiz label, kept consistent with the
// global leaderboard's hash).
export function anonNumber(key) { return (hashStr(key) % 90000) + 10000; }

// Composable per-quiz leaderboard. Two independent axes that intersect:
//   population: 'all' (signed + anonymous) | 'registered' (signed only)
//   filter:     'all' | 'mobile' (is_mobile true) | 'first' (each player's 1st attempt)
// Ranked by score desc then time asc. Signed plays show the username; anonymous
// plays show "Player #NNNNN". tryNum = that player's chronological attempt #,
// always computed over ALL their rows so 'first' is the genuine first attempt.
// Anonymous players are kept in EVERY view except 'registered' (the lone signed-
// only board), so e.g. 'all' + 'first' lists everyone's first attempt.
export function buildLeaderboard(rows, { population = 'all', filter = 'all', limit = 10 } = {}) {
  const keyOf = (r) => (r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`));
  const cnt = {};
  const tryOf = new Map();
  rows.slice().sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((r) => {
    const k = keyOf(r); cnt[k] = (cnt[k] || 0) + 1; tryOf.set(r, cnt[k]);
  });
  let pool = rows;
  if (population === 'registered') pool = pool.filter((r) => r.user_id);
  if (filter === 'mobile') pool = pool.filter((r) => r.is_mobile === true);
  else if (filter === 'first') {
    // Each player's first COMPLETED attempt, falling back to their first
    // abandoned row only if they never finished. A finish supersedes an earlier
    // abandon; within one completion status the earliest id wins (no replaying
    // for a better first-try rank). `abandoned` defaults false pre-migration, so
    // this stays exactly the old first-attempt behavior until the flag ships.
    const chosen = new Map();
    rows.slice().sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((r) => {
      const k = keyOf(r);
      const prev = chosen.get(k);
      if (!prev) { chosen.set(k, r); return; }
      if (!r.abandoned && prev.abandoned) chosen.set(k, r); // completed beats abandoned; else keep earliest
    });
    const chosenSet = new Set(chosen.values());
    pool = pool.filter((r) => chosenSet.has(r));
  }
  // A ZERO-tally run on a tally game (Blocks) ranks on shapes SURVIVED, not on
  // fewest used. Must stay identical to the comparator in lib/daily-combined
  // scoreGame, or the per-game board and the combined board disagree on order.
  const tally = pool.length ? !!dailyUnitOfQuizId(pool[0].quiz_id) : false;
  const second = (a, b) => (tally && Number(a.score) === 0
    ? ((b.guesses_used ?? -1) - (a.guesses_used ?? -1))
    : ((a.guesses_used ?? 1e9) - (b.guesses_used ?? 1e9)));
  return pool.slice()
    .sort((a, b) => b.score - a.score
      || second(a, b)
      || ((a.time_elapsed ?? 0) - (b.time_elapsed ?? 0))
      || String(a.user_id ? (a.username || '') : keyOf(a)).localeCompare(String(b.user_id ? (b.username || '') : keyOf(b))))
    .slice(0, limit)
    .map((r) => ({ username: r.user_id ? r.username : guestHandleFromAnon(r.anon_id || keyOf(r)), userKey: keyOf(r), score: r.score, timeElapsed: r.time_elapsed, guessesUsed: r.guesses_used ?? null, correct: r.correct_count ?? null, tryNum: tryOf.get(r), playedAt: r.created_at, anon: !r.user_id }));
}

// Backward-compatible wrapper: "all players" board, no extra filter.
export function buildAllLeaderboard(rows) { return buildLeaderboard(rows, { population: 'all', filter: 'all' }); }

// A single player's TRUE 1-based placement on the all-players board for a quiz,
// i.e. the position of their best row in the FULL sorted board (no top-10 cap).
// Uses the exact same comparator as buildLeaderboard (limit: Infinity), so the
// number matches where the player sits on the leaderboard they can scroll.
// myKey is the leaderboard key: `u:<userId>` (signed), else `a:<anonId>`, else
// `r:<rowId>`. Returns null when the key isn't present in the rows.
export function playerPlacement(rows, myKey) {
  if (!myKey) return null;
  const full = buildLeaderboard(rows, { population: 'all', filter: 'all', limit: Infinity });
  const i = full.findIndex((r) => r.userKey === myKey);
  return i >= 0 ? i + 1 : null;
}

// All six (population x filter) combinations, keyed "<population>:<filter>".
export function buildLeaderboardMatrix(rows) {
  const out = {};
  for (const population of ['registered', 'all']) {
    for (const filter of ['all', 'mobile', 'first']) {
      out[`${population}:${filter}`] = buildLeaderboard(rows, { population, filter });
    }
  }
  return out;
}
