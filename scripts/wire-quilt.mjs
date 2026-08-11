// Wire Quilt into every registry that has to know about a daily game.
//
//   node scripts/wire-quilt.mjs [root]      default root = the repo
//
// WHY THIS IS A SCRIPT AND NOT A PILE OF HAND EDITS. Two reasons, both learned
// the hard way in this repo:
//
//   1. THE STALE-BASE RULE. A direct push updates .git but not the working tree,
//      so the copy on disk is stale the moment anything else lands. Deploys here
//      must splice into files extracted from the SAME fetch as the push. That
//      means these edits have to be replayable against a fresh extract rather
//      than living only in the working tree, which is exactly what this file is.
//   2. HALF A REGISTRY EDIT FAILS SILENTLY. Adding a game to DailyGamesGrid's
//      CATEGORIES but not its GAMES row drops it with no error and no gap; the
//      slate rail's roster is a separate hardcoded list that two previous games
//      both missed. Every edit below therefore throws if its anchor is absent,
//      so a moved anchor is a loud failure instead of a quiet omission.
//
// Every patch is idempotent: a file that already mentions quilt in the right
// place is left alone, so re-running against a partially wired tree is safe.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || '.';
const KEY = 'quilt';
let edits = 0;

function edit(rel, fn) {
  const p = path.join(ROOT, rel);
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before, (from, to, opts = {}) => {
    const { all = false, skipIf = null } = opts;
    return (src) => {
      if (skipIf && src.includes(skipIf)) return src;
      const n = src.split(from).length - 1;
      if (n === 0) throw new Error(`${rel}: anchor not found: ${JSON.stringify(String(from).slice(0, 80))}`);
      if (!all && n > 1) throw new Error(`${rel}: anchor matched ${n} times: ${JSON.stringify(String(from).slice(0, 80))}`);
      return all ? src.split(from).join(to) : src.replace(from, to);
    };
  });
  if (after !== before) { fs.writeFileSync(p, after); edits++; console.log(`  patched ${rel}`); }
  else console.log(`  (already wired) ${rel}`);
}

// Apply a chain of replacement thunks, skipping the whole chain when the file
// already carries the marker.
const chain = (src, marker, ...fns) => (src.includes(marker) ? src : fns.reduce((acc, f) => f(acc), src));

// ── 1. the single source of truth ────────────────────────────────────────────
edit('lib/daily-games.js', (src, R) => chain(src, `key: '${KEY}'`,
  R(`  { key: 'carve', miss: 'Errors', name: 'Carve',`,
    `  { key: 'quilt', miss: null, name: 'Quilt', cat: 'Numbers', tag: 'Sudoku with no straight lines', how: 'The nine boxes have been redrawn into nine crooked regions. Every row, column and region still holds one through nine exactly once.', color: '#a21caf', colorNavy: '#eda5e6' },\n  { key: 'carve', miss: 'Errors', name: 'Carve',`)));

// ── 2. Sunday Editions ───────────────────────────────────────────────────────
edit('lib/sunday-editions.js', (src, R) => chain(src, `'${KEY}'`,
  R(`//   suds    harder grid, fewer givens`,
    `//   suds    harder grid, fewer givens\n//   quilt   26 printed clues instead of the weekday 30-34`),
  R(`  'crux', 'emcee', 'span', 'tally', 'suds',`,
    `  'crux', 'emcee', 'span', 'tally', 'suds', 'quilt',`)));

