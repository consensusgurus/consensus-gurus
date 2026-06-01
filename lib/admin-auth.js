// Admin authentication helpers. Compares cookie value against the
// ADMIN_PASSWORD environment variable using constant-time comparison.

import { cookies } from 'next/headers';

const COOKIE_NAME = 'cg-admin';

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function isAdmin() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const cookie = cookies().get(COOKIE_NAME);
  if (!cookie || !cookie.value) return false;
  return timingSafeEqual(cookie.value, expected);
}

export function adminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };
}

export { COOKIE_NAME, timingSafeEqual };
