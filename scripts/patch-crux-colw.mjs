#!/usr/bin/env node
// The ladder was being paid for out of the BOARD's width.
//
// COLW is 640 so the board column matches DailyGamesGrid. On the Loft that is
// the whole column and the board gets all of it. On the stage the ladder rail
// sits INSIDE the same 640 (88px rail + a 24px gap), so the board was left with
// 528 and rendered about 18% narrower than on the Loft, for no reason anyone
// asked for: the extra width is there, the page wrapper is 1180.
//
// The stage column is the board's 640 PLUS the rail, so the board keeps its own
// size and the ladder hangs off the side of it. The two numbers come from the
// .cx-gut rule in the module stylesheet, which is why they are named here
// rather than added as a literal.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-colw.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');

const FIND = `  const COLW = 640;      // matches DailyGamesGrid; board stays centered at its own size`;
const REPL = `  // The board's own column, matching DailyGamesGrid, so it stays centred at
  // its own size. GUT_W and GUT_GAP mirror the .cx-gut rule in the stage
  // stylesheet: on the stage the rail is ADDED to the column rather than taken
  // out of it, or the ladder is paid for with the board's width and the board
  // comes out ~18% narrower than the same board on the Loft.
  const GUT_W = 88;
  const GUT_GAP = 24;
  const COLW = STAGE ? 640 + GUT_W + GUT_GAP : 640;`;

const n = s.split(FIND).length - 1;
if (n !== 1) throw new Error(`COLW anchor matched ${n}, expected 1`);
s = s.replace(FIND, REPL);
fs.writeFileSync(path.join(ROOT, P), s);
console.log('patch-crux-colw: 1 edit');
