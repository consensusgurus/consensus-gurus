// EXTENSION IS REQUIRED on this relative import, for the same reason
// lib/daily-five.js carries it: scripts/verify-circuits.mjs imports this file
// directly under node, where ESM does not do extension guessing. Do not drop it.
import { DAILY_GAME_MAP, isRetiredDaily, etTodayISO } from './daily-games.js';
import { FIVE_NAME, fiveFor, FIVE_PARAM } from './daily-five.js';

// CIRCUITS — one family, fifteen members (owner, 2026-08-18).
//
// A circuit is five dailies played as one sitting, scored on the COMBINED
// placement across them, exactly like the Daily Five. The Five is circuit #1
// and it is the MARQUEE: gold, always first, always the default selection.
// The other fourteen are SKILL circuits.
//
// THE DAILY FIVE DOES NOT CHANGE. Its roster, selection rules (one game from
// each of five different categories, Word + Numbers + Logic plus two rotating
// in proportion to pool size), ordering (shortest median first), time budget,
// seven-day repeat gap, hand-banked review and scripts/verify-daily-five.mjs
// gate are all untouched and all still live in lib/daily-five.js. This module
// does not import its roster, generate it, or wrap it: it names it as the
// marquee and otherwise leaves it alone. The only thing that changed is that
// the console band now has a way to reach the other fourteen.
//
// WHY THE TWO KINDS DIFFER, and why that is fine:
//
//   The MARQUEE is a hand-banked DAILY roster — a different five every day,
//   chosen for spread across categories and reviewed before it ships. It can
//   run out (banked through 2026-09-13) and it has to be extended.
//
//   A SKILL circuit is a FIXED roster — the same five games every day, chosen
//   for what they exercise rather than for spread. There is nothing to bank,
//   nothing to review and nothing to expire: the games change because their
//   puzzles change, not because the roster does. That is the whole reason the
//   fourteen cost no maintenance.
//
// NO NEW SCORING, NO NEW STORAGE. Every circuit is served by
// /api/quiz/daily-combined?circuit=<id>, which is the same route with a
// narrowed slate and bestN 5, exactly as ?five=1 already works. One comparator,
// one table. See the block comment in that route.
//
// EXCLUSIVE AND EXHAUSTIVE. Every eligible daily sits in EXACTLY ONE skill
// circuit, which is what makes "finish all fourteen" mean "play everything" and
// what stops a game paying into two skill boards at once. The count comes out
// at 63 games over 14 circuits, SEVEN OF FIVE AND SEVEN OF FOUR, which is the
// only clean split of 63 into 14 — and it is worth insisting on, because a
// circuit's whole score is 15 points per game and a three-game circuit would
// top out at 45 against everybody else's 75. Against the 65 in the registry:
//
//   - Circa retired 2026-07-20, so it is not in a circuit. Retirement is
//     handled at READ time (circuitKeysFor filters through isRetiredDaily), so
//     Extra can stay in Recall and simply drops out of it on 2026-09-29,
//     leaving a four. Never assume a circuit returns exactly five.
//   - Pricer is excluded on purpose, the same reason it is out of the Daily
//     Five: it is pulled from the server slate (GAME_PUZZLES in
//     lib/daily-slate), so it has no board, no field and no points. A run
//     cannot contain a game the scoring engine cannot see.
//
// ORDER IS THE MARQUEE'S RULE, applied to a fixed roster: SHORTEST FIRST,
// LONGEST LAST, by the measured top-10 median clock. A circuit opens with
// something you finish in half a minute and closes with the one that takes real
// time, so a player who has banked four games has a reason to start the fifth.
// The medians are the dated snapshot in scripts/verify-daily-five.mjs (measured
// 2026-08-17); the ORDER derived from them is baked into the arrays below
// rather than computed here, because a snapshot is a measurement with a date on
// it and does not belong in a library. scripts/verify-circuits.mjs re-derives
// the ascent from that same snapshot and fails a roster that is out of order.
//
// These fourteen REPLACE the fourteen ad-hoc groups that used to live inline in
// app/DailyStrip.jsx, which ran from 2 to 7 games, left eleven games in no
// circuit at all and put two games in two. DailyStrip now derives its filter
// strip from CIRCUIT_NAME_LISTS below, so the thing you filter by and the thing
// you can run are the same fourteen. Renamed on the way: Anagrams became
// Wordplay (it was never only anagrams), Chess and Board Games merged into
// Chess & Board, History became Recall (it holds the whole trivia recall pool,
// not only dated events), and Survival was dissolved into Arcade.
//
// ARCADE CROSSES THREE CATEGORIES ON PURPOSE, and it is the clearest case of
// why this axis exists at all. The registry's Arcade CATEGORY holds exactly two
// games, Sweep and Blocks. That is not a circuit, it is half of one, and a
// two-game circuit would top out at 30 points against everybody else's 75. What
// the five games in it share is not a category but a SHAPE: one life, a running
// clock, and a score you are chasing. Blitz is filed under Numbers and Streak
// and Deep under Trivia, and all three are exactly that shape. A category says
// what a game IS; a circuit says what playing it feels like. The same licence is
// what lets Spatial reach into Geography and Ranking into Crowd Psychology.

