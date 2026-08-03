// Verify the Crunch bank (app/crunch/puzzles.js), the daily numbers round.
// Run after ANY edit:  node scripts/verify-crunch.mjs
//
// Everything below is RECOMPUTED from scratch with the shipping solver
// (app/crunch/solver.js) — nothing is trusted from the stored fields, which is
// exactly how the bank shipped 26 of 62 boards with `solutions` at 401 or 402
// against its own documented cap of 400 without anyone noticing.
//
// Per puzzle:
//   numbers    exactly six positive integers, largest first (non-increasing),
//              per the puzzle-file header ("the six you are dealt, largest first").
//   target     integer in [101, 999] and PROVEN reachable exactly by `numbers`
//              (re-solved with solver.solve, requiring .exact === true).
//   need       re-derived with solver.minNumbersForExact and required to match
//              exactly. Weekdays must be 4 or 5; Sundays must be 6 (per header).
//   solutions  re-derived with solver.solve({countCap}); the header's own
//              documented rule is "capped at 400", so the true recomputed count,
//              itself capped at 400, must equal the stored field EXACTLY — a
//              stored 401 or 402 is a hard violation of the game's own rule,
//              not a rounding grey area.
//   example    replayed as a literal number-pool simulation (each of the six
//              usable once, results reusable, every step checked against
//              solver.applyOp) and must land on `target`.
//   sunday     must equal the true UTC weekday of `live`; quizId/live/num must
//              be internally consistent (mirrors the alibi/glyph checks).
//
// Bank-level pool variety (required even though nothing here is as degenerate
// as Rung's start-word collapse): no `target` value or exact `numbers` tuple
// may repeat more than POOL_CEIL times across the whole bank, and each pool
// must stay above MIN_UNIQUE_RATIO unique. Currently clean (max repeat is 2),
// but the ceiling stays wired so a future bulk "bank to N days" job can't
// quietly recycle the same numbers set the way it recycled Rung's start words.
//
// GRANDFATHER: exactly like verify-daily-banks.mjs's CRUX_FLOOR_FROM, a board
// whose `live` date is before CRUNCH_FLOOR_FROM is already-played history —
// its `solutions`/`need` defect (if any) is reported as a grandfathered NOTE,
// never a hard FAIL. Everything live on or after that date is still editable
// and any defect there is a hard FAIL.
//
// Performance: solver.solve with a countCap re-walks the whole (undeduped)
// search tree for each puzzle, so the full 62-board run takes on the order of
// 10 seconds. That is expected and is not a hang.

import { solve, minNumbersForExact, applyOp } from '../app/crunch/solver.js';
import { PUZZLES } from '../app/crunch/puzzles.js';

const CRUNCH_FLOOR_FROM = '2026-08-03';
const SOLUTIONS_CAP = 400;
const COUNT_CAP_PROBE = SOLUTIONS_CAP + 1; // enough to prove "true count exceeds the cap"
const POOL_CEIL = 3;          // no target or numbers-tuple may repeat more than this
const MIN_UNIQUE_RATIO = 0.7; // and each pool must stay at least this unique

const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);
let BAD = 0;

const targetPool = new Map();
const numbersPool = new Map();

