// Verify that Mate and Defend always REACH A CONCLUSION.
//
// Until 2026-08-11 both games ended the round on the move that lost it, so
// there was nothing to play out and nothing to prove. They play on now (see
// "NOTHING TELLS YOU THE ROUND IS LOST WHILE YOU CAN STILL PLAY" in CLAUDE.md),
// which introduces the one failure mode that can strand a player forever: a
// position the engine cannot finish, leaving the board waiting for a reply that
// never comes. That is not an eyeball check, so this walks it.
//
//   1. MATE, play-out. From EVERY legal White first move that is not the bank's
//      key, on every board, Black defends with the client's own
//      stubbornestDefence and the round is walked to its end. Every run must
//      conclude, every Black reply must be legal, and the loss must land when
//      White's mateIn budget is spent.
//   2. DEFEND, play-out. From EVERY legal Black first move that is not the key
//      (all of which are doomed by construction, which the bank already
//      proves), White must actually deliver checkmate inside holdFor, against a
//      player that squirms as long as it can. A run that ends any other way is
//      a failure: it would mean White was promised a mate it cannot collect.
//   3. THE WINNING PATH IS UNTOUCHED. Both banks are replayed the way a player
//      who finds the key plays them, through the patched decision order, and
//      must still end 'won' with zero misses at full depth.
//
// Both searches are LIFTED OUT OF THE CLIENTS rather than retyped, so this
// cannot drift from the code it certifies: a rename or a logic change in
// MateClient/DefendClient either moves this file's result or fails its slice.
//
// Run: node scripts/verify-endgame-playout.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { PUZZLES as MATE_PUZZLES } from '../app/mate/puzzles.js';
import { PUZZLES as DEFEND_PUZZLES } from '../app/defend/puzzles.js';
import { parseFen, applyMove, legalMoves, parseUci, isCheckmate, inCheck } from '../app/mate/chess.js';
import { makeMateSearch, stubbornestReply } from '../app/defend/defense.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);

// ─── lift the two searches out of the clients ──────────────────────────────
function slice(src, sig, where) {
  const a = src.indexOf(sig);
  if (a < 0) { fail(where, `could not find "${sig.slice(0, 40)}..." in the client`); return null; }
  let d = 0, b = -1;
  for (let i = src.indexOf('{', a); i < src.length; i++) {
    if (src[i] === '{') d++;
    else if (src[i] === '}') { d--; if (!d) { b = i + 1; break; } }
  }
  return src.slice(a, b);
}
const mateSrc = readFileSync(join(root, 'app/mate/MateClient.jsx'), 'utf8');
const defSrc = readFileSync(join(root, 'app/defend/DefendClient.jsx'), 'utf8');
const defenceSrc = slice(mateSrc, 'function stubbornestDefence(board, budget) {', 'lift');
const matingSrc = slice(defSrc, 'function firstMatingMove(search, board, budget) {', 'lift');
if (!defenceSrc || !matingSrc) { console.log(`\n${BAD} FAILURE(S)`); process.exit(1); }
const stubbornestDefence = new Function('legalMoves', 'applyMove', 'makeMateSearch',
  `${defenceSrc}; return stubbornestDefence;`)(legalMoves, applyMove, makeMateSearch);
const firstMatingMove = new Function('legalMoves', 'applyMove', 'isCheckmate',
  `${matingSrc}; return firstMatingMove;`)(legalMoves, applyMove, isCheckmate);

