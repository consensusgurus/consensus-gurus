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
//   circa   a trickier moment to place
//   extra   a trickier story to name
//   carve   7x7 board in nine blocks
//   stet    seven sentences, up to two errors each
//   ping    a trickier, more out-of-the-way city
//   jester  9x9 Jubilee board instead of 8x8
//   sworn   six suspects sworn instead of five
//
// NOT listed (no Sunday variant exists in their banks as of 2026-07-20):
// garble, links, dating, outwit, tuck, alibi, cipher, warmer. Do not add one
// here until its bank actually authors the variant - an unbacked entry would
// promise players a bigger puzzle that never arrives.
export const SUNDAY_EDITION_GAMES = [
  'crux', 'emcee', 'span', 'tally', 'suds', 'circa',
  'extra', 'carve', 'stet', 'ping', 'jester', 'sworn',
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
