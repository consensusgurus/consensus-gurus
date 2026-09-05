// Bank generator for Check, the daily checkers shot (app/check/puzzles.js).
//
// WHAT IT BUILDS. One board per day. Red to move, no capture on the board, and
// exactly ONE first move sweeps every black piece off in `clearIn` moves against
// black's stiffest defence -- and that move is a SACRIFICE: it is the move that
// hands black a capture, and because captures are compulsory in English
// draughts, handing black a capture is how you choose black's reply for it.
// That is the whole game. A position that verifies but whose key is not a
// sacrifice is not a Check board, so this generator refuses it.
//
// HOW TO RUN. The house extension shape, new boards only, spliced by
// scripts/_append.mjs so nothing already banked is ever rewritten:
//
//   node scripts/_append.mjs check gen-check.mjs 2026-11-30
//
// or directly:
//
//   node scripts/gen-check.mjs --from 2026-09-30 --days 62 --startnum 63 \
//     --avoid app/check/puzzles.js --seed 20260930 --out /tmp/check-new.js
//   node scripts/gen-check.mjs --probe          yield/shape survey, writes nothing
//
// Positions are SAMPLED, never hand-placed: a small piece configuration is
// scattered on the dark squares and then put through the filters below. Nothing
// about the sacrifice is constructed, so the geometry that comes out is whatever
// the rules actually allow rather than one motif repainted sixty times.
//
// WHAT EVERY EMITTED BOARD GUARANTEES
//
//   1. Structure. 64 digits, every piece on a dark square, red men off row 0 and
//      black men off row 7 (a man that reached its crowning row would already be
//      a king, so such a board could never occur in a real game).
//   2. Red has at least MIN_ROOT_MOVES legal moves and NOT ONE of them is a
//      capture, so the key is a free choice among several quiet slides rather
//      than a jump the rules would have forced anyway.
//   3. Black has at least one legal move at the start and NOT ONE of them is a
//      capture. This is stricter than scripts/verify-check.mjs, deliberately.
//      The verifier only asks that black must capture AFTER the key; that is
//      satisfied by a board where black could already capture something before
//      red moved at all, and then red has not given anything away -- black was
//      always going to jump. Requiring black to have no jump BEFORE the key is
//      what makes the key itself the thing that gives a piece away. 36 of the 62
//      legacy boards do not clear this bar; every board this generator emits
//      does.
//   4. At least MIN_SAC_MOVES of red's legal moves force black to capture. If
//      only one move offered a piece, the puzzle would be "find the one giveaway"
//      and could be solved without reading a single line. The question on these
//      boards is always WHICH sacrifice, not whether. (61 of the 62 legacy boards
//      clear this bar, so it is the game's own standard, written down.)
//   5. Exactly one first move clears within `clearIn`, its clear distance is
//      EXACTLY `clearIn` (never fewer), and it is one of the sacrifices.
//   6. Black has exactly ONE legal answer to the key. CheckClient.jsx's end card
//      claims it outright -- "offering a piece is how you choose black's reply
//      FOR them", "black never had a say" -- and a key that leaves black two
//      compulsory captures to choose between is still a sacrifice but no longer
//      that sentence. Costs about 8% of otherwise-valid boards. Note the claim is
//      enforced at the KEY only, which is where the end card makes it; deeper in
//      the sweep black can still have a choice between equal captures, which is
//      what blackReply()'s tie-break in draughts.js exists to settle.
//   7. Solved twice and agreed twice. Once by the shipping engine
//      (app/check/draughts.js, dense Int8Array + memo table) and once by the
//      independent search in this file: a different data structure (a Map from
//      "row,col" to a piece letter), its own move generator, and NO memo table.
//      Both must return the same winner set, the same key path and the same true
//      minimum, at the tight budget AND again at the verifier's clearIn+2
//      budget. The puzzles.js header promises this double solve; verify-check.mjs
//      does not provide it (it imports draughts.js), so it lives here.
//
// THE RAMP. clearIn is 3 on weekdays and 4 on Sundays, which verify-check.mjs
// enforces exactly, so there is no band to vary there. The Sunday Edition scales
// on the other axis instead: weekdays carry 2-4 black pieces, Sundays 3-5, and
// the Sunday rotation is weighted upward. Red carries 2-5 pieces on any day.
//
// POOL VARIETY, and the ceilings, because a floor is not a target and per-board
// legality passes happily on a bank that says the same thing every day. Sacrifice
// shots really do cluster -- an unconstrained run comes back stuffed with
// king-heavy boards, because those are simply the easiest positions in which a
// single quiet slide is the only giveaway that works. Ceilings, all counted over
// the NEW segment unless stated:
//
//   KEY_CEILING_SEG   2   an exact key square-path ("30.21") may repeat at most
//                         twice in the new segment, and at most KEY_CEILING_ALL
//   KEY_CEILING_ALL   3   times across the COMBINED bank, which is the scope
//                         verify-check.mjs checks it at.
//   SHAPE_CEILING     4   a starting shape ("2m1k v 3m0k": red men/kings versus
//                         black men/kings) may repeat at most 4 times.
//   DIR_CEILING     30%   of the segment per key direction (up-left, up-right,
//                         down-left, down-right). Only a king can key downward,
//                         so this is also a floor on how many boards turn on a
//                         king move. A per-day preferred direction rotates so the
//                         spread comes out even instead of being clipped at the
//                         end of the run.
//   BLK_CEILING     45%   of the segment per black-piece count, on top of the
//                         per-day rotation that already spreads 2/3/4 (weekday)
//                         and 3/4/5 (Sunday).
//   RED_CEILING     45%   of the segment per red-piece count.
//   MEN_CEILING     40%   of the segment per red-MAN count, which is the axis
//                         that clusters hardest and the one a player actually
//                         SEES. Left alone the search returns an all-king red
//                         army on 55% of days (against 19% of the legacy bank),
//                         because a king offers itself four ways and a man only
//                         two, so king-heavy positions are simply where the
//                         sacrifices are. A per-day mix rotation (none / some /
//                         all) drives the split from the front; the ceiling is
//                         the backstop.
//   cells                 never repeat, across the combined bank (the verifier
//                         fails on identical boards).
//
// clearIn itself is counted and printed in the summary even though it cannot
// vary: if the weekday/Sunday split ever stops being 53/9-shaped, something is
// wrong with the calendar, not with the search.
//
// DETERMINISM. One xorshift stream, seeded from --seed MIXED WITH --startnum, so
// re-running an unchanged command reproduces the file byte for byte and a new
// segment can never replay the frozen one even if it is handed the same --seed.
// Every search budget is a COUNT OF SAMPLES, never a wall clock, for the same
// reason: a deadline makes the output depend on how busy the box was.
//
// THINGS LEARNED HERE THAT ARE EASY TO REDISCOVER THE HARD WAY
//
//   * The budget convention in draughts.js is decremented on BLACK's move, so
//      "does this red move win in clearIn?" is clearIn(child, clearIn, false) + 1,
//      passing the SAME budget, not budget - 1. draughts.js says so; it is still
//      the first thing to get wrong.
//   * Searching at budget `clearIn` and at the verifier's `clearIn + 2` gives
//      the IDENTICAL winner set. clearIn() is non-increasing in the budget, so a
//      line that clears within clearIn is found at either budget; the extra two
//      only ever change values that were already too big to win. Confirmed on all
//      62 legacy boards. That matters because the memo-free independent search
//      costs ~25x more at clearIn+2 (a Sunday board: 76ms vs 1981ms), so this
//      generator filters at the tight budget and pays for the wide one only on
//      boards it is about to keep.
//   * "The key is a sacrifice" does NOT mean black captures the piece that just
//      moved. Vacating the FROM square can open a landing square behind some
//      other red piece, and black is then forced to take that one instead. Both
//      are giveaways and both are in this bank; testing for "black takes the
//      piece red just moved" would throw away the better half of them.
//   * Yield is wildly uneven across piece counts, which is why the per-day
//      rotation carries more weight than it looks. Measured samples per accepted
//      board: 5 red against 2 black is about 1 in 540, 4 red about 1 in 1,900,
//      2 red about 1 in 45,000; a Sunday board with 5 black pieces is about 1 in
//      118,000 and does exist. Left to itself the search returns almost nothing
//      but two-black-piece, four-or-five-red-piece boards, which is exactly the
//      clustering the ceilings and the rotation are there to break up.
//   * Crowning ends the turn mid-chain (English rule), so a red man that reaches
//      row 0 stops dead there. Several apparently lovely 3-move sweeps are not
//      legal for exactly that reason, which is why the search must be the real
//      engine and not a sketch of it.
// HOW FAR THIS GOES. The search is not the wall: 62 days took about 11 minutes
// on a shared 2-core box, and the hardest single day (2 red pieces, 4 black, an
// all-men red army, a preferred direction) still resolves by falling through to
// the last phase. The wall is verify-check.mjs's combined-bank KEY_CEILING. A key
// is a single quiet step between two dark squares, and there are exactly 98 such
// paths on an 8x8 board, so the bank can never hold more than 98 x 3 = 294 boards
// however long the search runs. At 124 boards, 170 key slots are still free, but
// they are not free evenly: the paths that step off the two back rows are much
// rarer in accepted positions than the middle ones, so expect the ceiling to
// start biting well before the arithmetic says it should, and expect the last
// stretch to lean on phase C. If a future extension needs more room than that,
// raise KEY_CEILING in the verifier deliberately, in its own pass, with the
// reason written down -- do not quietly widen it here.
import { writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  deserialize, legalMoves, clearIn as engineClearIn, playable,
} from '../app/check/draughts.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);

