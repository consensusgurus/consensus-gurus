#!/usr/bin/env node
// gen-fib — extend the Fib puzzle bank (app/fib/puzzles.js), the daily
// lying-clue Latin square.
//
//   node scripts/gen-fib.mjs [--from YYYY-MM-DD] [--days N] [--startnum N] [--seed N] [--dry]
//
// Fib is an n x n Latin square carrying printed `givens` (always true) and a
// set of inequality `clues` between orthogonally adjacent cells, of which
// EXACTLY ONE is false. The board must admit exactly one (grid, broken clue)
// pair across the whole search space, so both the answer AND which sign lied
// are provably unique.
//
// The shape follows the day of the week, matching the shipped bank:
//   Sunday Edition   6x6, 8 givens, 10 clues
//   Mon / Tue / Wed  5x5, 3 givens, 11 clues (more signs, so an easier open)
//   Thu / Fri / Sat  5x5, 3 givens, 8 clues (the week's hard end)
//
// Each board is built the way the puzzle-file header describes, then PROVEN
// rather than trusted:
//   1. a random Latin square,
//   2. over-constrained with adjacent-pair clues that are all true of it,
//   3. one sign flipped, so exactly one clue lies,
//   4. thinned clue by clue, down to the day's target count, while the
//      exactly-one-(grid, liar) guarantee still holds,
//   5. proved by EXHAUSTIVE search: a column-major cell backtracker, plus an
//      independently written per-clue counter that solves "clue j is the only
//      false one" separately for every j and requires the total over all j to
//      be exactly 1, plus (at n=5) enumeration of all 161,280 Latin squares of
//      order 5. Three methods at 5x5, two at 6x6, which is exactly what the
//      puzzle-file header claims of the shipped bank.
// None of these share code with scripts/verify-fib.mjs, which re-proves the
// whole bank with its own row-major searcher: the generator and the checker
// are deliberately separate implementations.
//
// Bank-level variety is enforced while generating, not hoped for. The liar's
// INDEX is a property of the clue array's order and nothing else, so once a
// board is proved the clue list is permuted to put the false sign on the
// least-used index for that size; givens are drawn with a bias toward the
// least-used cells. Both are then hard-checked against the same ceiling
// verify-fib.mjs applies (no liar index and no given cell on more than half
// the boards of its size).
//
// Boards already in the file are FROZEN: this script only splices new ones in
// before the closing bracket, and refuses to run if --from / --startnum do not
// continue the existing bank exactly. Deterministic from --seed.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PUZZLES } from '../app/fib/puzzles.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(ROOT, 'app/fib/puzzles.js');

const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FROM = arg('--from', '2026-09-25');
const DAYS = Number(arg('--days', '10'));
const START_NUM = Number(arg('--startnum', String(PUZZLES.length + 1)));
const SEED = Number(arg('--seed', '20260925'));
const DRY = args.includes('--dry');

const LIAR_IDX_CEIL_RATIO = 0.5;   // mirrors verify-fib.mjs
const GIVEN_POS_CEIL_RATIO = 0.5;
const TRIES_PER_BOARD = 4000;
const NODECAP = 8_000_000;

// ── seeded RNG ────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(SEED);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
function shuffled(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ── dates ─────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const isoPlus = (iso, days) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const dowOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
const quizIdFor = (iso) => { const [y, m, d] = iso.split('-'); return `fib-${+m}-${+d}-${y.slice(2)}`; };
const dateLabelFor = (iso) => { const [y, m, d] = iso.split('-'); return `${MONTHS[+m - 1]} ${+d}, ${y}`; };

// The day's shape. Sunday steps up to the 6x6 Edition; the weekday clue count
// ramps down across the week, so Monday opens generous and Saturday is spare.
function shapeFor(iso) {
  const dow = dowOf(iso);
  if (dow === 0) return { n: 6, sunday: true, givens: 8, clues: 10 };
  return { n: 5, sunday: false, givens: 3, clues: dow >= 1 && dow <= 3 ? 11 : 8 };
}

// ── random Latin square ───────────────────────────────────────────────────
function randomLatinSquare(n) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const g = Array.from({ length: n }, () => Array(n).fill(0));
    const colUsed = Array.from({ length: n }, () => new Set());
    let ok = true;
    for (let r = 0; r < n && ok; r++) {
      ok = fillRow(r, 0, new Set());
    }
    function fillRow(r, c, rowUsed) {
      if (c === n) return true;
      for (const v of shuffled([...Array(n)].map((_, i) => i + 1))) {
        if (rowUsed.has(v) || colUsed[c].has(v)) continue;
        g[r][c] = v; rowUsed.add(v); colUsed[c].add(v);
        if (fillRow(r, c + 1, rowUsed)) return true;
        g[r][c] = 0; rowUsed.delete(v); colUsed[c].delete(v);
      }
      return false;
    }
    if (ok) return g;
  }
  throw new Error('could not build a Latin square');
}

