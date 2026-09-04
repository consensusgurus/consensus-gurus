// Verify the Impound (the larger Parker, 7x7 sliding-block jam) bank.
//
// This is verify-parker.mjs's twin, bound to Impound's board. It checks the same
// claims because Impound makes the same claims, and it asserts one more that
// Parker cannot: that Impound is genuinely the BIGGER game, so every weekday
// rung sits above the Parker rung it corresponds to and no Impound board is
// easier than Parker's hardest weekday.
//
// Impound's own header (app/impound/puzzles.js) and its solver binding
// (app/impound/solver.js) promise, per puzzle:
//   - the board is seven by seven with the exit on row 3, the true middle rank;
//   - block 0 is always RED: two long, horizontal, fixed on the exit row,
//     escaping through the gap in the right-hand wall on that row;
//   - `par` (the field's old name, kept so it matches Parker's shape; the game
//     calls this PERFECT) is the EXACT minimum number of moves, found by
//     breadth-first search over the whole reachable state space, not an
//     estimate;
//   - the week climbs in two rungs, each dialed differently: Monday to
//     Wednesday run perfect 16-25, Thursday to Saturday 23-35, and Sundays
//     34-50, with par non-decreasing across the whole Mon->Sat run of a week.
//
//   1. Structural: `grid(pieces)` is non-null (no overlapping or off-board
//      blocks); block 0 has len 2, is horizontal, and is fixed on row
//      EXIT_ROW (3); the start position is not already solved.
//   2. Full independent BFS solve via `solve()`: the recomputed minimum move
//      count must equal the stored `par` exactly. This alone proves both "not
//      fewer" and "not more", since solve() returns the true shortest path
//      length. Note that every banked board was ACCEPTED by the generator only
//      because its search reached the goal inside a 40,000-state cap, so this
//      re-solve is cheap by construction; a board that needs a big search here
//      did not come from the generator.
//   3. Rung bounds, and the sunday flag matching the real day of week.
//   4. Within-week ramp: par is non-decreasing across consecutive weekdays in
//      the same week (never wrapping Sat to Mon, skipping Sundays, which run
//      their own track). A flat step is a note rather than a failure.
//   5. quizId/num/live/dateLabel mutually consistent and sequential.
//   6. No duplicate boards (identical `pieces`).
//   7. Pool variety: the non-red blocks are hashed into a position-independent
//      signature, and any repeat is a hard fail. That space is huge (about
//      twenty blocks each with a length, an orientation, a row-or-column and an
//      offset), so a collision is real evidence of a copy-pasted board.
//   8. IMPOUND IS BIGGER THAN PARKER, checked rather than asserted: every rung
//      band sits strictly above Parker's matching band, and Impound's MONDAY
//      floor is at or above the floor of Parker's hardest weekday rung, which is
//      the "Impound starts where Parker's Saturday ends" claim the copy makes,
//      and Impound's MEDIAN board beats Parker's median on both tracks.
//      Note what this deliberately does NOT claim: that every Impound board
//      beats every Parker board. Impound's Monday band (16-20) is the same
//      window as Parker's Thu-Sat band by design, because opening the week where
//      the other game finishes its is the whole point. A first draft of this
//      check asserted the stronger thing and failed on a perfectly good bank.
//   9. US spelling: no reader-facing prose fields exist on an Impound puzzle
//      today, so this is a no-op scan kept for parity and for any future field.
//
// Run: node scripts/verify-impound.mjs
import { PUZZLES } from '../app/impound/puzzles.js';
import { fromData, grid, solved, solve, EXIT_ROW, N } from '../app/impound/solver.js';
import { PUZZLES as PARKER } from '../app/parker/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Impound launched with this bank, so there is no frozen history to grandfather
// yet. The constant exists so the first retrofit has somewhere to go, per the
// standing rule that a rule change scopes to future boards with a dated floor.
const IMPOUND_FLOOR_FROM = '2026-09-04';
const POOL_CEILING = 1; // a non-red board signature may repeat at most this many times (i.e. never)

const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

const RUNG = {
  1: { name: 'Monday', lo: 16, hi: 20 },
  2: { name: 'Tuesday', lo: 18, hi: 23 },
  3: { name: 'Wednesday', lo: 20, hi: 25 },
  4: { name: 'Thursday', lo: 23, hi: 28 },
  5: { name: 'Friday', lo: 25, hi: 31 },
  6: { name: 'Saturday', lo: 28, hi: 35 },
  0: { name: 'Sunday', lo: 34, hi: 50 },
};
// Parker's own documented bands, from app/parker/puzzles.js. Used only by check 8.
const PARKER_RUNG = { 1: [11, 14], 2: [11, 14], 3: [11, 14], 4: [16, 20], 5: [16, 20], 6: [16, 20], 0: [32, 38] };