// The marquee's id. It is the ONLY id that does not name a fixed roster, and
// every consumer branches on it rather than on a name.
export const MARQUEE_ID = 'five';
export const CIRCUIT_PARAM = 'circuit';

// Each entry: { id, name, blurb, keys, trophy } with keys IN RUN ORDER,
// shortest first. The trailing comment is that game's measured top-10 median in
// seconds, so a reviewer can see the ramp without re-deriving it; the one after
// the roster is the circuit's TOTAL, which is what sets its trophy tier.
//
// `trophy` is the metadata for that circuit's entry in the trophy case. It
// lives here, beside the roster it is earned by, but the trophy ROWS are listed
// literally in lib/trophy-defs.js, which is client-safe and deliberately has no
// data imports. scripts/verify-circuits.mjs asserts the two agree 1:1, so they
// cannot drift even though neither imports the other.
//
// TIER IS THE CIRCUIT'S LENGTH, not a guess at difficulty: bronze under 6
// minutes of top-10 clock, silver to 20, gold beyond. Chess & Board is four
// games totalling under two minutes and Crosswords is five totalling
// forty-seven, and a trophy case that called those the same thing would be
// lying about which one is the achievement.
export const CIRCUITS = [
  {
    id: 'crosswords',
    name: 'Crosswords',
    blurb: 'Every crossword on the site, the mini first and the clueless ones last.',
    keys: ['emcee', 'shards', 'glyph', 'crux', 'anon'],          // 35/304/370/1031/1106 = 2846
    trophy: { name: 'Fully Crossed', tier: 'gold', icon: 'Grid3x3' },
  },
  {
    id: 'word-building',
    name: 'Word Building',
    blurb: 'Build the highest-scoring words you can out of a fixed set of letters.',
    keys: ['babel', 'tuck', 'barter', 'rung', 'lode'],           // 201/201/202/360/614 = 1578
    trophy: { name: 'Master Builder', tier: 'gold', icon: 'Hammer' },
  },
  {
    id: 'wordplay',
    name: 'Wordplay',
    blurb: 'Scrambles, hidden errors and words you have to close in on.',
    keys: ['garble', 'stet', 'strata', 'warmer'],                // 51/57/189/518 = 815
    trophy: { name: 'Wordsmith', tier: 'silver', icon: 'Feather' },
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    blurb: 'Every sudoku on the site, easiest grid first and the sandwich last.',
    keys: ['sixes', 'cages', 'suds', 'quilt', 'sando'],          // 144/270/482/699/1171 = 2766
    trophy: { name: 'Grid Locked', tier: 'gold', icon: 'Grid2x2' },
  },
  {
    id: 'mental-math',
    name: 'Mental Math',
    blurb: 'Arithmetic under a clock, from quick sums to a full cryptarithm.',
    keys: ['crunch', 'carve', 'tally', 'cipher'],                // 63/111/337/455 = 966
    trophy: { name: 'Quick Reckoner', tier: 'silver', icon: 'Calculator' },
  },
  {
    id: 'deduction',
    name: 'Deduction',
    blurb: 'Testimony, alibis and case files that narrow to exactly one answer.',
    keys: ['sworn', 'hearsay', 'suffice', 'docket', 'alibi'],    // 54/156/172/221/232 = 835
    trophy: { name: 'Case Closed', tier: 'silver', icon: 'Search' },
  },
  {
    id: 'pencil',
    name: 'Pencil Puzzles',
    blurb: 'Loops, pictures and seating plans drawn out of pure constraint.',
    keys: ['etch', 'jester', 'hedge', 'paths', 'fib'],           // 58/89/93/111/451 = 802
    trophy: { name: 'Sharpened', tier: 'silver', icon: 'PenTool' },
  },
  {
    id: 'spatial',
    name: 'Spatial Puzzles',
    blurb: 'Routes, shapes and places, on a board and on the map.',
    keys: ['chomp', 'span', 'park', 'ping', 'plot'],             // 34/53/61/69/93 = 310
    trophy: { name: 'Way Finder', tier: 'bronze', icon: 'Compass' },
  },
  {
    id: 'sorting',
    name: 'Sorting',
    blurb: 'Put things in the right group, the right set, or the right order.',
    keys: ['links', 'axiom', 'venn', 'stands'],                  // 43/114/128/180 = 465
    trophy: { name: 'Sorted', tier: 'silver', icon: 'ArrowDownUp' },
  },
  {
    id: 'chess-board',
    name: 'Chess & Board',
    blurb: 'Won positions on a board, and one move that throws each of them away.',
    keys: ['check', 'turn', 'defend', 'mate'],                   // 21/23/28/41 = 113
    trophy: { name: 'Endgame Sweep', tier: 'bronze', icon: 'Swords' },
  },
  {
    id: 'table',
    name: 'Table Games',
    blurb: 'Cards and counters, the games you would play across a table.',
    keys: ['chain', 'four', 'taire', 'hands'],                   // 30/30/78/112 = 250
    trophy: { name: 'Full Table', tier: 'bronze', icon: 'Spade' },
  },
  {
    id: 'recall',
    name: 'Recall',
    blurb: 'What happened, when it happened, and how much of it you can name.',
    keys: ['dating', 'extra', 'listed', 'redact'],               // 22/44/75/276 = 417
    trophy: { name: 'Long Memory', tier: 'silver', icon: 'History' },
  },
  {
    id: 'ranking',
    name: 'Ranking',
    blurb: 'Call the order, and call what everybody else is going to say.',
    keys: ['bracket', 'feud', 'outrank', 'outwit'],              // 51/90/90/90 = 321
    trophy: { name: 'Called It', tier: 'bronze', icon: 'ListOrdered' },
  },
  {
    id: 'arcade',
    name: 'Arcade',
    blurb: 'One life, a running clock, and a score you are trying to beat.',
    keys: ['deep', 'blitz', 'streak', 'blocks', 'sweep'],        // 37/62/66/180/257 = 602
    trophy: { name: 'High Score', tier: 'silver', icon: 'Gamepad2' },
  },
];

