// /daily-five moved onto the stage with the rest of the circuit family, so the
// two things this component paints OUTSIDE the scorecard have to move with it:
// its default ink was the site's near-black, and its one button was white on
// navy, chosen for a ground that is no longer there. Both were invisible on one
// register or the other, which is the half-conversion failure exactly.
//
// The scorecard itself is deliberately untouched: CircuitScorecard is shared
// with the Gauntlet run's own ending, which already draws it as a light card on
// a near-black ground, and restyling it here would restyle that.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , src, out] = process.argv;
if (!src || !out) { console.error('usage: patch-dailyfive-stage.mjs <in> <out>'); process.exit(1); }
let s = readFileSync(src, 'utf8');

const swap = (label, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) throw new Error(`${label}: anchor not found`);
  if (s.indexOf(from, a + 1) >= 0) throw new Error(`${label}: anchor matched twice`);
  s = s.slice(0, a) + to + s.slice(a + from.length);
};

swap('ink',
  "font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--ink);}",
  "font-family:'Manrope',system-ui,-apple-system,sans-serif;color:var(--stg-ink);}");

swap('home-button',
  `        /* One way back, at the foot, where a reader who has finished reading
           is. The run's other exits all lead deeper into a game; this is the
           only one that leaves. It sits on the NAVY page rather than in the
           card, so its colours are chosen against navy. */
        .d5s-home{display:flex;align-items:center;justify-content:center;gap:8px;
                  background:var(--white);color:var(--accent);border:1.5px solid #1a2748;
                  border-radius:11px;padding:14px 18px;font-size:13px;font-weight:800;
                  letter-spacing:.03em;text-decoration:none;}
        .d5s-home:hover{background:#eef3ff;}`,
  `        /* One way back, at the foot, where a reader who has finished reading
           is. The run's other exits all lead deeper into a game; this is the
           only one that leaves. It sits on the PAGE rather than in the card, so
           it is drawn in the stage's tokens and follows whichever register the
           reader is in. It used to be a white slab with navy ink, which was
           right on the navy page this replaced and unreadable on the light
           stage. */
        .d5s-home{display:flex;align-items:center;justify-content:center;gap:8px;
                  background:var(--stg-surf);color:var(--stg-ink);
                  border:1px solid var(--stg-line);
                  border-radius:11px;padding:14px 18px;font-size:13px;font-weight:800;
                  letter-spacing:.03em;text-decoration:none;}
        .d5s-home:hover{border-color:var(--stg-line2);}
        .d5s-home:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}`);

for (const dead of ['var(--ink)', 'background:#eef3ff', 'border:1.5px solid #1a2748']) {
  if (s.includes(dead)) throw new Error(`residue: ${dead} still present`);
}

writeFileSync(out, s);
console.log(`ok  ${src} -> ${out}`);
