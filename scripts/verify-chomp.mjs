#!/usr/bin/env node
// verify-chomp — the Chomp bank checker.
//
// Everything here is RECOMPUTED from the board, never read back off the row.
//
// ⚠️ REWRITTEN AGAIN 2026-08-10, because the 2026-08-09 rewrite passed a bank
// the owner still called far too easy, early-week days included. Both failures
// are recorded here because the second one repeated the first one's mistake in a
// stronger disguise:
//
//   ROUND ONE gated on a CAREFUL GREEDY BOT. A 300-wide BEAM PLANNER cleared 63
//   of the 70 boards it approved.
//
//   ROUND TWO gated on that beam, at width 300. The SAME beam at width 2000
//   clears 90% of the boards THAT approved, and a 300-wide beam with a different
//   scoring function clears several of them outright. Fourth player model, fourth
//   time beaten.
//
// So there is NO BOT GATE HERE any more, at either end. A beam is still run, but
// only to PRINT what it managed, because normalising a bank to "just barely beats
// the current bot" is what produced two easy banks in a row. The gates are all
// properties of the BOARD, which cannot be gamed by tuning a player:
//
//   SPARE SQUARES. The sum of the legs' Manhattan distances is a proven lower
//   bound on any legal route, so `cells - (min + 1)` is the number of squares the
//   player is FREE TO WASTE. Round one let Monday waste twenty-four of sixty-four.
//   Monday now wastes nine of forty-nine and Sunday wastes none.
//
//   FORGIVENESS. Walk a winning route and ask, at every ply, how many of the legal
//   moves still leave the board winnable. Coverage says how much of the board you
//   have to use; this says what a careless move costs. Round one's Monday ran 79%,
//   so four moves in five were survivable. Nothing here is above 72%.
//
// The two are not the same thing and a board can pass one and fail the other,
// which is why both are gates.
//
// The claims checked, in order:
//   shape       row shape, the weekday ramp, cast rules, pellet placement
//   floor       the stored floor really is the Manhattan leg sum
//   findable    an independent exhaustive search finds the optimum, and
//               lib/chomp-engine replays it move for move
//   sunday      the flag matches the calendar, and Sunday is the peak rung
//   difficulty  no unplanned line and no careful player clears a board, every
//               board is punishing enough on the forgiveness measure, and the
//               beam planner's score is printed rather than gated on
//   ramp        spare squares fall Monday to Sunday and land in each day's band
//   variety     start squares, mascot squares and cast orders spread out
//   scoring     partial credit behaves at every cast length
import { PUZZLES, MASCOTS } from '../app/chomp/puzzles.js';
import { replay } from '../lib/chomp-engine.js';

// Days one to three shipped before this tightening and have been PLAYED and
// scored, so their boards are frozen history and the new gates do not run on
// them. Their annotations (floor, min) are still recomputed, because those are
// derived facts rather than the puzzle. Never move this date backwards: it would
// re-gate a board somebody already has a result on.
const REBUILT_FROM = '2026-08-11';

const FIRST_MASCOT = 'bulldog';
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// THE WEEKDAY RAMP, indexed by getUTCDay so index 0 is Sunday.
//
// The dial is SPARE SQUARES: cells - (min + 1), the number of squares the player
// is free to waste, because no leg can be walked in fewer moves than its Manhattan
// distance. It is quoted in squares rather than in percent because that is the
// thing you can feel, and because a percentage hid how loose the old bank was (a
// Monday "forcing 63%" is a Monday handing you twenty-four free squares).
//
// The whole week is 7x7 from 2026-08-11. 8x8 with a cast of six cannot be squeezed
// past about 80%, and 9x9 and up cannot be squeezed at all: long enough legs to
// force it make the board unsolvable instead. 6x6 is out the other end. See
// app/chomp/puzzles.js.
const RAMP = [
  { w: 7, cast: 8, spare: [0, 1] },   // Sun: the whole cast, and no room at all
  { w: 7, cast: 6, spare: [9, 10] },  // Mon: the most slack of the week, and it is nine squares
  { w: 7, cast: 6, spare: [7, 8] },
  { w: 7, cast: 7, spare: [6, 6] },
  { w: 7, cast: 7, spare: [5, 5] },
  { w: 7, cast: 7, spare: [4, 4] },
  { w: 7, cast: 7, spare: [2, 3] },   // Sat
];
// A board may not leave more than 72% of the moves open to you survivable, and at
// least 40% of the plies where you HAVE a choice must have exactly one right
// answer. Both are ceilings the bank clears with room, not targets to build to:
// the bank runs 59-70% and 59-100%.
const FORGIVE_MAX = 0.72;
const FORCED_MIN = 0.40;
const CAST_MIN = 6, CAST_MAX = 8;
const SOLVER_CAP = 4000000;
const BEAM_WIDTH = 300;

let BAD = 0;
const fail = (tag, msg) => { BAD += 1; console.log(`✗ ${tag}: ${msg}`); };
const ok = (tag, msg) => console.log(`  ${tag}: ${msg}`);
const note = (tag, msg) => console.log(`… ${tag}: ${msg}`);

