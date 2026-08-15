// Shared 6x6 sudoku engine for Sixes: exhaustive solver, uniqueness counter,
// and the technique-graded difficulty rater.
//
// scripts/gen-sixes.mjs (which BUILT the bank) and scripts/verify-sixes.mjs
// (which PROVES it) both import this, so a board is graded and certified by the
// same code. Nothing here reads the bank; it only ever reasons about a grid it
// is handed, which is what lets the verifier recompute every stored field from
// scratch rather than trusting it.
//
// Geometry: 6 rows, 6 columns, digits 1-6, boxes 2 rows tall by 3 columns wide.
//   box = floor(r / 2) * 2 + floor(c / 3)   ->  0..5
export const N = 6;
export const CELLS = 36;
export const boxOf = (r, c) => Math.floor(r / 2) * 2 + Math.floor(c / 3);
export const FULL = 0b1111110; // bits 1..6 set

export const rc = (i) => [Math.floor(i / N), i % N];
export const bitCount = (m) => { let n = 0; let x = m; while (x) { x &= x - 1; n++; } return n; };
export const lowBit = (m) => { for (let d = 1; d <= N; d++) if (m & (1 << d)) return d; return 0; };

// The 18 units: 6 rows, then 6 columns, then 6 boxes. Index 12 + b is box b,
// which the locked-candidate rule below relies on.
export const UNITS = (() => {
  const u = [];
  for (let r = 0; r < N; r++) u.push(Array.from({ length: N }, (_, c) => r * N + c));
  for (let c = 0; c < N; c++) u.push(Array.from({ length: N }, (_, r) => r * N + c));
  for (let b = 0; b < N; b++) {
    const cells = [];
    for (let i = 0; i < CELLS; i++) { const [r, c] = rc(i); if (boxOf(r, c) === b) cells.push(i); }
    u.push(cells);
  }
  return u;
})();

// peers[i] = every cell sharing a row, column, or box with i (i itself excluded)
export const PEERS = (() => {
  const p = Array.from({ length: CELLS }, () => new Set());
  for (const u of UNITS) for (const a of u) for (const b of u) if (a !== b) p[a].add(b);
  return p.map((s) => [...s]);
})();

// ─── exhaustive solver, counts up to `cap` solutions ───────────────────────
export function countSolutions(flat, cap = 2) {
  const g = flat.slice();
  let found = 0;
  const ok = (i, d) => { for (const p of PEERS[i]) if (g[p] === d) return false; return true; };
  const rec = () => {
    if (found >= cap) return;
    let best = -1; let bestN = 99;
    for (let i = 0; i < CELLS; i++) {
      if (g[i]) continue;
      let n = 0;
      for (let d = 1; d <= N; d++) if (ok(i, d)) n++;
      if (n < bestN) { bestN = n; best = i; if (n <= 1) break; }
    }
    if (best < 0) { found++; return; }
    if (bestN === 0) return;
    for (let d = 1; d <= N; d++) {
      if (!ok(best, d)) continue;
      g[best] = d;
      rec();
      g[best] = 0;
      if (found >= cap) return;
    }
  };
  rec();
  return found;
}

export function solveOne(flat) {
  const g = flat.slice();
  const ok = (i, d) => { for (const p of PEERS[i]) if (g[p] === d) return false; return true; };
  const rec = () => {
    let best = -1; let bestN = 99;
    for (let i = 0; i < CELLS; i++) {
      if (g[i]) continue;
      let n = 0;
      for (let d = 1; d <= N; d++) if (ok(i, d)) n++;
      if (n < bestN) { bestN = n; best = i; if (n <= 1) break; }
    }
    if (best < 0) return true;
    for (let d = 1; d <= N; d++) {
      if (!ok(best, d)) continue;
      g[best] = d;
      if (rec()) return true;
      g[best] = 0;
    }
    return false;
  };
  return rec() ? g : null;
}

