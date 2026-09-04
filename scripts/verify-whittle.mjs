#!/usr/bin/env node
// verify-whittle — prove the Whittle bank (app/whittle/puzzles.js).
//
//   node scripts/verify-whittle.mjs
//
// WHY A SECOND ENGINE, WRITTEN FROM SCRATCH. lib/whittle-core.js is what BUILT
// this bank and it is also what the browser judges the player's taps with, so a
// checker that imported it could only ever agree with itself. Per the daily
// puzzle authoring standard this file shares NOTHING with it, and the two
// halves are deliberately different shapes:
//
//   the core             counts solutions MRV-first over integer bitmasks by
//                        trying digits in squares, and walks the removal graph
//                        by recursion, memoised on a packed 36-bit signature.
//   this file            does not think about digits and squares at all. It
//                        restates the board as an EXACT COVER problem — 144
//                        constraints, 216 candidate placements, each covering
//                        four of them — and counts the covers with Knuth's
//                        dancing links. Then it walks the removal graph as a
//                        breadth-first sweep layered by clue count, folded back
//                        bottom-up with no recursion at all.
//
// Two solvers that disagree are the point of having two. These share no
// representation, no search order and no termination rule, so an error in one
// has no way to be an error in the other.
//
// WHAT IS PROVED, per board, recomputed and never read off the bank:
//   Shape       36 cells, sol is a complete legal 6x6 grid in 2x3 boxes, every
//               printed clue agrees with sol, `clues` is the real count and is
//               eighteen.
//   Unique      the printed board has exactly one solution. Whittle's whole
//               premise is that it starts legal and every tap keeps it legal,
//               so a start that is already ambiguous is a dead board.
//   Perfect     `perfect` recomputed EXHAUSTIVELY over every position the board
//               can reach, and required to match. This is the number shown to
//               the player as the target, so it is not allowed to be a search
//               mark that happened to be good enough.
//   Reachable   a real removal order down to `perfect` is replayed one clue at
//               a time, each step re-checked for uniqueness by this file's own
//               counter. Enumerating the graph and achieving the floor are two
//               different claims and both are made.
//   Forgive     `forgive` recomputed exactly and required to match within 1,
//               which is float slack in the averaging and nothing more.
//   Ramp        forgive sits in the pinned weekday band: Mon 500-880,
//               Tue 380-499, Wed 280-379, Thu 200-279, Fri 130-199, Sat 61-129,
//               Sunday 0-60.
//   Length      at least six clues are loose in every board, so no day is over
//               before it starts.
//   Sunday      sunday:true exactly on real Sundays.
//   Dates       contiguous days, num sequential from 1, quizId matching live.
//   Variety     no solution grid and no clue pattern repeats anywhere in the
//               bank, and a board echoes at most one printed digit-in-square
//               from the day before.
//   Runway      how many days of bank are left, as a note.
//
// Mutation-tested by scripts/whittle-mutation-test.mjs (set VERIFY_WHITTLE_BANK
// to point this file at a mutated copy).
const BANK = process.env.VERIFY_WHITTLE_BANK
  ? `file://${process.env.VERIFY_WHITTLE_BANK}`
  : new URL('../app/whittle/puzzles.js', import.meta.url).href;
const { PUZZLES } = await import(BANK);

const fails = [];
const note = [];
const START_CLUES = 18;
const MIN_REMOVALS = 6;
// forgive bands, keyed by day of week. Restated here rather than imported: a
// ramp a checker reads out of the code it is checking is not a check.
const BAND = { 1: [500, 880], 2: [380, 499], 3: [280, 379], 4: [200, 279], 5: [130, 199], 6: [61, 129], 0: [0, 60] };
const DOW_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dowOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const addDays = (iso, n) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);

// ─── geometry, derived here rather than imported ───────────────────────────
const SIDE = 6;
const CELLS = 36;
const unitsOf = () => {
  const u = [];
  for (let r = 0; r < SIDE; r++) u.push([...Array(SIDE)].map((_, c) => r * SIDE + c));
  for (let c = 0; c < SIDE; c++) u.push([...Array(SIDE)].map((_, r) => r * SIDE + c));
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 2; bc++) {
      const cells = [];
      for (let r = br * 2; r < br * 2 + 2; r++) for (let c = bc * 3; c < bc * 3 + 3; c++) cells.push(r * SIDE + c);
      u.push(cells);
    }
  }
  return u;
};
const UNITS = unitsOf();
const clues = (flat) => flat.reduce((n, v) => n + (v ? 1 : 0), 0);

