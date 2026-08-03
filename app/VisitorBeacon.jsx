'use client';

import { useEffect } from 'react';
import { ensureVisitorCookie, adoptVisitorId, adoptable } from '@/lib/visitor';
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
//  4. Claims a ?_ml=<signed token> identity handed over by the old domain during the
//     rebrand move, so a returning anonymous player keeps their streak and IQ instead of
//     arriving as a stranger. Inert until the redirects mint tokens; see
//     lib/identity-handoff.js.
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
    const { id } = await r.json();
    adoptVisitorId(id);
  } catch { /* offline or blocked: the player simply keeps the new identity */ }
}

export default function VisitorBeacon() {
  useEffect(() => {
    // Runs first, and synchronously, so the id exists (and is stamped brand-new) before the
    // async claim below decides whether it may be replaced.
    ensureVisitorCookie();
    claimHandoff();
    captureRef();
    captureCampaign();
    // Cache this player's own share code so every board's Share button can stamp
    // it synchronously. No-ops for signed-out visitors and for anyone cached, so
    // it costs at most one request per browser.
    ensureMyRefCode();
  }, []);
  return null;
}