// ─── 1. Mate plays out ─────────────────────────────────────────────────────
let runs = 0, duals = 0, deepest = 0;
for (const p of MATE_PUZZLES) {
  const root0 = parseFen(p.fen).board;
  for (const first of legalMoves(root0, 'w')) {
    if (first.uci === p.solution.key) continue;
    let board = applyMove(root0, first.from, first.to);
    let moves = [first.uci], done = null;
    if (isCheckmate(board, 'b')) { duals++; continue; }   // a dual mate is a WIN now
    for (let guard = 0; guard < 40 && !done; guard++) {
      if (Math.ceil(moves.length / 2) >= p.mateIn) { done = 'lost'; break; }
      const def = stubbornestDefence(board, Math.max(1, p.mateIn - Math.ceil(moves.length / 2)));
      if (!def) { done = 'stalemate'; break; }            // also a conclusion, scored as a loss
      if (!legalMoves(board, 'b').some((m) => m.uci === def.uci)) {
        fail('mate play-out', `${p.quizId}: illegal black reply ${def.uci} after ${moves.join(' ')}`);
        done = 'bad'; break;
      }
      const b1 = parseUci(def.uci);
      board = applyMove(board, b1.from, b1.to);
      moves.push(def.uci);
      const wm = legalMoves(board, 'w');
      if (!wm.length) { done = 'lost'; break; }
      // The player tries hardest to still mate.
      const mating = wm.find((m) => isCheckmate(applyMove(board, m.from, m.to), 'b'));
      const pick = mating || wm[0];
      board = applyMove(board, pick.from, pick.to);
      moves.push(pick.uci);
      if (mating) done = 'won';
    }
    if (!done) fail('mate play-out', `${p.quizId}: run from ${first.uci} never concluded`);
    deepest = Math.max(deepest, moves.length);
    runs++;
  }
}
if (!BAD) ok('mate play-out', `${runs} off-key runs on ${MATE_PUZZLES.length} boards all conclude, deepest ${deepest} ply, ${duals} immediate duals now win`);

// ─── 2. Defend collects the mate ───────────────────────────────────────────
const before2 = BAD;
let dRuns = 0, dMated = 0, dDeep = 0;
for (const p of DEFEND_PUZZLES) {
  const HOLD = p.holdFor;
  const root0 = parseFen(p.fen).board;
  for (const first of legalMoves(root0, 'b')) {
    if (first.uci === p.key) continue;
    let board = applyMove(root0, first.from, first.to);
    let moves = [first.uci], done = null;
    for (let guard = 0; guard < 40 && !done; guard++) {
      const budget = Math.max(1, HOLD - Math.floor(moves.length / 2));
      const search = makeMateSearch();
      let mv = firstMatingMove(search, board, budget);
      if (!mv) { const alt = stubbornestReply(board, budget, search); mv = alt ? alt.uci : null; }
      if (!mv) { fail('defend play-out', `${p.quizId}: white had no reply after ${moves.join(' ')}`); done = 'bad'; break; }
      if (!legalMoves(board, 'w').some((m) => m.uci === mv)) {
        fail('defend play-out', `${p.quizId}: illegal white reply ${mv}`); done = 'bad'; break;
      }
      const w = parseUci(mv);
      board = applyMove(board, w.from, w.to);
      moves.push(mv);
      if (!legalMoves(board, 'b').length) { done = inCheck(board, 'b') ? 'mated' : 'stalemate'; break; }
      const def = stubbornestDefence(board, Math.max(1, HOLD - Math.floor(moves.length / 2)));
      const b1 = parseUci(def.uci);
      board = applyMove(board, b1.from, b1.to);
      moves.push(def.uci);
    }
    if (done === 'mated') { dMated++; dDeep = Math.max(dDeep, Math.ceil(moves.length / 2)); }
    else if (done !== 'bad') fail('defend play-out', `${p.quizId}: losing move ${first.uci} ended '${done}' after ${moves.length} ply, so the mate was never collected`);
    dRuns++;
  }
}
if (BAD === before2) ok('defend play-out', `all ${dRuns} losing first moves on ${DEFEND_PUZZLES.length} boards play out to a real checkmate, deepest took ${dDeep} white moves`);

// ─── 3. the winning path is untouched ──────────────────────────────────────
const before3 = BAD;
const treeHelpers = new Function(`
  ${slice(mateSrc, 'function nodeAfter(solution, moves) {', 'lift')}
  ${slice(mateSrc, 'function mateDistance(node) {', 'lift')}
  ${slice(mateSrc, 'function pickReply(node, quizId) {', 'lift')}
  return { nodeAfter, pickReply };
`)();
const { nodeAfter, pickReply } = treeHelpers;

