// Verifier for the Babel bank. Run after ANY edit to app/babel/puzzles.js or
// lib/babel-engine.js:
//
//   node scripts/verify-babel.mjs [--from 2026-08-02]
//
// Four checks per banked day, and the fourth is the one that matters:
//
//   1. par recomputes from the stored board to the stored number.
//   2. greedy recomputes likewise.
//   3. the opponent's rack the CLIENT derives (bag minus board minus your rack)
//      is exactly the rack the generator banked. If this ever fails, the client
//      is playing a different game from the one that was solved.
//   4. PAR IS ACTUALLY REACHABLE: play the solver's own line against the very
//      defence the client runs (bestReply), and the final spread must land on
//      par. A par nobody can hit is a broken promise, and only a full playout
//      catches it — recomputing the number proves nothing about whether the
//      defence in the browser matches the defence in the search.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BAG, buildLexicon, rowsToBoard, generateMoves, applyMove, solveLine, rackSum,
} from '../lib/babel-engine.js';
import { PUZZLES } from '../app/babel/puzzles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const FROM = (args.indexOf('--from') >= 0 ? args[args.indexOf('--from') + 1] : null);

const lex = buildLexicon(fs.readFileSync(path.join(ROOT, 'public/babel-common.txt'), 'utf8').split('\n'));

function deriveFoe(rows, rack) {
  const left = { ...BAG };
  for (const row of rows) for (const ch of row) if (ch !== '.') left[ch] = (left[ch] || 0) - 1;
  for (const L of rack) left[L] = (left[L] || 0) - 1;
  const out = [];
  for (const L of Object.keys(left)) {
    if (left[L] < 0) return { bad: `negative count for ${L}` };
    for (let i = 0; i < left[L]; i++) out.push(L);
  }
  return { rack: out };
}

function greedyLine(board, me0, opp0) {
  let b = board, me = me0.slice(), opp = opp0.slice();
  let spread = 0, passes = 0, turn = 0, guard = 0;
  while (guard++ < 40) {
    const rack = turn === 0 ? me : opp;
    const moves = generateMoves(b, rack, lex);
    if (!moves.length) {
      passes++;
      if (passes >= 2) break;
      turn = 1 - turn; continue;
    }
    passes = 0;
    const mv = moves[0];
    const res = applyMove(b, rack, mv);
    b = res.board;
    if (turn === 0) { me = res.rack; spread += mv.score; }
    else { opp = res.rack; spread -= mv.score; }
    if ((turn === 0 ? me : opp).length === 0) {
      return spread + (turn === 0 ? 1 : -1) * 2 * rackSum(turn === 0 ? opp : me);
    }
    turn = 1 - turn;
  }
  return spread + (rackSum(opp) - rackSum(me));
}

let fail = 0, checked = 0;
for (const p of PUZZLES) {
  if (FROM && p.live < FROM) continue;
  checked++;
  const board = rowsToBoard(p.board);
  const problems = [];

  const d = deriveFoe(p.board, p.rack);
  if (d.bad) problems.push(`bag accounting: ${d.bad}`);
  else if (d.rack.slice().sort().join('') !== p.foe.slice().sort().join('')) {
    problems.push(`derived foe ${d.rack.slice().sort().join('')} != banked ${p.foe.slice().sort().join('')}`);
  }

  const gr = greedyLine(board, p.rack, p.foe);
  if (gr !== p.greedy) problems.push(`greedy ${p.greedy} recomputes to ${gr}`);

  // The one that matters: replay the solver's line against the browser's own
  // defence and confirm the spread lands exactly on the banked par.
  const out = solveLine(board, p.rack, p.foe, lex);
  if (out.end === 'guard') problems.push('playout did not terminate');
  else if (out.spread !== p.par) {
    const pretty = out.line.map((m) => `${m.who === 'you' ? 'you' : 'them'}:${m.word}${m.score ? '+' + m.score : ''}`).join(' ');
    problems.push(`PAR NOT REACHABLE: the line yields ${out.spread}, par claims ${p.par} [${pretty}]`);
  }
  if (out.spread <= p.greedy) problems.push(`par ${p.par} does not beat greedy ${p.greedy}`);

  if (problems.length) { fail++; console.error(`FAIL ${p.live} #${p.num}\n   ${problems.join('\n   ')}`); }
  else console.log(`ok   ${p.live} #${p.num}  par ${p.par >= 0 ? '+' : ''}${p.par}  greedy ${p.greedy >= 0 ? '+' : ''}${p.greedy}  ${out.line.length} plies  ${out.end}`);
}

console.log(`\n${checked - fail}/${checked} puzzles verified`);
if (fail) { console.error(`${fail} FAILURES`); process.exit(1); }
