// sums-core — the engine behind the Sums bank (kakuro, the cross-sums crossword).
//
// A board is an N x N grid. Row 0 and column 0 are always black, so the playable
// area is the (N-1) x (N-1) square in the corner. A WHITE cell holds a digit 1-9.
// A RUN is a maximal horizontal or vertical strip of white cells; every run has
// at least two cells and at most nine, its digits are all different, and the
// black cell at its head prints their total (across total top-right, down total
// bottom-left, the way every printed kakuro reads).
//
// This module is imported by scripts/gen-sums.mjs ONLY. scripts/verify-sums.mjs
// re-derives everything with its own code, on purpose (see the daily puzzle
// authoring standard in CLAUDE.md): a shared solver certifies its own bugs.

// ─── run geometry ───────────────────────────────────────────────────────────
// `black` is an N x N array of booleans. Returns { runs, cellRuns, whites } or
// null when the pattern is illegal (a one-cell run, or a run longer than nine).
export function geometry(black) {
  const N = black.length;
  const runs = [];
  const cellRuns = new Map();
  const whites = [];
  const key = (r, c) => r * N + c;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!black[r][c]) whites.push(key(r, c));
  for (let r = 0; r < N; r++) {
    let c = 0;
    while (c < N) {
      if (black[r][c]) { c++; continue; }
      const s = c;
      while (c < N && !black[r][c]) c++;
      if (c - s < 2 || c - s > 9) return null;
      const cells = [];
      for (let x = s; x < c; x++) cells.push(key(r, x));
      runs.push({ dir: 'a', head: key(r, s - 1), cells });
    }
  }
  for (let c = 0; c < N; c++) {
    let r = 0;
    while (r < N) {
      if (black[r][c]) { r++; continue; }
      const s = r;
      while (r < N && !black[r][c]) r++;
      if (r - s < 2 || r - s > 9) return null;
      const cells = [];
      for (let x = s; x < r; x++) cells.push(key(x, c));
      runs.push({ dir: 'd', head: key(s - 1, c), cells });
    }
  }
  runs.forEach((run, i) => { for (const cell of run.cells) { if (!cellRuns.has(cell)) cellRuns.set(cell, []); cellRuns.get(cell).push(i); } });
  // every white must sit in exactly one across run and one down run
  for (const w of whites) { const rs = cellRuns.get(w); if (!rs || rs.length !== 2) return null; }
  return { N, runs, cellRuns, whites };
}

// whites must form one connected region
export function connected(black) {
  const N = black.length;
  let start = -1;
  const seen = new Set();
  for (let r = 0; r < N && start < 0; r++) for (let c = 0; c < N; c++) if (!black[r][c]) { start = r * N + c; break; }
  if (start < 0) return false;
  const stack = [start]; seen.add(start);
  while (stack.length) {
    const k = stack.pop(); const r = Math.floor(k / N), c = k % N;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= N || cc >= N || black[rr][cc]) continue;
      const kk = rr * N + cc;
      if (!seen.has(kk)) { seen.add(kk); stack.push(kk); }
    }
  }
  let total = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!black[r][c]) total++;
  return seen.size === total;
}

// ─── the combination table: which digit SETS make total t in n cells ────────
const COMBOS = new Map();
(function build() {
  for (let n = 2; n <= 9; n++) {
    const out = new Map();
    const rec = (start, left, sum, set) => {
      if (left === 0) { if (!out.has(sum)) out.set(sum, []); out.get(sum).push(set.slice()); return; }
      for (let d = start; d <= 9; d++) { set.push(d); rec(d + 1, left - 1, sum + d, set); set.pop(); }
    };
    rec(1, n, 0, []);
    COMBOS.set(n, out);
  }
})();
export function combosFor(n, total) { return (COMBOS.get(n) && COMBOS.get(n).get(total)) || []; }
// a run whose total admits exactly one digit set
export function isFixed(n, total) { return combosFor(n, total).length === 1; }

// ─── a random legal filling ────────────────────────────────────────────────
export function fill(geo, rnd) {
  const val = new Map();
  const order = geo.whites.slice();
  const ok = (w, d) => {
    for (const ri of geo.cellRuns.get(w)) for (const x of geo.runs[ri].cells) if (x !== w && val.get(x) === d) return false;
    return true;
  };
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rec = (k) => {
    if (k === order.length) return true;
    const w = order[k];
    // extremes first more often than not: a run of small or large digits prints
    // a decisive total, which is where uniqueness comes from
    const ds = digits.slice().sort((a, b) => (rnd() - 0.5 + (Math.abs(a - 5) - Math.abs(b - 5)) * -0.12));
    for (const d of ds) { if (!ok(w, d)) continue; val.set(w, d); if (rec(k + 1)) return true; val.delete(w); }
    return false;
  };
  return rec(0) ? val : null;
}

