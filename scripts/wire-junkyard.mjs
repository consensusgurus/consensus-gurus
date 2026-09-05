// scripts/wire-junkyard.mjs — wires the daily game `junkyard` into every registry,
// and wires the JAM FAMILY LADDER that hands Parker, Impound and Junkyard to
// each other as "up next".
//
// An ANCHORED script, in the shape of scripts/wire-impound.mjs: half these
// registries fail SILENTLY when missed (a key in one list and not its partner is
// dropped with no error and no gap), so every anchor must match EXACTLY ONCE or
// the script throws. Idempotent: an edit whose replacement is already present is
// skipped, so a re-run after a partial push is safe.
//
//   node scripts/wire-junkyard.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree.
//
// Junkyard sits directly after Impound in every ordered list, which puts the
// family in ascending board size wherever it appears: Parker 6x6, Impound 7x7,
// Junkyard 8x8.
//
// SECTIONS 20 AND 21 ARE NOT ABOUT JUNKYARD ALONE. They add GAME_FAMILIES to
// lib/daily-games.js and teach app/useNextUnplayed.js to prefer a family member
// over a mere category-mate, which is what makes finishing any one of the three
// offer the next size up. That change is worthless without a third game and the
// third game is thin without it, so the two ship together.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-junkyard.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// TWO PHASE, so a re-run against a moved origin reports EVERY stale anchor at
// once rather than one per run, and so a failed anchor writes NOTHING. Edits
// chain in memory, which is what lets several edits share one file.
const buf = new Map();
const errs = [];
function read(file) {
  if (!buf.has(file)) buf.set(file, fs.readFileSync(path.join(root, file), 'utf8'));
  return buf.get(file);
}
function edit(file, anchor, replacement) {
  const src = read(file);
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) { errs.push(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 140)}`); return; }
  buf.set(file, src.replace(anchor, replacement));
  applied++;
}
function flush() {
  if (errs.length) {
    console.error(`${errs.length} stale anchor(s), nothing written:\n`);
    for (const e of errs) console.error('  ' + e + '\n');
    process.exit(1);
  }
  for (const [file, src] of buf) fs.writeFileSync(path.join(root, file), src);
}

const TAG = 'Parker on the biggest lot';
// THE FIRST TWO SENTENCES ARE THE SHARE CARD. lib/og-stage-cards trims `how` to
// whole sentences under 150 characters, so anything that matters has to land in
// the first two. These two come to 132 and say the whole game; the third is
// flavour and is only ever read on the game page.
const HOW = 'Parker on an eight by eight lot, the biggest of the three. Everything still slides on one axis and there is still one gap in the wall. Nearly thirty blocks now stand between you and it, and Monday already runs deeper than any Parker board short of a Sunday.';
// The legacy accent pair (pre-stage surfaces still read these). The stage paints
// the Logic category step, like every daily since 2026-08-26, so these two only
// decide how the row reads on the old slate. A third step down the same brown
// ramp as Parker (#7c5c2e/#f0cf9a) and Impound (#6b4a1f/#e3bd85): the family
// should read as a family on a slate row, and the deepest of the three is the
// biggest board.
const COLOR = '#5c3a16', NAVY = '#d9b070';
const BG = '#f0e7d8', BORDER = 'rgba(92,58,22,0.35)';

// ─── 1. lib/daily-games.js — the single source of truth, one row, plus the premiere
edit('lib/daily-games.js',
  `  { key: 'impound', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Impound', cat: 'Logic', tag: 'Parker on a bigger lot',`,
  `  // Junkyard is the same jam at 8x8, and it is the LAST rung this family can\n  // have: lib/jam-core packs occupancy into two 32-bit words, so 64 cells is\n  // the engine's ceiling. Same attempts shape as the other two, and the three\n  // hand each other along through GAME_FAMILIES below.\n  { key: 'junkyard', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Junkyard', cat: 'Logic', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },\n  { key: 'impound', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Impound', cat: 'Logic', tag: 'Parker on a bigger lot',`);
