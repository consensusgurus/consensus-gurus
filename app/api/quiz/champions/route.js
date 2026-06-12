import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

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
      .select('id, user_id, username, quiz_id, score, total')
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

// Build the three cross-quiz rankings from raw completed games.
//   completed : most DISTINCT quizzes completed (signed-up users only)
//   weighted  : accuracy-weighted completions = sum of first-attempt
//               score/total across distinct quizzes (i.e. accuracy x quizzes)
//   accuracy  : highest average first-attempt accuracy, among users with at
//               least minQuizzes distinct quizzes
export function buildChampions(rows, { minQuizzes = MIN_QUIZZES } = {}) {
  const signed = rows.filter((r) => r.user_id && r.total > 0);

  // First attempt per (user, quiz) = the lowest row id for that pair.
  const firstByPair = new Map();
  // Display name per user = the username on their most recent row.
  const nameByUser = new Map();
  const nameIdByUser = new Map();
  for (const r of signed) {
    const id = r.id || 0;
    const key = r.user_id + '::' + r.quiz_id;
    const prev = firstByPair.get(key);
    if (!prev || id < (prev.id || 0)) firstByPair.set(key, r);
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

  return { completed, weighted, accuracy, minQuizzes };
}

// GET /api/quiz/champions
export async function GET() {
  try {
    const rows = await fetchAllResults();
    return NextResponse.json(buildChampions(rows));
  } catch (e) {
    console.error('quiz champions error', e);
    return NextResponse.json({ completed: [], weighted: [], accuracy: [], minQuizzes: MIN_QUIZZES });
  }
}
