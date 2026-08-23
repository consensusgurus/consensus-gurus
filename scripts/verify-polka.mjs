// Verify the Polka bank (the daily kropki sudoku).
//
//   node scripts/verify-polka.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. NOTHING is imported from
// scripts/polka-core.mjs (the Cages/Sando rule): the solvers here are
// independent implementations, and the graded solver POLICES itself against
// `sol` (the Cages discipline), so an unsound rule is reported rather than
// certifying the bank.
//
//   - the LOGICAL solver here works on candidate Sets with the dot rules
//     applied as per-edge support filters, where the generator's works on
//     integer bitmasks; its unit scans and technique order are its own.
//   - the UNIQUENESS counter here walks cells in plain index order over
//     row/col/box masks with dot checks against settled neighbours, where the
//     generator's picks the most-constrained cell over pruned candidates.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous ISO, dateLabel and
//               quizId (polka-M-D-YY) derived from `live`, no duplicates.
//   Solution    `sol` is a legal 9x9 sudoku filling.
//   Dots        every stored dot is TRUE of `sol` (white = differ by 1, black
//               = one is double the other), every absent dot is true too
//               (neither rule holds), and a 1-2 pair carries one dot of either
//               colour. The dots are the whole clue set, so one wrong dot is a
//               lie printed on the board.
//   Uniqueness  EXACTLY one solution, from the independent counter.
//   No guessing the deal falls to the independent graded solver (dot arcs,
//               singles, locked candidates, pairs).
//   Grade       `cost` recomputed by that solver and required to match.
//   Ramp        cost sits in the pinned weekday band: Mon <=10, Tue 11-24,
//               Wed 25-38, Thu 39-54, Fri 55-78, Sat 79-110, Sunday 120+.
//   Sunday      sunday:true exactly on real Sundays.
//   Variety     no solution grid repeats.
//   Runway      how many days of bank are left, as a note.
//
// Mutation-tested by scripts/sudoku-trio-mutation-test.mjs (set
// VERIFY_POLKA_BANK to point this file at a mutated copy).
const BANK = process.env.VERIFY_POLKA_BANK
  ? `file://${process.env.VERIFY_POLKA_BANK}`
  : new URL('../app/polka/puzzles.js', import.meta.url).href;
const { PUZZLES } = await import(BANK);

const fails = [];
const note = [];
const BAND = { 1: [0, 10], 2: [11, 24], 3: [25, 38], 4: [39, 54], 5: [55, 78], 6: [79, 110], 0: [120, Infinity] };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const dowOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
const addDays = (iso, n) => {
  const t = new Date(iso + 'T12:00:00Z');
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);
const consec = (a, b) => Math.abs(a - b) === 1;
const dbl = (a, b) => a === 2 * b || b === 2 * a;
const dotOk = (t, a, b) => (t === 1 ? consec(a, b) : t === 2 ? dbl(a, b) : (!consec(a, b) && !dbl(a, b)));

const UNITS = [];
for (let r = 0; r < 9; r++) UNITS.push(Array.from({ length: 9 }, (_, c) => [r, c]));
for (let c = 0; c < 9; c++) UNITS.push(Array.from({ length: 9 }, (_, r) => [r, c]));
for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
  const u = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) u.push([br * 3 + r, bc * 3 + c]);
  UNITS.push(u);
}
const sameUnit = (a, b) => a[0] === b[0] || a[1] === b[1] || boxOf(a[0], a[1]) === boxOf(b[0], b[1]);

function edgesOf(p) {
  const out = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) out.push([[r, c], [r, c + 1], p.dots.h[r][c]]);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) out.push([[r, c], [r + 1, c], p.dots.v[r][c]]);
  return out;
}

