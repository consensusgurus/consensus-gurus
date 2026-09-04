// scripts/wire-finesse.mjs — wires the daily game `finesse` into every registry.
//
// An ANCHORED script, per the daily-game checklist and in the shape of
// scripts/wire-sums-hinge.mjs: half these registries fail SILENTLY when missed
// (a key in one list and not its partner is dropped with no error and no gap),
// so every anchor must match EXACTLY ONCE or the script throws. Idempotent: an
// edit whose replacement is already present is skipped, so a re-run after a
// partial push is safe.
//
//   node scripts/wire-finesse.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree. Finesse joins the CARDS row, after Shoe in every ordered list,
// so there is no new category to create: [[cards-daily-category]]'s six files
// already carry Cards, and CAT_META and the Club icon are already there. It
// runs a Sunday Edition (the deck goes to eight), so it joins
// lib/sunday-editions.js and the sunday-slate route too.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-finesse.mjs <dir>'); process.exit(1); }

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

const F = {
  TAG: 'The daily double dummy',
  HOW: 'All four hands are face up and one suit is trumps. You play South and the dummy opposite, and the two defenders play perfectly. Take the tricks the contract asks for. Follow suit if you can, the highest card of the suit led wins, a trump beats anything that is not one.',
  // The page colour is NOT this pair: cat 'Cards' resolves through
  // lib/category-ramp.js to magenta, and that is what paints the stage, the CTA
  // and the table edge. These two are the legacy slate-row hue every registry
  // row still carries, and violet is what keeps Finesse apart from Hands
  // (#7f1d1d) and Shoe (#0c4a6e) in that one table.
  COLOR: '#4c1d95', NAVY: '#c4b5fd', BG: '#ede9fe', BORDER: 'rgba(76,29,149,0.4)',
  BLURB: 'All four hands face up and a defence that never errs. Play South and the dummy, and take the tricks the contract asks for. Three rules, no bidding, no luck.',
};

// ─── 1. lib/daily-games.js — the single source of truth, plus the premiere ──
edit('lib/daily-games.js',
  `  { key: 'hands', miss: 'Busts', name: 'Hands', cat: 'Cards',`,
  `  { key: 'finesse', keepsAnswer: true, miss: 'Tries', name: 'Finesse', cat: 'Cards', tag: '${F.TAG}', how: '${F.HOW}', color: '${F.COLOR}', colorNavy: '${F.NAVY}' },\n  { key: 'hands', miss: 'Busts', name: 'Hands', cat: 'Cards',`);
edit('lib/daily-games.js',
  `  { key: 'hinge', from: '2026-09-03', until: '2026-09-07' },\n];`,
  `  { key: 'hinge', from: '2026-09-03', until: '2026-09-07' },\n  { key: 'finesse', from: '2026-09-03', until: '2026-09-07' },\n];`);

// ─── 2. lib/sunday-editions.js — the deck goes to eight on Sunday ───────────
edit('lib/sunday-editions.js',
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'hinge', 'sums', 'crunch', 'taire', 'fib',`,
  `  'listed', 'mate', 'four', 'park', 'check', 'rung', 'hinge', 'sums', 'crunch', 'taire', 'finesse', 'fib',`);

// ─── 3. app/DailyEndCard.jsx — LAUNCH_PIN, GAME_META, tile copy ─────────────
// Layers is already imported from lucide-react; Club belongs to Taire, and two
// games must not share a mark.
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['sums', 'hinge', 'blitzed',`,
  `const LAUNCH_PIN = { keys: ['finesse', 'sums', 'hinge', 'blitzed',`);
edit('app/DailyEndCard.jsx',
  `  taire: { accent: '#1d6b4f', badgeBg: '#1d6b4f', badgeInk: T.white, Fin: Club },`,
  `  taire: { accent: '#1d6b4f', badgeBg: '#1d6b4f', badgeInk: T.white, Fin: Club },\n  finesse: { accent: '${F.COLOR}', badgeBg: '${F.COLOR}', badgeInk: T.white, Fin: Layers },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'shoe',  cat: 'cards',     name: 'Shoe',  tag: 'The daily blackjack shoe',`,
  `  { key: 'finesse',  cat: 'cards',     name: 'Finesse',  tag: '${F.TAG}', blurb: '${F.BLURB}', href: '/finesse' },\n  { key: 'shoe',  cat: 'cards',     name: 'Shoe',  tag: 'The daily blackjack shoe',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['sums', 'hinge', 'blitzed',`,
  `const LAUNCH_PIN = { keys: ['finesse', 'sums', 'hinge', 'blitzed',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'hands', href: '/hands', name: 'Hands', tag: 'the daily poker solitaire',`,
  `  { key: 'finesse', href: '/finesse', name: 'Finesse', tag: 'the daily double dummy', store: 'sot_finesse_day', accent: '${F.COLOR}', bg: '${F.BG}', border: '${F.BORDER}' },\n  { key: 'hands', href: '/hands', name: 'Hands', tag: 'the daily poker solitaire',`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'hands', href: '/hands', name: 'Hands', tag: 'The daily poker solitaire', img: '/games/btn-hands.png' },`,
  `  { key: 'hands', href: '/hands', name: 'Hands', tag: 'The daily poker solitaire', img: '/games/btn-hands.png' },\n  { key: 'finesse', href: '/finesse', name: 'Finesse', tag: '${F.TAG}', img: '/games/btn-finesse.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe'] },`,
  `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe', 'finesse'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'hands', href: '/hands', name: 'Hands', img: '/games/btn-hands.png', store: 'sot_hands_day', tag: "The daily poker solitaire" , cat: 'Cards' },`,
  `  { key: 'hands', href: '/hands', name: 'Hands', img: '/games/btn-hands.png', store: 'sot_hands_day', tag: "The daily poker solitaire" , cat: 'Cards' },\n  { key: 'finesse', href: '/finesse', name: 'Finesse', img: '/games/btn-finesse.png', store: 'sot_finesse_day', tag: "${F.TAG}" , cat: 'Cards' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { sums: '#f472b6',`,
  `const ACCENTS = { finesse: '${F.NAVY}', sums: '#f472b6',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { sums: '#be185d',`,
  `const TCOL = { finesse: '${F.COLOR}', sums: '#be185d',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as HANDS_FULL } from '../hands/puzzles';`,
  `import { PUZZLES as HANDS_FULL } from '../hands/puzzles';\nimport { PUZZLES as FINESSE_FULL } from '../finesse/puzzles';`);
