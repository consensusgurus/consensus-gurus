// Parker's bank generator: the daily sliding-block jam, six by six, exit on row 2.
//
//   node scripts/gen-parker.mjs --from=2026-09-30 --days=62 --startnum=63 \
//     --avoid=app/parker/puzzles.js --out=/tmp/build/parker-new.js
//
// or, the house one-liner that reads the bank's own tail and splices for you:
//
//   node scripts/_append.mjs parker gen-parker.mjs 2026-11-30
//
// Parker's 62 hand-authored boards ran to 2026-09-29 with no committed
// generator. This is it. lib/jam-core.js (via app/parker/solver.js) is the ONLY
// rules engine here: every move, every legality test and every banked `par`
// comes out of it, so the minimum this script stores is the same number
// scripts/verify-parker.mjs recomputes and the same one the live hint plays to.
//
// WHAT IT GUARANTEES, per board
//   * block 0 is RED: len 2, horizontal, fixed on row 2 (EXIT_ROW), never
//     already solved at the start;
//   * `par` is the EXACT minimum, agreed by THREE searches: the reverse BFS
//     that found the board, jam-core's forward solve() at its full default cap,
//     and an independent breadth-first search over 36-character GRID STRINGS
//     (parkerParByGrid below) that knows nothing about the block list. The
//     puzzles.js header promises that second grid-string opinion; this is it.
//   * the day's par sits inside its rung -- Mon-Wed 11-14, Thu-Sat 16-20,
//     Sunday 32-38 -- and rises STRICTLY across every Mon->Sat run, so the
//     verifier's "flat step" note never fires;
//   * quizId keeps the historical `park-` prefix. THE GAME SHIPPED AS PARK and
//     was renamed on 2026-07-31; the ids are leaderboard keys, so `park-` is
//     correct and is not to be "fixed".
//
// WHY REVERSE BFS AND NOT A CLIMB TO A TARGET PAR. Random 6x6 packings are
// useless: over 322 sampled components the median deepest board was 6 moves and
// the 90th percentile 13, so nothing near a Sunday ever turns up by sampling.
// Climbing a single board's par toward an exact target works but wastes the
// search: it evaluates thousands of boards and keeps one. The trick is that a
// board's par depends on the block LANES (each block's length, axis and fixed
// row/column) and nothing else about where the blocks sit -- positions are just
// a state in the graph those lanes define. So this script climbs to a deep
// LANE SET, then enumerates that lane set's whole connected component once and
// runs a multi-source BFS backwards from every solved state in it. That one
// pass labels every state with its exact distance to the exit, and because BFS
// layers are contiguous, EVERY par from 1 to the component's maximum is
// available for the picking. A component that climbs to par 31 routinely turns
// out to have a maximum of 35-43, which is where the Sunday boards live; the
// forward climb would have had to find par 38 directly.
//
// SEEDING. The RNG is mulberry32 and the seed is `--seed` OFFSET BY --startnum
// (times 7919), so re-running an unchanged command reproduces the segment
// byte-for-byte, and a segment starting at a different board number can never
// replay the frozen one.
//
// POOL VARIETY -- the ceilings, all counted across the WHOLE bank (frozen
// boards loaded through --avoid) and enforced while the board is chosen, not
// checked afterwards. Random jam boards cluster hard on a few shapes, so
// per-board legality alone would happily ship the same puzzle nine weeks
// running:
//
//   SKELETON        1  A board's "skeleton" is its non-red blocks as
//                      length/axis/lane only, sorted, positions discarded --
//                      i.e. the lane set that fixes the whole state graph. Two
//                      boards on one skeleton are the same jam solved from two
//                      spots, so a skeleton is used ONCE in the whole bank.
//                      (The frozen 62 use 61 distinct skeletons; this segment
//                      collides with none of them.)
//   SKELETON DIST   >=3 Any two boards in the new segment differ in at least 3
//                      non-red lane entries, so no board is another with one
//                      block nudged into a different row.
//   PAR             <=9 boards on any one par value.
//   SUNDAY PAR      <=2 Sundays on any one par value, so 32-38 is covered
//                      rather than camped on its floor.
//   BLOCKS          <=40% of the segment on any one block count (12, 13 or 14,
//                      the range the frozen bank uses).
//   OPENING MOVE    <=4 boards whose optimal opening move is the same slide,
//                      keyed by GEOMETRY (length, axis, lane, from->to) rather
//                      than block index. Matches the frozen bank's own worst
//                      case of 4 in 62.
//   RED START       <=40% of the segment on any one red column.
//
// WHAT THE FIRST RUN ACTUALLY PRODUCED (2026-09-30..2026-11-30, 62 boards):
// pars 11x6 12x7 13x6 14x7 16x6 17x6 18x5 19x5 20x5 and Sundays 32,33,33,34,34,
// 35,36,37,38 -- every value in every rung used; block counts 12x23 13x20
// 14x19; 52 distinct opening moves over 62 boards, worst 3; red start column
// 0x25 1x15 2x16 3x6; and, across the WHOLE 124-board bank, 123 distinct
// skeletons (the one repeat is a pre-existing pair inside the frozen 62, which
// this segment does not touch or add to).
//
// A FLOOR IS NOT A TARGET. Each week draws a strictly increasing (Mon,Tue,Wed)
// triple from the four inside [11,14] and a strictly increasing (Thu,Fri,Sat)
// triple from the ten inside [16,20], least-used first, so no par value camps
// and the week always climbs. Sundays draw least-used-first over 32..38.
//
// WHAT THE NEXT PERSON WOULD OTHERWISE REDISCOVER
//   * Rung bands OVERLAP nothing here (14 < 16 < 32), so the only ramp risk is
//     INSIDE a rung -- and the first day of an extension that starts mid-week
//     must clear the FROZEN previous day's par, which is why --avoid is also
//     read for the ramp floor and not only for signatures.
//   * The verifier's solve() runs at its default 2,000,000-state cap, but a
//     board is only ever banked from a component this script fully enumerated
//     under COMP_CAP (120,000 states), so nothing banked can cap the verifier.
//   * Deep components are NARROW: the 43-max component found in testing held
//     16,930 states, while a shallow 33-max one held 20,151. Component size is
//     not a difficulty signal and is not used as one.
//   * COST IS ALL SUNDAY. The 62-day run to 2026-11-30 took 2,250s: 332s for
//     all 53 weekdays (median 2s a board, worst 81s) and 1,918s for the nine
//     Sundays. Sunday cost climbs steeply with par -- 11s at par 35 and 14s at
//     par 32 when a deep component turns up early, but 548s at par 34 and 771s
//     at par 38 when it does not, because the variance is in FINDING a deep
//     lane set, not in reading pars off it. Budget roughly 15 minutes a Sunday
//     when planning a long run, and run it with `setsid nohup ... &`.
//   * It writes --out after EVERY board, so a killed run keeps what it found.
//   * A whole 62-day segment fits inside the default 360,000-unit budget with
//     room to spare, but the par-38 Sunday used most of one block count's
//     share. If a future segment wants several 37s and 38s, raise --budget
//     rather than lowering the Sunday band: the band is the game's promise.

