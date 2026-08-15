// Verify the Sixes bank (the daily 6x6 mini sudoku).
//
//   node scripts/verify-sixes.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. Per the daily puzzle authoring
// standard in CLAUDE.md, a checker that reads a stored field and prints it has
// verified nothing. So NOTHING is imported from scripts/sixes-core.mjs, the
// engine that built the bank: the solvers are written out again here, with
// different data structures and a different search order. Sharing them would
// mean a bug in the generator's solver certifies its own output as correct,
// which is not hypothetical on this codebase (Cages shipped an unsound
// hidden-pair rule, and Sando's generator once reported a three-solution board
// as solved). A shared copy agrees with its own bugs by construction.
//
//   - the counting solver here walks cells in plain index order against
//     row/column/box bitmasks, where the generator's picks the most-constrained
//     cell each time.
//   - the logical solver here works on arrays of candidate Sets, where the
//     generator's works on integer bitmasks. Every digit it places is checked
//     against `sol` before it is accepted, so an unsound rule cannot certify
//     itself even if both implementations shared the same mistake.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous and ISO, dateLabel
//               agreeing with `live`, quizId of the form sixes-M-D-YY derived
//               from `live`, no duplicate ids, no gaps or repeats in the run.
//   Solution    `sol` is a legal filling: every row, column and 2x3 box holds
//               1-6 exactly once.
//   Givens      every printed digit equals `sol` in that square, and `clues`
//               equals the number actually printed.
//   Uniqueness  EXACTLY one solution, from the independent counting solver.
//   No guessing the board also falls to the independent logical solver, limited
//               to naked singles, hidden singles, locked candidates and pairs.
//               Uniqueness alone does not make a board humanly solvable.
//   Grade       `level` and `cost` recomputed from that solve and required to
//               match what is stored, digit for digit.
//   Ramp        `cost` sits inside the documented band for that board's real
//               weekday. A floor is not a target, so the day pins the value.
//   Sunday      the flag lands on real Sundays and nowhere else, and EVERY
//               Sunday board costs more than EVERY weekday board. A Sunday
//               Edition whose knob does not actually grow is not one.
//   Symmetry    the clue pattern is unchanged by a 180-degree rotation.
//   Minimality  no symmetric PAIR of clues can be removed with one solution
//               left. (Pair-minimal, not cell-minimal: symmetry is worth a few
//               individually-redundant clues, and `cost` grades the solve the
//               printed board actually gives, so nothing is hidden by it.)
//   Variety     no clue pattern and no solution grid repeats anywhere in the
//               bank, and consecutive boards share at most one printed digit in
//               the same square.
//   Runway      how many days of bank are left, as a note.
//
// IS ANY OF THAT ACTUALLY WIRED UP? `node scripts/sixes-mutation-test.mjs`
// breaks the shipped bank fifteen ways in turn and requires this file to fail
// on every one and pass on the untouched bank. Run it after editing anything
// here. It has already earned its keep: the symmetry check had never once been
// exercised, because the mutation meant to break symmetry was a no-op.
import { PUZZLES } from '../app/sixes/puzzles.js';

// A dated floor so a future rule change can be applied to FUTURE boards without
// rewriting days that have already been played. Nothing predates the launch
// today, so it currently gates nothing; it is here so the next rule has an
// obvious place to hang. See "the past is frozen" in CLAUDE.md.
const RULES_FROM = '2026-08-14';

const N = 6;
const CELLS = 36;
const rowOf = (i) => (i / N) | 0;
const colOf = (i) => i % N;
const boxOf = (i) => (((rowOf(i) / 2) | 0) * 2) + ((colOf(i) / 3) | 0);
const DIGITS = [1, 2, 3, 4, 5, 6];

