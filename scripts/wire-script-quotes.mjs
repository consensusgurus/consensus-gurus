// scripts/wire-script-quotes.mjs, wires the two new daily gauntlets `script`
// and `quotes` into every registry, and amends the Trivia Gauntlet to seven.
//
// Done as an ANCHORED script rather than by hand, per the daily-game checklist:
// half these registries fail SILENTLY when missed (a key in one list and not
// its partner is dropped with no error and no gap), so every anchor here must
// match EXACTLY ONCE or the script throws. It is idempotent: an edit whose
// replacement is already present is skipped, so a re-run after a partial push
// is safe.
//
//   node scripts/wire-script-quotes.mjs <dir>
//
// <dir> is a tree exported from a same-step `git archive FETCH_HEAD`, never the
// working tree, which satisfies the stale-base rule for free.
import fs from 'fs';
import path from 'path';

const root = process.argv[2];
if (!root) { console.error('usage: node wire-script-quotes.mjs <dir>'); process.exit(1); }

let applied = 0, skipped = 0;
// The idempotency test is "is the finished text already here", i.e. the WHOLE
// replacement, never a suffix of it. Comparing a slice silently skips any edit
// that inserts into the MIDDLE of a line and reports the run clean.
function edit(file, anchor, replacement) {
  const p = path.join(root, file);
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes(replacement)) { skipped++; return; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor matched ${n} times, expected 1\n  ${anchor.slice(0, 120)}`);
  fs.writeFileSync(p, src.replace(anchor, replacement));
  applied++;
}

const G = {
  script: {
    Key: 'Script', color: '#4a1d6b', navy: '#c9a4ea', bg: '#f3ecf9', border: 'rgba(74,29,107,0.4)',
    subject: 'Film & TV', icon: 'Clapperboard',
    tag: 'Twenty-five questions, one life',
    dtag: 'Movies and TV, one life',
    how: 'Twenty-five film and television questions climb from gimme to expert, five rounds of five cycling movies, television, actors and directors, awards and box office, and behind the scenes. One wrong answer or an empty clock ends the run.',
    gridTag: 'Movies and TV, one life',
    stripTag: 'Movies and TV, one life',
    promoTag: 'movies and TV, one life',
    ecBlurb: 'Twenty-five film and television questions, gimme to expert, five lanes a round from the movies themselves to the awards, the money and what happened behind the camera. One wrong answer ends the run.',
    tiers: "['Opening credits', 'First act', 'Second act', 'Third act', 'The credits roll']",
  },
  quotes: {
    Key: 'Quotes', color: '#3d4f7c', navy: '#a8b8e8', bg: '#eef1f8', border: 'rgba(61,79,124,0.4)',
    subject: 'Quotations', icon: 'Quote',
    tag: 'Twenty-five questions, one life',
    dtag: 'Who said it, one life',
    how: 'Twenty-five famous lines climb from gimme to expert, five rounds of five cycling presidents and politics, history and war, science and letters, books and authors, and screen lines. Four lanes ask who really said it and the fifth asks which character. One wrong answer or an empty clock ends the run.',
    gridTag: 'Who said it, one life',
    stripTag: 'Who said it, one life',
    promoTag: 'who said it, one life',
    ecBlurb: 'Twenty-five famous lines, gimme to expert, five lanes a round from presidents and generals to scientists, writers and the odd film character. One wrong attribution ends the run.',
    tiers: "['Household words', 'Well known', 'Worth knowing', 'For the reader', 'Chapter and verse']",
  },
};

// ─── 1. lib/daily-games.js, the single source of truth, one row each ───────
edit('lib/daily-games.js',
  `  { key: 'flank', miss: 'Wrong', name: 'Flank', cat: 'Geography', tag: 'Name every neighbor',`,
  `  { key: 'script', miss: 'Asked', name: 'Script', cat: 'Trivia', subject: '${G.script.subject}', tag: '${G.script.tag}', how: '${G.script.how}', color: '${G.script.color}', colorNavy: '${G.script.navy}' },\n  { key: 'quotes', miss: 'Asked', name: 'Quotes', cat: 'Trivia', subject: '${G.quotes.subject}', tag: '${G.quotes.tag}', how: '${G.quotes.how}', color: '${G.quotes.color}', colorNavy: '${G.quotes.navy}' },\n  { key: 'flank', miss: 'Wrong', name: 'Flank', cat: 'Geography', tag: 'Name every neighbor',`);

// ─── 2. lib/sunday-editions.js, deliberately NOT edited ────────────────────
// Neither game runs a Sunday Edition, matching Streak, Deep, Atlas, Sport and
// Biz, and both verifiers FAIL any day flagged sunday. A key here with no
// flagged puzzle would put a Sun chip on a tile that never has one.

// ─── 3. app/DailyEndCard.jsx: icons, LAUNCH_PIN, GAME_META, tile copy ──────
edit('app/DailyEndCard.jsx',
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp, Milestone, CornerUpRight,\n} from 'lucide-react';`,
  `  ArrowLeftRight, Gem, Map as MapIcon, Divide, TableProperties, TrendingUp, Milestone, CornerUpRight,\n  Clapperboard, Quote,\n} from 'lucide-react';`);
edit('app/DailyEndCard.jsx',
  `const LAUNCH_PIN = { keys: ['knight', 'flank',`,
  `const LAUNCH_PIN = { keys: ['script', 'quotes', 'knight', 'flank',`);
edit('app/DailyEndCard.jsx',
  `  flank: { accent: '#3f6212', badgeBg: '#3f6212', badgeInk: T.white, Fin: Milestone },`,
  `  flank: { accent: '#3f6212', badgeBg: '#3f6212', badgeInk: T.white, Fin: Milestone },\n  script: { accent: '${G.script.color}', badgeBg: '${G.script.color}', badgeInk: T.white, Fin: Clapperboard },\n  quotes: { accent: '${G.quotes.color}', badgeBg: '${G.quotes.color}', badgeInk: T.white, Fin: Quote },`);
edit('app/DailyEndCard.jsx',
  `  { key: 'biz',   cat: 'trivia',    name: 'Biz',   tag: 'Business, one life',`,
  `  { key: 'script', cat: 'trivia',   name: 'Script', tag: '${G.script.dtag}', blurb: '${G.script.ecBlurb}', href: '/script' },\n  { key: 'quotes', cat: 'trivia',   name: 'Quotes', tag: '${G.quotes.dtag}', blurb: '${G.quotes.ecBlurb}', href: '/quotes' },\n  { key: 'biz',   cat: 'trivia',    name: 'Biz',   tag: 'Business, one life',`);

// ─── 4. app/api/quiz/daily-order/route.js, the LAUNCH_PIN mirror ───────────
edit('app/api/quiz/daily-order/route.js',
  `const LAUNCH_PIN = { keys: ['knight', 'flank',`,
  `const LAUNCH_PIN = { keys: ['script', 'quotes', 'knight', 'flank',`);

// ─── 5. app/DailyGamesPromo.jsx ────────────────────────────────────────────
edit('app/DailyGamesPromo.jsx',
  `  { key: 'flank', href: '/flank', name: 'Flank', tag: 'name every neighbor', store: 'sot_flank_day', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)' },`,
  `  { key: 'flank', href: '/flank', name: 'Flank', tag: 'name every neighbor', store: 'sot_flank_day', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)' },\n  { key: 'script', href: '/script', name: 'Script', tag: '${G.script.promoTag}', store: 'sot_script_day', accent: '${G.script.color}', bg: '${G.script.bg}', border: '${G.script.border}' },\n  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: '${G.quotes.promoTag}', store: 'sot_quotes_day', accent: '${G.quotes.color}', bg: '${G.quotes.bg}', border: '${G.quotes.border}' },`);

// ─── 6. app/DailyGamesGrid.jsx, BOTH lists, or the tile is dropped silently ─
edit('app/DailyGamesGrid.jsx',
  `  { key: 'flank', href: '/flank', name: 'Flank', tag: 'Name every neighbor', img: '/games/btn-flank.png' },`,
  `  { key: 'flank', href: '/flank', name: 'Flank', tag: 'Name every neighbor', img: '/games/btn-flank.png' },\n  { key: 'script', href: '/script', name: 'Script', tag: '${G.script.gridTag}', img: '/games/btn-script.png' },\n  { key: 'quotes', href: '/quotes', name: 'Quotes', tag: '${G.quotes.gridTag}', img: '/games/btn-quotes.png' },`);
edit('app/DailyGamesGrid.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz',`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes',`);

// ─── 7. app/DailyStrip.jsx, the row plus both colour maps ──────────────────
edit('app/DailyStrip.jsx',
  `  { key: 'flank', href: '/flank', name: 'Flank', img: '/games/btn-flank.png', store: 'sot_flank_day', tag: "Name every neighbor" , cat: 'Geography' },`,
  `  { key: 'flank', href: '/flank', name: 'Flank', img: '/games/btn-flank.png', store: 'sot_flank_day', tag: "Name every neighbor" , cat: 'Geography' },\n  { key: 'script', href: '/script', name: 'Script', img: '/games/btn-script.png', store: 'sot_script_day', tag: "${G.script.stripTag}" , cat: 'Trivia' },\n  { key: 'quotes', href: '/quotes', name: 'Quotes', img: '/games/btn-quotes.png', store: 'sot_quotes_day', tag: "${G.quotes.stripTag}" , cat: 'Trivia' },`);
edit('app/DailyStrip.jsx',
  `const ACCENTS = { knight: '#9d99f0',`,
  `const ACCENTS = { script: '${G.script.navy}', quotes: '${G.quotes.navy}', knight: '#9d99f0',`);
edit('app/DailyStrip.jsx',
  `const TCOL = { knight: '#3730a3',`,
  `const TCOL = { script: '${G.script.color}', quotes: '${G.quotes.color}', knight: '#3730a3',`);

// ─── 8. app/daily/page.js: import AND the map AND the card, or the build fails
edit('app/daily/page.js',
  `import { PUZZLES as FLANK_FULL } from '../flank/puzzles';`,
  `import { PUZZLES as FLANK_FULL } from '../flank/puzzles';\nimport { PUZZLES as SCRIPT_FULL } from '../script/puzzles';\nimport { PUZZLES as QUOTES_FULL } from '../quotes/puzzles';`);
edit('app/daily/page.js',
  `const FLANK = FLANK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
  `const FLANK = FLANK_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst SCRIPT = SCRIPT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst QUOTES = QUOTES_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`);
edit('app/daily/page.js',
  `  { key: 'flank', name: 'Flank', path: '/flank', tag: 'Name every neighbor', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)', src: FLANK },`,
  `  { key: 'flank', name: 'Flank', path: '/flank', tag: 'Name every neighbor', accent: '#3f6212', bg: '#f3f8ea', border: 'rgba(63,98,18,0.4)', src: FLANK },\n  { key: 'script', name: 'Script', path: '/script', tag: '${G.script.gridTag}', accent: '${G.script.color}', bg: '${G.script.bg}', border: '${G.script.border}', src: SCRIPT },\n  { key: 'quotes', name: 'Quotes', path: '/quotes', tag: '${G.quotes.gridTag}', accent: '${G.quotes.color}', bg: '${G.quotes.bg}', border: '${G.quotes.border}', src: QUOTES },`);

// ─── 9. app/daily/DailyArchiveClient.jsx, family keys + the navy accent ────
edit('app/daily/DailyArchiveClient.jsx',
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz',`,
  `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'biz', 'script', 'quotes',`);
edit('app/daily/DailyArchiveClient.jsx',
  `biz: '#4fbf8b', flank: '#b1d977',`,
  `biz: '#4fbf8b', flank: '#b1d977', script: '${G.script.navy}', quotes: '${G.quotes.navy}',`);

// ─── 10. lib/sitemap-entries.js ────────────────────────────────────────────
edit('lib/sitemap-entries.js',
  `  'calc', 'encore', 'biz', 'flank', 'knight',`,
  `  'calc', 'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`);

// ─── 11. the FOUR puzzle-map registries (item 11's "three routes" is four) ──
for (const f of ['lib/daily-slate.js', 'app/api/quiz/sunday-slate/route.js',
                 'app/api/quiz/daily-game/route.js', 'app/api/quiz/daily-unplayed/route.js']) {
  edit(f, `import { PUZZLES as P_knight } from '@/app/knight/puzzles';`,
    `import { PUZZLES as P_knight } from '@/app/knight/puzzles';\nimport { PUZZLES as P_script } from '@/app/script/puzzles';\nimport { PUZZLES as P_quotes } from '@/app/quotes/puzzles';`);
  edit(f, `biz: P_biz, flank: P_flank`, `biz: P_biz, flank: P_flank, script: P_script, quotes: P_quotes`);
}

// ─── 12. app/api/quiz/daily-status/route.js, the hardcoded alternation ─────
edit('app/api/quiz/daily-status/route.js',
  `|biz|flank|knight)-\\d+-\\d+-\\d+$/;`,
  `|biz|flank|knight|script|quotes)-\\d+-\\d+-\\d+$/;`);

// ─── 13. app/quizzes/QuizHomeClient.jsx, its own alternation ───────────────
edit('app/quizzes/QuizHomeClient.jsx',
  `|biz|flank|knight)-/;`,
  `|biz|flank|knight|script|quotes)-/;`);

// ─── 14. lib/og-brand-card.js, the two share cards, appended ───────────────
{
  const p = path.join(root, 'lib/og-brand-card.js');
  const src = fs.readFileSync(p, 'utf8');
  if (src.includes('renderScriptCard')) { skipped++; }
  else {
    fs.writeFileSync(p, src.replace(/\s*$/, '\n') + fs.readFileSync(path.join(root, '__sq-cards.js'), 'utf8'));
    applied++;
  }
  fs.rmSync(path.join(root, '__sq-cards.js'), { force: true });
}

// ─── 15. app/DailySlateRail.jsx, the A-Z rail, the 17th registry ───────────
edit('app/DailySlateRail.jsx',
  `'encore', 'biz', 'flank', 'knight',`,
  `'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`);

// ─── 16. lib/quiz-catalog.js ───────────────────────────────────────────────
edit('lib/quiz-catalog.js',
  `'biz', 'flank', 'knight']);`,
  `'biz', 'flank', 'knight', 'script', 'quotes']);`);

// ─── 17. lib/loft.js, WITHOUT this the client renders the pre-Loft page ────
edit('lib/loft.js',
  `'encore', 'biz', 'flank', 'knight',`,
  `'encore', 'biz', 'flank', 'knight', 'script', 'quotes',`);

// ─── 18. the two scoring registries the gauntlet shape needs ───────────────
// Both games are a BATTERY OF INDEPENDENT QUESTIONS, like Streak, Atlas, Sport
// and Biz, so they pay IQ Points linearly (thirty right is thirty correct
// answers) and their answered count is cleared + 1, because the player also
// faced the question that killed the run. A fifth and sixth game of this shape
// need only their keys in these two conditions.
edit('lib/quiz-xp.js',
  `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'sport', 'biz', 'feud']);`,
  `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'sport', 'biz', 'script', 'quotes', 'feud']);`);
edit('lib/quiz-scoring.js',
  `  if (key === 'streak' || key === 'atlas' || key === 'sport' || key === 'biz') {`,
  `  if (key === 'streak' || key === 'atlas' || key === 'sport' || key === 'biz' || key === 'script' || key === 'quotes') {`);

// ─── 19. lib/circuits.js, the Trivia Gauntlet goes to SEVEN ────────────────
// Owner call, 2026-08-29. The cap of five is a rule about a RUN being one
// sitting, not about a roster, and the Gauntlet is the shortest circuit on the
// site: its five members total 238s of measured median, where a five-sudoku
// window totals 1,705s. Two more one-life quizzes take it to roughly 330s,
// which is still under a third of the Sudoku circuit. So the roster grows and
// the cap is DECLARED rather than defeated: `cap: 7` on this circuit, honoured
// by scripts/verify-circuits.mjs, so every other circuit stays capped at five
// and this one has to say out loud that it is bigger.
//
// The combined-board route already scores a skill circuit on its own key count
// (`dayBestN = fiveKeys.length`), so seven keys give a 105-point maximum with no
// scoring change anywhere.
edit('lib/circuits.js',
  `    keys: ['deep', 'atlas', 'sport', 'biz', 'streak'],           // 37/45/45/45/66 = 238`,
  `    // SEVEN, not five (owner, 2026-08-29). See the cap note above; Script and\n    // Quotes are the same twenty-five question shape as Atlas, Sport and Biz,\n    // so they sit with them in the middle of the ramp.\n    cap: 7,\n    keys: ['deep', 'atlas', 'sport', 'biz', 'script', 'quotes', 'streak'],   // 37/45/45/45/45/45/66 = 328`);
edit('lib/circuits.js',
  `    blurb: 'Question after question until you miss. One wrong answer ends that quiz, and the next one starts on its own.',`,
  `    blurb: 'Question after question until you miss. One wrong answer ends that quiz, and the next one starts on its own. Seven of them, back to back.',`);
edit('lib/circuits.js',
  `      invite: "Five games that end the moment you are wrong, played back to back as one long quiz: a topic, the map, sport, business, everything.",\n      result: "Five games, one wrong answer each, all in one run.",`,
  `      invite: "Seven games that end the moment you are wrong, played back to back as one long quiz: a topic, the map, sport, business, the screen, who said it, everything.",\n      result: "Seven games, one wrong answer each, all in one run.",`);
edit('lib/circuits.js',
  `export const RUN_GAMES = ['deep', 'atlas', 'sport', 'biz', 'streak'];`,
  `export const RUN_GAMES = ['deep', 'atlas', 'sport', 'biz', 'script', 'quotes', 'streak'];`);

// ─── 20. app/circuits/[id]/run/page.js, the runnable banks ─────────────────
edit('app/circuits/[id]/run/page.js',
  `import { PUZZLES as streakPuzzles } from '../../../streak/puzzles';`,
  `import { PUZZLES as scriptPuzzles } from '../../../script/puzzles';\nimport { QUESTION_MAP as scriptQuestions } from '../../../script/questions';\nimport { PUZZLES as quotesPuzzles } from '../../../quotes/puzzles';\nimport { QUESTION_MAP as quotesQuestions } from '../../../quotes/questions';\nimport { PUZZLES as streakPuzzles } from '../../../streak/puzzles';`);
edit('app/circuits/[id]/run/page.js',
  `  sport: { puzzles: sportPuzzles, questions: sportQuestions, tiers: ['Warm-up', 'First half', 'Second half', 'Crunch time', 'Overtime'] },`,
  `  sport: { puzzles: sportPuzzles, questions: sportQuestions, tiers: ['Warm-up', 'First half', 'Second half', 'Crunch time', 'Overtime'] },\n  script: { puzzles: scriptPuzzles, questions: scriptQuestions, tiers: ${G.script.tiers} },\n  quotes: { puzzles: quotesPuzzles, questions: quotesQuestions, tiers: ${G.quotes.tiers} },`);

// ─── 21. scripts/verify-circuits.mjs, honour a DECLARED cap ────────────────
// The rule stays "a run is one sitting", and every circuit is still capped. What
// changes is that a circuit may declare a bigger cap in its own data, where a
// reviewer sees it next to the roster and the reason, instead of the checker
// carrying a silent exception for one id.
edit('scripts/verify-circuits.mjs',
  `  } else if (c.keys.length > MAX) fails.push(\`\${c.id}: \${c.keys.length} games, cap is \${MAX}\`);`,
  `  } else {\n    // A circuit may DECLARE a bigger cap in its own data (Trivia Gauntlet does,\n    // at seven). The cap is still enforced; it is just stated beside the roster\n    // rather than hidden here as a per-id exception.\n    const cap = c.cap || MAX;\n    if (c.cap && c.cap <= MAX) fails.push(\`\${c.id}: cap \${c.cap} is not bigger than the default \${MAX}, so it should not be declared\`);\n    if (c.keys.length > cap) fails.push(\`\${c.id}: \${c.keys.length} games, cap is \${cap}\`);\n  }`);

console.log(`wire-script-quotes: ${applied} edits applied, ${skipped} already present`);