import fs from 'node:fs';
import {
  grid, solved, moves, apply, key, solve, fromData, toData, signature,
} from '../lib/jam-core.js';

const N = 6;
const EXIT_ROW = 2;

// ─── args (accepts --k=v and --k v, because scripts/_append.mjs uses the latter) ──
const argv = process.argv.slice(2);
const args = {};
for (let i = 0; i < argv.length; i++) {
  const s = argv[i];
  if (!s.startsWith('--')) continue;
  const eq = s.indexOf('=');
  if (eq !== -1) args[s.slice(2, eq)] = s.slice(eq + 1);
  else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) args[s.slice(2)] = argv[++i];
  else args[s.slice(2)] = true;
}

const FROM = String(args.from || '2026-09-30');
const DAYS = +(args.days || 62);
const STARTNUM = +(args.startnum || 63);
const OUT = args.out || null;
const BASE_SEED = +(args.seed || 20260930);
// The seed is offset by the starting board number so a segment generated for
// board 63 onward cannot replay the one that starts at board 1.
const SEED = (BASE_SEED + STARTNUM * 7919) | 0;
const CAP = +(args.cap || 40000);          // climb-time solve cap; rejects are cheap
const COMP_CAP = +(args.compcap || 120000); // largest component we will enumerate
const MINDIST = +(args.mindist || 3);       // minimum skeleton distance inside the segment
// THE SEARCH BUDGET IS COUNTED IN WORK UNITS, NOT SECONDS, and that is what
// makes a rerun byte-identical. A wall-clock budget makes the output depend on
// how fast the box is that day: the same seed on a slower machine gives up on a
// different candidate and banks a different board. One unit is one par
// evaluation, or 200 states of a component enumeration.
const BUDGET = +(args.budget || 360000);    // work units per board, split across the block counts tried