// ── clue helpers ──────────────────────────────────────────────────────────
function adjacentPairs(n) {
  const out = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (r + 1 < n) out.push([r, c, r + 1, c]);
    if (c + 1 < n) out.push([r, c, r, c + 1]);
  }
  return out;
}
const trueOp = (sol, [r1, c1, r2, c2]) => (sol[r1][c1] < sol[r2][c2] ? '<' : '>');
const flipOp = (op) => (op === '<' ? '>' : '<');
const holds = ([r1, c1, r2, c2, op], g) => (op === '<' ? g[r1][c1] < g[r2][c2] : g[r1][c1] > g[r2][c2]);

// ── METHOD 1: column-major cell backtracker ───────────────────────────────
// Fills cells down each column in turn (deliberately not the row-major order
// verify-fib.mjs uses), keeps row/column occupancy as bitmasks, evaluates a
// clue the moment both its cells carry a digit, and abandons a branch the
// instant a SECOND clue goes false. Returns up to `cap` (grid, liar) pairs.
function solveColMajor(n, givens, clues, cap = 2) {
  const cells = [];
  for (let c = 0; c < n; c++) for (let r = 0; r < n; r++) cells.push([r, c]);
  const fixed = new Map();
  for (const [r, c, v] of givens) fixed.set(r * n + c, v);
  const byCell = new Map();
  clues.forEach((cl, i) => {
    for (const k of [cl[0] * n + cl[1], cl[2] * n + cl[3]]) {
      if (!byCell.has(k)) byCell.set(k, []);
      byCell.get(k).push(i);
    }
  });
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  const rowMask = new Int32Array(n), colMask = new Int32Array(n);
  const out = [];
  let nodes = 0, capped = false;
  function rec(idx, nFalse, falseIdx) {
    if (out.length >= cap || capped) return;
    if (++nodes > NODECAP) { capped = true; return; }
    if (idx === cells.length) {
      if (nFalse === 1) out.push({ grid: g.map((row) => row.join('')), liar: falseIdx });
      return;
    }
    const [r, c] = cells[idx];
    const key = r * n + c;
    const fx = fixed.get(key);
    for (let v = 1; v <= n; v++) {
      if (fx !== undefined && v !== fx) continue;
      const bit = 1 << v;
      if ((rowMask[r] & bit) || (colMask[c] & bit)) continue;
      g[r][c] = v; rowMask[r] |= bit; colMask[c] |= bit;
      let nf = nFalse, fi = falseIdx, dead = false;
      for (const ci of byCell.get(key) || []) {
        const cl = clues[ci];
        if (g[cl[0]][cl[1]] && g[cl[2]][cl[3]] && !holds(cl, g)) {
          nf++; fi = ci;
          if (nf > 1) { dead = true; break; }
        }
      }
      if (!dead) rec(idx + 1, nf, fi);
      g[r][c] = 0; rowMask[r] &= ~bit; colMask[c] &= ~bit;
      if (out.length >= cap || capped) return;
    }
  }
  rec(0, 0, -1);
  return { solutions: out, capped };
}

