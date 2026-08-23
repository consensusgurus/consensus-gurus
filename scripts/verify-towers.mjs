// Verify the Towers bank (the daily skyscrapers puzzle).
//
//   node scripts/verify-towers.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. NOTHING is imported from
// scripts/towers-core.mjs, the engine that built the bank: the solvers here
// are independent implementations with different data structures and a
// different search order (the Cages/Sando rule; a shared solver certifies its
// own bugs).
//
//   - the LOGICAL solver here works on arrays of candidate Sets and prunes a
//     line by depth-first assignment with partial-visibility bounds, where the
//     generator's works on bitmasks against a precomputed permutation table.
//   - the UNIQUENESS counter here builds the square ROW BY ROW out of
//     candidate row-permutations with column masks and prefix-visibility
//     pruning, where the generator's goes cell by cell.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous ISO, dateLabel
//               agreeing with `live`, quizId of the form towers-M-D-YY derived
//               from `live`, no duplicate ids.
//   Solution    `sol` is an NxN Latin square of 1..N.
//   Clues       every printed clue equals the solution's true visibility count
//               for that line and side; `printed` equals the number printed.
//   Ramp        the printed-clue count is pinned per weekday: Mon 14, Tue 13,
//               Wed 12, Thu 11, Fri 10, Sat 9 on the 5x5; Sunday 18 on the 7x7.
//   Sunday      sunday:true exactly on real Sundays, and only Sundays are 7x7.
//   Uniqueness  EXACTLY one solution, from the independent row-permutation
//               counter.
//   No guessing the board falls to the independent line-assignment solver,
//               and every digit that solver settles matches `sol` (an unsound
//               rule cannot certify itself).
//   Variety     no solution grid and no printed-clue layout repeats.
//   Runway      how many days of bank are left, as a note.
//
// Mutation-tested by scripts/sudoku-trio-mutation-test.mjs (set
// VERIFY_TOWERS_BANK to point this file at a mutated copy).
const BANK = process.env.VERIFY_TOWERS_BANK
  ? `file://${process.env.VERIFY_TOWERS_BANK}`
  : new URL('../app/towers/puzzles.js', import.meta.url).href;
const { PUZZLES } = await import(BANK);

