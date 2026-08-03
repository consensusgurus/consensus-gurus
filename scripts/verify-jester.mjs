// Verify the Jester bank (app/jester/puzzles.js) from scratch:
//   - structural: nums sequential, quizId/live/dateLabel agree, sunday flag
//     matches the real weekday, no gaps or duplicate dates in the run
//   - regions: an n x n partition into exactly n contiguous courts
//   - EXACTLY ONE solution by exhaustive backtracking, matching the stored one
//   - the no-guessing bar: a human-move propagation solver (no trial-and-error)
//     must solve every board
//   - DIFFICULTY RAMP: unplayed boards are graded by which deduction tiers they
//     demand, and the weekday means must climb Mon -> Sat. Grid size is NOT a
//     difficulty signal and is deliberately not checked against the weekday.
//   - every unplayed Sunday is a two-jester board
// Run: node scripts/verify-jester.mjs
import { PUZZLES } from '../app/jester/puzzles.js';
import { humanSolve2 } from './jester2-human.mjs';
import { gradeBoard } from './grade-jester.mjs';

const CUTOVER = '2026-08-03';        // boards on or before this are played and frozen
let fails = 0;
const fail = (msg) => { console.error('FAIL:', msg); fails++; };

// ---------- one-jester engine (unchanged rules) ----------
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

// ---------- two-jester engine ----------
function countSolutions2(n, regions, cap = 2) {
  const pairs = []; for (let a = 0; a < n; a++) for (let b = a + 2; b < n; b++) pairs.push([a, b]);
  const suffix = Array.from({ length: n + 1 }, () => Array(n).fill(0));
  for (let r = n - 1; r >= 0; r--) {
    const seen = new Set(); for (let c = 0; c < n; c++) seen.add(regions[r][c]);
    for (let id = 0; id < n; id++) suffix[r][id] = suffix[r + 1][id] + (seen.has(id) ? 1 : 0);
  }
  const colCount = Array(n).fill(0), regCount = Array(n).fill(0);
  const out = []; const cur = []; let prev = null;
  const walk = (r) => {
    if (out.length >= cap) return;
    if (r === n) { if (colCount.every(c => c === 2) && regCount.every(x => x === 2)) out.push(cur.map(p => p.slice())); return; }
    for (const [a, b] of pairs) {
      if (colCount[a] >= 2 || colCount[b] >= 2) continue;
      if (prev && (Math.abs(a-prev[0])<2||Math.abs(a-prev[1])<2||Math.abs(b-prev[0])<2||Math.abs(b-prev[1])<2)) continue;
      const ra = regions[r][a], rb = regions[r][b];
      if (ra === rb) { if (regCount[ra] > 0) continue; }
      else if (regCount[ra] >= 2 || regCount[rb] >= 2) continue;
      colCount[a]++; colCount[b]++; regCount[ra]++; regCount[rb]++;
      let ok = true;
      const left = n - r - 1;
      for (let c = 0; c < n && ok; c++) if (2 - colCount[c] > left) ok = false;
      for (let id = 0; id < n && ok; id++) if (2 - regCount[id] > suffix[r + 1][id] * 2) ok = false;
      if (ok) { const sp = prev; prev = [a, b]; cur.push([a, b]); walk(r + 1); cur.pop(); prev = sp; }
      colCount[a]--; colCount[b]--; regCount[ra]--; regCount[rb]--;
      if (out.length >= cap) return;
    }
  };
  walk(0);
  return out;
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

// ---------- per-board checks ----------
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const seenLayouts = new Set(), seenDates = new Set();
const grades = [];
let prevDate = null;

PUZZLES.forEach((p, i) => {
  const tag = `#${p.num} (${p.quizId})`;
  const stars = p.stars || 1;
  if (p.num !== i + 1) fail(`${tag}: num out of sequence`);
  const [y, m, d] = p.live.split('-').map(Number);
  if (p.quizId !== `jester-${m}-${d}-${String(y).slice(2)}`) fail(`${tag}: quizId does not match live`);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  const labelStr = `${dt.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${d}, ${y}`;
  if (p.dateLabel !== labelStr) fail(`${tag}: dateLabel "${p.dateLabel}" != "${labelStr}"`);
  if (p.sunday !== (dt.getUTCDay() === 0)) fail(`${tag}: sunday flag disagrees with the weekday`);
  if (seenDates.has(p.live)) fail(`${tag}: duplicate date`);
  seenDates.add(p.live);
  if (prevDate) { const gap = (dt - prevDate) / 86400000; if (gap !== 1) fail(`${tag}: ${gap} day gap before this board`); }
  prevDate = dt;

  const n = p.size;
  if (stars === 2 && n !== 10) fail(`${tag}: two-jester boards are 10x10, got ${n}`);
  if (stars === 1 && n !== 8 && n !== 9) fail(`${tag}: unexpected size ${n}`);
  if (stars === 2 && !p.sunday) fail(`${tag}: two-jester board is not on a Sunday`);
  if (p.regions.length !== n || p.regions.some((row) => row.length !== n)) fail(`${tag}: regions not ${n}x${n}`);
  const sizes = Array(n).fill(0);
  let idsOK = true;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const id = p.regions[r][c];
    if (!Number.isInteger(id) || id < 0 || id >= n) idsOK = false; else sizes[id]++;
  }
  if (!idsOK) fail(`${tag}: bad region id`);
  if (sizes.some((s) => s < (stars === 2 ? 4 : 2))) fail(`${tag}: court too small to seat ${stars}`);
  for (let id = 0; id < n; id++) if (!contiguous(n, p.regions, id)) fail(`${tag}: court ${id} not contiguous`);
  const key = JSON.stringify(p.regions);
  if (seenLayouts.has(key)) fail(`${tag}: duplicate layout`);
  seenLayouts.add(key);

  if (stars === 1) {
    const sol = p.solution;
    if (sol.length !== n || new Set(sol).size !== n) fail(`${tag}: solution not a permutation`);
    for (let r = 1; r < n; r++) if (Math.abs(sol[r] - sol[r - 1]) <= 1) fail(`${tag}: touching jesters (rows ${r - 1}/${r})`);
    if (new Set(sol.map((c, r) => p.regions[r][c])).size !== n) fail(`${tag}: solution repeats a court`);
    if (countSolutions(n, p.regions) !== 1) fail(`${tag}: solution count != 1`);
    const hs = humanSolve(n, p.regions);
    if (!hs.solved) fail(`${tag}: NOT human-solvable without guessing`);
    else if (hs.cols.some((c, r) => c !== sol[r])) fail(`${tag}: human solution differs from stored`);
    if (p.live > CUTOVER) grades.push({ dow: dt.getUTCDay(), score: gradeBoard(n, p.regions).score, tag });
  } else {
    const sol = p.solution;
    if (sol.length !== n || sol.some((pair) => !Array.isArray(pair) || pair.length !== 2)) fail(`${tag}: solution is not ${n} column pairs`);
    const flat = []; for (let r = 0; r < n; r++) for (const c of sol[r]) flat.push([r, c]);
    if (flat.length !== 2 * n) fail(`${tag}: expected ${2 * n} jesters`);
    const colN = Array(n).fill(0), regN = Array(n).fill(0);
    for (const [r, c] of flat) { colN[c]++; regN[p.regions[r][c]]++; }
    if (colN.some((x) => x !== 2)) fail(`${tag}: a column does not hold exactly 2`);
    if (regN.some((x) => x !== 2)) fail(`${tag}: a court does not hold exactly 2`);
    for (let a = 0; a < flat.length; a++) for (let b = a + 1; b < flat.length; b++) {
      const [r1, c1] = flat[a], [r2, c2] = flat[b];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) fail(`${tag}: touching jesters`);
    }
    const sols = countSolutions2(n, p.regions, 2);
    if (sols.length !== 1) fail(`${tag}: solution count != 1 (got ${sols.length})`);
    else if (JSON.stringify(sols[0]) !== JSON.stringify(sol)) fail(`${tag}: stored solution is not THE solution`);
    const hs = humanSolve2(n, p.regions);
    if (!hs.solved) fail(`${tag}: NOT human-solvable without guessing`);
    else {
      const human = Array.from({ length: n }, (_, r) => { const cs = []; for (let c = 0; c < n; c++) if (hs.star[r][c]) cs.push(c); return cs; });
      if (JSON.stringify(human) !== JSON.stringify(sol)) fail(`${tag}: deduction lands somewhere else`);
    }
  }
});

