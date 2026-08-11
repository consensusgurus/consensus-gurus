// Generate candidate boards for Defend, the daily chess save.
//
// THE SHAPE IT SEARCHES FOR. Black to move, Black NOT in check, and White
// already threatening mate. Every legal black move loses to a forced mate
// within `holdFor` white moves EXCEPT ONE. That one move is the puzzle.
//
// Not in check is deliberate. A defender in check has three or four legal
// moves and the puzzle solves itself by elimination; the whole point here is a
// wide board where a dozen moves look playable and one of them is not a
// disaster. The floor is MIN_MOVES legal replies.
//
// PARRIES IS THE QUALITY BAR, not the move count. A board where only one move
// even answers the immediate threat is not a puzzle, it is a forced move. So
// the search counts how many black moves stop the CURRENT threat (that is, how
// many look like a defence at a glance) and demands at least MIN_PARRIES of
// them, which means at least two convincing decoys alongside the real save.
//
// THE SAVE MUST BE A REFUTATION, NOT A DELAY. A move that pushes mate from two
// to three is not a save, so an accepted key is re-searched at holdFor + 1 and
// thrown out if White still forces mate. What the game claims when you survive
// is that the attack was answered, and this is the line that makes that true.
//
// Run:  node scripts/gen-defend.mjs <holdFor> <seconds> <outfile>
//       node scripts/gen-defend.mjs 2 900 /tmp/cand2.json
//
// It appends to the outfile, deduping on position, so several runs (or several
// processes) can pile into the same pool. scripts/verify-defend.mjs re-derives
// every claim here from the FEN with its own solver, so nothing in this file is
// trusted by the shipped bank.
import { legalMoves, applyMove, inCheck, toSan, rowOf, fileOf, squareName, WHITE, BLACK } from '../app/mate/chess.js';
import { makeMateSearch, stubbornestReply } from '../app/defend/defense.js';
import { writeFileSync, existsSync, readFileSync } from 'node:fs';

const HOLD = Number(process.argv[2] || 2);
const SECS = Number(process.argv[3] || 300);
const OUT = process.argv[4] || `/tmp/defend-cand${HOLD}.json`;

const MIN_MOVES = 12;      // legal black replies, so the board is a real search
const MIN_PARRIES = 3;     // moves that answer the immediate threat: the decoys
const MAX_FOLLOWUP = 3;    // saving replies left after White's stubbornest try
const MIN_PIECES = 6;
const MAX_PIECES = 9;

const R = (n) => Math.floor(Math.random() * n);
const WSETS = [['Q', 'R'], ['Q', 'N'], ['R', 'R'], ['Q', 'B'], ['R', 'B'], ['R', 'N'], ['Q', 'R', 'N'],
  ['R', 'R', 'B'], ['Q', 'N', 'N'], ['Q', 'R', 'B'], ['R', 'B', 'N'], ['Q', 'P'], ['R', 'R', 'N'], ['Q', 'B', 'N']];
const BSETS = [['r'], ['b'], ['n'], ['q'], ['r', 'n'], ['r', 'b'], ['b', 'n'], ['r', 'p'], ['n', 'p'],
  ['b', 'p'], ['q', 'p'], ['r', 'r'], ['r', 'b', 'p'], ['n', 'n'], ['q', 'n']];
const VAL = { q: 9, r: 5, b: 3, n: 3, p: 1 };
const NAME = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };

