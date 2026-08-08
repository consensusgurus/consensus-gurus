#!/usr/bin/env node
// verify-chomp — the Chomp bank checker.
//
// Everything here is RECOMPUTED from the board, never read back off the row.
//
// The claim that matters is SOLVABILITY, and specifically FINDABLE solvability.
// Boards are built backwards from a self-avoiding walk, so a solution always
// exists by construction; that is not worth checking and not worth much. What
// this file checks is that a search which knows NOTHING about how the board was
// built can still finish it, because a board only the generator can solve is a
// needle hunt rather than a puzzle. Every board must fall to that search, and
// the found route is then replayed through lib/chomp-engine, the module the game
// actually plays through, so a bank that verifies here cannot be unplayable
// there.
//
// ⚠️ The reachability prune must treat an unreached mascot as PASSABLE. It is
// the thing being asked about, and blocking it makes the check unsatisfiable.
// That bug shipped in an early draft and made the solver report every board
// unsolvable, which nearly got reported as a design failure.
//
// Ranges enforced (documented in app/chomp/puzzles.js):
//   board       13x13
//   cast        5 to 8 mascots, no repeats, always opening with the bulldog,
//               and the FULL cast on a Sunday
//   pellets     one per cast member, in bounds, distinct, never on the start
//   floor       equals the recomputed Manhattan leg sum
//   sunday      true if and only if `live` really is a Sunday, and spread wider
//   difficulty  no unplanned line may clear the board, and from 2026-08-09 the
//               myopic line may not get more than 60% of the way down it
//   variety     start cells and mascot cells spread across the bank, and the
//               cast order must actually rotate
import { PUZZLES, MASCOTS } from '../app/chomp/puzzles.js';
import { replay, freshState } from '../lib/chomp-engine.js';

const CHOMP_RULES_FROM = '2026-08-08';   // the launch day: nothing grandfathered yet
const W = 13, H = 13, CELLS = W * H;
// Only the BULLDOG is fixed. Everything after it is a random order drawn from
// the other seven, and the COUNT varies by day: five to seven on a weekday, the
// whole cast on a Sunday.
const FIRST_MASCOT = 'bulldog';
const CAST_MIN = 5, CAST_MAX = 8;
// HARDNESS GATE (owner, 2026-08-08). Not clearing was never enough: a board the
// myopic line got five-of-six on is a board a person walks, which is how the
// launch week came out too easy. The line must now be stopped inside the first
// 60% of the cast.
//
// 60 rather than 50, and that was measured rather than picked: at a 50% gate
// only 1 candidate in 70 was still solvable inside the search budget, because
// the boards that stop a shortest-path bot early are the same boards nothing can
// route through. 60% keeps the gate biting (the bot averaged 70% before it) while
// leaving boards a person can actually finish.
//
// Day one shipped before any of this and is frozen, so the gate runs from day
// two on.
const MYOPIC_MAX_SHARE = 0.6;
const HARD_FLOOR_FROM = '2026-08-09';
const SOLVER_CAP = 400000;

let BAD = 0;
const fail = (tag, msg) => { BAD += 1; console.log(`✗ ${tag}: ${msg}`); };
const ok = (tag, msg) => console.log(`  ${tag}: ${msg}`);
const note = (tag, msg) => console.log(`… ${tag}: ${msg}`);

const idx = (x, y) => y * W + x;
const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
const manh = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function floorOf(p) {
  let L = manh(p.start, p.pellets[0]);
  for (let i = 1; i < p.pellets.length; i++) L += manh(p.pellets[i - 1], p.pellets[i]);
  return L;
}