edit('lib/daily-games.js',
  `  { key: 'slot', from: '2026-09-04', until: '2026-09-08' },\n];`,
  `  { key: 'slot', from: '2026-09-04', until: '2026-09-08' },\n  { key: 'junkyard', from: '2026-09-04', until: '2026-09-08' },\n];`);

// ─── 2. app/DailyEndCard.jsx — the lucide import, LAUNCH_PIN, GAME_META, tile copy
edit('app/DailyEndCard.jsx',
  `  Clapperboard, Quote, ZoomIn, Axe, Truck, Rows3,\n} from 'lucide-react';`,
  `  Clapperboard, Quote, ZoomIn, Axe, Truck, Rows3, Boxes,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['slot',`,
  `const LAUNCH_PIN = { keys: ['junkyard', 'slot',`);
edit('app/DailyEndCard.jsx',
  `  impound: { accent: '#6b4a1f', badgeBg: '#6b4a1f', badgeInk: T.white, Fin: Truck },`,
  `  impound: { accent: '#6b4a1f', badgeBg: '#6b4a1f', badgeInk: T.white, Fin: Truck },\n  junkyard: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Boxes },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'impound',   cat: 'logic',     name: 'Impound', tag: 'Parker on a bigger lot',         blurb: 'Parker on a seven by seven lot, with around twenty blocks in your way. Same one gap in the wall, a good deal more between you and it.', href: '/impound' },`,
  `  { key: 'impound',   cat: 'logic',     name: 'Impound', tag: 'Parker on a bigger lot',         blurb: 'Parker on a seven by seven lot, with around twenty blocks in your way. Same one gap in the wall, a good deal more between you and it.', href: '/impound' },\n  { key: 'junkyard',   cat: 'logic',     name: 'Junkyard', tag: '${TAG}',         blurb: 'Parker on an eight by eight lot, the biggest board in the family, with close to thirty blocks in your way. Same one gap in the wall, a great deal more between you and it.', href: '/junkyard' },`);

// ─── 3. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['slot',`,
  `const LAUNCH_PIN = { keys: ['junkyard', 'slot',`);

// ─── 4. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'impound', href: '/impound', name: 'Impound', tag: 'parker on a bigger lot', store: 'sot_impound_day', accent: '#6b4a1f', bg: '#f3ece0', border: 'rgba(107,74,31,0.35)' },`,
  `  { key: 'impound', href: '/impound', name: 'Impound', tag: 'parker on a bigger lot', store: 'sot_impound_day', accent: '#6b4a1f', bg: '#f3ece0', border: 'rgba(107,74,31,0.35)' },\n  { key: 'junkyard', href: '/junkyard', name: 'Junkyard', tag: 'parker on the biggest lot', store: 'sot_junkyard_day', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}' },`);

// ─── 5. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'impound', href: '/impound', name: 'Impound', tag: 'Parker on a bigger lot', img: '/games/btn-impound.png' },`,
  `  { key: 'impound', href: '/impound', name: 'Impound', tag: 'Parker on a bigger lot', img: '/games/btn-impound.png' },\n  { key: 'junkyard', href: '/junkyard', name: 'Junkyard', tag: '${TAG}', img: '/games/btn-junkyard.png' },`);
edit('app/DailyGamesGrid.jsx',
  `'hedge', 'park', 'impound', 'fib',`,
  `'hedge', 'park', 'impound', 'junkyard', 'fib',`);

// ─── 6. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'impound', href: '/impound', name: 'Impound', img: '/games/btn-impound.png', store: 'sot_impound_day', tag: "Parker on a bigger lot" , cat: 'Logic' },`,
  `  { key: 'impound', href: '/impound', name: 'Impound', img: '/games/btn-impound.png', store: 'sot_impound_day', tag: "Parker on a bigger lot" , cat: 'Logic' },\n  { key: 'junkyard', href: '/junkyard', name: 'Junkyard', img: '/games/btn-junkyard.png', store: 'sot_junkyard_day', tag: "${TAG}" , cat: 'Logic' },`);
