'use client';

import { useEffect, useRef, useState } from 'react';

// CLEARANCE UNDER A PINNED RAIL, AS A SPACER RATHER THAN PADDING.
//
// Three dailies pin their own keys or dock to the bottom of the viewport rather
// than raising the OS keyboard, which would resize the viewport under the board:
// Anon, Cipher and Garble. A pinned rail sits OVER the page, so the page has to
// reserve its height at the foot or the rail covers the last thing the player
// needs to reach.
//
// All three reserved it as padding-bottom on their page column, and on a Loft
// page that reservation is silently thrown away. LoftCap zeroes the column's
// padding so the navy stage can supply its own spacing:
//
//     .loft-page > [class$="-wrap"]:not(.dch-wrap){padding-top:0!important;padding-bottom:0!important}
//
// which outranks the inline style, so the computed padding-bottom is 0 and the
// rail eats the foot of the board. Measured on the live page 2026-08-15 after the
// owner reported Anon: the passage ran under the keys and the last row of the
// bank could not be scrolled to at all. Every daily is on Loft now, so all three
// were broken, and the padding approach cannot be repaired in place, since the
// rule that kills it is deliberate and carries !important.
//
// So the clearance is an ELEMENT. No stylesheet can zero an element's height, it
// behaves identically on a Loft page and off one, and a fourth game that pins a
// rail gets it right by importing this rather than by rediscovering the trap.
//
// AND THE HEIGHT IS MEASURED, NEVER SUMMED. Anon reserved 250px for a rail that
// measures 241, Cipher 232 and Garble 185, all hand-totalled from key rows and
// dock padding, and every one of those drifts the moment a row is added or a
// padding changes, silently and in the direction that hides the board. This is
// the same reasoning as --dh-fit on the home board: read it off the element.
// `fallback` covers the first paint, before the observer has reported.
//
// Usage:
//   const rail = useRailClearance(railIsUp, 250);
//   ... <div ref={rail.ref} className="the-pinned-rail"> ...
//   ... {rail.height > 0 && <div aria-hidden style={{ height: rail.height }} />}
// with the spacer as the LAST child of the page column.
export default function useRailClearance(active, fallback = 0) {
  const ref = useRef(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!active || !el) { setMeasured(0); return undefined; }
    const read = () => {
      const el2 = ref.current;
      if (el2) setMeasured(Math.ceil(el2.getBoundingClientRect().height));
    };
    read();
    let ro = null;
    // The rail changes height in play: Anon's dock swaps the strip it shows and
    // Cipher's letter strip rewraps, so a one-shot read goes stale.
    try { ro = new ResizeObserver(read); ro.observe(el); } catch (e) {}
    window.addEventListener('resize', read);
    window.addEventListener('orientationchange', read);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', read);
      window.removeEventListener('orientationchange', read);
    };
  }, [active]);

  return { ref, height: active ? (measured || fallback) : 0 };
}