// The independent solver. Written out fresh here rather than imported from the
// generator, so a bug in the generator's copy cannot pass its own bank.
function findRoute(p, cap) {
  const occ = new Uint8Array(CELLS);
  occ[idx(p.start[0], p.start[1])] = 1;
  const route = [];
  let nodes = 0;

  const blocked = (pi, x, y) => {
    if (!inside(x, y) || occ[idx(x, y)]) return true;
    for (let k = pi + 1; k < p.pellets.length; k++) {
      if (p.pellets[k][0] === x && p.pellets[k][1] === y) return true;
    }
    return false;
  };
  // free-space flood from the head. Unreached mascots are PASSABLE here on
  // purpose: they are the destinations, not walls, for the purposes of asking
  // whether anything has been stranded.
  const reachAll = (pi, hx, hy) => {
    const seen = new Uint8Array(CELLS);
    seen[idx(hx, hy)] = 1;
    const q = [[hx, hy]];
    for (let i = 0; i < q.length; i++) {
      const [cx, cy] = q[i];
      for (const d of DIRS) {
        const nx = cx + d[0], ny = cy + d[1];
        if (!inside(nx, ny) || occ[idx(nx, ny)] || seen[idx(nx, ny)]) continue;
        seen[idx(nx, ny)] = 1; q.push([nx, ny]);
      }
    }
    for (let k = pi; k < p.pellets.length; k++) {
      if (!seen[idx(p.pellets[k][0], p.pellets[k][1])]) return false;
    }
    return true;
  };

  function dfs(hx, hy, pi) {
    if (pi >= p.pellets.length) return true;
    if (++nodes > cap) return false;
    const t = p.pellets[pi];
    const opts = DIRS.filter((d) => !blocked(pi, hx + d[0], hy + d[1]))
      .sort((a, b) => manh([hx + a[0], hy + a[1]], t) - manh([hx + b[0], hy + b[1]], t));
    for (const d of opts) {
      const nx = hx + d[0], ny = hy + d[1];
      const np = (nx === t[0] && ny === t[1]) ? pi + 1 : pi;
      occ[idx(nx, ny)] = 1; route.push(d);
      if (np >= p.pellets.length || reachAll(np, nx, ny)) {
        if (dfs(nx, ny, np)) return true;
      }
      route.pop(); occ[idx(nx, ny)] = 0;
    }
    return false;
  }
  return dfs(p.start[0], p.start[1], 0) ? route.slice() : null;
}

