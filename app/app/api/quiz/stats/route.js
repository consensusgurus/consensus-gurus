import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Same numbers for every visitor: let Vercel's CDN absorb repeat hits instead
// of recomputing (and re-reading Supabase) per request (egress fix 2026-07-12).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

// GET /api/quiz/stats -> { quizzes: [{ quizId, plays, plays24h, players,
//   signedPlays, avgScorePct, avgScore, avgTotal, totalTime, bestScore }] }
// Per-quiz aggregates over every completed game (signed-up or anonymous),
// powering the /quizzes/stats table. Computed in JS over service-role rows so
// it is RLS-independent and matches the totals counter exactly.
//
// `players` counts DISTINCT players INCLUDING anonymous ones: a signed-up
// player is keyed by user_id, an anonymous player by the per-browser anon_id
// (sent with every game since migration 22), and a row with neither (very old
// plays, or a client that didn't send a token) counts as its own player since
// it can't be deduped. `plays24h` = completed games in the trailing 24 hours.
export async function GET() {
  try {
    // Shared in-process cache; its column superset covers everything used
    // here. (Rows arrive in id order rather than quiz_id order, which is fine:
    // the aggregation below is a single pass keyed by quiz_id.)
    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('quiz stats error', error);
      return NextResponse.json({ quizzes: [] });
    }
    const rows = data || [];
    const cutoff24 = Date.now() - 24 * 60 * 60 * 1000;
    const agg = new Map();
    for (const r of rows) {
      const id = r.quiz_id;
      if (!id) continue;
      let a = agg.get(id);
      if (!a) { a = { plays: 0, plays24h: 0, signedPlays: 0, players: new Set(), scoreSum: 0, totalSum: 0, pctSum: 0, timeSum: 0, timeN: 0, bestScore: 0, perfect: 0 }; agg.set(id, a); }
      a.plays += 1;
      if (r.created_at && new Date(r.created_at).getTime() >= cutoff24) a.plays24h += 1;
      // Distinct player, anonymous included: user_id, else anon_id, else this row.
      const playerKey = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`);
      a.players.add(playerKey);
      if (r.user_id) a.signedPlays += 1;
      const score = Number(r.score) || 0;
      const total = Number(r.total) || 0;
      a.scoreSum += score;
      a.totalSum += total;
      if (total > 0) a.pctSum += Math.min(1, score / total);
      if (Number.isFinite(Number(r.time_elapsed))) { a.timeSum += Number(r.time_elapsed); a.timeN += 1; }
      if (score > a.bestScore) a.bestScore = score;
      if (total > 0 && score === total) a.perfect += 1;
    }
    const quizzes = [...agg.entries()].map(([quizId, a]) => ({
      quizId,
      plays: a.plays,
      plays24h: a.plays24h,
      signedPlays: a.signedPlays,
      players: a.players.size, // distinct players, anonymous included
      avgScorePct: a.plays ? Math.round((a.pctSum / a.plays) * 100) : 0, // percent, integer
      avgScore: a.plays ? Math.round(a.scoreSum / a.plays) : 0,
      avgTotal: a.plays ? Math.round(a.totalSum / a.plays) : 0,
      totalTime: a.timeSum || 0, // total seconds spent across all plays
      correct: a.scoreSum, // total correct answers across all plays
      perfect: a.perfect, // perfect-score (100%) completions
      bestScore: a.bestScore,
    })).sort((x, y) => y.plays - x.plays || x.quizId.localeCompare(y.quizId));
    return NextResponse.json({ quizzes }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('quiz stats exception', e);
    return NextResponse.json({ quizzes: [] });
  }
}
