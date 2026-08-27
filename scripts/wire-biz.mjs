// scripts/wire-biz.mjs, wires the daily game `biz` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not its
// partner is dropped with no error and no gap), so every anchor here must match
// EXACTLY ONCE or the script throws. It is idempotent: an edit whose replacement
// is already present is skipped, so a re-run after a partial push is safe.
//
//   node scripts/wire-biz.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-biz.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// The idempotency test is "is the finished text already here", i.e. the WHOLE
// replacement, never a suffix of it. See the note in wire-encore.mjs: comparing
// a slice silently skips any edit that inserts into the MIDDLE of a line, and
// reports the run clean.
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'Twenty-five questions, one life';
const DTAG = 'Business, one life';
const HOW = 'Twenty-five business questions climb from gimme to expert, five rounds of five cycling brands and products, markets and money, founders and bosses, deals and disasters, and business history. One wrong answer or an empty clock ends the run.';
const COLOR = '#0f5132', NAVY = '#4fbf8b', BG = '#e9f5ee', BORDER = 'rgba(15,81,50,0.4)';

// ─── 1. lib/daily-games.js, the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers', tag: 'No numbers, only dots', how: 'Kropki sudoku: not one digit is printed. A white dot means the neighbours differ by 1, a black dot means one is double the other, and no dot means neither, so the silences are clues too.', color: '#16a34a', colorNavy: '#67dd9a' },\n];`,
  `  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers', tag: 'No numbers, only dots', how: 'Kropki sudoku: not one digit is printed. A white dot means the neighbours differ by 1, a black dot means one is double the other, and no dot means neither, so the silences are clues too.', color: '#16a34a', colorNavy: '#67dd9a' },\n  { key: 'biz', miss: 'Asked', name: 'Biz', cat: 'Trivia', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },\n];`);

// ─── 2. lib/sunday-editions.js, deliberately NOT edited ────────────────────
// Biz runs no Sunday Edition, matching Streak, Deep, Atlas and Sport, and
// scripts/verify-biz.mjs FAILS any day flagged sunday. A key here with no
// flagged puzzle would put a Sun chip on a tile that never has one.

// ─── 3. app/DailyEndCard.jsx, icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['encore', 'calc',`,
  `const LAUNCH_PIN = { keys: ['biz', 'encore', 'calc',`);
edit('app/DailyEndCard.jsx',
  `  encore: { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: TableProperties },`,
  `  encore: { accent: '#1d4ed8', badgeBg: '#1d4ed8', badgeInk: T.white, Fin: TableProperties },\n  biz: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: TrendingUp },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'sport', cat: 'trivia',    name: 'Sport',`,
  `  { key: 'biz',   cat: 'trivia',    name: 'Biz',   tag: '${DTAG}', blurb: 'Twenty-five business questions, gimme to expert, five lanes a round from brands and markets to founders, deals and business history. One wrong answer ends the run.', href: '/biz' },\n  { key: 'sport', cat: 'trivia',    name: 'Sport',`);

// ─── 4. app/api/quiz/daily-order/route.js, the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['encore', 'calc',`,
  `const LAUNCH_PIN = { keys: ['biz', 'encore', 'calc',`);

// ─── 5. app/DailyGamesPromo.jsx ────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'encore', href: '/encore', name: 'Encore', tag: 'the daily crossword', store: 'sot_encore_day', accent: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)' },`,
  `  { key: 'encore', href: '/encore', name: 'Encore', tag: 'the daily crossword', store: 'sot_encore_day', accent: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)' },\n  { key: 'biz', href: '/biz', name: 'Biz', tag: 'business, one life', store: 'sot_biz_day', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}' },`);

// ─── 6. app/DailyGamesGrid.jsx, BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'encore', href: '/encore', name: 'Encore', tag: 'The daily crossword', img: '/games/btn-encore.png' },`,
  `  { key: 'encore', href: '/encore', name: 'Encore', tag: 'The daily crossword', img: '/games/btn-encore.png' },\n  { key: 'biz', href: '/biz', name: 'Biz', tag: '${DTAG}', img: '/games/btn-biz.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'bracket',`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'bracket',`);

// ─── 7. app/DailyStrip.jsx, the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'encore', href: '/encore', name: 'Encore', img: '/games/btn-encore.png', store: 'sot_encore_day', tag: "The daily crossword" , cat: 'Word' },`,
  `  { key: 'encore', href: '/encore', name: 'Encore', img: '/games/btn-encore.png', store: 'sot_encore_day', tag: "The daily crossword" , cat: 'Word' },\n  { key: 'biz', href: '/biz', name: 'Biz', img: '/games/btn-biz.png', store: 'sot_biz_day', tag: "${DTAG}" , cat: 'Trivia' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { encore: '#86a9ff',`,
  `const ACCENTS = { biz: '${NAVY}', encore: '#86a9ff',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { encore: '#1d4ed8',`,
  `const TCOL = { biz: '${COLOR}', encore: '#1d4ed8',`);