// ── METHOD 2: independent per-clue counter ────────────────────────────────
// A different framing and a different traversal: instead of counting broken
// clues as it goes, it solves the board ONCE PER CLUE INDEX j under the strict
// constraint "clue j is false and every other clue is true", assembling the
// grid a whole ROW at a time from the permutations of 1..n. The board is good
// only if the totals over all j sum to exactly 1.
const PERM_CACHE = new Map();
function perms(n) {
  if (PERM_CACHE.has(n)) return PERM_CACHE.get(n);
  const out = [];
  const cur = [];
  const used = new Array(n + 1).fill(false);
  (function go() {
    if (cur.length === n) { out.push(cur.slice()); return; }
    for (let v = 1; v <= n; v++) {
      if (used[v]) continue;
      used[v] = true; cur.push(v); go(); cur.pop(); used[v] = false;
    }
  })();
  PERM_CACHE.set(n, out);
  return out;
}
function countWithLiar(n, givens, clues, j, cap = 2) {
  const rowGivens = Array.from({ length: n }, () => []);
  for (const [r, c, v] of givens) rowGivens[r].push([c, v]);
  const hByRow = Array.from({ length: n }, () => []);   // clue inside row r
  const vByRow = Array.from({ length: n }, () => []);   // clue between r-1 and r
  clues.forEach((cl, i) => {
    if (cl[0] === cl[2]) hByRow[cl[0]].push(i);
    else vByRow[cl[2]].push(i);
  });
  const rowPerms = [];
  for (let r = 0; r < n; r++) {
    rowPerms.push(perms(n).filter((p) => {
      for (const [c, v] of rowGivens[r]) if (p[c] !== v) return false;
      for (const i of hByRow[r]) {
        const cl = clues[i];
        const want = cl[4] === '<' ? p[cl[1]] < p[cl[3]] : p[cl[1]] > p[cl[3]];
        if (want === (i === j)) return false;   // clue j must be false, others true
      }
      return true;
    }));
  }
  const rows = [];
  let found = 0;
  let sample = null;
  (function go(r, colMask) {
    if (found >= cap) return;
    if (r === n) { found++; if (!sample) sample = rows.map((p) => p.join('')); return; }
    outer: for (const p of rowPerms[r]) {
      for (let c = 0; c < n; c++) if (colMask[c] & (1 << p[c])) continue outer;
      for (const i of vByRow[r]) {
        const cl = clues[i];
        const a = rows[r - 1][cl[1]], b = p[cl[3]];
        const want = cl[4] === '<' ? a < b : a > b;
        if (want === (i === j)) continue outer;
      }
      const next = colMask.slice();
      for (let c = 0; c < n; c++) next[c] |= 1 << p[c];
      rows.push(p); go(r + 1, next); rows.pop();
      if (found >= cap) return;
    }
  })(0, new Int32Array(n));
  return { count: found, sample };
}
function proveByClueCounter(n, givens, clues) {
  let total = 0, liar = -1, grid = null;
  for (let j = 0; j < clues.length; j++) {
    const { count, sample } = countWithLiar(n, givens, clues, j, 2);
    if (count) { total += count; liar = j; grid = sample; }
    if (total > 1) return { total, liar: -1, grid: null };
  }
  return { total, liar, grid };
}

// ── METHOD 3 (n=5 only): every Latin square of order 5 ─────────────────────
let ALL5 = null;
function allLatin5() {
  if (ALL5) return ALL5;
  const out = [];
  const g = Array.from({ length: 5 }, () => Array(5).fill(0));
  const colMask = new Int32Array(5);
  (function go(r, c, rowMask) {
    if (r === 5) { out.push(g.map((row) => row.join('')).join('')); return; }
    const [nr, nc] = c === 4 ? [r + 1, 0] : [r, c + 1];
    for (let v = 1; v <= 5; v++) {
      const bit = 1 << v;
      if ((rowMask & bit) || (colMask[c] & bit)) continue;
      g[r][c] = v; colMask[c] |= bit;
      go(nr, nc, c === 4 ? 0 : rowMask | bit);
      colMask[c] &= ~bit;
    }
  })(0, 0, 0);
  ALL5 = out;
  return out;
}
function proveByEnumeration5(givens, clues) {
  const hits = [];
  for (const s of allLatin5()) {
    let ok = true;
    for (const [r, c, v] of givens) if (+s[r * 5 + c] !== v) { ok = false; break; }
    if (!ok) continue;
    const grid = [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => +s[r * 5 + c]));
    let nf = 0, fi = -1;
    for (let i = 0; i < clues.length; i++) {
      if (!holds(clues[i], grid)) { nf++; fi = i; if (nf > 1) break; }
    }
    if (nf === 1) {
      hits.push({ grid: [0, 1, 2, 3, 4].map((r) => s.slice(r * 5, r * 5 + 5)), liar: fi });
      if (hits.length > 1) break;
    }
  }
  return hits;
}