// ─── solution counter: exact cover, by dancing links ───────────────────────
// The board is restated as a matrix. A COLUMN is a thing that must happen
// exactly once, and there are 144 of them: each of the 36 squares holds a
// digit, each of the 6 rows holds each of the 6 digits, likewise each column
// and each box. A ROW of the matrix is one candidate placement, "digit d in
// square i", and it satisfies exactly four columns. A solution to the board is
// a set of matrix rows covering every column exactly once, so counting
// solutions is counting exact covers, and Knuth's links do that by unhooking
// and re-hooking nodes in place rather than by copying any state at all.
//
// The matrix is built ONCE and reused: a run leaves it exactly as it found it,
// which is what makes this cheap enough to call a hundred thousand times.
const NCOL = 144;
const NROW = CELLS * 6;                       // (square, digit)
const HEAD = NCOL + 4 * NROW;                 // the root, after every node
const SZ = new Int32Array(NCOL);
const L = new Int32Array(HEAD + 1); const R = new Int32Array(HEAD + 1);
const UP = new Int32Array(HEAD + 1); const DN = new Int32Array(HEAD + 1);
const CO = new Int32Array(HEAD + 1); const RW = new Int32Array(HEAD + 1);
const colsOfPlacement = (i, d) => {
  const r = Math.floor(i / SIDE); const c = i % SIDE;
  const b = Math.floor(r / 2) * 2 + Math.floor(c / 3);
  return [i, 36 + r * 6 + (d - 1), 72 + c * 6 + (d - 1), 108 + b * 6 + (d - 1)];
};
(function buildMatrix() {
  for (let c = 0; c < NCOL; c++) { L[c] = c - 1; R[c] = c + 1; UP[c] = c; DN[c] = c; CO[c] = c; SZ[c] = 0; }
  L[0] = HEAD; R[NCOL - 1] = HEAD; R[HEAD] = 0; L[HEAD] = NCOL - 1;
  for (let i = 0; i < CELLS; i++) {
    for (let d = 1; d <= 6; d++) {
      const row = i * 6 + (d - 1);
      const cols = colsOfPlacement(i, d);
      const base = NCOL + 4 * row;
      for (let k = 0; k < 4; k++) {
        const n = base + k;
        const c = cols[k];
        RW[n] = row; CO[n] = c;
        L[n] = base + ((k + 3) % 4); R[n] = base + ((k + 1) % 4);
        UP[n] = UP[c]; DN[n] = c; DN[UP[c]] = n; UP[c] = n; SZ[c]++;
      }
    }
  }
}());
const cover = (c) => {
  R[L[c]] = R[c]; L[R[c]] = L[c];
  for (let i = DN[c]; i !== c; i = DN[i]) {
    for (let j = R[i]; j !== i; j = R[j]) { DN[UP[j]] = DN[j]; UP[DN[j]] = UP[j]; SZ[CO[j]]--; }
  }
};
const uncover = (c) => {
  for (let i = UP[c]; i !== c; i = UP[i]) {
    for (let j = L[i]; j !== i; j = L[j]) { SZ[CO[j]]++; DN[UP[j]] = j; UP[DN[j]] = j; }
  }
  R[L[c]] = c; L[R[c]] = c;
};

function countSolutions(flat, cap = 2) {
  // A clue set that already contradicts itself covers a column twice and would
  // corrupt the shared matrix, so it is turned away before anything is touched.
  for (const u of UNITS) {
    const seen = new Set();
    for (const i of u) { if (!flat[i]) continue; if (seen.has(flat[i])) return 0; seen.add(flat[i]); }
  }
  const undo = [];
  for (let i = 0; i < CELLS; i++) {
    if (!flat[i]) continue;
    for (const c of colsOfPlacement(i, flat[i])) { cover(c); undo.push(c); }
  }
  let found = 0;
  const search = () => {
    if (R[HEAD] === HEAD) { found++; return; }
    let best = -1; let bestN = 1 << 30;
    for (let c = R[HEAD]; c !== HEAD; c = R[c]) { if (SZ[c] < bestN) { bestN = SZ[c]; best = c; if (!bestN) break; } }
    if (bestN === 0) return;
    cover(best);
    for (let i = DN[best]; i !== best; i = DN[i]) {
      for (let j = R[i]; j !== i; j = R[j]) cover(CO[j]);
      search();
      for (let j = L[i]; j !== i; j = L[j]) uncover(CO[j]);
      if (found >= cap) break;
    }
    uncover(best);
  };
  search();
  for (let k = undo.length - 1; k >= 0; k--) uncover(undo[k]);
  return found;
}

