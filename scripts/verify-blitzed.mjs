// Verifier for the Blitzed bank. Run: node scripts/verify-blitzed.mjs
//
// RE-DERIVES rather than trusts, like verify-blitz.mjs: each printed line is
// tokenised and evaluated here with ordinary precedence (brackets, then a
// square / cube / root on an operand, then × ÷, then + −, left to right), and
// the stored `correct` index must point at that value. Shares no code with the
// generator.
//
// Checks:
//   1  every line parses, evaluates to a whole number, and has EXACTLY THREE
//      operands joined by two binary operations (the Blitzed rule)
//   2  the stored correct index points at the recomputed answer
//   3  exactly one choice equals the answer, four distinct positive integers
//   4  anti-sieve: >=2 distractors tight, nothing beyond 0.25x-4x, and for an
//      answer of 100+ at least one distractor sharing its last digit
//   5  the ladder really climbs: each tier's mean workload beats the last
//   6  every family sits in exactly ONE tier
//   7  correct positions are balanced per day with no three in a row
//   8  no problem statement repeats anywhere in the bank
//   9  the answer is not systematically the biggest or smallest option
//  10  puzzle days are 20 ids, contiguous dates, ids that exist, no reuse
//
// GRANDFATHERING: days already live are frozen history. Anything with a `live`
// date before FLOOR_FROM is skipped by rules added after it shipped.

import { PROBLEMS, PROBLEM_MAP } from '../app/blitzed/problems.js';
import { PUZZLES } from '../app/blitzed/puzzles.js';

const FLOOR_FROM = '2026-09-03';   // launch day; nothing is grandfathered yet
const PER_TIER = 4;
const TOTAL = 20;
const DIGIT_RULE_FROM = 100;

const findings = [];
const fail = (id, msg) => findings.push(`${id}: ${msg}`);

// ---- 1. tokenise and evaluate the printed line ------------------------------
const SUPS = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };

