#!/usr/bin/env node
// Verify the Queen (daily king-and-pawn promotion endgame) bank. Queen's own
// header (app/queen/puzzles.js) promises, per board:
//   - White to move, a SAFE promotion forced in EXACTLY `winIn` White moves
//     (never fewer), where a promotion the Black king can capture back, or one
//     that delivers stalemate, is a draw and not a win;
//   - EXACTLY ONE first move preserves the win inside that budget; at least
//     four first moves are legal and at least TWO of the alternatives throw
//     the win away outright (a draw, not a slower win);
//   - the weekday ramp (Mon 5, Tue 6, Wed 7, Thu 8, Fri 8, Sat 9, Sunday
//     Edition 12) with `sunday` matching the real day of week;
//   - num/quizId/live/dateLabel mutually consistent and daily-consecutive;
//   - pool variety: no duplicate positions, a pawn file at most 8 times and
//     never two days running, pawn-move keys roughly a third of the bank.
//
// INDEPENDENT SOLVER, per the two-solvers rule: this file re-proves the win
// with its own depth-bounded search (promoteWithin), never importing
// app/queen/kpk.js or trusting its tablebase. Termination of live play needs
// no proof here: the client ends the round the moment the budget is spent, the
// pawn is captured, or either side has no move, so no line outlives winIn
// White moves by construction.
//
// Run: node scripts/verify-queen.mjs
import { PUZZLES } from '../app/queen/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (msg) => console.log(`✓ ${msg}`);

const MAXN = 19; // deepest K+P win that exists (measured census); the "throws
                 // it away outright" test asks for no promotion within this.

// ─── an independent, board-array chess-let for K+P vs k ────────────────────
const R = (sq) => sq >> 3, F = (sq) => sq & 7;
const name = (sq) => String.fromCharCode(97 + F(sq)) + String(8 - R(sq));
const adj = (a, b) => { const dr = Math.abs(R(a) - R(b)), df = Math.abs(F(a) - F(b)); return dr <= 1 && df <= 1 && (dr + df > 0); };
const pAtt = (p, sq) => R(p) > 0 && R(sq) === R(p) - 1 && Math.abs(F(sq) - F(p)) === 1;

function parse(fen) {
  const [board, stm, castle, ep] = fen.trim().split(/\s+/);
  let sq = 0, wk = -1, bk = -1, p = -1, junk = false;
  for (const ch of board) {
    if (ch === '/') continue;
    if (ch >= '1' && ch <= '8') { sq += Number(ch); continue; }
    if (ch === 'K') wk = sq; else if (ch === 'k') bk = sq; else if (ch === 'P') p = sq; else junk = true;
    sq++;
  }
  return { wk, bk, p, stm, castle, ep, junk, squares: sq };
}

