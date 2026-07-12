import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { computeXp, rankPlayers } from '@/lib/quiz-xp';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Same board for every visitor (per scope/full URL): let Vercel's CDN absorb
// repeat hits instead of hitting Supabase per request (egress fix 2026-07-12).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

// GET /api/quiz/xp[?scope=<dept>][&full=1]
// XP-RANKED leaderboard for the /quizzes page — every player gets a numbered
// rank. Returns, per ranked player, the per-metric values FOR THE REQUESTED
// SCOPE (xp, level, correct, completed, days played, accuracy) so the page can
// re-sort the board by whichever slide is showing without another round trip.
// `scope` filters to one department; omit/`all` for overall. ALL anonymous
// players are included. full=1 returns up to 2000 rows plus trend7d = XP
// earned in the last 7 days (null = the player's first game is newer than the
// cutoff, shown as NEW).
const TOP_N = 12;
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get('scope') || 'all').trim() || 'all';
  const full = searchParams.get('full') === '1';
  try {
    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) {
      console.error('quiz xp error', error);
      return NextResponse.json({ scope, total: 0, players: [] });
    }
    const { players } = computeXp(data || []);
    const ranked = rankPlayers(players, scope);
    const out = ranked.slice(0, full ? 2000 : TOP_N).map((p, i) => ({
      rank: i + 1,
      name: p.name,
      isAnon: p.isAnon,
      userKey: p.key,
      xp: p.xp,
      level: p.level,
      correct: p.correct,
      completed: p.completed,
      daysPlayed: p.daysPlayed,
      accuracy: p.accuracy,
      played: p.played,
      ...(full && scope === 'all' ? { trend7d: p.xp7d == null ? null : p.xp7d } : {}),
    }));
    return NextResponse.json({ scope, total: out.length, players: out }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('quiz xp exception', e);
    return NextResponse.json({ scope, total: 0, players: [] });
  }
}
