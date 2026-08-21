// EXTENSION IS REQUIRED on this relative import, for the same reason
// lib/daily-five.js carries it: scripts/verify-circuits.mjs imports this file
// directly under node, where ESM does not do extension guessing. Do not drop it.
import { DAILY_GAME_MAP, isRetiredDaily, etTodayISO } from './daily-games.js';
import { FIVE_NAME, fiveFor, FIVE_PARAM } from './daily-five.js';

// CIRCUITS — one family, sixteen members (owner, 2026-08-18; the chess split
// of 2026-08-21 added the sixteenth).
//
// A circuit is five dailies played as one sitting, scored on the COMBINED
// placement across them, exactly like the Daily Five. The Five is circuit #1
// and it is the MARQUEE: gold, always first, always the default selection.
// The other fifteen are SKILL circuits.
//
// THE DAILY FIVE DOES NOT CHANGE. Its roster, selection rules (one game from
// each of five different categories, Word + Numbers + Logic plus two rotating
// in proportion to pool size), ordering (shortest median first), time budget,
// seven-day repeat gap, hand-banked review and scripts/verify-daily-five.mjs
// gate are all untouched and all still live in lib/daily-five.js. This module
// does not import its roster, generate it, or wrap it: it names it as the
// marquee and otherwise leaves it alone. The only thing that changed is that
// the console band now has a way to reach the other fifteen.
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
//   fifteen cost no maintenance.
//
// NO NEW SCORING, NO NEW STORAGE. Every circuit is served by
// /api/quiz/daily-combined?circuit=<id>, which is the same route with a
// narrowed slate and bestN 5, exactly as ?five=1 already works. One comparator,
// one table. See the block comment in that route.
//
// EXCLUSIVE AND EXHAUSTIVE. Every eligible daily sits in EXACTLY ONE skill
// circuit, which is what makes "finish all fifteen" mean "play everything" and
// what stops a game paying into two skill boards at once. The count comes out
// at 67 games over 15 circuits, NINE OF FIVE, FOUR OF FOUR AND TWO OF THREE
// (Niche made Recall the eighth five on 2026-08-20, Shoe made Table Games the
// ninth on 2026-08-21, and the chess split of 2026-08-21 left Board Games and
// Chess a pair of threes). The no-tiny-circuits floor still holds in general,
// a circuit's whole score being 15 points per game, so a three tops out at 45
// against a five's 75; the owner sanctioned exactly these two threes on
// 2026-08-21, because chess is its own discipline and filing Queen or Race
// somewhere they do not belong was the worse lie.
// Against the 69 in the registry:
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
// These fifteen REPLACE the fourteen ad-hoc groups that used to live inline in
// app/DailyStrip.jsx, which ran from 2 to 7 games, left eleven games in no
// circuit at all and put two games in two. DailyStrip now derives its filter
// strip from CIRCUIT_NAME_LISTS below, so the thing you filter by and the thing
// you can run are the same fifteen. Renamed on the way: Anagrams became
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
// `share` is the circuit's SHARE COPY, two strings, and it lives here for the
// same reason `trophy` does: it is a fact about that roster, and a copy deck
// kept in a component drifts from the roster it describes the first time a
// circuit is renamed.
//
//   invite — the evergreen line for sharing the CIRCUIT. It never mentions a
//            score or a date, so it does not go stale and a recipient who has
//            never played is not handed somebody else's result.
//   result — a short tag under the figures when sharing a FINISHED run. The
//            numbers are built by circuitShareResult; this is only the line
//            that says which circuit those numbers are from.
//
// NO EM DASHES in either, per the house copy rule. Both are checked for length,
// for em dashes, and for uniqueness by scripts/verify-circuits.mjs.
//
// TIER IS THE CIRCUIT'S LENGTH, not a guess at difficulty: bronze under 6
// minutes of top-10 clock, silver to 20, gold beyond. Board Games is three
// games totalling under two minutes and Crosswords is five totalling
// forty-seven, and a trophy case that called those the same thing would be
// lying about which one is the achievement.
export const CIRCUITS = [
  {
    id: 'crosswords',
    name: 'Crosswords',
    blurb: 'Every crossword on the site, the mini first and the clueless ones last.',
    share: {
      invite: "Every crossword on the site in one sitting: the mini, one in pieces, and three with no clues at all.",
      result: "Five crosswords, three of them clueless.",
    },
    keys: ['emcee', 'shards', 'glyph', 'crux', 'anon'],          // 35/304/370/1031/1106 = 2846
    trophy: { name: 'Fully Crossed', tier: 'gold', icon: 'Grid3x3' },
  },
  {
    id: 'word-building',
    name: 'Word Building',
    blurb: 'Build the highest-scoring words you can out of a fixed set of letters.',
    share: {
      invite: "Five sets of letters and five different ways to spend them. Highest score takes each one.",
      result: "Five racks of letters, five ways to spend them.",
    },
    keys: ['babel', 'tuck', 'barter', 'rung', 'lode'],           // 201/201/202/360/614 = 1578
    trophy: { name: 'Master Builder', tier: 'gold', icon: 'Hammer' },
  },
  {
    id: 'wordplay',
    name: 'Wordplay',
    blurb: 'Scrambles, hidden errors and words you have to close in on.',
    share: {
      invite: "Four games that hide a word in plain sight: scrambled, misspelled, buried, or just out of reach.",
      result: "Four words hidden four different ways.",
    },
    keys: ['garble', 'stet', 'strata', 'warmer'],                // 51/57/189/518 = 815
    trophy: { name: 'Wordsmith', tier: 'silver', icon: 'Feather' },
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    blurb: 'Every sudoku on the site, easiest grid first and the sandwich last.',
    share: {
      invite: "Every sudoku on the site in one sitting: mini, killer, classic, jigsaw, sandwich. Easiest grid first.",
      result: "Five sudokus, the sandwich last.",
    },
    keys: ['sixes', 'cages', 'suds', 'quilt', 'sando'],          // 144/270/482/699/1171 = 2766
    trophy: { name: 'Grid Locked', tier: 'gold', icon: 'Grid2x2' },
  },
  {
    id: 'mental-math',
    name: 'Mental Math',
    blurb: 'Arithmetic under a clock, from quick sums to a full cryptarithm.',
    share: {
      invite: "Four rounds of arithmetic against a clock, from one quick target to a full cryptarithm. No calculator.",
      result: "Four rounds of arithmetic, no calculator.",
    },
    keys: ['crunch', 'carve', 'tally', 'cipher'],                // 63/111/337/455 = 966
    trophy: { name: 'Quick Reckoner', tier: 'silver', icon: 'Calculator' },
  },
  {
    id: 'deduction',
    name: 'Deduction',
    blurb: 'Testimony, alibis and case files that narrow to exactly one answer.',
    share: {
      invite: "Five cases with one answer each. Liars, alibis, and just enough testimony to get there.",
      result: "Five cases, one answer each.",
    },
    keys: ['sworn', 'hearsay', 'suffice', 'docket', 'alibi'],    // 54/156/172/221/232 = 835
    trophy: { name: 'Case Closed', tier: 'silver', icon: 'Search' },
  },
  {
    id: 'pencil',
    name: 'Pencil Puzzles',
    blurb: 'Loops, pictures and seating plans drawn out of pure constraint.',
    share: {
      invite: "Loops, pictures and seating plans, drawn out of nothing but the constraints. Five puzzles, back to back.",
      result: "Five puzzles drawn out of pure constraint.",
    },
    keys: ['etch', 'jester', 'hedge', 'paths', 'fib'],           // 58/89/93/111/451 = 802
    trophy: { name: 'Sharpened', tier: 'silver', icon: 'PenTool' },
  },
  {
    id: 'spatial',
    name: 'Spatial Puzzles',
    blurb: 'Routes, shapes and places, on a board and on the map.',
    share: {
      invite: "Routes, shapes and places, on a board and on the map. Five games, and none of them take long.",
      result: "Five games of routes, shapes and places.",
    },
    keys: ['chomp', 'span', 'park', 'ping', 'plot'],             // 34/53/61/69/93 = 310
    trophy: { name: 'Way Finder', tier: 'bronze', icon: 'Compass' },
  },
  {
    id: 'sorting',
    name: 'Sorting',
    blurb: 'Put things in the right group, the right set, or the right order.',
    share: {
      invite: "Four games about putting things where they belong: the right group, the right overlap, the right order.",
      result: "Four games, four ways to be sorted.",
    },
    keys: ['links', 'axiom', 'venn', 'stands'],                  // 43/114/128/180 = 465
    trophy: { name: 'Sorted', tier: 'silver', icon: 'ArrowDownUp' },
  },
  {
    id: 'chess-board',
    name: 'Board Games',
    blurb: 'Won positions on a board, and one move that throws each of them away.',
    share: {
      invite: "Three positions already won, and one move that throws each of them away. The shortest circuit on the site, and the least forgiving.",
      result: "Three won positions, three chances to lose them.",
    },
    // Renamed from Chess & Board on 2026-08-21, when the chess games moved out
    // into the all-chess circuit below (owner ruling) and Race arrived. The id
    // stays chess-board on purpose: it is the URL and the trophy key, and the
    // circuit boards already played hang off it.
    keys: ['check', 'turn', 'race'],                             // 21/23/~45 est = 89
    trophy: { name: 'Endgame Sweep', tier: 'bronze', icon: 'Swords' },
  },
  {
    id: 'chess',
    name: 'Chess',
    blurb: 'The chess table: save the king, mate the king, queen the pawn.',
    share: {
      invite: "Three games at the chess table: save the king, mate the king, and walk a pawn to its crown. Perfect play punishes everything else.",
      result: "Three games at the chess table.",
    },
    // The chess-only circuit (owner ruling, 2026-08-21). Three games sits
    // under the usual floor, and is sanctioned: chess is its own discipline,
    // and filing Queen in a circuit it does not belong to was the worse lie.
    keys: ['defend', 'mate', 'queen'],                           // 28/41/~75 est = 144
    trophy: { name: 'Grandmaster', tier: 'bronze', icon: 'Crown' },
  },
  {
    id: 'table',
    name: 'Table Games',
    blurb: 'Cards and counters, the games you would play across a table.',
    share: {
      invite: "Five games you would play across a table: two solitaires, a blackjack shoe, and two boards a move away from won.",
      result: "Five games across a table.",
    },
    keys: ['chain', 'four', 'taire', 'shoe', 'hands'],           // 30/30/78/~100 est/112 = 350
    trophy: { name: 'Full Table', tier: 'bronze', icon: 'Spade' },
  },
  {
    id: 'recall',
    name: 'Recall',
    blurb: 'What happened, when it happened, and how much of it you can name.',
    share: {
      invite: "What happened, when it happened, and how much of it you can still name. Nothing multiple choice.",
      result: "Recall, start to finish, and no multiple choice.",
    },
    keys: ['dating', 'extra', 'listed', 'niche', 'redact'],      // 22/44/75/~150 est/276 = 567
    trophy: { name: 'Long Memory', tier: 'silver', icon: 'History' },
  },
  {
    id: 'ranking',
    name: 'Ranking',
    blurb: 'Call the order, and call what everybody else is going to say.',
    share: {
      invite: "Three of these score you against what everybody else said today, not against an answer key. Call the crowd before it calls you.",
      result: "Three crowd calls and one answer key.",
    },
    keys: ['bracket', 'feud', 'outrank', 'outwit'],              // 51/90/90/90 = 321
    trophy: { name: 'Called It', tier: 'bronze', icon: 'ListOrdered' },
  },
  {
    id: 'arcade',
    name: 'Arcade',
    blurb: 'One life, a running clock, and a score you are trying to beat.',
    share: {
      invite: "One life, a running clock, and a score to chase. Five games that do not let you take it back.",
      result: "Five games, one life each.",
    },
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
  share: {
    invite: "One game from each of five categories, shortest first, and a different five every day. Today's is up.",
    result: "Five categories, one run, a new five tomorrow.",
  },
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

// ── THE ACTIVE RUN ─────────────────────────────────────────────────────────
// Which run is the player inside? This is the ONLY function an in-run surface
// should ask, and it answers with a circuit ID (MARQUEE_ID for the Five) or
// null.
//
// IT EXISTS BECAUSE THE CIRCUITS LAUNCH SHIPPED WITHOUT IT (fixed 2026-08-18).
// The console band handed a player into a skill circuit with ?circuit=<id>
// while all three in-run surfaces — DailyFiveBar, LoftFinish and DailyEndCard —
// still read `?five=1` alone through readFiveParam. Nothing threw: each one
// simply concluded it was not in a run and rendered the ordinary page. So a
// skill circuit had no strip, no hand-off to the next game, no suppression of
// the end card's 30-second auto-advance to an unrelated daily, and nowhere to
// land at the end. A run reader that knows about one of the two flags IS the
// bug, so there is one function now and every surface calls it. Do not
// reintroduce a second URL read anywhere.
//
// The marquee keeps ?five=1 rather than being repointed at ?circuit=five, so
// every link already in the wild still works, and the precedence when both are
// present matches the daily-combined route's: the marquee is the marquee.
//
// Call it in an EFFECT, never during render — it returns null on the server, so
// a render-time call makes the first client paint disagree with the server's.
export function readRunParam() {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get(FIVE_PARAM) === '1') return MARQUEE_ID;
    const c = q.get(CIRCUIT_PARAM);
    return c && circuitById(c) && !isMarquee(c) ? c : null;
  } catch (e) { return null; }
}

