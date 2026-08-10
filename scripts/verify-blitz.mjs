// Verifier for the Blitz bank. Run: node scripts/verify-blitz.mjs
//
// This checker RE-DERIVES rather than trusts. It parses each problem's printed
// expression back into arithmetic, evaluates it itself, and asserts the stored
// `correct` index points at that value. It shares no code with the generator on
// purpose: if the generator's own arithmetic were wrong, importing it would
// simply confirm the same mistake.
//
// Checks:
//   1  every expression parses and its answer is recomputed from the string
//   2  the stored correct index points at the recomputed answer
//   3  exactly one choice equals the answer, four distinct positive integers
//   4  anti-sieve: >=2 distractors tight, nothing beyond 0.25x-4x, and for an
//      answer of 100+ at least one distractor sharing its last digit
//   5  the ladder really climbs: each tier's median workload beats the last
//   6  every family sits in exactly ONE tier
//   7  correct positions are balanced per day with no three in a row
//   8  no problem statement repeats anywhere in the bank
//   9  the answer is not systematically the biggest or smallest option
//  10  puzzle days are 20 ids, contiguous dates, ids that exist, no reuse
//
// GRANDFATHERING: days already live are frozen history. Anything with a `live`
// date before BLITZ_FLOOR_FROM is skipped by the rules added after it shipped.

import { PROBLEMS, PROBLEM_MAP } from '../app/blitz/problems.js';
import { PUZZLES } from '../app/blitz/puzzles.js';

const BLITZ_FLOOR_FROM = '2026-08-11';   // launch day; nothing is grandfathered yet
const PER_TIER = 4;
const TOTAL = 20;
const DIGIT_RULE_FROM = 100;

const findings = [];
const fail = (id, msg) => findings.push(`${id}: ${msg}`);

// ---- 1. parse the printed expression back into a number ---------------------
const SUPS = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
function unsup(s) { return [...s].map((c) => SUPS[c]).join(''); }

function evaluate(q) {
  let m;
  // n² / n⁴ ...
  if ((m = q.match(/^(\d+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/))) return Number(m[1]) ** Number(unsup(m[2]));
  // √n
  if ((m = q.match(/^√(\d+)$/))) { const r = Math.sqrt(Number(m[1])); return Number.isInteger(r) ? r : null; }
  // p% of x
  if ((m = q.match(/^(\d+)% of (\d+)$/))) return (Number(m[2]) * Number(m[1])) / 100;
  // x increased/decreased by p%
  if ((m = q.match(/^(\d+) (increased|decreased) by (\d+)%$/))) {
    const x = Number(m[1]), p = Number(m[3]), d = (x * p) / 100;
    return m[2] === 'increased' ? x + d : x - d;
  }
  // n/d of x
  if ((m = q.match(/^(\d+)\/(\d+) of (\d+)$/))) return (Number(m[3]) / Number(m[2])) * Number(m[1]);
  // (a ± b) × c
  if ((m = q.match(/^\((\d+) ([+−]) (\d+)\) × (\d+)$/))) {
    const inner = m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]);
    return inner * Number(m[4]);
  }
  // a × b + c × d
  if ((m = q.match(/^(\d+) × (\d+) \+ (\d+) × (\d+)$/))) return Number(m[1]) * Number(m[2]) + Number(m[3]) * Number(m[4]);
  // a ± b × c   and   a + b ÷ c
  if ((m = q.match(/^(\d+) ([+−]) (\d+) × (\d+)$/))) {
    const prod = Number(m[3]) * Number(m[4]);
    return m[2] === '+' ? Number(m[1]) + prod : Number(m[1]) - prod;
  }
  if ((m = q.match(/^(\d+) \+ (\d+) ÷ (\d+)$/))) return Number(m[1]) + Number(m[2]) / Number(m[3]);
  // plain binary
  if ((m = q.match(/^(\d+) ([+−×÷]) (\d+)$/))) {
    const x = Number(m[1]), y = Number(m[3]);
    return { '+': x + y, '−': x - y, '×': x * y, '÷': x / y }[m[2]];
  }
  return undefined;
}

