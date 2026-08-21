// Wall-aware Chomp board generator ("bleachers"), 2026-08-21 rebuild.
// Build-backwards: pick bleachers, carve a self-avoiding walk over the playable
// cells (the witness route, so solvability is by construction), hang the cast
// on it in walk order, then MEASURE everything exactly (true optimum, detour,
// tidiest-route turn density, wall bite) and gate on the measurements.
import fs from 'fs';

export const MASCOTS = ["bulldog","ibis","gamecock","tiger","eagle","longhorn","wildcat","seminole","knight","smokey","bull"];
const W = 7, H = 7, C = W * H;
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const idx = (x, y) => y * W + x;
const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const manh = (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);

export function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---- bleacher placement: interior-biased, playable stays connected ----------
export function makeWalls(nW, rnd) {
  for (let t = 0; t < 60; t++) {
    const cells = [];
    const taken = new Uint8Array(C);
    let guard = 0;
    while (cells.length < nW && guard++ < 400) {
      // interior bias: sample two, keep the more central
      const cand = [];
      for (let k = 0; k < 2; k++) cand.push([(rnd()*W)|0, (rnd()*H)|0]);
      cand.sort((a,b) => (Math.abs(a[0]-3)+Math.abs(a[1]-3)) - (Math.abs(b[0]-3)+Math.abs(b[1]-3)));
      const [x, y] = rnd() < 0.75 ? cand[0] : cand[1];
      if (taken[idx(x,y)]) continue;
      taken[idx(x,y)] = 1; cells.push([x,y]);
    }
    if (cells.length < nW) continue;
    // playable must be one connected region
    const wall = new Uint8Array(C);
    for (const [x,y] of cells) wall[idx(x,y)] = 1;
    let s0 = -1, playable = 0;
    for (let i = 0; i < C; i++) if (!wall[i]) { playable++; if (s0 < 0) s0 = i; }
    const seen = new Uint8Array(C); seen[s0] = 1; const st = [s0]; let n = 1;
    while (st.length) { const c = st.pop(), cx = c % W, cy = (c - cx) / W;
      for (const d of DIRS) { const nx = cx+d[0], ny = cy+d[1];
        if (!inside(nx,ny)) continue; const j = idx(nx,ny);
        if (wall[j] || seen[j]) continue; seen[j] = 1; n++; st.push(j); } }
    if (n !== playable) continue;
    return { cells, wall, playable };
  }
  return null;
}

// ---- self-avoiding walk over playable cells, turn-happy ---------------------
export function makeWalk(wallInfo, targetLen, rnd) {
  const { wall } = wallInfo;
  for (let t = 0; t < 30; t++) {
    let sx, sy;
    do { sx = (rnd()*W)|0; sy = (rnd()*H)|0; } while (wall[idx(sx,sy)]);
    const occ = new Uint8Array(C); occ[idx(sx,sy)] = 1;
    const walk = [[sx,sy]];
    let ld = null;
    while (walk.length <= targetLen) {
      const [hx, hy] = walk[walk.length - 1];
      const opts = [];
      for (const d of DIRS) {
        const nx = hx+d[0], ny = hy+d[1];
        if (!inside(nx,ny) || wall[idx(nx,ny)] || occ[idx(nx,ny)]) continue;
        // prefer turning, and prefer moves that keep neighbours open
        let open = 0;
        for (const e of DIRS) { const ax = nx+e[0], ay = ny+e[1];
          if (inside(ax,ay) && !wall[idx(ax,ay)] && !occ[idx(ax,ay)]) open++; }
        const turn = ld && (d[0] !== ld[0] || d[1] !== ld[1]) ? 1 : 0;
        opts.push({ d, wgt: 1 + turn * 1.6 + open * 0.4 });
      }
      if (!opts.length) break;
      let sum = 0; for (const o of opts) sum += o.wgt;
      let r = rnd() * sum, pick = opts[0];
      for (const o of opts) { r -= o.wgt; if (r <= 0) { pick = o; break; } }
      const [dx, dy] = pick.d;
      const nx = walk[walk.length-1][0]+dx, ny = walk[walk.length-1][1]+dy;
      occ[idx(nx,ny)] = 1; walk.push([nx,ny]); ld = pick.d;
    }
    if (walk.length - 1 >= targetLen) return walk.slice(0, targetLen + 1);
  }
  return null;
}

