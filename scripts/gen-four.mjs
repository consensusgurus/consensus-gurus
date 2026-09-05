// Bank generator for Four, the daily Connect Four position.
//
// WHAT IT BUILDS. One board per day: a real, reachable Connect Four position
// with YOU (red, player 1) to move and a forced win, weekdays a win in exactly
// four of your moves, Sundays exactly five. Fields match app/four/puzzles.js
// exactly (num, quizId, live, dateLabel, sunday, winIn, cells, key, rootScore,
// motif) and every number is recomputed here, never typed.
//
// HOW TO RUN
//   node scripts/gen-four.mjs --probe                        yield/spread only
//   node scripts/gen-four.mjs --from 2026-09-30 --days 62 --startnum 63 \
//        --avoid app/four/puzzles.js --seed 20260930 --out /tmp/four-new.js
//   node scripts/_append.mjs four gen-four.mjs 2026-11-30    the house wrapper:
//        derives --from/--days/--startnum/--seed from the live bank and splices
//        ONLY the new rows onto the end, so frozen boards are never rewritten.
//   node scripts/verify-four.mjs                             the gate
//
// REACHABILITY IS THE POINT OF THE CONSTRUCTION. Boards are never filled in;
// they are SNAPSHOTS OF A GAME. The generator self-plays from the empty board
// with a noisy, blocking, center-biased policy and photographs the position
// whenever it is red's turn. Equal disc counts, gravity and "nobody had already
// won" then come for free, and the move list that produced each board is kept
// and REPLAYED before the board ships (`replayProof`), which is a machine proof
// of reachability rather than an argument for it. Nothing else in the pipeline
// can prove it: `cells` carries no history, so verify-four.mjs can only check
// the three static legality conditions.
//
// THE SECOND SOLVER. verify-four.mjs re-solves every board with the SHIPPING
// engine, app/four/c4.js. That is only a real second opinion if the generator
// did not hand it its own numbers, so every candidate is solved TWICE here,
// once with c4.js and once with scripts/four-solver2.mjs -- a null-window
// driver over a base-4 incremental position code in a nested Map, with none of
// c4.js's Zobrist hashing, forced-block collapse, suicide-move skip or window
// clamping. The two must agree on the score of EVERY legal column or the
// candidate is thrown away (`--mismatches` reports the count; it has always
// been 0). Do not "simplify" this by importing c4.js twice.
//
// QUALITY BARS THIS ADDS, above what the verifier can see
//   * THE KEY IS THE ONLY COLUMN THAT STILL WINS, not merely the fastest.
//     puzzles.js promises exactly that, but the verifier only checks that one
//     column holds the TOP score, so 11 of the 62 frozen boards ship a second,
//     slower winning column. Here every non-key column must score <= 0.
//   * THE ENGINE MAY NOT ALREADY BE THREATENING at the root. If yellow has an
//     immediate winning square, red's only move is the block, "exactly one
//     column wins" is trivially true and there is no puzzle. 20 of the 62
//     frozen boards are that shape. None of the new ones are.
//   * At least 5 legal columns (6 on Sundays), so the choice is real.
//   * Sundays run deeper as well as longer: <= 26 discs on the board, so there
//     is more space and more branching behind the five-move win.
//
// POOL CEILINGS across the WHOLE combined bank (frozen boards pre-seed every
// counter through --avoid). Per-board legality passes happily on a bank that
// says the same thing every day; these are the documented ceilings:
//   * key column          <= 11 of the new range, and never the same key column
//                          on two consecutive days;
//   * discs on the board  <= 14 per value for weekdays, <= 4 for Sundays,
//                          spread over 20/22/24/26/28/30 (this is what sets
//                          rootScore, so it is the rootScore spread);
//   * opening             the game's first 8 plies may repeat at most twice,
//                          its first 4 plies at most 6 times;
//   * motif               every new motif string is UNIQUE and matches no
//                          frozen one (verify-four.mjs's own ceiling is 2).
//   * finishing shape     each of the four winning-line directions at most 40%
//                          of the range; quiet keys and forcing keys each at
//                          most 62%;
//   * near-duplicate      no new board may sit within 10 differing cells of any
//     boards               other board in the combined bank, compared BOTH
//                          straight and left-right mirrored. Identical `cells`
//                          is the check verify-four.mjs makes; it is nowhere
//                          near enough. The first run of this generator put two
//                          boards four cells apart (a color swap in two
//                          columns) five days from each other, and the frozen
//                          bank has a six-cell pair on CONSECUTIVE days,
//                          2026-08-17 and 2026-08-18.
//
// MOTIFS ARE COMPUTED, NOT PICKED. Each one is assembled from facts read off
// that board's own forced win: whether the key threatens anything and in which
// direction, which column it lands in, which of your moves first leaves two
// winning squares at once, whether your last two drops stack, and the shape of
// the finishing four -- checked over EVERY defense, not just the main line, so
// "every defense ends the same way" is only said when the whole tree agrees.
// Phrasing varies over a seeded rotation and the assembled string is rejected
// if it already exists anywhere in the bank.
//
// WHAT LIMITS THE RUNWAY. Raw supply is ~0.4 accepted positions per second of
// self-play on one core, but it is not evenly spread: positions with 20 or 22
// discs are several times commoner than 28 or 30, and Sunday five-move wins on
// a 24-26 disc board are the thinnest bucket of all. The collector therefore
// runs to a time budget and stops early only once every bucket's target is met.
// If a bucket cannot be filled, the assignment falls back to the next-least-used
// value rather than degrading a board, and the run prints the final histogram.
//
// SEEDING AND REPRODUCIBILITY. --seed is mixed with --startnum
// (seed ^ startnum * 2654435761), so a spliced range can never replay the
// frozen one even if the same --seed is passed twice. Everything after that is
// seeded, so an unchanged command line reproduces byte-identically -- with one
// trap worth knowing about: the COLLECTOR is bounded by the wall clock as well
// as by its targets, and a pool cut short by the clock depends on how busy the
// machine was. So a run that ends on "budget spent" rather than "targets met"
// EXITS NONZERO unless --allow-short is passed; raise --budget instead. The
// 2026-09-30 run met its targets after 1,600s of a 3,000s budget and collected
// the same 600 candidates from the same 76,562 games on both attempts.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  emptyBoard, deserialize, serialize, play, undo, winsAt, findAnyWin,
  scoreMoves, movesToWin, COLS, ROWS, SIZE,
} from '../app/four/c4.js';
import * as S2 from './four-solver2.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);

