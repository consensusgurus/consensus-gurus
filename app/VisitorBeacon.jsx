'use client';

import { useEffect } from 'react';
import { ensureVisitorCookie, adoptVisitorId, adoptable, getVisitorId } from '@/lib/visitor';
import { PARAM as HANDOFF_PARAM } from '@/lib/identity-handoff';
import { captureRef, ensureMyRefCode } from '@/lib/referrals';
import { captureCampaign } from '@/lib/campaigns';

// Mounted once in the root layout. Three jobs, all fire-and-forget on first paint:
//  1. Writes the stable visitor-id cookie (sot_vid) so subsequent same-origin
//     view-logging requests are attributed to a distinct browser, powering the
//     admin DAU/WAU/MAU analytics.
//  2. Captures a ?ref=<code> share link into the sot_ref cookie and strips the
//     param back out of the URL, so the referrer is credited on this visitor's
//     next finished quiz or daily game (see lib/referrals.js).
//  3. Captures a ?c=<code> marketing campaign (printed QR codes, flyers) into
//     the sot_camp cookie and logs the landing, so a placement's scans can be
//     followed through to real plays (see lib/campaigns.js). Deliberately a
//     separate param from ?ref=: a marketing code must never consume the one
//     referral credit a visitor can give a friend.
//  4. Claims a ?_ml=<signed token> identity handoff, so a returning anonymous player keeps
//     their streak and IQ instead of arriving as a stranger. Two minters exist: the old-domain
//     redirect (rebrand move) and the PWA install manifest (an iOS home-screen app runs in its
//     own storage partition, so its first launch claims the identity of the browser it was
//     installed from). A claim that resolves to a registered account also restores
//     sot_quiz_identity. See lib/identity-handoff.js.
//  5. Repoints the page's manifest link at /api/pwa-manifest with a long-lived handoff token,
//     which is what mints the PWA handoff in the first place (ensurePwaManifest below).
// Renders nothing.
// Exchange a ?_ml token for the identity it represents, adopt it if this browser has
// nothing worth keeping, and strip the parameter either way so it is never shared or
// bookmarked. Deliberately silent: a failed claim just means the player starts fresh, which
// is exactly what would have happened without any of this.
async function claimHandoff() {
  let token = null;
  try {
    const url = new URL(window.location.href);
    token = url.searchParams.get(HANDOFF_PARAM);
    if (!token) return;
    url.searchParams.delete(HANDOFF_PARAM);
    window.history.replaceState({}, '', url.toString());
  } catch { return; }
  if (!adoptable()) return;   // this browser already has an identity that has played here
  try {
    const r = await fetch('/api/identity/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!r.ok) return;
    const { id, username, email } = await r.json();
    if (!adoptVisitorId(id)) return;
    // Restore the signed-in state too: a home-screen install starts with EMPTY
    // localStorage (iOS partitions it), and the claim resolved the account the
    // anon belongs to server-side. Never overwrite an identity already here.
    try {
      if (username && !localStorage.getItem('sot_quiz_identity')) {
        localStorage.setItem('sot_quiz_identity', JSON.stringify({ username, email: email || null }));
      }
    } catch { /* storage unavailable: the anon adoption alone still worked */ }
  } catch { /* offline or blocked: the player simply keeps the new identity */ }
}

// Point the page's manifest link at the token-carrying manifest route, so an install made
// from this page bakes an identity handoff into its start_url. iOS home-screen apps get
// their OWN storage partition (localStorage AND cookies), so without this an install signs
// the player out with no way back; the manifest URL is the only channel that crosses the
// partition. Browsers fetch the manifest lazily at install time, so a swapped href is what
// an install actually reads. The token is cached and re-minted at half-life, so this costs
// one request per browser per month, not per page load. See /api/identity/pwa-token.
const PWA_TOKEN_KEY = 'sot_pwa_mlt';
async function ensurePwaManifest() {
  try {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return;
    const links = document.querySelectorAll('link[rel="manifest"]');
    if (!links.length) return;
    const anon = getVisitorId();
    let tok = null;
    try {
      const c = JSON.parse(localStorage.getItem(PWA_TOKEN_KEY) || 'null');
      if (c && c.t && c.a === anon && Number(c.exp) - Date.now() > 30 * 24 * 60 * 60 * 1000) tok = c.t;
    } catch { /* cache unreadable: mint fresh */ }
    if (!tok) {
      const r = await fetch('/api/identity/pwa-token', { method: 'POST' });
      if (!r.ok) return;
      const { token, exp } = await r.json();
      if (!token) return;
      tok = token;
      try { localStorage.setItem(PWA_TOKEN_KEY, JSON.stringify({ t: token, exp, a: anon })); } catch { /* re-mints next load */ }
    }
    links.forEach((l) => {
      const href = l.getAttribute('href') || '';
      if (href.startsWith('/api/pwa-manifest')) return;
      const m = href.match(/^\/([a-z0-9-]+)\.webmanifest$/);
      const game = m && m[1] !== 'manifest' ? `&game=${m[1]}` : '';
      l.setAttribute('href', `/api/pwa-manifest?_ml=${encodeURIComponent(tok)}${game}`);
    });
  } catch { /* no swap: installs simply behave as before */ }
}

export default function VisitorBeacon() {
  useEffect(() => {
    // Runs first, and synchronously, so the id exists (and is stamped brand-new) before the
    // async claim below decides whether it may be replaced.
    ensureVisitorCookie();
    // The manifest swap waits for the claim: if this load is an installed app's first
    // launch adopting a handed-over anon, the token must be minted for THAT id.
    claimHandoff().then(ensurePwaManifest);
    captureRef();
    captureCampaign();
    // Cache this player's own share code so every board's Share button can stamp
    // it synchronously. No-ops for signed-out visitors and for anyone cached, so
    // it costs at most one request per browser.
    ensureMyRefCode();
  }, []);
  return null;
}
