// Shared Sando engine: the sandwich-sudoku solvers the generator runs.
// scripts/verify-sando.mjs deliberately does NOT import this, and writes its own
// (the Quilt rule). A verifier that shares the generator's solver certifies its
// own bugs, which is not hypothetical: it caught two while Cages was being built.
//
// SANDWICH SUDOKU is ordinary sudoku plus border sums. A clue printed outside a
// row or column is the total of the digits lying strictly BETWEEN the 1 and the 9
// in that line. The 1 and 9 are the crusts and everything between them is the
// filling, so a clue of 0 says the crusts are adjacent and a clue of 35 says they
// sit at the two ends with all of 2-8 in between. The clue says nothing about
// WHERE the sandwich is, which is the whole game: you reason about the positions
// of two particular digits before you can place anything.

export const bx = (i) => Math.floor(Math.floor(i / 9) / 3) * 3 + Math.floor((i % 9) / 3);

export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const shuffle = (arr, rnd) => {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
};

// LINES[0..8] are the rows, LINES[9..17] the columns: the 18 places a border sum
// can be printed, in the order the bank stores them.
export const LINES = (() => {
  const out = [];
  for (let r = 0; r < 9; r++) out.push(Array.from({ length: 9 }, (_, k) => r * 9 + k));
  for (let c = 0; c < 9; c++) out.push(Array.from({ length: 9 }, (_, k) => k * 9 + c));
  return out;
})();
export const HOUSES = (() => {
  const h = LINES.slice();
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3, box = [];
    for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) box.push((br + a) * 9 + bc + d);
    h.push(box);
  }
  return h;
})();
const PEERS = Array.from({ length: 81 }, (_, i) => {
  const r = Math.floor(i / 9), c = i % 9, b = bx(i), s = new Set();
  for (let k = 0; k < 9; k++) { s.add(r * 9 + k); s.add(k * 9 + c); }
  const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
  for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) s.add((br + a) * 9 + bc + d);
  s.delete(i);
  return [...s];
});

export function fullSolution(rnd) {
  const g = new Array(81).fill(0);
  const ok = (i, v) => {
    const r = Math.floor(i / 9), c = i % 9, b = bx(i);
    for (let k = 0; k < 9; k++) if (g[r * 9 + k] === v || g[k * 9 + c] === v) return false;
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
    for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) if (g[(br + a) * 9 + bc + d] === v) return false;
    return true;
  };
  const go = (i) => {
    if (i === 81) return true;
    for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rnd)) if (ok(i, v)) { g[i] = v; if (go(i + 1)) return true; g[i] = 0; }
    return false;
  };
  go(0);
  return g;
}

// the sandwich total of a solved line: the digits strictly between its 1 and 9
export function sandwichOf(line, sol) {
  const p = line.findIndex((i) => sol[i] === 1);
  const q = line.findIndex((i) => sol[i] === 9);
  const [a, b] = p < q ? [p, q] : [q, p];
  let s = 0;
  for (let k = a + 1; k < b; k++) s += sol[line[k]];
  return s;
}

// every subset of {2..8} of the given size totalling `sum`, as a bitmask list.
// Cached: the generator asks for the same (size, sum) thousands of times.
const FILL_CACHE = new Map();
export function fillings(size, sum) {
  const key = size * 64 + sum;
  const hit = FILL_CACHE.get(key);
  if (hit) return hit;
  const out = [];
  const walk = (v, left, rem, mask) => {
    if (left === 0) { if (rem === 0) out.push(mask); return; }
    for (; v <= 8; v++) {
      if (v * left > rem) break;
      walk(v + 1, left - 1, rem - v, mask | (1 << v));
    }
  };
  walk(2, size, sum, 0);
  FILL_CACHE.set(key, out);
  return out;
}

