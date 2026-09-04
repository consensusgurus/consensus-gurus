// scripts/wire-slot.mjs — wires the daily game `slot` into every registry.
//
// An ANCHORED script, per the daily-game checklist and in the shape of
// scripts/wire-thread.mjs: half these registries fail SILENTLY when missed
// (a key in one list and not its partner is dropped with no error and no
// gap), so every anchor must match EXACTLY ONCE or the script throws.
// Idempotent: an edit whose replacement is already present is skipped, so a
// re-run after a partial push is safe.
//
//   node scripts/wire-slot.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree.
//
// Slot sits directly after Thread in every ordered list: the two newest
// Trivia dailies together, both built on things a player half-knows.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-slot.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 140)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const TAG = 'Ten things, one at a time';
// THE FIRST TWO SENTENCES ARE THE SHARE CARD (lib/og-stage-cards trims `how`
// to whole sentences under 150 characters). These two say the whole game.
const HOW = 'Ten real things on one axis arrive one at a time. Place each in a slot before you see the next, and nothing moves once it is down. The reveal shows the true order beside yours, and the order they arrive in is the difficulty: Monday deals the anchors first, Saturday the middle. Sundays run twelve slots.';
const COLOR = '#4a5d23', NAVY = '#b8cf6e';
const BG = '#eef2e3', BORDER = 'rgba(74,93,35,0.4)';

// ─── 1. lib/daily-games.js — the single source of truth, one row, plus the premiere
edit('lib/daily-games.js',
  `color: '#8b2c6b', colorNavy: '#e9a3d0' },`,
  `color: '#8b2c6b', colorNavy: '#e9a3d0' },\n  // Slot posts nothing against you: the score is exact placements, the\n  // near misses ride in \`progress\` as the tiebreak, so \`miss\` is null and the\n  // board falls through score, then progress, then the clock.\n  { key: 'slot', miss: null, name: 'Slot', cat: 'Trivia', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);
edit('lib/daily-games.js',
  `  { key: 'impound', from: '2026-09-04', until: '2026-09-08' },\n];`,
  `  { key: 'impound', from: '2026-09-04', until: '2026-09-08' },\n  { key: 'slot', from: '2026-09-04', until: '2026-09-08' },\n];`);

// ─── 2. lib/sunday-editions.js — Slot runs one (twelve slots) ─────────────
edit('lib/sunday-editions.js',
  `  'thread',\n];`,
  `  'thread',\n  'slot',\n];`);

// ─── 3. app/DailyEndCard.jsx — the lucide import, LAUNCH_PIN, GAME_META, tile copy
// The import goes FIRST and is its own edit, so a missed one is a visible
// failure here rather than a ReferenceError at render.
edit('app/DailyEndCard.jsx',
  `  Clapperboard, Quote, ZoomIn, Axe, Truck,\n} from 'lucide-react';`,
  `  Clapperboard, Quote, ZoomIn, Axe, Truck, Rows3,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['impound',`,
  `const LAUNCH_PIN = { keys: ['slot', 'impound',`);
edit('app/DailyEndCard.jsx',
  `  thread: { accent: '#8b2c6b', badgeBg: '#8b2c6b', badgeInk: T.white, Fin: Waypoints },`,
  `  thread: { accent: '#8b2c6b', badgeBg: '#8b2c6b', badgeInk: T.white, Fin: Waypoints },\n  slot: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Rows3 },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'focus', cat: 'trivia',   name: 'Focus', tag: 'Name the zoomed-in photo',`,
  `  { key: 'slot', cat: 'trivia',   name: 'Slot', tag: '${TAG}', blurb: 'Ten things on one axis, dealt one at a time. Drop each into a slot before you see the next; nothing moves once it is down, and the reveal shows the true order beside yours.', href: '/slot' },\n  { key: 'focus', cat: 'trivia',   name: 'Focus', tag: 'Name the zoomed-in photo',`);

// ─── 4. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['impound',`,
  `const LAUNCH_PIN = { keys: ['slot', 'impound',`);

// ─── 5. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'thread', href: '/thread', name: 'Thread', tag: 'nine films described badly, one thread', store: 'sot_thread_day', accent: '#8b2c6b', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)' },`,
  `  { key: 'thread', href: '/thread', name: 'Thread', tag: 'nine films described badly, one thread', store: 'sot_thread_day', accent: '#8b2c6b', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)' },\n  { key: 'slot', href: '/slot', name: 'Slot', tag: 'ten things, one at a time', store: 'sot_slot_day', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}' },`);

// ─── 6. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'thread', href: '/thread', name: 'Thread', tag: 'Nine films described badly, one thread', img: '/games/btn-thread.png' },`,
  `  { key: 'thread', href: '/thread', name: 'Thread', tag: 'Nine films described badly, one thread', img: '/games/btn-thread.png' },\n  { key: 'slot', href: '/slot', name: 'Slot', tag: '${TAG}', img: '/games/btn-slot.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'slot', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);

// ─── 7. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'thread', href: '/thread', name: 'Thread', img: '/games/btn-thread.png', store: 'sot_thread_day', tag: "Nine films described badly, one thread" , cat: 'Trivia' },`,
  `  { key: 'thread', href: '/thread', name: 'Thread', img: '/games/btn-thread.png', store: 'sot_thread_day', tag: "Nine films described badly, one thread" , cat: 'Trivia' },\n  { key: 'slot', href: '/slot', name: 'Slot', img: '/games/btn-slot.png', store: 'sot_slot_day', tag: "${TAG}" , cat: 'Trivia' },`);