edit('app/DailyStrip.jsx', `const ACCENTS = { slot:`, `const ACCENTS = { junkyard: '${NAVY}', slot:`);
edit('app/DailyStrip.jsx', `const TCOL = { slot:`, `const TCOL = { junkyard: '${COLOR}', slot:`);

// ─── 7. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as IMPOUND_FULL } from '../impound/puzzles';`,
  `import { PUZZLES as IMPOUND_FULL } from '../impound/puzzles';\nimport { PUZZLES as JUNKYARD_FULL } from '../junkyard/puzzles';`);
// The .map() is a SEPARATE edit and it is the one that fails the build when it
// is missed: adding only the import gives `ReferenceError: JUNKYARD is not
// defined`, which is a Vercel build failure rather than a silent gap.
edit('app/daily/page.js',
  `const IMPOUND = IMPOUND_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const IMPOUND = IMPOUND_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst JUNKYARD = JUNKYARD_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'impound', name: 'Impound', path: '/impound', tag: 'Parker on a bigger lot', accent: '#6b4a1f', bg: '#f3ece0', border: 'rgba(107,74,31,0.35)', src: IMPOUND },`,
  `  { key: 'impound', name: 'Impound', path: '/impound', tag: 'Parker on a bigger lot', accent: '#6b4a1f', bg: '#f3ece0', border: 'rgba(107,74,31,0.35)', src: IMPOUND },\n  { key: 'junkyard', name: 'Junkyard', path: '/junkyard', tag: '${TAG}', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}', src: JUNKYARD },`);

// ─── 8. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `'hedge', 'park', 'impound', 'fib',`,
  `'hedge', 'park', 'impound', 'junkyard', 'fib',`);
edit('app/daily/DailyArchiveClient.jsx', `impound: '#e3bd85',`, `impound: '#e3bd85', junkyard: '${NAVY}',`);

// ─── 9. lib/sitemap-entries.js — keyed by ROUTE, not by key ────────────────
edit('lib/sitemap-entries.js',
  `'parker', 'impound', 'check',`,
  `'parker', 'impound', 'junkyard', 'check',`);

// ─── 10. the FOUR puzzle-map registries (sunday-slate included: Junkyard runs one)
for (const f of ['lib/daily-slate.js', 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js', 'app/api/quiz/sunday-slate/route.js']) {
  edit(f, `import { PUZZLES as P_impound } from '@/app/impound/puzzles';`,
    `import { PUZZLES as P_impound } from '@/app/impound/puzzles';\nimport { PUZZLES as P_junkyard } from '@/app/junkyard/puzzles';`);
  edit(f, `park: P_park, impound: P_impound,`, `park: P_park, impound: P_impound, junkyard: P_junkyard,`);
}

// ─── 11. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js', `|park|impound|`, `|park|impound|junkyard|`);

// ─── 12. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx', `|park|impound|`, `|park|impound|junkyard|`);

// ─── 13. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'park', 'impound', 'check',`,
  `'park', 'impound', 'junkyard', 'check',`);

// ─── 14. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'park', 'impound', 'check',`, `'park', 'impound', 'junkyard', 'check',`);

// ─── 15. lib/loft.js — without this the client renders the pre-Loft page.
// Keyed by the client's SLUG, which is the route; Junkyard's route and key are
// the same word, so it is listed plainly.
edit('lib/loft.js',
  `  'impound', 'mate', 'mercury',`,
  `  'impound', 'junkyard', 'mate', 'mercury',`);

