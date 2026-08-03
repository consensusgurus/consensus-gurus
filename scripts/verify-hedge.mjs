// Verify the Hedge (daily slitherlink / loop-logic) bank. Hedge's own header
// comment (app/hedge/puzzles.js) and its client's rules copy (HedgeClient.jsx)
// promise, per puzzle:
//   - an n x n grid of cells (weekdays n=7, Sundays a 10x10 Edition);
//   - `clues` gives, for some cells, exactly how many of the cell's 4 sides
//     are part of the loop (null = unconstrained);
//   - `H`/`V` encode ONE single closed loop (never branches, never crosses
//     itself -- every dot it touches has degree exactly 2) that satisfies
//     every clue;
//   - EXACTLY ONE such loop exists ("verified... by two independent
//     solvers, a SAT encoding and a DFS counter").
// None of that was previously machine-checked. This script recomputes it all
// with its own from-scratch slitherlink solver:
//
//   1. Structural: n matches the sunday flag (7 / 10); clues is n x n;
//      `clueCount` equals the actual count of non-null clues; every H/V
//      coordinate is in range and there are no duplicate segments.
//   2. The stored H/V loop actually satisfies every printed clue (recomputed
//      cell-by-cell, not trusted), every dot it touches has degree exactly 2,
//      and it is a SINGLE connected loop (not several smaller ones).
//   3. UNIQUENESS: a constraint-propagation solver (per-cell clue rule,
//      per-dot degree rule, and a loop-closure rule -- an edge that would
//      close a cycle before every clue is satisfiable elsewhere must be off)
//      is run to a fixpoint and, if that doesn't fully determine the board,
//      falls back to capped backtracking counting solutions up to 2. Exactly
//      one must exist, and it must match the stored H/V loop.
//   4. `sunday` must match the real day-of-week of `live` (Sundays only).
//   5. num/quizId/live/dateLabel are mutually consistent and sequential.
//   6. No duplicate boards (identical `clues` grid).
//   7. US spelling: reader-facing string fields are scanned for obvious
//      British word forms (none are expected -- Hedge carries no prose --
//      but the scan is run for parity with the other verifiers).
//
// Run: node scripts/verify-hedge.mjs
import { PUZZLES } from '../app/hedge/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);

// ─── slitherlink solver ────────────────────────────────────────────────────
// Edge ids: H edges (i,j), i in 0..n, j in 0..n-1 (horizontal, dot-row i,
// between dot-cols j and j+1); V edges (i,j), i in 0..n-1, j in 0..n
// (vertical, dot-col j, between dot-rows i and i+1). Dots are keyed
// i*(n+1)+j, i,j in 0..n, so nDots = (n+1)^2 exactly (this stride/size
// agreement matters: a mismatch here once made the union-find silently index
// out of the typed array and fabricate a false "two solutions" reading).
function buildCtx(p) {
  const n = p.n;
  const dotKey = (i, j) => i * (n + 1) + j;
  const idOf = new Map();
  const edges = [];
  let id = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j < n; j++) { const e = { id: id++, kind: 'H', i, j, a: dotKey(i, j), b: dotKey(i, j + 1) }; edges.push(e); idOf.set(`H${i}_${j}`, e.id); }
  for (let i = 0; i < n; i++) for (let j = 0; j <= n; j++) { const e = { id: id++, kind: 'V', i, j, a: dotKey(i, j), b: dotKey(i + 1, j) }; edges.push(e); idOf.set(`V${i}_${j}`, e.id); }
  const E = edges.length;
  const cellClues = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (p.clues[r][c] != null) {
    cellClues.push([[idOf.get(`H${r}_${c}`), idOf.get(`H${r + 1}_${c}`), idOf.get(`V${r}_${c}`), idOf.get(`V${r}_${c + 1}`)], p.clues[r][c]]);
  }
  const dotList = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    const out = [];
    if (j > 0) out.push(idOf.get(`H${i}_${j - 1}`));
    if (j < n) out.push(idOf.get(`H${i}_${j}`));
    if (i > 0) out.push(idOf.get(`V${i - 1}_${j}`));
    if (i < n) out.push(idOf.get(`V${i}_${j}`));
    dotList.push(out);
  }
  const nDots = (n + 1) * (n + 1);
  return { n, E, edges, idOf, cellClues, dotList, nDots };
}

