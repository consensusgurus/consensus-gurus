// scripts/wire-sums-hinge.mjs — wires the daily games `sums` and `hinge` into
// every registry.
//
// An ANCHORED script, per the daily-game checklist and in the shape of
// scripts/wire-blitzed.mjs: half these registries fail SILENTLY when missed (a
// key in one list and not its partner is dropped with no error and no gap), so
// every anchor must match EXACTLY ONCE or the script throws. Idempotent: an
// edit whose replacement is already present is skipped, so a re-run after a
// partial push is safe.
//
//   node scripts/wire-sums-hinge.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree. Sums sits after Blitzed in every ordered Numbers list and
// Hinge after Rung in every ordered Word list. Both run a Sunday Edition, so
// both join lib/sunday-editions.js and the sunday-slate route.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-sums-hinge.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const S = {
  TAG: 'The daily kakuro',
  HOW: 'Every run of squares adds up to the total printed at its head, digits 1 to 9, and no digit repeats inside a run. One solution, reachable by deduction alone, and the clock decides the day. Weekdays are 7x7, the Sunday Edition is 11x11.',
  COLOR: '#be185d', NAVY: '#f472b6', BG: '#fce7f3', BORDER: 'rgba(190,24,93,0.4)',
  BLURB: 'The cross-sums crossword. Every run of squares adds up to the total at its head, digits 1 to 9, no repeats. One solution, and the clock decides the day.',
};
const H = {
  TAG: 'Chain the compounds',
  HOW: 'Six words in a chain, and you get the first and the last. Fill the four between so every pair of neighbours makes a compound word or a phrase everyone knows: fireplace, placemat, board game. Any chain that holds counts; a real word that does not hinge is a detour, and detours break ties on the clock.',
  COLOR: '#4f46e5', NAVY: '#a5b4fc', BG: '#e0e7ff', BORDER: 'rgba(79,70,229,0.4)',
  BLURB: 'First and last word given. Fill the chain so every pair of neighbours makes a compound word or a phrase everyone knows. Any chain that holds counts.',
};

// ─── 1. lib/daily-games.js — the single source of truth, plus the premieres ──
edit('lib/daily-games.js',
  `  { key: 'rung', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Rung', cat: 'Word',`,
  `  { key: 'hinge', miss: 'Detours', name: 'Hinge', cat: 'Word', tag: '${H.TAG}', how: '${H.HOW}', color: '${H.COLOR}', colorNavy: '${H.NAVY}' },\n  { key: 'rung', keepsAnswer: true, attempts: 'graded', miss: 'Tries', name: 'Rung', cat: 'Word',`);
edit('lib/daily-games.js',
  `  { key: 'blitzed', miss: 'Asked', name: 'Blitzed', cat: 'Numbers',`,
  `  { key: 'sums', miss: null, name: 'Sums', cat: 'Numbers', tag: '${S.TAG}', how: '${S.HOW}', color: '${S.COLOR}', colorNavy: '${S.NAVY}' },\n  { key: 'blitzed', miss: 'Asked', name: 'Blitzed', cat: 'Numbers',`);
edit('lib/daily-games.js',
  `  { key: 'blitzed', from: '2026-09-03', until: '2026-09-07' },\n];`,
  `  { key: 'blitzed', from: '2026-09-03', until: '2026-09-07' },\n  { key: 'sums', from: '2026-09-03', until: '2026-09-07' },\n  { key: 'hinge', from: '2026-09-03', until: '2026-09-07' },\n];`);

// ─── 2. lib/sunday-editions.js — both run one ────────────────────────────────
edit('lib/sunday-editions.js',
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'crunch', 'taire', 'fib',`,
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'hinge', 'sums', 'crunch', 'taire', 'fib',`);