// Units in a FIXED, documented order: rows 0-5, then columns 0-5, then boxes
// 0-5. The logical solver's tie-breaking depends on this order, and so does the
// generator's, which is what makes `cost` reproducible rather than an artifact.
const UNITS = [];
for (let r = 0; r < N; r++) UNITS.push([...Array(CELLS).keys()].filter((i) => rowOf(i) === r));
for (let c = 0; c < N; c++) UNITS.push([...Array(CELLS).keys()].filter((i) => colOf(i) === c));
for (let b = 0; b < N; b++) UNITS.push([...Array(CELLS).keys()].filter((i) => boxOf(i) === b));
const PEERS = [...Array(CELLS).keys()].map((i) =>
  [...new Set(UNITS.filter((u) => u.includes(i)).flat())].filter((j) => j !== i));

// ─── independent counting solver: bitmasks, plain index order ──────────────
// Returns the number of solutions, capped at `cap`, or -1 when two printed
// clues already contradict each other.
function countSolutions(board, cap = 2) {
  const g = board.slice();
  const rowM = new Array(N).fill(0);
  const colM = new Array(N).fill(0);
  const boxM = new Array(N).fill(0);
  for (let i = 0; i < CELLS; i++) {
    const d = g[i];
    if (!d) continue;
    const bit = 1 << d;
    if ((rowM[rowOf(i)] & bit) || (colM[colOf(i)] & bit) || (boxM[boxOf(i)] & bit)) return -1;
    rowM[rowOf(i)] |= bit; colM[colOf(i)] |= bit; boxM[boxOf(i)] |= bit;
  }
  let found = 0;
  const rec = (start) => {
    if (found >= cap) return;
    let i = start;
    while (i < CELLS && g[i]) i++;
    if (i === CELLS) { found++; return; }
    const r = rowOf(i); const c = colOf(i); const b = boxOf(i);
    for (const d of DIGITS) {
      const bit = 1 << d;
      if ((rowM[r] | colM[c] | boxM[b]) & bit) continue;
      rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit;
      g[i] = d;
      rec(i + 1);
      g[i] = 0;
      rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit;
      if (found >= cap) return;
    }
  };
  rec(0);
  return found;
}

// ─── independent logical solver: candidate Sets, one step per pass ─────────
// The policy, which the generator states and this reimplements: each pass makes
// exactly ONE move, the easiest available, scanning in the fixed order above.
// Weights are naked 1, hidden 4, locked 12, pairs 20, and `cost` is their sum.
// Every placement is checked against `sol`, so an unsound rule fails loudly
// here instead of quietly certifying a broken board.
const WEIGHT = { naked: 1, hidden: 4, locked: 12, pairs: 20 };

