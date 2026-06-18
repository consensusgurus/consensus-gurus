// In-API Elo "skill rating" for quiz players, computed from the existing
// quiz_results table (no DB migration). Every completed game is treated as one
// match against that quiz's difficulty: beat the expected score fraction and
// your rating rises, fall short and it dips. Harder quizzes (lower average
// score fraction across all players) carry a higher difficulty Dq and move the
// rating more decisively.
//
//   E  = 1 / (1 + 10^((Dq - R) / 400))   expected result
//   R' = R + K * (S - E)                 rating update
//
// where R is the player's running rating (start 1500), S is this game's score
// fraction (score/total, clamped 0..1), and K = 24.
//
// Players are keyed by user_id when signed up, else anon_id, else the row id
// (an unattributable one-off play). The per-category rating uses the same
// running update restricted to that category's matches; quizDept() supplies the
// category. Everything is derived in a single pass over the full table so it
// runs comfortably inside one API request.

import { quizDept } from './quiz-departments.js';
import { correctAnswersOf, answeredOf } from './quiz-scoring.js';
import { QUIZZES } from './quizzes.js';

export const ELO_START = 1500;
export const ELO_K = 24;

const DQ_MIN = 1000;
const DQ_MAX = 2000;

const QUIZ_BY_ID = new Map((QUIZZES || []).map((q) => [q.id, q]));

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

function scoreFraction(row) {
  // CORRECTNESS fraction, not points: for timed-mcq the stored score is a
  // time-decayed points total, so dividing by the points maximum punishes
  // knowledgeable-but-deliberate players and tanks their rating. Use the
  // (estimated) correct-answer count over the question count instead, so the
  // skill rating reflects how much you knew, not how fast you clicked. For
  // ordinary quizzes this is identical to score/total.
  const a = answeredOf(row);
  if (a <= 0) return 0;
  return clamp(correctAnswersOf(row) / a, 0, 1);
}

function playerKey(row) {
  if (row.user_id) return `u:${row.user_id}`;
  if (row.anon_id) return `a:${row.anon_id}`;
  return `r:${row.id}`;
}

// Quiz difficulty Dq from the average score fraction across ALL completed games
// of that quiz. An easy quiz (everyone near 100%) -> low Dq; a brutal one
// (everyone near 0%) -> high Dq. Dq = 1500 + (0.5 - avgFrac) * 800, clamped.
export function computeQuizDifficulty(rows) {
  const sum = new Map();
  const cnt = new Map();
  for (const r of rows) {
    if (!(Number(r.total) > 0)) continue;
    const q = r.quiz_id;
    sum.set(q, (sum.get(q) || 0) + scoreFraction(r));
    cnt.set(q, (cnt.get(q) || 0) + 1);
  }
  const dq = new Map();
  for (const [q, n] of cnt) {
    const avg = n ? sum.get(q) / n : 0.5;
    dq.set(q, clamp(Math.round(1500 + (0.5 - avg) * 800), DQ_MIN, DQ_MAX));
  }
  return dq;
}

function categoryOf(quizId) {
  return quizDept(QUIZ_BY_ID.get(quizId) || { id: quizId });
}

