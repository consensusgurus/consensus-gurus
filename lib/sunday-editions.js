// Sunday Editions - the single registry of which daily games run a distinct,
// bigger/harder puzzle on Sundays (added 2026-07-20, owner ruling).
//
// TWO MECHANISMS, answering different questions:
//
//   1. `sunday: true` ON THE PUZZLE OBJECT is the source of truth for a
//      SPECIFIC drop. Every game client badges off `PUZZLE.sunday`, and the
//      /daily archive tags off it too, so a past Sunday in the archive stays
//      marked correctly regardless of what day it is now. Never infer a Sunday
//      Edition from board size, guess count, or any other proxy - Crux used to
//      key off `guesses === 27` and that heuristic was retired here.
//
//   2. SUNDAY_EDITION_GAMES (this file) answers "does this GAME have a Sunday
//      Edition at all", which the hub surfaces need because they render from a
//      static game registry and never load puzzle data. Combined with
//      isSundayET() it drives the "Sun" chip on the strip and the games grid.
//
// Keep the two in sync: a game listed here MUST set `sunday: true` on its
// Sunday puzzles, and a game that sets the flag MUST be listed here.

// The 12 dailies with a genuine Sunday variant, and what changes:
//   crux    12 hidden words instead of 8 (27 guesses)
//   emcee   7x7 grid instead of the weekday mini
//   span    a via/avoid rule constrains the route
//   tally   6x6 board instead of 5x5
//   suds    harder grid, fewer givens
//   extra   a trickier story to name
//   carve   7x7 board in nine blocks
//   stet    seven sentences, up to two errors each
//   ping    a trickier, more out-of-the-way city
//   jester  9x9 Jubilee board instead of 8x8
//   sworn   six suspects sworn instead of five
//   garble  every answer is six letters instead of five (from 2026-07-26)
//   dating  six events to order instead of five (from 2026-07-26)
//   cipher  three addends stacked instead of two (from 2026-07-26)
//   outwit  six prompts instead of five, the extra a second Rare Bird (from 2026-07-26)
//   tuck    a 15-letter rack instead of 14 (from 2026-07-26)
//   alibi   five suspects instead of four, 15 facts to confirm (from 2026-07-26)
//   warmer  a rarer secret word, deeper in the frequency-ordered vocab (from 2026-07-26)
//   links   four cross-category collisions instead of two (from 2026-07-26)
//   outrank seven items on the slate instead of six (from 2026-07-26)
//   axiom   28 tiles and seven candidate rules instead of 24 and five
//   hearsay a third voice joins, on a longer chain of statements
//   venn    fifteen words instead of twelve, and two region counts withheld
//   stands  a sixth club, so fifteen matches to rebuild instead of ten
//   bracket a field of 32 instead of 16, so 31 picks and five rounds
//   mate    a mate in three instead of a mate in two
//   four    a forced win in five instead of a win in four
//   park    (Unpark) a perfect line in the thirties instead of the high teens
//   check   a sweep in four moves instead of three
//   rung    a ladder of fifteen rungs or more instead of ten to twelve
//   crunch  a target that needs all six numbers instead of four or five
//   fib     a 6x6 grid instead of 5x5, a whole extra rank of deduction to get
//           through before the lying sign can be pinned down
//   taire   one free cell instead of two on the full twenty-card deal, which
//           is a far bigger difference than it sounds, and a perfect line that
//           runs half again as long as a weekday
//
// Circa was RETIRED 2026-07-20 (archive stays playable); it no longer runs
// Sunday drops and is off this list.
//
// NOT listed (no Sunday variant exists in its bank): links.
// Do not add one
// here until its bank actually authors the variant - an unbacked entry would
// promise players a bigger puzzle that never arrives.
export const SUNDAY_EDITION_GAMES = [
  'crux', 'emcee', 'span', 'tally', 'suds',
  'extra', 'carve', 'stet', 'ping', 'jester', 'sworn',
  'garble', 'dating', 'cipher', 'outwit', 'tuck', 'alibi', 'warmer', 'links', 'outrank', 'shards',
  'axiom', 'hearsay', 'venn', 'stands', 'bracket', 'lode', 'etch', 'hedge',
  'listed', 'mate', 'four', 'park', 'check', 'rung', 'crunch', 'taire', 'fib',
];

const SET = new Set(SUNDAY_EDITION_GAMES);

// The one reader-facing wording. Every badge leads with this; a game may append
// a short detail after a middot (e.g. "Sunday Edition - 6x6"). Never invent a
// different phrase for the label itself.
export const SUNDAY_LABEL = 'Sunday Edition';
export const SUNDAY_SHORT = 'Sun';

export function hasSundayEdition(key) {
  return SET.has(key);
}

// Is it Sunday in Eastern time? Puzzles roll at midnight ET, so ET is the only
// correct clock here - a player in Tokyo or London still gets the ET day's
// puzzle. Falls back to the local weekday if the runtime lacks timezone data.
export function isSundayET(date = new Date()) {
  try {
    return date.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short' }).startsWith('Sun');
  } catch (e) {
    return date.getDay() === 0;
  }
}

// Convenience for the hub surfaces: show the chip only when BOTH the game runs
// a Sunday Edition and today (ET) is Sunday.
export function showSundayChip(key, date) {
  return hasSundayEdition(key) && isSundayET(date);
}