// ── quality bars ────────────────────────────────────────────────────────────
const MIN_ROOT_MOVES = 5;   // red's free choice has to be a real choice
const MIN_SAC_MOVES = 2;    // ...and more than one of them has to offer a piece
const WEEKDAY_BLK = [2, 3, 4];
const SUNDAY_BLK = [3, 4, 5];

// ── pool ceilings ───────────────────────────────────────────────────────────
const KEY_CEILING_SEG = 2;
const KEY_CEILING_ALL = 3;  // verify-check.mjs KEY_CEILING, combined-bank scope
const SHAPE_CEILING = 4;
const DIR_FRACTION = 0.30;
const BLK_FRACTION = 0.45;
const RED_FRACTION = 0.45;
const MEN_FRACTION = 0.40;  // per red-MAN count: the axis that clusters worst

// ── per-day rotations, all keyed off num - 1 so a spliced range CONTINUES the
// live bank's cycle instead of restarting it ────────────────────────────────
const WEEK_BLK_ROT = [3, 2, 4, 3, 2, 3, 4, 2];
const SUN_BLK_ROT = [4, 3, 5, 4, 3];
const RED_TOT_ROT = [3, 4, 2, 5, 3, 4, 2, 5, 4, 3];
const DIR_ROT = ['up-left', 'down-right', 'up-right', 'down-left'];
// How red's material is split between men and kings. Without this the search
// hands back an all-king red army on 55% of days, because a king has four ways
// to offer itself and a man has two, so king-heavy positions are simply where
// the sacrifices live. 'none' = every red piece a king, 'all' = every red piece
// a man, 'some' = a genuine mix.
const MEN_ROT = ['some', 'none', 'all', 'some', 'none', 'some', 'all', 'some'];

