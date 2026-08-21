// Bank generator for Babel.
//
// A hand-built endgame always looks hand-built, so every position here is the
// tail of a real game: the engine deals a 64-tile bag, plays itself down to an
// empty bag with a bit of noise so the boards differ, and keeps going until
// both racks are at the day's target size. Whatever the board looks like at
// that moment IS the puzzle — tight, plausible, and nobody's darling.
//
// The benchmark is then the exact value of that endgame under lib/babel-engine's
// search,
// which is the same search the client defends with, so the number is a promise
// rather than an estimate.
//
//   node scripts/gen-babel.mjs --from 2026-08-02 --days 30 --startnum 1
//
// EXTENDING an existing bank: pass --avoid <path to the live puzzles.js or a
// raw .json> so the new range is deduped against what is already banked, not
// just against itself. Two boards are the same puzzle if the grid is identical
// or if the player's rack and the opponent's rack are the same two multisets,
// and a repeat is refused rather than reordered. Without --avoid the generator
// dedupes only within its own run, so a spliced range can silently repeat a
// position from the frozen half of the bank.
//
//   node scripts/gen-babel.mjs --from 2026-09-09 --days 24 --startnum 39 \
//     --avoid app/babel/puzzles.js --out /tmp/babel-a.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  BAG, buildLexicon, emptyBoard, generateMoves, applyMove,
  solveLine, boardToRows, rackSum,
} from '../lib/babel-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// ─── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const FROM = arg('--from', '2026-08-02');
const DAYS = Number(arg('--days', '30'));
const STARTNUM = Number(arg('--startnum', '1'));
const OUT = arg('--out', path.join(ROOT, 'app/babel/puzzles.js'));
// Solving a Sunday takes ten seconds and the sandbox reaps long jobs, so the
// run is resumable: --budget stops cleanly after N seconds and writes what it
// finished, and the next call picks up with --from/--startnum. Writing a .json
// OUT emits raw records for merging instead of the final module.
const BUDGET = Number(arg('--budget', '0'));
const AS_JSON = OUT.endsWith('.json');
// --avoid <path>: an already-banked file (puzzles.js or a raw .json) whose
// positions this run must not reproduce. Seeded on the signatures below and
// then added to as the run goes, so the set covers the merged bank rather than
// this range alone.
const AVOID = arg('--avoid', '');

// A position's identity, two ways. The grid is the strong one; the rack pair is
// the one a player would actually notice, since the board scrolls past but
// "I have had this exact rack against that exact rack" does not.
const boardSig = (rows) => rows.join('|');
const rackSig = (me, foe) => `${me.slice().sort().join('')}/${foe.slice().sort().join('')}`;

const seenBoards = new Set();
const seenRacks = new Set();
if (AVOID) {
  const abs = path.isAbsolute(AVOID) ? AVOID : path.join(ROOT, AVOID);
  let prior;
  if (abs.endsWith('.json')) prior = JSON.parse(fs.readFileSync(abs, 'utf8'));
  else prior = (await import(pathToFileURL(abs).href)).PUZZLES;
  for (const p of prior) {
    seenBoards.add(boardSig(p.board));
    seenRacks.add(rackSig(p.rack, p.foe));
  }
  console.log(`avoiding ${prior.length} banked positions from ${AVOID}`);
}

// ─── seeded rng (mulberry32) ───────────────────────────────────────────────
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ─── dates ─────────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function parts(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, dd: d.getUTCDate(), dow: d.getUTCDay() };
}

// ─── lexicons ──────────────────────────────────────────────────────────────
// TWO word lists, on purpose.
//
//   babel-common.txt  every 2- and 3-letter word plus the 4-8s that clear the
//                     Lode frequency floor. The engine builds boards and plays
//                     its defence from THIS list, so the position a player
//                     opens is real English and the opponent never answers with
//                     SLAGGY or FAIX.
//   tuck-dict.txt     the full 115k list, used only to validate what the PLAYER
//                     lays down. Anything Tuck accepts, Babel accepts, so the
//                     asymmetry runs entirely in the player's favour: they may
//                     reach for vocabulary the engine will never use.
const lex = buildLexicon(fs.readFileSync(path.join(ROOT, 'public/babel-common.txt'), 'utf8').split('\n'));
console.log(`engine lexicon: ${lex.nodes} nodes`);

