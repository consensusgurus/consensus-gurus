// scripts/wire-impound.mjs — wires the daily game `impound` into every registry.
//
// An ANCHORED script, per the daily-game checklist and in the shape of
// scripts/wire-blitzed.mjs: half these registries fail SILENTLY when missed (a
// key in one list and not its partner is dropped with no error and no gap), so
// every anchor must match EXACTLY ONCE or the script throws. Idempotent: an
// edit whose replacement is already present is skipped, so a re-run after a
// partial push is safe.
//
//   node scripts/wire-impound.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree.
//
// Impound sits directly after Parker in every ordered list, because it IS
// Parker on a bigger lot and the two should read as the pair they are.
//
// THREE REGISTRIES HERE ARE NOT IN THE CHECKLIST, found 2026-09-04 tracing
// Parker's copy, and none of them throws when missed: lib/loft.js (the game
// loses the shared chrome), lib/sitemap-entries.js (separate from app/sitemap,
// and keyed by ROUTE rather than key) and lib/puzzle-categories.js (the
// category landing page, whose roster COUNT is spelled out as a word).
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-impound.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 140)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'Parker on a bigger lot';
// THE FIRST TWO SENTENCES ARE THE SHARE CARD. lib/og-stage-cards trims `how` to
// whole sentences under 150 characters, so a `how` that opens with a three word
// sentence and then runs long puts THREE WORDS on the card and nothing else,
// which is what the first draft ("The bigger Parker. ...") baked. These two
// sentences come to 108 characters together and say the whole game; the third
// carries the flavour and is only ever read on the game page.
const HOW = 'Parker on a seven by seven lot. Everything is still stuck on one axis and there is still one gap in the wall. The lot is wider, the trucks run longer, and the shortest way out is nowhere near the one you can see.';
// The legacy accent pair (pre-stage surfaces still read these). The stage
// paints the Logic category step, like every daily since 2026-08-26, so these
// two only decide how the row reads on the old slate. Deliberately a shade off
// Parker's #7c5c2e / #f0cf9a rather than identical to it: the two games sit
// next to each other in every Logic list and an identical hue would make them
// one entry read twice.
const COLOR = '#6b4a1f', NAVY = '#e3bd85';
const BG = '#f3ece0', BORDER = 'rgba(107,74,31,0.35)';

// ─── 1. lib/daily-games.js — the single source of truth, one row, plus the premiere
edit('lib/daily-games.js',
  `  { key: 'park', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Parker', href: '/parker', cat: 'Logic', tag: 'Get the red one out', how: 'Everybody has blocked you in, every block is stuck on one axis, and there is one gap in the wall.', color: '#7c5c2e', colorNavy: '#f0cf9a' },`,
  `  { key: 'park', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Parker', href: '/parker', cat: 'Logic', tag: 'Get the red one out', how: 'Everybody has blocked you in, every block is stuck on one axis, and there is one gap in the wall.', color: '#7c5c2e', colorNavy: '#f0cf9a' },\n  // Impound is Parker on a 7x7 lot, and it is a SEPARATE GAME rather than a\n  // bigger Parker because every banked Parker board, every stored perfect and\n  // every leaderboard row behind them assumes six. Same attempts shape as\n  // Parker: it never hands over its answer, a replay of the same board is the\n  // design, and every finish is a win of some size, so it ranks on score then\n  // on how many runs it took.\n  { key: 'impound', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Impound', cat: 'Logic', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);
edit('lib/daily-games.js',
  `  { key: 'whittle', from: '2026-09-04', until: '2026-09-08' },\n];`,
  `  { key: 'whittle', from: '2026-09-04', until: '2026-09-08' },\n  { key: 'impound', from: '2026-09-05', until: '2026-09-09' },\n];`);

// ─── 2. app/DailyEndCard.jsx — the lucide import, LAUNCH_PIN, GAME_META, tile copy
// The import goes FIRST and is its own edit: wire-encore silently dropped one of
// these and shipped a ReferenceError at render, which is why the idempotency
// test above compares the WHOLE replacement rather than a suffix of it.
edit('app/DailyEndCard.jsx',
  `  Clapperboard, Quote, ZoomIn, Axe,\n} from 'lucide-react';`,
  `  Clapperboard, Quote, ZoomIn, Axe, Truck,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['whittle',`,
  `const LAUNCH_PIN = { keys: ['impound', 'whittle',`);
edit('app/DailyEndCard.jsx',
  `  park: { accent: '#7c5c2e', badgeBg: '#7c5c2e', badgeInk: T.white, Fin: Car },`,
  `  park: { accent: '#7c5c2e', badgeBg: '#7c5c2e', badgeInk: T.white, Fin: Car },\n  impound: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Truck },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'park',   cat: 'logic',     name: 'Parker', tag: 'Get the red one out',         blurb: 'A jammed parking lot. Slide the other cars aside and drive the red one free in as few moves as you can.', href: '/parker' },`,
  `  { key: 'park',   cat: 'logic',     name: 'Parker', tag: 'Get the red one out',         blurb: 'A jammed parking lot. Slide the other cars aside and drive the red one free in as few moves as you can.', href: '/parker' },\n  { key: 'impound',   cat: 'logic',     name: 'Impound', tag: '${TAG}',         blurb: 'Parker on a seven by seven lot, with around twenty blocks in your way. Same one gap in the wall, a good deal more between you and it.', href: '/impound' },`);

// ─── 3. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['whittle',`,
  `const LAUNCH_PIN = { keys: ['impound', 'whittle',`);

