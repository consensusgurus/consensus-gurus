// Verify the Fib bank (app/fib/puzzles.js), the daily lying-clue Latin square.
// Run after ANY edit:  node scripts/verify-fib.mjs
//
// Per puzzle, everything is RECOMPUTED with an exhaustive backtracking search
// over the Latin square (never trusted from the stored fields):
//   sol      re-derived as the unique (grid, liar) pair that (a) is a valid
//            n x n Latin square, (b) matches every `given`, and (c) makes
//            EXACTLY ONE of `clues` false. The search fills cells in row-major
//            order under the Latin (no repeat in row/col) constraint and
//            evaluates a clue the instant both its cells are filled, pruning
//            the instant a SECOND clue goes false — this is the same
//            "admits exactly one (grid, broken clue) pair" claim the header
//            makes, checked by brute force rather than trusted. Both the
//            resulting grid AND the liar index must equal the stored fields.
//   liar     the stored clue index must be the one false clue in the unique
//            solution (checked above), in range, and every clue must involve
//            two DISTINCT, ORTHOGONALLY ADJACENT, in-range cells with op in
//            {'<','>'} (the header's own definition of a clue).
//   n / sunday   weekdays are 5x5, Sundays step up to 6x6, exactly as the
//            header states; givens/clue arrays must be shaped for that n.
//   sunday   must equal the true UTC weekday of `live`; quizId/live/num
//            internally consistent (mirrors the alibi/glyph checks).
//
// Clue-count band: no fixed band is written into the puzzle-file header, so
// this script enforces the bank's OWN observed floor/ceiling per size (5x5:
// 8-11, 6x6: exactly 10, both true of the shipped bank at the time this
// script was written) as a sanity rail — a puzzle far outside that band is
// probably a generator regression, not a harder-but-valid board.
//
// Bank-level pool variety: reports (does not hard-fail, since none of the
// observed skew approaches Rung's collapse) how often each liar CLUE INDEX
// and each GIVEN CELL POSITION repeats across same-size boards, with a
// documented ceiling that a future bulk "bank to N days" job must not cross.
//
// Performance: n=5 is exhaustively searched in milliseconds; n=6 boards can
// take up to ~1s each because Latin-square backtracking is inherently bigger
// at 6x6. A NODECAP bounds worst-case runtime; if a search hits it, uniqueness
// is NOT proven and the puzzle is reported as a failure rather than a false
// pass. Full bank (56 boards, 8 of them 6x6) runs in a couple of seconds.

import { PUZZLES } from '../app/fib/puzzles.js';

const NODECAP = 20_000_000;
const CLUE_BAND = { 5: [8, 11], 6: [10, 10] };
// The n=6 Sunday group is a small sample (8 boards as of writing), so a tight
// ratio would flag ordinary small-sample variance as a defect. 0.5 still catches
// a real collapse (one value dominating half or more of the group) while
// tolerating the noise a sample this size naturally has.
const LIAR_IDX_CEIL_RATIO = 0.5;   // no clue-index may be the liar on more than this share of same-n boards
const GIVEN_POS_CEIL_RATIO = 0.5;  // no (row,col) may be given on more than this share of same-n boards

const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);
let BAD = 0;

function evalClue([r1, c1, r2, c2, op], grid) {
  const a = grid[r1][c1], b = grid[r2][c2];
  if (a == null || b == null) return null;
  return op === '<' ? a < b : a > b;
}

// Exhaustive backtracking solver: fills cells row-major under the Latin
// constraint, tracks how many clues have gone false so far (pruning the
// instant a second one does), and collects (grid, liar) pairs up to `cap`.
function solvePuzzle(p, cap = 2) {
  const n = p.n;
  const grid = Array.from({ length: n }, () => Array(n).fill(null));
  const rowUsed = Array.from({ length: n }, () => new Set());
  const colUsed = Array.from({ length: n }, () => new Set());
  const givenMap = new Map();
  for (const [r, c, v] of p.givens) givenMap.set(`${r},${c}`, v);
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) cells.push([r, c]);
  const cluesByCell = new Map();
  p.clues.forEach((cl, ci) => {
    const [r1, c1, r2, c2] = cl;
    for (const k of [`${r1},${c1}`, `${r2},${c2}`]) {
      if (!cluesByCell.has(k)) cluesByCell.set(k, []);
      cluesByCell.get(k).push(ci);
    }
  });
  const solutions = [];
  let nodes = 0, capped = false;
  function rec(idx, violated, violatedIdx) {
    if (solutions.length >= cap || capped) return;
    if (++nodes > NODECAP) { capped = true; return; }
    if (idx === cells.length) {
      if (violated === 1) solutions.push({ grid: grid.map((r) => r.join('')), liar: violatedIdx });
      return;
    }
    const [r, c] = cells[idx];
    const key = `${r},${c}`;
    const fixed = givenMap.get(key);
    for (let v = 1; v <= n; v++) {
      if (fixed !== undefined && v !== fixed) continue;
      if (rowUsed[r].has(v) || colUsed[c].has(v)) continue;
      grid[r][c] = v; rowUsed[r].add(v); colUsed[c].add(v);
      let nv = violated, ni = violatedIdx, bad = false;
      for (const ci of cluesByCell.get(key) || []) {
        const res = evalClue(p.clues[ci], grid);
        if (res !== null) {
          if (res === false) { nv++; ni = ci; if (nv > 1) { bad = true; break; } }
        }
      }
      if (!bad) rec(idx + 1, nv, ni);
      grid[r][c] = null; rowUsed[r].delete(v); colUsed[c].delete(v);
      if (solutions.length >= cap || capped) return;
    }
  }
  rec(0, 0, -1);
  return { solutions, capped };
}

