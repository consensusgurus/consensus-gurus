// scripts/wire-flank.mjs — wires the daily game `flank` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not
// its partner is dropped with no error and no gap), so every anchor here must
// match EXACTLY ONCE or the script throws. It is idempotent: an edit whose
// replacement is already present is skipped, so a re-run after a partial push
// is safe. The idempotency test compares the WHOLE replacement (the wire-calc
// suffix bug), per the checklist note from shipping encore.
//
//   node scripts/wire-flank.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-flank.mjs <dir>'); process.exit(1); }

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

const TAG = 'Name every neighbor';
const HOW = 'One country a day, and every country that shares a land border with it is an answer. Type them all before three wrong countries end the run. Mondays start with a single border and Sunday hands you a giant, with a fourth strike to spend.';
const COLOR = '#3f6212', NAVY = '#b1d977';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `  { key: 'biz', miss: 'Asked', name: 'Biz', cat: 'Trivia', tag: 'Twenty-five questions, one life', how: 'Twenty-five business questions climb from gimme to expert, five rounds of five cycling brands and products, markets and money, founders and bosses, deals and disasters, and business history. One wrong answer or an empty clock ends the run.', color: '#0f5132', colorNavy: '#4fbf8b' },`,
  `  { key: 'biz', miss: 'Asked', name: 'Biz', cat: 'Trivia', tag: 'Twenty-five questions, one life', how: 'Twenty-five business questions climb from gimme to expert, five rounds of five cycling brands and products, markets and money, founders and bosses, deals and disasters, and business history. One wrong answer or an empty clock ends the run.', color: '#0f5132', colorNavy: '#4fbf8b' },\n  { key: 'flank', miss: 'Wrong', name: 'Flank', cat: 'Geography', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);

// ─── 2. lib/sunday-editions.js — the Sunday giant ───────────────────────────
edit('lib/sunday-editions.js',
  `  'encore',`,
  `  'encore',\n  'flank',`);

// ─── 3. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp, Milestone,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['biz', 'encore',`,
  `const LAUNCH_PIN = { keys: ['flank', 'biz', 'encore',`);
