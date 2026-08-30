// Crux on the stage: fit the board to one screen, and let the ladder match it.
//
// Owner: can the letter tile area be smaller so more fits on one screen, and so
// it better matches the ladder on the left.
//
// TWO NUMBERS WERE INHERITED FROM A PAGE THAT NO LONGER EXISTS. The cell size
// clamps against `(100vh - 430px)/ROWS` with a floor of 42px, and BOTH of those
// were sized for the Loft page, which carried a DailyChrome band, a LoftCap and
// a stat strip above the board. The stage carries one line. So on a 772px
// window a fourteen row Sunday board computed (772-430)/14 = 24px, hit the 42px
// floor, and rendered 630px of grid that ran past the fold, on a page with
// three hundred pixels of chrome it no longer has.
//
// The stage gets its own budget: 330px of chrome instead of 430, and a 30px
// floor instead of 42. A weekday board is unaffected, because it is short
// enough that the width term wins either way.
//
// AND THE LADDER TRACKS THE SAME EXPRESSION. "Matches the ladder" is not a
// number to hand-tune, it is the same calc: give the gutter the height the grid
// is budgeted and the two move together at every window size, including the
// ones nobody tested.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-crux-fit.mjs <CruxClient.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;
function edit(name, anchor, replacement) {
  const hits = s.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}

// One name for the height budget, used by the grid and by the gutter, so
// "matches" is structural rather than two numbers that agree today.
// STAGE_VROOM lives at MODULE scope because STAGE_BOARD_CSS, which is also a
// module const, reads it. Declaring it inside the component and interpolating
// it into that string is a ReferenceError at import time: the page does not
// render at all, and esbuild compiles it happily. Caught before it shipped.
edit('module budget',
  "const STAGE_BOARD_CSS = `",
  "// The vertical room the STAGE reserves above the board. The Loft page kept\n"
  + "// 430px for a masthead, a stat bar and a cap; the stage shows one line. Both\n"
  + "// the grid's cell clamp and the ladder gutter's height read this, which is\n"
  + "// what makes \"the ladder matches the board\" structural rather than two\n"
  + "// numbers that happen to agree at one window size.\n"
  + "const STAGE_VROOM = 330;\n"
  + "const STAGE_BOARD_CSS = `");

edit('budget',
  "  const CS_FILL = Math.max(48, Math.min(58, Math.round((540 - (COLS - 1) * 3) / COLS)));",
  "  // The vertical room the board actually has. The Loft reserved 430px for a\n"
  + "  // masthead, a stat bar and a cap; the stage shows one line, so it reserves\n"
  + "  // 330. The floor drops with it: 42px was chosen when a tall board could\n"
  + "  // scroll under all that chrome, and on the stage it just overflows.\n"
  + "  const VROOM = STAGE ? STAGE_VROOM : 430;\n"
  + "  const CS_MIN = STAGE ? 30 : 42;\n"
  + "  const CS_FILL = Math.max(48, Math.min(58, Math.round((540 - (COLS - 1) * 3) / COLS)));");

edit('grid clamp',
  ".cl-grid{--cs:min(${CS_FILL}px, calc((596px - ${(COLS - 1) * 3}px)/${COLS}), max(42px, calc((100vh - 430px)/${ROWS})));}",
  ".cl-grid{--cs:min(${CS_FILL}px, calc((596px - ${(COLS - 1) * 3}px)/${COLS}), max(${CS_MIN}px, calc((100vh - ${VROOM}px)/${ROWS})));}");
edit('grid clamp 900',
  "@media (max-width:900px){.cl-grid{--cs:min(${CS_FILL}px, calc((100vw - ${88 + (COLS - 1) * 3}px)/${COLS}), max(42px, calc((100vh - 430px)/${ROWS})));}}",
  "@media (max-width:900px){.cl-grid{--cs:min(${CS_FILL}px, calc((100vw - ${88 + (COLS - 1) * 3}px)/${COLS}), max(${CS_MIN}px, calc((100vh - ${VROOM}px)/${ROWS})));}}");

// the gutter takes the SAME budget, so it and the board move together
edit('gutter height',
  ".stage-page .cx-gut{flex:0 0 88px;align-self:flex-start;height:clamp(240px,44vh,440px);}",
  ".stage-page .cx-gut{flex:0 0 88px;align-self:flex-start;\n"
  + "  /* The grid's own height budget, so the ladder and the board track each\n"
  + "     other at every window size rather than agreeing at one. */\n"
  + "  height:clamp(200px, calc(100vh - ${STAGE_VROOM}px), 560px);}");

writeFileSync(path, s);
console.log(`patched ${n} edits`);
