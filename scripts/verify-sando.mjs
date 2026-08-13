// Verify the Sando bank (the daily sandwich sudoku).
//
//   node scripts/verify-sando.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. Per the daily puzzle authoring
// standard in CLAUDE.md, a checker that reads a stored field and prints it has
// verified nothing. The solvers below are therefore written out AGAIN here
// rather than imported from scripts/sando-core.mjs: sharing them would mean a
// bug in the generator's solver certifies its own output as correct, which is
// not hypothetical. On Cages this rule caught an unsound hidden-pair rule and a
// too-weak 45 rule; and the generator's own sandwich solver shipped a build
// where `cand.every(solved)` handed masks to a function expecting indices, so it
// reported a board with three solutions as solved. A shared copy agrees with its
// own bugs by construction.
//
// The counting solver here is also a different algorithm from the generator's:
// this one walks cell by cell with incremental line checks, where the generator
// propagates candidates and branches on the tightest cell.
//
// WHAT IS CHECKED
//   Shape      nums sequential from 1, dates contiguous and ISO, dateLabel
//              agreeing with `live`, quizId of the form sando-M-D-YY derived
//              from `live`, no duplicate ids.
//   Sums       all eighteen present and in 0..35, and every one of them really
//              is the sandwich total of its line in `sol`, recomputed here.
//   Givens     every printed digit equals `sol` in that square, and `clues`
//              equals the number actually printed.
//   Solution   `sol` is a legal filling: every row, column and 3x3 box holds
//              1-9 exactly once.
//   Uniqueness EXACTLY one solution, from an independent counting solver.
//   No guessing the board also falls to a logical solver limited to the sandwich
//              deduction plus naked and hidden singles, AND every move that
//              solver makes is checked against the known solution, so an unsound
//              rule cannot certify itself. Uniqueness alone does not make a
//              board humanly solvable.
//   Ramp       the printed-digit count matches the documented weekday table. A
//              floor is not a target, so the day pins the value.
//   Sunday     the flag lands on real Sundays and nowhere else, and every Sunday
//              board prints fewer digits than every weekday board. A Sunday
//              Edition that does not actually cut the clues is not one.
//   Variety    no clue grid and no solution grid repeats anywhere in the bank.
import { PUZZLES } from '../app/sando/puzzles.js';

const IDX = [...Array(81).keys()];
const rowOf = (i) => (i / 9) | 0;
const colOf = (i) => i % 9;
const boxOf = (i) => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0);
const flat = (g) => g.flat();
const ROWS = Array.from({ length: 9 }, (_, r) => IDX.filter((i) => rowOf(i) === r));
const COLS = Array.from({ length: 9 }, (_, c) => IDX.filter((i) => colOf(i) === c));
const BOXES = Array.from({ length: 9 }, (_, b) => IDX.filter((i) => boxOf(i) === b));
const LINES = ROWS.concat(COLS);
const HOUSES = LINES.concat(BOXES);
const SEES = IDX.map((i) => IDX.filter((j) => j !== i
  && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i))));

// the sandwich total of a line in a completed grid, recomputed from scratch
function sandwichOf(line, g) {
  const p = line.findIndex((i) => g[i] === 1);
  const q = line.findIndex((i) => g[i] === 9);
  if (p < 0 || q < 0) return null;
  const [a, b] = p < q ? [p, q] : [q, p];
  let s = 0;
  for (let k = a + 1; k < b; k++) s += g[line[k]];
  return s;
}

// every set of `n` distinct digits from 2..8 totalling `sum`
function fillings(n, sum) {
  const out = [];
  const walk = (v, left, rem, acc) => {
    if (left === 0) { if (rem === 0) out.push(acc); return; }
    for (; v <= 8; v++) {
      if (v * left > rem) break;
      walk(v + 1, left - 1, rem - v, acc.concat(v));
    }
  };
  walk(2, n, sum, []);
  return out;
}