// White king steps + pawn pushes. Returns [{to, piece, promo}].
function wMoves(st) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = R(st.wk) + dr, ff = F(st.wk) + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === st.p || t === st.bk || adj(t, st.bk)) continue;
    out.push({ piece: 'K', from: st.wk, to: t });
  }
  const pr = R(st.p);
  const t1 = st.p - 8;
  if (t1 !== st.wk && t1 !== st.bk) {
    out.push({ piece: 'P', from: st.p, to: t1, promo: pr === 1 });
    if (pr === 6) {
      const t2 = st.p - 16;
      if (t2 !== st.wk && t2 !== st.bk) out.push({ piece: 'P', from: st.p, to: t2 });
    }
  }
  return out;
}
function bMoves(st) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = R(st.bk) + dr, ff = F(st.bk) + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === st.wk || adj(t, st.wk)) continue;
    if (t === st.p) { if (!adj(t, st.wk)) out.push({ to: t, capture: true }); continue; }
    if (pAtt(st.p, t)) continue;
    out.push({ to: t });
  }
  return out;
}
// Queen on q, white king the only blocker (the black king never blocks a ray
// aimed at itself).
function qAtt(q, sq, wk) {
  if (q === sq) return false;
  const dr = Math.sign(R(sq) - R(q)), df = Math.sign(F(sq) - F(q));
  const aligned = R(q) === R(sq) || F(q) === F(sq) || Math.abs(R(q) - R(sq)) === Math.abs(F(q) - F(sq));
  if (!aligned) return false;
  let r = R(q) + dr, f = F(q) + df;
  while (r !== R(sq) || f !== F(sq)) { if (r * 8 + f === wk) return false; r += dr; f += df; }
  return true;
}
function promoIsWin(wk, bk, q) {
  if (adj(bk, q) && !adj(wk, q)) return false; // Kxq
  let can = false;
  for (let dr = -1; dr <= 1 && !can; dr++) for (let df = -1; df <= 1; df++) {
    if (!dr && !df) continue;
    const rr = R(bk) + dr, ff = F(bk) + df;
    if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
    const t = rr * 8 + ff;
    if (t === wk || adj(t, wk)) continue;
    if (t === q) { if (!adj(wk, q)) { can = true; break; } continue; }
    if (qAtt(q, t, wk)) continue;
    can = true; break;
  }
  return can ? true : qAtt(q, bk, wk); // no move: mate wins, stalemate draws
}

// Depth-bounded: can White force a safe promotion within n White moves?
function makeSearch() {
  const memo = new Map();
  function white(wk, bk, p, n) {
    if (n <= 0) return false;
    const key = ((wk * 64 + bk) * 64 + p) * 24 + n;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let res = false;
    for (const mv of wMoves({ wk, bk, p })) {
      if (mv.promo) { if (promoIsWin(wk, bk, mv.to)) { res = true; break; } continue; }
      const nwk = mv.piece === 'K' ? mv.to : wk;
      const np = mv.piece === 'P' ? mv.to : p;
      if (black(nwk, bk, np, n - 1)) { res = true; break; }
    }
    memo.set(key, res);
    return res;
  }
  function black(wk, bk, p, n) { // black to move; white still gets n moves
    const key = ((wk * 64 + bk) * 64 + p) * 24 + n + 1000000;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    const moves = bMoves({ wk, bk, p });
    let res;
    if (!moves.length) res = pAtt(p, bk); // mate = already won; stalemate = draw
    else {
      res = true;
      for (const mv of moves) {
        if (mv.capture) { res = false; break; }
        if (!white(wk, mv.to, p, n)) { res = false; break; }
      }
    }
    memo.set(key, res);
    return res;
  }
  return { white, black };
}

// ─── the bank checks ───────────────────────────────────────────────────────
const RAMP = { 1: 5, 2: 6, 3: 7, 4: 8, 5: 8, 6: 9, 0: 12 };
const seenFen = new Set();
const fileCount = new Array(8).fill(0);
let lastFile = -1, prevLive = null, pawnKeys = 0;