const idxOf = (p, x, y) => y * p.w + x;
const insideOf = (p, x, y) => x >= 0 && y >= 0 && x < p.w && y < p.h;
const manh = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const dowOf = (p) => new Date(`${p.live}T12:00:00Z`).getUTCDay();
const rungOf = (p) => RAMP[dowOf(p)];
const coverOf = (p, min) => (min + 1) / (p.w * p.h);
const spareOf = (p, min) => p.w * p.h - (min + 1);

function floorOf(p) {
  let L = manh(p.start, p.pellets[0]);
  for (let i = 1; i < p.pellets.length; i++) L += manh(p.pellets[i - 1], p.pellets[i]);
  return L;
}

// shared helpers: a square is blocked by the board edge, by the trail, or by a
// mascot whose turn has not come. `reach` asks whether everything still to eat
// is still reachable, and treats unreached mascots as PASSABLE on purpose: they
// are the destinations, not walls, for the purposes of that question. Blocking
// them makes the check unsatisfiable, a bug that shipped once and nearly got
// reported as a design failure.
const blocker = (p, occ) => (q, x, y) => {
  if (!insideOf(p, x, y) || occ[idxOf(p, x, y)]) return true;
  for (let k = q + 1; k < p.pellets.length; k++) if (p.pellets[k][0] === x && p.pellets[k][1] === y) return true;
  return false;
};
const reacher = (p, occ) => {
  const C = p.w * p.h, seen = new Uint8Array(C);
  return (q, x, y) => {
    seen.fill(0); const i0 = idxOf(p, x, y); seen[i0] = 1; const st = [i0];
    for (let i = 0; i < st.length; i++) {
      const c = st[i], cx = c % p.w, cy = (c - cx) / p.w;
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (!insideOf(p, nx, ny)) continue;
        const j = idxOf(p, nx, ny);
        if (occ[j] || seen[j]) continue;
        seen[j] = 1; st.push(j);
      }
    }
    for (let k = q; k < p.pellets.length; k++) if (!seen[idxOf(p, p.pellets[k][0], p.pellets[k][1])]) return false;
    return true;
  };
};

// THE EXACT SEARCH. IDA* on route length, so it returns the true optimum rather
// than the first route it stumbles into, and it is written out fresh here rather
// than imported from the generator so a bug in the generator's copy cannot pass
// its own bank. Finding an optimum at all is also the findability proof: this
// search knows nothing about the walk each board was built from.
function shortestRoute(p, cap = SOLVER_CAP) {
  const C = p.w * p.h, K = p.pellets.length, occ = new Uint8Array(C);
  occ[idxOf(p, p.start[0], p.start[1])] = 1;
  const bl = blocker(p, occ), reach = reacher(p, occ);
  const suffix = new Array(K + 2).fill(0);
  for (let k = K - 1; k >= 1; k--) suffix[k] = suffix[k + 1] + manh(p.pellets[k - 1], p.pellets[k]);
  const lower = (x, y, pi) => (pi >= K ? 0 : manh([x, y], p.pellets[pi]) + suffix[pi + 1]);
  let nodes = 0, best = null, route = [], hit = false;
  const path = [];
  function dfs(x, y, pi, g, lim) {
    if (pi >= K) { best = g; route = path.slice(); return true; }
    if (++nodes > cap) { hit = true; return false; }
    if (g + lower(x, y, pi) > lim) return false;
    const t = p.pellets[pi];
    const opts = DIRS.filter((d) => !bl(pi, x + d[0], y + d[1]))
      .sort((a, b) => manh([x + a[0], y + a[1]], t) - manh([x + b[0], y + b[1]], t));
    for (const d of opts) {
      const nx = x + d[0], ny = y + d[1];
      const np = (nx === t[0] && ny === t[1]) ? pi + 1 : pi;
      occ[idxOf(p, nx, ny)] = 1; path.push(d);
      if (np >= K || reach(np, nx, ny)) { if (dfs(nx, ny, np, g + 1, lim)) { occ[idxOf(p, nx, ny)] = 0; path.pop(); return true; } }
      occ[idxOf(p, nx, ny)] = 0; path.pop();
    }
    return false;
  }
  for (let lim = lower(p.start[0], p.start[1], 0); lim <= C - 1; lim += 2) {
    nodes = 0; hit = false;
    if (dfs(p.start[0], p.start[1], 0, 0, lim)) return { min: best, route, capped: false };
    if (hit) return { min: null, route: null, capped: true };
  }
  return { min: null, route: null, capped: false };
}