// ── the sandwich deduction, written independently ────────────────────────────
// Returns, per position in the line, the set of digits that survive: a digit
// survives only if SOME complete legal sandwich layout gives that position that
// digit. Layouts are enumerated over both crust positions, both orientations,
// and every filling that totals the clue.
function sandwichAllows(line, cand, sum) {
  const allow = Array.from({ length: 9 }, () => new Set());
  let any = false;
  for (let p = 0; p < 9; p++) {
    if (!cand[line[p]].has(1)) continue;
    for (let q = 0; q < 9; q++) {
      if (q === p || !cand[line[q]].has(9)) continue;
      const lo = Math.min(p, q), hi = Math.max(p, q);
      for (const fill of fillings(hi - lo - 1, sum)) {
        const inSet = new Set(fill);
        const outSet = new Set([2, 3, 4, 5, 6, 7, 8].filter((v) => !inSet.has(v)));
        const slots = [];
        for (let k = 0; k < 9; k++) {
          if (k === p || k === q) continue;
          slots.push([k, (k > lo && k < hi) ? inSet : outSet]);
        }
        const used = new Set();
        const per = Array.from({ length: 9 }, () => new Set());
        const deal = (idx) => {
          if (idx === slots.length) return true;
          const [k, pool] = slots[idx];
          let ok = false;
          for (const v of pool) {
            if (used.has(v) || !cand[line[k]].has(v)) continue;
            used.add(v);
            if (deal(idx + 1)) { per[k].add(v); ok = true; }
            used.delete(v);
          }
          return ok;
        };
        if (!deal(0)) continue;
        any = true;
        allow[p].add(1);
        allow[q].add(9);
        for (let k = 0; k < 9; k++) if (k !== p && k !== q) for (const v of per[k]) allow[k].add(v);
      }
    }
  }
  return any ? allow : null;
}

// ── independent counting solver ──────────────────────────────────────────────
// A different algorithm from the generator's, which propagates candidate sets
// and branches on the tightest cell. This one walks the grid cell by cell and
// tests the two lines the placement touches, using a bound that works on a
// PARTLY filled line: pick where the crusts could sit, add up the filling
// already down, and check the clue still sits between the cheapest and dearest
// the remaining holes could add. Without that bound (testing a line only when it
// closes) a six-given Sunday board does not finish in three minutes.
function lineFeasible(line, g, sum) {
  const vals = line.map((i) => g[i]);
  const p = vals.indexOf(1), q = vals.indexOf(9);
  const used = new Set(vals.filter((v) => v));
  const holesAt = [];
  for (let k = 0; k < 9; k++) if (!vals[k]) holesAt.push(k);
  const spots = (known) => (known >= 0 ? [known] : holesAt);
  const avail = [2, 3, 4, 5, 6, 7, 8].filter((v) => !used.has(v)).sort((x, y) => x - y);
  for (const a of spots(p)) {
    for (const b of spots(q)) {
      if (a === b) continue;
      const lo = Math.min(a, b), hi = Math.max(a, b);
      let fixed = 0, holes = 0, ok = true;
      for (let k = lo + 1; k < hi; k++) {
        const v = vals[k];
        if (v === 1 || v === 9) { ok = false; break; }   // a crust cannot sit inside the filling
        if (v) fixed += v; else holes++;
      }
      if (!ok || avail.length < holes) continue;
      let lowAdd = 0, highAdd = 0;
      for (let k = 0; k < holes; k++) { lowAdd += avail[k]; highAdd += avail[avail.length - 1 - k]; }
      if (fixed + lowAdd <= sum && sum <= fixed + highAdd) return true;
    }
  }
  return false;
}