function logicalSolve(given, sol) {
  const cand = [...Array(CELLS)].map(() => new Set(DIGITS));
  const val = new Array(CELLS).fill(0);
  const steps = { naked: 0, hidden: 0, locked: 0, pairs: 0 };
  let hardest = 1;
  let unsound = null;

  const place = (i, d) => {
    if (sol[i] !== d) { unsound = `logical solver placed ${d} at ${i} where the solution has ${sol[i]}`; return false; }
    val[i] = d; cand[i].clear();
    for (const p of PEERS[i]) cand[p].delete(d);
    return true;
  };
  for (let i = 0; i < CELLS; i++) if (given[i] && !place(i, given[i])) return { unsound };

  const open = (u) => u.filter((i) => !val[i]);
  const spotsFor = (u, d) => (u.some((i) => val[i] === d) ? null : open(u).filter((i) => cand[i].has(d)));

  for (let guard = 0; guard < 600; guard++) {
    if (val.every((v) => v)) {
      return { solved: true, level: hardest, cost: Object.keys(steps).reduce((a, k) => a + steps[k] * WEIGHT[k], 0), steps };
    }
    for (let i = 0; i < CELLS; i++) if (!val[i] && cand[i].size === 0) return { solved: false, reason: `square ${i} ran out of candidates` };
    let did = false;

    // 1 naked single
    for (let i = 0; i < CELLS && !did; i++) {
      if (!val[i] && cand[i].size === 1) {
        if (!place(i, [...cand[i]][0])) return { unsound };
        steps.naked++; did = true;
      }
    }
    if (did) continue;

    // 2 hidden single
    for (const u of UNITS) {
      for (const d of DIGITS) {
        const s = spotsFor(u, d);
        if (!s || s.length !== 1) continue;
        if (!place(s[0], d)) return { unsound };
        steps.hidden++; hardest = Math.max(hardest, 2); did = true;
        break;
      }
      if (did) break;
    }
    if (did) continue;

    // 3a pointing: a digit confined to one line inside a box leaves that line
    for (let b = 0; b < N && !did; b++) {
      const box = UNITS[12 + b];
      for (const d of DIGITS) {
        const s = spotsFor(box, d);
        if (!s || s.length < 2) continue;
        const rows = new Set(s.map(rowOf));
        const cols = new Set(s.map(colOf));
        let cut = false;
        if (rows.size === 1) {
          for (const i of UNITS[[...rows][0]]) if (!box.includes(i) && !val[i] && cand[i].delete(d)) cut = true;
        }
        if (!cut && cols.size === 1) {
          for (const i of UNITS[6 + [...cols][0]]) if (!box.includes(i) && !val[i] && cand[i].delete(d)) cut = true;
        }
        if (cut) { steps.locked++; hardest = Math.max(hardest, 3); did = true; break; }
      }
    }
    if (did) continue;

    // 3b box/line reduction: a digit confined to one box inside a line
    for (let k = 0; k < 12 && !did; k++) {
      const line = UNITS[k];
      for (const d of DIGITS) {
        const s = spotsFor(line, d);
        if (!s || s.length < 2) continue;
        const boxes = new Set(s.map(boxOf));
        if (boxes.size !== 1) continue;
        let cut = false;
        for (const i of UNITS[12 + [...boxes][0]]) if (!line.includes(i) && !val[i] && cand[i].delete(d)) cut = true;
        if (cut) { steps.locked++; hardest = Math.max(hardest, 3); did = true; break; }
      }
    }
    if (did) continue;

    // 4a naked pair
    for (const u of UNITS) {
      const o = open(u);
      for (let a = 0; a < o.length && !did; a++) {
        if (cand[o[a]].size !== 2) continue;
        const key = [...cand[o[a]]].sort().join('');
        for (let b = a + 1; b < o.length && !did; b++) {
          if (cand[o[b]].size !== 2 || [...cand[o[b]]].sort().join('') !== key) continue;
          let cut = false;
          for (const i of o) {
            if (i === o[a] || i === o[b]) continue;
            for (const d of cand[o[a]]) if (cand[i].delete(d)) cut = true;
          }
          if (cut) { steps.pairs++; hardest = Math.max(hardest, 4); did = true; }
        }
      }
      if (did) break;
    }
    if (did) continue;

    // 4b hidden pair
    for (const u of UNITS) {
      const where = {};
      for (const d of DIGITS) where[d] = spotsFor(u, d);
      for (const d1 of DIGITS) {
        if (did) break;
        if (!where[d1] || where[d1].length !== 2) continue;
        for (const d2 of DIGITS) {
          if (d2 <= d1 || !where[d2] || where[d2].length !== 2) continue;
          if (where[d1][0] !== where[d2][0] || where[d1][1] !== where[d2][1]) continue;
          let cut = false;
          for (const i of where[d1]) {
            for (const d of [...cand[i]]) if (d !== d1 && d !== d2 && cand[i].delete(d)) cut = true;
          }
          if (cut) { steps.pairs++; hardest = Math.max(hardest, 4); did = true; break; }
        }
      }
      if (did) break;
    }
    if (did) continue;

    return { solved: false, reason: 'stuck: would need a technique past pairs, or a guess' };
  }
  return { solved: false, reason: 'logical solver hit its step guard' };
}