// The marquee, in the same shape as a skill circuit so every surface can render
// one list. `keys` is null on purpose: the marquee's roster is a DAILY read out
// of lib/daily-five, not a fixed array, and a caller that reaches for .keys
// instead of circuitKeysFor would silently get yesterday's run. Use the
// accessors.
export const MARQUEE = {
  id: MARQUEE_ID,
  name: FIVE_NAME,
  blurb: 'One game from each of five categories, shortest first. A new five at midnight.',
  keys: null,
  marquee: true,
  // Gold, and never anything else: the roster is different every day, so
  // finishing it is a different feat from finishing a fixed five, and it is the
  // one circuit whose trophy cannot be farmed by picking an easy day.
  trophy: { name: 'The Full Five', tier: 'gold', icon: 'Star' },
};

// The whole family, marquee first. This is the cycle order: stepping right from
// the last skill circuit wraps back to the marquee, and stepping left from the
// marquee wraps to the last, so the Five is the HEAD of the list rather than
// something sitting beside it.
export const ALL_CIRCUITS = [MARQUEE, ...CIRCUITS];

const BY_ID = ALL_CIRCUITS.reduce((m, c) => { m[c.id] = c; return m; }, {});

export function circuitById(id) {
  return BY_ID[String(id || '')] || null;
}

