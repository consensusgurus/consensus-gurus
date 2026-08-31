#!/usr/bin/env node
// A WHITE CARD WITH WHITE TEXT ON IT. Owner's screenshot: Tuck's start gate, a
// white panel carrying near-white type, unreadable.
//
// That is what a HALF conversion looks like, and it is worse than no conversion.
// The converter rewrites text colours generically (`color: COLORS.ink` becomes
// `color: INK`, which is near-white on the stage) but the SURFACES were being
// converted by matching known shapes. Tuck's gate is the same object as every
// other gate with `maxWidth: 432, margin: '0 auto 4px'` added, so the shape rule
// missed it, the ink moved anyway, and the card became invisible type on white.
//
// So surfaces get the same treatment as text: matched by TOKEN, not by shape.
// Every light background left on a converted client becomes a stage surface,
// and the near-black borders that go with them become stage rules.
//
// TWO GUARDS, both learned here:
//
//   SCOPE. SURF / SURF_B / INK are declared inside the main component, and
//   several clients define helper components ABOVE it where those names do not
//   exist at all. Nothing above the declaration line is touched. (Etch shipped
//   a ReferenceError this way.)
//
//   MEANING. A pale wash that MEANS something (error pink, hint gold, warning
//   amber) keeps its border and its identity; only its fill becomes a stage
//   surface, so it stops being the brightest thing on the board while still
//   reading as a warning. Same call as Crux's hint chip.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-delight.mjs <repo-root>'); process.exit(1); }

// [regex, replacement]. Applied per LINE, and only to lines that do not already
// mention STAGE, so a converted site is never converted twice.
const SURFACES = [
  [/background(Color)?: T\.white\b/g, 'background$1: STAGE ? SURF : T.white'],
  [/background(Color)?: COLORS\.cream\b/g, 'background$1: STAGE ? SURF : COLORS.cream'],
  [/background(Color)?: COLORS\.paper\b/g, "background$1: STAGE ? 'var(--stg-surf2)' : COLORS.paper"],
  [/background(Color)?: '#(fff|ffffff)'/g, "background$1: STAGE ? SURF : '#$2'"],
  [/background:var\(--white\)/g, "background:${STAGE ? 'var(--stg-surf)' : 'var(--white)'}"],
  // The same thing inside the client's own CSS template, where a light ground
  // is written as a bare hex: .wm-track{background:#eef0f3}. The sweep only
  // knew var(--white) and left 60-odd of these behind.
  [/background:(#(?:fff|ffffff|[e-f][0-9a-f]{5}))\b/g, "background:${STAGE ? 'var(--stg-surf2)' : '$1'}"],
  // The pale meaning-washes: fill only.
  [/background(Color)?: '#(fdeeee|fdf6e3|fff7ed|fef3c7|f0fdf4|eff6ff)'/g,
    "background$1: STAGE ? 'var(--stg-surf2)' : '#$2'"],
];
// Borders that only make sense on a light ground.
const BORDERS = [
  [/border: `2px solid \$\{COLORS\.ink\}`/g, "border: STAGE ? `1px solid ${SURF_B}` : `2px solid ${COLORS.ink}`"],
  [/border: '1\.5px solid rgba\(28,30,36,0\.(?:18|2|14)\)'/g, "border: STAGE ? `1px solid ${SURF_B}` : '1.5px solid rgba(28,30,36,0.18)'"],
  [/border: '1px solid rgba\(28,30,36,0\.14\)'/g, "border: STAGE ? `1px solid ${SURF_B}` : '1px solid rgba(28,30,36,0.14)'"],
  [/border: `1px solid \$\{COLORS\.line\}`/g, "border: STAGE ? `1px solid ${SURF_B}` : `1px solid ${COLORS.line}`"],
  [/boxShadow: '5px 5px 0 rgba\(28,30,36,0\.16\)'/g, "boxShadow: STAGE ? 'none' : '5px 5px 0 rgba(28,30,36,0.16)'"],
];

let files = 0;
let edits = 0;
const report = [];

for (const d of fs.readdirSync(path.join(ROOT, 'app'), { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  for (const f of fs.readdirSync(path.join(ROOT, 'app', d.name))) {
    if (!/^[A-Z][A-Za-z]*Client\.jsx$/.test(f)) continue;
    const rel = path.join('app', d.name, f);
    const p = path.join(ROOT, rel);
    const src = fs.readFileSync(p, 'utf8');
    if (!/const STAGE = isStage\(/.test(src)) continue;

    const lines = src.split('\n');
    // Nothing above this line may use SURF / SURF_B: different scope entirely.
    const surfAt = lines.findIndex((l) => /^\s*const SURF = /.test(l));
    if (surfAt < 0) continue;

    let n = 0;
    for (let i = surfAt + 1; i < lines.length; i++) {
      let l = lines[i];
      // ALREADY CONVERTED means the BACKGROUND is gated, not that the line
      // mentions STAGE anywhere. Every card line also carries the loft-class
      // gate (`LOFT && !STAGE ? 'loft-card'`), so a naive test skipped exactly
      // the cards this exists to fix, Tuck's start gate among them.
      if (/background(Color)?:\s*STAGE\s*\?/.test(l)) continue;
      const before = l;
      for (const [re, to] of SURFACES) l = l.replace(re, to);
      // Only re-ground a border on a line that also carries a surface, so a
      // border elsewhere on the board keeps whatever it was doing.
      if (l !== before) for (const [re, to] of BORDERS) l = l.replace(re, to);
      if (l !== before) { lines[i] = l; n++; }
    }
    if (n) {
      fs.writeFileSync(p, lines.join('\n'));
      files++; edits += n;
      report.push(`  ${d.name.padEnd(10)} ${n}`);
    }
  }
}
console.log(report.join('\n'));
console.log(`\npatch-stage-delight: ${edits} lines across ${files} files`);