// A sparse, mate-net-shaped position. The black king is pushed toward an edge
// because that is where mating nets live, which is a search heuristic and not a
// rule: nothing downstream assumes it.
function randPos() {
  const b = new Array(64).fill(null);
  const free = () => { for (let t = 0; t < 200; t++) { const s = R(64); if (!b[s]) return s; } return -1; };
  let bk;
  for (;;) { bk = R(64); const r = rowOf(bk), f = fileOf(bk); if (r <= 1 || r >= 6 || f <= 1 || f >= 6) break; }
  b[bk] = 'k';
  let wk;
  for (;;) {
    wk = R(64);
    if (b[wk]) continue;
    if (Math.max(Math.abs(rowOf(wk) - rowOf(bk)), Math.abs(fileOf(wk) - fileOf(bk))) > 1) break;
  }
  b[wk] = 'K';
  for (const p of WSETS[R(WSETS.length)]) {
    const s = free(); if (s < 0) continue;
    if (p === 'P' && (rowOf(s) < 2 || rowOf(s) > 5)) continue;   // no promotion, no double push
    b[s] = p;
  }
  for (const p of BSETS[R(BSETS.length)]) {
    const s = free(); if (s < 0) continue;
    if (p === 'p' && (rowOf(s) < 2 || rowOf(s) > 5)) continue;
    b[s] = p;
  }
  return b;
}

function toFen(board, turn) {
  let out = '';
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const p = board[r * 8 + f];
      if (!p) empty++;
      else { if (empty) { out += empty; empty = 0; } out += p; }
    }
    if (empty) out += empty;
    if (r < 7) out += '/';
  }
  return `${out} ${turn} - - 0 1`;
}

// Does `to` sit on a line between the black king and a white slider, so the
// move plugs a line rather than guarding a square? Used only to name the motif.
function isInterposition(board, to) {
  const kingSq = board.indexOf('k');
  if (kingSq < 0) return false;
  const kr = rowOf(kingSq), kf = fileOf(kingSq), tr = rowOf(to), tf = fileOf(to);
  const dr = Math.sign(tr - kr), df = Math.sign(tf - kf);
  if (dr === 0 && df === 0) return false;
  if (dr !== 0 && df !== 0 && Math.abs(tr - kr) !== Math.abs(tf - kf)) return false;
  let r = tr + dr, f = tf + df;
  while (r >= 0 && r < 8 && f >= 0 && f < 8) {
    const p = board[r * 8 + f];
    if (p) {
      const kind = p.toUpperCase();
      if (p !== kind) return false;                                  // a black piece blocks first
      if (kind === 'Q') return true;
      if (kind === 'R') return dr === 0 || df === 0;
      if (kind === 'B') return dr !== 0 && df !== 0;
      return false;
    }
    r += dr; f += df;
  }
  return false;
}

// Reader-facing flavour, shown only to a player who survived. Every string
// names the actual piece and square, so two boards can only collide when the
// same idea lands on the same square, which the bank verifier still polices.
function motifFor(board, key, after) {
  const piece = NAME[(board[key.from] || 'P').toUpperCase()];
  const sq = squareName(key.to);
  const captured = board[key.to] ? NAME[board[key.to].toUpperCase()] : null;
  const gives = inCheck(after, WHITE);
  const pick = (arr) => arr[(key.from * 7 + key.to * 3) % arr.length];
  if (captured) {
    return pick([
      `Take the attacker. The ${piece} captures the ${captured} on ${sq}, and every other parry leaves the net standing.`,
      `The net has one loose thread. The ${piece} takes the ${captured} on ${sq}, and nothing quieter holds.`,
      `Remove the piece doing the work. The ${piece} takes on ${sq}, which is the only defence that changes the material on the board.`,
    ]);
  }
  if (gives) {
    return pick([
      `A counter-check. The ${piece} to ${sq} makes White answer you first, which is the only way to break the tempo.`,
      `Check, and the attack has to stop and deal with it. The ${piece} to ${sq} buys the move nothing else buys.`,
      `Hand the move back. The ${piece} to ${sq} checks, and an attacker in check cannot finish.`,
    ]);
  }
  if ((board[key.from] || '') === 'k') {
    return pick([
      `The right flight square. The king steps to ${sq}, and it is the only square still uncovered a move later.`,
      `Walk, but walk the correct way. The king to ${sq} is the one escape that is not a mating square in disguise.`,
      `The king saves itself on ${sq}. Every other square looks just as open and every other square is covered.`,
    ]);
  }
  if (isInterposition(board, key.to)) {
    return pick([
      `Interpose. The ${piece} to ${sq} plugs the line, and it is the only body that can hold the square.`,
      `Block the line rather than run down it. The ${piece} to ${sq} is the only piece that gets there in time.`,
      `The ${piece} throws itself in the way on ${sq}, which is worth exactly one move and one move is all you need.`,
    ]);
  }
  return pick([
    `A quiet defence. The ${piece} to ${sq} covers the mating square, and nothing louder does.`,
    `No check, no capture, no escape. The ${piece} to ${sq} simply guards the square the mate needs.`,
    `The move that looks like nothing. The ${piece} to ${sq} takes the mating square away and there is no second way to do it.`,
  ]);
}

