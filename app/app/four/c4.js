// Connect Four rules + perfect solver for Four, the daily drop game.
//
// Shared by the browser client (app/four/FourClient.jsx) and the offline bank
// generator, so the engine a player faces is byte-for-byte the engine that
// verified the puzzle.
//
// BOARD. Seven columns, six rows. `cells` is a flat Int8Array of 42, indexed
// col * 6 + row, with row 0 at the BOTTOM (discs stack upward). 0 empty, 1 the
// player (who always moves first from the puzzle position), 2 the engine.
//
// SCORE. A terminal score is absolute, not relative to the node, which is the
// trick that removes any need to adjust a distance while unwinding negamax:
// winning while E cells are still empty scores +E, so a faster win scores
// higher and a slower one lower, and a loss is the negation. Draw is 0.
// From a root with E empty cells, a score S > 0 means the winning disc lands
// on ply (E - S + 1), i.e. the mover needs (E - S + 2) / 2 of their own moves.

export const COLS = 7;
export const ROWS = 6;
export const SIZE = COLS * ROWS;

export function emptyBoard() {
  return { cells: new Int8Array(SIZE), heights: new Int8Array(COLS), turn: 1, plies: 0 };
}

export function cloneBoard(b) {
  return { cells: Int8Array.from(b.cells), heights: Int8Array.from(b.heights), turn: b.turn, plies: b.plies };
}

// A board is serialised as 42 digits, column-major from the bottom of column a.
export function serialize(b) {
  let s = '';
  for (let i = 0; i < SIZE; i++) s += b.cells[i];
  return s;
}

export function deserialize(s) {
  const b = emptyBoard();
  let p = 0;
  for (let i = 0; i < SIZE; i++) {
    const v = s.charCodeAt(i) - 48;
    b.cells[i] = v;
    if (v) p++;
  }
  for (let c = 0; c < COLS; c++) {
    let h = 0;
    while (h < ROWS && b.cells[c * ROWS + h]) h++;
    b.heights[c] = h;
  }
  b.plies = p;
  b.turn = p % 2 === 0 ? 1 : 2;
  return b;
}

export const canPlay = (b, c) => b.heights[c] < ROWS;

export function legalMoves(b) {
  const out = [];
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS) out.push(c);
  return out;
}

export function play(b, c) {
  const r = b.heights[c];
  b.cells[c * ROWS + r] = b.turn;
  b.heights[c] = r + 1;
  b.turn = b.turn === 1 ? 2 : 1;
  b.plies++;
  return r;
}

export function undo(b, c) {
  const r = b.heights[c] - 1;
  b.cells[c * ROWS + r] = 0;
  b.heights[c] = r;
  b.turn = b.turn === 1 ? 2 : 1;
  b.plies--;
  return r;
}

const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// Does a disc of `who` at (c, r) complete a line of four?
export function winsAt(b, c, r, who) {
  const cells = b.cells;
  for (let d = 0; d < 4; d++) {
    const dc = DIRS[d][0], dr = DIRS[d][1];
    let n = 1;
    for (let s = -1; s <= 1; s += 2) {
      let cc = c + dc * s, rr = r + dr * s;
      while (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && cells[cc * ROWS + rr] === who) {
        n++;
        if (n >= 4) return true;
        cc += dc * s; rr += dr * s;
      }
    }
  }
  return false;
}

// The four cells of the winning line through (c, r), for highlighting.
export function winningCells(b, c, r, who) {
  const cells = b.cells;
  for (let d = 0; d < 4; d++) {
    const dc = DIRS[d][0], dr = DIRS[d][1];
    const line = [c * ROWS + r];
    for (let s = -1; s <= 1; s += 2) {
      let cc = c + dc * s, rr = r + dr * s;
      while (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && cells[cc * ROWS + rr] === who) {
        line.push(cc * ROWS + rr);
        cc += dc * s; rr += dr * s;
      }
    }
    if (line.length >= 4) {
      // Keep the four that are contiguous through the placed disc.
      line.sort((x, y) => x - y);
      return line;
    }
  }
  return null;
}

// Is the board already decided before anyone moves? Used only as a guard.
export function findAnyWin(b) {
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < b.heights[c]; r++) {
      const who = b.cells[c * ROWS + r];
      if (who && winsAt(b, c, r, who)) return who;
    }
  }
  return 0;
}

export const isWinningMove = (b, c) => canPlay(b, c) && winsAt(b, c, b.heights[c], b.turn);

// ── Zobrist ────────────────────────────────────────────────────────────────
// Two independent 24-bit accumulators combined into one exact Number key
// (a * 2^24 + b < 2^48), so the transposition table is a plain Map with a
// numeric key and no collision handling beyond the 48 bits themselves.
const Z = (() => {
  let s = 0x9e3779b9;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s % 16777216; };
  const t = [];
  for (let i = 0; i < SIZE * 2; i++) t.push([rnd(), rnd()]);
  return t;
})();

function hashOf(b) {
  let h1 = 0, h2 = 0;
  for (let i = 0; i < SIZE; i++) {
    const v = b.cells[i];
    if (!v) continue;
    const z = Z[i * 2 + (v - 1)];
    h1 ^= z[0]; h2 ^= z[1];
  }
  // Side to move must be part of the key.
  if (b.turn === 2) { h1 ^= 0xa5a5a5 & 0xffffff; h2 ^= 0x5a5a5a; }
  return h1 * 16777216 + h2;
}

const ORDER = [3, 2, 4, 1, 5, 0, 6];

