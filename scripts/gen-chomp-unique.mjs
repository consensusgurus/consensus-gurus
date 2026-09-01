// Chomp board generator, THE UNIQUENESS ERA (2026-08-31 rebuild, owner-directed).
//
// THE RULE THAT REPLACED EVERY EARLIER DIAL: "there should only be one path that
// works", and "the extra barriers make the path EASIER to determine". Both halves
// matter and the second is the one four rebuilds had backwards. A bleacher removes
// branching, which shrinks what the player has to consider and hands them the
// route. So this generator builds boards that are UNIQUE and OPEN: exactly one
// move sequence eats the cast, and almost nothing is bolted down.
//
// WHY CARVING AND NOT BUILDING. Adding mascots until a board is unique cannot
// work: with a handful of clues the route count is astronomical, any counter caps,
// and no single clue registers as progress (measured: 1,003 boards, cast stuck at
// one on every single one). Removal is the tractable direction, exactly as a
// sudoku generator does it:
//
//   1. lay a HAMILTONIAN path over the playable squares (Warnsdorff order with
//      backtracking; the old weighted random walk never reaches near-full length,
//      119,000 tries and not one)
//   2. make EVERY square on it a mascot, which is unique by construction because
//      every step is numbered
//   3. REMOVE mascots while exactly one winning route survives
//
// Removal is monotone, so the test is a clean yes/no, and the result is MINIMAL:
// no mascot left on the board can be spared. Then, to hit a rung's cast exactly,
// mascots are added BACK. Adding a clue can never break uniqueness, so the board
// stays unique and simply gets more signposted.
//
// WHICH WAY THE WEEK RUNS. Fewer mascots is HARDER here, because each one is a
// signpost on the single path. That inverts the old ramp, where the cast grew
// towards Sunday. See RUNGS in scripts/bank-chomp.mjs.
import { countRoutes, branchingOn } from './chomp-count.mjs';

export function rng(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const shuffle = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const manh = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

// ---- bleachers: FEW, and they must leave the playable board in one piece -----
export function makeWalls(w, h, nW, rnd) {
  const C = w * h;
  const idx = (x, y) => y * w + x;
  if (!nW) return { cells: [], wall: new Uint8Array(C), playable: C };
  for (let t = 0; t < 80; t++) {
    const wall = new Uint8Array(C), cells = [];
    let guard = 0;
    while (cells.length < nW && guard++ < 300) {
      const x = (rnd() * w) | 0, y = (rnd() * h) | 0;
      if (wall[idx(x, y)]) continue;
      wall[idx(x, y)] = 1; cells.push([x, y]);
    }
    if (cells.length < nW) continue;
    let s0 = -1, playable = 0;
    for (let i = 0; i < C; i++) if (!wall[i]) { playable++; if (s0 < 0) s0 = i; }
    const seen = new Uint8Array(C); seen[s0] = 1; const st = [s0]; let n = 1;
    while (st.length) {
      const c = st.pop(), cx = c % w, cy = (c - cx) / w;
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = idx(nx, ny);
        if (wall[j] || seen[j]) continue;
        seen[j] = 1; n++; st.push(j);
      }
    }
    if (n !== playable) continue;
    return { cells, wall, playable };
  }
  return null;
}

// ---- a Hamiltonian path over the playable squares ---------------------------
// Warnsdorff (fewest onward options first) with backtracking and randomised
// ties. Plain random walking cannot reach full coverage; this does it in one
// pass on nearly every attempt.
export function hamPath(w, h, wall, playable, rnd, tries = 14, nodeCap = 400000) {
  const C = w * h;
  const idx = (x, y) => y * w + x;
  const starts = [];
  for (let i = 0; i < C; i++) if (!wall[i]) starts.push(i);
  shuffle(starts, rnd);
  for (let t = 0; t < tries && t < starts.length; t++) {
    const occ = new Uint8Array(C);
    const path = [starts[t]];
    occ[starts[t]] = 1;
    let nodes = 0, blown = false;
    const deg = (c) => {
      const cx = c % w, cy = (c - cx) / w;
      let n = 0;
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && !wall[idx(nx, ny)] && !occ[idx(nx, ny)]) n++;
      }
      return n;
    };
    const go = () => {
      if (path.length === playable) return true;
      if (++nodes > nodeCap) { blown = true; return false; }
      const c = path[path.length - 1], cx = c % w, cy = (c - cx) / w;
      const opts = [];
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const j = idx(nx, ny);
        if (wall[j] || occ[j]) continue;
        opts.push({ j, r: rnd() });
      }
      for (const o of opts) { occ[o.j] = 1; o.d = deg(o.j); occ[o.j] = 0; }
      opts.sort((a, b) => (a.d - b.d) || (a.r - b.r));
      for (const o of opts) {
        occ[o.j] = 1; path.push(o.j);
        if (go()) return true;
        path.pop(); occ[o.j] = 0;
        if (blown) return false;
      }
      return false;
    };
    if (go()) return path.map((c) => [c % w, (c - (c % w)) / w]);
  }
  return null;
}

