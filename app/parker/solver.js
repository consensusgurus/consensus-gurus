// Sliding-block rules and the exact solver behind Parker.
//
// Shared by the browser client (app/parker/ParkerClient.jsx) and the offline bank
// generator, so the minimum a player is scored against is the one that was verified.
//
// BOARD. Six by six. Every block is locked to one axis: a horizontal block only
// ever slides along its row, a vertical one along its column. The RED block is
// always block 0, always horizontal, always on row 2, and it escapes through the
// gap in the right-hand wall on that row.
//
// A block is { len, horiz, fixed, pos }: `fixed` is the coordinate it can never
// change (the row of a horizontal block, the column of a vertical one) and `pos`
// is the one it slides along, measured at the block's top or left end.
//
// A MOVE is one block sliding any distance in one direction, which is the usual
// convention for this family of puzzle and the one `par` counts in.

export const N = 6;
export const EXIT_ROW = 2;

export function cells(p) {
  const out = [];
  for (let i = 0; i < p.len; i++) out.push(p.horiz ? [p.fixed, p.pos + i] : [p.pos + i, p.fixed]);
  return out;
}

// The occupancy grid, or null if the blocks overlap or hang off the board.
export function grid(ps) {
  const g = Array.from({ length: N }, () => new Int8Array(N).fill(-1));
  for (let i = 0; i < ps.length; i++) {
    for (const [r, c] of cells(ps[i])) {
      if (r < 0 || r >= N || c < 0 || c >= N) return null;
      if (g[r][c] !== -1) return null;
      g[r][c] = i;
    }
  }
  return g;
}

export const key = (ps) => ps.map((p) => p.pos).join(',');
export const solved = (ps) => ps[0].pos + ps[0].len === N;
export const fromData = (arr) => arr.map(([len, horiz, fixed, pos]) => ({ len, horiz: !!horiz, fixed, pos }));

// Every legal slide, as [blockIndex, distance] with distance signed.
export function moves(ps) {
  const g = grid(ps);
  const out = [];
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    for (let d = 1; d < N; d++) {
      const np = p.pos - d;
      if (np < 0) break;
      const [r, c] = p.horiz ? [p.fixed, np] : [np, p.fixed];
      if (g[r][c] !== -1) break;
      out.push([i, -d]);
    }
    for (let d = 1; d < N; d++) {
      const np = p.pos + p.len - 1 + d;
      if (np >= N) break;
      const [r, c] = p.horiz ? [p.fixed, np] : [np, p.fixed];
      if (g[r][c] !== -1) break;
      out.push([i, d]);
    }
  }
  return out;
}

export const apply = (ps, [i, d]) => ps.map((p, j) => (j === i ? { ...p, pos: p.pos + d } : p));

// Exact minimum number of moves from here, by breadth-first search, plus one
// optimal move to play next. The whole reachable space of a board this size is
// only a few thousand states, so this is instant and can drive the hint.
export function solve(ps, cap = 300000) {
  if (solved(ps)) return { min: 0, next: null };
  const start = key(ps);
  const seen = new Map([[start, null]]);
  const states = new Map([[start, ps]]);
  let frontier = [start];
  let depth = 0;
  while (frontier.length && depth < 80) {
    const next = [];
    depth++;
    for (const k of frontier) {
      const cur = states.get(k);
      for (const mv of moves(cur)) {
        const np = apply(cur, mv);
        const nk = key(np);
        if (seen.has(nk)) continue;
        seen.set(nk, { from: k, mv });
        states.set(nk, np);
        if (solved(np)) {
          // walk the chain back to recover the first move of an optimal line
          let at = nk, step = seen.get(at);
          while (step && step.from !== start) { at = step.from; step = seen.get(at); }
          return { min: depth, next: step ? step.mv : mv };
        }
        next.push(nk);
        if (seen.size > cap) return { min: -1, next: null };
      }
    }
    frontier = next;
  }
  return { min: -1, next: null };
}