// ---- 2-4. per-problem checks ------------------------------------------------
const isTight = (a, v) => (a < 30
  ? Math.abs(v - a) <= Math.max(4, Math.round(a * 0.5))
  : v >= a * 0.6 && v <= a * 1.4);

const byFamTier = {};
const seenQ = new Map();
let rankTally = [0, 0, 0, 0];

for (const p of PROBLEMS) {
  const got = evaluate(p.q);
  if (got === undefined) { fail(p.id, `expression did not parse: "${p.q}"`); continue; }
  if (got === null || !Number.isInteger(got)) { fail(p.id, `"${p.q}" does not evaluate to a whole number`); continue; }

  if (!Array.isArray(p.choices) || p.choices.length !== 4) { fail(p.id, 'not exactly four choices'); continue; }
  if (new Set(p.choices).size !== 4) fail(p.id, `duplicate choices ${JSON.stringify(p.choices)}`);
  if (p.choices.some((v) => !Number.isInteger(v) || v <= 0)) fail(p.id, 'a choice is not a positive whole number');
  if (!(p.correct >= 0 && p.correct <= 3)) { fail(p.id, `correct index ${p.correct} out of range`); continue; }

  const a = p.choices[p.correct];
  if (a !== got) fail(p.id, `"${p.q}" is ${got}, but choice ${p.correct} is ${a}`);
  if (p.choices.filter((v) => v === got).length !== 1) fail(p.id, 'the answer does not appear exactly once');

  const ds = p.choices.filter((_, i) => i !== p.correct);
  if (ds.filter((d) => isTight(a, d)).length < 2) fail(p.id, `fewer than 2 distractors near ${a}: ${JSON.stringify(ds)} — the answer stands out by size`);
  if (ds.some((d) => d < a * 0.25 || d > a * 4)) fail(p.id, `a distractor is absurd next to ${a}: ${JSON.stringify(ds)}`);
  if (a >= DIGIT_RULE_FROM && !ds.some((d) => d % 10 === a % 10)) fail(p.id, `no distractor ends in ${a % 10}, so the last-digit sieve alone picks ${a} out`);

  // 9. where does the answer sit once the options are sorted?
  rankTally[[...p.choices].sort((x, y) => x - y).indexOf(a)]++;

  // 6. one family, one tier
  (byFamTier[p.fam] ||= new Set()).add(p.tier);

  // 8. no statement twice
  if (seenQ.has(p.q)) fail(p.id, `"${p.q}" already appears as ${seenQ.get(p.q)}`);
  else seenQ.set(p.q, p.id);
}

for (const [fam, tiers] of Object.entries(byFamTier)) {
  if (tiers.size > 1) findings.push(`family ${fam}: spans tiers ${[...tiers].sort().join(', ')} — a family must sit in exactly one tier or the ladder stops climbing`);
}

// ---- 5. the ladder actually climbs ------------------------------------------
// A crude but honest workload proxy: how many digits you have to hold and how
// many operations you have to do. It only has to be MONOTONIC across tiers.
const OP_COST = { '+': 1, '−': 1.5, '×': 3, '÷': 3.5, '%': 3, '√': 3.5, '/': 2.5 };
function work(p) {
  const nums = (p.q.match(/\d+/g) || []).map(Number);
  let w = 0;
  for (const ch of p.q) w += OP_COST[ch] || 0;
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(p.q)) w += 5;            // raising to a power
  if (p.q.includes('(')) w += 1.5;                   // a bracket to respect
  w += nums.reduce((s, n) => s + String(n).length, 0);
  w += String(p.choices[p.correct]).length;
  return w;
}
// The MEAN, not the median: with four problems a round the median is too blunt
// to notice a round sliding backwards, which is exactly the failure this check
// exists to catch.
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const tierWork = [1, 2, 3, 4, 5].map((t) => +mean(PROBLEMS.filter((p) => p.tier === t).map(work)).toFixed(2));
for (let t = 1; t < 5; t++) {
  if (tierWork[t] <= tierWork[t - 1]) findings.push(`ladder: round ${t + 1} (mean work ${tierWork[t]}) is no harder than round ${t} (${tierWork[t - 1]})`);
}

