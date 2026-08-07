#!/usr/bin/env node
// Generator for the Paths bank (app/paths/puzzles.js).
//
// Boards ramp across the week. Monday to Wednesday is the original terrain
// (open 1, ridge 2, river crossing 3). Thursday adds CLIFFS, lanes that cannot
// be laid at all. Friday and Saturday add OLD TRACK, disused line that costs
// nothing if you route along it, and a ninth town. Sunday is a 13x13 Edition
// with eleven towns and every element on one board.
//
// Nothing is trusted downstream: scripts/verify-paths.mjs re-solves every board
// this writes, from scratch, with an independent solver.
import { PUZZLES as OLD } from '../app/paths/puzzles.js';
import fs from 'fs';

// ---------- rng ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const pick = (r, a) => a[(r() * a.length) | 0];
const shuffle = (r, a) => { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [o[i], o[j]] = [o[j], o[i]]; } return o; };

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const nbrOf = (n) => (i) => {
  const x = i % n, y = (i / n) | 0, o = [];
  if (x > 0) o.push(i - 1);
  if (x < n - 1) o.push(i + 1);
  if (y > 0) o.push(i - n);
  if (y < n - 1) o.push(i + n);
  return o;
};

// ---------- pricing ----------
// A cliff is not a price, it is a wall: the lane is gone. Everything else is
// 0 for old track, 3 for a crossing, 2 when BOTH ends stand on a ridge, else 1.
function pricer({ hills, bridges, rails, cliffs }) {
  const H = new Set(hills), B = new Set(bridges), R = new Set(rails), C = new Set(cliffs);
  return (a, b) => {
    const k = key(a, b);
    if (C.has(k)) return Infinity;
    if (R.has(k)) return 0;
    if (B.has(k)) return 3;
    return H.has(a) && H.has(b) ? 2 : 1;
  };
}

// ---------- exact Steiner tree (Dreyfus-Wagner), with the tree ----------
// Lane prices are baked into a flat array first, four slots per dot in the
// order left, right, up, down, with Infinity where there is no neighbour or a
// cliff blocks the way. The solver then never calls a pricing closure, and
// asking "what if this one lane were banned" is a two-slot patch on a copy.
const DX = [-1, 1, 0, 0], DY = [0, 0, -1, 1];
function weightsFor(n, cost) {
  const V = n * n, W = new Float64Array(V * 4).fill(Infinity);
  for (let i = 0; i < V; i++) {
    const x = i % n, y = (i / n) | 0;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d];
      if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
      W[i * 4 + d] = cost(i, ny * n + nx);
    }
  }
  return W;
}
function patched(W, n, a, b, val) {
  const out = W.slice();
  const set = (u, v) => {
    const ux = u % n, uy = (u / n) | 0, vx = v % n, vy = (v / n) | 0;
    for (let d = 0; d < 4; d++) if (ux + DX[d] === vx && uy + DY[d] === vy) out[u * 4 + d] = val;
  };
  set(a, b); set(b, a);
  return out;
}

