'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// The move that ends an End Game daily lands on the board in the same tick that
// sets the game's status, so the end card used to cover the board before the
// player ever saw what beat them: the engine's fourth disc in Four, the mate in
// Mate, the word the opponent went out on in Babel. This holds the card back for
// a beat while the finished board, winning line and all, stays on screen.
//
// Games call hold() at every path that ends the game and release() when a replay
// starts; the card renders on `!held`. The hold is deliberately short, long
// enough to read the last move and no longer.
export default function useEndHold(ms = 1100) {
  const [held, setHeld] = useState(false);
  const timer = useRef(null);

  const hold = useCallback((delay) => {
    if (timer.current) clearTimeout(timer.current);
    setHeld(true);
    timer.current = setTimeout(() => { timer.current = null; setHeld(false); }, delay == null ? ms : delay);
  }, [ms]);

  const release = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setHeld(false);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { held, hold, release };
}
