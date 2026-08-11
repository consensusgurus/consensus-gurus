// Verify the Quilt bank (the daily 9x9 jigsaw sudoku).
//
//   node scripts/verify-quilt.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. Per the daily puzzle authoring
// standard in CLAUDE.md, a checker that reads a stored field and prints it has
// verified nothing. So the solvers below are written out again here rather than
// imported from scripts/gen-quilt.mjs: sharing them would mean a bug in the
// generator's solver certifies its own output as correct. Every claim the bank
// makes is re-derived from `reg` and `given` alone.
//
// WHAT IS CHECKED
//   Shape      nums sequential from 1, dates contiguous and ISO, dateLabel
//              agreeing with `live`, quizId of the form quilt-M-D-YY derived
//              from `live`, no duplicate ids.
//   Regions    exactly nine regions, each exactly nine cells, each connected
//              through shared edges, each spanning >= 3 rows and >= 3 columns,
//              at most one plain 3x3 rectangle per board, and never the
//              standard sudoku box layout (that board would just be Suds).
//   Solution   `sol` is a legal filling: every row, column and region holds
//              1-9 exactly once.
//   Clues      every printed clue equals `sol` in that cell, and `clues` equals
//              the number actually printed.
//   Uniqueness EXACTLY one solution, from an independent counting solver.
//   No guessing the board also falls to a logical solver limited to naked and
//              hidden singles, locked candidates, and naked and hidden pairs.
//              Uniqueness alone does not make a board humanly solvable, and a
//              board that needs trial and error is a bug however unique it is.
//   Sunday     the flag lands on real Sundays and nowhere else, and every
//              Sunday board is thinner than every weekday board. A Sunday
//              Edition that does not actually cut the clue count is not one.
//   Ranges     weekday 30-34 clues, Sunday 24-27.
//   Variety    no region layout, solution grid or clue grid repeats anywhere in
//              the bank. Per-board legality passes happily on a bank that ships
//              the same board ninety times.
import { PUZZLES } from '../app/quilt/puzzles.js';

const IDX = [...Array(81).keys()];
const rowOf = (i) => (i / 9) | 0;
const colOf = (i) => i % 9;
const flat = (grid) => grid.flat();
const nbrs = (i) => {
  const r = rowOf(i), c = colOf(i), o = [];
  if (r > 0) o.push(i - 9);
  if (r < 8) o.push(i + 9);
  if (c > 0) o.push(i - 1);
  if (c < 8) o.push(i + 1);
  return o;
};
const STANDARD = IDX.map((i) => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0));
const BIT = Array.from({ length: 10 }, (_, d) => (d ? 1 << d : 0));
const ALL = 0x3fe;
const bitsOf = (m) => { const o = []; for (let d = 1; d <= 9; d++) if (m & BIT[d]) o.push(d); return o; };

function unitsOf(reg) {
  const u = [];
  for (let r = 0; r < 9; r++) u.push(IDX.filter((i) => rowOf(i) === r));
  for (let c = 0; c < 9; c++) u.push(IDX.filter((i) => colOf(i) === c));
  for (let k = 0; k < 9; k++) u.push(IDX.filter((i) => reg[i] === k));
  return u;
}
function peersOf(reg) {
  return IDX.map((i) => IDX.filter((j) => j !== i
    && (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || reg[i] === reg[j])));
}

// Plain recursive counting solver, capped at 2. Deliberately simple rather than
// fast: a finished board has thirty-odd clues and solves instantly, so there is
// no reason to reach for the bitmask machinery the generator needs.
function countSolutions(given, reg, cap = 2) {
  const peers = peersOf(reg);
  const g = given.slice();
  let found = 0;
  (function rec() {
    let best = -1, bestC = null;
    for (const i of IDX) {
      if (g[i]) continue;
      const used = new Set(peers[i].map((p) => g[p]).filter(Boolean));
      const c = [];
      for (let d = 1; d <= 9; d++) if (!used.has(d)) c.push(d);
      if (!c.length) return;
      if (!bestC || c.length < bestC.length) { best = i; bestC = c; if (c.length === 1) break; }
    }
    if (best < 0) { found++; return; }
    for (const d of bestC) {
      g[best] = d;
      rec();
      g[best] = 0;
      if (found >= cap) return;
    }
  })();
  return found;
}

