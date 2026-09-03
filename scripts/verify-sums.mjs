#!/usr/bin/env node
// Verify the Sums bank (the daily kakuro, app/sums/puzzles.js).
//
//   node scripts/verify-sums.mjs
//
// THIS FILE RECOMPUTES, IT DOES NOT TRUST. Per the daily puzzle authoring
// standard in CLAUDE.md, NOTHING is imported from scripts/sums-core.mjs, the
// engine that built the bank. The geometry, the totals, the counting solver
// and the deduction solver are all written out again here, on different data
// structures (Sets and plain arrays against the generator's bitmasks and its
// memoised run table), so a bug in the generator cannot certify its own output.
//
// WHAT IS CHECKED
//   Shape       nums sequential from 1, dates contiguous and ISO, dateLabel
//               agreeing with `live`, quizId of the form sums-M-D-YY derived
//               from `live`, no duplicate ids.
//   Geometry    row 0 and column 0 black; every run two to nine cells; every
//               white cell in exactly one across run and one down run; the
//               whites one connected region; the black pattern symmetric under a
//               180-degree turn of the inner square.
//   Solution    every white holds 1-9 and no digit repeats inside a run.
//   Clues       `across` and `down` carry a total at EVERY run head and nowhere
//               else, and each total equals the sum of the digits in its run.
//   Uniqueness  EXACTLY one filling, from the independent counting solver.
//   No guessing the board also falls to the independent deduction solver
//               (run-by-run candidate filtering to a single digit per cell).
//   Grade       `whites`, `fixed` and `runs` recomputed and required to match.
//   Ramp        size, whites and fixed sit inside the documented band for the
//               board's real weekday; `sunday` lands on real Sundays only, and
//               every Sunday is 11x11 while every weekday is 7x7.
//   Variety     no black pattern and no totals list is used twice in the bank.
//   Runway      a note when fewer than 30 days of bank remain.
import { PUZZLES } from '../app/sums/puzzles.js';

// Ramp, indexed by JS getDay() (0 = Sunday). Mirror of scripts/gen-sums.mjs.
const RAMP = [
  { size: 11, whites: [62, 72], fixedMax: 12 },
  { size: 7, whites: [22, 22], fixedMin: 4 },
  { size: 7, whites: [22, 24], fixedMin: 4 },
  { size: 7, whites: [24, 26], fixedMin: 3 },
  { size: 7, whites: [26, 26], fixedMin: 3 },
  { size: 7, whites: [28, 28], fixedMax: 5 },
  { size: 7, whites: [30, 30], fixedMax: 5 },
];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ─── combination sets, built again here ────────────────────────────────────
function combos(n, total) {
  const out = [];
  const rec = (start, left, sum, set) => {
    if (left === 0) { if (sum === total) out.push(set.slice()); return; }
    for (let d = start; d <= 9; d++) { if (sum + d > total) break; set.push(d); rec(d + 1, left - 1, sum + d, set); set.pop(); }
  };
  rec(1, n, 0, []);
  return out;
}

// ─── geometry from the stored board ────────────────────────────────────────
function runsOf(sol) {
  const N = sol.length;
  const runs = [];
  for (let r = 0; r < N; r++) {
    let c = 0;
    while (c < N) {
      if (sol[r][c] === 0) { c++; continue; }
      const s = c; while (c < N && sol[r][c] !== 0) c++;
      runs.push({ dir: 'a', hr: r, hc: s - 1, cells: Array.from({ length: c - s }, (_, i) => [r, s + i]) });
    }
  }
  for (let c = 0; c < N; c++) {
    let r = 0;
    while (r < N) {
      if (sol[r][c] === 0) { r++; continue; }
      const s = r; while (r < N && sol[r][c] !== 0) r++;
      runs.push({ dir: 'd', hr: s - 1, hc: c, cells: Array.from({ length: r - s }, (_, i) => [s + i, c]) });
    }
  }
  return runs;
}

// ─── deduction solver: arrays of candidate arrays, run by run ──────────────
function deduce(N, runs, sums, whites) {
  const cand = {};
  for (const [r, c] of whites) cand[`${r},${c}`] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let changed = true, rounds = 0;
  while (changed && rounds++ < 500) {
    changed = false;
    runs.forEach((run, ri) => {
      const keys = run.cells.map(([r, c]) => `${r},${c}`);
      const keep = keys.map(() => new Set());
      // every ordered assignment of distinct digits from the candidates hitting the total
      const walk = (i, left, used) => {
        if (i === keys.length) return left === 0;
        let any = false;
        for (const d of cand[keys[i]]) {
          if (used.includes(d) || d > left) continue;
          if (walk(i + 1, left - d, used.concat(d))) { keep[i].add(d); any = true; }
        }
        return any;
      };
      walk(0, sums[ri], []);
      keys.forEach((k, i) => {
        const next = cand[k].filter((d) => keep[i].has(d));
        if (next.length !== cand[k].length) { cand[k] = next; changed = true; }
      });
    });
  }
  return cand;
}

