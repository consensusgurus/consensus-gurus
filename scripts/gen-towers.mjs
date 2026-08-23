#!/usr/bin/env node
// Build the Towers bank (daily skyscrapers).
//
//   node scripts/gen-towers.mjs > /tmp/towers-puzzles.js
//
// THE RAMP IS THE PRINTED-CLUE COUNT AND NOTHING ELSE (the Sando rule): every
// board carries the full Latin-square logic, and the weekday sets how many of
// the 4N visibility clues are printed. Mon 14, Tue 13, Wed 12, Thu 11, Fri 10,
// Sat 9 (of 20 on a 5x5); the Sunday Edition is a 7x7 with 18 of 28.
//
// EVERY board is (a) uniquely solvable and (b) provably solvable by repeated
// LINE SWEEPS alone (enumerate the permutations a line's clues and candidates
// still allow, keep only digits some survivor uses) - which is the human method
// for this puzzle, so no guessing anywhere is a construction guarantee. Boards
// whose full clue set is not logic-solvable are discarded outright; about half
// of random 5x5 squares and 1-in-1300 random 7x7 squares survive that gate,
// which is why the generator brute-samples.
import { randomLatin, cluesOf, logicSolve, countSolutions, countPrinted, makeRng, shuffled } from './towers-core.mjs';

const START = '2026-08-24'; // Monday
const DAYS = 42;            // through 2026-10-04 (six Sundays)
const TARGET = { 1: 14, 2: 13, 3: 12, 4: 11, 5: 10, 6: 9, 0: 18 }; // dow -> printed clues
const SIZE = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 0: 7 };

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

function buildBoard(N, target, rnd) {
  for (let attempt = 0; attempt < 20000; attempt++) {
    const sol = randomLatin(N, rnd);
    const full = cluesOf(sol);
    if (!logicSolve(N, full).solved) continue;
    // minimize: drop clues while the line-sweep solver still finishes
    const clues = JSON.parse(JSON.stringify(full));
    const slots = [];
    for (const side of ['top', 'right', 'bottom', 'left'])
      for (let i = 0; i < N; i++) slots.push([side, i]);
    const removed = [];
    for (const [side, i] of shuffled(slots, rnd)) {
      const keep = clues[side][i];
      clues[side][i] = 0;
      if (logicSolve(N, clues).solved) removed.push([side, i, keep]);
      else clues[side][i] = keep;
    }
    let printed = countPrinted(clues);
    if (printed > target) continue; // could not get sparse enough; new square
    // add clues back (random order) to land exactly on the target
    for (const [side, i, v] of shuffled(removed, rnd)) {
      if (printed >= target) break;
      clues[side][i] = v;
      printed++;
    }
    if (printed !== target) continue;
    if (!logicSolve(N, clues).solved) throw new Error('adding clues broke solvability?!');
    // A propagation solve is itself a uniqueness proof (every sweep preserves
    // all solutions, and the end state is a single grid), so the brute counter
    // is belt and braces only where it is cheap. On a 7x7 it explodes.
    if (N <= 5 && countSolutions(N, clues, 2) !== 1) throw new Error('logic-solved board not unique?!');
    return { sol, clues };
  }
  throw new Error('no board found');
}

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
const JL = '/tmp/build/towers-bank.jsonl';
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
  const N = SIZE[dow];
  const target = TARGET[dow];
  const rnd = makeRng(0x70775 + i * 7919);
  let board;
  for (;;) {
    board = buildBoard(N, target, rnd);
    const key = board.sol.flat().join('');
    if (!seen.has(key)) { seen.add(key); break; }
  }
  const rec = {
    num: i + 1,
    quizId: `towers-${m}-${d}-${String(y).slice(2)}`,
    live,
    dateLabel: `${MONTHS[m - 1]} ${d}, ${y}`,
    sunday: dow === 0,
    size: N,
    printed: target,
    clues: board.clues,
    sol: board.sol,
  };
  out.push(rec);
  appendFileSync(JL, JSON.stringify(rec) + '\n');
  process.stderr.write(`#${i + 1} ${live} N=${N} clues=${target}\n`);
}
out.sort((a, b) => a.num - b.num);

const HEADER = `// Puzzle data for Towers, the daily skyscrapers puzzle. Imported ONLY by the
// server page (app/towers/page.js), which filters live<=today before handing
// puzzles to the client, so future boards and their solutions never reach a
// browser.
//
// A board is an NxN Latin square of tower heights 1..N (size: weekdays 5, the
// Sunday Edition 7). \`clues\` holds the printed border clues as four arrays
// (top, right, bottom, left), each of length N, 0 = that clue is not printed.
// A printed clue counts the towers VISIBLE looking down that row or column
// from that side, a taller tower hiding every shorter one behind it. \`sol\` is
// the solution, used for the win check, the one hint, and reveal-and-end.
//
// THE RAMP IS THE PRINTED-CLUE COUNT AND NOTHING ELSE (the Sando rule):
// Mon 14, Tue 13, Wed 12, Thu 11, Fri 10, Sat 9 (of 20), Sunday 18 of 28 on
// the 7x7. \`printed\` restates the count and scripts/verify-towers.mjs
// recomputes it rather than trusting it.
//
// EVERY board has EXACTLY ONE solution and is provably solvable by repeated
// line sweeps alone (what a person does: ask which orderings a line's clues
// still allow). No guessing anywhere is a construction guarantee, enforced by
// the independent solvers in scripts/verify-towers.mjs.
//
// Do NOT hand-edit a board here. Regenerate with scripts/gen-towers.mjs and
// re-run scripts/verify-towers.mjs.
export const PUZZLES = [`;

const rows = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    size: ${p.size},
    printed: ${p.printed},
    clues: { top: [${p.clues.top.join(',')}], right: [${p.clues.right.join(',')}], bottom: [${p.clues.bottom.join(',')}], left: [${p.clues.left.join(',')}] },
    sol: [${p.sol.map((r) => `[${r.join(',')}]`).join(',')}],
  },`);

console.log(`${HEADER}\n${rows.join('\n')}\n];\n`);