// ─── rng ────────────────────────────────────────────────────────────────────
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
const ri = (n) => Math.floor(rng() * n);
const shuffled = (a) => { const o = a.slice(); for (let i = o.length - 1; i > 0; i--) { const j = ri(i + 1); [o[i], o[j]] = [o[j], o[i]]; } return o; };

// ─── dates ──────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const DAYMS = 86400000;
const ymd = (d) => d.toISOString().slice(0, 10);
const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };

// ─── the frozen bank: signatures, skeletons, and the ramp floor ─────────────
const usedSig = new Set();      // verifier's POOL_CEILING = 1, over the union
const usedSkel = new Set();
const frozenPar = new Map();    // live -> par, for the mid-week ramp floor
if (args.avoid) {
  for (const file of String(args.avoid).split(',')) {
    const mod = await import(`file://${fs.realpathSync(file)}`);
    if (!mod.PUZZLES) throw new Error(`--avoid file ${file} exports no PUZZLES`);
    for (const p of mod.PUZZLES) {
      usedSig.add(signature(p.pieces));
      usedSkel.add(skeleton(p.pieces));
      frozenPar.set(p.live, p.par);
    }
  }
  process.stderr.write(`avoid: ${usedSig.size} frozen signatures, ${usedSkel.size} skeletons\n`);
}

// A board's LANE SET: non-red blocks as length/axis/lane, positions dropped.
// This is what actually fixes the puzzle's whole state graph.
function skeleton(pieces) {
  return laneList(pieces).join('|');
}
function laneList(pieces) {
  return pieces.slice(1)
    .map((b) => (Array.isArray(b) ? b : [b.len, b.horiz ? 1 : 0, b.fixed, b.pos]))
    .map((b) => `${b[0]}.${b[1]}.${b[2]}`)
    .sort();
}
// Multiset distance between two lane lists: how many entries would have to
// change to turn one into the other.
function laneDist(a, b) {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) || 0) + 1);
  let shared = 0;
  for (const x of b) { const c = m.get(x) || 0; if (c > 0) { shared++; m.set(x, c - 1); } }
  return Math.max(a.length, b.length) - shared;
}

// ─── board construction and perturbation (all legality through jam-core) ────
function seedBoard(K) {
  for (let attempt = 0; attempt < 4000; attempt++) {
    const ps = [{ len: 2, horiz: true, fixed: EXIT_ROW, pos: ri(N - 2) }];
    for (let t = 0; t < 800 && ps.length < K; t++) {
      const len = rng() < 0.83 ? 2 : 3;
      const cand = { len, horiz: rng() < 0.5, fixed: ri(N), pos: ri(N - len + 1) };
      if (grid([...ps, cand], N)) ps.push(cand);
    }
    if (ps.length === K && !solved(ps, N)) return ps;
  }
  return null;
}

// Perturbations NEVER change the block count: the bank wants a controlled mix
// of 12/13/14-block boards, and a climb that quietly grows a board defeats that.
function perturb(ps) {
  const m = rng();
  if (m < 0.45) {                                    // relocate one non-red block
    const i = 1 + ri(ps.length - 1);
    const keep = ps.filter((_, j) => j !== i).map((p) => ({ ...p }));
    for (let t = 0; t < 80; t++) {
      const len = rng() < 0.83 ? 2 : 3;
      const cand = { len, horiz: rng() < 0.5, fixed: ri(N), pos: ri(N - len + 1) };
      if (grid([...keep, cand], N)) return [...keep, cand];
    }
    return ps;
  }
  if (m < 0.85) {                                    // slide one non-red block
    const o = ps.map((p) => ({ ...p }));
    const i = 1 + ri(o.length - 1);
    o[i].pos = ri(N - o[i].len + 1);
    return grid(o, N) ? o : ps;
  }
  const o = ps.map((p) => ({ ...p }));               // move the red block itself
  o[0].pos = ri(N - 2);
  return grid(o, N) && !solved(o, N) ? o : ps;
}