const NONE = 0, MERGE = 1, GROW = 2;
function steinerW(n, terms, W, wantTree) {
  const K = terms.length, V = n * n, F = (1 << K) - 1;
  const dp = [], pt = [], pa = [];
  for (let m = 0; m <= F; m++) {
    dp.push(new Float64Array(V).fill(Infinity));
    if (wantTree) { pt.push(new Uint8Array(V)); pa.push(new Int32Array(V).fill(-1)); }
  }
  terms.forEach((t, k) => { dp[1 << k][t] = 0; });
  // a lazy binary heap: cheap to push, and a stale entry is just skipped
  const hd = new Float64Array(V * 6), hv = new Int32Array(V * 6);
  for (let m = 1; m <= F; m++) {
    const d = dp[m];
    for (let s = (m - 1) & m; s > 0; s = (s - 1) & m) {
      const o = m ^ s;
      if (s > o) continue;
      const a = dp[s], b = dp[o];
      for (let v = 0; v < V; v++) {
        const c = a[v] + b[v];
        if (c < d[v]) { d[v] = c; if (wantTree) { pt[m][v] = MERGE; pa[m][v] = s; } }
      }
    }
    let hn = 0;
    const push = (dist, v) => {
      let i = hn++;
      hd[i] = dist; hv[i] = v;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (hd[p] <= hd[i]) break;
        const td = hd[p], tv = hv[p]; hd[p] = hd[i]; hv[p] = hv[i]; hd[i] = td; hv[i] = tv;
        i = p;
      }
    };
    for (let v = 0; v < V; v++) if (d[v] < Infinity) push(d[v], v);
    const done = new Uint8Array(V);
    while (hn > 0) {
      const bd = hd[0], u = hv[0];
      hn--;
      if (hn > 0) {
        hd[0] = hd[hn]; hv[0] = hv[hn];
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let sm = i;
          if (l < hn && hd[l] < hd[sm]) sm = l;
          if (r < hn && hd[r] < hd[sm]) sm = r;
          if (sm === i) break;
          const td = hd[sm], tv = hv[sm]; hd[sm] = hd[i]; hv[sm] = hv[i]; hd[i] = td; hv[i] = tv;
          i = sm;
        }
      }
      if (done[u] || bd > d[u]) continue;
      done[u] = 1;
      const ux = u % n, uy = (u / n) | 0;
      for (let dir = 0; dir < 4; dir++) {
        const w = W[u * 4 + dir];
        if (w === Infinity) continue;
        const v = (uy + DY[dir]) * n + (ux + DX[dir]);
        const c = d[u] + w;
        if (c < d[v]) { d[v] = c; if (wantTree) { pt[m][v] = GROW; pa[m][v] = u; } push(c, v); }
      }
    }
  }
  let best = Infinity, root = -1;
  for (let v = 0; v < V; v++) if (dp[F][v] < best) { best = dp[F][v]; root = v; }
  if (!wantTree) return best;
  const edges = new Map();
  (function walk(m, v) {
    if (pt[m][v] === MERGE) { const s = pa[m][v]; walk(s, v); walk(m ^ s, v); return; }
    if (pt[m][v] === GROW) { const u = pa[m][v]; edges.set(key(u, v), [Math.min(u, v), Math.max(u, v)]); walk(m, u); }
  })(F, root);
  return { cost: best, sol: [...edges.values()] };
}

// the obvious approach: link the nearest unlinked town, one at a time
function greedyCost(n, terms, cost) {
  const nbr = nbrOf(n), V = n * n, D = {};
  for (const t of terms) {
    const d = new Float64Array(V).fill(Infinity); d[t] = 0;
    const seen = new Uint8Array(V);
    for (let it = 0; it < V; it++) {
      let u = -1, b = Infinity;
      for (let v = 0; v < V; v++) if (!seen[v] && d[v] < b) { b = d[v]; u = v; }
      if (u < 0) break;
      seen[u] = 1;
      for (const w of nbr(u)) { const c = d[u] + cost(u, w); if (c < d[w]) d[w] = c; }
    }
    D[t] = d;
  }
  const inT = [terms[0]], rest = terms.slice(1);
  let tot = 0;
  while (rest.length) {
    let bi = 0, bc = Infinity;
    rest.forEach((t, i) => { const c = Math.min(...inT.map((s) => D[s][t])); if (c < bc) { bc = c; bi = i; } });
    if (!isFinite(bc)) return Infinity;
    tot += bc; inT.push(rest.splice(bi, 1)[0]);
  }
  return tot;
}

function connected(n, cost) {
  const nbr = nbrOf(n), V = n * n, seen = new Uint8Array(V), q = [0];
  seen[0] = 1; let c = 1;
  while (q.length) { const u = q.pop(); for (const w of nbr(u)) if (!seen[w] && isFinite(cost(u, w))) { seen[w] = 1; c++; q.push(w); } }
  return c === V;
}

// ---------- terrain ----------
// The river runs down a gap and steps sideways at most one column per row.
// Every lane it cuts, the horizontal one per row and the vertical one at each
// jog, is a crossing, so the barrier never has a free gap in it.
function makeRiver(r, n) {
  const lo = 2, hi = n - 2;
  let x = lo + ((r() * (hi - lo + 1)) | 0);
  const rx = [x];
  for (let y = 1; y < n; y++) {
    const step = r() < 0.42 ? (r() < 0.5 ? -1 : 1) : 0;
    x = Math.max(lo, Math.min(hi, x + step));
    rx.push(x);
  }
  const bridges = [];
  for (let y = 0; y < n; y++) {
    bridges.push(key(y * n + rx[y] - 1, y * n + rx[y]));
    if (y < n - 1) {
      const d = rx[y + 1] - rx[y];
      if (d === -1) bridges.push(key(y * n + rx[y] - 1, (y + 1) * n + rx[y] - 1));
      if (d === 1) bridges.push(key(y * n + rx[y], (y + 1) * n + rx[y]));
    }
  }
  return { rx, bridges: [...new Set(bridges)] };
}