// ── sampling budgets, in SAMPLES, never in milliseconds ─────────────────────
const TRIES_A = 500000;   // day's blk target + red target + preferred direction
const TRIES_B = 1000000;  // drop the direction preference
const TRIES_C = 2000000;  // drop the piece-count targets too, keep the band

// ════════════════════════════════════════════════════════════════════════════
// INDEPENDENT SEARCH. Deliberately not built on app/check/draughts.js: a Map
// from "row,col" strings to a piece letter instead of a dense Int8Array, its own
// move generator, and no memo table anywhere. The point is that a bug in one
// implementation cannot be a bug in the other, so keep it that way -- do not
// "tidy" this into shared helpers.
// ════════════════════════════════════════════════════════════════════════════
const RED_P = new Set(['r', 'R']);
const BLK_P = new Set(['b', 'B']);
const KING_P = new Set(['R', 'B']);
const K = (r, c) => `${r},${c}`;
const inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const D_KING = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const D_RED = [[-1, -1], [-1, 1]];
const D_BLK = [[1, -1], [1, 1]];
const dirsOf = (p) => (KING_P.has(p) ? D_KING : RED_P.has(p) ? D_RED : D_BLK);

function toMap(cells) {
  const m = new Map();
  for (let i = 0; i < 64; i++) {
    const v = cells[i];
    if (v === '0') continue;
    m.set(K(i >> 3, i & 7), v === '1' ? 'r' : v === '2' ? 'R' : v === '3' ? 'b' : 'B');
  }
  return m;
}
function splitKey(k) { const i = k.indexOf(','); return [+k.slice(0, i), +k.slice(i + 1)]; }

