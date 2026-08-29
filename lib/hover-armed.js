// useHoverStale — kill the highlight a resting mouse leaves on the box a
// player just answered with (owner, 2026-08-29).
//
// Every multiple-choice daily draws its four answers as buttons keyed by
// POSITION, so the box under the pointer when a question is answered is the
// same DOM node as the box under the pointer when the NEXT question paints.
// The pointer has not moved, so :hover is still true, and the choice sitting in
// that position comes up already outlined. It reads as the game having
// pre-selected an answer, which is the one thing an answer box must never look
// like.
//
// FOCUS IS NOT THE CAUSE and needs no handling here, which is worth recording
// because it is the obvious suspect: every one of these clients disables its
// choices for the reveal, and disabling the focused element drops focus to the
// body. Verified live on Deep, 2026-08-29 (document.activeElement was BODY on
// the next question). Do not add a blur() call on the strength of the symptom.
//
// The fix is to suppress hover until the pointer actually MOVES again. It is
// also the standard fix for touch browsers, where a tap leaves :hover stuck on
// the tapped element until something else is tapped, so one mechanism covers
// both. Returns TRUE while hover styling should be off: hang `nohov` on the
// choice grid and scope the grid's own hover rule with :not(.nohov), so the
// suppression lives in the same stylesheet as the rule it suppresses.

import { useEffect, useState } from 'react';

export function useHoverStale(key) {
  // Starts stale: a first paint is exactly the case where the pointer is
  // wherever it happened to be rather than somewhere the player put it.
  const [stale, setStale] = useState(true);

  useEffect(() => { setStale(true); }, [key]);

  useEffect(() => {
    if (!stale || typeof window === 'undefined') return undefined;
    const clear = () => setStale(false);
    // MOVE ONLY. A pointerdown listener would re-arm hover on the very click
    // that advances the question, which is the flash this exists to remove.
    // mousemove is listened for alongside pointermove for the browsers that
    // fire only the older event.
    window.addEventListener('pointermove', clear, { passive: true });
    window.addEventListener('mousemove', clear, { passive: true });
    return () => {
      window.removeEventListener('pointermove', clear);
      window.removeEventListener('mousemove', clear);
    };
  }, [stale]);

  return stale;
}

export default useHoverStale;
