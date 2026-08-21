// The engine behind Race, the daily pawn-race endgame (the game the abstract
// world knows as a Breakthrough endgame).
//
// Rules, all of them: pawns only. A pawn moves ONE square straight forward
// onto an empty square, or one square DIAGONALLY forward onto an empty square
// or an enemy pawn (the capture; straight captures do not exist). The first
// pawn to reach the far rank wins on the spot, and a side with no pawn left,
// or no legal move, loses. Every move advances a pawn one rank, so the game
// always ends and there is no draw of any kind.
//
// That monotone advance is also why the position is EXACTLY solvable: the game
// tree is a DAG, so a memoized search settles every reachable position with no
// cycle handling at all. Black's play is therefore PERFECT, not heuristic, and
// the reply the bank generator assumed is by construction the reply the
// browser plays. The bank keeps every board's reachable universe small enough
// that the full solve runs in milliseconds.
//
// Cells: index = row * cols + col, row 0 the TOP of the screen (White's far
// rank, the finish line) and row rows-1 the bottom (Black's). White moves up,
// Black moves down, exactly as drawn. Cell names are file letter + rank number
// with rank 1 at the bottom, so 'a1' is the bottom-left corner.
//
// Shared by the client (RaceClient.jsx) and the bank generator
// (scripts/gen-race.mjs). The verifier (scripts/verify-race.mjs) deliberately
// does NOT import this module: it re-proves every board with its own solver,
// per the two-independent-solvers rule.

export function cellName(sq, cols, rows) {
  const r = Math.floor(sq / cols), c = sq % cols;
  return String.fromCharCode(97 + c) + String(rows - r);
}
export function cellFromName(name, cols, rows) {
  const c = name.charCodeAt(0) - 97;
  const rank = Number(name.slice(1));
  return (rows - rank) * cols + c;
}
export const raceUci = (from, to, cols, rows) => cellName(from, cols, rows) + cellName(to, cols, rows);

// { cols, rows, w: sorted array of cells, b: sorted array, stm: 'w' | 'b' }
export function makePosition(cols, rows, whiteNames, blackNames, stm = 'w') {
  const w = whiteNames.map((n) => cellFromName(n, cols, rows)).sort((a, b) => a - b);
  const b = blackNames.map((n) => cellFromName(n, cols, rows)).sort((a, b) => a - b);
  return { cols, rows, w, b, stm };
}

// Compact NUMERIC memo key. Cells are < 64 and a side never has more than
// three pawns (the banks are all 3-a-side; four slots are packed for slack),
// so the whole position folds into one safe integer: eight base-65 digits
// (65 = the 64 cells plus a pad sentinel for a captured pawn) and the side to
// move. Integer keys make the memo Map several times faster than string keys,
// which is what lets the browser solve a board exactly.
const PAD = 64;
function keyOf(s) {
  let k = s.stm === 'w' ? 1 : 0;
  for (let i = 0; i < 4; i++) k = k * 65 + (i < s.w.length ? s.w[i] : PAD);
  for (let i = 0; i < 4; i++) k = k * 65 + (i < s.b.length ? s.b[i] : PAD);
  return k;
}

// Legal moves for the side to move. `goal` on a move means it lands on the far
// rank and ends the game the moment it is played.
export function raceMoves(s) {
  const { cols, rows, stm } = s;
  const mine = stm === 'w' ? s.w : s.b;
  const theirs = stm === 'w' ? s.b : s.w;
  const dir = stm === 'w' ? -1 : 1;
  const goalRow = stm === 'w' ? 0 : rows - 1;
  const mineSet = new Set(mine), theirSet = new Set(theirs);
  const out = [];
  for (const from of mine) {
    const r = Math.floor(from / cols), c = from % cols;
    const rr = r + dir;
    if (rr < 0 || rr >= rows) continue;
    for (const dc of [0, -1, 1]) {
      const cc = c + dc;
      if (cc < 0 || cc >= cols) continue;
      const to = rr * cols + cc;
      if (mineSet.has(to)) continue;
      const enemy = theirSet.has(to);
      if (dc === 0 && enemy) continue;         // straight captures do not exist
      out.push({ from, to, capture: enemy, goal: rr === goalRow, uci: raceUci(from, to, cols, rows) });
    }
  }
  return out;
}

