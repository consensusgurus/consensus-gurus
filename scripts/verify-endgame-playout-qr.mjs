#!/usr/bin/env node
// verify-endgame-playout-qr — prove the LIVE PLAYOUT of Queen and Race: from
// every banked board, for EVERY legal first move (the key and all the wrong
// ones), the round the client would run comes to a conclusion, every engine
// reply is legal, and the verdicts are what the bank promises.
//
// This is the Mate/Defend playout discipline (scripts/verify-endgame-playout)
// applied to the two 2026-08-21 games. It drives the SAME modules the clients
// drive (app/queen/kpk.js, app/race/breakthrough.js), with White played by:
//   - the optimal policy (prove the win lands in exactly winIn moves), and
//   - every wrong first move followed by a seeded-random legal policy (prove
//     the loss concludes, within the budget for Queen and within the board's
//     structural move bound for Race), repeated over several seeds.
//
// Run: node scripts/verify-endgame-playout-qr.mjs
import { PUZZLES as QP } from '../app/queen/puzzles.js';
import { PUZZLES as RP } from '../app/race/puzzles.js';
import {
  parseFen, whiteMoves, applyWhite, bestBlackReply, moveValue, promoValue,
  pawnAttacks, DRAW, blackMoves,
} from '../app/queen/kpk.js';
import {
  makePosition, makeSolver, raceMoves, raceApply, engineReply,
} from '../app/race/breakthrough.js';

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

// ─── Race: one round, White driven by `policy` ─────────────────────────────
function raceRound(p, policy, solver) {
  let s = makePosition(p.cols, p.rows, p.white, p.black, 'w');
  let plies = 0;
  const bound = (p.white.length + p.black.length) * p.rows + 2;
  for (;;) {
    if (plies > bound) return { end: 'UNBOUNDED', plies };
    if (s.stm === 'w') {
      if (!s.w.length) return { end: 'white-out', plies };
      const mvs = raceMoves(s);
      if (!mvs.length) return { end: 'white-stuck', plies };
      const mv = policy(s, mvs);
      plies++;
      if (mv.goal) return { end: 'white-crossed', plies };
      s = raceApply(s, mv);
    } else {
      const mv = engineReply(s, solver);
      if (!mv) return { end: 'black-stuck', plies };
      if (!raceMoves(s).some((m) => m.uci === mv.uci)) return { end: `ILLEGAL reply ${mv.uci}`, plies };
      plies++;
      if (mv.goal) return { end: 'black-crossed', plies };
      s = raceApply(s, mv);
    }
  }
}

for (const p of RP) {
  const solver = makeSolver();
  // 1. the optimal line wins in exactly winIn White moves
  const optimal = (s, mvs) => {
    let best = null;
    for (const mv of mvs) {
      let wins, d;
      if (mv.goal) { wins = true; d = 1; }
      else { const ch = solver.solve(raceApply(s, mv)); wins = ch.win === 'w'; d = ch.d + 1; }
      if (wins && (!best || d < best.d)) best = { mv, d };
    }
    return best ? best.mv : mvs[0];
  };
  const win = raceRound(p, optimal, solver);
  if (win.end !== 'white-crossed' && win.end !== 'black-stuck') fail(p.quizId, `optimal line ended '${win.end}'`);
  else {
    const usedWhite = Math.ceil(win.plies / 2);
    if (usedWhite !== p.winIn) fail(p.quizId, `optimal line took ${usedWhite} White moves, bank says ${p.winIn}`);
  }
  // 2. every wrong first move concludes with a Black win, over random play
  const s0 = makePosition(p.cols, p.rows, p.white, p.black, 'w');
  for (const first of raceMoves(s0)) {
    if (first.uci === p.keyUci) continue;
    for (let seed = 1; seed <= 3; seed++) {
      const rnd = mulberry32(seed * 104729 + p.num);
      let usedFirst = false;
      const res = raceRound(p, (s, mvs) => {
        if (!usedFirst) { usedFirst = true; return first; }
        return mvs[Math.floor(rnd() * mvs.length)];
      }, solver);
      if (String(res.end).startsWith('ILLEGAL') || res.end === 'UNBOUNDED') fail(p.quizId, `${first.uci}: ${res.end}`);
      if (res.end === 'white-crossed' || res.end === 'black-stuck') fail(p.quizId, `wrong first move ${first.uci} still won (${res.end})`);
    }
  }
}
console.log(`race: ${RP.length} boards played out (optimal + every wrong first move x3 seeds)`);

if (BAD) { console.error(`${BAD} failure(s)`); process.exit(1); }
console.log('✓ queen + race playouts all conclude, all replies legal, all verdicts as banked');