// Returns { count (capped at `cap`), capped, nodes, sols: Int8Array[] }.
function solveSlitherlink(ctx, cap = 2, nodeCap = 4_000_000) {
  const { E, edges, cellClues, dotList, nDots } = ctx;
  const st = new Int8Array(E);
  const log = [];
  let contradiction = false;

  function setEdge(idx, v) {
    if (st[idx] === v) return true;
    if (st[idx] !== 0) { contradiction = true; return false; }
    st[idx] = v; log.push(idx);
    return true;
  }
  function undoTo(mark) { while (log.length > mark) st[log.pop()] = 0; }

  // Union-find over currently-on edges, rebuilt with plain typed arrays
  // (cheap: nDots is at most 121) whenever the loop-closure rule needs it.
  const ufParent = new Int32Array(nDots);
  function buildUF() {
    for (let i = 0; i < nDots; i++) ufParent[i] = i;
    const find = (x) => { while (ufParent[x] !== x) x = ufParent[x]; return x; };
    for (const e of edges) {
      if (st[e.id] !== 1) continue;
      const ra = find(e.a), rb = find(e.b);
      if (ra !== rb) ufParent[ra] = rb;
    }
    return find;
  }

  function propagate() {
    let changed = true, guard = 0;
    while (changed && !contradiction) {
      changed = false;
      if (++guard > 1000) break;
      for (const [es, cl] of cellClues) {
        let on = 0, unk = [];
        for (const e of es) { const s = st[e]; if (s === 1) on++; else if (s === 0) unk.push(e); }
        if (on > cl || on + unk.length < cl) { contradiction = true; return; }
        if (unk.length) {
          if (on === cl) { for (const e of unk) if (!setEdge(e, -1)) return; changed = true; }
          else if (on + unk.length === cl) { for (const e of unk) if (!setEdge(e, 1)) return; changed = true; }
        }
      }
      if (contradiction) return;
      for (const es of dotList) {
        let on = 0, unk = [];
        for (const e of es) { const s = st[e]; if (s === 1) on++; else if (s === 0) unk.push(e); }
        if (on > 2) { contradiction = true; return; }
        if (on === 2 && unk.length) { for (const e of unk) if (!setEdge(e, -1)) return; changed = true; }
        else if (on === 1 && unk.length === 1) { if (!setEdge(unk[0], 1)) return; changed = true; }
        else if (on === 0 && unk.length === 1) { if (!setEdge(unk[0], -1)) return; changed = true; }
      }
      if (contradiction) return;
      // Loop-closure rule: an unknown edge that would connect two dots
      // already joined by on-edges would close a cycle. That is only legal
      // as the FINAL closing move of the single loop -- i.e. only if every
      // clue is already satisfiable with no more on-edges elsewhere. If any
      // clue would still need more, closing early is impossible, so the
      // edge must be off. This is what makes these puzzles tractable at all.
      const find = buildUF();
      for (const e of edges) {
        if (st[e.id] !== 0) continue;
        if (find(e.a) !== find(e.b)) continue;
        let stillNeeds = false;
        for (const [es, cl] of cellClues) {
          let on = 0;
          for (const e2 of es) { if (e2 === e.id) on++; else if (st[e2] === 1) on++; }
          if (on < cl) { stillNeeds = true; break; }
        }
        if (stillNeeds) { if (!setEdge(e.id, -1)) return; changed = true; }
      }
    }
  }

  function fullyDetermined() { for (let i = 0; i < E; i++) if (st[i] === 0) return false; return true; }
  function validateFinal() {
    for (const [es, cl] of cellClues) {
      let on = 0; for (const e of es) if (st[e] === 1) on++;
      if (on !== cl) return false;
    }
    const deg = new Int32Array(nDots);
    let any = false;
    for (const e of edges) if (st[e.id] === 1) { deg[e.a]++; deg[e.b]++; any = true; }
    if (!any) return false;
    const find = buildUF();
    let root = -1;
    for (let d = 0; d < nDots; d++) {
      if (deg[d] === 0) continue;
      if (deg[d] !== 2) return false;
      const r = find(d);
      if (root === -1) root = r; else if (r !== root) return false;
    }
    return true;
  }
  function pickEdge() {
    let best = -1, bestSlack = Infinity;
    for (const [es, cl] of cellClues) {
      let on = 0, unk = [];
      for (const e of es) { const s = st[e]; if (s === 1) on++; else if (s === 0) unk.push(e); }
      if (!unk.length) continue;
      const slack = Math.min(cl - on, unk.length - (cl - on));
      if (slack < bestSlack) { bestSlack = slack; best = unk[0]; }
    }
    if (best >= 0) return best;
    for (let i = 0; i < E; i++) if (st[i] === 0) return i;
    return -1;
  }

  const sols = [];
  let nodes = 0, capped = false;
  function bt() {
    if (sols.length >= cap || capped) return;
    if (++nodes > nodeCap) { capped = true; return; }
    const mark = log.length;
    propagate();
    if (contradiction) { contradiction = false; undoTo(mark); return; }
    if (fullyDetermined()) {
      if (validateFinal()) sols.push(st.slice());
      undoTo(mark);
      return;
    }
    const e = pickEdge();
    if (e < 0) { undoTo(mark); return; }
    for (const v of [1, -1]) {
      const mark2 = log.length;
      if (setEdge(e, v)) bt();
      contradiction = false;
      undoTo(mark2);
      if (sols.length >= cap || capped) break;
    }
    undoTo(mark);
  }
  bt();
  return { count: sols.length, capped, nodes, sols };
}

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenClueGrids = new Map();
PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^hedge-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }

  const wantN = p.sunday ? 10 : 7;
  if (p.n !== wantN) errs.push(`n=${p.n}, want ${wantN} for ${p.sunday ? 'Sunday' : 'weekday'}`);
  if (!Array.isArray(p.clues) || p.clues.length !== p.n || p.clues.some((row) => row.length !== p.n)) errs.push('clues is not an n x n grid');
  else {
    const actualCount = p.clues.flat().filter((v) => v !== null).length;
    if (p.clueCount !== actualCount) errs.push(`clueCount ${p.clueCount} != actual ${actualCount}`);
  }
  const n = p.n;
  const HDupe = new Set(), VDupe = new Set();
  for (const [hi, hj] of p.H || []) {
    if (hi < 0 || hi > n || hj < 0 || hj >= n) errs.push(`H[${hi},${hj}] out of range`);
    const k = `${hi},${hj}`; if (HDupe.has(k)) errs.push(`duplicate H edge ${k}`); HDupe.add(k);
  }
  for (const [vi, vj] of p.V || []) {
    if (vi < 0 || vi >= n || vj < 0 || vj > n) errs.push(`V[${vi},${vj}] out of range`);
    const k = `${vi},${vj}`; if (VDupe.has(k)) errs.push(`duplicate V edge ${k}`); VDupe.add(k);
  }

  if (!errs.length) {
    // The stored H/V loop must itself satisfy every clue, have degree 0/2 at
    // every dot, and form a single connected loop -- recomputed directly,
    // independent of the solver below.
    const Hset = new Set((p.H || []).map(([i, j]) => `${i},${j}`));
    const Vset = new Set((p.V || []).map(([i, j]) => `${i},${j}`));
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const cl = p.clues[r][c]; if (cl == null) continue;
      let on = 0;
      if (Hset.has(`${r},${c}`)) on++;
      if (Hset.has(`${r + 1},${c}`)) on++;
      if (Vset.has(`${r},${c}`)) on++;
      if (Vset.has(`${r},${c + 1}`)) on++;
      if (on !== cl) errs.push(`stored loop gives cell (${r},${c}) ${on} sides, clue says ${cl}`);
    }
    const nDots = (n + 1) * (n + 1);
    const parent = Array.from({ length: nDots }, (_, i) => i);
    const find = (x) => { while (parent[x] !== x) x = parent[x]; return x; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
    const dk = (i, j) => i * (n + 1) + j;
    const deg = new Array(nDots).fill(0);
    for (const [i, j] of p.H || []) { const a = dk(i, j), b = dk(i, j + 1); deg[a]++; deg[b]++; union(a, b); }
    for (const [i, j] of p.V || []) { const a = dk(i, j), b = dk(i + 1, j); deg[a]++; deg[b]++; union(a, b); }
    for (let d = 0; d < nDots; d++) if (deg[d] !== 0 && deg[d] !== 2) errs.push(`stored loop gives dot ${Math.floor(d / (n + 1))},${d % (n + 1)} degree ${deg[d]}`);
    const roots = new Set();
    for (let d = 0; d < nDots; d++) if (deg[d] > 0) roots.add(find(d));
    if (roots.size !== 1) errs.push(`stored loop is ${roots.size} separate components, not one single loop`);
  }

  let solveNote = '';
  if (!errs.length) {
    const ctx = buildCtx(p);
    const res = solveSlitherlink(ctx, 2, 4_000_000);
    if (res.capped) errs.push(`uniqueness search hit the node cap (${res.nodes}), NOT proven`);
    else if (res.count === 0) errs.push('solver found NO valid loop -- clues are contradictory');
    else if (res.count > 1) errs.push(`NOT UNIQUE: solver found >= 2 valid loops satisfying the clues`);
    else {
      const Hset = new Set((p.H || []).map(([i, j]) => `${i},${j}`));
      const Vset = new Set((p.V || []).map(([i, j]) => `${i},${j}`));
      const found = res.sols[0];
      let mismatch = false;
      for (const e of ctx.edges) {
        const stored = e.kind === 'H' ? Hset.has(`${e.i},${e.j}`) : Vset.has(`${e.i},${e.j}`);
        const solved = found[e.id] === 1;
        if (stored !== solved) { mismatch = true; break; }
      }
      if (mismatch) errs.push('the unique solution does not match the stored H/V loop');
      solveNote = `, unique (${res.nodes} search nodes)`;
    }
  }

  if (Array.isArray(p.clues)) { const key = JSON.stringify(p.clues); seenClueGrids.set(key, (seenClueGrids.get(key) || []).concat(p.quizId)); }
  scanBritish(p.quizId, 'dateLabel', p.dateLabel);

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${n}x${n}${p.sunday ? ' Sunday' : ''}, ${p.clueCount} clues, loop valid${solveNote}`);
});

for (const [, ids] of seenClueGrids) {
  if (ids.length > 1) fail('hedge pool', `identical clue grid shipped on ${ids.length} boards: ${ids.join(', ')}`);
}
if (BAD === 0) ok('hedge pool', `${PUZZLES.length} boards, no duplicate clue grids`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Hedge boards verified.');
process.exit(BAD ? 1 : 0);
