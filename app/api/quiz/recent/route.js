import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { guestHandleFromAnon } from '@/lib/quiz-xp';
import { QUIZZES } from '@/lib/quizzes';

const HIDDEN_QUIZ_IDS = new Set((QUIZZES || []).filter((q) => q && (q.unlisted || q.mobilePreview)).map((q) => q.id));

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };

// GET /api/quiz/recent -> { plays: [{quizId, username, score, total, playedAt,
//   isAnon, attempt}] }
// The 1000 most recent completed games, newest first (a deep window so the
// Last Played board can still surface 5 distinct quizzes when the newest plays
// are dominated by a single quiz). Powers the /quizzes live
// feed + Last Played board. `attempt` is that PLAYER's chronological attempt
// number of that quiz (1 = first time), computed by counting their earlier rows
// for the same quiz; `isAnon` flags a play with no signed account.
export async function GET() {
  try {
    // Egress fix (2026-07-12): both reads below now come from the shared
    // in-process quiz_results cache instead of fresh Supabase queries.
    const { data: cached, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('quiz recent error', error);
      return NextResponse.json({ plays: [] });
    }
    // The 1000 most recent completed games, newest first. Cached rows are in
    // id (insertion) order, which tracks created_at; sort the tail slice by
    // created_at to keep the previous ordering exactly.
    const data = (cached || [])
      .slice(-1200)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 1000);
    const recent = data.filter((r) => !HIDDEN_QUIZ_IDS.has(r.quiz_id));

    // Compute the per-(player, quiz) attempt number for each recent row by
    // counting that player's earlier rows for the same quiz, over the full
    // cached table (id order = chronological).
    const quizIds = [...new Set(recent.map((r) => r.quiz_id).filter(Boolean))];
    const priorCount = new Map(); // `${playerKey}::${quizId}::${rowId}` -> attempt
    if (quizIds.length) {
      const quizIdSet = new Set(quizIds);
      const all = (cached || []).filter((r) => quizIdSet.has(r.quiz_id));
      const seen = new Map(); // `${playerKey}::${quizId}` -> running count
      for (const r of (all || [])) {
        const pk = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`);
        const k = pk + '::' + r.quiz_id;
        const n = (seen.get(k) || 0) + 1;
        seen.set(k, n);
        priorCount.set(pk + '::' + r.quiz_id + '::' + r.id, n);
      }
    }

    const plays = recent.map((r) => {
      const pk = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`);
      const attempt = priorCount.get(pk + '::' + r.quiz_id + '::' + r.id) || 1;
      const isAnon = !r.user_id;
      const name = isAnon
        ? (r.username || guestHandleFromAnon(r.anon_id || `r:${r.id}`))
        : (r.username || 'Player');
      return {
        quizId: r.quiz_id,
        username: r.username || null,
        name,
        // Linkable player key (u:<id> / a:<anon>) so the live feed can link a
        // name to its Stat Hub profile. Null for an unattributable one-off row.
        userKey: (r.user_id || r.anon_id) ? pk : null,
        score: r.score,
        total: r.total,
        playedAt: r.created_at || null,
        isAnon,
        attempt,
      };
    });
    return NextResponse.json({ plays }, { headers: CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ plays: [] });
  }
}
