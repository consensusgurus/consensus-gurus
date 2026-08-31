// THE STAGE FLAG. Which dailies have been taken off the Loft card and onto the
// dark stage.
//
// Same shape and same reasoning as LOFT_GAMES in lib/loft.js, and for the same
// reason it is a list rather than a date: a client has to be WIRED before it
// can be listed, so the switch has to name the ones that are ready. The Loft
// format itself is on its way out (owner, 2026-08-30: the light stage does not
// need to survive), so this list grows until it holds every daily and lib/loft
// .js can then be retired in one go rather than in eighty.
//
// A ROUTE IS NOT ALWAYS A KEY. Two clients differ: jester lives at /jesters and
// park at /parker. List the REGISTRY KEY here, the same string the client hands
// StageChrome as gameKey, because that is what lib/category-ramp.js looks the
// category up by. lib/loft.js has the same trap written out at greater length.
//
// '?stage=1' is a review path, handled below, for looking at a game before its
// key is added. It is deliberately not a way to opt a player in.
//
// '?stage=0' is the matching way OUT, and it exists for the pilot: a listed
// game can be put back on the Loft for one page load, with no deploy. That is
// what makes a bad report actionable in the minute it arrives ("does it do
// this on the old one too?") instead of after a revert.
// SITEWIDE (owner, 2026-08-31). Every daily is on the stage, so this stopped
// being a list of who is IN and became a short list of who is OUT. It is empty,
// and it is the place to put a single game that has to go back to the Loft in a
// hurry without reverting anything else.
//
// It is a LITERAL list and not liveDailyKeys(), deliberately. Computing the set
// at module load makes it a function of the clock, and the server and the
// client evaluate that at different moments: around Eastern midnight, on the
// day a game retires, the two could disagree about whether a page is a stage
// page, which is a hydration mismatch rather than a cosmetic difference.
export const LOFT_HOLDOUTS = new Set([]);

// Kept under its old name for anything still reading it. There is no longer a
// set of stage games; there is the whole roster, minus any holdout.
export const STAGE_GAMES = LOFT_HOLDOUTS;

export function isStage(key, search) {
  if (!key) return false;
  let q = '';
  try { q = search ? String(search.get ? search.get('stage') : '') : ''; } catch (e) {}
  // '?stage=0' wins over everything: it is the way back to the Loft for one
  // page load, with no deploy, which is what makes a report actionable in the
  // minute it arrives instead of after a revert.
  if (q === '0') return false;
  // A holdout is off the stage unless it is being reviewed with '?stage=1'.
  if (LOFT_HOLDOUTS.has(key)) return q === '1';
  return true;
}
