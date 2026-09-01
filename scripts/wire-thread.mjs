// scripts/wire-thread.mjs — wires the daily game `thread` into every registry.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not
// its partner is dropped with no error and no gap), so every anchor here must
// match EXACTLY ONCE or the script throws. It is idempotent: an edit whose
// replacement is already present is skipped, so a re-run after a partial push
// is safe. The idempotency test compares the WHOLE replacement (the wire-calc
// suffix bug).
//
//   node scripts/wire-thread.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never
// the working tree, which satisfies the stale-base rule for free. The og card
// body is read from <dir>/__thread-card.js and removed after the append.
//
// It ALSO makes the one edit outside Thread's own wiring: Links' registry
// tag and rules copy said "hidden threads", and two games cannot both mean
// "thread" with only one of them called that. Links now says "groups"
// everywhere a reader can see it (registry, grid, strip, promo, end card,
// archive, its own page metadata, share text and the OG card).
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-thread.mjs <dir>'); process.exit(1); }

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

const TAG = 'Nine films described badly, one thread';
const HOW = 'Nine films, each described in one sentence by someone who missed the point, and all nine share one hidden thread. Type titles in any order, no penalty for a miss. Call the thread whenever you like: the earlier you call it right, the more it pays, and three wrong calls lock it. Sundays run sixteen films and two threads.';
const COLOR = '#8b2c6b', NAVY = '#e9a3d0';

// ─── 1. lib/daily-games.js — the single source of truth, one row ────────────
edit('lib/daily-games.js',
  `color: '#8a4b08', colorNavy: '#fdba74' },`,
  `color: '#8a4b08', colorNavy: '#fdba74' },\n  { key: 'thread', miss: 'Wrong calls', name: 'Thread', cat: 'Trivia', tag: '${TAG}', how: '${HOW}', color: '${COLOR}', colorNavy: '${NAVY}' },`);

// ─── 1b. lib/daily-row-stats.js — the singular for the new miss label ───────
edit('lib/daily-row-stats.js',
  `  Wrong: 'wrong',\n};`,
  `  Wrong: 'wrong',\n  'Wrong calls': 'wrong call',\n};`);

// ─── 1c. lib/sunday-editions.js — Thread runs a Sunday Edition ──────────────
edit('lib/sunday-editions.js',
  `  'knight',\n];`,
  `  'knight',\n  'thread',\n];`);

// ─── 2. app/DailyEndCard.jsx — LAUNCH_PIN, GAME_META, tile copy ────────────
// (Waypoints, the Fin icon below, is already imported by DailyEndCard.)
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['focus', 'script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['thread', 'focus', 'script', 'quotes',`);
edit('app/DailyEndCard.jsx',
  `  focus: { accent: '#8a4b08', badgeBg: '#8a4b08', badgeInk: T.white, Fin: ZoomIn },`,
  `  focus: { accent: '#8a4b08', badgeBg: '#8a4b08', badgeInk: T.white, Fin: ZoomIn },\n  thread: { accent: '${COLOR}', badgeBg: '${COLOR}', badgeInk: T.white, Fin: Waypoints },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'focus', cat: 'trivia',   name: 'Focus', tag: 'Name the zoomed-in photo',`,
  `  { key: 'thread', cat: 'trivia',   name: 'Thread', tag: '${TAG}', blurb: 'Nine films described by someone who missed the point, and one thing they all share. Name the films, then call the thread, early if you dare.', href: '/thread' },\n  { key: 'focus', cat: 'trivia',   name: 'Focus', tag: 'Name the zoomed-in photo',`);

// ─── 3. app/api/quiz/daily-order/route.js — the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['focus', 'script', 'quotes',`,
  `const LAUNCH_PIN = { keys: ['thread', 'focus', 'script', 'quotes',`);

