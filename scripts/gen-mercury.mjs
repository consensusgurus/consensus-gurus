#!/usr/bin/env node
// Build the Mercury bank (daily thermo sudoku).
//
//   node scripts/gen-mercury.mjs > /tmp/mercury-puzzles.js
//
// A board is an ordinary 9x9 sudoku plus THERMOMETERS: orthogonal paths along
// which digits strictly increase from the bulb. Weekdays carry six thermos of
// four to seven cells; the SUNDAY EDITION carries nine thermos of four to nine
// cells and prints almost nothing.
//
// THE RAMP IS THE PRINTED-GIVEN COUNT AND NOTHING ELSE (the Sando rule):
// Mon 30, Tue 27, Wed 24, Thu 21, Fri 18, Sat 15, Sunday 8. Zero-given was
// probed and is out of reach for the graded technique set on random layouts
// (dig floors bottom out at 7-13), so eight is the honest Sunday, not a
// compromise silently shipped as "no givens".
//
// Every board is solvable by the graded technique set (thermo bounds
// propagation as free pencil work, then hidden singles, locked candidates,
// pairs) - no guessing anywhere - and has exactly one solution.
import { randomSolution, buildThermos, gradeSolve, countSolutions, makeRng, shuffled, CELLS } from './mercury-core.mjs';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';

const START = '2026-08-24';
const DAYS = 42;
const TARGET = { 1: 30, 2: 27, 3: 24, 4: 21, 5: 18, 6: 15, 0: 8 };
const THERMO = {
  1: { count: 6, minLen: 4, maxLen: 7 }, 2: { count: 6, minLen: 4, maxLen: 7 },
  3: { count: 6, minLen: 4, maxLen: 7 }, 4: { count: 6, minLen: 4, maxLen: 7 },
  5: { count: 6, minLen: 4, maxLen: 7 }, 6: { count: 6, minLen: 4, maxLen: 7 },
  0: { count: 9, minLen: 4, maxLen: 9 },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}
function addDays(iso, n) {
  const t = new Date(iso + 'T12:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

function dig(sol, th, target, rnd) {
  const givens = sol.slice();
  let printed = CELLS;
  for (const i of shuffled(Array.from({ length: CELLS }, (_, x) => x), rnd)) {
    if (printed <= target) break;
    const keep = givens[i];
    givens[i] = 0;
    if (gradeSolve(th, givens).solved) printed--;
    else givens[i] = keep;
  }
  if (printed > target) return null;
  // add nothing back: dig stops exactly at target
  return givens;
}

const JL = '/tmp/build/mercury-bank.jsonl';
const out = [];
const seen = new Set();
if (existsSync(JL)) {
  for (const line of readFileSync(JL, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const p = JSON.parse(line);
    out.push(p);
    seen.add(p.sol.flat().join(''));
  }
}

for (let i = 0; i < DAYS; i++) {
  if (out.some((p) => p.num === i + 1)) continue;
  const live = addDays(START, i);
  const { y, m, d, dow } = dateParts(live);
  const target = TARGET[dow];
  const cfg = THERMO[dow];
  const rnd = makeRng(0x3E4C + i * 6151);
  let found = null;
  for (let attempt = 0; attempt < 100000 && !found; attempt++) {
    const sol = randomSolution(rnd);
    const key = sol.join('');
    if (seen.has(key)) continue;
    const th = buildThermos(sol, rnd, cfg);
    if (!th) continue;
    const givens = dig(sol, th, target, rnd);
    if (!givens) continue;
    const res = gradeSolve(th, givens);
    if (!res.solved || res.grid.join('') !== sol.join('')) continue;
    if (countSolutions(th, givens, 2) !== 1) throw new Error('logic-solved board not unique?!');
    found = { sol, th, givens };
    seen.add(key);
  }
  if (!found) throw new Error(`no board found for ${live}`);
  const rec = {
    num: i + 1,
    quizId: `mercury-${m}-${d}-${String(y).slice(2)}`,
    live,
    dateLabel: `${MONTHS[m - 1]} ${d}, ${y}`,
    sunday: dow === 0,
    printed: target,
    thermos: found.th,
    given: Array.from({ length: 9 }, (_, r) => found.givens.slice(r * 9, r * 9 + 9)),
    sol: Array.from({ length: 9 }, (_, r) => found.sol.slice(r * 9, r * 9 + 9)),
  };
  out.push(rec);
  appendFileSync(JL, JSON.stringify(rec) + '\n');
  process.stderr.write(`#${i + 1} ${live} givens=${target} thermos=${found.th.length}\n`);
}
out.sort((a, b) => a.num - b.num);

const HEADER = `// Puzzle data for Mercury, the daily thermo sudoku. Imported ONLY by the
// server page (app/mercury/page.js), which filters live<=today before handing
// puzzles to the client, so future boards and their solutions never reach a
// browser.
//
// A board is an ordinary 9x9 sudoku plus THERMOMETERS: \`thermos\` is an array
// of paths, each an array of [row, col] steps from the BULB (first cell) to
// the tip, along which the digits strictly INCREASE. Thermos never share a
// cell. \`given\` holds the printed clues (0 = empty), \`sol\` the solution, used
// for the win check, the one hint, and reveal-and-end.
//
// THE RAMP IS THE PRINTED-GIVEN COUNT AND NOTHING ELSE (the Sando rule):
// Mon 30, Tue 27, Wed 24, Thu 21, Fri 18, Sat 15, and the Sunday Edition at 8,
// with nine thermometers against the weekday six. (Zero-given Sundays were
// probed and are out of reach of the graded technique set on random layouts;
// eight is the honest floor, stated rather than fudged.)
//
// EVERY board has EXACTLY ONE solution and falls to thermo bounds propagation
// plus hidden singles, locked candidates and pairs - no guessing anywhere -
// re-proved by the independent solvers in scripts/verify-mercury.mjs.
//
// Do NOT hand-edit a board here. Regenerate with scripts/gen-mercury.mjs and
// re-run scripts/verify-mercury.mjs.
export const PUZZLES = [`;

const rows = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    printed: ${p.printed},
    thermos: [${p.thermos.map((t) => `[${t.map(([r, c]) => `[${r},${c}]`).join(',')}]`).join(',')}],
    given: [${p.given.map((r) => `[${r.join(',')}]`).join(',')}],
    sol: [${p.sol.map((r) => `[${r.join(',')}]`).join(',')}],
  },`);

console.log(`${HEADER}\n${rows.join('\n')}\n];\n`);
