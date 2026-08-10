// Strata — the board mechanics, shared by the browser and the bank verifier so
// the two can never drift. StrataClient imports gridOf/placements for rendering
// and hints; scripts/verify-strata.mjs imports the analysis on top of them.
//
// THE ONE FACT THAT MAKES ALL OF THIS TRACTABLE: a cell never changes column.
// Finding a word deletes its cells and each column compacts to the bottom,
// which preserves the relative order of the survivors. So the board after a set
// of cells has gone does NOT depend on the order they went in, and the whole
// game state is just "which cells are gone". With at most nine words that is 512
// word-level states, small enough that the verifier walks every one of them and
// the bank's claims are proved rather than sampled.

export const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// Expand a banked day into cells and per-column stacks. columns[c] is that
// column's letters BOTTOM first, so stack index 0 renders at row rows-1.
export function makeCells(p) {
  const cells = [];
  const columns = [];
  for (let c = 0; c < p.cols; c++) {
    const stack = [];
    for (let i = 0; i < p.rows; i++) {
      stack.push(cells.length);
      cells.push({ id: cells.length, ch: p.columns[c][i], col: c });
    }
    columns.push(stack);
  }
  return { cells, columns };
}

// grid[r][c] = cell id or null, after `removed` has fallen out and the columns
// have settled. This is the only place gravity is implemented.
export function gridOf(rows, cols, columns, removed) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let c = 0; c < cols; c++) {
    const live = columns[c].filter((id) => !removed.has(id));
    for (let i = 0; i < live.length; i++) grid[rows - 1 - i][c] = live[i];
  }
  return grid;
}

// Where each live cell sits now: id -> [row, col]. The client animates between
// two of these maps, which is the whole collapse effect.
export function positions(rows, cols, columns, removed) {
  const at = new Map();
  for (let c = 0; c < cols; c++) {
    const live = columns[c].filter((id) => !removed.has(id));
    for (let i = 0; i < live.length; i++) at.set(live[i], [rows - 1 - i, c]);
  }
  return at;
}

export function adjacent(a, b) {
  return Math.abs(a[0] - b[0]) <= 1 && Math.abs(a[1] - b[1]) <= 1 && !(a[0] === b[0] && a[1] === b[1]);
}

// Searching for a word that is NOT on the board is the expensive case: nothing
// prunes, so the walk explores every path shaped like the word. Two guards, and
// both matter, because the browser runs this too on every hint.
//
//   1. A letter-count prune. A word needing two Ns on a board holding one can be
//      rejected without walking anything, and that is the overwhelming majority
//      of the decoy checks the verifier runs.
//   2. A hard node budget. Exceeding it means the search did not finish, which is
//      NOT the same as "no placement", so the budget is reported rather than
//      swallowed: the generator throws such a board away and the verifier fails
//      it. A board can only ship if its search space was walked to the end.
// Per-call ceiling for a one-off search (what the browser does for a hint), and a
// separate pooled ceiling for a whole board analysis. The pool is the important
// one: a per-call budget still lets one board burn minutes across several hundred
// calls, which is exactly how the generator appeared to hang on a Sunday.
export const NODE_BUDGET = 120000;
export const ANALYSIS_BUDGET = 4000000;
export const newBudget = (n = ANALYSIS_BUDGET) => ({ left: n });

function countsOf(grid, cells, rows, cols) {
  const n = Object.create(null);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const id = grid[r][c];
    if (id !== null) n[cells[id].ch] = (n[cells[id].ch] || 0) + 1;
  }
  return n;
}