// ─── 4. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'park', href: '/parker', name: 'Parker', tag: 'get the red one out', store: 'sot_park_day', accent: '#7c5c2e', bg: '#f6efe2', border: 'rgba(124,92,46,0.35)' },`,
  `  { key: 'park', href: '/parker', name: 'Parker', tag: 'get the red one out', store: 'sot_park_day', accent: '#7c5c2e', bg: '#f6efe2', border: 'rgba(124,92,46,0.35)' },\n  { key: 'impound', href: '/impound', name: 'Impound', tag: 'parker on a bigger lot', store: 'sot_impound_day', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}' },`);

// ─── 5. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'park', href: '/parker', name: 'Parker', tag: 'Get the red one out', img: '/games/btn-park.png' },`,
  `  { key: 'park', href: '/parker', name: 'Parker', tag: 'Get the red one out', img: '/games/btn-park.png' },\n  { key: 'impound', href: '/impound', name: 'Impound', tag: '${TAG}', img: '/games/btn-impound.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn', 'axiom', 'hearsay', 'venn', 'stands', 'etch', 'hedge', 'park', 'fib', 'suffice', 'paths', 'chomp', 'docket', 'plot'] },`,
  `  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn', 'axiom', 'hearsay', 'venn', 'stands', 'etch', 'hedge', 'park', 'impound', 'fib', 'suffice', 'paths', 'chomp', 'docket', 'plot'] },`);

// ─── 6. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'park', href: '/parker', name: 'Parker', img: '/games/btn-park.png', store: 'sot_park_day', tag: "Get the red one out" , cat: 'Logic' },`,
  `  { key: 'park', href: '/parker', name: 'Parker', img: '/games/btn-park.png', store: 'sot_park_day', tag: "Get the red one out" , cat: 'Logic' },\n  { key: 'impound', href: '/impound', name: 'Impound', img: '/games/btn-impound.png', store: 'sot_impound_day', tag: "${TAG}" , cat: 'Logic' },`);
edit('app/DailyStrip.jsx', `const ACCENTS = { whittle:`, `const ACCENTS = { impound: '${NAVY}', whittle:`);
edit('app/DailyStrip.jsx', `const TCOL = { whittle:`, `const TCOL = { impound: '${COLOR}', whittle:`);

// ─── 7. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as PARK_FULL } from '../parker/puzzles';`,
  `import { PUZZLES as PARK_FULL } from '../parker/puzzles';\nimport { PUZZLES as IMPOUND_FULL } from '../impound/puzzles';`);
