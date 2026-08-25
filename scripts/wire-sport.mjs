// Wires the Sport daily game into every registry. Anchored edits only: each
// anchor must match EXACTLY ONCE in the origin copy of the file or the script
// throws, so a moved anchor is a hard stop rather than a silent half-wiring.
// Reads from SRC (a same-step `git archive FETCH_HEAD` export) and writes the
// patched copies to OUT, per the stale-base rule. Modelled on wire-atlas.mjs.
import fs from 'fs';
import path from 'path';

const SRC = '/tmp/og2';
const OUT = '/tmp/sportbuild';

const EDITS = {
  // 1. the single source of truth for the roster. Sport is a TRIVIA game: the
  //    owner's call, since the roster has no Sports category and one game does
  //    not make one.
  'lib/daily-games.js': [[
    `  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers',`,
    `  { key: 'sport', miss: 'Asked', name: 'Sport', cat: 'Trivia', tag: 'Twenty-five questions, one life', how: 'Twenty-five sports questions climb from gimme to expert, five rounds of five cycling the NFL, the NBA, MLB, soccer and everything else. One wrong answer or an empty clock ends the run.', color: '#7c2d12', colorNavy: '#f2a56b' },\n  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers',`,
  ]],
  // 2. the home slate
  'app/DailyStrip.jsx': [[
    `  { key: 'atlas', href: '/atlas', name: 'Atlas', img: '/games/btn-atlas.png', store: 'sot_atlas_day', tag: "Twenty-five questions, one life" , cat: 'Geography' },`,
    `  { key: 'atlas', href: '/atlas', name: 'Atlas', img: '/games/btn-atlas.png', store: 'sot_atlas_day', tag: "Twenty-five questions, one life" , cat: 'Geography' },\n  { key: 'sport', href: '/sport', name: 'Sport', img: '/games/btn-sport.png', store: 'sot_sport_day', tag: "Every sport, one life" , cat: 'Trivia' },`,
  ]],
  // 3. the more-games grid: the GAMES row and the Trivia key list
  'app/DailyGamesGrid.jsx': [
    [`  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'Twenty-five questions, one life', img: '/games/btn-atlas.png' },`,
      `  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'Twenty-five questions, one life', img: '/games/btn-atlas.png' },\n  { key: 'sport', href: '/sport', name: 'Sport', tag: 'Every sport, one life', img: '/games/btn-sport.png' },`],
    [`  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'bracket',`,
      `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'bracket',`],
  ],
  // 4. the archive: the Trivia key list and its navy tile colour
  'app/daily/DailyArchiveClient.jsx': [
    [`  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'bracket',`,
      `  { key: 'trivia', label: 'Trivia', keys: ['deep', 'streak', 'atlas', 'sport', 'bracket',`],
    [`  atlas: '#4ade9c', crux: '#5b9bff',`, `  atlas: '#4ade9c', sport: '#f2a56b', crux: '#5b9bff',`],
  ],
  // 5. the end card: accent + finish icon, the tile copy, and the launch pin
  'app/DailyEndCard.jsx': [
    [`  atlas: { accent: '#047857', badgeBg: '#047857', badgeInk: T.white, Fin: MapIcon },`,
      `  atlas: { accent: '#047857', badgeBg: '#047857', badgeInk: T.white, Fin: MapIcon },\n  sport: { accent: '#7c2d12', badgeBg: '#7c2d12', badgeInk: T.white, Fin: Trophy },`],
    [`  { key: 'atlas', cat: 'geography', name: 'Atlas',`,
      `  { key: 'sport', cat: 'trivia',    name: 'Sport', tag: 'Every sport, one life', blurb: 'Twenty-five sports questions, gimme to expert, five lanes a round from the NFL to the Olympics. One wrong answer ends the run.', href: '/sport' },\n  { key: 'atlas', cat: 'geography', name: 'Atlas',`],
    [`const LAUNCH_PIN = { keys: ['atlas', 'towers',`, `const LAUNCH_PIN = { keys: ['sport', 'atlas', 'towers',`],
  ],
  'app/api/quiz/daily-order/route.js': [[
    `const LAUNCH_PIN = { keys: ['atlas', 'towers',`, `const LAUNCH_PIN = { keys: ['sport', 'atlas', 'towers',`,
  ]],
  // 6. the cross-game promo strip
  'app/DailyGamesPromo.jsx': [[
    `  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'twenty-five questions, one life', store: 'sot_atlas_day', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)' },`,
    `  { key: 'sport', href: '/sport', name: 'Sport', tag: 'every sport, one life', store: 'sot_sport_day', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)' },\n  { key: 'atlas', href: '/atlas', name: 'Atlas', tag: 'twenty-five questions, one life', store: 'sot_atlas_day', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)' },`,
  ]],
  // 7. the archive index page: import AND the light map AND the card entry
  'app/daily/page.js': [
    [`import { PUZZLES as ATLAS_FULL } from '../atlas/puzzles';`,
      `import { PUZZLES as ATLAS_FULL } from '../atlas/puzzles';\nimport { PUZZLES as SPORT_FULL } from '../sport/puzzles';`],
    [`const ATLAS = ATLAS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
      `const ATLAS = ATLAS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));\nconst SPORT = SPORT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
    [`  { key: 'atlas', name: 'Atlas', path: '/atlas', tag: 'Twenty-five questions, one life', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)', src: ATLAS },`,
      `  { key: 'atlas', name: 'Atlas', path: '/atlas', tag: 'Twenty-five questions, one life', accent: '#047857', bg: '#e7f4ee', border: 'rgba(4,120,87,0.4)', src: ATLAS },\n  { key: 'sport', name: 'Sport', path: '/sport', tag: 'Every sport, one life', accent: '#7c2d12', bg: '#fbeee6', border: 'rgba(124,45,18,0.4)', src: SPORT },`],
  ],
  // 8. the A-Z rail on every daily page
  'app/DailySlateRail.jsx': [[
    `'towers', 'mercury', 'polka', 'atlas',`, `'towers', 'mercury', 'polka', 'atlas', 'sport',`,
  ]],
  // 9. sitemap
  'lib/sitemap-entries.js': [[
    `'deep', 'anon', 'hands', 'atlas',`, `'deep', 'anon', 'hands', 'atlas', 'sport',`,
  ]],
  // 10. the four puzzle maps the daily APIs read
  'app/api/quiz/daily-game/route.js': [
    [`import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`,
      `import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';\nimport { PUZZLES as P_sport } from '@/app/sport/puzzles';`],
    [`polka: P_polka, atlas: P_atlas,`, `polka: P_polka, atlas: P_atlas, sport: P_sport,`],
  ],
  'app/api/quiz/daily-unplayed/route.js': [
    [`import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`,
      `import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';\nimport { PUZZLES as P_sport } from '@/app/sport/puzzles';`],
    [`polka: P_polka, atlas: P_atlas }`, `polka: P_polka, atlas: P_atlas, sport: P_sport }`],
  ],
  'app/api/quiz/sunday-slate/route.js': [
    [`import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`,
      `import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';\nimport { PUZZLES as P_sport } from '@/app/sport/puzzles';`],
    [`polka: P_polka, atlas: P_atlas }`, `polka: P_polka, atlas: P_atlas, sport: P_sport }`],
  ],
  'lib/daily-slate.js': [
    [`import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';`,
      `import { PUZZLES as P_atlas } from '@/app/atlas/puzzles';\nimport { PUZZLES as P_sport } from '@/app/sport/puzzles';`],
    [`polka: P_polka, atlas: P_atlas,`, `polka: P_polka, atlas: P_atlas, sport: P_sport,`],
  ],
  // 11. the two hardcoded quiz-id alternations
  'app/api/quiz/daily-status/route.js': [[`mercury|polka|atlas)-`, `mercury|polka|atlas|sport)-`]],
  'app/quizzes/QuizHomeClient.jsx': [[`mercury|polka|atlas)-`, `mercury|polka|atlas|sport)-`]],
  // 12. the catalog set (a no-op for a standalone daily, kept in step)
  'lib/quiz-catalog.js': [[`'polka', 'atlas'])`, `'polka', 'atlas', 'sport'])`]],
  // 13. the Loft chrome roster
  'lib/loft.js': [[`  'turn', 'venn', 'warmer', 'atlas',`, `  'turn', 'venn', 'warmer', 'atlas', 'sport',`]],
  // 14. the Gauntlet circuit, now at its cap of five. Same shape as the other
  //     four: multiple choice, one life, over on the first miss.
  'lib/circuits.js': [
    [`      invite: "Four games that end the moment you are wrong: one topic in depth, one clock, the whole map, and forty questions of anything at all.",
      result: "Four games, one wrong answer each.",`,
      `      invite: "Five games that end the moment you are wrong: one topic in depth, one clock, the whole map, every sport, and forty questions of anything at all.",
      result: "Five games, one wrong answer each.",`],
    [`    keys: ['deep', 'atlas', 'blitz', 'streak'],                  // 37/45/62/66 = 210`,
      `    keys: ['deep', 'atlas', 'sport', 'blitz', 'streak'],         // 37/45/45/62/66 = 255`],
  ],
  'scripts/verify-circuits.mjs': [[
    `  atlas: 45,`,
    `  atlas: 45,\n  // Sport launched 2026-08-25 with no live clock data yet: the same shape as\n  // Atlas, 25 multiple-choice questions, so the same estimate. Replace with the\n  // measured median at the next snapshot re-measure.\n  sport: 45,`,
  ]],
  // 15. scoring: Sport is a battery of independent questions, exactly like
  //     Streak and Atlas, so it pays linearly and is graded out of cleared + 1.
  'lib/quiz-xp.js': [[
    `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'feud']);`,
    `export const XP_LINEAR_DAILIES = new Set(['streak', 'atlas', 'sport', 'feud']);`,
  ]],
  'lib/quiz-scoring.js': [[
    `  if (key === 'streak' || key === 'atlas') {
    // Streak and Atlas post correct = questions cleared; the player also faced
    // the one that killed them, so grade out of cleared + 1 (a perfect run
    // stays at its full count). Atlas asks 25 where Streak asks 40.
    const asked = key === 'atlas' ? 25 : 40;`,
    `  if (key === 'streak' || key === 'atlas' || key === 'sport') {
    // Streak, Atlas and Sport post correct = questions cleared; the player also
    // faced the one that killed them, so grade out of cleared + 1 (a perfect
    // run stays at its full count). Streak asks 40, the other two ask 25.
    const asked = key === 'streak' ? 40 : 25;`,
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