function countSolutions(given, rowSums, colSums, cap) {
  const g = given.slice();
  const rowM = new Array(9).fill(0), colM = new Array(9).fill(0), boxM = new Array(9).fill(0);
  for (const i of IDX) if (g[i]) { rowM[rowOf(i)] |= 1 << g[i]; colM[colOf(i)] |= 1 << g[i]; boxM[boxOf(i)] |= 1 << g[i]; }
  let found = 0;
  const go = (i) => {
    if (found >= cap) return;
    if (i === 81) { found++; return; }
    if (g[i]) { go(i + 1); return; }
    const r = rowOf(i), c = colOf(i), b = boxOf(i);
    for (let v = 1; v <= 9; v++) {
      const bit = 1 << v;
      if ((rowM[r] & bit) || (colM[c] & bit) || (boxM[b] & bit)) continue;
      g[i] = v; rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit;
      if (lineFeasible(ROWS[r], g, rowSums[r]) && lineFeasible(COLS[c], g, colSums[c])) go(i + 1);
      g[i] = 0; rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit;
      if (found >= cap) return;
    }
  };
  go(0);
  return found;
}

// ── independent logical solver ───────────────────────────────────────────────
// Only justifiable moves, never a guess. `truth` is the known solution and is
// used ONLY to police the solver: any move that removes a true digit is an
// unsound rule, and is reported rather than quietly trusted.
function logicSolve(given, rowSums, colSums, truth) {
  const cand = IDX.map((i) => (given[i] ? new Set([given[i]]) : new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])));
  const unsound = [];
  const keepOnly = (i, allow, why) => {
    let moved = false;
    for (const v of [...cand[i]]) {
      if (allow.has(v)) continue;
      if (truth[i] === v) unsound.push(`${why} removed the true digit ${v} from r${rowOf(i) + 1}c${colOf(i) + 1}`);
      cand[i].delete(v);
      moved = true;
    }
    return moved;
  };
  const done = (i) => cand[i].size === 1;

  for (let pass = 0; pass < 600; pass++) {
    let moved = false;
    for (let L = 0; L < 18; L++) {
      const sum = L < 9 ? rowSums[L] : colSums[L - 9];
      const allow = sandwichAllows(LINES[L], cand, sum);
      if (!allow) return { stuck: true, unsound };
      for (let k = 0; k < 9; k++) moved = keepOnly(LINES[L][k], allow[k], 'sandwich rule') || moved;
    }
    for (const i of IDX) {
      if (!cand[i].size) return { stuck: true, unsound };
      if (!done(i)) continue;
      const v = [...cand[i]][0];
      for (const j of SEES[i]) if (cand[j].has(v)) moved = keepOnly(j, new Set([...cand[j]].filter((x) => x !== v)), 'naked single') || moved;
    }
    for (const h of HOUSES) {
      for (let v = 1; v <= 9; v++) {
        if (h.some((i) => done(i) && [...cand[i]][0] === v)) continue;
        const spots = h.filter((i) => cand[i].has(v));
        if (!spots.length) return { stuck: true, unsound };
        if (spots.length === 1 && !done(spots[0])) moved = keepOnly(spots[0], new Set([v]), 'hidden single') || moved;
      }
    }
    if (IDX.every((i) => done(i))) return { grid: IDX.map((i) => [...cand[i]][0]), unsound };
    if (!moved) return { stuck: true, unsound };
  }
  return { stuck: true, unsound };
}

// ── the sweep ────────────────────────────────────────────────────────────────
const GIVENS = { 1: 20, 2: 18, 3: 16, 4: 14, 5: 12, 6: 10, 0: 6 };
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

let bad = 0;
const seenGiven = new Set(), seenSol = new Set(), seenId = new Set();
const sundayClues = [], weekdayClues = [];