// Exact solver. Returns the absolute score defined at the top of this file.
// `tt` may be shared across calls on the same board lineage.
export function solve(b, tt = new Map(), alphaIn = -SIZE, betaIn = SIZE) {
  return negamax(b, alphaIn, betaIn, tt);
}

function negamax(b, alpha, beta, tt) {
  const empty = SIZE - b.plies;
  if (empty === 0) return 0;

  // An immediate win is always best available, and ends the search here.
  for (let i = 0; i < COLS; i++) {
    const c = ORDER[i];
    if (b.heights[c] < ROWS && winsAt(b, c, b.heights[c], b.turn)) return empty;
  }

  // Nobody can win faster than their next move, so tighten the window before
  // touching the table. Both bounds are clamped at the draw score: with one or
  // two cells left the "win on my next move" value goes negative, and an
  // unclamped bound would rule out the draw that is actually best and report a
  // last-disc win or loss that does not exist.
  let max = Math.max(0, empty - 2);
  if (beta > max) { beta = max; if (alpha >= beta) return beta; }
  const min = Math.min(0, -(empty - 1));
  if (alpha < min) { alpha = min; if (alpha >= beta) return alpha; }

  const key = hashOf(b);
  const hit = tt.get(key);
  if (hit !== undefined) {
    // hit = [lower, upper]
    if (hit[0] >= beta) return hit[0];
    if (hit[1] <= alpha) return hit[1];
    if (hit[0] > alpha) alpha = hit[0];
    if (hit[1] < beta) beta = hit[1];
    if (alpha >= beta) return alpha;
  }
  const alpha0 = alpha, beta0 = beta;

  // Forced replies: if the opponent has an immediate win, the only move worth
  // considering is the one that takes that square. Two such squares and the
  // position is already lost, so play the block and let the search see it.
  const opp = b.turn === 1 ? 2 : 1;
  let forced = -1, threats = 0;
  for (let c = 0; c < COLS; c++) {
    if (b.heights[c] >= ROWS) continue;
    if (winsAt(b, c, b.heights[c], opp)) { threats++; forced = c; }
  }

  let best = -SIZE;
  const tryMove = (c) => {
    const r = b.heights[c];
    // Playing under an opponent win is suicide: it hands them the square above.
    play(b, c);
    const v = -negamax(b, -beta, -alpha, tt);
    undo(b, c);
    void r;
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    return alpha >= beta;
  };

  if (threats >= 1) {
    if (b.heights[forced] < ROWS) tryMove(forced);
  } else {
    for (let i = 0; i < COLS; i++) {
      const c = ORDER[i];
      if (b.heights[c] >= ROWS) continue;
      // Skip a move that lets the opponent win directly on top of it, unless it
      // is the only move available.
      if (b.heights[c] + 1 < ROWS) {
        const r2 = b.heights[c] + 1;
        b.cells[c * ROWS + b.heights[c]] = b.turn;
        const bad = winsAt(b, c, r2, opp);
        b.cells[c * ROWS + b.heights[c]] = 0;
        if (bad) continue;
      }
      if (tryMove(c)) break;
    }
    // Every move was self-destructive: play them for real, none is skippable.
    if (best === -SIZE) {
      for (let i = 0; i < COLS; i++) {
        const c = ORDER[i];
        if (b.heights[c] >= ROWS) continue;
        if (tryMove(c)) break;
      }
    }
  }

  if (best <= alpha0) tt.set(key, [-SIZE, best]);
  else if (best >= beta0) tt.set(key, [best, SIZE]);
  else tt.set(key, [best, best]);
  return best;
}

// Score every legal move from `b`, from the point of view of the side to move.
//
// PRECONDITION: the game is still live. The search never recurses into a decided
// position (it returns the moment a winning move exists), so it carries no
// terminal test of its own, and handing it a board that already contains a four
// would produce confident nonsense: it would happily report a "win" for the
// player on a board the engine has already won. That is a real trap for callers,
// so the decided case is caught here and returns an empty list. The scan is 42
// cells and runs once per turn, never inside the search.
export function scoreMoves(b, tt = new Map()) {
  if (findAnyWin(b)) return [];
  const out = [];
  for (let c = 0; c < COLS; c++) {
    if (b.heights[c] >= ROWS) continue;
    const r = b.heights[c];
    if (winsAt(b, c, r, b.turn)) { out.push({ col: c, score: SIZE - b.plies }); continue; }
    play(b, c);
    const v = -negamax(b, -SIZE, SIZE, tt);
    undo(b, c);
    out.push({ col: c, score: v });
  }
  return out;
}

// Plies from a root with `empty` cells to the winning disc, given a score.
export const pliesToWin = (empty, score) => empty - score + 1;
// The mover's own move count to that win.
export const movesToWin = (empty, score) => (empty - score + 2) / 2;

// Deterministic column order from a puzzle id, so every player faces the same
// defence and the leaderboard compares like with like. Ties among equally good
// engine replies are broken by this order, never at random.
export function idOrder(quizId) {
  let h = 2166136261;
  for (let i = 0; i < quizId.length; i++) { h ^= quizId.charCodeAt(i); h = Math.imul(h, 16777619); }
  const pool = [0, 1, 2, 3, 4, 5, 6];
  const out = [];
  while (pool.length) {
    h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

// The engine's reply: the highest-scoring column, ties broken by the puzzle's
// own deterministic order.
export function engineMove(b, quizId, tt = new Map()) {
  const scored = scoreMoves(b, tt);
  if (!scored.length) return null;
  const order = idOrder(quizId);
  let best = null;
  for (const s of scored) {
    if (!best || s.score > best.score || (s.score === best.score && order.indexOf(s.col) < order.indexOf(best.col))) best = s;
  }
  return best;
}