const prior = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : [];
const out = prior.slice();
const seen = new Set(prior.map((x) => x.fen.split(' ')[0]));
const t0 = Date.now();
let tried = 0, threat = 0;

while ((Date.now() - t0) / 1000 < SECS) {
  tried++;
  const b = randPos();
  const pieces = b.filter(Boolean).length;
  if (pieces < MIN_PIECES || pieces > MAX_PIECES) continue;
  if (inCheck(b, WHITE)) continue;                 // illegal: it is Black to move
  if (inCheck(b, BLACK)) continue;                 // want a wide board, not a forced escape
  if (!b.some((p) => p && p !== 'k' && p === p.toLowerCase())) continue;   // Black needs material
  const bm = legalMoves(b, BLACK);
  if (bm.length < MIN_MOVES) continue;

  const s = makeMateSearch();
  if (!s.forcesMateWithin(b, WHITE, HOLD - 1)) continue;   // there must be a live threat
  threat++;

  // A move that already loses to the SHORTER mate cannot survive the longer one,
  // so the expensive holdFor-deep search only ever runs on moves that answered
  // the immediate threat. On a Sunday that is three or four moves out of twenty
  // rather than all twenty, which is most of what makes a hold-for-three bank
  // generable at all.
  const survivors = [];
  let parries = 0;
  for (const mv of bm) {
    const next = applyMove(b, mv.from, mv.to);
    if (s.forcesMateWithin(next, WHITE, HOLD - 1)) continue;
    parries++;
    if (!s.forcesMateWithin(next, WHITE, HOLD)) { survivors.push(mv); if (survivors.length > 1) break; }
  }
  if (survivors.length !== 1) continue;
  if (parries < MIN_PARRIES) continue;

  const key = survivors[0];
  const after = applyMove(b, key.from, key.to);
  if (s.forcesMateWithin(after, WHITE, HOLD + 1)) continue;   // a delay is not a save

  const reply = stubbornestReply(after, HOLD, s);
  if (!reply) continue;
  if (reply.saving !== Infinity && reply.saving > MAX_FOLLOWUP) continue;

  const fen = toFen(b, 'b');
  const pos = fen.split(' ')[0];
  if (seen.has(pos)) continue;
  seen.add(pos);

  out.push({
    fen,
    holdFor: HOLD,
    key: key.uci,
    keySan: toSan(b, key.from, key.to),
    reply: reply.uci,
    parries,
    followUp: reply.saving === Infinity ? 0 : reply.saving,
    moves: bm.length,
    pieces,
    white: b.reduce((a, p) => a + (p && p === p.toUpperCase() && p !== 'K' ? VAL[p.toLowerCase()] : 0), 0),
    black: b.reduce((a, p) => a + (p && p === p.toLowerCase() && p !== 'k' ? VAL[p] : 0), 0),
    motif: motifFor(b, key, after),
  });
  if (out.length % 5 === 0) writeFileSync(OUT, JSON.stringify(out));
}

writeFileSync(OUT, JSON.stringify(out));
console.log(JSON.stringify({ holdFor: HOLD, tried, threat, kept: out.length, secs: ((Date.now() - t0) / 1000).toFixed(0) }));
