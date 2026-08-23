// Shared kropki engine for Polka: deal builder, the logical solver that grades
// the bank, and the uniqueness counter the GENERATOR uses.
//
// scripts/gen-polka.mjs imports this. scripts/verify-polka.mjs imports NOTHING
// from here (the Cages/Sando rule): its solvers are independent
// implementations with different data structures and search order.
//
// THE DOTS. Between every pair of orthogonal neighbours the deal prints
//   1 (white)  the two digits differ by exactly 1
//   2 (black)  one digit is exactly double the other
//   0 (none)   NEITHER is true - the absence is a clue too
// A 1 next to a 2 satisfies both rules, so either dot may be printed there;
// the builder picks one deterministically from the cell position, and the
// solver never assumes which (a white dot means consecutive, full stop; a
// black dot means double, full stop - both readings stay sound whichever way
// a 1-2 pair was printed).
export const N = 9;
export const CELLS = 81;
export const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);
export const FULL = 0b1111111110;

export function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
export function shuffled(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function randomSolution(rnd) {
  const g = Array(CELLS).fill(0);
  const ok = (i, d) => {
    const r = Math.floor(i / N), c = i % N, b = boxOf(r, c);
    for (let j = 0; j < CELLS; j++) {
      if (!g[j] || j === i) continue;
      const rr = Math.floor(j / N), cc = j % N;
      if ((rr === r || cc === c || boxOf(rr, cc) === b) && g[j] === d) return false;
    }
    return true;
  };
  const digits = [1,2,3,4,5,6,7,8,9];
  const rec = (p) => {
    if (p === CELLS) return true;
    for (const d of shuffled(digits, rnd)) {
      if (ok(p, d)) { g[p] = d; if (rec(p + 1)) return true; g[p] = 0; }
    }
    return false;
  };
  rec(0);
  return g;
}

const isW = (a, b) => Math.abs(a - b) === 1;
const isB = (a, b) => a === 2 * b || b === 2 * a;

// dots from a solution: h[r][c] is the dot between (r,c) and (r,c+1);
// v[r][c] between (r,c) and (r+1,c). A 1-2 pair fits both rules, and the
// printed dot alternates deterministically by position parity so it cannot be
// pattern-read.
export function dotsOf(solFlat) {
  const h = Array.from({ length: N }, () => Array(N - 1).fill(0));
  const v = Array.from({ length: N - 1 }, () => Array(N).fill(0));
  const pick = (a, b, r, c) => {
    const w = isW(a, b), bl = isB(a, b);
    if (w && bl) return ((r + c) % 2 === 0) ? 2 : 1; // the 1-2 pair
    if (w) return 1;
    if (bl) return 2;
    return 0;
  };
  for (let r = 0; r < N; r++) for (let c = 0; c < N - 1; c++) h[r][c] = pick(solFlat[r * N + c], solFlat[r * N + c + 1], r, c);
  for (let r = 0; r < N - 1; r++) for (let c = 0; c < N; c++) v[r][c] = pick(solFlat[r * N + c], solFlat[(r + 1) * N + c], r, c);
  return { h, v };
}

// pair list: [i, j, type] for every orthogonal adjacency, type 0/1/2
export function pairsOf(dots) {
  const out = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N - 1; c++) out.push([r * N + c, r * N + c + 1, dots.h[r][c]]);
  for (let r = 0; r < N - 1; r++) for (let c = 0; c < N; c++) out.push([r * N + c, (r + 1) * N + c, dots.v[r][c]]);
  return out;
}

const pairOk = (t, a, b) => (t === 1 ? isW(a, b) : t === 2 ? isB(a, b) : (!isW(a, b) && !isB(a, b)));

