// Sweep — the day's field, and the proof that it never needs a guess.
//
// THE ONE RULE THIS FILE EXISTS FOR: a Sweep run is one life, so a forced guess
// would end a run through no fault of the player. Every banked field is
// generated against the solver below and is proven deducible top to bottom, so
// a death is always a misread and never a coin flip. `scripts/verify-sweep.mjs`
// re-proves every day THROUGH THIS MODULE, the same one the game plays from,
// rather than trusting a stored flag (CLAUDE.md daily authoring standard,
// rule 3).
//
// The field is BANKED rather than generated in the client. Generation is
// generate-and-test against the solver and costs far more than a page load can
// spend, and a stored field is the only version a verifier can re-prove. It
// costs ~300 characters a day: 9 columns x 200 rows of one bit, base64'd.
//
// Depth 200 is not a bottom. It is about 1,500 safe cells, an order of
// magnitude past par, and no one is expected to see it. `app/sweep/page.js`
// ships only days whose `live` has arrived, exactly like every other daily.

export const COLS = 9;
export const ROWS = 200;          // banked depth, not a floor the player reaches

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// bits -> base64. Only the generator calls this, but it lives beside the
// decoder so the two can never drift.
export function encodeField(grid, rows = ROWS, cols = COLS) {
  const bytes = new Uint8Array(Math.ceil((rows * cols) / 8));
  for (let i = 0; i < rows * cols; i++) if (grid[i]) bytes[i >> 3] |= 128 >> (i & 7);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] || 0, c = bytes[i + 2] || 0;
    out += B64[a >> 2] + B64[((a & 3) << 4) | (b >> 4)] + B64[((b & 15) << 2) | (c >> 6)] + B64[c & 63];
  }
  return out;
}

export function decodeField(str, rows = ROWS, cols = COLS) {
  const grid = new Uint8Array(rows * cols);
  const bytes = new Uint8Array(Math.ceil((rows * cols) / 8));
  let bi = 0;
  for (let i = 0; i < str.length; i += 4) {
    const a = B64.indexOf(str[i]), b = B64.indexOf(str[i + 1]);
    const c = B64.indexOf(str[i + 2]), d = B64.indexOf(str[i + 3]);
    if (bi < bytes.length) bytes[bi++] = (a << 2) | (b >> 4);
    if (bi < bytes.length) bytes[bi++] = ((b & 15) << 4) | (c >> 2);
    if (bi < bytes.length) bytes[bi++] = ((c & 3) << 6) | d;
  }
  for (let i = 0; i < rows * cols; i++) grid[i] = (bytes[i >> 3] >> (7 - (i & 7))) & 1;
  return grid;
}

export const idx = (r, c, cols = COLS) => r * cols + c;

export function neighbors(r, c, rows = ROWS, cols = COLS) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const rr = r + dr, cc = c + dc;
    if (rr < 0 || cc < 0 || cc >= cols || rr >= rows) continue;
    out.push([rr, cc]);
  }
  return out;
}

export function numberAt(grid, r, c, rows = ROWS, cols = COLS) {
  let n = 0;
  for (const [rr, cc] of neighbors(r, c, rows, cols)) if (grid[idx(rr, cc, cols)]) n++;
  return n;
}

// --- the solver --------------------------------------------------------------
//
// Constraint propagation, exactly the reasoning a person does and nothing more:
//
//   1. an opened number whose mines are all flagged -> every other neighbor is safe
//   2. an opened number with as many unknowns left as mines -> all of them are mines
//   3. the subset rule: where one number's unknowns are a subset of another's, the
//      difference holds the difference of the counts, which is what resolves 1-2-1
//      and every other pattern a player learns by eye
//
// No global enumeration, no probability, nothing a person could not do at the
// board. If this solver clears a field, a careful human can.
//
// UNKNOWN = 0, SAFE (opened) = 1, MINE (flagged) = 2.
export function newKnown(rows = ROWS, cols = COLS) { return new Uint8Array(rows * cols); }

// Propagate to a fixpoint. `depth` is how many rows are FIXED so far: a cell's
// number counts its neighbors, so row `depth - 1` is the deepest row whose number
// is final and therefore the deepest one the solver may read.
export function propagate(grid, known, depth, rows = ROWS, cols = COLS) {
  const readable = depth - 1;
  let changed = true;
  while (changed) {
    changed = false;
    const cons = [];    // frontier constraints, for the subset rule
    for (let r = 0; r <= readable; r++) for (let c = 0; c < cols; c++) {
      if (known[idx(r, c, cols)] !== 1) continue;
      const n = numberAt(grid, r, c, rows, cols);
      let flagged = 0; const unknown = [];
      for (const [rr, cc] of neighbors(r, c, rows, cols)) {
        if (rr >= depth) continue;                 // not generated yet
        const k = known[idx(rr, cc, cols)];
        if (k === 2) flagged++; else if (k === 0) unknown.push(idx(rr, cc, cols));
      }
      if (!unknown.length) continue;
      const left = n - flagged;
      if (left === 0) { for (const i of unknown) { known[i] = 1; changed = true; } continue; }
      if (left === unknown.length) { for (const i of unknown) { known[i] = 2; changed = true; } continue; }
      cons.push({ cells: unknown, mines: left });
    }
    if (changed) continue;                          // rules 1 and 2 first, they are cheaper
    // rule 3: subsets. The frontier is small, so the pairwise pass is cheap.
    for (let a = 0; a < cons.length && !changed; a++) {
      for (let b = 0; b < cons.length; b++) {
        if (a === b) continue;
        const A = cons[a], B = cons[b];
        if (A.cells.length >= B.cells.length) continue;
        let subset = true;
        for (const i of A.cells) if (!B.cells.includes(i)) { subset = false; break; }
        if (!subset) continue;
        const rest = B.cells.filter((i) => !A.cells.includes(i));
        const k = B.mines - A.mines;
        if (k === 0) { for (const i of rest) known[i] = 1; changed = true; break; }
        if (k === rest.length) { for (const i of rest) known[i] = 2; changed = true; break; }
      }
    }
  }
  return known;
}

// The proof. Opens the surface row (which the game gives the player for free)
// and propagates over the whole field, then reports the deepest row for which
// EVERY cell is determined. A field is acceptable when that reaches ROWS - 3:
// the last rows stay open because a cell's number depends on the row below it,
// and nothing is banked past the end.
export function proveField(grid, rows = ROWS, cols = COLS) {
  const known = newKnown(rows, cols);
  for (let c = 0; c < cols; c++) known[idx(0, c, cols)] = 1;
  propagate(grid, known, rows, rows, cols);
  let solved = -1;
  for (let r = 0; r < rows; r++) {
    let full = true;
    for (let c = 0; c < cols; c++) if (known[idx(r, c, cols)] === 0) { full = false; break; }
    if (!full) break;
    solved = r;
  }
  let mines = 0;
  for (let i = 0; i < rows * cols; i++) if (grid[i]) mines++;
  return { solvedThrough: solved, mines, density: mines / (rows * cols), known };
}
