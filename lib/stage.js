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
// PILOT, five games (owner, 2026-08-31). All 79 dailies are converted and
// reviewed, but the whole roster is not flipped at once: these five go to real
// players first so a day of real traffic can find what review did not.
//
// They were chosen for COVERAGE, not for volume. Traffic is thin and even
// (659 plays across 78 games on the day of the pilot, the busiest at 32), so
// no single pick moves the needle and there is nothing to gain by stacking the
// set with the top of the table. What matters is that between them they
// exercise five different categories on the ramp and five different ways of
// answering:
//
//   crux    Word        a grid with a letter keyboard, and the gutter ladder
//   atlas   Geography   a question runner, no board at all
//   suds    Numbers     a grid with a number pad
//   four    End Game    a board you drop pieces onto, AND the curtain ending,
//                       the attempts ranking and the no-loss-notice rule
//   alibi   Logic       a grid of marks you toggle, and a long text prompt
//
// A stage is not done when its CHROME is done: each of these has had its BOARD
// converted too, which is what the rest of the roster is waiting on. Add a key
// here only once that game's board has had its own pass.
export const STAGE_GAMES = new Set(['crux', 'atlas', 'suds', 'four', 'alibi']);

export function isStage(key, search) {
  if (!key) return false;
  let q = '';
  try { q = search ? String(search.get ? search.get('stage') : '') : ''; } catch (e) {}
  // The opt-OUT is checked first, so it can override a listed game.
  if (q === '0') return false;
  if (STAGE_GAMES.has(key)) return true;
  return q === '1';
}
