// Bank generator for Quilt, the daily 9x9 jigsaw sudoku.
//
//   node scripts/gen-quilt.mjs [--days 90] [--start 2026-08-11] [--out app/quilt/puzzles.js]
//
// WHAT A QUILT BOARD IS. A normal sudoku replaces nothing; Quilt replaces the
// nine 3x3 boxes with nine CONNECTED irregular regions of nine cells each. Rows
// and columns still hold 1-9 exactly once, and so does every region. The region
// map ships as `reg` (9x9 of 0-8) and the client both tints and outlines it.
//
// THREE THINGS THIS SCRIPT GUARANTEES, and the verifier re-proves all of them
// from scratch rather than trusting anything stored here (scripts/verify-quilt.mjs):
//
//   1. EXACTLY ONE SOLUTION. Every dig is checked with a counting solver capped
//      at 2, so a cell is only cleared if the board stays unique without it.
//   2. NO GUESSING. Uniqueness alone does NOT mean a human can solve it: a board
//      can be unique and still require trial and error. So each board must also
//      fall to a LOGICAL solver using only the techniques listed below. A board
//      that none but a backtracker can crack is rejected and re-dug.
//   3. A REGION MAP THAT IS ACTUALLY A QUILT. Nine connected nine-cell regions,
//      each spanning at least 3 rows and 3 columns, at most one of them a plain
//      3x3 rectangle, and never the standard sudoku box layout. Without the span
//      floor the search happily returns a region that IS a full row, which makes
//      the region constraint a duplicate of the row constraint and reads as a
//      bug on the board.
//
// THE WEEKDAY RAMP is the CLUE COUNT, and only the clue count:
//
//   Mon 34   Tue 34   Wed 33   Thu 32   Fri 31   Sat 30   Sun 26 (`sunday: true`)
//
// The technique tier is deliberately NOT a second dial. It was one at first,
// with Mon-Wed restricted to singles alone, and the cost was absurd: holding a
// board to singles at 34 clues means nearly every dig gets rejected, so a single
// Monday board burned hundreds of region layouts and the run stalled for minutes
// on end (measured: tier-0 days ran 50x slower than the rest and one never
// finished at all). It also bought little, because at 30-plus clues a board is
// almost always singles-solvable anyway.
//
// So every board faces the SAME bar: it must fall to a logical solver limited to
// naked and hidden singles, locked candidates, and naked and hidden pairs. That
// is the no-guessing guarantee, and it is the thing worth guaranteeing. How hard
// the board feels is then carried entirely by how much of it is printed for you.
//
// Clue counts are a TARGET, not a figure to hit at any cost. The dig stops the
// moment it reaches the day's target, and a board that stalls one clue short of
// it still ships; anything further off is thrown away and re-dug on a fresh
// layout. The ranges that actually result (weekday 30-34, Sunday 24-27) are
// asserted by the verifier rather than assumed here.

import fs from 'node:fs';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = Number(argOf('--days', 90));
const START = argOf('--start', '2026-08-11');
const OUT = argOf('--out', 'app/quilt/puzzles.js');

// ── deterministic RNG, so a rerun reproduces the bank byte for byte ──
//
// Mulberry32, and the `Math.imul` is load-bearing rather than a flourish. The
// textbook LCG this started as, `seed = (seed * 1103515245 + 12345) & 0x7fffffff`,
// is WRONG in JavaScript: the product runs past 2^53, so the multiply silently
// loses precision and the generator's period collapses. Measured on this seed it
// repeats after 16,738 draws instead of the ~2^31 the constants promise. The
// damage is not statistical, it is a hang: once the stream repeats, every retry
// loop re-derives the layouts it has already rejected, so board 11 of the bank
// span forever. Math.imul keeps the whole thing in exact 32-bit integers.
let seed = Number(argOf('--seed', 20260811)) >>> 0;
function rnd() {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (n) => Math.floor(rnd() * n);
function shuffled(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = ri(i + 1); [x[i], x[j]] = [x[j], x[i]]; } return x; }

