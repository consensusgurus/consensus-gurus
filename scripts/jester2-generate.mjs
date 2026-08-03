// 2-star generator, v2: adds BOUNDARY REPAIR and a faster solver.
// Repair: when a board admits extra solutions, find a jester that appears in a
// rival solution but not the intended one, and hand that cell to a neighbouring
// court. That breaks the rival's 2-per-court quota while leaving the intended
// seating untouched (we only ever move cells that are NOT intended jesters).
function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pairsFor = (n) => { const o = []; for (let a = 0; a < n; a++) for (let b = a + 2; b < n; b++) o.push([a, b]); return o; };

function randomPlacement(n, rnd, tries = 40) {
  const ALL = pairsFor(n);
  for (let t = 0; t < tries; t++) {
    const colCount = Array(n).fill(0), rows = [];
    const walk = (r) => {
      if (r === n) return colCount.every((c) => c === 2);
      for (const [a, b] of shuffle(ALL.slice(), rnd)) {
        if (colCount[a] >= 2 || colCount[b] >= 2) continue;
        if (r > 0) { const [pa, pb] = rows[r - 1];
          if (Math.abs(a-pa)<2||Math.abs(a-pb)<2||Math.abs(b-pa)<2||Math.abs(b-pb)<2) continue; }
        colCount[a]++; colCount[b]++; rows.push([a, b]);
        const left = n - r - 1; let ok = true;
        for (let c = 0; c < n; c++) if (2 - colCount[c] > left) { ok = false; break; }
        if (ok && walk(r + 1)) return true;
        rows.pop(); colCount[a]--; colCount[b]--;
      }
      return false;
    };
    if (walk(0)) return rows;
  }
  return null;
}

function growRegions(n, rows, rnd) {
  const starAt = Array.from({ length: n }, () => Array(n).fill(false)); const stars = [];
  for (let r = 0; r < n; r++) for (const c of rows[r]) { starAt[r][c] = true; stars.push([r, c]); }
  const up = shuffle(stars.slice(), rnd), pairs = [];
  while (up.length) {
    const a = up.pop(); let bi = -1, bd = Infinity;
    for (let i = 0; i < up.length; i++) {
      const d = Math.abs(up[i][0]-a[0]) + Math.abs(up[i][1]-a[1]) + rnd() * 2.5;
      if (d < bd) { bd = d; bi = i; }
    }
    if (bi < 0) return null;
    pairs.push([a, up.splice(bi, 1)[0]]);
  }
  const reg = Array.from({ length: n }, () => Array(n).fill(-1));
  const connect = (id, [r1,c1], [r2,c2]) => {
    const blocked = (r,c) => starAt[r][c] && !(r===r1&&c===c1) && !(r===r2&&c===c2);
    const prev = new Map(), q = [[r1,c1]], seen = new Set([r1*n+c1]);
    while (q.length) {
      const [r,c] = q.shift();
      if (r===r2 && c===c2) { let cur = r*n+c;
        while (cur !== undefined) { const rr=(cur/n)|0, cc=cur%n;
          if (reg[rr][cc] !== -1 && reg[rr][cc] !== id) return false;
          reg[rr][cc] = id; cur = prev.get(cur); } return true; }
      for (const [dr,dc] of shuffle([[1,0],[-1,0],[0,1],[0,-1]], rnd)) {
        const a=r+dr, b=c+dc, k=a*n+b;
        if (a<0||a>=n||b<0||b>=n||seen.has(k)) continue;
        if (blocked(a,b) || reg[a][b] !== -1) continue;
        seen.add(k); prev.set(k, r*n+c); q.push([a,b]);
      }
    }
    return false;
  };
  for (let id = 0; id < n; id++) if (!connect(id, pairs[id][0], pairs[id][1])) return null;
  let un = 0; for (let r=0;r<n;r++) for (let c=0;c<n;c++) if (reg[r][c]===-1) un++;
  let guard = 0;
  while (un > 0 && guard++ < n*n*40) {
    const sizes = Array(n).fill(0);
    for (let r=0;r<n;r++) for (let c=0;c<n;c++) if (reg[r][c]!==-1) sizes[reg[r][c]]++;
    const order = shuffle([...Array(n).keys()], rnd).sort((a,b)=>sizes[a]-sizes[b]);
    let moved = false;
    for (const id of order) {
      const fr = [];
      for (let r=0;r<n;r++) for (let c=0;c<n;c++) { if (reg[r][c]!==id) continue;
        for (const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a=r+dr,b=c+dc;
          if (a>=0&&a<n&&b>=0&&b<n&&reg[a][b]===-1) fr.push([a,b]); } }
      if (!fr.length) continue;
      const [r,c] = fr[(rnd()*fr.length)|0]; reg[r][c] = id; un--; moved = true; break;
    }
    if (!moved) break;
  }
  if (un > 0) return null;
  const sizes = Array(n).fill(0);
  for (let r=0;r<n;r++) for (let c=0;c<n;c++) sizes[reg[r][c]]++;
  if (sizes.some((s) => s < 4)) return null;
  return { reg, stars };
}