export function totals(geo, val) {
  return geo.runs.map((run) => run.cells.reduce((s, x) => s + val.get(x), 0));
}

// ─── candidate propagation: the deduction a person makes ───────────────────
// For every run, enumerate the assignments of distinct digits consistent with
// the cells' current candidates and the run's total, and keep in each cell only
// the digits some assignment gives it. Repeat until nothing moves. Returns the
// candidate map, and `solved` when every cell is down to one digit.
const ALL = 0x3FE; // bits 1..9
const RUN_MEMO = new Map();
// per-run enumeration, memoised on (total, candidate masks): the same run
// state recurs constantly across refine steps and across boards
function runPossible(masks, total) {
  const key = total + '|' + masks.join(',');
  const hit = RUN_MEMO.get(key);
  if (hit) return hit;
  const n = masks.length;
  const possible = new Array(n).fill(0);
  const rec = (i, left, used) => {
    if (i === n) return left === 0;
    const k = n - i - 1;
    const lo = (k * (k + 1)) / 2, hi = k * 9 - (k * (k - 1)) / 2;
    let any = false;
    let m = masks[i] & ~used;
    while (m) {
      const bit = m & -m; m ^= bit;
      const d = 31 - Math.clz32(bit);
      const after = left - d;
      if (after < lo || after > hi) continue;
      if (rec(i + 1, after, used | bit)) { possible[i] |= bit; any = true; }
    }
    return any;
  };
  rec(0, total, 0);
  if (RUN_MEMO.size > 400000) RUN_MEMO.clear();
  RUN_MEMO.set(key, possible);
  return possible;
}
export function maskToSet(m) { const s = new Set(); for (let d = 1; d <= 9; d++) if (m & (1 << d)) s.add(d); return s; }
export function propagate(geo, sums, seed) {
  const cand = new Map();
  for (const w of geo.whites) cand.set(w, seed && seed.has(w) ? (1 << seed.get(w)) : ALL);
  let moved = true;
  let guard = 0;
  while (moved && guard++ < 200) {
    moved = false;
    for (let ri = 0; ri < geo.runs.length; ri++) {
      const cells = geo.runs[ri].cells;
      const masks = cells.map((c) => cand.get(c));
      const possible = runPossible(masks, sums[ri]);
      for (let i = 0; i < cells.length; i++) {
        if (possible[i] === 0) return { cand, solved: false, dead: true };
        if (possible[i] !== masks[i]) { cand.set(cells[i], possible[i]); moved = true; }
      }
    }
  }
  let solved = true;
  for (const w of geo.whites) { const m = cand.get(w); if (m & (m - 1)) { solved = false; break; } }
  return { cand, solved, dead: false, passes: guard };
}

// ─── count solutions, capped ───────────────────────────────────────────────
export function countSolutions(geo, sums, cap = 2) {
  const { cand, dead } = propagate(geo, sums);
  if (dead) return 0;
  const val = new Map();
  const bits = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
  const order = geo.whites.slice().sort((a, b) => bits(cand.get(a)) - bits(cand.get(b)));
  let n = 0;
  const runState = geo.runs.map((run) => ({ sum: 0, filled: 0, used: new Set(), len: run.cells.length }));
  const ok = (w, d) => {
    for (const ri of geo.cellRuns.get(w)) {
      const st = runState[ri];
      if (st.used.has(d)) return false;
      const tot = st.sum + d;
      const rem = st.len - st.filled - 1;
      if (tot > sums[ri]) return false;
      if (rem === 0) { if (tot !== sums[ri]) return false; continue; }
      const free = [];
      for (let x = 1; x <= 9; x++) if (!st.used.has(x) && x !== d) free.push(x);
      if (free.length < rem) return false;
      let mn = 0, mx = 0;
      for (let i = 0; i < rem; i++) { mn += free[i]; mx += free[free.length - 1 - i]; }
      if (tot + mn > sums[ri] || tot + mx < sums[ri]) return false;
    }
    return true;
  };
  const place = (w, d, on) => {
    for (const ri of geo.cellRuns.get(w)) {
      const st = runState[ri];
      if (on) { st.sum += d; st.filled++; st.used.add(d); } else { st.sum -= d; st.filled--; st.used.delete(d); }
    }
  };
  const rec = (k) => {
    if (k === order.length) { n++; return n >= cap; }
    const w = order[k];
    for (let d = 1; d <= 9; d++) {
      if (!(cand.get(w) & (1 << d))) continue;
      if (!ok(w, d)) continue;
      place(w, d, true); val.set(w, d);
      if (rec(k + 1)) return true;
      place(w, d, false); val.delete(w);
    }
    return false;
  };
  rec(0);
  return n;
}