// The unplanned lines: they re-plan towards the mascot in front of them and
// detour around their own wall, but never look past it.
function unplanned(p, mode) {
  const C = p.w * p.h, K = p.pellets.length, occ = new Uint8Array(C);
  let hx = p.start[0], hy = p.start[1], pi = 0, moves = 0, ld = [1, 0];
  occ[idxOf(p, hx, hy)] = 1;
  const legal = (x, y) => {
    if (!insideOf(p, x, y) || occ[idxOf(p, x, y)]) return false;
    for (let k = pi + 1; k < K; k++) if (p.pellets[k][0] === x && p.pellets[k][1] === y) return false;
    return true;
  };
  while (pi < K && moves < C * 3) {
    const t = p.pellets[pi];
    let pick = null;
    if (mode === 'bfs') {
      const dist = new Int32Array(C).fill(-1);
      dist[idxOf(p, t[0], t[1])] = 0;
      const q = [t];
      for (let i = 0; i < q.length; i++) {
        const [cx, cy] = q[i];
        for (const d of DIRS) {
          const nx = cx + d[0], ny = cy + d[1];
          if (!insideOf(p, nx, ny) || dist[idxOf(p, nx, ny)] >= 0 || !legal(nx, ny)) continue;
          dist[idxOf(p, nx, ny)] = dist[idxOf(p, cx, cy)] + 1; q.push([nx, ny]);
        }
      }
      let bd = Infinity;
      for (const d of DIRS) {
        const nx = hx + d[0], ny = hy + d[1];
        if (!legal(nx, ny)) continue;
        const dd = dist[idxOf(p, nx, ny)];
        if (dd < 0) continue;
        const sc = dd * 2 + (d[0] === ld[0] && d[1] === ld[1] ? 0 : 1);
        if (sc < bd) { bd = sc; pick = d; }
      }
    } else {
      const dx = t[0] - hx, dy = t[1] - hy, opts = [];
      if (dx !== 0) opts.push([Math.sign(dx), 0]);
      if (dy !== 0) opts.push([0, Math.sign(dy)]);
      if (mode === 'straight' && opts.some((d) => d[0] === ld[0] && d[1] === ld[1])) pick = opts.find((d) => d[0] === ld[0] && d[1] === ld[1]);
      else if (opts.length === 2) pick = Math.abs(dx) >= Math.abs(dy) ? opts[0] : opts[1];
      else pick = opts[0] || null;
      if (pick && !legal(hx + pick[0], hy + pick[1])) pick = null;
    }
    if (!pick) return { moves, caught: pi, cleared: false };
    hx += pick[0]; hy += pick[1]; occ[idxOf(p, hx, hy)] = 1;
    if (hx === t[0] && hy === t[1]) pi += 1;
    ld = pick; moves += 1;
  }
  return { moves, caught: pi, cleared: pi >= K };
}

// THE CAREFUL PLAYER. Head for the mascot in front of you, refuse any move that
// visibly strands something. Kept as a floor rather than as the gate: it is a
// real player model, it is just not a good enough one on its own.
function carefulClears(p) {
  const C = p.w * p.h, K = p.pellets.length, occ = new Uint8Array(C);
  let hx = p.start[0], hy = p.start[1], pi = 0, moves = 0, ld = [1, 0];
  occ[idxOf(p, hx, hy)] = 1;
  const bl = blocker(p, occ), reach = reacher(p, occ);
  while (pi < K && moves < C * 3) {
    const t = p.pellets[pi];
    const dist = new Int32Array(C).fill(-1);
    dist[idxOf(p, t[0], t[1])] = 0;
    const q = [t];
    for (let i = 0; i < q.length; i++) {
      const [cx, cy] = q[i];
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (!insideOf(p, nx, ny) || dist[idxOf(p, nx, ny)] >= 0 || bl(pi, nx, ny)) continue;
        dist[idxOf(p, nx, ny)] = dist[idxOf(p, cx, cy)] + 1; q.push([nx, ny]);
      }
    }
    const cands = [];
    for (const d of DIRS) {
      const nx = hx + d[0], ny = hy + d[1];
      if (bl(pi, nx, ny)) continue;
      const dd = dist[idxOf(p, nx, ny)];
      if (dd < 0) continue;
      occ[idxOf(p, nx, ny)] = 1;
      const ate = nx === t[0] && ny === t[1];
      const safe = reach(ate ? pi + 1 : pi, nx, ny) ? 1 : 0;
      occ[idxOf(p, nx, ny)] = 0;
      cands.push({ d, dd, safe, st: (d[0] === ld[0] && d[1] === ld[1]) ? 1 : 0 });
    }
    if (!cands.length) return { cleared: false, caught: pi };
    cands.sort((a, b) => (b.safe - a.safe) || (a.dd - b.dd) || (b.st - a.st));
    const b = cands[0];
    hx += b.d[0]; hy += b.d[1]; occ[idxOf(p, hx, hy)] = 1;
    if (hx === t[0] && hy === t[1]) pi += 1;
    ld = b.d; moves += 1;
  }
  return { cleared: pi >= K, caught: pi };
}