const parOf = (ps) => {
  if (!grid(ps, N) || solved(ps, N)) return -1;
  const r = solve(ps, N, CAP);
  return r.capped ? -1 : r.min;
};

// ─── the reverse BFS: one lane set, every par at once ───────────────────────
// Enumerate the connected component of `start` through jam-core's own moves(),
// then breadth-first search BACKWARDS from every solved state in it. Slides are
// reversible, so distance-to-nearest-solved-state IS the exact minimum, and it
// is computed for every state in the component in a single pass.
function component(start) {
  const states = [start];
  const idx = new Map([[key(start), 0]]);
  const adj = [];
  for (let i = 0; i < states.length; i++) {
    if (states.length > COMP_CAP) return null;
    const ps = states[i];
    const nb = [];
    for (const mv of moves(ps, N)) {
      const np = apply(ps, mv);
      const k = key(np);
      let j = idx.get(k);
      if (j === undefined) { j = states.length; idx.set(k, j); states.push(np); }
      nb.push(j);
    }
    adj.push(nb);
  }
  const dist = new Int32Array(states.length).fill(-1);
  let frontier = [];
  for (let i = 0; i < states.length; i++) if (solved(states[i], N)) { dist[i] = 0; frontier.push(i); }
  if (!frontier.length) return null;                 // no solved state: unsolvable lane set
  let d = 0;
  while (frontier.length) {
    d++;
    const next = [];
    for (const i of frontier) for (const j of adj[i]) if (dist[j] === -1) { dist[j] = d; next.push(j); }
    frontier = next;
  }
  let max = 0;
  for (const x of dist) if (x > max) max = x;
  return { states, dist, max };
}

// ─── the independent grid-string solver (the puzzles.js header's second opinion) ──
// Deliberately knows nothing about {len,horiz,fixed,pos}: it takes a 36-char
// occupancy string, recovers each block from the cells its letter occupies, and
// slides letters around the string. If this and jam-core ever disagree, do not
// ship the board.
function toGridString(pieces) {
  const g = new Array(N * N).fill('.');
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  pieces.forEach(([len, horiz, fixed, pos], i) => {
    for (let k = 0; k < len; k++) {
      const r = horiz ? fixed : pos + k;
      const c = horiz ? pos + k : fixed;
      g[r * N + c] = A[i];
    }
  });
  return g.join('');
}
function parkerParByGrid(startStr, cap = 400000) {
  const isSolved = (s) => s[EXIT_ROW * N + (N - 2)] === 'A' && s[EXIT_ROW * N + (N - 1)] === 'A';
  if (isSolved(startStr)) return 0;
  const seen = new Set([startStr]);
  let frontier = [startStr];
  let depth = 0;
  while (frontier.length) {
    depth++;
    const next = [];
    for (const s of frontier) {
      const where = new Map();
      for (let i = 0; i < s.length; i++) if (s[i] !== '.') (where.get(s[i]) || where.set(s[i], []).get(s[i])).push(i);
      for (const [ch, cells] of where) {
        const horizontal = cells.length > 1 && cells[1] - cells[0] === 1;
        const step = horizontal ? 1 : N;
        for (const dir of [-1, 1]) {
          const arr = s.split('');
          const own = cells.slice();
          for (let d = 1; d < N; d++) {
            const head = dir < 0 ? own[0] - step : own[own.length - 1] + step;
            if (head < 0 || head >= N * N) break;
            if (horizontal && Math.floor(head / N) !== Math.floor(own[0] / N)) break;
            if (arr[head] !== '.') break;
            const tail = dir < 0 ? own[own.length - 1] : own[0];
            arr[head] = ch; arr[tail] = '.';
            if (dir < 0) { own.unshift(head); own.pop(); } else { own.push(head); own.shift(); }
            const t = arr.join('');
            if (seen.has(t)) continue;
            if (isSolved(t)) return depth;
            seen.add(t);
            if (seen.size > cap) throw new Error('grid-string solver blew its cap');
            next.push(t);
          }
        }
      }
    }
    frontier = next;
  }
  return -1;
}

