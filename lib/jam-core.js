// The sliding-block engine, shared by Parker (6x6), Impound (7x7) and
// Junkyard (8x8).
//
// EIGHT IS THE LAST SIZE THIS FILE CAN SERVE. Occupancy is two 32-bit words, so
// 64 cells is the hard ceiling and compile() throws above it rather than
// truncating; the packed state key is three bits a position, which is also
// exactly n <= 8. A ninth-rung game needs a different representation, not a
// bigger argument.
//
// ONE ENGINE, TWO GAMES, THREE CONSUMERS. The browser clients, the offline bank
// generator (scripts/gen-jam.mjs) and the verifiers (scripts/verify-parker.mjs,
// scripts/verify-impound.mjs) all solve through this file, so the minimum a
// player is scored against is the one that was proved. Nothing here may be
// reimplemented in a caller: a second copy of these rules is a second answer to
// "what is perfect on this board", and only one of them would be the one on the
// leaderboard.
//
// BOARD. `n` by `n`, and the size is a property of the PUZZLE, not of the file:
// Parker banks n 6 with the exit on row 2, Impound banks n 7 with the exit on
// row 3, which on an odd board is the true middle rank, and Junkyard banks n 8
// with the exit on row 4, an even board leaning the opposite way to Parker's. Every block is locked to
// one axis: a horizontal block only ever slides along its row, a vertical one
// along its column. The RED block is always block 0, always horizontal, always
// on the exit row, and it escapes through the gap in the right-hand wall there.
//
// A block is { len, horiz, fixed, pos }: `fixed` is the coordinate it can never
// change (the row of a horizontal block, the column of a vertical one) and `pos`
// is the one it slides along, measured at the block's top or left end.
//
// A MOVE is one block sliding any distance in one direction, which is the usual
// convention for this family of puzzle and the one `par` counts in.
//
// WHY THE BITBOARD. The original 6x6 solver rebuilt an n-row array of Int8Arrays
// on every call to moves(), and allocated a fresh array of fresh block objects
// for every neighbour. That is affordable when the whole reachable space is a few
// thousand states, which is what a 6x6 board is. It is not affordable at 7x7:
// measured over 400 random boards at Parker's own packing density, the median
// board reached 5,369 states and the 90th percentile 188,108, with 7% of boards
// exhausting a 300,000-state cap, at a mean of 1.2 SECONDS a board. A generator
// has to solve tens of thousands of candidates to bank one board in a target par
// window, so the old representation put a 7x7 bank out of reach on arithmetic
// alone rather than on any design question.
//
// So occupancy is two 32-bit words (n*n <= 64 cells), every block's cell mask is
// precomputed once per position, a state is a Uint8Array of positions, and a
// neighbour is a copy of that array with one byte changed. No object allocation
// in the hot loop. Same answers, and see scripts/verify-parker.mjs, which
// re-solves the entire frozen Parker bank through this engine and must still
// reproduce every stored par exactly.

// Cells of one block, as [row, col] pairs.
export function cells(p) {
  const out = [];
  for (let i = 0; i < p.len; i++) out.push(p.horiz ? [p.fixed, p.pos + i] : [p.pos + i, p.fixed]);
  return out;
}

// The occupancy grid, or null if the blocks overlap or hang off the board.
// Kept in the readable form because it is what the client draws from and what
// the verifiers assert structural legality with; the solver below does not use it.
export function grid(ps, n) {
  const g = Array.from({ length: n }, () => new Int8Array(n).fill(-1));
  for (let i = 0; i < ps.length; i++) {
    for (const [r, c] of cells(ps[i])) {
      if (r < 0 || r >= n || c < 0 || c >= n) return null;
      if (g[r][c] !== -1) return null;
      g[r][c] = i;
    }
  }
  return g;
}

export const key = (ps) => ps.map((p) => p.pos).join(',');
export const solved = (ps, n) => ps[0].pos + ps[0].len === n;
export const fromData = (arr) => arr.map(([len, horiz, fixed, pos]) => ({ len, horiz: !!horiz, fixed, pos }));
export const toData = (ps) => ps.map((p) => [p.len, p.horiz ? 1 : 0, p.fixed, p.pos]);

