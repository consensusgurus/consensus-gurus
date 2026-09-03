#!/usr/bin/env node
// gen-sums — build the Sums puzzle bank (app/sums/puzzles.js).
//
//   node scripts/gen-sums.mjs --probe                       measure what the space offers
//   node scripts/gen-sums.mjs --from 2026-09-03 --days 78 > app/sums/puzzles.js
//
// HOW A BOARD IS MADE
//   1. Draw a random 180-degree symmetric black pattern (7x7 on a weekday, 11x11
//      on a Sunday), and keep it only if it is legal: no one-cell run, no run past
//      nine, every white in one across and one down run, the whites connected,
//      and the white count inside the day's band.
//   2. Fill the whites with digits, no repeat inside a run, then SEARCH the
//      filling (scripts/sums-core.mjs `refine`): change one digit at a time and
//      keep the change when candidate propagation (run by run: which digit sets
//      make the total, which digits can each cell still take) leaves fewer cells
//      undecided. A random filling is unique about once in seven hundred; the
//      search reaches zero undecided cells in about a fifth of a second.
//   3. Zero undecided cells means propagation alone solves the board, which is
//      the no-guessing proof. The independent counting solver then confirms
//      EXACTLY ONE filling, so a bug in the propagation cannot certify itself.
//   4. Grade it by the day's ramp and keep it if it fits.
//
// WEEKDAY RAMP. Two knobs, both read straight off the printed board:
//   whites  how many squares there are to fill (7x7 holds up to 36, 11x11 up to 100)
//   fixed   how many runs print a total with exactly ONE digit set (3 in two is
//           always 1+2, 24 in three is always 7+8+9). Those are the footholds.
//
//   day  size  whites   fixed
//   Mon  7x7   22       >= 4
//   Tue  7x7   22-24    >= 4
//   Wed  7x7   24-26    >= 3
//   Thu  7x7   26       >= 3
//   Fri  7x7   28       <= 5
//   Sat  7x7   30       <= 5
//   Sun  11x11 62-72    <= 12    the Sunday Edition
//
// Measured before the bands were set (80 boards, 7x7, whites 22 to 30): the
// search lands 2 to 9 fixed runs on 12 to 20, so a floor of 4 is the generous
// half of the distribution and a cap of 5 the stingy half.
//
// VARIETY: no black pattern is used twice, no totals list is used twice.
import { geometry, connected, fill, totals, countSolutions, propagate, isFixed, randomPattern, refine, blackToRows } from './sums-core.mjs';

function rng(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// indexed by JS getDay() (0 = Sunday)
export const RAMP = [
  { size: 11, whites: [62, 72], fixedMax: 12 },
  { size: 7, whites: [22, 22], fixedMin: 4 },
  { size: 7, whites: [22, 24], fixedMin: 4 },
  { size: 7, whites: [24, 26], fixedMin: 3 },
  { size: 7, whites: [26, 26], fixedMin: 3 },
  { size: 7, whites: [28, 28], fixedMax: 5 },
  { size: 7, whites: [30, 30], fixedMax: 5 },
];

function legalPattern(black, band) {
  const geo = geometry(black);
  if (!geo) return null;
  if (geo.whites.length < band[0] || geo.whites.length > band[1]) return null;
  if (!connected(black)) return null;
  return geo;
}

// one attempt at a board for the given ramp row; null if the draw fails
function attempt(ramp, rnd) {
  const black = randomPattern(ramp.size, ramp.size === 7 ? 0.26 : 0.26, rnd);
  const geo = legalPattern(black, ramp.whites);
  if (!geo) return null;
  const val0 = fill(geo, rnd);
  if (!val0) return null;
  const val = refine(geo, val0, rnd, ramp.size === 7 ? 4000 : 12000);
  if (!val) return null;
  const sums = totals(geo, val);
  const fixed = geo.runs.reduce((n, run, i) => n + (isFixed(run.cells.length, sums[i]) ? 1 : 0), 0);
  if (ramp.fixedMin != null && fixed < ramp.fixedMin) return null;
  if (ramp.fixedMax != null && fixed > ramp.fixedMax) return null;
  if (countSolutions(geo, sums, 2) !== 1) return null;
  if (!propagate(geo, sums).solved) return null;
  return { black, geo, val, sums, fixed };
}

function toBoard(b) {
  const N = b.geo.N;
  const sol = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (b.black[r][c] ? 0 : b.val.get(r * N + c))));
  const across = Array.from({ length: N }, () => Array(N).fill(0));
  const down = Array.from({ length: N }, () => Array(N).fill(0));
  b.geo.runs.forEach((run, i) => {
    const r = Math.floor(run.head / N), c = run.head % N;
    if (run.dir === 'a') across[r][c] = b.sums[i]; else down[r][c] = b.sums[i];
  });
  return { sol, across, down, whites: b.geo.whites.length, fixed: b.fixed, runs: b.geo.runs.length };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, dow, label: `${MONTHS[m - 1]} ${d}, ${y}`, quizId: `sums-${m}-${d}-${String(y).slice(2)}` };
}
function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

