// Verify the Turn (daily Othello endgame) bank.
//
// Turn's own header comment (app/turn/puzzles.js) and its client's rules copy
// (TurnClient.jsx) promise, per board:
//
//   - a REAL, REACHABLE position with YOU to move and the game already won;
//   - EXACTLY ONE square still wins it, and every other legal square ends level
//     or behind;
//   - both temptations are live: the square that flips the most and the square
//     that flips the fewest are two DIFFERENT squares;
//   - `shape` says where the key sits on that scale, and it rotates through the
//     bank so no flip count is ever a proxy for the answer;
//   - weekdays have 10 empty squares, Sundays 12;
//   - `margin` is the disc margin you end up winning by with best play.
//
// Nothing here is read off a stored field and printed back. Every number is
// recomputed from the position with app/turn/othello.js, the exact engine the
// browser runs, the reachability claim is PROVED by replaying the stored game
// rather than assumed, and the solver itself is cross-checked against an
// INDEPENDENT reference search that shares none of its optimisations.
//
//   1. Structural: `board` is 64 chars of 0/1/2, the empty count matches
//      `empties` and the weekday/Sunday rule, `key` names an empty square, and
//      you have at least MIN_MOVES legal squares.
//   2. Reachability, proved: `history` is replayed from the standard opening
//      four with `opener` moving first, applying the real pass rule. Every move
//      must be legal for whoever is on move at that point, the result must
//      reproduce `board` byte for byte, and it must leave YOU to move.
//   3. Independent solve of every legal square with a FULL window (the
//      generator used a narrow one, so this is a different question asked a
//      different way): exactly one square ends above zero, it is `key`, and its
//      margin is `margin`. Squares that end exactly level are counted and
//      reported, because a level board is not a win.
//   4. Solver cross-check on a sample: every root move re-scored by a reference
//      negamax with NO transposition table and NO move ordering. A disagreement
//      means the table or the ordering is unsound, which is where the bugs in a
//      search live.
//   5. Full playout from the key with both sides playing the shipping engine:
//      the game really ends at `margin`. This catches a sign or turn-order
//      error, and in particular a mishandled pass, that a root-only check would
//      sail straight past.
//   6. Shape recomputed and the ROTATION checked across the bank: quiet, greedy
//      and middle days all appear in a band, and every Sunday is a quiet day. A
//      bank whose answer is always the fewest-flip square teaches a reflex
//      instead of a read, which is the pool-variety failure the authoring
//      standard is about, and in Othello "flip the fewest" is exactly the reflex
//      a player already arrives with.
//   7. Solve budget, measured on the paths the BROWSER actually runs, not on a
//      proxy for them. The client asks two questions per move: `outlook()`, one
//      full-window value search, and `engineMove`, which scores every reply. Both
//      are timed per board against CLIENT_CAP_MS. The verifier's own exhaustive
//      root scoring is strictly more work than either and is capped separately at
//      SOLVE_CAP_MS, so a board that passes here cannot stall a phone.
//   8. num/quizId/live/dateLabel mutually consistent and sequential, `sunday`
//      matching the real day of the week, no duplicate boards.
//  10. --deep (opt-in, minutes not seconds): for EVERY board, play EVERY wrong
//      first square and let the shipping game object play the rest out with both
//      sides perfect, asserting the board really is lost. Check 3 proves this
//      through the solver; --deep proves it again through makeGame, which is the
//      code the player actually meets, so a mishandled pass or turn hand-off
//      cannot hide behind a correct search. Run it whenever the bank or the
//      engine changes; it is left out of the default run so verify-all stays
//      quick.
//
//   9. Pool variety on `motif`, plus a corner-variety check (when a corner is on
//      offer it must sometimes be the answer and sometimes be the trap) and a
//      US-spelling scan.
//
// Run: node scripts/verify-turn.mjs
import { PUZZLES } from '../app/turn/puzzles.js';
import {
  parseBoard, boardString, startBoard, legalMoves, flipsAt, applyMove, undoMove,
  hasMove, discs, makeSolver, makeGame, engineMove, other, YOU, FOE, CORNERS, SQ_NAME,
} from '../app/turn/othello.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const TURN_FLOOR_FROM = '2026-08-05';
const MOTIF_CEILING = 4;        // an exact motif string may repeat at most this often
const SOLVE_CAP_MS = 400;       // this file's exhaustive root scoring
const CLIENT_CAP_MS = 200;      // what the browser itself runs, per move
const MIN_MOVES = 4;
const WEEKDAY_EMPTIES = 10;
const SUNDAY_EMPTIES = 12;
const XCHECK_BOARDS = 4;        // boards to re-score with the reference search