// Returns { value, operands, binops } or null when the line does not parse.
// "p% of x" and "n/d of x" are evaluated in place before the precedence pass,
// and each counts as TWO operands (the percentage or fraction, and the number)
// joined by one operation ("of"), which is how a player reads 65% of 160 + 47:
// three elements, two things to do.
function evaluate(q) {
  let s = q, extraOperands = 0, extraOps = 0;
  s = s.replace(/(\d+)% of (\d+)/g, (_, p, x) => { extraOperands++; extraOps++; return `#${(Number(x) * Number(p)) / 100}`; });
  s = s.replace(/(\d+)\/(\d+) of (\d+)/g, (_, n, d, x) => { extraOperands++; extraOps++; return `#${(Number(x) / Number(d)) * Number(n)}`; });
  const toks = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (c === '#') {
      let j = i + 1; while (j < s.length && /[\d.]/.test(s[j])) j++;
      toks.push({ t: 'n', v: Number(s.slice(i + 1, j)), pre: true }); i = j; continue;
    }
    if (/\d/.test(c)) {
      let j = i; while (j < s.length && /\d/.test(s[j])) j++;
      let v = Number(s.slice(i, j));
      if (j < s.length && SUPS[s[j]] !== undefined) {
        let e = ''; while (j < s.length && SUPS[s[j]] !== undefined) e += SUPS[s[j++]];
        v = v ** Number(e);
      }
      toks.push({ t: 'n', v }); i = j; continue;
    }
    if (c === '√') {
      let j = i + 1; while (j < s.length && /\d/.test(s[j])) j++;
      const r = Math.sqrt(Number(s.slice(i + 1, j)));
      if (!Number.isInteger(r)) return null;
      toks.push({ t: 'n', v: r }); i = j; continue;
    }
    if ('+−×÷()'.includes(c)) { toks.push({ t: c }); i++; continue; }
    return null;
  }
  const operands = toks.filter((t) => t.t === 'n').length + extraOperands;
  const binops = toks.filter((t) => '+−×÷'.includes(t.t)).length + extraOps;
  // shunting-yard
  const prec = { '+': 1, '−': 1, '×': 2, '÷': 2 };
  const out = [], ops = [];
  const apply = () => {
    const op = ops.pop(), b = out.pop(), a = out.pop();
    if (a === undefined || b === undefined) throw new Error('bad');
    out.push({ '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[op]);
  };
  try {
    for (const t of toks) {
      if (t.t === 'n') out.push(t.v);
      else if (t.t === '(') ops.push('(');
      else if (t.t === ')') { while (ops.length && ops.at(-1) !== '(') apply(); if (ops.pop() !== '(') return null; }
      else { while (ops.length && ops.at(-1) !== '(' && prec[ops.at(-1)] >= prec[t.t]) apply(); ops.push(t.t); }
    }
    while (ops.length) { if (ops.at(-1) === '(') return null; apply(); }
  } catch (e) { return null; }
  if (out.length !== 1) return null;
  return { value: out[0], operands, binops };
}

// ---- 2-4. per-problem checks ------------------------------------------------
const isTight = (a, v) => (a < 30
  ? Math.abs(v - a) <= Math.max(4, Math.round(a * 0.5))
  : v >= a * 0.6 && v <= a * 1.4);

const byFamTier = {};
const seenQ = new Map();
const rankTally = [0, 0, 0, 0];

for (const p of PROBLEMS) {
  const ev = evaluate(p.q);
  if (!ev) { fail(p.id, `expression did not parse: "${p.q}"`); continue; }
  const got = ev.value;
  if (!Number.isInteger(got)) { fail(p.id, `"${p.q}" does not evaluate to a whole number`); continue; }
  if (ev.operands !== 3 || ev.binops !== 2) fail(p.id, `"${p.q}" has ${ev.operands} operands and ${ev.binops} operations; Blitzed lines have three and two`);

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

  rankTally[[...p.choices].sort((x, y) => x - y).indexOf(a)]++;
  (byFamTier[p.fam] ||= new Set()).add(p.tier);
  if (seenQ.has(p.q)) fail(p.id, `"${p.q}" already appears as ${seenQ.get(p.q)}`);
  else seenQ.set(p.q, p.id);
}

for (const [fam, tiers] of Object.entries(byFamTier)) {
  if (tiers.size > 1) findings.push(`family ${fam}: spans tiers ${[...tiers].sort().join(', ')} — a family must sit in exactly one tier or the ladder stops climbing`);
}

// ---- 5. the ladder actually climbs ------------------------------------------
const OP_COST = { '+': 1, '−': 1.5, '×': 3, '÷': 3.5, '%': 3, '√': 3.5, '/': 2.5 };
function work(p) {
  const nums = (p.q.match(/\d+/g) || []).map(Number);
  let w = 0;
  for (const ch of p.q) w += OP_COST[ch] || 0;
  if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(p.q)) w += 5;
  if (p.q.includes('(')) w += 1.5;
  w += nums.reduce((s, n) => s + String(n).length, 0);
  w += String(p.choices[p.correct]).length;
  return w;
}
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
  if (!/^blitzed-\d{1,2}-\d{1,2}-\d{2}$/.test(z.quizId)) fail(tag, `bad quizId ${z.quizId}`);
  if ('sunday' in z) fail(tag, 'carries a sunday field; Blitzed has no Sunday Edition (see puzzles.js)');

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

  if (z.live >= FLOOR_FROM) {
    const counts = [0, 0, 0, 0];
    positions.forEach((k) => counts[k]++);
    if (counts.some((c) => c !== TOTAL / 4)) fail(tag, `correct answers land ${counts.join('/')} across A-D, expected ${TOTAL / 4} each`);
    for (let i = 2; i < positions.length; i++) {
      if (positions[i] === positions[i - 1] && positions[i] === positions[i - 2]) { fail(tag, `three ${'ABCD'[positions[i]]}s in a row at slot ${i + 1}`); break; }
    }
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
console.log(`Blitzed bank: ${PROBLEMS.length} problems over ${PUZZLES.length} days (${PUZZLES[0]?.live} to ${PUZZLES.at(-1)?.live})`);
console.log(`round mean workload: ${tierWork.join(' -> ')}`);
console.log(`answer sits at sorted position: ${rankTally.map((n) => `${((n / total) * 100).toFixed(0)}%`).join(' / ')} (smallest -> largest)`);
if (findings.length) {
  console.error(`\n${findings.length} FINDING(S):`);
  findings.slice(0, 60).forEach((f) => console.error('  - ' + f));
  process.exit(1);
}
console.log('\nOK — zero findings.');
