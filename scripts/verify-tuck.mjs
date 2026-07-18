// Verify the Tuck bank: every rack must be 14 uppercase letters with 4-6
// vowels, and every stored PAR must be ACHIEVABLE — this re-runs the ladder
// solver (one horizontal spine + vertical words hung off non-adjacent columns,
// all words from public/tuck-dict.txt) and fails if it cannot reach the stored
// par on that rack. Ids/dates/sunday flags are also checked. Run after ANY edit:
//   node scripts/verify-tuck.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PUZZLES } from '../app/tuck/puzzles.js';

const here = dirname(fileURLToPath(import.meta.url));
const PTS = { A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10 };
const words = readFileSync(join(here, '../public/tuck-dict.txt'), 'utf8').trim().split('\n').map((w) => w.toUpperCase());
const counts = (a) => { const m = {}; for (const c of a) m[c] = (m[c] || 0) + 1; return m; };
const fits = (w, r) => { for (const k in w) { if ((r[k] || 0) < w[k]) return false; } return true; };
const pts = (w) => { let s = 0; for (const c of w) s += PTS[c]; return s; };
const dict = words.filter((w) => w.length >= 2 && w.length <= 8).map((w) => ({ w, cnt: counts(w.split('')), p: pts(w) }));

function sub(rc, wc, skipLetter) {
  const r = { ...rc };
  for (const k in wc) {
    let need = wc[k];
    if (k === skipLetter) need -= 1;
    if (need > 0) { if ((r[k] || 0) < need) return null; r[k] -= need; }
  }
  return r;
}

function ladder(rack) {
  const rc = counts(rack);
  const formable = dict.filter((x) => fits(x.cnt, rc)).sort((a, b) => b.p - a.p);
  const nearFormable = {};
  for (const L of Object.keys(PTS)) {
    const rc2 = { ...rc }; rc2[L] = (rc2[L] || 0) + 1;
    nearFormable[L] = dict.filter((x) => x.cnt[L] && fits(x.cnt, rc2)).sort((a, b) => b.p - a.p);
  }
  const spines = formable.filter((x) => x.w.length >= 4).slice(0, 250);
  let best = 0;
  for (const h of spines) {
    const cols = [...h.w].map((ch, i) => ({ ch, i }));
    const orders = [cols, cols.slice().sort((a, b) => PTS[b.ch] - PTS[a.ch])];
    for (const ord of orders) {
      let rem = sub(rc, h.cnt, null);
      if (!rem) continue;
      let score = h.p, used = h.w.length;
      const usedCols = new Set();
      for (const { ch, i } of ord) {
        if (usedCols.has(i - 1) || usedCols.has(i + 1) || usedCols.has(i)) continue;
        const cands = nearFormable[ch] || [];
        for (const v of cands) {
          if (v.w.length < 2) continue;
          const rem2 = sub(rem, v.cnt, ch);
          if (rem2) { rem = rem2; score += v.p; used += v.w.length - 1; usedCols.add(i); break; }
        }
      }
      if (used === 14) score += 10;
      if (score > best) best = score;
    }
  }
  return best;
}

let bad = 0;
PUZZLES.forEach((p, i) => {
  const errs = [];
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^tuck-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    // no Sunday editions yet: the flag must be false so /daily never
    // shows a phantom "Sunday Edition" chip (isSundayEdition reads it).
    if (p.sunday !== false) errs.push('sunday must be false (no Sunday editions)');
  }
  if (!Array.isArray(p.letters) || p.letters.length !== 14 || p.letters.some((c) => !/^[A-Z]$/.test(c))) errs.push('bad rack');
  else {
    const v = p.letters.filter((c) => 'AEIOU'.includes(c)).length;
    if (v < 4 || v > 6) errs.push(`vowel count ${v} outside 4-6`);
    const best = ladder(p.letters);
    if (best < p.par) errs.push(`stored par ${p.par} NOT achieved by solver (best ${best})`);
    else console.log(`✓ ${p.quizId}  ${p.letters.join('')}  par ${p.par} achievable (solver ${best})`);
  }
  if (errs.length) { bad++; console.error(`✗ ${p.quizId}: ${errs.join('; ')}`); }
});
if (bad) { console.error(`\n${bad} bad puzzle(s)`); process.exit(1); }
console.log(`\nAll ${PUZZLES.length} Tuck racks verified.`);
