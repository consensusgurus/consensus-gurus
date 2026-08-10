// Generator for the Blitz problem bank. Run: node gen-blitz.mjs
//
// Blitz is multiple choice, which is the whole design risk: a mental-math
// question with four options can usually be beaten WITHOUT doing the
// arithmetic, by sieving on the last digit or on magnitude. So every distractor
// here is the result of a NAMED error a real solver makes, and the bank is then
// held to two anti-sieve rules that the verifier re-checks independently:
//
//   last digit  at least one distractor ends in the same digit as the answer
//   magnitude   every choice sits inside a tight band around the answer
//
// Between them, neither "what must the last digit be" nor "roughly how big is
// it" narrows the field to one, so the player has to actually compute.

import { writeFileSync } from 'fs';

// ---- deterministic PRNG (mulberry32) so a rebuild reproduces the bank -------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let R = rng(20260811);
const ri = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];

// ---- problem families -------------------------------------------------------
// Each returns { q, a, ds } — the display string, the answer, and candidate
// distractors IN PREFERENCE ORDER, each one a specific mistake. The assembler
// picks the first three that survive the anti-sieve rules.

const F = {};

// --- core four ---------------------------------------------------------------
F.add2 = () => {                                   // two-digit + two-digit, tier 1
  const x = ri(12, 49), y = ri(11, 39);
  return { q: `${x} + ${y}`, a: x + y, ds: [
    x + y - 10,      // dropped the carry
    x + y + 10,      // carried twice
    x + y - 1, x + y + 1,
    x + y - 9, x + y + 11,
  ] };
};
F.add2c = () => {                                  // forces a carry out of the units
  let x, y;
  do { x = ri(34, 89); y = ri(25, 79); } while ((x % 10) + (y % 10) < 10);
  return { q: `${x} + ${y}`, a: x + y, ds: [
    x + y - 10, x + y + 10, x + y - 1, x + y + 1, x + y - 9, x + y + 11,
  ] };
};
F.add3 = () => {                                   // three-digit + two/three-digit
  const x = ri(148, 869), y = ri(56, 249);
  return { q: `${x} + ${y}`, a: x + y, ds: [
    x + y - 10, x + y + 10, x + y - 100, x + y + 100, x + y - 1, x + y + 1,
  ] };
};
F.sub2 = () => {                                   // no borrow, tier 1
  let x, y;
  do { x = ri(35, 79); y = ri(11, 29); } while (x % 10 < y % 10);
  return { q: `${x} − ${y}`, a: x - y, ds: [
    x - y + 10, x - y - 10, x - y + 1, x - y - 1, x - y + 9, x - y - 9,
  ] };
};
F.sub2b = () => {                                  // forces a borrow
  let x, y;
  do { x = ri(41, 98); y = ri(13, 39); } while (x % 10 >= y % 10);
  return { q: `${x} − ${y}`, a: x - y, ds: [
    x - y + 10,      // failed to borrow, the classic
    x - y - 10, x - y + 1, x - y - 1, x - y + 9, x - y - 9,
  ] };
};
F.sub3 = () => {                                   // three-digit − three-digit
  const x = ri(320, 940), y = ri(115, 299);
  return { q: `${x} − ${y}`, a: x - y, ds: [
    x - y + 10, x - y - 10, x - y + 100, x - y - 100, x - y + 1, x - y - 1,
  ] };
};
F.mulTable = () => {                               // times table
  const x = ri(4, 9), y = ri(4, 9);
  return { q: `${x} × ${y}`, a: x * y, ds: [
    x * (y + 1), x * (y - 1), (x + 1) * y, (x - 1) * y, x * y + x + y,
  ] };
};
F.mulTable12 = () => {                             // the 11s and 12s
  const x = pick([11, 12]), y = ri(6, 12);
  return { q: `${x} × ${y}`, a: x * y, ds: [
    x * (y + 1), x * (y - 1), (x + 1) * y, (x - 1) * y, x * y + y,
  ] };
};
F.mul2x1 = () => {                                 // two-digit x one-digit
  const x = ri(23, 89), y = ri(4, 9);
  return { q: `${x} × ${y}`, a: x * y, ds: [
    x * y - 10,                  // lost a carry out of the units column
    (x - 1) * y, (x + 1) * y,    // slipped a multiple
    x * y + 10, x * y - y, x * y + y,
  ] };
};
F.mul2x2 = () => {                                 // structured two-digit x two-digit
  const x = ri(13, 49), y = pick([11, 12, 15, 21, 25]);
  return { q: `${x} × ${y}`, a: x * y, ds: [
    x * y - x,                   // dropped a partial product
    x * y + x, (x - 1) * y, (x + 1) * y, x * y - 10, x * y + 10,
  ] };
};
F.mul2x2hard = () => {                             // genuinely awkward pair
  // No round factor: x20 and x30 are one-step problems and have no business in
  // the last round (17 x 20 shipped there on the first build).
  let x, y;
  do { x = ri(14, 39); y = ri(13, 29); } while (x % 10 === 0 || y % 10 === 0);
  return { q: `${x} × ${y}`, a: x * y, ds: [
    x * y - x, x * y + x, x * y - y, x * y + y, (x - 1) * y, (x + 1) * y,
  ] };
};
F.divExact = () => {                               // single-digit quotient, tier 1
  const y = ri(3, 9), q = ri(3, 9), x = y * q;
  return { q: `${x} ÷ ${y}`, a: q, ds: [q + 1, q - 1, q + 2, q - 2, y] };
};
F.div1 = () => {                                   // quotient into the teens, tier 2
  const y = ri(3, 8), q = ri(12, 24), x = y * q;
  return { q: `${x} ÷ ${y}`, a: q, ds: [q + 1, q - 1, q + 2, q - 2, q + 10, q - 10] };
};
F.div2 = () => {                                   // two-digit quotient, tier 3
  const y = ri(4, 8), q = ri(23, 49), x = y * q;
  return { q: `${x} ÷ ${y}`, a: q, ds: [q + 1, q - 1, q + 10, q - 10, q + 2, q - 2] };
};

