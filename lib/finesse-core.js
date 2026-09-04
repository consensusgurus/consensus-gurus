// FINESSE — the exact double-dummy engine, shared by the generator, the
// verifier and the browser. There is one copy of these rules on purpose: the
// defence the player meets and the defence the bank was proved against have to
// be the same program, or a "proved" contract is only proved against a
// different opponent.
//
// THE DECK IS REDUCED AND COMPLETE. Four suits, R ranks, 4R cards, R to a hand,
// nothing left over and nothing hidden. R is the week's ramp: 4 on Monday
// (J Q K A), 8 on the Sunday Edition (7 up to A). Because the deck is exactly
// dealt out, every card a player can see is every card there is, which is what
// makes a double dummy honest on a phone.
//
// Seats are 0 N, 1 E, 2 S, 3 W, clockwise, so play runs N -> E -> S -> W. NS is
// the declaring side: the player holds South AND the dummy at North, and EW are
// the two perfect defenders. A hand is a bit mask over card ids; a card id is
// suit * R + rank, rank 0 lowest.

export const SUITS = ['S', 'H', 'D', 'C'];
export const SUIT_GLYPH = ['♠', '♥', '♦', '♣'];
export const RANK_NAMES = {
  4: ['J', 'Q', 'K', 'A'],
  5: ['10', 'J', 'Q', 'K', 'A'],
  6: ['9', '10', 'J', 'Q', 'K', 'A'],
  7: ['8', '9', '10', 'J', 'Q', 'K', 'A'],
  8: ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
};

export const suitOf = (c, R) => Math.floor(c / R);
export const rankOf = (c, R) => c % R;
export const isNS = (seat) => seat === 0 || seat === 2;
export const cardName = (c, R) => SUITS[suitOf(c, R)] + RANK_NAMES[R][rankOf(c, R)];
export const cardLabel = (c, R) => SUIT_GLYPH[suitOf(c, R)] + RANK_NAMES[R][rankOf(c, R)];

export function makeDeck(R) {
  const d = [];
  for (let s = 0; s < 4; s++) for (let r = 0; r < R; r++) d.push(s * R + r);
  return d;
}

export function bits(mask) {
  const out = [];
  let m = mask, i = 0;
  while (m) { if (m & 1) out.push(i); m >>>= 1; i++; }
  return out;
}

export function parseHand(str, R) {
  let m = 0;
  String(str).split(/\s+/).filter(Boolean).forEach((n) => {
    for (let c = 0; c < 4 * R; c++) if (cardName(c, R) === n) { m |= (1 << c); return; }
  });
  return m;
}

// Cards of one hand in reading order: spades, hearts, diamonds, clubs, high to
// low inside a suit. The board and the printed hand diagram share it, so the
// card a player is told to lead is where the diagram says it is.
export function handOrder(mask, R) {
  return bits(mask).sort((a, b) => suitOf(a, R) - suitOf(b, R) || rankOf(b, R) - rankOf(a, R));
}