// units + peers
export const UNITS = (() => {
  const u = [];
  for (let r = 0; r < N; r++) u.push(Array.from({ length: N }, (_, c) => r * N + c));
  for (let c = 0; c < N; c++) u.push(Array.from({ length: N }, (_, r) => r * N + c));
  for (let b = 0; b < N; b++) {
    const cells = [];
    for (let i = 0; i < CELLS; i++) { const r = Math.floor(i / N), c = i % N; if (boxOf(r, c) === b) cells.push(i); }
    u.push(cells);
  }
  return u;
})();
export const PEERS = (() => {
  const p = Array.from({ length: CELLS }, () => new Set());
  for (const u of UNITS) for (const a of u) for (const b of u) if (a !== b) p[a].add(b);
  return p.map((s) => [...s]);
})();

export const bitCount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
const oneDigit = (m) => { for (let d = 1; d <= 9; d++) if (m === (1 << d)) return d; return 0; };

// ─── the graded logical solver ─────────────────────────────────────────────
// Techniques, tried easiest first, restart after any success:
//   dot arc revision (free, like writing candidates), naked single (1),
//   hidden single (4), locked candidates (12), naked/hidden pair (20).
// cost = the weighted tally of counted steps; arc revisions and naked singles
// are the pencil work every deal takes, so the interesting weight sits on the
// rest. Returns { solved, cost, tally, grid } - grid as flat array.
export function gradeSolve(pairs) {
  const cand = Array(CELLS).fill(FULL);
  const adj = Array.from({ length: CELLS }, () => []);
  for (const [i, j, t] of pairs) { adj[i].push([j, t]); adj[j].push([i, t]); }

  const tally = { naked: 0, hidden: 0, locked: 0, pairs2: 0 };

  const assign = (i, d) => { cand[i] = 1 << d; };

  // arc revision to a fixpoint; returns false on a wipeout
  const arcs = () => {
    for (;;) {
      let changed = false;
      for (let i = 0; i < CELLS; i++) {
        for (const [j, t] of adj[i]) {
          let keep = 0;
          for (let a = 1; a <= 9; a++) {
            if (!(cand[i] & (1 << a))) continue;
            let sup = false;
            for (let b = 1; b <= 9; b++) {
              if (!(cand[j] & (1 << b))) continue;
              if (a === b) continue;
              if (pairOk(t, a, b)) { sup = true; break; }
            }
            if (sup) keep |= 1 << a;
          }
          if (keep !== cand[i]) { cand[i] = keep; changed = true; if (!keep) return false; }
        }
        // peer elimination for solved cells
        if (bitCount(cand[i]) === 1) {
          for (const p of PEERS[i]) {
            const nx = cand[p] & ~cand[i];
            if (nx !== cand[p]) { cand[p] = nx; changed = true; if (!nx) return false; }
          }
        }
      }
      if (!changed) return true;
    }
  };

  const hiddenSingle = () => {
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const m = 1 << d;
        let spot = -1, n = 0;
        for (const i of u) if (cand[i] & m) { n++; spot = i; if (n > 1) break; }
        if (n === 1 && bitCount(cand[spot]) > 1) { assign(spot, d); tally.hidden++; return true; }
      }
    }
    return false;
  };
  const locked = () => {
    // pointing/claiming between boxes and lines
    for (let b = 0; b < 9; b++) {
      const box = UNITS[18 + b];
      for (let d = 1; d <= 9; d++) {
        const m = 1 << d;
        const spots = box.filter((i) => cand[i] & m);
        if (spots.length < 2 || spots.length > 3) continue;
        const rows = new Set(spots.map((i) => Math.floor(i / N)));
        const cols = new Set(spots.map((i) => i % N));
        if (rows.size === 1) {
          const r = [...rows][0];
          let hit = false;
          for (let c = 0; c < N; c++) {
            const i = r * N + c;
            if (boxOf(r, c) !== b && (cand[i] & m)) { cand[i] &= ~m; hit = true; }
          }
          if (hit) { tally.locked++; return true; }
        }
        if (cols.size === 1) {
          const c = [...cols][0];
          let hit = false;
          for (let r = 0; r < N; r++) {
            const i = r * N + c;
            if (boxOf(r, c) !== b && (cand[i] & m)) { cand[i] &= ~m; hit = true; }
          }
          if (hit) { tally.locked++; return true; }
        }
      }
    }
    // claiming: digit confined to one box within a row/col
    for (let li = 0; li < 18; li++) {
      const u = UNITS[li];
      for (let d = 1; d <= 9; d++) {
        const m = 1 << d;
        const spots = u.filter((i) => cand[i] & m);
        if (spots.length < 2 || spots.length > 3) continue;
        const boxes = new Set(spots.map((i) => boxOf(Math.floor(i / N), i % N)));
        if (boxes.size !== 1) continue;
        const b = [...boxes][0];
        let hit = false;
        for (const i of UNITS[18 + b]) {
          if (!u.includes(i) && (cand[i] & m)) { cand[i] &= ~m; hit = true; }
        }
        if (hit) { tally.locked++; return true; }
      }
    }
    return false;
  };
  const pairs2 = () => {
    for (const u of UNITS) {
      // naked pair
      for (let x = 0; x < u.length; x++) {
        const i = u[x];
        if (bitCount(cand[i]) !== 2) continue;
        for (let y = x + 1; y < u.length; y++) {
          const j = u[y];
          if (cand[j] !== cand[i]) continue;
          let hit = false;
          for (const k of u) {
            if (k === i || k === j) continue;
            const nx = cand[k] & ~cand[i];
            if (nx !== cand[k]) { cand[k] = nx; hit = true; }
          }
          if (hit) { tally.pairs2++; return true; }
        }
      }
      // hidden pair
      for (let a = 1; a <= 9; a++) for (let b2 = a + 1; b2 <= 9; b2++) {
        const ma = 1 << a, mb = 1 << b2;
        const sa = u.filter((i) => cand[i] & ma);
        const sb = u.filter((i) => cand[i] & mb);
        if (sa.length !== 2 || sb.length !== 2) continue;
        if (sa[0] !== sb[0] || sa[1] !== sb[1]) continue;
        let hit = false;
        for (const i of sa) {
          const nx = cand[i] & (ma | mb);
          if (nx !== cand[i]) { cand[i] = nx; hit = true; }
        }
        if (hit) { tally.pairs2++; return true; }
      }
    }
    return false;
  };

  for (;;) {
    if (!arcs()) return { solved: false, cost: 0, tally, grid: null };
    let done = true;
    for (let i = 0; i < CELLS; i++) if (bitCount(cand[i]) !== 1) { done = false; break; }
    if (done) {
      const cost = tally.hidden * 4 + tally.locked * 12 + tally.pairs2 * 20;
      return { solved: true, cost, tally, grid: cand.map(oneDigit) };
    }
    if (hiddenSingle()) continue;
    if (locked()) continue;
    if (pairs2()) continue;
    return { solved: false, cost: 0, tally, grid: null };
  }
}

