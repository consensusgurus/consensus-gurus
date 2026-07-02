import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { computeElo, rankPlayers } from '@/lib/quiz-elo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/elo[?scope=<dept>]
// Elo-RANKED leaderboard for the /quizzes page. Returns, per ranked player, the
// per-metric values FOR THE REQUESTED SCOPE (skill rating, correct, completed,
// days played, accuracy) so the page can re-sort the board by whichever slide is
// showing without another round trip. `scope` filters to one department's
// per-category data; omit/`all` for overall. ALL anonymous players are included.
const TOP_N = 12;
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get('scope') || 'all').trim() || 'all';
  const full = searchParams.get('full') === '1';
  try {
    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) {
      console.error('quiz elo error', error);
      return NextResponse.json({ scope, total: 0, players: [] });
    }
    const { players } = computeElo(data || []);
    // rankPlayers already scopes every metric (rating/correct/completed/days/
    // accuracy) to the requested category, and includes guests.
    const ranked = rankPlayers(players, scope);
    // 7-day movement for the Stat Hub's full board: replay the results as they
    // stood a week ago (decay evaluated as of that moment) and diff overall
    // ratings. null = the player had no games a week ago (shows as NEW).
    let prevPlayers = null;
    if (full && scope === 'all') {
      const cutoff = Date.now() - 7 * 86400000;
      const weekRows = (data || []).filter((r) => (Date.parse(r.created_at || '') || 0) <= cutoff);
      prevPlayers = computeElo(weekRows, { nowMs: cutoff }).players;
    }
    const out = ranked.slice(0, full ? 2000 : TOP_N).map((p, i) => ({
      rank: i + 1,
      name: p.name,
      isAnon: p.isAnon,
      userKey: p.key,
      rating: p.rating,
      correct: p.correct,
      completed: p.completed,
      daysPlayed: p.daysPlayed,
      accuracy: p.accuracy,
      played: p.played,
      ...(prevPlayers ? { trend7d: prevPlayers.has(p.key) ? p.rating - prevPlayers.get(p.key).rating : null } : {}),
    }));
    return NextResponse.json({ scope, total: out.length, players: out });
  } catch (e) {
    console.error('quiz elo exception', e);
    return NextResponse.json({ scope, total: 0, players: [] });
  }
}