// THE BEAM PLANNER: the thoughtful player, and THE GATE.
//
// The careful player only refuses moves that strand something right now, which is
// why a board can beat it and still fall to anybody who thinks two moves ahead.
// This one keeps W partial games alive at once and lets them compete, which is
// what a person does when they try an idea, watch it fail, and back up. On the
// bank this rule replaced it cleared 63 of 70 boards the careful player could not
// finish.
//
// The trail is carried as a BITSET of 32-bit words rather than a byte array,
// because copying the trail is essentially the whole cost of running a beam and
// three numbers copy for nothing. That is also what makes the dedupe LOSSLESS:
// everything the rules care about from here on is the set of occupied squares,
// where the head is, and how many mascots are gone, so two states agreeing on all
// three are the SAME position however differently they got there. Deduping on the
// head alone is a different and far weaker thing, and it makes the beam useless as
// a gate while making it look fast.
function beamClears(p, W = BEAM_WIDTH) {
  const C = p.w * p.h, K = p.pellets.length, maxSteps = C * 2, NW = Math.ceil(C / 32);
  const seen = new Uint8Array(C), stack = new Int32Array(C);
  const later = new Int32Array(C).fill(-1);   // -1 = plain square, else the mascot's place in the cast
  for (let k = 0; k < K; k++) later[idxOf(p, p.pellets[k][0], p.pellets[k][1])] = k;
  const has = (w, i) => (w[i >> 5] >>> (i & 31)) & 1;
  const room = (w, q, x, y) => {
    seen.fill(0); const i0 = idxOf(p, x, y); seen[i0] = 1; let top = 0, n = 0; stack[top++] = i0;
    while (top) {
      const c = stack[--top], cx = c % p.w, cy = (c - cx) / p.w;
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (!insideOf(p, nx, ny)) continue;
        const j = idxOf(p, nx, ny);
        if (seen[j] || has(w, j)) continue;
        seen[j] = 1; stack[top++] = j; n++;
      }
    }
    for (let k = q; k < K; k++) if (!seen[idxOf(p, p.pellets[k][0], p.pellets[k][1])]) return -1;
    return n;
  };
  const w0 = new Array(NW).fill(0), s0 = idxOf(p, p.start[0], p.start[1]);
  w0[s0 >> 5] |= (1 << (s0 & 31));
  let beam = [{ w: w0, x: p.start[0], y: p.start[1], pi: 0, mv: 0 }];
  for (let step = 0; step < maxSteps; step++) {
    const next = [], sig = new Set();
    for (const s of beam) {
      for (const d of DIRS) {
        const nx = s.x + d[0], ny = s.y + d[1];
        if (!insideOf(p, nx, ny)) continue;
        const j = idxOf(p, nx, ny);
        if (has(s.w, j)) continue;
        if (later[j] >= 0 && later[j] > s.pi) continue;   // a mascot whose turn has not come is solid
        const pi = later[j] === s.pi ? s.pi + 1 : s.pi;
        if (pi >= K) return { cleared: true, moves: s.mv + 1 };
        const w = s.w.slice(); w[j >> 5] |= (1 << (j & 31));
        const key = `${w.join(',')}|${j}|${pi}`;
        if (sig.has(key)) continue; sig.add(key);
        const r = room(w, pi, nx, ny); if (r < 0) continue;
        next.push({ w, x: nx, y: ny, pi, mv: s.mv + 1, sc: pi * 100000 - manh([nx, ny], p.pellets[pi]) * 10 + r });
      }
    }
    if (!next.length) break;
    next.sort((a, b) => b.sc - a.sc);
    beam = next.slice(0, W);
  }
  return { cleared: false, caught: beam.length ? Math.max(...beam.map((s) => s.pi)) : 0 };
}

