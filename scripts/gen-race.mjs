#!/usr/bin/env node
// gen-race — deal the Race bank (the daily pawn-race endgame).
//
//   node scripts/gen-race.mjs --state /tmp/race-state.json [--budget ms]
//   node scripts/gen-race.mjs --state /tmp/race-state.json --emit > puzzles.js
//
// Resumable: each run continues from the state file until its time budget and
// saves; --emit prints the finished bank. Every day draws from its own seeded
// PRNG, so a resume cannot change what an earlier run dealt.
//
// Selection rules (authoring rules live in app/race/puzzles.js's header;
// scripts/verify-race.mjs re-proves everything with its own solver):
//   - White to move and winning in EXACTLY the day's winIn White moves against
//     perfect defence; there are no draws, so every alternative first move
//     LOSES outright;
//   - EXACTLY ONE first move wins; at least minMoves first moves are legal;
//     at least minTraps of the losing alternatives lose SLOWLY (five plies or
//     more), so the wrong moves tempt rather than announce themselves;
//   - the reachable game tree stays under CAP states so the browser can solve
//     the position exactly, and no two boards are the same position.
//
// The ramp was MEASURED, not guessed (2026-08-21): with three pawns a side,
// unique-key wins run deep on SMALL boards (6x6 yields winIn 5 pools; 7x7
// runs out past 5; a fourth pawn collapses everything to winIn 2 and blows
// the tree cap). So the week ramps winIn 3 -> 4 across 6x6 and 7x7 boards,
// Saturday hides the key in a wider haystack, and the Sunday Edition is the
// longest race of the week: 7x7, win in five.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { makeSolver, raceMoves, raceApply, raceSan, cellName } from '../app/race/breakthrough.js';

const args = process.argv.slice(2);
const argOf = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = Number(argOf('--days', 45));
const FROM = argOf('--from', '2026-08-21');
const STATE = argOf('--state', '/tmp/race-state.json');
const BUDGET = Number(argOf('--budget', 120000));
const EMIT = args.includes('--emit');
const CAP = 200000;

const RAMP = {
  1: { n: 6, winIn: 3, minMoves: 4, minTraps: 2 },
  2: { n: 7, winIn: 3, minMoves: 4, minTraps: 2 },
  3: { n: 6, winIn: 4, minMoves: 4, minTraps: 2 },
  4: { n: 7, winIn: 4, minMoves: 4, minTraps: 2 },
  5: { n: 7, winIn: 4, minMoves: 5, minTraps: 3 },
  6: { n: 7, winIn: 4, minMoves: 6, minTraps: 4 },
  0: { n: 7, winIn: 5, minMoves: 4, minTraps: 2 },
};

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Win/loss-only search with cutoffs: the cheap gate in front of the full solve.
function makeFastWin() {
  const memo = new Map();
  const key = (s) => {
    let k = s.stm === 'w' ? 1 : 0;
    for (let i = 0; i < 4; i++) k = k * 65 + (i < s.w.length ? s.w[i] : 64);
    for (let i = 0; i < 4; i++) k = k * 65 + (i < s.b.length ? s.b[i] : 64);
    return k;
  };
  function wins(s) {
    if (memo.size > 80000) throw new Error('fastwin-cap');
    const k = key(s);
    const hit = memo.get(k);
    if (hit !== undefined) return hit;
    const mine = s.stm === 'w' ? s.w : s.b;
    let res = false;
    if (mine.length) {
      const moves = raceMoves(s);
      moves.sort((a, b) => (b.goal - a.goal) || (b.capture - a.capture));
      for (const mv of moves) {
        if (mv.goal || !wins(raceApply(s, mv))) { res = true; break; }
      }
    }
    memo.set(k, res);
    return res;
  }
  return wins;
}

// Budget-limited win search: does White force the win within k White moves?
// The cheap DEPTH gate in front of the full solve: most fastWin survivors win
// far shallower than the day wants, and this rejects them without paying for
// the exact solve.
function makeWinsWithin() {
  const memo = new Map();
  const key = (s, k) => {
    let n = (s.stm === 'w' ? 1 : 0) * 24 + k;
    for (let i = 0; i < 4; i++) n = n * 65 + (i < s.w.length ? s.w[i] : 64);
    for (let i = 0; i < 4; i++) n = n * 65 + (i < s.b.length ? s.b[i] : 64);
    return n;
  };
  function W(s, k) { // white to move
    if (k <= 0) return false;
    if (memo.size > 400000) throw new Error('winswithin-cap');
    const kk = key(s, k);
    const hit = memo.get(kk);
    if (hit !== undefined) return hit;
    let res = false;
    if (s.w.length) {
      for (const mv of raceMoves(s)) {
        if (mv.goal) { res = true; break; }
        if (B(raceApply(s, mv), k - 1)) { res = true; break; }
      }
    }
    memo.set(kk, res);
    return res;
  }
  function B(s, k) { // black to move; White still gets k moves
    const kk = key(s, k);
    const hit = memo.get(kk);
    if (hit !== undefined) return hit;
    const moves = s.b.length ? raceMoves(s) : [];
    let res = true; // no pawns or no moves: Black is stuck and loses now
    for (const mv of moves) {
      if (mv.goal) { res = false; break; }
      if (!W(raceApply(s, mv), k)) { res = false; break; }
    }
    memo.set(kk, res);
    return res;
  }
  return W;
}

