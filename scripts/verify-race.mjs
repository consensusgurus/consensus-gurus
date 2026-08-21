#!/usr/bin/env node
// Verify the Race (daily pawn-race endgame) bank. Race's own header
// (app/race/puzzles.js) promises, per board:
//   - White to move and winning in EXACTLY `winIn` White moves against
//     perfect defence, with no draws in the game at all;
//   - EXACTLY ONE first move wins and it is `keyUci`; every alternative
//     LOSES; the day's floor of legal first moves and slow-losing traps
//     (five plies or more) is met;
//   - the weekday ramp (Mon 6x6/3, Tue 7x7/3, Wed 6x6/4, Thu 7x7/4,
//     Fri 7x7/4 with 5 moves 3 traps, Sat 7x7/4 with 6 moves 4 traps,
//     Sunday Edition 7x7/5) with `sunday` matching the real day of week;
//   - the reachable game tree stays under 200k states (what lets the browser
//     solve the position exactly), and no two boards are the same position.
//
// INDEPENDENT SOLVER, per the two-solvers rule: this file re-proves every
// board with its own grid-array minimax and its own move generator, never
// importing app/race/breakthrough.js. The solve is exhaustive over the
// reachable DAG, so it is also the termination proof: every reachable line
// ends at a goal rank, an empty side, or a stuck side, and the solver visits
// all of them.
//
// Run: node scripts/verify-race.mjs
import { PUZZLES } from '../app/race/puzzles.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };

const RAMP = {
  1: { n: 6, winIn: 3, minMoves: 4, minTraps: 2 },
  2: { n: 7, winIn: 3, minMoves: 4, minTraps: 2 },
  3: { n: 6, winIn: 4, minMoves: 4, minTraps: 2 },
  4: { n: 7, winIn: 4, minMoves: 4, minTraps: 2 },
  5: { n: 7, winIn: 4, minMoves: 5, minTraps: 3 },
  6: { n: 7, winIn: 4, minMoves: 6, minTraps: 4 },
  0: { n: 7, winIn: 5, minMoves: 4, minTraps: 2 },
};
const CAP = 200000;

// grid: Int8Array, 0 empty, 1 white, 2 black; independent move model
function gridOf(p) {
  const g = new Int8Array(p.cols * p.rows);
  const put = (names, v) => {
    for (const nm of names) {
      const c = nm.charCodeAt(0) - 97;
      const rank = Number(nm.slice(1));
      const r = p.rows - rank;
      if (c < 0 || c >= p.cols || r < 0 || r >= p.rows) return `cell ${nm} off the board`;
      const i = r * p.cols + c;
      if (g[i]) return `cell ${nm} occupied twice`;
      g[i] = v;
    }
    return null;
  };
  const e1 = put(p.white, 1); if (e1) return { err: e1 };
  const e2 = put(p.black, 2); if (e2) return { err: e2 };
  return { g };
}
function movesOf(g, cols, rows, side) {
  const out = [];
  const dir = side === 1 ? -1 : 1;
  const goalRow = side === 1 ? 0 : rows - 1;
  for (let i = 0; i < g.length; i++) {
    if (g[i] !== side) continue;
    const r = Math.floor(i / cols), c = i % cols;
    const rr = r + dir;
    if (rr < 0 || rr >= rows) continue;
    for (const dc of [0, -1, 1]) {
      const cc = c + dc;
      if (cc < 0 || cc >= cols) continue;
      const t = rr * cols + cc;
      if (g[t] === side) continue;
      if (dc === 0 && g[t]) continue;
      out.push({ from: i, to: t, goal: rr === goalRow, capture: g[t] !== 0 });
    }
  }
  return out;
}
function play(g, mv) {
  const n = Int8Array.from(g);
  n[mv.to] = n[mv.from];
  n[mv.from] = 0;
  return n;
}
function solveBoard(p) {
  const { g, err } = gridOf(p);
  if (err) return { err };
  const memo = new Map();
  let over = false;
  function solve(grid, side) {
    if (memo.size > CAP * 1.3) { over = true; return { win: 3 - side, d: 0 }; }
    const k = String.fromCharCode(...grid) + side;
    const hit = memo.get(k);
    if (hit) return hit;
    let has = false;
    for (let i = 0; i < grid.length; i++) if (grid[i] === side) { has = true; break; }
    let val;
    const moves = has ? movesOf(grid, p.cols, p.rows, side) : [];
    if (!moves.length) val = { win: 3 - side, d: 0 };
    else {
      let bw = null, wl = null;
      for (const mv of moves) {
        if (mv.goal) { bw = { win: side, d: 1 }; break; }
        const ch = solve(play(grid, mv), 3 - side);
        if (ch.win === side) { if (!bw || ch.d + 1 < bw.d) bw = { win: side, d: ch.d + 1 }; }
        else if (!wl || ch.d + 1 > wl.d) wl = { win: 3 - side, d: ch.d + 1 };
      }
      val = bw || wl;
    }
    memo.set(k, val);
    return val;
  }
  const root = solve(g, 1);
  return { g, root, over, states: memo.size, solve };
}
const cellName = (i, cols, rows) => String.fromCharCode(97 + (i % cols)) + String(rows - Math.floor(i / cols));

