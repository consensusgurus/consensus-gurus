// The Loft format flag.
//
// Two ways in, both explicit:
//
//   1. A ROUTE can opt in by passing `loft` down (app/new-daily-preview does
//      this), which is how a page shows the format at a URL of its own.
//   2. A SLUG listed here, which is the real rollout switch.
//
// `?loft=1` is a third way, handled in app/useLoft.js, and it is for REVIEW
// only: it lets a game be looked at before its slug is added.
//
// LIVE ON EVERY DAILY (2026-08-14). The list is the exact `slug` each client
// passes to DailyChrome, NOT the directory name and not the registry key: two
// of them differ, `jester` lives at /jesters and `park` at /parker, and keying
// off the wrong one would silently miss those two games.
//
// WHAT A LISTED GAME GETS depends on how far its own client has been taken.
// Every game here gets the shared chrome: no selector ribbon, no stat row, and
// the cap in place of the old title block, all of it from DailyMasthead with no
// per-game code. The navy play stage, the controls inside the card and the
// flip-to-options finish live in the game client, so today only Crux has them.
// The rest gain those as each client is wired.
export const LOFT_GAMES = new Set([
  'alibi', 'anon', 'axiom', 'babel', 'barter', 'blitz',
  'blocks', 'bracket', 'cages', 'carve', 'chain', 'check',
  'chomp', 'cipher', 'circa', 'crunch', 'crux', 'dating',
  'deep', 'defend', 'docket', 'emcee', 'etch', 'extra',
  'feud', 'fib', 'four', 'garble', 'glyph', 'hands',
  'hearsay', 'hedge', 'jester', 'links', 'listed', 'lode',
  'mate', 'outrank', 'outwit', 'park', 'paths', 'ping',
  'pricer', 'quilt', 'redact', 'rung', 'sando', 'shards',
  'span', 'stands', 'stet', 'strata', 'streak', 'suds',
  'suffice', 'sweep', 'sworn', 'taire', 'tally', 'tuck',
  'turn', 'venn', 'warmer',
]);

export function isLoft(slug) {
  return !!slug && LOFT_GAMES.has(slug);
}
