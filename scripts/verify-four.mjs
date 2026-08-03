// Verify the Four (daily Connect Four) bank. Four's own header comment
// (app/four/puzzles.js) and its client's rules copy (FourClient.jsx) promise,
// per puzzle:
//   - a real, reachable Connect Four position with YOU (red, player 1) to
//     move and a forced win, weekdays a win in exactly 4 of your moves,
//     Sundays exactly 5, never fewer;
//   - EXACTLY ONE column still wins ("Exactly ONE column still wins");
//   - `rootScore` is the solver's exact score for that column, in the
//     engine's own absolute units (app/four/c4.js).
// None of that was previously machine-checked. app/four/c4.js is the exact
// engine that also drives the live game, so this recomputes every number
// independently rather than trusting the stored fields.
//
//   1. Structural: `cells` is 42 digits of 0/1/2; disc counts for player 1
//      and player 2 are EQUAL (it is always red/player-1 to move next, so
//      plies must be even); no column has a floating disc (gravity holds);
//      no four-in-a-row already exists on the board (`findAnyWin`).
//   2. Full independent solve via `scoreMoves`: among the 7 columns, EXACTLY
//      ONE achieves the top score, and that column is `key`. Its score must
//      equal `rootScore`, and `movesToWin(empty, rootScore)` must equal
//      `winIn` -- proving the win is forced in exactly `winIn` moves, never
//      fewer (a faster win would show as a HIGHER top score, i.e. a smaller
//      move count, and would be caught here since we recompute the score
//      from scratch rather than checking the stored one).
//   3. `winIn` is 4 on weekdays, 5 on Sundays; `sunday` must match the real
//      day-of-week of `live`.
//   4. num/quizId/live/dateLabel are mutually consistent and sequential.
//   5. No duplicate boards (identical `cells`).
//   6. Pool variety: `motif` is reader-facing flavor text revealed after the
//      solve. The SAME exact motif string is not allowed to repeat more than
//      MOTIF_CEILING times across the whole bank, enforced hard for boards
//      live on or after FOUR_FLOOR_FROM and grandfathered as a note before
//      that (boards already published and played are frozen history, same
//      convention as verify-mate.mjs / verify-crux.mjs's *_FLOOR_FROM).
//   7. US spelling: `motif` strings are scanned for obvious British word
//      forms.
//
// Runtime: the solver is a fast alpha-beta negamax with a transposition
// table (the same one that powers the live game's engine reply), so all 28+
// boards solve in well under a second combined. No cap needed.
//
// Run: node scripts/verify-four.mjs
import { PUZZLES } from '../app/four/puzzles.js';
import { deserialize, findAnyWin, scoreMoves, movesToWin, COLS, ROWS } from '../app/four/c4.js';

let BAD = 0;
const fail = (id, msg) => { BAD++; console.error(`✗ ${id}: ${msg}`); };
const ok = (id, msg) => console.log(`✓ ${id}  ${msg}`);
const note = (id, msg) => console.log(`… ${id}  ${msg}`);

// Boards before this date are frozen history: already published and played.
const FOUR_FLOOR_FROM = '2026-08-03';
const MOTIF_CEILING = 2; // an exact motif string may repeat at most this many times

// ─── US-spelling scan ───────────────────────────────────────────────────────
const BRITISH_RE = /\b(colour|flavour|favourite|centre|theatre|organis(e|ing|ation)|recognis(e|ed|ing)|realis(e|ed|ing)|travell(ed|ing|er)|programme|metre|litre|kerb|tyre|analys(e|ed|ing)|catalogue|dialogue|jewellery|labour|neighbour|honour|armour|cheque|defence|licence|practise|whilst|amongst|learnt|aluminium|aeroplane)\b/i;
function scanBritish(id, label, s) {
  if (typeof s !== 'string') return;
  const m = s.match(BRITISH_RE);
  if (m) fail(id, `British spelling "${m[0]}" in ${label}: "${s}"`);
}

// ─── per-puzzle checks ──────────────────────────────────────────────────────
const seenCells = new Map();
const motifPool = new Map();