// ─── counting solver: cell by cell in reading order, run bounds only ───────
function countFillings(N, runs, sums, whites, cap) {
  const at = {};
  const runIdx = {};
  runs.forEach((run, ri) => { for (const [r, c] of run.cells) { const k = `${r},${c}`; (runIdx[k] = runIdx[k] || []).push(ri); } });
  const st = runs.map((run) => ({ sum: 0, n: 0, used: [], len: run.cells.length }));
  let count = 0;
  const fits = (k, d) => {
    for (const ri of runIdx[k]) {
      const s = st[ri];
      if (s.used.includes(d)) return false;
      const tot = s.sum + d, rem = s.len - s.n - 1;
      if (rem === 0) { if (tot !== sums[ri]) return false; continue; }
      if (tot >= sums[ri]) return false;
      const free = [];
      for (let x = 1; x <= 9; x++) if (x !== d && !s.used.includes(x)) free.push(x);
      if (free.length < rem) return false;
      const mn = free.slice(0, rem).reduce((a, b) => a + b, 0);
      const mx = free.slice(-rem).reduce((a, b) => a + b, 0);
      if (tot + mn > sums[ri] || tot + mx < sums[ri]) return false;
    }
    return true;
  };
  const rec = (i) => {
    if (i === whites.length) { count++; return count >= cap; }
    const [r, c] = whites[i]; const k = `${r},${c}`;
    for (let d = 1; d <= 9; d++) {
      if (!fits(k, d)) continue;
      for (const ri of runIdx[k]) { const s = st[ri]; s.sum += d; s.n++; s.used.push(d); }
      at[k] = d;
      if (rec(i + 1)) return true;
      for (const ri of runIdx[k]) { const s = st[ri]; s.sum -= d; s.n--; s.used.pop(); }
    }
    return false;
  };
  rec(0);
  return count;
}

// ─── the sweep ─────────────────────────────────────────────────────────────
let bad = 0;
const notes = [];
const seenId = new Set();
const seenPattern = new Set();
const seenSums = new Set();
let prevLive = null;