// Contact-structured deals: pawns dropped in loose facing pairs (with the odd
// free runner), which is where the tense, deep positions live. Measured:
// uniform random deals almost never produce a deep unique-key win.
function structuredBoard(cols, rows, rnd, wideGap) {
  const ri = (n) => Math.floor(rnd() * n);
  const used = new Set(); const w = [], b = [];
  const cs = [];
  let guard = 0;
  while (cs.length < 3 && guard++ < 60) { const c = ri(cols); if (!cs.includes(c)) cs.push(c); }
  if (cs.length < 3) return null;
  for (let i = 0; i < 3; i++) {
    const c = cs[i];
    if (rnd() < 0.22 && i === 2) {
      let rw = 2 + ri(rows - 3), cw = ri(cols), cellw = rw * cols + cw, g = 0;
      while (used.has(cellw) && g++ < 20) { rw = 2 + ri(rows - 3); cw = ri(cols); cellw = rw * cols + cw; }
      if (used.has(cellw)) return null; used.add(cellw); w.push(cellw);
      let rb = 1 + ri(rows - 3), cb = ri(cols), cellb = rb * cols + cb; g = 0;
      while (used.has(cellb) && g++ < 20) { rb = 1 + ri(rows - 3); cb = ri(cols); cellb = rb * cols + cb; }
      if (used.has(cellb)) return null; used.add(cellb); b.push(cellb);
    } else {
      const rw = 2 + ri(rows - 3);
      const gap = 1 + (rnd() < (wideGap ? 0.75 : 0.4) ? 1 : 0);
      let rb = rw - gap; if (rb < 1) rb = 1;
      const cb = Math.min(cols - 1, Math.max(0, c + (rnd() < 0.3 ? (rnd() < 0.5 ? -1 : 1) : 0)));
      const cellw = rw * cols + c, cellb = rb * cols + cb;
      if (used.has(cellw) || used.has(cellb) || cellw === cellb) return null;
      used.add(cellw); used.add(cellb); w.push(cellw); b.push(cellb);
    }
  }
  return { cols, rows, w: w.sort((x, y) => x - y), b: b.sort((x, y) => x - y), stm: 'w' };
}

const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : { days: [], seen: [] };
// A fresh nonce per invocation: a day's PRNG would otherwise restart from the
// same seed on every resume and re-tread the exact candidates it already
// rejected, so a slow day could never profit from a second run.
state.nonce = (state.nonce || 0) + 1;
const seen = new Set(state.seen);
const d0 = new Date(`${FROM}T12:00:00Z`);