// ─── 16. lib/sunday-editions.js — Junkyard runs one, so it must be listed AND
// its Sunday puzzles must carry sunday: true. verify-junkyard fails any board
// whose flag disagrees with the real weekday.
edit('lib/sunday-editions.js',
  `//   impound a perfect line of 34 to 50 against a weekday 16 to 35, on the same`,
  `//   junkyard a perfect line of 44 and up against a weekday 22 to 47, on the\n//           same 8x8 lot, which is the largest board lib/jam-core can hold at\n//           all: the two-word bitboard tops out at 64 cells, so depth is the\n//           only knob this game has left\n//   impound a perfect line of 34 to 50 against a weekday 16 to 35, on the same`);
edit('lib/sunday-editions.js',
  `'park', 'impound', 'check',`,
  `'park', 'impound', 'junkyard', 'check',`);

// ─── 17. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// Keyed UNQUOTED, like every other entry, and a missing one renders NO icon and
// no error. Five primitives, the house maximum: the lot's wall with its one
// gap, the red block sitting in that gap's lane, and three pieces of traffic.
// Bigger lot and a tighter gap than Impound's, so the two do not read alike.
edit('lib/game-glyphs.js',
  `  impound: 'M20 9V4H4v16h16v-5M7 10h6v4H7zM16 5v5M7 16h9',    // a fuller lot, one gap`,
  `  impound: 'M20 9V4H4v16h16v-5M7 10h6v4H7zM16 5v5M7 16h9',    // a fuller lot, one gap
  junkyard: 'M21 11V3H3v18h18v-5M8 11h6v5H8zM6 6h9M18 6v4M6 18h10',  // the biggest lot, one gap`);

// ─── 18. lib/par.js — no code change, but the SCOPE comment names its games ─
edit('lib/par.js',
  `// Every banked board on Parker, Impound, Rung and Taire carries the exact solver`,
  `// Every banked board on Parker, Impound, Junkyard, Rung and Taire carries the exact solver`);
edit('lib/par.js',
  `// SCOPE: this model belongs to Parker, Impound, Rung and Taire, whose par stands in for`,
  `// SCOPE: this model belongs to Parker, Impound, Junkyard, Rung and Taire, whose par stands in for`);

// ─── 19. lib/puzzle-categories.js — the /logic-puzzles landing page, whose
// roster COUNT is spelled out as a WORD in two of its fields. Seventeen becomes
// Eighteen in BOTH or the page contradicts its own list.
edit('lib/puzzle-categories.js',
  `    description: 'Seventeen free daily logic puzzles: a nonogram, slitherlink, shikaku, two sizes of sliding block puzzle,`,
  `    description: 'Eighteen free daily logic puzzles: a nonogram, slitherlink, shikaku, three sizes of sliding block puzzle,`);
edit('lib/puzzle-categories.js',
  `    lede: 'Seventeen logic puzzles with one new board apiece every day. Pencil-and-paper classics (a nonogram, a slitherlink loop, shikaku rectangles, a sliding block puzzle in two sizes)`,
  `    lede: 'Eighteen logic puzzles with one new board apiece every day. Pencil-and-paper classics (a nonogram, a slitherlink loop, shikaku rectangles, a sliding block puzzle in three sizes)`);
edit('lib/puzzle-categories.js',
  `    keys: ['etch', 'hedge', 'plot', 'park', 'impound', 'paths',`,
  `    keys: ['etch', 'hedge', 'plot', 'park', 'impound', 'junkyard', 'paths',`);
edit('lib/puzzle-categories.js',
  `impound: 'Sliding block puzzle (larger board)', paths: 'Network puzzle',`,
  `impound: 'Sliding block puzzle (larger board)', junkyard: 'Sliding block puzzle (largest board)', paths: 'Network puzzle',`);
edit('lib/puzzle-categories.js',
  `Parker is the sliding block puzzle where you get the red one out, and Impound is the same puzzle on a bigger lot.',`,
  `Parker is the sliding block puzzle where you get the red one out, and Impound and Junkyard are the same puzzle on bigger lots.',`);