const legalRemovals = (flat) => {
  const out = [];
  for (let i = 0; i < CELLS; i++) {
    if (!flat[i]) continue;
    const t = flat.slice();
    t[i] = 0;
    if (countSolutions(t, 2) === 1) out.push(i);
  }
  return out;
};

// ─── the removal graph, swept breadth-first and folded bottom-up ───────────
// Layer k holds every position reachable with k clues taken out, so a position
// in layer k can only ever have children in layer k+1. That means the whole
// graph can be built forwards without recursion, and then `best` and the
// forgiveness probability folded back from the deepest layer upwards, with
// every child already settled by the time its parent is read.
function walk(start) {
  const key = (flat) => flat.map((v) => (v ? '1' : '0')).join('');
  const grid = new Map();        // key -> flat
  const kids = new Map();        // key -> [child keys], in ascending cell index
  let layer = [key(start)];
  grid.set(layer[0], start.slice());
  const layers = [layer];
  while (layer.length) {
    const next = new Map();
    for (const k of layer) {
      const g = grid.get(k);
      const ch = [];
      for (const i of legalRemovals(g)) {
        const t = g.slice();
        t[i] = 0;
        const ck = key(t);
        if (!grid.has(ck)) grid.set(ck, t);
        if (!next.has(ck)) next.set(ck, true);
        ch.push(ck);
      }
      kids.set(k, ch);
    }
    layer = [...next.keys()];
    if (layer.length) layers.push(layer);
  }
  const best = new Map();
  const prob = new Map();
  let perfect = Infinity;
  for (let L = layers.length - 1; L >= 0; L--) {
    for (const k of layers[L]) {
      const ch = kids.get(k);
      if (!ch.length) { best.set(k, clues(grid.get(k))); continue; }
      let b = clues(grid.get(k));
      for (const ck of ch) { const v = best.get(ck); if (v < b) b = v; }
      best.set(k, b);
    }
  }
  perfect = best.get(layers[0][0]);
  for (let L = layers.length - 1; L >= 0; L--) {
    for (const k of layers[L]) {
      const ch = kids.get(k);
      if (!ch.length) { prob.set(k, clues(grid.get(k)) === perfect ? 1 : 0); continue; }
      let sum = 0;
      for (const ck of ch) sum += prob.get(ck);
      prob.set(k, sum / ch.length);
    }
  }
  // a real order down to the floor, to be replayed as a separate claim
  const line = [];
  let cur = layers[0][0];
  while (kids.get(cur).length) {
    const nextK = kids.get(cur).find((ck) => best.get(ck) === perfect);
    const a = grid.get(cur); const b = grid.get(nextK);
    line.push(a.findIndex((v, i) => v && !b[i]));
    cur = nextK;
  }
  return {
    perfect,
    forgive: Math.round(prob.get(layers[0][0]) * 1000),
    states: grid.size,
    line,
  };
}

// ─── per board ─────────────────────────────────────────────────────────────
const flatten = (g) => (Array.isArray(g[0]) ? g.flat() : g.slice());
const seenSol = new Set();
const seenPattern = new Set();
let prevGiven = null;
let totalStates = 0;
const t0 = Date.now();

