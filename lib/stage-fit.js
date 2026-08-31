'use client';
// HOW MUCH ROOM THE BOARD ACTUALLY HAS.
//
// A stage board is sized to the fold with a clamp like
//   --cs: min(max, colWidth, (100vh - ROOM) / rows)
// and ROOM is everything on the page that is NOT the board: the cap, whatever
// sits above the board, and whatever sits under it.
//
// ROOM WAS A HARDCODED NUMBER AND IT WAS WRONG BY 122px. Crux guessed 330 and
// measures 452, so the board was sized for a viewport a quarter taller than the
// one it had and ran off the bottom of the screen. A guess cannot be right for
// long anyway: the strip under a Crux board grows a row when you spend a guess,
// and the category cards above it are as tall as the longest category name.
//
// So measure it, the way --dh-fit on the home console already measures the
// board window rather than summing the console above it.
//
// NO FEEDBACK LOOP. room = (board top - page top) + (page bottom - board
// bottom). Shrinking the board moves neither term: the chrome above keeps its
// position and the chrome below keeps its height, so the page bottom rises by
// exactly as much as the board bottom does. The observer fires once more after
// the board resizes, recomputes the same number, and stops.
import { useLayoutEffect, useState } from 'react';

export function useStageRoom(boardRef, on) {
  const [room, setRoom] = useState(null);
  useLayoutEffect(() => {
    if (!on) return undefined;
    let raf = 0;
    let last = -1;
    const measure = () => {
      const b = boardRef.current;
      if (!b) return;
      const page = b.closest('.stage-page');
      if (!page) return;
      const pr = page.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (!br.height) return;
      const next = Math.round((br.top - pr.top) + (pr.bottom - br.bottom));
      // A 2px deadband, because a sub-pixel wobble in the chrome should not
      // cost a re-render on every observer tick.
      if (next > 0 && Math.abs(next - last) > 2) { last = next; setRoom(next); }
    };
    const kick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(kick);
    const page = boardRef.current && boardRef.current.closest('.stage-page');
    if (page) ro.observe(page);
    window.addEventListener('resize', kick);
    // Two late passes: web fonts land after first paint and change the height
    // of every label above the board.
    const t1 = setTimeout(measure, 250);
    const t2 = setTimeout(measure, 1200);
    measure();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('resize', kick); ro.disconnect();
    };
  }, [boardRef, on]);
  return room;
}
