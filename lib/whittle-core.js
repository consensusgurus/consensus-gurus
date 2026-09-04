// Whittle core — the 6×6 engine shared by the GENERATOR and the BROWSER.
//
// Whittle inverts the sudoku. The player is handed a board that is already
// solved and already uniquely clued, and takes clues AWAY: a clue may come out
// only while the board still has exactly one solution. The day ends when no
// clue can come out, and the score is how few clues are left standing against
// the fewest that any legal order can reach.
//
// WHO IMPORTS THIS, AND WHO DELIBERATELY DOES NOT
//   scripts/gen-whittle.mjs  (builds the bank)   — yes
//   app/whittle/WhittleClient.jsx (plays it)     — yes
//   scripts/verify-whittle.mjs (proves the bank) — NEVER.
// The generator and the browser MUST agree bit for bit, because `perfect` is
// only an honest target if the legality rule that computed it is the same rule
// the player's taps are judged by. The verifier writes its own solver from
// scratch, per the daily puzzle authoring standard: a checker that shares a
// solver with the thing it certifies can only ever agree with itself.
//
// Nothing here reads the bank. Every function reasons about a grid it is
// handed, which is what lets the verifier recompute every stored field.
//
// Geometry, identical to Sixes: 6 rows, 6 columns, digits 1–6, boxes two rows
// tall and three columns wide.
//   box = floor(r / 2) * 2 + floor(c / 3)   ->  0..5
export const N = 6;
export const CELLS = 36;
export const boxOf = (r, c) => Math.floor(r / 2) * 2 + Math.floor(c / 3);
export const rc = (i) => [Math.floor(i / N), i % N];

// The 18 units: 6 rows, then 6 columns, then 6 boxes.
export const UNITS = (() => {
  const u = [];
  for (let r = 0; r < N; r++) u.push(Array.from({ length: N }, (_, c) => r * N + c));
  for (let c = 0; c < N; c++) u.push(Array.from({ length: N }, (_, r) => r * N + c));
  for (let b = 0; b < N; b++) {
    const cells = [];
    for (let i = 0; i < CELLS; i++) { const [r, c] = rc(i); if (boxOf(r, c) === b) cells.push(i); }
    u.push(cells);
  }
  return u;
})();

// peers[i] = every cell sharing a row, column or box with i (i itself excluded)
export const PEERS = (() => {
  const p = Array.from({ length: CELLS }, () => new Set());
  for (const u of UNITS) for (const a of u) for (const b of u) if (a !== b) p[a].add(b);
  return p.map((s) => [...s]);
})();

export const clueCount = (flat) => { let n = 0; for (let i = 0; i < CELLS; i++) if (flat[i]) n++; return n; };

// ─── exhaustive solver, counts up to `cap` solutions ───────────────────────
// Most-constrained-square first over bitmask candidates. The bitmasks are not
// premature: a single tap costs one of these per clue still standing, so a
// board with eighteen clues runs eighteen full solution counts before it can
// colour a square, and the generator runs several hundred thousand of them.
const ROW_OF = Array.from({ length: CELLS }, (_, i) => Math.floor(i / N));
const COL_OF = Array.from({ length: CELLS }, (_, i) => i % N);
const BOX_OF = Array.from({ length: CELLS }, (_, i) => boxOf(Math.floor(i / N), i % N));
const FULL = 0b1111110; // bits 1..6
const POP = (() => { const p = new Uint8Array(128); for (let m = 0; m < 128; m++) { let n = 0; let x = m; while (x) { x &= x - 1; n++; } p[m] = n; } return p; })();