// ── knobs ──────────────────────────────────────────────────────────────────
const PLY_VALUES = [20, 22, 24, 26, 28, 30];
const SUNDAY_PLY_VALUES = [20, 22, 24, 26];
const KEY_CEILING_FRAC = 11 / 62;       // key column, share of the new range
const PLY_CEILING_WEEKDAY = 14;
const PLY_CEILING_SUNDAY = 4;
const OPEN8_CEILING = 2;                // identical first 8 plies
const OPEN4_CEILING = 6;                // identical first 4 plies
const MIN_DISTINCT = 10;                // cells two boards must differ in, mirrors included
const MIN_COLS_WEEKDAY = 5;
const MIN_COLS_SUNDAY = 6;
const SUNDAY_MAX_PLIES = 26;
const TREE_NODE_CAP = 20000;            // nodes in the best-defense tree walk, per board

const CACHE = '/tmp/build/four-cache';

// ── rng ────────────────────────────────────────────────────────────────────
const startNum = Number(arg('--startnum', 1));
let seed = ((Number(arg('--seed', 20260930)) >>> 0) ^ (Math.imul(startNum, 2654435761) >>> 0)) >>> 0;
if (seed === 0) seed = 0x9e3779b9;
const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length) % a.length];

// ── dates ──────────────────────────────────────────────────────────────────
const iso = (d) => d.toISOString().slice(0, 10);
const label = (s) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const isSunday = (s) => new Date(`${s}T12:00:00Z`).getUTCDay() === 0;
const quizIdOf = (s) => { const [y, m, d] = s.split('-'); return `four-${Number(m)}-${Number(d)}-${y.slice(2)}`; };

// ── self-play ──────────────────────────────────────────────────────────────
// A noisy but not silly policy: it never walks into a loss it can see, it always
// answers an immediate threat, and it leans on the center by a per-game amount.
// That is roughly how a club player fills a board, and it is what puts the
// threat shapes where a real game puts them.
function selfPlay() {
  const b = emptyBoard();
  const hist = [];
  const snaps = [];
  const bias = 0.15 + rnd() * 1.85;
  const noise = 0.04 + rnd() * 0.18;   // chance of ignoring the "don't hang it" filter
  const stop = 30 + Math.floor(rnd() * 8);
  while (b.plies < stop) {
    let winnow = -1;
    for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS && winsAt(b, c, b.heights[c], b.turn)) { winnow = c; break; }
    if (winnow >= 0) break;                       // the game would end here
    if (b.turn === 1 && b.plies >= 20) snaps.push({ cells: serialize(b), plies: b.plies, hist: hist.slice() });
    const opp = b.turn === 1 ? 2 : 1;
    const threats = [];
    for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS && winsAt(b, c, b.heights[c], opp)) threats.push(c);
    let choice;
    if (threats.length) {
      choice = threats.length === 1 ? threats[0] : pick(threats);
    } else {
      const safe = [], all = [];
      for (let c = 0; c < COLS; c++) {
        if (b.heights[c] >= ROWS) continue;
        all.push(c);
        if (b.heights[c] + 1 < ROWS) {
          const h = b.heights[c];
          b.cells[c * ROWS + h] = b.turn;
          const bad = winsAt(b, c, h + 1, opp);
          b.cells[c * ROWS + h] = 0;
          if (bad) continue;
        }
        safe.push(c);
      }
      const pool = (safe.length && rnd() > noise) ? safe : all;
      const w = pool.map((c) => Math.exp(-bias * Math.abs(c - 3)));
      let total = 0; for (const x of w) total += x;
      let t = rnd() * total, i = 0;
      while (i < pool.length - 1 && t > w[i]) { t -= w[i]; i++; }
      choice = pool[i];
    }
    hist.push(choice);
    play(b, choice);
  }
  return snaps;
}

