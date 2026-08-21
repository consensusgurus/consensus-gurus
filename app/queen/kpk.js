// The king-and-pawn engine behind Queen, the daily promotion endgame.
//
// The whole game is three pieces: White king, White pawn, Black king. That is
// deliberate. It keeps every rule of real chess that matters here (opposition,
// zugzwang, the square of the pawn, stalemate traps, the unsafe promotion) and
// it makes the position EXACTLY solvable: the pawn can never leave its file, so
// one puzzle's whole universe is 64 x 64 king squares x 8 pawn ranks x 2 sides
// to move, and the tablebase for it is computed right here, in milliseconds, in
// the browser. Black's defence is therefore PERFECT, not heuristic: it reads
// the same tablebase the bank generator used, so the reply the generator
// assumed is by construction the reply the browser plays.
//
// Values: W(s) for White to move and B(s) for Black to move are the number of
// WHITE MOVES still needed to promote with best play by both sides, or DRAW.
// A promotion only counts when it is SAFE: if Black's king can legally capture
// the new queen, or the promotion delivers stalemate, the "win" was nothing of
// the kind and the tablebase scores that push as the draw it really is. A
// checkmate before promotion (rare, but real in a corner) counts as a win too.
//
// Squares use the same convention as app/mate/chess.js: index = row * 8 + file
// with row 0 = rank 8, so FEN reading order and screen drawing order agree and
// nothing ever flips a coordinate.
//
// Shared by the client (QueenClient.jsx) and the bank generator
// (scripts/gen-queen.mjs). The verifier (scripts/verify-queen.mjs) deliberately
// does NOT import this module: it re-proves every board with its own
// depth-bounded search, per the two-independent-solvers rule.

export const DRAW = 0x7fff;

export const rowOf = (sq) => sq >> 3;
export const fileOf = (sq) => sq & 7;
export function squareName(sq) {
  return String.fromCharCode(97 + fileOf(sq)) + String(8 - rowOf(sq));
}
export function squareFromName(name) {
  return (8 - Number(name[1])) * 8 + (name.charCodeAt(0) - 97);
}
export const uci = (from, to) => squareName(from) + squareName(to);

const kingAdj = (a, b) => {
  const dr = Math.abs((a >> 3) - (b >> 3));
  const df = Math.abs((a & 7) - (b & 7));
  return dr <= 1 && df <= 1 && (dr || df);
};

// The two squares a white pawn on `p` attacks (toward row 0), or [] on row 0.
function pawnAttackSquares(p) {
  const r = rowOf(p), f = fileOf(p);
  if (r === 0) return [];
  const out = [];
  if (f > 0) out.push((r - 1) * 8 + (f - 1));
  if (f < 7) out.push((r - 1) * 8 + (f + 1));
  return out;
}
export const pawnAttacks = (p, sq) => pawnAttackSquares(p).includes(sq);

// { wk, bk, p, stm } with stm 'w' | 'b'. p === null once the pawn is captured.
export function parseFen(fen) {
  const parts = String(fen).trim().split(/\s+/);
  let sq = 0, wk = -1, bk = -1, p = null;
  for (const ch of parts[0]) {
    if (ch === '/') continue;
    if (ch >= '1' && ch <= '8') { sq += Number(ch); continue; }
    if (ch === 'K') wk = sq;
    else if (ch === 'k') bk = sq;
    else if (ch === 'P') p = sq;
    sq++;
  }
  return { wk, bk, p, stm: parts[1] === 'b' ? 'b' : 'w' };
}
export function toFen(s) {
  const rows = [];
  for (let r = 0; r < 8; r++) {
    let row = '', run = 0;
    for (let f = 0; f < 8; f++) {
      const sq = r * 8 + f;
      const ch = sq === s.wk ? 'K' : sq === s.bk ? 'k' : sq === s.p ? 'P' : null;
      if (!ch) { run++; continue; }
      if (run) { row += run; run = 0; }
      row += ch;
    }
    if (run) row += run;
    rows.push(row || '8');
  }
  return `${rows.join('/')} ${s.stm} - - 0 1`;
}

// A structurally legal state: distinct squares, kings apart, pawn on rank 2-7,
// and (White to move only) the pawn not already attacking the Black king, which
// would mean Black was left in check on White's turn.
export function legalState(s) {
  if (s.wk === s.bk || kingAdj(s.wk, s.bk)) return false;
  if (s.p != null) {
    if (s.p === s.wk || s.p === s.bk) return false;
    const r = rowOf(s.p);
    if (r < 1 || r > 6) return false;
    if (s.stm === 'w' && pawnAttacks(s.p, s.bk)) return false;
  }
  return true;
}