// ─── the par plan: rungs, strict weekly ramp, least-used-first ──────────────
const RUNG = { 1: [11, 14], 2: [11, 14], 3: [11, 14], 4: [16, 20], 5: [16, 20], 6: [16, 20], 0: [32, 38] };
function triples(lo, hi) {
  const out = [];
  for (let a = lo; a <= hi; a++) for (let b = a + 1; b <= hi; b++) for (let c = b + 1; c <= hi; c++) out.push([a, b, c]);
  return out;
}
const LOW_TRIPLES = triples(11, 14);   // 4 of them
const HIGH_TRIPLES = triples(16, 20);  // 10 of them
const lowUse = new Map(LOW_TRIPLES.map((t) => [t.join(','), 0]));
const highUse = new Map(HIGH_TRIPLES.map((t) => [t.join(','), 0]));
const sunUse = new Map([32, 33, 34, 35, 36, 37, 38].map((v) => [v, 0]));

function leastUsed(list, use, ok) {
  const cand = shuffled(list).filter(ok === undefined ? () => true : ok);
  if (!cand.length) return null;
  cand.sort((a, b) => (use.get(Array.isArray(a) ? a.join(',') : a) || 0) - (use.get(Array.isArray(b) ? b.join(',') : b) || 0));
  const pick = cand[0];
  const k = Array.isArray(pick) ? pick.join(',') : pick;
  use.set(k, (use.get(k) || 0) + 1);
  return pick;
}

// Walk the run week by week (weeks anchored on Monday) so Mon->Sat always
// climbs strictly. The FIRST week may start mid-week, in which case the first
// day still has to clear the frozen previous day's par -- that is what the
// `floorFor` lookup into the frozen bank is for.
function buildPlan(from, days) {
  const plan = new Map();
  const first = parseYmd(from);
  const lastDate = new Date(first.getTime() + (days - 1) * DAYMS);
  // Monday on or before the first day (Sunday belongs to no Mon-Sat run).
  let cur = new Date(first.getTime());
  while (cur.getUTCDay() !== 1) cur = new Date(cur.getTime() - DAYMS);
  for (; cur <= lastDate; cur = new Date(cur.getTime() + 7 * DAYMS)) {
    const dayOf = (k) => new Date(cur.getTime() + k * DAYMS);
    // Which of Mon..Sat of this week are actually inside the run?
    const inRun = (d) => d >= first && d <= lastDate;
    // Ramp floors coming from boards that already exist (frozen) just before
    // the run starts.
    const floorAt = (k) => {
      const prev = ymd(new Date(cur.getTime() + (k - 1) * DAYMS));
      return frozenPar.has(prev) ? frozenPar.get(prev) + 1 : 0;
    };
    const lowOk = (t) => [0, 1, 2].every((k) => !inRun(dayOf(k)) || t[k] >= floorAt(k))
      && [0, 1, 2].some((k) => inRun(dayOf(k)));
    const highOk = (t) => [3, 4, 5].every((k) => !inRun(dayOf(k)) || t[k - 3] >= floorAt(k))
      && [3, 4, 5].some((k) => inRun(dayOf(k)));
    const low = leastUsed(LOW_TRIPLES, lowUse, lowOk);
    const high = leastUsed(HIGH_TRIPLES, highUse, highOk);
    for (let k = 0; k < 6; k++) {
      const d = dayOf(k);
      if (!inRun(d)) continue;
      plan.set(ymd(d), k < 3 ? low[k] : high[k - 3]);
    }
    const sun = dayOf(6);
    if (inRun(sun)) plan.set(ymd(sun), leastUsed([32, 33, 34, 35, 36, 37, 38], sunUse));
  }
  return plan;
}

// ─── per-board search ───────────────────────────────────────────────────────
// Climb (perturbing the lane set) until the board's own par clears a floor,
// then enumerate that lane set's component and take a state at EXACTLY the
// target depth. `need` is the target par; the climb floor is min(need, 30),
// because a component that climbs to 30 usually has a maximum in the high
// thirties and the direct climb to 38 is far slower than the reverse BFS.
const CLIMB_FLOOR_CAP = 30;
const skelMax = new Map();   // lane set -> deepest component max already measured

