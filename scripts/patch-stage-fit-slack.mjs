#!/usr/bin/env node
// THE MEASURER COUNTED EMPTY SPACE AS CHROME, so the board shrank to fill it.
//
// room was (board top - page top) + (page bottom - board bottom), and I argued
// it could not feed back because shrinking the board lowers the page bottom by
// exactly as much as the board bottom. True only while the page is TALLER than
// the viewport. .stage-page carries minHeight:100vh, so the moment the content
// fits, the page bottom stops moving and every pixel of slack under the content
// is counted as chrome: room grows, the board shrinks, the slack grows, and it
// runs away until the CS_MIN floor stops it.
//
// It was invisible at first because the board happened to be exactly as tall as
// the viewport, the one point where the two agree. Widening the column made the
// content shorter, and Crux's cell went 39 -> 33 with visible empty space under
// the page: an 80px gap divided by 14 rows is the 5.7px each cell lost.
//
// So measure the CONTENT bottom, not the padded box: the lowest bottom edge
// among the page's own children. That excludes minHeight slack, which is
// exactly the thing that was not chrome.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-fit-slack.mjs <repo-root>'); process.exit(1); }
const P = 'lib/stage-fit.js';
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');

const FIND = `// NO FEEDBACK LOOP. room = (board top - page top) + (page bottom - board
// bottom). Shrinking the board moves neither term: the chrome above keeps its
// position and the chrome below keeps its height, so the page bottom rises by
// exactly as much as the board bottom does. The observer fires once more after
// the board resizes, recomputes the same number, and stops.`;

const REPL = `// NO FEEDBACK LOOP, BUT ONLY IF THE BOTTOM IS THE CONTENT'S. room = (board top
// - page top) + (content bottom - board bottom). Shrinking the board moves
// neither term: the chrome above keeps its position and the chrome below keeps
// its height, so the content bottom rises by exactly as much as the board
// bottom does. The observer fires once more, recomputes the same number, stops.
//
// CONTENT bottom, never the page's own box. .stage-page carries minHeight:100vh,
// so once the content fits, the page's bottom edge stops moving and every pixel
// of slack beneath the content gets counted as chrome. Then room grows, the
// board shrinks, the slack grows, and it runs away until the cell floor catches
// it. That is not hypothetical: it cost Crux six pixels a cell the first time
// the board became short enough to leave any slack at all, and it hid until
// then because a board exactly as tall as the viewport is the one case where
// the two measurements agree.`;

if (s.split(FIND).length - 1 !== 1) throw new Error('header anchor not found exactly once');
s = s.replace(FIND, REPL);

const FIND2 = `      const pr = page.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (!br.height) return;
      const next = Math.round((br.top - pr.top) + (pr.bottom - br.bottom));`;
const REPL2 = `      const pr = page.getBoundingClientRect();
      const br = b.getBoundingClientRect();
      if (!br.height) return;
      // The lowest edge anything on the page actually reaches. Direct children
      // are enough: the content is nested inside them, so their boxes already
      // contain it.
      let contentBottom = br.bottom;
      for (const c of page.children) {
        const r = c.getBoundingClientRect();
        if (r.height && r.bottom > contentBottom) contentBottom = r.bottom;
      }
      const next = Math.round((br.top - pr.top) + (contentBottom - br.bottom));`;

if (s.split(FIND2).length - 1 !== 1) throw new Error('measure anchor not found exactly once');
s = s.replace(FIND2, REPL2);

fs.writeFileSync(path.join(ROOT, P), s);
console.log('patch-stage-fit-slack: 2 edits');
