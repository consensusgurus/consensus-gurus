#!/usr/bin/env node
// wire-sudoku-trio — apply the Towers + Mercury + Polka registry edits to a
// FRESH copy of origin/main.
//
//   node scripts/wire-sudoku-trio.mjs <dir-of-origin-checkout>
//
// The wire-sixes.mjs pattern: about twenty registries, half of which fail
// SILENTLY when missed, edited as ANCHORED replacements. Two properties:
//
//   1. EVERY anchor must be found EXACTLY ONCE, or the script throws.
//   2. It runs against files read out of a same-step `git show FETCH_HEAD:`,
//      never the working tree (the stale-base rule).
//
// Idempotent: a file that already names the trio at the anchor is left alone.
//
// This wire also converts the Sudoku circuit to the site's first ROTATING
// skill circuit (owner, 2026-08-23): the pool grows to eight and the circuit
// plays five a day, Daily Five style, with the window advancing at Eastern
// midnight. lib/circuits.js and scripts/verify-circuits.mjs both change.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/wire-sudoku-trio.mjs <dir>'); process.exit(2); }

const EDITS = [
  // 1. Registry rows, last (launch order). miss: null - clock races, all three.
  ['lib/daily-games.js',
    `how: 'A king and pawn endgame you are already winning. One first move keeps the win, and then every move of the walk has to be exact against a perfect defence.', color: '#a16207', colorNavy: '#f2c14e' },\n];`,
    `how: 'A king and pawn endgame you are already winning. One first move keeps the win, and then every move of the walk has to be exact against a perfect defence.', color: '#a16207', colorNavy: '#f2c14e' },
  { key: 'towers', miss: null, name: 'Towers', cat: 'Numbers', tag: 'Count the towers in view', how: 'Skyscrapers: every row and column holds each tower height once, and each border clue counts the towers visible from there, taller ones hiding shorter ones. 5x5 weekdays, 7x7 Sundays, nothing counted against you, the clock decides the day.', color: '#075985', colorNavy: '#58b7f2' },
  { key: 'mercury', miss: null, name: 'Mercury', cat: 'Numbers', tag: 'The daily thermo sudoku', how: 'Thermo sudoku: digits get bigger along every thermometer from its round bulb, and the ordering does the work no sums are asked to do. Sundays print just eight digits under nine thermometers.', color: '#991b1b', colorNavy: '#f18c8c' },
  { key: 'polka', miss: null, name: 'Polka', cat: 'Numbers', tag: 'No numbers, only dots', how: 'Kropki sudoku: not one digit is printed. A white dot means the neighbours differ by 1, a black dot means one is double the other, and no dot means neither, so the silences are clues too.', color: '#16a34a', colorNavy: '#67dd9a' },
];`],

  // 2. Sunday Editions registry + its comment table.
  ['lib/sunday-editions.js',
    `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen',`,
    `  'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka',`],
  ['lib/sunday-editions.js',
    `//   sixes   a grid in the top fraction of a percent of the difficulty`,
    `//   towers  a 7x7 skyline against the weekday 5x5
//   mercury nine thermometers and eight printed digits, against six
//           thermometers and fifteen to thirty digits on a weekday
//   polka   a deal from the top of the measured difficulty distribution
//   sixes   a grid in the top fraction of a percent of the difficulty`],

  // 3. Loft flags (alphabetical list).
  ['lib/loft.js',
    `  'mate', 'niche', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`,
    `  'mate', 'mercury', 'niche', 'outrank', 'outwit', 'park', 'paths', 'ping', 'plot',`],
  ['lib/loft.js',
    `  'pricer', 'queen', 'quilt', 'redact', 'rung', 'sando', 'shards',`,
    `  'polka', 'pricer', 'queen', 'quilt', 'redact', 'rung', 'sando', 'shards',`],
  ['lib/loft.js',
    `  'suffice', 'sweep', 'sworn', 'taire', 'tally', 'tuck',`,
    `  'suffice', 'sweep', 'sworn', 'taire', 'tally', 'towers', 'tuck',`],

  // 4. lib/daily-slate.js - daily-combined and daily-me read GAME_PUZZLES here.
  ['lib/daily-slate.js',
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';`,
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_towers } from '@/app/towers/puzzles';
import { PUZZLES as P_mercury } from '@/app/mercury/puzzles';
import { PUZZLES as P_polka } from '@/app/polka/puzzles';`],
  ['lib/daily-slate.js',
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen,`,
    `  barter: P_barter, plot: P_plot, sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, towers: P_towers, mercury: P_mercury, polka: P_polka,`],

  // 5. DailyEndCard: GAME_META, tile list, launch pin.
  ['app/DailyEndCard.jsx',
    `  queen: { accent: '#a16207', badgeBg: '#a16207', badgeInk: T.white, Fin: Gem },`,
    `  queen: { accent: '#a16207', badgeBg: '#a16207', badgeInk: T.white, Fin: Gem },
  towers: { accent: '#075985', badgeBg: '#075985', badgeInk: T.white, Fin: Building2 },
  mercury: { accent: '#991b1b', badgeBg: '#991b1b', badgeInk: T.white, Fin: Thermometer },
  polka: { accent: '#16a34a', badgeBg: '#16a34a', badgeInk: T.white, Fin: CircleDot },`],
  ['app/DailyEndCard.jsx',
    `  { key: 'sixes',  cat: 'numbers',   name: 'Sixes',  tag: 'The daily mini sudoku',     blurb: 'A 6x6 sudoku in boxes two tall and three wide. The short one: nothing counts against you, so the clock decides the day.', href: '/sixes' },`,
    `  { key: 'sixes',  cat: 'numbers',   name: 'Sixes',  tag: 'The daily mini sudoku',     blurb: 'A 6x6 sudoku in boxes two tall and three wide. The short one: nothing counts against you, so the clock decides the day.', href: '/sixes' },
  { key: 'towers', cat: 'numbers',   name: 'Towers', tag: 'Count the towers in view',  blurb: 'A skyline Latin square: border clues count the towers you can see, taller ones hiding shorter. 5x5 weekdays, 7x7 Sundays.', href: '/towers' },
  { key: 'mercury', cat: 'numbers',  name: 'Mercury', tag: 'The daily thermo sudoku',  blurb: 'Digits climb every thermometer from its bulb. Pure visual ordering, one logical solution, and Sundays print almost nothing.', href: '/mercury' },
  { key: 'polka',  cat: 'numbers',   name: 'Polka',  tag: 'No numbers, only dots',     blurb: 'Kropki: not one digit printed. White dots mean consecutive, black mean double, and the silent edges are clues too.', href: '/polka' },`],
  ['app/DailyEndCard.jsx',
    `const LAUNCH_PIN = { keys: ['queen', 'shoe', 'niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['towers', 'mercury', 'polka', 'queen', 'shoe', 'niche', 'sixes',`],

  // 6. daily-order mirrors the pin.
  ['app/api/quiz/daily-order/route.js',
    `const LAUNCH_PIN = { keys: ['queen', 'shoe', 'niche', 'sixes',`,
    `const LAUNCH_PIN = { keys: ['towers', 'mercury', 'polka', 'queen', 'shoe', 'niche', 'sixes',`],

  // 7. The promo strip (newest first).
  ['app/DailyGamesPromo.jsx',
    `  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'the daily blackjack shoe', store: 'sot_shoe_day', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)' },`,
    `  { key: 'towers', href: '/towers', name: 'Towers', tag: 'the daily skyscrapers puzzle', store: 'sot_towers_day', accent: '#075985', bg: '#eaf4fa', border: 'rgba(7,89,133,0.4)' },
  { key: 'mercury', href: '/mercury', name: 'Mercury', tag: 'the daily thermo sudoku', store: 'sot_mercury_day', accent: '#991b1b', bg: '#fdf1f1', border: 'rgba(153,27,27,0.4)' },
  { key: 'polka', href: '/polka', name: 'Polka', tag: 'the daily kropki sudoku', store: 'sot_polka_day', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)' },
  { key: 'shoe', href: '/shoe', name: 'Shoe', tag: 'the daily blackjack shoe', store: 'sot_shoe_day', accent: '#0c4a6e', bg: '#e8f3fa', border: 'rgba(12,74,110,0.4)' },`],

  // 8. DailyGamesGrid - BOTH lists (half an edit fails silently).
  ['app/DailyGamesGrid.jsx',
    `  { key: 'queen', href: '/queen', name: 'Queen', tag: 'White to play and promote', img: '/games/btn-queen.png' },`,
    `  { key: 'queen', href: '/queen', name: 'Queen', tag: 'White to play and promote', img: '/games/btn-queen.png' },
  { key: 'towers', href: '/towers', name: 'Towers', tag: 'Count the towers in view', img: '/games/btn-towers.png' },
  { key: 'mercury', href: '/mercury', name: 'Mercury', tag: 'The daily thermo sudoku', img: '/games/btn-mercury.png' },
  { key: 'polka', href: '/polka', name: 'Polka', tag: 'No numbers, only dots', img: '/games/btn-polka.png' },`],
  ['app/DailyGamesGrid.jsx',
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`,
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'carve', 'cipher', 'crunch', 'blitz'] },`],

  // 9. The slate row on every daily page.
  ['app/DailyStrip.jsx',
    `  { key: 'queen', href: '/queen', name: 'Queen', img: '/games/btn-queen.png', store: 'sot_queen_day', tag: "White to play and promote" , cat: 'End Game' },`,
    `  { key: 'queen', href: '/queen', name: 'Queen', img: '/games/btn-queen.png', store: 'sot_queen_day', tag: "White to play and promote" , cat: 'End Game' },
  { key: 'towers', href: '/towers', name: 'Towers', img: '/games/btn-towers.png', store: 'sot_towers_day', tag: "Count the towers in view" , cat: 'Numbers' },
  { key: 'mercury', href: '/mercury', name: 'Mercury', img: '/games/btn-mercury.png', store: 'sot_mercury_day', tag: "The daily thermo sudoku" , cat: 'Numbers' },
  { key: 'polka', href: '/polka', name: 'Polka', img: '/games/btn-polka.png', store: 'sot_polka_day', tag: "No numbers, only dots" , cat: 'Numbers' },`],

  // 10. The A-Z slate rail (its own hardcoded roster).
  ['app/DailySlateRail.jsx',
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen',`,
    `  'deep', 'anon', 'blocks', 'chomp', 'sweep', 'docket', 'blitz', 'defend', 'barter', 'plot', 'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka',`],

  // 11. /daily archive: import AND stripped map AND card entry, or the build fails.
  ['app/daily/page.js',
    `import { PUZZLES as QUEEN_FULL } from '../queen/puzzles';`,
    `import { PUZZLES as QUEEN_FULL } from '../queen/puzzles';
import { PUZZLES as TOWERS_FULL } from '../towers/puzzles';
import { PUZZLES as MERCURY_FULL } from '../mercury/puzzles';
import { PUZZLES as POLKA_FULL } from '../polka/puzzles';`],
  ['app/daily/page.js',
    `const QUEEN = QUEEN_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`,
    `const QUEEN = QUEEN_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const TOWERS = TOWERS_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const MERCURY = MERCURY_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const POLKA = POLKA_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));`],
  ['app/daily/page.js',
    `  { key: 'queen', name: 'Queen', path: '/queen', tag: 'White to play and promote', accent: '#a16207', bg: '#faf3e3', border: 'rgba(161,98,7,0.4)', src: QUEEN },`,
    `  { key: 'towers', name: 'Towers', path: '/towers', tag: 'Skyscrapers, clues on the border', accent: '#075985', bg: '#eaf4fa', border: 'rgba(7,89,133,0.4)', src: TOWERS },
  { key: 'mercury', name: 'Mercury', path: '/mercury', tag: 'The daily thermo sudoku', accent: '#991b1b', bg: '#fdf1f1', border: 'rgba(153,27,27,0.4)', src: MERCURY },
  { key: 'polka', name: 'Polka', path: '/polka', tag: 'Kropki, no numbers at all', accent: '#16a34a', bg: '#ecf9f1', border: 'rgba(22,163,74,0.4)', src: POLKA },
  { key: 'queen', name: 'Queen', path: '/queen', tag: 'White to play and promote', accent: '#a16207', bg: '#faf3e3', border: 'rgba(161,98,7,0.4)', src: QUEEN },`],

  // 12. Archive client: category membership + navy accents.
  ['app/daily/DailyArchiveClient.jsx',
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'quilt', 'cages', 'sando', 'carve', 'cipher', 'crunch', 'blitz'] },`,
    `  { key: 'numbers', label: 'Numbers', keys: ['tally', 'suds', 'sixes', 'towers', 'quilt', 'cages', 'sando', 'mercury', 'polka', 'carve', 'cipher', 'crunch', 'blitz'] },`],
  ['app/daily/DailyArchiveClient.jsx',
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd', shoe: '#7cc4ec', queen: '#f2c14e', race: '#93c5fd',`,
    `  barter: '#fb7fa2', plot: '#e0a86a', sixes: '#7da2f5', niche: '#3ecfbd', shoe: '#7cc4ec', queen: '#f2c14e', race: '#93c5fd', towers: '#58b7f2', mercury: '#f18c8c', polka: '#67dd9a',`],

  // 13. Sitemap.
  ['lib/sitemap-entries.js',
    `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands',\n];`,
    `  'sweep', 'redact', 'paths', 'deep', 'anon', 'hands', 'towers', 'mercury', 'polka',\n];`],

  // 14. The three routes that own their own puzzle maps.
  ['app/api/quiz/daily-unplayed/route.js',
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';`,
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_towers } from '@/app/towers/puzzles';
import { PUZZLES as P_mercury } from '@/app/mercury/puzzles';
import { PUZZLES as P_polka } from '@/app/polka/puzzles';`],
  ['app/api/quiz/daily-unplayed/route.js',
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen };`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, towers: P_towers, mercury: P_mercury, polka: P_polka };`],
  ['app/api/quiz/daily-game/route.js',
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';`,
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_towers } from '@/app/towers/puzzles';
import { PUZZLES as P_mercury } from '@/app/mercury/puzzles';
import { PUZZLES as P_polka } from '@/app/polka/puzzles';`],
  ['app/api/quiz/daily-game/route.js',
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen,`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, towers: P_towers, mercury: P_mercury, polka: P_polka,`],
  ['app/api/quiz/sunday-slate/route.js',
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';`,
    `import { PUZZLES as P_queen } from '@/app/queen/puzzles';
import { PUZZLES as P_towers } from '@/app/towers/puzzles';
import { PUZZLES as P_mercury } from '@/app/mercury/puzzles';
import { PUZZLES as P_polka } from '@/app/polka/puzzles';`],
  ['app/api/quiz/sunday-slate/route.js',
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen };`,
    `sixes: P_sixes, niche: P_niche, shoe: P_shoe, queen: P_queen, towers: P_towers, mercury: P_mercury, polka: P_polka };`],

  // 15. The two hardcoded quiz-id alternations.
  ['app/api/quiz/daily-status/route.js',
    `|sixes|niche|shoe|queen)-\\d+-\\d+-\\d+$/;`,
    `|sixes|niche|shoe|queen|towers|mercury|polka)-\\d+-\\d+-\\d+$/;`],
  ['app/quizzes/QuizHomeClient.jsx',
    `|sixes|niche|shoe|queen)-/;`,
    `|sixes|niche|shoe|queen|towers|mercury|polka)-/;`],

  // 16. quiz-catalog roster set (keeps the audit sweep clean).
  ['lib/quiz-catalog.js',
    `'sixes', 'niche', 'shoe', 'queen']);`,
    `'sixes', 'niche', 'shoe', 'queen', 'towers', 'mercury', 'polka']);`],

  // 17. CLAUDE.md: the Sunday table plus the trio + rotating-circuit doc.
  ['CLAUDE.md',
    `\n**Every daily on the roster runs a Sunday Edition.**`,
    `| Towers | a 7x7 skyline instead of the weekday 5x5 (from launch, 2026-08-24) |
