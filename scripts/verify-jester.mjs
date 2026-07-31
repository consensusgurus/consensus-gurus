// Verify the Jester bank (app/jester/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, Sunday boards are 9x9 and weekdays 8x8
//   - regions: an n x n partition into exactly n contiguous regions, every
//     region at least 2 cells
//   - EXACTLY ONE solution by exhaustive backtracking, matching the stored one
//   - the §7a no-guessing bar: a human-move propagation solver (singles,
//     confinement, single-placement lookahead — no trial-and-error) must
//     solve every board
// Run: node scripts/verify-jester.mjs
import { PUZZLES } from '../app/jester/puzzles.js';

let fails = 0;
const fail = (msg) => { console.error('FAIL:', msg); fails++; };

function countSolutions(n, regions, cap = 2) {
  let count = 0;
  const usedCol = Array(n).fill(false), usedReg = Array(n).fill(false), cols = [];
  const walk = (r) => {
    if (count >= cap) return;
    if (r === n) { count++; return; }
    for (let c = 0; c < n; c++) {
      if (usedCol[c] || usedReg[regions[r][c]]) continue;
      if (r > 0 && Math.abs(cols[r - 1] - c) <= 1) continue;
      usedCol[c] = true; usedReg[regions[r][c]] = true; cols.push(c);
      walk(r + 1);
      cols.pop(); usedCol[c] = false; usedReg[regions[r][c]] = false;
    }
  };
  walk(0);
  return count;
}

function humanSolve(n, regions) {
  const cand = Array.from({ length: n }, () => Array(n).fill(true));
  const placed = Array(n).fill(-1);
  const regCells = Array.from({ length: n }, () => []);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) regCells[regions[r][c]].push([r, c]);
  const doPlace = (r, c) => {
    placed[r] = c;
    for (let c2 = 0; c2 < n; c2++) if (c2 !== c) cand[r][c2] = false;
    for (let r2 = 0; r2 < n; r2++) if (r2 !== r) cand[r2][c] = false;
    for (const [rr, cc] of regCells[regions[r][c]]) if (rr !== r || cc !== c) cand[rr][cc] = false;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const r2 = r + dr, c2 = c + dc;
      if ((dr || dc) && r2 >= 0 && r2 < n && c2 >= 0 && c2 < n) cand[r2][c2] = false;
    }
  };
  const unitsOK = (g) => {
    for (let r = 0; r < n; r++) { let a = false; for (let c = 0; c < n; c++) if (g[r][c]) a = true; if (!a) return false; }
    for (let c = 0; c < n; c++) { let a = false; for (let r = 0; r < n; r++) if (g[r][c]) a = true; if (!a) return false; }
    for (let id = 0; id < n; id++) { let a = false; for (const [r, c] of regCells[id]) if (g[r][c]) a = true; if (!a) return false; }
    return true;
  };
  for (let iter = 0; iter < n * n * 8; iter++) {
    if (placed.every((c) => c !== -1)) return { solved: true, cols: placed.slice() };
    let prog = false;
    for (let r = 0; r < n && !prog; r++) {
      if (placed[r] !== -1) continue;
      const cs = []; for (let c = 0; c < n; c++) if (cand[r][c]) cs.push(c);
      if (!cs.length) return { solved: false };
      if (cs.length === 1) { doPlace(r, cs[0]); prog = true; }
    }
    if (prog) continue;
    for (let c = 0; c < n && !prog; c++) {
      const rs = []; for (let r = 0; r < n; r++) if (cand[r][c]) rs.push(r);
      if (rs.length === 1 && placed[rs[0]] === -1) { doPlace(rs[0], c); prog = true; }
    }
    if (prog) continue;
    for (let id = 0; id < n && !prog; id++) {
      const cells = regCells[id].filter(([r, c]) => cand[r][c]);
      if (cells.length === 1 && placed[cells[0][0]] === -1) { doPlace(cells[0][0], cells[0][1]); prog = true; }
    }
    if (prog) continue;
    for (let id = 0; id < n && !prog; id++) {
      const cells = regCells[id].filter(([r, c]) => cand[r][c]);
      if (!cells.length) return { solved: false };
      const rows = new Set(cells.map(([r]) => r)), colsSet = new Set(cells.map(([, c]) => c));
      if (rows.size === 1) {
        const r = cells[0][0];
        for (let c = 0; c < n; c++) if (cand[r][c] && regions[r][c] !== id) { cand[r][c] = false; prog = true; }
      } else if (colsSet.size === 1) {
        const c = cells[0][1];
        for (let r = 0; r < n; r++) if (cand[r][c] && regions[r][c] !== id) { cand[r][c] = false; prog = true; }
      }
    }
    if (prog) continue;
    for (let r = 0; r < n && !prog; r++) {
      if (placed[r] !== -1) continue;
      const ids = new Set(); for (let c = 0; c < n; c++) if (cand[r][c]) ids.add(regions[r][c]);
      if (ids.size === 1) {
        const id = ids.values().next().value;
        for (const [rr, cc] of regCells[id]) if (rr !== r && cand[rr][cc]) { cand[rr][cc] = false; prog = true; }
      }
    }
    if (prog) continue;
    for (let c = 0; c < n && !prog; c++) {
      const ids = new Set(); let colPlaced = false;
      for (let r = 0; r < n; r++) { if (placed[r] === c) colPlaced = true; if (cand[r][c]) ids.add(regions[r][c]); }
      if (!colPlaced && ids.size === 1) {
        const id = ids.values().next().value;
        for (const [rr, cc] of regCells[id]) if (cc !== c && cand[rr][cc]) { cand[rr][cc] = false; prog = true; }
      }
    }
    if (prog) continue;
    outer:
    for (let r = 0; r < n; r++) {
      if (placed[r] !== -1) continue;
      for (let c = 0; c < n; c++) {
        if (!cand[r][c]) continue;
        const sim = cand.map((row) => row.slice());
        for (let c2 = 0; c2 < n; c2++) if (c2 !== c) sim[r][c2] = false;
        for (let r2 = 0; r2 < n; r2++) if (r2 !== r) sim[r2][c] = false;
        for (const [rr, cc] of regCells[regions[r][c]]) if (rr !== r || cc !== c) sim[rr][cc] = false;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const r2 = r + dr, c2 = c + dc;
          if ((dr || dc) && r2 >= 0 && r2 < n && c2 >= 0 && c2 < n) sim[r2][c2] = false;
        }
        if (!unitsOK(sim)) { cand[r][c] = false; prog = true; break outer; }
      }
    }
    if (!prog) return { solved: false };
  }
  return { solved: false };
}