// --- fast k=2 solver: precomputes court-availability suffixes for pruning
function makeSolver(n, regions) {
  const ALL = pairsFor(n);
  const suffix = Array.from({ length: n + 1 }, () => Array(n).fill(0));
  for (let r = n - 1; r >= 0; r--) {
    const present = new Set(); for (let c = 0; c < n; c++) present.add(regions[r][c]);
    for (let id = 0; id < n; id++) suffix[r][id] = suffix[r + 1][id] + (present.has(id) ? 1 : 0);
  }
  return function solve(cap) {
    const colCount = Array(n).fill(0), regCount = Array(n).fill(0);
    const out = []; const cur = [];
    let prev = null;
    const walk = (r) => {
      if (out.length >= cap) return;
      if (r === n) { if (colCount.every(c=>c===2) && regCount.every(x=>x===2)) out.push(cur.map(p=>p.slice())); return; }
      for (const [a, b] of ALL) {
        if (colCount[a] >= 2 || colCount[b] >= 2) continue;
        if (prev && (Math.abs(a-prev[0])<2||Math.abs(a-prev[1])<2||Math.abs(b-prev[0])<2||Math.abs(b-prev[1])<2)) continue;
        const ra = regions[r][a], rb = regions[r][b];
        if (ra === rb) { if (regCount[ra] > 0) continue; }
        else if (regCount[ra] >= 2 || regCount[rb] >= 2) continue;
        colCount[a]++; colCount[b]++; regCount[ra]++; regCount[rb]++;
        const left = n - r - 1; let ok = true;
        for (let c = 0; c < n && ok; c++) if (2 - colCount[c] > left) ok = false;
        for (let id = 0; id < n && ok; id++) if (2 - regCount[id] > suffix[r+1][id] * 2) ok = false;
        if (ok) { const sp = prev; prev = [a,b]; cur.push([a,b]); walk(r+1); cur.pop(); prev = sp; }
        colCount[a]--; colCount[b]--; regCount[ra]--; regCount[rb]--;
        if (out.length >= cap) return;
      }
    };
    walk(0);
    return out;
  };
}

const contiguous = (n, reg, id) => {
  const cells = []; for (let r=0;r<n;r++) for (let c=0;c<n;c++) if (reg[r][c]===id) cells.push(r*n+c);
  if (!cells.length) return false;
  const set = new Set(cells), seen = new Set([cells[0]]), st = [cells[0]];
  while (st.length) { const cur = st.pop(), r=(cur/n)|0, c=cur%n;
    for (const [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a=r+dr,b=c+dc,k=a*n+b;
      if (a>=0&&a<n&&b>=0&&b<n&&set.has(k)&&!seen.has(k)) { seen.add(k); st.push(k); } } }
  return seen.size === cells.length;
};

// --- boundary repair: break rival solutions without disturbing the intended one
function repair(n, reg, stars, rnd, maxSteps = 60) {
  const isStar = Array.from({ length: n }, () => Array(n).fill(false));
  for (const [r, c] of stars) isStar[r][c] = true;
  for (let step = 0; step < maxSteps; step++) {
    const sols = makeSolver(n, reg)(2);
    if (sols.length === 0) return null;
    if (sols.length === 1) return reg;
    // cells used by the rival solution that the intended seating does not use
    const rival = sols.find((s) => s.some(([a,b],r) => !(isStar[r][a] && isStar[r][b]))) || sols[1];
    const cands = [];
    for (let r = 0; r < n; r++) for (const c of rival[r]) if (!isStar[r][c]) cands.push([r, c]);
    shuffle(cands, rnd);
    let done = false;
    for (const [r, c] of cands) {
      const from = reg[r][c];
      const neigh = shuffle([[1,0],[-1,0],[0,1],[0,-1]], rnd);
      for (const [dr, dc] of neigh) {
        const a = r+dr, b = c+dc;
        if (a<0||a>=n||b<0||b>=n) continue;
        const to = reg[a][b];
        if (to === from) continue;
        reg[r][c] = to;
        let sz = 0; for (let rr=0;rr<n;rr++) for (let cc=0;cc<n;cc++) if (reg[rr][cc]===from) sz++;
        if (sz >= 4 && contiguous(n, reg, from) && contiguous(n, reg, to)) { done = true; break; }
        reg[r][c] = from;
      }
      if (done) break;
    }
    if (!done) return null;
  }
  return null;
}


export { rng, randomPlacement, growRegions, makeSolver, repair, contiguous };