// Left-right mirror of a serialized board: the same puzzle seen in a mirror, and
// therefore the same puzzle.
function mirrorCells(c) {
  let o = '';
  for (let col = COLS - 1; col >= 0; col--) o += c.slice(col * ROWS, col * ROWS + ROWS);
  return o;
}
function hamming(a, b) {
  let d = 0;
  for (let i = 0; i < SIZE; i++) if (a[i] !== b[i]) d++;
  return d;
}
const farEnough = (cells, others) => others.every((o) => hamming(cells, o) >= MIN_DISTINCT && hamming(cells, mirrorCells(o)) >= MIN_DISTINCT);

// Replay a move list from the empty board and prove it reaches `cells` without
// anyone completing a four on the way. This is the reachability proof.
function replayProof(hist, cells) {
  const b = emptyBoard();
  for (const c of hist) {
    if (b.heights[c] >= ROWS) return 'illegal drop into a full column';
    const r = b.heights[c];
    if (winsAt(b, c, r, b.turn)) return 'the game was already over on an earlier ply';
    play(b, c);
  }
  if (serialize(b) !== cells) return 'replay does not reproduce the board';
  if (findAnyWin(b)) return 'a four is already on the board';
  if (b.turn !== 1) return 'it is not red to move';
  return null;
}

// ── the accept test ────────────────────────────────────────────────────────
let mismatches = 0;
function assess(cells, tt) {
  const b = deserialize(cells);
  if (findAnyWin(b)) return null;
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS && winsAt(b, c, b.heights[c], 2)) return null; // engine already threatens
  let open = 0;
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS) open++;
  if (open < MIN_COLS_WEEKDAY) return null;
  const scored = scoreMoves(b, tt);
  if (!scored.length) return null;
  const best = scored.reduce((a, s) => (s.score > a.score ? s : a), scored[0]);
  if (best.score <= 0) return null;
  if (scored.filter((s) => s.score === best.score).length !== 1) return null;
  if (!scored.every((s) => s.col === best.col || s.score <= 0)) return null;   // the key is the ONLY winning column
  const empty = SIZE - b.plies;
  const winIn = movesToWin(empty, best.score);
  if (winIn !== 4 && winIn !== 5) return null;
  if (winIn === 5 && (b.plies > SUNDAY_MAX_PLIES || open < MIN_COLS_SUNDAY)) return null;

  // second, independent opinion on every legal column
  const second = S2.scoreAll(S2.make(cells));
  const a = scored.map((s) => `${s.col}:${s.score}`).join(' ');
  const c2 = second.map((s) => `${s.col}:${s.score}`).join(' ');
  if (a !== c2) { mismatches++; console.error(`SOLVER MISMATCH on ${cells}\n  c4.js     ${a}\n  solver2   ${c2}`); return null; }

  const shape = analyze(cells, best.col);
  if (!shape) return null;          // tree walk overflowed: no honest motif to write
  const kf = keyFacts(cells, best.col);
  return { cells, plies: b.plies, key: best.col, rootScore: best.score, winIn, open, shape, kf };
}

// ── motif facts, read off the board's own forced win ────────────────────────
const DIRS = [[0, 1, 'vertical'], [1, 0, 'horizontal'], [1, 1, 'rise'], [1, -1, 'fall']];

function lineDirAt(b, c, r, who) {
  for (const [dc, dr, name] of DIRS) {
    let n = 1;
    for (let s = -1; s <= 1; s += 2) {
      let cc = c + dc * s, rr = r + dr * s;
      while (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS && b.cells[cc * ROWS + rr] === who) { n++; cc += dc * s; rr += dr * s; }
    }
    if (n >= 4) return name;
  }
  return null;
}

const immediateWins = (b, who) => {
  const out = [];
  for (let c = 0; c < COLS; c++) if (b.heights[c] < ROWS && winsAt(b, c, b.heights[c], who)) out.push(c);
  return out;
};

