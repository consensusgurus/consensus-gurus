import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { computeElo, rankPlayers } from '@/lib/quiz-elo';
import { DEPT_NAV } from '@/lib/quiz-departments';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/elo-categories
// One ELO computation, then the skill-rating-ranked top players for EVERY
// department, so the /quizzes leaderboard can cycle a "Top Rated <Category>"
// slide per category without a round trip each. Only departments with at least
// MIN_PLAYERS ranked players are returned (sparse boards are skipped, matching
// the main board's guest-hiding rule).
const TOP_N = 10;
const MIN_PLAYERS = 3;

export async function GET() {
  try {
    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) {
      console.error('quiz elo-categories error', error);
      return NextResponse.json({ boards: {} });
    }
    const { players } = computeElo(data || []);
    const boards = {};
    for (const d of DEPT_NAV) {
      const ranked = rankPlayers(players, d.id);
      // Prefer named players; fall back to including guests only when there
      // aren't enough named ones to fill the top three (same rule as the
      // main /quizzes board).
      const named = ranked.filter((p) => !p.isAnon);
      const list = named.length >= MIN_PLAYERS ? named : ranked;
      if (list.length < MIN_PLAYERS) continue;
      boards[d.id] = list.slice(0, TOP_N).map((p, i) => ({
        rank: i + 1,
        name: p.name,
        isAnon: p.isAnon,
        userKey: p.key,
        rating: p.rating,
        played: p.played,
      }));
    }
    return NextResponse.json({ boards });
  } catch (e) {
    console.error('quiz elo-categories exception', e);
    return NextResponse.json({ boards: {} });
  }
}
