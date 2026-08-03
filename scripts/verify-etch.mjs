// Verify the Etch (daily nonogram / picture-logic) bank. Etch's own header
// comment (app/etch/puzzles.js) and its client's rules copy (EtchClient.jsx)
// promise, per puzzle:
//   - a w x h grid (weekdays 10x10, Sundays a 15x15 Edition);
//   - `rows`/`cols` are printed run-length clues, an empty line written [0];
//   - `sol` is the answer and must actually satisfy those clues;
//   - EXACTLY ONE solution, reachable by PURE LINE LOGIC with no guessing
//     ("a careful solver never has to gamble").
// None of that was previously machine-checked. This script recomputes it all:
//
//   1. Structural: w/h match the sunday flag (10x10 / 15x15); rows.length===h,
//      cols.length===w; sol is h rows of w chars, each '.' or '#'.
//   2. sol actually satisfies its own printed clues (recomputed run-lengths,
//      not trusted).
//   3. UNIQUENESS + NO-GUESSING, together: a standard nonogram line-solver
//      (generate every valid fill for each row/col given its clue, intersect
//      across lines, iterate to a fixpoint) must fully determine every cell.
//      If any line has zero consistent arrangements, the puzzle is broken
//      (over-constrained). If the fixpoint leaves any cell undetermined, the
//      puzzle needs a guess and violates the "no guessing" promise -- this is
//      also, incidentally, an uniqueness proof: a puzzle that fully resolves
//      by constraint propagation alone has exactly one solution by
//      construction. The resulting grid must equal the stored `sol`.
//   4. `sunday` must match the real day-of-week of `live` (Sundays only).
//   5. num/quizId/live/dateLabel are mutually consistent and sequential.
//   6. No duplicate boards (identical `sol` grid) and no duplicate `subject`
//      anywhere in the bank -- ceiling is 1 (a picture-logic bank this size
//      should never need to repeat its picture).
//   7. US spelling: reader-facing `subject` strings are scanned for obvious
//      British word forms.
//
// Run: node scripts/verify-etch.mjs
import { PUZZLES } from '../app/etch/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// ─── nonogram line-logic solver ────────────────────────────────────────────
const normRuns = (clue) => (clue.length === 1 && clue[0] === 0 ? [] : clue);

function genArrangements(n, runs) {
  const out = [];
  if (runs.length === 0) { out.push(new Array(n).fill(false)); return out; }
  const rec = (idx, pos, cur) => {
    if (idx === runs.length) { const row = cur.slice(); for (let i = pos; i < n; i++) row.push(false); out.push(row); return; }
    const runLen = runs[idx];
    let remNeed = 0;
    for (let k = idx + 1; k < runs.length; k++) remNeed += runs[k] + 1;
    const maxStart = n - remNeed - runLen;
    for (let start = pos; start <= maxStart; start++) {
      const row = cur.slice();
      for (let i = pos; i < start; i++) row.push(false);
      for (let i = 0; i < runLen; i++) row.push(true);
      let nextPos = start + runLen;
      if (idx < runs.length - 1) { row.push(false); nextPos++; }
      rec(idx + 1, nextPos, row);
    }
  };
  rec(0, 0, []);
  return out;
}