// ── the sandwich deduction ───────────────────────────────────────────────────
// For a line carrying a border sum, enumerate every way the sandwich could sit:
// each pair of positions for the crusts, each orientation (1 then 9, or 9 then
// 1), and each set of fillings that totals the clue. A layout survives only if
// the digits can actually be dealt to the cells given their candidates, and a
// cell keeps only the digits some surviving layout gives it. This is exactly the
// reasoning a person does with a sandwich clue, and nothing beyond it.
export function sandwichPrune(line, cand, sum) {
  const allow = new Array(9).fill(0);
  let any = false;
  for (let p = 0; p < 9; p++) {
    for (let q = 0; q < 9; q++) {
      if (p === q) continue;
      const a = Math.min(p, q), b = Math.max(p, q);
      const gap = b - a - 1;
      if (!(cand[line[p]] & 2) || !(cand[line[q]] & (1 << 9))) continue;   // 1 at p, 9 at q
      for (const inMask of fillings(gap, sum)) {
        const outMask = (0x1FC & ~inMask);   // {2..8} minus the filling
        // deal the sevens: interior cells take the filling, the rest take the crust-side digits
        const slots = [];
        for (let k = 0; k < 9; k++) {
          if (k === p || k === q) continue;
          slots.push([k, (k > a && k < b) ? inMask : outMask]);
        }
        const used = new Array(10).fill(false);
        const perCell = new Array(9).fill(0);
        const deal = (idx) => {
          if (idx === slots.length) return true;
          const [k, m] = slots[idx];
          let ok = false;
          for (let v = 2; v <= 8; v++) {
            if (!(m & (1 << v)) || used[v] || !(cand[line[k]] & (1 << v))) continue;
            used[v] = true;
            if (deal(idx + 1)) { perCell[k] |= 1 << v; ok = true; }
            used[v] = false;
          }
          return ok;
        };
        if (!deal(0)) continue;
        any = true;
        allow[p] |= 2; allow[q] |= 1 << 9;
        for (let k = 0; k < 9; k++) if (k !== p && k !== q) allow[k] |= perCell[k];
      }
    }
  }
  return any ? allow : null;
}

// ── exhaustive solver: propagate, then branch on the tightest cell ───────────
export function countSolutions(given, rowSums, colSums, cap = 2) {
  const sums = new Array(18).fill(null);
  for (let k = 0; k < 9; k++) { sums[k] = rowSums[k]; sums[9 + k] = colSums[k]; }
  const start = new Array(81).fill(0x3FE);
  for (let i = 0; i < 81; i++) if (given[i]) start[i] = 1 << given[i];
  let found = 0;

  const propagate = (cand) => {
    for (let pass = 0; pass < 300; pass++) {
      let moved = false;
      for (let i = 0; i < 81; i++) {
        const m = cand[i];
        if (!m) return null;
        if (m & (m - 1)) continue;
        for (const p of PEERS[i]) if (cand[p] & m) { cand[p] &= ~m; moved = true; if (!cand[p]) return null; }
      }
      for (const h of HOUSES) {
        for (let v = 1; v <= 9; v++) {
          const bit = 1 << v;
          let n = 0, at = -1;
          for (const c of h) if (cand[c] & bit) { n++; at = c; }
          if (!n) return null;
          if (n === 1 && cand[at] !== bit) { cand[at] = bit; moved = true; }
        }
      }
      for (let L = 0; L < 18; L++) {
        if (sums[L] == null) continue;
        const allow = sandwichPrune(LINES[L], cand, sums[L]);
        if (!allow) return null;
        for (let k = 0; k < 9; k++) {
          const c = LINES[L][k];
          const nc = cand[c] & allow[k];
          if (nc !== cand[c]) { cand[c] = nc; moved = true; if (!nc) return null; }
        }
      }
      if (!moved) return cand;
    }
    return cand;
  };
  const search = (cand) => {
    if (found >= cap) return;
    const c = propagate(cand.slice());
    if (!c) return;
    let pick = -1, best = 10;
    for (let i = 0; i < 81; i++) {
      const n = popcount(c[i]);
      if (n > 1 && n < best) { best = n; pick = i; }
    }
    if (pick < 0) { found++; return; }
    for (let v = 1; v <= 9; v++) {
      if (!(c[pick] & (1 << v))) continue;
      const next = c.slice();
      next[pick] = 1 << v;
      search(next);
      if (found >= cap) return;
    }
  };
  search(start);
  return found;
}
const popcount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };

