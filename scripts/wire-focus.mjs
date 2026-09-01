// scripts/wire-focus.mjs — wires the daily game `focus` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not
// its partner is dropped with no error and no gap), so every anchor here must
// match EXACTLY ONCE or the script throws. It is idempotent: an edit whose
// replacement is already present is skipped, so a re-run after a partial push
// is safe. The idempotency test compares the WHOLE replacement (the wire-calc
// suffix bug).
//
//   node scripts/wire-focus.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree, which satisfies the stale-base rule for free. The og card
// body is read from <dir>/__focus-card.js and removed after the append.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-focus.mjs <dir>'); process.exit(1); }

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

const TAG = 'Name the zoomed-in photo';
const HOW = 'One photo a day, shown first as a tiny crop at fourteen times. Type and pick its name from the day’s list. Every wrong name pulls the camera back one frame; the sixth frame is the whole photo and one last guess. Frame 1 is 6 points, frame 6 is 1. A new subject every day of the week.';
const COLOR = '#8a4b08', NAVY = '#fdba74';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `color: '#3d4f7c', colorNavy: '#a8b8e8' },`,
  `color: '#3d4f7c', colorNavy: '#a8b8e8' },\n  { key: 'focus', miss: 'Misses', name: 'Focus', cat: 'Trivia', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);

// (no Sunday Edition: lib/sunday-editions.js untouched)

// ─── 2. app/DailyEndCard.jsx — icon import, LAUNCH_PIN, GAME_META, tile copy ─
edit('app/DailyEndCard.jsx',
  `  Clapperboard, Quote,\n} from 'lucide-react';`,
  `  Clapperboard, Quote, ZoomIn,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['focus', 'script', 'quotes',`);
edit('app/DailyEndCard.jsx',
  `  quotes: { accent: '#3d4f7c', badgeBg: '#3d4f7c', badgeInk: T.white, Fin: Quote },`,
  `  quotes: { accent: '#3d4f7c', badgeBg: '#3d4f7c', badgeInk: T.white, Fin: Quote },\n  focus: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: ZoomIn },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'quotes', cat: 'trivia',   name: 'Quotes', tag: 'Who said it, one life',`,
  `  { key: 'focus', cat: 'trivia',   name: 'Focus', tag: '${TAG}', blurb: 'One photo a day at fourteen times. Name it before six frames pull the camera all the way back; the earlier the frame, the more it pays.', href: '/focus' },\n  { key: 'quotes', cat: 'trivia',   name: 'Quotes', tag: 'Who said it, one life',`);

// ─── 3. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['focus', 'script', 'quotes',`);

// ─── 4. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: 'who said it, one life', store: 'sot_quotes_day', accent: '#3d4f7c', bg: '#eef1f8', border: 'rgba(61,79,124,0.4)' },`,
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: 'who said it, one life', store: 'sot_quotes_day', accent: '#3d4f7c', bg: '#eef1f8', border: 'rgba(61,79,124,0.4)' },\n  { key: 'focus', href: '/focus', name: 'Focus', tag: 'name the zoomed-in photo', store: 'sot_focus_day', accent: '${COLOR}', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)' },`);

// ─── 5. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: 'Who said it, one life', img: '/games/btn-quotes.png' },`,
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: 'Who said it, one life', img: '/games/btn-quotes.png' },\n  { key: 'focus', href: '/focus', name: 'Focus', tag: '${TAG}', img: '/games/btn-focus.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);

// ─── 6. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', img: '/games/btn-quotes.png', store: 'sot_quotes_day', tag: "Who said it, one life" , cat: 'Trivia' },`,
  `  { key: 'quotes', href: '/quotes', name: 'Quotes', img: '/games/btn-quotes.png', store: 'sot_quotes_day', tag: "Who said it, one life" , cat: 'Trivia' },\n  { key: 'focus', href: '/focus', name: 'Focus', img: '/games/btn-focus.png', store: 'sot_focus_day', tag: "${TAG}" , cat: 'Trivia' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { script: '#c9a4ea',`,
  `const ACCENTS = { focus: '${NAVY}', script: '#c9a4ea',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { script: '#4a1d6b',`,
  `const TCOL = { focus: '${COLOR}', script: '#4a1d6b',`);

// ─── 7. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as QUOTES_FULL } from '../quotes/puzzles';`,
  `import { PUZZLES as QUOTES_FULL } from '../quotes/puzzles';\nimport { PUZZLES as FOCUS_FULL } from '../focus/puzzles';`);
edit('app/daily/page.js',
  `const QUOTES = QUOTES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const QUOTES = QUOTES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst FOCUS = FOCUS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'quotes', name: 'Quotes', path: '/quotes', tag: 'Who said it, one life', accent: '#3d4f7c', bg: '#eef1f8', border: 'rgba(61,79,124,0.4)', src: QUOTES },`,
  `  { key: 'quotes', name: 'Quotes', path: '/quotes', tag: 'Who said it, one life', accent: '#3d4f7c', bg: '#eef1f8', border: 'rgba(61,79,124,0.4)', src: QUOTES },\n  { key: 'focus', name: 'Focus', path: '/focus', tag: '${TAG}', accent: '${COLOR}', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)', src: FOCUS },`);

// ─── 8. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `quotes: '#a8b8e8',`,
  `quotes: '#a8b8e8', focus: '${NAVY}',`);

// ─── 9. lib/sitemap-entries.js ──────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`,
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`);

// ─── 10. the FOUR puzzle-map registries ─────────────────────────────────────
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_quotes } from '@/app/quotes/puzzles';`,
    `import { PUZZLES as P_quotes } from '@/app/quotes/puzzles';\nimport { PUZZLES as P_focus } from '@/app/focus/puzzles';`);
  edit(f, `quotes: P_quotes`, `quotes: P_quotes, focus: P_focus`);
}

// ─── 11. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|quotes)-`,
  `|quotes|focus)-`);

// ─── 12. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|quotes)-`,
  `|quotes|focus)-`);

// ─── 13. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderFocusCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__focus-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__focus-card.js'), { force: true });
}

// ─── 14. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'atlas', 'sport', 'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`,
  `'atlas', 'sport', 'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`);

// ─── 15. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'script', 'quotes']);`,
  `'script', 'quotes', 'focus']);`);

// ─── 16. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`,
  `'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`);

console.log(`wire-focus: ${applied} edits applied, ${skipped} already present`);
