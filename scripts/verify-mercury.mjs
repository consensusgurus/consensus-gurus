// Verify the Mercury bank (the daily thermo sudoku).
//
//   node scripts/verify-mercury.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. NOTHING is imported from
// scripts/mercury-core.mjs (the Cages/Sando rule): the solvers here are
// independent implementations.
//
//   - the LOGICAL solver here works on candidate Sets, prunes thermos as
//     PAIRWISE a<b arc revisions between consecutive cells (iterated to a
//     fixpoint this equals the generator's whole-path bounds walk, but the
//     algorithm and data structures share nothing), and POLICES itself: every
//     digit it settles is checked against `sol`, so an unsound rule is
//     reported rather than trusted (the Cages discipline).
//   - the UNIQUENESS counter here walks cells in plain index order over
//     row/col/box masks, where the generator's picks the most-constrained
//     cell.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous ISO, dateLabel and
//               quizId (mercury-M-D-YY) derived from `live`, no duplicates.
//   Solution    `sol` is a legal 9x9 sudoku filling.
//   Thermos     orthogonal, connected, no cell in two thermos, strictly
//               increasing along `sol`; weekdays six thermos of 4-7 cells,
//               Sundays nine of 4-9.
//   Givens      every printed digit equals `sol`, and the count is pinned per
//               weekday: Mon 30, Tue 27, Wed 24, Thu 21, Fri 18, Sat 15,
//               Sunday 8 (the ramp is the printed-given count, nothing else).
//   Uniqueness  EXACTLY one solution, from the independent counter.
//   No guessing the board falls to the independent graded solver (thermo arcs,
//               singles, locked candidates, pairs).
//   Sunday      sunday:true exactly on real Sundays.
//   Variety     no solution grid repeats; no thermo layout repeats.
//   Runway      how many days of bank are left, as a note.
//
// Mutation-tested by scripts/sudoku-trio-mutation-test.mjs (set
// VERIFY_MERCURY_BANK to point this file at a mutated copy).
const BANK = process.env.VERIFY_MERCURY_BANK
  ? `file://${process.env.VERIFY_MERCURY_BANK}`
  : new URL('../app/mercury/puzzles.js', import.meta.url).href;
const { PUZZLES } = await import(BANK);

const fails = [];
const note = [];
const TARGET = { 1: 30, 2: 27, 3: 24, 4: 21, 5: 18, 6: 15, 0: 8 };
const TH_SHAPE = { weekday: { count: 6, minLen: 4, maxLen: 7 }, sunday: { count: 9, minLen: 4, maxLen: 9 } };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dowOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
const addDays = (iso, n) => {
  const t = new Date(iso + 'T12:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

// units, built here on their own
const UNITS = [];
for (let r = 0; r < 9; r++) UNITS.push(Array.from({ length: 9 }, (_, c) => [r, c]));
for (let c = 0; c < 9; c++) UNITS.push(Array.from({ length: 9 }, (_, r) => [r, c]));
for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
  const u = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) u.push([br * 3 + r, bc * 3 + c]);
  UNITS.push(u);
}
const sameUnit = (a, b) => a[0] === b[0] || a[1] === b[1] || boxOf(a[0], a[1]) === boxOf(b[0], b[1]);

