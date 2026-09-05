// The sliding-block bank generator, for Parker (6x6), Impound (7x7) and
// Junkyard (8x8).
//
// AT 8x8 A RANDOM PACKING IS A BAD GUIDE TO WHAT THE CLIMB CAN REACH, and the
// difference is worth knowing before anyone re-measures this. Sampled at
// random, 8x8 boards SPRAWL: over half exhaust a 40,000-state cap and half of
// those are still unresolved at six million, twelve seconds apiece, because an
// unsolvable board has to exhaust its whole reachable component. That is what
// "8x8 is out of reach" meant when it was measured on random boards. The climb
// does not go there: it walks toward tightly jammed boards, which are deep AND
// narrow, so only 4% of the candidates it actually evaluates hit the cap, and
// it reaches par 54 in the same wall clock that gets 7x7 to 38.
//
// There was no committed generator for this family at all: Parker's 62 boards
// were authored by hand, which is why Parker sits on the 2026-09-29 cliff with
// no way to extend it. This script is the generator both games needed, and it
// takes the board size as an argument precisely so ONE search serves both.
//
//   node scripts/gen-jam.mjs --n=7 --exit=3 --from=2026-09-05 --days=120 \
//     --startnum=1 --prefix=impound --game=Impound --out=/tmp/impound-bank.js
//
// HOW A BOARD IS FOUND. Random packings are overwhelmingly either trivial or
// unsolvable: measured over 400 random 7x7 boards at Parker's density, 55% had
// no solution at all and the median solvable one was a 3-move board. So a board
// is not sampled, it is CLIMBED. Seed a legal packing, then repeatedly perturb
// it (slide a block, relocate a block, add a block) and keep the perturbation
// whenever it does not lower the exact minimum. Par rises quickly, and the climb
// stops the moment it lands inside the requested window rather than continuing
// to the hardest board it can reach, because the bank wants a RAMP and not a
// pile of maximums.
//
// EVERY PAR IS THE EXACT MINIMUM, from lib/jam-core's breadth-first search, the
// same function the live hint and both verifiers call. Nothing here estimates.
//
// THREE THINGS THIS INHERITED FROM THE 2026-09 RESTOCK, and they are the reason
// the flags look the way they do:
//
//   --avoid   A bank-wide variety rule means the extension must know the frozen
//             boards. Point --avoid at an existing puzzles.js and every
//             signature already in it is off the table, so a segment generated
//             today cannot collide with one banked in July. Without this a
//             generator produces a legal-looking run that fails the verifier on
//             the union, which is exactly how queen ended up unable to extend.
//   --startnum / --from
//             The generator NEVER renumbers or rewrites existing boards. It
//             emits only new ones, numbered from where you tell it, so the
//             frozen prefix is untouched by construction.
//   a floor is not a target
//             Each weekday gets a par WINDOW, not a par. A bank where every
//             Monday is exactly the floor passes the range check and is still a
//             failure, so the search takes the first board inside the window and
//             the windows themselves ramp across the week.
//
// Output is a complete puzzles.js body on stdout (or --out), ready to splice.

import fs from 'node:fs';
import { solve, grid, solved, fromData, toData, signature } from '../lib/jam-core.js';

const args = Object.fromEntries(
  process.argv.slice(2).filter((s) => s.startsWith('--')).map((s) => {
    const i = s.indexOf('=');
    return i === -1 ? [s.slice(2), true] : [s.slice(2, i), s.slice(i + 1)];
  })
);

const N = +(args.n || 7);
const EXIT = +(args.exit ?? Math.floor((N - 1) / 2));
const DAYS = +(args.days || 30);
const STARTNUM = +(args.startnum || 1);
const PREFIX = args.prefix || 'impound';
const GAME = args.game || 'Impound';
const FROM = String(args.from || '2026-09-05');
// THE SEARCH CAP IS DELIBERATELY LOW, and it is a feature rather than a budget.
// A perturbation that makes the board unsolvable can only be found out by
// exhausting its whole reachable component, and that is where a generator's time
// goes: at a 400,000-state cap the search managed 12 candidate boards a second
// and topped out at par 33, while at 40,000 it managed 32 a second and reached
// par 42, because the cheaper rejects bought far more exploration. The cap costs
// nothing in rigour: a board is only ACCEPTED when the breadth-first search
// actually reached the goal, so its par is the exact minimum either way, and a
// board banked under this cap is by construction one the verifier can re-solve
// in under 40,000 states.
const CAP = +(args.cap || 40000);
const SEED = +(args.seed || 20260904);
const FILL = +(args.fill || 0.74);
const OUT = args.out || null;

