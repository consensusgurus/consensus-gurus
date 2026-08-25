// scripts/wire-calc.mjs — wires the daily game `calc` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not its
// partner is dropped with no error and no gap), so every anchor here must match
// EXACTLY ONCE or the script throws. It is idempotent: an edit whose replacement
// is already present is skipped, so a re-run after a partial push is safe.
//
//   node scripts/wire-calc.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-calc.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
function edit(file, anchor, replacement, { after = true } = {}) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  const marker = after ? replacement.slice(anchor.length) : replacement;
  if (src.includes(marker.trim()) && marker.trim().length > 12) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `  { key: 'sport', miss: 'Asked', name: 'Sport',`,
  `  { key: 'calc', miss: 'Tries', name: 'Calc', cat: 'Numbers', tag: 'Walk the calculator', how: 'The buttons alternate number, operator, number, so the route you walk from the first to the last is a sum. Read it left to right and land on exactly the target.', color: '#be123c', colorNavy: '#fb7185' },\n  { key: 'sport', miss: 'Asked', name: 'Sport',`,
  { after: false });

// ─── 2. lib/sunday-editions.js — Calc's Sunday sets THREE targets ───────────
edit('lib/sunday-editions.js',
  `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka',\n];`,
  `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka',\n  'calc',\n];`);

// ─── 3. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['sport', 'atlas',`,
  `const LAUNCH_PIN = { keys: ['calc', 'sport', 'atlas',`,
  { after: false });
edit('app/DailyEndCard.jsx',
  `  sport: { accent: '#7c2d12', badgeBg: '#7c2d12', badgeInk: T.white, Fin: Trophy },`,
  `  sport: { accent: '#7c2d12', badgeBg: '#7c2d12', badgeInk: T.white, Fin: Trophy },\n  calc: { accent: '#be123c', badgeBg: '#be123c', badgeInk: T.white, Fin: Divide },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'sport', cat: 'trivia',    name: 'Sport',`,
  `  { key: 'calc',  cat: 'numbers',   name: 'Calc',  tag: 'Walk the calculator',      blurb: 'Step across a grid of numbers and operators, one touching button at a time, and land on exactly the target. Reads left to right, like a calculator.', href: '/calc' },\n  { key: 'sport', cat: 'trivia',    name: 'Sport',`,
  { after: false });

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['sport', 'atlas',`,
  `const LAUNCH_PIN = { keys: ['calc', 'sport', 'atlas',`,
  { after: false });

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'sport', href: '/sport', name: 'Sport', tag: 'every sport, one life', store: 'sot_sport_day', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)' },`,
  `  { key: 'sport', href: '/sport', name: 'Sport', tag: 'every sport, one life', store: 'sot_sport_day', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)' },\n  { key: 'calc', href: '/calc', name: 'Calc', tag: 'walk the calculator', store: 'sot_calc_day', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'sport', href: '/sport', name: 'Sport', tag: 'Every sport, one life', img: '/games/btn-sport.png' },`,
  `  { key: 'sport', href: '/sport', name: 'Sport', tag: 'Every sport, one life', img: '/games/btn-sport.png' },\n  { key: 'calc', href: '/calc', name: 'Calc', tag: 'Walk the calculator', img: '/games/btn-calc.png' },`);
edit('app/DailyGamesGrid.jsx',
  `'mercury', 'polka', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `'mercury', 'polka', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  { after: false });

// ─── 7. app/DailyStrip.jsx ──────────────────────────────────────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'sport', href: '/sport', name: 'Sport', img: '/games/btn-sport.png', store: 'sot_sport_day', tag: "Every sport, one life" , cat: 'Trivia' },`,
  `  { key: 'sport', href: '/sport', name: 'Sport', img: '/games/btn-sport.png', store: 'sot_sport_day', tag: "Every sport, one life" , cat: 'Trivia' },\n  { key: 'calc', href: '/calc', name: 'Calc', img: '/games/btn-calc.png', store: 'sot_calc_day', tag: "Walk the calculator" , cat: 'Numbers' },`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as SPORT_FULL } from '../sport/puzzles';`,
  `import { PUZZLES as SPORT_FULL } from '../sport/puzzles';\nimport { PUZZLES as CALC_FULL } from '../calc/puzzles';`);
edit('app/daily/page.js',
  `const SPORT = SPORT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const SPORT = SPORT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst CALC = CALC_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'sport', name: 'Sport', path: '/sport', tag: 'Every sport, one life', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)', src: SPORT },`,
  `  { key: 'sport', name: 'Sport', path: '/sport', tag: 'Every sport, one life', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)', src: SPORT },\n  { key: 'calc', name: 'Calc', path: '/calc', tag: 'Walk the calculator', accent: '#be123c', bg: '#fff1f4', border: 'rgba(190,18,60,0.4)', src: CALC },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `'mercury', 'polka', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  `'mercury', 'polka', 'calc', 'carve', 'cipher', 'crunch', 'blitz'] },`,
  { after: false });
edit('app/daily/DailyArchiveClient.jsx',
  `towers: '#58b7f2', mercury: '#f18c8c', polka: '#67dd9a',`,
  `towers: '#58b7f2', mercury: '#f18c8c', polka: '#67dd9a', calc: '#fb7185',`,
  { after: false });

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands', 'atlas', 'sport', 'towers', 'mercury', 'polka',`,
  `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands', 'atlas', 'sport', 'towers', 'mercury', 'polka',\n  'calc',`);

// ─── 11. the FOUR puzzle-map registries (item 11's "three routes" is four) ───
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';`,
    `import { PUZZLES as P_sixes } from '@/app/sixes/puzzles';\nimport { PUZZLES as P_calc } from '@/app/calc/puzzles';`);
  edit(f, `polka: P_polka, atlas: P_atlas, sport: P_sport`,
    `polka: P_polka, atlas: P_atlas, sport: P_sport, calc: P_calc`,
    { after: false });
}

// ─── 12. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|towers|mercury|polka|atlas|sport)-\\d+-\\d+-\\d+$/;`,
  `|towers|mercury|polka|atlas|sport|calc)-\\d+-\\d+-\\d+$/;`,
  { after: false });

// ─── 13. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|towers|mercury|polka|atlas|sport)-/;`,
  `|towers|mercury|polka|atlas|sport|calc)-/;`,
  { after: false });

// ─── 14. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderCalcCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__calc-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__calc-card.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx — the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'towers', 'mercury', 'polka', 'atlas', 'sport',`,
  `'towers', 'mercury', 'polka', 'atlas', 'sport', 'calc',`,
  { after: false });

// ─── 16. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'towers', 'mercury', 'polka', 'atlas', 'sport']);`,
  `'towers', 'mercury', 'polka', 'atlas', 'sport', 'calc']);`,
  { after: false });

// ─── 17. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `  'turn', 'venn', 'warmer', 'atlas', 'sport',\n]);`,
  `  'turn', 'venn', 'warmer', 'atlas', 'sport', 'calc',\n]);`);

console.log(`wire-calc: ${applied} edits applied, ${skipped} already present`);
