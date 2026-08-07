#!/usr/bin/env node
// Verifier for the Paths bank (app/paths/puzzles.js).
//
// Nothing here trusts the generator. Every board is re-solved from scratch with
// an independent Dreyfus-Wagner Steiner-tree solve over the whole lattice, and
// the checks are the promises the game makes to the player:
//
//   1. `par` really is the cheapest network that exists on that board.
//   2. `sol` is a real network: it links every town to the depot and costs par.
//   3. every RIDGE lane and every CROSSING in `sol` is load-bearing, i.e. ban it
//      and the best possible network gets strictly worse. Plain-ground ties are
//      allowed and unavoidable (two staircases between the same dots tie), which
//      is why the client says "a cheapest network", never "the".
//   4. the river is a continuous barrier: every lane it cuts is priced as a
//      crossing, so there is no free gap where it steps sideways.
//   5. the board is worth playing: the greedy nearest-town network costs at
//      least 5 more than par, and par pays for at least 3 ridge lanes.
//   6. bank hygiene: nums sequential from 1, quizIds match the live date,
//      dates are consecutive days, and the sunday flag matches the real weekday
//      and the bigger 11x11 board.
//
// Usage: node scripts/verify-paths.mjs
import { PUZZLES } from '../app/paths/puzzles.js';

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const fail = [];
const note = (p, msg) => fail.push(`#${p.num} (${p.quizId}): ${msg}`);

function nbrOf(n) {
  return (i) => {
    const x = i % n, y = (i / n) | 0, o = [];
    if (x > 0) o.push(i - 1);
    if (x < n - 1) o.push(i + 1);
    if (y > 0) o.push(i - n);
    if (y < n - 1) o.push(i + n);
    return o;
  };
}

function steiner(n, terms, cost) {
  const nbr = nbrOf(n), K = terms.length, V = n * n, F = (1 << K) - 1;
  const dp = Array.from({ length: 1 << K }, () => new Float64Array(V).fill(Infinity));
  terms.forEach((t, k) => { dp[1 << k][t] = 0; });
  for (let m = 1; m <= F; m++) {
    const d = dp[m];
    for (let s = (m - 1) & m; s > 0; s = (s - 1) & m) {
      const o = m ^ s;
      if (s > o) continue;
      const a = dp[s], b = dp[o];
      for (let v = 0; v < V; v++) { const c = a[v] + b[v]; if (c < d[v]) d[v] = c; }
    }
    const seen = new Uint8Array(V);
    for (let it = 0; it < V; it++) {
      let u = -1, best = Infinity;
      for (let v = 0; v < V; v++) if (!seen[v] && d[v] < best) { best = d[v]; u = v; }
      if (u < 0) break;
      seen[u] = 1;
      for (const w of nbr(u)) { const c = d[u] + cost(u, w); if (c < d[w]) d[w] = c; }
    }
  }
  let best = Infinity;
  for (let v = 0; v < V; v++) if (dp[F][v] < best) best = dp[F][v];
  return best;
}

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
    tot += bc; inT.push(rest.splice(bi, 1)[0]);
  }
  return tot;
}

const MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
let prevDate = null;

