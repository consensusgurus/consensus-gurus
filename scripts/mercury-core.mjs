// Shared thermo-sudoku engine for Mercury: solution/thermo builder, the graded
// logical solver, and the uniqueness counter the GENERATOR uses.
//
// scripts/gen-mercury.mjs imports this. scripts/verify-mercury.mjs imports
// NOTHING from here (the Cages/Sando rule).
//
// A Mercury board is an ordinary 9x9 sudoku plus THERMOMETERS: orthogonal
// paths of 3+ cells along which the digits strictly INCREASE from the bulb
// (the first cell) to the tip. Thermos never share a cell. The weekday ramp is
// the printed-given count and nothing else (the Sando rule); the Sunday
// Edition prints NO givens at all - the thermometers carry the whole board.
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

// Random thermo layout over a solution: strictly increasing orthogonal walks,
// greedy-longest from shuffled starts, no shared cells, lengths within
// [minLen, maxLen], stop at `count` thermos. Returns null if it cannot place
// that many.
export function buildThermos(solFlat, rnd, { count, minLen, maxLen }) {
  const used = new Set();
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const out = [];
  const starts = shuffled(Array.from({ length: CELLS }, (_, i) => i), rnd);
  for (const s0 of starts) {
    if (out.length >= count) break;
    const r0 = Math.floor(s0 / N), c0 = s0 % N;
    if (used.has(s0)) continue;
    let best = null;
    const dfs = (path) => {
      if (!best || path.length > best.length) best = path.slice();
      if (path.length >= maxLen) return;
      const [r, c] = path[path.length - 1];
      for (const [dr, dc] of shuffled(dirs, rnd)) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
        const ni = nr * N + nc;
        if (used.has(ni)) continue;
        if (path.some(([pr, pc]) => pr === nr && pc === nc)) continue;
        if (solFlat[ni] <= solFlat[r * N + c]) continue;
        path.push([nr, nc]);
        dfs(path);
        path.pop();
      }
    };
    dfs([[r0, c0]]);
    if (best && best.length >= minLen) {
      out.push(best);
      for (const [r, c] of best) used.add(r * N + c);
    }
  }
  return out.length >= count ? out.slice(0, count) : null;
}

// units + peers (same geometry as any 9x9)
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
const minOf = (m) => { for (let d = 1; d <= 9; d++) if (m & (1 << d)) return d; return 10; };
const maxOf = (m) => { for (let d = 9; d >= 1; d--) if (m & (1 << d)) return d; return 0; };

// ─── the graded logical solver ─────────────────────────────────────────────
// Thermo bounds propagation is the pencil work of this game (free, like
// candidates); the counted steps are hidden single (4), locked candidates
// (12), naked/hidden pair (20). cost = the weighted tally.
export function gradeSolve(thermos, givens) {
  const cand = Array(CELLS).fill(FULL);
  if (givens) {
    for (let i = 0; i < CELLS; i++) if (givens[i]) cand[i] = 1 << givens[i];
  }
  const thIdx = thermos.map((t) => t.map(([r, c]) => r * N + c));
  const tally = { hidden: 0, locked: 0, pairs2: 0 };

  const props = () => {
    for (;;) {
      let changed = false;
      // thermo bounds
      for (const t of thIdx) {
        let lo = 0;
        for (let k = 0; k < t.length; k++) {
          lo = Math.max(minOf(cand[t[k]]), lo + 1);
          const before = cand[t[k]];
          let m = before;
          for (let d = 1; d < lo; d++) m &= ~(1 << d);
          if (m !== before) { cand[t[k]] = m; changed = true; if (!m) return false; }
        }
        let hi = 10;
        for (let k = t.length - 1; k >= 0; k--) {
          hi = Math.min(maxOf(cand[t[k]]), hi - 1);
          const before = cand[t[k]];
          let m = before;
          for (let d = 9; d > hi; d--) m &= ~(1 << d);
          if (m !== before) { cand[t[k]] = m; changed = true; if (!m) return false; }
        }
      }
      // peer elimination for singles
      for (let i = 0; i < CELLS; i++) {
        if (bitCount(cand[i]) !== 1) continue;
        for (const p of PEERS[i]) {
          const nx = cand[p] & ~cand[i];
          if (nx !== cand[p]) { cand[p] = nx; changed = true; if (!nx) return false; }
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
        if (n === 1 && bitCount(cand[spot]) > 1) { cand[spot] = m; tally.hidden++; return true; }
      }
    }
    return false;
  };
  const locked = () => {
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
    if (!props()) return { solved: false, cost: 0, tally, grid: null };
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
export function countSolutions(thermos, givens, cap = 2) {
  const g = Array(CELLS).fill(0);
  if (givens) for (let i = 0; i < CELLS; i++) if (givens[i]) g[i] = givens[i];
  const thIdx = thermos.map((t) => t.map(([r, c]) => r * N + c));
  const onThermo = Array.from({ length: CELLS }, () => []);
  thIdx.forEach((t, ti) => t.forEach((i, k) => onThermo[i].push([ti, k])));
  let found = 0;
  const ok = (i, d) => {
    for (const p of PEERS[i]) if (g[p] === d) return false;
    for (const [ti, k] of onThermo[i]) {
      const t = thIdx[ti];
      // strictly increasing along the path, and leave room to both ends
      if (d < k + 1 || d > 9 - (t.length - 1 - k)) return false;
      if (k > 0 && g[t[k - 1]] && g[t[k - 1]] >= d) return false;
      if (k < t.length - 1 && g[t[k + 1]] && g[t[k + 1]] <= d) return false;
    }
    return true;
  };
  const rec = () => {
    if (found >= cap) return;
    let best = -1, bestN = 99;
    for (let i = 0; i < CELLS; i++) {
      if (g[i]) continue;
      let n = 0;
      for (let d = 1; d <= 9; d++) if (ok(i, d)) n++;
      if (n < bestN) { bestN = n; best = i; if (n <= 1) break; }
    }
    if (best < 0) { found++; return; }
    if (bestN === 0) return;
    for (let d = 1; d <= 9; d++) {
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