// Every legal slide from here, as [blockIndex, distance] with distance signed.
// The readable form, for the client and the verifiers.
export function moves(ps, n) {
  const g = grid(ps, n);
  const out = [];
  if (!g) return out;
  for (let i = 0; i < ps.length; i++) {
    const p = ps[i];
    for (let d = 1; d < n; d++) {
      const np = p.pos - d;
      if (np < 0) break;
      const [r, c] = p.horiz ? [p.fixed, np] : [np, p.fixed];
      if (g[r][c] !== -1) break;
      out.push([i, -d]);
    }
    for (let d = 1; d < n; d++) {
      const np = p.pos + p.len - 1 + d;
      if (np >= n) break;
      const [r, c] = p.horiz ? [p.fixed, np] : [np, p.fixed];
      if (g[r][c] !== -1) break;
      out.push([i, d]);
    }
  }
  return out;
}

export const apply = (ps, [i, d]) => ps.map((p, j) => (j === i ? { ...p, pos: p.pos + d } : p));

// ---------------------------------------------------------------------------
// The compiled board: everything about the blocks that never changes, worked out
// once so the search can be pure arithmetic.
// ---------------------------------------------------------------------------

function compile(ps, n) {
  const nb = ps.length;
  const span = n * n;
  if (span > 64) throw new Error(`jam-core: board ${n}x${n} exceeds the 64-cell bitboard`);
  // maskLo/maskHi[i * n + pos] is the occupancy contribution of block i at pos.
  const maskLo = new Int32Array(nb * n);
  const maskHi = new Int32Array(nb * n);
  const maxPos = new Int32Array(nb);
  const lenOf = new Int32Array(nb);
  const horizOf = new Uint8Array(nb);
  const fixedOf = new Int32Array(nb);
  for (let i = 0; i < nb; i++) {
    const p = ps[i];
    lenOf[i] = p.len;
    horizOf[i] = p.horiz ? 1 : 0;
    fixedOf[i] = p.fixed;
    maxPos[i] = n - p.len;
    for (let pos = 0; pos <= maxPos[i]; pos++) {
      let lo = 0, hi = 0;
      for (let k = 0; k < p.len; k++) {
        const r = p.horiz ? p.fixed : pos + k;
        const c = p.horiz ? pos + k : p.fixed;
        const bit = r * n + c;
        if (bit < 32) lo |= (1 << bit); else hi |= (1 << (bit - 32));
      }
      maskLo[i * n + pos] = lo;
      maskHi[i * n + pos] = hi;
    }
  }
  return { nb, n, maskLo, maskHi, maxPos, lenOf, horizOf, fixedOf };
}

// Is the single cell (r, c) free in the occupancy (lo, hi)?
function free(lo, hi, bit) {
  return bit < 32 ? (lo & (1 << bit)) === 0 : (hi & (1 << (bit - 32))) === 0;
}

function occupancy(B, pos) {
  let lo = 0, hi = 0;
  for (let i = 0; i < B.nb; i++) {
    const k = i * B.n + pos[i];
    lo |= B.maskLo[k];
    hi |= B.maskHi[k];
  }
  return [lo, hi];
}

// THE STATE KEY IS ARITHMETIC, NOT A STRING, and that is the whole speed story.
//
// A position is 0..n-1 with n <= 8, so three bits each. Seventeen blocks is 51
// bits, which is inside the 53 a double holds exactly, so blocks 0..16 pack into
// one number and anything past that packs into a second. Two numbers rather than
// one string matters because a MOVE CHANGES EXACTLY ONE POSITION: the child's key
// is the parent's key minus the old field plus the new one, which is arithmetic
// on a number the loop already has. A string key would have to be rebuilt from
// scratch for every neighbour, and the neighbour would have to be materialised
// before we could find out we had already seen it. This way nothing is allocated
// until a state turns out to be new.
const LOW_BLOCKS = 17;
const SHIFT = [1, 8, 64, 512, 4096, 32768, 262144, 2097152, 16777216, 134217728,
  1073741824, 8589934592, 68719476736, 549755813888, 4398046511104,
  35184372088832, 281474976710656];

// ---------------------------------------------------------------------------
// The exact solver.
// ---------------------------------------------------------------------------

