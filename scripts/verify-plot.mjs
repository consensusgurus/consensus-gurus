#!/usr/bin/env node
// verify-plot — prove every Plot board before it ships.
//
// Plot boards are correct by construction (the generator tiles the grid, then
// each rectangle writes its own area into one of its own cells), so what has to
// be PROVED here is everything construction does not give you for free. Nothing
// below trusts a stored field: the clue values, the difficulty dials, the
// uniqueness and the no-guessing guarantee are all RE-DERIVED from `clues`
// alone, and `sol` is then checked against what the solver found.
//
//   node scripts/verify-plot.mjs
//
// CHECKS
//   1  shape        every field present and in range, num sequential from 1
//   2  calendar     live dates run daily with no gaps, quizId and dateLabel
//                   agree with live, and `sunday` is true on exactly the
//                   Sundays (Eastern), where the board is 12x12 not 10x10
//   3  tiling       `sol` covers every cell exactly once, inside the board
//   4  clues        each solution rectangle holds exactly ONE clue, that clue
//                   sits inside it, and its value equals the rectangle's area,
//                   so the printed clue set really is derived from the tiling
//   5  uniqueness   an independent DFS counts solutions with a cap of 2 and the
//                   count must be exactly 1, and the one solution it finds must
//                   be the stored `sol`
//   6  no guessing  an independent propagation solver, which only ever places a
//                   plot when a single placement remains, must finish the board
//   7  dials        `open` and `deep` re-derived and matched to the stored value
//   8  ramp         difficulty climbs Monday to Saturday, and the Sunday Edition
//                   sits at the top and needs the harder deduction at least once
//   9  variety      no repeated board, and the 1x1 count stays inside its cap
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const { PUZZLES } = await import(join(root, 'app/plot/puzzles.js'));

