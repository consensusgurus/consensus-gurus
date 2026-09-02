'use client';

// THE FOLD ON A GAME PAGE (owner, 2026-09-01: "on every game page, we need our
// game descriptions to be out of the view of the desktop monitor. gameboard +
// report an issue + how to should be the only things in view").
//
// Every daily carries an "About <Game>" section under its board for search
// (dailies-seo wiring, same day), and on the stage it is VISIBLE, which is the
// whole point of it. On a desktop monitor a short board (Four, Mate, Circa)
// leaves the prose sitting in the first screen, under the chips, where it reads
// as part of the game. This spacer sits directly above that section and grows
// to exactly the height that puts the section's top edge at the bottom of the
// viewport, so the first screen holds the board, the chips and nothing else,
// and the prose is one scroll away. It is zero when the content above it is
// already taller than the viewport (a tall board, or the finished card), so it
// never adds a gap to a page that has none to fill.
//
// - MEASURED, never a constant, for the same reason lib/stage-fit.js measures
//   the board's room: the height of everything above is different on every
//   game and changes as the game is played (a strip gains a row, the finish
//   card mounts). Re-measured on resize and whenever the page resizes.
// - PHONES ARE LEFT ALONE. Below 761px the board already fills the screen and a
//   blank band under a short board would read as the page having ended.
// - NOT a display:none and not a visibility trick: the prose stays in the DOM,
//   painted, crawlable, exactly as the SEO fix needs it.
// - lib/stage-fit.js stops counting page children at this element, so the
//   spacer and everything under it never enter the board's room. Without that
//   the fold would count as chrome and the board would shrink to make room for
//   the gap it is meant to fill.
// - Off the stage (no .stage-page ancestor) it renders at zero and does nothing.

import { useEffect, useRef } from 'react';

const PHONE = 760;

export default function StageFold() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const page = el.closest('.stage-page');
    if (!page) return undefined;
    let raf = 0;
    const measure = () => {
      let h = 0;
      if (window.innerWidth > PHONE) {
        // Measure with the spacer collapsed, so its own height never feeds
        // back into where the section would otherwise start.
        el.style.height = '0px';
        const top = el.getBoundingClientRect().top + window.scrollY;
        h = Math.max(0, Math.round(window.innerHeight - top + 1));
      }
      el.style.height = `${h}px`;
    };
    const kick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    const ro = new ResizeObserver(kick);
    ro.observe(page);
    window.addEventListener('resize', kick);
    const t1 = setTimeout(measure, 250);
    const t2 = setTimeout(measure, 1200);
    measure();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2);
      window.removeEventListener('resize', kick); ro.disconnect();
    };
  }, []);
  return <div ref={ref} className="stg-fold" aria-hidden="true" style={{ height: 0 }} />;
}
