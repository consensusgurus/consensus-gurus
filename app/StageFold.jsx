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
// - EXCEPT IN A HELD STATE, WHERE A WHOLE EXTRA SCREEN IS ADDED, at every width
//   (owner, 2026-09-02: "we need to move all of our game overview sections down
//   farther below so that they don't show on end game screen, end game
//   animation, or short version of how to screen"). The rule above puts the
//   prose one scroll from the top of the page, which is right while a reader is
//   playing and wrong the moment the page turns into a surface they are meant
//   to read: the finish curtain, its flood, or the start tile. On the finished
//   Four board the card ended at 966px and the prose began at 900, so it was
//   sitting directly under the verdict; on a collapsed retry panel it was
//   eleven pixels past the fold. In those three states the page has ENDED as
//   far as the reader is concerned, which is exactly why the phone exemption
//   above does not apply to them: the blank band reads as intended there rather
//   than as the page having stopped.
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
      // Measure with the spacer collapsed, so its own height never feeds
      // back into where the section would otherwise start.
      el.style.height = '0px';
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (window.innerWidth > PHONE) h = Math.max(0, Math.round(window.innerHeight - top + 1));
      // The finish card, its flood, and the start tile. One extra viewport, so
      // the prose sits a full screen clear of the surface rather than directly
      // under it. It converges: the next measure collapses the spacer again and
      // reads the same top, so the ResizeObserver settles on one value.
      if (page.querySelector('.stf, .stf-flood, .stg-gate')) h += window.innerHeight;
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
  // NO INLINE HEIGHT ON THE SERVER RENDER. app/globals.css gives .stg-fold a
  // full viewport of height above 760px, so the prose is below the fold from
  // the FIRST PAINT (owner, 2026-09-01: the About section "displays at top for
  // a half second" while the page hydrated and the spacer measured). The
  // measure above then writes the exact height inline, which wins over the
  // stylesheet; a spacer that only shrinks moves nothing a reader can see.
  return <div ref={ref} className="stg-fold" aria-hidden="true" />;
}
