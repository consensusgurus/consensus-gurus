'use client';

// Is this daily page in the Loft format?
//
// Three ways in, checked in this order:
//   1. an explicit prop, which is how /new-daily-preview turns it on for a route
//   2. LOFT_GAMES in lib/loft.js, which is the real rollout switch, one line
//      per game
//   3. ?loft=1, a REVIEW override so any of the 56 dailies can be looked at in
//      the new chrome without shipping a flag change first
//
// The query check runs in an effect rather than during render on purpose. The
// server has no search params, so reading them while rendering would make the
// server and client disagree and React would throw a hydration error. The cost
// is that an overridden page paints the old chrome for one frame. A game turned
// on properly through LOFT_GAMES is known at first render and never flashes.
import { useEffect, useState } from 'react';
import { isLoft } from '@/lib/loft';

export default function useLoft(slug, force = false) {
  const [viaQuery, setViaQuery] = useState(false);
  useEffect(() => {
    try {
      setViaQuery(new URLSearchParams(window.location.search).get('loft') === '1');
    } catch (e) {}
  }, []);
  return force || isLoft(slug) || viaQuery;
}
