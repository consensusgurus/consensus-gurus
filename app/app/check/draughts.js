// English draughts (checkers) rules plus the board-clear search behind Check.
//
// Shared by the browser client (app/check/CheckClient.jsx) and the offline bank
// generator, so the engine a player faces is the engine that verified the board.
//
// RULES, the English/American set, not international:
//   - 8x8, play on the dark squares only, here the squares where (r + c) is odd.
//   - You are RED and move UP the board (towards row 0), crowning on row 0.
//     Black moves down and crowns on row 7.
//   - Men step one square diagonally forward, kings one square in any of the
//     four diagonals. No flying kings.
//   - CAPTURES ARE COMPULSORY. If any jump exists you must take one, and a jump
//     must be continued for as long as the same piece can keep jumping.
//   - Men may not jump backwards.
//   - Crowning ENDS the turn: a man that reaches the far row is crowned even in
//     the middle of a jump chain, and stops there.
//
// SQUARES. `cells` is a flat Int8Array of 64, index r * 8 + c:
//   0 empty, 1 red man, 2 red king, 3 black man, 4 black king.

export const SIZE = 8;
export const EMPTY = 0, RED_MAN = 1, RED_KING = 2, BLK_MAN = 3, BLK_KING = 4;

export const isRed = (v) => v === RED_MAN || v === RED_KING;
export const isBlk = (v) => v === BLK_MAN || v === BLK_KING;
export const isKing = (v) => v === RED_KING || v === BLK_KING;
export const playable = (r, c) => ((r + c) & 1) === 1;
const onBoard = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

export const newBoard = () => new Int8Array(SIZE * SIZE);
export const clone = (b) => Int8Array.from(b);
export const serialize = (b) => Array.from(b).join('');
export const deserialize = (s) => Int8Array.from(s.split('').map(Number));

const DIRS_RED = [[-1, -1], [-1, 1]];
const DIRS_BLK = [[1, -1], [1, 1]];
const DIRS_ALL = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const dirsFor = (v) => (isKing(v) ? DIRS_ALL : isRed(v) ? DIRS_RED : DIRS_BLK);

export function countPieces(b, red) {
  let n = 0;
  for (let i = 0; i < b.length; i++) if (red ? isRed(b[i]) : isBlk(b[i])) n++;
  return n;
}

// Every jump chain available to the piece on (r,c), as a list of moves. A move
// is { from, to, path: [squares landed on], caught: [squares emptied], crowned }.
function jumpsFrom(b, r, c, seedPath, seedCaught) {
  const v = b[r * SIZE + c];
  const out = [];
  const enemy = isRed(v) ? isBlk : isRed;
  const crownRow = isRed(v) ? 0 : SIZE - 1;
  let any = false;
  for (const [dr, dc] of dirsFor(v)) {
    const mr = r + dr, mc = c + dc, tr = r + 2 * dr, tc = c + 2 * dc;
    if (!onBoard(tr, tc)) continue;
    if (!enemy(b[mr * SIZE + mc])) continue;
    if (b[tr * SIZE + tc] !== EMPTY) continue;
    any = true;
    const nb = clone(b);
    nb[r * SIZE + c] = EMPTY;
    nb[mr * SIZE + mc] = EMPTY;
    const crowned = !isKing(v) && tr === crownRow;
    nb[tr * SIZE + tc] = crowned ? (isRed(v) ? RED_KING : BLK_KING) : v;
    const path = [...seedPath, tr * SIZE + tc];
    const caught = [...seedCaught, mr * SIZE + mc];
    // Crowning stops the chain dead, which is the English rule and the reason
    // some pretty multi-jumps are simply not legal here.
    const more = crowned ? [] : jumpsFrom(nb, tr, tc, path, caught);
    if (more.length) out.push(...more);
    else out.push({ board: nb, from: path[0], to: tr * SIZE + tc, path, caught, crowned });
  }
  void any;
  return out;
}