// ─── one self-played game, stopped at the endgame ──────────────────────────
function freshBag(rand) {
  const bag = [];
  for (const [L, n] of Object.entries(BAG)) for (let i = 0; i < n; i++) bag.push(L);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Mid-game play choice: mostly the best move, sometimes the 2nd-5th, which is
// what keeps thirty boards from all looking like the same greedy staircase.
function pickMidgame(moves, rand) {
  if (!moves.length) return null;
  const top = moves.slice(0, 5);
  const r = rand();
  const i = r < 0.55 ? 0 : r < 0.78 ? 1 : r < 0.9 ? 2 : r < 0.97 ? 3 : 4;
  return top[Math.min(i, top.length - 1)];
}

function buildPosition(seed, target) {
  const rand = rng(seed);
  const bag = freshBag(rand);
  let board = emptyBoard();
  const racks = [[], []];
  const draw = (i) => { while (racks[i].length < 7 && bag.length) racks[i].push(bag.pop()); };
  draw(0); draw(1);

  let turn = 0;
  let passes = 0;
  let plies = 0;

  // Phase 1: play until the bag is empty.
  while (bag.length && plies < 40) {
    const moves = generateMoves(board, racks[turn], lex);
    const mv = pickMidgame(moves, rand);
    if (!mv) { passes++; if (passes >= 2) return null; }
    else {
      passes = 0;
      const res = applyMove(board, racks[turn], mv);
      board = res.board; racks[turn] = res.rack;
      draw(turn);
    }
    turn = 1 - turn;
    plies++;
  }
  if (bag.length) return null;

  // Phase 2: keep playing until both racks are down to the target size. The
  // side to move when that happens is the player.
  let guard = 0;
  while ((racks[0].length > target || racks[1].length > target) && guard < 20) {
    const moves = generateMoves(board, racks[turn], lex);
    // Prefer a move that sheds exactly enough tiles to land on target, so the
    // freeze happens on a natural play rather than mid-thought.
    const want = racks[turn].length - target;
    const fit = want > 0 ? moves.filter((m) => m.tiles.length === want) : [];
    const mv = (fit.length ? fit[0] : null) || pickMidgame(moves, rand);
    if (!mv) { passes++; if (passes >= 2) return null; }
    else {
      passes = 0;
      const res = applyMove(board, racks[turn], mv);
      board = res.board; racks[turn] = res.rack;
    }
    turn = 1 - turn;
    guard++;
  }
  if (racks[0].length > target || racks[1].length > target) return null;
  if (!racks[0].length || !racks[1].length) return null;
  // Self-play sheds vowels first, so left alone it hands out all-consonant
  // racks that are simply stuck rather than hard. Both sides need at least one
  // vowel to have a game worth playing.
  const hasVowel = (r) => r.some((L) => 'AEIOU'.includes(L));
  if (!hasVowel(racks[0]) || !hasVowel(racks[1])) return null;

  return { board, me: racks[turn].slice(), opp: racks[1 - turn].slice() };
}

// Play both sides greedily to get the "obvious" score, the number a player
// lands on with no endgame thought at all.
function greedyLine(pos) {
  let b = pos.board, me = pos.me.slice(), opp = pos.opp.slice();
  let spread = 0, passes = 0, turn = 0, guard = 0;
  while (guard++ < 12) {
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
      spread += (turn === 0 ? 1 : -1) * 2 * rackSum(turn === 0 ? opp : me);
      return spread;
    }
    turn = 1 - turn;
  }
  return spread + (rackSum(opp) - rackSum(me));
}

// A position earns its place only if it is actually a puzzle: the player needs
// real options, the endgame has to be winnable from their seat, and the best
// line has to beat the lazy line by enough that thinking is rewarded.
//
// Either side may be the player. The board plus two racks is a legal position
// whichever seat you take, so when the side that happens to be on move is busted
// we simply hand the player the other chair rather than throw the board away.
function assess(pos, target) {
  const seats = [
    { me: pos.me, opp: pos.opp },
    { me: pos.opp, opp: pos.me },
  ];
  for (const seat of seats) {
    // The rules text promises a specific rack size ("you hold five tiles", six
    // on Sunday), so the player's seat must hold exactly that. Self-play can
    // shed more tiles than intended on the last shaping move, and a Sunday that
    // quietly dealt four tiles would make the Sunday Edition badge a lie.
    if (seat.me.length !== target) continue;
    // The Q is left wherever the self-play put it (owner ruling): on the board
    // about three games in four, as in the real game, otherwise on either
    // rack. Holding it yourself is a real endgame problem, and deducing that
    // THEY hold it, then working out whether QI is still open to them, is the
    // best read the game offers. Neither case is filtered out.
    const moves = generateMoves(pos.board, seat.me, lex);
    if (moves.length < 15) continue;         // too few options to be a choice
    const greedy = greedyLine({ board: pos.board, me: seat.me, opp: seat.opp });
    // Cheap gate first: if even the greedy line is deeply underwater the seat is
    // not worth a full playout.
    if (greedy < -30) continue;
    const t0 = Date.now();
    const res = solveLine(pos.board, seat.me, seat.opp, lex);
    const ms = Date.now() - t0;
    if (res.end === 'guard') continue;       // did not terminate: throw it away
    if (res.line[0].word === 'pass') continue; // dead board, nothing to play
    if (res.spread < 8) continue;            // nothing to win from this seat
    if (res.spread - greedy < 4) continue;   // greed already finds it
    return { benchmark: res.spread, ms, greedy, moveCount: moves.length, seat, plies: res.line.length };
  }
  return null;
}