function bestCols(b, tt) {
  const scored = scoreMoves(b, tt);
  const top = scored.reduce((a, s) => (s.score > a.score ? s : a), scored[0]).score;
  return { top, cols: scored.filter((s) => s.score === top).map((s) => s.col) };
}

// Walk the ENTIRE forced win against every defense the engine can actually
// play: at a black node, all of black's TOP-scoring replies (a perfect engine
// never plays a worse one, and every one of them is a different game); at a red
// node, a fastest win, chosen center-out so the walk is deterministic. The
// motif is then built only from statements true at EVERY leaf, which is why it
// can say "every defense" without lying about the branch nobody looked at.
function analyze(cells, key) {
  const b = deserialize(cells);
  const tt = new Map();
  const leaves = [];
  let nodes = 0, overflow = false;
  const canon = (cols) => cols.slice().sort((x, y) => Math.abs(x - 3) - Math.abs(y - 3) || x - y)[0];
  const walk = (yours, theirs) => {
    if (overflow) return;
    if (++nodes > TREE_NODE_CAP) { overflow = true; return; }
    if (b.turn === 1) {
      const now = immediateWins(b, 1);
      if (now.length) {
        const c = canon(now), r = b.heights[c];
        play(b, c);
        const dir = lineDirAt(b, c, r, 1);
        undo(b, c);
        const mine = yours.concat(c);
        leaves.push({
          dir,
          fork: now.length > 1,
          handed: theirs.length > 0 && theirs[theirs.length - 1] === c,
          stack: mine.length >= 2 && mine[mine.length - 1] === mine[mine.length - 2] ? c : null,
          cols: [...new Set(mine)].sort((x, y) => x - y).join(','),
        });
        return;
      }
      const c = canon(bestCols(b, tt).cols);
      play(b, c); walk(yours.concat(c), theirs); undo(b, c);
    } else {
      for (const c of bestCols(b, tt).cols) {
        play(b, c); walk(yours, theirs.concat(c)); undo(b, c);
        if (overflow) return;
      }
    }
  };
  play(b, key);
  walk([key], []);
  undo(b, key);
  if (overflow || !leaves.length) return null;
  const dirs = [...new Set(leaves.map((l) => l.dir))];
  const stacks = [...new Set(leaves.map((l) => l.stack))];
  const colsets = [...new Set(leaves.map((l) => l.cols))];
  return {
    leaves: leaves.length,
    dirs,
    canonDir: leaves[0].dir,
    allFork: leaves.every((l) => l.fork),
    noFork: leaves.every((l) => !l.fork),
    forkRate: leaves.filter((l) => l.fork).length / leaves.length,
    allHanded: leaves.every((l) => l.handed),
    handedRate: leaves.filter((l) => l.handed).length / leaves.length,
    stack: stacks.length === 1 && stacks[0] !== null ? stacks[0] : null,
    narrow: colsets.length === 1 && colsets[0].split(',').length === 2 ? colsets[0].split(',').map(Number) : null,
  };
}

function keyFacts(cells, key) {
  const b = deserialize(cells);
  const row = b.heights[key];
  play(b, key);
  const th = immediateWins(b, 1);
  let thDir = null;
  if (th.length) {
    const c = th[0], r = b.heights[c];
    play(b, c);
    thDir = lineDirAt(b, c, r, 1);
    undo(b, c);
  }
  undo(b, key);
  return { row, threats: th.length, thDir };
}

// ── motif wording ──────────────────────────────────────────────────────────
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
const SHAPE = {
  vertical: ['four stacked in one column', 'four in a single column', 'a column of four'],
  horizontal: ['four straight across', 'four side by side along one row', 'four in a row across'],
  rise: ['four on a rising diagonal', 'four climbing the diagonal', 'four on the diagonal that climbs to the right'],
  fall: ['four on a falling diagonal', 'four down the diagonal', 'four on the diagonal that drops to the right'],
};
const SHORT = { vertical: 'a column', horizontal: 'a row', rise: 'a rising diagonal', fall: 'a falling diagonal' };
const THREAT_PHRASE = {
  vertical: ['to finish its own column', 'to top off the column it lands in', 'to complete the stack it just added to'],
  horizontal: ['to close a row', 'to complete four across', 'to finish a row'],
  rise: ['to complete a rising diagonal', 'to close the climbing diagonal', 'to finish a diagonal on the way up'],
  fall: ['to complete a falling diagonal', 'to close the dropping diagonal', 'to finish a diagonal on the way down'],
};
const listOf = (a) => (a.length === 2 ? `${a[0]} or ${a[1]}` : `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]}`);