for (const p of MATE_PUZZLES) {
  let board = parseFen(p.fen).board;
  let moves = [], status = null;
  for (let guard = 0; guard < 20 && !status; guard++) {
    const n = nodeAfter(p.solution, moves);
    const want = n ? (n.key || n.move || n.mate || null) : null;
    if (!want) { fail('mate key line', `${p.quizId}: solution tree ran out at ply ${moves.length}`); break; }
    const { from, to } = parseUci(want);
    const next = applyMove(board, from, to);
    const nextMoves = [...moves, want];
    if (isCheckmate(next, 'b') || (n && n.mate)) { status = 'won'; moves = nextMoves; break; }
    if (Math.ceil(nextMoves.length / 2) >= p.mateIn) { status = 'lost'; moves = nextMoves; break; }
    board = next; moves = nextMoves;
    const nn = nodeAfter(p.solution, moves);
    const rep = nn && nn.lines ? pickReply(nn, p.quizId) : null;
    if (!rep) { fail('mate key line', `${p.quizId}: no scripted reply after ${moves.join(' ')}`); break; }
    const r = parseUci(rep);
    board = applyMove(board, r.from, r.to);
    moves.push(rep);
  }
  if (status !== 'won') fail('mate key line', `${p.quizId}: the key line ended '${status}'`);
  if (Math.ceil(moves.length / 2) !== p.mateIn) fail('mate key line', `${p.quizId}: key line took ${Math.ceil(moves.length / 2)} white moves, expected ${p.mateIn}`);
}

for (const p of DEFEND_PUZZLES) {
  const HOLD = p.holdFor;
  let board = parseFen(p.fen).board;
  let moves = [], doomedAt = null, status = null;
  for (let decision = 0; decision < HOLD + 2 && !status; decision++) {
    const budget = HOLD - decision;
    let mv;
    if (decision === 0) mv = p.key;
    else {
      const s = makeMateSearch();
      const found = legalMoves(board, 'b').find((m) => !s.forcesMateWithin(applyMove(board, m.from, m.to), 'w', budget));
      if (!found) { fail('defend key line', `${p.quizId}: no saving move left at decision ${decision}`); break; }
      mv = found.uci;
    }
    const { from, to } = parseUci(mv);
    const next = applyMove(board, from, to);
    const survives = decision === 0 ? mv === p.key : !makeMateSearch().forcesMateWithin(next, 'w', budget);
    board = next; moves.push(mv);
    if (!legalMoves(board, 'w').length) { status = 'won'; break; }
    if (!survives && doomedAt == null) doomedAt = decision;
    if (doomedAt == null && decision + 1 >= HOLD) { status = 'won'; break; }
    let wmv = null;
    if (doomedAt == null && moves.length === 1 && p.reply) {
      const q = parseUci(p.reply);
      if (legalMoves(board, 'w').some((m) => m.from === q.from && m.to === q.to)) wmv = p.reply;
    }
    if (!wmv) {
      const alt = stubbornestReply(board, Math.max(1, HOLD - Math.floor(moves.length / 2)), makeMateSearch());
      wmv = alt ? alt.uci : null;
    }
    if (!wmv) { fail('defend key line', `${p.quizId}: white had no reply on the key line`); break; }
    const w = parseUci(wmv);
    board = applyMove(board, w.from, w.to);
    moves.push(wmv);
    if (!legalMoves(board, 'b').length) { status = inCheck(board, 'b') ? 'lost' : 'won'; break; }
  }
  if (status !== 'won') fail('defend key line', `${p.quizId}: the save ended '${status}'`);
  if (doomedAt !== null) fail('defend key line', `${p.quizId}: the save was scored as a blunder`);
}
if (BAD === before3) ok('winning paths', `${MATE_PUZZLES.length} mate lines and ${DEFEND_PUZZLES.length} saves still solve clean, unchanged by the play-out`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nEnd Game play-out verified.');
process.exit(BAD ? 1 : 0);
