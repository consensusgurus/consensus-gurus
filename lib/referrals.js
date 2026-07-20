// Referral capture: crediting a registered user when someone they invited
// finishes a quiz or a daily game.
//
// Flow:
//   1. A registered user shares https://sourceoftruths.com/quizzes?ref=<code>.
//   2. Any landing page runs captureRef() (mounted once via VisitorBeacon in the
//      root layout), which stores the code in the first-party 'sot_ref' cookie
//      and strips ?ref= back out of the URL so the code never leaks into the
//      visitor's own copied links, shares, or OG previews.
//   3. On the visitor's next finished game, /api/quiz/result reads that cookie
//      and writes ONE quiz_referrals row for them (see lib/referrals-server.js).
//
// A cookie is used rather than threading a prop through each board because every
// game board already posts to /api/quiz/result; the cookie rides along on that
// same-origin request automatically, so no board needs to know referrals exist.

export const REF_PARAM = 'ref';
export const REF_COOKIE = 'sot_ref';
// 30 days: long enough that an invite shared on a Friday still credits a player
// who gets around to it, short enough that the attribution stays meaningful.
export const REF_MAX_AGE = 60 * 60 * 24 * 30;

// Share codes are lowercase alphanumeric (plus - and _), which is what the
// migration's slug backfill produces. Anything else is not a code we issued.
export function normalizeRefCode(raw) {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return code || null;
}

export function refShareUrl(code, path = '/quizzes') {
  const c = normalizeRefCode(code);
  if (!c) return null;
  return `https://sourceoftruths.com${path}?${REF_PARAM}=${encodeURIComponent(c)}`;
}

export function readRefCookie() {
  if (typeof document === 'undefined') return null;
  try {
    const m = document.cookie.match(/(?:^|;\s*)sot_ref=([^;]*)/);
    return m ? normalizeRefCode(decodeURIComponent(m[1])) : null;
  } catch {
    return null;
  }
}

// Store ?ref= if present, then clean it out of the address bar. Safe to call on
// every page load. Returns the captured code, or null when there was none.
//
// First code wins: an existing cookie is NOT overwritten, so whoever actually
// introduced the visitor keeps the credit even if a later link reaches them.
export function captureRef() {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    const code = normalizeRefCode(url.searchParams.get(REF_PARAM));
    if (!code) return null;
    if (!readRefCookie()) {
      const secure = location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${REF_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${REF_MAX_AGE}; SameSite=Lax${secure}`;
    }
    url.searchParams.delete(REF_PARAM);
    const qs = url.searchParams.toString();
    window.history.replaceState({}, '', `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`);
    return code;
  } catch {
    /* no cookies / no history API: referrals simply don't attribute here */
    return null;
  }
}
