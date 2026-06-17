import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { buildAnonPlayers } from '@/lib/quiz-anon';
import { correctAnswersOf } from '@/lib/quiz-scoring';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const MIN_QUIZZES = 5;

// Page through quiz_results so we are never silently capped at PostgREST's
// 1000-row default. Returns every signed-up completed game.
async function fetchAllResults() {
  const page = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('id, user_id, username, quiz_id, score, total, anon_id, created_at')
      .order('id', { ascending: true })
      .range(from, from + page - 1);
    if (error) throw error;
    const rows = data || [];
    all.push(...rows);
    if (rows.length < page) break;
    from += page;
  }
  return all;
}

// Build the cross-quiz rankings from raw completed games.
//   totalPlays: most completed games overall, counting REPEATS (signed users)
//   completed : most DISTINCT quizzes completed (signed-up users only)
//   weighted  : accuracy-weighted completions = sum of first-attempt
//               score/total across distinct quizzes (i.e. accuracy x quizzes)
//   accuracy  : highest average first-attempt accuracy, among users with at
//               least minQuizzes distinct quizzes
export function buildChampions(rows, { minQuizzes = MIN_QUIZZES } = {}) {
  const signed = rows.filter((r) => r.user_id && r.total > 0);

  // First attempt per (user, quiz) = the lowest row id for that pair.
  const firstByPair = new Map();
  // Total completed games per user, counting every replay (for Total Plays).
  const playsByUser = new Map();
  // All-time correct answers per user (sum of score over every completed game),
  // and the DISTINCT quizzes each user has scored 100% on (Fully Completed).
  const correctByUser = new Map();
  const perfectByUser = new Map();
  // Display name per user = the username on their most recent row.
  const nameByUser = new Map();
  const nameIdByUser = new Map();
  for (const r of signed) {
    const id = r.id || 0;
    const key = r.user_id + '::' + r.quiz_id;
    const prev = firstByPair.get(key);
    if (!prev || id < (prev.id || 0)) firstByPair.set(key, r);
    playsByUser.set(r.user_id, (playsByUser.get(r.user_id) || 0) + 1);
    correctByUser.set(r.user_id, (correctByUser.get(r.user_id) || 0) + correctAnswersOf(r));
    if (r.total > 0 && r.score === r.total) {
      let pset = perfectByUser.get(r.user_id);
      if (!pset) { pset = new Set(); perfectByUser.set(r.user_id, pset); }
      pset.add(r.quiz_id);
    }
    if (id >= (nameIdByUser.get(r.user_id) || -1)) {
      nameIdByUser.set(r.user_id, id);
      nameByUser.set(r.user_id, r.username || 'Anonymous');
    }
  }

  // Aggregate per user over their first attempts.
  const agg = new Map();
  for (const r of firstByPair.values()) {
    const a = agg.get(r.user_id) || { quizzes: 0, accSum: 0 };
    a.quizzes += 1;
    a.accSum += r.score / r.total; // fraction 0..1
    agg.set(r.user_id, a);
  }

  const users = [...agg.entries()].map(([uid, a]) => ({
    username: nameByUser.get(uid) || 'Anonymous',
    quizzes: a.quizzes,
    accuracy: Math.round((a.accSum / a.quizzes) * 1000) / 10, // percent, 1dp
    weighted: Math.round(a.accSum * 10) / 10,                  // accuracy x quizzes, 1dp
  }));

  const byName = (x, y) => (x.username || '').localeCompare(y.username || '');

  const totalPlays = [...playsByUser.entries()]
    .map(([uid, n]) => ({ username: nameByUser.get(uid) || 'Anonymous', plays: n }))
    .sort((x, y) => y.plays - x.plays || byName(x, y));

  const completed = users
    .slice()
    .sort((x, y) => y.quizzes - x.quizzes || byName(x, y))
    .map((u) => ({ username: u.username, quizzes: u.quizzes }));

  const weighted = users
    .slice()
    .sort((x, y) => y.weighted - x.weighted || y.quizzes - x.quizzes || byName(x, y))
    .map((u) => ({ username: u.username, weighted: u.weighted, quizzes: u.quizzes, accuracy: u.accuracy }));

  const accuracy = users
    .filter((u) => u.quizzes >= minQuizzes)
    .sort((x, y) => y.accuracy - x.accuracy || y.quizzes - x.quizzes || byName(x, y))
    .map((u) => ({ username: u.username, accuracy: u.accuracy, quizzes: u.quizzes }));

  // All-time Total Correct Answers and Fully Completed Quizzes (distinct quizzes
  // scored 100%) leaderboards, used by the /quizzes Players board and /leaderboard.
  const correctAnswers = [...correctByUser.entries()]
    .map(([uid, n]) => ({ username: nameByUser.get(uid) || 'Anonymous', correct: n }))
    .filter((u) => u.correct > 0)
    .sort((x, y) => y.correct - x.correct || byName(x, y));
  const perfectQuizzes = [...perfectByUser.entries()]
    .map(([uid, set]) => ({ username: nameByUser.get(uid) || 'Anonymous', perfect: set.size }))
    .filter((u) => u.perfect > 0)
    .sort((x, y) => y.perfect - x.perfect || byName(x, y));

  return { totalPlays, completed, weighted, accuracy, correctAnswers, perfectQuizzes, minQuizzes };
}

