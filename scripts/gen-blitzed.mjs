// Generator for the Blitzed problem bank.
//
// Blitzed is Blitz with a third element on every line: 5 + 10 × 2, not 47 × 6.
// Same twenty a day in five rounds of four, same one life, a twenty-second
// clock instead of fifteen because every problem is two operations. The
// generator is a sibling of scripts/gen-blitz.mjs and keeps its shape (fixed
// seed, families in exactly one tier, one operation per round, named-mistake
// distractors, the anti-sieve rules, the sorted-position balance), so read
// that file's header for the reasoning behind each piece. What is different
// here is the families, and one rule that Blitz does not have:
//
//   EVERY LINE HAS EXACTLY THREE OPERANDS AND TWO BINARY OPERATIONS. A square,
//   a cube or a root decorates an operand, it does not count as an operation,
//   so 13² + 4 × 7 is a legal line and 13² + 8 is not. The verifier counts.
//
// The distractor that exists here and nowhere else is the DROPPED THIRD TERM:
// a solver who does the first operation and stops. It is listed first for the
// chain families because it is the mistake a third element invites.
//
//   node scripts/gen-blitzed.mjs
//       Rebuilds the WHOLE bank from the fixed seed (2026-09-03, 78 days) into
//       ./problems.js and ./puzzles.js. Only right on a bank with no live days.
//
//   node scripts/gen-blitzed.mjs --from 2026-11-20 --days 60 --startnum 79 \
//                                --avoid app/blitzed --out /tmp/blitzed-new
//       Generates ONLY that range, to be spliced onto the end of the live bank.
//
//   --from --days --startnum --avoid --out --seed --force: as in gen-blitz.mjs.

import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

// ---- CLI --------------------------------------------------------------------
const ARGV = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = ARGV.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = ARGV[i + 1];
  if (v === undefined || v.startsWith('--')) throw new Error(`--${name} needs a value`);
  return v;
};
const FROM = arg('from', '2026-09-03');
if (!/^\d{4}-\d{2}-\d{2}$/.test(FROM)) throw new Error(`--from must be YYYY-MM-DD, got ${FROM}`);
const DAYS = Number(arg('days', 78));
const START_NUM = Number(arg('startnum', 1));
const AVOID = arg('avoid', null);
const OUT_DIR = arg('out', '.');
const SEED = Number(arg('seed', 20260903));
const FORCE = ARGV.includes('--force');
if (!Number.isInteger(DAYS) || DAYS < 1) throw new Error('--days must be a positive integer');
if (!Number.isInteger(START_NUM) || START_NUM < 1) throw new Error('--startnum must be a positive integer');

// ---- deterministic PRNG (mulberry32) ----------------------------------------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(SEED);
const ri = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(R() * arr.length)];

// ---- problem families -------------------------------------------------------
// Each returns { q, a, ds, sig? }: the printed line, the answer, and candidate
// distractors IN PREFERENCE ORDER, each a specific mistake. Families with a sig
// share an operation with another family, and a round takes each sig once.
const F = {};
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n) => String(n).split('').map((d) => SUP[+d]).join('');