// ---------- difficulty ramp across the unplayed week ----------
const meanBy = {};
for (const g of grades) (meanBy[g.dow] ||= []).push(g.score);
const means = {};
for (const w of [1, 2, 3, 4, 5, 6]) {
  const a = meanBy[w] || [];
  if (!a.length) { fail(`no unplayed boards on ${DOW[w]}`); continue; }
  means[w] = a.reduce((x, y) => x + y, 0) / a.length;
}
for (const w of [2, 3, 4, 5, 6]) {
  if (means[w] !== undefined && means[w - 1] !== undefined && means[w] <= means[w - 1]) {
    fail(`difficulty ramp breaks: ${DOW[w]} (${means[w].toFixed(1)}) is not harder than ${DOW[w - 1]} (${means[w - 1].toFixed(1)})`);
  }
}
const futureSundays = PUZZLES.filter((p) => p.live > CUTOVER && p.sunday);
for (const p of futureSundays) if ((p.stars || 1) !== 2) fail(`#${p.num} (${p.quizId}): unplayed Sunday is not a two-jester board`);

if (fails) { console.error(`\nverify-jester: ${fails} FAILURE(S)`); process.exit(1); }
console.log(`verify-jester: all ${PUZZLES.length} boards pass (unique + pure-deduction, structure OK)`);
console.log('  weekday difficulty ramp: ' + [1,2,3,4,5,6].map((w) => `${DOW[w]} ${means[w].toFixed(1)}`).join('  ->  '));
console.log(`  two-jester Sundays: ${PUZZLES.filter((p) => (p.stars || 1) === 2).length}`);
