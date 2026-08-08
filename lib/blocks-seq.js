// Shape set, rotations and the day's shape ORDER for Blocks.
//
// Shared on purpose: app/blocks/BlocksClient.jsx plays from this, and
// scripts/verify-blocks.mjs proves the day's sequence is fair from the SAME
// code, so a checker can never pass a sequence the game does not actually deal.
//
// The order is generated from the day's quizId, so it is identical for every
// player on that day and needs no bank. 6,000 shapes is far deeper than anyone
// reaches (a strong solver tops out around 300 in a 16-row well), so nobody
// runs out of pieces mid-run.

// ---- the nine shapes -------------------------------------------------------
// The seven classics plus a 3-cell CORNER (relief: it fills a gap the classics
// cannot) and a 5-cell PLUS (punishment: it never sits flat on flat ground, so
// it leaves a hole unless you build it a seat first).
//
// Colour is one hue at nine lightness steps, so the well reads as a single
// material rather than a bag of sweets. The two additions take the two darkest
// steps, which is the only in-play cue that they are not classics.
export const HUE = 217, SAT = 91;
export const shade = (l) => `hsl(${HUE},${SAT}%,${l}%)`;

export const PIECES = {
  I: { l: 74, m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]] },
  O: { l: 69, m: [[1,1],[1,1]] },
  T: { l: 64, m: [[0,1,0],[1,1,1],[0,0,0]] },
  S: { l: 59, m: [[0,1,1],[1,1,0],[0,0,0]] },
  Z: { l: 54, m: [[1,1,0],[0,1,1],[0,0,0]] },
  J: { l: 49, m: [[1,0,0],[1,1,1],[0,0,0]] },
  L: { l: 44, m: [[0,0,1],[1,1,1],[0,0,0]] },
  C: { l: 36, m: [[1,0],[1,1]], extra: true },
  P: { l: 27, m: [[0,1,0],[1,1,1],[0,1,0]], extra: true },
};
Object.keys(PIECES).forEach((k) => {
  PIECES[k].c = shade(PIECES[k].l);
  PIECES[k].e = shade(Math.max(14, PIECES[k].l - 18));
});
export const CLASSIC = ['I','O','T','S','Z','J','L'];
export const EXTRA = ['C','P'];
export const PIECE_LABEL = { I:'I', O:'O', T:'T', S:'S', Z:'Z', J:'J', L:'L', C:'Corner', P:'Plus' };

function rotCW(m) {
  const n = m.length, r = [];
  for (let y = 0; y < n; y++) { r.push([]); for (let x = 0; x < n; x++) r[y].push(m[n - 1 - x][y]); }
  return r;
}
function rotationsOf(key) {
  const out = [PIECES[key].m];
  for (let i = 0; i < 3; i++) {
    const nx = rotCW(out[out.length - 1]);
    if (JSON.stringify(nx) === JSON.stringify(out[0])) break;
    out.push(nx);
  }
  return out;
}
export const ROT = {};
Object.keys(PIECES).forEach((k) => { ROT[k] = rotationsOf(k); });
export const shapeAt = (k, r) => ROT[k][r % ROT[k].length];

// ---- the day's order -------------------------------------------------------
export const SEQ_LEN = 6000;

function seedFrom(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A shuffled 7-bag of classics, with 0, 1 or 2 extras spliced into each bag.
// The bag is what guarantees nobody sits through an I-drought; the splice is
// what keeps the corner and the plus a spice (~12% of all shapes) rather than
// the meal.
export function buildSequence(quizId, len = SEQ_LEN) {
  const rnd = mulberry32(seedFrom(`blocks|${quizId}`));
  const seq = [];
  while (seq.length < len) {
    const bag = CLASSIC.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = bag[i]; bag[i] = bag[j]; bag[j] = t;
    }
    const roll = rnd();
    const nExtra = roll < 0.20 ? 0 : roll < 0.85 ? 1 : 2;
    for (let e = 0; e < nExtra; e++) {
      const key = rnd() < 0.62 ? 'C' : 'P';
      bag.splice(Math.floor(rnd() * (bag.length + 1)), 0, key);
    }
    for (const k of bag) { if (seq.length < len) seq.push(k); }
  }
  return seq;
}

// ---- scoring ---------------------------------------------------------------
// The daily score is ROWS CLEARED, mapped onto the 0-10 every daily posts (see
// lib/daily-combined.js, which turns that into 5 completion points and 10
// placement points). Par is the row count that earns the full 10; above par
// still scores 10 and ties break on FEWEST SHAPES USED, then on time. Shapes is
// the right second signal here: same rows off fewer shapes is efficiency, and
// unlike a clock it does not push anyone to hurry in a game built without one.
//
// Rows, not points: it is the thing the player is actually doing, everyone gets
// the same shapes to do it with, and a points total quietly rewarded
// soft-dropping, which is padding rather than play. The line/combo/quad values
// below still exist, but only as a running figure on screen and in the share
// text; they do not decide the score.
export const GRAVITY_MS = 460;         // fixed for the whole run. No speed curve.
export const LINE_POINTS = { 1: 100, 2: 300, 3: 500, 4: 800 };
export const QUAD_BONUS = 400;
export const COMBO_STEP = 50;

export function scoreOutOfTen(raw, par) {
  if (!raw || raw <= 0) return 0;
  return Math.max(1, Math.min(10, Math.round((raw / par) * 10)));
}