// Returns { ok:false, reason } on contradiction, or { ok:true, solved, grid }.
function solveLineLogic(w, h, rows, cols) {
  const rowRuns = rows.map(normRuns), colRuns = cols.map(normRuns);
  let rowArr = rowRuns.map((r) => genArrangements(w, r));
  let colArr = colRuns.map((r) => genArrangements(h, r));
  const grid = Array.from({ length: h }, () => new Array(w).fill(-1));
  let changed = true, guard = 0;
  while (changed) {
    changed = false;
    if (++guard > 1000) break;
    for (let r = 0; r < h; r++) {
      const consistent = rowArr[r].filter((arr) => arr.every((v, c) => grid[r][c] === -1 || (grid[r][c] === 1) === v));
      if (!consistent.length) return { ok: false, reason: `row ${r} has no arrangement consistent with the clue` };
      rowArr[r] = consistent;
      for (let c = 0; c < w; c++) {
        if (grid[r][c] !== -1) continue;
        if (consistent.every((arr) => arr[c])) { grid[r][c] = 1; changed = true; }
        else if (consistent.every((arr) => !arr[c])) { grid[r][c] = 0; changed = true; }
      }
    }
    for (let c = 0; c < w; c++) {
      const consistent = colArr[c].filter((arr) => arr.every((v, r) => grid[r][c] === -1 || (grid[r][c] === 1) === v));
      if (!consistent.length) return { ok: false, reason: `col ${c} has no arrangement consistent with the clue` };
      colArr[c] = consistent;
      for (let r = 0; r < h; r++) {
        if (grid[r][c] !== -1) continue;
        if (consistent.every((arr) => arr[r])) { grid[r][c] = 1; changed = true; }
        else if (consistent.every((arr) => !arr[r])) { grid[r][c] = 0; changed = true; }
      }
    }
  }
  return { ok: true, solved: grid.every((row) => row.every((v) => v !== -1)), grid };
}

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenSubjects = new Map();
const seenSols = new Map();
PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^etch-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }

  const wantSize = p.sunday ? 15 : 10;
  if (p.w !== wantSize || p.h !== wantSize) errs.push(`${p.w}x${p.h}, want ${wantSize}x${wantSize} for ${p.sunday ? 'Sunday' : 'weekday'}`);
  if (!Array.isArray(p.rows) || p.rows.length !== p.h) errs.push(`rows.length ${p.rows?.length} != h ${p.h}`);
  if (!Array.isArray(p.cols) || p.cols.length !== p.w) errs.push(`cols.length ${p.cols?.length} != w ${p.w}`);
  if (!Array.isArray(p.sol) || p.sol.length !== p.h) errs.push(`sol has ${p.sol?.length} rows, want ${p.h}`);
  else if (p.sol.some((row) => row.length !== p.w || !/^[.#]+$/.test(row))) errs.push('sol contains a row of the wrong width or an invalid character');

  if (!errs.length) {
    // sol must actually satisfy its own printed clues (recomputed, not trusted).
    const runsOf = (line) => {
      const runs = []; let cur = 0;
      for (const ch of line) { if (ch === '#') cur++; else { if (cur) runs.push(cur); cur = 0; } }
      if (cur) runs.push(cur);
      return runs.length ? runs : [0];
    };
    for (let r = 0; r < p.h; r++) {
      const got = runsOf(p.sol[r]), want = p.rows[r];
      if (JSON.stringify(got) !== JSON.stringify(want)) errs.push(`sol row ${r} runs ${JSON.stringify(got)} != clue ${JSON.stringify(want)}`);
    }
    for (let c = 0; c < p.w; c++) {
      const col = p.sol.map((row) => row[c]).join('');
      const got = runsOf(col), want = p.cols[c];
      if (JSON.stringify(got) !== JSON.stringify(want)) errs.push(`sol col ${c} runs ${JSON.stringify(got)} != clue ${JSON.stringify(want)}`);
    }
  }

  if (!errs.length) {
    const res = solveLineLogic(p.w, p.h, p.rows, p.cols);
    if (!res.ok) errs.push(`clues are contradictory: ${res.reason}`);
    else if (!res.solved) errs.push('NOT solvable by pure line logic alone (a solver would have to guess)');
    else {
      for (let r = 0; r < p.h; r++) for (let c = 0; c < p.w; c++) {
        const want = p.sol[r][c] === '#' ? 1 : 0;
        if (res.grid[r][c] !== want) { errs.push(`line-logic solution disagrees with stored sol at (${r},${c})`); break; }
      }
    }
  }

  if (!p.subject || typeof p.subject !== 'string') errs.push('missing subject');
  else scanBritish(p.quizId, 'subject', p.subject);

  if (p.subject) { seenSubjects.set(p.subject, (seenSubjects.get(p.subject) || []).concat(p.quizId)); }
  if (Array.isArray(p.sol)) { const key = p.sol.join('|'); seenSols.set(key, (seenSols.get(key) || []).concat(p.quizId)); }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `${p.w}x${p.h}${p.sunday ? ' Sunday' : ''}, "${p.subject}", unique + pure-logic solvable`);
});

// ─── pool variety: no duplicate subject, no duplicate board ────────────────
for (const [subject, ids] of seenSubjects) {
  if (ids.length > 1) fail('etch pool', `subject "${subject}" reused on ${ids.length} boards: ${ids.join(', ')}`);
}
for (const [, ids] of seenSols) {
  if (ids.length > 1) fail('etch pool', `identical solution grid shipped on ${ids.length} boards: ${ids.join(', ')}`);
}
if (BAD === 0) ok('etch pool', `${PUZZLES.length} boards, ${seenSubjects.size} distinct subjects, no duplicate grids`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Etch boards verified.');
process.exit(BAD ? 1 : 0);