// ── 3. the end card: colour, finish icon, tile copy, launch pin ──────────────
// `Puzzle` is already among the lucide imports here, so this adds no import.
edit('app/DailyEndCard.jsx', (src, R) => chain(src, `${KEY}:`,
  R(`  suds:   { accent: '#ea580c', badgeBg: '#ea580c', badgeInk: T.white, Fin: Grid3x3 },`,
    `  suds:   { accent: '#ea580c', badgeBg: '#ea580c', badgeInk: T.white, Fin: Grid3x3 },\n  quilt:  { accent: '#a21caf', badgeBg: '#a21caf', badgeInk: T.white, Fin: Puzzle },`),
  R(`  { key: 'carve',  cat: 'numbers',   name: 'Carve',`,
    `  { key: 'quilt',  cat: 'numbers',   name: 'Quilt',  tag: 'Sudoku with no straight lines', blurb: 'The same 9x9 grid, but the boxes are nine crooked regions instead of squares.', href: '/quilt' },\n  { key: 'carve',  cat: 'numbers',   name: 'Carve',`),
  R(`const LAUNCH_PIN = { keys: ['defend',`, `const LAUNCH_PIN = { keys: ['quilt', 'defend',`)));

// ── 4. the launch-pin mirror ─────────────────────────────────────────────────
edit('app/api/quiz/daily-order/route.js', (src, R) => chain(src, `'${KEY}'`,
  R(`const LAUNCH_PIN = { keys: ['defend',`, `const LAUNCH_PIN = { keys: ['quilt', 'defend',`)));

// ── 5. the promo strip ───────────────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx', (src, R) => chain(src, `key: '${KEY}'`,
  R(`  { key: 'suds', href: '/suds', name: 'Suds', tag: 'the daily 9×9 sudoku', store: 'sot_suds_day', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)' },`,
    `  { key: 'suds', href: '/suds', name: 'Suds', tag: 'the daily 9×9 sudoku', store: 'sot_suds_day', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)' },\n  { key: 'quilt', href: '/quilt', name: 'Quilt', tag: 'the daily jigsaw sudoku', store: 'sot_quilt_day', accent: '#a21caf', bg: '#fdf4ff', border: 'rgba(162,28,175,0.4)' },`)));

// ── 6. the more-games grid: BOTH lists, or the tile is dropped with no error ──
edit('app/DailyGamesGrid.jsx', (src, R) => chain(src, `key: '${KEY}'`,
  R(`  { key: 'suds', href: '/suds', name: 'Suds', tag: 'The daily sudoku', img: '/games/btn-suds.png' },`,
    `  { key: 'suds', href: '/suds', name: 'Suds', tag: 'The daily sudoku', img: '/games/btn-suds.png' },\n  { key: 'quilt', href: '/quilt', name: 'Quilt', tag: 'The daily jigsaw sudoku', img: '/games/btn-quilt.png' },`),
  R(`keys: ['tally', 'suds', 'carve', 'cipher', 'crunch', 'blitz'] }`,
    `keys: ['tally', 'suds', 'quilt', 'carve', 'cipher', 'crunch', 'blitz'] }`)));

// ── 7. the home slate ────────────────────────────────────────────────────────
edit('app/DailyStrip.jsx', (src, R) => chain(src, `key: '${KEY}'`,
  R(`  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day', tag: "Equal-sum blocks" , cat: 'Numbers' },`,
    `  { key: 'quilt', href: '/quilt', name: 'Quilt', img: '/games/btn-quilt.png', store: 'sot_quilt_day', tag: "Sudoku with no straight lines" , cat: 'Numbers' },\n  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day', tag: "Equal-sum blocks" , cat: 'Numbers' },`),
  R(`const ACCENTS = { crux: '#5b9bff',`, `const ACCENTS = { quilt: '#eda5e6', crux: '#5b9bff',`),
  R(`const TCOL = { crux: T.blue,`, `const TCOL = { quilt: '#a21caf', crux: T.blue,`)));

// ── 8. the archive: import AND the stripped map AND the card, or the build dies
edit('app/daily/page.js', (src, R) => chain(src, `'${KEY}'`,
  R(`import { PUZZLES as SUDS } from '../suds/puzzles';`,
    `import { PUZZLES as SUDS } from '../suds/puzzles';\nimport { PUZZLES as QUILT_FULL } from '../quilt/puzzles';`),
  R(`  { key: 'suds', name: 'Suds', path: '/suds', tag: 'Fill the 9×9 grid, 1–9', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)', src: SUDS },`,
    `  { key: 'suds', name: 'Suds', path: '/suds', tag: 'Fill the 9×9 grid, 1–9', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)', src: SUDS },\n  { key: 'quilt', name: 'Quilt', path: '/quilt', tag: 'Nine crooked regions, 1–9', accent: '#a21caf', bg: '#fdf4ff', border: 'rgba(162,28,175,0.4)', src: QUILT },`)));