// The .map() is a SEPARATE edit and it is the one that fails the build when it
// is missed: adding only the import gives `ReferenceError: IMPOUND is not
// defined`, which is a Vercel build failure rather than a silent gap.
edit('app/daily/page.js',
  `const PARK = PARK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const PARK = PARK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst IMPOUND = IMPOUND_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'park', name: 'Parker', path: '/parker', tag: 'Get the red one out', accent: '#7c5c2e', bg: '#f6efe2', border: 'rgba(124,92,46,0.35)', src: PARK },`,
  `  { key: 'park', name: 'Parker', path: '/parker', tag: 'Get the red one out', accent: '#7c5c2e', bg: '#f6efe2', border: 'rgba(124,92,46,0.35)', src: PARK },\n  { key: 'impound', name: 'Impound', path: '/impound', tag: '${TAG}', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}', src: IMPOUND },`);

// ─── 8. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn', 'axiom', 'hearsay', 'venn', 'stands', 'etch', 'hedge', 'park', 'fib', 'suffice', 'paths', 'chomp', 'docket', 'plot'] },`,
  `  { key: 'logic', label: 'Logic', keys: ['alibi', 'jester', 'sworn', 'axiom', 'hearsay', 'venn', 'stands', 'etch', 'hedge', 'park', 'impound', 'fib', 'suffice', 'paths', 'chomp', 'docket', 'plot'] },`);
edit('app/daily/DailyArchiveClient.jsx', `park: '#f0cf9a',`, `park: '#f0cf9a', impound: '${NAVY}',`);

// ─── 9. lib/sitemap-entries.js — NOT in the checklist, and keyed by ROUTE ───
edit('lib/sitemap-entries.js',
  `'mate', 'four', 'parker', 'check',`,
  `'mate', 'four', 'parker', 'impound', 'check',`);

// ─── 10. the FOUR puzzle-map registries (sunday-slate included: Impound runs one)
for (const f of ['lib/daily-slate.js', 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js', 'app/api/quiz/sunday-slate/route.js']) {
  edit(f, `import { PUZZLES as P_park } from '@/app/parker/puzzles';`,
    `import { PUZZLES as P_park } from '@/app/parker/puzzles';\nimport { PUZZLES as P_impound } from '@/app/impound/puzzles';`);
  edit(f, `park: P_park,`, `park: P_park, impound: P_impound,`);
}

// ─── 11. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js', `|park|`, `|park|impound|`);

// ─── 12. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx', `|park|`, `|park|impound|`);

// ─── 13. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'crunch', 'taire', 'fib', 'streak',`,
  `  'listed', 'mate', 'four', 'park', 'impound', 'check', 'rung', 'crunch', 'taire', 'fib', 'streak',`);

// ─── 14. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'four', 'park', 'check',`, `'four', 'park', 'impound', 'check',`);

// ─── 15. lib/loft.js — NOT in the checklist. Without this the client renders
// the pre-Loft page. Keyed by the client's SLUG, which is the route: Impound's
// route and key are the same word, so it is listed plainly.
edit('lib/loft.js',
  `  'mate', 'mercury', 'niche', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`,
  `  'impound', 'mate', 'mercury', 'niche', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`);

// ─── 16. lib/sunday-editions.js — Impound runs one, so it must be listed AND
// its Sunday puzzles must carry sunday: true. The bank does; verify-impound
// fails any board whose flag disagrees with the real weekday.
edit('lib/sunday-editions.js',
  `//   park    (Parker) a perfect line in the thirties instead of the high teens`,
  `//   park    (Parker) a perfect line in the thirties instead of the high teens\n//   impound a perfect line of 34 to 50 against a weekday 16 to 35, on the same\n//           7x7 lot. Depth is the knob rather than size, for the same reason\n//           Parker's is: the board is already at the size its exact solver can\n//           re-prove cheaply, and an 8x8 Sunday would take the verifier out of\n//           reach for one board a week`);
