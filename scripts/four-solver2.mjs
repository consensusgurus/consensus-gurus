// SECOND, INDEPENDENT Connect Four solver for the Four bank generator.
//
// WHY IT EXISTS. scripts/verify-four.mjs re-solves every shipped board with the
// SHIPPING engine (app/four/c4.js). That is the bank's second opinion, and it
// only means something if the generator did not simply hand it back its own
// numbers. So the generator solves every candidate with THIS file as well and
// refuses any board where the two disagree on the score of any legal column.
//
// It deliberately shares nothing with c4.js except the rules of the game and
// the absolute score convention (a win landing with S cells still empty scores
// S), which is the number both must agree on:
//
//   * board       plain bitboard-free Int8Array of 42, but its own copy, with
//                 its own height/ply bookkeeping;
//   * hashing     an INCREMENTAL base-4 positional code (each cell contributes
//                 v * 4^i) split into two exact-integer halves and stored in a
//                 nested Map. c4.js uses XOR Zobrist keys packed into one
//                 48-bit Number in a flat Map. No shared constants, no shared
//                 table, no shared collision story.
//   * search      a null-window driver: solve() binary-searches the score by
//                 asking a sequence of "is the score > m?" questions, each a
//                 zero-width alpha-beta. c4.js runs one wide-window negamax.
//   * pruning     the only cutoff is "a win available now ends the node", which
//                 is a rule of the game rather than a heuristic. c4.js also
//                 skips moves that hand the opponent the square above, collapses
//                 to a single forced block when the opponent threatens, and
//                 clamps the window to (empty-2, -(empty-1)) before probing its
//                 table. NONE of that is repeated here, so an error in any of
//                 those three would show up as a disagreement rather than being
//                 reproduced.
//   * ordering    moves are ordered by how many immediate winning squares each
//                 one creates, center column as the tie-break. c4.js uses a
//                 fixed center-out list.
//
// The two agreeing on all 7 columns of a position is therefore real evidence,
// not a tautology.
export const COLS = 7, ROWS = 6, SIZE = 42;

export function make(cellsStr) {
  const cells = new Int8Array(SIZE);
  const heights = new Int8Array(COLS);
  let plies = 0;
  for (let i = 0; i < SIZE; i++) {
    const v = cellsStr.charCodeAt(i) - 48;
    cells[i] = v;
    if (v) plies++;
  }
  for (let c = 0; c < COLS; c++) { let h = 0; while (h < ROWS && cells[c * ROWS + h]) h++; heights[c] = h; }
  // base-4 code, low half = cells 0..20, high half = cells 21..41
  let lo = 0, hi = 0;
  for (let i = 0; i < 21; i++) lo += cells[i] * P4[i];
  for (let i = 21; i < SIZE; i++) hi += cells[i] * P4[i - 21];
  return { cells, heights, plies, turn: plies % 2 === 0 ? 1 : 2, lo, hi };
}

const P4 = (() => { const a = []; let v = 1; for (let i = 0; i < 21; i++) { a.push(v); v *= 4; } return a; })();

const DIR = [[0, 1], [1, 0], [1, 1], [1, -1]];

export function wins(b, c, r, who) {
  const cl = b.cells;
  for (let d = 0; d < 4; d++) {
    const dc = DIR[d][0], dr = DIR[d][1];
    let n = 1;
    for (let s = -1; s <= 1; s += 2) {
      let cc = c + dc * s, rr = r + dr * s;
      while (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && cl[cc * ROWS + rr] === who) { n++; if (n >= 4) return true; cc += dc * s; rr += dr * s; }
    }
  }
  return false;
}

export function anyFour(b) {
  for (let c = 0; c < COLS; c++) for (let r = 0; r < b.heights[c]; r++) { const w = b.cells[c * ROWS + r]; if (w && wins(b, c, r, w)) return w; }
  return 0;
}

function drop(b, c) {
  const r = b.heights[c], i = c * ROWS + r, v = b.turn;
  b.cells[i] = v; b.heights[c] = r + 1; b.plies++; b.turn = 3 - v;
  if (i < 21) b.lo += v * P4[i]; else b.hi += v * P4[i - 21];
}
function lift(b, c) {
  const r = b.heights[c] - 1, i = c * ROWS + r, v = b.cells[i];
  b.cells[i] = 0; b.heights[c] = r; b.plies--; b.turn = v;
  if (i < 21) b.lo -= v * P4[i]; else b.hi -= v * P4[i - 21];
}

// nested Map keyed by the two halves of the base-4 code; turn is implied by ply parity
function ttGet(tt, b) { const m = tt.get(b.lo); return m === undefined ? undefined : m.get(b.hi); }
function ttSet(tt, b, v) { let m = tt.get(b.lo); if (m === undefined) { m = new Map(); tt.set(b.lo, m); } m.set(b.hi, v); }

// How many immediate winning squares does dropping in c give the mover?
function threatGain(b, c) {
  const who = b.turn;
  drop(b, c);
  let n = 0;
  for (let k = 0; k < COLS; k++) if (b.heights[k] < ROWS && wins(b, k, b.heights[k], who)) n++;
  lift(b, c);
  return n;
}

const CENTERDIST = [3, 2, 1, 0, 1, 2, 3];

// Zero-width alpha-beta: returns a bound on the absolute score with window
// [alpha, alpha+1). No heuristic pruning of any kind.
function ab(b, alpha, beta, tt) {
  const empty = SIZE - b.plies;
  if (empty === 0) return 0;
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS && wins(b, c, b.heights[c], b.turn)) return empty;

  const hit = ttGet(tt, b);
  if (hit !== undefined) {
    if (hit[0] >= beta) return hit[0];
    if (hit[1] <= alpha) return hit[1];
    if (hit[0] > alpha) alpha = hit[0];
    if (hit[1] < beta) beta = hit[1];
    if (alpha >= beta) return alpha;
  }
  const a0 = alpha, b0 = beta;

  const order = [];
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS) order.push(c);
  order.sort((x, y) => (threatGain(b, y) - threatGain(b, x)) || (CENTERDIST[x] - CENTERDIST[y]));

  let best = -SIZE;
  for (const c of order) {
    drop(b, c);
    const v = -ab(b, -beta, -alpha, tt);
    lift(b, c);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  if (best <= a0) ttSet(tt, b, [-SIZE, best]);
  else if (best >= b0) ttSet(tt, b, [best, SIZE]);
  else ttSet(tt, b, [best, best]);
  return best;
}

// Exact absolute score for the side to move, found by binary-searching the
// score with null-window probes rather than one wide search.
export function score(b, tt = new Map()) {
  let lo = -(SIZE - b.plies), hi = SIZE - b.plies;
  while (lo < hi) {
    let mid = lo + ((hi - lo) >> 1);
    if (mid <= 0 && lo / 2 < mid) mid = lo / 2 | 0;
    else if (mid >= 0 && hi / 2 > mid) mid = hi / 2 | 0;
    const r = ab(b, mid, mid + 1, tt);
    if (r <= mid) hi = r; else lo = r;
  }
  return lo;
}

// Score every legal column, from the point of view of the side to move.
export function scoreAll(b, tt = new Map()) {
  if (anyFour(b)) return [];
  const out = [];
  for (let c = 0; c < COLS; c++) {
    if (b.heights[c] >= ROWS) continue;
    if (wins(b, c, b.heights[c], b.turn)) { out.push({ col: c, score: SIZE - b.plies }); continue; }
    drop(b, c);
    const v = -score(b, tt);
    lift(b, c);
    out.push({ col: c, score: v });
  }
  return out;
}

export { drop, lift };
