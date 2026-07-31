import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveQuizIdentity, attributeAnonGames, validEmail, looksLikeEmail } from '@/lib/quiz-identity';

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
      // A name-only account is keyed to the browser that made it, so on a second
      // device its owner hits this same 409 and used to have no way forward.
      // Point them at the one thing that DOES cross devices: their email.
      return NextResponse.json({
        error: email
          ? 'That display name belongs to a different account. Pick another name.'
          : 'That display name is already registered. If it is yours, add the email you signed up with to reconnect it on this device.',
        code: 'username_taken',
        recoverable: !email,
      }, { status: 409 });
    }
    if (!user) {
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
    }
    await attributeAnonGames(supabaseAdmin, anonId, user);
    return NextResponse.json({ username: user.username, email: user.email || null });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