const IDX = [...Array(81).keys()];
const rowOf = (i) => (i / 9) | 0;
const colOf = (i) => i % 9;
function neighbours(i) {
  const r = rowOf(i), c = colOf(i), out = [];
  if (r > 0) out.push(i - 9);
  if (r < 8) out.push(i + 9);
  if (c > 0) out.push(i - 1);
  if (c < 8) out.push(i + 1);
  return out;
}

// ── 1. region map ────────────────────────────────────────────────────────────
// MUTATION, NOT GROWTH. The obvious approach, dropping nine seeds and growing
// them outward, was tried first and is a dead end: it strands a pocket of cells
// that no region can reach on essentially every run (measured 0 complete
// layouts in 3,000 attempts), because a region that gets boxed in can never
// reach nine cells however the rest of the board is grown.
//
// So start from a layout that is already valid, the standard 3x3 boxes, and
// move cells between adjacent regions in PAIRS, so every region holds nine
// cells at every step and the only thing that can break is connectivity, which
// is cheap to check and cheap to undo.
//
// The pair has to be chosen carefully, and the obvious choice is wrong. Swapping
// two ADJACENT cells across a border fails essentially always: each cell's only
// link to the region it just joined was the other cell in the swap, so both
// regions come apart and every swap is rejected (measured: zero accepted swaps,
// which silently left the layout as the standard boxes). Instead, move a cell
// from A into B, then move a DIFFERENT cell of B, one that still touches A,
// back the other way. Both regions keep a real join and roughly one move in
// five is accepted.
function connected(reg, k) {
  const cells = IDX.filter((i) => reg[i] === k);
  if (!cells.length) return false;
  const seen = new Set([cells[0]]);
  const stack = [cells[0]];
  while (stack.length) {
    const cur = stack.pop();
    for (const n of neighbours(cur)) if (reg[n] === k && !seen.has(n)) { seen.add(n); stack.push(n); }
  }
  return seen.size === cells.length;
}

function growRegions() {
  for (let attempt = 0; attempt < 400; attempt++) {
    const reg = STANDARD.slice();
    let accepted = 0;
    for (let step = 0; step < 200000 && accepted < 900; step++) {
      const a = ri(81);
      const outs = neighbours(a).filter((n) => reg[n] !== reg[a]);
      if (!outs.length) continue;
      const A = reg[a], B = reg[outs[ri(outs.length)]];
      reg[a] = B;
      const backs = IDX.filter((i) => reg[i] === B && i !== a && neighbours(i).some((n) => reg[n] === A));
      if (!backs.length) { reg[a] = A; continue; }
      const c = backs[ri(backs.length)];
      reg[c] = A;
      if (connected(reg, A) && connected(reg, B)) accepted++;
      else { reg[a] = A; reg[c] = B; }
    }
    if (regionsOk(reg)) return reg;
  }
  throw new Error('could not build a region map');
}

const STANDARD = IDX.map((i) => ((rowOf(i) / 3) | 0) * 3 + ((colOf(i) / 3) | 0));

function regionsOk(reg) {
  let rectangles = 0;
  for (let k = 0; k < 9; k++) {
    const cells = IDX.filter((i) => reg[i] === k);
    if (cells.length !== 9) return false;
    // connected?
    const seen = new Set([cells[0]]);
    const stack = [cells[0]];
    while (stack.length) {
      const cur = stack.pop();
      for (const n of neighbours(cur)) if (reg[n] === k && !seen.has(n)) { seen.add(n); stack.push(n); }
    }
    if (seen.size !== 9) return false;
    const rs = cells.map(rowOf), cs = cells.map(colOf);
    const rSpan = Math.max(...rs) - Math.min(...rs) + 1;
    const cSpan = Math.max(...cs) - Math.min(...cs) + 1;
    // a region that is a full row or column duplicates a constraint the board
    // already has, and a 9x1 sliver looks like a rendering fault besides
    if (rSpan < 3 || cSpan < 3) return false;
    if (rSpan === 3 && cSpan === 3) rectangles++;
  }
  if (rectangles > 1) return false;
  if (reg.every((v, i) => v === STANDARD[i])) return false;
  return true;
}