// ─── uniqueness counter ────────────────────────────────────────────────────
export function countSolutions(pairs, cap = 2) {
  const cand = Array(CELLS).fill(FULL);
  const adj = Array.from({ length: CELLS }, () => []);
  for (const [i, j, t] of pairs) { adj[i].push([j, t]); adj[j].push([i, t]); }
  let found = 0;
  const g = Array(CELLS).fill(0);
  const ok = (i, d) => {
    for (const p of PEERS[i]) if (g[p] === d) return false;
    for (const [j, t] of adj[i]) if (g[j] && !pairOk(t, d, g[j])) return false;
    return true;
  };
  const rec = () => {
    if (found >= cap) return;
    let best = -1, bestN = 99;
    for (let i = 0; i < CELLS; i++) {
      if (g[i]) continue;
      let n = 0;
      for (let d = 1; d <= 9; d++) if ((cand[i] & (1 << d)) && ok(i, d)) n++;
      if (n < bestN) { bestN = n; best = i; if (n <= 1) break; }
    }
    if (best < 0) { found++; return; }
    if (bestN === 0) return;
    for (let d = 1; d <= 9; d++) {
      if (!((cand[best] & (1 << d)) && ok(best, d))) continue;
      g[best] = d;
      rec();
      g[best] = 0;
      if (found >= cap) return;
    }
  };
  rec();
  return found;
}
