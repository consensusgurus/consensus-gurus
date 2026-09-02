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
// NO FEEDBACK LOOP, BUT ONLY IF THE BOTTOM IS THE CONTENT'S. room = (board top
// - page top) + (content bottom - board bottom). Shrinking the board moves
// neither term: the chrome above keeps its position and the chrome below keeps
// its height, so the content bottom rises by exactly as much as the board
// bottom does. The observer fires once more, recomputes the same number, stops.
//
// CONTENT bottom, never the page's own box. .stage-page carries minHeight:100vh,
// so once the content fits, the page's bottom edge stops moving and every pixel
// of slack beneath the content gets counted as chrome. Then room grows, the
// board shrinks, the slack grows, and it runs away until the cell floor catches
// it. That is not hypothetical: it cost Crux six pixels a cell the first time
// the board became short enough to leave any slack at all, and it hid until
// then because a board exactly as tall as the viewport is the one case where
// the two measurements agree.
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
      // The lowest edge anything on the page actually reaches. Direct children
      // are enough: the content is nested inside them, so their boxes already
      // contain it.
      let contentBottom = br.bottom;
      for (const c of page.children) {
        // The fold (app/StageFold.jsx) and everything under it are BELOW the
        // first screen by construction, so they are not chrome the board has
        // to leave room for. Counting them would size the board for the gap
        // the fold exists to fill.
        if (c.classList && c.classList.contains('stg-fold')) break;
        const r = c.getBoundingClientRect();
        if (r.height && r.bottom > contentBottom) contentBottom = r.bottom;
      }
      const next = Math.round((br.top - pr.top) + (contentBottom - br.bottom));
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