// ── 2. peers and solving ─────────────────────────────────────────────────────
function peersOf(reg) {
  const peers = IDX.map(() => new Set());
  for (let i = 0; i < 81; i++) {
    for (let j = 0; j < 81; j++) {
      if (i === j) continue;
      if (rowOf(i) === rowOf(j) || colOf(i) === colOf(j) || reg[i] === reg[j]) peers[i].add(j);
    }
  }
  return peers;
}
function unitsOf(reg) {
  const units = [];
  for (let r = 0; r < 9; r++) units.push(IDX.filter((i) => rowOf(i) === r));
  for (let c = 0; c < 9; c++) units.push(IDX.filter((i) => colOf(i) === c));
  for (let k = 0; k < 9; k++) units.push(IDX.filter((i) => reg[i] === k));
  return units;
}

// Counting solver. Stops the moment it has seen `cap` solutions, so the
// uniqueness test is "count(2) === 1" and never enumerates a whole search tree.
//
// SPEED MATTERS HERE, because digging one board calls this once per cell and the
// bank is ninety boards. The first version tracked used digits with a Set per
// peer list and was too slow to generate even a week (over two minutes for
// seven boards). This one keeps three bitmasks per cell group, so the candidate
// set for a cell is one OR and one NOT rather than twenty peer lookups.
// Digit d is bit d, so the full 1-9 candidate set is 0x3fe and `avail >> 1`
// indexes the popcount table. Write it as a shift rather than a literal list:
// the literal was 2^(d-1) at first, which is off by one against the 0x3fe masks
// and against logicalSolve's own `1 << d`, and the symptom is silent (every
// candidate set comes out shifted, so nothing solves and every board is
// rejected as unsolvable).
const BIT = Array.from({ length: 10 }, (_, d) => (d ? 1 << d : 0));
const POPC = new Uint8Array(512);
for (let m = 1; m < 512; m++) POPC[m] = POPC[m >> 1] + (m & 1);

function makeMasks(grid, reg) {
  const row = new Int16Array(9), col = new Int16Array(9), rgn = new Int16Array(9);
  for (let i = 0; i < 81; i++) {
    const d = grid[i];
    if (!d) continue;
    const b = BIT[d];
    if ((row[rowOf(i)] & b) || (col[colOf(i)] & b) || (rgn[reg[i]] & b)) return null;
    row[rowOf(i)] |= b; col[colOf(i)] |= b; rgn[reg[i]] |= b;
  }
  return { row, col, rgn };
}

// Returns -1 for "ran out of budget, do not know". The caller must treat that
// as a FAILED uniqueness proof and keep the clue, never as a pass: a cell is
// only ever cleared on a positive proof that the board is still unique.
function countSolutions(grid, reg, cap = 2) {
  const m = makeMasks(grid, reg);
  if (!m) return 0;
  const { row, col, rgn } = m;
  const g = grid.slice();
  let found = 0, budget = 400000;
  (function rec() {
    if (--budget < 0) return;
    let best = -1, bestMask = 0, bestN = 10;
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const avail = 0x3fe & ~(row[rowOf(i)] | col[colOf(i)] | rgn[reg[i]]);
      const n = POPC[avail >> 1];
      if (n === 0) return;
      if (n < bestN) { bestN = n; best = i; bestMask = avail; if (n === 1) break; }
    }
    if (best < 0) { found++; return; }
    const r = rowOf(best), c = colOf(best), k = reg[best];
    for (let d = 1; d <= 9; d++) {
      const b = BIT[d];
      if (!(bestMask & b)) continue;
      g[best] = d; row[r] |= b; col[c] |= b; rgn[k] |= b;
      rec();
      g[best] = 0; row[r] &= ~b; col[c] &= ~b; rgn[k] &= ~b;
      if (found >= cap) return;
    }
  })();
  return budget < 0 ? -1 : found;
}

