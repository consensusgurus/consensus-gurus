// Bank generator for Turn, the daily Othello endgame.
//
// Positions come from SELF-PLAY from the standard opening four, never from
// sprinkling discs at random, so every board it emits is reachable by a real
// game and the walls, wedges and parity that decide an endgame form the way
// they do in play. The walk plays low-flip (mobility) moves with noise, which
// is roughly how a decent human plays and lands the game in the shape this
// puzzle is picked up in.
//
// A candidate is accepted only when all of these hold, all recomputed here from
// app/turn/othello.js, the same engine the browser runs:
//
//   1. it is YOUR move, there are exactly `empties` empty squares, and you have
//      at least MIN_MOVES legal squares to choose between;
//   2. you are winning: the exact final margin with best play is above zero;
//   3. EXACTLY ONE square keeps the win. Every other legal square ends level or
//      behind, and there is no take-back;
//   4. both temptations are live: the biggest-flip square and the smallest-flip
//      square are two DIFFERENT squares, so "take the most" and "take the
//      fewest" cannot both be right;
//   5. the answer's SHAPE rotates through quiet / greedy / middle, so no flip
//      count is ever a reliable proxy for the answer;
//   6. the winning margin sits inside a band, so the board stays tense;
//   7. the shipping solver answers the root inside the time budget, measured,
//      because the browser runs this same search once per turn.
//
// Rule 5 is the one that matters most and it is the lesson of Chain's first
// bank, which had to be thrown away because the answer was a quiet move on all
// 35 days and a player could win it without reading the board. Othello has the
// same trap in a different costume: "flip the fewest" is genuinely the right
// habit most of the time, so a bank that never punishes it teaches a reflex
// instead of a read. A third of these boards are days where the greedy square
// is correct and the quiet one throws it away.
//
// Usage:
//   node scripts/gen-turn.mjs --start 2026-08-06 --days 35 --out app/turn/puzzles.js
//   node scripts/gen-turn.mjs --probe          distribution only, writes nothing
//
// EXTENDING an existing bank. The generator always writes a whole file, so a
// range meant to be spliced onto the end of the live bank has to be numbered and
// deduped as if it were already there, or the splice is wrong the moment it
// lands. Two options do that:
//
//   --startnum N   the first board's `num`. It also drives the shape ROTATION,
//                  which is keyed off num-1 and NOT off the loop index, so a
//                  spliced range continues the quiet/greedy/middle cycle from
//                  where the live bank left off instead of restarting it. This
//                  is the trap that inverted Chain's spliced range.
//   --avoid PATH   an existing puzzles.js. Its boards pre-seed the duplicate
//                  check and its motifs pre-seed the per-string ceiling, so the
//                  new range cannot repeat a shipped position or push a motif
//                  string past MOTIF_CEILING across the COMBINED bank, which is
//                  the scope verify-turn.mjs checks them at.
//
//   node scripts/gen-turn.mjs --start 2026-09-09 --days 72 --startnum 36 \
//     --avoid app/turn/puzzles.js --seed 20260909 --out /tmp/turn-ext.js
import { writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  startBoard, legalMoves, applyMove, undoMove, discs, makeSolver, boardString,
  other, YOU, FOE, CORNERS, SQ_NAME,
} from '../app/turn/othello.js';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);

const WEEKDAY_EMPTIES = 10;
const SUNDAY_EMPTIES = 12;
const MIN_MOVES = 4;                  // a real choice at the root
const WEEKDAY_MARGIN = [2, 14];       // win by at least / at most, inclusive
const SUNDAY_MARGIN = [2, 18];
const SOLVE_BUDGET_MS = 320;          // the narrow searches above, per candidate
const CLIENT_BUDGET_MS = 150;         // one cold outlook search, what the browser runs

let seed = Number(arg('--seed', 20260806)) >>> 0;
const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };

// ── self-play down to the endgame ──────────────────────────────────────────
function walkTo(stopEmpty) {
  const b = startBoard(YOU);
  let me = YOU, passed = false;
  const history = [];
  for (;;) {
    if (discs(b).empty <= stopEmpty) return { b, me, history };
    const moves = legalMoves(b, me);
    if (!moves.length) {
      if (passed) return null;              // both stuck: game over above the target
      passed = true; me = other(me); continue;
    }
    passed = false;
    // Mostly low-flip play, which is how a competent game actually goes, with
    // enough noise that the bank does not fill up with one opening.
    moves.sort((x, y) => x.flips.length - y.flips.length);
    const m = rnd() < 0.70
      ? moves[Math.floor(rnd() * Math.min(3, moves.length))]
      : moves[Math.floor(rnd() * moves.length)];
    applyMove(b, m.sq, me, m.flips);
    history.push(m.sq);
    me = other(me);
  }
}

// ── candidate test ─────────────────────────────────────────────────────────
//
// Ordered so that the CHEAP tests run first and the search runs last, and so
// that the search that runs first is the one most likely to reject the board.
// Everything before the solve is arithmetic on flip counts; the first search is
// a null-window "does this square still win?" question about the ONE square the
// requested shape needs to be the answer, which throws out the large majority
// of positions for the price of a single narrow search.
function candidate(empties, marginBand, wantShape) {
  const w = walkTo(empties);
  if (!w) return null;
  const d = discs(w.b);
  if (d.empty !== empties) return null;

  // The player is always the side to move, so relabel when the walk stopped on
  // white's turn. `opener` then records which label moved first, which is what
  // the verifier replays from.
  const flip = w.me !== YOU;
  const board = new Int8Array(64);
  for (let i = 0; i < 64; i++) board[i] = flip ? (w.b[i] === YOU ? FOE : w.b[i] === FOE ? YOU : 0) : w.b[i];
  const opener = flip ? FOE : YOU;

  const moves = legalMoves(board, YOU);
  if (moves.length < MIN_MOVES) return null;

  // Cheap first: both temptations have to be live, and each has to be a single
  // identifiable square or the shape of the answer is not a real lesson.
  const counts = moves.map((m) => m.flips.length);
  const maxFlip = Math.max(...counts), minFlip = Math.min(...counts);
  if (maxFlip === minFlip) return null;
  const greedy = moves.filter((m) => m.flips.length === maxFlip);
  const quiet = moves.filter((m) => m.flips.length === minFlip);
  if (greedy.length !== 1 || quiet.length !== 1) return null;

  const solver = makeSolver();
  const t0 = process.hrtime.bigint();
  // Null-window test: does `sq` still win? score(sq) = -value(after, FOE), so
  // the square wins exactly when value(after, FOE) is below zero.
  const winsWith = (m) => {
    applyMove(board, m.sq, YOU, m.flips);
    const v = solver.value(board, FOE, -1, 0);
    undoMove(board, m.sq, YOU, m.flips);
    return v <= -1;
  };

  // Test the shape's own square first: it is the single question that rejects
  // the most boards, and it costs one narrow search.
  const greedyWins = winsWith(greedy[0]);
  if (wantShape === 'greedy' && !greedyWins) return null;
  if (wantShape !== 'greedy' && greedyWins) return null;
  const quietWins = winsWith(quiet[0]);
  if (wantShape === 'quiet' && !quietWins) return null;
  if (wantShape !== 'quiet' && quietWins) return null;

  let key = null;
  for (const m of moves) {
    if (m.sq === greedy[0].sq || m.sq === quiet[0].sq) continue;
    if (!winsWith(m)) continue;
    if (wantShape !== 'middle') return null;   // a second winner: not unique
    if (key) return null;                      // two middle winners: not unique
    key = m;
  }
  if (wantShape === 'greedy') key = greedy[0];
  if (wantShape === 'quiet') key = quiet[0];
  if (!key) return null;

  // Only now, for the one surviving board, pay for the exact margin.
  applyMove(board, key.sq, YOU, key.flips);
  const margin = -solver.value(board, FOE);
  undoMove(board, key.sq, YOU, key.flips);
  const solveMs = Number(process.hrtime.bigint() - t0) / 1e6;
  if (solveMs > SOLVE_BUDGET_MS) return null;
  if (margin < marginBand[0] || margin > marginBand[1]) return null;

  // And the search the BROWSER runs, timed cold on its own solver, because the
  // narrow searches above are much cheaper than the client's full-window one.
  {
    const cold = makeSolver();
    const t1 = process.hrtime.bigint();
    cold.value(board, YOU);
    if (Number(process.hrtime.bigint() - t1) / 1e6 > CLIENT_BUDGET_MS) return null;
  }

  const shape = key.sq === greedy[0].sq ? 'greedy' : key.sq === quiet[0].sq ? 'quiet' : 'middle';
  const openCorners = CORNERS.filter((c) => moves.some((m) => m.sq === c));
  const st = discs(board);
  return {
    board: boardString(board),
    opener,
    history: w.history.slice(),
    key: key.sq,
    margin,
    empties,
    lead: st.mine - st.theirs,
    moveCount: moves.length,
    keyFlips: key.flips.length,
    maxFlip, minFlip,
    greedySq: greedy[0].sq,
    quietSq: quiet[0].sq,
    shape,
    openCorners,
    cornerIsKey: openCorners.includes(key.sq),
    solveMs: Math.round(solveMs),
  };
}