// ─── the weekday cost bands, restated here rather than imported ────────────
const BANDS = { 0: [56, 999], 1: [0, 22], 2: [23, 25], 3: [26, 30], 4: [31, 36], 5: [37, 43], 6: [44, 52] };
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let bad = 0;
const notes = [];
const seenGiven = new Set();
const seenSol = new Set();
const seenId = new Set();
const sundayCost = [];
const weekdayCost = [];
let prevGiven = null;
let prevDate = null;

if (!Array.isArray(PUZZLES) || !PUZZLES.length) {
  console.error('✗ the bank is empty');
  process.exit(1);
}

PUZZLES.forEach((p, n) => {
  const id = `#${p.num} ${p.live}`;
  const errs = [];
  const push = (m) => errs.push(m);

  // ── shape ──
  if (p.num !== n + 1) push(`num is ${p.num}, expected ${n + 1}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '')) push('live is not an ISO date');
  const d = new Date(`${p.live}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) { console.error(`✗ ${id}: unparseable live date`); bad++; return; }
  const dow = d.getUTCDay();
  if (prevDate && d.getTime() - prevDate !== 86400000) push('the run of dates is not contiguous');
  prevDate = d.getTime();
  const wantId = `sixes-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantId) push(`quizId is ${p.quizId}, expected ${wantId}`);
  if (seenId.has(p.quizId)) push('duplicate quizId');
  seenId.add(p.quizId);
  const wantLabel = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) push(`dateLabel is "${p.dateLabel}", expected "${wantLabel}"`);

  // ── grids ──
  if (!Array.isArray(p.given) || p.given.length !== N || p.given.some((r) => !Array.isArray(r) || r.length !== N)) push('given is not 6x6');
  if (!Array.isArray(p.sol) || p.sol.length !== N || p.sol.some((r) => !Array.isArray(r) || r.length !== N)) push('sol is not 6x6');
  if (errs.length) { console.error(`✗ ${id}: ${errs.join('; ')}`); bad++; return; }

  const given = p.given.flat();
  const sol = p.sol.flat();
  for (let i = 0; i < CELLS; i++) {
    if (!Number.isInteger(sol[i]) || sol[i] < 1 || sol[i] > N) { push(`sol[${i}] is not a digit 1-6`); break; }
    if (!Number.isInteger(given[i]) || given[i] < 0 || given[i] > N) { push(`given[${i}] is not 0-6`); break; }
    if (given[i] && given[i] !== sol[i]) { push(`the clue at square ${i} contradicts the solution`); break; }
  }
  for (let u = 0; u < UNITS.length && !errs.length; u++) {
    const seen = new Set(UNITS[u].map((i) => sol[i]));
    if (seen.size !== N) push(`the solution does not hold 1-6 exactly once in unit ${u}`);
  }
  if (errs.length) { console.error(`✗ ${id}: ${errs.join('; ')}`); bad++; return; }

  // ── clue count, symmetry ──
  const clues = given.reduce((a, v) => a + (v ? 1 : 0), 0);
  if (p.clues !== clues) push(`clues says ${p.clues}, the board prints ${clues}`);
  const symmetric = given.every((v, i) => !!v === !!given[CELLS - 1 - i]);
  if (!symmetric && p.live >= RULES_FROM) push('the clue pattern is not symmetric under a 180-degree rotation');

  // ── uniqueness ──
  const nSol = countSolutions(given, 2);
  if (nSol === -1) push('two printed clues already clash');
  else if (nSol !== 1) push(nSol === 0 ? 'the clues admit no solution' : 'the clues admit more than one solution');

  // ── pair-minimality ──
  if (nSol === 1) {
    for (let i = 0; i < CELLS / 2; i++) {
      const a = i; const b = CELLS - 1 - i;
      if (!given[a] && !given[b]) continue;
      const t = given.slice(); t[a] = 0; t[b] = 0;
      if (countSolutions(t, 2) === 1) { push(`the clue pair at ${a}/${b} is doing no work: the board is still unique without it`); break; }
    }
  }

  // ── the logical solve, and the grade recomputed from it ──
  const r = logicalSolve(given, sol);
  if (r.unsound) push(`UNSOUND: ${r.unsound}`);
  else if (!r.solved) push(`no guess-free logical line: ${r.reason}`);
  else {
    if (r.level !== p.level) push(`level says ${p.level}, the solve needs ${r.level}`);
    if (r.cost !== p.cost) push(`cost says ${p.cost}, the solve recomputes to ${r.cost}`);
    const band = BANDS[dow];
    if (r.cost < band[0] || r.cost > band[1]) push(`${DAY[dow]} wants cost ${band[0]}-${band[1] === 999 ? '∞' : band[1]}, this board is ${r.cost}`);
    if (dow === 0) sundayCost.push(r.cost); else weekdayCost.push(r.cost);
  }

  // ── Sunday flag ──
  if (!!p.sunday !== (dow === 0)) push(`sunday is ${!!p.sunday} on a ${DAY[dow]}`);

  // ── variety ──
  const pat = given.map((v) => (v ? 1 : 0)).join('');
  const sk = sol.join('');
  if (seenGiven.has(pat)) push('this clue pattern already appears earlier in the bank');
  if (seenSol.has(sk)) push('this solution grid already appears earlier in the bank');
  seenGiven.add(pat); seenSol.add(sk);
  if (prevGiven) {
    const echo = given.reduce((a, v, i) => a + (v && v === prevGiven[i] ? 1 : 0), 0);
    if (echo > 1 && p.live >= RULES_FROM) push(`${echo} printed digits sit exactly where they sat yesterday, at most 1 is allowed`);
  }
  prevGiven = given;

  if (errs.length) { bad++; console.error(`✗ ${id}: ${errs.join('; ')}`); }
});

// ─── bank-wide ──────────────────────────────────────────────────────────────
if (!sundayCost.length) { bad++; console.error('✗ the bank contains no Sunday Edition'); }
if (sundayCost.length && weekdayCost.length) {
  const easiestSunday = Math.min(...sundayCost);
  const hardestWeekday = Math.max(...weekdayCost);
  if (easiestSunday <= hardestWeekday) {
    bad++;
    console.error(`✗ the Sunday Edition does not step up: the easiest Sunday costs ${easiestSunday}, the hardest weekday ${hardestWeekday}`);
  }
}
const last = PUZZLES[PUZZLES.length - 1];
const today = new Date().toISOString().slice(0, 10);
const runway = Math.round((new Date(`${last.live}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
if (runway < 30) notes.push(`… only ${runway} days of bank left (through ${last.live}); rebuild before it runs dry`);

for (const nline of notes) console.log(nline);
if (bad) { console.error(`\n${bad} problem(s)`); process.exit(1); }

const costs = PUZZLES.map((p) => p.cost);
const levels = {};
for (const p of PUZZLES) levels[p.level] = (levels[p.level] || 0) + 1;
console.log(`✓ ${PUZZLES.length} Sixes boards verified: ${PUZZLES[0].live} to ${last.live} (${runway} days of runway)`);
console.log('  exactly one solution and a guess-free logical line on every board, from an independent solver');
console.log(`  cost ${Math.min(...costs)}-${Math.max(...costs)} inside the weekday bands, clues ${Math.min(...PUZZLES.map((p) => p.clues))}-${Math.max(...PUZZLES.map((p) => p.clues))}, techniques ${Object.keys(levels).sort().map((l) => `L${l}:${levels[l]}`).join(' ')}`);
console.log(`  ${sundayCost.length} Sunday Editions at cost ${Math.min(...sundayCost)}-${Math.max(...sundayCost)}, above every weekday board (hardest ${Math.max(...weekdayCost)})`);
console.log(`  every clue pattern 180-symmetric and pair-minimal, ${seenGiven.size} distinct patterns, ${seenSol.size} distinct solutions`);
