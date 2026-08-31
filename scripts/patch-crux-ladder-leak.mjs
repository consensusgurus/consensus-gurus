#!/usr/bin/env node
// THE CRUX LADDER WAS GIVING THE ANSWER AWAY. Owner spotted it.
//
// Crux scores solved + placements: you find the words, then you file each one
// under the right category. The ladder was built straight off PUZZLE.categories
// and leaked the filing half three separate ways.
//
//   1. GROUPING. Four blocks of three, in category order, so rung position maps
//      to category. Solve a word, watch which block lights, and you know where
//      it files without thinking about it.
//   2. COLOUR. Each rung was painted CATEGORY_RAMP[ci], the very same key the
//      chips above the board use. Even shuffled, the colour alone answers it.
//   3. WIDTH, but only because of 1. w: 0.42 + (word.length - 4) * 0.1 encoded
//      each word's LENGTH. Length by itself is public, since the grid draws
//      every slot at its full size before you solve anything. Length ARRANGED
//      BY CATEGORY is not: it hands you "Drum Kit is 5, 5 and 7 letters"
//      before the first guess.
//
// The ladder's job on the stage is PROGRESS, never identity. Rebuilt off
// PUZZLE.slots instead: one block, one rung per word in slot order, equal
// widths, the game's own accent. It still says "12 words, 6 found, 2 of them
// still floating", which is the one thing the figures cannot say, and slot
// order is already printed on the board so it reveals nothing new.
//
// Audited the other three ladders for the same class of thing and they are
// clean, for the same reason: each reports something the BOARD already shows.
// Suds counts free cells per box, Mate counts plies against a mate-in-N that
// is the headline figure, Anon splits spine from bank, which is structural.
// Anon does carry a length-derived width, and that is fine precisely because
// it is NOT grouped by anything the player is trying to work out.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-ladder-leak.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');

const FIND = `  const stageBlocks = PUZZLE.categories.map((cat, ci) => ({
    n: cat.words.length,
    c: STAGE ? CATEGORY_RAMP[ci % CATEGORY_RAMP.length] : STAGE_C,
    on: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] !== undefined),
    half: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] === undefined),
    w: cat.words.map((w) => 0.42 + (w.length - 4) * 0.1),
  }));`;

const REPL = `  // ONE BLOCK, IN SLOT ORDER, ONE COLOUR, EQUAL RUNGS. Built off slots rather
  // than categories on purpose: this ladder reports PROGRESS and must not
  // report IDENTITY. Grouping by category told you where a word files the
  // moment you solved it, the per-category colour said the same thing again,
  // and a width derived from word length leaked every category's letter counts
  // before the first guess. Slot order is already printed on the board, so a
  // lit rung says nothing the board does not.
  const stageBlocks = [{
    n: PUZZLE.slots.length,
    c: STAGE_C,
    on: PUZZLE.slots.map((sl) => g.solved[sl.id] && g.assigned[sl.word] !== undefined),
    // Half-lit is found but not yet filed, which is the one thing the figures
    // cannot say: 6 of 12 words does not tell you two are still floating.
    half: PUZZLE.slots.map((sl) => g.solved[sl.id] && g.assigned[sl.word] === undefined),
  }];`;

const n = s.split(FIND).length - 1;
if (n !== 1) throw new Error(`stageBlocks anchor matched ${n}, expected 1`);
s = s.replace(FIND, REPL);

fs.writeFileSync(path.join(ROOT, P), s);
console.log('patch-crux-ladder-leak: 1 edit');