export function countSolutions(flat, cap = 2) {
  const row = new Int32Array(N); const col = new Int32Array(N); const box = new Int32Array(N);
  const empty = [];
  for (let i = 0; i < CELLS; i++) {
    const d = flat[i];
    if (!d) { empty.push(i); continue; }
    const b = 1 << d;
    // A clue that already clashes with another means no solutions at all.
    if ((row[ROW_OF[i]] & b) || (col[COL_OF[i]] & b) || (box[BOX_OF[i]] & b)) return 0;
    row[ROW_OF[i]] |= b; col[COL_OF[i]] |= b; box[BOX_OF[i]] |= b;
  }
  let found = 0;
  const used = new Uint8Array(CELLS);
  const rec = (left) => {
    if (!left) { found++; return; }
    let best = -1; let bestMask = 0; let bestN = 99;
    for (let k = 0; k < empty.length; k++) {
      const i = empty[k];
      if (used[i]) continue;
      const m = FULL & ~(row[ROW_OF[i]] | col[COL_OF[i]] | box[BOX_OF[i]]);
      const n = POP[m];
      if (n < bestN) { bestN = n; best = i; bestMask = m; if (n <= 1) break; }
    }
    if (bestN === 0) return;
    used[best] = 1;
    const r = ROW_OF[best]; const c = COL_OF[best]; const b = BOX_OF[best];
    for (let d = 1; d <= N; d++) {
      const bit = 1 << d;
      if (!(bestMask & bit)) continue;
      row[r] |= bit; col[c] |= bit; box[b] |= bit;
      rec(left - 1);
      row[r] &= ~bit; col[c] &= ~bit; box[b] &= ~bit;
      if (found >= cap) break;
    }
    used[best] = 0;
  };
  rec(empty.length);
  return found;
}

// ─── THE RULE OF THE GAME ──────────────────────────────────────────────────
// A clue may come out exactly when the board still has one solution without
// it. Returned in ASCENDING CELL INDEX, and that order is load-bearing: the
// forgiveness DP below averages over these children in this order, so a second
// implementation summing them in another order can land a different double.
export function legalRemovals(flat) {
  const out = [];
  for (let i = 0; i < CELLS; i++) {
    if (!flat[i]) continue;
    const t = flat.slice();
    t[i] = 0;
    if (countSolutions(t, 2) === 1) out.push(i);
  }
  return out;
}

export const canRemove = (flat, i) => {
  if (!flat[i]) return false;
  const t = flat.slice();
  t[i] = 0;
  return countSolutions(t, 2) === 1;
};

// A 36-bit signature of WHICH squares still hold a clue. Two states with the
// same signature have the same future, whatever order got them there, which is
// the whole reason the search below is cheap enough to run exhaustively.
const sigOf = (flat) => {
  let lo = 0; let hi = 0;
  for (let i = 0; i < 18; i++) if (flat[i]) lo |= 1 << i;
  for (let i = 18; i < CELLS; i++) if (flat[i]) hi |= 1 << (i - 18);
  return lo * 4194304 + hi;
};

// ─── THE TWO MEASURED FIELDS ───────────────────────────────────────────────
// perfect  the FEWEST clues any legal order can leave standing. Exhaustive and
//          exact, not a best-effort search mark: every reachable position is
//          enumerated once, memoised on its signature.
//
// forgive  per mille, the exact probability that a player choosing UNIFORMLY AT
//          RANDOM among the legal removals, over and over, still finishes on
//          `perfect`. This is the weekday ramp, and it is a probability rather
//          than a clue count because a clue count is not what makes a Whittle
//          board hard. Every board is 18 clues and every board ends around 9,
//          so the difficulty is entirely in the ORDER: a forgiving board lets
//          almost any order reach the floor, an unforgiving one has traps that
//          strand a careless player one or two clues short. Measured across
//          random boards it runs from about 40‰ to about 580‰, which is a wide
//          enough spread to hang a seven-day ramp on.
//
// It is computed as a probability and not sampled, so the verifier reproduces
// it exactly rather than approximately. It is a plain double, summed over the
// children in ascending cell index; the verifier allows ±1‰ against its own
// independent walk, which is float slack, not a licence to disagree.
export function analyse(start) {
  const best = new Map();
  const kids = new Map();
  const walk = (flat) => {
    const s = sigOf(flat);
    const seen = best.get(s);
    if (seen !== undefined) return seen;
    const L = legalRemovals(flat);
    kids.set(s, L);
    let b = clueCount(flat);
    for (const i of L) {
      const t = flat.slice();
      t[i] = 0;
      const v = walk(t);
      if (v < b) b = v;
    }
    best.set(s, b);
    return b;
  };
  const perfect = walk(start.slice());

  const prob = new Map();
  const chance = (flat) => {
    const s = sigOf(flat);
    const seen = prob.get(s);
    if (seen !== undefined) return seen;
    const L = kids.get(s);
    let p;
    if (!L.length) p = clueCount(flat) === perfect ? 1 : 0;
    else {
      let sum = 0;
      for (const i of L) { const t = flat.slice(); t[i] = 0; sum += chance(t); }
      p = sum / L.length;
    }
    prob.set(s, p);
    return p;
  };
  const p = chance(start.slice());

  return {
    clues: clueCount(start),
    perfect,
    forgive: Math.round(p * 1000),
    states: best.size,
  };
}