// ─── 20. lib/daily-games.js — GAME_FAMILIES, the ladder itself ──────────────
edit('lib/daily-games.js',
  `export const DAILY_KEYS = DAILY_GAMES.map((g) => g.key);\n`,
  `export const DAILY_KEYS = DAILY_GAMES.map((g) => g.key);

// GAME FAMILIES (owner, 2026-09-04). A family is ONE puzzle at several fixed
// sizes, banked as separate games because the size is frozen into every board,
// every stored perfect and every leaderboard row behind them. Widening a live
// game is therefore never on; a new size is a new game, and the family is what
// ties them back together.
//
// The jam family is Parker (6x6), Impound (7x7) and Junkyard (8x8), listed in
// ascending size, and THAT ORDER IS THE LADDER: a player who finishes one is
// handed the next size up they have not played yet, wrapping back to the
// smallest, so the three read as one progression rather than three Logic
// entries that happen to look alike. Eight is the last rung there can be:
// lib/jam-core packs occupancy into two 32-bit words, so 64 cells is the
// engine's ceiling.
//
// THIS IS THE ONLY PLACE A FAMILY IS DECLARED. app/useNextUnplayed.js reads it
// through familyAfter() and nothing else keeps a second list of these keys, for
// the same reason the scoring comparators were collapsed into one factory: a
// second copy is a copy that drifts. scripts/verify-junkyard.mjs check 10
// asserts every member is present in BOTH rosters the pick resolves against,
// because a missing key is dropped silently and the ladder just loses a rung.
export const GAME_FAMILIES = {
  jam: ['park', 'impound', 'junkyard'],
};

// The rest of \`key\`'s family, in ladder order starting from the rung AFTER it
// and wrapping past the end. Empty for a game in no family, which is every
// other daily, so a caller can use it unconditionally.
export function familyAfter(key) {
  for (const members of Object.values(GAME_FAMILIES)) {
    const i = members.indexOf(key);
    if (i !== -1) return [...members.slice(i + 1), ...members.slice(0, i)];
  }
  return [];
}
`);

// ─── 21. app/useNextUnplayed.js — a family outranks a category ──────────────
edit('app/useNextUnplayed.js',
  `import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';`,
  `import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';\nimport { familyAfter } from '@/lib/daily-games';`);
edit('app/useNextUnplayed.js',
  `// Fetched fresh: the cached daily-me answer can predate the finish that just\n// happened on this page, which is the case dailyMeClient's own comment warns of.`,
  `// Fetched fresh: the cached daily-me answer can predate the finish that just
// happened on this page, which is the case dailyMeClient's own comment warns of.
//
// A FAMILY OUTRANKS A CATEGORY (owner, 2026-09-04). Parker, Impound and Junkyard
// are one puzzle at three fixed sizes, so finishing any of them should hand the
// player the next SIZE they have not played, not merely another Logic game. The
// ladder lives in GAME_FAMILIES in lib/daily-games.js and is read here through
// familyAfter(), which returns the rest of the family cyclically from the rung
// after the one just finished, so the offer always moves forward and wraps.
// Every other daily is in no family, familyAfter returns [], and the category
// rule below is untouched.`);
edit('app/useNextUnplayed.js',
  `        const sameCat = mine ? open.filter((g) => g.cat === mine.cat) : [];\n        setNext(sameCat[0] || open[0] || null);`,
  `        const sameCat = mine ? open.filter((g) => g.cat === mine.cat) : [];
        // A retired family member is absent from DAILY_GAMES, so resolve through
        // it rather than trusting the key list, and drop what does not resolve.
        const fam = familyAfter(self)
          .map((k) => open.find((g) => g.key === k))
          .filter(Boolean);
        setNext(fam[0] || sameCat[0] || open[0] || null);`);
edit('app/useNextUnplayed.js',
  `        const sameCat = mine ? open.filter((g) => g.cat === mine.cat) : [];\n        const rest = open.filter((g) => !sameCat.includes(g));\n        setList([...sameCat, ...rest].slice(0, count));`,
  `        const fam = familyAfter(self)
          .map((k) => open.find((g) => g.key === k))
          .filter(Boolean);
        const sameCat = (mine ? open.filter((g) => g.cat === mine.cat) : [])
          .filter((g) => !fam.includes(g));
        const rest = open.filter((g) => !fam.includes(g) && !sameCat.includes(g));
        setList([...fam, ...sameCat, ...rest].slice(0, count));`);