// ── motifs: describe the shape of the key, never name the square ───────────
const MOTIFS = {
  quiet: [
    'The big flip was the whole trap. Taking one disc keeps every option alive, and the engine runs out of squares long before you do.',
    'Flip as little as possible here. Every disc you turn over hands back a square to play into, and squares are the only currency left.',
    'The small move wins it. A wide flip opens a row the engine has been waiting for, and it never gives that row back.',
    'Take one and no more. The board is nearly full, so mobility is the whole game, and the greedy square spends yours.',
    'The quiet square looks like it does nothing. What it does is leave the engine with nothing, which is the same as winning here.',
    'Count the squares, not the discs. The move that turns the fewest is the move that leaves the engine on move with nowhere good to go.',
    'Resist the wide flip. Turning a long line here fills in squares you will want to play into, and you need every one of them.',
    'One disc is enough. The board is tight, and the side that runs out of safe squares first is the side that loses.',
    'Play the smallest move on the board. It looks like nothing happens, and what happens is the engine gets no reply worth having.',
    'The wide flip is bait. It reads as progress and it hands over the only edge square that still matters.',
    'Turn the fewest discs you can. The count at the end takes care of itself once the engine has nowhere useful to go.',
    'Small is right today. A long flip opens a line straight back at you, and there is no time left to close it again.',
    'Keep your move in reserve. The tiny square holds the position together while the big one spends it in one go.',
    'Do the least you can get away with. Every extra disc you turn is a square handed back, and squares decide this one.',
  ],
  greedy: [
    'This is the day to take everything. The careful little move looks like good technique and it hands the engine the tempo it needs.',
    'Flip the lot. Holding back is the reflex, and here the reflex loses: the wide flip takes away the answer the engine was relying on.',
    'The big grab is correct. It looks crude, it kills the reply, and nothing quieter survives what comes back.',
    'Take the whole row. Playing small keeps your options open and lets the engine keep its own, which is the trade you cannot afford.',
    'Greed wins this one. The disciplined square leaves a wedge the engine plays into, and after that the count never comes back.',
    'The board rewards the loud move here. Turning that many discs looks reckless right up until you count what the engine has left.',
    'Take the long line. Careful play is the habit here, and the habit walks straight into the reply you cannot answer.',
    'Turn everything you can reach. The modest square keeps the position tidy and keeps the engine alive, and alive is all it needs.',
    'Be greedy. The wide flip strips the engine of the squares it wanted, and nothing smaller does that job.',
    'The loud move is the sound one. Playing small leaves a line open that the engine walks down for the rest of the game.',
    'Grab the whole line and do not apologize for it. The neat little move loses by one, which is still losing.',
    'Take the maximum. It looks like the beginner move right until you count what is left for the engine to play.',
    'Flip wide. The restrained square is a fine idea on almost any other board, and it throws this one away.',
    'Play the biggest bite on the board. The discs are not the point; the squares it takes off the engine are.',
  ],
  middle: [
    'Neither extreme is right. The biggest flip loses and so does the smallest, and the answer sits quietly between them.',
    'The two obvious moves are both wrong. What wins takes a moderate bite and leaves the engine answering a question it cannot.',
    'Ignore the flip count. It is the square that matters, and the one that wins is neither the greedy nor the careful pick.',
    'Both habits fail here. Play the move that fixes the edge, and the disc count follows on its own.',
    'The answer is in the middle of the board and the middle of the range. Read the shape, because neither reflex saves you.',
    'Skip both reflexes. The winning square is not the loudest and not the quietest, and reading the edge is what finds it.',
    'The answer hides between the two obvious moves. Look at what each square does to the edge, not at how many discs it turns.',
    'Neither habit helps today. Pick the square that leaves the engine one bad reply, whatever its flip count happens to be.',
    'Count replies, not discs. The move that wins takes a middling bite and leaves the engine without a good square.',
    'The flip count is noise on this board. Find the square that fixes your weak side and the rest follows.',
    'Both extremes fail. The square in between does the one thing that matters, which is denying the engine a safe reply.',
    'Do not let the numbers choose for you. The winning move is unremarkable to look at and it is the only one that holds.',
    'Read the edges before you read the flips. The answer is a moderate move that shuts down the reply you would least like to see.',
  ],
  corner: [
    'The corner is real. Take it, and every disc it anchors is yours for the rest of the game.',
    'A corner is on offer and it is genuinely yours. Nothing else on the board holds up.',
    'Take the corner. It cannot be flipped back, and everything it anchors stays yours to the last disc.',
    'The corner is worth taking now. A corner never changes hands, so the discs behind it are settled for good.',
    'Play into the corner. It is not a trap today, and no other square holds the position together.',
    'Grab the corner while it is there. Anything else lets the engine take it instead, and then the edge is gone.',
    'The corner wins it. Take the permanent square and let the rest of the board sort itself out.',
    'This one is simple. The corner is genuinely on offer, and a corner you can hold is worth more than any flip count.',
    'Corner first. The stability it buys is the whole margin, and every alternative gives the edge away.',
    'Take the corner and stop looking. Nothing else on this board survives the reply.',
    'The corner is safe today. Take it, hold the edge it locks down, and the count never turns back.',
    'Play the corner. It is the one square the engine can never take back from you.',
  ],
  cornerTrap: [
    'The corner is poison today. Reach for it and you hand back the move, and the move is worth more than the corner.',
    'Yes, the corner is open. Take it and you run out of squares first, which is the one thing that loses from here.',
    'Leave the corner alone. It will still be there, and taking it now gives the engine exactly the tempo it needs.',
    'Do not take the corner. It costs you the move, and the move is the only thing keeping the engine short of squares.',
    'The corner is a trap here. Taking it fills the square you needed to keep empty, and the reply is brutal.',
    'Walk past the corner. It looks free and it is the most expensive square on the board right now.',
    'The corner can wait. Take it now and you hand the engine the tempo it has been short of all game.',
    'Ignore the corner. Winning here is about who runs out of squares first, and the corner puts you at the front of that queue.',
    'That corner is not free. Grab it and the engine gets the reply it wants, and after that nothing you do matters.',
    'Leave it. A corner is worth a great deal on most boards and worth less than one tempo on this one.',
    'The corner is the losing move today. Play elsewhere, keep the engine cramped, and let it come to you.',
    'Resist the corner. It buys stability you do not need and spends the one move you cannot spare.',
    'Skip the corner this time. The board is decided by who is forced to move last, not by who holds the angles.',
  ],
};