// ── bank-level variety pools ──────────────────────────────────────────────
const pools = { 5: { liar: new Map(), given: new Map(), count: 0 }, 6: { liar: new Map(), given: new Map(), count: 0 } };
function addToPools(n, liar, givens) {
  const p = pools[n];
  p.count++;
  p.liar.set(liar, (p.liar.get(liar) || 0) + 1);
  for (const [r, c] of givens) { const k = `${r},${c}`; p.given.set(k, (p.given.get(k) || 0) + 1); }
}
for (const p of PUZZLES) if (pools[p.n]) addToPools(p.n, p.liar, p.givens);
// Every board this run will add, counted up front, so the ceiling is measured
// against the bank as it will FINISH rather than as it stands mid-run.
const finalCount = { 5: pools[5].count, 6: pools[6].count };
for (let i = 0; i < DAYS; i++) finalCount[shapeFor(isoPlus(FROM, i)).n]++;
const ceilFor = (n, ratio) => Math.ceil(finalCount[n] * ratio);

function givenPosOk(n, givens) {
  const ceil = ceilFor(n, GIVEN_POS_CEIL_RATIO);
  for (const [r, c] of givens) if ((pools[n].given.get(`${r},${c}`) || 0) + 1 > ceil) return false;
  return true;
}
function bestLiarIndex(n, len) {
  const ceil = ceilFor(n, LIAR_IDX_CEIL_RATIO);
  let best = [], bestUse = Infinity;
  for (let i = 0; i < len; i++) {
    const use = pools[n].liar.get(i) || 0;
    if (use + 1 > ceil) continue;
    if (use < bestUse) { bestUse = use; best = [i]; }
    else if (use === bestUse) best.push(i);
  }
  return best.length ? pick(best) : -1;
}
// Givens are drawn with a bias toward the cells the bank has leaned on least,
// so a long run of boards spreads its printed digits rather than settling into
// one comfortable pattern.
function drawGivens(n, sol, k) {
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const use = pools[n].given.get(`${r},${c}`) || 0;
    cells.push({ r, c, w: 1 / (1 + use) ** 2 });
  }
  const out = [];
  while (out.length < k && cells.length) {
    const tot = cells.reduce((s, x) => s + x.w, 0);
    let roll = rnd() * tot, idx = 0;
    for (let i = 0; i < cells.length; i++) { roll -= cells[i].w; if (roll <= 0) { idx = i; break; } }
    const { r, c } = cells.splice(idx, 1)[0];
    out.push([r, c, sol[r][c]]);
  }
  return out;
}