// White's legal moves: king steps plus pawn pushes (single, and double from
// rank 2). A push to rank 8 is the promotion move; whether it WINS is decided
// by promoValue below, not here.
export function whiteMoves(s) {
  const out = [];
  const r = rowOf(s.wk), f = fileOf(s.wk);
  for (let dr = -1; dr <= 1; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = r + dr, ff = f + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === s.p || t === s.bk || kingAdj(t, s.bk)) continue;
    out.push({ piece: 'K', from: s.wk, to: t, uci: uci(s.wk, t) });
  }
  if (s.p != null) {
    const pr = rowOf(s.p);
    const t1 = s.p - 8;
    if (t1 !== s.wk && t1 !== s.bk) {
      out.push({ piece: 'P', from: s.p, to: t1, uci: uci(s.p, t1), promo: pr === 1 });
      if (pr === 6) {
        const t2 = s.p - 16;
        if (t2 !== s.wk && t2 !== s.bk) out.push({ piece: 'P', from: s.p, to: t2, uci: uci(s.p, t2) });
      }
    }
  }
  return out;
}
export function applyWhite(s, mv) {
  if (mv.piece === 'K') return { wk: mv.to, bk: s.bk, p: s.p, stm: 'b' };
  return { wk: s.wk, bk: s.bk, p: mv.to, stm: 'b' };
}

// Black's legal moves: king steps only. Landing on the pawn is the capture and
// is legal exactly when the pawn is undefended (the White king not beside it).
export function blackMoves(s) {
  const out = [];
  const r = rowOf(s.bk), f = fileOf(s.bk);
  for (let dr = -1; dr <= 1; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = r + dr, ff = f + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === s.wk || kingAdj(t, s.wk)) continue;
    if (t === s.p) { out.push({ from: s.bk, to: t, uci: uci(s.bk, t), capture: true }); continue; }
    if (s.p != null && pawnAttacks(s.p, t)) continue;
    out.push({ from: s.bk, to: t, uci: uci(s.bk, t) });
  }
  return out;
}
export function applyBlack(s, mv) {
  return { wk: s.wk, bk: mv.to, p: mv.capture ? null : s.p, stm: 'w' };
}

// Is `sq` attacked by a queen standing on `q`, with the White king the only
// possible blocker? The Black king itself never blocks a ray aimed at it.
function queenAttacks(q, sq, wk) {
  if (q === sq) return false;
  const dr = Math.sign(rowOf(sq) - rowOf(q));
  const df = Math.sign(fileOf(sq) - fileOf(q));
  const aligned = rowOf(q) === rowOf(sq) || fileOf(q) === fileOf(sq)
    || Math.abs(rowOf(q) - rowOf(sq)) === Math.abs(fileOf(q) - fileOf(sq));
  if (!aligned) return false;
  let r = rowOf(q) + dr, f = fileOf(q) + df;
  while (r !== rowOf(sq) || f !== fileOf(sq)) {
    if (r * 8 + f === wk) return false;
    r += dr; f += df;
  }
  return true;
}

// The verdict on pushing the pawn to rank 8 (queening on square `q`, Black to
// move): 'win' when the new queen stands and Black still has a move (or is
// checkmated on the spot), 'capture' when the Black king simply takes it,
// 'stalemate' when the push leaves Black with nothing legal and no check.
// The last two are draws, which is the whole lesson of the unsafe promotion.
export function promoValue(wk, bk, q) {
  if (kingAdj(bk, q) && !kingAdj(wk, q)) return 'capture';
  let hasMove = false;
  const r = rowOf(bk), f = fileOf(bk);
  for (let dr = -1; dr <= 1 && !hasMove; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = r + dr, ff = f + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === wk || kingAdj(t, wk)) continue;
    if (t === q) { if (!kingAdj(wk, q)) { hasMove = true; break; } continue; }
    if (queenAttacks(q, t, wk)) continue;
    hasMove = true; break;
  }
  if (hasMove) return 'win';
  return queenAttacks(q, bk, wk) ? 'win' : 'stalemate';
}

// ─── the per-file tablebase ────────────────────────────────────────────────
// One pawn file is one closed universe (the pawn cannot change file), so the
// tablebase is built per file and memoized. Values are white-moves-to-promote;
// DRAW for everything else. Index: ((wk * 64 + bk) * 8 + pawnRow) * 2 + stm.
const TB = new Map();
const idxOf = (wk, bk, pr, stmW) => ((wk * 64 + bk) * 8 + pr) * 2 + (stmW ? 0 : 1);