// A run's display name, marquee included, so no surface has to branch on
// isMarquee just to write a heading.
export function circuitName(id) {
  const c = circuitById(id);
  return (c && c.name) || FIVE_NAME;
}

// Where a finished run LANDS. One page for all sixteen (owner, 2026-08-18):
// /daily-five takes ?circuit=<id> and narrows itself exactly as the board route
// does, rather than a second page component that would have to be kept in sync
// with the first. Same reasoning as the board: never a route of its own.
export function runSummaryHref(id) {
  return isMarquee(id)
    ? '/daily-five'
    : `/daily-five?${CIRCUIT_PARAM}=${encodeURIComponent(id)}`;
}

// ── SHARING ────────────────────────────────────────────────────────────────
// A SHARED LINK LANDS ON THE CIRCUIT'S OWN PAGE, never on /daily-five (owner,
// 2026-08-18). /daily-five is the run SUMMARY: it is noindex, it is one
// viewer's own results and an hourly leaderboard, and it reads as an ending.
// A person who has just been handed a link has not played, so they need the
// thing the run IS — the five games, in order, with a button that starts it —
// which is what /circuits/<id> serves. The summary stays exactly where it is
// for the player who finished.
//
// The marquee has a landing page too (/circuits/five). It is the only circuit
// whose roster is a daily read, so that page renders today's five rather than a
// fixed list, but a share of the Five must not send somebody to a summary of a
// run they have not started either.
export const CIRCUIT_BASE = '/circuits';

