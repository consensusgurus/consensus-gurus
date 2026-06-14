import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveQuizIdentity, attributeAnonGames, validEmail, looksLikeEmail } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function summarize(rows) {
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
  // try_num = that player's chronological attempt number (by row id).
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
  const leaderboard = signed
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed || (a.username || '').localeCompare(b.username || ''))
    .slice(0, 10)
    .map((r) => ({ username: r.username, score: r.score, timeElapsed: r.time_elapsed, tryNum: tryOf.get(r) }));
  return { plays, best, topTime: Number.isFinite(topTime) ? topTime : null, leaderboard };
}

// POST /api/quiz/claim  { quizId, resultId, username, email?, anonId }
// Retroactively post a just-finished anonymous game to the leaderboard: find or
// create the identity (email optional), attach THIS result row, then link every
// earlier anonymous game from this browser. Returns the refreshed board.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const resultId = Number.isInteger(body.resultId) ? body.resultId : null;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : '';

    if (!quizId || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }
    if (!username || username.length > 40) {
      return NextResponse.json({ error: 'Display name required (max 40 characters).' }, { status: 400 });
    }
    if (looksLikeEmail(username)) {
      return NextResponse.json({ error: 'Display name cannot be an email address.' }, { status: 400 });
    }
    if (email && !validEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email or leave it blank.' }, { status: 400 });
    }
    if (!resultId) {
      return NextResponse.json({ error: 'No game to post. Finish a round first.' }, { status: 400 });
    }
    if (!email && !anonId) {
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 400 });
    }

    const user = await resolveQuizIdentity(supabaseAdmin, { username, email: email || undefined, anonId });
    if (!user) {
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
    }

    // Attach the specific result row, but only if it is still unattributed (so a
    // shared link can't reassign someone else's game).
    const { error: updErr } = await supabaseAdmin
      .from('quiz_results')
      .update({ user_id: user.id, username: user.username })
      .eq('id', resultId)
      .eq('quiz_id', quizId)
      .is('user_id', null);
    if (updErr) {
      console.error('quiz claim attribute error', updErr);
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
    }

    // Also link every earlier anonymous game from this browser to the user.
    await attributeAnonGames(supabaseAdmin, anonId, user);

    const { data } = await supabaseAdmin
      .from('quiz_results')
      .select('id, user_id, username, score, time_elapsed')
      .eq('quiz_id', quizId);
    return NextResponse.json({ ...summarize(data || []), username: user.username, email: user.email || null });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
