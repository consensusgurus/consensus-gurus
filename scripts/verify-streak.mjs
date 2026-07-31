// Verifier for the Streak bank (app/streak/questions.js + puzzles.js).
// Run after ANY bank edit: node scripts/verify-streak.mjs
//
// Proves, mechanically:
//   bank    — unique ids, exactly 4 distinct choices, correct in 0..3, tier
//             1..5, no exact-duplicate question text anywhere in the bank
//   giveaway— no question's text contains its own correct answer (normalized,
//             answers of 4+ chars; the clue-must-not-contain-answer rule)
//   days    — every day has exactly 40 qids, all resolving, no qid reused
//             across ANY two days, tiers run 8x1..8x5 in order, every tier
//             block covers 8 distinct categories, quizId matches live date
//   spread  — per day, each correct position (A-D) appears at least 5 times,
//             and no run of 4+ consecutive questions shares a position
// Truth of the facts themselves stays a human (authoring-time) job.
import { QUESTIONS, QUESTION_MAP } from '../app/streak/questions.js';
import { PUZZLES } from '../app/streak/puzzles.js';

let fails = 0;
const fail = (m) => { console.error('FAIL:', m); fails++; };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// ---- bank ------------------------------------------------------------------
const ids = new Set();
const seenQ = new Map();
for (const q of QUESTIONS) {
  if (ids.has(q.id)) fail(`dup id ${q.id}`);
  ids.add(q.id);
  if (!Array.isArray(q.choices) || q.choices.length !== 4) fail(`${q.id}: needs 4 choices`);
  if (new Set(q.choices.map(norm)).size !== 4) fail(`${q.id}: duplicate choices`);
  if (!(q.correct >= 0 && q.correct <= 3)) fail(`${q.id}: correct out of range`);
  if (!(q.tier >= 1 && q.tier <= 5)) fail(`${q.id}: tier out of range`);
  if (!q.q || q.q.length < 8) fail(`${q.id}: question text too short`);
  const nq = norm(q.q);
  if (seenQ.has(nq)) fail(`${q.id}: duplicate question text of ${seenQ.get(nq)}`);
  seenQ.set(nq, q.id);
  // Giveaway: the answer's distinctive text inside the question itself.
  const ans = norm(q.choices[q.correct]).replace(/^(the|a|an) /, '');
  if (ans.length >= 4 && nq.includes(ans)) fail(`${q.id}: question text contains its own answer ("${ans}")`);
}

// ---- days ------------------------------------------------------------------
const usedAcross = new Map();
for (const p of PUZZLES) {
  if (!Array.isArray(p.qids) || p.qids.length !== 40) { fail(`${p.quizId}: needs 40 qids`); continue; }
  const m = /^streak-(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(p.quizId);
  if (!m) fail(`${p.quizId}: bad quizId shape`);
  else {
    const [, mo, dy, yr] = m.map(Number);
    const [ly, lm, ld] = p.live.split('-').map(Number);
    if (lm !== mo || ld !== dy || ly !== 2000 + yr) fail(`${p.quizId}: live ${p.live} does not match quizId date`);
  }
  const qs = p.qids.map((id) => QUESTION_MAP[id]);
  qs.forEach((q, i) => { if (!q) fail(`${p.quizId}: qid ${p.qids[i]} does not resolve`); });
  if (qs.some((q) => !q)) continue;
  for (const id of p.qids) {
    if (usedAcross.has(id)) fail(`${p.quizId}: qid ${id} already used by ${usedAcross.get(id)}`);
    usedAcross.set(id, p.quizId);
  }
  // Tier ramp: 8 per tier, in order.
  qs.forEach((q, i) => {
    const want = Math.floor(i / 8) + 1;
    if (q.tier !== want) fail(`${p.quizId}: slot ${i + 1} is tier ${q.tier}, wanted ${want}`);
  });
  // Category coverage per tier block.
  for (let b = 0; b < 5; b++) {
    const cats = new Set(qs.slice(b * 8, b * 8 + 8).map((q) => q.cat));
    if (cats.size !== 8) fail(`${p.quizId}: tier block ${b + 1} covers ${cats.size} categories, wanted 8`);
  }
  // Correct-position spread.
  const posCount = [0, 0, 0, 0];
  qs.forEach((q) => posCount[q.correct]++);
  posCount.forEach((c, k) => { if (c < 5) fail(`${p.quizId}: position ${'ABCD'[k]} correct only ${c} times (< 5)`); });
  let run = 1;
  for (let i = 1; i < qs.length; i++) {
    run = qs[i].correct === qs[i - 1].correct ? run + 1 : 1;
    if (run >= 4) fail(`${p.quizId}: 4+ consecutive answers at position ${'ABCD'[qs[i].correct]} ending slot ${i + 1}`);
  }
}

console.log(`streak: ${QUESTIONS.length} questions, ${PUZZLES.length} days checked`);
if (fails) { console.error(`${fails} failure(s)`); process.exit(1); }
console.log('ALL OK');
