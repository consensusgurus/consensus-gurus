'use client';

// DailyChrome — the shared header frame for a daily game page (owner-approved
// mockup, 2026-08-04, "Direction C"). ONE component so all 45 games can share
// the same chrome instead of 45 near-copies of a bare text strip.
//
// It replaces DailyTopNav (the quiet "Puzzles & Quizzes / Top 10 Lists" line)
// with the SAME header the home page carries:
//
//   1. #1e3a8a masthead  ─┐ both from QuizCommandHeader variant="inner", via
//   2. #16307a stat bar  ─┘ QuizNavHeader, already in normal flow
//   3. #eef3ff slate rail  — DailySlateRail
//
// NOTHING IS PINNED (owner rule, 2026-08-04). No position:fixed, no sticky:
// every band scrolls away, because the board owning the viewport matters more
// than chrome staying put. QuizNavHeader's bar is the `inner` variant, which
// is explicitly in flow, and the rail is a plain block.
//
// NO COLLAPSE ON START (owner rule, 2026-08-05). This used to shrink to a one
// line navy strip once the clock started: the Mind Loft masthead was replaced
// by the GAME NAME, which then sat directly above the page's own game title,
// printing the name twice. The collapse existed to clear the fold for a tall
// board, but since nothing here is pinned the player can simply scroll past
// it, so the trade was not worth losing the brand and duplicating the title.
// The full header now renders at every stage of a game.
//
// Callers still pass `name`, `collapsed` and `stats`; all three are accepted
// and ignored rather than removed, so the 45 game clients need no edit. If the
// collapse is ever wanted back, restore it here, not at the call sites.
//
// Placement: render it OUTSIDE the page's max-width wrapper, immediately after
// <Grain />, so the navy bands run full-bleed the way they do on the homepage.

import React from 'react';
import QuizNavHeader from './quizzes/QuizNavHeader';
import DailySlateRail from './DailySlateRail';

export default function DailyChrome({ slug }) {
  return (
    <>
      {/* STACKING: the wrapper caps the whole header group at z-index 5. The
          shared navy bar carries z-index 90 for the quiz surfaces, which on a
          daily page paints OVER the end-of-game card (its backdrop is 85) and
          over the help and install modals (70 and 90). The wrapper makes its
          own stacking context, so those numbers stay contained and every
          overlay on the page lands above the header, while 5 still clears the
          fixed Grain wash at z-index 1 and the page column at 2. Do not raise
          this without checking dec-backdrop in DailyEndCard. */}
      {/* THE DOME STRIP (owner-approved exception to the no-pin rule above,
          2026-08-08). Three pixels of brand navy pinned to the top of the
          viewport, painted UNDER the header at z-index 4: while the header is
          up there it covers the strip completely, and once the page scrolls the
          strip is all that stays. margin-bottom cancels its own height, so it
          costs the board 0px and pushes nothing down.

          It exists for Safari on iPhone, not for the reader. Safari tints the
          strip behind the status bar (the "dome") from the fixed or sticky
          element topping the viewport, and falls back to the page background
          when a page has none. The homepage dome was navy purely because its
          header is position: sticky; every daily game page came out white
          because DailyChrome's header is deliberately in normal flow. Four
          less invasive fixes failed first: the safe-area band in globals.css on
          a bare env() (reports 0 in ordinary Safari), the same band with a 4px
          floor, html's canvas colour, and body's own background. That last one
          DID colour the dome, but Safari tints its bottom bar from the same
          value, which turned the translucent address bar solid navy, so it was
          reverted.

          STICKY, NOT FIXED, and that is why DailyChrome returns a fragment
          rather than one wrapper. A fixed element is positioned against the
          layout viewport, which iOS shifts out from under it while the keyboard
          is open: as a fixed strip this drew a navy line straight across the
          board mid-word. Sticky follows the layout scroll and stays glued to
          the top edge. It only works from OUTSIDE .dch-wrap, because a sticky
          element cannot leave its containing block and .dch-wrap is only as
          tall as the header, so it would unstick the moment the chrome scrolled
          past. Out here its containing block is the page root every game client
          renders (minHeight: 100vh), so it holds for the whole page. If a new
          game client wraps DailyChrome in something short, the strip will
          unstick there. */}
      <style>{'.dch-wrap{position:relative;z-index:5;}.dch-dome{position:sticky;top:0;height:3px;margin-bottom:-3px;background:var(--accent);z-index:4;}'}</style>
      <div className="dch-dome" aria-hidden="true" />
      <div className="dch-wrap">
        <QuizNavHeader />
        <DailySlateRail current={slug} />
      </div>
    </>
  );
}