// ---- hang K pellets on the walk, floor in a band, legs 2..LEG_CAP -----------
export function pickWaypoints(walk, K, legCap, floorBand, rnd) {
  const T = walk.length - 1;
  // feas[j][k]: from walk index j (a pellet), can we still place k earlier
  // pellets and reach index 0 as the start, every leg manh 2..legCap?
  const okLeg = (a, b) => { const m = manh(walk[a], walk[b]); return m >= 2 && m <= legCap && b - a >= m; };
  const feas = Array.from({ length: T + 1 }, () => new Uint8Array(K + 1));
  for (let j = 1; j <= T; j++) feas[j][1] = okLeg(0, j) ? 1 : 0;
  for (let k = 2; k <= K; k++)
    for (let j = k; j <= T; j++) {
      for (let i = k - 1; i < j; i++) if (feas[i][k-1] && okLeg(i, j)) { feas[j][k] = 1; break; }
    }
  if (!feas[T][K]) return null;
  for (let t = 0; t < 24; t++) {
    const picks = [T];
    let j = T, k = K;
    while (k > 1) {
      const cands = [];
      for (let i = k - 1; i < j; i++) if (feas[i][k-1] && okLeg(i, j)) {
        const gap = (j - i) - manh(walk[i], walk[j]);   // detour this leg buys
        cands.push({ i, wgt: 1 + gap * gap });
      }
      if (!cands.length) { picks.length = 0; break; }
      let sum = 0; for (const c of cands) sum += c.wgt;
      let r = rnd() * sum, pick = cands[0];
      for (const c of cands) { r -= c.wgt; if (r <= 0) { pick = c; break; } }
      picks.push(pick.i); j = pick.i; k -= 1;
    }
    if (!picks.length) continue;
    picks.reverse();
    let floor = manh(walk[0], walk[picks[0]]);
    for (let a = 1; a < picks.length; a++) floor += manh(walk[picks[a-1]], walk[picks[a]]);
    if (floor < floorBand[0] || floor > floorBand[1]) continue;
    return picks;
  }
  return null;
}