// ─── 3. app/DailyEndCard.jsx — LAUNCH_PIN, GAME_META, tile copy ─────────────
// (Sigma and Link2 are already imported from lucide-react.)
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['blitzed', 'thread',`,
  `const LAUNCH_PIN = { keys: ['sums', 'hinge', 'blitzed', 'thread',`);
edit('app/DailyEndCard.jsx',
  `  blitzed: { accent: '#3f6d1f', badgeBg: '#3f6d1f', badgeInk: T.white, Fin: Sigma },`,
  `  blitzed: { accent: '#3f6d1f', badgeBg: '#3f6d1f', badgeInk: T.white, Fin: Sigma },\n  sums: { accent: '${S.COLOR}', badgeBg: '${S.COLOR}', badgeInk: T.white, Fin: Sigma },\n  hinge: { accent: '${H.COLOR}', badgeBg: '${H.COLOR}', badgeInk: T.white, Fin: Link2 },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'blitzed',  cat: 'numbers',   name: 'Blitzed',  tag: 'Twenty problems, three numbers each',`,
  `  { key: 'sums',  cat: 'numbers',   name: 'Sums',  tag: '${S.TAG}',   blurb: '${S.BLURB}', href: '/sums' },\n  { key: 'blitzed',  cat: 'numbers',   name: 'Blitzed',  tag: 'Twenty problems, three numbers each',`);
edit('app/DailyEndCard.jsx',
  `  { key: 'rung',   cat: 'word',      name: 'Rung',   tag: 'One letter at a time',`,
  `  { key: 'hinge',   cat: 'word',      name: 'Hinge',   tag: '${H.TAG}',   blurb: '${H.BLURB}', href: '/hinge' },\n  { key: 'rung',   cat: 'word',      name: 'Rung',   tag: 'One letter at a time',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['blitzed', 'thread',`,
  `const LAUNCH_PIN = { keys: ['sums', 'hinge', 'blitzed', 'thread',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'rung', href: '/rung', name: 'Rung', tag: 'one letter at a time',`,
  `  { key: 'hinge', href: '/hinge', name: 'Hinge', tag: 'chain the compounds', store: 'sot_hinge_day', accent: '${H.COLOR}', bg: '${H.BG}', border: '${H.BORDER}' },\n  { key: 'rung', href: '/rung', name: 'Rung', tag: 'one letter at a time',`);
edit('app/DailyGamesPromo.jsx',
  `  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: 'twenty problems, three numbers each',`,
  `  { key: 'sums', href: '/sums', name: 'Sums', tag: 'the daily kakuro', store: 'sot_sums_day', accent: '${S.COLOR}', bg: '${S.BG}', border: '${S.BORDER}' },\n  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: 'twenty problems, three numbers each',`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'rung', href: '/rung', name: 'Rung', tag: 'One letter at a time', img: '/games/btn-rung.png' },`,
  `  { key: 'rung', href: '/rung', name: 'Rung', tag: 'One letter at a time', img: '/games/btn-rung.png' },\n  { key: 'hinge', href: '/hinge', name: 'Hinge', tag: '${H.TAG}', img: '/games/btn-hinge.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: 'Twenty problems, three numbers each', img: '/games/btn-blitzed.png' },`,
  `  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: 'Twenty problems, three numbers each', img: '/games/btn-blitzed.png' },\n  { key: 'sums', href: '/sums', name: 'Sums', tag: '${S.TAG}', img: '/games/btn-sums.png' },`);
edit('app/DailyGamesGrid.jsx',
  `'glyph', 'anon', 'rung', 'babel', 'barter'] },`,
  `'glyph', 'anon', 'rung', 'hinge', 'babel', 'barter'] },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed'] },`,
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed', 'sums'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'rung', href: '/rung', name: 'Rung', img: '/games/btn-rung.png', store: 'sot_rung_day', tag: "One letter at a time" , cat: 'Word' },`,
  `  { key: 'rung', href: '/rung', name: 'Rung', img: '/games/btn-rung.png', store: 'sot_rung_day', tag: "One letter at a time" , cat: 'Word' },\n  { key: 'hinge', href: '/hinge', name: 'Hinge', img: '/games/btn-hinge.png', store: 'sot_hinge_day', tag: "${H.TAG}" , cat: 'Word' },`);
edit('app/DailyStrip.jsx',
  `  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', img: '/games/btn-blitzed.png', store: 'sot_blitzed_day', tag: "Twenty problems, three numbers each" , cat: 'Numbers' },`,
  `  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', img: '/games/btn-blitzed.png', store: 'sot_blitzed_day', tag: "Twenty problems, three numbers each" , cat: 'Numbers' },\n  { key: 'sums', href: '/sums', name: 'Sums', img: '/games/btn-sums.png', store: 'sot_sums_day', tag: "${S.TAG}" , cat: 'Numbers' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { blitzed: '#a8e063',`,
  `const ACCENTS = { sums: '${S.NAVY}', hinge: '${H.NAVY}', blitzed: '#a8e063',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { blitzed: '#3f6d1f',`,
  `const TCOL = { sums: '${S.COLOR}', hinge: '${H.COLOR}', blitzed: '#3f6d1f',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as BLITZED_FULL } from '../blitzed/puzzles';`,
  `import { PUZZLES as BLITZED_FULL } from '../blitzed/puzzles';\nimport { PUZZLES as SUMS_FULL } from '../sums/puzzles';\nimport { PUZZLES as HINGE_FULL } from '../hinge/puzzles';`);
edit('app/daily/page.js',
  `const BLITZED = BLITZED_FULL.map(({ num, quizId, live, dateLabel }) => ({ num, quizId, live, dateLabel }));`,
  `const BLITZED = BLITZED_FULL.map(({ num, quizId, live, dateLabel }) => ({ num, quizId, live, dateLabel }));\nconst SUMS = SUMS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst HINGE = HINGE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'blitzed', name: 'Blitzed', path: '/blitzed', tag: 'Twenty problems, three numbers each', accent: '#3f6d1f', bg: '#eaf5e2', border: 'rgba(63,109,31,0.4)', src: BLITZED },`,
  `  { key: 'blitzed', name: 'Blitzed', path: '/blitzed', tag: 'Twenty problems, three numbers each', accent: '#3f6d1f', bg: '#eaf5e2', border: 'rgba(63,109,31,0.4)', src: BLITZED },\n  { key: 'sums', name: 'Sums', path: '/sums', tag: '${S.TAG}', accent: '${S.COLOR}', bg: '${S.BG}', border: '${S.BORDER}', src: SUMS },`);
edit('app/daily/page.js',
  `  { key: 'rung', name: 'Rung', path: '/rung', tag: 'One letter at a time', accent: '#155e75', bg: '#e4f2f6', border: 'rgba(21,94,117,0.35)', src: RUNG },`,
  `  { key: 'rung', name: 'Rung', path: '/rung', tag: 'One letter at a time', accent: '#155e75', bg: '#e4f2f6', border: 'rgba(21,94,117,0.35)', src: RUNG },\n  { key: 'hinge', name: 'Hinge', path: '/hinge', tag: '${H.TAG}', accent: '${H.COLOR}', bg: '${H.BG}', border: '${H.BORDER}', src: HINGE },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed'] },`,
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed', 'sums'] },`);
// (the archive's Word list never got Rung when CATEGORIES was introduced; it
// rides along here, the same silent-drop class the grid fixed on 2026-08-08)
edit('app/daily/DailyArchiveClient.jsx',
  `'warmer', 'glyph', 'anon', 'babel', 'barter'] },`,
  `'warmer', 'glyph', 'anon', 'rung', 'hinge', 'babel', 'barter'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `blitz: '#c3d94a', blitzed: '#a8e063',`,
  `blitz: '#c3d94a', blitzed: '#a8e063', sums: '${S.NAVY}', hinge: '${H.NAVY}',`);

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `'defend', 'blitz', 'blitzed', 'strata',`,
  `'defend', 'blitz', 'blitzed', 'sums', 'hinge', 'strata',`);

// ─── 11. the puzzle-map registries, sunday-slate included (both run a Sunday) ─
for (const f of ['lib/daily-slate.js', 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_blitzed } from '@/app/blitzed/puzzles';`,
    `import { PUZZLES as P_blitzed } from '@/app/blitzed/puzzles';\nimport { PUZZLES as P_sums } from '@/app/sums/puzzles';\nimport { PUZZLES as P_hinge } from '@/app/hinge/puzzles';`);
  edit(f, `blitz: P_blitz, blitzed: P_blitzed,`, `blitz: P_blitz, blitzed: P_blitzed, sums: P_sums, hinge: P_hinge,`);
}
edit('app/api/quiz/sunday-slate/route.js',
  `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
  `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_sums } from '@/app/sums/puzzles';\nimport { PUZZLES as P_hinge } from '@/app/hinge/puzzles';`);
edit('app/api/quiz/sunday-slate/route.js', `sixes: P_sixes,`, `sixes: P_sixes, sums: P_sums, hinge: P_hinge,`);

// ─── 12. the two hardcoded alternations ─────────────────────────────────────
edit('app/api/quiz/daily-status/route.js', `|rung|`, `|rung|hinge|sums|`);
edit('app/quizzes/QuizHomeClient.jsx', `|rung|`, `|rung|hinge|sums|`);

// ─── 13. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'blitz', 'blitzed', 'defend',`,
  `'blitz', 'blitzed', 'sums', 'hinge', 'defend',`);

// ─── 14. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'rung', 'crunch'`, `'rung', 'hinge', 'sums', 'crunch'`);

// ─── 15. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'alibi', 'anon', 'axiom', 'babel', 'barter', 'blitz', 'blitzed',`,
  `  'alibi', 'anon', 'axiom', 'babel', 'barter', 'blitz', 'blitzed', 'sums', 'hinge',`);

// ─── 16. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// Sums: a crossword corner with a diagonal clue cell. Hinge: two links of a chain.
edit('lib/game-glyphs.js',
  `  blitzed: 'M13 2L5 13h6l-1 9 8-11h-6z M4 21h.01M20 21h.01',                             // the bolt, three numbers wide`,
  `  blitzed: 'M13 2L5 13h6l-1 9 8-11h-6z M4 21h.01M20 21h.01',                             // the bolt, three numbers wide
  sums: 'M3 3h18v18H3zM3 9h18M9 3v18M3 3l6 6M15 15v.01M15 9v.01M9 15v.01',                // a kakuro corner, the clue cell split
  hinge: 'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1', // two links of a chain`);

// ─── 17. lib/puzzle-categories.js — the two landing pages ───────────────────
edit('lib/puzzle-categories.js',
  `    keys: ['blitz', 'blitzed', 'crunch', 'calc', 'tally', 'carve', 'cipher'],
    generic: {
      blitz: 'Mental math', blitzed: 'Three-number mental math', crunch: 'Numbers game',`,
  `    keys: ['blitz', 'blitzed', 'crunch', 'calc', 'tally', 'carve', 'cipher', 'sums'],
    generic: {
      blitz: 'Mental math', blitzed: 'Three-number mental math', sums: 'Kakuro', crunch: 'Numbers game',`);
edit('lib/puzzle-categories.js',
  `    description: 'Seven free daily number puzzles: a countdown-style numbers game, a cryptarithm, mental arithmetic against the clock in two sizes, a calculator path, and grid puzzles about sums. New boards at midnight Eastern, no signup.',
    lede: 'Seven number puzzles, one new board in each every day. A six-numbers-one-target game, a cryptarithm where every letter is a digit, mental arithmetic against a clock with two numbers a line or three, a calculator you walk across, and three grid puzzles about sums. For sudoku, there is a page of its own.',`,
  `    description: 'Eight free daily number puzzles: a countdown-style numbers game, a cryptarithm, mental arithmetic against the clock in two sizes, a calculator path, a kakuro, and grid puzzles about sums. New boards at midnight Eastern, no signup.',
    lede: 'Eight number puzzles, one new board in each every day. A six-numbers-one-target game, a cryptarithm where every letter is a digit, mental arithmetic against a clock with two numbers a line or three, a calculator you walk across, a kakuro, and three grid puzzles about sums. For sudoku, there is a page of its own.',`);
edit('lib/puzzle-categories.js',
  `Tally fills a grid from a rack so every row and column adds to its target; Carve slices the grid into blocks that each add to the same number.',`,
  `Tally fills a grid from a rack so every row and column adds to its target; Carve slices the grid into blocks that each add to the same number. Sums is the kakuro: a crossword-shaped grid where every run of squares adds up to the total at its head, digits 1 to 9, no repeats.',`);
edit('lib/puzzle-categories.js',
  `    keys: ['garble', 'rung', 'links', 'warmer', 'stet', 'strata', 'lode', 'barter', 'tuck', 'babel', 'emcee', 'encore', 'crux', 'glyph', 'shards', 'anon'],
    generic: {
      garble: 'Word scramble', rung: 'Word ladder', links: 'Hidden groups',`,
  `    keys: ['garble', 'rung', 'hinge', 'links', 'warmer', 'stet', 'strata', 'lode', 'barter', 'tuck', 'babel', 'emcee', 'encore', 'crux', 'glyph', 'shards', 'anon'],
    generic: {
      garble: 'Word scramble', rung: 'Word ladder', hinge: 'Compound-word chain', links: 'Hidden groups',`);
edit('lib/puzzle-categories.js',
  `    description: 'Sixteen free daily word games in one place: word ladders, scrambles,`,
  `    description: 'Seventeen free daily word games in one place: word ladders, a compound-word chain, scrambles,`);
edit('lib/puzzle-categories.js',
  `    lede: 'Sixteen word games, one new puzzle in each every day. Ladders, scrambles,`,
  `    lede: 'Seventeen word games, one new puzzle in each every day. Ladders, a compound-word chain, scrambles,`);

console.log(`wire-sums-hinge: ${applied} edits applied, ${skipped} already present`);
