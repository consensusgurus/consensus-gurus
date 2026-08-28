// scripts/wire-knight.mjs — wires the daily game `knight` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not its
// partner is dropped with no error and no gap), so every anchor here must match
// EXACTLY ONCE or the script throws. It is idempotent: an edit whose replacement
// is already present is skipped, so a re-run after a partial push is safe.
//
//   node scripts/wire-knight.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-knight.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// The idempotency test is "is the finished text already here", i.e. the WHOLE
// replacement, never a suffix of it (the wire-calc bug: a slice comparison is
// correct only for an edit that appends after its anchor, and silently skips an
// insertion into the middle of a line).
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 140)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'The daily anti-knight sudoku';
const HOW = 'An ordinary sudoku plus one rule: a digit may not repeat anywhere a chess knight could jump to it, two squares one way and one square across. Nothing is drawn on the grid, the rule reaches across boxes instead of inside them, and the board prints far fewer digits than a sudoku usually needs.';
const COLOR = '#3730a3', NAVY = '#9d99f0';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
// Placed straight after Polka so the eight sudokus stay contiguous in the
// canonical daily order, which is what the filter strip reads.
edit('lib/daily-games.js',
  `  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers', tag: 'No numbers, only dots',`,
  `  { key: 'knight', miss: null, name: 'Knight', cat: 'Numbers', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },\n  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers', tag: 'No numbers, only dots',`);

// ─── 2. lib/sunday-editions.js — the thirteen-clue Sunday Edition ──────────
edit('lib/sunday-editions.js',
  `  'flank',\n];`,
  `  'flank',\n  'knight',\n];`);

// ─── 3. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp, Milestone,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp, Milestone, CornerUpRight,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['flank', 'biz',`,
  `const LAUNCH_PIN = { keys: ['knight', 'flank', 'biz',`);
edit('app/DailyEndCard.jsx',
  `  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },`,
  `  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },\n  knight: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: CornerUpRight },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'polka',  cat: 'numbers',   name: 'Polka',  tag: 'No numbers, only dots',`,
  `  { key: 'knight', cat: 'numbers',   name: 'Knight', tag: '${TAG}',     blurb: 'One rule on top of sudoku: no digit repeats a knight move away. Select a square and its knights light up, and the board prints as few as thirteen digits.', href: '/knight' },\n  { key: 'polka',  cat: 'numbers',   name: 'Polka',  tag: 'No numbers, only dots',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['flank', 'biz',`,
  `const LAUNCH_PIN = { keys: ['knight', 'flank', 'biz',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'the daily kropki sudoku', store: 'sot_polka_day', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'the daily kropki sudoku', store: 'sot_polka_day', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)' },\n  { key: 'knight', href: '/knight', name: 'Knight', tag: 'the daily anti-knight sudoku', store: 'sot_knight_day', accent: '${COLOR}', bg: '#f1f0fd', border: 'rgba(55,48,163,0.4)' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'No numbers, only dots', img: '/games/btn-polka.png' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', tag: 'No numbers, only dots', img: '/games/btn-polka.png' },\n  { key: 'knight', href: '/knight', name: 'Knight', tag: '${TAG}', img: '/games/btn-knight.png' },`);
edit('app/DailyGamesGrid.jsx',
  `'sando', 'mercury', 'polka', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `'sando', 'mercury', 'polka', 'knight', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'polka', href: '/polka', name: 'Polka', img: '/games/btn-polka.png', store: 'sot_polka_day', tag: "No numbers, only dots" , cat: 'Numbers' },`,
  `  { key: 'polka', href: '/polka', name: 'Polka', img: '/games/btn-polka.png', store: 'sot_polka_day', tag: "No numbers, only dots" , cat: 'Numbers' },\n  { key: 'knight', href: '/knight', name: 'Knight', img: '/games/btn-knight.png', store: 'sot_knight_day', tag: "${TAG}" , cat: 'Numbers' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { flank: '#b1d977',`,
  `const ACCENTS = { knight: '${NAVY}', flank: '#b1d977',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { flank: '#3f6212',`,
  `const TCOL = { knight: '${COLOR}', flank: '#3f6212',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as POLKA_FULL } from '../polka/puzzles';`,
  `import { PUZZLES as POLKA_FULL } from '../polka/puzzles';\nimport { PUZZLES as KNIGHT_FULL } from '../knight/puzzles';`);
edit('app/daily/page.js',
  `const POLKA = POLKA_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const POLKA = POLKA_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst KNIGHT = KNIGHT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'polka', name: 'Polka', path: '/polka', tag: 'Kropki, no numbers at all', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)', src: POLKA },`,
  `  { key: 'polka', name: 'Polka', path: '/polka', tag: 'Kropki, no numbers at all', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)', src: POLKA },\n  { key: 'knight', name: 'Knight', path: '/knight', tag: 'Sudoku plus the knight rule', accent: '${COLOR}', bg: '#f1f0fd', border: 'rgba(55,48,163,0.4)', src: KNIGHT },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `'sando', 'mercury', 'polka', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `'sando', 'mercury', 'polka', 'knight', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `polka: '#67dd9a',`,
  `polka: '#67dd9a', knight: '${NAVY}',`);

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz', 'flank',`,
  `  'calc', 'encore', 'biz', 'flank', 'knight',`);

// ─── 11. the FOUR puzzle-map registries (the checklist's "three routes" is four)
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_polka } from '@/app/polka/puzzles';`,
    `import { PUZZLES as P_polka } from '@/app/polka/puzzles';\nimport { PUZZLES as P_knight } from '@/app/knight/puzzles';`);
  edit(f, `polka: P_polka`, `polka: P_polka, knight: P_knight`);
}

// ─── 12. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|encore|biz|flank)-\\d+-\\d+-\\d+$/;`,
  `|encore|biz|flank|knight)-\\d+-\\d+-\\d+$/;`);