export function raceApply(s, mv) {
  const mine = (s.stm === 'w' ? s.w : s.b).filter((x) => x !== mv.from).concat(mv.to).sort((a, b) => a - b);
  const theirs = (s.stm === 'w' ? s.b : s.w).filter((x) => x !== mv.to);
  return s.stm === 'w'
    ? { cols: s.cols, rows: s.rows, w: mine, b: theirs, stm: 'b' }
    : { cols: s.cols, rows: s.rows, w: theirs, b: mine, stm: 'w' };
}

// Full solve with a shared memo: { win: 'w' | 'b', d: plies to the end with
// best play (the winner hurries, the loser drags its feet) }. Create one memo
// per board (makeSolver) so a session cannot grow one without bound. The
// optional cap aborts a solve whose reachable tree outgrows it (by throwing);
// the bank generator uses it to reject oversized deals cheaply, and the
// client never passes one because every banked board is proven small.
export function makeSolver(cap) {
  const memo = new Map();
  function solve(s) {
    if (cap && memo.size > cap) throw new Error('race-solver-cap');
    const k = keyOf(s);
    const hit = memo.get(k);
    if (hit) return hit;
    const mine = s.stm === 'w' ? s.w : s.b;
    const opp = s.stm === 'w' ? 'b' : 'w';
    let val;
    if (!mine.length) val = { win: opp, d: 0 };
    else {
      const moves = raceMoves(s);
      if (!moves.length) val = { win: opp, d: 0 };
      else {
        let bestWin = null, worstLose = null;
        for (const mv of moves) {
          if (mv.goal) { bestWin = { win: s.stm, d: 1 }; break; }
          const child = solve(raceApply(s, mv));
          if (child.win === s.stm) {
            if (!bestWin || child.d + 1 < bestWin.d) bestWin = { win: s.stm, d: child.d + 1 };
          } else if (!worstLose || child.d + 1 > worstLose.d) worstLose = { win: opp, d: child.d + 1 };
        }
        val = bestWin || worstLose;
      }
    }
    memo.set(k, val);
    return val;
  }
  return { solve, size: () => memo.size };
}

// The engine's reply, fully deterministic so every player faces the same
// opponent: when winning, the fastest win; when losing, the reply that drags
// the loss out longest. Ties break to the capture, then the lowest UCI string,
// which cannot tie. Returns null only when there is no legal move at all.
export function engineReply(s, solver) {
  const moves = raceMoves(s);
  if (!moves.length) return null;
  let best = null;
  for (const mv of moves) {
    let win, d;
    if (mv.goal) { win = s.stm; d = 1; }
    else { const child = solver.solve(raceApply(s, mv)); win = child.win; d = child.d + 1; }
    const cand = { mv, wins: win === s.stm, d, cap: mv.capture ? 1 : 0 };
    let better;
    if (!best) better = true;
    else if (cand.wins !== best.wins) better = cand.wins;
    else if (cand.wins) better = cand.d < best.d || (cand.d === best.d && (cand.cap > best.cap || (cand.cap === best.cap && cand.mv.uci < best.mv.uci)));
    else better = cand.d > best.d || (cand.d === best.d && (cand.cap > best.cap || (cand.cap === best.cap && cand.mv.uci < best.mv.uci)));
    if (better) best = cand;
  }
  return best.mv;
}

// Display notation for the move list: "c4-c5", "b4xc5".
export function raceSan(mv, cols, rows) {
  return `${cellName(mv.from, cols, rows)}${mv.capture ? 'x' : '-'}${cellName(mv.to, cols, rows)}`;
}