// ─── build the bank ────────────────────────────────────────────────────────
const out = [];
let made = 0, tries = 0;
const T0 = Date.now();

for (let i = 0; i < DAYS; i++) {
  if (BUDGET && (Date.now() - T0) / 1000 > BUDGET) {
    console.log(`budget reached — stopping after ${made} days; resume with --from ${addDays(FROM, i)} --startnum ${STARTNUM + i}`);
    break;
  }
  const iso = addDays(FROM, i);
  const p = parts(iso);
  const sunday = p.dow === 0;
  // Sunday Edition: six tiles a side instead of five. One extra tile each way
  // roughly triples the tree and usually adds a turn, which is exactly the
  // step up the other Sunday Editions make.
  const target = sunday ? 6 : 5;

  let found = null;
  for (let attempt = 0; attempt < 400 && !found; attempt++) {
    tries++;
    const seed = hashSeed(`babel|${iso}|${attempt}`);
    const pos = buildPosition(seed, target);
    if (!pos) continue;
    const a = assess(pos, target);
    if (!a) continue;
    // Refuse a repeat outright. This is an extra bar on top of assess(), never
    // a relaxation of one: a rejected candidate just costs another attempt.
    const bSig = boardSig(boardToRows(pos.board));
    const rSig = rackSig(a.seat.me, a.seat.opp);
    if (seenBoards.has(bSig) || seenRacks.has(rSig)) continue;
    seenBoards.add(bSig);
    seenRacks.add(rSig);
    found = { pos, a };
  }
  if (!found) { console.error(`FAILED to build ${iso}`); process.exit(1); }

  const { pos, a } = found;
  const num = STARTNUM + i;
  out.push({
    num,
    quizId: `babel-${p.m}-${p.dd}-${String(p.y).slice(2)}`,
    live: iso,
    dateLabel: `${MONTHS[p.m - 1]} ${p.dd}, ${p.y}`,
    sunday,
    board: boardToRows(pos.board),
    rack: a.seat.me,
    foe: a.seat.opp,
    benchmark: a.benchmark,
    greedy: a.greedy,
  });
  made++;
  console.log(`${iso}${sunday ? ' [SUN]' : '     '} #${num}  ${a.seat.me.join('')} vs ${a.seat.opp.join('')}  benchmark ${a.benchmark}  greedy ${a.greedy}  moves ${a.moveCount}  ${a.plies} plies ${a.ms}ms`);
}

// ─── write ─────────────────────────────────────────────────────────────────
if (AS_JSON) {
  fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
  console.log(`\nwrote ${made} raw records to ${OUT} (${tries} positions tried, ${Math.round((Date.now() - T0) / 1000)}s)`);
  process.exit(0);
}

const header = `// Puzzle data for Babel, the daily Scrabble endgame. Imported ONLY by the
// server page (app/babel/page.js), which filters live<=today AND strips \`foe\`
// before handing anything to the browser — the opponent's rack is the thing you
// are meant to deduce, so it must never ship early.
//
// Each day is the tail of a real self-played game (scripts/gen-babel.mjs): the
// bag is empty, both racks are frozen at five tiles (six in the Sunday
// Edition), and \`benchmark\` is the exact value of the endgame under the shared
// search in lib/babel-engine.js — the same search the client defends with, so
// the benchmark is always reachable. \`greedy\` is what always grabbing the biggest number
// gets you, and every banked day pays at least 4 more than that for playing the
// endgame properly.
//
// Validate with scripts/verify-babel.mjs after ANY edit; it recomputes the benchmark and
// greedy from the stored board and fails on drift.
export const PUZZLES = [
`;
const body = out.map((p) => {
  const board = p.board.map((r) => JSON.stringify(r)).join(', ');
  return `  { num: ${p.num}, quizId: ${JSON.stringify(p.quizId)}, live: ${JSON.stringify(p.live)}, dateLabel: ${JSON.stringify(p.dateLabel)}, sunday: ${p.sunday}, benchmark: ${p.benchmark}, greedy: ${p.greedy},\n    rack: ${JSON.stringify(p.rack)}, foe: ${JSON.stringify(p.foe)},\n    board: [${board}] },`;
}).join('\n');
fs.writeFileSync(OUT, header + body + '\n];\n');
console.log(`\nwrote ${made} puzzles to ${OUT} (${tries} positions tried, ${Math.round((Date.now() - T0) / 1000)}s)`);
