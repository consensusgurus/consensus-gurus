// scripts/wire-blitzed.mjs — wires the daily game `blitzed` into every registry.
//
// An ANCHORED script, per the daily-game checklist and in the shape of
// scripts/wire-thread.mjs: half these registries fail SILENTLY when missed (a
// key in one list and not its partner is dropped with no error and no gap), so
// every anchor must match EXACTLY ONCE or the script throws. Idempotent: an
// edit whose replacement is already present is skipped, so a re-run after a
// partial push is safe.
//
//   node scripts/wire-blitzed.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree. The og card body is read from <dir>/__blitzed-card.js and
// removed after the append.
//
// Blitzed sits right after Blitz in every ordered list, so the two read as
// the pair they are.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-blitzed.mjs <dir>'); process.exit(1); }

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

const TAG = 'Twenty problems, three numbers each';
const HOW = 'Blitz with a third element on every line: 5 + 10 × 2, never 47 × 6. Twenty problems climb from small chains to brackets, percentages with a tail, two-digit products and cubes, twenty seconds each, and one wrong answer ends the run. Multiply and divide before you add.';
// The legacy accent pair (pre-stage surfaces still read these). The stage
// itself paints the Numbers category step, like every daily since 2026-08-30.
const COLOR = '#3f6d1f', NAVY = '#a8e063';
const BG = '#eaf5e2', BORDER = 'rgba(63,109,31,0.4)';

// ─── 1. lib/daily-games.js — the single source of truth, one row, plus the premiere
edit('lib/daily-games.js',
  `  { key: 'blitz', miss: 'Asked', name: 'Blitz', cat: 'Numbers', tag: 'Twenty problems, one life', how: 'Mental arithmetic against the clock. Twenty problems climb from the times tables to two-digit multiplication and cubes, fifteen seconds each, and one wrong answer ends the run.', color: '#657512', colorNavy: '#c3d94a' },`,
  `  { key: 'blitz', miss: 'Asked', name: 'Blitz', cat: 'Numbers', tag: 'Twenty problems, one life', how: 'Mental arithmetic against the clock. Twenty problems climb from the times tables to two-digit multiplication and cubes, fifteen seconds each, and one wrong answer ends the run.', color: '#657512', colorNavy: '#c3d94a' },\n  { key: 'blitzed', miss: 'Asked', name: 'Blitzed', cat: 'Numbers', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);
edit('lib/daily-games.js',
  `  { key: 'focus', from: '2026-09-01', until: '2026-09-05' },\n];`,
  `  { key: 'focus', from: '2026-09-01', until: '2026-09-05' },\n  { key: 'blitzed', from: '2026-09-03', until: '2026-09-07' },\n];`);

// ─── 2. app/DailyEndCard.jsx — LAUNCH_PIN, GAME_META, tile copy ────────────
// (Sigma is already imported from lucide-react.)
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['thread', 'focus', 'script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['blitzed', 'thread', 'focus', 'script', 'quotes',`);
edit('app/DailyEndCard.jsx',
  `  blitz: { accent: '#657512', badgeBg: '#657512', badgeInk: T.white, Fin: Zap },`,
  `  blitz: { accent: '#657512', badgeBg: '#657512', badgeInk: T.white, Fin: Zap },\n  blitzed: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Sigma },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'blitz',  cat: 'numbers',   name: 'Blitz',  tag: 'Twenty problems, one life',   blurb: 'Mental arithmetic against a fifteen second clock. Twenty problems, getting harder, and one wrong answer ends the run.', href: '/blitz' },`,
  `  { key: 'blitz',  cat: 'numbers',   name: 'Blitz',  tag: 'Twenty problems, one life',   blurb: 'Mental arithmetic against a fifteen second clock. Twenty problems, getting harder, and one wrong answer ends the run.', href: '/blitz' },\n  { key: 'blitzed',  cat: 'numbers',   name: 'Blitzed',  tag: '${TAG}',   blurb: 'Blitz with a third number on every line, like 5 + 10 × 2. Twenty problems, twenty seconds each, and one wrong answer ends the run.', href: '/blitzed' },`);