// Every clause below is a statement the analyzer proved at EVERY leaf of the
// forced win, so nothing here is decoration pasted from a list.
function motifFor(f, r) {
  const K = f.key + 1;
  const s1 = f.keyThreats
    ? [
        `Column ${K} threatens ${THREAT_PHRASE[f.thDir][(r * 11 + 1) % 3]} at once, so the reply is not a choice.`,
        `The key is column ${K}, and it makes a threat the engine has to answer. Answering is what costs it the game.`,
        `Drop in column ${K} and the threat ${THREAT_PHRASE[f.thDir][(r * 11 + 1) % 3]} is live immediately; the block is forced, and forced is the problem.`,
        `The key attacks on arrival: column ${K}, threatening ${THREAT_PHRASE[f.thDir][(r * 11 + 1) % 3]}, with exactly one square that stops it.`,
      ]
    : [
        `The key is a quiet drop into column ${K}. It threatens nothing, which is exactly why it is easy to walk past.`,
        `Column ${K} attacks nothing at all. It only takes a square the finish cannot do without.`,
        `Nothing about column ${K} looks urgent, and that is the trap: every louder move here throws the win away.`,
        `The key makes no threat. It is column ${K}, claimed now because later there is no turn to spare for it.`,
      ];
  const forkMove = ORD[f.winIn - 1];
  const s2 = f.allFork
    ? [
        `Your ${forkMove} move then leaves two winning squares at once, and one turn cannot cover both.`,
        `Your ${forkMove} drop opens two winning squares at the same time; the block can only reach one of them.`,
        `The fork lands on your ${forkMove} move: two finishing squares, a single defensive turn.`,
        `It always ends as a fork. Your ${forkMove} move makes two winning squares and the defense has one turn for them.`,
      ]
    : f.noFork && f.allHanded
    ? [
        `There is no fork in it. The last block is the loss: the engine has to fill the square underneath the win, and you drop straight on top of it.`,
        `No double threat is needed. The defense is squeezed into filling the square below the finish, and you land on it.`,
        `It never forks. The engine's own final block is what lifts you into the winning square.`,
        `The finish is handed over rather than taken. Every line ends with the engine filling the square under your win.`,
      ]
    : f.noFork
    ? [
        `There is no fork anywhere in it. Every block is forced away from the finishing square, and the square is still open when you get there.`,
        `No double threat ever appears. The defense is answering elsewhere every turn while the winning square sits untouched.`,
        `It is a squeeze rather than a fork: each reply is spoken for, and the finish is waiting where it always was.`,
        `Not one line forks. The defense is busy somewhere else on every turn, and the square that wins is never contested.`,
      ]
    : f.forkRate >= 0.6
    ? [
        `Most of the defenses fork on your ${forkMove} move, and the stubborn ones are squeezed instead.`,
        `Usually it is a fork on your ${forkMove} move; the longest defense avoids the fork and loses to the squeeze anyway.`,
        `The common ending is two winning squares after your ${forkMove} move, with a squeeze held in reserve for the rest.`,
      ]
    : f.forkRate > 0
    ? [
        `Some defenses walk into a fork and the rest are simply squeezed, and the key is the move that makes both work.`,
        `How it ends is up to the engine: two winning squares in some lines, one unstoppable square in the others.`,
        `The engine gets a choice of ways to lose, a fork in some lines and a squeeze in the rest.`,
        `Both endings are in there. Defend one way and it forks; defend the other and the finishing square is simply never free.`,
      ]
    : [   // unreachable: forkRate 0 is exactly noFork, kept so a future fact can never fall off the end
        `The defense is squeezed rather than forked, whichever way it turns.`,
      ];
  const extra = f.stack !== null
    ? ` Your last two drops stack in column ${f.stack + 1}.`
    : f.narrow
    ? ` The whole win happens in columns ${f.narrow.map((c) => c + 1).join(' and ')}.`
    : '';
  const shape = SHAPE[f.canonDir][(r * 7 + 4) % 3];
  const lines = listOf(f.dirs.map((d) => SHORT[d]));
  const s3 = f.dirs.length === 1
    ? [`Every defense ends the same way: ${shape}.`, `However it is defended, it finishes with ${shape}.`, `Each line comes to the same end, ${shape}.`, `One shape closes all of them: ${shape}.`]
    : [
        `The shape of the finish is the engine's last choice: ${lines}.`,
        `Different defenses die different deaths, on ${lines}.`,
        `It closes on ${lines}, whichever the engine walks into.`,
        `The winning line is not fixed: ${lines}.`,
      ];
  const sun = f.sunday ? [' It needs the full five moves, and nothing shorter exists.', ' Five of your moves, no fewer.', ' The Sunday board takes all five to close.'][(r * 13 + 2) % 3] : '';
  return `${s1[r % s1.length]} ${s2[(r * 5 + 2) % s2.length]}${extra} ${s3[(r * 3 + 1) % s3.length]}${sun}`;
}