// Main entry point. `rows` = quiz_results rows. Returns:
//   { players: Map(key -> player), difficulty: Map(quizId -> Dq), ranked: [...] }
// Each player: {
//   key, userId, anonId, isAnon, username,
//   rating, matches, netDelta, start, k,
//   byCategory: { [cat]: { rating, matches, correct, completed, daysPlayed, accuracy } },
//   recent: [{ quizId, dq, scorePct, S, E, delta, createdAt }],  // newest first
//   correct, played(distinct), completed(perfect distinct), answered,
//   accuracy(percent),
// }
export function computeElo(rows, { recentN = 20 } = {}) {
  // Chronological order: created_at, then row id as a stable tiebreak.
  const ordered = (rows || []).slice().sort((a, b) => {
    const ta = Date.parse(a.created_at || '') || 0;
    const tb = Date.parse(b.created_at || '') || 0;
    if (ta !== tb) return ta - tb;
    return (a.id || 0) - (b.id || 0);
  });

  const difficulty = computeQuizDifficulty(ordered);
  const players = new Map();

  // Per-player distinct-quiz / first-attempt accounting (mirrors champions).
  const firstByPair = new Map(); // key::quizId -> row (lowest id)
  for (const r of ordered) {
    if (!(Number(r.total) > 0)) continue;
    const pk = playerKey(r);
    const pairKey = pk + '::' + r.quiz_id;
    const prev = firstByPair.get(pairKey);
    if (!prev || (r.id || 0) < (prev.id || 0)) firstByPair.set(pairKey, r);
  }

  function ensure(r) {
    const key = playerKey(r);
    let p = players.get(key);
    if (!p) {
      p = {
        key,
        userId: r.user_id || null,
        anonId: r.anon_id || null,
        isAnon: !r.user_id,
        username: r.user_id ? (r.username || 'Player') : null,
        rating: ELO_START,
        matches: 0,
        netDelta: 0,
        start: ELO_START,
        k: ELO_K,
        byCategory: {},
        recent: [],
        correct: 0,
        answered: 0,
        playedSet: new Set(),
        perfectSet: new Set(),
        daySet: new Set(),
        accSum: 0,
        accN: 0,
        lastRowId: -1,
      };
      players.set(key, p);
    }
    // Keep the most recent username for signed players.
    if (r.user_id && (r.id || 0) >= p.lastRowId) {
      p.lastRowId = r.id || 0;
      if (r.username) p.username = r.username;
    }
    return p;
  }

  for (const r of ordered) {
    if (!(Number(r.total) > 0)) continue;
    const p = ensure(r);
    const dq = difficulty.get(r.quiz_id) ?? 1500;
    const S = scoreFraction(r);
    const E = 1 / (1 + Math.pow(10, (dq - p.rating) / 400));
    const delta = ELO_K * (S - E);
    p.rating += delta;
    p.netDelta += delta;
    p.matches += 1;

    const cat = categoryOf(r.quiz_id);
    let cr = p.byCategory[cat];
    if (!cr) {
      cr = {
        rating: ELO_START, matches: 0, netDelta: 0,
        correct: 0, answered: 0,
        playedSet: new Set(), perfectSet: new Set(), daySet: new Set(),
        accSum: 0, accN: 0,
      };
      p.byCategory[cat] = cr;
    }
    const Ec = 1 / (1 + Math.pow(10, (dq - cr.rating) / 400));
    const dc = ELO_K * (S - Ec);
    cr.rating += dc;
    cr.netDelta += dc;
    cr.matches += 1;
    // Per-category running activity totals (mirror the player-level metrics
    // so a scoped leaderboard can sort by the same Correct/Completed/Days/Accuracy).
    cr.correct += correctAnswersOf(r);
    cr.answered += answeredOf(r);
    cr.playedSet.add(r.quiz_id);
    if (answeredOf(r) > 0 && correctAnswersOf(r) === answeredOf(r)) cr.perfectSet.add(r.quiz_id);
    if (r.created_at) { const dkc = String(r.created_at).slice(0, 10); if (dkc) cr.daySet.add(dkc); }

    p.recent.push({
      quizId: r.quiz_id,
      dq,
      scorePct: Math.round(S * 100),
      S: Math.round(S * 100) / 100,
      E: Math.round(E * 100) / 100,
      delta: Math.round(delta),
      createdAt: r.created_at || null,
    });

    // Running totals (every completed game, replays included).
    p.correct += correctAnswersOf(r);
    p.answered += answeredOf(r);
    p.playedSet.add(r.quiz_id);
    if (answeredOf(r) > 0 && correctAnswersOf(r) === answeredOf(r)) p.perfectSet.add(r.quiz_id);
    // Distinct calendar day this game was played (UTC date), for the days-played metric.
    if (r.created_at) { const dk = String(r.created_at).slice(0, 10); if (dk) p.daySet.add(dk); }
  }

  // First-attempt accuracy across distinct quizzes (matches the champions route).
  for (const [pairKey, r] of firstByPair) {
    const key = pairKey.slice(0, pairKey.indexOf('::'));
    const p = players.get(key);
    if (!p) continue;
    const f = scoreFraction(r);
    p.accSum += f;
    p.accN += 1;
    const cat = categoryOf(r.quiz_id);
    const cr = p.byCategory[cat];
    if (cr) { cr.accSum += f; cr.accN += 1; }
  }

  // Finalize each player.
  for (const p of players.values()) {
    p.rating = Math.round(p.rating);
    p.netDelta = Math.round(p.netDelta);
    p.played = p.playedSet.size;
    p.completed = p.perfectSet.size;
    p.daysPlayed = p.daySet.size;
    p.accuracy = p.accN ? Math.round((p.accSum / p.accN) * 1000) / 10 : 0;
    for (const cat of Object.keys(p.byCategory)) {
      const cr = p.byCategory[cat];
      cr.rating = Math.round(cr.rating);
      cr.netDelta = Math.round(cr.netDelta);
      cr.played = cr.playedSet.size;
      cr.completed = cr.perfectSet.size;
      cr.daysPlayed = cr.daySet.size;
      cr.accuracy = cr.accN ? Math.round((cr.accSum / cr.accN) * 1000) / 10 : 0;
      delete cr.playedSet;
      delete cr.perfectSet;
      delete cr.daySet;
      delete cr.accSum;
      delete cr.accN;
    }
    p.recent = p.recent.slice(-recentN).reverse(); // newest first
    delete p.playedSet;
    delete p.perfectSet;
    delete p.daySet;
    delete p.accSum;
    delete p.accN;
    delete p.lastRowId;
  }

  return { players, difficulty };
}

