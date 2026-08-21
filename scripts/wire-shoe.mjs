#!/usr/bin/env node
// wire-shoe — apply the Shoe registry edits to a FRESH copy of origin/main.
//
//   node scripts/wire-shoe.mjs <dir-of-origin-checkout>
//
// Adding a daily game means new files under app/shoe/ PLUS edits to about
// twenty registries, and HALF of them fail SILENTLY when missed (see
// scripts/wire-niche.mjs, the worked example this follows). Two properties,
// both enforced below:
//
//   1. EVERY anchor must be found EXACTLY ONCE, or the script throws. A silent
//      no-op is the whole failure mode this exists to prevent.
//   2. It runs against files read out of a same-step `git show FETCH_HEAD:...`
//      export, never the working tree (CLAUDE.md, the stale-base rule).
//
// Idempotent: a file that already names 'shoe' at the anchor is left alone.
//
// SHOE JOINS THE TABLE GAMES CIRCUIT (lib/circuits.js) as its fifth game —
// verify-circuits demands every eligible daily sit in exactly one circuit the
// moment the registry row lands. Its median clock is an ESTIMATE (100s,
// between Taire and Hands) until real play data exists.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/wire-shoe.mjs <dir>'); process.exit(2); }

const EDITS = [
  // 1. The registry row, LAST after Niche: the registry is in launch order.
  ['lib/daily-games.js',
    `color: '#115e59', colorNavy: '#3ecfbd' },\n];`,
    `color: '#115e59', colorNavy: '#3ecfbd' },
  { key: 'shoe', miss: 'Busts', name: 'Shoe', cat: 'Cards', tag: 'The daily blackjack shoe', how: 'Five hands of blackjack off one fixed shoe, the same cards in the same order for everyone. Par is what the book line banks on the day\\'s shoe; count what you have seen to beat it.', color: '#0c4a6e', colorNavy: '#7cc4ec' },
];`],

  // 2. Sunday Editions: Shoe's Sunday is seven hands off the whole deck.
  ['lib/sunday-editions.js',
    `  'barter', 'plot', 'sixes', 'niche',`,
    `  'barter', 'plot', 'sixes', 'niche', 'shoe',`],
  ['lib/sunday-editions.js',
    `//   niche   a 4x4 grid instead of the weekday 3x3, sixteen cells and twenty`,
    `//   shoe    seven hands of blackjack instead of five, dealt off the ENTIRE
//           52-card deck instead of a 36-card cut, so a perfect counter knows
//           exactly what is left (from launch, 2026-08-23)
//   niche   a 4x4 grid instead of the weekday 3x3, sixteen cells and twenty`],

  // 3. The Loft format flag (alphabetical slot).
  ['lib/loft.js',
    `  'sixes', 'span', 'stands', 'stet', 'strata', 'streak', 'suds',`,
    `  'shoe', 'sixes', 'span', 'stands', 'stet', 'strata', 'streak', 'suds',`],

  // 4. lib/daily-slate.js — daily-combined and daily-me read GAME_PUZZLES here.
  ['lib/daily-slate.js',
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';`,
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';\nimport { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`],
  ['lib/daily-slate.js',
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche,`,
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe,`],

  // 5. The end card: accent + finish icon (Layers is already imported),
  //    tile copy beside its Cards siblings, and the launch pin.
  ['app/DailyEndCard.jsx',
    `  niche:  { accent: '#115e59', badgeBg: '#115e59', badgeInk: T.white, Fin: LayoutGrid },`,
    `  niche:  { accent: '#115e59', badgeBg: '#115e59', badgeInk: T.white, Fin: LayoutGrid },\n  shoe:  { accent: '#0c4a6e', badgeBg: '#0c4a6e', badgeInk: T.white, Fin: Layers },`],
  ['app/DailyEndCard.jsx',
    `  { key: 'hands',  cat: 'cards',     name: 'Hands',  tag: 'The daily poker solitaire', blurb: 'Cards come one at a time into a grid where every row and column scores as a poker hand. Same deal for everybody, so it is decisions and not luck.', href: '/hands' },`,
    `  { key: 'hands',  cat: 'cards',     name: 'Hands',  tag: 'The daily poker solitaire', blurb: 'Cards come one at a time into a grid where every row and column scores as a poker hand. Same deal for everybody, so it is decisions and not luck.', href: '/hands' },\n  { key: 'shoe',  cat: 'cards',     name: 'Shoe',  tag: 'The daily blackjack shoe', blurb: 'Five hands of blackjack off one fixed shoe, the same cards for everybody. Par is the book line, and the count is how you beat it.', href: '/shoe' },`],
  ['app/DailyEndCard.jsx',
    `const LAUNCH_PIN = { keys: ['niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['shoe', 'niche', 'sixes',`],

  // 6. The daily-order route mirrors that launch pin.
  ['app/api/quiz/daily-order/route.js',
    `const LAUNCH_PIN = { keys: ['niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['shoe', 'niche', 'sixes',`],

  // 7. The promo strip (newest first).
  ['app/DailyGamesPromo.jsx',
    `  { key: 'niche', href: '/niche',`,
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'the daily blackjack shoe', store: 'sot_shoe_day', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)' },\n  { key: 'niche', href: '/niche',`],

  // 8. DailyGamesGrid — BOTH lists (a key in one and not the other drops
  //    silently).
  ['app/DailyGamesGrid.jsx',
    `  { key: 'niche', href: '/niche', name: 'Niche', tag: 'One answer, two categories', img: '/games/btn-niche.png' },`,
    `  { key: 'niche', href: '/niche', name: 'Niche', tag: 'One answer, two categories', img: '/games/btn-niche.png' },\n  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'The daily blackjack shoe', img: '/games/btn-shoe.png' },`],
  ['app/DailyGamesGrid.jsx',
    `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands'] },`,
    `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe'] },`],

  // 9. The slate row on every daily page.
  ['app/DailyStrip.jsx',
    `  { key: 'niche', href: '/niche', name: 'Niche', img: '/games/btn-niche.png', store: 'sot_niche_day', tag: "One answer, two categories" , cat: 'Trivia' },`,
    `  { key: 'niche', href: '/niche', name: 'Niche', img: '/games/btn-niche.png', store: 'sot_niche_day', tag: "One answer, two categories" , cat: 'Trivia' },\n  { key: 'shoe', href: '/shoe', name: 'Shoe', img: '/games/btn-shoe.png', store: 'sot_shoe_day', tag: "The daily blackjack shoe" , cat: 'Cards' },`],

  // 10. The A-Z slate rail (missed by both Suffice and Docket; the rail's
  //     "N/nn" count is the fastest tell).
  ['app/DailySlateRail.jsx',
    `'barter', 'plot', 'sixes', 'niche',`,
    `'barter', 'plot', 'sixes', 'niche', 'shoe',`],

  // 11. The /daily archive needs BOTH the import AND the stripped map.
  ['app/daily/page.js',
    `import { PUZZLES as NICHE_FULL } from '../niche/puzzles';`,
    `import { PUZZLES as NICHE_FULL } from '../niche/puzzles';\nimport { PUZZLES as SHOE_FULL } from '../shoe/puzzles';`],
  ['app/daily/page.js',
    `const NICHE = NICHE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
    `const NICHE = NICHE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst SHOE = SHOE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
  ['app/daily/page.js',
    `  { key: 'niche', name: 'Niche', path: '/niche',`,
    `  { key: 'shoe', name: 'Shoe', path: '/shoe', tag: 'The daily blackjack shoe', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)', src: SHOE },\n  { key: 'niche', name: 'Niche', path: '/niche',`],

  // 12. The archive client: category membership and the navy accent.
  ['app/daily/DailyArchiveClient.jsx',
    `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands'] },`,
    `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe'] },`],
  ['app/daily/DailyArchiveClient.jsx',
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd',`,
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd', shoe: '#7cc4ec',`],

  // 13. Sitemap.
  ['lib/sitemap-entries.js',
    `'sixes', 'niche',`,
    `'sixes', 'niche', 'shoe',`],

  // 14. The two routes that still own their own puzzle maps.
  ['app/api/quiz/daily-unplayed/route.js',
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';`,
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';\nimport { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`],
  ['app/api/quiz/daily-unplayed/route.js',
    `sixes: P_sixes, niche: P_niche };`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe };`],
  ['app/api/quiz/daily-game/route.js',
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';`,
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';\nimport { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`],
  ['app/api/quiz/daily-game/route.js',
    `sixes: P_sixes, niche: P_niche,`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe,`],

  // 14b. The Sunday slate route owns a THIRD copy of the puzzle map, and Shoe
  //      runs a real Sunday Edition.
  ['app/api/quiz/sunday-slate/route.js',
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';`,
    `import { PUZZLES as P_niche } from '@/app/niche/puzzles';\nimport { PUZZLES as P_shoe } from '@/app/shoe/puzzles';`],
  ['app/api/quiz/sunday-slate/route.js',
    `sixes: P_sixes, niche: P_niche };`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe };`],

  // 15. The two hardcoded quiz-id alternations.
  ['app/api/quiz/daily-status/route.js',
    `|barter|plot|sixes|niche)-\\d+-\\d+-\\d+$/;`,
    `|barter|plot|sixes|niche|shoe)-\\d+-\\d+-\\d+$/;`],
  ['app/quizzes/QuizHomeClient.jsx',
    `|barter|plot|sixes|niche)-/;`,
    `|barter|plot|sixes|niche|shoe)-/;`],

  // 16. The Sunday Editions table in CLAUDE.md.
  ['CLAUDE.md',
    `\n**Every daily on the roster runs a Sunday Edition.**`,
    `| Shoe | seven hands of blackjack instead of five, dealt off the entire 52-card deck instead of a 36-card cut, so a perfect counter knows exactly what is left (from launch, 2026-08-23) |\n\n**Every daily on the roster runs a Sunday Edition.**`],

  // 17. quiz-catalog's roster set (a no-op for a standalone daily, kept in
  //     step so the registry sweep stays clean).
  ['lib/quiz-catalog.js',
    `'sixes', 'niche']);`,
    `'sixes', 'niche', 'shoe']);`],

  // 18. CIRCUITS: Shoe joins Table Games as its fifth game, slotted by its
  //     estimated median between Taire and Hands. The circuit stays bronze;
  //     the count comment moves from the 64 split to the 65 split.
  ['lib/circuits.js',
    `    keys: ['chain', 'four', 'taire', 'hands'],                   // 30/30/78/112 = 250`,
    `    keys: ['chain', 'four', 'taire', 'shoe', 'hands'],           // 30/30/78/~100 est/112 = 350`],
  ['lib/circuits.js',
    `      invite: "Four games you would play across a table: two solitaires, and two boards a move away from won.",
      result: "Four games across a table.",`,
    `      invite: "Five games you would play across a table: two solitaires, a blackjack shoe, and two boards a move away from won.",
      result: "Five games across a table.",`],
  ['lib/circuits.js',
    `// at 64 games over 14 circuits, EIGHT OF FIVE AND SIX OF FOUR (Niche made
// Recall the eighth five on 2026-08-20) — and the no-tiny-circuits floor is
// worth insisting on, because a circuit's whole score is 15 points per game
// and a three-game circuit would top out at 45 against everybody else's 75.
// Against the 66 in the registry:`,
    `// at 65 games over 14 circuits, NINE OF FIVE AND FIVE OF FOUR (Niche made
// Recall the eighth five on 2026-08-20, Shoe made Table Games the ninth on
// 2026-08-21) — and the no-tiny-circuits floor is worth insisting on, because
// a circuit's whole score is 15 points per game and a three-game circuit would
// top out at 45 against everybody else's 75.
// Against the 67 in the registry:`],

  // 19. verify-circuits carries the median snapshot; a new game needs an entry
  //     or its circuit's ascent and tier go unchecked. Estimated, flagged.
  ['scripts/verify-circuits.mjs',
    `  niche: 150,
};`,
    `  niche: 150,
  // Shoe launched 2026-08-22 with no live clock data yet: estimated from its
  // shape (five click-through blackjack hands, between Taire and Hands).
  // Replace with the measured median at the next snapshot re-measure.
  shoe: 100,
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

// og-brand-card: append renderShoeCard at the end of the file.
{
  const OG_CARD = readFileSync(new URL('./shoe-og-card.txt', import.meta.url), 'utf8');
  const path = join(dir, 'lib/og-brand-card.js');
  const src = readFileSync(path, 'utf8');
  if (src.includes('renderShoeCard')) already++;
  else {
    writeFileSync(path, `${src.replace(/\s*$/, '\n')}\n${OG_CARD}`);
    touched.add('lib/og-brand-card.js');
    changed++;
  }
}

console.log(`${changed} edit(s) applied, ${already} already in place`);
console.log([...touched].sort().map((f) => `  ${f}`).join('\n'));