// Two ridges, grown as blobs so they read as landforms rather than confetti.
function makeHills(r, n, want) {
  const nbr = nbrOf(n), out = new Set();
  for (let b = 0; b < 2; b++) {
    let seed = ((1 + (r() * (n - 2)) | 0)) + n * (1 + ((r() * (n - 2)) | 0));
    const blob = new Set([seed]);
    const target = Math.round(want / 2);
    let guard = 0;
    while (blob.size < target && guard++ < 4000) {
      const from = pick(r, [...blob]);
      const to = pick(r, nbr(from));
      blob.add(to);
    }
    blob.forEach((v) => out.add(v));
  }
  return [...out].sort((a, b) => a - b);
}

// A cliff is a straight run of blocked lanes, drawn like a short wall, so it
// reads as a scarp and never as scattered missing lanes.
function makeCliffs(r, n, count, banned) {
  const out = [];
  let guard = 0;
  while (out.length < count && guard++ < 900) {
    const len = 2 + ((r() * 3) | 0);
    const vertical = r() < 0.5;
    const run = [];
    if (vertical) {           // a wall between two columns: block horizontal lanes
      const x = 1 + ((r() * (n - 2)) | 0);
      const y0 = (r() * (n - len)) | 0;
      for (let y = y0; y < y0 + len; y++) run.push(key(y * n + x - 1, y * n + x));
    } else {                  // a wall between two rows: block vertical lanes
      const y = 1 + ((r() * (n - 2)) | 0);
      const x0 = (r() * (n - len)) | 0;
      for (let x = x0; x < x0 + len; x++) run.push(key((y - 1) * n + x, y * n + x));
    }
    if (run.some((k) => banned.has(k) || out.includes(k))) continue;
    out.push(...run);
  }
  return out;
}

// Old track: a contiguous run of lanes that costs nothing, biased toward the
// ridge, because a disused line already cut through the hard ground.
function makeRails(r, n, chains, banned, hills) {
  const nbr = nbrOf(n), H = new Set(hills), out = [];
  let guard = 0;
  while (out.length < chains * 4 && guard++ < 900) {
    let v = (r() * n * n) | 0;
    const run = [], seen = new Set([v]);
    const len = 4 + ((r() * 2) | 0);
    let ok = true;
    for (let s = 0; s < len; s++) {
      const cand = shuffle(r, nbr(v)).filter((w) => !seen.has(w) && !banned.has(key(v, w)) && !out.includes(key(v, w)));
      cand.sort((a, b) => (H.has(b) && H.has(v) ? 1 : 0) - (H.has(a) && H.has(v) ? 1 : 0));
      if (!cand.length) { ok = false; break; }
      const w = cand[0];
      run.push(key(v, w)); seen.add(w); v = w;
    }
    if (!ok || run.length < 4) continue;
    out.push(...run);
  }
  return out;
}

// Towns are not scattered evenly. The depot sits on one bank and a group of
// towns sits on the other, which is what makes the obvious answer wrong: link
// them one at a time and you pay the river once per town, where the cheapest
// network crosses once and fans out.
function spreadTerms(r, n, count, cost, rx, minSep, farSide) {
  const V = n * n;
  const side = (v) => ((v % n) < rx[(v / n) | 0] ? 0 : 1);
  const open = (v) => nbrOf(n)(v).some((w) => isFinite(cost(v, w)));
  let guard = 0;
  while (guard++ < 6000) {
    const t = [];
    const pool = shuffle(r, Array.from({ length: V }, (_, i) => i));
    for (const v of pool) {
      if (t.length >= count) break;
      const x = v % n, y = (v / n) | 0;
      if (t.some((u) => Math.abs(u % n - x) + Math.abs(((u / n) | 0) - y) < minSep)) continue;
      if (!open(v)) continue;   // walled in
      t.push(v);
    }
    if (t.length !== count) continue;
    if (farSide) {
      const home = side(t[0]);
      const far = t.slice(1).filter((v) => side(v) !== home).length;
      if (far < farSide) continue;
    }
    return t;
  }
  return null;
}

