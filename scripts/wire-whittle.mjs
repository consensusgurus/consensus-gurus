// scripts/wire-whittle.mjs — wires the daily game `whittle` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not
// its partner is dropped with no error and no gap), so every anchor here must
// match EXACTLY ONCE or the script throws. It is idempotent — an edit whose
// replacement is already present is skipped — so a re-run after a partial push
// is safe.
//
//   node scripts/wire-whittle.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free. Pass `.` only
// when working locally against a tree you know is current.
//
// TWO REGISTRIES FROM THE CHECKLIST ARE GONE, and this is where that is
// recorded. `app/sitemap.js` no longer exists (item 10 is now lib/sitemap-
// entries.js alone), and item 14, appending a render<Key>Card to
// lib/og-brand-card.js, was retired on 2026-09-02 when the per-game Satori
// routes became static PNGs under public/og/. A new game's share card is now
// `node scripts/bake-og.mjs whittle`, drawn from its registry row and its
// glyph, so there is no card code to write and no opengraph-image.js or
// twitter-image.js route to add.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-whittle.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// The idempotency test is "is the finished text already here", i.e. the WHOLE
// replacement, never a suffix of it. See wire-encore.mjs for why.
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'The sudoku, backwards';
const HOW = 'A solved 6x6 sudoku with eighteen clues printed on it, and the play is taking them away: a clue comes out only while the grid still has exactly one answer. Nothing goes back, so the order is the whole game, and every board carries the proven fewest clues any order can leave.';
const COLOR = '#854d0e', NAVY = '#dcae6a';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
// `miss: 'Slips'` is the tap on a clue that will not come out. There is no slip
// budget: tapping every clue in turn is just a careless ORDER, which is what a
// careless order already scores, so there is nothing for a budget to defend.
edit('lib/daily-games.js',
  `  { key: 'flank', miss: 'Wrong', name: 'Flank',`,
  `  { key: 'whittle', miss: 'Slips', name: 'Whittle', cat: 'Sudoku', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },\n  { key: 'flank', miss: 'Wrong', name: 'Flank',`);

// ─── 2. lib/sunday-editions.js — the least forgiving deal of the week ───────
edit('lib/sunday-editions.js',
  `  'flank',`,
  `  'flank',\n  'whittle',`);

// ─── 3. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  Clapperboard, Quote, ZoomIn,\n} from 'lucide-react';`,
  `  Clapperboard, Quote, ZoomIn, Axe,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['finesse',`,
  `const LAUNCH_PIN = { keys: ['whittle', 'finesse',`);
edit('app/DailyEndCard.jsx',
  `  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },`,
  `  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },\n  whittle: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Axe },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'polka',  cat: 'sudoku' ,   name: 'Polka',`,
  `  { key: 'whittle', cat: 'sudoku' ,  name: 'Whittle', tag: '${TAG}',            blurb: 'The one played backwards: a solved grid, eighteen clues, and you take clues out for as long as it still has one answer.', href: '/whittle' },\n  { key: 'polka',  cat: 'sudoku' ,   name: 'Polka',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['finesse',`,
  `const LAUNCH_PIN = { keys: ['whittle', 'finesse',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'the daily kropki sudoku', store: 'sot_polka_day', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'the daily kropki sudoku', store: 'sot_polka_day', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)' },\n  { key: 'whittle', href: '/whittle', name: 'Whittle', tag: 'the sudoku, backwards', store: 'sot_whittle_day', accent: '${COLOR}', bg: '#fdf6e9', border: 'rgba(133,77,14,0.4)' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'No numbers, only dots', img: '/games/btn-polka.png' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'No numbers, only dots', img: '/games/btn-polka.png' },\n  { key: 'whittle', href: '/whittle', name: 'Whittle', tag: '${TAG}', img: '/games/btn-whittle.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'sudoku', label: 'Sudoku', keys: ['suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'knight'] },`,
  `  { key: 'sudoku', label: 'Sudoku', keys: ['suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'knight', 'whittle'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
// `cat: 'Numbers'` matches every one of the nine sudokus already in this file.
// The registry says Sudoku and this console predates that category; a lone
// divergent row would group Whittle on its own rather than with its family.
edit('app/DailyStrip.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', img: '/games/btn-polka.png', store: 'sot_polka_day', tag: "No numbers, only dots" , cat: 'Numbers' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', img: '/games/btn-polka.png', store: 'sot_polka_day', tag: "No numbers, only dots" , cat: 'Numbers' },\n  { key: 'whittle', href: '/whittle', name: 'Whittle', img: '/games/btn-whittle.png', store: 'sot_whittle_day', tag: "${TAG}" , cat: 'Numbers' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { finesse: '#c4b5fd',`,
  `const ACCENTS = { whittle: '${NAVY}', finesse: '#c4b5fd',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { finesse: '#4c1d95',`,
  `const TCOL = { whittle: '${COLOR}', finesse: '#4c1d95',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as FLANK_FULL } from '../flank/puzzles';`,
  `import { PUZZLES as FLANK_FULL } from '../flank/puzzles';\nimport { PUZZLES as WHITTLE_FULL } from '../whittle/puzzles';`);
