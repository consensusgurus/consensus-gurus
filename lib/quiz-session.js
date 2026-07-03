// Durable, server-issued session for the (password-less) quiz + duel identity.
// Complements localStorage: when a player joins/claims we sign a small token
// with their identity and set it as an HTTP-only cookie, so the "who am I" state
// survives a localStorage eviction (Safari/iOS caps script-set storage at ~7
// days) and is restored on load via GET /api/quiz/session. This is what stops
// the "claim your name" prompt from reappearing for a returning player.
//
// The token is HMAC-signed so it can't be tampered with. It is NOT a security
// boundary in the auth sense -- the quiz leaderboard has no passwords and join
// is find-or-create by email/anon-id -- it just keeps a browser signed in.

import crypto from 'crypto';

export const QUIZ_SESSION_COOKIE = 'sot_quiz_session';

const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function secret() {
  return (
    process.env.QUIZ_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PASSWORD ||
    'sot-quiz-session-dev-secret'
  );
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', secret()).update(payloadB64).digest('base64url');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// Build a signed token for a resolved identity ({ id, username, email }).
export function makeQuizSessionToken(user) {
  if (!user || !user.username) return null;
  const payload = {
    id: user.id || null,
    username: String(user.username).slice(0, 40),
    email: user.email || null,
    iat: Date.now(),
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

// Verify a token and return { id, username, email } or null.
export function readQuizSessionToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return null;
  if (!safeEqual(sig, sign(payloadB64))) return null;
  try {
    const p = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!p || !p.username) return null;
    return { id: p.id || null, username: p.username, email: p.email || null };
  } catch {
    return null;
  }
}

export function quizSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  };
}
