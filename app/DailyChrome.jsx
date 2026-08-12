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
//
// DO NOT re-add a pinned navy strip here to colour the iPhone status-bar dome
// (tried 2026-08-08 as .dch-dome, 3px, fixed then sticky, and removed). It did
// not work: with body white and the strip in place the dome still came out
// white, so Safari was never sampling it, and it drew a stray navy line across
// the board because iOS shifts the layout viewport out from under pinned
// elements while the keyboard is open. The dome is coloured by
// body { background: var(--accent) } in app/globals.css, which is the only
// thing that has ever moved it. See the note on that rule.

import React from 'react';
import QuizNavHeader from './quizzes/QuizNavHeader';
import DailySlateRail from './DailySlateRail';
import { isLoft } from '@/lib/loft';

export default function DailyChrome({ slug, loft: loftProp = false }) {
  // LOFT FORMAT: drops the selector ribbon (choosing another daily belongs
  // below the board, not above it) and hides the stat row, whose rank / IQ /
  // played figures already live on the home page and the end card. Opt in by
  // route (the preview passes `loft`) or by slug once a game ships on it.
  // Every other page takes the untouched branch.
  const loft = loftProp || isLoft(slug);
  return (
    <div className={loft ? 'dch-wrap dch-loft' : 'dch-wrap'}>
      {/* STACKING: the wrapper caps the whole header group at z-index 5. The
          shared navy bar carries z-index 90 for the quiz surfaces, which on a
          daily page paints OVER the end-of-game card (its backdrop is 85) and
          over the help and install modals (70 and 90). The wrapper makes its
          own stacking context, so those numbers stay contained and every
          overlay on the page lands above the header, while 5 still clears the
          fixed Grain wash at z-index 1 and the page column at 2. Do not raise
          this without checking dec-backdrop in DailyEndCard. */}
      <style>{'.dch-wrap{position:relative;z-index:5;}' + (loft ? '.dch-loft .qchm-r2{display:none}' : '')}</style>
      <QuizNavHeader />
      {!loft && <DailySlateRail current={slug} />}
    </div>
  );
}
