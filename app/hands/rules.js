// Hands — the rules engine, shared by the live game (HandsClient), the bank
// verifier (scripts/verify-hands.mjs) and the share card, so none of them can
// drift from the others.
//
// Card code = rank * 4 + suit. Rank 2..14 with 14 the ace, suit 0..3 in the
// order spades, hearts, diamonds, clubs. The board is a five by five grid read
// as ten poker hands: five rows and five columns, each cell serving one of each.
//
// Scoring is the British table, which pays the straight more than the flush.
// That is the better of the two conventional tables here: on a five by five grid
// flushes are comparatively easy to engineer and straights are not, so paying
// the flush more (as the American table does) flattens the game into sorting by
// suit.

export const SCORE = {
  pair: 1, twoPair: 3, flush: 5, trips: 6, fullHouse: 10,
  straight: 12, quads: 16, straightFlush: 25, royal: 30,
};

export const HAND_NAME = {
  0: 'nothing', 1: 'a pair', 3: 'two pair', 5: 'a flush', 6: 'three of a kind',
  10: 'a full house', 12: 'a straight', 16: 'four of a kind',
  25: 'a straight flush', 30: 'a royal flush',
};

export const RANK_LABEL = ['', '', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const SUIT_PIP = ['♠', '♥', '♦', '♣'];
export const SUIT_NAME = ['spades', 'hearts', 'diamonds', 'clubs'];

export const rankOf = (c) => c >> 2;
export const suitOf = (c) => c & 3;
export const isRed = (c) => (c & 3) === 1 || (c & 3) === 2;
export const cardName = (c) => `${RANK_LABEL[rankOf(c)]} of ${SUIT_NAME[suitOf(c)]}`;

// Score one five-card hand. Cells may hold nulls while a line is still filling,
// in which case the line is not a hand yet and scores nothing.
export function scoreHand(cells) {
  if (!cells || cells.length !== 5 || cells.some((c) => c == null)) return 0;
  const counts = new Map();
  let lo = 15, hi = 0, flush = true;
  const s0 = suitOf(cells[0]);
  for (const c of cells) {
    const r = rankOf(c);
    counts.set(r, (counts.get(r) || 0) + 1);
    if (suitOf(c) !== s0) flush = false;
    if (r < lo) lo = r;
    if (r > hi) hi = r;
  }
  const mult = [...counts.values()].sort((a, b) => b - a);
  let straight = false;
  if (counts.size === 5) {
    if (hi - lo === 4) straight = true;
    // the wheel: the ace plays low in A2345 and nowhere else
    else if (hi === 14 && lo === 2 && counts.has(3) && counts.has(4) && counts.has(5)) straight = true;
  }
  if (straight && flush) return lo === 10 ? SCORE.royal : SCORE.straightFlush;
  if (mult[0] === 4) return SCORE.quads;
  if (mult[0] === 3 && mult[1] === 2) return SCORE.fullHouse;
  if (straight) return SCORE.straight;
  if (flush) return SCORE.flush;
  if (mult[0] === 3) return SCORE.trips;
  if (mult[0] === 2 && mult[1] === 2) return SCORE.twoPair;
  if (mult[0] === 2) return SCORE.pair;
  return 0;
}

export const rowCells = (grid, i) => [0, 1, 2, 3, 4].map((k) => grid[i * 5 + k]);
export const colCells = (grid, j) => [0, 1, 2, 3, 4].map((k) => grid[k * 5 + j]);

// The ten hands, rows first then columns, in board order.
export function lineScores(grid) {
  const out = [];
  for (let i = 0; i < 5; i++) out.push(scoreHand(rowCells(grid, i)));
  for (let j = 0; j < 5; j++) out.push(scoreHand(colCells(grid, j)));
  return out;
}

export function totalOf(grid) {
  return lineScores(grid).reduce((a, b) => a + b, 0);
}

// Full lines that scored nothing. This is the figure the daily leaderboard
// shows in its own column, because on a finished board it is the one number
// that says how much of the grid went to waste.
export function bustsOf(grid) {
  if (!grid.every((c) => c != null)) return 0;
  return lineScores(grid).filter((v) => v === 0).length;
}

// ---- the ten point scale ---------------------------------------------------
// Par and ace are both REAL PLAYOUTS banked with the deal (see puzzles.js), so
// the scale is anchored at two reachable numbers rather than at a theoretical
// maximum nobody can hit blind.
//
//   ace   10   the best of 400 blind solver runs on this exact deal
//   par    8   the run that landed on the median of those 400
//   below      one point per `down` under par, floor of 1
//
// Above par the steps are wide on purpose: par to ace is the elite band and
// holds only three scores. Below par the step is a SEVENTH OF PAR, which is
// what makes the floor land exactly where it should: seven steps down from par
// is zero points, and zero points scores 1. Deriving the step from the spread
// instead (the first version of this) floored at 2 or 3 on a low-par deal,
// which the bank verifier caught.
export function scaleFor(par, ace) {
  const p = Math.max(0, Number(par) || 0);
  const spread = Math.max(2, (Number(ace) || 0) - p);
  return { up: spread / 2, down: Math.max(1, p / 7) };
}

export function scoreForPoints(total, par, ace) {
  const t = Number(total) || 0;
  const p = Number(par) || 0;
  const { up, down } = scaleFor(p, ace);
  if (t >= p) return Math.max(8, Math.min(10, 8 + Math.floor((t - p) / up)));
  return Math.max(1, 8 - Math.ceil((p - t) / down));
}

// ---- deal reconstruction ---------------------------------------------------
// The bank stores a seed alongside every deal so each board is reproducible
// from first principles. This is the shuffle the generator used.
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dealFor(seed) {
  const deck = [];
  for (let r = 2; r <= 14; r++) for (let s = 0; s < 4; s++) deck.push(r * 4 + s);
  const rand = mulberry32(seed);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = deck[i]; deck[i] = deck[j]; deck[j] = t;
  }
  return deck.slice(0, 26);
}