// ── the no-guessing proof ────────────────────────────────────────────────────
//   level 1  the sandwich deduction, plus naked and hidden singles
//   level 2  adds locked candidates and naked and hidden pairs and triples
export function logicSolve(given, rowSums, colSums, level) {
  const sums = new Array(18).fill(null);
  for (let k = 0; k < 9; k++) { sums[k] = rowSums[k]; sums[9 + k] = colSums[k]; }
  const cand = new Array(81).fill(0x3FE);
  for (let i = 0; i < 81; i++) if (given[i]) cand[i] = 1 << given[i];
  // takes a CELL INDEX. An empty mask is a contradiction, not a solved cell, so
  // it has to fail this too: `!(0 & -1)` is true, and a version that let a zero
  // mask through would report a dead board as finished.
  const solved = (i) => cand[i] !== 0 && !(cand[i] & (cand[i] - 1));

  for (let pass = 0; pass < 600; pass++) {
    let moved = false;
    for (let L = 0; L < 18; L++) {
      if (sums[L] == null) continue;
      const allow = sandwichPrune(LINES[L], cand, sums[L]);
      if (!allow) return null;
      for (let k = 0; k < 9; k++) {
        const c = LINES[L][k];
        const nc = cand[c] & allow[k];
        if (nc !== cand[c]) { cand[c] = nc; moved = true; if (!nc) return null; }
      }
    }
    if (level >= 2) {
      for (const src of HOUSES) {
        for (let v = 1; v <= 9; v++) {
          const bit = 1 << v;
          if (src.some((c) => solved(c) && cand[c] === bit)) continue;
          const spots = src.filter((c) => cand[c] & bit);
          if (spots.length < 2 || spots.length > 3) continue;
          for (const h of HOUSES) {
            if (h === src || !spots.every((c) => h.includes(c))) continue;
            for (const c of h) if (!spots.includes(c) && (cand[c] & bit)) { cand[c] &= ~bit; moved = true; }
          }
        }
      }
      for (const h of HOUSES) {
        const open = h.filter((c) => !solved(c));
        for (let a = 0; a < open.length; a++) for (let b = a + 1; b < open.length; b++) {
          const m2 = cand[open[a]] | cand[open[b]];
          if (popcount(m2) === 2) for (const c of open) {
            if (c !== open[a] && c !== open[b] && (cand[c] & m2)) { cand[c] &= ~m2; moved = true; }
          }
          for (let d = b + 1; d < open.length; d++) {
            const m3 = m2 | cand[open[d]];
            if (popcount(m3) !== 3) continue;
            for (const c of open) {
              if (c !== open[a] && c !== open[b] && c !== open[d] && (cand[c] & m3)) { cand[c] &= ~m3; moved = true; }
            }
          }
        }
        for (let v1 = 1; v1 <= 9; v1++) for (let v2 = v1 + 1; v2 <= 9; v2++) {
          const b1 = 1 << v1, b2 = 1 << v2;
          if (h.some((c) => solved(c) && (cand[c] === b1 || cand[c] === b2))) continue;
          const s1 = open.filter((c) => cand[c] & b1);
          const s2 = open.filter((c) => cand[c] & b2);
          if (s1.length !== 2 || s2.length !== 2 || s1[0] !== s2[0] || s1[1] !== s2[1]) continue;
          for (const c of s1) if (cand[c] !== (cand[c] & (b1 | b2))) { cand[c] &= b1 | b2; moved = true; }
        }
      }
    }
    for (let i = 0; i < 81; i++) {
      const m = cand[i];
      if (!m) return null;
      if (m & (m - 1)) continue;
      for (const p of PEERS[i]) if (cand[p] & m) { cand[p] &= ~m; moved = true; if (!cand[p]) return null; }
    }
    for (const h of HOUSES) {
      for (let v = 1; v <= 9; v++) {
        const bit = 1 << v;
        let n = 0, at = -1;
        for (const c of h) if (cand[c] & bit) { n++; at = c; }
        if (!n) return null;
        if (n === 1 && cand[at] !== bit) { cand[at] = bit; moved = true; }
      }
    }
    // NOT `cand.every(solved)`: every() passes the VALUE first, so that hands the
    // mask to a function expecting an index, `cand[512]` is undefined, and every
    // wide-open cell reports itself solved. It shipped that way for one probe and
    // "solved" a board with three solutions.
    if (cand.every((m) => m !== 0 && !(m & (m - 1)))) return cand.map((m) => 31 - Math.clz32(m));
    if (!moved) return null;
  }
  return null;
}