edit('lib/sunday-editions.js',
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'hinge', 'sums', 'crunch', 'taire', 'finesse', 'fib',`,
  `  'listed', 'mate', 'four', 'park', 'impound', 'check', 'rung', 'hinge', 'sums', 'crunch', 'taire', 'finesse', 'fib',`);

// ─── 17. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// Keyed UNQUOTED, like every other entry, and a missing one renders NO icon
// and no error.
edit('lib/game-glyphs.js',
  `  park: 'M4 8h9v4H4zM15 8h5v4M4 14h5v4M11 14h9v4M20 10v8',    // the red one out`,
  `  park: 'M4 8h9v4H4zM15 8h5v4M4 14h5v4M11 14h9v4M20 10v8',    // the red one out
  // Impound draws the WALL, which Parker's glyph leaves out, because the wall
  // and its one gap are what the bigger lot is about: the same red block, more
  // traffic around it, and the only way out cut through the right-hand side.
  impound: 'M20 9V4H4v16h16v-5M7 10h6v4H7zM16 5v5M7 16h9',    // a fuller lot, one gap`);

// ─── 18. lib/par.js — no code change, but the SCOPE comment names its games ─
edit('lib/par.js',
  `// Every banked board on Parker, Rung and Taire carries the exact solver`,
  `// Every banked board on Parker, Impound, Rung and Taire carries the exact solver`);
edit('lib/par.js',
  `// SCOPE: this model belongs to Parker, Rung and Taire, whose par stands in for`,
  `// SCOPE: this model belongs to Parker, Impound, Rung and Taire, whose par stands in for`);

// ─── 19. lib/puzzle-categories.js — NOT in the checklist. The /logic-puzzles
// landing page, whose roster COUNT is spelled out as a WORD in two of its
// fields. Sixteen becomes Seventeen in BOTH or the page contradicts its own list.
edit('lib/puzzle-categories.js',
  `    description: 'Sixteen free daily logic puzzles: a nonogram, slitherlink, shikaku, sliding block puzzle, whodunit deduction grids, liar puzzles and more.`,
  `    description: 'Seventeen free daily logic puzzles: a nonogram, slitherlink, shikaku, two sizes of sliding block puzzle, whodunit deduction grids, liar puzzles and more.`);
edit('lib/puzzle-categories.js',
  `    lede: 'Sixteen logic puzzles with one new board apiece every day. Pencil-and-paper classics (a nonogram, a slitherlink loop, shikaku rectangles, a sliding block puzzle) alongside`,
  `    lede: 'Seventeen logic puzzles with one new board apiece every day. Pencil-and-paper classics (a nonogram, a slitherlink loop, shikaku rectangles, a sliding block puzzle in two sizes) alongside`);
edit('lib/puzzle-categories.js',
  `    keys: ['etch', 'hedge', 'plot', 'park', 'paths', 'jester', 'fib', 'axiom', 'venn', 'stands', 'alibi', 'sworn', 'hearsay', 'docket', 'suffice', 'chomp'],`,
  `    keys: ['etch', 'hedge', 'plot', 'park', 'impound', 'paths', 'jester', 'fib', 'axiom', 'venn', 'stands', 'alibi', 'sworn', 'hearsay', 'docket', 'suffice', 'chomp'],`);
edit('lib/puzzle-categories.js',
  `      etch: 'Nonogram (picross)', hedge: 'Slitherlink', plot: 'Shikaku', park: 'Sliding block puzzle', paths: 'Network puzzle',`,
  `      etch: 'Nonogram (picross)', hedge: 'Slitherlink', plot: 'Shikaku', park: 'Sliding block puzzle', impound: 'Sliding block puzzle (larger board)', paths: 'Network puzzle',`);
edit('lib/puzzle-categories.js',
  `Parker is the sliding block puzzle where you get the red one out.',`,
  `Parker is the sliding block puzzle where you get the red one out, and Impound is the same puzzle on a bigger lot.',`);

console.log(`wire-impound: ${applied} edits applied, ${skipped} already present`);
