// Bid — the shared scorer, used by the API route and by anything else that
// needs to rank the day's field. Kept in lib/ so the route and the board can
// never disagree about who won what.
//
// THE GAME. Five lots, each worth a stated number of points, and a fixed purse
// to split across them. You take a lot by out-bidding the day's crowd on it,
// and your score is the value of the lots you take. Because the purse is fixed
// and the values are not equal, you cannot out-bid the crowd everywhere: the
// whole game is choosing where to be strong and where to give up.
//
// WINNING A LOT: your bid must be STRICTLY GREATER than the median bid on that
// lot across the rest of the field. Median rather than maximum, because a daily
// where only one person per lot scores would be a lottery, not a game.
//
// LEAVE-ONE-OUT: the median a player is measured against never includes that
// player's own bid, so your own ballot can never be the thing that beats you.
// Same principle as Outwit.
//
// ADAPTIVE: nothing is frozen. Every score is a pure function of the whole pool
// as it stands right now, so it is recomputed from scratch on every request and
// everyone's result moves as the field fills in.

export const HOUSE_CUTOFF = 10;

export function medianOf(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Does this allocation obey the rules of the sale?
export function validBids(bids, puzzle) {
  if (!Array.isArray(bids) || bids.length !== puzzle.lots.length) return false;
  let total = 0;
  for (const b of bids) {
    if (!Number.isInteger(b) || b < 0 || b > puzzle.budget) return false;
    total += b;
  }
  return total <= puzzle.budget;
}

// Score one allocation against a field of others (each an array of bids).
// Returns { won: [lotIndex...], points, thresholds: [median per lot] }.
export function scoreOne(bids, others, puzzle) {
  const won = [];
  const thresholds = [];
  for (let i = 0; i < puzzle.lots.length; i++) {
    const col = others.map((o) => o[i]).filter((v) => Number.isFinite(v));
    const med = medianOf(col);
    thresholds.push(med);
    if (bids[i] > med) won.push(i);
  }
  const points = won.reduce((s, i) => s + puzzle.lots[i].value, 0);
  return { won, points, thresholds };
}

// The whole field at once. `players` is [{ key, bids, isYou }]; the house crowd
// is folded in only while fewer than HOUSE_CUTOFF real players have bid, and it
// then retires pool-wide so everybody is being measured against humans.
export function scoreField(puzzle, players, opts = {}) {
  const cutoff = opts.houseCutoff ?? HOUSE_CUTOFF;
  const realCount = players.length;
  const useHouse = realCount < cutoff;
  const house = useHouse ? (puzzle.house || []) : [];
  const totalValue = puzzle.lots.reduce((s, l) => s + l.value, 0);

  const results = new Map();
  for (const p of players) {
    // everyone else, plus the house crowd while it is still in play
    const others = players.filter((q) => q !== p).map((q) => q.bids).concat(house);
    const r = scoreOne(p.bids, others, puzzle);
    results.set(p, { ...r, score: Math.round((r.points / totalValue) * 10) });
  }
  return { results, useHouse, realCount, poolSize: realCount + house.length, totalValue };
}