// ---- carve a minimal unique board, then signpost it up to the rung's cast ----
export function carve(w, h, nWalls, spare, castTarget, rnd, opts = {}) {
  const cap = opts.cap || 900000;
  const C = w * h;
  const wi = makeWalls(w, h, nWalls, rnd);
  if (!wi) return null;

  // hold `spare` squares out of the walk; they stay OPEN on the real board and
  // are simply the squares the route declines to use
  const free = [];
  for (let i = 0; i < C; i++) if (!wi.wall[i]) free.push(i);
  shuffle(free, rnd);
  const wall2 = Uint8Array.from(wi.wall);
  for (let k = 0; k < spare; k++) wall2[free[k]] = 1;

  const walk = hamPath(w, h, wall2, wi.playable - spare, rnd);
  if (!walk) return null;
  const T = walk.length - 1;
  if (T < castTarget * 2) return null;

  const boardOf = (ks) => ({
    w, h, start: walk[0],
    pellets: ks.slice().sort((a, b) => a - b).map((i) => walk[i]),
    walls: wi.cells,
  });

  // every step numbered: unique by construction
  let keep = [];
  for (let j = 1; j <= T; j++) keep.push(j);
  const dropped = [];

  // The LAST square must stay a mascot or the route can stop short of the end,
  // which puts squares back in play and the uniqueness with them.
  for (const j of shuffle(keep.filter((k) => k !== T), rnd)) {
    const trial = keep.filter((k) => k !== j);
    const c = countRoutes(boardOf(trial), 2, cap);
    if (c.capped) continue;              // unknown, so do not risk the removal
    if (c.n === 1) { keep = trial; dropped.push(j); }
  }
  const minimal = keep.length;
  if (minimal > castTarget) return { tooTight: true, minimal };

  // signpost back up to the rung's cast. Adding a clue cannot break uniqueness,
  // so the board stays unique; it just tells the player more.
  shuffle(dropped, rnd);
  while (keep.length < castTarget && dropped.length) keep.push(dropped.pop());
  if (keep.length !== castTarget) return { short: true, minimal };

  const board = boardOf(keep);
  const check = countRoutes(board, 2, opts.proofCap || 4000000);
  if (check.capped || check.n !== 1) return null;

  const route = [];
  for (let i = 1; i <= T; i++) route.push([walk[i][0] - walk[i - 1][0], walk[i][1] - walk[i - 1][1]]);
  const b = branchingOn(board, route);
  const pellets = board.pellets;
  let floor = manh(walk[0], pellets[0]);
  for (let a = 1; a < pellets.length; a++) floor += manh(pellets[a - 1], pellets[a]);
  const legs = [manh(walk[0], pellets[0])];
  for (let a = 1; a < pellets.length; a++) legs.push(manh(pellets[a - 1], pellets[a]));
  return {
    board, route, minimal, cast: keep.length,
    playable: wi.playable, min: T, floor, det: T - floor,
    spare: wi.playable - (T + 1),
    forks: b.forks, branch: b.mean, maxLeg: Math.max(...legs),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const w = Number(process.argv[2] || 7), h = Number(process.argv[3] || 7);
  const nW = Number(process.argv[4] || 0), spare = Number(process.argv[5] || 0);
  const cast = Number(process.argv[6] || 10), ms = Number(process.argv[7] || 60000);
  const rnd = rng(Number(process.argv[8] || (Date.now() % 100000)));
  const t0 = Date.now();
  let tried = 0, tight = 0, short = 0;
  const hits = [];
  while (Date.now() - t0 < ms) {
    tried += 1;
    const r = carve(w, h, nW, spare, cast, rnd);
    if (!r) continue;
    if (r.tooTight) { tight += 1; continue; }
    if (r.short) { short += 1; continue; }
    hits.push(r);
  }
  console.log(`${w}x${h}, walls ${nW}, spare ${spare}, cast ${cast}: ${hits.length} boards from ${tried} tries in ${((Date.now() - t0) / 1000) | 0}s (${tight} needed more than ${cast} mascots, ${short} came out under)`);
  if (hits.length) {
    const f = hits.map((x) => x.forks).sort((a, b) => a - b);
    const m = hits.map((x) => x.minimal).sort((a, b) => a - b);
    console.log(`  forks   min ${f[0]} med ${f[f.length >> 1]} max ${f[f.length - 1]}`);
    console.log(`  minimal cast  min ${m[0]} med ${m[m.length >> 1]} max ${m[m.length - 1]}`);
    const best = hits.slice().sort((a, b) => b.forks - a.forks)[0];
    console.log(`  best: forks ${best.forks}, minimal ${best.minimal}, route ${best.min}, spare ${best.spare}, maxLeg ${best.maxLeg}`);
  }
}