export function circuitPageHref(id) {
  const c = circuitById(id);
  return `${CIRCUIT_BASE}/${encodeURIComponent((c && c.id) || MARQUEE_ID)}`;
}

// The link as it appears INSIDE share text: bare host, no scheme, exactly the
// form every daily client uses ('mindloftdaily.com/crux'). Two reasons it is
// bare rather than absolute. It reads as text in a message rather than as a
// pasted URL, and ShareCreditPop.restampResult swaps the link inside a result
// for the new member's referral link by matching BOTH the absolute and the
// scheme-stripped form, so the bare one survives a sign-up mid-share.
//
// The host is duplicated rather than imported: this module is imported by
// scripts/verify-circuits.mjs under plain node and by lib/daily-five's
// consumers, and lib/site.js is server-shaped config. It is one string and the
// checker asserts it against SHARE_HOST, so it cannot drift.
export const SHARE_HOST_FOR_CIRCUITS = 'mindloftdaily.com';

export function circuitShareUrl(id) {
  return `${SHARE_HOST_FOR_CIRCUITS}${circuitPageHref(id)}`;
}

function shareOf(id) {
  const c = circuitById(id);
  return (c && c.share) || { invite: '', result: '' };
}

export function circuitShareInvite(id, url) {
  const name = circuitName(id);
  const head = isMarquee(id) ? `${name} · Mind Loft` : `The ${name} circuit · Mind Loft`;
  return `${head}\n${shareOf(id).invite}\n${url || circuitShareUrl(id)}`;
}