// ---- exact search, wall-aware (mirrors scripts/verify-chomp.mjs) ------------
export function shortestRoute(p, cap = 4000000) {
  const K = p.pellets.length, occ = new Uint8Array(C);
  if (p.walls) for (const [x,y] of p.walls) occ[idx(x,y)] = 1;
  occ[idx(p.start[0], p.start[1])] = 1;
  const bl = (q, x, y) => {
    if (!inside(x,y) || occ[idx(x,y)]) return true;
    for (let k = q + 1; k < K; k++) if (p.pellets[k][0] === x && p.pellets[k][1] === y) return true;
    return false;
  };
  const seen = new Uint8Array(C);
  const reach = (q, x, y) => {
    seen.fill(0); const i0 = idx(x,y); seen[i0] = 1; const st = [i0];
    for (let i = 0; i < st.length; i++) {
      const c = st[i], cx = c % W, cy = (c - cx) / W;
      for (const d of DIRS) {
        const nx = cx+d[0], ny = cy+d[1];
        if (!inside(nx,ny)) continue;
        const j = idx(nx,ny);
        if (occ[j] || seen[j]) continue;
        seen[j] = 1; st.push(j);
      }
    }
    for (let k = q; k < K; k++) if (!seen[idx(p.pellets[k][0], p.pellets[k][1])]) return false;
    return true;
  };
  const suffix = new Array(K + 2).fill(0);
  for (let k = K - 1; k >= 1; k--) suffix[k] = suffix[k+1] + manh(p.pellets[k-1], p.pellets[k]);
  const lower = (x, y, pi) => (pi >= K ? 0 : manh([x,y], p.pellets[pi]) + suffix[pi+1]);
  let nodes = 0, best = null, route = [], hit = false;
  const path = [];
  function dfs(x, y, pi, g, lim) {
    if (pi >= K) { best = g; route = path.slice(); return true; }
    if (++nodes > cap) { hit = true; return false; }
    if (g + lower(x, y, pi) > lim) return false;
    const t = p.pellets[pi];
    const opts = DIRS.filter((d) => !bl(pi, x+d[0], y+d[1]))
      .sort((a, b) => manh([x+a[0], y+a[1]], t) - manh([x+b[0], y+b[1]], t));
    for (const d of opts) {
      const nx = x+d[0], ny = y+d[1];
      const np = (nx === t[0] && ny === t[1]) ? pi + 1 : pi;
      occ[idx(nx,ny)] = 1; path.push(d);
      if (np >= K || reach(np, nx, ny)) { if (dfs(nx, ny, np, g + 1, lim)) { occ[idx(nx,ny)] = 0; path.pop(); return true; } }
      occ[idx(nx,ny)] = 0; path.pop();
    }
    return false;
  }
  const playable = C - (p.walls ? p.walls.length : 0);
  for (let lim = lower(p.start[0], p.start[1], 0); lim <= playable - 1; lim += 2) {
    nodes = 0; hit = false;
    if (dfs(p.start[0], p.start[1], 0, 0, lim)) return { min: best, route, capped: false };
    if (hit) return { min: null, route: null, capped: true };
  }
  return { min: null, route: null, capped: false };
}

export function minTurns(p, min, cap = 800000) {
  const K = p.pellets.length, occ = new Uint8Array(C);
  if (p.walls) for (const [x,y] of p.walls) occ[idx(x,y)] = 1;
  occ[idx(p.start[0], p.start[1])] = 1;
  const bl = (q, x, y) => {
    if (!inside(x,y) || occ[idx(x,y)]) return true;
    for (let k = q + 1; k < K; k++) if (p.pellets[k][0] === x && p.pellets[k][1] === y) return true;
    return false;
  };
  const seen = new Uint8Array(C);
  const reach = (q, x, y) => {
    seen.fill(0); const i0 = idx(x,y); seen[i0] = 1; const st = [i0];
    for (let i = 0; i < st.length; i++) {
      const c = st[i], cx = c % W, cy = (c - cx) / W;
      for (const d of DIRS) {
        const nx = cx+d[0], ny = cy+d[1];
        if (!inside(nx,ny)) continue;
        const j = idx(nx,ny);
        if (occ[j] || seen[j]) continue;
        seen[j] = 1; st.push(j);
      }
    }
    for (let k = q; k < K; k++) if (!seen[idx(p.pellets[k][0], p.pellets[k][1])]) return false;
    return true;
  };
  const suffix = new Array(K + 2).fill(0);
  for (let k = K - 1; k >= 1; k--) suffix[k] = suffix[k+1] + manh(p.pellets[k-1], p.pellets[k]);
  const lower = (x, y, pi) => (pi >= K ? 0 : manh([x,y], p.pellets[pi]) + suffix[pi+1]);
  let best = Infinity, n = 0, capped = false;
  const dfs = (x, y, pi, g, t, ld) => {
    if (pi >= K) { if (t < best) best = t; return; }
    if (++n > cap) { capped = true; return; }
    if (g + lower(x, y, pi) > min || t >= best) return;
    for (const d of DIRS) {
      const nx = x+d[0], ny = y+d[1];
      if (bl(pi, nx, ny)) continue;
      const np = (nx === p.pellets[pi][0] && ny === p.pellets[pi][1]) ? pi + 1 : pi;
      const nt = t + (ld && (d[0] !== ld[0] || d[1] !== ld[1]) ? 1 : 0);
      occ[idx(nx,ny)] = 1;
      if (np >= K || reach(np, nx, ny)) dfs(nx, ny, np, g + 1, nt, d);
      occ[idx(nx,ny)] = 0;
      if (capped) return;
    }
  };
  dfs(p.start[0], p.start[1], 0, 0, 0, null);
  return { turns: best === Infinity ? null : best, capped };
}