// ─── 22-24. THE THREE SHARED FILES THAT DOCUMENT THE FAMILY ────────────────
// Comment-only, and they are still worth an edit: these headers are the first
// thing a future session reads about this engine, and each of them currently
// says the family has two members. The 64-cell ceiling in particular stops
// being a footnote the moment a game actually sits on it.
edit('lib/jam-core.js',
  `// The sliding-block engine, shared by Parker (6x6) and Impound (7x7).`,
  `// The sliding-block engine, shared by Parker (6x6), Impound (7x7) and
// Junkyard (8x8).
//
// EIGHT IS THE LAST SIZE THIS FILE CAN SERVE. Occupancy is two 32-bit words, so
// 64 cells is the hard ceiling and compile() throws above it rather than
// truncating; the packed state key is three bits a position, which is also
// exactly n <= 8. A ninth-rung game needs a different representation, not a
// bigger argument.`);
edit('lib/jam-core.js',
  `// Parker banks n 6 with the exit on row 2, Impound banks n 7 with the exit on\n// row 3, which on an odd board is the true middle rank.`,
  `// Parker banks n 6 with the exit on row 2, Impound banks n 7 with the exit on\n// row 3, which on an odd board is the true middle rank, and Junkyard banks n 8\n// with the exit on row 4, an even board leaning the opposite way to Parker's.`);
edit('app/parker/solver.js',
  `// lib/jam-core.js, because Impound (app/impound) is the same puzzle on a 7x7`,
  `// lib/jam-core.js, because Impound (app/impound) is the same puzzle on a 7x7\n// board and Junkyard (app/junkyard) the same puzzle again on an 8x8`);
edit('scripts/gen-jam.mjs',
  `// The sliding-block bank generator, for Parker (6x6) and Impound (7x7).`,
  `// The sliding-block bank generator, for Parker (6x6), Impound (7x7) and\n// Junkyard (8x8).\n//\n// AT 8x8 A RANDOM PACKING IS A BAD GUIDE TO WHAT THE CLIMB CAN REACH, and the\n// difference is worth knowing before anyone re-measures this. Sampled at\n// random, 8x8 boards SPRAWL: over half exhaust a 40,000-state cap and half of\n// those are still unresolved at six million, twelve seconds apiece, because an\n// unsolvable board has to exhaust its whole reachable component. That is what\n// "8x8 is out of reach" meant when it was measured on random boards. The climb\n// does not go there: it walks toward tightly jammed boards, which are deep AND\n// narrow, so only 4% of the candidates it actually evaluates hit the cap, and\n// it reaches par 54 in the same wall clock that gets 7x7 to 38.`);