// ─── 4. app/DailyGamesPromo.jsx ─────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'focus', href: '/focus', name: 'Focus', tag: 'name the zoomed-in photo', store: 'sot_focus_day', accent: '#8a4b08', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)' },`,
  `  { key: 'focus', href: '/focus', name: 'Focus', tag: 'name the zoomed-in photo', store: 'sot_focus_day', accent: '#8a4b08', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)' },\n  { key: 'thread', href: '/thread', name: 'Thread', tag: 'nine films described badly, one thread', store: 'sot_thread_day', accent: '${COLOR}', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)' },`);

// ─── 5. app/DailyGamesGrid.jsx — BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'focus', href: '/focus', name: 'Focus', tag: 'Name the zoomed-in photo', img: '/games/btn-focus.png' },`,
  `  { key: 'focus', href: '/focus', name: 'Focus', tag: 'Name the zoomed-in photo', img: '/games/btn-focus.png' },\n  { key: 'thread', href: '/thread', name: 'Thread', tag: '${TAG}', img: '/games/btn-thread.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);

// ─── 6. app/DailyStrip.jsx — the row, plus both colour maps ─────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'focus', href: '/focus', name: 'Focus', img: '/games/btn-focus.png', store: 'sot_focus_day', tag: "Name the zoomed-in photo" , cat: 'Trivia' },`,
  `  { key: 'focus', href: '/focus', name: 'Focus', img: '/games/btn-focus.png', store: 'sot_focus_day', tag: "Name the zoomed-in photo" , cat: 'Trivia' },\n  { key: 'thread', href: '/thread', name: 'Thread', img: '/games/btn-thread.png', store: 'sot_thread_day', tag: "${TAG}" , cat: 'Trivia' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { focus: '#fdba74',`,
  `const ACCENTS = { thread: '${NAVY}', focus: '#fdba74',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { focus: '#8a4b08',`,
  `const TCOL = { thread: '${COLOR}', focus: '#8a4b08',`);

// ─── 7. app/daily/page.js — import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as FOCUS_FULL } from '../focus/puzzles';`,
  `import { PUZZLES as FOCUS_FULL } from '../focus/puzzles';\nimport { PUZZLES as THREAD_FULL } from '../thread/puzzles';`);
edit('app/daily/page.js',
  `const FOCUS = FOCUS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const FOCUS = FOCUS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst THREAD = THREAD_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'focus', name: 'Focus', path: '/focus', tag: 'Name the zoomed-in photo', accent: '#8a4b08', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)', src: FOCUS },`,
  `  { key: 'focus', name: 'Focus', path: '/focus', tag: 'Name the zoomed-in photo', accent: '#8a4b08', bg: '#fdf3e6', border: 'rgba(138,75,8,0.4)', src: FOCUS },\n  { key: 'thread', name: 'Thread', path: '/thread', tag: '${TAG}', accent: '${COLOR}', bg: '#f7e9f2', border: 'rgba(139,44,107,0.4)', src: THREAD },`);

// ─── 8. app/daily/DailyArchiveClient.jsx — family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'focus', 'thread', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`);
edit('app/daily/DailyArchiveClient.jsx',
  `focus: '#fdba74',`,
  `focus: '#fdba74', thread: '${NAVY}',`);

// ─── 9. lib/sitemap-entries.js ──────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`,
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus', 'thread',`);

// ─── 10. the FOUR puzzle-map registries ─────────────────────────────────────
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_focus } from '@/app/focus/puzzles';`,
    `import { PUZZLES as P_focus } from '@/app/focus/puzzles';\nimport { PUZZLES as P_thread } from '@/app/thread/puzzles';`);
  edit(f, `focus: P_focus`, `focus: P_focus, thread: P_thread`);
}

// ─── 11. app/api/quiz/daily-status/route.js — the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|quotes|focus)-`,
  `|quotes|focus|thread)-`);

// ─── 12. app/quizzes/QuizHomeClient.jsx — its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|quotes|focus)-`,
  `|quotes|focus|thread)-`);

// ─── 13. lib/og-brand-card.js — the share card, appended ────────────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderThreadCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__thread-card.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__thread-card.js'), { force: true });
}