PUZZLES.forEach((p, i) => {
  const errs = [];

  if (p.num !== i + 1) errs.push(`num ${p.num} != ${i + 1}`);
  const m = p.quizId.match(/^four-(\d+)-(\d+)-(\d+)$/);
  if (!m) errs.push('bad quizId');
  else {
    const iso = `20${m[3]}-${String(m[1]).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
    if (iso !== p.live) errs.push(`live ${p.live} != quizId date ${iso}`);
  }
  const wantDateLabel = p.live ? new Date(`${p.live}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  if (wantDateLabel && p.dateLabel !== wantDateLabel) errs.push(`dateLabel "${p.dateLabel}" != "${wantDateLabel}"`);
  if (p.live) {
    const isSun = new Date(`${p.live}T12:00:00Z`).getUTCDay() === 0;
    if (!!p.sunday !== isSun) errs.push(`sunday must be ${isSun} for ${p.live} (real weekday)`);
  }
  const wantWinIn = p.sunday ? 5 : 4;
  if (p.winIn !== wantWinIn) errs.push(`winIn ${p.winIn} != ${wantWinIn} for ${p.sunday ? 'Sunday' : 'weekday'}`);

  // -- structural --
  let b = null;
  if (typeof p.cells !== 'string' || p.cells.length !== COLS * ROWS || !/^[012]+$/.test(p.cells)) {
    errs.push(`cells must be ${COLS * ROWS} digits of 0/1/2, got "${p.cells}"`);
  } else {
    b = deserialize(p.cells);
    let ones = 0, twos = 0;
    for (const v of b.cells) { if (v === 1) ones++; if (v === 2) twos++; }
    if (ones !== twos) errs.push(`disc counts unequal (red ${ones}, yellow ${twos}) -- it must be red/player-1 to move next`);
    let floating = false;
    for (let c = 0; c < COLS; c++) {
      let seenEmpty = false;
      for (let r = 0; r < ROWS; r++) {
        const v = b.cells[c * ROWS + r];
        if (v === 0) seenEmpty = true;
        else if (seenEmpty) floating = true;
      }
    }
    if (floating) errs.push('a disc is floating above an empty cell (gravity violated)');
    if (findAnyWin(b)) errs.push('a four-in-a-row already exists on the board before any move');
    if (b.turn !== 1) errs.push(`turn is ${b.turn}, must be 1 (red/you)`);
  }

  // -- independent solve --
  let solveNote = '';
  if (!errs.length) {
    const scored = scoreMoves(b);
    if (!scored.length) errs.push('scoreMoves returned no legal columns');
    else {
      const empty = COLS * ROWS - b.plies;
      const best = scored.reduce((a, s) => (s.score > a.score ? s : a), scored[0]);
      const winners = scored.filter((s) => s.score === best.score);
      if (winners.length !== 1) {
        errs.push(`NOT UNIQUE: ${winners.length} columns tie for the top score ${best.score} (${winners.map((s) => s.col).join(', ')})`);
      } else if (winners[0].col !== p.key) {
        errs.push(`the unique winning column is ${winners[0].col}, but key is ${p.key}`);
      } else {
        if (best.score !== p.rootScore) errs.push(`recomputed score ${best.score} != stored rootScore ${p.rootScore}`);
        const trueWinIn = movesToWin(empty, best.score);
        if (trueWinIn !== p.winIn) errs.push(`recomputed win distance ${trueWinIn} != stated winIn ${p.winIn} (violates "never fewer")`);
        solveNote = `, unique key col ${winners[0].col} confirmed by independent solve (score ${best.score})`;
      }
    }
  }

  if (!p.motif) errs.push('missing motif'); else scanBritish(p.quizId, 'motif', p.motif);
  if (p.cells) seenCells.set(p.cells, (seenCells.get(p.cells) || []).concat(p.quizId));
  if (p.motif) {
    const arr = motifPool.get(p.motif) || [];
    arr.push({ id: p.quizId, live: p.live });
    motifPool.set(p.motif, arr);
  }

  errs.length ? fail(p.quizId, errs.join('; ')) : ok(p.quizId, `win in ${p.winIn}${p.sunday ? ' (Sunday)' : ''}${solveNote}`);
});

for (const [, ids] of seenCells) {
  if (ids.length > 1) fail('four pool', `identical board shipped on ${ids.length} boards: ${ids.join(', ')}`);
}

// -- motif pool variety --
let staleFound = false;
for (const [motif, entries] of motifPool) {
  const freshCount = entries.filter((e) => e.live >= FOUR_FLOOR_FROM).length;
  if (entries.length > MOTIF_CEILING) {
    const msg = `motif reused on ${entries.length} boards (ceiling ${MOTIF_CEILING}): ${entries.map((e) => e.id).join(', ')} -- "${motif}"`;
    if (freshCount > 0) { fail('four pool', msg); staleFound = true; }
    else note('four pool', `grandfathered: ${msg}`);
  }
}
if (!staleFound && BAD === 0) ok('four pool', `${PUZZLES.length} boards, ${motifPool.size} distinct motifs, no motif over the ${MOTIF_CEILING}x ceiling on editable boards`);

console.log(BAD ? `\n${BAD} FAILURE(S)` : '\nAll Four boards verified.');
process.exit(BAD ? 1 : 0);