// ── collect ────────────────────────────────────────────────────────────────
function collect(budgetMs, need, onFound) {
  const t0 = Date.now();
  const seen = new Set();
  let games = 0, snaps = 0, found = 0;
  while (Date.now() - t0 < budgetMs) {
    games++;
    let tt = new Map();
    for (const s of selfPlay()) {
      if (s.plies > 30) continue;
      if (seen.has(s.cells)) continue;
      seen.add(s.cells);
      snaps++;
      if (tt.size > 3_000_000) tt = new Map();
      const c = assess(s.cells, tt);
      if (!c) continue;
      c.hist = s.hist;
      found++;
      if (onFound(c)) return { games, snaps, found, ms: Date.now() - t0, done: true };
    }
  }
  return { games, snaps, found, ms: Date.now() - t0, done: false };
}

// ── probe ──────────────────────────────────────────────────────────────────
if (has('--probe')) {
  const secs = Number(arg('--budget', 45));
  const bucket = {}, keys = {};
  const st = collect(secs * 1000, null, (c) => {
    const k = `${c.plies}/${c.winIn}`;
    bucket[k] = (bucket[k] || 0) + 1;
    keys[c.key] = (keys[c.key] || 0) + 1;
    return false;
  });
  console.log(`${st.games} games, ${st.snaps} fresh red-to-move snapshots, ${st.found} accepted in ${(st.ms / 1000).toFixed(0)}s (${(st.found / (st.ms / 1000)).toFixed(2)}/s)`);
  console.log('  discs/winIn ' + Object.keys(bucket).sort().map((k) => `${k}:${bucket[k]}`).join(' '));
  console.log('  key column  ' + Object.keys(keys).sort().map((k) => `${k}:${keys[k]}`).join(' '));
  console.log(`  solver disagreements: ${mismatches}`);
  process.exit(0);
}

// ── build ──────────────────────────────────────────────────────────────────
const from = arg('--from', arg('--start'));
const days = Number(arg('--days', 62));
const budget = Number(arg('--budget', 1800));
if (!from) { console.error('need --from YYYY-MM-DD'); process.exit(1); }
if (!Number.isInteger(startNum) || startNum < 1) { console.error('--startnum must be a positive integer'); process.exit(1); }

// A resumed cache silently bleeds an earlier run's boards into new output, so
// the cache directory is cleared at the start of every run, always.
rmSync(CACHE, { recursive: true, force: true });
mkdirSync(CACHE, { recursive: true });

