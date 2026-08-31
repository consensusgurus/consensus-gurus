#!/usr/bin/env node
// THE BOARD WAS PAINTING SOLVED WORDS IN A CATEGORY'S COLOUR. Owner spotted it:
// "why is the base color one of the actual four category colors?"
//
// Because it is literally the same value. Crux's registry says cat: 'Word',
// Word is step 0 of CATEGORY_RAMP, and step 0 is sky #7dd3fc. The puzzle's four
// in-board categories are ALSO painted from CATEGORY_RAMP, starting at step 0.
// So the game accent and the first category chip are one colour.
//
// That is not a clash, it is a false statement. In the owner's screenshot ELBOW
// is solved and filed under PLUMBING FITTINGS (mint), and every one of its
// letters is painted sky, which is BODY JOINTS. The board says the word belongs
// to a category it does not belong to. Same family of bug as the ladder leak,
// inverted: there the colour told the truth too early, here it tells a lie.
//
// Three colour systems were drawing on one four-colour set: the puzzle's
// categories, the game accent, and the guess marks (whose yellow #e6b93f is
// ramp step 3, Drum Kit).
//
// THE RULE, which is just the stage pattern's "one ground, one colour family"
// applied honestly: ON A BOARD WHERE COLOUR ALREADY MEANS SOMETHING, NOTHING
// ELSE MAY SPEND A COLOUR. The categories own the hues here, so every other
// board state goes neutral and colour on the grid means category and nothing
// else. The accent stays on the CONTROLS (Start, Enter, submit) and in the cap,
// which are not board state and are not sitting among the pips.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-neutral-board.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';
let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
function one(find, repl, label) {
  const n = s.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: matched ${n}, expected 1`);
  TOTAL++; s = s.replace(find, repl);
}

// The neutral pair, declared beside the accent it deliberately is not.
one(`  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('crux');`,
  `  const STAGE_C = STAGE ? 'var(--stg-acc)' : gameColor('crux');
  // THE BOARD'S OWN INK, and the reason it is not STAGE_C. Crux is a Word game,
  // Word is step 0 of the ramp, and the puzzle's first category is drawn from
  // step 0 too, so the accent IS the first category's colour. A solved word
  // painted in it claims a category it may not belong to. On this board colour
  // means category; every other state is neutral, and neutral reads as LOCKED
  // in both registers (near-white on the dark ground, near-black on the pale).
  const BOARD_C = STAGE ? 'var(--stg-ink)' : COLORS.ink;
  const BOARD_ON = STAGE ? 'var(--stg-ground)' : T.white;`, 'board ink');

// The solved cell.
one(`    if (green) return { ...base, background: SPAL ? STAGE_C : COLORS.ink, color: SPAL ? RAMP_INK : T.white, border: \`1.5px solid \${SPAL ? STAGE_C : COLORS.ink}\`,`,
  `    if (green) return { ...base, background: SPAL ? BOARD_C : COLORS.ink, color: SPAL ? BOARD_ON : T.white, border: \`1.5px solid \${SPAL ? BOARD_C : COLORS.ink}\`,`,
  'solved cell');

// The cursor.
one(`        border: \`2px solid \${SPAL ? (isCursor ? STAGE_C : SPAL.selB) : (isCursor ? COLORS.ember : 'rgba(37,99,235,0.5)')}\`,`,
  `        border: \`2px solid \${SPAL ? (isCursor ? BOARD_C : SPAL.selB) : (isCursor ? COLORS.ember : 'rgba(37,99,235,0.5)')}\`,`,
  'cursor border');

// The selection wash and its rule, off the board's ink rather than the accent.
one(`    sel: 'color-mix(in srgb, var(--stg-acc) 14%, transparent)',
    selCur: 'color-mix(in srgb, var(--stg-acc) 26%, transparent)',
    selB: 'color-mix(in srgb, var(--stg-acc) 50%, transparent)',`,
  `    sel: 'color-mix(in srgb, var(--stg-ink) 10%, transparent)',
    selCur: 'color-mix(in srgb, var(--stg-ink) 18%, transparent)',
    selB: 'color-mix(in srgb, var(--stg-ink) 38%, transparent)',`,
  'selection wash');

// The guess marks. `g` joins the neutral; `y` keeps a warm mark because "in the
// word, wrong square" is a real second state, but it moves OFF the ramp's gold
// so it stops reading as the Drum Kit chip.
// Two IDENTICAL lines, so this one is a counted replace-all rather than a
// unique anchor. Asserting the count is what keeps it honest.
{
  const find = `    ? { g: { bg: STAGE_C, fg: RAMP_INK }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: SPAL.spent, fg: SPAL.spentInk } }`;
  const repl = `    ? { g: { bg: BOARD_C, fg: BOARD_ON }, y: { bg: 'color-mix(in srgb, var(--stg-ink) 34%, transparent)', fg: INK }, x: { bg: SPAL.spent, fg: SPAL.spentInk } }`;
  const n = s.split(find).length - 1;
  if (n !== 2) throw new Error(`mark colours: matched ${n}, expected 2`);
  s = s.split(find).join(repl); TOTAL += n;
}

// The ladder sits beside the grid, so a sky rung reads as the first category
// exactly the way a sky cell did.
one(`  const stageBlocks = [{
    n: PUZZLE.slots.length,
    c: STAGE_C,`,
  `  const stageBlocks = [{
    n: PUZZLE.slots.length,
    // Neutral for the same reason the board is: this rail is inches from the
    // category chips and a coloured rung reads as one of them.
    c: STAGE ? 'var(--stg-ink2,#aab5c7)' : STAGE_C,`, 'ladder colour');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-crux-neutral-board: ${TOTAL} edits`);