function findBoard(target, K, accept, budget) {
  let pool = [];
  let rounds = 0;
  let evals = 0, comps = 0;
  let left = budget;
  while (left > 0) {
    if (++rounds % 12 === 0) pool = [];
    let cur = (pool.length && rng() < 0.7) ? perturb(pool[ri(pool.length)].ps) : seedBoard(K);
    if (!cur) continue;
    let cp = parOf(cur);
    if (cp < 0) continue;
    let floor = Math.min(target, CLIMB_FLOOR_CAP);
    let best = null, bp = -1;
    for (let it = 0; it < 1200 && left > 0; it++) {
      if (cp >= floor) {
        const sk = skeleton(toData(cur));
        if (!usedSkel.has(sk) && (skelMax.get(sk) ?? 99) >= target) {
          const r = component(cur);
          comps++;
          left -= (r ? r.states.length : COMP_CAP) / 200;
          if (r) {
            skelMax.set(sk, r.max);
            if (r.max >= target) {
              const picks = [];
              for (let i = 0; i < r.states.length; i++) if (r.dist[i] === target) picks.push(i);
              for (const i of shuffled(picks).slice(0, 40)) {
                const got = accept(r.states[i], target);
                if (got) return { board: got, evals, comps };
              }
            }
          } else {
            skelMax.set(sk, -1);
          }
        }
        floor = cp + 1;                 // this lane set is spent; climb past it
      }
      if (cp > bp) { bp = cp; best = cur.map((p) => ({ ...p })); }
      const cand = perturb(cur);
      const p = parOf(cand);
      evals++; left--;
      if (p < 0) continue;
      if (p >= cp) { cur = cand; cp = p; }
    }
    if (best && bp > 0) { pool.push({ ps: best, par: bp }); pool.sort((a, b) => b.par - a.par); pool = pool.slice(0, 5); }
  }
  return { board: null, evals, comps };
}

// ─── variety ledgers ────────────────────────────────────────────────────────
const CEIL = {
  par: 9,
  sundayPar: 2,
  blocks: Math.ceil(DAYS * 0.40),
  opening: 4,
  redStart: Math.ceil(DAYS * 0.40),
};
const tally = { par: new Map(), sundayPar: new Map(), blocks: new Map(), opening: new Map(), redStart: new Map() };
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
const count = (m, k) => m.get(k) || 0;
const segLanes = [];   // lane lists of the boards this run has banked

// The optimal OPENING MOVE, keyed by geometry so the block's index in the array
// (which the shuffle below scrambles) cannot leak into the ledger.
function openingKey(pieces, r) {
  if (!r.next) return null;
  const [bi, d] = r.next;
  const b = pieces[bi];
  return `${b[0]}${b[1] ? 'H' : 'V'}@${b[2]}:${b[3]}->${b[3] + d}`;
}

// ─── run ────────────────────────────────────────────────────────────────────
const plan = buildPlan(FROM, DAYS);
// The par histogram is decided before a single board is searched for, so the
// pool ceilings on par can be ASSERTED here rather than enforced one board at a
// time -- a ceiling checked at board-choosing time can only ever deadlock a day.
function validatePlan() {
  const all = new Map(), sun = new Map();
  for (const [live, par] of plan) {
    bump(all, par);
    if (new Date(`${live}T12:00:00Z`).getUTCDay() === 0) bump(sun, par);
  }
  for (const [v, c] of all) if (c > CEIL.par) throw new Error(`plan puts par ${v} on ${c} boards, over the ${CEIL.par} ceiling`);
  for (const [v, c] of sun) if (c > CEIL.sundayPar) throw new Error(`plan puts Sunday par ${v} on ${c} boards, over the ${CEIL.sundayPar} ceiling`);
  process.stderr.write(`plan: ${plan.size} days, pars ${[...all.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}x${v}`).join(' ')}\n`);
}
validatePlan();
const out = [];
function emit() {
  const rows = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    par: ${p.par},
    pieces: [${p.pieces.map((b) => `[${b.join(',')}]`).join(',')}],
  },`).join('\n');
  if (OUT) fs.writeFileSync(OUT, `export const PUZZLES = [\n${rows}\n];\n`);
  return rows;
}

// Block counts: the frozen bank runs 12/13/14 almost evenly, so the segment
// does too. Shuffled per run rather than cycled, so the pattern is not a tell.
const blockPlan = shuffled(Array.from({ length: DAYS }, (_, i) => 12 + (i % 3)));

