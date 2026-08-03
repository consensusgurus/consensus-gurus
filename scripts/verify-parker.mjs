// Verify the Parker (daily sliding-block jam, née Park) bank. Parker's own
// header comment (app/parker/puzzles.js) and its solver (app/parker/solver.js)
// promise, per puzzle:
//   - block 0 is always RED: two long, horizontal, fixed on row 2, escaping
//     through the gap in the right-hand wall on that row;
//   - `par` (the field's old name; the game now calls this PERFECT) is the
//     EXACT minimum number of moves, found by breadth-first search over the
//     whole reachable state space -- not an estimate;
//   - the week climbs in three rungs, EACH DIALED DIFFERENTLY: Monday to
//     Wednesday run perfect 11-14, Thursday to Saturday 16-20, and Sundays
//     32-38; "each rung also ramps inside itself, so Monday is the gentlest
//     board of the week and Saturday the stiffest short of the Sunday
//     Edition" -- i.e. par is non-decreasing across the whole Mon->Sat run
//     of a single week.
// None of that was previously machine-checked. app/parker/solver.js's BFS is
// the exact solver that also drives the live game's hint, so this recomputes
// the true minimum independently rather than trusting the stored `par`.
//
//   1. Structural: `grid(pieces)` is non-null (no overlapping or off-board
//      blocks); block 0 has len 2, is horizontal, and is fixed on row
//      EXIT_ROW (2); the start position is not already solved.
//   2. Full independent BFS solve via `solve()`: the recomputed minimum move
//      count must equal the stored `par` exactly (this alone proves both
//      "not fewer" and "not more" -- solve() returns the true shortest path
//      length, period).
//   3. Rung bounds: par sits inside [11,14] for Mon/Tue/Wed boards, [16,20]
//      for Thu/Fri/Sat, [32,38] for Sunday boards; `sunday` must match the
//      real day-of-week of `live`.
//   4. Within-week ramp: for any two boards on CONSECUTIVE calendar weekdays
//      within the same week (Mon->Tue->Wed->Thu->Fri->Sat -- never wrapping
//      Sat to the next Mon, and skipping over Sundays, which run their own
//      separate difficulty track), par must be non-decreasing. A ramp that
//      goes DOWN across the week is a hard fail; a flat (equal) step is
//      allowed but reported as a note, since "ramps" implies real variety,
//      not just a non-decreasing sequence sitting flat.
//   5. quizId keeps the historical `park-` prefix (the game shipped as Park
//      and was renamed to Parker without touching leaderboard-keying ids --
//      see the header note in puzzles.js); num/quizId/live/dateLabel are
//      mutually consistent and sequential.
//   6. No duplicate boards (identical `pieces`).
//   7. Pool variety: no motif/prose field exists on a Parker puzzle, and the
//      red block's own start position is naturally low-cardinality (only 5
//      legal columns exist on a 6-wide row), so that alone is not a useful
//      copy-paste signal. Instead this hashes every board's NON-red blocks
//      (sorted, position-independent) into a signature; that space is huge
//      (12-14 blocks each with a length/orientation/row-or-column/offset),
//      so two boards sharing the exact same signature is real evidence of a
//      copy-pasted or trivially-mutated board, not chance. Any repeat
//      (ceiling POOL_CEILING = 1, i.e. none allowed) is a hard fail for
//      boards live on or after PARK_FLOOR_FROM and a note before that.
//   8. US spelling: no reader-facing prose fields exist on a Parker puzzle
//      today, so this is a no-op scan kept for parity with the other
//      verifiers and for any future field (e.g. a motif).
//
// Runtime: solve() explores the whole reachable state space per puzzle,
// which the header itself says is "only a few thousand states" even for the
// biggest Sunday boards -- confirmed empirically at well under 100ms/board,
// so all boards solve in well under a few seconds combined. solve()'s own
// `cap` (default 300000 states) is left at its default as the safety valve.
//
// Run: node scripts/verify-parker.mjs
import { PUZZLES } from '../app/parker/puzzles.js';
import { fromData, grid, solved, solve, EXIT_ROW } from '../app/parker/solver.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const PARK_FLOOR_FROM = '2026-08-03';
const POOL_CEILING = 1; // a non-red board signature may repeat at most this many times (i.e. never)

// ─── US-spelling scan (kept for parity; no prose fields exist today) ──────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

