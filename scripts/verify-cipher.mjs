// Verify the Cipher bank: every equation must have EXACTLY ONE solution
// (distinct digits, leading letters nonzero), <= 10 distinct letters, ids/dates
// consistent, sunday flags matching the real weekday, and the operation never
// repeating on consecutive days (from the variety-launch date on). Run after
// ANY edit:
//   node scripts/verify-cipher.mjs
import { PUZZLES } from '../app/cipher/puzzles.js';

// Linear ops (add/sub) — signed-coefficient DFS with bound pruning. `signs`
// gives the coefficient sign per word: addition is [1,1,...,-1] (addends minus
// the sum), subtraction A - B = C is [1,-1,-1] (minuend minus subtrahend minus
// difference), each == 0.
function linearCount(words, signs, cap = 2) {
  const letters = [...new Set(words.join(''))];
  if (letters.length > 10) return -1;
  const coef = Object.fromEntries(letters.map((c) => [c, 0]));
  for (let w = 0; w < words.length; w++) {
    let m = 1;
    for (let i = words[w].length - 1; i >= 0; i--) { coef[words[w][i]] += signs[w] * m; m *= 10; }
  }
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

// Multiplication A x B = C — enumerate every digit assignment to A's letters
// (leading nonzero), then B's remaining letters, compute the product, and count
// how many extend consistently to C (shared letters fixed, fresh letters
// distinct and unused, no leading zero). Exactly the algorithm the client's
// solveCipher mirrors for the mul branch.
function mulCount(A, B, C, cap = 2) {
  const all = [...new Set((A + B + C).split(''))];
  if (all.length > 10) return -1;
  const la = [...new Set(A.split(''))];
  let count = 0;
  const permA = (idx, map, usedA) => {
    if (count >= cap) return;
    if (idx === la.length) { withA(map, usedA); return; }
    const ch = la[idx];
    for (let d = 0; d < 10; d++) {
      if (usedA.has(d) || (d === 0 && ch === A[0])) continue;
      map[ch] = d; usedA.add(d);
      permA(idx + 1, map, usedA);
      usedA.delete(d); delete map[ch];
      if (count >= cap) return;
    }
  };
  const withA = (mapA, usedA) => {
    let va = 0; for (const ch of A) va = va * 10 + mapA[ch];
    const lb = [...new Set(B.split(''))].filter((c) => !(c in mapA));
    const rem = []; for (let d = 0; d < 10; d++) if (!usedA.has(d)) rem.push(d);
    const permB = (idx, map, usedB) => {
      if (count >= cap) return;
      if (idx === lb.length) {
        if (map[B[0]] === 0) return;
        let vb = 0; for (const ch of B) vb = vb * 10 + map[ch];
        const p = va * vb; const sp = String(p);
        if (sp.length !== C.length) return;
        const m2 = { ...map }; const u2 = new Set(Object.values(m2));
        for (let i = 0; i < C.length; i++) {
          const ch = C[i]; const dc = sp.charCodeAt(i) - 48;
          if (ch in m2) { if (m2[ch] !== dc) return; }
          else { if (u2.has(dc)) return; m2[ch] = dc; u2.add(dc); }
        }
        if (m2[C[0]] === 0) return;
        count++;
        return;
      }
      const ch = lb[idx];
      for (const d of rem) {
        if (usedB.has(d)) continue;
        map[ch] = d; usedB.add(d);
        permB(idx + 1, map, usedB);
        usedB.delete(d); delete map[ch];
        if (count >= cap) return;
      }
    };
    permB(0, { ...mapA }, new Set(usedA));
  };
  permA(0, {}, new Set());
  return count;
}

function solveCount(p, cap = 2) {
  const op = p.op || 'add';
  if (op === 'mul') return mulCount(p.lhs[0], p.lhs[1], p.rhs, cap);
  if (op === 'sub') return linearCount([p.lhs[0], p.lhs[1], p.rhs], [1, -1, -1], cap);
  return linearCount([...p.lhs, p.rhs], [...p.lhs.map(() => 1), -1], cap);
}

// Cipher's Sunday Edition (three addends) launched on this date. Earlier drops
// are grandfathered: they are live, played, and on the leaderboard.
const SUNDAY_FROM = '2026-07-26';
// The subtraction/multiplication variety launched here. Before it every drop is
// addition, so the "op never repeats two days running" rule only applies from
// this date on (the pre-launch addition run is grandfathered).
const VARIETY_FROM = '2026-07-25';
const OPS = new Set(['add', 'sub', 'mul']);

let bad = 0;
const seen = new Set();
PUZZLES.forEach((p, i) => {
  const errs = [];
  const op = p.op || 'add';
  if (!OPS.has(op)) errs.push(`bad op ${op}`);
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^cipher-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    // The Sunday flag must match the real weekday: a Sunday drop is the
    // three-addend Sunday Edition (always addition), every other day is a
    // two-operand puzzle. GRANDFATHERED: drops before SUNDAY_FROM shipped
    // without the edition and are already played, so they are never rewritten.
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0 && p.live >= SUNDAY_FROM;
    if (p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live}`);
    if (isSun) {
      if (op !== 'add') errs.push('Sunday Edition must be addition');
      if (p.lhs.length !== 3) errs.push('Sunday Edition needs 3 addends');
    } else {
      if (p.lhs.length !== 2) errs.push('weekday needs exactly 2 operands');
    }
  }
  const key = op + ':' + (op === 'add' ? [...p.lhs].sort().join('+') : p.lhs.join(op === 'sub' ? '-' : 'x')) + '=' + p.rhs;
  if (seen.has(key)) errs.push('duplicate equation');
  seen.add(key);
  // Per-op length sanity: addition/subtraction produce a result no longer than
  // the longest operand (+1 carry for addition); a product spans lenA+lenB-1 or
  // lenA+lenB digits.
  if (op === 'mul') {
    const lo = p.lhs[0].length + p.lhs[1].length - 1, hi = p.lhs[0].length + p.lhs[1].length;
    if (p.rhs.length < lo || p.rhs.length > hi) errs.push('product length impossible');
  } else if (op === 'sub') {
    if (p.rhs.length > p.lhs[0].length || p.rhs.length < 1) errs.push('difference length impossible');
  } else {
    const maxL = Math.max(...p.lhs.map((w) => w.length));
    if (p.rhs.length < maxL || p.rhs.length > maxL + 1) errs.push('sum length impossible');
  }
  const c = solveCount(p);
  if (c !== 1) errs.push(c === -1 ? '>10 letters' : `solutions=${c}, need exactly 1`);
  // Alternation: no two consecutive drops share an op, from the variety launch
  // on (the earlier all-addition run is grandfathered).
  if (i > 0) {
    const prev = PUZZLES[i - 1];
    if (p.live >= VARIETY_FROM && (prev.op || 'add') === op) errs.push(`op ${op} repeats the previous day (${prev.quizId})`);
  }
  const sym = op === 'mul' ? ' x ' : op === 'sub' ? ' - ' : '+';
  if (errs.length) { bad++; console.error(`✗ ${p.quizId}: ${errs.join('; ')}`); }
  else console.log(`✓ ${p.quizId}  [${op}] ${p.lhs.join(sym)}=${p.rhs}  unique`);
});
if (bad) { console.error(`\n${bad} bad puzzle(s)`); process.exit(1); }
console.log(`\nAll ${PUZZLES.length} Cipher puzzles verified unique, alternating.`);
