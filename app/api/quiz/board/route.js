import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { buildLeaderboardMatrix, playerStanding } from '@/lib/quiz-anon';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { resolvePlayerKeys } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' };
// A response carrying the caller's OWN placement is per-player, so it never goes
// in a shared cache.
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };
const AXES = new Set([
  'registered:all', 'registered:mobile', 'registered:first',
  'all:all', 'all:mobile', 'all:first',
]);

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

// GET /api/quiz/board?quizId=...                       -> { plays, avg, leaderboard }
// GET /api/quiz/board?quizId=&anonId=&email=&placeOn=  -> ...plus { me }
//
// THE CALLER'S OWN PLACEMENT (owner, 2026-08-16). Every board above is capped at
// TEN rows, and the Loft end card was ranking the player by their INDEX in those
// ten (`myRank` in LoftFinish). A player who finished outside the top ten was
// simply not in the payload, so the rank tile printed a dash rather than a
// number: an owner report on Crux, 20/24 in a field of 108, is what surfaced it.
// The rows are already in this process's shared cache, so answering honestly
// costs one more pass over ONE quiz's rows, not a second request.
//
// `placeOn` names the board the caller is PRINTING, because a rank from a
// different axis than the rows shown underneath it is the same class of bug in a
// new coat. It defaults to 'registered:first', which is what the end card and
// DailyBoardPanel render.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const quizId = (searchParams.get('quizId') || '').trim();
  if (!quizId || quizId.length > 100) {
    return NextResponse.json({ error: 'quizId required' }, { status: 400 });
  }
  try {
    // Egress fix (2026-07-12): filter the shared in-process quiz_results cache
    // instead of re-reading every row for this quiz from Supabase per request.
    // The cache column superset includes everything summarize() needs
    // (time_elapsed, is_mobile, guesses_used, correct_count) and handles the
    // missing-column fallbacks internally. Rows are already in id order.
    const { data: all, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('quiz board error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    const data = (all || []).filter((r) => r.quiz_id === quizId);
    const anonId = (searchParams.get('anonId') || '').trim() || null;
    const email = (searchParams.get('email') || '').trim() || null;
    // No identity means the old, shared-cacheable answer, byte for byte.
    if (!anonId && !email) return NextResponse.json(summarize(data), { headers: CACHE_HEADERS });
    const asked = searchParams.get('placeOn');
    const axis = AXES.has(asked) ? asked : 'registered:first';
    const [population, filter] = axis.split(':');
    let me = null;
    try {
      // resolvePlayerKeys, not a username match: one person's rows carry BOTH
      // `u:<id>` and `a:<anon>` shapes, and matching on the display name is what
      // the row-index approach was already doing.
      const who = await resolvePlayerKeys(supabaseAdmin, { anonId, email });
      const st = playerStanding(data, who.keys, { population, filter });
      me = { key: who.primary, axis, placement: st.placement, field: st.field, row: st.row };
    } catch (e) {
      me = null; // the boards themselves are still worth returning
    }
    return NextResponse.json({ ...summarize(data), me }, { headers: NO_STORE_HEADERS });
  } catch (e) {
    return NextResponse.json({ error: 'db error' }, { status: 500 });
  }
}