// The no-guessing proof. Same technique set the generator dug against, written
// independently: naked singles, hidden singles, locked candidates, naked pairs,
// hidden pairs. Returns true only when the grid comes out completely filled.
function logicalSolve(given, reg) {
  const peers = peersOf(reg);
  const units = unitsOf(reg);
  const g = given.slice();
  const cand = IDX.map(() => ALL);
  const assign = (i, d) => { g[i] = d; cand[i] = 0; for (const p of peers[i]) cand[p] &= ~BIT[d]; };
  for (const i of IDX) if (g[i]) { const d = g[i]; g[i] = 0; assign(i, d); }

  for (let guard = 0; guard < 2000; guard++) {
    let moved = false;
    for (const i of IDX) {
      if (g[i]) continue;
      const b = bitsOf(cand[i]);
      if (!b.length) return false;
      if (b.length === 1) { assign(i, b[0]); moved = true; }
    }
    if (moved) continue;
    for (const u of units) {
      for (let d = 1; d <= 9; d++) {
        if (u.some((i) => g[i] === d)) continue;
        const spots = u.filter((i) => !g[i] && (cand[i] & BIT[d]));
        if (!spots.length) return false;
        if (spots.length === 1) { assign(spots[0], d); moved = true; }
      }
    }
    if (moved) continue;
    for (const u of units) {
      for (let d = 1; d <= 9; d++) {
        if (u.some((i) => g[i] === d)) continue;
        const spots = u.filter((i) => !g[i] && (cand[i] & BIT[d]));
        if (spots.length < 2) continue;
        const strike = (pred) => {
          for (const i of IDX) {
            if (g[i] || spots.includes(i) || !pred(i)) continue;
            if (cand[i] & BIT[d]) { cand[i] &= ~BIT[d]; moved = true; }
          }
        };
        if (spots.every((i) => rowOf(i) === rowOf(spots[0]))) strike((i) => rowOf(i) === rowOf(spots[0]));
        if (spots.every((i) => colOf(i) === colOf(spots[0]))) strike((i) => colOf(i) === colOf(spots[0]));
        if (spots.every((i) => reg[i] === reg[spots[0]])) strike((i) => reg[i] === reg[spots[0]]);
      }
    }
    if (moved) continue;
    for (const u of units) {
      const open = u.filter((i) => !g[i]);
      for (let a = 0; a < open.length; a++) {
        for (let b = a + 1; b < open.length; b++) {
          if (cand[open[a]] !== cand[open[b]] || bitsOf(cand[open[a]]).length !== 2) continue;
          for (const i of open) {
            if (i === open[a] || i === open[b]) continue;
            if (cand[i] & cand[open[a]]) { cand[i] &= ~cand[open[a]]; moved = true; }
          }
        }
      }
    }
    if (moved) continue;
    for (const u of units) {
      for (let d1 = 1; d1 <= 9; d1++) {
        for (let d2 = d1 + 1; d2 <= 9; d2++) {
          const s1 = u.filter((i) => !g[i] && (cand[i] & BIT[d1]));
          const s2 = u.filter((i) => !g[i] && (cand[i] & BIT[d2]));
          if (s1.length !== 2 || s2.length !== 2 || s1[0] !== s2[0] || s1[1] !== s2[1]) continue;
          const keep = BIT[d1] | BIT[d2];
          for (const i of s1) if (cand[i] !== keep) { cand[i] = keep; moved = true; }
        }
      }
    }
    if (!moved) break;
  }
  return g.every((v) => v > 0);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_MIN = 30, WEEKDAY_MAX = 34, SUNDAY_MIN = 24, SUNDAY_MAX = 27;

let bad = 0;
const seenId = new Set(), seenReg = new Set(), seenSol = new Set(), seenGiven = new Set();
const sundayClues = [], weekdayClues = [];
let prevISO = null;

PUZZLES.forEach((p, i) => {
  const errs = [];
  const id = p.quizId || `#${i + 1}`;
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  if (seenId.has(p.quizId)) errs.push('duplicate quizId');
  seenId.add(p.quizId);

  // ── dates ──
  const d = new Date(`${p.live}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '') || Number.isNaN(d.getTime())) errs.push(`bad live date ${p.live}`);
  else {
    const want = `quilt-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
    if (p.quizId !== want) errs.push(`quizId ${p.quizId} != ${want}`);
    const label = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
    if (p.dateLabel !== label) errs.push(`dateLabel ${p.dateLabel} != ${label}`);
    if (prevISO) {
      const gap = (Date.parse(`${p.live}T12:00:00Z`) - Date.parse(`${prevISO}T12:00:00Z`)) / 86400000;
      if (gap !== 1) errs.push(`${gap} day gap after ${prevISO}, want a board every day`);
    }
    prevISO = p.live;
    const isSun = d.getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday=${!!p.sunday} but ${p.live} is ${isSun ? 'a Sunday' : 'not a Sunday'}`);
  }

  // ── region map ──
  const reg = flat(p.reg || []);
  if (reg.length !== 81) errs.push(`reg is ${reg.length} cells, want 81`);
  else {
    let rects = 0;
    for (let k = 0; k < 9; k++) {
      const cells = IDX.filter((x) => reg[x] === k);
      if (cells.length !== 9) { errs.push(`region ${k} has ${cells.length} cells, want 9`); continue; }
      const seen = new Set([cells[0]]), stack = [cells[0]];
      while (stack.length) {
        const cur = stack.pop();
        for (const n of nbrs(cur)) if (reg[n] === k && !seen.has(n)) { seen.add(n); stack.push(n); }
      }
      if (seen.size !== 9) errs.push(`region ${k} is not connected (${seen.size}/9 reachable)`);
      const rs = cells.map(rowOf), cs = cells.map(colOf);
      const rSpan = Math.max(...rs) - Math.min(...rs) + 1;
      const cSpan = Math.max(...cs) - Math.min(...cs) + 1;
      if (rSpan < 3 || cSpan < 3) errs.push(`region ${k} spans ${rSpan}x${cSpan}, want at least 3x3`);
      if (rSpan === 3 && cSpan === 3) rects++;
    }
    if (rects > 1) errs.push(`${rects} regions are plain 3x3 blocks, want at most 1`);
    if (reg.every((v, x) => v === STANDARD[x])) errs.push('region map IS the standard sudoku boxes');
    if (reg.some((v) => !Number.isInteger(v) || v < 0 || v > 8)) errs.push('reg holds a value outside 0-8');
  }

  // ── solution legality ──
  const sol = flat(p.sol || []);
  const given = flat(p.given || []);
  if (sol.length !== 81) errs.push(`sol is ${sol.length} cells, want 81`);
  if (given.length !== 81) errs.push(`given is ${given.length} cells, want 81`);
  if (sol.length === 81 && reg.length === 81) {
    for (const u of unitsOf(reg)) {
      const vals = u.map((x) => sol[x]).sort((a, b) => a - b);
      if (vals.join('') !== '123456789') { errs.push('sol has a unit that is not 1-9 exactly once'); break; }
    }
  }

  // ── clues agree with the solution ──
  if (given.length === 81 && sol.length === 81) {
    let printed = 0;
    for (const x of IDX) {
      if (!given[x]) continue;
      printed++;
      if (given[x] !== sol[x]) { errs.push(`clue at r${rowOf(x) + 1}c${colOf(x) + 1} contradicts sol`); break; }
    }
    if (printed !== p.clues) errs.push(`clues field says ${p.clues}, board prints ${printed}`);
    if (p.sunday) {
      sundayClues.push(printed);
      if (printed < SUNDAY_MIN || printed > SUNDAY_MAX) errs.push(`Sunday clues ${printed} outside ${SUNDAY_MIN}-${SUNDAY_MAX}`);
    } else {
      weekdayClues.push(printed);
      if (printed < WEEKDAY_MIN || printed > WEEKDAY_MAX) errs.push(`weekday clues ${printed} outside ${WEEKDAY_MIN}-${WEEKDAY_MAX}`);
    }
  }

  // ── the two solver proofs ──
  // Gated on the grids being STRUCTURALLY usable, not on the board being
  // otherwise clean. Gating these on `!errs.length` looks tidy and quietly
  // guts the checker: any board that trips a cheap check first, a clue count
  // one outside the range say, would then skip the uniqueness proof entirely,
  // which is the single most important thing in this file.
  if (given.length === 81 && sol.length === 81 && reg.length === 81
      && reg.every((v) => Number.isInteger(v) && v >= 0 && v <= 8)) {
    const n = countSolutions(given, reg, 2);
    if (n !== 1) errs.push(n === 0 ? 'NO solution' : 'MORE THAN ONE solution');
    else if (!logicalSolve(given, reg)) errs.push('needs guessing (no logical line to the answer)');
  }

  // ── bank-wide variety ──
  const rk = reg.join(','), sk = sol.join(''), gk = given.join('');
  if (seenReg.has(rk)) errs.push('region layout already used earlier in the bank');
  if (seenSol.has(sk)) errs.push('solution grid already used earlier in the bank');
  if (seenGiven.has(gk)) errs.push('clue grid already used earlier in the bank');
  seenReg.add(rk); seenSol.add(sk); seenGiven.add(gk);

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); }
});

// A Sunday Edition has to actually be one. The whole point of Quilt's Sunday is
// fewer printed clues, so the thinnest weekday board must still be richer than
// the richest Sunday board.
if (sundayClues.length && weekdayClues.length) {
  const worstSunday = Math.max(...sundayClues);
  const thinnestWeekday = Math.min(...weekdayClues);
  if (worstSunday >= thinnestWeekday) {
    bad++;
    console.error(`✗ Sunday Edition does not cut: richest Sunday has ${worstSunday} clues, thinnest weekday has ${thinnestWeekday}`);
  }
}
if (!sundayClues.length) { bad++; console.error('✗ bank contains no Sunday Edition'); }

if (bad) { console.error(`\n${bad} problem(s)`); process.exit(1); }
console.log(`✓ ${PUZZLES.length} Quilt boards verified: ${PUZZLES[0].live} to ${PUZZLES[PUZZLES.length - 1].live}`);
console.log(`  unique solution and a guess-free logical line on every board`);
console.log(`  weekday ${Math.min(...weekdayClues)}-${Math.max(...weekdayClues)} clues, Sunday ${Math.min(...sundayClues)}-${Math.max(...sundayClues)} (${sundayClues.length} Editions)`);
console.log(`  ${seenReg.size} distinct region layouts, ${seenSol.size} distinct solutions`);