// The one free hint: a clue that can come out AND that keeps the board on the
// best line still available from here. Not the best line from the OPENING
// board — a player who has already strayed cannot be sent back, so the hint
// answers the honest question, which is what the best move is now.
//
// It costs a walk of the graph below the current position. That is up to a
// third of a second on the opening board and far less once a few clues are
// down, which is affordable exactly because it happens at most once a day.
// Returns -1 when nothing can come out.
export function bestRemoval(flat) {
  const best = new Map();
  const deepest = (g) => {
    const s = sigOf(g);
    const seen = best.get(s);
    if (seen !== undefined) return seen;
    let b = clueCount(g);
    for (const i of legalRemovals(g)) {
      const t = g.slice();
      t[i] = 0;
      const v = deepest(t);
      if (v < b) b = v;
    }
    best.set(s, b);
    return b;
  };
  const floor = deepest(flat.slice());
  for (const i of legalRemovals(flat)) {
    const t = flat.slice();
    t[i] = 0;
    if (deepest(t) === floor) return i;
  }
  return -1;
}

// ─── the weekday ramp ──────────────────────────────────────────────────────
// Bands are on `forgive`, hardest last. Monday is generous but never free: a
// board every order solves teaches nothing, so the top of the Monday band is
// capped well short of 1000. The Sunday Edition is the least forgiving deal of
// the week rather than a bigger board — measured, a board that starts with MORE
// clues is more forgiving, not less, because it offers more routes down to the
// same floor, so growing it would have made Sunday longer and easier at once.
// Same call, and the same reasoning, as Polka's Sunday.
export const BANDS = [
  { dow: 0, name: 'Sunday', lo: 0, hi: 60 },
  { dow: 1, name: 'Monday', lo: 500, hi: 880 },
  { dow: 2, name: 'Tuesday', lo: 380, hi: 499 },
  { dow: 3, name: 'Wednesday', lo: 280, hi: 379 },
  { dow: 4, name: 'Thursday', lo: 200, hi: 279 },
  { dow: 5, name: 'Friday', lo: 130, hi: 199 },
  { dow: 6, name: 'Saturday', lo: 61, hi: 129 },
];
export const bandFor = (dow) => BANDS.find((b) => b.dow === dow);

// ─── scoring ───────────────────────────────────────────────────────────────
// Ten at perfect, and two points a clue for every clue left standing above it,
// with a floor of one so finishing always beats walking away. Two points a clue
// rather than one because the whole interesting range is narrow: a careless
// order lands one or two clues short and almost never worse, so a gentler step
// would report a thoughtful solve and a shrugged one as the same play.
//
// This deliberately does NOT use lib/par.js. That model's cushion is a quarter
// over the minimum floored at four, which on numbers this small would hand six
// points out of ten to a player who removed nothing at all.
export const SCORE_STEP = 2;
export function scoreFor(left, perfect) {
  const over = Math.max(0, (Number(left) || 0) - (Number(perfect) || 0));
  return Math.max(1, Math.min(10, 10 - SCORE_STEP * over));
}
export const parFor = (perfect) => (Number(perfect) || 0) + 1;