edit('app/DailyStrip.jsx', `const ACCENTS = { impound:`, `const ACCENTS = { slot: '${NAVY}', impound:`);
edit('app/DailyStrip.jsx', `const TCOL = { impound:`, `const TCOL = { slot: '${COLOR}', impound:`);

// ─── 8. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as THREAD_FULL } from '../thread/puzzles';`,
  `import { PUZZLES as THREAD_FULL } from '../thread/puzzles';\nimport { PUZZLES as SLOT_FULL } from '../slot/puzzles';`);
edit('app/daily/page.js',
  `const THREAD = THREAD_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const THREAD = THREAD_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst SLOT = SLOT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'thread', name: 'Thread', path: '/thread', tag: 'Nine films described badly, one thread', accent: '#8b2c6b', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)', src: THREAD },`,
  `  { key: 'thread', name: 'Thread', path: '/thread', tag: 'Nine films described badly, one thread', accent: '#8b2c6b', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)', src: THREAD },\n  { key: 'slot', name: 'Slot', path: '/slot', tag: '${TAG}', accent: '${COLOR}', bg: '${BG}', border: '${BORDER}', src: SLOT },`);

// ─── 9. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'slot', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);
edit('app/daily/DailyArchiveClient.jsx', `thread: '#e9a3d0'`, `thread: '#e9a3d0', slot: '${NAVY}'`);

// ─── 10. lib/sitemap-entries.js — keyed by ROUTE ───────────────────────────
edit('lib/sitemap-entries.js',
  `'script', 'quotes', 'focus', 'thread', 'whittle',`,
  `'script', 'quotes', 'focus', 'thread', 'slot', 'whittle',`);

// ─── 11. the FOUR puzzle-map registries (sunday-slate included: Slot runs one)
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_thread } from '@/app/thread/puzzles';`,
    `import { PUZZLES as P_thread } from '@/app/thread/puzzles';\nimport { PUZZLES as P_slot } from '@/app/slot/puzzles';`);
  edit(f, `thread: P_thread`, `thread: P_thread, slot: P_slot`);
}

// ─── 12. the two hardcoded alternations ─────────────────────────────────────
edit('app/api/quiz/daily-status/route.js', `|thread|`, `|thread|slot|`);
edit('app/quizzes/QuizHomeClient.jsx', `|thread|`, `|thread|slot|`);

// ─── 13. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'script', 'quotes', 'focus', 'thread', 'whittle',`,
  `'script', 'quotes', 'focus', 'thread', 'slot', 'whittle',`);

// ─── 14. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js', `'focus', 'thread'`, `'focus', 'thread', 'slot'`);

// ─── 15. lib/loft.js — the shared chrome; keyed by the client's slug (= key here)
edit('lib/loft.js',
  `'script', 'quotes', 'focus', 'thread', 'whittle',`,
  `'script', 'quotes', 'focus', 'thread', 'slot', 'whittle',`);

// ─── 16. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
edit('lib/game-glyphs.js',
  `  thread: 'M2 18C7 18 7 4 13 4C19 4 18 14 12 14C7 14 8 6 14 7C20 8 20 18 22 20', // a strand with one loop`,
  `  thread: 'M2 18C7 18 7 4 13 4C19 4 18 14 12 14C7 14 8 6 14 7C20 8 20 18 22 20', // a strand with one loop\n  // Slot draws the board: three slots, the middle one filled, because the\n  // middle is where a blind placement lands and where it breaks.\n  slot: 'M3 5h18M3 19h18M5 8h14v8H5z',                          // the card between the rails`);

// ─── 17. lib/puzzle-categories.js — the /trivia-games landing page ──────────
edit('lib/puzzle-categories.js',
  `    keys: ['streak', 'deep', 'sport', 'atlas', 'biz', 'script', 'quotes', 'focus', 'thread', 'extra', 'circa', 'dating', 'listed', 'bracket', 'niche', 'redact'],`,
  `    keys: ['streak', 'deep', 'sport', 'atlas', 'biz', 'script', 'quotes', 'focus', 'thread', 'slot', 'extra', 'circa', 'dating', 'listed', 'bracket', 'niche', 'redact'],`);
edit('lib/puzzle-categories.js',
  `thread: 'Films described badly', extra: 'Redacted headline',`,
  `thread: 'Films described badly', slot: 'Blind ranking', extra: 'Redacted headline',`);
edit('lib/puzzle-categories.js',
  `Listed asks you to rank eight real things top to bottom.',`,
  `Listed asks you to rank eight real things top to bottom, and Slot deals ten things one at a time and makes you place each before you see the next.',`);
edit('lib/puzzle-categories.js',
  `['Sunday Edition', 'Thread runs sixteen films and two threads, Dating six events, Niche a 4x4 grid on countries.'],`,
  `['Sunday Edition', 'Thread runs sixteen films and two threads, Slot twelve slots, Dating six events, Niche a 4x4 grid on countries.'],`);

console.log(`wire-slot: ${applied} edits applied, ${skipped} already present`);