// ---------- one candidate board ----------
// gap  how far over par the obvious connect-the-nearest-town network has to be
// sep  how close two towns may sit, so a tier can cluster them
// far  towns that must sit on the far bank from the depot
// ridge/onRail/bite  how many decisions par is forced to get right
const TIER = {
  1: { n: 9,  towns: 8,  hills: 34, cliffs: 0, rails: 0, gap: 5, sep: 3, far: 0, ridge: 3, onRail: 0, bite: 0, label: 'open, ridge, river' },
  2: { n: 9,  towns: 8,  hills: 32, cliffs: 6, rails: 0, gap: 5, sep: 3, far: 0, ridge: 3, onRail: 0, bite: 2, label: '+ cliffs' },
  3: { n: 9,  towns: 9,  hills: 32, cliffs: 6, rails: 1, gap: 5, sep: 3, far: 0, ridge: 3, onRail: 2, bite: 2, label: '+ old track' },
  4: { n: 13, towns: 11, hills: 62, cliffs: 9, rails: 2, gap: 6, sep: 3, far: 0, ridge: 5, onRail: 3, bite: 3, label: 'Sunday, everything' },
};

function build(tier, seed) {
  const spec = TIER[tier], n = spec.n, r = rng(seed);
  const { rx, bridges } = makeRiver(r, n);
  const hills = makeHills(r, n, spec.hills);
  const banned = new Set(bridges);
  const cliffs = spec.cliffs ? makeCliffs(r, n, spec.cliffs, banned) : [];
  cliffs.forEach((k) => banned.add(k));
  const rails = spec.rails ? makeRails(r, n, spec.rails, banned, hills) : [];
  const terr = { hills, bridges, rails, cliffs };
  const cost = pricer(terr);
  if (!connected(n, cost)) return null;
  const terms = spreadTerms(r, n, spec.towns + 1, cost, rx, spec.sep, spec.far);
  if (!terms) return null;

  const gr = greedyCost(n, terms, cost);
  if (!isFinite(gr)) return null;
  const W = weightsFor(n, cost);
  const solved = steinerW(n, terms, W, true);
  const par = solved.cost, sol = solved.sol;
  if (!isFinite(par) || par < 12) return null;
  if (gr - par < spec.gap) return null;

  const ridge = sol.filter(([a, b]) => cost(a, b) === 2).length;
  const cross = sol.filter(([a, b]) => cost(a, b) === 3).length;
  const onRail = sol.filter(([a, b]) => cost(a, b) === 0).length;
  if (ridge < spec.ridge || cross < 1) return null;
  if (onRail < spec.onRail) return null;

  // The expensive gates run cheapest first, because most candidates die here.
  // One solve: the old track has to be worth finding, so pricing the whole
  // disused line normally must make the best network worse.
  if (rails.length) {
    const noRail = weightsFor(n, pricer({ ...terr, rails: [] }));
    if (steinerW(n, terms, noRail, false) <= par) return null;
  }
  // A few solves: cliffs have to bite, so opening one has to improve par.
  if (spec.bite) {
    let bite = 0;
    for (const k of cliffs) {
      const [a, b] = k.split('-').map(Number);
      if (steinerW(n, terms, patched(W, n, a, b, 1), false) < par) bite++;
      if (bite >= spec.bite) break;
    }
    if (bite < spec.bite) return null;
  }
  // One solve per terrain lane: every ridge climb and every crossing in par has
  // to be load-bearing, or the board is guessy.
  for (const [a, b] of sol) {
    const c = cost(a, b);
    if (c !== 2 && c !== 3) continue;
    if (steinerW(n, terms, patched(W, n, a, b, 999), false) <= par) return null;
  }
  return { n, par, greedy: gr, terms, hills, bridges, rx, cliffs, rails, sol, tier };
}

// The search is resumable: it reports the seed it got to, so a run that stops on
// its time budget picks the hunt back up instead of starting the board over.
function make(tier, seed0, from = 0, deadline = 0, tries = 60000) {
  const start = from || seed0;
  for (let s = start; s < seed0 + tries; s++) {
    if (deadline && Date.now() > deadline) return { at: s };
    const b = build(tier, s);
    if (b) return { board: b };
  }
  return {};
}