// trump is a suit index, or -1 for no trumps.
export function makeSolver(R, trump) {
  const memo = new Map();

  function trickWinner(played) {
    let best = played[0];
    for (let i = 1; i < 4; i++) {
      const c = played[i], cs = suitOf(c.card, R), bs = suitOf(best.card, R);
      if (cs === bs) { if (rankOf(c.card, R) > rankOf(best.card, R)) best = c; }
      else if (trump >= 0 && cs === trump && bs !== trump) best = c;
    }
    return best.seat;
  }

  // Legal moves, EQUIVALENCE-REDUCED and ordered high first. Two cards of one
  // suit in one hand are the same move once every rank between them is gone, so
  // only one is tried; and the winning card is nearly always a trump or the top
  // of a suit, so trying those first is what makes the alpha-beta cut early.
  // Both are pure speed: neither changes a value.
  function moves(m, seat, led) {
    const hand = bits(m[seat]);
    let cand = hand;
    if (led >= 0) {
      const follow = [];
      for (let i = 0; i < hand.length; i++) if (suitOf(hand[i], R) === led) follow.push(hand[i]);
      if (follow.length) cand = follow;
    }
    const live = m[0] | m[1] | m[2] | m[3];
    const out = [];
    for (let j = 0; j < cand.length; j++) {
      const c = cand[j], s = suitOf(c, R), r = rankOf(c, R);
      let up = r + 1, skip = false;
      while (up < R) {
        const uc = s * R + up;
        if (live & (1 << uc)) { skip = !!(m[seat] & (1 << uc)); break; }
        up++;
      }
      if (!skip) out.push(c);
    }
    out.sort((a, b) => {
      const at = trump >= 0 && suitOf(a, R) === trump ? 1 : 0;
      const bt = trump >= 0 && suitOf(b, R) === trump ? 1 : 0;
      return (bt - at) || (rankOf(b, R) - rankOf(a, R));
    });
    return out;
  }

  // NS tricks from the start of a trick, both sides playing perfectly. Memoised
  // on the four remaining hands plus who leads, which is the whole state: what
  // has already been won does not change what is left to win.
  function boundary(m, leader) {
    if (!(m[0] | m[1] | m[2] | m[3])) return 0;
    const key = m[0] + ',' + m[1] + ',' + m[2] + ',' + m[3] + '|' + leader;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const v = node(m, leader, [], -1, -1, 99);
    memo.set(key, v);
    return v;
  }

  function node(m, seat, played, led, alpha, beta) {
    if (played.length === 4) {
      const w = trickWinner(played);
      return (isNS(w) ? 1 : 0) + boundary(m, w);
    }
    const mv = moves(m, seat, led), maxing = isNS(seat);
    let best = maxing ? -99 : 99;
    for (let i = 0; i < mv.length; i++) {
      const c = mv[i], nm = m.slice();
      nm[seat] &= ~(1 << c);
      const v = node(nm, (seat + 1) % 4, played.concat([{ seat, card: c }]),
        played.length ? led : suitOf(c, R), alpha, beta);
      if (maxing) { if (v > best) best = v; if (best > alpha) alpha = best; }
      else { if (v < best) best = v; if (best < beta) beta = best; }
      if (alpha >= beta) break;
    }
    return best;
  }

  // NS tricks still available after `seat` plays `card` into the current trick.
  // Full window: this is a report, not a search step, so it must not be cut.
  function valueAfter(m, seat, played, led, card) {
    const nm = m.slice();
    nm[seat] &= ~(1 << card);
    return node(nm, (seat + 1) % 4, played.concat([{ seat, card }]),
      played.length ? led : suitOf(card, R), -99, 99);
  }

  // The defender's card: the one that leaves NS fewest tricks, and among equals
  // the lowest, so a perfect defence still looks like a person played it.
  function defend(m, seat, played, led) {
    const mv = moves(m, seat, led);
    let best = mv[0], bv = 99;
    for (let i = 0; i < mv.length; i++) {
      const v = valueAfter(m, seat, played, led, mv[i]);
      if (v < bv || (v === bv && rankOf(mv[i], R) < rankOf(best, R))) { bv = v; best = mv[i]; }
    }
    return best;
  }

  return { boundary, node, moves, trickWinner, valueAfter, defend, memo };
}

// Play the deal out with NS taking the first line that still reaches `target`
// and EW defending perfectly. Returns the tricks, every NS decision point with
// the value of each card it could have played, and the trick at which the only
// winning play first separates from the alternatives — the difficulty dial.
export function analyse(R, trump, hands, target, solver) {
  const S = solver || makeSolver(R, trump);
  let m = hands.slice(), leader = 2, seat = 2, played = [], led = -1, ns = 0, ew = 0;
  const tricks = [], decisions = [];
  let guard = 0;
  while ((m[0] | m[1] | m[2] | m[3]) && guard++ < 200) {
    const mv = S.moves(m, seat, led);
    const scored = mv.map((c) => ({ c, v: ns + S.valueAfter(m, seat, played, led, c) }));
    let pick;
    if (isNS(seat)) {
      const good = scored.filter((x) => x.v >= target);
      decisions.push({
        seat, trick: tricks.length + 1, options: scored.length, winners: good.length,
        cards: scored.map((x) => ({ n: cardName(x.c, R), v: x.v })),
      });
      pick = good[0] || scored.reduce((a, b) => (b.v > a.v ? b : a));
    } else {
      pick = scored.reduce((a, b) => (b.v < a.v ? b : a));
    }
    m = m.slice();
    m[seat] &= ~(1 << pick.c);
    played = played.concat([{ seat, card: pick.c }]);
    if (played.length === 1) led = suitOf(pick.c, R);
    if (played.length === 4) {
      const w = S.trickWinner(played);
      if (isNS(w)) ns++; else ew++;
      tricks.push({ cards: played, winner: w, ns });
      played = []; led = -1; leader = w; seat = w;
    } else seat = (seat + 1) % 4;
  }
  const first = decisions.find((d) => d.options > 1 && d.winners === 1);
  return {
    tricks, decisions, ns, leader,
    sep: first ? first.trick : 0,
    uniq: decisions.filter((d) => d.options > 1 && d.winners === 1).length,
    choices: decisions.filter((d) => d.options > 1).length,
  };
}
