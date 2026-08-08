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

// OPT-IN SLIM CHROME (2026-08-08). `compact` is off by default, so every game
// that does not ask for it renders through the identical code path it always
// has. Alibi is the only caller today. Below the phone breakpoint it folds the
// slate rail and the player stat bar away, which is about 108px, and on a game
// page those 108px are the difference between seeing your whole board and
// scrolling it. Desktop is untouched at any setting: the media query is the
// only place compact does anything.
//
// What it costs: on a phone the slate rail is how you hop to the next game and
// the stat bar is where your rank sits. The Today pill in the top band still
// gets you back to the slate. If this sticks, the mockup replaces both with a
// single 10/51 chip in the top band rather than just hiding them.
export default function DailyChrome({ slug, compact = false }) {
  return (
    <div className={`dch-wrap${compact ? ' dch-compact' : ''}`}>
      {/* STACKING: the wrapper caps the whole header group at z-index 5. The
          shared navy bar carries z-index 90 for the quiz surfaces, which on a
          daily page paints OVER the end-of-game card (its backdrop is 85) and
          over the help and install modals (70 and 90). The wrapper makes its
          own stacking context, so those numbers stay contained and every
          overlay on the page lands above the header, while 5 still clears the
          fixed Grain wash at z-index 1 and the page column at 2. Do not raise
          this without checking dec-backdrop in DailyEndCard. */}
      <style>{`.dch-wrap{position:relative;z-index:5;}
        @media(max-width:899px){
          .dch-compact .dsr{display:none;}
          .dch-compact .qchm-r2{display:none;}
        }`}</style>
      <QuizNavHeader />
      <DailySlateRail current={slug} />
    </div>
  );
}