// The finished-run share. Same four-line shape every daily uses: a headline
// carrying the figures, a spoiler-free grid, the circuit's own tag line, then
// the link.
//
// THE GRID LEAKS NOTHING, which is the rule share art has to obey: a pip says
// only whether that game was topped, finished or left, never what the answer
// was. It is the same three states the summary's own pips draw, and it is the
// thing a combined total hides — an all-rounder and a specialist reach the same
// number by different shapes.
//
// `pips` is one entry per game IN RUN ORDER: 'top' where they finished first on
// that game, 'on' where they finished it, anything else where they did not play
// it. Every figure is optional, so a partial run still produces honest text
// rather than 'undefined of undefined'.
const PIP = { top: '🟨', on: '🟦' };

export function circuitShareResult(id, stats, url) {
  const s = stats || {};
  const name = circuitName(id);
  const bits = [isMarquee(id) ? name : `${name} circuit`];
  if (Number.isFinite(s.points) && Number.isFinite(s.maxTotal) && s.maxTotal > 0) {
    bits.push(`${Math.round(Number(s.points) * 10) / 10}/${s.maxTotal} pts`);
  }
  if (Number.isFinite(s.rank) && s.rank > 0) {
    bits.push(Number.isFinite(s.field) && s.field > 0 ? `#${s.rank} of ${s.field}` : `#${s.rank}`);
  }
  if (Number.isFinite(s.done) && Number.isFinite(s.total) && s.total > 0 && s.done < s.total) {
    bits.push(`${s.done} of ${s.total} played`);
  }
  const grid = Array.isArray(s.pips) && s.pips.length
    ? s.pips.map((p) => PIP[p] || '⬜').join('')
    : '';
  return [bits.join(' · '), grid, shareOf(id).result, url || circuitShareUrl(id)]
    .filter(Boolean).join('\n');
}
