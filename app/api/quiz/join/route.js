import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveQuizIdentity, attributeAnonGames, validEmail, looksLikeEmail } from '@/lib/quiz-identity';
import { QUIZ_SESSION_COOKIE, makeQuizSessionToken, quizSessionCookieOptions } from '@/lib/quiz-session';

export const dynamic = 'force-dynamic';

// POST /api/quiz/join  { username, email?, anonId } -> find-or-create identity.
// Email is OPTIONAL (a display name alone is enough). The browser's anon_id keys
// the identity when there is no email, and links any games already played from
// this browser so the display name back-fills onto the leaderboard.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : '';

    if (!username || username.length > 15) {
      return NextResponse.json({ error: 'Display name required (max 15 characters).' }, { status: 400 });
    }
    if (looksLikeEmail(username)) {
      return NextResponse.json({ error: 'Display name cannot be an email address.' }, { status: 400 });
    }
    if (email && !validEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email or leave it blank.' }, { status: 400 });
    }
    if (!email && !anonId) {
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 400 });
    }

    const user = await resolveQuizIdentity(supabaseAdmin, { username, email: email || undefined, anonId });
    if (user && user.error === 'username_taken') {
      return NextResponse.json({ error: 'That display name is already taken. Pick another.' }, { status: 409 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
    }
    await attributeAnonGames(supabaseAdmin, anonId, user);
    const res = NextResponse.json({ username: user.username, email: user.email || null });
    // Durable, HTTP-only session so this browser stays signed in even if
    // localStorage is evicted, and a returning visit restores the identity.
    const token = makeQuizSessionToken(user);
    if (token) res.cookies.set(QUIZ_SESSION_COOKIE, token, quizSessionCookieOptions());
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
