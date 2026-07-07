'use client';
import { useEffect } from 'react';

// Client-side hop from /quiz/<crux entry> to /crux, preserving query params
// (?duel=, ?ch=, ...) so duel and challenge flows survive the jump. This must
// stay client-side: reading searchParams in the server page would force every
// ISR-cached /quiz/[id] page dynamic.
export default function CruxRedirect({ num }) {
  useEffect(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      if (num) usp.set('p', String(num));
      const q = usp.toString();
      window.location.replace(q ? `/crux?${q}` : '/crux');
    } catch (e) {
      window.location.replace('/crux');
    }
  }, [num]);
  return null;
}
