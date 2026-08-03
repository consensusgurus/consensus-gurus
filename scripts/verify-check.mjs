// Verify the Check (daily checkers board-clear) bank. Check's own header
// comment (app/check/puzzles.js) and its client's rules copy
// (CheckClient.jsx) promise, per puzzle:
//   - red to move, no capture available at the start (so the key is a free
//     choice, never a forced jump);
//   - `clearIn` is the EXACT minimum number of red moves to capture every
//     black piece against black's stiffest defence -- 3 on weekdays, 4 on
//     Sundays, never fewer;
//   - EXACTLY ONE first move clears the board that fast ("Exactly one first
//     move clears the board in time");
//   - that key move is always a SACRIFICE: since captures are compulsory,
//     it must leave black with only capturing moves available ("giving a
//     piece away is how you pick black's reply for them" -- CheckClient.jsx:
//     "Captures are compulsory, so offering a piece is how you choose
//     black's reply for them").
// None of that was previously machine-checked. app/check/draughts.js is the
// exact rules engine + board-clear search that also drives the live game,
// so this recomputes every number independently rather than trusting the
// stored fields.
//
//   1. Structural: `cells` is 64 digits of 0-4, every nonzero cell sits on a
//      playable (dark) square, and `blk` matches the true count of black
//      pieces (3/4) on the board.
//   2. No capture is available for red at the start (every one of red's
//      legal first moves is a quiet slide -- if a jump existed, compulsory
//      capture would make it red's ONLY legal move, so this also proves red
//      genuinely has a free choice among several moves).
//   3. Full independent search via `clearIn`/`scoreMoves` with a budget of
//      clearIn+2 (headroom to catch a stored count that is too LOW, i.e. a
//      real clear that needs more moves than claimed, as well as too HIGH):
//      EXACTLY ONE red first move achieves a clear within `clearIn` moves,
//      and it is `key`; the true minimum equals `clearIn` exactly (rules out
//      both "clears faster" and "doesn't actually clear in time").
//   4. Sacrifice property: after playing `key`, black has at least one legal
//      move, and EVERY one of them is a jump (capture is compulsory) -- i.e.
//      the key move truly forces black's hand rather than leaving it a free
//      quiet reply.
//   5. `clearIn` is 3 on weekdays, 4 on Sundays; `sunday` must match the
//      real day-of-week of `live`.
//   6. num/quizId/live/dateLabel are mutually consistent and sequential.
//   7. No duplicate boards (identical `cells`).
//   8. Pool variety: Check carries no motif/prose field, so the closest
//      analog to a copy-pasted trap is the exact `key` square-path string
//      repeating across the bank. Ceiling KEY_CEILING per exact key path,
//      enforced hard for boards live on or after CHECK_FLOOR_FROM and
//      grandfathered as a note before that.
//   9. US spelling: no reader-facing prose fields exist on a Check puzzle
//      (dateLabel is a fixed month name), so this is a no-op scan kept for
//      parity with the other verifiers and for any future field.
//
// Runtime: `clearIn`'s search is depth-bounded and memoized per call; with a
// budget of clearIn+2 (max 6) and 2-4 black pieces, every board resolves in
// well under a second. No cap needed.
//
// Run: node scripts/verify-check.mjs
import { PUZZLES } from '../app/check/puzzles.js';
import { deserialize, legalMoves, clearIn, playable } from '../app/check/draughts.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const CHECK_FLOOR_FROM = '2026-08-03';
const KEY_CEILING = 3; // an exact key square-path may repeat at most this many times