// ─── 14. app/DailySlateRail.jsx — the A-Z rail ──────────────────────────────
edit('app/DailySlateRail.jsx',
  `'atlas', 'sport', 'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`,
  `'atlas', 'sport', 'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus', 'thread',`);

// ─── 15. lib/quiz-catalog.js ────────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'script', 'quotes', 'focus']);`,
  `'script', 'quotes', 'focus', 'thread']);`);

// ─── 16. lib/loft.js — WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus',`,
  `'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes', 'focus', 'thread',`);

// ─── 17. Links gives up the word "thread" ───────────────────────────────────
edit('lib/daily-games.js',
  `tag: 'Four hidden threads', how: 'Sort sixteen words into the four hidden threads that connect them,`,
  `tag: 'Four hidden groups', how: 'Sort sixteen words into the four hidden groups that connect them,`);
edit('app/DailyGamesGrid.jsx',
  `name: 'Links', tag: 'Four hidden threads',`,
  `name: 'Links', tag: 'Four hidden groups',`);
edit('app/DailyStrip.jsx',
  `store: 'sot_links_day', tag: "Four hidden threads"`,
  `store: 'sot_links_day', tag: "Four hidden groups"`);
edit('app/daily/page.js',
  `tag: 'Sixteen words, four hidden threads',`,
  `tag: 'Sixteen words, four hidden groups',`);
edit('app/DailyGamesPromo.jsx',
  `tag: 'sixteen words, four hidden threads',`,
  `tag: 'sixteen words, four hidden groups',`);
edit('app/DailyEndCard.jsx',
  `name: 'Links',  tag: 'Four hidden threads',`,
  `name: 'Links',  tag: 'Four hidden groups',`);
edit('app/links/page.js',
  `      'Sixteen words, four hidden threads, four mistakes to spare. The words that look like they belong together usually don’t. A new word puzzle from Mind Loft.',`,
  `      'Sixteen words, four hidden groups, four mistakes to spare. The words that look like they belong together usually don’t. A new word puzzle from Mind Loft.',`);
edit('app/links/page.js',
  `      'Sixteen words, four hidden threads, four mistakes to spare.',`,
  `      'Sixteen words, four hidden groups, four mistakes to spare.',`);
edit('app/links/LinksClient.jsx',
  `// Links — sixteen words, four hidden threads.`,
  `// Links — sixteen words, four hidden groups.`);
edit('app/links/LinksClient.jsx',
  `? \`Links #\${PUZZLE.num} — sixteen words, four hidden threads. Can you untangle them?\\n\${shareUrl()}\``,
  `? \`Links #\${PUZZLE.num} — sixteen words, four hidden groups. Can you untangle them?\\n\${shareUrl()}\``);
edit('lib/og-brand-card.js',
  `T('Sixteen words. Four hidden threads.',`,
  `T('Sixteen words. Four hidden groups.',`);

// ─── 18. lib/game-glyphs.js — the one-colour glyph every stage surface draws ─
// The owner's call (2026-09-01): no tile art, a glyph. A strand of thread
// with one loop, currentColor, so it tints to the Trivia step in either
// register.
edit('lib/game-glyphs.js',
  `  quotes: 'M8 15c-2 0-3-1-3-3s1-3 3-3 3 1 3 3c0 3-2 4-4 5M18 15c-2 0-3-1-3-3s1-3 3-3 3 1 3 3c0 3-2 4-4 5',`,
  `  quotes: 'M8 15c-2 0-3-1-3-3s1-3 3-3 3 1 3 3c0 3-2 4-4 5M18 15c-2 0-3-1-3-3s1-3 3-3 3 1 3 3c0 3-2 4-4 5',
  thread: 'M2 18C7 18 7 4 13 4C19 4 18 14 12 14C7 14 8 6 14 7C20 8 20 18 22 20', // a strand with one loop`);

console.log(`wire-thread: ${applied} edits applied, ${skipped} already present`);