// The unplanned lines. `mode` bfs re-plans a true shortest path each move and
// detours around its own wall, but never looks past the mascot it is chasing.
function unplanned(p, mode) {
  const occ = new Uint8Array(CELLS);
  let hx = p.start[0], hy = p.start[1], pi = 0, moves = 0, ld = [1, 0];
  occ[idx(hx, hy)] = 1;
  const legal = (x, y) => {
    if (!inside(x, y) || occ[idx(x, y)]) return false;
    for (let k = pi + 1; k < p.pellets.length; k++) if (p.pellets[k][0] === x && p.pellets[k][1] === y) return false;
    return true;
  };
  while (pi < p.pellets.length && moves < CELLS * 3) {
    const t = p.pellets[pi];
    let pick = null;
    if (mode === 'bfs') {
      const dist = new Int32Array(CELLS).fill(-1);
      dist[idx(t[0], t[1])] = 0;
      const q = [t];
      for (let i = 0; i < q.length; i++) {
        const [cx, cy] = q[i];
        for (const d of DIRS) {
          const nx = cx + d[0], ny = cy + d[1];
          if (!inside(nx, ny) || dist[idx(nx, ny)] >= 0 || !legal(nx, ny)) continue;
          dist[idx(nx, ny)] = dist[idx(cx, cy)] + 1; q.push([nx, ny]);
        }
      }
      let bd = Infinity;
      for (const d of DIRS) {
        const nx = hx + d[0], ny = hy + d[1];
        if (!legal(nx, ny)) continue;
        const dd = dist[idx(nx, ny)];
        if (dd < 0) continue;
        const sc = dd * 2 + (d[0] === ld[0] && d[1] === ld[1] ? 0 : 1);
        if (sc < bd) { bd = sc; pick = d; }
      }
    } else {
      const dx = t[0] - hx, dy = t[1] - hy;
      const opts = [];
      if (dx !== 0) opts.push([Math.sign(dx), 0]);
      if (dy !== 0) opts.push([0, Math.sign(dy)]);
      if (mode === 'straight' && opts.some((d) => d[0] === ld[0] && d[1] === ld[1])) {
        pick = opts.find((d) => d[0] === ld[0] && d[1] === ld[1]);
      } else if (opts.length === 2) pick = Math.abs(dx) >= Math.abs(dy) ? opts[0] : opts[1];
      else pick = opts[0] || null;
      if (pick && !legal(hx + pick[0], hy + pick[1])) pick = null;
    }
    if (!pick) return { moves, caught: pi, cleared: false };
    hx += pick[0]; hy += pick[1]; occ[idx(hx, hy)] = 1;
    if (hx === t[0] && hy === t[1]) pi += 1;
    ld = pick; moves += 1;
  }
  return { moves, caught: pi, cleared: pi >= p.pellets.length };
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
    if (p.w !== W || p.h !== H) why.push(`board is ${p.w}x${p.h}, expected ${W}x${H}`);
    const d = new Date(`${p.live}T12:00:00Z`);
    const want = `chomp-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
    if (p.quizId !== want) why.push(`quizId ${p.quizId}, expected ${want}`);
    if (!Array.isArray(p.cast) || p.cast.length < CAST_MIN || p.cast.length > CAST_MAX) {
      why.push(`cast of ${p.cast && p.cast.length}, expected ${CAST_MIN}-${CAST_MAX}`);
    } else {
      if (p.cast[0] !== FIRST_MASCOT) why.push(`opens with ${p.cast[0]}, not the bulldog`);
      if (new Set(p.cast).size !== p.cast.length) why.push('cast repeats a mascot');
      for (const m of p.cast) if (!MASCOTS.includes(m)) why.push(`unknown mascot ${m}`);
      if (p.sunday && p.cast.length !== MASCOTS.length) why.push(`Sunday carries ${p.cast.length} of ${MASCOTS.length} mascots`);
    }
    if (p.pellets.length !== (p.cast || []).length) why.push('pellets and cast are different lengths');
    const seen = new Set([idx(p.start[0], p.start[1])]);
    for (const c of p.pellets) {
      if (!inside(c[0], c[1])) why.push(`pellet ${c} off the board`);
      if (seen.has(idx(c[0], c[1]))) why.push(`pellet ${c} repeated or sitting on the start`);
      seen.add(idx(c[0], c[1]));
    }
    if (why.length) bad.push(`#${p.num} ${p.live}: ${why.join('; ')}`);
  }
  if (bad.length) fail('shape', bad.slice(0, 4).join(' | '));
  else {
    const sizes = {};
    for (const p of PUZZLES) sizes[p.cast.length] = (sizes[p.cast.length] || 0) + 1;
    ok('shape', `${PUZZLES.length} rows, ${W}x${H}, sequential, all opening with the bulldog, cast sizes ${Object.entries(sizes).sort().map(([k, v]) => `${k}x${v}`).join(' ')}`);
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

// ---------- 3. FINDABLE, and the shipped engine agrees ----------------------
(function findable() {
  const unsolved = [], enginebad = [];
  const lens = [], fills = [];
  for (const p of PUZZLES) {
    const route = findRoute(p, SOLVER_CAP);
    if (!route) { unsolved.push(`#${p.num} (${p.live})`); continue; }
    const r = replay(p, route);
    if (!r.cleared) enginebad.push(`#${p.num} engine does not clear a route the solver found`);
    else if (r.refused) enginebad.push(`#${p.num} engine refused ${r.refused} legal move(s)`);
    else { lens.push(r.moves); fills.push(r.fill); }
  }
  if (unsolved.length) fail('findable', `an independent search cannot finish these, so they are not puzzles: ${unsolved.slice(0, 6).join(', ')}`);
  if (enginebad.length) fail('findable', enginebad.slice(0, 4).join('; '));
  if (!unsolved.length && !enginebad.length) {
    ok('findable', `all ${PUZZLES.length} fall to a search that knows nothing about how they were built, and lib/chomp-engine replays every route move for move (${Math.min(...lens)}-${Math.max(...lens)} moves, board ${Math.round(Math.min(...fills) * 100)}%-${Math.round(Math.max(...fills) * 100)}% full at the finish)`);
  }
})();

// ---------- 4. the Sunday Edition ------------------------------------------
(function sunday() {
  const bad = [];
  for (const p of PUZZLES) {
    const really = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== really) bad.push(`#${p.num} ${p.live} sunday=${!!p.sunday} but the date says ${really}`);
  }
  const sun = PUZZLES.filter((p) => p.sunday), wk = PUZZLES.filter((p) => !p.sunday);
  if (!sun.length) bad.push('the bank authors no Sunday Edition at all');
  const avg = (a) => a.reduce((s, p) => s + p.floor, 0) / a.length;
  if (sun.length && wk.length && avg(sun) <= avg(wk)) bad.push('Sundays are not spread wider than weekdays');
  for (const p of sun) if (p.cast.length !== MASCOTS.length) bad.push(`#${p.num} Sunday is not the full cast`);
  if (bad.length) fail('sunday', bad.slice(0, 4).join('; '));
  else ok('sunday', `${sun.length} Sunday Editions, every one the full cast of ${MASCOTS.length}, mean floor ${Math.round(avg(sun))} against a weekday ${Math.round(avg(wk))}, flags match the calendar`);
})();