// ── independent graded solver, policed against sol ─────────────────────────
function logicSolve(p) {
  const cand = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set([1,2,3,4,5,6,7,8,9])));
  const tally = { hidden: 0, locked: 0, pairs2: 0 };
  let unsound = null;
  const adj = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
  for (const [a, b, t] of edgesOf(p)) {
    adj[a[0]][a[1]].push([b, t]);
    adj[b[0]][b[1]].push([a, t]);
  }
  const drop = (r, c, d) => {
    if (!cand[r][c].has(d)) return false;
    if (p.sol[r][c] === d) unsound = `eliminated the true digit ${d} from r${r + 1}c${c + 1}`;
    cand[r][c].delete(d);
    return true;
  };
  const setOnly = (r, c, d) => {
    if (p.sol[r][c] !== d) unsound = `settled ${d} at r${r + 1}c${c + 1}, sol has ${p.sol[r][c]}`;
    for (const x of [...cand[r][c]]) if (x !== d) cand[r][c].delete(x);
  };

  const arcs = () => {
    for (;;) {
      let changed = false;
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
        for (const [[nr, nc], t] of adj[r][c]) {
          for (const a of [...cand[r][c]]) {
            let supported = false;
            for (const b of cand[nr][nc]) {
              if (a === b) continue;
              if (dotOk(t, a, b)) { supported = true; break; }
            }
            if (!supported) { if (drop(r, c, a)) changed = true; }
          }
          if (!cand[r][c].size) return false;
        }
        if (cand[r][c].size === 1) {
          const d = [...cand[r][c]][0];
          for (let rr = 0; rr < 9; rr++) for (let cc = 0; cc < 9; cc++) {
            if (rr === r && cc === c) continue;
            if (sameUnit([r, c], [rr, cc]) && cand[rr][cc].has(d)) { if (drop(rr, cc, d)) changed = true; if (!cand[rr][cc].size) return false; }
          }
        }
      }
      if (!changed) return true;
    }
  };

  const hiddenSingle = () => {
    for (const u of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const spots = u.filter(([r, c]) => cand[r][c].has(d));
        if (spots.length === 1 && cand[spots[0][0]][spots[0][1]].size > 1) {
          setOnly(spots[0][0], spots[0][1], d);
          tally.hidden++;
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
          if (hit) { tally.locked++; return true; }
        }
        if (cols.size === 1) {
          const c = [...cols][0];
          let hit = false;
          for (let r = 0; r < 9; r++) if (boxOf(r, c) !== boxOf(spots[0][0], spots[0][1]) && drop(r, c, d)) hit = true;
          if (hit) { tally.locked++; return true; }
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
        if (hit) { tally.locked++; return true; }
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
          const a = [...cand[ir][ic]].sort(), b = [...cand[jr][jc]].sort();
          if (a[0] !== b[0] || a[1] !== b[1]) continue;
          let hit = false;
          for (const [kr, kc] of u) {
            if ((kr === ir && kc === ic) || (kr === jr && kc === jc)) continue;
            for (const d of a) if (drop(kr, kc, d)) hit = true;
          }
          if (hit) { tally.pairs2++; return true; }
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
        if (hit) { tally.pairs2++; return true; }
      }
    }
    return false;
  };

  for (;;) {
    if (!arcs()) return { solved: false, unsound, cost: 0 };
    let done = true;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (cand[r][c].size !== 1) done = false;
    if (done) return { solved: true, unsound, cost: tally.hidden * 4 + tally.locked * 12 + tally.pairs2 * 20 };
    if (hiddenSingle()) continue;
    if (locked()) continue;
    if (pairs2()) continue;
    return { solved: false, unsound, cost: 0 };
  }
}

// ── independent uniqueness counter ──────────────────────────────────────────
function countSolutions(p, cap = 2) {
  const g = Array.from({ length: 9 }, () => Array(9).fill(0));
  const rowM = Array(9).fill(0), colM = Array(9).fill(0), boxM = Array(9).fill(0);
  const adj = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
  for (const [a, b, t] of edgesOf(p)) {
    adj[a[0]][a[1]].push([b, t]);
    adj[b[0]][b[1]].push([a, t]);
  }
  let found = 0;
  const ok = (r, c, d) => {
    const m = 1 << d;
    if ((rowM[r] & m) || (colM[c] & m) || (boxM[boxOf(r, c)] & m)) return false;
    for (const [[nr, nc], t] of adj[r][c]) {
      const v = g[nr][nc];
      if (v && !dotOk(t, d, v)) return false;
    }
    return true;
  };
  const rec = (i) => {
    if (found >= cap) return;
    if (i === 81) { found++; return; }
    const r = Math.floor(i / 9), c = i % 9;
    for (let d = 1; d <= 9; d++) {
      if (!ok(r, c, d)) continue;
      const m = 1 << d;
      g[r][c] = d; rowM[r] |= m; colM[c] |= m; boxM[boxOf(r, c)] |= m;
      rec(i + 1);
      g[r][c] = 0; rowM[r] &= ~m; colM[c] &= ~m; boxM[boxOf(r, c)] &= ~m;
      if (found >= cap) return;
    }
  };
  rec(0);
  return found;
}

