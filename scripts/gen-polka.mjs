#!/usr/bin/env node
// Build the Polka bank (daily kropki sudoku).
//
//   node scripts/gen-polka.mjs > /tmp/polka-puzzles.js
//
// A deal is a random full sudoku solution with its complete kropki dot set
// printed and NO digits at all: white dot = the neighbours differ by 1, black
// dot = one is double the other, no dot = neither, and the empty edges are
// clues too. The dot set is fully determined by the solution (a 1-2 pair fits
// both rules and gets either dot, picked by position parity), so DIFFICULTY IS
// A MEASURED COST, not a knob (the Sixes rule): the graded solver's weighted
// step tally (hidden single 4, locked candidates 12, pairs 20; dot arc work
// and naked singles are the free pencil work every deal takes).
//
// Weekday cost bands: Mon <=10, Tue 11-24, Wed 25-38, Thu 39-54, Fri 55-78,
// Sat 79-110, and the SUNDAY EDITION at 120+, above every weekday band by
// construction. Every shipped deal is solvable by the graded technique set
// (no guessing anywhere) and has exactly one solution.
import { randomSolution, dotsOf, pairsOf, gradeSolve, countSolutions, makeRng } from './polka-core.mjs';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';

const START = '2026-08-24';
const DAYS = 42;
const BAND = {
  1: [0, 10], 2: [11, 24], 3: [25, 38], 4: [39, 54], 5: [55, 78], 6: [79, 110],
  0: [120, 10000],
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

const JL = '/tmp/build/polka-bank.jsonl';
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
  const [lo, hi] = BAND[dow];
  const rnd = makeRng(0xd07 + i * 104729);
  let deal = null;
  for (let attempt = 0; attempt < 400000 && !deal; attempt++) {
    const sol = randomSolution(rnd);
    const key = sol.join('');
    if (seen.has(key)) continue;
    const dots = dotsOf(sol);
    const pairs = pairsOf(dots);
    const res = gradeSolve(pairs);
    if (!res.solved) continue;
    if (res.cost < lo || res.cost > hi) continue;
    if (res.grid.join('') !== sol.join('')) throw new Error('solver landed on a different grid?!');
    if (countSolutions(pairs, 2) !== 1) throw new Error('logic-solved deal not unique?!');
    deal = { sol, dots, cost: res.cost };
    seen.add(key);
  }
  if (!deal) throw new Error(`no deal found for ${live}`);
  const rec = {
    num: i + 1,
    quizId: `polka-${m}-${d}-${String(y).slice(2)}`,
    live,
    dateLabel: `${MONTHS[m - 1]} ${d}, ${y}`,
    sunday: dow === 0,
    cost: deal.cost,
    dots: deal.dots,
    sol: Array.from({ length: 9 }, (_, r) => deal.sol.slice(r * 9, r * 9 + 9)),
  };
  out.push(rec);
  appendFileSync(JL, JSON.stringify(rec) + '\n');
  process.stderr.write(`#${i + 1} ${live} cost=${deal.cost}\n`);
}
out.sort((a, b) => a.num - b.num);

const HEADER = `// Puzzle data for Polka, the daily kropki sudoku. Imported ONLY by the server
// page (app/polka/page.js), which filters live<=today before handing puzzles
// to the client, so future deals and their solutions never reach a browser.
//
// A deal prints NO digits, only dots: dots.h[r][c] sits between (r,c) and
// (r,c+1), dots.v[r][c] between (r,c) and (r+1,c); 1 = white (the two digits
// differ by exactly 1), 2 = black (one is double the other), 0 = no dot
// (NEITHER is true - the empty edges are clues too). A 1 next to a 2 fits both
// rules and may get either dot, picked by position parity; the solver never
// assumes which. \`sol\` is the solution, used for the win check, the one hint,
// and reveal-and-end.
//
// DIFFICULTY IS A MEASURED COST, not a knob (the Sixes rule): the weighted
// step tally of the graded logical solver (hidden single 4, locked candidates
// 12, pairs 20; dot arc work and naked singles are free pencil work).
// Weekday bands: Mon <=10, Tue 11-24, Wed 25-38, Thu 39-54, Fri 55-78,
// Sat 79-110, Sunday Edition 120+, above every weekday band.
//
// EVERY deal has EXACTLY ONE solution and falls to the graded technique set,
// so no guessing anywhere is a construction guarantee, re-proved by the
// independent solvers in scripts/verify-polka.mjs.
//
// Do NOT hand-edit a deal here. Regenerate with scripts/gen-polka.mjs and
// re-run scripts/verify-polka.mjs.
export const PUZZLES = [`;

const rows = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    cost: ${p.cost},
    dots: { h: [${p.dots.h.map((r) => `[${r.join(',')}]`).join(',')}], v: [${p.dots.v.map((r) => `[${r.join(',')}]`).join(',')}] },
    sol: [${p.sol.map((r) => `[${r.join(',')}]`).join(',')}],
  },`);

console.log(`${HEADER}\n${rows.join('\n')}\n];\n`);