function iJumps(map, r, c, p, path, taken) {
  const out = [];
  const foe = RED_P.has(p) ? BLK_P : RED_P;
  const crownRow = RED_P.has(p) ? 0 : 7;
  for (const [dr, dc] of dirsOf(p)) {
    const mr = r + dr, mc = c + dc, tr = r + 2 * dr, tc = c + 2 * dc;
    if (!inb(tr, tc)) continue;
    const mid = map.get(K(mr, mc));
    if (!mid || !foe.has(mid)) continue;
    if (map.has(K(tr, tc))) continue;
    const nm = new Map(map);
    nm.delete(K(r, c));
    nm.delete(K(mr, mc));
    const crown = !KING_P.has(p) && tr === crownRow;
    const np = crown ? (RED_P.has(p) ? 'R' : 'B') : p;
    nm.set(K(tr, tc), np);
    const npath = [...path, tr * 8 + tc];
    // Crowning stops the chain dead: English rule, and the reason some pretty
    // multi-jumps are simply not available.
    const more = crown ? [] : iJumps(nm, tr, tc, np, npath, taken + 1);
    if (more.length) out.push(...more);
    else out.push({ map: nm, path: npath, taken: taken + 1, to: tr * 8 + tc });
  }
  return out;
}

function iMoves(map, red) {
  const side = red ? RED_P : BLK_P;
  const jumps = [];
  for (const [k, p] of map) {
    if (!side.has(p)) continue;
    const [r, c] = splitKey(k);
    const j = iJumps(map, r, c, p, [r * 8 + c], 0);
    if (j.length) jumps.push(...j);
  }
  if (jumps.length) return jumps;   // captures are compulsory
  const quiet = [];
  for (const [k, p] of map) {
    if (!side.has(p)) continue;
    const [r, c] = splitKey(k);
    const crownRow = RED_P.has(p) ? 0 : 7;
    for (const [dr, dc] of dirsOf(p)) {
      const tr = r + dr, tc = c + dc;
      if (!inb(tr, tc) || map.has(K(tr, tc))) continue;
      const nm = new Map(map);
      nm.delete(k);
      const crown = !KING_P.has(p) && tr === crownRow;
      nm.set(K(tr, tc), crown ? (RED_P.has(p) ? 'R' : 'B') : p);
      quiet.push({ map: nm, path: [r * 8 + c, tr * 8 + tc], taken: 0, to: tr * 8 + tc });
    }
  }
  return quiet;
}

const iBlkLeft = (m) => { let n = 0; for (const p of m.values()) if (BLK_P.has(p)) n++; return n; };

// Same contract as draughts.js clearIn(), same budget convention (decremented on
// BLACK's move, return value counts RED's moves only), computed from scratch.
function iClear(map, budget, redToMove) {
  if (iBlkLeft(map) === 0) return 0;
  if (budget <= 0) return Infinity;
  const ms = iMoves(map, redToMove);
  if (!ms.length) return Infinity;      // stuck, and black still has pieces
  if (redToMove) {
    let best = Infinity;
    for (const m of ms) {
      const v = iClear(m.map, budget, false);
      if (v !== Infinity && v + 1 < best) best = v + 1;
      if (best === 1) break;
    }
    return best;
  }
  let best = 0;
  for (const m of ms) {
    const v = iClear(m.map, budget - 1, true);
    if (v > best) best = v;
    if (best === Infinity) break;
  }
  return best;
}

