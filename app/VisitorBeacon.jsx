'use client';

import { useEffect } from 'react';
import { ensureVisitorCookie } from '@/lib/visitor';
import { captureRef, ensureMyRefCode } from '@/lib/referrals';

// Mounted once in the root layout. Two jobs, both fire-and-forget on first paint:
//  1. Writes the stable visitor-id cookie (sot_vid) so subsequent same-origin
//     view-logging requests are attributed to a distinct browser, powering the
//     admin DAU/WAU/MAU analytics.
//  2. Captures a ?ref=<code> share link into the sot_ref cookie and strips the
//     param back out of the URL, so the referrer is credited on this visitor's
//     next finished quiz or daily game (see lib/referrals.js).
// Renders nothing.
export default function VisitorBeacon() {
  useEffect(() => {
    ensureVisitorCookie();
    captureRef();
    // Cache this player's own share code so every board's Share button can stamp
    // it synchronously. No-ops for signed-out visitors and for anyone cached, so
    // it costs at most one request per browser.
    ensureMyRefCode();
  }, []);
  return null;
}