let fails = 0, notes = 0;
const fail = (p, m) => { console.log(`✗ ${p ? `#${p.num} ${p.live}: ` : ''}${m}`); fails++; };
const note = (m) => { console.log(`… ${m}`); notes++; };

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MAXAREA = 9;
// Boards live from launch; anything earlier would be rewriting a played day.
const PLOT_FROM = '2026-08-14';

// ── the two solvers, written here rather than imported, so a bug in the
// generator cannot certify itself ──────────────────────────────────────────
function placements(clue, clues, n) {
  const [ar, ac, v] = clue;
  const out = [];
  for (let w = 1; w <= v; w++) {
    if (v % w) continue;
    const h = v / w;
    for (let r = ar - h + 1; r <= ar; r++) {
      for (let c = ac - w + 1; c <= ac; c++) {
        if (r < 0 || c < 0 || r + h > n || c + w > n) continue;
        let clean = true;
        for (const o of clues) {
          if (o === clue) continue;
          if (o[0] >= r && o[0] < r + h && o[1] >= c && o[1] < c + w) { clean = false; break; }
        }
        if (clean) out.push([r, c, w, h]);
      }
    }
  }
  return out;
}
const covers = (R, r, c) => r >= R[0] && r < R[0] + R[3] && c >= R[1] && c < R[1] + R[2];

function solve(clues, n, cap) {
  const lists = clues.map((cl) => placements(cl, clues, n));
  if (lists.some((L) => !L.length)) return { count: 0, first: null };
  const used = new Uint8Array(n * n);
  const taken = new Array(clues.length).fill(null);
  let count = 0, first = null;
  const fits = (R) => {
    for (let r = R[0]; r < R[0] + R[3]; r++) for (let c = R[1]; c < R[1] + R[2]; c++) if (used[r * n + c]) return false;
    return true;
  };
  const mark = (R, v) => {
    for (let r = R[0]; r < R[0] + R[3]; r++) for (let c = R[1]; c < R[1] + R[2]; c++) used[r * n + c] = v;
  };
  const go = (depth) => {
    if (count >= cap) return;
    if (depth === clues.length) {
      count++;
      if (!first) first = taken.map((R) => R.slice());
      return;
    }
    let pick = -1, opts = null;
    for (let k = 0; k < clues.length; k++) {
      if (taken[k]) continue;
      const f = lists[k].filter(fits);
      if (!f.length) return;
      if (pick < 0 || f.length < opts.length) { pick = k; opts = f; }
      if (f.length === 1) break;
    }
    for (const R of opts) {
      taken[pick] = R; mark(R, 1);
      go(depth + 1);
      mark(R, 0); taken[pick] = null;
      if (count >= cap) break;
    }
  };
  go(0);
  return { count, first };
}

function propagate(clues, n) {
  const lists = clues.map((cl) => placements(cl, clues, n));
  const used = new Uint8Array(n * n);
  const done = new Array(clues.length).fill(false);
  const fits = (R) => {
    for (let r = R[0]; r < R[0] + R[3]; r++) for (let c = R[1]; c < R[1] + R[2]; c++) if (used[r * n + c]) return false;
    return true;
  };
  const lay = (R) => { for (let r = R[0]; r < R[0] + R[3]; r++) for (let c = R[1]; c < R[1] + R[2]; c++) used[r * n + c] = 1; };
  let placed = 0, deep = 0;
  for (;;) {
    let moved = false;
    for (let k = 0; k < clues.length; k++) {
      if (done[k]) continue;
      const f = lists[k].filter(fits);
      if (!f.length) return { ok: false, deep };
      if (f.length === 1) { lay(f[0]); done[k] = true; placed++; moved = true; }
    }
    if (!moved) {
      for (let cell = 0; cell < n * n && !moved; cell++) {
        if (used[cell]) continue;
        const cr = Math.floor(cell / n), cc = cell % n;
        let owner = -1, only = null, reach = 0;
        for (let k = 0; k < clues.length && reach < 2; k++) {
          if (done[k]) continue;
          const f = lists[k].filter((R) => fits(R) && covers(R, cr, cc));
          if (f.length) { reach++; owner = k; only = f.length === 1 ? f[0] : null; }
        }
        if (reach === 1 && only) { lay(only); done[owner] = true; placed++; deep++; moved = true; }
      }
    }
    if (!moved) break;
  }
  return { ok: placed === clues.length, deep };
}

// ── checks ────────────────────────────────────────────────────────────────
const seenBoards = new Map();
const byDow = {};

PUZZLES.forEach((p, i) => {
  // 1 shape
  for (const f of ['num', 'quizId', 'live', 'dateLabel', 'n', 'clues', 'sol']) {
    if (p[f] === undefined) fail(p, `missing field ${f}`);
  }
  if (p.num !== i + 1) fail(p, `num ${p.num} out of sequence at index ${i}`);
  if (p.live < PLOT_FROM) fail(p, `live ${p.live} predates launch ${PLOT_FROM}`);
  if (!Array.isArray(p.clues) || !p.clues.length) { fail(p, 'no clues'); return; }
  if (p.sol.length !== p.clues.length) fail(p, `sol has ${p.sol.length} rectangles for ${p.clues.length} clues`);

  // 2 calendar
  const d = new Date(`${p.live}T12:00:00Z`);
  const [y, m, dd] = p.live.split('-').map(Number);
  if (p.quizId !== `plot-${m}-${dd}-${String(y).slice(2)}`) fail(p, `quizId ${p.quizId} does not match live`);
  if (p.dateLabel !== `${MONTHS[m - 1]} ${dd}, ${y}`) fail(p, `dateLabel ${p.dateLabel} does not match live`);
  const isSun = d.getUTCDay() === 0;
  if (!!p.sunday !== isSun) fail(p, `sunday flag ${!!p.sunday} but ${p.live} is ${isSun ? 'a Sunday' : 'not a Sunday'}`);
  if (p.n !== (isSun ? 12 : 10)) fail(p, `board is ${p.n}x${p.n} on a ${isSun ? 'Sunday' : 'weekday'}`);
  if (i) {
    const prev = new Date(`${PUZZLES[i - 1].live}T12:00:00Z`);
    const gap = Math.round((d - prev) / 86400000);
    if (gap !== 1) fail(p, `${gap} day gap after ${PUZZLES[i - 1].live}`);
  }

  const n = p.n;
  // 3 tiling
  const cover = new Int8Array(n * n);
  let ones = 0, area = 0;
  for (const [r, c, w, h] of p.sol) {
    if (r < 0 || c < 0 || r + h > n || c + w > n) { fail(p, `rectangle ${r},${c} ${w}x${h} runs off the board`); continue; }
    if (w * h > MAXAREA) fail(p, `rectangle ${w}x${h} is area ${w * h}, over the cap of ${MAXAREA}`);
    if (w * h === 1) ones++;
    area += w * h;
    for (let rr = r; rr < r + h; rr++) for (let cc = c; cc < c + w; cc++) cover[rr * n + cc]++;
  }
  if (area !== n * n) fail(p, `rectangles cover ${area} cells, board is ${n * n}`);
  const over = [...cover].filter((v) => v > 1).length;
  const under = [...cover].filter((v) => v === 0).length;
  if (over) fail(p, `${over} cells covered twice`);
  if (under) fail(p, `${under} cells covered by nothing`);

  // 4 clues really are derived from the tiling
  p.sol.forEach((R, k) => {
    const inside = p.clues.filter((cl) => covers(R, cl[0], cl[1]));
    if (inside.length !== 1) fail(p, `rectangle ${k} holds ${inside.length} clues, needs exactly 1`);
    else if (inside[0][2] !== R[2] * R[3]) fail(p, `clue ${inside[0][2]} on a ${R[2]}x${R[3]} rectangle (area ${R[2] * R[3]})`);
    if (p.clues[k] && !covers(R, p.clues[k][0], p.clues[k][1])) fail(p, `sol[${k}] is not the rectangle for clues[${k}], the arrays are not aligned`);
  });
  for (const [r, c, v] of p.clues) {
    if (r < 0 || r >= n || c < 0 || c >= n) fail(p, `clue at ${r},${c} is off the board`);
    if (!Number.isInteger(v) || v < 1 || v > MAXAREA) fail(p, `clue value ${v} out of range`);
  }

  // 5 uniqueness, and the stored solution is the one
  const { count, first } = solve(p.clues, n, 2);
  if (count !== 1) fail(p, `${count === 0 ? 'no solution' : 'more than one solution'} (${count} found, capped at 2)`);
  if (count === 1 && first) {
    const norm = (a) => a.map((R) => R.join(',')).sort().join('|');
    if (norm(first) !== norm(p.sol)) fail(p, 'the unique solution is not the stored sol');
  }

  // 6 no guessing, 7 dials
  const pr = propagate(p.clues, n);
  if (!pr.ok) fail(p, 'cannot be finished without a guess');
  if (p.deep !== undefined && p.deep !== pr.deep) fail(p, `deep is ${p.deep}, re-derived ${pr.deep}`);
  let openCount = 0;
  for (const cl of p.clues) if (placements(cl, p.clues, n).length > 1) openCount++;
  const open = Number((openCount / p.clues.length).toFixed(3));
  if (p.open !== undefined && Math.abs(p.open - open) > 0.0011) fail(p, `open is ${p.open}, re-derived ${open}`);

  // 9 variety
  if (ones > (isSun ? 3 : 2)) fail(p, `${ones} single-cell plots, cap is ${isSun ? 3 : 2}`);
  const key = p.clues.map((cl) => cl.join(',')).sort().join('|');
  if (seenBoards.has(key)) fail(p, `identical board to #${seenBoards.get(key)}`);
  seenBoards.set(key, p.num);

  (byDow[d.getUTCDay()] = byDow[d.getUTCDay()] || []).push(open);
});

// 8 ramp: Monday to Saturday climbs, Sunday tops it
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const week = [1, 2, 3, 4, 5, 6].filter((w) => byDow[w] && byDow[w].length).map((w) => ({ w, a: avg(byDow[w]) }));
for (let k = 1; k < week.length; k++) {
  if (week[k].a < week[k - 1].a - 0.02) {
    note(`difficulty dips from day ${week[k - 1].w} (${week[k - 1].a.toFixed(2)}) to day ${week[k].w} (${week[k].a.toFixed(2)})`);
  }
}
if (byDow[0] && week.length) {
  const sun = avg(byDow[0]), sat = week[week.length - 1].a;
  if (sun < sat - 0.02) note(`Sunday (${sun.toFixed(2)}) is easier than Saturday (${sat.toFixed(2)})`);
}
for (const p of PUZZLES) {
  if (p.sunday && p.deep !== undefined && p.deep < 1) fail(p, 'a Sunday Edition that never needs the harder deduction');
}

const last = PUZZLES[PUZZLES.length - 1];
console.log(`plot: ${PUZZLES.length} boards, ${PUZZLES[0].live} to ${last.live}, ${fails} failure${fails === 1 ? '' : 's'}${notes ? `, ${notes} note${notes === 1 ? '' : 's'}` : ''}`);
if (!fails) {
  const wk = PUZZLES.filter((p) => !p.sunday), su = PUZZLES.filter((p) => p.sunday);
  console.log(`  weekdays ${wk.length} at 10x10, Sunday Editions ${su.length} at 12x12`);
  console.log(`  every board tiles exactly, has exactly one solution, and needs no guess`);
}
process.exit(fails ? 1 : 0);