// FORGIVENESS: what a careless move costs, measured on the BOARD.
//
// Walk one winning route and, at every single ply, ask of each LEGAL move whether
// the board is still winnable after it. A board where nearly every move survives
// does not punish anybody, however much of it the route has to cover, and that is
// exactly the bank the owner rejected twice. Reported as two numbers: the share of
// available moves that survive, and the share of the plies where you actually had
// a choice that had exactly ONE right answer.
//
// The winnability oracle is the same exhaustive search used everywhere else,
// restarted from a mid-run position with the trail already down. `capped` means it
// ran out of nodes and the number is not to be trusted, which is a failure rather
// than a pass: an unmeasurable board does not ship.
function forgiveness(p, cap = 400000) {
  const C = p.w * p.h, K = p.pellets.length;
  let capped = false;
  const winnable = (occ0, hx, hy, pi) => {
    const occ = Uint8Array.from(occ0); occ[idxOf(p, hx, hy)] = 1;
    const bl = blocker(p, occ), reach = reacher(p, occ);
    let n = 0, hit = false;
    const dfs = (x, y, k) => {
      if (k >= K) return true;
      if (++n > cap) { hit = true; return false; }
      const t = p.pellets[k];
      const opts = DIRS.filter((d) => !bl(k, x + d[0], y + d[1]))
        .sort((a, b) => manh([x + a[0], y + a[1]], t) - manh([x + b[0], y + b[1]], t));
      for (const d of opts) {
        const nx = x + d[0], ny = y + d[1];
        const nk = (nx === t[0] && ny === t[1]) ? k + 1 : k;
        occ[idxOf(p, nx, ny)] = 1;
        if (nk >= K || reach(nk, nx, ny)) { if (dfs(nx, ny, nk)) { occ[idxOf(p, nx, ny)] = 0; return true; } }
        occ[idxOf(p, nx, ny)] = 0;
      }
      return false;
    };
    const r = dfs(hx, hy, pi);
    if (hit) capped = true;
    return r;
  };
  const occ = new Uint8Array(C);
  let hx = p.start[0], hy = p.start[1], pi = 0;
  occ[idxOf(p, hx, hy)] = 1;
  let legalTot = 0, winTot = 0, forced = 0, choicePlies = 0;
  for (let step = 0; step < C * 2 && pi < K; step++) {
    const cands = [];
    for (const d of DIRS) {
      const nx = hx + d[0], ny = hy + d[1];
      if (!insideOf(p, nx, ny) || occ[idxOf(p, nx, ny)]) continue;
      let solid = false;
      for (let k = pi + 1; k < K; k++) if (p.pellets[k][0] === nx && p.pellets[k][1] === ny) solid = true;
      if (solid) continue;
      cands.push([nx, ny]);
    }
    if (!cands.length) break;
    const wins = [];
    for (const [nx, ny] of cands) {
      const npi = (p.pellets[pi][0] === nx && p.pellets[pi][1] === ny) ? pi + 1 : pi;
      const o2 = Uint8Array.from(occ); o2[idxOf(p, nx, ny)] = 1;
      if (npi >= K) { wins.push([nx, ny, npi]); continue; }
      if (winnable(o2, nx, ny, npi)) wins.push([nx, ny, npi]);
    }
    if (!wins.length) break;
    legalTot += cands.length; winTot += wins.length;
    if (cands.length > 1) { choicePlies += 1; if (wins.length === 1) forced += 1; }
    const pick = wins[0];
    hx = pick[0]; hy = pick[1]; pi = pick[2]; occ[idxOf(p, hx, hy)] = 1;
  }
  if (pi < K || !legalTot) return { ok: false, capped };
  return {
    ok: true, capped,
    forgive: winTot / legalTot,
    forcedShare: choicePlies ? forced / choicePlies : 1,
  };
}

// ---------- 1. row shape, cast and ranges -----------------------------------
(function shape() {
  const bad = [];
  let prevNum = 0, prevLive = '';
  for (const p of PUZZLES) {
    const why = [];
    if (p.num !== prevNum + 1) why.push(`num out of sequence (${p.num} after ${prevNum})`);
    prevNum = p.num;
    if (p.live <= prevLive) why.push('live date not strictly increasing');
    prevLive = p.live;
    const dow = dowOf(p);
    if (p.live >= REBUILT_FROM) {
      const rung = RAMP[dow];
      if (p.w !== rung.w || p.h !== rung.w) why.push(`board is ${p.w}x${p.h}, expected ${rung.w}x${rung.w} on a ${DOW[dow]}`);
      if (p.cast && p.cast.length !== rung.cast) why.push(`cast of ${p.cast.length}, expected ${rung.cast} on a ${DOW[dow]}`);
      if (!Array.isArray(p.cast) || p.cast.length < CAST_MIN || p.cast.length > CAST_MAX) {
        why.push(`cast of ${p.cast && p.cast.length}, outside ${CAST_MIN}-${CAST_MAX}`);
      }
    }
    const d = new Date(`${p.live}T12:00:00Z`);
    const want = `chomp-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
    if (p.quizId !== want) why.push(`quizId ${p.quizId}, expected ${want}`);
    if (p.cast[0] !== FIRST_MASCOT) why.push(`opens with ${p.cast[0]}, not the bulldog`);
    if (new Set(p.cast).size !== p.cast.length) why.push('cast repeats a mascot');
    for (const m of p.cast) if (!MASCOTS.includes(m)) why.push(`unknown mascot ${m}`);
    if (p.pellets.length !== p.cast.length) why.push('pellets and cast are different lengths');
    const seen = new Set([idxOf(p, p.start[0], p.start[1])]);
    for (const c of p.pellets) {
      if (!insideOf(p, c[0], c[1])) why.push(`pellet ${c} off the board`);
      if (seen.has(idxOf(p, c[0], c[1]))) why.push(`pellet ${c} repeated or sitting on the start`);
      seen.add(idxOf(p, c[0], c[1]));
    }
    if (why.length) bad.push(`#${p.num} ${p.live}: ${why.join('; ')}`);
  }
  if (bad.length) fail('shape', bad.slice(0, 4).join(' | '));
  else {
    const sizes = {};
    for (const p of PUZZLES) sizes[`${p.w}x${p.h}`] = (sizes[`${p.w}x${p.h}`] || 0) + 1;
    ok('shape', `${PUZZLES.length} rows, sequential, all opening with the bulldog, boards ${Object.entries(sizes).map(([k, v]) => `${k}x${v}`).join(' ')}`);
  }
})();