export function isMarquee(id) {
  return String(id || '') === MARQUEE_ID;
}

// A circuit's game keys for an ET 'YYYY-MM-DD', in run order. Unknown keys and
// retired games drop out HERE, the only place that filtering happens, exactly
// as fiveFor does it — so no caller has to know about either, and Extra's
// retirement on 2026-09-29 shortens Recall on its own with no edit anywhere.
// The marquee delegates straight to lib/daily-five, so the Five keeps its own
// rules and its own bank.
export function circuitKeysFor(id, iso) {
  const day = iso || etTodayISO();
  if (isMarquee(id)) return fiveFor(day);
  const c = circuitById(id);
  if (!c || !Array.isArray(c.keys)) return [];
  return c.keys.filter((k) => DAILY_GAME_MAP[k] && !isRetiredDaily(k, day));
}

// Same, as registry rows ({ key, name, cat, tag, href, ... }), which is what
// every render surface actually wants.
export function circuitGamesFor(id, iso) {
  return circuitKeysFor(id, iso).map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
}

// A game's route WITH the run attached. The marquee keeps the ?five=1 flag it
// already uses — that flag is read by DailyFiveBar, LoftFinish and the end-card
// run branch, and repointing it at ?circuit=five would have meant touching all
// three for no gain. A skill circuit carries ?circuit=<id>.
export function circuitHref(key, id) {
  const g = DAILY_GAME_MAP[key];
  const base = (g && g.href) || `/${key}`;
  const sep = base.includes('?') ? '&' : '?';
  return isMarquee(id)
    ? `${base}${sep}${FIVE_PARAM}=1`
    : `${base}${sep}${CIRCUIT_PARAM}=${encodeURIComponent(id)}`;
}

// Read the active skill circuit off the URL. Window-based rather than
// useSearchParams for the reason spelled out in lib/daily-five's readFiveParam:
// useSearchParams forces a CSR bail-out that has to sit inside a <Suspense>
// boundary, and one page rendering a consumer outside one fails the whole
// build. Call it in an effect, never during render — it returns null on the
// server, so a render-time call disagrees with the server's paint.
export function readCircuitParam() {
  if (typeof window === 'undefined') return null;
  try {
    const v = new URLSearchParams(window.location.search).get(CIRCUIT_PARAM);
    return v && circuitById(v) && !isMarquee(v) ? v : null;
  } catch (e) { return null; }
}

// Which skill circuits contain this game key. Exclusive today, so this returns
// at most one — it returns an ARRAY anyway so a future deliberate overlap does
// not become a silent truncation at every call site.
export function circuitsOfKey(key) {
  return CIRCUITS.filter((c) => c.keys.includes(key)).map((c) => c.id);
}

// The filter strip in app/DailyStrip.jsx is keyed by DISPLAY NAME, because that
// is how its chips, its `circuit:<name>` filter value and its aria-label all
// read. Deriving it here rather than restating the rosters there is the whole
// point: the thing you filter by and the thing you can run are one list, and
// they cannot drift. Retired games are left IN — the strip is a browse surface
// over the full roster and does its own retirement filtering per row.
export const CIRCUIT_NAME_LISTS = CIRCUITS.map((c) => [
  c.name,
  c.keys.map((k) => (DAILY_GAME_MAP[k] || {}).name).filter(Boolean),
]);

// A circuit's state for one viewer, from a set of already-played game keys.
// Takes a Set rather than fetching, exactly like fiveProgress: every caller
// already holds the day's completions and a run must never cost a request of
// its own. `done` is PLAYED-AND-FINISHED, not SOLVED.
export function circuitProgress(id, iso, doneKeys) {
  const members = circuitKeysFor(id, iso);
  const has = (k) => !!(doneKeys && doneKeys.has(k));
  const done = members.filter(has);
  return {
    members,
    done: done.length,
    total: members.length,
    next: members.find((k) => !has(k)) || null,
    complete: !!members.length && done.length === members.length,
  };
}