// The whole board question, answered independently: winner paths, true minimum,
// and whether black must capture after the winning move.
function independentSolve(cells, want, budget) {
  const map = toMap(cells);
  const root = iMoves(map, true);
  if (!root.length) return { ok: false, why: 'red has no move' };
  if (root.some((m) => m.taken > 0)) return { ok: false, why: 'capture available at the start' };
  const scored = root.map((m) => {
    const v = iClear(m.map, budget, false);
    return { m, clear: v === Infinity ? Infinity : v + 1 };
  });
  const winners = scored.filter((s) => s.clear <= want);
  const trueMin = Math.min(...scored.map((s) => s.clear));
  let forcesCapture = null;
  if (winners.length === 1) {
    const reply = iMoves(winners[0].m.map, false);
    forcesCapture = reply.length > 0 && reply.every((m) => m.taken > 0);
  }
  return {
    ok: true,
    winners: winners.map((s) => s.m.path.join('.')),
    trueMin,
    forcesCapture,
    rootCount: root.length,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SAMPLING + the engine-side filter
// ════════════════════════════════════════════════════════════════════════════
const DARK = [];
for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (playable(r, c)) DARK.push(r * 8 + c);

let seed = 1;
const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const pick = (a) => a[(rnd() * a.length) | 0];

// Scatter a piece configuration on the dark squares. Men are kept off their own
// crowning row: a man that got there would already be a king, so a board with
// one is not reachable by any legal game and has no business in the bank.
function sample(spec) {
  const cells = new Array(64).fill('0');
  const used = new Set();
  const place = (n, code, lo, hi) => {
    for (let i = 0; i < n; i++) {
      let t = 0;
      for (;;) {
        if (++t > 300) return false;
        const sq = DARK[(rnd() * 32) | 0];
        const r = sq >> 3;
        if (r < lo || r > hi || used.has(sq)) continue;
        used.add(sq);
        cells[sq] = code;
        break;
      }
    }
    return true;
  };
  if (!place(spec.bm, '3', 0, 6)) return null;
  if (!place(spec.bk, '4', 0, 7)) return null;
  if (!place(spec.rm, '1', 1, 7)) return null;
  if (!place(spec.rk, '2', 0, 7)) return null;
  return cells.join('');
}

// How many of red's `red` pieces are men, for a given mix mode. 'some' never
// returns 0 or `red`, so the three modes really are three different pictures.
function redManCount(red, mode) {
  if (mode === 'none') return 0;
  if (mode === 'all') return red;
  if (mode === 'some') return 1 + ((rnd() * (red - 1)) | 0);
  return (rnd() * (red + 1)) | 0;
}

const dirOf = (path) => {
  const [a, b] = path.split('.').map(Number);
  return `${(b >> 3) < (a >> 3) ? 'up' : 'down'}-${(b & 7) < (a & 7) ? 'left' : 'right'}`;
};

// Everything the engine side has to say about a sampled board, or null the
// moment it fails a bar. Ordered cheapest-test-first, and the first search that
// runs is the one that rejects the most boards.
function engineCandidate(cells, want) {
  const b = deserialize(cells);

  const rootMoves = legalMoves(b, true);
  if (rootMoves.length < MIN_ROOT_MOVES) return null;
  if (rootMoves.some((m) => m.caught.length > 0)) return null;   // free choice, not a forced jump

  const blkMoves = legalMoves(b, false);
  if (!blkMoves.length) return null;
  if (blkMoves.some((m) => m.caught.length > 0)) return null;     // black cannot already be jumping

  // Which of red's moves hand black a capture. `sacs` is the candidate pool for
  // the key; anything outside it can only ever spoil uniqueness.
  const sacs = [];
  for (const m of rootMoves) {
    const reply = legalMoves(m.board, false);
    if (reply.length && reply.every((x) => x.caught.length > 0)) sacs.push({ m, reply });
  }
  if (sacs.length < MIN_SAC_MOVES) return null;

  const memo = new Map();
  const dist = (m) => { const v = engineClearIn(m.board, want, false, memo); return v === Infinity ? Infinity : v + 1; };

  let winner = null;
  for (const s of sacs) {
    if (dist(s.m) > want) continue;
    if (winner) return null;              // two sacrifices work: not unique
    winner = s;
  }
  if (!winner) return null;
  // The end card says it in so many words -- "offering a piece is how you choose
  // black's reply FOR them" -- so black gets exactly one legal answer to the key.
  // Two compulsory captures to pick between is still a sacrifice, but it is no
  // longer red choosing, and the copy would be describing a different board.
  if (winner.reply.length !== 1) return null;
  // "never fewer than stated": the winner has to take exactly `want`, and since
  // it is the only move at or under `want` it is also the true minimum.
  if (dist(winner.m) !== want) return null;
  for (const m of rootMoves) {
    if (m === winner.m) continue;
    if (dist(m) <= want) return null;     // a quiet non-sacrifice also wins
  }

  let rm = 0, rk = 0, bm = 0, bk = 0;
  for (const ch of cells) {
    if (ch === '1') rm++; else if (ch === '2') rk++; else if (ch === '3') bm++; else if (ch === '4') bk++;
  }
  const key = winner.m.path.join('.');
  return {
    cells,
    key,
    blk: bm + bk,
    red: rm + rk,
    redMen: rm,
    shape: `${rm}m${rk}k v ${bm}m${bk}k`,
    dir: dirOf(key),
    rootCount: rootMoves.length,
    sacCount: sacs.length,
    replyCount: winner.reply.length,
    keyIsKing: cells[Number(key.split('.')[0])] === '2',
  };
}

// The double solve. Only ever paid for on a board that already passed the engine
// side, and paid twice: once at the tight budget and once at the budget
// verify-check.mjs uses, which is the one that has to hold when the checker runs.
function agrees(cand, want) {
  for (const budget of [want, want + 2]) {
    const r = independentSolve(cand.cells, want, budget);
    if (!r.ok) return false;
    if (r.winners.length !== 1) return false;
    if (r.winners[0] !== cand.key) return false;
    if (r.trueMin !== want) return false;
    if (r.forcesCapture !== true) return false;
    if (r.rootCount !== cand.rootCount) return false;
  }
  return true;
}

// ── dates ───────────────────────────────────────────────────────────────────
const iso = (d) => d.toISOString().slice(0, 10);
const label = (s) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const isSunday = (s) => new Date(`${s}T12:00:00Z`).getUTCDay() === 0;
const quizId = (s) => { const [y, m, d] = s.split('-'); return `check-${Number(m)}-${Number(d)}-${y.slice(2)}`; };

// ── probe ───────────────────────────────────────────────────────────────────
if (has('--probe')) {
  seed = Number(arg('--seed', 20260930)) >>> 0;
  const N = Number(arg('--samples', 400000));
  const pblk = arg('--pblk') ? [Number(arg('--pblk'))] : null;
  const pred = arg('--pred') ? [Number(arg('--pred'))] : null;
  for (const want of (arg('--pwant') ? [Number(arg('--pwant'))] : [3, 4])) {
    const band = pblk || (want === 3 ? WEEKDAY_BLK : SUNDAY_BLK);
    const hist = (a) => [...new Set(a)].sort().map((v) => `${v}:${a.filter((z) => z === v).length}`).join(' ');
    const blks = [], reds = [], dirs = [], shapes = [], sacs = [], roots = [], replies = [];
    let hits = 0, disagree = 0;
    for (let i = 0; i < N; i++) {
      const blk = pick(band);
      const bk = (rnd() * Math.min(3, blk + 1)) | 0;
      const red = pick(pred || [2, 3, 4]);
      const rm = redManCount(red, arg('--pmen', null));
      const cells = sample({ rm, rk: red - rm, bm: blk - bk, bk });
      if (!cells) continue;
      const c = engineCandidate(cells, want);
      if (!c) continue;
      if (!agrees(c, want)) { disagree++; continue; }
      hits++;
      blks.push(c.blk); reds.push(c.red); dirs.push(c.dir); shapes.push(c.shape);
      sacs.push(c.sacCount); roots.push(c.rootCount); replies.push(c.replyCount);
    }
    console.log(`clearIn ${want}: ${hits} accepted from ${N} samples (${disagree} solver disagreements)`);
    console.log(`  blk     ${hist(blks)}`);
    console.log(`  red     ${hist(reds)}`);
    console.log(`  dir     ${hist(dirs)}`);
    console.log(`  sacs    ${hist(sacs)}`);
    console.log(`  root    ${hist(roots)}`);
    console.log(`  replies ${hist(replies)}`);
    console.log(`  shapes  ${new Set(shapes).size} distinct, top ${[...new Set(shapes)].map((s) => [s, shapes.filter((x) => x === s).length]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s, n]) => `${s}(${n})`).join(' ')}`);
  }
  process.exit(0);
}

// ── build a segment ─────────────────────────────────────────────────────────
const from = arg('--from');
const days = Number(arg('--days', 0));
const startNum = Number(arg('--startnum', 1));
const outPath = arg('--out');
if (!from || !days || !outPath) {
  console.error('usage: node scripts/gen-check.mjs --from YYYY-MM-DD --days N --startnum M --avoid app/check/puzzles.js --out FILE [--seed S]');
  process.exit(1);
}
// Rule: OFFSET the seed by the starting board number, so a new segment cannot
// replay the frozen one even when it is handed the same --seed.
seed = ((Number(arg('--seed', 20260930)) >>> 0) ^ Math.imul(startNum, 2654435761)) >>> 0;
if (seed === 0) seed = 0x9e3779b9;

const seenCells = new Set();
const keyAll = new Map();     // combined-bank key counts (verify-check.mjs scope)
const keySeg = new Map();
const shapeSeg = new Map();
const dirSeg = new Map();
const blkSeg = new Map();
const redSeg = new Map();
const menSeg = new Map();

const avoidPath = arg('--avoid');
if (avoidPath) {
  const mod = await import(pathToFileURL(resolvePath(avoidPath)).href);
  const prior = mod.PUZZLES || [];
  for (const p of prior) {
    if (p.cells) seenCells.add(p.cells);
    if (p.key) keyAll.set(p.key, (keyAll.get(p.key) || 0) + 1);
  }
  const atCap = [...keyAll.entries()].filter(([, n]) => n >= KEY_CEILING_ALL).length;
  console.error(`avoiding ${prior.length} banked boards from ${avoidPath} (${keyAll.size} key paths in use, ${atCap} already at the ${KEY_CEILING_ALL}x combined ceiling)`);
}

const dirCap = Math.max(1, Math.floor(days * DIR_FRACTION));
const blkCap = Math.max(1, Math.floor(days * BLK_FRACTION));
const redCap = Math.max(1, Math.floor(days * RED_FRACTION));
const menCap = Math.max(1, Math.floor(days * MEN_FRACTION));

function ceilingsAllow(c, wantDir) {
  if (seenCells.has(c.cells)) return false;
  if ((keySeg.get(c.key) || 0) >= KEY_CEILING_SEG) return false;
  if ((keyAll.get(c.key) || 0) >= KEY_CEILING_ALL) return false;
  if ((shapeSeg.get(c.shape) || 0) >= SHAPE_CEILING) return false;
  if ((dirSeg.get(c.dir) || 0) >= dirCap) return false;
  if ((blkSeg.get(c.blk) || 0) >= blkCap) return false;
  if ((redSeg.get(c.red) || 0) >= redCap) return false;
  if ((menSeg.get(c.redMen) || 0) >= menCap) return false;
  if (wantDir && c.dir !== wantDir) return false;
  return true;
}

const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);

const out = [];
for (let d = 0; d < days; d++) {
  const date = new Date(`${from}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + d);
  const live = iso(date);
  const sun = isSunday(live);
  const want = sun ? 4 : 3;
  const num = startNum + d;
  const band = sun ? SUNDAY_BLK : WEEKDAY_BLK;
  // Keyed off num - 1 rather than the loop index, so a spliced segment continues
  // the live bank's rotation instead of restarting it.
  const blkTarget = sun ? SUN_BLK_ROT[(num - 1) % SUN_BLK_ROT.length] : WEEK_BLK_ROT[(num - 1) % WEEK_BLK_ROT.length];
  const redTarget = RED_TOT_ROT[(num - 1) % RED_TOT_ROT.length];
  const menTarget = MEN_ROT[(num - 1) % MEN_ROT.length];
  // An all-men red army cannot key downward -- men only step towards row 0 --
  // so on those days the direction preference is dropped rather than spent.
  const dirTarget = menTarget === 'all' && DIR_ROT[(num - 1) % DIR_ROT.length].startsWith('down')
    ? null : DIR_ROT[(num - 1) % DIR_ROT.length];

  const phases = [
    { tries: TRIES_A, blk: [blkTarget], red: [redTarget], men: menTarget, dir: dirTarget },
    { tries: TRIES_B, blk: [blkTarget], red: [redTarget], men: menTarget, dir: null },
    { tries: TRIES_C, blk: band, red: [2, 3, 4, 5], men: null, dir: null },
  ];

  let got = null;
  for (const ph of phases) {
    for (let t = 0; t < ph.tries && !got; t++) {
      const blk = ph.blk.length === 1 ? ph.blk[0] : pick(ph.blk);
      const red = ph.red.length === 1 ? ph.red[0] : pick(ph.red);
      const bk = (rnd() * Math.min(3, blk + 1)) | 0;
      const rm = redManCount(red, ph.men);
      const cells = sample({ rm, rk: red - rm, bm: blk - bk, bk });
      if (!cells) continue;
      const c = engineCandidate(cells, want);
      if (!c) continue;
      if (!ceilingsAllow(c, ph.dir)) continue;
      if (!agrees(c, want)) {
        console.error(`  !! solver disagreement on ${cells} (${live}) -- board dropped`);
        continue;
      }
      got = c;
    }
    if (got) break;
  }
  if (!got) {
    console.error(`no candidate for ${live} inside the sample budget (blk target ${blkTarget}, red ${redTarget} ${menTarget}, dir ${dirTarget})`);
    process.exit(1);
  }

  seenCells.add(got.cells);
  bump(keySeg, got.key); bump(keyAll, got.key);
  bump(shapeSeg, got.shape); bump(dirSeg, got.dir);
  bump(blkSeg, got.blk); bump(redSeg, got.red); bump(menSeg, got.redMen);

  out.push({
    num, quizId: quizId(live), live, dateLabel: label(live), sunday: sun,
    clearIn: want, cells: got.cells, key: got.key, blk: got.blk,
  });
  console.error(`${live}${sun ? ' (Sun)' : '     '}  #${num}  clear ${want}  blk ${got.blk}  ${got.shape}  key ${got.key} ${got.dir}  ${got.rootCount} legal / ${got.sacCount} sacrifices / ${got.replyCount} forced repl${got.replyCount === 1 ? 'y' : 'ies'}`);
}

// ── summary: the counts the ceilings are about ──────────────────────────────
const tally = (m, title) => console.error(`  ${title.padEnd(9)} ${[...m.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join('  ')}`);
console.error(`\n${out.length} boards, ${out[0].live} -> ${out[out.length - 1].live}`);
tally(blkSeg, 'blk');
tally(redSeg, 'red');
tally(menSeg, 'red men');
tally(dirSeg, 'dir');
tally(new Map([[3, out.filter((p) => p.clearIn === 3).length], [4, out.filter((p) => p.clearIn === 4).length]]), 'clearIn');
console.error(`  shapes    ${shapeSeg.size} distinct, max reuse ${Math.max(...shapeSeg.values())} (ceiling ${SHAPE_CEILING})`);
console.error(`  keys      ${keySeg.size} distinct in segment, max reuse ${Math.max(...keySeg.values())} (segment ceiling ${KEY_CEILING_SEG}, combined ${KEY_CEILING_ALL})`);
console.error(`  caps used dir ${dirCap}  blk ${blkCap}  red ${redCap}  red men ${menCap}`);

const body = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    clearIn: ${p.clearIn},
    cells: '${p.cells}',
    key: '${p.key}',
    blk: ${p.blk},
  },`).join('\n');

writeFileSync(outPath, `// New Check boards, generated by scripts/gen-check.mjs. Splice onto the end of
// app/check/puzzles.js with scripts/_splice.mjs (or generate + splice in one go
// with scripts/_append.mjs); this file is not imported by the app.
export const PUZZLES = [
${body}
];
`);
console.error(`\nwrote ${out.length} boards to ${outPath}`);
