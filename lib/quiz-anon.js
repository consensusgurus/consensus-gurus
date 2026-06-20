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
import { guestHandleFromAnon } from './quiz-elo.js';

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

// Per-quiz "all players" leaderboard: every completed play (signed + anonymous),
// ranked by score desc then time asc. Signed plays show the username; anonymous
// plays show "Player #NNNNN". tryNum = that player's chronological attempt #.
export function buildAllLeaderboard(rows) {
  const keyOf = (r) => (r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`));
  const cnt = {};
  const tryOf = new Map();
  rows.slice().sort((a, b) => (a.id || 0) - (b.id || 0)).forEach((r) => {
    const k = keyOf(r); cnt[k] = (cnt[k] || 0) + 1; tryOf.set(r, cnt[k]);
  });
  return rows.slice()
    .sort((a, b) => b.score - a.score || ((a.time_elapsed ?? 0) - (b.time_elapsed ?? 0)) || String(a.user_id ? (a.username || '') : keyOf(a)).localeCompare(String(b.user_id ? (b.username || '') : keyOf(b))))
    .slice(0, 10)
    .map((r) => ({ username: r.user_id ? r.username : guestHandleFromAnon(r.anon_id || keyOf(r)), userKey: keyOf(r), score: r.score, timeElapsed: r.time_elapsed, tryNum: tryOf.get(r), playedAt: r.created_at, anon: !r.user_id }));
}