// The archive strips each bank down to the fields the client needs, so answers
// never ship. Quilt's `reg` is NOT an answer (the region map is drawn on the
// board from the first moment) but the archive has no use for it either, so it
// is stripped along with everything else.
edit('app/daily/page.js', (src, R) => chain(src, 'const QUILT =',
  R(`import { PUZZLES as QUILT_FULL } from '../quilt/puzzles';`,
    `import { PUZZLES as QUILT_FULL } from '../quilt/puzzles';\nconst QUILT = QUILT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`)));

// ── 9. archive categories + navy accent ──────────────────────────────────────
edit('app/daily/DailyArchiveClient.jsx', (src, R) => chain(src, `${KEY}:`,
  R(`keys: ['tally', 'suds', 'carve', 'cipher', 'crunch', 'blitz'] }`,
    `keys: ['tally', 'suds', 'quilt', 'carve', 'cipher', 'crunch', 'blitz'] }`),
  R(`  tally: '#4cb377', suds: '#f0894c',`, `  quilt: '#eda5e6', tally: '#4cb377', suds: '#f0894c',`)));

// ── 10. sitemap ──────────────────────────────────────────────────────────────
edit('lib/sitemap-entries.js', (src, R) => chain(src, `/${KEY}\``,
  R("    { url: `${baseUrl}/suds`, lastModified: newestOfFormat('suds'), changeFrequency: 'daily', priority: 0.9 },",
    "    { url: `${baseUrl}/suds`, lastModified: newestOfFormat('suds'), changeFrequency: 'daily', priority: 0.9 },\n    { url: `${baseUrl}/quilt`, lastModified: newestOfFormat('quilt'), changeFrequency: 'daily', priority: 0.9 },")));

// ── 11. the three puzzle-map consumers ───────────────────────────────────────
for (const rel of ['app/api/quiz/daily-unplayed/route.js', 'app/api/quiz/daily-game/route.js', 'lib/daily-slate.js']) {
  edit(rel, (src, R) => chain(src, `P_${KEY}`,
    R(`import { PUZZLES as P_suds } from '@/app/suds/puzzles';`,
      `import { PUZZLES as P_suds } from '@/app/suds/puzzles';\nimport { PUZZLES as P_quilt } from '@/app/quilt/puzzles';`),
    R(`suds: P_suds,`, `suds: P_suds, quilt: P_quilt,`)));
}

// ── 12. the hardcoded alternations ───────────────────────────────────────────
edit('app/api/quiz/daily-status/route.js', (src, R) => chain(src, `|${KEY}|`,
  R(`|tally|suds|circa|`, `|tally|suds|quilt|circa|`)));
edit('app/quizzes/QuizHomeClient.jsx', (src, R) => chain(src, `|${KEY}|`,
  R(`|tally|suds|circa|`, `|tally|suds|quilt|circa|`)));
edit('lib/quiz-catalog.js', (src, R) => chain(src, `'${KEY}'`,
  R(`'tally', 'suds', 'circa',`, `'tally', 'suds', 'quilt', 'circa',`)));

// ── 13. the A-Z slate rail (missed by the last two games that shipped) ───────
edit('app/DailySlateRail.jsx', (src, R) => chain(src, `'${KEY}'`,
  R(`'dating', 'tally', 'suds', 'carve',`, `'dating', 'tally', 'suds', 'quilt', 'carve',`)));

