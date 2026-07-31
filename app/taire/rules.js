// Taire rules. Two suits, ace through ten, dealt face up into five columns.
// Card code = suit*16 + rank, so the black suit is 1..10 and the red one 17..26.
//
// One move is one card. You may move the bottom card of a column, or a card out
// of a free cell, onto: a column whose bottom card is one rank higher and the
// other colour, an empty column, a free cell, or its foundation if the previous
// rank is already home. Nothing moves as a stack.
//
// A move is recorded as [card, dest] where dest is 0..4 for a column, FREE for a
// free cell and FND for the foundation. Because a card appears exactly once in
// the deal, that pair identifies the move without needing source coordinates,
// which is what lets a saved game replay from the deal alone.

export const FREE = 100;
export const FND = 200;
export const RANKS = 10;
export const suitOf = (c) => c >> 4;
export const rankOf = (c) => c & 15;
export const RANK_LABEL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export function fromData(cols) {
  return { cols: cols.map((c) => c.slice()), free: [], fnd: [0, 0] };
}
export const cloneState = (s) => ({ cols: s.cols.map((c) => c.slice()), free: s.free.slice(), fnd: s.fnd.slice() });
export const isWon = (s) => s.fnd[0] === RANKS && s.fnd[1] === RANKS;
export const canStack = (card, onto) => rankOf(onto) === rankOf(card) + 1 && suitOf(onto) !== suitOf(card);

// Where a card currently sits: the bottom of a column, or a free cell, or gone.
export function locate(s, card) {
  for (let i = 0; i < s.cols.length; i++) {
    const col = s.cols[i];
    if (col.length && col[col.length - 1] === card) return { where: 'col', i };
  }
  const fi = s.free.indexOf(card);
  if (fi >= 0) return { where: 'free', i: fi };
  return null;
}

// Every card the player could pick up right now.
export function movableCards(s, cells) {
  const out = [];
  for (const col of s.cols) if (col.length) out.push(col[col.length - 1]);
  for (const c of s.free) out.push(c);
  return out.filter((c) => destinations(s, c, cells).length > 0);
}

// Legal destinations for one card, as dest codes.
export function destinations(s, card, cells) {
  const loc = locate(s, card);
  if (!loc) return [];
  const out = [];
  if (s.fnd[suitOf(card)] === rankOf(card) - 1) out.push(FND);
  for (let j = 0; j < s.cols.length; j++) {
    if (loc.where === 'col' && loc.i === j) continue;
    const col = s.cols[j];
    if (!col.length || canStack(card, col[col.length - 1])) out.push(j);
  }
  if (loc.where === 'col' && s.free.length < cells) out.push(FREE);
  return out;
}

// Apply a legal move. Returns a NEW state, or null if the move is not legal,
// so an out-of-date saved game can never corrupt a board.
export function apply(s, [card, dest], cells) {
  const loc = locate(s, card);
  if (!loc) return null;
  if (!destinations(s, card, cells).includes(dest)) return null;
  const n = cloneState(s);
  if (loc.where === 'col') n.cols[loc.i].pop(); else n.free.splice(loc.i, 1);
  if (dest === FND) n.fnd[suitOf(card)] = rankOf(card);
  else if (dest === FREE) n.free.push(card);
  else n.cols[dest].push(card);
  return n;
}

export function replay(start, moves, cells) {
  let s = start;
  for (const mv of moves) { const n = apply(s, mv, cells); if (!n) return null; s = n; }
  return s;
}

// The endgame is forced: once every remaining card can be sent home without
// touching the tableau again, clicking them one at a time is busywork. This
// returns that finishing sequence when it exists, so the client can play it out
// and COUNT each foundation move, which keeps the total honest against par.
// Par already includes one foundation move per card, so this never undercounts.
export function autoFinish(s) {
  let cur = cloneState(s);
  const seq = [];
  for (;;) {
    if (isWon(cur)) return seq;
    let moved = false;
    const heads = [];
    for (const col of cur.cols) if (col.length) heads.push(col[col.length - 1]);
    for (const c of cur.free) heads.push(c);
    for (const card of heads) {
      if (cur.fnd[suitOf(card)] === rankOf(card) - 1) {
        const n = apply(cur, [card, FND], 99);
        if (n) { cur = n; seq.push([card, FND]); moved = true; break; }
      }
    }
    if (!moved) return null;
  }
}
