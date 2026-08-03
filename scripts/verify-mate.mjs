// Verify the Mate (daily chess mate-in-N) bank. Mate's own header comment
// (app/mate/puzzles.js) and its client's rules copy (MateClient.jsx) promise,
// per puzzle:
//   - White to move, forced checkmate in EXACTLY `mateIn` moves (weekdays
//     mate in 2, Sundays a mate-in-3 Edition), never fewer;
//   - EXACTLY ONE first move forces it ("verified twice, by two independent
//     solvers");
//   - the three structural guarantees the game's own tiny engine
//     (app/mate/chess.js) relies on to skip castling/en passant/promotion:
//     castling rights always '-', no pawn on rank 2/7 (its home rank, so no
//     two-square push, so no en passant), no pawn on rank 7/2 either given
//     a <=3-move solution (so no promotion).
// None of that was previously machine-checked, and the game's own chess.js
// gives every primitive needed (legal move generation, checkmate detection,
// SAN) to recompute it independently rather than trust the stored tree.
//
//   1. FEN structural: side to move is 'w'; castling and en passant fields
//      are '-'; no pawn ('P'/'p') stands on rank 1, 2, 7, or 8; exactly one
//      white king and one black king are on the board.
//   2. Full independent mate-in-N search (ignoring the puzzle's own stored
//      `solution` tree entirely): among White's legal first moves, EXACTLY
//      ONE forces checkmate within `mateIn` White moves against every Black
//      defense, and it must be `solution.key`. AND no White move forces mate
//      within `mateIn - 1` moves at all (rules out "mate in fewer", the
//      "never fewer" promise) -- both proven by the same recursive
//      forced-mate search, memoized on (board, side, moves-left).
//   3. `keySan` matches chess.js's own toSan() for the key move (catches a
//      stale/typo'd display string independent of the move being correct).
//   4. `sunday` implies mateIn===3, non-Sunday implies mateIn===2; `sunday`
//      must also match the real day-of-week of `live`.
//   5. num/quizId/live/dateLabel are mutually consistent and sequential.
//   6. No duplicate boards (identical FEN).
//   7. Pool variety: `motif` is reader-facing flavor text revealed after the
//      solve. The SAME exact motif string is not allowed to repeat more than
//      MOTIF_CEILING times across the whole bank (the shipped bank currently
//      reuses one motif string 4 times, which is exactly the kind of
//      copy-paste this check exists to catch), enforced hard for boards live
//      on or after MATE_FLOOR_FROM and grandfathered as a note before that.
//   8. US spelling: `motif` strings are scanned for obvious British word
//      forms.
//
// Run: node scripts/verify-mate.mjs
import { PUZZLES } from '../app/mate/puzzles.js';
import { parseFen, legalMoves, applyMove, isCheckmate, uci, toSan, WHITE, BLACK } from '../app/mate/chess.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const MATE_FLOOR_FROM = '2026-08-03';
const MOTIF_CEILING = 2; // an exact motif string may repeat at most this many times

// ─── independent forced-mate search (memoized) ─────────────────────────────
function boardKey(board) { return board.map((x) => x || '.').join(''); }