// ─── 8. app/daily/page.js, import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as ENCORE_FULL } from '../encore/puzzles';`,
  `import { PUZZLES as ENCORE_FULL } from '../encore/puzzles';\nimport { PUZZLES as BIZ_FULL } from '../biz/puzzles';`);
edit('app/daily/page.js',
  `const ENCORE = ENCORE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const ENCORE = ENCORE_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst BIZ = BIZ_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'encore', name: 'Encore', path: '/encore', tag: 'The daily crossword', accent: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)', src: ENCORE },`,
  `  { key: 'encore', name: 'Encore', path: '/encore', tag: 'The daily crossword', accent: '#1d4ed8', bg: '#eff6ff', border: 'rgba(29,78,216,0.4)', src: ENCORE },\n  { key: 'biz', name: 'Biz', path: '/biz', tag: '${DTAG}', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}', src: BIZ },`);

// ─── 9. app/daily/DailyArchiveClient.jsx, family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'bracket',`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'bracket',`);
edit('app/daily/DailyArchiveClient.jsx',
  `calc: '#fb7185', encore: '#86a9ff',`,
  `calc: '#fb7185', encore: '#86a9ff', biz: '${NAVY}',`);

// ─── 10. lib/sitemap-entries.js ────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore',`,
  `  'calc', 'encore', 'biz',`);

// ─── 11. the FOUR puzzle-map registries (item 11's "three routes" is four) ──
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_encore } from '@/app/encore/puzzles';`,
    `import { PUZZLES as P_encore } from '@/app/encore/puzzles';\nimport { PUZZLES as P_biz } from '@/app/biz/puzzles';`);
  edit(f, `encore: P_encore`, `encore: P_encore, biz: P_biz`);
}

// ─── 12. app/api/quiz/daily-status/route.js, the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|calc|encore)-\\d+-\\d+-\\d+$/;`,
  `|calc|encore|biz)-\\d+-\\d+-\\d+$/;`);

// ─── 13. app/quizzes/QuizHomeClient.jsx, its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|calc|encore)-/;`,
  `|calc|encore|biz)-/;`);

// ─── 14. lib/og-brand-card.js, the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderBizCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__biz-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__biz-card.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx, the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'calc', 'encore',`,
  `'calc', 'encore', 'biz',`);

// ─── 16. lib/quiz-catalog.js ───────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'calc', 'encore']);`,
  `'calc', 'encore', 'biz']);`);

// ─── 17. lib/loft.js, WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'atlas', 'sport', 'calc', 'encore',\n]);`,
  `'atlas', 'sport', 'calc', 'encore', 'biz',\n]);`);

// ─── 18. the two scoring registries the gauntlet shape needs ───────────────
// Biz is a BATTERY OF INDEPENDENT QUESTIONS, like Streak, Atlas and Sport, so
// it pays IQ Points linearly (thirty right is thirty correct answers) and its
// answered count is cleared + 1, because the player also faced the question
// that killed the run. A fourth game of this shape needs only its key in these
// two conditions. Deep and Blitz are in NEITHER, which looks like an oversight,
// left alone because changing them re-scores history.
edit('lib/quiz-xp.js',
  `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'sport', 'feud']);`,
  `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'sport', 'biz', 'feud']);`);
edit('lib/quiz-scoring.js',
  `  if (key === 'streak' || key === 'atlas' || key === 'sport') {`,
  `  if (key === 'streak' || key === 'atlas' || key === 'sport' || key === 'biz') {`);

// ─── 19. lib/circuits.js, deliberately NOT edited ──────────────────────────
// Gauntlet is the circuit Biz belongs to by shape (multiple choice, one life,
// ends on the first miss) and it is AT ITS CAP of five on a fixed roster, so a
// sixth cannot join without converting it to a rotating pool, which changes
// what a run is. Its blurb and share copy do not claim to be exhaustive, so
// nothing there goes stale. Whether Biz should take a slot is an owner call.

console.log(`wire-biz: ${applied} edits applied, ${skipped} already present`);