function motifFamily(c) {
  if (c.openCorners.length) return c.cornerIsKey ? 'corner' : 'cornerTrap';
  return c.shape;
}

// ── dates ──────────────────────────────────────────────────────────────────
const iso = (d) => d.toISOString().slice(0, 10);
const label = (s) => new Date(`${s}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const isSunday = (s) => new Date(`${s}T12:00:00Z`).getUTCDay() === 0;
const quizId = (s) => { const [y, m, d] = s.split('-'); return `turn-${Number(m)}-${Number(d)}-${y.slice(2)}`; };

// ── probe ──────────────────────────────────────────────────────────────────
if (has('--probe')) {
  for (const [name, empties, band] of [['weekday', WEEKDAY_EMPTIES, WEEKDAY_MARGIN], ['sunday', SUNDAY_EMPTIES, SUNDAY_MARGIN]]) {
    let tries = 0, hits = 0, worst = 0;
    const margins = [], shapes = [], movec = [], corners = [];
    const t0 = Date.now();
    while (Date.now() - t0 < 20000) {
      tries++;
      const c = candidate(empties, band, ['quiet', 'greedy', 'middle'][tries % 3]);
      if (c) {
        hits++; margins.push(c.margin); shapes.push(c.shape); movec.push(c.moveCount);
        corners.push(c.openCorners.length ? (c.cornerIsKey ? 'corner-key' : 'corner-trap') : 'no-corner');
        if (c.solveMs > worst) worst = c.solveMs;
      }
    }
    const hist = (a) => [...new Set(a)].sort().map((v) => `${v}:${a.filter((z) => z === v).length}`).join(' ');
    console.log(`${name} (${empties} empties): ${hits}/${tries} accepted, worst solve ${worst}ms`);
    console.log(`  margin ${hist(margins)}`);
    console.log(`  shape  ${hist(shapes)}`);
    console.log(`  moves  ${hist(movec)}`);
    console.log(`  corner ${hist(corners)}`);
  }
  process.exit(0);
}

// ── build the bank ─────────────────────────────────────────────────────────
const start = arg('--start');
const days = Number(arg('--days', 35));
const startNum = Number(arg('--startnum', 1));
if (!start) { console.error('need --start YYYY-MM-DD'); process.exit(1); }
if (!Number.isInteger(startNum) || startNum < 1) { console.error('--startnum must be a positive integer'); process.exit(1); }

// The shape rotation. Sundays are always a 'quiet' day: the bigger board makes
// the mobility read harder, which is the point of the Sunday Edition.
const ROTATION = ['quiet', 'greedy', 'middle', 'greedy', 'quiet', 'middle'];

const out = [];
const seenBoards = new Set();
const motifCount = new Map();
const MOTIF_CEILING = 4;

// --avoid: pre-seed both variety ceilings from a bank that already exists, so a
// spliced range is deduped against the COMBINED bank rather than only against
// itself. Without this the generator happily reissues a shipped board or a
// motif string that is already at its ceiling, and verify-turn.mjs fails on the
// merged file after the splice.
const avoidPath = arg('--avoid');
if (avoidPath) {
  const mod = await import(pathToFileURL(resolvePath(avoidPath)).href);
  const prior = mod.PUZZLES || [];
  for (const p of prior) {
    if (p.board) seenBoards.add(p.board);
    if (p.motif) motifCount.set(p.motif, (motifCount.get(p.motif) || 0) + 1);
  }
  const full = [...motifCount.entries()].filter(([, n]) => n >= MOTIF_CEILING).length;
  console.error(`avoiding ${prior.length} existing boards from ${avoidPath} (${motifCount.size} motifs in use, ${full} already at the ceiling)`);
}

for (let d = 0; d < days; d++) {
  const date = new Date(`${start}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + d);
  const live = iso(date);
  const sun = isSunday(live);
  const empties = sun ? SUNDAY_EMPTIES : WEEKDAY_EMPTIES;
  const band = sun ? SUNDAY_MARGIN : WEEKDAY_MARGIN;
  const num = startNum + d;
  // Keyed off num-1, not off d, so a range generated with --startnum continues
  // the live bank's cycle instead of restarting it at 'quiet'.
  const wantShape = sun ? 'quiet' : ROTATION[(num - 1) % ROTATION.length];

  let c = null;
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    const t = candidate(empties, band, wantShape);
    if (!t) continue;
    if (t.shape !== wantShape) continue;
    if (seenBoards.has(t.board)) continue;
    const fam = MOTIFS[motifFamily(t)];
    const m = fam.find((s) => (motifCount.get(s) || 0) < MOTIF_CEILING);
    if (!m) continue;
    c = t; c.motif = m; break;
  }
  if (!c) { console.error(`no ${wantShape} candidate for ${live} inside the time budget`); process.exit(1); }
  seenBoards.add(c.board);
  motifCount.set(c.motif, (motifCount.get(c.motif) || 0) + 1);

  out.push({
    num, quizId: quizId(live), live, dateLabel: label(live), sunday: sun,
    board: c.board, opener: c.opener, history: c.history,
    key: c.key, margin: c.margin, empties: c.empties, shape: c.shape, motif: c.motif,
  });
  console.error(`${live}${sun ? ' (Sunday)' : ''}  ${c.empties} empty, ${c.moveCount} legal, wins by ${c.margin}, key ${SQ_NAME(c.key)} flips ${c.keyFlips} (${c.minFlip}-${c.maxFlip}) ${c.shape}${c.openCorners.length ? (c.cornerIsKey ? ' corner-key' : ' corner-trap') : ''}, solve ${c.solveMs}ms`);
}