function makeSolver() {
  const memo = new Map();
  // Does `color` (to move) have a move forcing checkmate within `n` of its
  // own moves, against every reply?
  function forcesMateWithin(board, color, n) {
    if (n <= 0) return false;
    const key = boardKey(board) + '|' + color + '|' + n;
    if (memo.has(key)) return memo.get(key);
    const opp = color === WHITE ? BLACK : WHITE;
    let result = false;
    for (const mv of legalMoves(board, color)) {
      const next = applyMove(board, mv.from, mv.to);
      if (isCheckmate(next, opp)) { result = true; break; }
      if (n === 1) continue;
      const oppMoves = legalMoves(next, opp);
      if (oppMoves.length === 0) continue; // stalemate-ish dead end, not a mate
      let allForced = true;
      for (const omv of oppMoves) {
        const next2 = applyMove(next, omv.from, omv.to);
        if (!forcesMateWithin(next2, color, n - 1)) { allForced = false; break; }
      }
      if (allForced) { result = true; break; }
    }
    memo.set(key, result);
    return result;
  }
  // Which of `color`'s legal first moves individually force mate within n.
  function forcingFirstMoves(board, color, n) {
    const opp = color === WHITE ? BLACK : WHITE;
    const out = [];
    for (const mv of legalMoves(board, color)) {
      const next = applyMove(board, mv.from, mv.to);
      if (isCheckmate(next, opp)) { out.push(mv); continue; }
      if (n === 1) continue;
      const oppMoves = legalMoves(next, opp);
      if (oppMoves.length === 0) continue;
      let allForced = true;
      for (const omv of oppMoves) {
        const next2 = applyMove(next, omv.from, omv.to);
        if (!forcesMateWithin(next2, color, n - 1)) { allForced = false; break; }
      }
      if (allForced) out.push(mv);
    }
    return out;
  }
  return { forcesMateWithin, forcingFirstMoves };
}

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenFens = new Map();
const motifPool = new Map();
PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^mate-(\d+)-(\d+)-(\d+)$/);
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
  const wantMateIn = p.sunday ? 3 : 2;
  if (p.mateIn !== wantMateIn) errs.push(`mateIn ${p.mateIn} != ${wantMateIn} for ${p.sunday ? 'Sunday' : 'weekday'}`);

  // FEN structural guarantees the game's engine depends on.
  const parts = String(p.fen).trim().split(/\s+/);
  if (parts[1] !== 'w') errs.push(`side to move is "${parts[1]}", must be White`);
  if (parts[2] !== '-') errs.push(`castling rights "${parts[2]}" must be "-"`);
  if (parts[3] !== '-') errs.push(`en passant "${parts[3]}" must be "-"`);
  let board = null, turn = null;
  try { ({ board, turn } = parseFen(p.fen)); } catch (e) { errs.push(`FEN failed to parse: ${e.message || e}`); }
  if (board) {
    for (let sq = 0; sq < 64; sq++) {
      const piece = board[sq];
      if (piece && piece.toUpperCase() === 'P') {
        const rank = 8 - (sq >> 3);
        if (rank === 1 || rank === 2 || rank === 7 || rank === 8) errs.push(`pawn on rank ${rank} (violates the no-castling/no-ep/no-promotion guarantee)`);
      }
    }
    const wKings = board.filter((p2) => p2 === 'K').length, bKings = board.filter((p2) => p2 === 'k').length;
    if (wKings !== 1) errs.push(`${wKings} white kings on board, want 1`);
    if (bKings !== 1) errs.push(`${bKings} black kings on board, want 1`);
  }

  let solveNote = '';
  if (!errs.length) {
    const { forcesMateWithin, forcingFirstMoves } = makeSolver();
    const fasterMateExists = p.mateIn > 1 ? forcesMateWithin(board, turn, p.mateIn - 1) : false;
    if (fasterMateExists) errs.push(`a forced mate in fewer than ${p.mateIn} moves exists (violates "never fewer")`);
    const forcing = forcingFirstMoves(board, turn, p.mateIn);
    if (forcing.length === 0) errs.push(`NO first move forces mate in ${p.mateIn} -- the position is not solved by its own stated mateIn`);
    else if (forcing.length > 1) errs.push(`NOT UNIQUE: ${forcing.length} different first moves force mate in ${p.mateIn} (${forcing.map((mv) => uci(mv.from, mv.to)).join(', ')})`);
    else {
      const foundKey = uci(forcing[0].from, forcing[0].to);
      if (foundKey !== p.solution?.key) errs.push(`the unique forcing move is ${foundKey}, but solution.key is "${p.solution?.key}"`);
      const san = toSan(board, forcing[0].from, forcing[0].to);
      if (san !== p.keySan) errs.push(`toSan(key) = "${san}" != stored keySan "${p.keySan}"`);
      solveNote = `, unique key ${foundKey} confirmed by independent search`;
    }
  }

  if (!p.motif) errs.push('missing motif'); else scanBritish(p.quizId, 'motif', p.motif);
  if (p.fen) { const key = p.fen.split(/\s+/)[0]; seenFens.set(key, (seenFens.get(key) || []).concat(p.quizId)); }
  if (p.motif) {
    const arr = motifPool.get(p.motif) || [];
    arr.push({ id: p.quizId, live: p.live });
    motifPool.set(p.motif, arr);
  }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `mate in ${p.mateIn}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenFens) {
  if (ids.length > 1) fail('mate pool', `identical starting position shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// ─── motif pool variety ────────────────────────────────────────────────────
let staleFound = false;
for (const [motif, entries] of motifPool) {
  const freshCount = entries.filter((e) => e.live >= MATE_FLOOR_FROM).length;
  if (entries.length > MOTIF_CEILING) {
    const msg = `motif reused on ${entries.length} boards (ceiling ${MOTIF_CEILING}): ${entries.map((e) => e.id).join(', ')} -- "${motif}"`;
    if (freshCount > 0) { fail('mate pool', msg); staleFound = true; }
    else note('mate pool', `grandfathered: ${msg}`);
  }
}
if (!staleFound && BAD === 0) ok('mate pool', `${PUZZLES.length} boards, ${motifPool.size} distinct motifs, no motif over the ${MOTIF_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Mate boards verified.');
process.exit(BAD ? 1 : 0);