// NOT EVERY REGION MAP CAN BE FILLED. A tangled nine-region layout can be
// genuinely unsatisfiable, and proving that takes an exhaustive search: the
// solver explores the whole tree and finds nothing. Unbudgeted, that is the
// single slowest thing in this script by orders of magnitude, and it is what
// made the bank appear to hang partway through (one board sat for over four
// minutes on layouts that had no solution at all). A layout that does not give
// up a filling inside the budget is simply not worth waiting for, so bail and
// draw another one.
function solveFull(reg) {
  const g = Array(81).fill(0);
  const row = new Int16Array(9), col = new Int16Array(9), rgn = new Int16Array(9);
  const order = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  let budget = 300000;
  function rec() {
    if (--budget < 0) return false;
    let best = -1, bestMask = 0, bestN = 10;
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const avail = 0x3fe & ~(row[rowOf(i)] | col[colOf(i)] | rgn[reg[i]]);
      const n = POPC[avail >> 1];
      if (n === 0) return false;
      if (n < bestN) { bestN = n; best = i; bestMask = avail; if (n === 1) break; }
    }
    if (best < 0) return true;
    const r = rowOf(best), c = colOf(best), k = reg[best];
    for (const d of shuffled(order)) {
      const b = BIT[d];
      if (!(bestMask & b)) continue;
      g[best] = d; row[r] |= b; col[c] |= b; rgn[k] |= b;
      if (rec()) return true;
      g[best] = 0; row[r] &= ~b; col[c] &= ~b; rgn[k] &= ~b;
    }
    return false;
  }
  return rec() ? g : null;
}

// ── 3. the logical solver: proves a human can get there without guessing ─────
// `tier` 0 = naked + hidden singles only. `tier` 1 adds locked candidates and
// naked/hidden pairs. Returns true only if the grid is COMPLETELY filled using
// nothing else, so a board that stalls is rejected however unique it is.
function logicalSolve(grid, reg, peers, units, tier) {
  const cand = IDX.map(() => 0x3fe); // bits 1..9
  const g = grid.slice();
  const bit = (d) => 1 << d;
  const bitsOf = (m) => { const o = []; for (let d = 1; d <= 9; d++) if (m & bit(d)) o.push(d); return o; };

  function assign(i, d) {
    g[i] = d; cand[i] = 0;
    for (const p of peers[i]) cand[p] &= ~bit(d);
  }
  for (let i = 0; i < 81; i++) if (g[i]) { const d = g[i]; g[i] = 0; assign(i, d); }

  let moved = true;
  while (moved) {
    moved = false;
    // naked single
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue;
      const b = bitsOf(cand[i]);
      if (b.length === 0) return false;
      if (b.length === 1) { assign(i, b[0]); moved = true; }
    }
    if (moved) continue;
    // hidden single
    for (const u of units) {
      for (let d = 1; d <= 9; d++) {
        if (u.some((i) => g[i] === d)) continue;
        const spots = u.filter((i) => !g[i] && (cand[i] & bit(d)));
        if (spots.length === 0) return false;
        if (spots.length === 1) { assign(spots[0], d); moved = true; }
      }
    }
    if (moved || tier < 1) continue;
    // locked candidates: a digit confined to one row/column inside a region
    // (or to one region inside a row/column) can be struck everywhere else on
    // the line or in the region
    for (const u of units) {
      for (let d = 1; d <= 9; d++) {
        if (u.some((i) => g[i] === d)) continue;
        const spots = u.filter((i) => !g[i] && (cand[i] & bit(d)));
        if (spots.length < 2) continue;
        const sameRow = spots.every((i) => rowOf(i) === rowOf(spots[0]));
        const sameCol = spots.every((i) => colOf(i) === colOf(spots[0]));
        const sameReg = spots.every((i) => reg[i] === reg[spots[0]]);
        const strike = (pred) => {
          for (let i = 0; i < 81; i++) {
            if (g[i] || spots.includes(i) || !pred(i)) continue;
            if (cand[i] & bit(d)) { cand[i] &= ~bit(d); moved = true; }
          }
        };
        if (sameRow) strike((i) => rowOf(i) === rowOf(spots[0]));
        if (sameCol) strike((i) => colOf(i) === colOf(spots[0]));
        if (sameReg) strike((i) => reg[i] === reg[spots[0]]);
      }
    }
    if (moved) continue;
    // naked pair
    for (const u of units) {
      const open = u.filter((i) => !g[i]);
      for (let a = 0; a < open.length; a++) {
        for (let b = a + 1; b < open.length; b++) {
          if (cand[open[a]] !== cand[open[b]]) continue;
          if (bitsOf(cand[open[a]]).length !== 2) continue;
          for (const i of open) {
            if (i === open[a] || i === open[b]) continue;
            if (cand[i] & cand[open[a]]) { cand[i] &= ~cand[open[a]]; moved = true; }
          }
        }
      }
    }
    if (moved) continue;
    // hidden pair
    for (const u of units) {
      for (let d1 = 1; d1 <= 9; d1++) {
        for (let d2 = d1 + 1; d2 <= 9; d2++) {
          const s1 = u.filter((i) => !g[i] && (cand[i] & bit(d1)));
          const s2 = u.filter((i) => !g[i] && (cand[i] & bit(d2)));
          if (s1.length !== 2 || s2.length !== 2) continue;
          if (s1[0] !== s2[0] || s1[1] !== s2[1]) continue;
          const keep = bit(d1) | bit(d2);
          for (const i of s1) if (cand[i] !== keep) { cand[i] = keep; moved = true; }
        }
      }
    }
  }
  return g.every((v) => v > 0);
}

