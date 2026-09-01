// THE QUIZ STAGE. The quiz twin of lib/stage.js.
//
// The eighty dailies went sitewide on the stage on 2026-08-31 and the ~1,200
// quizzes did not move, so the two halves of the site read as two products: a
// daily is a near-black sitting with one line of chrome, and a quiz was still
// the cream magazine page with a masthead over it, a ribbon under that and a
// footer below. This is the switch that moves the quiz half over.
//
// WHY THIS IS A SEPARATE MODULE FROM lib/stage.js. That one answers "is THIS
// GAME on the stage", keyed by a registry key, and a quiz has no registry row
// to be keyed by. The two also roll out on different clocks and will retire on
// different ones. Same shape and same query contract, so there is one mental
// model for both surfaces:
//
//   '?stage=1' is the REVIEW path, for looking at a quiz before the switch is
//   flipped. '?stage=0' is the matching way OUT, checked FIRST so it overrides
//   everything, which is what makes a bad report actionable in the minute it
//   arrives ("does the old page do this too?") rather than after a revert.
//
// WHY THERE IS NO PER-QUIZ LIST, and why the holdout set is keyed by CLIENT.
// A daily is a hand-written client, so LOFT_GAMES and STAGE_GAMES earned their
// per-game lists. Every quiz renders through one of about twenty shared
// clients, so the unit of rollout is the CLIENT: converting QuizClient moves
// roughly a thousand quizzes at once and there is nothing per-id to gate. The
// same reasoning app/useQuizLoft.js wrote down for the Loft rollout, and it
// held.

// THE ROLLOUT SWITCH. False while the conversion is being reviewed, so no
// reader has seen anything change; reachable only at '?stage=1'. Flip it to
// move every converted quiz client over at once.
export const QUIZ_STAGE_ON = false;

// Who is OUT once the switch above is on. Named by CLIENT, not by quiz id, for
// the reason in the header: it is the place to put a single client back on the
// old page in a hurry without reverting anything else. Each client passes its
// own name (the string it hands isQuizStage), so a client that is not listed
// here does not have to know this file exists.
export const QUIZ_STAGE_HOLDOUTS = new Set([]);

/**
 * Is this quiz page on the stage?
 *
 * @param client  the quiz CLIENT's name ('QuizClient', 'TimedMcqClient', ...),
 *                which is the unit of rollout. Anything falsy is treated as an
 *                unconverted client and stays off.
 * @param search  the page's URLSearchParams, or null.
 *
 * THE QUERY IS READ FROM A VALUE THE CALLER ALREADY HAS, never from
 * window.location during render. The server has no search params, so a render
 * that reads the URL makes the server's first paint disagree with the client's
 * and React throws. Every caller on this surface already holds useSearchParams'
 * result for its own reasons, which is why this takes it rather than reading it.
 */
export function isQuizStage(client, search) {
  let q = '';
  try { q = search ? String(search.get ? search.get('stage') : '') : ''; } catch (e) {}
  // The way out wins over everything, including the review flag.
  if (q === '0') return false;
  if (!client) return false;
  // Review: any converted client can be looked at before the switch is flipped.
  if (q === '1') return true;
  if (!QUIZ_STAGE_ON) return false;
  return !QUIZ_STAGE_HOLDOUTS.has(client);
}

// -- THE QUIZ'S ONE ACCENT ---------------------------------------------------
//
// ONE COLOUR FOR EVERY QUIZ (owner, 2026-08-31), and it is deliberately NOT a
// department ramp. A daily's category step earns its keep because a player
// returns to the same nine categories every day and builds an association with
// each; a quiz is usually FOUND rather than returned to, and the sixteen
// departments would have been sixteen colours nobody has time to learn. So the
// quiz half of the site is one identity: this is a quiz, and that is what the
// colour says.
//
// TWO REGISTERS, PUBLISHED TOGETHER, exactly as a daily client publishes its
// category step. An inline style beats a stylesheet, so a root that set
// --stg-acc directly could never be re-themed; the root sets --stg-acc-dk and
// --stg-acc-lt and app/globals.css maps --stg-acc to whichever register is
// showing. Same for the ink that rides ON the accent: --stg-onramp-lt, because
// the light step here is deep enough to carry white while the dark pastel
// carries the near-black.
//
// WHY THIS HUE. Measured against all nine ramp steps before it was chosen. It
// sits in the one genuine gap in the ramp, between Word's sky at 199 degrees
// and Crowd Psychology's violet at 271, so a quiz never wears a daily
// category's colour: 30 degrees clear of the nearest dark step. Contrast, on
// the same standard scripts/verify-category-ramp.mjs holds the ramp to:
//
//   dark  #a5b4fc   ink 8.24:1   ground 9.60:1
//   light #4338ca   ink 7.90:1   ground 6.98:1   hue drift 15 degrees
//
// scripts/verify-quiz-stage.mjs measures all of that rather than asserting it,
// so changing either value fails the build if it lands outside the band.
export const QUIZ_ACC = '#a5b4fc';
export const QUIZ_ACC_LIGHT = '#4338ca';

// The ink that carries ON each step. The near-black is RAMP_INK's value,
// written literally rather than imported, so this module stays free of
// lib/category-ramp.js and its DAILY_GAME_MAP import: a quiz route has no
// business pulling the whole daily registry into its bundle.
export const QUIZ_ON_ACC = '#08222e';
export const QUIZ_ON_ACC_LIGHT = '#ffffff';

/**
 * What a converted quiz client spreads onto its root element. ONE object, so a
 * client cannot publish half of it -- which is exactly how the first dark-only
 * daily batch shipped: the root named the dark step, nothing named the light
 * one, and every game fell through to the single generic accent.
 */
export const QUIZ_ACC_VARS = {
  '--stg-acc-dk': QUIZ_ACC,
  '--stg-acc-lt': QUIZ_ACC_LIGHT,
  '--stg-onramp-lt': QUIZ_ON_ACC_LIGHT,
};