function contiguous(n, regions, id) {
  const cells = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (regions[r][c] === id) cells.push(r * n + c);
  if (!cells.length) return false;
  const set = new Set(cells), seen = new Set([cells[0]]), stack = [cells[0]];
  while (stack.length) {
    const cur = stack.pop(); const r = Math.floor(cur / n), c = cur % n;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = (r + dr) * n + (c + dc);
      if (r + dr >= 0 && r + dr < n && c + dc >= 0 && c + dc < n && set.has(k) && !seen.has(k)) { seen.add(k); stack.push(k); }
    }
  }
  return seen.size === cells.length;
}

if (PUZZLES.length !== 74) fail(`expected 24 puzzles, got ${PUZZLES.length}`);
const seenLayouts = new Set();
PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.quizId})`;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `jester-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live`);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const label = `${dt.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${d}, ${y}`;
  if (p.dateLabel !== label) fail(`${tag}: dateLabel "${p.dateLabel}" != "${label}"`);
  const realSunday = dt.getUTCDay() === 0;
  if (p.sunday !== realSunday) fail(`${tag}: sunday flag ${p.sunday} but weekday says ${realSunday}`);
  const n = p.size;
  if (n !== (p.sunday ? 9 : 8)) fail(`${tag}: size ${n} unexpected for sunday=${p.sunday}`);
  if (p.regions.length !== n || p.regions.some((row) => row.length !== n)) fail(`${tag}: regions not ${n}x${n}`);
  const sizes = Array(n).fill(0);
  let idsOK = true;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const id = p.regions[r][c];
    if (!Number.isInteger(id) || id < 0 || id >= n) idsOK = false; else sizes[id]++;
  }
  if (!idsOK) fail(`${tag}: bad region id`);
  if (sizes.some((s) => s < 2)) fail(`${tag}: region smaller than 2 cells`);
  for (let id = 0; id < n; id++) if (!contiguous(n, p.regions, id)) fail(`${tag}: region ${id} not contiguous`);
  const key = JSON.stringify(p.regions);
  if (seenLayouts.has(key)) fail(`${tag}: duplicate layout`);
  seenLayouts.add(key);
  // solution validity
  const sol = p.solution;
  if (sol.length !== n || new Set(sol).size !== n) fail(`${tag}: solution not a permutation`);
  for (let r = 1; r < n; r++) if (Math.abs(sol[r] - sol[r - 1]) <= 1) fail(`${tag}: solution has touching jesters (rows ${r - 1}/${r})`);
  const solRegs = new Set(sol.map((c, r) => p.regions[r][c]));
  if (solRegs.size !== n) fail(`${tag}: solution repeats a region`);
  // uniqueness + stored match
  if (countSolutions(n, p.regions) !== 1) fail(`${tag}: solution count != 1`);
  const hs = humanSolve(n, p.regions);
  if (!hs.solved) fail(`${tag}: NOT human-solvable without guessing`);
  else if (hs.cols.some((c, r) => c !== sol[r])) fail(`${tag}: human solution differs from stored`);
});

if (fails) { console.error(`\nverify-jester: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-jester: all ${PUZZLES.length} boards pass (unique + pure-deduction solvable, structure OK)`);