// Every distinct SET of cells spelling `word` along an 8-connected simple path.
// Sets rather than sequences, because two traces over the same cells are the
// same move and a palindrome is not an ambiguity.
// Returns an array; `.exhausted === false` means the node budget ran out.
export function placements(grid, word, cells, rows, cols, limit = 64, ctx = null) {
  const have = countsOf(grid, cells, rows, cols);
  const need = Object.create(null);
  for (const ch of word) {
    need[ch] = (need[ch] || 0) + 1;
    if ((have[ch] || 0) < need[ch]) { const e = []; e.exhausted = true; return e; }
  }

  const out = new Map();
  const path = [];
  const used = new Set();
  let nodes = 0;
  let blown = false;
  function walk(r, c) {
    if (blown || out.size >= limit) return;
    if (++nodes > NODE_BUDGET) { blown = true; return; }
    if (ctx && --ctx.left < 0) { blown = true; return; }
    const id = grid[r][c];
    if (id === null || used.has(id) || cells[id].ch !== word[path.length]) return;
    used.add(id); path.push(id);
    if (path.length === word.length) {
      const key = path.slice().sort((a, b) => a - b).join(',');
      if (!out.has(key)) out.set(key, path.slice());
    } else {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) walk(nr, nc);
      }
    }
    path.pop(); used.delete(id);
  }
  for (let r = 0; r < rows && !blown; r++) for (let c = 0; c < cols && !blown; c++) walk(r, c);
  const res = [...out.values()];
  res.exhausted = !blown;
  return res;
}

export function findOne(grid, word, cells, rows, cols) {
  const ps = placements(grid, word, cells, rows, cols, 1);
  return ps.length ? ps[0] : null;
}

// ── verifier-side analysis (not used by the client) ─────────────────────────

// The cells a given word owns, read off the bank's `owners` digit map.
export function ownedCells(p, wordIndex) {
  const ids = [];
  let id = 0;
  for (let c = 0; c < p.cols; c++) {
    for (let i = 0; i < p.rows; i++, id++) if (Number(p.owners[c][i]) === wordIndex) ids.push(id);
  }
  return ids;
}

// THE STATE IS THE SET OF CELLS GONE, NEVER THE SET OF WORDS FOUND. Finding a
// word deletes the cells the player TRACED, and those are not always the cells
// the bank says that word owns: a word's one readable placement can run through
// a letter belonging to a word still on the board. Both walks below used to
// remove `owners` cells instead, which quietly modelled a DIFFERENT game. Every
// state a player could reach by tracing off-owner was outside the graph, so the
// no-dead-end proof did not cover it, and #5 (2026-08-10) shipped stranding half
// its play-throughs: THUMB's only opening trace runs through HEART's T, and once
// that T is gone HEART cannot be read anywhere. Do not reintroduce owner-based
// removal here. `offOwner` below reports the divergence rather than assuming it
// away, and the verifier fails on it.
const stateKey = (rem, found) => `${[...rem].sort((a, b) => a - b).join(',')}|${[...found].sort((a, b) => a - b).join(',')}`;

// Every state reachable from "nothing found yet", by real tracing. Shared by
// analyse() and decoys() so the two can never walk different graphs.
function walkReal(p, ctx, visit) {
  const { cells, columns } = makeCells(p);
  const n = p.words.length;
  let exhausted = true;
  const seen = new Set();
  const queue = [[new Set(), new Set(), 0]];
  seen.add(stateKey(new Set(), new Set()));

  while (queue.length) {
    const [rem, found, d] = queue.shift();
    if (seen.size > STATE_CAP) { exhausted = false; break; }
    const grid = gridOf(p.rows, p.cols, columns, rem);
    const avail = [];
    for (let wi = 0; wi < n; wi++) {
      if (found.has(wi)) continue;
      const ps = placements(grid, p.words[wi], cells, p.rows, p.cols, 4, ctx);
      if (ps.exhausted === false) exhausted = false;
      if (!ps.length) continue;
      avail.push({ wi, paths: ps });
    }
    visit({ rem, found, depth: d, grid, avail, cells, columns });
    for (const { wi, paths } of avail) {
      for (const path of paths) {
        const r2 = new Set(rem); for (const id of path) r2.add(id);
        const f2 = new Set(found); f2.add(wi);
        const k = stateKey(r2, f2);
        if (!seen.has(k)) { seen.add(k); queue.push([r2, f2, d + 1]); }
      }
    }
  }
  return { exhausted, states: seen.size };
}

