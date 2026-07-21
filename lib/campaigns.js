// Offline / print campaign attribution: measuring a placement (a QR code on a
// flyer, a sticker, a printed ad) end to end.
//
// Flow:
//   1. A placement links to https://sourceoftruths.com/tally?c=<code>.
//   2. Any landing page runs captureCampaign() (mounted once via VisitorBeacon
//      in the root layout), which POSTs the landing to /api/campaign, stores the
//      code in the first-party 'sot_camp' cookie, and strips ?c= back out of the
//      URL so the code never leaks into the visitor's own copied links, shares,
//      or OG previews.
//   3. On this visitor's next finished quiz or daily game, /api/quiz/result
//      reads that cookie and stamps quiz_results.campaign, so the admin can
//      follow scans through to plays.
//
// Why a SEPARATE param from ?ref= (lib/referrals.js): ?ref= credits one
// registered player for inviting another, and a visitor may only ever credit
// ONE referrer. Spending that slot on a marketing code would permanently block a
// real invite from a friend, and the campaign would silently credit nobody
// because the code maps to no user. The two systems are independent on purpose:
// a visitor can carry both a ?ref= and a ?c= at once.

export const CAMPAIGN_PARAM = 'c';
export const CAMPAIGN_COOKIE = 'sot_camp';
// 30 days, matching the referral window: long enough that someone who scans a
// flyer on Friday and plays on Sunday still attributes, short enough that the
// credit stays honest.
export const CAMPAIGN_MAX_AGE = 60 * 60 * 24 * 30;

// Campaign codes are lowercase alphanumeric plus - and _, so a code is always
// safe in a URL, a cookie, and a printed QR payload.
export function normalizeCampaign(raw) {
  if (typeof raw !== 'string') return null;
  const code = raw.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40);
  return code || null;
}

// Build a campaign link for a placement. path defaults to the site root.
export function campaignUrl(code, path = '/') {
  const c = normalizeCampaign(code);
  if (!c) return null;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `https://sourceoftruths.com${p}?${CAMPAIGN_PARAM}=${encodeURIComponent(c)}`;
}

export function readCampaignCookie() {
  if (typeof document === 'undefined') return null;
  try {
    const m = document.cookie.match(/(?:^|;\s*)sot_camp=([^;]*)/);
    return m ? normalizeCampaign(decodeURIComponent(m[1])) : null;
  } catch {
    return null;
  }
}

// Log the landing, store the code, then clean ?c= out of the address bar. Safe
// to call on every page load; it no-ops when there is no campaign param.
//
// Unlike the referral cookie, a LATER campaign code OVERWRITES an earlier one:
// the most recent placement a person responded to is the one that brought them
// back, which is what a campaign report should say. The landing is logged every
// time regardless, so the scan count is never lost to a stale cookie.
export function captureCampaign() {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL(window.location.href);
    const code = normalizeCampaign(url.searchParams.get(CAMPAIGN_PARAM));
    if (!code) return null;

    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CAMPAIGN_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=${CAMPAIGN_MAX_AGE}; SameSite=Lax${secure}`;

    // Fire and forget: a logging failure must never affect the page.
    try {
      fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: code, path: url.pathname, referrer: document.referrer || '' }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* ignore */ }

    url.searchParams.delete(CAMPAIGN_PARAM);
    const qs = url.searchParams.toString();
    window.history.replaceState({}, '', `${url.pathname}${qs ? `?${qs}` : ''}${url.hash}`);
    return code;
  } catch {
    /* no cookies / no history API: the campaign simply doesn't attribute here */
    return null;
  }
}
