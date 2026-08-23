// Shared skyscrapers engine for Towers: Latin-square tools, the line-permutation
// logical solver, and the uniqueness counter the GENERATOR uses.
//
// scripts/gen-towers.mjs imports this to build the bank. scripts/verify-towers.mjs
// imports NOTHING from here (the Cages/Sando rule): its solvers are written out
// again with different data structures and a different search order, so a bug in
// this engine cannot certify its own output.
//
// A Towers board is an NxN Latin square of tower heights 1..N (weekdays N=5, the
// Sunday Edition N=7). The printed clues sit outside the grid: each one counts
// the towers VISIBLE looking down that row or column from that side, a taller
// tower hiding every shorter one behind it. Not every clue is printed; the
// weekday ramp is the printed-clue count and nothing else (the Sando rule).

export function visibleCount(line) {
  let mx = 0, n = 0;
  for (const v of line) { if (v > mx) { mx = v; n += 1; } }
  return n;
}

export function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Random NxN Latin square by backtracking with shuffled digit order.
export function randomLatin(N, rnd) {
  const g = Array.from({ length: N }, () => Array(N).fill(0));
  const ok = (r, c, v) => {
    for (let i = 0; i < N; i++) if (g[r][i] === v || g[i][c] === v) return false;
    return true;
  };
  const digits = Array.from({ length: N }, (_, i) => i + 1);
  const go = (p) => {
    if (p === N * N) return true;
    const r = Math.floor(p / N), c = p % N;
    for (const v of shuffled(digits, rnd)) {
      if (ok(r, c, v)) { g[r][c] = v; if (go(p + 1)) return true; g[r][c] = 0; }
    }
    return false;
  };
  go(0);
  return g;
}

// All permutations of 1..N, precomputed per N (N<=7 -> at most 5040), each
// carrying its forward/backward visibility counts and per-cell digit bitmasks
// so the solver never recomputes them inside a sweep.
const PERM_CACHE = new Map();
export function permsOf(N) {
  if (PERM_CACHE.has(N)) return PERM_CACHE.get(N);
  const out = [];
  const a = Array.from({ length: N }, (_, i) => i + 1);
  const rec = (k) => {
    if (k === N) {
      out.push({
        p: a.slice(),
        vf: visibleCount(a),
        vb: visibleCount(a.slice().reverse()),
        bits: a.map((d) => 1 << d),
      });
      return;
    }
    for (let i = k; i < N; i++) {
      [a[k], a[i]] = [a[i], a[k]];
      rec(k + 1);
      [a[k], a[i]] = [a[i], a[k]];
    }
  };
  rec(0);
  PERM_CACHE.set(N, out);
  return out;
}

// Clues object: { top, right, bottom, left }, arrays of length N, 0 = unprinted.
// Line l for a column c runs top->bottom; its clue pair is (top[c], bottom[c]).
// Line for a row r runs left->right; its pair is (left[r], right[r]).
export function cluesOf(sol) {
  const N = sol.length;
  const top = [], right = [], bottom = [], left = [];
  for (let c = 0; c < N; c++) {
    const col = sol.map((row) => row[c]);
    top.push(visibleCount(col));
    bottom.push(visibleCount(col.slice().reverse()));
  }
  for (let r = 0; r < N; r++) {
    left.push(visibleCount(sol[r]));
    right.push(visibleCount(sol[r].slice().reverse()));
  }
  return { top, right, bottom, left };
}

