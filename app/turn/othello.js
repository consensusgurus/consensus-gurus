// Othello (Reversi) rules + an exact endgame solver for Turn, the daily
// flip game.
//
// Shared by the browser client (app/turn/TurnClient.jsx), the offline bank
// generator and scripts/verify-turn.mjs, so the engine a player faces is
// byte-for-byte the engine that verified the puzzle.
//
// BOARD. 64 squares, index = row * 8 + col, row 0 at the top. A position is a
// 64-character string: '0' empty, '1' yours, '2' the engine's. The side to move
// at the root of a puzzle is ALWAYS 1, which is what lets the client, the
// generator and the verifier all speak the same language about "you".
//
// RULES, in full, because the endgame is where the unusual ones bite:
//   - a move must outflank: placing on an empty square must sandwich at least
//     one unbroken run of enemy discs between the new disc and one of your own,
//     along a rank, file or diagonal. Every disc so sandwiched flips;
//   - a player with no legal move PASSES, and the turn goes back. This is not a
//     rare technicality at ten empties, it is most of the tactics;
//   - the game ends when NEITHER side can move, which is usually a full board
//     but not always;
//   - the winner is whoever has more discs at the end. A tie is a tie, and this
//     game treats a tie as a failure to convert: only margin > 0 is a win.
//
// VALUE. `solve` returns the exact final DISC MARGIN for the side to move, with
// best play from both sides. Not a win/loss flag and not a heuristic score: the
// real number the board ends on. The client shows the outlook derived from it,
// which is what makes an error visible the moment it is made rather than twenty
// discs later.
//
// This is a pure endgame solver. It has no opening book, no positional weights
// and no notion that corners are good. It searches to the end of the game, so
// everything the puzzle is about (parity, mobility, the poisoned corner grab)
// falls out of the search rather than being taught to it.

export const EMPTY = 0, YOU = 1, FOE = 2;
export const other = (p) => (p === YOU ? FOE : YOU);

// ── geometry ───────────────────────────────────────────────────────────────
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// RAYS[sq][d] is the list of squares walking away from sq in direction d.
export const RAYS = (() => {
  const out = [];
  for (let sq = 0; sq < 64; sq++) {
    const r = sq >> 3, c = sq & 7;
    const per = [];
    for (const [dr, dc] of DIRS) {
      const line = [];
      let rr = r + dr, cc = c + dc;
      while (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) { line.push(rr * 8 + cc); rr += dr; cc += dc; }
      per.push(line);
    }
    out.push(per);
  }
  return out;
})();

export const CORNERS = [0, 7, 56, 63];
export const SQ_NAME = (sq) => `${'abcdefgh'[sq & 7]}${8 - (sq >> 3)}`;

// ── position ───────────────────────────────────────────────────────────────
export function parseBoard(s) {
  if (typeof s !== 'string' || s.length !== 64 || !/^[012]+$/.test(s)) {
    throw new Error(`board must be 64 chars of 0/1/2, got ${typeof s === 'string' ? `${s.length} chars` : typeof s}`);
  }
  const b = new Int8Array(64);
  for (let i = 0; i < 64; i++) b[i] = s.charCodeAt(i) - 48;
  return b;
}
export const boardString = (b) => Array.from(b).join('');

export function discs(b) {
  let mine = 0, theirs = 0, empty = 0;
  for (let i = 0; i < 64; i++) { const v = b[i]; if (v === YOU) mine++; else if (v === FOE) theirs++; else empty++; }
  return { mine, theirs, empty };
}

// Squares that would flip if `me` played `sq`. Empty array means illegal.
export function flipsAt(b, sq, me) {
  if (b[sq] !== EMPTY) return [];
  const foe = other(me);
  const out = [];
  const rays = RAYS[sq];
  for (let d = 0; d < 8; d++) {
    const line = rays[d];
    let k = 0;
    while (k < line.length && b[line[k]] === foe) k++;
    if (k > 0 && k < line.length && b[line[k]] === me) {
      for (let j = 0; j < k; j++) out.push(line[j]);
    }
  }
  return out;
}