// ---- 7 + 10. per-day checks -------------------------------------------------
const usedIds = new Set();
let prev = null;
for (const z of PUZZLES) {
  const tag = `day ${z.num} (${z.live})`;
  if (z.qids.length !== TOTAL) fail(tag, `${z.qids.length} problems, expected ${TOTAL}`);
  if (!/^blitz-\d{1,2}-\d{1,2}-\d{2}$/.test(z.quizId)) fail(tag, `bad quizId ${z.quizId}`);

  if (prev) {
    const gap = (new Date(`${z.live}T00:00:00Z`) - new Date(`${prev}T00:00:00Z`)) / 86400000;
    if (gap !== 1) fail(tag, `date gap of ${gap} days after ${prev}`);
  }
  prev = z.live;

  const positions = [];
  z.qids.forEach((id, i) => {
    if (usedIds.has(id)) fail(tag, `${id} is used on more than one day`);
    usedIds.add(id);
    const p = PROBLEM_MAP[id];
    if (!p) { fail(tag, `${id} is not in the bank`); return; }
    const wantTier = Math.floor(i / PER_TIER) + 1;
    if (p.tier !== wantTier) fail(tag, `${id} sits in slot ${i + 1} (round ${wantTier}) but is tier ${p.tier}`);
    positions.push(p.correct);
  });

  if (z.live >= BLITZ_FLOOR_FROM) {
    const counts = [0, 0, 0, 0];
    positions.forEach((k) => counts[k]++);
    if (counts.some((c) => c !== TOTAL / 4)) fail(tag, `correct answers land ${counts.join('/')} across A-D, expected ${TOTAL / 4} each`);
    for (let i = 2; i < positions.length; i++) {
      if (positions[i] === positions[i - 1] && positions[i] === positions[i - 2]) { fail(tag, `three ${'ABCD'[positions[i]]}s in a row at slot ${i + 1}`); break; }
    }
    // A round must not repeat a family, NOR an operation. Those are different
    // tests: "50% of 160" and "1/2 of 80" are two families and one operation,
    // and asking a player to halve twice in one round is the bug the sig exists
    // to stop.
    for (let t = 0; t < 5; t++) {
      const slice = z.qids.slice(t * PER_TIER, (t + 1) * PER_TIER).map((id) => PROBLEM_MAP[id]);
      const fams = slice.map((p) => p?.fam);
      const sigs = slice.map((p) => p?.sig || p?.fam);
      if (new Set(fams).size !== PER_TIER) fail(tag, `round ${t + 1} repeats a family: ${fams.join(', ')}`);
      if (new Set(sigs).size !== PER_TIER) fail(tag, `round ${t + 1} asks the same operation twice: ${sigs.join(', ')}`);
    }
  }
}
const orphans = PROBLEMS.filter((p) => !usedIds.has(p.id));
if (orphans.length) findings.push(`${orphans.length} problems are in the bank but on no day (${orphans.slice(0, 4).map((p) => p.id).join(', ')}...)`);

// ---- 9. answer position among sorted options --------------------------------
const total = rankTally.reduce((a, b) => a + b, 0);
rankTally.forEach((n, i) => {
  const share = n / total;
  if (share > 0.4) findings.push(`the answer is the ${['smallest', '2nd smallest', '2nd largest', 'largest'][i]} option ${(share * 100).toFixed(0)}% of the time — that is a tell`);
});

// ---- report -----------------------------------------------------------------
console.log(`Blitz bank: ${PROBLEMS.length} problems over ${PUZZLES.length} days (${PUZZLES[0]?.live} to ${PUZZLES.at(-1)?.live})`);
console.log(`round median workload: ${tierWork.join(' -> ')}`);
console.log(`answer sits at sorted position: ${rankTally.map((n) => `${((n / total) * 100).toFixed(0)}%`).join(' / ')} (smallest -> largest)`);
if (findings.length) {
  console.error(`\n${findings.length} FINDING(S):`);
  findings.slice(0, 60).forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('\nOK — zero findings.');
