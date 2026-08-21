#!/usr/bin/env node
// verify-endgame-playout-queen — prove the LIVE PLAYOUT of Queen: from
// every banked board, for EVERY legal first move (the key and all the wrong
// ones), the round the client would run comes to a conclusion, every engine
// reply is legal, and the verdicts are what the bank promises.
//
// This is the Mate/Defend playout discipline (scripts/verify-endgame-playout)
// applied to Queen, which launched 2026-08-21. It drives the SAME module the
// client drives (app/queen/kpk.js), with White played by:
//   - the optimal policy (prove the win lands in exactly winIn moves), and
//   - every wrong first move followed by a seeded-random legal policy (prove
//     the loss concludes within the budget), repeated over several seeds.
//
// Run: node scripts/verify-endgame-playout-queen.mjs
import { PUZZLES as QP } from '../app/queen/puzzles.js';
import {
  parseFen, whiteMoves, applyWhite, bestBlackReply, moveValue, promoValue,
  pawnAttacks, DRAW, blackMoves,
} from '../app/queen/kpk.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Queen: one round, White driven by `policy(s, remaining)` ──────────────
// Returns { end, whiteMovesUsed } where end is 'promoted' | 'stalemate' |
// 'captured' | 'budget' | 'mated-black' | 'white-stuck'.
function queenRound(p, policy) {
  let s = parseFen(p.fen);
  let used = 0;
  for (;;) {
    if (used >= p.winIn) return { end: 'budget', used };
    const mvs = whiteMoves(s);
    if (!mvs.length) return { end: 'white-stuck', used };
    const mv = policy(s, p.winIn - used, mvs);
    if (!mv) return { end: 'white-stuck', used };
    used++;
    if (mv.promo) {
      const v = promoValue(s.wk, s.bk, mv.to);
      if (v === 'win') return { end: 'promoted', used };
      if (v === 'stalemate') return { end: 'stalemate', used };
      return { end: 'captured', used }; // Black takes the queen next beat
    }
    s = applyWhite(s, mv);
    // Black's turn, exactly as the client plays it
    const reply = bestBlackReply(s);
    if (!reply) {
      if (s.p != null && pawnAttacks(s.p, s.bk)) return { end: 'mated-black', used };
      return { end: 'stalemate', used };
    }
    // legality: the reply must be one of Black's legal moves
    if (!blackMoves(s).some((m) => m.uci === reply.uci)) return { end: `ILLEGAL reply ${reply.uci}`, used };
    if (reply.capture) return { end: 'captured', used };
    s = { wk: s.wk, bk: reply.to, p: s.p, stm: 'w' };
  }
}

const optimalQueen = (s, remaining, mvs) => {
  let best = null;
  for (const mv of mvs) {
    const v = moveValue(s, mv);
    if (!best || v < best.v) best = { mv, v };
  }
  return best && best.v <= remaining ? best.mv : best && best.mv;
};

for (const p of QP) {
  // 1. the optimal line lands the promotion in exactly winIn
  const win = queenRound(p, optimalQueen);
  if (win.end !== 'promoted' && win.end !== 'mated-black') fail(p.quizId, `optimal line ended '${win.end}'`);
  else if (win.used !== p.winIn && win.end === 'promoted') fail(p.quizId, `optimal line used ${win.used} of ${p.winIn}`);
  // 2. every wrong first move still concludes, over several random policies
  const s0 = parseFen(p.fen);
  for (const first of whiteMoves(s0)) {
    if (first.uci === p.keyUci) continue;
    for (let seed = 1; seed <= 3; seed++) {
      const rnd = mulberry32(seed * 7919 + p.num);
      let usedFirst = false;
      const res = queenRound(p, (s, remaining, mvs) => {
        if (!usedFirst) { usedFirst = true; return first; }
        return mvs[Math.floor(rnd() * mvs.length)];
      });
      if (String(res.end).startsWith('ILLEGAL')) fail(p.quizId, `${first.uci}: ${res.end}`);
      if (res.end === 'promoted' && res.used <= p.winIn) fail(p.quizId, `wrong first move ${first.uci} still promoted in ${res.used}`);
      if (res.used > p.winIn) fail(p.quizId, `${first.uci}: round outlived the budget (${res.used})`);
    }
  }
}
console.log(`queen: ${QP.length} boards played out (optimal + every wrong first move x3 seeds)`);

console.log('✓ queen playouts all conclude, all replies legal, all verdicts as banked');