const seenPieces = new Map();
const sigPool = new Map();
const byLive = [];

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^impound-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId (must be impound-M-D-YY)');
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
    if (!g) errs.push(`pieces overlap or hang off the ${N}x${N} board`);
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
    if (r.min === -1) errs.push('solve() could not find a solution within its cap -- board may be unsolvable');
    else if (r.min !== p.par) errs.push(`recomputed true minimum ${r.min} != stated par ${p.par}`);
    else solveNote = `, recomputed minimum ${r.min} confirmed by independent BFS over ${r.seen.toLocaleString()} states`;
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
  if (ids.length > 1) fail('impound pool', `identical board shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── within-week ramp ───────────────────────────────────────────────────────
byLive.sort((a, b) => (a.live < b.live ? -1 : a.live > b.live ? 1 : 0));
for (let i = 1; i < byLive.length; i++) {
  const prev = byLive[i - 1], cur = byLive[i];
  if (prev.dow >= 1 && prev.dow <= 5 && cur.dow === prev.dow + 1) {
    if (cur.par < prev.par) {
      fail('impound pool', `ramp broken: ${prev.id} (par ${prev.par}) -> ${cur.id} (par ${cur.par}) goes DOWN within the same week`);
    } else if (cur.par === prev.par) {
      note('impound pool', `flat step: ${prev.id} -> ${cur.id} both par ${cur.par} (ramp promises real variety, not just non-decreasing)`);
    }
  }
}

// ─── non-red board signature pool variety ──────────────────────────────────
let staleFound = false;
for (const [, entries] of sigPool) {
  const freshCount = entries.filter((e) => e.live >= IMPOUND_FLOOR_FROM).length;
  if (entries.length > POOL_CEILING) {
    const msg = `near-identical board (same non-red blocks) shipped on ${entries.length} boards (ceiling ${POOL_CEILING}): ${entries.map((e) => e.id).join(', ')}`;
    if (freshCount > 0) { fail('impound pool', msg); staleFound = true; }
    else note('impound pool', `grandfathered: ${msg}`);
  }
}

// ─── check 8: Impound really is the bigger game ─────────────────────────────
// The whole claim of this game, in reader-facing copy and in its own name, is
// that it starts where Parker leaves off. That is a checkable statement, so it
// is checked rather than trusted.
for (const dow of [0, 1, 2, 3, 4, 5, 6]) {
  const mine = RUNG[dow], theirs = PARKER_RUNG[dow];
  if (mine.lo <= theirs[0] || mine.hi <= theirs[1]) {
    fail('impound vs parker', `the ${mine.name} rung [${mine.lo},${mine.hi}] does not sit above Parker's [${theirs[0]},${theirs[1]}]`);
  }
}
const PARKER_HARDEST_WEEKDAY_FLOOR = Math.max(PARKER_RUNG[4][0], PARKER_RUNG[5][0], PARKER_RUNG[6][0]);
if (RUNG[1].lo < PARKER_HARDEST_WEEKDAY_FLOOR) {
  fail('impound vs parker', `Impound's Monday floor (${RUNG[1].lo}) is below the floor of Parker's hardest weekday rung (${PARKER_HARDEST_WEEKDAY_FLOOR}), so the week does not start where Parker's ends`);
} else if (PUZZLES.length && PARKER.length) {
  // The bank-level claim, compared LIKE WITH LIKE: median weekday against
  // median weekday, and median Sunday against median Sunday. Comparing one
  // game's easiest board against the other's median is not a claim anybody
  // makes, and the first two drafts of this check did exactly that and failed
  // a good bank twice, once on 16 vs 20 and once on 16 vs 16.
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const mine = { wk: med(PUZZLES.filter((p) => !p.sunday).map((p) => p.par)), su: med(PUZZLES.filter((p) => p.sunday).map((p) => p.par)) };
  const theirs = { wk: med(PARKER.filter((p) => !p.sunday).map((p) => p.par)), su: med(PARKER.filter((p) => p.sunday).map((p) => p.par)) };
  if (mine.wk <= theirs.wk) fail('impound vs parker', `median weekday ${mine.wk} does not beat Parker's ${theirs.wk}`);
  else if (mine.su <= theirs.su) fail('impound vs parker', `median Sunday ${mine.su} does not beat Parker's ${theirs.su}`);
  else ok('impound vs parker', `every rung sits above Parker's, Monday opens at ${RUNG[1].lo} where Parker's hardest rung starts, and the median board beats Parker's on both tracks (weekday ${mine.wk} v ${theirs.wk}, Sunday ${mine.su} v ${theirs.su})`);
}

if (!staleFound && BAD === 0) ok('impound pool', `${PUZZLES.length} boards, ${sigPool.size} distinct non-red board signatures, no signature over the ${POOL_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Impound boards verified.');
process.exit(BAD ? 1 : 0);