// ---------- 2. the floor is the real Manhattan leg sum ----------------------
(function floor() {
  const wrong = [];
  for (const p of PUZZLES) {
    const f = floorOf(p);
    if (p.floor !== f) wrong.push(`#${p.num} stores ${p.floor}, recomputed ${f}`);
  }
  if (wrong.length) fail('floor', wrong.slice(0, 5).join(', '));
  else {
    const v = PUZZLES.map((p) => p.floor);
    ok('floor', `all ${PUZZLES.length} match the recomputed leg sum, ${Math.min(...v)}-${Math.max(...v)} moves`);
  }
})();

// ---------- 3. the stored optimum is real, and the shipped engine walks it --
// The stored `min` is not taken on trust: it is recomputed exhaustively, and the
// route that achieves it is then replayed through lib/chomp-engine, the module
// the game itself plays through, so a bank that verifies here cannot be
// unplayable there.
const MINS = new Map();
(function findable() {
  const wrong = [], unsolved = [], enginebad = [];
  const fills = [];
  for (const p of PUZZLES) {
    const sr = shortestRoute(p);
    if (sr.min == null) { unsolved.push(`#${p.num} (${p.live})${sr.capped ? ' [search capped]' : ''}`); continue; }
    MINS.set(p.num, sr.min);
    if (p.min !== sr.min) wrong.push(`#${p.num} stores min ${p.min}, recomputed ${sr.min}`);
    const r = replay(p, sr.route);
    if (!r.cleared) enginebad.push(`#${p.num} the engine does not clear the optimum the search found`);
    else if (r.refused) enginebad.push(`#${p.num} the engine refused ${r.refused} legal move(s)`);
    else if (r.moves !== sr.min) enginebad.push(`#${p.num} the engine walks ${r.moves} where the search says ${sr.min}`);
    else fills.push(r.fill);
  }
  if (unsolved.length) fail('findable', `an exhaustive search cannot finish these, so they are not puzzles: ${unsolved.slice(0, 6).join(', ')}`);
  if (wrong.length) fail('findable', wrong.slice(0, 5).join(', '));
  if (enginebad.length) fail('findable', enginebad.slice(0, 4).join('; '));
  if (!unsolved.length && !wrong.length && !enginebad.length) {
    ok('findable', `every stored min is the true optimum, and lib/chomp-engine replays each one move for move (board ${Math.round(Math.min(...fills) * 100)}%-${Math.round(Math.max(...fills) * 100)}% full at the finish)`);
  }
})();

// ---------- 4. the Sunday Edition ------------------------------------------
(function sunday() {
  const bad = [];
  for (const p of PUZZLES) {
    const really = dowOf(p) === 0;
    if (!!p.sunday !== really) bad.push(`#${p.num} ${p.live} sunday=${!!p.sunday} but the date says ${really}`);
  }
  const rows = PUZZLES.filter((p) => p.live >= REBUILT_FROM);
  const sun = rows.filter((p) => p.sunday), wk = rows.filter((p) => !p.sunday);
  if (!sun.length) bad.push('the bank authors no Sunday Edition at all');
  const smallest = Math.min(...rows.map((q) => q.w));
  for (const p of sun) {
    if (p.cast.length !== MASCOTS.length) bad.push(`#${p.num} Sunday is not the full cast`);
    if (p.w !== smallest) bad.push(`#${p.num} Sunday is not on the smallest board of the week`);
  }
  const maxWeekdayCast = Math.max(...wk.map((p) => p.cast.length));
  if (sun.length && maxWeekdayCast >= MASCOTS.length) bad.push('a weekday fields the full cast, so Sunday is not the peak');
  // and the Sunday has to be the TIGHTEST board of the week, which is the point
  const sunCov = sun.map((p) => coverOf(p, MINS.get(p.num))).filter((v) => !Number.isNaN(v));
  const wkCov = wk.map((p) => coverOf(p, MINS.get(p.num))).filter((v) => !Number.isNaN(v));
  if (sunCov.length && wkCov.length && Math.min(...sunCov) <= Math.max(...wkCov)) {
    bad.push('a weekday board is at least as tight as the loosest Sunday, so Sunday is not the peak');
  }
  if (bad.length) fail('sunday', bad.slice(0, 4).join('; '));
  else {
    const full = sun.filter((p) => coverOf(p, MINS.get(p.num)) >= 1).length;
    ok('sunday', `${sun.length} Sunday Editions, every one ${smallest}x${smallest} with the full cast of ${MASCOTS.length}, forcing ${Math.round(Math.min(...sunCov) * 100)}-${Math.round(Math.max(...sunCov) * 100)}% of the board against a weekday peak of ${Math.round(Math.max(...wkCov) * 100)}%${full ? `, and ${full} needing literally every square` : ''}`);
  }
})();

