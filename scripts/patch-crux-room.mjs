#!/usr/bin/env node
// CRUX RAN OFF THE FOLD, and the reason was one number.
//
// The board is sized by a clamp whose third term is (100vh - ROOM)/rows, where
// ROOM is everything on the page that is not the board. ROOM was hardcoded at
// 330. It measures 452. So the board was sized for a viewport a quarter taller
// than the one it had, and 161px of it hung below the fold at 945 tall — much
// worse on a laptop.
//
// A guess could not have stayed right anyway: the strip under the board grows a
// row when you spend a guess, and the category cards above it are as tall as
// the longest category name. So it is measured now, by lib/stage-fit.js, and
// published on the stage root as --cx-room so the BOARD and the LADDER both
// read it and keep tracking each other.
//
// Separately the category strip is trimmed on the stage: it was the second
// biggest block on the page after the board itself (123px of 945), and the
// owner asked for it to read closer to the ladder's weight.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-room.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';

let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
function one(find, repl, label) {
  const n = s.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: anchor matched ${n} times, expected 1`);
  TOTAL++;
  s = s.replace(find, repl);
}

// ------------------------------------------------------------------- import
one(`import { useStageTheme } from '@/lib/stage-theme';`,
  `import { useStageTheme } from '@/lib/stage-theme';
import { useStageRoom } from '@/lib/stage-fit';`, 'import');

// ------------------------------------------------ the ladder tracks the board
// This lives in the module-level stylesheet, so it cannot read a per-render
// value; it reads the custom property instead, with the old constant as the
// fallback for the frame before the first measurement lands.
one(`  height:clamp(200px, calc(100vh - \${STAGE_VROOM}px), 560px);}`,
  `  height:clamp(200px, calc(100vh - var(--cx-room, \${STAGE_VROOM}px)), 560px);}`, 'gutter height');

// ------------------------------------------------------- trim the categories
// The cards were 123px of a 945px page for four short labels and twelve chips.
// Stage only: the Loft board keeps its own proportions.
one(`.stage-page .cx-tries{color:var(--stg-mute,#8b95a8);}`,
  `.stage-page .cx-tries{color:var(--stg-mute,#8b95a8);}
/* The category strip is the second biggest block on the page after the board,
   and it is a row of labels, not a panel. Trimmed to read closer to the
   ladder's weight, which is what buys the board its rows back. */
.stage-page .cl-cats{gap:6px;}
.stage-page .cl-cat{padding:6px 9px !important;gap:3px;}
.stage-page .cl-cat-nm{font-size:11px !important;}
.stage-page .cl-cat-ws{gap:4px !important;}
.stage-page .cl-cat-ws > *{padding:1px 9px !important;font-size:11.5px !important;}`, 'category trim css');

one(`                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {cat.words.map((_, i) => {`,
  `                    <div className="cl-cat-ws" style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {cat.words.map((_, i) => {`, 'category chip wrapper class');

// ------------------------------------------------------------ measured room
one(`  const VROOM = STAGE ? STAGE_VROOM : 430;`,
  `  const VROOM = STAGE ? STAGE_VROOM : 430;
  // Measured, not guessed. See lib/stage-fit.js for why this cannot loop.
  const gridRef = useRef(null);
  const stageRoom = useStageRoom(gridRef, STAGE);`, 'room hook');

one(`      style={{ ...(STAGE ? STAGE_ACC : null), minHeight: '100vh',`,
  `      style={{ ...(STAGE ? STAGE_ACC : null), ...(stageRoom ? { '--cx-room': stageRoom + 'px' } : null), minHeight: '100vh',`, 'root var');

// The board and the gutter both live under the root, so publishing there is
// what keeps them tracking each other rather than agreeing at one window size.
one(`.cl-grid{--cs:min(\${CS_FILL}px, calc((596px - \${(COLS - 1) * 3}px)/\${COLS}), max(\${CS_MIN}px, calc((100vh - \${VROOM}px)/\${ROWS})));}`,
  `.cl-grid{--cs:min(\${CS_FILL}px, calc((596px - \${(COLS - 1) * 3}px)/\${COLS}), max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px))/\${ROWS})));}`, 'grid clamp');

one(`@media (max-width:900px){.cl-grid{--cs:min(\${CS_FILL}px, calc((100vw - \${88 + (COLS - 1) * 3}px)/\${COLS}), max(\${CS_MIN}px, calc((100vh - \${VROOM}px)/\${ROWS})));}}`,
  `@media (max-width:900px){.cl-grid{--cs:min(\${CS_FILL}px, calc((100vw - \${88 + (COLS - 1) * 3}px)/\${COLS}), max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px))/\${ROWS})));}}`, 'grid clamp mobile');

one(`              <div className="cl-grid" style={{ display: 'grid',`,
  `              <div className="cl-grid" ref={gridRef} style={{ display: 'grid',`, 'grid ref');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-crux-room: ${TOTAL} edits`);