// Tier label for a rating (display only, used by the Stat Hub).
export function eloTier(rating) {
  if (rating >= 1800) return { label: 'Master Tier', bg: '#e8effb', fg: '#2563eb' };
  if (rating >= 1650) return { label: 'Diamond Tier', bg: '#e8effb', fg: '#2563eb' };
  if (rating >= 1500) return { label: 'Gold Tier', bg: '#f3e3c8', fg: '#8a5a00' };
  if (rating >= 1350) return { label: 'Silver Tier', bg: '#eceef1', fg: '#6b7280' };
  return { label: 'Bronze Tier', bg: '#f0e2d8', fg: '#9a5b3f' };
}

// Display name for a player on the ranked board: signed username, else a stable
// "Guest-XXXX" handle from the anon key.
export function displayHandle(p) {
  if (!p.isAnon && p.username) return p.username;
  const src = p.anonId || p.key || '';
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  return 'Guest-' + h.toString(16).toUpperCase().slice(0, 4).padStart(4, '0');
}

// Stable "Guest-XXXX" handle from a raw anon_id (same scheme as displayHandle),
// for routes that have an anon_id string but not a full player object (e.g. the
// live feed). A null/empty anon yields a generic guest token.
export function guestHandleFromAnon(anonId) {
  const src = anonId || '';
  let h = 0;
  for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  return 'Guest-' + h.toString(16).toUpperCase().slice(0, 4).padStart(4, '0');
}

// Build the ranked leaderboard for a scope ('all' or a department key). Ranks
// by rating desc, then matches desc, then handle. Returns rank-ordered entries
// with NO rating number exposed (the /quizzes page shows position only).
export function rankPlayers(players, scope = 'all', { minMatches = 1 } = {}) {
  const list = [];
  for (const p of players.values()) {
    let rating, matches, correct, completed, daysPlayed, accuracy;
    if (scope === 'all') {
      rating = p.rating; matches = p.matches;
      correct = p.correct; completed = p.completed; daysPlayed = p.daysPlayed; accuracy = p.accuracy;
    } else {
      const c = p.byCategory[scope];
      if (!c) continue;
      rating = c.rating; matches = c.matches;
      correct = c.correct; completed = c.completed; daysPlayed = c.daysPlayed; accuracy = c.accuracy;
    }
    if (matches < minMatches) continue;
    list.push({
      key: p.key,
      userId: p.userId,
      anonId: p.anonId,
      isAnon: p.isAnon,
      name: displayHandle(p),
      rating,
      matches,
      correct: correct || 0,
      completed: completed || 0,
      daysPlayed: daysPlayed || 0,
      accuracy: accuracy || 0,
    });
  }
  list.sort((a, b) => b.rating - a.rating || b.matches - a.matches || (a.name || '').localeCompare(b.name || ''));
  return list;
}