export function tablebase(file) {
  if (TB.has(file)) return TB.get(file);
  const V = new Int16Array(64 * 64 * 8 * 2).fill(DRAW);
  const stateOf = (wk, bk, pr, stmW) => ({ wk, bk, p: pr * 8 + file, stm: stmW ? 'w' : 'b' });
  // Value iteration from DRAW-everywhere: wins seep out of the safe promotions
  // (and the rare pawn mates) until nothing changes. Monotone, so it terminates.
  let changed = true;
  while (changed) {
    changed = false;
    for (let wk = 0; wk < 64; wk++) for (let bk = 0; bk < 64; bk++) for (let pr = 1; pr <= 6; pr++) {
      // White to move
      let s = stateOf(wk, bk, pr, true);
      if (legalState(s)) {
        let best = DRAW;
        for (const mv of whiteMoves(s)) {
          let cand = DRAW;
          if (mv.promo) {
            if (promoValue(wk, bk, mv.to) === 'win') cand = 1;
          } else {
            const n = applyWhite(s, mv);
            const bv = V[idxOf(n.wk, n.bk, rowOf(n.p), false)];
            if (bv !== DRAW) cand = 1 + bv;
          }
          if (cand < best) best = cand;
        }
        const i = idxOf(wk, bk, pr, true);
        if (best < V[i]) { V[i] = best; changed = true; }
      }
      // Black to move
      s = stateOf(wk, bk, pr, false);
      if (legalState(s)) {
        const moves = blackMoves(s);
        let val;
        if (!moves.length) {
          // No move at all: checkmate by the pawn is a win needing 0 more
          // White moves; anything else is stalemate, a draw.
          val = pawnAttacks(s.p, bk) ? 0 : DRAW;
        } else {
          val = 0;
          for (const mv of moves) {
            if (mv.capture) { val = DRAW; break; }
            const n = applyBlack(s, mv);
            const wv = V[idxOf(n.wk, n.bk, rowOf(n.p), true)];
            if (wv === DRAW) { val = DRAW; break; }
            if (wv > val) val = wv;
          }
        }
        const i = idxOf(wk, bk, pr, false);
        if (val < V[i]) { V[i] = val; changed = true; }
      }
    }
  }
  const tb = {
    // White to move: white moves needed, or DRAW.
    w: (s) => V[idxOf(s.wk, s.bk, rowOf(s.p), true)],
    // Black to move: white moves still needed, or DRAW.
    b: (s) => V[idxOf(s.wk, s.bk, rowOf(s.p), false)],
  };
  TB.set(file, tb);
  return tb;
}

// The value of one White move from `s`: the White moves the game still needs
// with this move played (the move itself included), or DRAW.
export function moveValue(s, mv) {
  if (mv.promo) return promoValue(s.wk, s.bk, mv.to) === 'win' ? 1 : DRAW;
  const tb = tablebase(fileOf(s.p));
  const bv = tb.b(applyWhite(s, mv));
  return bv === DRAW ? DRAW : 1 + bv;
}

// Black's reply, fully deterministic so every player faces the same defence:
// any drawing move first (the pawn capture ahead of the rest, then the lowest
// UCI string), else the reply that drags the promotion out longest, ties again
// to the lowest UCI. Returns null only when Black has no legal move at all.
export function bestBlackReply(s) {
  const tb = tablebase(fileOf(s.p));
  let best = null;
  for (const mv of blackMoves(s)) {
    const n = applyBlack(s, mv);
    const wv = mv.capture ? DRAW : tb.w(n);
    const draws = wv === DRAW;
    const cand = { mv, draws, wv, cap: mv.capture ? 1 : 0 };
    const better = !best
      || (cand.draws !== best.draws && cand.draws)
      || (cand.draws && best.draws && (cand.cap > best.cap || (cand.cap === best.cap && cand.mv.uci < best.mv.uci)))
      || (!cand.draws && !best.draws && (cand.wv > best.wv || (cand.wv === best.wv && cand.mv.uci < best.mv.uci)));
    if (better) best = cand;
  }
  return best ? best.mv : null;
}

// Display notation for the move list: "Kd5", "e5", "e8=Q". Checks cannot be
// given by a king and the pawn's checks are not worth annotating here.
export function sanOf(s, mv) {
  if (mv.piece === 'K') return `K${squareName(mv.to)}`;
  return mv.promo ? `${squareName(mv.to)}=Q` : squareName(mv.to);
}