PUZZLES.forEach((p, idx) => {
  const at = `#${p.num} ${p.live}`;
  const given = flatten(p.given);
  const sol = flatten(p.sol);

  if (given.length !== CELLS) { fails.push(`${at}: given is ${given.length} cells`); return; }
  if (sol.length !== CELLS) { fails.push(`${at}: sol is ${sol.length} cells`); return; }
  for (let i = 0; i < CELLS; i++) {
    if (!Number.isInteger(sol[i]) || sol[i] < 1 || sol[i] > SIDE) { fails.push(`${at}: sol[${i}] out of range`); return; }
    if (!Number.isInteger(given[i]) || given[i] < 0 || given[i] > SIDE) { fails.push(`${at}: given[${i}] out of range`); return; }
    if (given[i] && given[i] !== sol[i]) { fails.push(`${at}: printed clue at ${i} contradicts the solution`); return; }
  }
  for (let k = 0; k < UNITS.length; k++) {
    const seen = new Set();
    for (const i of UNITS[k]) {
      if (seen.has(sol[i])) { fails.push(`${at}: the solution repeats ${sol[i]} in unit ${k}`); return; }
      seen.add(sol[i]);
    }
  }

  const realClues = clues(given);
  if (realClues !== p.clues) fails.push(`${at}: clues says ${p.clues}, the board prints ${realClues}`);
  if (realClues !== START_CLUES) fails.push(`${at}: opens on ${realClues} clues, every board opens on ${START_CLUES}`);

  const n = countSolutions(given, 2);
  if (n !== 1) { fails.push(`${at}: the opening board has ${n === 0 ? 'no' : 'more than one'} solution`); return; }

  const w = walk(given);
  totalStates += w.states;
  if (w.perfect !== p.perfect) fails.push(`${at}: perfect says ${p.perfect}, exhaustive search reaches ${w.perfect}`);
  if (Math.abs(w.forgive - p.forgive) > 1) fails.push(`${at}: forgive says ${p.forgive}, recomputed ${w.forgive}`);
  if (realClues - w.perfect < MIN_REMOVALS) fails.push(`${at}: only ${realClues - w.perfect} clues are loose, the floor is ${MIN_REMOVALS}`);

  // Replay the line: a separate claim from enumerating the graph.
  {
    let g = given.slice();
    let ok = true;
    for (const i of w.line) {
      if (!g[i]) { fails.push(`${at}: the perfect line lifts an empty square at ${i}`); ok = false; break; }
      g[i] = 0;
      if (countSolutions(g, 2) !== 1) { fails.push(`${at}: the perfect line leaves the board ambiguous at ${i}`); ok = false; break; }
    }
    if (ok && clues(g) !== w.perfect) fails.push(`${at}: the perfect line ends on ${clues(g)} clues, not ${w.perfect}`);
    if (ok && legalRemovals(g).length) fails.push(`${at}: the perfect line stops with a clue still loose`);
  }

  const dow = dowOf(p.live);
  const [lo, hi] = BAND[dow];
  if (p.forgive < lo || p.forgive > hi) fails.push(`${at}: ${DOW_NAME[dow]} wants forgive ${lo}-${hi}, this board is ${p.forgive}`);
  if (!!p.sunday !== (dow === 0)) fails.push(`${at}: sunday is ${!!p.sunday} on a ${DOW_NAME[dow]}`);

  if (p.num !== idx + 1) fails.push(`${at}: num is ${p.num}, expected ${idx + 1}`);
  if (idx > 0 && p.live !== addDays(PUZZLES[idx - 1].live, 1)) fails.push(`${at}: does not follow ${PUZZLES[idx - 1].live}`);
  const d = new Date(`${p.live}T12:00:00Z`);
  const wantId = `whittle-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantId) fails.push(`${at}: quizId is ${p.quizId}, the date says ${wantId}`);
  const wantLabel = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) fails.push(`${at}: dateLabel is ${p.dateLabel}, the date says ${wantLabel}`);

  const solKey = sol.join('');
  const patKey = given.map((v) => (v ? 1 : 0)).join('');
  if (seenSol.has(solKey)) fails.push(`${at}: reuses a solution grid`);
  if (seenPattern.has(patKey)) fails.push(`${at}: reuses a clue pattern`);
  seenSol.add(solKey); seenPattern.add(patKey);
  if (prevGiven) {
    const echo = prevGiven.reduce((c, v, i) => c + (v && v === given[i] ? 1 : 0), 0);
    if (echo > 1) fails.push(`${at}: repeats ${echo} printed digits-in-square from the day before, the ceiling is 1`);
  }
  prevGiven = given;
});

// ─── runway ────────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const last = PUZZLES.length ? PUZZLES[PUZZLES.length - 1].live : today;
const left = Math.round((new Date(`${last}T12:00:00Z`) - new Date(`${today}T12:00:00Z`)) / 86400000);
note.push(`${PUZZLES.length} boards, ${PUZZLES[0]?.live} to ${last}, ${left} days of runway`);
note.push(`forgive ${Math.min(...PUZZLES.map((p) => p.forgive))}-${Math.max(...PUZZLES.map((p) => p.forgive))}, perfect ${Math.min(...PUZZLES.map((p) => p.perfect))}-${Math.max(...PUZZLES.map((p) => p.perfect))}, ${totalStates} positions enumerated in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
if (left < 14) fails.push(`the bank runs out in ${left} days`);
else if (left < 30) note.push(`⚠ under 30 days of runway`);

for (const n of note) console.log(`  ${n}`);
if (fails.length) {
  console.error(`\nverify-whittle: ${fails.length} FAILURE(S)`);
  for (const f of fails.slice(0, 40)) console.error(`  ✗ ${f}`);
  if (fails.length > 40) console.error(`  … and ${fails.length - 40} more`);
  process.exit(1);
}
console.log(`verify-whittle: ${PUZZLES.length} boards OK`);