// ---- one candidate ----------------------------------------------------------
export function candidate(castN, nWalls, spareBand, detBand, rnd) {
  const wi = makeWalls(nWalls, rnd);
  if (!wi) return null;
  const playable = wi.playable;
  const spare = spareBand[0] + ((rnd() * (spareBand[1] - spareBand[0] + 1)) | 0);
  const T = playable - 1 - spare;              // witness route length in moves
  if (T < castN * 2 + 4) return null;
  const walk = makeWalk(wi, T, rnd);
  if (!walk) return null;
  const floorBand = [Math.max(castN * 2, T - detBand[1]), T - detBand[0]];
  if (floorBand[0] > floorBand[1]) return null;
  const picks = pickWaypoints(walk, castN, 6, floorBand, rnd);
  if (!picks) return null;
  const pellets = picks.map((i) => walk[i]);
  const p = { w: W, h: H, start: walk[0], pellets, walls: wi.cells };
  let floor = manh(walk[0], pellets[0]);
  for (let a = 1; a < pellets.length; a++) floor += manh(pellets[a-1], pellets[a]);
  const sr = shortestRoute(p);
  if (sr.min == null) return null;
  const det = sr.min - floor;
  const realSpare = playable - (sr.min + 1);
  const mt = minTurns(p, sr.min);
  if (mt.capped || !mt.turns) return null;
  // wall bite: how much the bleachers alone add to the optimum
  const open = shortestRoute({ ...p, walls: [] }, 2000000);
  const bite = open.min == null ? null : sr.min - open.min;
  return { p, floor, min: sr.min, det, spare: realSpare, run: sr.min / mt.turns, turns: mt.turns, bite, walkLen: T };
}

// ---- CLI: measurement sweep -------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const [castN, nWalls, s0, s1, budget, seed] = process.argv.slice(2).map(Number);
  const rnd = rng(seed || 1);
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < (budget || 30000)) {
    const c = candidate(castN || 9, nWalls || 6, [s0 ?? 4, s1 ?? 6], [0, 30], rnd);
    if (c) out.push(c);
  }
  const dist = (arr) => { arr = [...arr].sort((a,b)=>a-b); const q = (f) => arr[Math.min(arr.length-1, (arr.length*f)|0)]; return arr.length ? `n=${arr.length} min=${arr[0]} p25=${q(0.25)} med=${q(0.5)} p75=${q(0.75)} p90=${q(0.9)} max=${arr[arr.length-1]}` : 'none'; };
  console.log('candidates:', out.length);
  console.log('  detour  ', dist(out.map(c=>c.det)));
  console.log('  spare   ', dist(out.map(c=>c.spare)));
  console.log('  run     ', dist(out.map(c=>+c.run.toFixed(2))));
  console.log('  bite    ', dist(out.filter(c=>c.bite!=null).map(c=>c.bite)));
  const good = out.filter(c=>c.det>=6 && c.run<=2.4 && c.spare>=(s0??4) && c.spare<=(s1??6));
  console.log('  det>=6 & run<=2.4 & spare in band:', good.length);
  const g8 = out.filter(c=>c.det>=8 && c.run<=2.4 && c.spare>=(s0??4) && c.spare<=(s1??6));
  console.log('  det>=8 & run<=2.4 & spare in band:', g8.length);
}
