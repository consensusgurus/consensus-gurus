import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { QUIZ_SESSION_COOKIE, readQuizSessionToken } from '@/lib/quiz-session';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/session -> { username, email } for the browser's signed session
// cookie, or {} when there is none. Lets a client restore the leaderboard/duel
// identity on load even if localStorage was cleared or evicted, so the
// "claim your name" prompt does not reappear for a returning player.
export async function GET() {
  const token = cookies().get(QUIZ_SESSION_COOKIE)?.value;
  const sess = token ? readQuizSessionToken(token) : null;
  if (!sess) return NextResponse.json({});
  return NextResponse.json({ username: sess.username, email: sess.email || null });
}
