// scripts/wire-encore.mjs — wires the daily game `encore` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not its
// partner is dropped with no error and no gap), so every anchor here must match
// EXACTLY ONCE or the script throws. It is idempotent: an edit whose replacement
// is already present is skipped, so a re-run after a partial push is safe.
//
//   node scripts/wire-encore.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-encore.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// The idempotency test is "is the finished text already here", i.e. the WHOLE
// replacement, not a suffix of it. wire-calc.mjs compared `replacement.slice
// (anchor.length)` on the assumption that every edit appends after its anchor;
// that is false for an insertion into the MIDDLE of a line, where the slice
// comes out as the anchor's own tail and is therefore always "already present".
// It silently skipped the lucide-react import here, which is a build failure
// (ReferenceError at render) reported as a clean run. Compare the full string.
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'The daily crossword';
const HOW = 'Fill the nine by nine crossword from fair clues, with every square crossed by an answer in both directions. The timer stops when the grid is right, and Sundays run eleven by eleven.';
const COLOR = '#1d4ed8', NAVY = '#86a9ff';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `  { key: 'polka', miss: null, name: 'Polka',`,
  `  { key: 'encore', miss: 'Checks', name: 'Encore', cat: 'Word', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },\n  { key: 'polka', miss: null, name: 'Polka',`);

// ─── 2. lib/sunday-editions.js — the 11x11 Sunday Edition ──────────────────
edit('lib/sunday-editions.js',
  `  'calc',\n];`,
  `  'calc',\n  'encore',\n];`);

// ─── 3. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['calc', 'sport',`,
  `const LAUNCH_PIN = { keys: ['encore', 'calc', 'sport',`);
