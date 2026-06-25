import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { buildAllLeaderboard } from '@/lib/quiz-anon';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
  // Signed-up players only, but EVERY qualifying play is listed (a single
  // player can appear more than once). Top 10 by score desc, then fastest time.
  // Per-user chronological attempt number (1 = that player's first completed
  // game for this quiz), assigned by row id ascending. Lets the UI tag each
  // leaderboard entry "(1st Try)", "(2nd Try)"... so multiple plays from the
  // same person are distinguishable.
  const signed = rows.filter((r) => r.user_id);
  const tryByUser = {};
  const tryOf = new Map();
  signed
    .slice()
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .forEach((r) => {
      tryByUser[r.user_id] = (tryByUser[r.user_id] || 0) + 1;
      tryOf.set(r, tryByUser[r.user_id]);
    });
  const rankSigned = (subset) => subset
    .slice()
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed || (a.username || '').localeCompare(b.username || ''))
    .slice(0, 10)
    .map((r) => ({ username: r.username, userKey: 'u:' + r.user_id, score: r.score, timeElapsed: r.time_elapsed, tryNum: tryOf.get(r), playedAt: r.created_at }));
  const leaderboard = rankSigned(signed);
  // "Mobile" = signed games played on a phone/tablet (is_mobile true; legacy
  // and unknown rows are NULL and excluded). "First try" = each signed player's
  // earliest completed game only (attempt #1, per tryOf).
  const leaderboardMobile = rankSigned(signed.filter((r) => r.is_mobile === true));
  const leaderboardFirst = rankSigned(signed.filter((r) => tryOf.get(r) === 1));
  const leaderboardAll = buildAllLeaderboard(rows);
  // Exact score distribution over ALL completed attempts, so the client can
  // report the real share of attempts a finished run beat (no modeled curve).
  const scoreDist = {};
  for (const r of rows) { const sv = Number(r.score) || 0; scoreDist[sv] = (scoreDist[sv] || 0) + 1; }
  return { plays, best, topTime: Number.isFinite(topTime) ? topTime : null, leaderboard, leaderboardMobile, leaderboardFirst, leaderboardAll, scoreDist };
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
    let cols = 'id, user_id, username, score, time_elapsed, anon_id, created_at, is_mobile';
    for (let from = 0; ; from += 1000) {
      let { data: page, error } = await supabaseAdmin
        .from('quiz_results')
        .select(cols)
        .eq('quiz_id', quizId)
        .order('id', { ascending: true })
        .range(from, from + 999);
      // Drop is_mobile if migration 25 has not been applied yet (missing column).
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
    return NextResponse.json(summarize(data));
  } catch (e) {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}
