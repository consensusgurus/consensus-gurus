#!/usr/bin/env node
// wire-sixes — apply the Sixes registry edits to a FRESH copy of origin/main.
//
//   node scripts/wire-sixes.mjs <dir-of-origin-checkouts>
//
// Adding a daily game means new files under app/<key>/ PLUS edits to about
// twenty registries, and HALF of them fail SILENTLY when missed: a key in
// DailyGamesGrid's CATEGORIES with no GAMES row is dropped with no error, a
// missing DailySlateRail entry just makes the A-Z rail one short, a missing
// blue tile quietly falls back to the full-colour one. So the edits are written
// once, here, as ANCHORED replacements rather than done by hand across twenty
// files.
//
// Two properties matter and both are enforced below:
//
//   1. EVERY anchor must be found EXACTLY ONCE, or the script throws. A silent
//      no-op is the whole failure mode this exists to prevent, so a moved or
//      reworded anchor is a hard stop rather than a shrug.
//   2. It runs against files read out of a same-step `git show FETCH_HEAD:...`,
//      never the working tree. The working tree does not fast-forward after a
//      direct push, so editing it and pushing the result silently overwrites
//      whatever landed in between (CLAUDE.md, the stale-base rule).
//
// Idempotent: a file that already names 'sixes' at the anchor is left alone and
// reported as already wired, so a re-run after a partial push is safe.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/wire-sixes.mjs <dir>'); process.exit(2); }