const args = process.argv.slice(2);
const opt = (k, dflt) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : dflt; };

if (args.includes('--probe')) {
  for (let dow = 0; dow < 7; dow++) {
    const rnd = rng(1000 + dow);
    const t0 = Date.now();
    let tries = 0, got = 0;
    while (got < 3 && tries < 20000) { tries++; if (attempt(RAMP[dow], rnd)) got++; }
    console.log(`dow ${dow} size ${RAMP[dow].size}: ${got} boards in ${tries} tries, ${Date.now() - t0}ms`);
  }
  process.exit(0);
}

const from = opt('--from', '2026-09-03');
const days = Number(opt('--days', '78'));
const seed = Number(opt('--seed', '20260903'));
const rnd = rng(seed);
const seenPattern = new Set();
const seenSums = new Set();
const out = [];
for (let i = 0; i < days; i++) {
  const live = addDays(from, i);
  const dp = dateParts(live);
  const ramp = RAMP[dp.dow];
  let b = null;
  let tries = 0;
  while (!b) {
    tries++;
    if (tries > 200000) throw new Error(`no board for ${live}`);
    const cand = attempt(ramp, rnd);
    if (!cand) continue;
    const pk = JSON.stringify(blackToRows(cand.black));
    const sk = cand.sums.join(',');
    if (seenPattern.has(pk) || seenSums.has(sk)) continue;
    seenPattern.add(pk); seenSums.add(sk);
    b = cand;
  }
  const board = toBoard(b);
  out.push({ num: i + 1, quizId: dp.quizId, live, dateLabel: dp.label, sunday: dp.dow === 0, size: ramp.size, ...board });
  process.stderr.write(`${live} ${ramp.size}x${ramp.size} whites ${board.whites} fixed ${board.fixed} (${tries} tries)\n`);
}

const lines = [];
lines.push(`// Puzzle data for Sums, the daily kakuro. Imported ONLY by the server page
// (app/sums/page.js), which filters live<=today before handing puzzles to the
// client, so future boards and their solutions never reach a browser.
//
// A board is size x size. Row 0 and column 0 are always black. In \`sol\`, 0 is a
// black cell and 1-9 is the digit that belongs in a white one. \`across[r][c]\`
// is the total printed in black cell (r,c) for the run to its right (0 = no run
// starts there) and \`down[r][c]\` the total for the run beneath it. Every run has
// two to nine cells, no digit repeats inside a run, and EVERY board has exactly
// one solution that falls out to run-by-run candidate propagation with no
// guessing anywhere. Weekdays are 7x7, the Sunday Edition is 11x11.
//
// MEASURED FIELDS, recomputed by scripts/verify-sums.mjs rather than trusted:
//   whites  squares to fill.
//   fixed   runs whose total admits exactly one digit set (the footholds).
//   runs    how many runs the board has.
//
// Weekday ramp (whites / fixed): Mon 22 / >=4, Tue 22-24 / >=4, Wed 24-26 / >=3,
// Thu 26 / >=3, Fri 28 / <=5, Sat 30 / <=5, Sun (11x11) 62-72 / <=12.
//
// Do NOT hand-edit a board here. Regenerate with scripts/gen-sums.mjs and re-run
// scripts/verify-sums.mjs.
export const PUZZLES = [`);
for (const p of out) {
  lines.push('  {');
  lines.push(`    num: ${p.num},`);
  lines.push(`    quizId: '${p.quizId}',`);
  lines.push(`    live: '${p.live}',`);
  lines.push(`    dateLabel: '${p.dateLabel}',`);
  lines.push(`    sunday: ${p.sunday},`);
  lines.push(`    size: ${p.size},`);
  lines.push(`    whites: ${p.whites},`);
  lines.push(`    fixed: ${p.fixed},`);
  lines.push(`    runs: ${p.runs},`);
  lines.push(`    sol: ${JSON.stringify(p.sol)},`);
  lines.push(`    across: ${JSON.stringify(p.across)},`);
  lines.push(`    down: ${JSON.stringify(p.down)},`);
  lines.push('  },');
}
lines.push('];');
process.stdout.write(lines.join('\n') + '\n');