// Exact minimum number of moves from here by breadth-first search, plus one
// optimal move to play next (which is what drives the live hint).
//
//   { min, next }   min is the true shortest path length, next is [block, dist]
//   { min: 0 }      already solved
//   { min: -1 }     unsolvable, or the cap was hit before an answer was found
//
// BFS, so the first time the goal is reached IS the minimum. `cap` bounds the
// states explored: -1 therefore means "no solution within the cap", and a caller
// that needs the two apart should read `capped` on the result.
export function solve(ps, n, cap = 2000000) {
  if (solved(ps, n)) return { min: 0, next: null, capped: false, seen: 1 };
  const B = compile(ps, n);
  const nb = B.nb;
  const goalPos = n - B.lenOf[0];
  if (nb > 2 * LOW_BLOCKS) throw new Error(`jam-core: ${nb} blocks exceeds the packed key`);

  const start = new Uint8Array(nb);
  let startLo = 0, startHi = 0;
  for (let i = 0; i < nb; i++) {
    start[i] = ps[i].pos;
    if (i < LOW_BLOCKS) startLo += ps[i].pos * SHIFT[i];
    else startHi += ps[i].pos * SHIFT[i - LOW_BLOCKS];
  }

  // seen: hiKey -> Map(loKey -> firstMove). The first move of SOME optimal line
  // to that state, packed as block * 32 + (distance + 16). Because this is a
  // breadth-first search the first time a state is reached is by a shortest
  // path, so inheriting the parent's first move is exactly "the opening move of
  // an optimal line to here", which is all the hint ever needs. That removes the
  // parent chain and its walk entirely.
  const seen = new Map();
  seen.set(startHi, new Map([[startLo, -1]]));
  let count = 1;

  let frontier = [start];
  let frontierLo = [startLo];
  let frontierHi = [startHi];
  let frontierFm = [-1];
  let depth = 0;

  while (frontier.length) {
    const next = [], nextLo = [], nextHi = [], nextFm = [];
    depth++;
    for (let f = 0; f < frontier.length; f++) {
      const cur = frontier[f];
      const curLo = frontierLo[f], curHi = frontierHi[f], curFm = frontierFm[f];
      let lo = 0, hi = 0;
      for (let i = 0; i < nb; i++) {
        const k = i * n + cur[i];
        lo |= B.maskLo[k];
        hi |= B.maskHi[k];
      }
      for (let i = 0; i < nb; i++) {
        const p = cur[i];
        const horiz = B.horizOf[i];
        const fixed = B.fixedOf[i];
        const low = i < LOW_BLOCKS;
        const mul = low ? SHIFT[i] : SHIFT[i - LOW_BLOCKS];
        const base = (low ? curLo : curHi) - p * mul;
        // slide toward 0, then toward n-1; a blocked cell ends that direction.
        for (let dir = 0; dir < 2; dir++) {
          const limit = dir === 0 ? p : B.maxPos[i] - p;
          for (let d = 1; d <= limit; d++) {
            const np = dir === 0 ? p - d : p + d;
            const edge = dir === 0 ? np : np + B.lenOf[i] - 1;
            const bit = horiz ? fixed * n + edge : edge * n + fixed;
            if (!free(lo, hi, bit)) break;
            const kLo = low ? base + np * mul : curLo;
            const kHi = low ? curHi : base + np * mul;
            let inner = seen.get(kHi);
            if (inner === undefined) { inner = new Map(); seen.set(kHi, inner); }
            else if (inner.has(kLo)) continue;
            const fm = curFm === -1 ? i * 32 + (np - p) + 16 : curFm;
            inner.set(kLo, fm);
            count++;
            if (i === 0 && np === goalPos) {
              return { min: depth, next: [(fm / 32) | 0, (fm % 32) - 16], capped: false, seen: count };
            }
            const child = new Uint8Array(cur);
            child[i] = np;
            next.push(child); nextLo.push(kLo); nextHi.push(kHi); nextFm.push(fm);
          }
        }
      }
      if (count > cap) return { min: -1, next: null, capped: true, seen: count };
    }
    if (!next.length) break;
    frontier = next; frontierLo = nextLo; frontierHi = nextHi; frontierFm = nextFm;
  }
  return { min: -1, next: null, capped: false, seen: count };
}

// Is the red block's row clear to the wall right now? A cheap pre-filter for the
// generator: a board whose exit lane is already open is a one-move board and is
// never worth solving properly.
export function exitOpen(ps, n) {
  const red = ps[0];
  const g = grid(ps, n);
  if (!g) return false;
  for (let c = red.pos + red.len; c < n; c++) if (g[red.fixed][c] !== -1) return false;
  return true;
}

// The position-independent signature of a board's NON-red blocks, for the
// duplicate check both verifiers run. Sorted, so two banks that describe the
// same jam in a different block order collapse to the same string.
export function signature(pieces) {
  return pieces
    .slice(1)
    .map((b) => (Array.isArray(b) ? b : [b.len, b.horiz ? 1 : 0, b.fixed, b.pos]).join('.'))
    .sort()
    .join('|');
}