// All legal moves for a side. Jumps, if any exist anywhere, are the only legal
// moves: that is what makes so much of a Check line forced.
export function legalMoves(b, red) {
  const mine = red ? isRed : isBlk;
  const jumps = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = b[r * SIZE + c];
    if (!v || !mine(v)) continue;
    jumps.push(...jumpsFrom(b, r, c, [r * SIZE + c], []));
  }
  if (jumps.length) return jumps;
  const quiet = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    const v = b[r * SIZE + c];
    if (!v || !mine(v)) continue;
    const crownRow = isRed(v) ? 0 : SIZE - 1;
    for (const [dr, dc] of dirsFor(v)) {
      const tr = r + dr, tc = c + dc;
      if (!onBoard(tr, tc) || b[tr * SIZE + tc] !== EMPTY) continue;
      const nb = clone(b);
      nb[r * SIZE + c] = EMPTY;
      const crowned = !isKing(v) && tr === crownRow;
      nb[tr * SIZE + tc] = crowned ? (isRed(v) ? RED_KING : BLK_KING) : v;
      quiet.push({ board: nb, from: r * SIZE + c, to: tr * SIZE + tc, path: [r * SIZE + c, tr * SIZE + tc], caught: [], crowned });
    }
  }
  return quiet;
}

export const moveKey = (m) => `${m.from}-${m.path.join('.')}`;

// ── the board-clear search ────────────────────────────────────────────────
// clearIn(board, budget) = the fewest RED moves that capture every black piece
// against Black's stiffest defence, or Infinity if it cannot be done inside the
// budget. Depth-bounded, so it answers any position, on or off the puzzle line,
// which is what lets a wrong move play out instead of being refused.
//
// ⚠️ BUDGET CONVENTION, and it is easy to get wrong. `budget` is decremented on
// BLACK's move, not every ply, and the return value counts only RED's moves. So
// from a red-to-move node, budget B allows exactly B red moves, and from a
// BLACK-to-move node, budget B allows B - 1 more red moves.
//
// Which means: to ask "after this red move, can the rest still fall?", call
//     clearIn(childBoard, B, false) <= B - 1
// passing the SAME budget B, not B - 1. Calling it with B - 1 quietly says the
// sweep is impossible on every board, which is exactly the bug the client
// simulation caught before launch.
const INF = Infinity;

export function clearIn(b, budget, redToMove = true, memo = new Map()) {
  if (countPieces(b, false) === 0) return 0;
  if (budget <= 0) return INF;
  const key = serialize(b) + (redToMove ? 'R' : 'B') + budget;
  const hit = memo.get(key);
  if (hit !== undefined) return hit;
  let best;
  const moves = legalMoves(b, redToMove);
  if (!moves.length) {
    // A side with no move is stuck. Black still has pieces, so the board was
    // never cleared and the objective fails either way.
    best = INF;
  } else if (redToMove) {
    best = INF;
    for (const m of moves) {
      const v = clearIn(m.board, budget, false, memo);
      const cost = v === INF ? INF : v + 1;
      if (cost < best) best = cost;
      if (best === 1) break;
    }
  } else {
    best = 0;
    for (const m of moves) {
      const v = clearIn(m.board, budget - 1, true, memo);
      if (v > best) best = v;
      if (best === INF) break;
    }
  }
  memo.set(key, best);
  return best;
}

// Every red first move, with the clear distance it leads to.
export function scoreMoves(b, budget) {
  const memo = new Map();
  return legalMoves(b, true).map((m) => {
    const v = clearIn(m.board, budget, false, memo);
    return { move: m, clear: v === INF ? INF : v + 1 };
  });
}

// Deterministic ordering from the puzzle id, so every player meets the same
// defence and the leaderboard compares like with like.
export function idOrder(quizId, n) {
  let h = 2166136261;
  for (let i = 0; i < quizId.length; i++) { h ^= quizId.charCodeAt(i); h = Math.imul(h, 16777619); }
  const pool = Array.from({ length: n }, (_, i) => i);
  const out = [];
  while (pool.length) {
    h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

// Black's reply: the move that makes the clear take longest, or puts it out of
// reach altogether. Ties break on the puzzle's own order, never at random.
export function blackReply(b, budget, quizId) {
  const moves = legalMoves(b, false);
  if (!moves.length) return null;
  const memo = new Map();
  const scored = moves.map((m) => ({ m, v: clearIn(m.board, budget - 1, true, memo) }));
  const order = idOrder(quizId, scored.length);
  let best = null, bestI = -1;
  scored.forEach((s, i) => {
    if (!best || s.v > best.v || (s.v === best.v && order.indexOf(i) < order.indexOf(bestI))) { best = s; bestI = i; }
  });
  return best.m;
}