// ── the sweep ────────────────────────────────────────────────────────────────
const ids = new Set();
const solSeen = new Map();

PUZZLES.forEach((p, idx) => {
  const tag = `#${p.num} (${p.live})`;
  if (p.num !== idx + 1) fails.push(`${tag}: num out of sequence`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live)) fails.push(`${tag}: live is not ISO`);
  if (idx > 0 && p.live !== addDays(PUZZLES[idx - 1].live, 1)) fails.push(`${tag}: date not contiguous with previous`);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${d}, ${y}`) fails.push(`${tag}: dateLabel disagrees with live`);
  const wantId = `polka-${m}-${d}-${String(y).slice(2)}`;
  if (p.quizId !== wantId) fails.push(`${tag}: quizId ${p.quizId}, expected ${wantId}`);
  if (ids.has(p.quizId)) fails.push(`${tag}: duplicate quizId`);
  ids.add(p.quizId);

  const dow = dowOf(p.live);
  if (p.sunday !== (dow === 0)) fails.push(`${tag}: sunday flag wrong for its date`);

  for (const u of UNITS) {
    const vals = u.map(([r, c]) => p.sol[r][c]);
    if (new Set(vals).size !== 9 || vals.some((v) => v < 1 || v > 9)) { fails.push(`${tag}: sol violates a unit`); break; }
  }

  // every dot true of sol, every silence true of sol
  for (const [[ar, ac], [br, bc], t] of edgesOf(p)) {
    const a = p.sol[ar][ac], b = p.sol[br][bc];
    if (t === 1 && !consec(a, b)) fails.push(`${tag}: white dot between r${ar + 1}c${ac + 1} and r${br + 1}c${bc + 1} but ${a},${b} are not consecutive`);
    else if (t === 2 && !dbl(a, b)) fails.push(`${tag}: black dot between r${ar + 1}c${ac + 1} and r${br + 1}c${bc + 1} but ${a},${b} are not in ratio 2`);
    else if (t === 0 && (consec(a, b) || dbl(a, b))) fails.push(`${tag}: missing dot between r${ar + 1}c${ac + 1} and r${br + 1}c${bc + 1} (${a},${b})`);
    else if (t !== 0 && t !== 1 && t !== 2) fails.push(`${tag}: unknown dot code ${t}`);
  }

  const n = countSolutions(p, 2);
  if (n !== 1) fails.push(`${tag}: ${n} solutions (must be exactly 1)`);
  const lg = logicSolve(p);
  if (lg.unsound) fails.push(`${tag}: UNSOUND RULE - ${lg.unsound}`);
  if (!lg.solved) fails.push(`${tag}: not solvable by the graded technique set (guessing would be required)`);
  else {
    if (lg.cost !== p.cost) fails.push(`${tag}: stored cost ${p.cost}, recomputed ${lg.cost}`);
    const [lo, hi] = BAND[dow];
    if (lg.cost < lo || lg.cost > hi) fails.push(`${tag}: cost ${lg.cost} outside the ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dow]} band ${lo}-${hi === Infinity ? 'up' : hi}`);
  }

  const sKey = p.sol.flat().join('');
  if (solSeen.has(sKey)) fails.push(`${tag}: solution grid repeats ${solSeen.get(sKey)}`);
  solSeen.set(sKey, tag);
});

const today = new Date().toISOString().slice(0, 10);
note.push(`${PUZZLES.length} deals, ${PUZZLES.filter((p) => p.sunday).length} Sundays, ${PUZZLES.filter((p) => p.live > today).length} days of runway after ${today}`);
for (const n of note) console.log(`note  ${n}`);
for (const f of fails) console.log(`FAIL  ${f}`);
console.log(fails.length ? `\n${fails.length} failure(s).` : '\nOK');
process.exit(fails.length ? 1 : 0);