edit('app/DailyEndCard.jsx',
  `  biz: { accent: '#0f5132', badgeBg: '#0f5132', badgeInk: T.white, Fin: TrendingUp },`,
  `  biz: { accent: '#0f5132', badgeBg: '#0f5132', badgeInk: T.white, Fin: TrendingUp },\n  flank: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Milestone },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'atlas', cat: 'geography', name: 'Atlas', tag: 'Twenty-five questions, one life', blurb: 'Twenty-five geography questions, gimme to expert, five subjects a round. One wrong answer ends the run.', href: '/atlas' },`,
  `  { key: 'atlas', cat: 'geography', name: 'Atlas', tag: 'Twenty-five questions, one life', blurb: 'Twenty-five geography questions, gimme to expert, five subjects a round. One wrong answer ends the run.', href: '/atlas' },\n  { key: 'flank', cat: 'geography', name: 'Flank', tag: '${TAG}', blurb: 'One country a day; name every country on its land border before three wrong countries end the run. Sundays hand you a fourteen-neighbor giant.', href: '/flank' },`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['biz', 'encore',`,
  `const LAUNCH_PIN = { keys: ['flank', 'biz', 'encore',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'biz', href: '/biz', name: 'Biz', tag: 'business, one life', store: 'sot_biz_day', accent: '#0f5132', bg: '#e9f5ee', border: 'rgba(15,81,50,0.4)' },`,
  `  { key: 'biz', href: '/biz', name: 'Biz', tag: 'business, one life', store: 'sot_biz_day', accent: '#0f5132', bg: '#e9f5ee', border: 'rgba(15,81,50,0.4)' },\n  { key: 'flank', href: '/flank', name: 'Flank', tag: 'name every neighbor', store: 'sot_flank_day', accent: '${COLOR}', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'biz', href: '/biz', name: 'Biz', tag: 'Business, one life', img: '/games/btn-biz.png' },`,
  `  { key: 'biz', href: '/biz', name: 'Biz', tag: 'Business, one life', img: '/games/btn-biz.png' },\n  { key: 'flank', href: '/flank', name: 'Flank', tag: '${TAG}', img: '/games/btn-flank.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'geography', label: 'Geography', keys: ['atlas', 'span', 'ping'] },`,
  `  { key: 'geography', label: 'Geography', keys: ['atlas', 'flank', 'span', 'ping'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'biz', href: '/biz', name: 'Biz', img: '/games/btn-biz.png', store: 'sot_biz_day', tag: "Business, one life" , cat: 'Trivia' },`,
  `  { key: 'biz', href: '/biz', name: 'Biz', img: '/games/btn-biz.png', store: 'sot_biz_day', tag: "Business, one life" , cat: 'Trivia' },\n  { key: 'flank', href: '/flank', name: 'Flank', img: '/games/btn-flank.png', store: 'sot_flank_day', tag: "${TAG}" , cat: 'Geography' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { biz: '#4fbf8b',`,
  `const ACCENTS = { flank: '${NAVY}', biz: '#4fbf8b',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { biz: '#0f5132',`,
  `const TCOL = { flank: '${COLOR}', biz: '#0f5132',`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as BIZ_FULL } from '../biz/puzzles';`,
  `import { PUZZLES as BIZ_FULL } from '../biz/puzzles';\nimport { PUZZLES as FLANK_FULL } from '../flank/puzzles';`);
edit('app/daily/page.js',
  `const BIZ = BIZ_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const BIZ = BIZ_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst FLANK = FLANK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'biz', name: 'Biz', path: '/biz', tag: 'Business, one life', accent: '#0f5132', bg: '#e9f5ee', border: 'rgba(15,81,50,0.4)', src: BIZ },`,
  `  { key: 'biz', name: 'Biz', path: '/biz', tag: 'Business, one life', accent: '#0f5132', bg: '#e9f5ee', border: 'rgba(15,81,50,0.4)', src: BIZ },\n  { key: 'flank', name: 'Flank', path: '/flank', tag: '${TAG}', accent: '${COLOR}', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)', src: FLANK },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'geography', label: 'Geography', keys: ['atlas', 'span', 'ping'] },`,
  `  { key: 'geography', label: 'Geography', keys: ['atlas', 'flank', 'span', 'ping'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `calc: '#fb7185', encore: '#86a9ff', biz: '#4fbf8b',`,
  `calc: '#fb7185', encore: '#86a9ff', biz: '#4fbf8b', flank: '${NAVY}',`);

// ─── 10. lib/sitemap-entries.js ─────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz',`,
  `  'calc', 'encore', 'biz', 'flank',`);

// ─── 11. the FOUR puzzle-map registries ─────────────────────────────────────
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_biz } from '@/app/biz/puzzles';`,
    `import { PUZZLES as P_biz } from '@/app/biz/puzzles';\nimport { PUZZLES as P_flank } from '@/app/flank/puzzles';`);
  edit(f, `encore: P_encore, biz: P_biz`, `encore: P_encore, biz: P_biz, flank: P_flank`);
}

// ─── 12. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|encore|biz)-`,
  `|encore|biz|flank)-`);

// ─── 13. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|encore|biz)-/;`,
  `|encore|biz|flank)-/;`);

// ─── 14. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderFlankCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__flank-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__flank-card.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'atlas', 'sport', 'calc', 'encore', 'biz',`,
  `'atlas', 'sport', 'calc', 'encore', 'biz', 'flank',`);

// ─── 16. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'calc', 'encore', 'biz']);`,
  `'calc', 'encore', 'biz', 'flank']);`);

// ─── 17. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'calc', 'encore', 'biz',`,
  `'calc', 'encore', 'biz', 'flank',`);

// ─── 18. CLAUDE.md — the Sunday Editions table gains Flank's row ────────────
edit('CLAUDE.md',
  `| Hedge | a 10x10 loop lattice instead of the weekday 7x7 |`,
  `| Hedge | a 10x10 loop lattice instead of the weekday 7x7 |\n| Flank | a giant country with 8 to 14 borders instead of the weekday ramp's 1 to 7, and a fourth strike to spend (from launch, 2026-08-28) |`);

console.log(`wire-flank: ${applied} edits applied, ${skipped} already present`);