| Mercury | nine thermometers and eight printed digits, against six thermometers and fifteen to thirty digits on weekdays (from launch, 2026-08-24) |
| Polka | a deal from the top of the measured difficulty distribution (from launch, 2026-08-24) |

**Every daily on the roster runs a Sunday Edition.**`],
  ['CLAUDE.md',
    `## Sunday Editions — the flag, the label, and which games have one (owner rule, 2026-07-20)`,
    `## The sudoku trio (Towers, Mercury, Polka) and the ROTATING Sudoku circuit (owner, 2026-08-23)

Three sudoku-family dailies launched 2026-08-24: **Towers** (skyscrapers: border clues count
the visible towers, taller hiding shorter; 5x5 weekdays, 7x7 Sundays; the ramp is the
printed-clue count and nothing else, Mon 14 down to Sat 9 of 20, Sunday 18 of 28),
**Mercury** (thermo sudoku: digits strictly increase along every thermometer from its bulb;
the ramp is the printed-given count, Mon 30 down to Sat 15; the Sunday Edition prints 8
under nine thermometers - zero-given was probed and is OUT OF REACH of the graded technique
set on random layouts, dig floors bottom at 7-13, so eight is stated rather than fudged),
and **Polka** (kropki: the full dot set and no digits at all; white = differ by 1, black =
double, no dot = neither, and a 1-2 pair may carry either dot, picked by position parity;
difficulty is a MEASURED COST like Sixes, bands Mon <=10 / Tue 11-24 / Wed 25-38 /
Thu 39-54 / Fri 55-78 / Sat 79-110 / Sunday 120+). All three: flat-10 solve, miss null on
the registry row, the day resolves on the clock. Banks run 2026-08-24 through 2026-10-04.
Generators scripts/gen-{towers,mercury,polka}.mjs with engines in the *-core.mjs files;
INDEPENDENT verifiers scripts/verify-{towers,mercury,polka}.mjs (no imports from the cores,
per the Cages/Sando rule; Mercury's and Polka's graded solvers police every elimination
against sol). scripts/sudoku-trio-mutation-test.mjs breaks each bank five ways via the
VERIFY_<GAME>_BANK override and requires every mutation caught. On Towers, a completed
propagation solve doubles as the uniqueness proof (line-sweep eliminations are sound, so an
all-singleton end state IS exactly-one-solution); the brute counter runs only on the 5x5s
because it explodes on a 7x7.

**The Sudoku circuit ROTATES - the only rotating skill circuit (owner, 2026-08-23).** Its
lib/circuits.js entry carries a POOL of eight keys plus a \`rotate: 5\` field: a sliding
window over the pool advances one game per ET day (deterministic from the date, no bank, no
storage), every pool member plays five days in every eight, and the day's five still run
shortest first because the pool is stored in ascending measured order and the window
re-sorts to it. The selection lives ONLY in circuitKeysFor, so the board route
(?circuit=sudoku), the trophies engine, the console band, the filter strip and the landing
page all follow with no edits of their own. scripts/verify-circuits.mjs recomputes the
window with its own day-index math and proves: five a day, in pool order, every member
exactly five appearances per eight-day cycle, and every one of the eight windows totalling
into the gold trophy tier.

## Sunday Editions — the flag, the label, and which games have one (owner rule, 2026-07-20)`],

  // 18. lib/circuits.js — the rotating Sudoku circuit.
  ['lib/circuits.js',
    `  {
    id: 'sudoku',
    name: 'Sudoku',
    blurb: 'Every sudoku on the site, easiest grid first and the sandwich last.',
    share: {
      invite: "Every sudoku on the site in one sitting: mini, killer, classic, jigsaw, sandwich. Easiest grid first.",
      result: "Five sudokus, the sandwich last.",
    },
    keys: ['sixes', 'cages', 'suds', 'quilt', 'sando'],          // 144/270/482/699/1171 = 2766
    trophy: { name: 'Grid Locked', tier: 'gold', icon: 'Grid2x2' },
  },`,
    `  {
    id: 'sudoku',
    name: 'Sudoku',
    blurb: 'Every sudoku on the site: five a day from a pool of eight, easiest first.',
    share: {
      invite: "Eight sudokus in the pool and five on the day's card, easiest grid first. A different mix tomorrow.",
      result: "Five sudokus from a pool of eight.",
    },
    // THE ONE ROTATING SKILL CIRCUIT (owner, 2026-08-23). The sudoku family
    // outgrew a fixed five when Towers, Mercury and Polka landed, so this
    // roster is a POOL of eight and the circuit plays FIVE of them a day,
    // Daily Five style: a sliding window over the pool advances one game at
    // Eastern midnight (deterministic from the date, no bank, no storage),
    // every pool member plays five days in every eight, and the day's five
    // still run shortest first because the pool below is stored in ascending
    // measured order and the window re-sorts to it. \`rotate\` is the window
    // size; circuitKeysFor owns the selection, so the board route, the
    // trophies, the band and the landing page all follow with no edits of
    // their own. Pool medians: towers ~110 est / sixes 144 / cages 270 /
    // suds 482 / quilt 699 / polka ~750 est / mercury ~900 est / sando 1171.
    // Every 5-window totals 1705s or more, so the trophy stays gold on every
    // day's mix (scripts/verify-circuits.mjs recomputes all eight windows).
    rotate: 5,
    keys: ['towers', 'sixes', 'cages', 'suds', 'quilt', 'polka', 'mercury', 'sando'],
    trophy: { name: 'Grid Locked', tier: 'gold', icon: 'Grid2x2' },
  },`],
  ['lib/circuits.js',
    `at 66 games over 15 circuits, NINE OF FIVE, FOUR OF FOUR, ONE OF THREE AND`,
    `at 69 games over 15 circuits (the Sudoku circuit holding EIGHT as a rotating
// pool that plays five a day - see its entry), NINE OF FIVE, FOUR OF FOUR, ONE OF THREE AND`],
  ['lib/circuits.js',
    `export function circuitKeysFor(id, iso) {
  const day = iso || etTodayISO();
  if (isMarquee(id)) return fiveFor(day);
  const c = circuitById(id);
  if (!c || !Array.isArray(c.keys)) return [];
  return c.keys.filter((k) => DAILY_GAME_MAP[k] && !isRetiredDaily(k, day));
}`,
    `export function circuitKeysFor(id, iso) {
  const day = iso || etTodayISO();
  if (isMarquee(id)) return fiveFor(day);
  const c = circuitById(id);
  if (!c || !Array.isArray(c.keys)) return [];
  const live = c.keys.filter((k) => DAILY_GAME_MAP[k] && !isRetiredDaily(k, day));
  if (!c.rotate || live.length <= c.rotate) return live;
  // A ROTATING circuit (today only the Sudoku pool): a sliding window over
  // the live pool, advancing one game per ET day, then filtered back to pool
  // order so the run still opens shortest and closes longest. Deterministic
  // from the date alone - no bank, no storage - and every consumer (the
  // board route, the trophies, the band, the landing page) reads it through
  // here, so there is exactly one copy of this selection anywhere.
  const idx = Math.floor(Date.parse(day + 'T12:00:00Z') / 86400000);
  const n = live.length;
  const start = ((idx % n) + n) % n;
  const picked = new Set();
  for (let i = 0; i < c.rotate; i++) picked.add((start + i) % n);
  return live.filter((_, i) => picked.has(i));
}`],

  // 19. scripts/verify-circuits.mjs — prove the rotation.
  ['scripts/verify-circuits.mjs',
    `  queen: 75,
};`,
    `  queen: 75,
  // Towers, Mercury and Polka launched 2026-08-24 with no live clock data:
  // estimated from their shapes (a 5x5 speed board under Sixes; a kropki 9x9
  // near Quilt; a thermo 9x9 between Quilt and Sando). Replace with measured
  // medians at the next snapshot re-measure.
  towers: 110, polka: 750, mercury: 900,
};`],
  ['scripts/verify-circuits.mjs',
    `  if (!Array.isArray(c.keys) || c.keys.length < 2) fails.push(\`\${c.id}: needs at least 2 games to be a run\`);
  else if (c.keys.length > MAX) fails.push(\`\${c.id}: \${c.keys.length} games, cap is \${MAX}\`);`,
    `  if (!Array.isArray(c.keys) || c.keys.length < 2) fails.push(\`\${c.id}: needs at least 2 games to be a run\`);
  else if (c.rotate) {
    // a ROTATING circuit: the cap applies to the DAY'S SELECTION, not the pool
    if (c.rotate !== MAX) fails.push(\`\${c.id}: rotating circuits play \${MAX} a day (rotate is \${c.rotate})\`);
    if (c.keys.length <= c.rotate) fails.push(\`\${c.id}: a rotating pool of \${c.keys.length} is not bigger than its window\`);
  } else if (c.keys.length > MAX) fails.push(\`\${c.id}: \${c.keys.length} games, cap is \${MAX}\`);`],
  ['scripts/verify-circuits.mjs',
    `for (const c of CIRCUITS) {
  const live = circuitKeysFor(c.id, todayIso);
  const expected = c.keys.filter((k) => DAILY_GAME_MAP[k] && !retiredAlready(k));
  if (live.join(',') !== expected.join(',')) {
    fails.push(\`\${c.id}: circuitKeysFor returned [\${live.join(',')}], expected [\${expected.join(',')}]\`);
  }
  if (live.length < 2) {
    fails.push(\`\${c.id}: only \${live.length} live game(s) today — the band needs at least 2 to render a run\`);
  }
  if (live.length < c.keys.length) {
    warns.push(\`\${c.id}: down to \${live.length} live games (retirement), was \${c.keys.length}\`);
  }
}`,
    `for (const c of CIRCUITS) {
  const live = circuitKeysFor(c.id, todayIso);
  const filtered = c.keys.filter((k) => DAILY_GAME_MAP[k] && !retiredAlready(k));
  // for a rotating circuit the expected selection is RECOMPUTED here with its
  // own day-index math, never read back off the library it is checking
  const expected = c.rotate && filtered.length > c.rotate
    ? (() => {
        const idx = Math.floor(Date.parse(todayIso + 'T12:00:00Z') / 86400000);
        const n = filtered.length;
        const start = ((idx % n) + n) % n;
        const pick = new Set();
        for (let i = 0; i < c.rotate; i++) pick.add((start + i) % n);
        return filtered.filter((_, i) => pick.has(i));
      })()
    : filtered;
  if (live.join(',') !== expected.join(',')) {
    fails.push(\`\${c.id}: circuitKeysFor returned [\${live.join(',')}], expected [\${expected.join(',')}]\`);
  }
  if (live.length < 2) {
    fails.push(\`\${c.id}: only \${live.length} live game(s) today — the band needs at least 2 to render a run\`);
  }
  if (!c.rotate && live.length < c.keys.length) {
    warns.push(\`\${c.id}: down to \${live.length} live games (retirement), was \${c.keys.length}\`);
  }
}
// a rotating circuit plays fair: over one full pool-length cycle of days, the
// selection is always \`rotate\` games, always in pool (ascent) order, and every
// pool member appears exactly \`rotate\` times
for (const c of CIRCUITS) {
  if (!c.rotate) continue;
  const n = c.keys.length;
  const seen = Object.fromEntries(c.keys.map((k) => [k, 0]));
  for (let d = 0; d < n; d++) {
    const iso = new Date(Date.parse(todayIso + 'T12:00:00Z') + d * 86400000).toISOString().slice(0, 10);
    const sel = circuitKeysFor(c.id, iso);
    if (sel.length !== c.rotate) fails.push(\`\${c.id}: \${iso} plays \${sel.length} games, rotate is \${c.rotate}\`);
    const order = sel.map((k) => c.keys.indexOf(k));
    if (order.some((v, i) => i && v < order[i - 1])) fails.push(\`\${c.id}: \${iso} selection is not in pool order\`);
    for (const k of sel) seen[k] += 1;
  }
  for (const [k, ct] of Object.entries(seen)) {
    if (ct !== c.rotate) fails.push(\`\${c.id}: \${k} plays \${ct} of \${n} days in a cycle, expected \${c.rotate}\`);
  }
}`],
  ['scripts/verify-circuits.mjs',
    `for (const c of CIRCUITS) {
  if (!c.trophy) continue;
  const known = c.keys.filter((k) => k in MED);
  if (known.length !== c.keys.length) continue; // already warned above
  const total = known.reduce((a, k) => a + MED[k], 0);
  const want = TIER_AT(total);
  if (c.trophy.tier !== want) {
    fails.push(\`\${c.id}: trophy tier is \${c.trophy.tier} but the roster totals \${total}s, which is \${want}\`);
  }
}`,
    `for (const c of CIRCUITS) {
  if (!c.trophy) continue;
  const known = c.keys.filter((k) => k in MED);
  if (known.length !== c.keys.length) continue; // already warned above
  if (c.rotate) {
    // a rotating circuit's day is a WINDOW of the pool, so every window must
    // land in the declared tier, not just the pool total
    for (let s = 0; s < c.keys.length; s++) {
      let total = 0;
      for (let i = 0; i < c.rotate; i++) total += MED[c.keys[(s + i) % c.keys.length]];
      const want = TIER_AT(total);
      if (c.trophy.tier !== want) {
        fails.push(\`\${c.id}: the window starting at \${c.keys[s]} totals \${total}s (\${want}), trophy says \${c.trophy.tier}\`);
        break;
      }
    }
    continue;
  }
  const total = known.reduce((a, k) => a + MED[k], 0);
  const want = TIER_AT(total);
  if (c.trophy.tier !== want) {
    fails.push(\`\${c.id}: trophy tier is \${c.trophy.tier} but the roster totals \${total}s, which is \${want}\`);
  }
}`],
];