// ── build one board ───────────────────────────────────────────────────────
function buildBoard(iso) {
  const { n, sunday, givens: gCount, clues: target } = shapeFor(iso);
  const pairs = adjacentPairs(n);
  for (let attempt = 0; attempt < TRIES_PER_BOARD; attempt++) {
    const sol = randomLatinSquare(n);
    const givens = drawGivens(n, sol, gCount);
    if (!givenPosOk(n, givens)) continue;

    // over-constrain: a true-of-the-square clue on a random pile of pairs
    const over = Math.min(pairs.length, target + 7);
    let clues = shuffled(pairs).slice(0, over).map((p) => [...p, trueOp(sol, p)]);
    // flip exactly one sign, so exactly one clue lies
    const lp = Math.floor(rnd() * clues.length);
    clues[lp] = [...clues[lp].slice(0, 4), flipOp(clues[lp][4])];
    let liarClue = clues[lp];
    let r = solveColMajor(n, givens, clues);
    if (r.capped || r.solutions.length !== 1) continue;

    // thin down to the day's target while the guarantee holds
    for (const cl of shuffled(clues)) {
      if (clues.length <= target) break;
      if (cl === liarClue) continue;
      const kept = clues.filter((x) => x !== cl);
      const t = solveColMajor(n, givens, kept);
      if (!t.capped && t.solutions.length === 1) clues = kept;
    }
    if (clues.length !== target) continue;

    // The liar's index is nothing but the clue array's order, so put it where
    // the bank needs it and shuffle the honest clues around it.
    const want = bestLiarIndex(n, target);
    if (want < 0) continue;
    const rest = shuffled(clues.filter((x) => x !== liarClue));
    const ordered = [...rest.slice(0, want), liarClue, ...rest.slice(want)];

    // ── prove it, three ways at 5x5 and two at 6x6 ──────────────────────
    const m1 = solveColMajor(n, givens, ordered, 3);
    if (m1.capped || m1.solutions.length !== 1) continue;
    if (m1.solutions[0].liar !== want) continue;
    const solStr = sol.map((row) => row.join(''));
    if (m1.solutions[0].grid.join(',') !== solStr.join(',')) continue;

    const m2 = proveByClueCounter(n, givens, ordered);
    if (m2.total !== 1 || m2.liar !== want || m2.grid.join(',') !== solStr.join(',')) continue;

    if (n === 5) {
      const m3 = proveByEnumeration5(givens, ordered);
      if (m3.length !== 1 || m3[0].liar !== want || m3[0].grid.join(',') !== solStr.join(',')) continue;
    }

    addToPools(n, want, givens);
    return { sunday, n, givens, clues: ordered, liar: want, sol: solStr, tries: attempt + 1 };
  }
  throw new Error(`could not build a board for ${iso} in ${TRIES_PER_BOARD} tries`);
}

// ── continuity checks against the frozen bank ─────────────────────────────
const last = PUZZLES[PUZZLES.length - 1];
if (START_NUM !== last.num + 1) throw new Error(`--startnum ${START_NUM} does not continue num ${last.num}`);
if (FROM !== isoPlus(last.live, 1)) throw new Error(`--from ${FROM} does not continue live ${last.live}`);

// ── run ───────────────────────────────────────────────────────────────────
const fmtArr = (a) => `[${a.map((x) => `[${x.map((y) => (typeof y === 'string' ? `'${y}'` : y)).join(',')}]`).join(', ')}]`;
const out = [];
for (let i = 0; i < DAYS; i++) {
  const iso = isoPlus(FROM, i);
  const b = buildBoard(iso);
  out.push({ num: START_NUM + i, quizId: quizIdFor(iso), live: iso, dateLabel: dateLabelFor(iso), ...b });
  console.log(`${iso}  ${b.n}x${b.n}  ${b.givens.length} givens  ${b.clues.length} clues  liar ${b.liar}  (${b.tries} tries)`);
}

const body = out.map((p) => [
  '  {',
  `    num: ${p.num},`,
  `    quizId: '${p.quizId}',`,
  `    live: '${p.live}',`,
  `    dateLabel: '${p.dateLabel}',`,
  `    sunday: ${p.sunday},`,
  `    n: ${p.n},`,
  `    givens: ${fmtArr(p.givens)},`,
  `    clues: ${fmtArr(p.clues)},`,
  `    liar: ${p.liar},`,
  `    sol: [${p.sol.map((s) => `'${s}'`).join(', ')}],`,
  '  },',
].join('\n')).join('\n');

if (DRY) { console.log(body); process.exit(0); }

const src = readFileSync(FILE, 'utf8');
const tail = '\n];\n';
if (!src.endsWith(tail)) throw new Error('puzzles.js does not end with the expected closing bracket');
writeFileSync(FILE, `${src.slice(0, -tail.length)}\n${body}${tail}`);
console.log(`\nappended ${out.length} boards: ${out[0].live} through ${out[out.length - 1].live}`);
for (const n of [5, 6]) {
  if (!pools[n].count) continue;
  const lc = ceilFor(n, LIAR_IDX_CEIL_RATIO), gc = ceilFor(n, GIVEN_POS_CEIL_RATIO);
  const lMax = Math.max(...pools[n].liar.values()), gMax = Math.max(...pools[n].given.values());
  console.log(`n=${n}: ${pools[n].count} boards, liar-index max ${lMax}/${lc}, given-cell max ${gMax}/${gc}`);
}