// ─── 25. CLAUDE.md — the living document gets the new convention ───────────
edit('CLAUDE.md',
  `below anything round three ever generates, so it hands nobody a live answer.\n`,
  `below anything round three ever generates, so it hands nobody a live answer.

## Junkyard (\`/junkyard\`) — the 8x8 jam, and A FAMILY IS A LADDER (launched 2026-09-04)

Key/route/folder \`junkyard\`, category **Logic**, \`keepsAnswer: true\`, \`attempts: 'graded'\`,
\`miss: 'Tries'\` — Parker's and Impound's shape exactly. Legacy accent \`#5c3a16\` / \`#d9b070\`, a
third step down the same brown ramp so the three read as a family on a slate row. Bank **150
boards, 2026-09-04 to 2027-01-31**, seed 20260904/771103, generated in two halves. Wired by
\`scripts/wire-junkyard.mjs\` (51 anchored edits, idempotent). No PNG tile; the glyph is the icon.

**EIGHT BY EIGHT IS THE LAST RUNG THIS FAMILY CAN HAVE.** \`lib/jam-core\` packs occupancy into two
32-bit words and a position into three bits, so 64 cells and n <= 8 are both hard ceilings and
\`compile()\` throws above them. A fourth size is a different engine, not a bigger argument. Say
"the biggest lot" in copy rather than "a bigger one", because it is the end of the line.

**⚠️ "8x8 IS OUT OF REACH" WAS MEASURED ON RANDOM BOARDS, AND THAT IS THE WRONG POPULATION.** The
finding recorded when Impound was built (a 400-board sample that did not finish in ten minutes) is
true of RANDOM packings and irrelevant to a generator that CLIMBS. Random 8x8 boards sprawl: over
half exhaust a 40,000-state cap, and half of THOSE are still unresolved at six million states,
twelve seconds apiece, because an unsolvable board has to exhaust its whole reachable component
before it can be called unsolvable. The climb never goes there. It walks toward tightly jammed
boards, which are deep AND narrow, so only **4% of the candidates it actually evaluates hit the
cap**, and it reaches **par 54 in the wall clock that gets 7x7 to 38**. Before re-deriving a
"this size is impossible" conclusion, measure the population the generator actually visits.

**THE LADDER'S STEP SHORTENS AT THE THIRD RUNG, on purpose.** Impound's Monday opens exactly where
Parker's hardest weekday rung begins, and repeating that step would put Junkyard's Monday at 28
and, compounded through the within-week floor, its Sunday floor near 50 against a measured ceiling
of about 54 — the coin toss Impound's own Sunday floor had to be measured down twice to avoid. So
Junkyard opens at 22 to 28: clear of Impound's whole Monday band, deeper than any Parker board
short of a Sunday, and reachable every week. Rungs: Mon 22-28, Tue 25-32, Wed 28-35, Thu 31-39,
Fri 34-43, Sat 37-47, **Sunday 44 and up**. \`scripts/verify-junkyard.mjs\` check 8 asserts the
claim that is TRUE of the bank rather than the one that would have been tidy, which is the third
time this family's "bigger game" check has had to be weakened to match reality.

### A FAMILY IS A LADDER, and finishing one rung offers the next (owner, 2026-09-04)

\`GAME_FAMILIES\` in \`lib/daily-games.js\` is the ONLY place a family is declared:
\`{ jam: ['park', 'impound', 'junkyard'] }\`, in ascending board size. \`familyAfter(key)\` returns the
rest of that family CYCLICALLY from the rung after the one just finished, so the offer always moves
up and wraps at the top; every other daily is in no family and gets \`[]\`, so a caller uses it
unconditionally.

**\`app/useNextUnplayed.js\` prefers a family member over a mere category-mate**, in both hooks
(\`useNextUnplayed\` for the one Up next pick, \`useUnplayedSimilar\` for the tile list). That one file
covers all 80 clients, because every one of them already routes its finish through those hooks into
\`StageFinish\`'s \`forward\` slot. Do NOT add a per-game next-up prop.

**⚠️ A MISSING FAMILY KEY IS DROPPED SILENTLY.** The pick resolves each key against a roster before
offering it, so a member absent from that roster does not error, does not warn, and does not render:
the ladder just loses a rung. And there are TWO rosters — \`lib/daily-games.js\` and the independent
copy in \`app/DailyEndCard.jsx\`, which is the one \`useNextUnplayed\` actually reads. \`verify-junkyard\`
check 10 requires every member in BOTH, requires the ladder to be in ascending board size, requires
the hook to still import and use \`familyAfter\`, and exercises the offer across all eight
played-combinations of the three games. All four mutations were confirmed to fail it.

**A second family needs only a line in \`GAME_FAMILIES\`** plus its sizes in check 10. Nothing else
in the pick is jam-specific.
`);

flush();

console.log(`wire-junkyard: ${applied} edits applied, ${skipped} already present`);
