// Stable per-browser visitor identity for site-wide DAU/WAU/MAU analytics.
//
// We reuse the SAME id the quiz system already stores under localStorage
// 'sot_quiz_anon' (see getAnonId() in the quiz clients), so a person's page
// views and their quiz plays resolve to one identity. For visitors who have
// never played a quiz, the id is created on their first page view.
//
// The id is also mirrored into a first-party 'sot_vid' cookie, because the
// view-logging endpoints run on the server and can only read the identity from
// a cookie (localStorage is not sent with requests). Same-origin fetch()
// requests include the cookie automatically, so every view event — list, quiz,
// home, kids — gets attributed without threading the id through each caller.

const KEY = 'sot_quiz_anon';
const COOKIE = 'sot_vid';
// Two years; the id is a rotating analytics identifier, not an auth token.
const MAX_AGE = 60 * 60 * 24 * 730;

export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  try {
    let a = localStorage.getItem(KEY);
    if (!a) {
      a =
        window.crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(KEY, a);
    }
    return a;
  } catch {
    return null;
  }
}

// Ensure the sot_vid cookie carries the current visitor id. Safe to call on
// every page load; it only rewrites the cookie when needed.
export function ensureVisitorCookie() {
  if (typeof document === 'undefined') return null;
  const id = getVisitorId();
  if (!id) return null;
  try {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
  } catch {
    /* cookies unavailable: analytics simply won't attribute this browser */
  }
  return id;
}