// The week's par windows, keyed by day of week. Mon..Sat climb in two rungs and
// Sunday runs its own track, the same shape Parker documents, pitched harder at
// every rung because a 7x7 board has room the 6x6 does not: Parker's weekdays
// run 11 to 20 and its Sundays 32 to 38, and every window below sits above the
// Parker rung it corresponds to.
//
// THE SUNDAY FLOOR WAS MEASURED DOWN TWICE, and the number is worth keeping.
// The search reaches par 42 given time, so 38 looked safe and banked two
// Sundays at 38 and 40; it then failed OUTRIGHT on a third inside a four minute
// budget, and so did 36. Deep boards exist and are simply RARE, so a floor set
// near the ceiling makes each Sunday a coin toss rather than a search. 34
// clears Parker's 32 and lands every week, and the boards that come in higher
// still come in higher: the banked Sundays run 34 to 40.
const WINDOWS = args.windows
  ? JSON.parse(args.windows)
  : {
    1: [16, 20], 2: [18, 23], 3: [20, 25],   // Mon Tue Wed
    4: [23, 28], 5: [25, 31], 6: [28, 35],   // Thu Fri Sat
    0: [34, 50],                              // Sunday Edition
  };

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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const dayMs = 86400000;
function ymd(d) { return d.toISOString().slice(0, 10); }
function parseYmd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }

// ---------------------------------------------------------------------------
// The search
// ---------------------------------------------------------------------------

function seedBoard() {
  const red = { len: 2, horiz: true, fixed: EXIT, pos: ri(N - 2) };
  const ps = [red];
  let occ = 2;
  const target = Math.round(N * N * FILL);
  for (let t = 0; t < 3000 && occ < target; t++) {
    const len = rng() < 0.72 ? 2 : 3;
    const cand = { len, horiz: rng() < 0.5, fixed: ri(N), pos: ri(N - len + 1) };
    if (!grid([...ps, cand], N)) continue;
    ps.push(cand);
    occ += len;
  }
  return ps;
}

function perturb(ps) {
  const mode = rng();
  if (mode < 0.42 && ps.length > 3) {
    // relocate one non-red block
    const i = 1 + ri(ps.length - 1);
    const keep = ps.filter((_, j) => j !== i).map((p) => ({ ...p }));
    for (let t = 0; t < 60; t++) {
      const len = rng() < 0.72 ? 2 : 3;
      const cand = { len, horiz: rng() < 0.5, fixed: ri(N), pos: ri(N - len + 1) };
      if (grid([...keep, cand], N)) return [...keep, cand];
    }
    return keep;
  }
  if (mode < 0.74) {
    // slide one non-red block along its own axis
    const out = ps.map((p) => ({ ...p }));
    if (out.length < 2) return out;
    const i = 1 + ri(out.length - 1);
    out[i].pos = ri(N - out[i].len + 1);
    return grid(out, N) ? out : ps;
  }
  if (mode < 0.86) {
    // move the red block itself, which changes the whole character of the jam
    const out = ps.map((p) => ({ ...p }));
    out[0].pos = ri(N - 2);
    return grid(out, N) && !solved(out, N) ? out : ps;
  }
  // add a block
  const out = ps.map((p) => ({ ...p }));
  for (let t = 0; t < 60; t++) {
    const len = rng() < 0.72 ? 2 : 3;
    const cand = { len, horiz: rng() < 0.5, fixed: ri(N), pos: ri(N - len + 1) };
    if (grid([...out, cand], N)) return [...out, cand];
  }
  return out;
}

function parOf(ps) {
  if (!grid(ps, N) || solved(ps, N)) return -1;
  const r = solve(ps, N, CAP);
  return r.capped ? -1 : r.min;
}

// Climb until the exact minimum lands inside [lo, hi]. Returns the board, or
// null if this restart never got there inside its iteration budget, and reports
// the best it reached so the caller can carry it forward.
function climbInto(lo, hi, iters, used, seed) {
  let cur = seed ? perturb(seed) : seedBoard();
  let curPar = parOf(cur);
  if (curPar < 0) { cur = seedBoard(); curPar = parOf(cur); }
  let best = null, bestPar = -1;
  for (let it = 0; it < iters; it++) {
    if (curPar >= lo && curPar <= hi && !used.has(signature(toData(cur)))) return { got: { ps: cur, par: curPar } };
    if (curPar > bestPar && curPar < lo) { bestPar = curPar; best = cur; }
    const cand = perturb(cur);
    const p = parOf(cand);
    if (p < 0) continue;
    // Below the window, climb. Above it, come back down. Equal is accepted so the
    // walk can cross a plateau instead of stalling on one.
    const better = curPar < lo ? p >= curPar : (curPar > hi ? p <= curPar : p >= lo && p <= hi);
    if (better) { cur = cand; curPar = p; }
  }
  if (curPar >= lo && curPar <= hi && !used.has(signature(toData(cur)))) return { got: { ps: cur, par: curPar } };
  return { best, bestPar };
}