// ─── the logical solver ────────────────────────────────────────────────────
// Human-shaped and complete for this game's technique set: repeat until stuck
// or solved
//   1. LINE SWEEP: for every row and column, enumerate the permutations of
//      1..N compatible with the current candidates AND both of that line's
//      printed clues (either may be absent), then keep in each cell only the
//      digits some surviving permutation puts there. This is exactly what a
//      person does with a clue ("a 1 pins the tallest at the edge, an N forces
//      the full ascent"), taken to its logical end.
//   2. singles fall out of the sweep automatically (a cell down to one digit).
// A board that does not fall to repeated line sweeps is REJECTED by the
// generator, so no guessing anywhere is a construction guarantee.
//
// Returns { solved, grid, sweeps } where sweeps is the number of full passes
// that changed at least one candidate.
export function logicSolve(N, clues, capSweeps = 60) {
  const FULL = (1 << (N + 1)) - 2; // bits 1..N
  const cand = Array.from({ length: N * N }, () => FULL);
  const perms = permsOf(N);
  const bit = (d) => 1 << d;
  const popcount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

  const lineCells = [];
  const linePairs = [];
  for (let r = 0; r < N; r++) {
    lineCells.push(Array.from({ length: N }, (_, c) => r * N + c));
    linePairs.push([clues.left[r] || 0, clues.right[r] || 0]);
  }
  for (let c = 0; c < N; c++) {
    lineCells.push(Array.from({ length: N }, (_, r) => r * N + c));
    linePairs.push([clues.top[c] || 0, clues.bottom[c] || 0]);
  }

  let sweeps = 0;
  for (let pass = 0; pass < capSweeps; pass++) {
    let changed = false;
    for (let li = 0; li < lineCells.length; li++) {
      const cells = lineCells[li];
      const [cf, cb] = linePairs[li];
      const allow = Array(N).fill(0);
      for (const P of perms) {
        if (cf && P.vf !== cf) continue;
        if (cb && P.vb !== cb) continue;
        const bits = P.bits;
        let ok = true;
        for (let i = 0; i < N; i++) {
          if (!(cand[cells[i]] & bits[i])) { ok = false; break; }
        }
        if (!ok) continue;
        for (let i = 0; i < N; i++) allow[i] |= bits[i];
      }
      for (let i = 0; i < N; i++) {
        const nx = cand[cells[i]] & allow[i];
        if (nx === 0) return { solved: false, grid: null, sweeps, contradiction: true };
        if (nx !== cand[cells[i]]) { cand[cells[i]] = nx; changed = true; }
      }
    }
    if (changed) sweeps++;
    if (!changed) break;
    let done = true;
    for (let i = 0; i < N * N; i++) if (popcount(cand[i]) !== 1) { done = false; break; }
    if (done) {
      const grid = Array.from({ length: N }, (_, r) =>
        Array.from({ length: N }, (_, c) => Math.log2(cand[r * N + c])));
      return { solved: true, grid, sweeps };
    }
  }
  return { solved: false, grid: null, sweeps };
}

// ─── uniqueness counter (generator's own; the verifier has an independent one)
// Depth-first over cells, most-constrained first, with clue checks applied the
// moment a line completes and a visibility upper/lower bound prune on partial
// lines. Counts up to cap.
export function countSolutions(N, clues, cap = 2) {
  const g = Array.from({ length: N }, () => Array(N).fill(0));
  const rowUsed = Array(N).fill(0), colUsed = Array(N).fill(0);
  const bit = (d) => 1 << d;
  let found = 0;

  const lineOk = (line, cf, cb) => {
    if (cf && visibleCount(line) !== cf) return false;
    if (cb && visibleCount(line.slice().reverse()) !== cb) return false;
    return true;
  };

  const rec = (p) => {
    if (found >= cap) return;
    if (p === N * N) { found++; return; }
    const r = Math.floor(p / N), c = p % N;
    for (let d = 1; d <= N; d++) {
      if ((rowUsed[r] & bit(d)) || (colUsed[c] & bit(d))) continue;
      g[r][c] = d; rowUsed[r] |= bit(d); colUsed[c] |= bit(d);
      let ok = true;
      if (c === N - 1) ok = lineOk(g[r], clues.left[r] || 0, clues.right[r] || 0);
      if (ok && r === N - 1) {
        const col = g.map((row) => row[c]);
        ok = lineOk(col, clues.top[c] || 0, clues.bottom[c] || 0);
      }
      if (ok) rec(p + 1);
      g[r][c] = 0; rowUsed[r] &= ~bit(d); colUsed[c] &= ~bit(d);
      if (found >= cap) return;
    }
  };
  rec(0);
  return found;
}

export function countPrinted(clues) {
  return ['top', 'right', 'bottom', 'left'].reduce(
    (n, k) => n + clues[k].filter((v) => v > 0).length, 0);
}