edit('app/daily/page.js',
  `const FLANK = FLANK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const FLANK = FLANK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst WHITTLE = WHITTLE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'flank', name: 'Flank', path: '/flank', tag: 'Name every neighbor', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)', src: FLANK },`,
  `  { key: 'flank', name: 'Flank', path: '/flank', tag: 'Name every neighbor', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)', src: FLANK },\n  { key: 'whittle', name: 'Whittle', path: '/whittle', tag: '${TAG}', accent: '${COLOR}', bg: '#fdf6e9', border: 'rgba(133,77,14,0.4)', src: WHITTLE },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'sudoku', label: 'Sudoku', keys: ['suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'knight'] },`,
  `  { key: 'sudoku', label: 'Sudoku', keys: ['suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'knight', 'whittle'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `polka: '#67dd9a', knight: '#9d99f0',`,
  `polka: '#67dd9a', knight: '#9d99f0', whittle: '${NAVY}',`);

// ─── 10. lib/sitemap-entries.js — keyed by ROUTE, and a separate file from ──
//        app/sitemap.js, which no longer exists.
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus', 'thread',`,
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus', 'thread', 'whittle',`);

// ─── 11. the FOUR puzzle-map registries (the checklist's "three routes") ────
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_thread } from '@/app/thread/puzzles';`,
    `import { PUZZLES as P_thread } from '@/app/thread/puzzles';\nimport { PUZZLES as P_whittle } from '@/app/whittle/puzzles';`);
  edit(f, `thread: P_thread`, `thread: P_thread, whittle: P_whittle`);
}

// ─── 12. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|focus|thread)-\\d+-\\d+-\\d+$/;`,
  `|focus|thread|whittle)-\\d+-\\d+-\\d+$/;`);

// ─── 13. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|focus|thread)-/;`,
  `|focus|thread|whittle)-/;`);

// ─── 14. app/DailySlateRail.jsx — the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'focus', 'thread',`,
  `'focus', 'thread', 'whittle',`);

// ─── 15. lib/quiz-catalog.js — a no-op for a standalone daily, kept in step ─
edit('lib/quiz-catalog.js',
  `'focus', 'thread']);`,
  `'focus', 'thread', 'whittle']);`);

// ─── 16. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'script', 'quotes', 'focus', 'thread',\n]);`,
  `'script', 'quotes', 'focus', 'thread', 'whittle',\n]);`);

// ─── 17. lib/game-glyphs.js — no entry means NO icon and no error ───────────
// The board with a piece already lifted off it. Two primitives, and the lifted
// square is drawn a clear gap away from the grid so it reads as removed rather
// than as part of the frame.
edit('lib/game-glyphs.js',
  `  polka: 'M8 8a1.5 1.5 0 1 0 .01 0M16 8a1.5 1.5 0 1 0 .01 0M8 16a1.5 1.5 0 1 0 .01 0M16 16a1.5 1.5 0 1 0 .01 0M12 12a1.5 1.5 0 1 0 .01 0',`,
  `  polka: 'M8 8a1.5 1.5 0 1 0 .01 0M16 8a1.5 1.5 0 1 0 .01 0M8 16a1.5 1.5 0 1 0 .01 0M16 16a1.5 1.5 0 1 0 .01 0M12 12a1.5 1.5 0 1 0 .01 0',\n  whittle: \`\${grid(2, 8, 12, 13, 2, 3)}M17 4h5v5h-5z\`,          // a clue lifted off the board`);

// ─── 18. lib/puzzle-categories.js — the /sudoku landing page ───────────────
// The roster comes from the registry at render time, but `keys` fixes the
// order, `generic` supplies the label, and the sudoku entry SPELLS ITS COUNT
// AS A WORD in title and h1. Leaving that alone would have the page contradict
// its own list.
edit('lib/puzzle-categories.js',
  `    title: 'Free Daily Sudoku: Nine Variants, One New Board Every Day | Mind Loft',`,
  `    title: 'Free Daily Sudoku: Ten Variants, One New Board Every Day | Mind Loft',`);
edit('lib/puzzle-categories.js',
  `    h1: 'Free Daily Sudoku: Nine Variants, One New Board Every Day',`,
  `    h1: 'Free Daily Sudoku: Ten Variants, One New Board Every Day',`);