const liarIdxPool = { 5: new Map(), 6: new Map() };
const givenPosPool = { 5: new Map(), 6: new Map() };
const nCount = { 5: 0, 6: 0 };

PUZZLES.forEach((p, i) => {
  const errs = [];

  // ── identity / date consistency ─────────────────────────────────────────
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^fib-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live}`);
  }

  // ── shape ─────────────────────────────────────────────────────────────
  const n = p.n;
  if (p.sunday && n !== 6) errs.push(`Sunday board has n=${n}, want 6`);
  if (!p.sunday && n !== 5) errs.push(`weekday board has n=${n}, want 5`);
  if (!Array.isArray(p.sol) || p.sol.length !== n || p.sol.some((row) => row.length !== n)) errs.push('sol is not an n x n grid of strings');
  const band = CLUE_BAND[n];
  if (band && (p.clues.length < band[0] || p.clues.length > band[1])) errs.push(`clue count ${p.clues.length} outside observed band [${band[0]},${band[1]}] for n=${n}`);

  // ── clue / given shape ────────────────────────────────────────────────
  for (const c of p.clues) {
    const [r1, c1, r2, c2, op] = c;
    if ([r1, c1, r2, c2].some((x) => x < 0 || x >= n)) errs.push(`clue ${JSON.stringify(c)} out of range`);
    if (r1 === r2 && c1 === c2) errs.push(`clue ${JSON.stringify(c)} refers to the same cell twice`);
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) errs.push(`clue ${JSON.stringify(c)} is not orthogonally adjacent`);
    if (op !== '<' && op !== '>') errs.push(`clue ${JSON.stringify(c)} has bad op`);
  }
  if (!Number.isInteger(p.liar) || p.liar < 0 || p.liar >= p.clues.length) errs.push(`liar index ${p.liar} out of range`);
  for (const [r, c, v] of p.givens) {
    if (r < 0 || r >= n || c < 0 || c >= n || v < 1 || v > n) errs.push(`given [${r},${c},${v}] out of range`);
    else if (String(p.sol[r]?.[c]) !== String(v)) errs.push(`given [${r},${c},${v}] does not match stored sol`);
  }

  // ── exhaustive re-solve: unique (grid, liar), matches stored fields ─────
  if (!errs.length) {
    const { solutions, capped } = solvePuzzle(p);
    if (capped) errs.push('search hit the node cap, so uniqueness is NOT proven');
    else if (solutions.length !== 1) errs.push(`solutions=${solutions.length}, need exactly 1 (grid,liar) pair`);
    else {
      const s = solutions[0];
      if (s.grid.join(',') !== p.sol.join(',')) errs.push('recomputed grid != stored sol');
      if (s.liar !== p.liar) errs.push(`recomputed liar ${s.liar} != stored liar ${p.liar}`);
    }
  }

  if (nCount[n] !== undefined) {
    nCount[n]++;
    liarIdxPool[n].set(p.liar, (liarIdxPool[n].get(p.liar) || 0) + 1);
    for (const [r, c] of p.givens) {
      const k = `${r},${c}`;
      givenPosPool[n].set(k, (givenPosPool[n].get(k) || 0) + 1);
    }
  }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${n}x${n}, ${p.clues.length} clues, unique (grid,liar), matches stored`);
});

// ── bank-level pool variety (report; fail only past a generous ceiling) ────
function reportPool(label, poolsByN, counts, ceilRatio) {
  for (const n of Object.keys(poolsByN)) {
    const pool = poolsByN[n];
    const total = counts[n];
    if (!total) continue;
    const ceil = Math.ceil(total * ceilRatio);
    const stale = [...pool.entries()].filter(([, c]) => c > ceil);
    if (stale.length) fail(`fib pool (${label}, n=${n})`, `exceeds ${(ceilRatio * 100).toFixed(0)}% of ${total} boards (ceil ${ceil}): ${stale.map(([k, c]) => `${k} x${c}`).join(', ')}`);
    else ok(`fib pool (${label}, n=${n})`, `${pool.size} distinct values across ${total} boards, none over ${ceil}`);
  }
}
reportPool('liar clue-index', liarIdxPool, nCount, LIAR_IDX_CEIL_RATIO);
reportPool('given cell position', givenPosPool, nCount, GIVEN_POS_CEIL_RATIO);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Fib boards verified.');
process.exit(BAD ? 1 : 0);
