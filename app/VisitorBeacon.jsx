'use client';

import { useEffect } from 'react';
import { ensureVisitorCookie } from '@/lib/visitor';
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
// Renders nothing.
export default function VisitorBeacon() {
  useEffect(() => {
    ensureVisitorCookie();
    captureRef();
    captureCampaign();
    // Cache this player's own share code so every board's Share button can stamp
    // it synchronously. No-ops for signed-out visitors and for anyone cached, so
    // it costs at most one request per browser.
    ensureMyRefCode();
  }, []);
  return null;
}