// ── 14. the share card ───────────────────────────────────────────────────────
// A real generated board off a throwaway seed, confirmed absent from the bank,
// so the card is internally consistent (every region really does hold 1-9 once)
// without ever showing a board a player is about to be given.
const QUILT_CARD = `
// ---------------------------------------------------------------------------
// Quilt share card — snapshot of the game. The demo board is a real generated
// Quilt board from a throwaway seed, checked against the shipped bank so it can
// never spoil a day. Evergreen.
function quiltBoardEl() {
  const CELL = 44, FS = 25;
  const TINT = ['#fdf2f8', '#eff6ff', '#f0fdf4', '#fefce8', '#faf5ff', '#ecfeff', '#fff7ed', '#f1f5f9', '#f7fee7'];
  const reg = [[1,1,1,1,1,0,0,2,2],[1,1,1,0,0,0,2,2,2],[1,3,0,0,0,2,2,2,2],[3,3,3,4,0,4,4,8,8],[6,3,4,4,4,4,4,8,5],[6,3,3,3,3,8,4,8,5],[6,7,7,7,8,8,8,8,5],[6,6,7,7,7,5,5,5,5],[6,6,6,6,7,7,7,5,5]];
  const demo = [[0,6,4,2,0,0,7,0,0],[0,0,8,0,4,2,0,0,7],[7,9,0,0,0,4,0,1,0],[1,0,0,6,0,0,0,2,3],[0,8,0,4,0,0,9,0,0],[0,2,0,3,0,0,0,0,9],[2,3,0,0,0,0,8,0,0],[0,0,0,0,2,0,0,8,0],[0,5,0,9,8,0,4,0,0]];
  const wall = 'rgba(28,30,36,0.85)', hair = 'rgba(28,30,36,0.22)';
  const cellEl = (r, c) => {
    const v = demo[r][c];
    const right = c === 8 ? hair : (reg[r][c + 1] !== reg[r][c] ? wall : hair);
    const bottom = r === 8 ? hair : (reg[r + 1][c] !== reg[r][c] ? wall : hair);
    return h('div', { key: \`\${r},\${c}\`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: TINT[reg[r][c]],
      borderTop: \`1px solid \${hair}\`, borderLeft: \`1px solid \${hair}\`,
      borderRight: \`\${c === 8 || reg[r][c + 1] !== reg[r][c] ? 2 : 1}px solid \${right}\`,
      borderBottom: \`\${r === 8 || reg[r + 1][c] !== reg[r][c] ? 2 : 1}px solid \${bottom}\`,
      fontSize: FS, fontWeight: 700, color: '#0b0c0e',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: \`r\${r}\`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY ROW, COLUMN & REGION HOLDS 1–9'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildQuiltCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#1e3a8a 55%,#a21caf)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Quilt', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#a21caf', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#a21caf', margin: '16px 0 18px' } }),
      T('Sudoku with no straight lines.', { fontSize: 33, fontWeight: 800, color: '#a21caf', letterSpacing: '-0.5px' }),
      T('The nine boxes have been redrawn into nine crooked regions. Every row, column and region still holds 1–9 exactly once, and there is always a line to the answer that never needs a guess.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/QUILT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, quiltBoardEl()),
  ]);
}

export async function renderQuiltCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildQuiltCard(), { ...size, fonts });
}
`;
edit('lib/og-brand-card.js', (src, R) => chain(src, 'renderQuiltCard',
  R(`// ---------------------------------------------------------------------------
// Circa share card`, `${QUILT_CARD}
// ---------------------------------------------------------------------------
// Circa share card`)));

// ── 15. the living document ──────────────────────────────────────────────────
// A game with a Sunday Edition has to appear in CLAUDE.md's table, per the
// "Adding a Sunday Edition" steps in that section.
edit('CLAUDE.md', (src, R) => chain(src, '| Quilt |',
  R(`| Suds | harder grid, fewer givens |`,
    `| Suds | harder grid, fewer givens |\n| Quilt | 26 printed clues instead of the weekday 30 to 34 (from 2026-08-11) |`)));

console.log(`\nwired Quilt into ${edits} file(s)`);