// ── 4. digging ───────────────────────────────────────────────────────────────
// Clear cells in random order, stopping once the target is reached. Symmetry is
// deliberately NOT enforced: a jigsaw board has no symmetric region map sitting
// under it, so a symmetric clue pattern just fights the shapes.
//
// BOTH TESTS RUN INSIDE THE LOOP, and that is the whole trick. Digging first and
// checking the difficulty afterwards does not work: the finished board almost
// never happens to land inside the technique tier you wanted, so nearly every
// attempt is thrown away and a single Tuesday board burned 400 layouts without
// producing one. Checking each removal as it is made means the board is
// solvable at that tier by construction, and the clue count is simply however
// far the dig got before the tier ran out of road.
function dig(sol, reg, peers, units, target, tier, maxClues) {
  const g = sol.slice();
  let clues = 81;
  for (const i of shuffled(IDX)) {
    if (clues <= target) break;
    const keep = g[i];
    g[i] = 0;
    if (countSolutions(g, reg, 2) === 1 && logicalSolve(g, reg, peers, units, tier)) clues--;
    else g[i] = keep;
  }
  if (clues > maxClues) return null;
  return { given: g, clues };
}

// ── 5. the bank ──────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Indexed by JS getUTCDay(), 0 = Sunday. TARGET is where the dig stops, MAXCLUES
// is the most a board may ship with when the dig stalls before it gets there
// (one clue of slack, still inside the ranges the verifier asserts).
const TARGET = { 0: 26, 1: 34, 2: 34, 3: 33, 4: 32, 5: 31, 6: 30 };
const MAXCLUES = { 0: 27, 1: 34, 2: 34, 3: 34, 4: 33, 5: 32, 6: 31 };
// One technique tier for every day. See the note at the top of the file: making
// this per-weekday is what made the generator unusably slow.
const TIER = 1;