// --- percentages and fractions ----------------------------------------------
// A round must never ask the same THING twice in different clothing. "50% of
// 160" and "1/2 of 50" are one operation, and day 30 round 2 shipped both until
// this went in. Families return a `sig`, and a round takes each sig once.
const fracSig = (n, d) => ((n * 100) % d === 0 ? `pct${(n * 100) / d}` : `frac${n}/${d}`);
F.pctEasy = () => {                                // 10 / 25 / 50 of a round number
  const p = pick([10, 25, 50]), x = pick([40, 60, 80, 120, 160, 180, 240, 300, 360]);
  const a = (x * p) / 100;
  return { q: `${p}% of ${x}`, a, sig: `pct${p}`, ds: [
    a * 2, a / 2, a + 10, a - 10, a + x / 10,
  ].filter(Number.isInteger) };
};
F.pctMid = () => {                                 // 15 / 20 / 30 / 40
  const p = pick([15, 20, 30, 40]), x = pick([40, 60, 80, 90, 120, 140, 160, 180, 220, 240]);
  const a = (x * p) / 100;
  return { q: `${p}% of ${x}`, a, sig: `pct${p}`, ds: [
    (x * (p + 5)) / 100, (x * (p - 5)) / 100,   // slid one step on the percentage
    (x * (p + 10)) / 100, (x * (p - 10)) / 100,
    a + 10, a - 10,
  ].filter(Number.isInteger) };
};
F.pctHard = () => {                                // an awkward percentage
  const p = pick([12, 18, 35, 45, 65, 75]), x = pick([40, 60, 80, 120, 140, 160, 200, 240]);
  const a = (x * p) / 100;
  if (!Number.isInteger(a)) return null;
  return { q: `${p}% of ${x}`, a, sig: `pct${p}`, ds: [
    (x * (p + 5)) / 100, (x * (p - 5)) / 100, (x * (p + 10)) / 100, (x * (p - 10)) / 100,
    a + 10, a - 10, a + 1, a - 1,
  ].filter(Number.isInteger) };
};
F.pctChange = () => {                              // increase / decrease
  const p = pick([10, 20, 25, 50]), x = pick([40, 60, 80, 120, 160, 200, 240]);
  const up = R() < 0.5;
  const a = up ? x + (x * p) / 100 : x - (x * p) / 100;
  return {
    q: up ? `${x} increased by ${p}%` : `${x} decreased by ${p}%`,
    a,
    ds: [
      up ? x - (x * p) / 100 : x + (x * p) / 100,   // moved it the wrong way
      (x * p) / 100,                                 // answered the change, not the total
      a + 10, a - 10, a + x / 10, a - x / 10,
    ].filter(Number.isInteger),
  };
};
F.fracEasy = () => {                               // half / third / quarter of
  const [n, d] = pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4]]);
  const x = d * ri(6, 30);
  const a = (x / d) * n;
  return { q: `${n}/${d} of ${x}`, a, sig: fracSig(n, d), ds: [
    (x / d) * (n + 1), n > 1 ? (x / d) * (n - 1) : x / (d + 1),
    x / n === Math.round(x / n) ? (x / n) * d : x - a,   // flipped the fraction
    a + 10, a - 10, a + x / d, a - x / d,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.fracHard = () => {                               // an awkward fraction
  const [n, d] = pick([[3, 8], [5, 6], [2, 5], [3, 5], [4, 7], [5, 8], [5, 9]]);
  const x = d * ri(5, 18);
  const a = (x / d) * n;
  return { q: `${n}/${d} of ${x}`, a, sig: fracSig(n, d), ds: [
    (x / d) * (n + 1), (x / d) * (n - 1), x - a,   // took the complement
    a + 10, a - 10, a + 1, a - 1,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};

// --- order of operations -----------------------------------------------------
// The headline distractor is always the LEFT-TO-RIGHT read, which is the
// mistake this family exists to punish.
F.ooMul = () => {                                  // a + b x c
  const a1 = ri(8, 29), b = ri(4, 9), c = ri(4, 9);
  const ans = a1 + b * c;
  return { q: `${a1} + ${b} × ${c}`, a: ans, ds: [
    (a1 + b) * c,            // straight left to right
    ans - b, ans + b, ans - c, ans + c, ans + 1, ans - 1,
  ] };
};
F.ooSub = () => {                                  // a − b x c  (kept positive)
  const b = ri(3, 8), c = ri(3, 8), a1 = b * c + ri(6, 40);
  const ans = a1 - b * c;
  return { q: `${a1} − ${b} × ${c}`, a: ans, ds: [
    (a1 - b) * c, ans + b, ans - b, ans + c, ans - c, ans + 10, ans - 10,
  ].filter((v) => v > 0) };
};
F.ooParen = () => {                                // (a ± b) x c
  const a1 = ri(9, 29), b = ri(3, 8), c = ri(3, 9);
  const plus = R() < 0.5;
  const inner = plus ? a1 + b : a1 - b;
  const ans = inner * c;
  return {
    q: `(${a1} ${plus ? '+' : '−'} ${b}) × ${c}`,
    a: ans,
    ds: [
      plus ? a1 + b * c : a1 - b * c,   // ignored the bracket
      ans - c, ans + c, ans - b, ans + b, ans - 10, ans + 10,
    ].filter((v) => v > 0),
  };
};
F.ooChain = () => {                                // a x b + c x d
  // Four different operands, or you get lines like 5 x 5 + 5 x 5, which reads
  // as a typo and collapses to one multiplication doubled.
  const a1 = ri(3, 9), b = ri(3, 9), c = ri(3, 9), d = ri(3, 9);
  if (new Set([a1, b, c, d]).size < 3) return null;
  if (a1 * b === c * d) return null;
  const ans = a1 * b + c * d;
  return { q: `${a1} × ${b} + ${c} × ${d}`, a: ans, ds: [
    (a1 * b + c) * d,        // left to right through the whole line
    a1 * (b + c) * d,
    ans - a1, ans + a1, ans - c, ans + c, ans + 10, ans - 10,
  ].filter((v) => v > 0) };
};
F.ooDiv = () => {                                  // a + b ÷ c
  // a1 is chosen so that (a1 + b) divides by c exactly. Without that the
  // left-to-right read comes out fractional, gets filtered as a non-integer,
  // and the family loses the single distractor it exists to offer.
  const c = ri(3, 9), q = ri(4, 9), b = c * q;
  const a1 = ri(2, 6) * c;               // divisible by c, so (a1 + b) / c is whole
  const ans = a1 + q;
  if (a1 < 6) return null;
  return { q: `${a1} + ${b} ÷ ${c}`, a: ans, ds: [
    (a1 + b) / c,          // left to right: divided the whole sum
    ans + q, ans - q, ans + 1, ans - 1, ans + 10, ans - 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};

// --- squares, roots, powers ---------------------------------------------------
F.sqSmall = () => {                                // 11..15 squared
  const n = ri(11, 15);
  return { q: `${n}²`, a: n * n, ds: [
    n * (n + 1), n * (n - 1), (n + 1) * (n + 1), (n - 1) * (n - 1), n * 2, n * n + 10,
  ] };
};
const sqOf = (n) => ({ q: `${n}²`, a: n * n, ds: [
  n * (n + 1), n * (n - 1), (n + 1) * (n + 1), (n - 1) * (n - 1), n * n + 10, n * n - 10,
] });
F.sqBig = () => sqOf(ri(16, 23));                  // tier 4
F.sqHuge = () => sqOf(ri(24, 31));                 // tier 5
const rootOf = (n) => ({ q: `√${n * n}`, a: n, ds: [n + 1, n - 1, n + 2, n - 2, n + 10] });
F.root = () => rootOf(ri(12, 22));                 // tier 4
F.rootBig = () => rootOf(ri(23, 31));              // tier 5
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');
F.pow = () => {
  // Powers of two are deliberately absent. 512, 1024 and 2048 are memorised
  // furniture, so the answer is the one round-looking number on the board and
  // the problem answers itself. Cubes and small fourth powers make you
  // actually multiply, and the neighbouring cube is a real, tempting miss.
  const [base, ex] = pick([[3, 4], [3, 5], [4, 4], [5, 3], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [11, 3], [12, 3]]);
  const a = base ** ex;
  return { q: `${base}${sup(ex)}`, a, ds: [
    (base - 1) ** ex,          // the cube below
    (base + 1) ** ex,          // the cube above
    a - base ** (ex - 1),      // one factor short
    a + base ** (ex - 1),
    base * ex,                 // multiplied instead of raised
    a - 10, a + 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};

// ---- tier composition -------------------------------------------------------
// Four problems a tier, each from a DIFFERENT family, so no day is four of the
// same thing. Tier 1 is deliberately all core arithmetic; the exotic families
// arrive as the ladder climbs.
// EVERY FAMILY BELONGS TO EXACTLY ONE TIER. Sharing a family between adjacent
// tiers is what broke the first build: `27 / 3` landed in round 2 having drawn
// the same generator as round 1's `90 / 9`, so the ladder stopped climbing.
// Where an operation spans the ladder it does so as SEPARATE, separately
// bounded families (divExact -> div1 -> div2, sub2 -> sub2b -> sub3,
// sqBig -> sqHuge), never one family reused.
const TIERS = [
  { name: 'Warm-up', fams: ['add2', 'sub2', 'mulTable', 'divExact'] },
  { name: 'Steady', fams: ['add2c', 'sub2b', 'mulTable12', 'div1', 'pctEasy', 'fracEasy'] },
  { name: 'Quick', fams: ['mul2x1', 'add3', 'sub3', 'div2', 'ooMul', 'sqSmall', 'pctMid'] },
  { name: 'Sharp', fams: ['mul2x2', 'ooParen', 'ooSub', 'sqBig', 'root', 'pctHard', 'fracHard'] },
  { name: 'Flat out', fams: ['mul2x2hard', 'ooChain', 'ooDiv', 'pow', 'pctChange', 'sqHuge', 'rootBig'] },
];

// ---- the anti-sieve rules ---------------------------------------------------
// Kept here AND re-implemented independently in scripts/verify-blitz.mjs, which
// recomputes rather than trusting anything written below.
//
// The thing being protected is the ANSWER, not every option. A distractor may
// sit well outside the answer's neighbourhood when it is a genuine error (the
// left-to-right read of 12 + 7 x 8 really is 152), because all that does is
// make ONE option easy to dismiss. What must never happen is the answer itself
// standing out, so the test is that enough of the field crowds it:
//
//   tight    at least 2 distractors sit inside 0.6x-1.4x of the answer (or
//            within +/-max(4, half) when the answer is under 30), so the answer
//            is never the one plausible-sized number on the board
//   sane     no option beyond 0.25x-4x, so nothing is absurd filler
//   digit    for answers of 100 or more, at least one distractor ends in the
//            same digit. Below 100 this is not required, and deliberately so:
//            working out that 6 x 7 ends in 2 IS working out 6 x 7, so there is
//            no shortcut to close. On 47 x 6 there very much is.
const DIGIT_RULE_FROM = 100;
const isTight = (a, v) => (a < 30
  ? Math.abs(v - a) <= Math.max(4, Math.round(a * 0.5))
  : v >= a * 0.6 && v <= a * 1.4);
const isSane = (a, v) => Number.isInteger(v) && v > 0 && v >= a * 0.25 && v <= a * 4;

// Every 3-subset of the candidate pool, ordered so the most preferred (i.e. the
// most characteristic mistakes, which the families list first) come out first.
function* triples(n) {
  const idx = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) idx.push([i, j, k]);
  idx.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
  yield* idx;
}
// WHERE THE ANSWER SITS ONCE THE OPTIONS ARE SORTED IS ITSELF A TELL, and it is
// the one the first build failed on: taking each family's most characteristic
// mistakes in order put the answer second-smallest 65% of the time, so "always
// pick the second smallest" beat the game without any arithmetic at all. So the
// build tracks how often each sorted position has been used and, among the
// triples that satisfy every other rule, prefers the one that evens the four
// positions out. Preference order still breaks ties, so the distractors stay
// the characteristic mistakes.
const rankUsed = [0, 0, 0, 0];
function buildChoices(a, cands) {
  const seen = new Set([a]);
  const pool = [];
  for (const d of cands) {
    if (seen.has(d) || !isSane(a, d)) continue;
    seen.add(d);
    pool.push(d);
  }
  if (pool.length < 3) return null;
  let best = null, bestKey = null;
  let pref = 0;
  for (const [i, j, k] of triples(pool.length)) {
    pref++;
    const trio = [pool[i], pool[j], pool[k]];
    if (trio.filter((d) => isTight(a, d)).length < 2) continue;
    if (a >= DIGIT_RULE_FROM && !trio.some((d) => d % 10 === a % 10)) continue;
    const rank = [a, ...trio].sort((x, y) => x - y).indexOf(a);
    const key = rankUsed[rank] * 10000 + pref;
    if (bestKey === null || key < bestKey) { bestKey = key; best = { trio, rank }; }
  }
  if (!best) return null;
  rankUsed[best.rank]++;
  return best.trio;
}

// ---- assemble ---------------------------------------------------------------
const DAYS = 30;
const PER_TIER = 4;
const TOTAL = TIERS.length * PER_TIER;   // 20 a day

const seenQ = new Set();       // no problem statement repeats anywhere in the bank
const famCount = {};
const problems = [];
const puzzles = [];

function makeOne(fam, usedSigs) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const made = F[fam]();
    if (!made) continue;
    const { q, a, ds } = made;
    if (usedSigs && usedSigs.has(made.sig || fam)) continue;   // one concept per round
    if (seenQ.has(q)) continue;
    if (!Number.isInteger(a) || a <= 0 || a > 9999) continue;
    // A place-value slip (a carried ten written in the wrong column) is a real
    // mistake in every family, and it is the one that always shares the
    // answer's last digit. Appended LAST so a family's own characteristic
    // errors are always preferred, and this only fills the digit slot when
    // nothing more specific can.
    const chosen = buildChoices(a, [...ds, a - 10, a + 10, a - 20, a + 20, a - 100, a + 100]);
    if (!chosen) continue;
    seenQ.add(q);
    famCount[fam] = (famCount[fam] || 0) + 1;
    return { q, a, ds: chosen, fam, sig: made.sig || fam };
  }
  return null;
}

// A balanced correct-position sequence per day: each of A-D five times, never
// three of the same letter in a row.
function positionsFor() {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const bag = [];
    for (let k = 0; k < 4; k++) for (let j = 0; j < TOTAL / 4; j++) bag.push(k);
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    let ok = true;
    for (let i = 2; i < bag.length; i++) if (bag[i] === bag[i - 1] && bag[i] === bag[i - 2]) { ok = false; break; }
    if (ok) return bag;
  }
  throw new Error('no balanced position sequence');
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function dayInfo(i) {
  const d = new Date(Date.UTC(2026, 7, 10 + i));       // launches 2026-08-10
  const iso = d.toISOString().slice(0, 10);
  return {
    live: iso,
    dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    quizId: `blitz-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
  };
}

for (let day = 1; day <= DAYS; day++) {
  const dd = String(day).padStart(2, '0');
  const pos = positionsFor();
  const qids = [];
  let slot = 0;
  for (let t = 0; t < TIERS.length; t++) {
    // Four DIFFERENT families inside the tier. Tier 1 has exactly four, so it
    // uses all of them; the rest sample without replacement.
    const bag = [...TIERS[t].fams];
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    let used = 0, bi = 0;
    const usedSigs = new Set();
    while (used < PER_TIER) {
      if (bi >= bag.length) throw new Error(`tier ${t + 1} ran out of families on day ${day}`);
      const made = makeOne(bag[bi++], usedSigs);
      if (!made) continue;
      usedSigs.add(made.sig);
      const k = pos[slot];
      const choices = [...made.ds];
      choices.splice(k, 0, made.a);
      const id = `b${dd}p${String(slot + 1).padStart(2, '0')}`;
      problems.push({ id, tier: t + 1, fam: made.fam, sig: made.sig, q: made.q, choices, correct: k });
      qids.push(id);
      used++; slot++;
    }
  }
  const info = dayInfo(day - 1);
  puzzles.push({ num: day, ...info, sunday: new Date(`${info.live}T12:00:00Z`).getUTCDay() === 0, qids });
}

// ---- emit -------------------------------------------------------------------
const head = `// Problem bank for Blitz, the daily mental-arithmetic ladder. Imported ONLY by
// the server page (app/blitz/page.js), which resolves the picked day's twenty
// problems and hands the client just that day, so the rest of the bank never
// reaches a browser.
//
//   id       'b<day>p<slot>' — authored day and play order (slot 1..${TOTAL})
//   tier     1 (warm-up) .. 5 (flat out); a day runs ${PER_TIER} problems per tier, each
//            from a DIFFERENT family, so no round is four of the same thing
//   fam      the generator family, kept for the verifier's variety audit
//   sig      the OPERATION, which is not the same thing as the family: "50% of
//            160" and "1/2 of 80" are different families but one operation, and
//            a round takes each sig only once so it never asks you to halve twice
//   choices  exactly four, one correct
//
// EVERY DISTRACTOR IS A NAMED MISTAKE, never a random number: a dropped carry, a
// slipped multiple, a left-to-right read of a line that needs precedence, a
// flipped fraction, an adjacent square, a place-value slip. That is what makes
// four-option mental math honest, and three anti-sieve rules the verifier
// re-checks from scratch keep it that way. They protect the ANSWER from being
// spotted, which is not the same as making every option look equally likely:
//
//   tight   at least 2 distractors sit within 0.6x-1.4x of the answer (or
//           +/-max(4, half) under 30), so the answer is never the only
//           plausibly sized number on the board
//   sane    nothing beyond 0.25x-4x of the answer, so no absurd filler
//   digit   for answers of 100 or more, at least one distractor ends in the
//           same digit, so "it has to end in 2" never narrows it to one. Under
//           100 this is not required and deliberately so: working out that
//           6 x 7 ends in 2 IS working out 6 x 7. On 47 x 6 it is a real
//           shortcut, and it is closed.
//
// Extending the bank: rerun scripts/gen-blitz.mjs with a later start date, then
// scripts/verify-blitz.mjs, which must report zero findings. Never rewrite a day
// that has already gone live. Never reuse an id.
export const PROBLEMS = [
`;
const body = problems.map((p) =>
  `  { id: '${p.id}', tier: ${p.tier}, fam: '${p.fam}', sig: '${p.sig}', q: '${p.q}', choices: [${p.choices.join(', ')}], correct: ${p.correct} },`
).join('\n');
const tail = `
];

export const PROBLEM_MAP = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
`;
writeFileSync('problems.js', head + body + tail);

const phead = `// Puzzle data for Blitz, the daily mental-arithmetic ladder. Each day lists
// twenty problem ids from problems.js in play order: five rounds of four,
// warm-up to flat out. Imported by the server page (which resolves and gates by
// Eastern date), the archive map, and the daily APIs. The extra qids field is
// ignored by the shared daily consumers.
//
// THERE IS NO 'sunday' FIELD, AND THAT IS DELIBERATE, not an unfinished job.
// Blitz has no Sunday Edition, matching Streak and Deep, the two games it shares
// an engine with. Per the daily authoring standard an always-false sunday flag
// reads to the next session as a half-built feature, so the field is simply
// absent. If Blitz ever gets a Sunday (a sixth round, or a tighter clock), add
// 'sunday: true' to those days AND add 'blitz' to SUNDAY_EDITION_GAMES in
// lib/sunday-editions.js. The two must never drift apart.
export const PUZZLES = [
`;
const pbody = puzzles.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    qids: [${p.qids.map((q) => `'${q}'`).join(', ')}],
  },`).join('\n');
writeFileSync('puzzles.js', phead + pbody + '\n];\n');

console.log(`problems: ${problems.length}  days: ${puzzles.length}`);
console.log('family use:', Object.entries(famCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