// ── independent graded logical solver on Sets, policed against sol ─────────
function logicSolve(p) {
  const cand = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set([1,2,3,4,5,6,7,8,9])));
  let unsound = null;
  const setOnly = (r, c, d) => {
    if (p.sol[r][c] !== d) unsound = `settled ${d} at r${r + 1}c${c + 1}, sol has ${p.sol[r][c]}`;
    cand[r][c] = new Set([d]);
  };
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (p.given[r][c]) setOnly(r, c, p.given[r][c]);

  const drop = (r, c, d) => {
    if (!cand[r][c].has(d)) return false;
    if (p.sol[r][c] === d) unsound = `eliminated the true digit ${d} from r${r + 1}c${c + 1}`;
    cand[r][c].delete(d);
    return true;
  };

  const arcs = () => {
    for (;;) {
      let changed = false;
      // thermo pairwise a<b revisions
      for (const t of p.thermos) {
        for (let k = 0; k + 1 < t.length; k++) {
          const [ar, ac] = t[k], [br, bc] = t[k + 1];
          const bMax = Math.max(...cand[br][bc]);
          for (const d of [...cand[ar][ac]]) if (d >= bMax) { if (drop(ar, ac, d)) changed = true; }
          const aMin = Math.min(...cand[ar][ac]);
          for (const d of [...cand[br][bc]]) if (d <= aMin) { if (drop(br, bc, d)) changed = true; }
        }
      }
      // peer elimination around singles
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        if (cand[r][c].size !== 1) continue;
        const d = [...cand[r][c]][0];
        for (let rr = 0; rr < 9; rr++) for (let cc = 0; cc < 9; cc++) {
          if (rr === r && cc === c) continue;
          if (sameUnit([r, c], [rr, cc]) && cand[rr][cc].has(d)) { if (drop(rr, cc, d)) changed = true; }
        }
      }
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!cand[r][c].size) return false;
      if (!changed) return true;
    }
  };

  const hiddenSingle = () => {
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const spots = u.filter(([r, c]) => cand[r][c].has(d));
        if (spots.length === 1 && cand[spots[0][0]][spots[0][1]].size > 1) {
          setOnly(spots[0][0], spots[0][1], d);
          return true;
        }
      }
    }
    return false;
  };
  const locked = () => {
    for (let ui = 18; ui < 27; ui++) {
      const box = UNITS[ui];
      for (let d = 1; d <= 9; d++) {
        const spots = box.filter(([r, c]) => cand[r][c].has(d));
        if (spots.length < 2) continue;
        const rows = new Set(spots.map(([r]) => r));
        const cols = new Set(spots.map(([, c]) => c));
        if (rows.size === 1) {
          const r = [...rows][0];
          let hit = false;
          for (let c = 0; c < 9; c++) if (boxOf(r, c) !== boxOf(spots[0][0], spots[0][1]) && drop(r, c, d)) hit = true;
          if (hit) return true;
        }
        if (cols.size === 1) {
          const c = [...cols][0];
          let hit = false;
          for (let r = 0; r < 9; r++) if (boxOf(r, c) !== boxOf(spots[0][0], spots[0][1]) && drop(r, c, d)) hit = true;
          if (hit) return true;
        }
      }
    }
    for (let ui = 0; ui < 18; ui++) {
      const u = UNITS[ui];
      for (let d = 1; d <= 9; d++) {
        const spots = u.filter(([r, c]) => cand[r][c].has(d));
        if (spots.length < 2) continue;
        const boxes = new Set(spots.map(([r, c]) => boxOf(r, c)));
        if (boxes.size !== 1) continue;
        const b = [...boxes][0];
        let hit = false;
        for (const [r, c] of UNITS[18 + b]) {
          if (!u.some(([ur, uc]) => ur === r && uc === c) && drop(r, c, d)) hit = true;
        }
        if (hit) return true;
      }
    }
    return false;
  };
  const pairs2 = () => {
    for (const u of UNITS) {
      for (let x = 0; x < u.length; x++) {
        const [ir, ic] = u[x];
        if (cand[ir][ic].size !== 2) continue;
        for (let y = x + 1; y < u.length; y++) {
          const [jr, jc] = u[y];
          if (cand[jr][jc].size !== 2) continue;
          const a = [...cand[ir][ic]], b = [...cand[jr][jc]];
          if (a[0] !== b[0] || a[1] !== b[1]) continue;
          let hit = false;
          for (const [kr, kc] of u) {
            if ((kr === ir && kc === ic) || (kr === jr && kc === jc)) continue;
            for (const d of a) if (drop(kr, kc, d)) hit = true;
          }
          if (hit) return true;
        }
      }
      for (let d1 = 1; d1 <= 9; d1++) for (let d2 = d1 + 1; d2 <= 9; d2++) {
        const s1 = u.filter(([r, c]) => cand[r][c].has(d1));
        const s2 = u.filter(([r, c]) => cand[r][c].has(d2));
        if (s1.length !== 2 || s2.length !== 2) continue;
        if (s1[0][0] !== s2[0][0] || s1[0][1] !== s2[0][1] || s1[1][0] !== s2[1][0] || s1[1][1] !== s2[1][1]) continue;
        let hit = false;
        for (const [r, c] of s1) {
          for (const d of [...cand[r][c]]) if (d !== d1 && d !== d2 && drop(r, c, d)) hit = true;
        }
        if (hit) return true;
      }
    }
    return false;
  };

  for (;;) {
    if (!arcs()) return { solved: false, unsound };
    let done = true;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (cand[r][c].size !== 1) done = false;
    if (done) return { solved: true, unsound };
    if (hiddenSingle()) continue;
    if (locked()) continue;
    if (pairs2()) continue;
    return { solved: false, unsound };
  }
}