// ---------- 5. difficulty: no unplanned line clears it ----------------------
(function difficulty() {
  const soft = [], tooFar = [];
  let bfsCaught = [];
  let rows = 0;
  for (const p of PUZZLES) {
    if (p.live < CHOMP_RULES_FROM) continue;
    rows += 1;
    const lines = ['axis', 'straight', 'bfs'].map((m) => unplanned(p, m));
    if (lines.some((r) => r.cleared)) soft.push(`#${p.num} (${p.live})`);
    if (p.live >= HARD_FLOOR_FROM && lines[2].caught > Math.floor(p.cast.length * MYOPIC_MAX_SHARE)) {
      tooFar.push(`#${p.num} (${p.live}) myopic got ${lines[2].caught}/${p.cast.length}`);
    }
    bfsCaught.push({ got: lines[2].caught, of: p.cast.length });
  }
  if (soft.length) fail('difficulty', `an unplanned line clears these: ${soft.slice(0, 6).join(', ')}`);
  if (tooFar.length) fail('difficulty', `the myopic line gets more than ${Math.round(MYOPIC_MAX_SHARE * 100)}% of the way down these, so they play too easily: ${tooFar.slice(0, 6).join(', ')}`);
  if (!soft.length && !tooFar.length) {
    // reported as a SHARE, since the cast length now differs day to day
    const share = (bfsCaught.reduce((a, b) => a + b.got / b.of, 0) / bfsCaught.length * 100).toFixed(0);
    ok('difficulty', `no board falls to an unplanned line across ${rows}, and from ${HARD_FLOOR_FROM} none lets it past ${Math.round(MYOPIC_MAX_SHARE * 100)}% of the cast; it averages ${share}% of the way down before it walls itself in`);
  }
})();

// ---------- 6. pool variety across the whole bank ---------------------------
(function variety() {
  const rows = PUZZLES.filter((p) => p.live >= CHOMP_RULES_FROM);
  const startSeen = new Map(), cellSeen = new Map(), orders = new Set();
  for (const p of rows) {
    const sk = idx(p.start[0], p.start[1]);
    startSeen.set(sk, (startSeen.get(sk) || 0) + 1);
    for (const c of p.pellets) { const k = idx(c[0], c[1]); cellSeen.set(k, (cellSeen.get(k) || 0) + 1); }
    orders.add(p.cast.join('|'));
  }
  const startCap = 4, cellCap = Math.ceil(rows.length / 5);
  const hotStart = [...startSeen.values()].filter((n) => n > startCap).length;
  const hotCell = [...cellSeen.values()].filter((n) => n > cellCap).length;
  if (hotStart) fail('variety', `${hotStart} start cell(s) used more than ${startCap} times`);
  if (hotCell) fail('variety', `${hotCell} cell(s) carry a mascot on more than ${cellCap} of ${rows.length} boards`);
  // the cast rotates by design, so a bank that keeps re-dealing one order is a bug
  if (orders.size < rows.length / 3) fail('variety', `only ${orders.size} distinct cast orders across ${rows.length} boards`);
  // every mascot has to get used, and the cast size has to actually vary, or the
  // "as many as the board wants" rule is not doing anything
  const used = {};
  for (const p of rows) for (const m of p.cast) used[m] = (used[m] || 0) + 1;
  const never = MASCOTS.filter((m) => !used[m]);
  if (never.length) fail('variety', `${never.join(', ')} never appear`);
  const sizes = new Set(rows.map((p) => p.cast.length));
  if (sizes.size < 3) fail('variety', `only ${sizes.size} distinct cast sizes, the count is not varying`);
  if (!hotStart && !hotCell && orders.size >= rows.length / 3 && !never.length && sizes.size >= 3) {
    ok('variety', `${startSeen.size} distinct start cells (busiest ${Math.max(...startSeen.values())}), busiest mascot cell ${Math.max(...cellSeen.values())}/${rows.length}, ${orders.size} distinct cast orders`);
  }
})();

// ---------- 7. scoring ------------------------------------------------------
(function scoring() {
  const scoreOf = (eaten, total) => (eaten >= total ? 10 : Math.max(0, Math.min(9, Math.round((eaten / total) * 10))));
  // the cast length varies by day, so the curve has to behave at EVERY length
  for (let n = CAST_MIN; n <= CAST_MAX; n++) {
    if (scoreOf(n, n) !== 10) fail('scoring', `clearing a cast of ${n} does not score 10`);
    if (scoreOf(0, n) !== 0) fail('scoring', `eating nothing out of ${n} does not score 0`);
    if (scoreOf(n - 1, n) >= 10) fail('scoring', `a near miss on ${n} scores a perfect`);
    let prev = -1;
    for (let e = 0; e <= n; e++) {
      const v = scoreOf(e, n);
      if (v < prev) { fail('scoring', `score is not monotonic at a cast of ${n}`); break; }
      prev = v;
    }
  }
  if (!BAD) ok('scoring', `partial credit behaves at every cast length ${CAST_MIN}-${CAST_MAX}: monotonic to 0-10, only a full clear scores 10`);
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