const OG_CARDS = {
  renderTowersCard: readFileSync(new URL('./towers-og-card.txt', import.meta.url), 'utf8'),
  renderMercuryCard: readFileSync(new URL('./mercury-og-card.txt', import.meta.url), 'utf8'),
  renderPolkaCard: readFileSync(new URL('./polka-og-card.txt', import.meta.url), 'utf8'),
};

let changed = 0; let already = 0;
const touched = new Set();
for (const [file, anchor, replacement] of EDITS) {
  const path = join(dir, file);
  if (!existsSync(path)) throw new Error(`${file}: not in the checkout — did the fetch land?`);
  const src = readFileSync(path, 'utf8');
  if (src.includes(replacement)) { already++; continue; }
  const n = src.split(anchor).length - 1;
  if (n !== 1) throw new Error(`${file}: anchor found ${n} times, expected exactly 1 — the file moved under us:\n    ${anchor.slice(0, 140)}`);
  writeFileSync(path, src.replace(anchor, replacement));
  touched.add(file);
  changed++;
}

// og-brand-card: append the three render cards.
{
  const path = join(dir, 'lib/og-brand-card.js');
  let src = readFileSync(path, 'utf8');
  let did = false;
  for (const [name, body] of Object.entries(OG_CARDS)) {
    if (src.includes(name)) { already++; continue; }
    src = `${src.replace(/\s*$/, '\n')}\n${body}`;
    did = true;
    changed++;
  }
  if (did) { writeFileSync(path, src); touched.add('lib/og-brand-card.js'); }
}

// DailyEndCard lucide icons: Building2, Thermometer, CircleDot.
{
  const path = join(dir, 'app/DailyEndCard.jsx');
  let src = readFileSync(path, 'utf8');
  const head = src.slice(0, src.indexOf("} from 'lucide-react'"));
  const need = ['Building2', 'Thermometer', 'CircleDot'].filter((n) => !new RegExp(`\\b${n}\\b`).test(head));
  if (need.length) {
    const m = src.match(/^import \{\n/m);
    if (!m) throw new Error('DailyEndCard.jsx: could not find the lucide import block');
    src = src.replace(/^import \{\n/m, `import {\n  ${need.join(', ')},\n`);
    writeFileSync(path, src);
    touched.add('app/DailyEndCard.jsx');
    changed++;
  } else already++;
}

console.log(`${changed} edit(s) applied, ${already} already in place`);
console.log([...touched].sort().map((f) => `  ${f}`).join('\n'));