export function legalMoves(b, me) {
  const out = [];
  for (let sq = 0; sq < 64; sq++) {
    if (b[sq] !== EMPTY) continue;
    const f = flipsAt(b, sq, me);
    if (f.length) out.push({ sq, flips: f });
  }
  return out;
}
// How many legal moves `me` has, without building the move list. The search
// orders on this and calls it a lot, so it counts rather than collects.
export function mobility(b, me) {
  let n = 0;
  const foe = other(me);
  for (let sq = 0; sq < 64; sq++) {
    if (b[sq] !== EMPTY) continue;
    const rays = RAYS[sq];
    for (let d = 0; d < 8; d++) {
      const line = rays[d];
      let k = 0;
      while (k < line.length && b[line[k]] === foe) k++;
      if (k > 0 && k < line.length && b[line[k]] === me) { n++; break; }
    }
  }
  return n;
}

export function hasMove(b, me) {
  for (let sq = 0; sq < 64; sq++) {
    if (b[sq] !== EMPTY) continue;
    const foe = other(me);
    const rays = RAYS[sq];
    for (let d = 0; d < 8; d++) {
      const line = rays[d];
      let k = 0;
      while (k < line.length && b[line[k]] === foe) k++;
      if (k > 0 && k < line.length && b[line[k]] === me) return true;
    }
  }
  return false;
}

// Apply in place and return the flip list, so it can be undone without copying
// the board. The search leans on this hard.
export function applyMove(b, sq, me, flips) {
  const f = flips || flipsAt(b, sq, me);
  b[sq] = me;
  for (let i = 0; i < f.length; i++) b[f[i]] = me;
  return f;
}
export function undoMove(b, sq, me, flips) {
  b[sq] = EMPTY;
  const foe = other(me);
  for (let i = 0; i < flips.length; i++) b[flips[i]] = foe;
}

// ── the solver ─────────────────────────────────────────────────────────────
//
// Plain negamax with alpha-beta and a transposition table, searching to the end
// of the game and returning the exact final disc margin for the side to move.
// At ten to twelve empties that is cheap enough to run in the browser once per
// turn, which is measured by the generator and asserted by the verifier rather
// than assumed.
//
// Move ordering is the only cleverness, and it is deliberately shallow: corners
// first (they never flip back, so they usually cut), then FEWEST flips. Taking
// the fewest discs early is the standard mobility heuristic, and it produces
// the cutoffs. Note that it is only an ORDERING: the search still refutes it,
// which is exactly why a bank built on this solver can honestly contain days
// where the greedy move is right and the quiet move loses.
const CORNER_SET = new Set(CORNERS);

export function makeSolver() {
  const tt = new Map();
  let nodes = 0;

  // Packed board key: 2 bits a square across four 32-bit words, plus the mover.
  function key(b, me) {
    let a = 0, c = 0, d = 0, e = 0;
    for (let i = 0; i < 16; i++) a = a * 3 + b[i];
    for (let i = 16; i < 32; i++) c = c * 3 + b[i];
    for (let i = 32; i < 48; i++) d = d * 3 + b[i];
    for (let i = 48; i < 64; i++) e = e * 3 + b[i];
    return `${a},${c},${d},${e},${me}`;
  }

  function terminal(b, me) {
    const { mine, theirs } = discs(b);
    return me === YOU ? mine - theirs : theirs - mine;
  }

  function negamax(b, me, alpha, beta, passed, empties) {
    nodes++;
    const moves = legalMoves(b, me);
    if (!moves.length) {
      if (passed) return terminal(b, me);
      return -negamax(b, other(me), -beta, -alpha, true, empties);
    }
    const k = key(b, me);
    const hit = tt.get(k);
    if (hit !== undefined) {
      if (hit[0] >= beta) return hit[0];
      if (hit[1] <= alpha) return hit[1];
      if (hit[0] > alpha) alpha = hit[0];
      if (hit[1] < beta) beta = hit[1];
      if (alpha >= beta) return alpha;
    }
    const alpha0 = alpha, beta0 = beta;

    // Ordering. Corners first: they never flip back, so they cut early. Then,
    // while there is still enough board left for it to pay for itself, by the
    // number of replies the move LEAVES the opponent, fewest first. Restricting
    // the opponent is what actually decides an Othello endgame, and ordering on
    // it collapses the tree; near the leaves the extra move generation costs
    // more than it saves, so there it falls back to the flip count.
    if (moves.length > 1) {
      if (empties > 7) {
        for (let i = 0; i < moves.length; i++) {
          const m = moves[i];
          applyMove(b, m.sq, me, m.flips);
          m.rank = CORNER_SET.has(m.sq) ? -1 : mobility(b, other(me));
          undoMove(b, m.sq, me, m.flips);
        }
        moves.sort((x, y) => x.rank - y.rank);
      } else {
        moves.sort((x, y) => {
          const cx = CORNER_SET.has(x.sq) ? 0 : 1, cy = CORNER_SET.has(y.sq) ? 0 : 1;
          if (cx !== cy) return cx - cy;
          return x.flips.length - y.flips.length;
        });
      }
    }

    let best = -99;
    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      applyMove(b, m.sq, me, m.flips);
      const v = -negamax(b, other(me), -beta, -alpha, false, empties - 1);
      undoMove(b, m.sq, me, m.flips);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }

    if (best <= alpha0) tt.set(k, [-99, best]);
    else if (best >= beta0) tt.set(k, [best, 99]);
    else tt.set(k, [best, best]);
    return best;
  }

  return {
    get nodes() { return nodes; },
    reset() { tt.clear(); nodes = 0; },
    // Exact final disc margin for the side to move.
    value(b, me, alpha = -99, beta = 99) { return negamax(b, me, alpha, beta, false, discs(b).empty); },
    // Every legal move, each scored as the final margin the MOVER ends on.
    scoreMoves(b, me) {
      const out = [];
      for (const m of legalMoves(b, me)) {
        applyMove(b, m.sq, me, m.flips);
        const v = -negamax(b, other(me), -99, 99, false, discs(b).empty);
        undoMove(b, m.sq, me, m.flips);
        out.push({ sq: m.sq, flips: m.flips.length, score: v });
      }
      return out;
    },
  };
}