edit('lib/puzzle-categories.js',
  `    description: 'Play free sudoku online: classic 9x9, a two-minute 6x6, and seven variants (jigsaw, killer, sandwich, thermo, kropki, anti-knight, skyscrapers). One logical solution, never a guess, a new board every day, no signup.',`,
  `    description: 'Play free sudoku online: classic 9x9, a two-minute 6x6, seven variants (jigsaw, killer, sandwich, thermo, kropki, anti-knight, skyscrapers) and one played backwards. One logical solution, never a guess, a new board every day, no signup.',`);
edit('lib/puzzle-categories.js',
  `    lede: 'Classic 9x9, a two-minute 6x6, and seven variant sudokus you will not find together anywhere else: jigsaw, killer, sandwich, thermo, kropki, anti-knight and skyscrapers. Every board has one solution you can reach by logic alone, never a guess. No app, no signup, and a leaderboard decided on the clock.',`,
  `    lede: 'Classic 9x9, a two-minute 6x6, seven variant sudokus you will not find together anywhere else (jigsaw, killer, sandwich, thermo, kropki, anti-knight and skyscrapers) and one played backwards, where the grid arrives solved and you take the clues out of it. Every board has one solution you can reach by logic alone, never a guess. No app, no signup, and a leaderboard decided on the clock.',`);
edit('lib/puzzle-categories.js',
  `    keys: ['sixes', 'suds', 'quilt', 'towers', 'mercury', 'sando', 'knight', 'cages', 'polka'],`,
  `    keys: ['sixes', 'suds', 'quilt', 'towers', 'mercury', 'sando', 'knight', 'cages', 'polka', 'whittle'],`);
edit('lib/puzzle-categories.js',
  `      mercury: 'Thermo sudoku', sando: 'Sandwich sudoku', knight: 'Anti-knight sudoku', cages: 'Killer sudoku', polka: 'Kropki sudoku',`,
  `      mercury: 'Thermo sudoku', sando: 'Sandwich sudoku', knight: 'Anti-knight sudoku', cages: 'Killer sudoku', polka: 'Kropki sudoku',\n      whittle: 'Sudoku in reverse',`);
edit('lib/puzzle-categories.js',
  `    start: 'Sixes if you have two minutes. Suds if you want the classic. Quilt is the gentlest step into variants because the rules do not change, only the shape of the boxes. Cages and Sando add arithmetic, Mercury and Polka add ordering, and Knight and Towers change what sees what.',`,
  `    start: 'Sixes if you have two minutes. Suds if you want the classic. Quilt is the gentlest step into variants because the rules do not change, only the shape of the boxes. Cages and Sando add arithmetic, Mercury and Polka add ordering, and Knight and Towers change what sees what. Whittle is the odd one out and worth saving until the rest feel easy: it hands you a solved grid and asks you to take the clues out of it.',`);
edit('lib/puzzle-categories.js',
  `      ['Is it really free, with no signup?', 'Yes. Every board is free in the browser. Signing up only puts your name on the leaderboard and keeps your streak across devices.'],`,
  `      ['Is one of them not a fill-in sudoku?', 'Whittle is the reverse. The grid arrives solved with eighteen clues printed on it and you remove clues, one at a time, for as long as the grid still has exactly one answer. It is the same reasoning about what a clue is doing, asked from the other end.'],\n      ['Is it really free, with no signup?', 'Yes. Every board is free in the browser. Signing up only puts your name on the leaderboard and keeps your streak across devices.'],`);
edit('lib/puzzle-categories.js',
  `      ['What is the Sudoku circuit?', 'Five of the nine sudokus, rotating one a day, played as one run with one combined leaderboard.'],`,
  `      ['What is the Sudoku circuit?', 'Five of the nine fill-in sudokus, rotating one a day, played as one run with one combined leaderboard.'],`);

// ─── 19. lib/circuits.js — the Sudoku circuit claimed to be exhaustive ─────
// Not a registry, a COPY fix, and not optional. The circuit is a POOL OF NINE
// with a fixed rotation, so Whittle does not join it, and the moment Whittle
// ships the phrase "every sudoku on the site" is false. Per the standing rule
// that reader-facing copy is checked against the data it describes, the claim
// comes out. Whether Whittle should take a place in that pool is an owner
// call: it would move every member from five days in nine to five in ten, and
// it is a different act from filling a grid in.
edit('lib/circuits.js',
  `    blurb: 'Every sudoku on the site: five a day from a pool of nine, easiest first.',`,
  `    blurb: 'Nine sudokus to fill in: five a day from the pool, easiest first.',`);

console.log(`wire-whittle: ${applied} edits applied, ${skipped} already present`);