// --- tier 1, Warm-up: chains that read left to right and mean it -------------
// A product BEFORE a sum reads the same either way (5 × 2 + 3 is 13 whichever
// rule you use), so the warm-up can hold a multiplication without asking the
// player to know precedence yet. That comes in round two.
F.add3 = () => {                                   // a + b + c, small
  const x = ri(11, 39), y = ri(3, 9), z = ri(3, 9);
  const a = x + y + z;
  return { q: `${x} + ${y} + ${z}`, a, ds: [
    x + y,                 // dropped the third term
    a - 10, a + 10, a - 1, a + 1, x + z,
  ] };
};
F.sub3 = () => {                                   // a − b − c, no borrow
  let x, y, z;
  do { x = ri(25, 79); y = ri(2, 9); z = ri(2, 9); } while (x % 10 < y + z || y === z);
  const a = x - y - z;
  return { q: `${x} − ${y} − ${z}`, a, sig: 'sub3', ds: [
    x - y,                 // dropped the third term
    x - y + z,             // subtracted one, added the other
    a - 10, a + 10, a - 1, a + 1,
  ] };
};
F.addSub = () => {                                 // a + b − c
  const x = ri(12, 49), y = ri(4, 9), z = ri(3, 9);
  if (y === z) return null;    // 43 + 5 − 5 is not a problem
  const a = x + y - z;
  return { q: `${x} + ${y} − ${z}`, a, ds: [
    x + y,                 // dropped the third term
    x + y + z,             // added both
    x - y + z,             // signs swapped
    a - 10, a + 10, a - 1, a + 1,
  ] };
};
F.mulAdd = () => {                                 // a × b + c, product first
  const x = ri(3, 9), y = ri(3, 9), z = ri(3, 19);
  const a = x * y + z;
  return { q: `${x} × ${y} + ${z}`, a, sig: 'mulAdd', ds: [
    x * y,                 // dropped the third term
    x * (y + z),           // added first, then multiplied
    (x + 1) * y + z, (x - 1) * y + z,
    a - 1, a + 1, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.mulSub = () => {                                 // a × b − c, product first
  const x = ri(3, 9), y = ri(4, 9), z = ri(2, 9);
  const a = x * y - z;
  if (a < 6) return null;
  return { q: `${x} × ${y} − ${z}`, a, sig: 'mulSub', ds: [
    x * y,                 // dropped the third term
    x * (y - z) > 0 ? x * (y - z) : x * y + z,
    (x + 1) * y - z, (x - 1) * y - z,
    a - 1, a + 1, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.divAdd = () => {                                 // a ÷ b + c, exact table
  const y = ri(2, 9), q = ri(2, 9), x = y * q, z = ri(3, 19);
  const a = q + z;
  return { q: `${x} ÷ ${y} + ${z}`, a, sig: 'divAdd', ds: [
    q,                     // dropped the third term
    q + 1 + z, q - 1 + z,  // slipped the quotient
    a - 10, a + 10, a - 1, a + 1,
  ].filter((v) => v > 0) };
};

// --- tier 2, Steady: two-digit chains, and precedence arrives -----------------
F.add3two = () => {                                // a + b + c, all two-digit
  const x = ri(21, 59), y = ri(12, 39), z = ri(11, 29);
  const a = x + y + z;
  return { q: `${x} + ${y} + ${z}`, a, ds: [
    x + y,                 // dropped the third term
    a - 10,                // dropped a carry
    a + 10, a - 1, a + 1, a - 9, a + 11,
  ] };
};
F.sub3two = () => {                                // a − b − c, two-digit, borrow
  let x, y, z;
  do { x = ri(60, 99); y = ri(12, 29); z = ri(11, 25); } while (x - y - z < 12 || x % 10 >= (y % 10) + (z % 10) || y === z);
  const a = x - y - z;
  return { q: `${x} − ${y} − ${z}`, a, sig: 'sub3', ds: [
    x - y,                 // dropped the third term
    a + 10,                // failed to borrow
    x - y + z, a - 10, a - 1, a + 1,
  ].filter((v) => v > 0) };
};
F.ooMul = () => {                                  // a + b × c, small
  const x = ri(5, 29), y = ri(3, 9), z = ri(2, 9);
  const a = x + y * z;
  return { q: `${x} + ${y} × ${z}`, a, sig: 'ooMul', ds: [
    (x + y) * z,           // straight left to right
    y * z,                 // dropped the first term
    a - y, a + y, a - 1, a + 1, a - 10, a + 10,
  ] };
};
F.ooSub = () => {                                  // a − b × c, small
  const y = ri(3, 8), z = ri(2, 7), x = y * z + ri(5, 30);
  const a = x - y * z;
  return { q: `${x} − ${y} × ${z}`, a, sig: 'ooSub', ds: [
    (x - y) * z,           // straight left to right
    x - y,                 // dropped the third term
    a + y, a - y, a + z, a - z, a + 10, a - 10,
  ].filter((v) => v > 0) };
};
F.mulAdd2 = () => {                                // a × b + c, table with a two-digit tail
  const x = ri(6, 9), y = ri(6, 9), z = ri(21, 49);
  const a = x * y + z;
  return { q: `${x} × ${y} + ${z}`, a, sig: 'mulAdd', ds: [
    x * y,                 // dropped the third term
    x * (y + z),           // added first
    (x + 1) * y + z, (x - 1) * y + z, a - 10, a + 10, a - 1, a + 1,
  ].filter((v) => v > 0) };
};
F.divSub = () => {                                 // a ÷ b − c
  const y = ri(3, 9), q = ri(12, 24), x = y * q, z = ri(3, 9);
  const a = q - z;
  return { q: `${x} ÷ ${y} − ${z}`, a, sig: 'divSub', ds: [
    q,                     // dropped the third term
    q + z,                 // added instead
    q + 1 - z, q - 1 - z, a + 10, a - 10,
  ].filter((v) => v > 0) };
};

// --- tier 3, Quick: bigger operands, a bracket, a percentage ------------------
F.mul2x1add = () => {                              // ab × c + d
  const x = ri(13, 49), y = ri(3, 9), z = ri(11, 39);
  const a = x * y + z;
  return { q: `${x} × ${y} + ${z}`, a, sig: 'mulAdd', ds: [
    x * y,                 // dropped the third term
    x * y - 10 + z,        // lost a carry in the product
    (x - 1) * y + z, (x + 1) * y + z, a - 10, a + 10, a - 1, a + 1,
  ] };
};
F.ooParen = () => {                                // (a + b) × c
  const x = ri(6, 19), y = ri(3, 9), z = ri(3, 9);
  const a = (x + y) * z;
  return { q: `(${x} + ${y}) × ${z}`, a, sig: 'paren', ds: [
    x + y * z,             // ignored the bracket
    (x + y) * (z + 1), (x + y) * (z - 1),
    a - z, a + z, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.add3big = () => {                                // three-digit + two-digit + two-digit
  const x = ri(140, 690), y = ri(23, 89), z = ri(14, 79);
  const a = x + y + z;
  return { q: `${x} + ${y} + ${z}`, a, ds: [
    x + y,                 // dropped the third term
    a - 10, a + 10, a - 100, a + 100, a - 1, a + 1,
  ] };
};
F.pctAdd = () => {                                 // p% of x + y, easy percentage
  const p = pick([10, 25, 50]), x = pick([40, 60, 80, 120, 140, 160, 180, 200, 240, 260, 280, 320, 360, 440, 480]);
  const z = ri(7, 39);
  const part = (x * p) / 100;
  if (!Number.isInteger(part)) return null;
  const a = part + z;
  return { q: `${p}% of ${x} + ${z}`, a, sig: `pct${p}`, ds: [
    part,                  // dropped the third term
    part * 2 + z, part / 2 + z,
    a - 10, a + 10, a - 1, a + 1,
  ].filter(Number.isInteger) };
};
F.divChain = () => {                               // a ÷ b ÷ c
  const y = ri(2, 6), z = ri(2, 6), q = ri(4, 19), x = y * z * q;
  if (x < 60 || (y === 2 && z === 2)) return null;   // 40 ÷ 2 ÷ 2 is a warm-up, not round three
  const a = q;
  return { q: `${x} ÷ ${y} ÷ ${z}`, a, sig: 'divChain', ds: [
    x / y,                 // dropped the third term
    q * z, q * y,          // divided by one of them only... then stopped
    q + 1, q - 1, q + 2, q - 2, q + 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.ooDiv = () => {                                  // a + b ÷ c
  // a is a multiple of c so the left-to-right read comes out whole and the
  // family keeps the one distractor it exists to offer.
  const c = ri(3, 9), q = ri(4, 12), b = c * q;
  const a1 = ri(3, 9) * c;
  const a = a1 + q;
  return { q: `${a1} + ${b} ÷ ${c}`, a, sig: 'ooDiv', ds: [
    (a1 + b) / c,          // left to right: divided the whole sum
    q,                     // dropped the first term
    a + q, a - q, a + 1, a - 1, a + 10, a - 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.sqAdd = () => {                                  // n² + a × b, small square
  const n = ri(11, 15), y = ri(3, 9), z = ri(3, 9);
  const a = n * n + y * z;
  return { q: `${n}${sup(2)} + ${y} × ${z}`, a, sig: 'sq', ds: [
    n * n,                 // dropped the product
    (n * n + y) * z,       // left to right
    n * (n + 1) + y * z, n * (n - 1) + y * z,   // the neighbouring rectangle
    a - 10, a + 10, a - 1, a + 1,
  ] };
};

// --- tier 4, Sharp: two-digit products, awkward fractions, mixed chains -------
F.ooParenSub = () => {                             // (a − b) × c
  const y = ri(4, 19), x = y + ri(6, 29), z = ri(4, 9);
  const a = (x - y) * z;
  return { q: `(${x} − ${y}) × ${z}`, a, sig: 'paren', ds: [
    x - y * z > 0 ? x - y * z : x + y * z,   // ignored the bracket
    (x - y) * (z + 1), (x - y) * (z - 1),
    a - z, a + z, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.mul2x2add = () => {                              // ab × cd + e, structured
  const x = ri(13, 39), y = pick([11, 12, 15, 21, 25]), z = ri(12, 49);
  const a = x * y + z;
  return { q: `${x} × ${y} + ${z}`, a, sig: 'mulAdd', ds: [
    x * y,                 // dropped the third term
    x * y - x + z,         // dropped a partial product
    x * y + x + z, (x - 1) * y + z, (x + 1) * y + z, a - 10, a + 10,
  ] };
};
F.pctMidSub = () => {                              // p% of x − y
  const p = pick([15, 20, 30, 40]), x = pick([60, 80, 90, 120, 140, 150, 160, 180, 200, 220, 240, 260, 280, 300]);
  const part = (x * p) / 100;
  if (!Number.isInteger(part)) return null;
  const z = ri(5, Math.min(29, part - 4));
  if (z < 5) return null;
  const a = part - z;
  return { q: `${p}% of ${x} − ${z}`, a, sig: `pct${p}`, ds: [
    part,                  // dropped the third term
    part + z,              // added instead
    (x * (p + 5)) / 100 - z, (x * (p - 5)) / 100 - z,   // slid a step on the percentage
    a - 10, a + 10, a - 1, a + 1,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.fracAdd = () => {                                // n/d of x + y
  const [n, d] = pick([[2, 3], [3, 4], [3, 5], [2, 5], [3, 8], [5, 6], [5, 8]]);
  const x = d * ri(4, 20), z = ri(6, 29);
  const part = (x / d) * n;
  const a = part + z;
  const sig = (n * 100) % d === 0 ? `pct${(n * 100) / d}` : `frac${n}/${d}`;
  return { q: `${n}/${d} of ${x} + ${z}`, a, sig, ds: [
    part,                  // dropped the third term
    (x / d) * (n + 1) + z, (x / d) * (n - 1) + z,
    x - part + z,          // took the complement
    a - 10, a + 10, a - 1, a + 1,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.mulDiv = () => {                                 // a × b ÷ c
  const c = ri(3, 8), y = ri(4, 9), k = ri(3, 9), x = c * k;   // x divisible by c
  const a = (x * y) / c;
  if (x < 12) return null;
  return { q: `${x} × ${y} ÷ ${c}`, a, sig: 'mulDiv', ds: [
    x * y,                 // dropped the third term
    x * (y / c) === Math.round(x * (y / c)) ? x * (y / c) : a + c,
    a + y, a - y, a + k, a - k, a + 10, a - 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.mul3 = () => {                                   // a × b × c, small
  const x = ri(3, 9), y = ri(3, 9), z = ri(2, 6);
  if (new Set([x, y, z]).size < 2) return null;
  const a = x * y * z;
  if (a < 60) return null;
  return { q: `${x} × ${y} × ${z}`, a, sig: 'mul3', ds: [
    x * y,                 // dropped the third term
    x * y + z,             // added the last one
    (x + 1) * y * z, (x - 1) * y * z, x * y * (z + 1), x * y * (z - 1),
    a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.sqSub = () => {                                  // n² − a × b, sharp square
  const n = ri(16, 23), y = ri(4, 9), z = ri(4, 9);
  const a = n * n - y * z;
  return { q: `${n}${sup(2)} − ${y} × ${z}`, a, sig: 'sq', ds: [
    n * n,                 // dropped the product
    (n * n - y) * z,       // left to right
    n * (n + 1) - y * z, n * (n - 1) - y * z,
    (n + 1) * (n + 1) - y * z, (n - 1) * (n - 1) - y * z,
    a - 10, a + 10,
  ].filter((v) => v > 0) };
};

// --- tier 5, Flat out ---------------------------------------------------------
F.mul3big = () => {                                // a × b × c with a two-digit factor
  const x = ri(11, 19), y = ri(3, 9), z = ri(3, 7);
  const a = x * y * z;
  return { q: `${x} × ${y} × ${z}`, a, sig: 'mul3', ds: [
    x * y,                 // dropped the third term
    x * y * z - x,         // dropped a partial product
    x * y * z + x, (x + 1) * y * z, (x - 1) * y * z, x * y * (z + 1), x * y * (z - 1),
    a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.mul2x2sub = () => {                              // ab × cd − e, awkward pair
  let x, y;
  do { x = ri(13, 29); y = ri(13, 24); } while (x % 10 === 0 || y % 10 === 0);
  const z = ri(12, 59);
  const a = x * y - z;
  return { q: `${x} × ${y} − ${z}`, a, sig: 'mulSub', ds: [
    x * y,                 // dropped the third term
    x * y - x - z, x * y + x - z, x * y - y - z, x * y + y - z,
    (x - 1) * y - z, (x + 1) * y - z, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.pctHardAdd = () => {                             // awkward p% of x ± y
  const p = pick([12, 18, 22, 35, 45, 55, 65, 75, 85, 95]), x = pick([40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300]);
  const part = (x * p) / 100;
  if (!Number.isInteger(part)) return null;
  const plus = R() < 0.5;
  const z = plus ? ri(13, 49) : ri(7, Math.min(39, part - 5));
  if (!plus && z < 7) return null;
  const a = plus ? part + z : part - z;
  return { q: `${p}% of ${x} ${plus ? '+' : '−'} ${z}`, a, sig: `pct${p}`, ds: [
    part,                  // dropped the third term
    plus ? part - z : part + z,   // wrong way
    (x * (p + 5)) / 100 + (plus ? z : -z), (x * (p - 5)) / 100 + (plus ? z : -z),
    (x * (p + 10)) / 100 + (plus ? z : -z), (x * (p - 10)) / 100 + (plus ? z : -z),
    a - 10, a + 10, a - 1, a + 1,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};
F.cubeAdd = () => {                                // n³ + a × b
  const n = pick([4, 5, 6, 7, 8, 9, 11, 12]), y = ri(4, 9), z = ri(4, 9);
  const a = n ** 3 + y * z;
  return { q: `${n}${sup(3)} + ${y} × ${z}`, a, sig: 'pow', ds: [
    n ** 3,                // dropped the product
    (n - 1) ** 3 + y * z, (n + 1) ** 3 + y * z,   // the cube next door
    n * n + y * z,         // squared instead
    n * 3 + y * z,         // multiplied instead of raised
    (n ** 3 + y) * z,      // left to right
    a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.sqHugeSub = () => {                              // n² − a × b, flat-out square
  const n = ri(24, 39), y = ri(6, 9), z = ri(6, 9);
  const a = n * n - y * z;
  return { q: `${n}${sup(2)} − ${y} × ${z}`, a, sig: 'sq', ds: [
    n * n,                 // dropped the product
    n * (n + 1) - y * z, n * (n - 1) - y * z,
    (n + 1) * (n + 1) - y * z, (n - 1) * (n - 1) - y * z,
    a - 10, a + 10, a - 100, a + 100,
  ].filter((v) => v > 0) };
};
F.divBigSub = () => {                              // abc ÷ d − e, two-digit quotient
  const y = ri(4, 9), q = ri(23, 69), x = y * q, z = ri(11, 19);
  const a = q - z;
  return { q: `${x} ÷ ${y} − ${z}`, a, sig: 'divSub', ds: [
    q,                     // dropped the third term
    q + z,                 // added instead
    q + 1 - z, q - 1 - z, q + 10 - z, q - 10 - z, a - 1, a + 1,
  ].filter((v) => v > 0) };
};
F.rootAdd = () => {                                // √n + a × b
  const n = ri(13, 29), y = ri(4, 9), z = ri(4, 9);
  const a = n + y * z;
  return { q: `√${n * n} + ${y} × ${z}`, a, sig: 'root', ds: [
    n,                     // dropped the product
    (n + 1) + y * z, (n - 1) + y * z,   // the root next door
    (n + y) * z,           // left to right
    n * n + y * z > a * 4 ? a + 10 : n * n + y * z,
    a - 1, a + 1, a - 10, a + 10,
  ].filter((v) => v > 0) };
};
F.ooParenDiv = () => {                             // (a + b) ÷ c, big
  const c = ri(3, 9), q = ri(12, 39), s = c * q;
  const x = ri(Math.floor(s * 0.3), Math.floor(s * 0.7)), y = s - x;
  if (y < 10) return null;
  const a = q;
  return { q: `(${x} + ${y}) ÷ ${c}`, a, sig: 'paren', ds: [
    x + y / c === Math.round(x + y / c) ? x + y / c : q + c,   // ignored the bracket
    q + 1, q - 1, q + 2, q - 2, q + 10, q - 10,
  ].filter((v) => Number.isInteger(v) && v > 0) };
};

// ---- tier composition -------------------------------------------------------
// EVERY FAMILY BELONGS TO EXACTLY ONE TIER, as in Blitz. Where an operation
// spans the ladder it does so as separately bounded families (mulAdd ->
// mulAdd2 -> mul2x1add -> mul2x2add, sqAdd -> sqSub -> sqHugeSub).
const TIERS = [
  { name: 'Warm-up', fams: ['add3', 'sub3', 'addSub', 'mulAdd', 'mulSub', 'divAdd'] },
  { name: 'Steady', fams: ['add3two', 'sub3two', 'ooMul', 'ooSub', 'mulAdd2', 'divSub'] },
  { name: 'Quick', fams: ['mul2x1add', 'ooParen', 'add3big', 'pctAdd', 'divChain', 'ooDiv', 'sqAdd'] },
  { name: 'Sharp', fams: ['ooParenSub', 'mul2x2add', 'pctMidSub', 'fracAdd', 'mulDiv', 'mul3', 'sqSub'] },
  { name: 'Flat out', fams: ['mul3big', 'mul2x2sub', 'pctHardAdd', 'cubeAdd', 'sqHugeSub', 'divBigSub', 'rootAdd', 'ooParenDiv'] },
];

// ---- the anti-sieve rules (mirrored in scripts/verify-blitzed.mjs) ----------
const DIGIT_RULE_FROM = 100;
const isTight = (a, v) => (a < 30
  ? Math.abs(v - a) <= Math.max(4, Math.round(a * 0.5))
  : v >= a * 0.6 && v <= a * 1.4);
const isSane = (a, v) => Number.isInteger(v) && v > 0 && v >= a * 0.25 && v <= a * 4;

function* triples(n) {
  const idx = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) idx.push([i, j, k]);
  idx.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]));
  yield* idx;
}
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
const PER_TIER = 4;
const TOTAL = TIERS.length * PER_TIER;

const seenQ = new Set();
const takenIds = new Set();
const famCount = {};

if (AVOID) {
  const dir = resolve(AVOID);
  const { PROBLEMS: PRIOR } = await import(pathToFileURL(`${dir}/problems.js`).href);
  const { PUZZLES: PRIOR_DAYS } = await import(pathToFileURL(`${dir}/puzzles.js`).href);
  for (const p of PRIOR) {
    seenQ.add(p.q);
    takenIds.add(p.id);
    rankUsed[[...p.choices].sort((x, y) => x - y).indexOf(p.choices[p.correct])]++;
  }
  const lastNum = Math.max(...PRIOR_DAYS.map((d) => d.num));
  const lastLive = PRIOR_DAYS.map((d) => d.live).sort().at(-1);
  if (START_NUM <= lastNum) throw new Error(`--startnum ${START_NUM} would reuse day numbers; the avoided bank already runs to num ${lastNum}`);
  if (FROM <= lastLive) throw new Error(`--from ${FROM} is not after the avoided bank's last live date ${lastLive}`);
  console.log(`avoiding ${PRIOR.length} problems over ${PRIOR_DAYS.length} days (through num ${lastNum}, ${lastLive})`);
}
const problems = [];
const puzzles = [];

function makeOne(fam, usedSigs) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const made = F[fam]();
    if (!made) continue;
    const { q, a, ds } = made;
    if (usedSigs && usedSigs.has(made.sig || fam)) continue;
    if (seenQ.has(q)) continue;
    if (!Number.isInteger(a) || a <= 0 || a > 9999) continue;
    const chosen = buildChoices(a, [...ds, a - 10, a + 10, a - 20, a + 20, a - 100, a + 100]);
    if (!chosen) continue;
    seenQ.add(q);
    famCount[fam] = (famCount[fam] || 0) + 1;
    return { q, a, ds: chosen, fam, sig: made.sig || fam };
  }
  return null;
}

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
  const [yy, mm, dd0] = FROM.split('-').map(Number);
  const d = new Date(Date.UTC(yy, mm - 1, dd0 + i));
  const iso = d.toISOString().slice(0, 10);
  return {
    live: iso,
    dateLabel: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
    quizId: `blitzed-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
  };
}

for (let step = 0; step < DAYS; step++) {
  const day = START_NUM + step;
  const dd = String(day).padStart(2, '0');
  const pos = positionsFor();
  const qids = [];
  let slot = 0;
  for (let t = 0; t < TIERS.length; t++) {
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
      const id = `z${dd}p${String(slot + 1).padStart(2, '0')}`;
      if (takenIds.has(id)) throw new Error(`id ${id} already exists in the avoided bank`);
      takenIds.add(id);
      problems.push({ id, tier: t + 1, fam: made.fam, sig: made.sig, q: made.q, choices, correct: k });
      qids.push(id);
      used++; slot++;
    }
  }
  puzzles.push({ num: day, ...dayInfo(step), qids });
}

// ---- emit -------------------------------------------------------------------
function guardOut(name) {
  const path = resolve(OUT_DIR, name);
  if (!FORCE && existsSync(path)) {
    throw new Error(path + ' already exists. Extending a live bank means '
      + '--from/--days/--startnum/--avoid plus a splice, never a rebuild. '
      + 'Pass --force only if that file is scratch.');
  }
}
const head = `// Problem bank for Blitzed, the daily three-element mental-arithmetic ladder.
// Imported ONLY by the server page (app/blitzed/page.js), which resolves the
// picked day's twenty problems and hands the client just that day, so the rest
// of the bank never reaches a browser.
//
//   id       'z<day>p<slot>' — authored day and play order (slot 1..${TOTAL})
//   tier     1 (warm-up) .. 5 (flat out); a day runs ${PER_TIER} problems per tier, each
//            from a DIFFERENT family, so no round is four of the same thing
//   fam      the generator family, kept for the verifier's variety audit
//   sig      the OPERATION, which is not the same thing as the family; a round
//            takes each sig only once
//   choices  exactly four, one correct
//
// EVERY LINE HAS THREE OPERANDS AND TWO OPERATIONS (5 + 10 × 2, never 47 × 6):
// that is the whole difference from Blitz, and scripts/verify-blitzed.mjs
// counts it on every problem. A square, a cube or a root decorates an operand
// and is not an operation.
//
// EVERY DISTRACTOR IS A NAMED MISTAKE, never a random number, and the first one
// listed for most families is the one a third element invites: doing the first
// operation and stopping. The rest are Blitz's: a dropped carry, a slipped
// multiple, the left-to-right read of a line that needs precedence, an ignored
// bracket, the neighbouring square or cube. Three anti-sieve rules the
// verifier re-checks from scratch keep the answer from being spotted:
//
//   tight   at least 2 distractors sit within 0.6x-1.4x of the answer (or
//           +/-max(4, half) under 30)
//   sane    nothing beyond 0.25x-4x of the answer
//   digit   for answers of 100 or more, at least one distractor ends in the
//           same digit
//
// Extending the bank: generate ONLY the new range and splice it on, never
// rebuild, because rebuilding rewrites days that have already gone live:
//   node scripts/gen-blitzed.mjs --from <next date> --days N --startnum <next num> \\
//        --avoid app/blitzed --out /tmp/blitzed-new
// then splice the new entries in before the closing bracket of this file and of
// puzzles.js, and run scripts/verify-blitzed.mjs, which must report zero
// findings. Never rewrite a day that has already gone live. Never reuse an id.
export const PROBLEMS = [
`;
const body = problems.map((p) =>
  `  { id: '${p.id}', tier: ${p.tier}, fam: '${p.fam}', sig: '${p.sig}', q: '${p.q}', choices: [${p.choices.join(', ')}], correct: ${p.correct} },`
).join('\n');
const tail = `
];

export const PROBLEM_MAP = Object.fromEntries(PROBLEMS.map((p) => [p.id, p]));
`;
guardOut('problems.js');
writeFileSync(resolve(OUT_DIR, 'problems.js'), head + body + tail);

const phead = `// Puzzle data for Blitzed, the daily three-element mental-arithmetic ladder.
// Each day lists twenty problem ids from problems.js in play order: five rounds
// of four, warm-up to flat out. Imported by the server page (which resolves and
// gates by Eastern date), the archive map, and the daily APIs. The extra qids
// field is ignored by the shared daily consumers.
//
// THERE IS NO 'sunday' FIELD, AND THAT IS DELIBERATE, not an unfinished job.
// Blitzed has no Sunday Edition, matching Blitz, Streak and Deep, the games it
// shares an engine with. Per the daily authoring standard an always-false
// sunday flag reads to the next session as a half-built feature, so the field
// is simply absent. If Blitzed ever gets a Sunday, add 'sunday: true' to those
// days AND add 'blitzed' to SUNDAY_EDITION_GAMES in lib/sunday-editions.js.
export const PUZZLES = [
`;
const pbody = puzzles.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    qids: [${p.qids.map((q) => `'${q}'`).join(', ')}],
  },`).join('\n');
guardOut('puzzles.js');
writeFileSync(resolve(OUT_DIR, 'puzzles.js'), phead + pbody + '\n];\n');

console.log(`problems: ${problems.length}  days: ${puzzles.length}  nums ${puzzles[0].num}-${puzzles.at(-1).num}  ${puzzles[0].live} to ${puzzles.at(-1).live}`);
console.log(`written to ${resolve(OUT_DIR)}`);
console.log('family use:', Object.entries(famCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