// ─── technique-graded solver ───────────────────────────────────────────────
// Solves using only human techniques, reports the HARDEST one it needed, and
// tallies how many steps of each kind the solve took. A board it cannot finish
// grades 0, which the generator rejects outright: every Sixes board is solvable
// by pure logic, with no guessing anywhere.
//
//   1  naked single      one candidate left in a square
//   2  hidden single     one square left in a unit for a digit
//   3  locked candidates pointing pairs and box/line reduction
//   4  pairs             naked pair or hidden pair
//
// The techniques are tried in that order and the loop restarts after any
// success, so an easier move is always taken when one exists. That is what
// makes the grade the MINIMUM ceiling a solver needs rather than an artifact
// of the order the rules happen to fire in, and it is what makes COST below
// reproducible: the same grid always yields the same tally.
//
// WHY COST EXISTS. On a 9x9 the technique level alone is a fine difficulty
// axis. On a 6x6 it collapses: over 500 random minimal boards, 65% needed
// nothing past naked singles, 30% needed hidden singles, 0.4% needed locked
// candidates, and NOT ONE needed a pair. A seven-step weekday ramp cannot be
// built on a knob with two usable settings. So difficulty is the weighted step
// count instead, which folds the clue count in for free (fewer clues means more
// steps and more of them hard) and moves continuously.
export const LEVEL_NAMES = { 1: 'naked singles', 2: 'hidden singles', 3: 'locked candidates', 4: 'pairs' };
export const MAX_LEVEL = 4;
export const STEP_COST = { naked: 1, hidden: 4, locked: 12, pairs: 20 };

// grade() keeps the old single-number contract; analyze() is the full tally.
export function grade(flat) { return analyze(flat).level; }

export function analyze(flat) {
  const cand = new Array(CELLS).fill(FULL);
  const g = new Array(CELLS).fill(0);
  const assign = (i, d) => {
    g[i] = d; cand[i] = 0;
    for (const p of PEERS[i]) cand[p] &= ~(1 << d);
  };
  for (let i = 0; i < CELLS; i++) if (flat[i]) assign(i, flat[i]);

  let hardest = 1;
  const steps = { naked: 0, hidden: 0, locked: 0, pairs: 0 };
  const cost = () => Object.keys(steps).reduce((a, k) => a + steps[k] * STEP_COST[k], 0);
  const done = (level) => ({ level, cost: level ? cost() : 0, steps });
  const remaining = () => { let n = 0; for (let i = 0; i < CELLS; i++) if (!g[i]) n++; return n; };
  const broken = () => { for (let i = 0; i < CELLS; i++) if (!g[i] && !cand[i]) return true; return false; };

  for (let guard = 0; guard < 500; guard++) {
    if (broken()) return done(0);
    if (!remaining()) return done(hardest);
    let did = false;

    // 1 — naked single
    for (let i = 0; i < CELLS && !did; i++) {
      if (!g[i] && bitCount(cand[i]) === 1) { assign(i, lowBit(cand[i])); steps.naked++; did = true; }
    }
    if (did) continue;

    // 2 — hidden single
    for (const u of UNITS) {
      for (let d = 1; d <= N && !did; d++) {
        const m = 1 << d;
        let spot = -1; let n = 0; let placed = false;
        for (const i of u) { if (g[i] === d) { placed = true; break; } if (!g[i] && (cand[i] & m)) { spot = i; n++; } }
        if (!placed && n === 1) { assign(spot, d); steps.hidden++; hardest = Math.max(hardest, 2); did = true; }
      }
      if (did) break;
    }
    if (did) continue;

    // 3a — pointing: inside a box, a digit confined to one row or column is
    // struck from the rest of that line.
    for (let b = 0; b < N && !did; b++) {
      const box = UNITS[12 + b];
      const inBox = new Set(box);
      for (let d = 1; d <= N && !did; d++) {
        const m = 1 << d;
        if (box.some((i) => g[i] === d)) continue;
        const spots = box.filter((i) => !g[i] && (cand[i] & m));
        if (spots.length < 2) continue;
        const rows = new Set(spots.map((i) => rc(i)[0]));
        const cols = new Set(spots.map((i) => rc(i)[1]));
        if (rows.size === 1) {
          const r = [...rows][0];
          for (let c = 0; c < N; c++) {
            const i = r * N + c;
            if (!inBox.has(i) && !g[i] && (cand[i] & m)) { cand[i] &= ~m; did = true; }
          }
        }
        if (!did && cols.size === 1) {
          const c = [...cols][0];
          for (let r = 0; r < N; r++) {
            const i = r * N + c;
            if (!inBox.has(i) && !g[i] && (cand[i] & m)) { cand[i] &= ~m; did = true; }
          }
        }
        if (did) { steps.locked++; hardest = Math.max(hardest, 3); }
      }
    }
    if (did) continue;

    // 3b — box/line reduction: inside a row or column, a digit confined to one
    // box is struck from the rest of that box.
    for (let k = 0; k < 12 && !did; k++) {
      const line = UNITS[k];
      const inLine = new Set(line);
      for (let d = 1; d <= N && !did; d++) {
        const m = 1 << d;
        if (line.some((i) => g[i] === d)) continue;
        const spots = line.filter((i) => !g[i] && (cand[i] & m));
        if (spots.length < 2) continue;
        const boxes = new Set(spots.map((i) => { const [r, c] = rc(i); return boxOf(r, c); }));
        if (boxes.size !== 1) continue;
        for (const i of UNITS[12 + [...boxes][0]]) {
          if (!inLine.has(i) && !g[i] && (cand[i] & m)) { cand[i] &= ~m; did = true; }
        }
        if (did) { steps.locked++; hardest = Math.max(hardest, 3); }
      }
    }
    if (did) continue;

    // 4a — naked pair
    for (const u of UNITS) {
      const open = u.filter((i) => !g[i]);
      for (let a = 0; a < open.length && !did; a++) {
        if (bitCount(cand[open[a]]) !== 2) continue;
        for (let b = a + 1; b < open.length && !did; b++) {
          if (cand[open[b]] !== cand[open[a]]) continue;
          const m = cand[open[a]];
          for (const i of open) {
            if (i === open[a] || i === open[b]) continue;
            if (cand[i] & m) { cand[i] &= ~m; did = true; }
          }
          if (did) { steps.pairs++; hardest = Math.max(hardest, 4); }
        }
      }
      if (did) break;
    }
    if (did) continue;

    // 4b — hidden pair
    for (const u of UNITS) {
      const open = u.filter((i) => !g[i]);
      const where = {};
      for (let d = 1; d <= N; d++) where[d] = u.some((i) => g[i] === d) ? null : open.filter((i) => cand[i] & (1 << d));
      for (let d1 = 1; d1 <= N && !did; d1++) {
        if (!where[d1] || where[d1].length !== 2) continue;
        for (let d2 = d1 + 1; d2 <= N && !did; d2++) {
          if (!where[d2] || where[d2].length !== 2) continue;
          if (where[d1][0] !== where[d2][0] || where[d1][1] !== where[d2][1]) continue;
          const keep = (1 << d1) | (1 << d2);
          for (const i of where[d1]) {
            if (cand[i] & ~keep) { cand[i] &= keep; did = true; }
          }
          if (did) { steps.pairs++; hardest = Math.max(hardest, 4); }
        }
      }
      if (did) break;
    }
    if (did) continue;

    return done(0); // stuck: would need a technique past pairs, or a guess
  }
  return done(0);
}