// Every edit: [file, anchor, replacement]. The anchor is matched literally and
// must occur exactly once.
const EDITS = [
  // 1. The registry row. Single source of truth: drives DAILY_KEYS,
  //    DAILY_DATED_RE, admin analytics, DailyBoardPanel, daily-combined and the
  //    canonical daily order. `miss: null` because nothing is ever counted
  //    against a Sixes player: the board is a race on the clock.
  //    The row goes LAST, after Barter: the registry is in launch order and
  //    Sixes is the newest game on the site.
  ['lib/daily-games.js',
    `budget of the proven minimum plus five.', color: '#be123c', colorNavy: '#fb7fa2' },\n];`,
    `budget of the proven minimum plus five.', color: '#be123c', colorNavy: '#fb7fa2' },
  { key: 'sixes', miss: null, name: 'Sixes', cat: 'Numbers', tag: 'The daily mini sudoku', how: 'A 6x6 sudoku in six boxes two squares tall and three wide. Every row, column and box holds 1 to 6 exactly once. The short one: about two minutes, nothing counts against you, and the clock decides the day.', color: '#1d4ed8', colorNavy: '#7da2f5' },
];`],

  // 2. Sunday Editions: Sixes authors real Sundays (cost band 56+, above every
  //    weekday band), so it belongs in the game-level registry the four
  //    puzzle-blind surfaces read.
  ['lib/sunday-editions.js',
    `  'barter', 'plot',`,
    `  'barter', 'plot', 'sixes',`],
  ['lib/sunday-editions.js',
    `//   barter  a 7x7 lattice`,
    `//   sixes   a grid in the top fraction of a percent of the difficulty
//           distribution: cost 56 and up, where the hardest weekday board in
//           the bank is 51. On a 6x6 that means ten to fourteen squares you can
//           only get by asking where a digit must go, against none on a Monday.
//   barter  a 7x7 lattice`],

  // 3. The Loft format flag, keyed by the slug the client hands DailyChrome.
  ['lib/loft.js',
    `  'span', 'stands', 'stet', 'strata', 'streak', 'suds',`,
    `  'sixes', 'span', 'stands', 'stet', 'strata', 'streak', 'suds',`],

  // 4. lib/daily-slate.js — /api/quiz/daily-combined and daily-me both read
  //    GAME_PUZZLES from here rather than owning a copy.
  ['lib/daily-slate.js',
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';`,
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';\nimport { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`],
  ['lib/daily-slate.js',
    `  barter: P_barter, plot: P_plot,`,
    `  barter: P_barter, plot: P_plot, sixes: P_sixes,`],

  // 5. The end card: accent, finish icon, tile copy, and the launch pin that
  //    surfaces a new game while it is still new.
  ['app/DailyEndCard.jsx',
    `  barter: { accent: '#be123c',`,
    `  sixes:  { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: Grid2x2 },\n  barter: { accent: '#be123c',`],
  ['app/DailyEndCard.jsx',
    `  { key: 'sando',  cat: 'numbers',   name: 'Sando',`,
    `  { key: 'sixes',  cat: 'numbers',   name: 'Sixes',  tag: 'The daily mini sudoku',     blurb: 'A 6x6 sudoku in boxes two tall and three wide. The short one: nothing counts against you, so the clock decides the day.', href: '/sixes' },\n  { key: 'sando',  cat: 'numbers',   name: 'Sando',`],
  ['app/DailyEndCard.jsx',
    `const LAUNCH_PIN = { keys: ['plot',`,
    `const LAUNCH_PIN = { keys: ['sixes', 'plot',`],

  // 6. The daily-order route mirrors that launch pin.
  ['app/api/quiz/daily-order/route.js',
    `const LAUNCH_PIN = { keys: ['plot',`,
    `const LAUNCH_PIN = { keys: ['sixes', 'plot',`],

  // 7. The promo strip.
  ['app/DailyGamesPromo.jsx',
    `  { key: 'barter', href: '/barter',`,
    `  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'the daily mini sudoku', store: 'sot_sixes_day', accent: '#1d4ed8', bg: '#eef3ff', border: 'rgba(29,78,216,0.4)' },\n  { key: 'barter', href: '/barter',`],

  // 8. DailyGamesGrid — TWO lists in ONE file, and half an edit fails silently
  //    (the grid maps CATEGORIES keys through GAMES_BY_KEY and .filter(Boolean)
  //    them away). Both are done here.
  ['app/DailyGamesGrid.jsx',
    `  { key: 'sando', href: '/sando', name: 'Sando', tag: 'The daily sandwich sudoku', img: '/games/btn-sando.png' },`,
    `  { key: 'sando', href: '/sando', name: 'Sando', tag: 'The daily sandwich sudoku', img: '/games/btn-sando.png' },\n  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'The daily mini sudoku', img: '/games/btn-sixes.png' },`],
  ['app/DailyGamesGrid.jsx',
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`,
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`],

  // 9. The slate row on every daily page.
  ['app/DailyStrip.jsx',
    `  { key: 'sando', href: '/sando', name: 'Sando', img: '/games/btn-sando.png', store: 'sot_sando_day', tag: "The daily sandwich sudoku" , cat: 'Numbers' },`,
    `  { key: 'sando', href: '/sando', name: 'Sando', img: '/games/btn-sando.png', store: 'sot_sando_day', tag: "The daily sandwich sudoku" , cat: 'Numbers' },\n  { key: 'sixes', href: '/sixes', name: 'Sixes', img: '/games/btn-sixes.png', store: 'sot_sixes_day', tag: "The daily mini sudoku" , cat: 'Numbers' },`],

  // 10. The A-Z slate rail. Its own hardcoded roster, and it was missed by both
  //     Suffice and Docket; the rail's "N/nn" count is the fastest tell.
  ['app/DailySlateRail.jsx',
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot',`,
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes',`],

  // 11. The /daily archive needs BOTH the import AND the stripped map. Adding
  //     only the import is a ReferenceError that fails the Vercel build.
  ['app/daily/page.js',
    `import { PUZZLES as SANDO_FULL } from '../sando/puzzles';`,
    `import { PUZZLES as SANDO_FULL } from '../sando/puzzles';\nimport { PUZZLES as SIXES_FULL } from '../sixes/puzzles';`],
  ['app/daily/page.js',
    `const SANDO = SANDO_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
    `const SANDO = SANDO_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst SIXES = SIXES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
  ['app/daily/page.js',
    `  { key: 'sando', name: 'Sando', path: '/sando',`,
    `  { key: 'sixes', name: 'Sixes', path: '/sixes', tag: 'Mini sudoku, 1 to 6', accent: '#1d4ed8', bg: '#eef3ff', border: 'rgba(29,78,216,0.4)', src: SIXES },\n  { key: 'sando', name: 'Sando', path: '/sando',`],

  // 12. The archive client: category membership and the navy accent.
  ['app/daily/DailyArchiveClient.jsx',
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`,
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`],
  ['app/daily/DailyArchiveClient.jsx',
    `  barter: '#fb7fa2', plot: '#e0a86a',`,
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5',`],

  // 13. Sitemap.
  ['lib/sitemap-entries.js',
    `    { url: \`\${baseUrl}/barter\`, lastModified: newestOfFormat('barter'), changeFrequency: 'daily', priority: 0.9 },`,
    `    { url: \`\${baseUrl}/barter\`, lastModified: newestOfFormat('barter'), changeFrequency: 'daily', priority: 0.9 },\n    { url: \`\${baseUrl}/sixes\`, lastModified: newestOfFormat('sixes'), changeFrequency: 'daily', priority: 0.9 },`],

  // 14. The two routes that still own their own puzzle maps.
  ['app/api/quiz/daily-unplayed/route.js',
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';`,
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';\nimport { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`],
  ['app/api/quiz/daily-unplayed/route.js',
    `cages: P_cages, sando: P_sando, barter: P_barter, plot: P_plot };`,
    `cages: P_cages, sando: P_sando, barter: P_barter, plot: P_plot, sixes: P_sixes };`],
  ['app/api/quiz/daily-game/route.js',
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';`,
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';\nimport { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`],
  ['app/api/quiz/daily-game/route.js',
    `barter: P_barter, plot: P_plot,`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes,`],

  // 14b. The Sunday slate route owns a THIRD copy of the puzzle map. It is not
  //     in the registry checklist in memory and was found only by sweeping for
  //     files that name a dozen daily keys and not the new one. Sixes runs a
  //     real Sunday Edition, so it has to be here or Sunday's slate is short.
  ['app/api/quiz/sunday-slate/route.js',
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';`,
    `import { PUZZLES as P_barter } from '@/app/barter/puzzles';\nimport { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`],
  ['app/api/quiz/sunday-slate/route.js',
    `barter: P_barter, plot: P_plot };`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes };`],

  // 15. The two hardcoded quiz-id alternations.
  ['app/api/quiz/daily-status/route.js',
    `|cages|sando|barter|plot)-\\d+-\\d+-\\d+$/;`,
    `|cages|sando|barter|plot|sixes)-\\d+-\\d+-\\d+$/;`],
  ['app/quizzes/QuizHomeClient.jsx',
    `|cages|sando|barter|plot)-/;`,
    `|cages|sando|barter|plot|sixes)-/;`],

  // 16. The Sunday Editions table in CLAUDE.md, which is the doc a future
  //     session reads to find out which games have one and what changes.
  ['CLAUDE.md',
    `\n**Every daily on the roster runs a Sunday Edition.**`,
    `| Sixes | a grid in the top fraction of a percent of the difficulty distribution: ten to fourteen squares reachable only by a hidden single, against none on a Monday (from launch, 2026-08-14) |\n\n**Every daily on the roster runs a Sunday Edition.**`],

  // 17. quiz-catalog's WORD_GAME_FORMATS. A no-op for a standalone daily, but
  //     the set is kept matching the roster so the audit sweep stays clean.
  ['lib/quiz-catalog.js',
    `'cages', 'sando', 'barter', 'plot']);`,
    `'cages', 'sando', 'barter', 'plot', 'sixes']);`],
];

// The share card is an append, not a replacement, so it is handled separately.
const OG_CARD = readFileSync(new URL('./sixes-og-card.txt', import.meta.url), 'utf8');

let changed = 0; let already = 0;
const touched = new Set();
for (const [file, anchor, replacement] of EDITS) {
  const path = join(dir, file);
  if (!existsSync(path)) throw new Error(`${file}: not in the checkout — did the fetch land?`);
  const src = readFileSync(path, 'utf8');
  if (src.includes(replacement)) { already++; continue; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor found ${n} times, expected exactly 1 — the file moved under us:\n    ${anchor.slice(0, 120)}`);
  writeFileSync(path, src.replace(anchor, replacement));
  touched.add(file);
  changed++;
}

// og-brand-card: append renderSixesCard at the end of the file.
{
  const path = join(dir, 'lib/og-brand-card.js');
  const src = readFileSync(path, 'utf8');
  if (src.includes('renderSixesCard')) already++;
  else {
    writeFileSync(path, `${src.replace(/\s*$/, '\n')}\n${OG_CARD}`);
    touched.add('lib/og-brand-card.js');
    changed++;
  }
}

// A DailyEndCard icon has to be IMPORTED as well as named, and the import list
// is a multi-line block, so it gets its own targeted insert.
{
  const path = join(dir, 'app/DailyEndCard.jsx');
  const src = readFileSync(path, 'utf8');
  if (!/\bGrid2x2\b\s*,/.test(src.slice(0, src.indexOf('} from \'lucide-react\'')))) {
    const m = src.match(/^import \{\n/m);
    if (!m) throw new Error('DailyEndCard.jsx: could not find the lucide import block');
    writeFileSync(path, src.replace(/^import \{\n/m, 'import {\n  Grid2x2,\n'));
    touched.add('app/DailyEndCard.jsx');
    changed++;
  } else already++;
}

console.log(`${changed} edit(s) applied, ${already} already in place`);
console.log([...touched].sort().map((f) => `  ${f}`).join('\n'));
