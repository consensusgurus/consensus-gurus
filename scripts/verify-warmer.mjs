// Verify the Warmer bank: each day's `order` must be a complete permutation of
// the VOCAB index space (every word ranked exactly once), the answer must be
// order[0], ids/dates/labels consistent, sunday flags false, and no answer may
// repeat across the bank. Run after ANY edit (or a vocab/order regeneration):
//   node scripts/verify-warmer.mjs
import { PUZZLES } from '../app/warmer/puzzles.js';
import { VOCAB } from '../app/warmer/vocab.js';

const N = VOCAB.length;
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

  // Warmer has no Sunday editions: the flag must be false so /daily never shows
  // a phantom "Sunday Edition" chip (isSundayEdition reads it).
  if (p.sunday !== false) errs.push('sunday must be false');

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
