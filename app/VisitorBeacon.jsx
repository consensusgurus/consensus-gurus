'use client';

import { useEffect } from 'react';
import { ensureVisitorCookie } from '@/lib/visitor';

// Mounted once in the root layout. Writes the stable visitor-id cookie
// (sot_vid) on first paint so subsequent same-origin view-logging requests are
// attributed to a distinct browser, powering the admin DAU/WAU/MAU analytics.
// Renders nothing.
export default function VisitorBeacon() {
  useEffect(() => {
    ensureVisitorCookie();
  }, []);
  return null;
}