// ─── 3. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['thread', 'focus', 'script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['blitzed', 'thread', 'focus', 'script', 'quotes',`);

// ─── 4. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', tag: 'twenty problems, one life', store: 'sot_blitz_day', accent: '#657512', bg: '#f3f7de', border: 'rgba(101,117,18,0.4)' },`,
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', tag: 'twenty problems, one life', store: 'sot_blitz_day', accent: '#657512', bg: '#f3f7de', border: 'rgba(101,117,18,0.4)' },\n  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: 'twenty problems, three numbers each', store: 'sot_blitzed_day', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}' },`);

// ─── 5. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', tag: 'Twenty problems, one life', img: '/games/btn-blitz.png' },`,
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', tag: 'Twenty problems, one life', img: '/games/btn-blitz.png' },\n  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', tag: '${TAG}', img: '/games/btn-blitzed.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed'] },`);

// ─── 6. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', img: '/games/btn-blitz.png', store: 'sot_blitz_day', tag: "Twenty problems, one life" , cat: 'Numbers' },`,
  `  { key: 'blitz', href: '/blitz', name: 'Blitz', img: '/games/btn-blitz.png', store: 'sot_blitz_day', tag: "Twenty problems, one life" , cat: 'Numbers' },\n  { key: 'blitzed', href: '/blitzed', name: 'Blitzed', img: '/games/btn-blitzed.png', store: 'sot_blitzed_day', tag: "${TAG}" , cat: 'Numbers' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { thread: '#e9a3d0',`,
  `const ACCENTS = { blitzed: '${NAVY}', thread: '#e9a3d0',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { thread: '#8b2c6b',`,
  `const TCOL = { blitzed: '${COLOR}', thread: '#8b2c6b',`);

// ─── 7. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as BLITZ_FULL } from '../blitz/puzzles';`,
  `import { PUZZLES as BLITZ_FULL } from '../blitz/puzzles';\nimport { PUZZLES as BLITZED_FULL } from '../blitzed/puzzles';`);
edit('app/daily/page.js',
  `const BLITZ = BLITZ_FULL.map(({ num, quizId, live, dateLabel }) => ({ num, quizId, live, dateLabel }));`,
  `const BLITZ = BLITZ_FULL.map(({ num, quizId, live, dateLabel }) => ({ num, quizId, live, dateLabel }));\nconst BLITZED = BLITZED_FULL.map(({ num, quizId, live, dateLabel }) => ({ num, quizId, live, dateLabel }));`);
edit('app/daily/page.js',
  `  { key: 'blitz', name: 'Blitz', path: '/blitz', tag: 'Twenty problems, one life', accent: '#657512', bg: '#f3f7de', border: 'rgba(101,117,18,0.4)', src: BLITZ },`,
  `  { key: 'blitz', name: 'Blitz', path: '/blitz', tag: 'Twenty problems, one life', accent: '#657512', bg: '#f3f7de', border: 'rgba(101,117,18,0.4)', src: BLITZ },\n  { key: 'blitzed', name: 'Blitzed', path: '/blitzed', tag: '${TAG}', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}', src: BLITZED },`);

// ─── 8. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'calc', 'carve', 'cipher', 'crunch', 'blitz', 'blitzed'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `blitz: '#c3d94a',`,
  `blitz: '#c3d94a', blitzed: '${NAVY}',`);

// ─── 9. lib/sitemap-entries.js ──────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'queen', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`,
  `  'docket', 'plot', 'barter', 'sixes', 'niche', 'shoe', 'queen', 'defend', 'blitz', 'blitzed', 'strata', 'blocks', 'chomp',`);