// ── independent uniqueness counter ──────────────────────────────────────────
// Forward-checking search over candidate masks with whole-path thermo bound
// propagation after every assignment, branching on the tightest cell. The
// generator's counter is check-based (no propagation, candidates re-counted
// per cell per node); this one maintains masks and prunes paths, so the two
// share neither algorithm nor data structures. (Plain index order was tried
// here first and ran nearly a minute on the sparsest boards.)
function countSolutions(p, cap = 2) {
  const FULLM = (1 << 10) - 2;
  const cand = new Array(81).fill(FULLM);
  const bitCount = (m) => { let n = 0; while (m) { m &= m - 1; n++; } return n; };
  const minOf = (m) => { for (let d = 1; d <= 9; d++) if (m & (1 << d)) return d; return 10; };
  const maxOf = (m) => { for (let d = 9; d >= 1; d--) if (m & (1 << d)) return d; return 0; };

  const peers = Array.from({ length: 81 }, () => []);
  for (let i = 0; i < 81; i++) {
    const r = Math.floor(i / 9), c = i % 9;
    for (let j = 0; j < 81; j++) {
      if (j === i) continue;
      const rr = Math.floor(j / 9), cc = j % 9;
      if (rr === r || cc === c || boxOf(rr, cc) === boxOf(r, c)) peers[i].push(j);
    }
  }
  const paths = p.thermos.map((t) => t.map(([r, c]) => r * 9 + c));
  const pathOf = Array(81).fill(-1);
  paths.forEach((t, ti) => t.forEach((i) => { pathOf[i] = ti; }));

  // static positional bounds
  paths.forEach((t) => t.forEach((i, k) => {
    let m = 0;
    for (let d = k + 1; d <= 9 - (t.length - 1 - k); d++) m |= 1 << d;
    cand[i] &= m;
  }));
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (p.given[r][c]) cand[r * 9 + c] = 1 << p.given[r][c];
  }

  // propagate: assigned-single peer elimination + thermo lo/hi walks, to a
  // fixpoint; returns false on a wipeout. Operates on the shared cand array;
  // callers snapshot and restore around it.
  const propagate = () => {
    for (;;) {
      let changed = false;
      for (let i = 0; i < 81; i++) {
        if (bitCount(cand[i]) !== 1) continue;
        for (const j of peers[i]) {
          const nx = cand[j] & ~cand[i];
          if (nx !== cand[j]) { cand[j] = nx; changed = true; if (!nx) return false; }
        }
      }
      for (const t of paths) {
        let lo = 0;
        for (let k = 0; k < t.length; k++) {
          lo = Math.max(minOf(cand[t[k]]), lo + 1);
          if (lo > 9) return false;
          let m = cand[t[k]];
          for (let d = 1; d < lo; d++) m &= ~(1 << d);
          if (m !== cand[t[k]]) { cand[t[k]] = m; changed = true; if (!m) return false; }
        }
        let hi = 10;
        for (let k = t.length - 1; k >= 0; k--) {
          hi = Math.min(maxOf(cand[t[k]]), hi - 1);
          if (hi < 1) return false;
          let m = cand[t[k]];
          for (let d = 9; d > hi; d--) m &= ~(1 << d);
          if (m !== cand[t[k]]) { cand[t[k]] = m; changed = true; if (!m) return false; }
        }
      }
      if (!changed) return true;
    }
  };

  let found = 0;
  const rec = () => {
    if (found >= cap) return;
    const snap = cand.slice();
    if (!propagate()) { for (let i = 0; i < 81; i++) cand[i] = snap[i]; return; }
    let best = -1, bestN = 99;
    for (let i = 0; i < 81; i++) {
      const n = bitCount(cand[i]);
      if (n === 0) { for (let j = 0; j < 81; j++) cand[j] = snap[j]; return; }
      if (n > 1 && n < bestN) { bestN = n; best = i; }
    }
    if (best < 0) { found++; for (let i = 0; i < 81; i++) cand[i] = snap[i]; return; }
    const opts = cand[best];
    for (let d = 1; d <= 9 && found < cap; d++) {
      if (!(opts & (1 << d))) continue;
      const snap2 = cand.slice();
      cand[best] = 1 << d;
      rec();
      for (let i = 0; i < 81; i++) cand[i] = snap2[i];
    }
    for (let i = 0; i < 81; i++) cand[i] = snap[i];
  };
  rec();
  return found;
}