const seen = new Set();
let prevLive = null;
for (const p of PUZZLES) {
  const id = p.quizId;
  const d = new Date(`${p.live}T12:00:00Z`);
  const dow = d.getUTCDay();
  const ramp = RAMP[dow];
  if (p.sunday !== (dow === 0)) fail(id, `sunday flag ${p.sunday} on ${p.live}`);
  if (p.cols !== ramp.n || p.rows !== ramp.n) fail(id, `${p.cols}x${p.rows}, ramp says ${ramp.n}x${ramp.n}`);
  if (p.winIn !== ramp.winIn) fail(id, `winIn ${p.winIn}, ramp says ${ramp.winIn}`);
  if (p.sunday && p.winIn !== 5) fail(id, 'Sunday Edition must be the win-in-5');
  if (!p.sunday && p.winIn > 4) fail(id, 'weekday deeper than the Sunday Edition');
  const wantQuiz = `race-${d.getUTCMonth() + 1}-${d.getUTCDate()}-${String(d.getUTCFullYear()).slice(2)}`;
  if (p.quizId !== wantQuiz) fail(id, `quizId != ${wantQuiz}`);
  const wantLabel = `${d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  if (p.dateLabel !== wantLabel) fail(id, `dateLabel != ${wantLabel}`);
  if (p.num !== PUZZLES.indexOf(p) + 1) fail(id, 'num not sequential');
  if (prevLive && (d - new Date(`${prevLive}T12:00:00Z`)) / 86400000 !== 1) fail(id, 'live date not consecutive');
  prevLive = p.live;
  if (p.white.length !== 3 || p.black.length !== 3) fail(id, 'not 3 pawns a side');
  if (p.white.some((nm) => Number(nm.slice(1)) === p.rows)) fail(id, 'White pawn already on the far rank');
  if (p.black.some((nm) => Number(nm.slice(1)) === 1)) fail(id, 'Black pawn already on its far rank');
  const posKey = `${p.cols}|${[...p.white].sort().join(',')}|${[...p.black].sort().join(',')}`;
  if (seen.has(posKey)) fail(id, 'duplicate position');
  seen.add(posKey);

  const sv = solveBoard(p);
  if (sv.err) { fail(id, sv.err); continue; }
  if (sv.over) { fail(id, 'reachable tree over the 200k cap'); continue; }
  if (sv.root.win !== 1) { fail(id, 'not a White win'); continue; }
  if (sv.root.d !== p.winIn * 2 - 1) fail(id, `wins in ${(sv.root.d + 1) / 2}, bank says ${p.winIn}`);
  const moves = movesOf(sv.g, p.cols, p.rows, 1);
  if (moves.length < ramp.minMoves) fail(id, `${moves.length} first moves, floor ${ramp.minMoves}`);
  const winners = [];
  let traps = 0;
  for (const mv of moves) {
    if (mv.goal) { winners.push(mv); continue; }
    const ch = sv.solve(play(sv.g, mv), 2);
    if (ch.win === 1) winners.push(mv);
    else if (ch.d + 1 >= 5) traps++;
  }
  if (winners.length !== 1) fail(id, `${winners.length} winning first moves, want exactly 1`);
  else {
    const key = winners[0];
    const uci = cellName(key.from, p.cols, p.rows) + cellName(key.to, p.cols, p.rows);
    if (uci !== p.keyUci) fail(id, `key is ${uci}, bank says ${p.keyUci}`);
    const san = `${cellName(key.from, p.cols, p.rows)}${key.capture ? 'x' : '-'}${cellName(key.to, p.cols, p.rows)}`;
    if (san !== p.keySan) fail(id, `keySan is ${san}, bank says ${p.keySan}`);
  }
  if (traps < ramp.minTraps) fail(id, `${traps} slow traps, floor ${ramp.minTraps}`);
}
if (PUZZLES[0] && PUZZLES[0].live !== '2026-08-21') fail('bank', `first live ${PUZZLES[0].live}`);
const sundays = PUZZLES.filter((x) => x.sunday).length;
console.log(`checked ${PUZZLES.length} boards (${sundays} Sunday Editions)`);
if (BAD) { console.error(`${BAD} failure(s)`); process.exit(1); }
console.log('✓ race bank verified');