for (const p of PUZZLES) {
  const id = p.quizId;
  const st = parse(p.fen);
  // 1. structure
  if (st.junk || st.squares !== 64 || st.wk < 0 || st.bk < 0 || st.p < 0) fail(id, 'FEN is not exactly K, k and one P');
  if (st.stm !== 'w' || st.castle !== '-' || st.ep !== '-') fail(id, 'FEN side/castling/ep fields are wrong');
  if (R(st.p) < 1 || R(st.p) > 6) fail(id, `pawn on rank ${8 - R(st.p)}`);
  if (st.wk === st.bk || adj(st.wk, st.bk)) fail(id, 'kings touch');
  if (pAtt(st.p, st.bk)) fail(id, 'Black is in check with White to move');
  // 2. dates and ramp
  const d = new Date(`${p.live}T12:00:00Z`);
  const dow = d.getUTCDay();
  if (p.sunday !== (dow === 0)) fail(id, `sunday flag ${p.sunday} on a ${p.live}`);
  if (RAMP[dow] !== p.winIn) fail(id, `winIn ${p.winIn}, ramp says ${RAMP[dow]}`);
  const wantQuiz = `queen-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantQuiz) fail(id, `quizId != ${wantQuiz}`);
  const wantLabel = `${d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) fail(id, `dateLabel != ${wantLabel}`);
  if (p.num !== PUZZLES.indexOf(p) + 1) fail(id, 'num not sequential');
  if (prevLive) {
    const gap = (d - new Date(`${prevLive}T12:00:00Z`)) / 86400000;
    if (gap !== 1) fail(id, `live date not consecutive (gap ${gap})`);
  }
  prevLive = p.live;
  // 3. the win, re-proven
  const search = makeSearch();
  if (!search.white(st.wk, st.bk, st.p, p.winIn)) fail(id, `no forced promotion within ${p.winIn}`);
  if (search.white(st.wk, st.bk, st.p, p.winIn - 1)) fail(id, `promotes in fewer than ${p.winIn}`);
  // 4. unique key + refutations
  const moves = wMoves(st);
  if (moves.length < 4) fail(id, `only ${moves.length} legal first moves`);
  const winners = [], outright = [];
  for (const mv of moves) {
    let keeps;
    if (mv.promo) keeps = p.winIn === 1 && promoIsWin(st.wk, st.bk, mv.to);
    else {
      const nwk = mv.piece === 'K' ? mv.to : st.wk;
      const np = mv.piece === 'P' ? mv.to : st.p;
      keeps = search.black(nwk, st.bk, np, p.winIn - 1);
    }
    if (keeps) { winners.push(mv); continue; }
    // outright throw-away: no promotion within ANY budget
    let dead;
    if (mv.promo) dead = !promoIsWin(st.wk, st.bk, mv.to);
    else {
      const nwk = mv.piece === 'K' ? mv.to : st.wk;
      const np = mv.piece === 'P' ? mv.to : st.p;
      dead = !search.black(nwk, st.bk, np, MAXN);
    }
    if (dead) outright.push(mv);
  }
  if (winners.length !== 1) fail(id, `${winners.length} keeping first moves, want exactly 1`);
  else {
    const key = winners[0];
    const keyUci = name(key.from) + name(key.to);
    if (keyUci !== p.keyUci) fail(id, `key is ${keyUci}, bank says ${p.keyUci}`);
    const san = key.piece === 'K' ? `K${name(key.to)}` : (key.promo ? `${name(key.to)}=Q` : name(key.to));
    if (san !== p.keySan) fail(id, `keySan is ${san}, bank says ${p.keySan}`);
    if (key.piece === 'P') pawnKeys++;
  }
  if (outright.length < 2) fail(id, `only ${outright.length} outright refutations, want >= 2`);
  // 5. variety bookkeeping
  if (seenFen.has(p.fen)) fail(id, 'duplicate position');
  seenFen.add(p.fen);
  const pf = F(st.p);
  fileCount[pf]++;
  if (pf === lastFile) fail(id, `pawn file ${pf} two days running`);
  lastFile = pf;
}
if (PUZZLES[0] && PUZZLES[0].live !== '2026-08-21') fail('bank', `first live ${PUZZLES[0].live}`);
for (let f = 0; f < 8; f++) if (fileCount[f] > 8) fail('bank', `pawn file ${f} used ${fileCount[f]} times (max 8)`);
if (PUZZLES.length >= 40 && (pawnKeys < PUZZLES.length * 0.2 || pawnKeys > PUZZLES.length * 0.45)) {
  fail('bank', `${pawnKeys} pawn-move keys of ${PUZZLES.length}, want roughly a third`);
}
const sundays = PUZZLES.filter((x) => x.sunday).length;
console.log(`checked ${PUZZLES.length} boards (${sundays} Sunday Editions, ${pawnKeys} pawn keys)`);
if (BAD) { console.error(`${BAD} failure(s)`); process.exit(1); }
ok('queen bank verified');