// ─── 10. the THREE puzzle-map registries (no sunday-slate: Blitzed has no Sunday)
for (const f of ['lib/daily-slate.js', 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_blitz } from '@/app/blitz/puzzles';`,
    `import { PUZZLES as P_blitz } from '@/app/blitz/puzzles';\nimport { PUZZLES as P_blitzed } from '@/app/blitzed/puzzles';`);
  edit(f, `blitz: P_blitz,`, `blitz: P_blitz, blitzed: P_blitzed,`);
}

// ─── 11. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js', `|blitz|`, `|blitz|blitzed|`);

// ─── 12. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx', `|blitz|`, `|blitz|blitzed|`);

// ─── 13. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderBlitzedCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__blitzed-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__blitzed-card.js'), { force: true });
}

// ─── 14. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend',`,
  `'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'blitzed', 'defend',`);

// ─── 15. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'docket', 'blitz', 'defend',`, `'docket', 'blitz', 'blitzed', 'defend',`);

// ─── 16. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'alibi', 'anon', 'axiom', 'babel', 'barter', 'blitz',`,
  `  'alibi', 'anon', 'axiom', 'babel', 'barter', 'blitz', 'blitzed',`);

// ─── 17. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// Blitz's bolt, with the third element drawn on: the bolt plus three dots
// beneath it, one per number in the line. currentColor, tints to the
// Numbers step in either register.
edit('lib/game-glyphs.js',
  `  blitz: 'M4 7h5M6.5 4.5v5M15 7h5M5 16l4 4M9 16l-4 4M15 18h5M17.5 15v.01M17.5 21v.01',    // speed, one life`,
  `  blitz: 'M4 7h5M6.5 4.5v5M15 7h5M5 16l4 4M9 16l-4 4M15 18h5M17.5 15v.01M17.5 21v.01',    // speed, one life
  blitzed: 'M13 2L5 13h6l-1 9 8-11h-6z M4 21h.01M20 21h.01',                             // the bolt, three numbers wide`);

// ─── 18. lib/puzzle-categories.js — the /number-puzzles landing page ────────
edit('lib/puzzle-categories.js',
  `    description: 'Six free daily number puzzles: a countdown-style numbers game, a cryptarithm, mental arithmetic against the clock, a calculator path, and grid puzzles about sums. New boards at midnight Eastern, no signup.',
    lede: 'Six number puzzles, one new board in each every day. A six-numbers-one-target game, a cryptarithm where every letter is a digit, mental arithmetic against a clock, a calculator you walk across, and three grid puzzles about sums. For sudoku, there is a page of its own.',
    keys: ['blitz', 'crunch', 'calc', 'tally', 'carve', 'cipher'],
    generic: {
      blitz: 'Mental math', crunch: 'Numbers game',`,
  `    description: 'Seven free daily number puzzles: a countdown-style numbers game, a cryptarithm, mental arithmetic against the clock in two sizes, a calculator path, and grid puzzles about sums. New boards at midnight Eastern, no signup.',
    lede: 'Seven number puzzles, one new board in each every day. A six-numbers-one-target game, a cryptarithm where every letter is a digit, mental arithmetic against a clock with two numbers a line or three, a calculator you walk across, and three grid puzzles about sums. For sudoku, there is a page of its own.',
    keys: ['blitz', 'blitzed', 'crunch', 'calc', 'tally', 'carve', 'cipher'],
    generic: {
      blitz: 'Mental math', blitzed: 'Three-number mental math', crunch: 'Numbers game',`);

edit('lib/puzzle-categories.js',
  `Blitz is twenty mental arithmetic problems, fifteen seconds each, one wrong answer ends the run. Calc is`,
  `Blitz is twenty mental arithmetic problems, fifteen seconds each, one wrong answer ends the run; Blitzed is the same ladder with three numbers on every line, like 5 + 10 × 2, and twenty seconds. Calc is`);
edit('lib/puzzle-categories.js',
  `start: 'Blitz if you want a sprint. Crunch if you liked`,
  `start: 'Blitz if you want a sprint, Blitzed if you want the sprint with a second step. Crunch if you liked`);
edit('lib/puzzle-categories.js',
  `['Is any of this timed?', 'Blitz is; the rest are scored`,
  `['Is any of this timed?', 'Blitz and Blitzed are; the rest are scored`);

console.log(`wire-blitzed: ${applied} edits applied, ${skipped} already present`);
