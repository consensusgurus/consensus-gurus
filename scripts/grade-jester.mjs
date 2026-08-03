// Instrumented mirror of humanSolve from scripts/verify-jester.mjs.
// Identical rule order and control flow; adds per-tier counters so each
// board can be graded by the HARDEST move it requires, not by grid size.
//
// Tier 1 (easy)   : forced singles - a row/col/court with one candidate left.
// Tier 2 (medium) : confinement - a court penned into one row/col, or a
//                   row/col whose candidates all sit in one court.
// Tier 3 (hard)   : single-placement lookahead - place a jester, see a unit
//                   die, eliminate the cell. The only move needing foresight.
import { PUZZLES } from '../app/jester/puzzles.js';

export function humanSolveGraded(n, regions) {
  const cand = Array.from({ length: n }, () => Array(n).fill(true));
  const placed = Array(n).fill(-1);
  const regCells = Array.from({ length: n }, () => []);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) regCells[regions[r][c]].push([r, c]);
  const tier = { 1: 0, 2: 0, 3: 0 };
  let rounds = 0;

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
    if (placed.every((c) => c !== -1)) return { solved: true, cols: placed.slice(), tier, rounds };
    rounds++;
    let prog = false;
    // --- Tier 1: row singles
    for (let r = 0; r < n && !prog; r++) {
      if (placed[r] !== -1) continue;
      const cs = []; for (let c = 0; c < n; c++) if (cand[r][c]) cs.push(c);
      if (!cs.length) return { solved: false, tier, rounds };
      if (cs.length === 1) { doPlace(r, cs[0]); tier[1]++; prog = true; }
    }
    if (prog) continue;
    // --- Tier 1: column singles
    for (let c = 0; c < n && !prog; c++) {
      const rs = []; for (let r = 0; r < n; r++) if (cand[r][c]) rs.push(r);
      if (rs.length === 1 && placed[rs[0]] === -1) { doPlace(rs[0], c); tier[1]++; prog = true; }
    }
    if (prog) continue;
    // --- Tier 1: court singles
    for (let id = 0; id < n && !prog; id++) {
      const cells = regCells[id].filter(([r, c]) => cand[r][c]);
      if (cells.length === 1 && placed[cells[0][0]] === -1) { doPlace(cells[0][0], cells[0][1]); tier[1]++; prog = true; }
    }
    if (prog) continue;
    // --- Tier 2: court confined to a single row or column
    for (let id = 0; id < n && !prog; id++) {
      const cells = regCells[id].filter(([r, c]) => cand[r][c]);
      if (!cells.length) return { solved: false, tier, rounds };
      const rows = new Set(cells.map(([r]) => r)), colsSet = new Set(cells.map(([, c]) => c));
      if (rows.size === 1) {
        const r = cells[0][0];
        for (let c = 0; c < n; c++) if (cand[r][c] && regions[r][c] !== id) { cand[r][c] = false; prog = true; }
      } else if (colsSet.size === 1) {
        const c = cells[0][1];
        for (let r = 0; r < n; r++) if (cand[r][c] && regions[r][c] !== id) { cand[r][c] = false; prog = true; }
      }
      if (prog) tier[2]++;
    }
    if (prog) continue;
    // --- Tier 2: row confined to a single court
    for (let r = 0; r < n && !prog; r++) {
      if (placed[r] !== -1) continue;
      const ids = new Set(); for (let c = 0; c < n; c++) if (cand[r][c]) ids.add(regions[r][c]);
      if (ids.size === 1) {
        const id = ids.values().next().value;
        for (const [rr, cc] of regCells[id]) if (rr !== r && cand[rr][cc]) { cand[rr][cc] = false; prog = true; }
      }
      if (prog) tier[2]++;
    }
    if (prog) continue;
    // --- Tier 2: column confined to a single court
    for (let c = 0; c < n && !prog; c++) {
      const ids = new Set(); let colPlaced = false;
      for (let r = 0; r < n; r++) { if (placed[r] === c) colPlaced = true; if (cand[r][c]) ids.add(regions[r][c]); }
      if (!colPlaced && ids.size === 1) {
        const id = ids.values().next().value;
        for (const [rr, cc] of regCells[id]) if (cc !== c && cand[rr][cc]) { cand[rr][cc] = false; prog = true; }
      }
      if (prog) tier[2]++;
    }
    if (prog) continue;
    // --- Tier 3: single-placement lookahead
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
        if (!unitsOK(sim)) { cand[r][c] = false; tier[3]++; prog = true; break outer; }
      }
    }
    if (!prog) return { solved: false, tier, rounds };
  }
  return { solved: false, tier, rounds };
}

export function gradeBoard(n, regions) {
  const g = humanSolveGraded(n, regions);
  return { ...g, score: +(g.tier[2] * 2 + g.tier[3] * 6 + g.rounds * 0.25).toFixed(2) };
}

// CLI report: node scripts/grade-jester.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dow = (d) => DOW[new Date(d + 'T12:00:00Z').getUTCDay()];
  // Weighted so the hard move dominates: confinement counts 2, lookahead 6.
  const scoreOf = (t, rounds) => t[2] * 2 + t[3] * 6 + rounds * 0.25;

  // The two-jester Sunday boards use a different deduction engine, so they are
  // graded on their own scale by the verifier, not in this one-jester report.
  const rows = PUZZLES.filter((p) => (p.stars || 1) === 1).map((p) => {
    const g = humanSolveGraded(p.size, p.regions);
    return { num: p.num, live: p.live, dow: dow(p.live), size: p.size,
             solved: g.solved, t1: g.tier[1], t2: g.tier[2], t3: g.tier[3],
             rounds: g.rounds, score: +scoreOf(g.tier, g.rounds).toFixed(2) };
  });

  const twoStar = PUZZLES.filter((p) => (p.stars || 1) === 2).length;
  console.log(`grading ${rows.length} one-jester boards (${twoStar} two-jester Sunday boards excluded)`);
  console.log('unsolved by pure deduction:', rows.filter((r) => !r.solved).length);
  const by = (f) => { const g = {}; for (const r of rows) (g[f(r)] ||= []).push(r); return g; };
  const stat = (a) => {
    const s = a.map((r) => r.score).sort((x, y) => x - y);
    const mean = s.reduce((x, y) => x + y, 0) / s.length;
    return { n: s.length, min: s[0], med: s[(s.length / 2) | 0], max: s[s.length - 1], mean: +mean.toFixed(2) };
  };
  console.log('\n=== score by grid size ===');
  for (const [k, v] of Object.entries(by((r) => r.size + 'x' + r.size))) console.log(k, stat(v), 'lookaheads:', v.reduce((a, r) => a + r.t3, 0));
  console.log('\n=== score by weekday ===');
  for (const d of DOW) { const v = by((r) => r.dow)[d]; if (v) console.log(d.padEnd(4), stat(v)); }
  console.log('\n=== full distribution (sorted easiest to hardest) ===');
  for (const r of [...rows].sort((a, b) => a.score - b.score)) {
    console.log(String(r.num).padStart(3), r.live, r.dow, `${r.size}x${r.size}`,
      'T1:' + String(r.t1).padStart(2), 'T2:' + String(r.t2).padStart(2), 'T3:' + String(r.t3).padStart(2),
      'rounds:' + String(r.rounds).padStart(3), 'score:' + r.score);
  }

}