// ─── 13. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|encore|biz|flank)-/;`,
  `|encore|biz|flank|knight)-/;`);

// ─── 14. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderKnightCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__knight-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__knight-card.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx — the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'calc', 'encore', 'biz', 'flank',`,
  `'calc', 'encore', 'biz', 'flank', 'knight',`);

// ─── 16. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'calc', 'encore', 'biz', 'flank']);`,
  `'calc', 'encore', 'biz', 'flank', 'knight']);`);

// ─── 17. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'turn', 'venn', 'warmer', 'atlas', 'sport', 'calc', 'encore', 'biz', 'flank',`,
  `  'turn', 'venn', 'warmer', 'atlas', 'sport', 'calc', 'encore', 'biz', 'flank', 'knight',`);

// ─── 18. lib/circuits.js — the Sudoku pool goes from eight to NINE ──────────
// The rotating pool is stored in ascending measured order and the window
// re-sorts to it, so Knight slots between Polka and Mercury on its estimated
// median. `rotate` stays 5: the circuit still plays five a day, each pool
// member now appearing five days in every nine rather than every eight.
edit('lib/circuits.js',
  `    keys: ['towers', 'sixes', 'cages', 'suds', 'quilt', 'polka', 'mercury', 'sando'],`,
  `    keys: ['towers', 'sixes', 'cages', 'suds', 'quilt', 'polka', 'knight', 'mercury', 'sando'],`);
edit('lib/circuits.js',
  `    blurb: 'Every sudoku on the site: five a day from a pool of eight, easiest first.',`,
  `    blurb: 'Every sudoku on the site: five a day from a pool of nine, easiest first.',`);
edit('lib/circuits.js',
  `      invite: "Eight sudokus in the pool and five on the day's card, easiest grid first. A different mix tomorrow.",`,
  `      invite: "Nine sudokus in the pool and five on the day's card, easiest grid first. A different mix tomorrow.",`);
edit('lib/circuits.js',
  `      result: "Five sudokus from a pool of eight.",`,
  `      result: "Five sudokus from a pool of nine.",`);
edit('lib/circuits.js',
  `    // roster is a POOL of eight and the circuit plays FIVE of them a day,`,
  `    // roster is a POOL of nine and the circuit plays FIVE of them a day,`);
edit('lib/circuits.js',
  `    // every pool member plays five days in every eight, and the day's five`,
  `    // every pool member plays five days in every nine, and the day's five`);
edit('lib/circuits.js',
  `    // trophies, the band and the landing page all follow with no edits of\n    // their own. Pool medians: towers ~110 est / sixes 144 / cages 270 /\n    // suds 482 / quilt 699 / polka ~750 est / mercury ~900 est / sando 1171.\n    // Every 5-window totals 1705s or more, so the trophy stays gold on every\n    // day's mix (scripts/verify-circuits.mjs recomputes all eight windows).`,
  `    // trophies, the band and the landing page all follow with no edits of\n    // their own. Pool medians: towers ~110 est / sixes 144 / cages 270 /\n    // suds 482 / quilt 699 / polka ~750 est / knight ~800 est /\n    // mercury ~900 est / sando 1171. Every 5-window totals 1705s or more, so\n    // the trophy stays gold on every day's mix (scripts/verify-circuits.mjs\n    // recomputes all nine windows).`);

