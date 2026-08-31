#!/usr/bin/env node
// THE GAPS WERE NEVER IN THE SUM.
//
// With the room measured honestly the board still hung 38px below the fold,
// and 38 is not a coincidence: the grid is 14 rows with a 3px gap between them,
// so the gaps are 39px that the cell formula divided the height without ever
// subtracting. It divided the AVAILABLE HEIGHT by the row count and used the
// answer as the cell size, which only works on a grid with no gaps.
//
// Hidden until now because the room was overstated by 122px, so the board was
// far enough under its own budget that a 39px error never showed. Two wrongs
// that stopped cancelling the moment the first was fixed.
//
// SLACK is 8px so the board rests on the fold rather than exactly against it.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-gaps.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';
let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
function one(find, repl, label) {
  const n = s.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: matched ${n}, expected 1`);
  TOTAL++; s = s.replace(find, repl);
}

// The board's own height budget, named once so the cell maths and the ladder
// cannot drift apart. GAPS is (rows - 1) * the 3px grid gap.
one(`  const VROOM = STAGE ? STAGE_VROOM : 430;`,
  `  const VROOM = STAGE ? STAGE_VROOM : 430;
  // Everything the rows themselves do not occupy: the gaps between them, plus
  // a little slack so the board rests on the fold rather than against it.
  const GAPS = (ROWS - 1) * 3 + 8;`, 'GAPS const');

one(`max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px))/\${ROWS})));}
          @media (max-width:900px)`,
  `max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px) - \${GAPS}px)/\${ROWS})));}
          @media (max-width:900px)`, 'grid clamp desktop');

one(`max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px))/\${ROWS})));}}`,
  `max(\${CS_MIN}px, calc((100vh - var(--cx-room, \${VROOM}px) - \${GAPS}px)/\${ROWS})));}}`, 'grid clamp mobile');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-crux-gaps: ${TOTAL} edits`);