let cursor = parseYmd(FROM);
const t0 = Date.now();
for (let i = 0; i < DAYS; i++) {
  const d = cursor;
  const live = ymd(d);
  const dow = d.getUTCDay();
  const target = plan.get(live);
  const [lo, hi] = RUNG[dow];
  if (target === undefined || target < lo || target > hi) {
    process.stderr.write(`\nFAILED: no legal par planned for ${live} (rung [${lo},${hi}])\n`);
    emit(); process.exit(1);
  }

  // The accept() closure is where every pool-variety ceiling is enforced, at
  // the moment the board is chosen. A board rejected here costs one solve; a
  // board discovered to be a clone after the fact costs a whole rerun.
  const accept = (ps, par) => {
    const raw = toData(ps);
    const pieces = [raw[0], ...shuffled(raw.slice(1))];
    const sig = signature(pieces);
    if (usedSig.has(sig)) return null;
    const sk = skeleton(pieces);
    if (usedSkel.has(sk)) return null;
    const lanes = laneList(pieces);
    for (const prev of segLanes) if (laneDist(lanes, prev) < MINDIST) return null;
    if (count(tally.blocks, pieces.length) >= CEIL.blocks) return null;
    if (count(tally.redStart, pieces[0][3]) >= CEIL.redStart) return null;

    // Three searches must agree before anything is banked. The par ceilings are
    // not tested here: buildPlan() already fixed the whole run's par histogram
    // and validatePlan() asserted it, so a ceiling test at this point could only
    // deadlock a day whose par was never in doubt.
    const forward = solve(fromData(pieces), N);
    if (forward.capped || forward.min !== par) return null;
    const ok = openingKey(pieces, forward);
    if (!ok || count(tally.opening, ok) >= CEIL.opening) return null;
    const byGrid = parkerParByGrid(toGridString(pieces));
    if (byGrid !== par) {
      process.stderr.write(`\nFAILED: grid-string solver says ${byGrid}, jam-core says ${par} on ${live}\n`);
      emit(); process.exit(1);
    }
    return { pieces, par, sig, sk, lanes, opening: ok };
  };

  // Try the planned block count first, then the others, before widening time.
  let got = null;
  const ks = [blockPlan[i], ...[12, 13, 14].filter((k) => k !== blockPlan[i])];
  for (const K of ks) {
    if (count(tally.blocks, K) >= CEIL.blocks) continue;
    const r = findBoard(target, K, accept, Math.floor(BUDGET / ks.length));
    if (r.board) { got = r.board; break; }
  }
  if (!got) {
    process.stderr.write(`\nFAILED to find a board for ${live} at par ${target} -- ${out.length} boards kept, bank stops at ${out.length ? out.at(-1).live : 'nothing new'}\n`);
    emit(); process.exit(1);
  }

  usedSig.add(got.sig);
  usedSkel.add(got.sk);
  segLanes.push(got.lanes);
  bump(tally.par, got.par);
  if (dow === 0) bump(tally.sundayPar, got.par);
  bump(tally.blocks, got.pieces.length);
  bump(tally.redStart, got.pieces[0][3]);
  bump(tally.opening, got.opening);

  out.push({
    num: STARTNUM + i,
    quizId: `park-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
    live,
    dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    sunday: dow === 0,
    par: got.par,
    pieces: got.pieces,
  });
  emit();
  process.stderr.write(`${i + 1}/${DAYS}  ${live} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]}  perfect ${got.par}  blocks ${got.pieces.length}  open ${got.opening}  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed\n`);
  cursor = new Date(cursor.getTime() + DAYMS);
}

const rows = emit();
process.stderr.write(`\nvariety: pars ${[...tally.par.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}x${v}`).join(' ')}\n`);
process.stderr.write(`variety: blocks ${[...tally.blocks.entries()].sort().map(([k, v]) => `${k}x${v}`).join(' ')}  red-start ${[...tally.redStart.entries()].sort().map(([k, v]) => `${k}x${v}`).join(' ')}\n`);
process.stderr.write(`variety: ${tally.opening.size} distinct opening moves, worst ${Math.max(...tally.opening.values())}x (ceiling ${CEIL.opening})\n`);
if (OUT) process.stderr.write(`wrote ${out.length} boards to ${OUT}\n`);
else process.stdout.write(rows + '\n');