// ── the sweep ────────────────────────────────────────────────────────────────
const ids = new Set();
const solSeen = new Map();
const thSeen = new Map();

PUZZLES.forEach((p, idx) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== idx + 1) fails.push(`${tag}: num out of sequence`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live)) fails.push(`${tag}: live is not ISO`);
  if (idx > 0 && p.live !== addDays(PUZZLES[idx - 1].live, 1)) fails.push(`${tag}: date not contiguous with previous`);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${d}, ${y}`) fails.push(`${tag}: dateLabel disagrees with live`);
  const wantId = `mercury-${m}-${d}-${String(y).slice(2)}`;
  if (p.quizId !== wantId) fails.push(`${tag}: quizId ${p.quizId}, expected ${wantId}`);
  if (ids.has(p.quizId)) fails.push(`${tag}: duplicate quizId`);
  ids.add(p.quizId);

  const dow = dowOf(p.live);
  if (p.sunday !== (dow === 0)) fails.push(`${tag}: sunday flag wrong for its date`);

  // solution legality
  for (const u of UNITS) {
    const vals = u.map(([r, c]) => p.sol[r][c]);
    if (new Set(vals).size !== 9 || vals.some((v) => v < 1 || v > 9)) { fails.push(`${tag}: sol violates a unit`); break; }
  }

  // thermo shape
  const shape = dow === 0 ? TH_SHAPE.sunday : TH_SHAPE.weekday;
  if (p.thermos.length !== shape.count) fails.push(`${tag}: ${p.thermos.length} thermos, expected ${shape.count}`);
  const cellUse = new Set();
  for (const t of p.thermos) {
    if (t.length < shape.minLen || t.length > shape.maxLen) fails.push(`${tag}: a thermo of ${t.length} cells is outside ${shape.minLen}-${shape.maxLen}`);
    for (let k = 0; k < t.length; k++) {
      const [r, c] = t[k];
      const key = r * 9 + c;
      if (cellUse.has(key)) fails.push(`${tag}: two thermos share r${r + 1}c${c + 1}`);
      cellUse.add(key);
      if (k > 0) {
        const [pr, pc] = t[k - 1];
        if (Math.abs(pr - r) + Math.abs(pc - c) !== 1) fails.push(`${tag}: a thermo takes a non-orthogonal step`);
        if (p.sol[pr][pc] >= p.sol[r][c]) fails.push(`${tag}: a thermo does not strictly increase along sol`);
      }
    }
  }

  // givens
  let printed = 0;
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
    if (!p.given[r][c]) continue;
    printed++;
    if (p.given[r][c] !== p.sol[r][c]) fails.push(`${tag}: given at r${r + 1}c${c + 1} disagrees with sol`);
  }
  if (printed !== TARGET[dow]) fails.push(`${tag}: ${printed} givens, the ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]} ramp pins ${TARGET[dow]}`);
  if (p.printed !== printed) fails.push(`${tag}: printed field says ${p.printed}, board shows ${printed}`);

  // uniqueness + no guessing
  const n = countSolutions(p, 2);
  if (n !== 1) fails.push(`${tag}: ${n} solutions (must be exactly 1)`);
  const lg = logicSolve(p);
  if (lg.unsound) fails.push(`${tag}: UNSOUND RULE - ${lg.unsound}`);
  if (!lg.solved) fails.push(`${tag}: not solvable by the graded technique set (guessing would be required)`);

  const sKey = p.sol.flat().join('');
  if (solSeen.has(sKey)) fails.push(`${tag}: solution grid repeats ${solSeen.get(sKey)}`);
  solSeen.set(sKey, tag);
  const tKey = p.thermos.map((t) => t.map(([r, c]) => `${r}${c}`).join('-')).sort().join('|');
  if (thSeen.has(tKey)) fails.push(`${tag}: thermo layout repeats ${thSeen.get(tKey)}`);
  thSeen.set(tKey, tag);
});

const today = new Date().toISOString().slice(0, 10);
note.push(`${PUZZLES.length} boards, ${PUZZLES.filter((p) => p.sunday).length} Sundays, ${PUZZLES.filter((p) => p.live > today).length} days of runway after ${today}`);
for (const n of note) console.log(`note  ${n}`);
for (const f of fails) console.log(`FAIL  ${f}`);
console.log(fails.length ? `\n${fails.length} failure(s).` : '\nOK');
process.exit(fails.length ? 1 : 0);