const dates = [];
for (let d = 0; d < days; d++) {
  const dt = new Date(`${from}T12:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + d);
  const live = iso(dt);
  dates.push({ live, sunday: isSunday(live), num: startNum + d });
}
const nSun = dates.filter((d) => d.sunday).length;
const nWeek = days - nSun;

const seenCells = new Set();
const placedCells = [];
const usedMotifs = new Set();
let frozen = 0;
const avoidPath = arg('--avoid');
if (avoidPath) {
  const mod = await import(pathToFileURL(resolvePath(avoidPath)).href);
  for (const p of mod.PUZZLES || []) { frozen++; if (p.cells) { seenCells.add(p.cells); placedCells.push(p.cells); } if (p.motif) usedMotifs.add(p.motif); }
  console.error(`avoiding ${frozen} frozen boards from ${avoidPath} (${usedMotifs.size} motif strings already in use)`);
}

const KEY_CEILING = Math.max(3, Math.ceil(days * KEY_CEILING_FRAC));
console.error(`${days} days from ${from} (${nWeek} weekday, ${nSun} Sunday), nums ${startNum}..${startNum + days - 1}`);
console.error(`ceilings: key column <= ${KEY_CEILING}, discs <= ${PLY_CEILING_WEEKDAY} weekday / ${PLY_CEILING_SUNDAY} Sunday per value, opening8 <= ${OPEN8_CEILING}, opening4 <= ${OPEN4_CEILING}, motif unique`);

// Targets per bucket, so the collector knows when it may stop early.
// Enough in EVERY bucket to fill that bucket's ceiling, which is the most the
// assignment can ever draw from it. Reaching that everywhere is the only reason
// to stop before the budget is spent.
const target = {};
for (const p of PLY_VALUES) target[`${p}/4`] = Math.min(PLY_CEILING_WEEKDAY, nWeek);
for (const p of SUNDAY_PLY_VALUES) target[`${p}/5`] = Math.min(PLY_CEILING_SUNDAY, nSun);

const pool = [];
const have = {};
const st = collect(budget * 1000, target, (c) => {
  if (seenCells.has(c.cells)) return false;
  const k = `${c.plies}/${c.winIn}`;
  if (!(k in target)) return false;
  pool.push(c);
  have[k] = (have[k] || 0) + 1;
  if (pool.length % 25 === 0) console.error(`  pooled ${pool.length}: ${Object.keys(have).sort().map((x) => `${x}:${have[x]}`).join(' ')}`);
  return Object.keys(target).every((x) => (have[x] || 0) >= target[x]);
});
console.error(`collected ${pool.length} candidates from ${st.games} games / ${st.snaps} snapshots in ${(st.ms / 1000).toFixed(0)}s${st.done ? ' (targets met)' : ' (budget spent)'}`);
// DETERMINISM. Everything downstream of the pool is seeded, so an unchanged run
// reproduces byte-identically -- but only if the pool itself does, and a pool cut
// short by the wall clock is a pool that depends on how busy the machine was.
// A run that ends on "budget spent" is therefore an error rather than a result:
// raise --budget (or pass --allow-short and accept that the output is not
// reproducible).
if (!st.done && !has('--allow-short')) {
  console.error(`the ${budget}s budget ran out before every bucket was filled, so this run is not reproducible; raise --budget or pass --allow-short`);
  process.exit(1);
}
console.error('  buckets ' + Object.keys(target).sort().map((k) => `${k}:${have[k] || 0}/${target[k]}`).join(' '));
// The pool is dumped for inspection, never read back: it is cleared at the top
// of every run precisely so a stale one cannot bleed into a later bank.
writeFileSync(`${CACHE}/pool.jsonl`, pool.map((c) => JSON.stringify({ cells: c.cells, plies: c.plies, key: c.key, rootScore: c.rootScore, winIn: c.winIn, hist: c.hist })).join('\n') + '\n');
if (mismatches) console.error(`  !! ${mismatches} solver disagreements were discarded`);

// ── assign ─────────────────────────────────────────────────────────────────
const keyCount = {}, plyCountW = {}, plyCountS = {}, open8 = {}, open4 = {}, dirCount = {}, shapeCount = { quiet: 0, forcing: 0 };
const DIR_CEILING = Math.ceil(days * 0.4);
const KEYSHAPE_CEILING = Math.ceil(days * 0.62);
console.error(`         finishing direction <= ${DIR_CEILING} per direction, quiet/forcing key <= ${KEYSHAPE_CEILING} each`);
const out = [];
let lastKey = -1;

for (const d of dates) {
  const wantWin = d.sunday ? 5 : 4;
  const plyCount = d.sunday ? plyCountS : plyCountW;
  const plyCeil = d.sunday ? PLY_CEILING_SUNDAY : PLY_CEILING_WEEKDAY;
  // Graded relaxation. A bucket that the search could not supply must not be
  // allowed to drop the OTHER ceilings with it, so slack is given to the disc
  // count first (that is the one the search runs thin on) and only then to
  // everything else. Any board that needed slack is flagged in the log.
  const fits = (c, stage) => c.winIn === wantWin && !c.used
    && c.key !== lastKey
    && (open8[c.hist.slice(0, 8).join('')] || 0) < OPEN8_CEILING
    && (open4[c.hist.slice(0, 4).join('')] || 0) < OPEN4_CEILING
    && (stage > 1 || ((keyCount[c.key] || 0) < KEY_CEILING
      && (dirCount[c.shape.canonDir] || 0) < DIR_CEILING
      && shapeCount[c.kf.threats ? 'forcing' : 'quiet'] < KEYSHAPE_CEILING))
    && (stage > 2 || (plyCount[c.plies] || 0) < plyCeil + (stage - 1) * 2)
    && (stage > 2 || farEnough(c.cells, placedCells));
  let cands = [], stage = 0;
  while (!cands.length && ++stage <= 3) cands = pool.filter((c) => fits(c, stage));
  const relaxed = stage > 1 ? `  [ceiling relaxed, stage ${stage}]` : '';
  if (!cands.length) { console.error(`no candidate left for ${d.live} (win in ${wantWin})`); process.exit(1); }
  // Least-used ply value first, then least-used finishing direction, then
  // least-used key column: that is what keeps rootScore, the shape of the win
  // and the key spread instead of collapsing onto whatever is commonest.
  cands.sort((a, b) => ((plyCount[a.plies] || 0) - (plyCount[b.plies] || 0))
    || ((dirCount[a.shape.canonDir] || 0) - (dirCount[b.shape.canonDir] || 0))
    || ((keyCount[a.key] || 0) - (keyCount[b.key] || 0))
    || (a.cells < b.cells ? -1 : 1));
  const band = cands.slice(0, Math.max(1, Math.min(6, cands.length)));
  const c = band[Math.floor(rnd() * band.length) % band.length];

  const bad = replayProof(c.hist, c.cells);
  if (bad) { console.error(`REACHABILITY FAILED for ${d.live}: ${bad}`); process.exit(1); }

  const facts = {
    key: c.key, keyThreats: c.kf.threats, thDir: c.kf.thDir, winIn: c.winIn, sunday: d.sunday,
    allFork: c.shape.allFork, noFork: c.shape.noFork, allHanded: c.shape.allHanded,
    forkRate: c.shape.forkRate, handedRate: c.shape.handedRate,
    stack: c.shape.stack, narrow: c.shape.narrow, dirs: c.shape.dirs, canonDir: c.shape.canonDir,
  };
  // Start the phrasing rotation at a seeded offset. Starting at 0 every time
  // makes variant 0 unique on the first try for almost every board, and the bank
  // then reads as one sentence with the numbers changed -- exactly the trap.
  let motif = null;
  const r0 = Math.floor(rnd() * 60);
  for (let r = r0; r < r0 + 60 && !motif; r++) {
    const m = motifFor(facts, r);
    if (!usedMotifs.has(m)) motif = m;
  }
  if (!motif) { console.error(`could not build a fresh motif for ${d.live}`); process.exit(1); }
  usedMotifs.add(motif);

  c.used = true;
  seenCells.add(c.cells);
  placedCells.push(c.cells);
  keyCount[c.key] = (keyCount[c.key] || 0) + 1;
  plyCount[c.plies] = (plyCount[c.plies] || 0) + 1;
  dirCount[c.shape.canonDir] = (dirCount[c.shape.canonDir] || 0) + 1;
  shapeCount[c.kf.threats ? 'forcing' : 'quiet']++;
  open8[c.hist.slice(0, 8).join('')] = (open8[c.hist.slice(0, 8).join('')] || 0) + 1;
  open4[c.hist.slice(0, 4).join('')] = (open4[c.hist.slice(0, 4).join('')] || 0) + 1;
  lastKey = c.key;

  out.push({ num: d.num, quizId: quizIdOf(d.live), live: d.live, dateLabel: label(d.live), sunday: d.sunday, winIn: c.winIn, cells: c.cells, key: c.key, rootScore: c.rootScore, motif });
  console.error(`${d.live}${d.sunday ? ' (Sun)' : '     '} #${d.num} ${c.plies} discs, key col ${c.key}, score ${c.rootScore}, win in ${c.winIn}, ${c.kf.threats ? 'forcing' : 'quiet'} key, ${c.shape.allFork ? 'fork' : c.shape.noFork ? (c.shape.allHanded ? 'handed' : 'squeeze') : 'mixed'}, ${c.shape.leaves} best-defense lines ending ${c.shape.dirs.join('/')}${relaxed}`);
}

console.error('\nspread over the new range');
console.error('  key column  ' + [0, 1, 2, 3, 4, 5, 6].map((k) => `${k}:${keyCount[k] || 0}`).join(' '));
console.error('  discs (wk)  ' + PLY_VALUES.map((p) => `${p}:${plyCountW[p] || 0}`).join(' '));
console.error('  discs (sun) ' + SUNDAY_PLY_VALUES.map((p) => `${p}:${plyCountS[p] || 0}`).join(' '));
console.error('  finish dir  ' + ['vertical', 'horizontal', 'rise', 'fall'].map((k) => `${k}:${dirCount[k] || 0}`).join(' '));
console.error(`  key shape   quiet:${shapeCount.quiet} forcing:${shapeCount.forcing}`);
console.error('  rootScore   ' + [...new Set(out.map((o) => o.rootScore))].sort((a, b) => a - b).map((s) => `${s}:${out.filter((o) => o.rootScore === s).length}`).join(' '));
console.error('  openings    ' + `${Object.keys(open8).length} distinct 8-ply, max repeat ${Math.max(...Object.values(open8))}; ${Object.keys(open4).length} distinct 4-ply, max repeat ${Math.max(...Object.values(open4))}`);
console.error(`  motifs      ${new Set(out.map((o) => o.motif)).size} distinct of ${out.length}`);
let closest = 42, closestPair = '';
for (let i = 0; i < placedCells.length; i++) {
  for (let j = i + 1; j < placedCells.length; j++) {
    const d = Math.min(hamming(placedCells[i], placedCells[j]), hamming(placedCells[i], mirrorCells(placedCells[j])));
    if (d < closest) { closest = d; closestPair = `${i + 1} vs ${j + 1}`; }
  }
}
console.error(`  closest      ${closest} differing cells over the combined bank (boards ${closestPair}); pairs below ${MIN_DISTINCT} can only be frozen ones`);
console.error(`  solver disagreements over the whole run: ${mismatches}`);

// ── write ──────────────────────────────────────────────────────────────────
const body = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    winIn: ${p.winIn},
    cells: '${p.cells}',
    key: ${p.key},
    rootScore: ${p.rootScore},
    motif: '${p.motif.replace(/'/g, "\\'")}',
  },`).join('\n');

const dest = arg('--out', '/tmp/four-new.js');
writeFileSync(dest, `export const PUZZLES = [\n${body}\n];\n`);
console.error(`\nwrote ${out.length} boards to ${dest}`);