const header = `// Puzzle data for Turn, the daily Othello endgame. Imported ONLY by the server
// page (app/turn/page.js), which filters live<=today before handing the bank to
// the client, so tomorrow's board and the square that wins it never ship to a
// browser.
//
// Every board is a real, reachable position with YOU to move and the game
// already won. Weekdays have 10 empty squares, Sundays 12.
//
//   board    64 chars, one per square, reading left to right and top to bottom:
//            '0' empty, '1' yours, '2' the engine's. Square index = row * 8 + col.
//   opener   which label moved FIRST from the standard opening four, 1 you or
//            2 the engine. Black always moves first in Othello; this records
//            which colour you ended up as.
//   history  the exact order the game was played in, from the standard start.
//            It is the PAST and gives away nothing about what to play next; it
//            is there so scripts/verify-turn.mjs can PROVE the position is
//            reachable by a legal game, by replaying it, instead of assuming so.
//   key      the ONLY square that still wins. Every other legal square ends
//            level or behind, and there is no take-back: the engine is perfect,
//            so once the win is gone it never comes back.
//   margin   the disc margin you end up winning by, with best play from both
//            sides after the key.
//   empties  empty squares at the root.
//   shape    where the key sits on the flip-count scale: 'quiet' is the square
//            that flips the fewest discs, 'greedy' the one that flips the most,
//            'middle' neither. It ROTATES through the bank on purpose. Flipping
//            the fewest discs is the right habit in Othello, so a bank that
//            never punished it would teach a reflex rather than a read.
//   motif    the idea, revealed only after the game ends.
//
// On EVERY board the greedy square and the quiet square are two different
// squares, so both temptations are live and neither flip count is ever a
// reliable proxy for the answer.
//
// Generated by scripts/gen-turn.mjs and checked by scripts/verify-turn.mjs,
// which recomputes the key, the margin and the shape from the position with the
// shipping engine rather than trusting any stored field.
`;

const body = out.map((p) => `  {
    num: ${p.num},
    quizId: '${p.quizId}',
    live: '${p.live}',
    dateLabel: '${p.dateLabel}',
    sunday: ${p.sunday},
    board: '${p.board}',
    opener: ${p.opener},
    history: [${p.history.join(', ')}],
    key: ${p.key},
    margin: ${p.margin},
    empties: ${p.empties},
    shape: '${p.shape}',
    motif: '${p.motif.replace(/'/g, "\\'")}',
  },`).join('\n');

const dest = arg('--out', 'app/turn/puzzles.js');
writeFileSync(dest, `${header}export const PUZZLES = [\n${body}\n];\n`);
console.error(`\nwrote ${out.length} boards to ${dest}`);
