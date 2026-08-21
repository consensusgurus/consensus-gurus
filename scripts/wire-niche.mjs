#!/usr/bin/env node
// wire-niche — apply the Niche registry edits to a FRESH copy of origin/main.
//
//   node scripts/wire-niche.mjs <dir-of-origin-checkout>
//
// Adding a daily game means new files under app/niche/ PLUS edits to about
// twenty registries, and HALF of them fail SILENTLY when missed (see
// scripts/wire-sixes.mjs, the worked example this follows). Two properties,
// both enforced below:
//
//   1. EVERY anchor must be found EXACTLY ONCE, or the script throws. A silent
//      no-op is the whole failure mode this exists to prevent.
//   2. It runs against files read out of a same-step `git show FETCH_HEAD:...`
//      export, never the working tree (CLAUDE.md, the stale-base rule).
//
// Idempotent: a file that already names 'niche' at the anchor is left alone.
//
// NICHE ALSO JOINS A CIRCUIT (unlike sixes, which predates circuits):
// lib/circuits.js gains it in Recall, which verify-circuits demands the moment
// the registry row lands — a 64th eligible daily in no circuit fails the
// checker. Its median clock is an ESTIMATE until real play data exists.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/wire-niche.mjs <dir>'); process.exit(2); }

const EDITS = [
  // 1. The registry row, LAST after Sixes: the registry is in launch order.
  ['lib/daily-games.js',
    `The short one: about two minutes, nothing counts against you, and the clock decides the day.', color: '#1d4ed8', colorNavy: '#7da2f5' },\n];`,
    `The short one: about two minutes, nothing counts against you, and the clock decides the day.', color: '#1d4ed8', colorNavy: '#7da2f5' },
  { key: 'niche', miss: 'Misses', name: 'Niche', cat: 'Trivia', tag: 'One answer, two categories', how: 'Fill the grid with answers that fit both their row and their column, from a different universe every day of the week. The score is cells filled, and the flex is rarity: after every correct pick you see how few of the day\\'s players found the same one.', color: '#115e59', colorNavy: '#3ecfbd' },
];`],

  // 2. Sunday Editions: Niche's Sunday is the 4x4 Countries board.
  ['lib/sunday-editions.js',
    `  'barter', 'plot', 'sixes',`,
    `  'barter', 'plot', 'sixes', 'niche',`],
  ['lib/sunday-editions.js',
    `//   barter  a 7x7 lattice`,
    `//   niche   a 4x4 grid instead of the weekday 3x3, sixteen cells and twenty
//           guesses, always on Countries, the deepest universe (from launch,
//           2026-08-23)
//   barter  a 7x7 lattice`],

  // 3. The Loft format flag.
  ['lib/loft.js',
    `  'mate', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`,
    `  'mate', 'niche', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`],

  // 4. lib/daily-slate.js — daily-combined and daily-me read GAME_PUZZLES here.
  ['lib/daily-slate.js',
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_niche } from '@/app/niche/puzzles';`],
  ['lib/daily-slate.js',
    `  barter: P_barter, plot: P_plot, sixes: P_sixes,`,
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche,`],

  // 5. The end card: accent + finish icon (LayoutGrid is already imported),
  //    tile copy, and the launch pin.
  ['app/DailyEndCard.jsx',
    `  sixes:  { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: Grid2x2 },`,
    `  sixes:  { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: Grid2x2 },\n  niche:  { accent: '#115e59', badgeBg: '#115e59', badgeInk: T.white, Fin: LayoutGrid },`],
  ['app/DailyEndCard.jsx',
    `  { key: 'sixes',  cat: 'numbers',   name: 'Sixes',  tag: 'The daily mini sudoku',`,
    `  { key: 'niche',  cat: 'trivia',    name: 'Niche',  tag: 'One answer, two categories', blurb: 'Fill the grid with answers that fit both their row and their column, from a different universe every day. Rare picks are the flex.', href: '/niche' },\n  { key: 'sixes',  cat: 'numbers',   name: 'Sixes',  tag: 'The daily mini sudoku',`],
  ['app/DailyEndCard.jsx',
    `const LAUNCH_PIN = { keys: ['sixes',`,
    `const LAUNCH_PIN = { keys: ['niche', 'sixes',`],

  // 6. The daily-order route mirrors that launch pin.
  ['app/api/quiz/daily-order/route.js',
    `const LAUNCH_PIN = { keys: ['sixes',`,
    `const LAUNCH_PIN = { keys: ['niche', 'sixes',`],

  // 7. The promo strip.
  ['app/DailyGamesPromo.jsx',
    `  { key: 'sixes', href: '/sixes',`,
    `  { key: 'niche', href: '/niche', name: 'Niche', tag: 'one answer, two categories', store: 'sot_niche_day', accent: '#115e59', bg: '#ecfdf8', border: 'rgba(17,94,89,0.4)' },\n  { key: 'sixes', href: '/sixes',`],

  // 8. DailyGamesGrid — BOTH lists (a key in one and not the other drops
  //    silently).
  ['app/DailyGamesGrid.jsx',
    `  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'The daily mini sudoku', img: '/games/btn-sixes.png' },`,
    `  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'The daily mini sudoku', img: '/games/btn-sixes.png' },\n  { key: 'niche', href: '/niche', name: 'Niche', tag: 'One answer, two categories', img: '/games/btn-niche.png' },`],
  ['app/DailyGamesGrid.jsx',
    `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'redact', 'dating', 'extra'] },`,
    `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`],

  // 9. The slate row on every daily page.
  ['app/DailyStrip.jsx',
    `  { key: 'sixes', href: '/sixes', name: 'Sixes', img: '/games/btn-sixes.png', store: 'sot_sixes_day', tag: "The daily mini sudoku" , cat: 'Numbers' },`,
    `  { key: 'sixes', href: '/sixes', name: 'Sixes', img: '/games/btn-sixes.png', store: 'sot_sixes_day', tag: "The daily mini sudoku" , cat: 'Numbers' },\n  { key: 'niche', href: '/niche', name: 'Niche', img: '/games/btn-niche.png', store: 'sot_niche_day', tag: "One answer, two categories" , cat: 'Trivia' },`],

  // 10. The A-Z slate rail (missed by both Suffice and Docket; the rail's
  //     "N/nn" count is the fastest tell).
  ['app/DailySlateRail.jsx',
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes',`,
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche',`],

  // 11. The /daily archive needs BOTH the import AND the stripped map.
  ['app/daily/page.js',
    `import { PUZZLES as SIXES_FULL } from '../sixes/puzzles';`,
    `import { PUZZLES as SIXES_FULL } from '../sixes/puzzles';\nimport { PUZZLES as NICHE_FULL } from '../niche/puzzles';`],
  ['app/daily/page.js',
    `const SIXES = SIXES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
    `const SIXES = SIXES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst NICHE = NICHE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
  ['app/daily/page.js',
    `  { key: 'sixes', name: 'Sixes', path: '/sixes',`,
    `  { key: 'niche', name: 'Niche', path: '/niche', tag: 'One answer, two categories', accent: '#115e59', bg: '#ecfdf8', border: 'rgba(17,94,89,0.4)', src: NICHE },\n  { key: 'sixes', name: 'Sixes', path: '/sixes',`],

  // 12. The archive client: category membership and the navy accent.
  ['app/daily/DailyArchiveClient.jsx',
    `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'redact', 'dating', 'extra'] },`,
    `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`],
  ['app/daily/DailyArchiveClient.jsx',
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5',`,
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd',`],

  // 13. Sitemap.
  ['lib/sitemap-entries.js',
    `  'docket', 'plot', 'barter', 'sixes', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`,
    `  'docket', 'plot', 'barter', 'sixes', 'niche', 'defend', 'blitz', 'strata', 'blocks', 'chomp',`],

  // 14. The two routes that still own their own puzzle maps.
  ['app/api/quiz/daily-unplayed/route.js',
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_niche } from '@/app/niche/puzzles';`],
  ['app/api/quiz/daily-unplayed/route.js',
    `barter: P_barter, plot: P_plot, sixes: P_sixes };`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche };`],
  ['app/api/quiz/daily-game/route.js',
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_niche } from '@/app/niche/puzzles';`],
  ['app/api/quiz/daily-game/route.js',
    `barter: P_barter, plot: P_plot, sixes: P_sixes,`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche,`],

  // 14b. The Sunday slate route owns a THIRD copy of the puzzle map, and Niche
  //      runs a real Sunday Edition.
  ['app/api/quiz/sunday-slate/route.js',
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_niche } from '@/app/niche/puzzles';`],
  ['app/api/quiz/sunday-slate/route.js',
    `barter: P_barter, plot: P_plot, sixes: P_sixes };`,
    `barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche };`],

  // 15. The two hardcoded quiz-id alternations.
  ['app/api/quiz/daily-status/route.js',
    `|barter|plot|sixes)-\\d+-\\d+-\\d+$/;`,
    `|barter|plot|sixes|niche)-\\d+-\\d+-\\d+$/;`],
  ['app/quizzes/QuizHomeClient.jsx',
    `|barter|plot|sixes)-/;`,
    `|barter|plot|sixes|niche)-/;`],

  // 16. The Sunday Editions table in CLAUDE.md.
  ['CLAUDE.md',
    `\n**Every daily on the roster runs a Sunday Edition.**`,
    `| Niche | a 4x4 grid instead of the weekday 3x3, sixteen cells and twenty guesses, always on Countries, the deepest universe (from launch, 2026-08-23) |\n\n**Every daily on the roster runs a Sunday Edition.**`],

  // 17. quiz-catalog's roster set (a no-op for a standalone daily, kept in
  //     step so the registry sweep stays clean).
  ['lib/quiz-catalog.js',
    `'barter', 'plot', 'sixes']);`,
    `'barter', 'plot', 'sixes', 'niche']);`],

  // 18. CIRCUITS: Niche joins Recall (the trivia-recall circuit), slotted by
  //     its estimated median between Listed and Redact. The roster total moves
  //     to 567s, still silver, so the trophy row is untouched. The count
  //     comment moves from the 63 split to the 64 split.
  ['lib/circuits.js',
    `    keys: ['dating', 'extra', 'listed', 'redact'],               // 22/44/75/276 = 417`,
    `    keys: ['dating', 'extra', 'listed', 'niche', 'redact'],      // 22/44/75/~150 est/276 = 567`],
  ['lib/circuits.js',
    `// at 63 games over 14 circuits, SEVEN OF FIVE AND SEVEN OF FOUR, which is the
// only clean split of 63 into 14 — and it is worth insisting on, because a
// circuit's whole score is 15 points per game and a three-game circuit would
// top out at 45 against everybody else's 75. Against the 65 in the registry:`,
    `// at 64 games over 14 circuits, EIGHT OF FIVE AND SIX OF FOUR (Niche made
// Recall the eighth five on 2026-08-20) — and the no-tiny-circuits floor is
// worth insisting on, because a circuit's whole score is 15 points per game
// and a three-game circuit would top out at 45 against everybody else's 75.
// Against the 66 in the registry:`],

  // 19. verify-circuits carries the median snapshot; a new game needs an entry
  //     or its circuit's ascent and tier go unchecked. Estimated, flagged.
  ['scripts/verify-circuits.mjs',
    `  outwit: 90, outrank: 90, feud: 90,
};`,
    `  outwit: 90, outrank: 90, feud: 90,
  // Niche launched 2026-08-21 with no live clock data yet: estimated from its
  // shape (a type-ahead trivia grid, somewhere between Sixes and Blocks).
  // Replace with the measured median at the next snapshot re-measure.
  niche: 150,
};`],
];

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

// og-brand-card: append renderNicheCard at the end of the file.
{
  const OG_CARD = readFileSync(new URL('./niche-og-card.txt', import.meta.url), 'utf8');
  const path = join(dir, 'lib/og-brand-card.js');
  const src = readFileSync(path, 'utf8');
  if (src.includes('renderNicheCard')) already++;
  else {
    writeFileSync(path, `${src.replace(/\s*$/, '\n')}\n${OG_CARD}`);
    touched.add('lib/og-brand-card.js');
    changed++;
  }
}

console.log(`${changed} edit(s) applied, ${already} already in place`);
console.log([...touched].sort().map((f) => `  ${f}`).join('\n'));
