// scripts/slot-sim.mjs — the SENSIBLE PLAYER that sets Slot's par.
//
// Par on a Slot board is not a guess: it is the average score of a modelled
// player who is told the items one at a time in the board's reveal order,
// exactly as a real player is. The model is the simplest honest one:
//
//   * the player has a rough sense of where each item belongs, so their
//     estimate of its true rank is the true rank plus Gaussian noise of
//     SIGMA slots (1.0: a person who knows Brazil is "somewhere around the
//     middle" but not whether it is 6th or 7th);
//   * they KNOW the order between the new item and anything already placed
//     whose true rank is KNOWN_GAP or more away (India outranks Nigeria,
//     no question), so the placement is confined to the slots consistent
//     with that; two neighbours in the true order are a coin toss;
//   * inside that window they drop the item into the OPEN slot nearest the
//     estimate, breaking an equidistant tie toward the middle of the board.
//     When the window has no open slot left the board is already broken
//     and they take the nearest open slot anywhere;
//   * the last item takes the last slot.
//
// Score is exact placements. The same seeded generator gives the same mean
// for the same board and order, which is what lets the verifier re-prove a
// stored par to the last decimal rather than trust it. The reveal order is
// the whole difficulty dial: the same ten items played "biggest first" and
// "middle first" can sit two points apart under this model, and the
// generator picks the order for the weekday's band by measuring it here.
//
// Shared by gen-slot.mjs and verify-slot.mjs ON PURPOSE. Par is DEFINED by
// this model, so a second implementation would be a second definition; the
// verifier's independence is spent on everything else (monotonic values, the
// permutation, the calendar, variety), never on re-deriving the model.

export const SIGMA = 1.0;
export const KNOWN_GAP = 2;
export const SIMS = 400;

// mulberry32, seeded per board so a run is reproducible.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Box-Muller off two uniforms.
function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// One play-through. `reveal` lists true ranks (0-based) in the order the
// items arrive. Returns the number of exact placements.
export function playOnce(reveal, r, sigma = SIGMA) {
  const n = reveal.length;
  const open = new Array(n).fill(true);
  const placedRank = new Array(n).fill(-1);   // slot -> true rank of what sits there
  let left = n, exact = 0;
  const mid = (n - 1) / 2;
  for (let k = 0; k < n; k++) {
    const rank = reveal[k];
    let slot;
    if (left === 1) {
      slot = open.indexOf(true);
    } else {
      // What the player KNOWS: the order between this item and anything
      // already placed whose true rank is two or more away (India is
      // bigger than Nigeria; Brazil against Nigeria is a coin toss). That
      // pins a window of slots the placement must fall in.
      let lo = 0, hi = n - 1;
      for (let s = 0; s < n; s++) {
        const pr = placedRank[s];
        if (pr < 0) continue;
        if (pr <= rank - KNOWN_GAP && s + 1 > lo) lo = s + 1;
        if (pr >= rank + KNOWN_GAP && s - 1 < hi) hi = s - 1;
      }
      const est = rank + gauss(r) * sigma;
      let best = -1, bestD = Infinity;
      const pick = (from, to) => {
        for (let s = from; s <= to; s++) {
          if (!open[s]) continue;
          const d = Math.abs(s - est);
          if (d < bestD - 1e-9 || (Math.abs(d - bestD) <= 1e-9 && Math.abs(s - mid) < Math.abs(best - mid))) { best = s; bestD = d; }
        }
      };
      if (lo <= hi) pick(lo, hi);
      if (best < 0) pick(0, n - 1);   // the window is full: the board is already broken here
      slot = best;
    }
    open[slot] = false; placedRank[slot] = rank; left--;
    if (slot === rank) exact++;
  }
  return exact;
}

// Mean exact placements over SIMS runs, seeded on the subject id and the
// order itself so the figure is a pure function of the board.
export function parOf(subjectId, reveal, sims = SIMS, sigma = SIGMA) {
  const r = rng(hashStr(subjectId + '|' + reveal.join(',')));
  let total = 0;
  for (let i = 0; i < sims; i++) total += playOnce(reveal, r, sigma);
  return total / sims;
}

// The achievable range for a subject of n items: the min and max mean over
// a seeded sample of orders, plus the sample itself so the generator can
// pick from it. Random orders cluster in the middle of what an order can
// do, so the sample also carries the two structured extremes (the anchors
// first, then working inward; the middle first, then working outward) and
// a short seeded hill climb from each end, which is what actually finds the
// easiest and hardest orders. Deterministic in (subjectId, n).
export function orderRange(subjectId, n, samples = 1000) {
  const r = rng(hashStr('orders|' + subjectId + '|' + n));
  const seen = new Set();
  const out = [];
  const add = (perm) => {
    const key = perm.join(',');
    if (seen.has(key)) return null;
    seen.add(key);
    const o = { reveal: perm.slice(), mean: parOf(subjectId, perm) };
    out.push(o);
    return o;
  };
  // Structured seeds.
  const anchors = [], middle = [];
  for (let i = 0, j = n - 1; i <= j; i++, j--) { anchors.push(i); if (j !== i) anchors.push(j); }
  for (let i = Math.floor((n - 1) / 2), j = Math.ceil((n - 1) / 2); i >= 0; i--, j++) { middle.push(i); if (j !== i) middle.push(j); }
  add(anchors); add(middle); add(Array.from({ length: n }, (_, i) => i)); add(Array.from({ length: n }, (_, i) => n - 1 - i));
  while (out.length < samples) {
    const perm = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    add(perm);
  }
  // Hill climb from the current best and worst, 150 swaps each.
  for (const sign of [1, -1]) {
    let cur = out.reduce((a, b) => (sign * b.mean > sign * a.mean ? b : a));
    for (let it = 0; it < 150; it++) {
      const p = cur.reveal.slice();
      const i = Math.floor(r() * n), j = Math.floor(r() * n);
      if (i === j) continue;
      [p[i], p[j]] = [p[j], p[i]];
      const o = add(p);
      if (o && sign * o.mean > sign * cur.mean) cur = o;
    }
  }
  out.sort((a, b) => a.mean - b.mean);
  return { lo: out[0].mean, hi: out[out.length - 1].mean, sample: out };
}
