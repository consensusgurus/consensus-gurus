// Verify the Warmer bank: each day's `order` must be a complete permutation of
// the VOCAB index space (every word ranked exactly once), the answer must be
// order[0], ids/dates/labels consistent, sunday flags false, and no answer may
// repeat across the bank. Run after ANY edit (or a vocab/order regeneration):
//   node scripts/verify-warmer.mjs
import { PUZZLES } from '../app/warmer/puzzles.js';
import { VOCAB } from '../app/warmer/vocab.js';

const N = VOCAB.length;
// Warmer's Sunday Edition (a rarer secret word) launched on this date.
const SUNDAY_FROM = '2026-07-26';
// A Sunday answer must sit past this vocab rank. Weekday answers have run
// 453-3534, so this is a genuine step down in frequency, not a rounding.
const RARE_FLOOR = 5000;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let bad = 0;
const seenAnswer = new Set();
const seenId = new Set();

PUZZLES.forEach((p, i) => {
  const errs = [];
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);

  const m = (p.quizId || '').match(/^warmer-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    const [Y, MM, D] = p.live.split('-').map(Number);
    const label = `${MONTHS[MM - 1]} ${D}, ${Y}`;
    if (label !== p.dateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${label}"`);
  }
  if (seenId.has(p.quizId)) errs.push('duplicate quizId');
  seenId.add(p.quizId);

  // The Sunday flag must match the real weekday: a Sunday drop is the Sunday
  // Edition, whose answer is a RARER word. GRANDFATHERED: drops before
  // SUNDAY_FROM are live, played and frozen, so they are never rewritten.
  const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0 && p.live >= SUNDAY_FROM;
  if (p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live}`);
  // The whole point of the edition: the secret word sits deeper in the
  // frequency-ordered vocab than any ordinary day's answer.
  if (isSun && Array.isArray(p.order) && p.order[0] < RARE_FLOOR) {
    errs.push(`Sunday answer "${VOCAB[p.order[0]]}" is vocab rank ${p.order[0]}, not rarer than ${RARE_FLOOR}`);
  }

  const order = p.order;
  if (!Array.isArray(order)) errs.push('order missing');
  else {
    if (order.length !== N) errs.push(`order length ${order.length} != ${N}`);
    // must be a permutation of 0..N-1: every index present exactly once
    const seen = new Uint8Array(N);
    let dup = 0, oob = 0;
    for (const v of order) {
      if (!Number.isInteger(v) || v < 0 || v >= N) { oob++; continue; }
      if (seen[v]) dup++; else seen[v] = 1;
    }
    if (oob) errs.push(`${oob} out-of-range indices`);
    if (dup) errs.push(`${dup} duplicate indices`);
    let missing = 0; for (let k = 0; k < N; k++) if (!seen[k]) missing++;
    if (missing) errs.push(`${missing} vocab words never ranked`);
  }

  const answer = order && VOCAB[order[0]];
  if (!answer) errs.push('no answer at order[0]');
  else {
    if (seenAnswer.has(answer)) errs.push(`duplicate answer "${answer}"`);
    seenAnswer.add(answer);
  }

  if (errs.length) { bad++; console.error(`✗ ${p.quizId}: ${errs.join('; ')}`); }
  else {
    const hot = order.slice(1, 7).map((j) => VOCAB[j]).join(', ');
    console.log(`✓ ${p.quizId}  answer=${answer}  hot: ${hot}`);
  }
});

if (bad) { console.error(`\n${bad} bad Warmer puzzle(s)`); process.exit(1); }
console.log(`\nAll ${PUZZLES.length} Warmer puzzles verified (vocab ${N}).`);