// ─── whole-board check, used by the verifier ───────────────────────────────
// Returns a list of complaints; an empty list means the board is well formed.
export function checkBoard(givenFlat, solFlat) {
  const errs = [];
  if (givenFlat.length !== CELLS) errs.push(`given is ${givenFlat.length} cells, expected ${CELLS}`);
  if (solFlat.length !== CELLS) errs.push(`sol is ${solFlat.length} cells, expected ${CELLS}`);
  if (errs.length) return errs;
  for (let i = 0; i < CELLS; i++) {
    if (!Number.isInteger(givenFlat[i]) || givenFlat[i] < 0 || givenFlat[i] > N) errs.push(`given[${i}] out of range`);
    if (!Number.isInteger(solFlat[i]) || solFlat[i] < 1 || solFlat[i] > N) errs.push(`sol[${i}] out of range`);
    if (givenFlat[i] && givenFlat[i] !== solFlat[i]) errs.push(`given[${i}] contradicts the solution`);
  }
  for (let k = 0; k < UNITS.length; k++) {
    const seen = new Set();
    for (const i of UNITS[k]) {
      if (seen.has(solFlat[i])) { errs.push(`solution repeats ${solFlat[i]} in unit ${k}`); break; }
      seen.add(solFlat[i]);
    }
  }
  if (errs.length) return errs;
  if (countSolutions(givenFlat, 2) !== 1) errs.push('the clues do not give exactly one solution');
  return errs;
}

// A clue is redundant when the board still has one solution without it. A
// minimal board has none: every printed digit is doing work.
export function redundantClues(givenFlat) {
  const out = [];
  for (let i = 0; i < CELLS; i++) {
    if (!givenFlat[i]) continue;
    const t = givenFlat.slice();
    t[i] = 0;
    if (countSolutions(t, 2) === 1) out.push(i);
  }
  return out;
}