const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ── an INDEPENDENT reference search ────────────────────────────────────────
// Alpha-beta only. No transposition table, no move ordering, no null windows,
// its own terminal test. It shares nothing with the shipping solver except the
// rules, so agreement between the two is real evidence rather than a tautology.
function refValue(b, me, passed = false, alpha = -99, beta = 99) {
  const moves = legalMoves(b, me);
  if (!moves.length) {
    if (passed) { const d = discs(b); return me === YOU ? d.mine - d.theirs : d.theirs - d.mine; }
    return -refValue(b, other(me), true, -beta, -alpha);
  }
  let best = -99;
  for (const m of moves) {
    applyMove(b, m.sq, me, m.flips);
    const v = -refValue(b, other(me), false, -beta, -alpha);
    undoMove(b, m.sq, me, m.flips);
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

// ── replay the stored game, and prove it produces exactly this board ───────
function replay(p) {
  const b = startBoard(p.opener);
  let me = p.opener;                       // black moves first, whichever label that is
  let passed = false;
  for (const sq of p.history) {
    if (!Number.isInteger(sq) || sq < 0 || sq > 63) return `history contains square ${sq}, outside 0..63`;
    // Resolve any pass before this move, exactly as the rules require.
    if (!hasMove(b, me)) {
      if (passed) return `history continues after both sides were stuck, at ${SQ_NAME(sq)}`;
      passed = true; me = other(me);
      if (!hasMove(b, me)) return `history continues from a finished game, at ${SQ_NAME(sq)}`;
    }
    passed = false;
    const flips = flipsAt(b, sq, me);
    if (!flips.length) return `history move ${SQ_NAME(sq)} is not legal for label ${me} at that point`;
    applyMove(b, sq, me, flips);
    me = other(me);
  }
  // And the pass, if any, that hands the move to you.
  if (!hasMove(b, me) && hasMove(b, other(me))) me = other(me);
  if (me !== YOU) return 'the replayed game does not leave YOU to move';
  const got = boardString(b);
  if (got !== p.board) return `the replayed game produces a different board\n      replay ${got}\n      stored ${p.board}`;
  return null;
}

// ── play it out from the key, both sides perfect ───────────────────────────
// Both sides use the same perfect engine, so this measures the line the puzzle
// actually promises rather than a line the verifier invented.
function playOut(p) {
  const st = makeGame(p);
  if (!st.play(p.key)) return { err: `key square ${SQ_NAME(p.key)} is not a legal move` };
  let guard = 0;
  while (!st.over) {
    if (++guard > 80) return { err: 'playout did not terminate' };
    const mv = engineMove(st, p.quizId);
    if (!mv) return { err: 'engineMove returned nothing on a live board' };
    st.play(mv.sq);
  }
  const s = st.score;
  return { margin: s.mine - s.theirs, mine: s.mine, theirs: s.theirs, empty: s.empty };
}

const DEEP = process.argv.includes('--deep');

// Play a chosen first square, then let both sides play perfectly to the end.
function playFrom(p, sq) {
  const st = makeGame(p);
  if (!st.play(sq)) return { err: `${SQ_NAME(sq)} is not legal` };
  let guard = 0;
  while (!st.over) {
    if (++guard > 80) return { err: 'playout did not terminate' };
    const mv = engineMove(st, p.quizId);
    if (!mv) return { err: 'no move on a live board' };
    st.play(mv.sq);
  }
  const s = st.score;
  return { margin: s.mine - s.theirs };
}

const seenBoards = new Map();
const motifPool = new Map();
const shapes = [];
const cornerCases = [];
let worstSolve = 0;
let worstClient = 0;
let xchecked = 0;

PUZZLES.forEach((p, i) => {
  const errs = [];

  // -- 8. identity --
  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = String(p.quizId).match(/^turn-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantLabel && p.dateLabel !== wantLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantLabel}"`);
  const isSun = p.live ? new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0 : null;
  if (isSun !== null && !!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live}`);

  // -- 1. structural --
  let b = null;
  try { b = parseBoard(p.board); } catch (e) { errs.push(e.message); }
  let moves = [];
  if (b) {
    const d = discs(b);
    const wantEmpty = p.sunday ? SUNDAY_EMPTIES : WEEKDAY_EMPTIES;
    if (d.empty !== wantEmpty) errs.push(`${d.empty} empty squares, expected ${wantEmpty} for a ${p.sunday ? 'Sunday' : 'weekday'}`);
    if (d.empty !== p.empties) errs.push(`recomputed empties ${d.empty} != stored ${p.empties}`);
    if (!Number.isInteger(p.key) || p.key < 0 || p.key > 63) errs.push(`key ${p.key} is not a square`);
    else if (b[p.key] !== 0) errs.push(`key square ${SQ_NAME(p.key)} is not empty`);
    moves = legalMoves(b, YOU);
    if (moves.length < MIN_MOVES) errs.push(`only ${moves.length} legal squares, the rules promise at least ${MIN_MOVES}`);
  }

  // -- 2. reachability, proved by replay --
  if (!errs.length) {
    if (!Array.isArray(p.history) || !p.history.length) errs.push('missing history');
    else if (p.opener !== YOU && p.opener !== FOE) errs.push(`opener must be 1 or 2, got ${p.opener}`);
    else {
      const placed = 64 - p.empties - 4;               // the opening four are not moves
      if (p.history.length !== placed) errs.push(`history has ${p.history.length} moves but ${placed} discs were placed`);
      else { const bad = replay(p); if (bad) errs.push(bad); }
    }
  }

  // -- 3/6/7. independent full-window solve of the root --
  let solveNote = '', shape = null, openCorners = [];
  if (!errs.length) {
    const solver = makeSolver();
    const t0 = process.hrtime.bigint();
    const scored = solver.scoreMoves(b, YOU);
    const solveMs = Number(process.hrtime.bigint() - t0) / 1e6;
    if (solveMs > worstSolve) worstSolve = solveMs;
    if (solveMs > SOLVE_CAP_MS) errs.push(`root solve took ${solveMs.toFixed(0)}ms, over the ${SOLVE_CAP_MS}ms cap`);

    const winners = scored.filter((s) => s.score > 0);
    const level = scored.filter((s) => s.score === 0);
    if (winners.length !== 1) {
      errs.push(`NOT UNIQUE: ${winners.length} squares still win (${winners.map((w) => SQ_NAME(w.sq)).join(', ')})`);
    } else {
      const key = winners[0];
      if (key.sq !== p.key) errs.push(`the only winning square is ${SQ_NAME(key.sq)}, but key is ${SQ_NAME(p.key)}`);
      if (key.score !== p.margin) errs.push(`recomputed margin ${key.score} != stored margin ${p.margin}`);

      // both temptations live, and the shape recomputed
      const counts = scored.map((s) => s.flips);
      const maxFlip = Math.max(...counts), minFlip = Math.min(...counts);
      const greedy = scored.filter((s) => s.flips === maxFlip);
      const quiet = scored.filter((s) => s.flips === minFlip);
      if (maxFlip === minFlip) errs.push('every legal square flips the same number of discs, so there is no temptation to resist');
      if (greedy.length !== 1) errs.push(`${greedy.length} squares tie for the biggest flip, so "the greedy square" is not one square`);
      if (quiet.length !== 1) errs.push(`${quiet.length} squares tie for the smallest flip, so "the quiet square" is not one square`);
      if (greedy.length === 1 && quiet.length === 1) {
        shape = key.sq === greedy[0].sq ? 'greedy' : key.sq === quiet[0].sq ? 'quiet' : 'middle';
        if (shape !== p.shape) errs.push(`recomputed shape "${shape}" != stored "${p.shape}"`);
        if (p.sunday && shape !== 'quiet') errs.push(`Sunday boards are quiet days, this one is "${shape}"`);
      }
      openCorners = CORNERS.filter((c) => scored.some((s) => s.sq === c));

      // -- 4. cross-check the solver against the reference search --
      if (i < XCHECK_BOARDS) {
        for (const s of scored) {
          const flips = flipsAt(b, s.sq, YOU);
          applyMove(b, s.sq, YOU, flips);
          const rv = -refValue(b, FOE);
          undoMove(b, s.sq, YOU, flips);
          xchecked++;
          if (rv !== s.score) errs.push(`solver/reference disagree on ${SQ_NAME(s.sq)}: ${s.score} vs ${rv}`);
        }
      }

      // -- 7. the two searches the CLIENT actually runs, timed cold --
      {
        const live = makeGame(p);
        let t = process.hrtime.bigint();
        live.outlook();
        const outlookMs = Number(process.hrtime.bigint() - t) / 1e6;
        live.play(p.key);
        t = process.hrtime.bigint();
        engineMove(live, p.quizId);
        const replyMs = Number(process.hrtime.bigint() - t) / 1e6;
        if (outlookMs > worstClient) worstClient = outlookMs;
        if (replyMs > worstClient) worstClient = replyMs;
        if (outlookMs > CLIENT_CAP_MS) errs.push(`the client's outlook search took ${outlookMs.toFixed(0)}ms, over the ${CLIENT_CAP_MS}ms cap`);
        if (replyMs > CLIENT_CAP_MS) errs.push(`the engine's first reply took ${replyMs.toFixed(0)}ms, over the ${CLIENT_CAP_MS}ms cap`);
      }

      // -- 5. full playout --
      const out = playOut(p);
      if (out.err) errs.push(out.err);
      else if (out.margin !== p.margin) errs.push(`playing it out ends ${out.mine}-${out.theirs} (margin ${out.margin}), not the stated ${p.margin}`);
      else solveNote = `, ${scored.length} legal, ${level.length} level, plays out to ${out.mine}-${out.theirs}${out.empty ? ` with ${out.empty} empty` : ''} (${solveMs.toFixed(0)}ms)`;

      // -- 10. every wrong first square, played out through the game object --
      if (DEEP) {
        let deep = 0;
        for (const s2 of scored) {
          if (s2.sq === p.key) continue;
          const r = playFrom(p, s2.sq);
          if (r.err) { errs.push(`deep: ${r.err}`); break; }
          if (r.margin > 0) { errs.push(`deep: ${SQ_NAME(s2.sq)} still wins by ${r.margin} when played out, so the key is not unique`); break; }
          deep++;
        }
        solveNote += `, ${deep} wrong squares played out and lost`;
      }
    }
  }

  if (!p.motif) errs.push('missing motif'); else scanBritish(p.quizId, 'motif', p.motif);
  if (p.board) seenBoards.set(p.board, (seenBoards.get(p.board) || []).concat(p.quizId));
  if (p.motif) motifPool.set(p.motif, (motifPool.get(p.motif) || []).concat({ id: p.quizId, live: p.live }));
  if (shape) shapes.push(shape);
  if (openCorners.length) cornerCases.push(openCorners.includes(p.key) ? 'key' : 'trap');

  errs.length
    ? fail(p.quizId, errs.join('; '))
    : ok(p.quizId, `${p.empties} empty, key ${SQ_NAME(p.key)} (${p.shape}), wins by ${p.margin}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenBoards) {
  if (ids.length > 1) fail('turn pool', `identical board shipped on ${ids.length} days: ${ids.join(', ')}`);
}

// -- 9. motif pool variety --
let staleFound = false;
for (const [motif, entries] of motifPool) {
  if (entries.length > MOTIF_CEILING) {
    const fresh = entries.filter((e) => e.live >= TURN_FLOOR_FROM).length;
    const msg = `motif reused on ${entries.length} boards (ceiling ${MOTIF_CEILING}): ${entries.map((e) => e.id).join(', ')} -- "${motif}"`;
    if (fresh > 0) { fail('turn pool', msg); staleFound = true; }
    else note('turn pool', `grandfathered: ${msg}`);
  }
}

// -- 6. the rotation has to produce a genuine mix, not just satisfy a formula --
const nQuiet = shapes.filter((s) => s === 'quiet').length;
const nGreedy = shapes.filter((s) => s === 'greedy').length;
const nMiddle = shapes.filter((s) => s === 'middle').length;
const total = shapes.length || 1;
if (nQuiet / total > 0.55) fail('turn pool', `the quiet square is the answer on ${(nQuiet / total * 100).toFixed(0)}% of boards, which trains the reflex the game is meant to test`);
if (nGreedy / total < 0.18) fail('turn pool', `only ${(nGreedy / total * 100).toFixed(0)}% of boards reward the biggest flip; the bank needs at least 18% or "flip the fewest" always works`);
if (nMiddle / total < 0.15) fail('turn pool', `only ${(nMiddle / total * 100).toFixed(0)}% of boards answer with neither extreme`);

// -- corners: sometimes the answer, sometimes the trap --
const cKey = cornerCases.filter((c) => c === 'key').length;
const cTrap = cornerCases.length - cKey;
if (cornerCases.length >= 6 && (cKey === 0 || cTrap === 0)) {
  fail('turn pool', `a corner is on offer on ${cornerCases.length} boards and is ${cKey ? 'ALWAYS the answer' : 'NEVER the answer'}, which teaches a reflex about corners`);
}

if (!staleFound && BAD === 0) {
  ok('turn pool', `${PUZZLES.length} boards, ${motifPool.size} distinct motifs, ${nQuiet} quiet / ${nGreedy} greedy / ${nMiddle} middle, corner on offer ${cornerCases.length} times (${cKey} answer, ${cTrap} trap), ${xchecked} move scores cross-checked against the reference search, worst root solve ${worstSolve.toFixed(0)}ms, worst search the browser runs ${worstClient.toFixed(0)}ms`);
}

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Turn boards verified.');
process.exit(BAD ? 1 : 0);