PUZZLES.forEach((p, n) => {
  const id = p.quizId || `#${p.num}`;
  const errs = [];
  const push = (m) => errs.push(m);

  if (p.num !== n + 1) push(`num is ${p.num}, expected ${n + 1}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '')) push('live is not an ISO date');
  if (seenId.has(id)) push('duplicate quizId'); else seenId.add(id);
  const d = new Date(`${p.live}T12:00:00Z`);
  const [y, m, dd] = p.live.split('-').map(Number);
  if (p.quizId !== `sando-${m}-${dd}-${String(y).slice(2)}`) push(`quizId does not match live (${p.quizId})`);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${dd}, ${y}`) push(`dateLabel does not match live (${p.dateLabel})`);
  if (n > 0) {
    const prev = new Date(`${PUZZLES[n - 1].live}T12:00:00Z`);
    if (d - prev !== 86400000) push(`date is not the day after ${PUZZLES[n - 1].live}`);
  }

  const given = flat(p.given);
  const sol = flat(p.sol);

  for (const h of HOUSES) if (new Set(h.map((i) => sol[i])).size !== 9) push('sol is not a legal sudoku grid');

  if (!Array.isArray(p.rowSums) || p.rowSums.length !== 9) push('rowSums is not nine values');
  if (!Array.isArray(p.colSums) || p.colSums.length !== 9) push('colSums is not nine values');
  if (!errs.length) {
    for (let k = 0; k < 9; k++) {
      for (const [which, arr, line] of [['row', p.rowSums, ROWS[k]], ['column', p.colSums, COLS[k]]]) {
        const s = arr[k];
        if (!Number.isInteger(s) || s < 0 || s > 35) { push(`${which} ${k + 1} sum ${s} is out of range`); continue; }
        const real = sandwichOf(line, sol);
        if (s !== real) push(`${which} ${k + 1} prints ${s} but its sandwich totals ${real}`);
      }
    }
  }

  let printed = 0;
  for (const i of IDX) {
    if (!given[i]) continue;
    printed++;
    if (given[i] !== sol[i]) push(`printed digit at r${rowOf(i) + 1}c${colOf(i) + 1} is not the answer`);
  }
  if (p.clues !== printed) push(`clues says ${p.clues}, ${printed} digits are printed`);

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); return; }

  const count = countSolutions(given, p.rowSums, p.colSums, 2);
  if (count !== 1) push(count === 0 ? 'has NO solution' : 'has more than one solution');

  const r = logicSolve(given, p.rowSums, p.colSums, sol);
  if (r.unsound.length) push(`UNSOUND deduction: ${r.unsound[0]}`);
  if (r.stuck) push('does not solve with the sandwich rule and singles: it would need a guess');
  else if (r.grid.join('') !== sol.join('')) push('the logical line reaches a different grid than sol');

  const dow = d.getUTCDay();
  if (printed !== GIVENS[dow]) push(`${DOW[dow]} should print ${GIVENS[dow]} digits, prints ${printed}`);
  if (p.sunday !== (dow === 0)) push(p.sunday ? `flagged Sunday but falls on ${DOW[dow]}` : 'falls on a Sunday but is not flagged');
  (dow === 0 ? sundayClues : weekdayClues).push(printed);

  const gk = given.join(''), sk = sol.join('');
  if (seenGiven.has(gk)) push('clue grid already used earlier in the bank');
  if (seenSol.has(sk)) push('solution grid already used earlier in the bank');
  seenGiven.add(gk); seenSol.add(sk);

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); }
});

if (sundayClues.length && weekdayClues.length) {
  const richestSunday = Math.max(...sundayClues);
  const thinnestWeekday = Math.min(...weekdayClues);
  if (richestSunday >= thinnestWeekday) {
    bad++;
    console.error(`✗ Sunday Edition does not cut: richest Sunday prints ${richestSunday}, thinnest weekday prints ${thinnestWeekday}`);
  }
}
if (!sundayClues.length) { bad++; console.error('✗ bank contains no Sunday Edition'); }

if (bad) { console.error(`\n${bad} problem(s)`); process.exit(1); }
const last = PUZZLES[PUZZLES.length - 1];
console.log(`✓ ${PUZZLES.length} Sando boards verified: ${PUZZLES[0].live} to ${last.live}`);
console.log(`  one solution and a guess-free logical line on every board, from the sandwich rule and singles alone`);
console.log(`  all eighteen border sums on every board, weekday ${Math.min(...weekdayClues)}-${Math.max(...weekdayClues)} printed digits, Sunday ${Math.min(...sundayClues)} (${sundayClues.length} Editions)`);
console.log(`  ${seenGiven.size} distinct clue grids, ${seenSol.size} distinct solutions`);
