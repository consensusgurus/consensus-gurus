// Dots-and-boxes rules + exact endgame solver for Chain, the daily box game.
//
// Shared by the browser client (app/chain/ChainClient.jsx), the offline bank
// generator and scripts/verify-chain.mjs, so the engine a player faces is
// byte-for-byte the engine that verified the puzzle.
//
// BOARD. `rows` x `cols` boxes on a (rows+1) x (cols+1) grid of dots. Edges are
// numbered horizontals first, then verticals:
//
//   h(r, c) = r * cols + c                     for r in 0..rows,   c in 0..cols-1
//   v(r, c) = H + r * (cols + 1) + c           for r in 0..rows-1, c in 0..cols
//   H = (rows + 1) * cols          E = H + rows * (cols + 1)
//
// Box (r, c) is bounded by h(r,c) above, h(r+1,c) below, v(r,c) left and
// v(r,c+1) right. Drawing the fourth edge of a box CAPTURES it: the mover
// scores it and must move AGAIN. One edge can complete two boxes at once.
//
// VALUE. The solver works on the set of edges still undrawn, and returns the
// net box margin the side to move can still force from here, counting only
// boxes not yet captured. It is a function of that edge set ALONE, never of
// the score already on the board, which is the whole reason a plain memo on
// the edge bitmask is exact:
//
//   value(S) = max over e in S of
//                k > 0 ? k + value(S - e)     (capture: the same player moves again)
//                      : -value(S - e)        (no capture: the turn passes)
//   value({}) = 0
//
// So the final margin of a position is (myBoxes - theirBoxes) + value(S) for
// the side to move, and the position is WON for the mover when that is > 0.
//
// The endgame this game is picked up in is the one where taking every box on
// offer loses: handing back the last two of a chain (the double-cross) keeps
// the opponent on move and gives you every chain after it. The solver has no
// special knowledge of chains or loops. It just searches, and the double-cross
// falls out of the search.

export function geometry(rows, cols) {
  const H = (rows + 1) * cols;
  const V = rows * (cols + 1);
  const E = H + V;
  const h = (r, c) => r * cols + c;
  const v = (r, c) => H + r * (cols + 1) + c;
  const boxEdges = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) boxEdges.push([h(r, c), h(r + 1, c), v(r, c), v(r, c + 1)]);
  }
  // Which boxes does each edge border? One on the rim, two inside.
  const edgeBoxes = Array.from({ length: E }, () => []);
  boxEdges.forEach((es, b) => es.forEach((e) => edgeBoxes[e].push(b)));
  return { rows, cols, H, V, E, h, v, boxEdges, edgeBoxes };
}

// A position is serialised as two strings:
//   drawn  E chars, '1' if the edge is already drawn
//   owner  rows*cols chars, '0' unclaimed, '1' yours, '2' the engine's
export function parsePosition(p) {
  const g = geometry(p.rows, p.cols);
  if (p.drawn.length !== g.E) throw new Error(`drawn is ${p.drawn.length} chars, expected ${g.E}`);
  if (p.owner.length !== g.rows * g.cols) throw new Error(`owner is ${p.owner.length} chars, expected ${g.rows * g.cols}`);
  const drawn = new Uint8Array(g.E);
  for (let i = 0; i < g.E; i++) drawn[i] = p.drawn.charCodeAt(i) === 49 ? 1 : 0;
  const owner = new Uint8Array(g.rows * g.cols);
  for (let i = 0; i < owner.length; i++) owner[i] = p.owner.charCodeAt(i) - 48;
  return { g, drawn, owner };
}

// Every box that `drawn` has completed, regardless of who owns it.
export function completedBoxes(g, drawn) {
  const out = [];
  for (let b = 0; b < g.boxEdges.length; b++) {
    if (g.boxEdges[b].every((e) => drawn[e])) out.push(b);
  }
  return out;
}

export function boxScore(owner) {
  let mine = 0, theirs = 0;
  for (const o of owner) { if (o === 1) mine++; else if (o === 2) theirs++; }
  return { mine, theirs };
}

// ── Solver ─────────────────────────────────────────────────────────────────
//
// The search runs in a compacted index space: only the edges still undrawn at
// the ROOT get a bit, so a position with 16 edges left searches subsets of a
// 16-bit mask however big the board is. Bit i is set while remaining edge i is
// still undrawn.