// ── a live game ────────────────────────────────────────────────────────────
//
// One object the client, the generator and the verifier all drive. `turn` is 1
// for you and 2 for the engine; you always move first from a puzzle position.
// A side with no legal move passes automatically, and `passes` records it so
// the client can say so out loud instead of silently handing the move back.
export function makeGame(p) {
  const b = parseBoard(p.board);
  const solver = makeSolver();
  const st = {
    b, solver,
    turn: YOU,
    passes: [],
    get over() { return !hasMove(st.b, YOU) && !hasMove(st.b, FOE); },
    get score() { return discs(st.b); },
    // Your discs minus the engine's, right now.
    get margin() { const s = discs(st.b); return s.mine - s.theirs; },
    moves() { return st.over ? [] : legalMoves(st.b, st.turn); },
    // The best final margin YOU can still reach from here, whoever is on move.
    outlook() {
      if (st.over) return st.margin;
      const v = solver.value(st.b, st.turn);
      return st.turn === YOU ? v : -v;
    },
    // Play a square for the side to move. Returns the discs flipped. After the
    // move the turn passes, EXCEPT that a side with nothing to play is skipped,
    // which can hand the move straight back.
    play(sq) {
      const flips = flipsAt(st.b, sq, st.turn);
      if (!flips.length) return null;
      applyMove(st.b, sq, st.turn, flips);
      const next = other(st.turn);
      if (hasMove(st.b, next)) st.turn = next;
      else if (hasMove(st.b, st.turn)) st.passes.push(next);   // they pass, you go again
      return flips;
    },
  };
  return st;
}

// The standard opening four, used by the generator and by the verifier's
// reachability proof. `blackLabel` is which of the two labels moves first.
export function startBoard(blackLabel = YOU) {
  const w = blackLabel === YOU ? FOE : YOU;
  const b = new Int8Array(64);
  // d5 and e4 are black, e5 and d4 are white, the standard opening four.
  b[27] = blackLabel; b[28] = w; b[35] = w; b[36] = blackLabel;
  return b;
}

// Deterministic tie-break order over squares, derived from the puzzle id, so
// every player faces the same defence and the leaderboard compares like with
// like. Ties among equally good engine replies break by this, never at random.
export function idOrder(quizId, n = 64) {
  let h = 2166136261;
  for (let i = 0; i < quizId.length; i++) { h ^= quizId.charCodeAt(i); h = Math.imul(h, 16777619); }
  const pool = []; for (let i = 0; i < n; i++) pool.push(i);
  const out = [];
  while (pool.length) {
    h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

// The engine's reply: the highest-scoring square, ties broken by the puzzle's
// own deterministic order.
export function engineMove(st, quizId) {
  const scored = st.solver.scoreMoves(st.b, st.turn);
  if (!scored.length) return null;
  const order = idOrder(quizId);
  let best = null;
  for (const s of scored) {
    if (!best || s.score > best.score || (s.score === best.score && order.indexOf(s.sq) < order.indexOf(best.sq))) best = s;
  }
  return best;
}
