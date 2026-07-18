// Verify the Cipher bank: every equation must have EXACTLY ONE solution
// (distinct digits, leading letters nonzero), <= 10 distinct letters, ids/dates
// consistent, sunday flags matching the real weekday. Run after ANY edit:
//   node scripts/verify-cipher.mjs
import { PUZZLES } from '../app/cipher/puzzles.js';

function solveCount(lhs, rhs, cap = 2) {
  const words = [...lhs, rhs];
  const letters = [...new Set(words.join(''))];
  if (letters.length > 10) return -1;
  const coef = Object.fromEntries(letters.map((c) => [c, 0]));
  for (const w of lhs) { let m = 1; for (let i = w.length - 1; i >= 0; i--) { coef[w[i]] += m; m *= 10; } }
  { let m = 1; for (let i = rhs.length - 1; i >= 0; i--) { coef[rhs[i]] -= m; m *= 10; } }
  const firsts = new Set(words.map((w) => w[0]));
  const order = letters.slice().sort((a, b) => Math.abs(coef[b]) - Math.abs(coef[a]));
  const cs = order.map((c) => coef[c]);
  const fs = order.map((c) => firsts.has(c));
  const n = order.length;
  const used = new Array(10).fill(false);
  let count = 0;
  const bounds = (i) => {
    const pos = [], neg = [];
    for (let k = i; k < n; k++) (cs[k] > 0 ? pos : cs[k] < 0 ? neg : pos).push(cs[k]);
    pos.sort((a, b) => b - a); neg.sort((a, b) => a - b);
    const avail = []; for (let d = 0; d < 10; d++) if (!used[d]) avail.push(d);
    const desc = avail.slice().sort((a, b) => b - a);
    let mx = 0, mn = 0;
    for (let k = 0; k < pos.length; k++) { mx += pos[k] * (desc[k] ?? 0); mn += pos[k] * (avail[k] ?? 0); }
    for (let k = 0; k < neg.length; k++) { mx += neg[k] * (avail[k] ?? 0); mn += neg[k] * (desc[k] ?? 0); }
    return [mn, mx];
  };
  const dfs = (i, acc) => {
    if (count >= cap) return;
    if (i === n) { if (acc === 0) count++; return; }
    const [mn, mx] = bounds(i);
    if (acc + mn > 0 || acc + mx < 0) return;
    for (let d = 0; d < 10; d++) {
      if (used[d] || (d === 0 && fs[i])) continue;
      used[d] = true;
      dfs(i + 1, acc + cs[i] * d);
      used[d] = false;
      if (count >= cap) return;
    }
  };
  dfs(0, 0);
  return count;
}

let bad = 0;
const seen = new Set();
PUZZLES.forEach((p, i) => {
  const errs = [];
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^cipher-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    // no Sunday editions yet: the flag must be false so /daily never
    // shows a phantom "Sunday Edition" chip (isSundayEdition reads it).
    if (p.sunday !== false) errs.push('sunday must be false (no Sunday editions)');
  }
  const key = [...p.lhs].sort().join('+') + '=' + p.rhs;
  if (seen.has(key)) errs.push('duplicate equation');
  seen.add(key);
  const maxL = Math.max(...p.lhs.map((w) => w.length));
  if (p.rhs.length < maxL || p.rhs.length > maxL + 1) errs.push('rhs length impossible');
  const c = solveCount(p.lhs, p.rhs);
  if (c !== 1) errs.push(c === -1 ? '>10 letters' : `solutions=${c}, need exactly 1`);
  if (errs.length) { bad++; console.error(`✗ ${p.quizId}: ${errs.join('; ')}`); }
  else console.log(`✓ ${p.quizId}  ${p.lhs.join('+')}=${p.rhs}  unique`);
});
if (bad) { console.error(`\n${bad} bad puzzle(s)`); process.exit(1); }
console.log(`\nAll ${PUZZLES.length} Cipher puzzles verified unique.`);