const fails = [];
const note = [];
const TARGET = { 1: 14, 2: 13, 3: 12, 4: 11, 5: 10, 6: 9, 0: 18 };
const SIZE = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 0: 7 };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const dowOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
const addDays = (iso, n) => {
  const t = new Date(iso + 'T12:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};

function vis(line) {
  let mx = 0, n = 0;
  for (const v of line) { if (v > mx) { mx = v; n++; } }
  return n;
}

// ── independent logical solver: candidate Sets, line DFS pruning ────────────
// For each row/column, the allowed digit set per cell is narrowed to the union
// over all completions of that line that (a) respect current candidates,
// (b) are a permutation, and (c) satisfy both printed clues. The line is
// explored by DFS with a running visibility count and bound, never by a
// permutation table.
function logicSolvable(N, clues, sol) {
  const cand = Array.from({ length: N * N }, () => new Set(Array.from({ length: N }, (_, d) => d + 1)));
  const lines = [];
  for (let r = 0; r < N; r++) lines.push({ cells: Array.from({ length: N }, (_, c) => r * N + c), f: clues.left[r] || 0, b: clues.right[r] || 0 });
  for (let c = 0; c < N; c++) lines.push({ cells: Array.from({ length: N }, (_, r) => r * N + c), f: clues.top[c] || 0, b: clues.bottom[c] || 0 });

  const sweepLine = (L) => {
    const n = L.cells.length;
    const allow = Array.from({ length: n }, () => new Set());
    const cur = Array(n).fill(0);
    const used = new Set();
    const rec = (k, mx, seen) => {
      if (k === n) {
        if (L.f && seen !== L.f) return;
        if (L.b && vis(cur.slice().reverse()) !== L.b) return;
        for (let i = 0; i < n; i++) allow[i].add(cur[i]);
        return;
      }
      for (const d of cand[L.cells[k]]) {
        if (used.has(d)) continue;
        const nSeen = d > mx ? seen + 1 : seen;
        if (L.f && nSeen > L.f) continue;
        // bound: remaining possible new maxima
        if (L.f && nSeen + Math.min(n - k - 1, N - Math.max(mx, d)) < L.f) continue;
        cur[k] = d; used.add(d);
        rec(k + 1, Math.max(mx, d), nSeen);
        used.delete(d);
      }
    };
    rec(0, 0, 0);
    let changed = false;
    for (let i = 0; i < n; i++) {
      const cell = L.cells[i];
      for (const d of [...cand[cell]]) {
        if (!allow[i].has(d)) { cand[cell].delete(d); changed = true; }
      }
      if (cand[cell].size === 0) return null;
    }
    return changed;
  };

  for (let pass = 0; pass < 80; pass++) {
    let changed = false;
    for (const L of lines) {
      const r = sweepLine(L);
      if (r === null) return { solved: false, agree: false };
      if (r) changed = true;
    }
    let done = true;
    for (let i = 0; i < N * N; i++) if (cand[i].size !== 1) { done = false; break; }
    if (done) {
      let agree = true;
      for (let i = 0; i < N * N; i++) {
        const d = [...cand[i]][0];
        if (sol[Math.floor(i / N)][i % N] !== d) agree = false;
      }
      return { solved: true, agree };
    }
    if (!changed) return { solved: false, agree: false };
  }
  return { solved: false, agree: false };
}

// ── independent uniqueness counter: row-permutation search ──────────────────
function countSolutionsRows(N, clues, cap = 2) {
  // all permutations of 1..N with forward/backward visibility, built here on
  // its own (tiny for N<=7)
  const perms = [];
  const a = Array.from({ length: N }, (_, i) => i + 1);
  const rec0 = (k) => {
    if (k === N) { perms.push({ p: a.slice(), vf: vis(a), vb: vis(a.slice().reverse()) }); return; }
    for (let i = k; i < N; i++) { [a[k], a[i]] = [a[i], a[k]]; rec0(k + 1); [a[k], a[i]] = [a[i], a[k]]; }
  };
  rec0(0);

  const colUsed = Array(N).fill(0);
  const colMax = Array(N).fill(0);
  const colSeen = Array(N).fill(0);
  let found = 0;
  const grid = [];

  const rowFits = (P, r) => {
    if (clues.left[r] && P.vf !== clues.left[r]) return false;
    if (clues.right[r] && P.vb !== clues.right[r]) return false;
    for (let c = 0; c < N; c++) if (colUsed[c] & (1 << P.p[c])) return false;
    return true;
  };

  const rec = (r) => {
    if (found >= cap) return;
    if (r === N) {
      for (let c = 0; c < N; c++) {
        const col = grid.map((row) => row[c]);
        if (clues.top[c] && vis(col) !== clues.top[c]) return;
        if (clues.bottom[c] && vis(col.slice().reverse()) !== clues.bottom[c]) return;
      }
      found++;
      return;
    }
    for (const P of perms) {
      if (!rowFits(P, r)) continue;
      // column prefix-visibility bound for printed top clues
      let ok = true;
      const saved = [];
      for (let c = 0; c < N && ok; c++) {
        const d = P.p[c];
        saved.push([colUsed[c], colMax[c], colSeen[c]]);
        colUsed[c] |= 1 << d;
        if (d > colMax[c]) { colMax[c] = d; colSeen[c]++; }
        const T = clues.top[c];
        if (T) {
          if (colSeen[c] > T) ok = false;
          else if (colSeen[c] + Math.min(N - r - 1, N - colMax[c]) < T) ok = false;
        }
      }
      if (ok) {
        grid.push(P.p);
        rec(r + 1);
        grid.pop();
      }
      for (let c = saved.length - 1; c >= 0; c--) {
        [colUsed[c], colMax[c], colSeen[c]] = saved[c];
      }
      if (found >= cap) return;
    }
  };
  rec(0);
  return found;
}

// ── the sweep ────────────────────────────────────────────────────────────────
const ids = new Set();
const solSeen = new Map();
const layoutSeen = new Map();

PUZZLES.forEach((p, idx) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== idx + 1) fails.push(`${tag}: num out of sequence`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live)) fails.push(`${tag}: live is not ISO`);
  if (idx > 0 && p.live !== addDays(PUZZLES[idx - 1].live, 1)) fails.push(`${tag}: date not contiguous with previous`);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${d}, ${y}`) fails.push(`${tag}: dateLabel disagrees with live`);
  const wantId = `towers-${m}-${d}-${String(y).slice(2)}`;
  if (p.quizId !== wantId) fails.push(`${tag}: quizId ${p.quizId}, expected ${wantId}`);
  if (ids.has(p.quizId)) fails.push(`${tag}: duplicate quizId`);
  ids.add(p.quizId);

  const dow = dowOf(p.live);
  if (p.sunday !== (dow === 0)) fails.push(`${tag}: sunday flag is ${p.sunday} on a ${dow === 0 ? 'Sunday' : 'weekday'}`);
  const N = SIZE[dow];
  if (p.size !== N) fails.push(`${tag}: size ${p.size}, expected ${N} for that weekday`);
  if (!Array.isArray(p.sol) || p.sol.length !== N || p.sol.some((r) => r.length !== N)) {
    fails.push(`${tag}: sol is not ${N}x${N}`);
    return;
  }

  // Latin square
  for (let r = 0; r < N; r++) {
    if (new Set(p.sol[r]).size !== N || p.sol[r].some((v) => v < 1 || v > N)) fails.push(`${tag}: row ${r} is not a permutation of 1..${N}`);
  }
  for (let c = 0; c < N; c++) {
    if (new Set(p.sol.map((r) => r[c])).size !== N) fails.push(`${tag}: column ${c} repeats a height`);
  }

  // clues match the solution, printed count matches the day
  let printed = 0;
  for (let c = 0; c < N; c++) {
    const col = p.sol.map((row) => row[c]);
    if (p.clues.top[c]) { printed++; if (p.clues.top[c] !== vis(col)) fails.push(`${tag}: top clue ${c} is ${p.clues.top[c]}, solution shows ${vis(col)}`); }
    if (p.clues.bottom[c]) { printed++; if (p.clues.bottom[c] !== vis(col.slice().reverse())) fails.push(`${tag}: bottom clue ${c} wrong`); }
  }
  for (let r = 0; r < N; r++) {
    if (p.clues.left[r]) { printed++; if (p.clues.left[r] !== vis(p.sol[r])) fails.push(`${tag}: left clue ${r} wrong`); }
    if (p.clues.right[r]) { printed++; if (p.clues.right[r] !== vis(p.sol[r].slice().reverse())) fails.push(`${tag}: right clue ${r} wrong`); }
  }
  if (printed !== TARGET[dow]) fails.push(`${tag}: ${printed} clues printed, the ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]} ramp pins ${TARGET[dow]}`);
  if (p.printed !== printed) fails.push(`${tag}: printed field says ${p.printed}, board shows ${printed}`);

  // No guessing AND uniqueness, both from the independent solver. Every
  // line-sweep elimination is sound (a digit is dropped only when NO
  // clue-satisfying completion of that line uses it), so candidates always
  // contain every solution; ending all-singleton is therefore a proof of
  // exactly one solution as well as of logic-solvability. The brute counter
  // below is a third angle where it is cheap; on a 7x7 it explodes and the
  // propagation proof carries Sunday alone.
  const lg = logicSolvable(N, p.clues, p.sol);
  if (!lg.solved) fails.push(`${tag}: not solvable by the line-sweep technique set (guessing would be required)`);
  else if (!lg.agree) fails.push(`${tag}: the logical solver settled a digit that disagrees with sol`);
  if (N <= 5) {
    const n = countSolutionsRows(N, p.clues, 2);
    if (n !== 1) fails.push(`${tag}: ${n} solutions (must be exactly 1)`);
  }

  // variety
  const sKey = p.sol.flat().join('');
  if (solSeen.has(sKey)) fails.push(`${tag}: solution grid repeats ${solSeen.get(sKey)}`);
  solSeen.set(sKey, tag);
  const lKey = `${N}|${p.clues.top.join(',')}|${p.clues.right.join(',')}|${p.clues.bottom.join(',')}|${p.clues.left.join(',')}`;
  if (layoutSeen.has(lKey)) fails.push(`${tag}: clue layout repeats ${layoutSeen.get(lKey)}`);
  layoutSeen.set(lKey, tag);
});

const today = new Date().toISOString().slice(0, 10);
const left = PUZZLES.filter((p) => p.live > today).length;
note.push(`${PUZZLES.length} boards, ${PUZZLES.filter((p) => p.sunday).length} Sundays, ${left} days of runway after ${today}`);

for (const n of note) console.log(`note  ${n}`);
for (const f of fails) console.log(`FAIL  ${f}`);
console.log(fails.length ? `\n${fails.length} failure(s).` : '\nOK');
process.exit(fails.length ? 1 : 0);
