// Wires the Atlas daily game into every registry. Anchored edits only: each
// anchor must match EXACTLY ONCE in the origin copy of the file or the script
// throws, so a moved anchor is a hard stop rather than a silent half-wiring.
// Reads from SRC (a same-step `git archive FETCH_HEAD` export) and writes the
// patched copies to OUT, per the stale-base rule.
import fs from 'fs';
import path from 'path';

const SRC = '/tmp/og';
const OUT = '/tmp/atlasbuild';

const EDITS = {
  // 1. the single source of truth for the roster
  'lib/daily-games.js': [[
    `  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers',`,
    `  { key: 'atlas', miss: 'Asked', name: 'Atlas', cat: 'Geography', tag: 'Twenty-five questions, one life', how: 'Twenty-five geography questions climb from gimme to expert, five rounds of five cycling capitals, the physical world, flags and borders, places and landmarks, and countries and peoples. One wrong answer or an empty clock ends the run.', color: '#047857', colorNavy: '#4ade9c' },\n  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers',`,
  ]],
  // 2. the home slate
  'app/DailyStrip.jsx': [[
    `  { key: 'anon', href: '/anon', name: 'Anon', img: '/games/btn-anon.png', store: 'sot_anon_day', tag: "A clueless acrostic" , cat: 'Word' },`,
    `  { key: 'anon', href: '/anon', name: 'Anon', img: '/games/btn-anon.png', store: 'sot_anon_day', tag: "A clueless acrostic" , cat: 'Word' },\n  { key: 'atlas', href: '/atlas', name: 'Atlas', img: '/games/btn-atlas.png', store: 'sot_atlas_day', tag: "Twenty-five questions, one life" , cat: 'Geography' },`,
  ]],
  // 3. the more-games grid: BOTH the GAMES row and the two category lists.
  //    Atlas is filed under Geography in the registry and also listed under
  //    Trivia here and in the archive, per the owner: it is a geography game
  //    and a trivia game, and both filters should surface it.
  'app/DailyGamesGrid.jsx': [
    [`  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'The daily mini sudoku', img: '/games/btn-sixes.png' },`,
      `  { key: 'sixes', href: '/sixes', name: 'Sixes', tag: 'The daily mini sudoku', img: '/games/btn-sixes.png' },\n  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'Twenty-five questions, one life', img: '/games/btn-atlas.png' },`],
    [`  { key: 'geography', label: 'Geography', keys: ['span', 'ping'] },`,
      `  { key: 'geography', label: 'Geography', keys: ['atlas', 'span', 'ping'] },`],
    [`  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
      `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`],
  ],
  // 4. the archive: same two category lists, plus its navy tile colour
  'app/daily/DailyArchiveClient.jsx': [
    [`  { key: 'geography', label: 'Geography', keys: ['span', 'ping'] },`,
      `  { key: 'geography', label: 'Geography', keys: ['atlas', 'span', 'ping'] },`],
    [`  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`,
      `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'bracket', 'listed', 'niche', 'redact', 'dating', 'extra'] },`],
    [`  crux: '#5b9bff', emcee: '#e879f9',`, `  atlas: '#4ade9c', crux: '#5b9bff', emcee: '#e879f9',`],
  ],
  // 5. the end card: accent + finish icon, the tile copy, and the launch pin
  'app/DailyEndCard.jsx': [
    [`  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },`,
      `  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },\n  atlas: { accent: '#047857', badgeBg: '#047857', badgeInk: T.white, Fin: Globe2 },`],
    [`  { key: 'anon',  cat: 'word',       name: 'Anon',`,
      `  { key: 'atlas', cat: 'geography', name: 'Atlas', tag: 'Twenty-five questions, one life', blurb: 'Twenty-five geography questions, gimme to expert, five subjects a round. One wrong answer ends the run.', href: '/atlas' },\n  { key: 'anon',  cat: 'word',       name: 'Anon',`],
    [`const LAUNCH_PIN = { keys: ['towers', 'mercury', 'polka',`,
      `const LAUNCH_PIN = { keys: ['atlas', 'towers', 'mercury', 'polka',`],
  ],
  'app/api/quiz/daily-order/route.js': [[
    `const LAUNCH_PIN = { keys: ['towers', 'mercury', 'polka',`,
    `const LAUNCH_PIN = { keys: ['atlas', 'towers', 'mercury', 'polka',`,
  ]],
  // 6. the cross-game promo strip
  'app/DailyGamesPromo.jsx': [[
    `  { key: 'niche', href: '/niche', name: 'Niche', tag: 'one answer, two categories', store: 'sot_niche_day', accent: '#115e59', bg: '#ecfdf8', border: 'rgba(17,94,89,0.4)' },`,
    `  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'twenty-five questions, one life', store: 'sot_atlas_day', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)' },\n  { key: 'niche', href: '/niche', name: 'Niche', tag: 'one answer, two categories', store: 'sot_niche_day', accent: '#115e59', bg: '#ecfdf8', border: 'rgba(17,94,89,0.4)' },`,
  ]],
  // 7. the archive index page: import AND the light map AND the card entry.
  //    Adding only the import is a ReferenceError that fails the Vercel build.
  'app/daily/page.js': [
    [`import { PUZZLES as ANON_FULL } from '../anon/puzzles';`,
      `import { PUZZLES as ANON_FULL } from '../anon/puzzles';\nimport { PUZZLES as ATLAS_FULL } from '../atlas/puzzles';`],
    [`const ANON = ANON_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
      `const ANON = ANON_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst ATLAS = ATLAS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
    [`  { key: 'sweep', name: 'Sweep', path: '/sweep', tag: 'No bottom edge', accent: '#0f766e', bg: '#e2f2f0', border: 'rgba(15,118,110,0.4)', src: SWEEP },`,
      `  { key: 'sweep', name: 'Sweep', path: '/sweep', tag: 'No bottom edge', accent: '#0f766e', bg: '#e2f2f0', border: 'rgba(15,118,110,0.4)', src: SWEEP },\n  { key: 'atlas', name: 'Atlas', path: '/atlas', tag: 'Twenty-five questions, one life', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)', src: ATLAS },`],
  ],
  // 8. the A-Z rail on every daily page
  'app/DailySlateRail.jsx': [[
    `'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka',`,
    `'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka', 'atlas',`,
  ]],
  // 9. sitemap
  'lib/sitemap-entries.js': [[
    `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands',`,
    `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands', 'atlas',`,
  ]],
  // 10. the four puzzle maps the daily APIs read
  'app/api/quiz/daily-game/route.js': [
    [`import { PUZZLES as P_polka } from '@/app/polka/puzzles';`,
      `import { PUZZLES as P_polka } from '@/app/polka/puzzles';\nimport { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`],
    [`mercury: P_mercury, polka: P_polka,`, `mercury: P_mercury, polka: P_polka, atlas: P_atlas,`],
  ],
  'app/api/quiz/daily-unplayed/route.js': [
    [`import { PUZZLES as P_polka } from '@/app/polka/puzzles';`,
      `import { PUZZLES as P_polka } from '@/app/polka/puzzles';\nimport { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`],
    [`mercury: P_mercury, polka: P_polka }`, `mercury: P_mercury, polka: P_polka, atlas: P_atlas }`],
  ],
  'app/api/quiz/sunday-slate/route.js': [
    [`import { PUZZLES as P_polka } from '@/app/polka/puzzles';`,
      `import { PUZZLES as P_polka } from '@/app/polka/puzzles';\nimport { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`],
    [`mercury: P_mercury, polka: P_polka }`, `mercury: P_mercury, polka: P_polka, atlas: P_atlas }`],
  ],
  'lib/daily-slate.js': [
    [`import { PUZZLES as P_polka } from '@/app/polka/puzzles';`,
      `import { PUZZLES as P_polka } from '@/app/polka/puzzles';\nimport { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`],
    [`mercury: P_mercury, polka: P_polka,`, `mercury: P_mercury, polka: P_polka, atlas: P_atlas,`],
  ],
  // 11. the two hardcoded quiz-id alternations
  'app/api/quiz/daily-status/route.js': [[`mercury|polka)-`, `mercury|polka|atlas)-`]],
  'app/quizzes/QuizHomeClient.jsx': [[`mercury|polka)-`, `mercury|polka|atlas)-`]],
  // 12. the catalog set (a no-op for a standalone daily, kept in step)
  'lib/quiz-catalog.js': [[`'mercury', 'polka'])`, `'mercury', 'polka', 'atlas'])`]],
  // 13. the Loft chrome roster
  'lib/loft.js': [[`  'turn', 'venn', 'warmer',`, `  'turn', 'venn', 'warmer', 'atlas',`]],
  // 14. the Gauntlet circuit: multiple choice, one life, ends on the first miss
  'lib/circuits.js': [[
    `    keys: ['deep', 'blitz', 'streak'],                           // 37/62/66 = 165`,
    `    keys: ['deep', 'atlas', 'blitz', 'streak'],                  // 37/45/62/66 = 210`,
  ]],
  'scripts/verify-circuits.mjs': [[
    `  towers: 110, polka: 750, mercury: 900,`,
    `  towers: 110, polka: 750, mercury: 900,\n  // Atlas launched 2026-08-25 with no live clock data yet: estimated from its\n  // shape (25 multiple-choice questions, so between Deep's 15 and Streak's 40).\n  // Replace with the measured median at the next snapshot re-measure.\n  atlas: 45,`,
  ]],
};

let files = 0, edits = 0;
for (const [rel, list] of Object.entries(EDITS)) {
  let s = fs.readFileSync(path.join(SRC, rel), 'utf8');
  for (const [anchor, replacement] of list) {
    const n = s.split(anchor).length - 1;
    if (n !== 1) throw new Error(`${rel}: anchor matched ${n} times: ${anchor.slice(0, 90)}`);
    s = s.replace(anchor, replacement);
    edits++;
  }
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, s);
  files++;
}
console.log(`patched ${edits} anchors across ${files} files`);