if (!EMIT) {
  const t00 = Date.now();
  while (state.days.length < DAYS && Date.now() - t00 < BUDGET) {
    const i = state.days.length;
    const d = new Date(d0.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const { n, winIn, minMoves, minTraps } = RAMP[dow];
    const rnd = mulberry32(0x9e3779b9 ^ (20260821 + i * 101) ^ (state.nonce * 7919));
    let found = null, attempts = 0;
    while (!found && Date.now() - t00 < BUDGET) {
      attempts++;
      const s = structuredBoard(n, n, rnd, minMoves >= 6);
      if (!s) continue;
      const posKey = `${n}|${s.w.join(',')}|${s.b.join(',')}`;
      if (seen.has(posKey)) continue;
      const moves = raceMoves(s);
      if (moves.length < minMoves) continue;
      const fast = makeFastWin();
      let fw = 0, bad = false;
      for (const mv of moves) {
        let w;
        try { w = mv.goal ? true : !fast(raceApply(s, mv)); }
        catch (e) { bad = true; break; }
        if (w) { fw++; if (fw > 1) break; }
      }
      if (bad || fw !== 1) continue;
      // cheap depth gate: exactly winIn, proven by two budgeted probes, before
      // the expensive exact solve
      try {
        const ww = makeWinsWithin();
        if (ww(s, winIn - 1)) continue;
        if (!ww(s, winIn)) continue;
      } catch (e) { continue; }
      const solver = makeSolver(CAP);
      let root;
      try { root = solver.solve(s); } catch (e) { continue; }
      if (root.win !== 'w' || root.d !== winIn * 2 - 1) continue;
      let winners = [], slow = 0, capped = false;
      for (const mv of moves) {
        if (mv.goal) { winners.push(mv); continue; }
        let child;
        try { child = solver.solve(raceApply(s, mv)); } catch (e) { capped = true; break; }
        if (child.win === 'w') winners.push(mv);
        else if (child.d + 1 >= 5) slow++;
      }
      if (capped || winners.length !== 1 || slow < minTraps) continue;
      found = { s, key: winners[0], states: solver.size(), posKey };
    }
    if (!found) { console.error(`  (budget out on day ${i + 1} after ${attempts} tries)`); break; }
    seen.add(found.posKey);
    const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
    state.days.push({
      num: i + 1,
      quizId: `race-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`,
      live: iso,
      dateLabel: `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`,
      sunday: dow === 0,
      cols: found.s.cols, rows: found.s.rows, winIn,
      white: found.s.w.map((c) => cellName(c, found.s.cols, found.s.rows)),
      black: found.s.b.map((c) => cellName(c, found.s.cols, found.s.rows)),
      keyUci: found.key.uci,
      keySan: raceSan(found.key, found.s.cols, found.s.rows),
      states: found.states,
    });
    state.seen = [...seen];
    writeFileSync(STATE, JSON.stringify(state));
    console.error(`  ${iso} ${n}x${n} winIn${winIn}: ${found.states} states (${attempts} tries)`);
  }
  console.error(`state: ${state.days.length}/${DAYS} days done`);
  process.exit(state.days.length >= DAYS ? 0 : 3);
}

if (state.days.length < DAYS) { console.error(`only ${state.days.length}/${DAYS} days in state`); process.exit(1); }
const HEADER = `// Puzzle data for Race, the daily pawn-race endgame. Imported ONLY by the
// server page (app/race/page.js), which filters live<=today and STRIPS
// keyUci/keySan before handing boards to the client, so neither tomorrow's
// position nor any day's key move ever ships to the browser.
//
// Each puzzle is a Breakthrough-style pawn endgame with WHITE TO MOVE and a
// proven win in exactly \`winIn\` White moves against perfect defence. Pawns
// move one square straight forward onto an empty square or one square
// diagonally forward onto an empty square or an enemy pawn (the capture;
// straight captures do not exist). First pawn to the far rank wins; a side
// with no pawns or no legal move loses; every move advances a pawn, so the
// game always ends and there are no draws of any kind.
//
//   cols/rows        the board (6x6 or 7x7 by the weekday ramp)
//   white/black      pawn cells, file letter + rank number, rank 1 at the
//                    bottom; White runs UP toward the top rank
//   winIn            White's proven distance in White moves. No draws exist,
//                    so EVERY other first move loses outright; exactly one
//                    wins, and the losers include real traps that lose slowly
//                    enough to tempt.
//   keyUci / keySan  the key move, for the verifier and the reveal-to-solvers
//                    line. Stripped server-side, never sent to the browser.
//   states           the reachable game tree's size, kept under 200k so the
//                    browser re-solves the position exactly and Black's play
//                    is perfect, never heuristic.
//
// The ramp was MEASURED (2026-08-21), not guessed: three pawns a side is the
// deepest this game goes under an exactly-solvable tree (a fourth pawn blows
// the cap and collapses the win to two moves), and small boards run DEEPER
// than big ones because the defence is more constrained. Mon 6x6 and Tue 7x7
// win in 3; Wed 6x6, Thu 7x7, Fri 7x7 win in 4; Saturday keeps win in 4 but
// hides the key among at least six legal moves and four slow traps; the
// Sunday Edition is the longest race of the week, 7x7 and win in 5. All of it
// is enforced by scripts/verify-race.mjs with its own independent solver.
export const PUZZLES = [
`;
const rows = state.days.map((p) => `  { num: ${p.num}, quizId: '${p.quizId}', live: '${p.live}', dateLabel: '${p.dateLabel}', sunday: ${p.sunday}, cols: ${p.cols}, rows: ${p.rows}, winIn: ${p.winIn}, white: [${p.white.map((x) => `'${x}'`).join(', ')}], black: [${p.black.map((x) => `'${x}'`).join(', ')}], keyUci: '${p.keyUci}', keySan: '${p.keySan}', states: ${p.states} },`);
process.stdout.write(HEADER + rows.join('\n') + '\n];\n');