// Midnight "today" in US Eastern as a UTC epoch ms (matches /api/quiz/today).
function startOfEasternTodayUTC() {
  const tz = 'America/New_York';
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  for (const offH of [4, 5]) {
    const guess = Date.parse(`${ymd}T00:00:00.000Z`) + offH * 3600 * 1000;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date(guess))
      .reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    if (`${p.year}-${p.month}-${p.day}` === ymd && p.hour === '00') return guess;
  }
  return Date.parse(`${ymd}T04:00:00.000Z`);
}

// Metric-specific anonymous totals for the leaderboard column parentheticals.
// Anonymous plays can't be tied to an account, so each anonymous "player" is
// keyed by their per-browser anon_id (else the row id, which can't dedupe).
//   anonPlays    : every anonymous completed game (counting replays)
//   anonCompleted: distinct (anon player, quiz) first attempts
//   anonWeighted : sum of first-attempt score/total across those distinct pairs
//   anonAccuracy : average first-attempt accuracy across those pairs (percent)
function buildAnon(rows) {
  const anonRows = rows.filter((r) => !r.user_id);
  const anonPlays = anonRows.length;
  const firstByPair = new Map();
  for (const r of anonRows) {
    if (!(r.total > 0)) continue;
    const pk = r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    const key = pk + '::' + r.quiz_id;
    const prev = firstByPair.get(key);
    if (!prev || (r.id || 0) < (prev.id || 0)) firstByPair.set(key, r);
  }
  let accSum = 0;
  for (const r of firstByPair.values()) accSum += r.score / r.total;
  const anonCompleted = firstByPair.size;
  const anonWeighted = Math.round(accSum * 10) / 10;                                  // accuracy x quizzes
  const anonAccuracy = firstByPair.size ? Math.round((accSum / firstByPair.size) * 1000) / 10 : 0; // percent, 1dp
  return { anonPlays, anonCompleted, anonWeighted, anonAccuracy };
}

// GET /api/quiz/champions
export async function GET() {
  try {
    const rows = await fetchAllResults();
    const anon = buildAnon(rows);
    const anonPlayers = buildAnonPlayers(rows);
    // Today subset (since midnight US Eastern) for the Today/All-time toggle.
    const cutoff = new Date(startOfEasternTodayUTC()).toISOString();
    const todayRows = rows.filter((r) => String(r.created_at || '') >= cutoff);
    const today = { ...buildChampions(todayRows), anonPlayers: buildAnonPlayers(todayRows) };
    // `anonymous` retained for back-compat (the /quizzes Players board total).
    return NextResponse.json({ ...buildChampions(rows), ...anon, anonPlayers, today, anonymous: anon.anonPlays });
  } catch (e) {
    console.error('quiz champions error', e);
    return NextResponse.json({ totalPlays: [], completed: [], weighted: [], accuracy: [], correctAnswers: [], perfectQuizzes: [], minQuizzes: MIN_QUIZZES, anonPlayers: [], today: { totalPlays: [], completed: [], correctAnswers: [], perfectQuizzes: [], anonPlayers: [] }, anonymous: 0, anonPlays: 0, anonCompleted: 0, anonWeighted: 0, anonAccuracy: 0 });
  }
}