edit('app/daily/page.js',
  `const HANDS = HANDS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const HANDS = HANDS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst FINESSE = FINESSE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'hands', name: 'Hands', path: '/hands', tag: 'The daily poker solitaire', accent: '#7f1d1d', bg: '#f6eaea', border: 'rgba(127,29,29,0.4)', src: HANDS },`,
  `  { key: 'hands', name: 'Hands', path: '/hands', tag: 'The daily poker solitaire', accent: '#7f1d1d', bg: '#f6eaea', border: 'rgba(127,29,29,0.4)', src: HANDS },\n  { key: 'finesse', name: 'Finesse', path: '/finesse', tag: '${F.TAG}', accent: '${F.COLOR}', bg: '${F.BG}', border: '${F.BORDER}', src: FINESSE },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe'] },`,
  `  { key: 'cards', label: 'Cards', keys: ['taire', 'hands', 'shoe', 'finesse'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `hands: '#fca5a5',`,
  `hands: '#fca5a5', finesse: '${F.NAVY}',`);

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `'deep', 'anon', 'hands', 'atlas',`,
  `'deep', 'anon', 'hands', 'finesse', 'atlas',`);

// ─── 11. the puzzle-map registries, sunday-slate included (it runs a Sunday) ─
for (const f of ['lib/daily-slate.js', 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js', 'app/api/quiz/sunday-slate/route.js']) {
  edit(f, `import { PUZZLES as P_hands } from '@/app/hands/puzzles';`,
    `import { PUZZLES as P_hands } from '@/app/hands/puzzles';\nimport { PUZZLES as P_finesse } from '@/app/finesse/puzzles';`);
  edit(f, `hands: P_hands,`, `hands: P_hands, finesse: P_finesse,`);
}

// ─── 12. the two hardcoded alternations ─────────────────────────────────────
edit('app/api/quiz/daily-status/route.js', `|babel|glyph|hands|`, `|babel|glyph|hands|finesse|`);
edit('app/quizzes/QuizHomeClient.jsx', `|babel|glyph|hands|`, `|babel|glyph|hands|finesse|`);

// ─── 13. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `  'feud', 'babel', 'hands', 'chain', 'turn', 'suffice', 'strata', 'redact', 'paths',`,
  `  'feud', 'babel', 'hands', 'finesse', 'chain', 'turn', 'suffice', 'strata', 'redact', 'paths',`);

// ─── 14. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'babel', 'glyph', 'hands',`, `'babel', 'glyph', 'hands', 'finesse',`);

// ─── 15. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'feud', 'fib', 'four', 'garble', 'glyph', 'hands',`,
  `  'feud', 'fib', 'finesse', 'four', 'garble', 'glyph', 'hands',`);

// ─── 16. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// DRAW THE BOARD, NOT THE GENRE. Hands is a grid of cards, Taire a tableau,
// Shoe a dealing shoe; the board none of them draws is four hands round an
// empty middle, which is what a double dummy looks like from above.
edit('lib/game-glyphs.js',
  `  hands: 'M4 4h6v7H4zM12 4h6v7h-6zM4 13h6v7H4zM12 13h6v7h-6zM21 5v14',      // a poker hand`,
  `  hands: 'M4 4h6v7H4zM12 4h6v7h-6zM4 13h6v7H4zM12 13h6v7h-6zM21 5v14',      // a poker hand
  finesse: 'M9 2h6v6H9zM16 9h6v6h-6zM9 16h6v6H9zM2 9h6v6H2z',                // four hands round a trick`);

console.log(`wire-finesse: ${applied} edits applied, ${skipped} already present`);