PUZZLES.forEach((p, idx) => {
  const id = `#${p.num} ${p.live}`;
  const errs = [];
  const push = (m) => errs.push(m);

  if (p.num !== idx + 1) push(`num is ${p.num}, expected ${idx + 1}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.live || '')) push('live is not an ISO date');
  const d = new Date(`${p.live}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) { console.error(`✗ ${id}: unparseable live date`); bad++; return; }
  if (prevLive) {
    const gap = Math.round((d - new Date(`${prevLive}T00:00:00Z`)) / 86400000);
    if (gap !== 1) push(`${gap} days after the previous board, expected 1`);
  }
  prevLive = p.live;
  const wantId = `sums-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantId) push(`quizId is ${p.quizId}, expected ${wantId}`);
  if (seenId.has(p.quizId)) push('duplicate quizId');
  seenId.add(p.quizId);
  const wantLabel = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) push(`dateLabel is "${p.dateLabel}", expected "${wantLabel}"`);
  const dow = d.getUTCDay();
  if (!!p.sunday !== (dow === 0)) push(`sunday flag is ${!!p.sunday} on a ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]}`);

  const sol = p.sol;
  const N = p.size;
  if (!Array.isArray(sol) || sol.length !== N || sol.some((row) => !Array.isArray(row) || row.length !== N)) { push(`sol is not ${N}x${N}`); }
  else {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const v = sol[r][c];
      if (!Number.isInteger(v) || v < 0 || v > 9) push(`sol[${r}][${c}] is ${v}`);
      if ((r === 0 || c === 0) && v !== 0) push(`row 0 / column 0 must be black, sol[${r}][${c}] = ${v}`);
    }
    // symmetry of the inner square
    for (let r = 1; r < N; r++) for (let c = 1; c < N; c++) {
      if ((sol[r][c] === 0) !== (sol[N - r][N - c] === 0)) { push('black pattern is not symmetric under a 180-degree turn'); r = N; break; }
    }
    const whites = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (sol[r][c] !== 0) whites.push([r, c]);
    const runs = runsOf(sol);
    let geomOk = true;
    for (const run of runs) {
      if (run.cells.length < 2) { push(`a one-cell run at (${run.cells[0]})`); geomOk = false; }
      if (run.cells.length > 9) { push(`a run of ${run.cells.length} cells`); geomOk = false; }
      const digs = run.cells.map(([r, c]) => sol[r][c]);
      if (new Set(digs).size !== digs.length) push(`digit repeats inside the ${run.dir} run at (${run.hr},${run.hc})`);
    }
    const membership = {};
    runs.forEach((run) => { for (const [r, c] of run.cells) { const k = `${r},${c}`; membership[k] = (membership[k] || 0) + 1; } });
    for (const [r, c] of whites) if (membership[`${r},${c}`] !== 2) { push(`white (${r},${c}) is not in one across and one down run`); geomOk = false; }
    // connectivity
    if (whites.length) {
      const seen = new Set([`${whites[0][0]},${whites[0][1]}`]);
      const stack = [whites[0]];
      while (stack.length) {
        const [r, c] = stack.pop();
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || cc < 0 || rr >= N || cc >= N || sol[rr][cc] === 0) continue;
          const k = `${rr},${cc}`;
          if (!seen.has(k)) { seen.add(k); stack.push([rr, cc]); }
        }
      }
      if (seen.size !== whites.length) push('the white cells are not one connected region');
    }
    // clues: exactly at run heads, equal to the run's sum
    const sums = runs.map((run) => run.cells.reduce((s, [r, c]) => s + sol[r][c], 0));
    const wantA = Array.from({ length: N }, () => Array(N).fill(0));
    const wantD = Array.from({ length: N }, () => Array(N).fill(0));
    runs.forEach((run, i) => { if (run.dir === 'a') wantA[run.hr][run.hc] = sums[i]; else wantD[run.hr][run.hc] = sums[i]; });
    if (JSON.stringify(p.across) !== JSON.stringify(wantA)) push('`across` does not match the totals recomputed from sol');
    if (JSON.stringify(p.down) !== JSON.stringify(wantD)) push('`down` does not match the totals recomputed from sol');
    // measured fields
    const fixed = runs.reduce((n, run, i) => n + (combos(run.cells.length, sums[i]).length === 1 ? 1 : 0), 0);
    if (p.whites !== whites.length) push(`whites is ${p.whites}, recomputed ${whites.length}`);
    if (p.fixed !== fixed) push(`fixed is ${p.fixed}, recomputed ${fixed}`);
    if (p.runs !== runs.length) push(`runs is ${p.runs}, recomputed ${runs.length}`);
    // ramp
    const ramp = RAMP[dow];
    if (N !== ramp.size) push(`size ${N} on a day that wants ${ramp.size}`);
    if (whites.length < ramp.whites[0] || whites.length > ramp.whites[1]) push(`${whites.length} whites, band is ${ramp.whites.join('-')}`);
    if (ramp.fixedMin != null && fixed < ramp.fixedMin) push(`${fixed} fixed runs, floor is ${ramp.fixedMin}`);
    if (ramp.fixedMax != null && fixed > ramp.fixedMax) push(`${fixed} fixed runs, cap is ${ramp.fixedMax}`);
    // variety
    const pk = sol.map((row) => row.map((v) => (v ? 1 : 0)).join('')).join('/');
    if (seenPattern.has(pk)) push('black pattern already used in this bank'); seenPattern.add(pk);
    const sk = sums.join(',');
    if (seenSums.has(sk)) push('totals list already used in this bank'); seenSums.add(sk);
    // uniqueness and no-guessing, both independent
    if (geomOk && errs.length === 0) {
      const n = countFillings(N, runs, sums, whites, 2);
      if (n !== 1) push(`${n === 0 ? 'no' : 'more than one'} filling matches the totals`);
      const cand = deduce(N, runs, sums, whites);
      for (const [r, c] of whites) {
        const k = `${r},${c}`;
        if (cand[k].length !== 1) { push('deduction alone does not finish the board (a guess would be needed)'); break; }
        if (cand[k][0] !== sol[r][c]) { push(`deduction places ${cand[k][0]} at (${r},${c}) where sol has ${sol[r][c]}`); break; }
      }
    }
  }

  if (errs.length) { bad++; for (const e of errs) console.error(`✗ ${id}: ${e}`); }
});

const last = PUZZLES[PUZZLES.length - 1];
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const runway = Math.round((new Date(`${last.live}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 86400000);
if (runway < 30) notes.push(`… only ${runway} days of bank left (through ${last.live}); rebuild before it runs dry`);
for (const n of notes) console.log(n);
if (bad) { console.error(`✗ ${bad} of ${PUZZLES.length} Sums boards failed`); process.exit(1); }
console.log(`✓ ${PUZZLES.length} Sums boards verified: ${PUZZLES[0].live} to ${last.live} (${runway} days of runway)`);