// ---------- 5. difficulty: the board punishes, and no bot decides that ------
// The two cheap player models stay as GATES, because a board an unplanned line or
// a careful greedy player can finish is trivial by inspection and there is no
// argument about it. The beam planner is NOT a gate: it was one, twice, and both
// times the bank simply learned to beat that exact beam. It is run and printed so
// the number is on the record, and nothing fails on it.
//
// The gate that replaced it is FORGIVENESS, above: a property of the board, so it
// cannot be satisfied by out-tuning whatever bot is fashionable this week.
(function difficulty() {
  const soft = [], careless = [], loose = [], unmeasured = [];
  const beamGot = []; let beamCleared = 0;
  const fg = [], fs = [];
  let rows = 0;
  for (const p of PUZZLES) {
    if (p.live < REBUILT_FROM) continue;
    rows += 1;
    if (['axis', 'straight', 'bfs'].some((m) => unplanned(p, m).cleared)) soft.push(`#${p.num} (${p.live})`);
    if (carefulClears(p).cleared) careless.push(`#${p.num} (${p.live})`);
    const f = forgiveness(p);
    if (!f.ok || f.capped) { unmeasured.push(`#${p.num}`); continue; }
    fg.push(f.forgive); fs.push(f.forcedShare);
    if (f.forgive > FORGIVE_MAX + 1e-9) loose.push(`#${p.num} leaves ${Math.round(f.forgive * 100)}% of your moves survivable`);
    else if (f.forcedShare < FORCED_MIN - 1e-9) loose.push(`#${p.num} has one right answer on only ${Math.round(f.forcedShare * 100)}% of its choices`);
    const b = beamClears(p);
    if (b.cleared) beamCleared += 1; else beamGot.push(b.caught / p.cast.length);
  }
  if (soft.length) fail('difficulty', `an unplanned line clears these: ${soft.slice(0, 6).join(', ')}`);
  if (careless.length) fail('difficulty', `a careful player clears these without ever being stuck: ${careless.slice(0, 6).join(', ')}`);
  if (unmeasured.length) fail('difficulty', `forgiveness could not be measured on ${unmeasured.slice(0, 6).join(', ')}, so they are unverified`);
  if (loose.length) fail('difficulty', `too forgiving: ${loose.slice(0, 5).join('; ')}`);
  if (!soft.length && !careless.length && !unmeasured.length && !loose.length) {
    const pc = (a) => `${Math.round(Math.min(...a) * 100)}-${Math.round(Math.max(...a) * 100)}%`;
    ok('difficulty', `across ${rows}: no unplanned line and no careful player clears a board, ${pc(fg)} of the moves open to you survive (ceiling ${Math.round(FORGIVE_MAX * 100)}%) and ${pc(fs)} of your real choices have exactly one right answer`);
    const share = beamGot.length ? (beamGot.reduce((a, b) => a + b, 0) / beamGot.length * 100).toFixed(0) : '0';
    note('planner', `for the record and NOT a gate: a ${BEAM_WIDTH}-wide beam clears ${beamCleared} of ${rows} and stalls at ${share}% of the cast on the rest. A wider one clears more. That is why it does not decide anything here`);
  }
})();

// ---------- 5b. the ramp is SPARE SQUARES, and it has to fall --------------
// The old ramp measured how far a bot got, which normalises to "just barely beats
// it" on every rung and comes out flat. This measures the BOARD: how many squares
// the player is free to waste. It cannot be gamed by tuning a bot, and it is quoted
// in squares because a percentage is what let a Monday leaving twenty-four spare
// squares read as a respectable 63%.
(function ramp() {
  const rows = PUZZLES.filter((p) => p.live >= REBUILT_FROM);
  const by = {};
  const stray = [];
  for (const p of rows) {
    const min = MINS.get(p.num);
    if (min == null) continue;
    const sp = spareOf(p, min), r = rungOf(p);
    if (sp < r.spare[0] || sp > r.spare[1]) {
      stray.push(`#${p.num} ${DOW[dowOf(p)]} leaves ${sp} spare square${sp === 1 ? '' : 's'}, outside its ${r.spare[0]}-${r.spare[1]}`);
    }
    (by[dowOf(p)] = by[dowOf(p)] || []).push(sp);
  }
  const bad = [...stray];
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const order = [1, 2, 3, 4, 5, 6, 0];   // Mon..Sun
  const got = order.map((d) => (by[d] ? mean(by[d]) : null));
  for (const [i, v] of got.entries()) if (v == null) bad.push(`no boards on ${DOW[order[i]]}`);
  if (!bad.length) {
    // strictly falling, Monday to Sunday. The bands do not overlap between
    // adjacent rungs, so there is no wobble to tolerate here.
    for (let i = 1; i < got.length; i++) {
      if (got[i] >= got[i - 1]) bad.push(`${DOW[order[i]]} (${got[i].toFixed(1)} spare) is not tighter than ${DOW[order[i - 1]]} (${got[i - 1].toFixed(1)} spare)`);
    }
    // and the week has to actually GO somewhere. Six squares is the gap between a
    // day you can wander on and a day you cannot.
    if (got[0] - got[6] < 6) bad.push(`Monday to Sunday only closes ${(got[0] - got[6]).toFixed(1)} squares, so the week is flat`);
    // the loosest day of the week is still a real board. This is the check the
    // owner's complaint was actually about: round one would have passed a Monday
    // with twenty-four spare squares.
    const worst = Math.max(...rows.map((p) => spareOf(p, MINS.get(p.num))).filter((v) => Number.isFinite(v)));
    if (worst > 10) bad.push(`the loosest board of the bank leaves ${worst} spare squares, which is a walk`);
  }
  if (bad.length) fail('ramp', bad.slice(0, 5).join('; '));
  else {
    const covs = rows.map((p) => coverOf(p, MINS.get(p.num)));
    ok('ramp', `spare squares ${order.map((d, i) => `${DOW[d]} ${got[i].toFixed(1)}`).join(', ')}, so the board forces ${Math.round(Math.min(...covs) * 100)}-${Math.round(Math.max(...covs) * 100)}% of itself`);
  }
})();