// ---------- calendar ----------
const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = Number(process.argv[2] || 60);
const START = Date.UTC(2026, 7, 6);
const rows = [];
for (let i = 0; i < DAYS; i++) {
  const dt = new Date(START + i * 86400000);
  const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), wd = dt.getUTCDay();
  // Boards 1 and 2 shipped before the ramp existed and are already live, so they
  // stay exactly as they are. Cliffs arrive on board 3 and the Sunday Edition
  // right behind it, then the weekday ramp runs from there.
  let tier;
  if (i <= 1) tier = 1;
  else if (i === 2) tier = 2;
  else if (wd === 0) tier = 4;
  else if (wd <= 3) tier = 1;
  else if (wd === 4) tier = 2;
  else tier = 3;
  rows.push({
    num: i + 1,
    quizId: `paths-${m}-${d}-${String(y).slice(2)}`,
    live: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    dateLabel: `${MON[m - 1]} ${d}, ${y}`,
    sunday: wd === 0,
    tier,
  });
}

// The proven weekday boards from the launch bank become the Monday to Wednesday
// inventory. Board 1 stays exactly where it is, because it is live right now.
const spares = OLD.filter((p) => p.num > 2 && !p.sunday);
console.log(`calendar ${DAYS} days · tier1 slots to fill ${rows.filter((r) => r.num > 2 && r.tier === 1).length} · spares ${spares.length}`);
console.log(`to generate: t2 ${rows.filter((r) => r.tier === 2).length} · t3 ${rows.filter((r) => r.tier === 3).length} · t4 ${rows.filter((r) => r.tier === 4).length}`);

const PROG = process.env.PATHS_PROGRESS || '/tmp/paths-progress.json';
const BUDGET = Number(process.env.PATHS_BUDGET || 0);
const T0 = Date.now();
let done = { at: {} };
try { done = JSON.parse(fs.readFileSync(PROG, 'utf8')); } catch (e) {}

let si = 0, seed = 20260806;
const out = [];
let stopped = false;
for (const row of rows) {
  let b;
  if (row.num <= 2) {
    const o = OLD[row.num - 1];
    b = { n: o.n, par: o.par, greedy: o.greedy, terms: o.terms, hills: o.hills, bridges: o.bridges, rx: o.rx, cliffs: [], rails: [], sol: o.sol, tier: 1 };
  } else if (row.tier === 1 && si < spares.length) {
    const o = spares[si++];
    b = { n: o.n, par: o.par, greedy: o.greedy, terms: o.terms, hills: o.hills, bridges: o.bridges, rx: o.rx, cliffs: [], rails: [], sol: o.sol, tier: 1 };
  } else if (done[row.num] && row.num !== 'at') {
    b = done[row.num];
    seed += 7919;
  } else if (stopped || (BUDGET && (Date.now() - T0) / 1000 > BUDGET)) {
    stopped = true;
    seed += 7919;
    continue;
  } else {
    const t0 = Date.now();
    const deadline = BUDGET ? T0 + BUDGET * 1000 : 0;
    const res = make(row.tier, seed, (done.at || {})[row.num] || 0, deadline);
    if (res.at) {
      (done.at = done.at || {})[row.num] = res.at;
      fs.writeFileSync(PROG, JSON.stringify(done));
      stopped = true;
      seed += 7919;
      continue;
    }
    b = res.board;
    seed += 7919;
    if (!b) { console.error(`could not build #${row.num} tier ${row.tier}`); process.exit(1); }
    console.log(`  #${row.num} ${row.live} tier ${row.tier} · par ${b.par} greedy ${b.greedy} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    done[row.num] = b;
    fs.writeFileSync(PROG, JSON.stringify(done));
  }
  out.push({ ...row, ...b });
}
if (stopped) {
  const left = rows.length - out.length;
  console.log(`budget spent with ${left} board(s) still to build — run again to pick up where this left off.`);
  process.exit(3);
}

const fmt = (p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    tier: ${p.tier},
    n: ${p.n}, par: ${p.par}, greedy: ${p.greedy},
    terms: [${p.terms.join(',')}],
    hills: [${p.hills.join(',')}],
    bridges: [${p.bridges.map((k) => `"${k}"`).join(',')}],
    cliffs: [${p.cliffs.map((k) => `"${k}"`).join(',')}],
    rails: [${p.rails.map((k) => `"${k}"`).join(',')}],
    rx: [${p.rx.join(',')}],
    sol: [${p.sol.map(([a, b]) => `[${a},${b}]`).join(',')}],
  },`;

fs.writeFileSync('/tmp/pw/boards.json', JSON.stringify(out));
fs.writeFileSync('/tmp/pw/boards.txt', out.map(fmt).join('\n') + '\n');
console.log(`wrote ${out.length} boards · par ${Math.min(...out.map((p) => p.par))}-${Math.max(...out.map((p) => p.par))}`);