// ─── US-spelling scan (kept for parity; no prose fields exist today) ──────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenCells = new Map();
const keyPool = new Map();

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^check-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  scanBritish(p.quizId, 'dateLabel', p.dateLabel);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }
  const wantClearIn = p.sunday ? 4 : 3;
  if (p.clearIn !== wantClearIn) errs.push(`clearIn ${p.clearIn} != ${wantClearIn} for ${p.sunday ? 'Sunday' : 'weekday'}`);

  // -- structural --
  let b = null;
  if (typeof p.cells !== 'string' || p.cells.length !== 64 || !/^[0-4]+$/.test(p.cells)) {
    errs.push(`cells must be 64 digits of 0-4, got "${p.cells}"`);
  } else {
    b = deserialize(p.cells);
    let blk = 0;
    for (let sq = 0; sq < 64; sq++) {
      const v = b[sq];
      if (!v) continue;
      const r = sq >> 3, c = sq & 7;
      if (!playable(r, c)) errs.push(`piece at ${sq} (r${r},c${c}) sits on a non-playable (light) square`);
      if (v === 3 || v === 4) blk++;
    }
    if (blk !== p.blk) errs.push(`blk ${p.blk} != true black-piece count ${blk}`);
  }

  // -- no capture available at the start --
  let startMoves = null;
  if (b) {
    startMoves = legalMoves(b, true);
    if (!startMoves.length) errs.push('red has no legal move at all');
    else if (startMoves.some((mv) => mv.caught.length > 0)) {
      errs.push('a capture is available for red at the start -- the key must be a free quiet choice, not a forced jump');
    }
  }

  // -- independent search + uniqueness + sacrifice --
  let solveNote = '';
  if (!errs.length) {
    const budget = p.clearIn + 2;
    const memo = new Map();
    const scored = startMoves.map((mv) => ({ mv, clear: (() => { const v = clearIn(mv.board, budget, false, memo); return v === Infinity ? Infinity : v + 1; })() }));
    const winners = scored.filter((s) => s.clear <= p.clearIn);
    const trueMin = clearIn(b, budget, true, new Map());
    if (winners.length === 0) {
      errs.push(`NO red first move clears the board within ${p.clearIn} moves -- the position is not solved by its own stated clearIn`);
    } else if (winners.length > 1) {
      errs.push(`NOT UNIQUE: ${winners.length} different first moves clear within ${p.clearIn} (${winners.map((s) => s.mv.path.join('.')).join(', ')})`);
    } else {
      const foundKey = winners[0].mv.path.join('.');
      if (foundKey !== p.key) errs.push(`the unique clearing move is ${foundKey}, but key is "${p.key}"`);
      if (trueMin !== p.clearIn) errs.push(`recomputed true minimum ${trueMin} != stated clearIn ${p.clearIn} (violates "never fewer")`);
      // sacrifice: after key, black has moves and every one of them is a jump
      const afterKey = winners[0].mv.board;
      const blkMoves = legalMoves(afterKey, false);
      if (!blkMoves.length) errs.push('after the key move black has no legal reply at all');
      else if (!blkMoves.every((mv) => mv.caught.length > 0)) {
        errs.push('the key move does NOT force a capture: black has a non-capturing reply available, so this is not a sacrifice');
      }
      solveNote = `, unique key ${foundKey} confirmed by independent search (true min ${trueMin})`;
    }
  }

  if (p.cells) seenCells.set(p.cells, (seenCells.get(p.cells) || []).concat(p.quizId));
  if (p.key) {
    const arr = keyPool.get(p.key) || [];
    arr.push({ id: p.quizId, live: p.live });
    keyPool.set(p.key, arr);
  }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `clear in ${p.clearIn}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenCells) {
  if (ids.length > 1) fail('check pool', `identical board shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── key pool variety ───────────────────────────────────────────────────────
let staleFound = false;
for (const [key, entries] of keyPool) {
  const freshCount = entries.filter((e) => e.live >= CHECK_FLOOR_FROM).length;
  if (entries.length > KEY_CEILING) {
    const msg = `key path "${key}" reused on ${entries.length} boards (ceiling ${KEY_CEILING}): ${entries.map((e) => e.id).join(', ')}`;
    if (freshCount > 0) { fail('check pool', msg); staleFound = true; }
    else note('check pool', `grandfathered: ${msg}`);
  }
}
if (!staleFound && BAD === 0) ok('check pool', `${PUZZLES.length} boards, ${keyPool.size} distinct key paths, no key over the ${KEY_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Check boards verified.');
process.exit(BAD ? 1 : 0);