// ─── random symmetric patterns ─────────────────────────────────────────────
// N is the full size including the clue row and column. Cells of the inner
// square go black with probability p, mirrored under 180-degree rotation.
// Drawn then REPAIRED: blacken the inner square at random (mirrored under a
// 180-degree turn), then fix what makes it illegal, in a loop: a white cell
// whose run is one cell long in either direction is blackened along with its
// mirror, and a run longer than nine is cut at its middle. Random blackening
// alone is illegal 97 times in 100 at 7x7, which is why the repair exists.
export function randomPattern(N, p, rnd) {
  const black = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => r === 0 || c === 0));
  for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) {
    const rr = N - r, cc = N - c;
    if (r * N + c > rr * N + cc) continue;
    const b = rnd() < p;
    black[r][c] = b; black[rr][cc] = b;
  }
  const paint = (r, c) => { black[r][c] = true; black[N - r][N - c] = true; };
  for (let guard = 0; guard < 400; guard++) {
    let fixedOne = false;
    for (let r = 1; r < N && !fixedOne; r++) for (let c = 1; c < N && !fixedOne; c++) {
      if (black[r][c]) continue;
      const left = black[r][c - 1], right = c + 1 >= N || black[r][c + 1];
      const up = black[r - 1][c], down = r + 1 >= N || black[r + 1][c];
      if ((left && right) || (up && down)) { paint(r, c); fixedOne = true; }
    }
    if (fixedOne) continue;
    // runs past nine
    for (let r = 1; r < N && !fixedOne; r++) {
      let c = 1;
      while (c < N && !fixedOne) {
        if (black[r][c]) { c++; continue; }
        const s = c; while (c < N && !black[r][c]) c++;
        if (c - s > 9) { paint(r, s + Math.floor((c - s) / 2)); fixedOne = true; }
      }
    }
    for (let c = 1; c < N && !fixedOne; c++) {
      let r = 1;
      while (r < N && !fixedOne) {
        if (black[r][c]) { r++; continue; }
        const s = r; while (r < N && !black[r][c]) r++;
        if (r - s > 9) { paint(s + Math.floor((r - s) / 2), c); fixedOne = true; }
      }
    }
    if (!fixedOne) break;
  }
  return black;
}

export function blackToRows(black) { return black.map((row) => row.map((b) => (b ? 1 : 0))); }

// ─── refine a filling until its totals are decisive ─────────────────────────
// A random filling is almost never unique (about one in seven hundred at 7x7),
// so the filling is SEARCHED for rather than drawn: change one digit at a time,
// keeping the run's digits distinct, and accept the change when propagation
// leaves fewer cells undecided. Zero undecided cells means propagation alone
// solves the board, which is both the uniqueness proof and the no-guessing
// proof in one. Returns the filling, or null if the search stalls.
export function undecided(geo, sums) {
  const { cand, dead } = propagate(geo, sums);
  if (dead) return Infinity;
  let n = 0;
  for (const w of geo.whites) { let m = cand.get(w); while (m) { m &= m - 1; n++; } n--; }
  return n;
}
export function refine(geo, val, rnd, maxSteps = 4000) {
  let sums = totals(geo, val);
  let score = undecided(geo, sums);
  const whites = geo.whites;
  const canTake = (w, d) => {
    for (const ri of geo.cellRuns.get(w)) for (const x of geo.runs[ri].cells) if (x !== w && val.get(x) === d) return false;
    return true;
  };
  let stall = 0;
  for (let step = 0; step < maxSteps && score > 0; step++) {
    const w = whites[Math.floor(rnd() * whites.length)];
    const old = val.get(w);
    const d = 1 + Math.floor(rnd() * 9);
    if (d === old || !canTake(w, d)) continue;
    val.set(w, d);
    const s2 = totals(geo, val);
    const sc2 = undecided(geo, s2);
    if (sc2 <= score) { if (sc2 < score) stall = 0; else stall++; score = sc2; sums = s2; }
    else { val.set(w, old); stall++; }
    if (stall > 1500) return null;
  }
  return score === 0 ? val : null;
}