// Restart the climb until one lands in the window. Bounded by wall clock rather
// than restart count, so a window nobody can reach reports that in a couple of
// minutes instead of spinning until someone notices.
//
// EACH RESTART SEEDS FROM THE BEST BOARD ANY RESTART HAS REACHED, and that is
// what makes the deep windows findable at all. A Sunday board wants a perfect
// line in the high thirties, which is a long way up from the par 2 or 3 a random
// packing lands on, so independent restarts each spend their whole budget
// re-climbing ground the last one had already covered. Carrying the best board
// forward turns a row of weak independent climbs into one long one: the first
// attempt at this generator, restarting from scratch every time, failed to find
// a single Sunday in [38,52] inside four minutes and reported the window as
// unreachable when it plainly was not.
function findBoard(lo, hi, used, budgetMs = 420000) {
  const until = Date.now() + budgetMs;
  // A POOL of good boards, not a single best one, and it is emptied now and
  // then. Carrying only the single best board is better than restarting cold,
  // but it is also the way to get stuck: once the pool is one board whose whole
  // neighbourhood is worse than it is, every restart re-seeds from that board
  // and re-explores the same dead end until the budget runs out. That is not
  // hypothetical, it is what made one worker fail the SAME Sunday twice at two
  // different floors while another worker banked three Sundays without trouble.
  // Several seeds keep more than one basin alive, and the reset guarantees the
  // search can always walk away from all of them.
  let pool = [];
  let rounds = 0;
  while (Date.now() < until) {
    if (++rounds % 12 === 0) pool = [];
    const seed = (pool.length && rng() < 0.7) ? pool[ri(pool.length)].ps : null;
    const r = climbInto(lo, hi, 700, used, seed);
    if (r.got) return r.got;
    if (r.best && r.bestPar > 0) {
      pool.push({ ps: r.best, par: r.bestPar });
      pool.sort((a, b) => b.par - a.par);
      pool = pool.slice(0, 5);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bank the days
// ---------------------------------------------------------------------------

const used = new Set();
if (args.avoid) {
  for (const file of String(args.avoid).split(',')) {
    const mod = await import(`file://${fs.realpathSync(file)}`);
    if (!mod.PUZZLES) throw new Error(`--avoid file ${file} exports no PUZZLES`);
    for (const p of mod.PUZZLES) used.add(signature(p.pieces));
  }
  process.stderr.write(`avoid: ${used.size} frozen signatures\n`);
}

// The bank is written after EVERY board, not once at the end. Finding a deep
// board takes minutes, so a run that dies on day 60 and prints nothing has
// thrown away half an hour of search for no reason; the first version of this
// script did exactly that on its first failed Sunday.
const out = [];
function emit() {
  const body = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    par: ${p.par},
    pieces: [${p.pieces.map((b) => `[${b.join(',')}]`).join(',')}],
  },`).join('\n');
  if (OUT) fs.writeFileSync(OUT, body + '\n');
  return body;
}

let cursor = parseYmd(FROM);
const t0 = Date.now();
// THE WITHIN-WEEK RAMP IS A FLOOR ON THE NEXT DAY, not a property to check
// afterwards. The rung bands OVERLAP on purpose (Friday is 25-31 and Saturday
// 28-35), so picking each day independently inside its own band produces a
// perfectly legal Friday of 31 followed by a perfectly legal Saturday of 28,
// and the week runs backwards. The first bank generated this way broke the ramp
// on four weeks out of twenty-one. So Tuesday to Saturday carry the previous
// weekday's par as their floor, and Sunday runs its own track and clears it.
let weekFloor = 0;
for (let i = 0; i < DAYS; i++) {
  const dow = cursor.getUTCDay();
  const [wlo, hi] = WINDOWS[dow];
  if (dow === 1 || dow === 0) weekFloor = 0;          // Monday opens a week, Sunday is its own track
  const lo = Math.max(wlo, weekFloor);
  if (lo > hi) {
    process.stderr.write(`\nFAILED: ${ymd(cursor)} needs par >= ${lo} to keep the week's ramp, above its band ceiling ${hi}\n`);
    emit();
    process.exit(1);
  }
  const got = findBoard(lo, hi, used);
  if (!got) {
    process.stderr.write(`\nFAILED to find a board for ${ymd(cursor)} in [${lo},${hi}] -- ${out.length} boards kept\n`);
    emit();
    process.exit(1);
  }
  used.add(signature(toData(got.ps)));
  const d = cursor;
  const num = STARTNUM + i;
  out.push({
    num,
    quizId: `${PREFIX}-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
    live: ymd(d),
    dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    sunday: dow === 0,
    par: got.par,
    pieces: toData(got.ps),
  });
  if (dow !== 0) weekFloor = got.par;
  emit();
  const el = ((Date.now() - t0) / 1000).toFixed(0);
  process.stderr.write(`${i + 1}/${DAYS}  ${ymd(d)} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow]}  perfect ${got.par}  blocks ${got.ps.length}  ${el}s\n`);
  cursor = new Date(cursor.getTime() + dayMs);
}

const body = emit();
if (OUT) process.stderr.write(`wrote ${out.length} boards to ${OUT}\n`);
else process.stdout.write(body + '\n');
