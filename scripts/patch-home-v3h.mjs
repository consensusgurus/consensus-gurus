/* Home: no arrows and no fades on the phone, just flick to slide.
 *
 * Owner, 2026-08-15: mobile does not need arrows at all, that should just be
 * flick to slide, get rid of the fade element on the sides and let users use
 * finger motions to navigate.
 *
 * Right. A chevron is a mouse affordance: it exists to tell a pointer that a
 * strip scrolls, because a pointer cannot try. A finger just tries. On touch
 * both the button and the fade are chrome sitting on top of the thing they are
 * advertising, and the fade is the worse of the two because it dims the first
 * and last chip you are reaching for.
 *
 * Desktop keeps both, unchanged.
 *
 *   node scripts/patch-home-v3h.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3h.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, mark = null) {
  if (mark ? src.includes(mark) : (repl !== '' && src.includes(repl))) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== 1) throw new Error(`ANCHOR ${label}: expected 1, found ${n}`);
  N += 1;
  return src.split(find).join(repl);
}

let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* Replaces the rule that hid only row two's pair. Out here rather than in the
   desktop block, because a nested media query intersects with its parent: the
   first version of this lived inside min-width:901px and therefore read "at
   least 901 and at most 900", which is never. */
s = sub(s,
  `      @media(max-width:900px){
        .dhome.cats .sl-filtw2 .sl-fnav{display:none !important;}
        .dhome.cats .sl-filtw2::before,.dhome.cats .sl-filtw2::after{display:none !important;}
      }`,
  `      /* NO ARROWS AND NO FADES ON TOUCH (owner, 2026-08-15): flick to slide.
         A chevron is a MOUSE affordance. It exists to tell a pointer that a
         strip scrolls, because a pointer cannot simply try; a finger tries. On
         a phone both the button and the fade are chrome sitting on top of the
         thing they advertise, and the fade is the worse of the two, because
         what it dims is the first and last chip you are reaching for.

         The padding goes with them: .ml and .mr add 26px to clear a button
         that is no longer drawn, and that padding is why the strip would
         otherwise start with a gap where the arrow used to be. */
      @media(max-width:900px){
        .dhome.cats .sl-fnav{display:none !important;}
        .dhome.cats .sl-filtw::before,.dhome.cats .sl-filtw::after,
        .dhome.cats .sl-filtw2::before,.dhome.cats .sl-filtw2::after{display:none !important;}
        .dhome.cats .sl-filtw.ml .sl-filt,.dhome.cats .sl-filtw.mr .sl-filt,
        .dhome.cats .sl-filtw2.ml .sl-filt,.dhome.cats .sl-filtw2.mr .sl-filt{padding-left:0;padding-right:0;}
        /* Momentum scrolling on the older iOS engines, and the strip owns its
           horizontal gestures so a flick along it never turns into a page
           scroll halfway through. */
        .dhome.cats .sl-filt{-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;touch-action:pan-x;}
      }`,
  'DS:touch-no-chrome');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);
console.log(`patch-home-v3h: ${N} edits, ${SKIP} already present`);