export function makeSolver(g, drawn) {
  const rem = [];
  for (let e = 0; e < g.E; e++) if (!drawn[e]) rem.push(e);
  const n = rem.length;
  if (n > 30) throw new Error(`${n} edges left; the solver indexes at most 30`);
  const slot = new Map();
  rem.forEach((e, i) => slot.set(e, i));

  // For each remaining edge, the boxes it can complete, each as the mask of
  // that box's OTHER edges that are also still undrawn. The box completes when
  // that mask is clear. Edges already drawn at the root are simply absent from
  // the mask, which is what makes the test a single AND.
  const capBoxes = [];   // capBoxes[i] = [boxIndex, ...]
  const capMasks = [];   // capMasks[i] = [otherRemainingMask, ...]
  for (let i = 0; i < n; i++) {
    const e = rem[i];
    const bs = [], ms = [];
    for (const b of g.edgeBoxes[e]) {
      let m = 0;
      for (const o of g.boxEdges[b]) {
        if (o === e) continue;
        const s = slot.get(o);
        if (s !== undefined) m |= 1 << s;
      }
      bs.push(b); ms.push(m);
    }
    capBoxes.push(bs); capMasks.push(ms);
  }

  const full = (1 << n) - 1;

  // How many boxes does drawing remaining-edge i complete, in state `mask`?
  // `mask` still contains bit i: the edge is about to be drawn.
  function gain(mask, i) {
    const after = mask & ~(1 << i);
    const ms = capMasks[i];
    let k = 0;
    for (let j = 0; j < ms.length; j++) if ((after & ms[j]) === 0) k++;
    return k;
  }

  // Which boxes does drawing remaining-edge i complete? For the client.
  function gainedBoxes(mask, i) {
    const after = mask & ~(1 << i);
    const ms = capMasks[i], bs = capBoxes[i], out = [];
    for (let j = 0; j < ms.length; j++) if ((after & ms[j]) === 0) out.push(bs[j]);
    return out;
  }

  const tt = new Map(); // mask -> [lower, upper]
  let nodes = 0;

  function negamax(mask, alpha, beta) {
    if (mask === 0) return 0;
    nodes++;

    const hit = tt.get(mask);
    if (hit !== undefined) {
      if (hit[0] >= beta) return hit[0];
      if (hit[1] <= alpha) return hit[1];
      if (hit[0] > alpha) alpha = hit[0];
      if (hit[1] < beta) beta = hit[1];
      if (alpha >= beta) return alpha;
    }
    const alpha0 = alpha, beta0 = beta;

    // Move ordering: doubles, then singles, then the quiet edges. Capturing
    // moves are usually right, and they cause the cutoffs that keep this cheap.
    const two = [], one = [], zero = [];
    let m = mask;
    while (m) {
      const bit = m & -m;
      const i = 31 - Math.clz32(bit);
      m ^= bit;
      const k = gain(mask, i);
      (k === 2 ? two : k === 1 ? one : zero).push(i);
    }

    let best = -64;
    const order = two.concat(one, zero);
    const twoLen = two.length, oneLen = one.length;
    for (let q = 0; q < order.length; q++) {
      const i = order[q];
      const k = q < twoLen ? 2 : q < twoLen + oneLen ? 1 : 0;
      const nm = mask & ~(1 << i);
      // A capture keeps the move, so the same player continues and the window
      // shifts by the boxes banked. A quiet move hands the turn over.
      const v = k > 0 ? k + negamax(nm, alpha - k, beta - k) : -negamax(nm, -beta, -alpha);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }

    if (best <= alpha0) tt.set(mask, [-64, best]);
    else if (best >= beta0) tt.set(mask, [best, 64]);
    else tt.set(mask, [best, best]);
    return best;
  }

  return {
    rem, n, full, slot, gain, gainedBoxes,
    get nodes() { return nodes; },
    // Net box margin the side to move can force from `mask`.
    value(mask = full, alpha = -64, beta = 64) { return negamax(mask, alpha, beta); },
    // Every legal move from `mask`, scored as the final net margin the MOVER
    // ends up with. A capture keeps the turn, so its score adds the boxes taken
    // to the value of the position that same player then faces; a quiet move
    // hands over, so its score is the negation.
    scoreMoves(mask = full) {
      const out = [];
      let m = mask;
      while (m) {
        const bit = m & -m;
        const i = 31 - Math.clz32(bit);
        m ^= bit;
        const k = gain(mask, i);
        const nm = mask & ~(1 << i);
        const score = k > 0 ? k + negamax(nm, -64, 64) : -negamax(nm, -64, 64);
        out.push({ i, edge: rem[i], gain: k, score });
      }
      return out;
    },
  };
}

// ── A live game ────────────────────────────────────────────────────────────
//
// One object the client, the generator and scripts/verify-chain.mjs all drive,
// so the turn and capture bookkeeping a player sees is the same code the bank
// was verified with. `turn` is 1 for you and 2 for the engine; you always move
// first from a puzzle position.
export function makeGame(p) {
  const { g, drawn, owner } = parsePosition(p);
  const solver = makeSolver(g, drawn);
  const st = {
    g, solver, owner,
    mask: solver.full,
    turn: 1,
    get over() { return st.mask === 0; },
    // Your boxes minus the engine's, right now.
    get margin() { const s = boxScore(st.owner); return s.mine - s.theirs; },
    get score() { return boxScore(st.owner); },
    // Remaining-edge indices still playable, as {i, edge} pairs.
    moves() {
      const out = [];
      let m = st.mask;
      while (m) { const bit = m & -m; const i = 31 - Math.clz32(bit); m ^= bit; out.push({ i, edge: solver.rem[i] }); }
      return out;
    },
    // The best final margin YOU can still reach from here, whoever is on move.
    outlook() {
      if (st.mask === 0) return st.margin;
      const v = solver.value(st.mask);
      return st.turn === 1 ? st.margin + v : st.margin - v;
    },
    // Draw remaining-edge i. Returns the boxes captured; the mover keeps the
    // turn whenever that list is non-empty, which is the whole game.
    play(i) {
      const gained = solver.gainedBoxes(st.mask, i);
      st.mask &= ~(1 << i);
      for (const b of gained) st.owner[b] = st.turn;
      if (!gained.length) st.turn = st.turn === 1 ? 2 : 1;
      return gained;
    },
  };
  return st;
}

// Deterministic tie-break order over remaining edges, derived from the puzzle
// id, so every player faces the same defence and the leaderboard compares like
// with like. Ties among equally good engine replies break by this, never at
// random.
export function idOrder(quizId, n) {
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

// The engine's reply: the highest-scoring edge, ties broken by the puzzle's own
// deterministic order.
export function engineMove(solver, mask, quizId) {
  const scored = solver.scoreMoves(mask);
  if (!scored.length) return null;
  const order = idOrder(quizId, solver.n);
  let best = null;
  for (const s of scored) {
    if (!best || s.score > best.score || (s.score === best.score && order.indexOf(s.i) < order.indexOf(best.i))) best = s;
  }
  return best;
}
