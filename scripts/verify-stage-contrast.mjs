// HALF-CONVERTED ELEMENTS, in both directions.
//
//   node scripts/verify-stage-contrast.mjs
//
// The stage converter moves TEXT colours generically and SURFACES by rule, so
// the two can end up out of step on one element. Both directions are invisible
// to a build and to the eye until the page is open:
//
//   A. stage ink on a light literal ground  -> near-white type on a white card.
//      This is what the owner hit on Tuck's start gate.
//   B. a stage surface under a dark literal ink -> near-black type on the
//      near-black ground. Nobody had looked for this one.
//
// Per line, because these are inline style objects and a line is one element.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Text that is only legible on a LIGHT ground.
const DARK_INK = /color: (?:COLORS\.(?:ink|faded)|T\.ink)\b|color:\s*'#(?:0|1|2)[0-9a-f]{5}'|color:\s*'rgba\(2[08],\s*30,\s*36/;
// A LIGHT ground, inline or in the client's own CSS template.
const LIGHT_BG = /background(?:Color)?:\s*(?:T\.white|COLORS\.(?:cream|paper)|'#(?:fff|ffffff|[e-f][0-9a-f]{5})')|background:\s*(?:var\(--white\)|#(?:fff|[e-f][0-9a-f]{5}))\b/;
const STAGE_BG = /background(?:Color)?:\s*(?:STAGE \? (?:SURF|'var\(--stg)|'var\(--stg-(?:surf|raise|panel|ground))|background:\$\{STAGE/;

let bad = 0;
let n = 0;
const swatches = [];
for (const d of readdirSync('app', { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of readdirSync(join('app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const rel = join('app', d.name, f);
    const src = readFileSync(rel, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;
    n++;
    src.split('\n').forEach((l, i) => {
      const gatedBg = /background(?:Color)?:\s*(?:STAGE\s*\?|\$\{STAGE)/.test(l);
      const gatedInk = /color:\s*(?:STAGE\s*\?|\$\{STAGE)/.test(l);
      // A .cl-key is re-grounded by an !important rule in the client's own
      // stylesheet, so its inline light background never applies on the stage.
      // An !important stylesheet rule beats a non-important inline style.
      if (/className="cl-key/.test(l)) return;
      // The ELSE branch of a STAGE ternary that spans lines. A per-line counter
      // cannot see that `: { background: T.white ... }` is the non-stage half.
      if (/^\s*[:?]\s*[{']/.test(l)) return;
      // A LEGEND SWATCH shows the reader a colour the board actually uses, so
      // it must MATCH the board rather than be re-grounded. Collected and
      // printed at the end instead of failing: whether each still matches is a
      // judgement, and Crux's legend was genuinely wrong once.
      if (/label:.*style:\s*\{/.test(l)) { swatches.push(`${rel}:${i + 1}`); return; }
      // DIRECTION A. Any ungated light ground on a converted client. NOT paired
      // with an ink test on the same line: a card and its text are different
      // elements on different lines, which is exactly why Tuck's white gate with
      // near-white type slipped past the first version of this check.
      if (LIGHT_BG.test(l) && !gatedBg) {
        console.log(`\u2717 ${rel}:${i + 1}  light ground on the stage`);
        console.log(`    ${l.trim().slice(0, 130)}`);
        bad++;
      } else if (DARK_INK.test(l) && STAGE_BG.test(l) && !gatedInk) {
        // DIRECTION B. The reverse, which nobody had looked for: a stage surface
        // under ink that only works on paper.
        console.log(`\u2717 ${rel}:${i + 1}  dark ink on a stage ground`);
        console.log(`    ${l.trim().slice(0, 130)}`);
        bad++;
      }
    });
  }
}
if (swatches.length) {
  console.log(`\n\u2026 ${swatches.length} legend swatch(es) skipped — a swatch must MATCH its board, so check by eye:`);
  console.log('   ' + swatches.join(' '));
}
console.log(bad ? `\n${bad} half-converted element(s) across ${n} clients` : `clean: ${n} clients, no half-converted elements`);
process.exit(bad ? 1 : 0);