const RUNG = {
  1: { name: 'Monday', lo: 11, hi: 14 },
  2: { name: 'Tuesday', lo: 11, hi: 14 },
  3: { name: 'Wednesday', lo: 11, hi: 14 },
  4: { name: 'Thursday', lo: 16, hi: 20 },
  5: { name: 'Friday', lo: 16, hi: 20 },
  6: { name: 'Saturday', lo: 16, hi: 20 },
  0: { name: 'Sunday', lo: 32, hi: 38 },
};

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenPieces = new Map();
const sigPool = new Map();
const byLive = [];

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^park-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId (must keep the historical park- prefix)');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  scanBritish(p.quizId, 'dateLabel', p.dateLabel);
  let dow = null;
  if (p.live) {
    dow = new Date(`${p.live}T12:00:00Z`).getUTCDay();
    const isSun = dow === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }

  // -- rung bounds --
  if (dow !== null) {
    const rung = RUNG[dow];
    if (typeof p.par !== 'number' || p.par < rung.lo || p.par > rung.hi) {
      errs.push(`par ${p.par} outside the ${rung.name} rung's documented band [${rung.lo}, ${rung.hi}]`);
    }
  }

  // -- structural --
  let ps = null, g = null;
  if (!Array.isArray(p.pieces) || !p.pieces.length) {
    errs.push('missing/empty pieces');
  } else {
    ps = fromData(p.pieces);
    g = grid(ps);
    if (!g) errs.push('pieces overlap or hang off the 6x6 board');
    const b0 = ps[0];
    if (b0.len !== 2) errs.push(`block 0 (red) len ${b0.len} != 2`);
    if (!b0.horiz) errs.push('block 0 (red) must be horizontal');
    if (b0.fixed !== EXIT_ROW) errs.push(`block 0 (red) fixed row ${b0.fixed} != EXIT_ROW ${EXIT_ROW}`);
    if (g && solved(ps)) errs.push('the board is already solved at the start');
  }

  // -- independent BFS solve --
  let solveNote = '';
  if (!errs.length) {
    const r = solve(ps);
    if (r.min === -1) errs.push('solve() could not find a solution within its cap -- board may be unreachable/unsolvable');
    else if (r.min !== p.par) errs.push(`recomputed true minimum ${r.min} != stated par ${p.par}`);
    else solveNote = `, recomputed minimum ${r.min} confirmed by independent BFS`;
  }

  if (p.pieces) {
    const key = JSON.stringify(p.pieces);
    seenPieces.set(key, (seenPieces.get(key) || []).concat(p.quizId));
  }
  if (Array.isArray(p.pieces) && p.pieces.length > 1) {
    const sig = p.pieces.slice(1).map((x) => x.join(',')).sort().join('|');
    const arr = sigPool.get(sig) || [];
    arr.push({ id: p.quizId, live: p.live });
    sigPool.set(sig, arr);
  }
  if (p.live && dow !== null) byLive.push({ id: p.quizId, live: p.live, dow, par: p.par });

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `perfect ${p.par}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenPieces) {
  if (ids.length > 1) fail('parker pool', `identical board shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── within-week ramp ───────────────────────────────────────────────────────
byLive.sort((a, b) => (a.live < b.live ? -1 : a.live > b.live ? 1 : 0));
for (let i = 1; i < byLive.length; i++) {
  const prev = byLive[i - 1], cur = byLive[i];
  // Only compare Mon->Tue->Wed->Thu->Fri->Sat (dow 1..6) consecutive weekday
  // steps within the same week -- never across a Sunday, and never wrapping
  // Saturday to the following Monday.
  if (prev.dow >= 1 && prev.dow <= 5 && cur.dow === prev.dow + 1) {
    if (cur.par < prev.par) {
      fail('parker pool', `ramp broken: ${prev.id} (par ${prev.par}) -> ${cur.id} (par ${cur.par}) goes DOWN within the same week`);
    } else if (cur.par === prev.par) {
      note('parker pool', `flat step: ${prev.id} -> ${cur.id} both par ${cur.par} (ramp promises real variety, not just non-decreasing)`);
    }
  }
}

// ─── non-red board signature pool variety ──────────────────────────────────
let staleFound = false;
for (const [, entries] of sigPool) {
  const freshCount = entries.filter((e) => e.live >= PARK_FLOOR_FROM).length;
  if (entries.length > POOL_CEILING) {
    const msg = `near-identical board (same non-red blocks) shipped on ${entries.length} boards (ceiling ${POOL_CEILING}): ${entries.map((e) => e.id).join(', ')}`;
    if (freshCount > 0) { fail('parker pool', msg); staleFound = true; }
    else note('parker pool', `grandfathered: ${msg}`);
  }
}
if (!staleFound && BAD === 0) ok('parker pool', `${PUZZLES.length} boards, ${sigPool.size} distinct non-red board signatures, no signature over the ${POOL_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Parker boards verified.');
process.exit(BAD ? 1 : 0);
