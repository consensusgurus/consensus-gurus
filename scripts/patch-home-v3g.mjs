/* Home: one scroll arrow on the phone, for real this time.
 *
 * Owner, 2026-08-15: mobile still has scroll arrows for both the categories and
 * the sub-categories, combine into one in the middle of the two rows.
 *
 * It was written, and it could never have worked: the rule hiding row two's
 * chevrons on the phone was placed INSIDE the min-width:901px block, so it read
 * "when the viewport is at least 901px AND at most 900px", which is never. A
 * nested media query intersects with its parent rather than replacing it. Moved
 * out beside the band rule, which is already deliberately outside the desktop
 * block for exactly this reason.
 *
 * The surviving pair needs no repositioning: row two's strip is nested inside
 * row one's wrapper, so row one's chevrons are already absolutely positioned
 * against a box that spans BOTH rows, and top:50% already centres them between
 * the two. That is why they look right on desktop and why the only thing wrong
 * on the phone was the second pair still being drawn.
 *
 *   node scripts/patch-home-v3g.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3g.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, mark = null) {
  if (mark ? src.includes(mark) : (repl !== '' && src.includes(repl))) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`ANCHOR ${label}: expected 1, found ${n}`);
  N += 1;
  return src.split(find).join(repl);
}
function del_(src, text, label) {
  if (!src.includes(text)) { SKIP += 1; return src; }
  N += 1;
  return src.split(text).join('');
}

let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* Out of the desktop block, where it was inert. */
s = del_(s,
  `        /* Row two keeps its own chevrons on desktop only; on the phone row one
           drives both and a second pair would just be a second control. */
        @media(max-width:900px){.dhome.cats .sl-filtw2 .sl-fnav{display:none;}}
`, 'DS:drop-nested-hide');

/* And in beside the band rule, which is outside every media query on purpose. */
s = sub(s,
  `      .dhome.cats .sl-band{display:none !important;}`,
  `      .dhome.cats .sl-band{display:none !important;}
      /* ONE PAIR OF CHEVRONS ON THE PHONE, centred between the two rows. Row
         one's pair already scrolls both and already sits against a box that
         spans both rows, since row two's strip is nested inside row one's
         wrapper; the only thing wrong was that row two still drew its own.
         This rule has to live OUT here: inside the min-width:901px block it
         read "at least 901 and at most 900", which is never, because a nested
         media query intersects with its parent rather than replacing it. */
      @media(max-width:900px){
        .dhome.cats .sl-filtw2 .sl-fnav{display:none !important;}
        .dhome.cats .sl-filtw2::before,.dhome.cats .sl-filtw2::after{display:none !important;}
      }`,
  'DS:hide-row2-nav-phone-real');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);
console.log(`patch-home-v3g: ${N} edits, ${SKIP} already present`);
