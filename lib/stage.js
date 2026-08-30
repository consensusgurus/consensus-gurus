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
export const STAGE_GAMES = new Set([
  'crux',
]);

export function isStage(key, search) {
  if (!key) return false;
  if (STAGE_GAMES.has(key)) return true;
  try {
    if (search && String(search.get ? search.get('stage') : '') === '1') return true;
  } catch (e) {}
  return false;
}
