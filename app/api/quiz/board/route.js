import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { buildLeaderboardMatrix } from '@/lib/quiz-anon';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' };

// Summarize completed games for a quiz into play count, average correct, and
// the leaderboard (each signed-up user's best attempt, ranked by score desc
// then time asc). Computed in JS over service-role rows so it is fully
// deterministic and RLS-independent.
export function summarize(rows) {
  const plays = rows.length;
  const best = plays ? Math.max(...rows.map((r) => r.score)) : null;
  // Fastest time recorded AT the best score, across ALL completed plays
  // (anonymous included, not just the signed-up leaderboard). Lets the client
  // tell whether a finished run is the outright #1 (top score, fastest time).
  const topTime = best != null
    ? Math.min(...rows.filter((r) => r.score === best).map((r) => (r.time_elapsed ?? Infinity)))
    : null;
  // Two composable leaderboard axes (population x filter) -> 6 boards, keyed
  // "<population>:<filter>" in `leaderboards`. Anonymous players appear in every
  // view EXCEPT 'registered:*'; in particular 'all:first' lists everyone's first
  // attempt (anon included), which the "All players + First try" toggle shows.
  // Legacy flat keys are kept for the compact strip/snippet and older clients:
  // leaderboardFirst now resolves to 'all:first' so anonymous first plays are
  // no longer dropped.
  const leaderboards = buildLeaderboardMatrix(rows);
  const leaderboard = leaderboards['registered:all'];
  const leaderboardMobile = leaderboards['all:mobile'];
  const leaderboardFirst = leaderboards['all:first'];
  const leaderboardAll = leaderboards['all:all'];
  // Exact score distribution over ALL completed attempts, so the client can
  // report the real share of attempts a finished run beat (no modeled curve).
  const scoreDist = {};
  for (const r of rows) { const sv = Number(r.score) || 0; scoreDist[sv] = (scoreDist[sv] || 0) + 1; }
  return { plays, best, topTime: Number.isFinite(topTime) ? topTime : null, leaderboard, leaderboardMobile, leaderboardFirst, leaderboardAll, leaderboards, scoreDist };
}

// GET /api/quiz/board?quizId=...  -> { plays, avg, leaderboard }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = (searchParams.get('quizId') || '').trim();
  if (!quizId || quizId.length > 100) {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 });
  }
  try {
    const data = [];
    let cols = 'id, user_id, username, score, time_elapsed, anon_id, created_at, is_mobile, guesses_used, correct_count';
    for (let from = 0; ; from += 1000) {
      let { data: page, error } = await supabaseAdmin
        .from('quiz_results')
        .select(cols)
        .eq('quiz_id', quizId)
        .order('id', { ascending: true })
        .range(from, from + 999);
      // Drop is_mobile if migration 25 has not been applied yet (missing column).
      if (error && cols.includes(', guesses_used') && (error.code === '42703' || error.code === 'PGRST204' || /column|schema cache/i.test(error.message || ''))) {
        cols = cols.replace(', guesses_used', ''); from -= 1000; continue;
      }
      if (error && cols.includes(', is_mobile') && (error.code === '42703' || error.code === 'PGRST204' || /column|schema cache/i.test(error.message || ''))) {
        cols = cols.replace(', is_mobile', ''); from -= 1000; continue;
      }
      if (error) {
        console.error('quiz board error', error);
        return NextResponse.json({ error: 'db error' }, { status: 500 });
      }
      if (!page || page.length === 0) break;
      data.push(...page);
      if (page.length < 1000) break;
    }
    return NextResponse.json(summarize(data), { headers: CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}