PUZZLES.forEach((p, i) => {
  const errs = [];
  const notes = [];

  // ── identity / date consistency ─────────────────────────────────────────
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^crunch-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live}`);
  }

  // ── numbers / target shape ──────────────────────────────────────────────
  if (!Array.isArray(p.numbers) || p.numbers.length !== 6) errs.push(`numbers has ${p.numbers?.length} entries, want 6`);
  else {
    if (p.numbers.some((v) => !Number.isInteger(v) || v <= 0)) errs.push('numbers must be positive integers');
    for (let i2 = 1; i2 < p.numbers.length; i2++) if (p.numbers[i2] > p.numbers[i2 - 1]) errs.push('numbers not largest-first');
  }
  if (!Number.isInteger(p.target) || p.target < 101 || p.target > 999) errs.push(`target ${p.target} outside 101-999`);

  if (Array.isArray(p.numbers) && p.numbers.length === 6 && Number.isInteger(p.target)) {
    targetPool.set(p.target, (targetPool.get(p.target) || 0) + 1);
    const numsKey = p.numbers.join(',');
    numbersPool.set(numsKey, (numbersPool.get(numsKey) || 0) + 1);

    // ── reachability + need, always recomputed ──────────────────────────
    const plain = solve(p.numbers.slice(), p.target);
    if (!plain.exact) errs.push(`target ${p.target} is NOT exactly reachable from [${p.numbers.join(',')}]`);
    const need = minNumbersForExact(p.numbers.slice(), p.target);
    if (need !== p.need) errs.push(`need ${p.need} != recomputed ${need}`);
    const wantNeed = p.sunday ? [6] : [4, 5];
    if (!wantNeed.includes(p.need)) errs.push(`need ${p.need} outside ${p.sunday ? 'Sunday {6}' : 'weekday {4,5}'}`);

    // ── solutions, capped at 400, recomputed and NEVER trusted ──────────
    const probe = solve(p.numbers.slice(), p.target, { countCap: COUNT_CAP_PROBE });
    const trueCapped = probe.exactCount > SOLUTIONS_CAP ? SOLUTIONS_CAP : probe.exactCount;
    if (trueCapped !== p.solutions) {
      const msg = `solutions=${p.solutions}, recomputed(capped@${SOLUTIONS_CAP})=${trueCapped}` +
        (probe.exactCount > SOLUTIONS_CAP ? ` (raw count exceeds the cap, sampled at ${probe.exactCount})` : '');
      if (p.live >= CRUNCH_FLOOR_FROM) errs.push(msg);
      else notes.push(`GRANDFATHERED (live ${p.live} < ${CRUNCH_FLOOR_FROM}, already played): ${msg}`);
    }
  }

  // ── example: replay it as a literal pool simulation ─────────────────────
  if (Array.isArray(p.example) && p.example.length) {
    const pool = [...(p.numbers || [])];
    const use = (v) => {
      const idx = pool.indexOf(v);
      if (idx < 0) return false;
      pool.splice(idx, 1);
      return true;
    };
    let last = null;
    for (const [a, op, b, r] of p.example) {
      if (!use(a)) { errs.push(`example uses ${a} but it is not available`); break; }
      if (!use(b)) { errs.push(`example uses ${b} but it is not available`); break; }
      const computed = applyOp(a, b, op);
      if (computed !== r) { errs.push(`example step ${a}${op}${b} = ${computed}, not ${r}`); break; }
      pool.push(r);
      last = r;
    }
    if (last !== null && last !== p.target && !errs.some((e) => e.startsWith('example'))) {
      errs.push(`example ends on ${last}, not target ${p.target}`);
    }
  } else {
    errs.push('example missing or empty');
  }

  if (errs.length) fail(p.quizId, errs.join('; '));
  else {
    const solBit = notes.length ? `solutions=${p.solutions} (grandfathered defect, see note)` : `solutions=${p.solutions} confirmed`;
    ok(p.quizId, `numbers/target sane, need=${p.need} confirmed, ${solBit}, example replays to target`);
  }
  for (const n of notes) note(p.quizId, n);
});

// ── bank-level pool variety ─────────────────────────────────────────────────
function reportPool(label, pool, total) {
  const stale = [...pool.entries()].filter(([, n]) => n > POOL_CEIL);
  const uniqueRatio = pool.size / total;
  if (stale.length) fail(`crunch pool (${label})`, `repeated more than ${POOL_CEIL}x: ${stale.map(([k, n]) => `${k} x${n}`).join(', ')}`);
  else if (uniqueRatio < MIN_UNIQUE_RATIO) fail(`crunch pool (${label})`, `only ${pool.size}/${total} unique (${(uniqueRatio * 100).toFixed(0)}%), floor is ${(MIN_UNIQUE_RATIO * 100).toFixed(0)}%`);
  else ok(`crunch pool (${label})`, `${pool.size}/${total} unique, no value repeats more than ${POOL_CEIL}x`);
}
reportPool('target', targetPool, PUZZLES.length);
reportPool('numbers tuple', numbersPool, PUZZLES.length);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Crunch boards verified.');
process.exit(BAD ? 1 : 0);