for (const p of PUZZLES) {
  const n = p.n, hills = new Set(p.hills), bridges = new Set(p.bridges);
  const cost = (a, b) => (bridges.has(key(a, b)) ? 3 : (hills.has(a) && hills.has(b)) ? 2 : 1);

  // 6. bank hygiene
  const [Y, M, D] = p.live.split('-').map(Number);
  const dt = new Date(Date.UTC(Y, M - 1, D));
  if (p.quizId !== `paths-${M}-${D}-${String(Y).slice(2)}`) note(p, `quizId does not match live date ${p.live}`);
  if (p.dateLabel !== `${MON[M - 1]} ${D}, ${Y}`) note(p, `dateLabel "${p.dateLabel}" does not match ${p.live}`);
  if (p.num !== PUZZLES.indexOf(p) + 1) note(p, 'num is out of sequence');
  if (prevDate && dt.getTime() - prevDate !== 86400000) note(p, 'live date is not the next day');
  prevDate = dt.getTime();
  if (p.sunday !== (dt.getUTCDay() === 0)) note(p, `sunday flag is ${p.sunday} but ${p.live} is day ${dt.getUTCDay()}`);
  if (p.sunday && n !== 11) note(p, 'a Sunday Edition must be 11x11');
  if (!p.sunday && n !== 9) note(p, 'a weekday board must be 9x9');
  if (p.terms.length !== (p.sunday ? 11 : 9)) note(p, `has ${p.terms.length} terminals`);
  if (new Set(p.terms).size !== p.terms.length) note(p, 'a terminal is repeated');
  if (p.terms.some((t) => t < 0 || t >= n * n)) note(p, 'a terminal is off the board');

  // 4. the river is a continuous barrier
  for (let y = 0; y < n; y++) {
    const x = p.rx[y];
    if (!bridges.has(key(y * n + x - 1, y * n + x))) note(p, `row ${y} crossing is not priced`);
    if (y < n - 1) {
      const d = p.rx[y + 1] - x;
      if (Math.abs(d) > 1) note(p, `river jumps ${d} columns between rows ${y} and ${y + 1}`);
      if (d === -1 && !bridges.has(key(y * n + x - 1, (y + 1) * n + x - 1))) note(p, `river jog at row ${y} leaves a free gap`);
      if (d === 1 && !bridges.has(key(y * n + x, (y + 1) * n + x))) note(p, `river jog at row ${y} leaves a free gap`);
    }
  }
  if (p.bridges.length !== new Set(p.bridges).size) note(p, 'duplicate crossing');

  // 2. sol is a real network at cost par
  let solCost = 0;
  const adj = {};
  for (const [a, b] of p.sol) {
    const ax = a % n, ay = (a / n) | 0, bx = b % n, by = (b / n) | 0;
    if (Math.abs(ax - bx) + Math.abs(ay - by) !== 1) note(p, `sol lane ${a}-${b} is not between neighbours`);
    solCost += cost(a, b);
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  }
  const seen = new Set([p.terms[0]]), q = [p.terms[0]];
  while (q.length) { const u = q.pop(); (adj[u] || []).forEach((v) => { if (!seen.has(v)) { seen.add(v); q.push(v); } }); }
  if (!p.terms.every((t) => seen.has(t))) note(p, 'sol does not link every town to the depot');
  if (solCost !== p.par) note(p, `sol costs ${solCost} but par says ${p.par}`);

  // 1. par is the true minimum
  const exact = steiner(n, p.terms, cost);
  if (exact !== p.par) note(p, `par is ${p.par} but the cheapest network costs ${exact}`);

  // 5. the board is worth playing
  const gr = greedyCost(n, p.terms, cost);
  if (gr !== p.greedy) note(p, `greedy is banked as ${p.greedy} but computes to ${gr}`);
  if (gr - p.par < 5) note(p, `greedy is only ${gr - p.par} over par, so the board has no puzzle in it`);
  const ridge = p.sol.filter(([a, b]) => cost(a, b) === 2).length;
  const cross = p.sol.filter(([a, b]) => cost(a, b) === 3).length;
  if (ridge < 3) note(p, `par climbs only ${ridge} ridge lanes`);
  if (cross < 1) note(p, 'par never crosses the river');

  // 3. every terrain decision is forced
  for (const [a, b] of p.sol) {
    if (cost(a, b) === 1) continue;
    const banned = (u, v) => (key(u, v) === key(a, b) ? 999 : cost(u, v));
    if (steiner(n, p.terms, banned) <= p.par) note(p, `terrain lane ${a}-${b} is a free swap, so par is not forced there`);
  }
}

const days = PUZZLES.length;
if (fail.length) {
  console.error(`FAIL — ${fail.length} problem(s) across ${days} boards:\n` + fail.map((f) => '  ' + f).join('\n'));
  process.exit(1);
}
console.log(`OK — ${days} Paths boards verified (${PUZZLES.filter((p) => p.sunday).length} Sunday Editions).`);
console.log(`  perfect ${Math.min(...PUZZLES.map((p) => p.par))}-${Math.max(...PUZZLES.map((p) => p.par))}, greedy runs ${Math.min(...PUZZLES.map((p) => p.greedy - p.par))}-${Math.max(...PUZZLES.map((p) => p.greedy - p.par))} over.`);
console.log(`  live ${PUZZLES[0].live} through ${PUZZLES[days - 1].live}.`);