// A board is only tractable while every word traces on its own cells, which
// keeps the graph at one state per subset of words. An off-owner trace forks it,
// so cap the walk rather than let a bad candidate run for minutes.
export const STATE_CAP = 20000;

// Walk every state reachable from "nothing found yet". Returns the report the
// verifier asserts against.
export function analyse(p, ctx = newBudget()) {
  const n = p.words.length;
  const wordMask = (found) => Array.from({ length: n }, (_, i) => (found.has(i) ? '1' : '0')).join('');

  const firstAvail = new Map();
  const ambiguous = [];
  const deadEnds = [];
  const offOwner = [];
  const own = Array.from({ length: n }, (_, i) => new Set(ownedCells(p, i)));
  let opening = [];
  let cleared = false;

  const { exhausted, states } = walkReal(p, ctx, ({ rem, found, depth, avail }) => {
    for (const { wi, paths } of avail) {
      if (paths.length > 1) ambiguous.push({ state: wordMask(found), word: p.words[wi], count: paths.length });
      for (const path of paths) {
        // The trace and the bank's ownership map must agree, or the `owners`
        // digits are describing a board the player is not playing.
        if (path.length !== own[wi].size || !path.every((id) => own[wi].has(id))) {
          offOwner.push({ state: wordMask(found), word: p.words[wi] });
        }
      }
      if (!firstAvail.has(wi) || firstAvail.get(wi) > depth) firstAvail.set(wi, depth);
    }
    if (!rem.size && !found.size) opening = avail.map(({ wi }) => wi);
    if (found.size === n) cleared = true;
    else if (!avail.length) deadEnds.push(wordMask(found));
  });

  const depths = Array.from({ length: n }, (_, i) => (firstAvail.has(i) ? firstAvail.get(i) : Infinity));
  return {
    cleared, exhausted, deadEnds, ambiguous, offOwner,
    unreachable: p.words.filter((w, i) => !firstAvail.has(i)),
    opening: opening.map((i) => p.words[i]),
    openingCount: opening.length,
    deepest: Math.max(...depths),
    states,
    firstAvail: depths,
  };
}

// Any word from the day's own theme pool that is NOT an answer but can still be
// traced somewhere. Those are the cruel ones: a real member of the category,
// sitting right there in the letters, and the board refuses it. The bank has none.
export function decoys(p, ctx = newBudget()) {
  const answers = new Set(p.words);
  const pool = (p.pool || []).filter((w) => !answers.has(w) && w.length >= 3);
  const hits = [];
  hits.exhausted = true;
  if (!pool.length) return hits;
  const n = p.words.length;
  const wordMask = (found) => Array.from({ length: n }, (_, i) => (found.has(i) ? '1' : '0')).join('');

  // Same real-tracing walk as analyse(), so a decoy that only appears on a board
  // reshaped by an off-owner trace is still caught.
  const { exhausted } = walkReal(p, ctx, ({ found, grid, cells }) => {
    for (const cand of pool) {
      const ps = placements(grid, cand, cells, p.rows, p.cols, 1, ctx);
      if (ps.exhausted === false) hits.exhausted = false;
      if (ps.length) hits.push({ state: wordMask(found), word: cand });
    }
  });
  if (!exhausted) hits.exhausted = false;
  return hits;
}

// Replay the bank's own intended line: at the point where every earlier word has
// gone, this word's OWNED cells must themselves form a path spelling it.
export function replayIntendedLine(p) {
  const { cells, columns } = makeCells(p);
  const gone = new Set();
  const problems = [];
  for (let wi = 0; wi < p.words.length; wi++) {
    const grid = gridOf(p.rows, p.cols, columns, new Set(gone));
    const own = new Set(ownedCells(p, wi));
    const hit = placements(p.rows && grid, p.words[wi], cells, p.rows, p.cols, 8)
      .some((path) => path.length === own.size && path.every((id) => own.has(id)));
    if (!hit) problems.push(p.words[wi]);
    for (const id of own) gone.add(id);
  }
  return { problems, cleared: gone.size === p.rows * p.cols };
}
