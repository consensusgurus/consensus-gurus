#!/usr/bin/env node
// The last three genuinely light surfaces in the converted set.
//
// The audit reports six more on Crux and one on Strata that are FALSE
// POSITIVES, and they are worth naming so nobody chases them again:
//
//   crux 1261  a legend swatch. Yellow means "right letter, wrong square", so
//              it is a meaning colour and stays yellow on any ground.
//   crux 1452  the `:` branch of a STAGE ternary. The audit counts per line,
//              so a ternary split across lines reads as unconverted.
//   crux 1528/1532/1601  .cl-key buttons, already re-grounded by the
//              !important stage rule in the module stylesheet.
//   strata 595 .st-tile.bad is the wrong-answer state. Same as the legend: a
//              state colour, not a surface.
//
// What is real: the two hint chips on Crux (a cream chip that lit up the dark
// board), and Hands' tool button.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-stage-lastlight.mjs <repo-root>'); process.exit(1); }
let TOTAL = 0;
const edit = (rel, pairs) => {
  const p = path.join(ROOT, rel);
  let s = fs.readFileSync(p, 'utf8');
  for (const [find, repl, label] of pairs) {
    const n = s.split(find).length - 1;
    if (n !== 1) throw new Error(`${rel} ${label}: matched ${n}, expected 1`);
    TOTAL++; s = s.replace(find, repl);
  }
  fs.writeFileSync(p, s);
};

// Crux's hint chips keep their GOLD, because gold is what a hint is on this
// site, but the cream fill becomes a stage surface so the chip stops being the
// brightest thing on the board.
edit('app/crux/CruxClient.jsx', [
  [`style={{ marginLeft: 'auto', background: '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.7)', height: 30, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: '#8a6d1a' }}`,
   `style={{ marginLeft: 'auto', background: STAGE ? 'var(--stg-surf2)' : '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.7)', height: 30, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: STAGE ? INK : '#8a6d1a' }}`,
   'free hint chip'],
  [`background: canAffordPaid ? '#fdf6e3' : 'rgba(28,30,36,0.05)', border: \`1.5px solid \${canAffordPaid ? 'rgba(230,185,63,0.7)' : 'rgba(28,30,36,0.16)'}\`,`,
   `background: canAffordPaid ? (STAGE ? 'var(--stg-surf2)' : '#fdf6e3') : (STAGE ? 'var(--stg-surf)' : 'rgba(28,30,36,0.05)'), border: \`1.5px solid \${canAffordPaid ? 'rgba(230,185,63,0.7)' : (STAGE ? 'var(--stg-line)' : 'rgba(28,30,36,0.16)')}\`,`,
   'paid hint chip'],
  [`color: canAffordPaid ? '#8a6d1a' : COLORS.faded,`,
   `color: canAffordPaid ? (STAGE ? INK : '#8a6d1a') : FADED,`,
   'paid hint chip ink'],
]);

// Hands' tool button, the same shape Mate's .mt-tool had: a white fill and a
// near-black border, which is invisible on the dark stage from both ends.
edit('app/hands/HandsClient.jsx', [
  [`.hd-tool{font-family:\${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:var(--white);color:\${INK};`,
   `.hd-tool{font-family:\${SANS};font-weight:800;font-size:12.5px;border:1.5px solid \${STAGE ? 'var(--stg-line2)' : 'rgba(28,30,36,0.35)'};background:\${STAGE ? 'var(--stg-surf2)' : 'var(--white)'};color:\${INK};`,
   'hands tool'],
]);

console.log(`patch-stage-lastlight: ${TOTAL} edits`);
