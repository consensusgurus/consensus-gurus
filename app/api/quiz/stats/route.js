import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/stats -> { quizzes: [{ quizId, plays, players, signedPlays,
//   avgScorePct, avgScore, avgTotal, avgTime, bestScore }] }
// Per-quiz aggregates over every completed game (signed-up or anonymous),
// powering the /quizzes/stats table. Computed in JS over service-role rows so
// it is RLS-independent and matches the totals counter exactly.
export async function GET() {
  try {
    const { data, error } = await fetchAllRows(
      supabaseAdmin,
      'quiz_results',
      'quiz_id, user_id, score, total, time_elapsed',
      ['quiz_id'],
    );
    if (error) {
      console.error('quiz stats error', error);
      return NextResponse.json({ quizzes: [] });
    }
    const rows = data || [];
    const agg = new Map();
    for (const r of rows) {
      const id = r.quiz_id;
      if (!id) continue;
      let a = agg.get(id);
      if (!a) { a = { plays: 0, signedPlays: 0, users: new Set(), scoreSum: 0, totalSum: 0, pctSum: 0, timeSum: 0, timeN: 0, bestScore: 0 }; agg.set(id, a); }
      a.plays += 1;
      if (r.user_id) { a.signedPlays += 1; a.users.add(r.user_id); }
      const score = Number(r.score) || 0;
      const total = Number(r.total) || 0;
      a.scoreSum += score;
      a.totalSum += total;
      if (total > 0) a.pctSum += score / total;
      if (Number.isFinite(Number(r.time_elapsed))) { a.timeSum += Number(r.time_elapsed); a.timeN += 1; }
      if (score > a.bestScore) a.bestScore = score;
    }
    const quizzes = [...agg.entries()].map(([quizId, a]) => ({
      quizId,
      plays: a.plays,
      signedPlays: a.signedPlays,
      players: a.users.size,
      avgScorePct: a.plays ? Math.round((a.pctSum / a.plays) * 1000) / 10 : 0, // percent, 1dp
      avgScore: a.plays ? Math.round((a.scoreSum / a.plays) * 10) / 10 : 0,
      avgTotal: a.plays ? Math.round((a.totalSum / a.plays) * 10) / 10 : 0,
      avgTime: a.timeN ? Math.round(a.timeSum / a.timeN) : null, // seconds
      bestScore: a.bestScore,
    })).sort((x, y) => y.plays - x.plays || x.quizId.localeCompare(y.quizId));
    return NextResponse.json({ quizzes });
  } catch (e) {
    console.error('quiz stats exception', e);
    return NextResponse.json({ quizzes: [] });
  }
}