edit('app/DailyEndCard.jsx',
  `  calc: { accent: '#be123c', badgeBg: '#be123c', badgeInk: T.white, Fin: Divide },`,
  `  calc: { accent: '#be123c', badgeBg: '#be123c', badgeInk: T.white, Fin: Divide },\n  encore: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: TableProperties },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'emcee',  cat: 'word',      name: 'Emcee',`,
  `  { key: 'encore', cat: 'word',      name: 'Encore', tag: '${TAG}',            blurb: 'The big grid: nine by nine on weekdays and around twenty-six answers, so it wants a few minutes rather than a few seconds. Sundays go to eleven by eleven.', href: '/encore' },\n  { key: 'emcee',  cat: 'word',      name: 'Emcee',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['calc', 'sport',`,
  `const LAUNCH_PIN = { keys: ['encore', 'calc', 'sport',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'calc', href: '/calc', name: 'Calc', tag: 'walk the calculator', store: 'sot_calc_day', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)' },`,
  `  { key: 'calc', href: '/calc', name: 'Calc', tag: 'walk the calculator', store: 'sot_calc_day', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)' },\n  { key: 'encore', href: '/encore', name: 'Encore', tag: 'the daily crossword', store: 'sot_encore_day', accent: '${COLOR}', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'calc', href: '/calc', name: 'Calc', tag: 'Walk the calculator', img: '/games/btn-calc.png' },`,
  `  { key: 'calc', href: '/calc', name: 'Calc', tag: 'Walk the calculator', img: '/games/btn-calc.png' },\n  { key: 'encore', href: '/encore', name: 'Encore', tag: '${TAG}', img: '/games/btn-encore.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'word', label: 'Word', keys: ['crux', 'strata', 'lode', 'emcee',`,
  `  { key: 'word', label: 'Word', keys: ['crux', 'strata', 'lode', 'encore', 'emcee',`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'calc', href: '/calc', name: 'Calc', img: '/games/btn-calc.png', store: 'sot_calc_day', tag: "Walk the calculator" , cat: 'Numbers' },`,
  `  { key: 'calc', href: '/calc', name: 'Calc', img: '/games/btn-calc.png', store: 'sot_calc_day', tag: "Walk the calculator" , cat: 'Numbers' },\n  { key: 'encore', href: '/encore', name: 'Encore', img: '/games/btn-encore.png', store: 'sot_encore_day', tag: "${TAG}" , cat: 'Word' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { plot: '#e0a86a',`,
  `const ACCENTS = { encore: '${NAVY}', plot: '#e0a86a',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { plot: '#78350f',`,
  `const TCOL = { encore: '${COLOR}', plot: '#78350f',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as CALC_FULL } from '../calc/puzzles';`,
  `import { PUZZLES as CALC_FULL } from '../calc/puzzles';\nimport { PUZZLES as ENCORE_FULL } from '../encore/puzzles';`);
edit('app/daily/page.js',
  `const CALC = CALC_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const CALC = CALC_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst ENCORE = ENCORE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'calc', name: 'Calc', path: '/calc', tag: 'Walk the calculator', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)', src: CALC },`,
  `  { key: 'calc', name: 'Calc', path: '/calc', tag: 'Walk the calculator', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)', src: CALC },\n  { key: 'encore', name: 'Encore', path: '/encore', tag: '${TAG}', accent: '${COLOR}', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)', src: ENCORE },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'word', label: 'Word', keys: ['crux', 'strata', 'lode', 'emcee',`,
  `  { key: 'word', label: 'Word', keys: ['crux', 'strata', 'lode', 'encore', 'emcee',`);
edit('app/daily/DailyArchiveClient.jsx',
  `polka: '#67dd9a', calc: '#fb7185',`,
  `polka: '#67dd9a', calc: '#fb7185', encore: '${NAVY}',`);

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc',`,
  `  'calc', 'encore',`);

// ─── 11. the FOUR puzzle-map registries (item 11's "three routes" is four) ───
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_calc } from '@/app/calc/puzzles';`,
    `import { PUZZLES as P_calc } from '@/app/calc/puzzles';\nimport { PUZZLES as P_encore } from '@/app/encore/puzzles';`);
  edit(f, `calc: P_calc`, `calc: P_calc, encore: P_encore`);
}

// ─── 12. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|atlas|sport|calc)-\\d+-\\d+-\\d+$/;`,
  `|atlas|sport|calc|encore)-\\d+-\\d+-\\d+$/;`);

// ─── 13. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|atlas|sport|calc)-/;`,
  `|atlas|sport|calc|encore)-/;`);

// ─── 14. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderEncoreCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__encore-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__encore-card.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx — the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'atlas', 'sport', 'calc',`,
  `'atlas', 'sport', 'calc', 'encore',`);

// ─── 16. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'atlas', 'sport', 'calc']);`,
  `'atlas', 'sport', 'calc', 'encore']);`);

// ─── 17. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'turn', 'venn', 'warmer', 'atlas', 'sport', 'calc',\n]);`,
  `  'turn', 'venn', 'warmer', 'atlas', 'sport', 'calc', 'encore',\n]);`);

// ─── 18. lib/circuits.js — the Crosswords circuit claimed to be exhaustive ──
// Not a registry, a COPY fix, and it is not optional: the circuit is capped at
// five games, so Encore cannot join it, and the moment Encore ships the phrase
// "every crossword on the site" is false. Per the standing rule that reader
// facing copy is checked against the data it describes, the claim comes out.
// Whether Encore should take a slot in that circuit is an owner call.
edit('lib/circuits.js',
  `    blurb: 'Every crossword on the site, the mini first and the clueless ones last.',`,
  `    blurb: 'Five crosswords, the mini first and the clueless ones last.',`);
edit('lib/circuits.js',
  `      invite: "Every crossword on the site in one sitting: the mini, one in pieces, and three with no clues at all.",`,
  `      invite: "Five crosswords in one sitting: the mini, one in pieces, and three with no clues at all.",`);

console.log(`wire-encore: ${applied} edits applied, ${skipped} already present`);