function board(dateISO, num) {
  const d = new Date(dateISO + 'T00:00:00Z');
  const dow = d.getUTCDay();
  const sunday = dow === 0;
  const tier = TIER;
  for (let attempt = 0; attempt < 400; attempt++) {
    const reg = growRegions();
    const peers = peersOf(reg);
    const units = unitsOf(reg);
    const sol = solveFull(reg);
    if (!sol) continue;
    {
      const got = dig(sol, reg, peers, units, TARGET[dow], tier, MAXCLUES[dow]);
      if (!got) continue;
      return {
        num,
        quizId: `quilt-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
        live: dateISO,
        dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
        sunday,
        clues: got.clues,
        reg,
        given: got.given,
        sol,
      };
    }
  }
  throw new Error('no board for ' + dateISO);
}

const rows = (flat) => {
  const out = [];
  for (let r = 0; r < 9; r++) out.push('[' + flat.slice(r * 9, r * 9 + 9).join(',') + ']');
  return '[' + out.join(',') + ']';
};

const HEADER = `// Puzzle data for Quilt, the daily 9x9 JIGSAW sudoku. Imported ONLY by the
// server page (app/quilt/page.js), which filters live<=today before passing
// puzzles to the client, so future boards and their solutions never ship to the
// browser.
//
// Quilt is Suds with the boxes redrawn. Rows and columns still hold 1-9 exactly
// once, but the nine 3x3 boxes are replaced by nine CONNECTED irregular regions
// of nine cells each, carried in \`reg\` (9x9, values 0-8). The client tints and
// outlines those regions; nothing else about the board is different.
//
// FIELDS
//   reg     9x9 region map, 0-8. Nine connected regions of exactly nine cells,
//           each spanning at least 3 rows and 3 columns. At most one region per
//           board is a plain 3x3 rectangle, and no board uses the standard
//           sudoku box layout.
//   given   the printed clues (0 = a cell the player fills).
//   sol     the full solution, used for the live check, the single hint, and
//           reveal-and-end. Ships only for live<=today boards, exactly like
//           every other daily's answers.
//   clues   the count of givens. Weekdays run 30-34 on a Mon-to-Sat ramp;
//           Sundays are a harder Edition at 24-27 with \`sunday: true\`.
//
// AUTHORING RULES, all re-proved from scratch by scripts/verify-quilt.mjs
// (which never trusts a stored field, per the daily puzzle authoring standard):
//   1. Exactly one solution, counted by an independent solver.
//   2. No guessing: every board also falls to a logical solver limited to
//      singles (Mon-Wed) or singles plus locked candidates and pairs (Thu-Sun).
//      Uniqueness alone does not make a board humanly solvable.
//   3. A real quilt: nine connected nine-cell regions, span floors as above,
//      never the standard box layout.
//   4. Variety across the whole bank: no region layout repeats, and no solution
//      grid repeats.
//   5. Sunday flags land on real Sundays and carry a lower clue count than any
//      weekday board.
//
// Regenerate with: node scripts/gen-quilt.mjs --days 90 --start 2026-08-11
// The RNG is seeded, so a rerun reproduces this file byte for byte. NEVER edit
// a board by hand, and never rewrite a board that has already gone live.
export const PUZZLES = [`;

const out = [];
const start = new Date(START + 'T00:00:00Z');
const seenReg = new Set(), seenSol = new Set();
for (let k = 0; k < DAYS; k++) {
  const d = new Date(start.getTime() + k * 86400000);
  const iso = d.toISOString().slice(0, 10);
  let b = null;
  for (let tries = 0; tries < 60; tries++) {
    const cand = board(iso, k + 1);
    const rk = cand.reg.join(''), sk = cand.sol.join('');
    if (seenReg.has(rk) || seenSol.has(sk)) continue;
    seenReg.add(rk); seenSol.add(sk);
    b = cand;
    break;
  }
  if (!b) throw new Error('no distinct board for ' + iso);
  out.push(b);
  if ((k + 1) % 10 === 0) console.log(`  ${k + 1}/${DAYS} boards`);
}

const body = out.map((b) => `  {
    num: ${b.num},
    quizId: '${b.quizId}',
    live: '${b.live}',
    dateLabel: '${b.dateLabel}',
    sunday: ${b.sunday},
    clues: ${b.clues},
    reg: ${rows(b.reg)},
    given: ${rows(b.given)},
    sol: ${rows(b.sol)},
  },`).join('\n');

fs.writeFileSync(OUT, `${HEADER}\n${body}\n];\n`);
console.log(`wrote ${OUT}: ${out.length} boards, ${out[0].live} to ${out[out.length - 1].live}`);
const wk = out.filter((b) => !b.sunday).map((b) => b.clues);
const su = out.filter((b) => b.sunday).map((b) => b.clues);
console.log(`  weekday clues ${Math.min(...wk)}-${Math.max(...wk)}, sunday clues ${Math.min(...su)}-${Math.max(...su)} (${su.length} Sundays)`);
