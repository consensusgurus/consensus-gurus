import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player, small payload, safe to cache briefly at the edge (the query string
// is the player's own identity, so cache entries never cross users).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };

// Daily-game quizIds look like `<game>-<M>-<D>-<YY>` (e.g. crux-7-14-26). This
// matches only those, so a normal quiz that happens to share a prefix can't leak
// in.
const DAILY_RE = /^(crux|emcee|garble|links|span|dating|tally|suds|circa|extra|carve|stet|outwit|tuck|alibi|cipher|ping|warmer|jester|sworn|outrank)-\d+-\d+-\d+$/;

// GET /api/quiz/daily-status?anonId=&email=
// The player's daily-game history, resolved by the identity the quiz client
// stores (email -> account, else this browser's anon). Lets /daily and the
// end-screen cross-promo show played/completed marks that FOLLOW THE USER across
// devices — localStorage only knows this one browser. Reads the shared in-process
// quiz_results cache (no fresh full-table query) per the egress guardrails.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  try {
    let myKey = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) myKey = `u:${ident.id}`;
    else if (anonId) myKey = `a:${anonId}`;
    if (!myKey) return NextResponse.json({ played: [], completed: [], abandoned: [] }, { headers: CACHE_HEADERS });

    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('daily-status error', error);
      return NextResponse.json({ played: [], completed: [], abandoned: [] });
    }
    const played = new Set();
    const completed = new Set();
    const abandonedOnly = new Set();
    for (const r of (data || [])) {
      const qid = r && r.quiz_id;
      if (!qid || !DAILY_RE.test(qid)) continue;
      const pk = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : null);
      if (pk !== myKey) continue;
      // An abandoned in-progress row (opened the board, made a move, then left
      // before finishing) is NOT a played game. It still counts as a play for
      // the leaderboard fallback in daily-combined, but here it is reported
      // separately as `abandoned` (started, not finished), never played/completed.
      if (r.abandoned) { abandonedOnly.add(qid); continue; }
      played.add(qid);
      if (r.total > 0 && r.score === r.total) completed.add(qid);
    }
    // Report a game as abandoned only when the player never finished it.
    const abandoned = [...abandonedOnly].filter((q) => !played.has(q));
    return NextResponse.json({ played: [...played], completed: [...completed], abandoned }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-status exception', e);
    return NextResponse.json({ played: [], completed: [], abandoned: [] });
  }
}