// ---------- 6. pool variety across the whole bank ---------------------------
(function variety() {
  const rows = PUZZLES.filter((p) => p.live >= REBUILT_FROM);
  const startSeen = new Map(), cellSeen = new Map(), orders = new Set();
  const sizeRows = {};
  for (const p of rows) {
    sizeRows[p.w] = (sizeRows[p.w] || 0) + 1;
    const sk = `${p.w}:${p.start}`;
    startSeen.set(sk, (startSeen.get(sk) || 0) + 1);
    for (const c of p.pellets) { const k = `${p.w}:${c}`; cellSeen.set(k, (cellSeen.get(k) || 0) + 1); }
    orders.add(p.cast.join('|'));
  }
  // keyed by BOARD SIZE, because a square on a 7x7 and a square on an 8x8 are
  // different squares. The tight days genuinely need the corners (a long leg has
  // to end somewhere extreme), so the cap is a share of the boards of that size
  // rather than a flat count.
  const startCap = 5, cellShare = 0.45;
  const hotStart = [...startSeen.values()].filter((n) => n > startCap).length;
  const hotCell = [...cellSeen.entries()].filter(([k, n]) => n > Math.ceil(sizeRows[+k.split(':')[0]] * cellShare));
  if (hotStart) fail('variety', `${hotStart} start square(s) used more than ${startCap} times`);
  if (hotCell.length) fail('variety', `${hotCell.length} square(s) carry a mascot on more than ${Math.round(cellShare * 100)}% of the boards of their size: ${hotCell.slice(0, 4).map(([k, n]) => `${k} x${n}`).join(', ')}`);
  if (orders.size < rows.length / 3) fail('variety', `only ${orders.size} distinct cast orders across ${rows.length} boards`);
  const used = {};
  for (const p of rows) for (const m of p.cast) used[m] = (used[m] || 0) + 1;
  const never = MASCOTS.filter((m) => !used[m]);
  if (never.length) fail('variety', `${never.join(', ')} never appear`);
  const sizes = new Set(rows.map((p) => p.cast.length));
  if (sizes.size < 3) fail('variety', `only ${sizes.size} distinct cast sizes, the count is not varying`);
  if (!hotStart && !hotCell.length && orders.size >= rows.length / 3 && !never.length && sizes.size >= 3) {
    ok('variety', `${startSeen.size} distinct start squares (busiest ${Math.max(...startSeen.values())}), busiest mascot square ${Math.max(...cellSeen.values())}, ${orders.size} distinct cast orders across ${rows.length} boards`);
  }
})();

// ---------- 7. scoring ------------------------------------------------------
(function scoring() {
  const scoreOf = (eaten, total) => (eaten >= total ? 10 : Math.max(0, Math.min(9, Math.round((eaten / total) * 10))));
  let bad = false;
  for (let n = CAST_MIN; n <= CAST_MAX; n++) {
    if (scoreOf(n, n) !== 10) { fail('scoring', `clearing a cast of ${n} does not score 10`); bad = true; }
    if (scoreOf(0, n) !== 0) { fail('scoring', `eating nothing out of ${n} does not score 0`); bad = true; }
    if (scoreOf(n - 1, n) >= 10) { fail('scoring', `a near miss on ${n} scores a perfect`); bad = true; }
    let prev = -1;
    for (let e = 0; e <= n; e++) {
      const v = scoreOf(e, n);
      if (v < prev) { fail('scoring', `score is not monotonic at a cast of ${n}`); bad = true; break; }
      prev = v;
    }
  }
  if (!bad) ok('scoring', `partial credit behaves at every cast length ${CAST_MIN}-${CAST_MAX}: monotonic to 0-10, only a full clear scores 10`);
})();

// ---------- 8. US spellings -------------------------------------------------
(function spelling() {
  const BRIT = /\b(colour|centre|grey|neighbour|favourite|defence|practise|licence|metre|theatre)\b/i;
  const hits = PUZZLES.filter((p) => BRIT.test(String(p.dateLabel))).map((p) => p.num);
  if (hits.length) fail('spelling', `British spellings on rows ${hits.join(', ')}`);
  else note('spelling', 'no British spellings in bank strings');
})();

console.log(BAD ? `\n${BAD} problem${BAD === 1 ? '' : 's'}` : '\nchomp bank verified');
process.exit(BAD ? 1 : 0);