// ─── 19. scripts/verify-circuits.mjs — Knight's estimated median ────────────
edit('scripts/verify-circuits.mjs',
  `  towers: 110, polka: 750, mercury: 900,`,
  `  towers: 110, polka: 750, mercury: 900,\n  // Knight launched 2026-08-28 with no live clock data yet: estimated from its\n  // shape (a 13-to-28 clue anti-knight 9x9, so between Polka and Mercury).\n  // Replace with the measured median at the next snapshot re-measure.\n  knight: 800,`);


// ─── 20. CLAUDE.md — the living document, per its own standing instruction ──
// Two edits: a row in the Sunday Editions table, and a section for the game.
edit('CLAUDE.md',
  `| Sando | six printed digits instead of the weekday 10 to 20 (from 2026-08-13) |`,
  `| Sando | six printed digits instead of the weekday 10 to 20 (from 2026-08-13) |\n| Knight | thirteen printed digits instead of the weekday 16 to 28 (from 2026-08-28) |`);
edit('CLAUDE.md',
  `## Sando is the SANDWICH SUDOKU, and the sums are the whole point (launched 2026-08-13)`,
  `## Knight is the ANTI-KNIGHT SUDOKU, and the rule has to be LOAD-BEARING (launched 2026-08-28)

The eighth sudoku, after Suds (classic), Quilt (jigsaw), Cages (killer), Sando (sandwich),
Sixes (mini), Mercury (thermo) and Polka (kropki). Ordinary 9x9, ordinary boxes, ordinary
printed digits, plus one rule: no digit may repeat a chess knight's move away from itself,
so a 5 at r4c4 also rules out a 5 at r2c3, r2c5, r3c2, r3c6, r5c2, r5c6, r6c3 and r6c5.

It is the first sudoku here whose extra rule is a **cell-to-cell exclusion** rather than a
region shape, an arithmetic clue on a group, or a relation between neighbours. Nothing is
drawn on the grid and there is no arithmetic anywhere: the constraint reaches ACROSS boxes
instead of inside them, which is why the board can print as few as thirteen digits.

- **⚠️ A KNIGHT SET IS NOT A HOUSE.** The eight cells a knight's move from a given cell do
  NOT see each other, so they carry no "these cells hold every digit" guarantee. The rule
  supplies **eliminations only**: never a hidden single, never a locked candidate, never a
  naked or hidden subset. Rows, columns and boxes stay the only 27 houses. This is the same
  trap Cages documents for cages, and conflating the two produces a solver that calls every
  legal board contradictory. Note that a knight peer CAN share the selection's box (r4c4 and
  r5c6 are both in the middle box), which is why the client paints the knight tint AFTER the
  ordinary peer tint rather than instead of it.
- **KNIGHT NECESSITY is a checked property, not an aspiration.** On every board, the same
  clues read as an ORDINARY sudoku admit more than one grid, so the knight rule is never
  decoration and a board can never be a plain sudoku that happens to have been dug under a
  knight solver. \`scripts/verify-knight.mjs\` proves it by counting solutions a second time
  with the rule switched off and failing at one. Measured while designing the ramp: this
  holds at every clue count up to 30, so the ramp is not bounded by it.
- **The ramp is TWO measured axes, both pinned per weekday, neither merely capped.**
  \`printed\` runs Mon 28, Tue 25, Wed 22, Thu 20, Fri 18, Sat 16 and **Sunday 13**, the
  fewest of the week. \`level\` is 1 (naked and hidden singles) Mon-Thu and 2 (also locked
  candidates and naked/hidden subsets) Fri, Sat and Sun. Level had to be pinned rather than
  capped because at 18 clues a board comes out singles-only about two times in three, which
  is a Tuesday wearing Friday's clue count. The greedy logic floor is 12 to 19 clues
  depending on the dig order, so a Sunday is found by re-digging the same grid rather than
  by regenerating.
- **Generator and verifier share NO code**, as with Cages and Quilt. The generator uses
  bitmask candidates and branches on the emptiest cell; \`verify-knight.mjs\` uses Set-based
  candidates and branches on the house-and-digit with the fewest placements, and it POLICES
  its logical solver against the known solution so an unsound elimination is reported rather
  than trusted. \`scripts/knight-mutation-test.mjs\` breaks the bank nine ways and every one
  must be caught.
- **Knight joined the rotating Sudoku circuit**, taking its pool from eight to NINE. \`rotate\`
  stays 5, so the circuit still plays five a day and each pool member now appears five days
  in every nine. Its estimated median (800s, between Polka and Mercury) is an ESTIMATE in
  verify-circuits; replace it at the next snapshot re-measure.
- **Accent is indigo #3730a3**, the one step left between Sixes' royal blue and Cages'
  purple on the Numbers row.

## Sando is the SANDWICH SUDOKU, and the sums are the whole point (launched 2026-08-13)`);

console.log(`wire-knight: ${applied} edits applied, ${skipped} already present`);
