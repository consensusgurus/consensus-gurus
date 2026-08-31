#!/usr/bin/env node
// THE RULES HAVE TO DESCRIBE THE BOARD THE PLAYER IS LOOKING AT.
//
// Making the board neutral left the legend describing the old one. It said
// "Dark = right letter, right square" and "Yellow = in the word", and on the
// stage a right letter is now a FILLED near-white cell on the dark register (a
// near-black one on the pale), and the second state is a shade rather than a
// colour. Worse, the "Dark" swatch was drawn with COLORS.ink, which on the dark
// stage is a near-black chip on a near-black ground: a legend you cannot see
// explaining a colour that is not there.
//
// This is the same rule as the daily copy rule already in CLAUDE.md, that a
// game's own jargon must be defined and must match its behaviour. A legend that
// names a colour the board stopped using is worse than no legend.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-crux-legend.mjs <repo-root>'); process.exit(1); }
const P = 'app/crux/CruxClient.jsx';
let TOTAL = 0;
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');
function one(find, repl, label) {
  const n = s.split(find).length - 1;
  if (n !== 1) throw new Error(`${label}: matched ${n}, expected 1`);
  TOTAL++; s = s.replace(find, repl);
}

one(`      chips={[
        { label: 'Dark = right letter, right square', style: { background: COLORS.ink, color: T.white, border: \`1.5px solid \${COLORS.ink}\` } },
        { label: 'Yellow = in the word, different square', style: { background: '#e6b93f', color: '#5c4a06', border: '1.5px solid #5c4a06' } },
      ]}`,
  `      chips={STAGE ? [
        // The swatches are the BOARD's own values, not a description of them,
        // so the legend cannot drift from the grid again.
        { label: 'Filled = right letter, right square', style: { background: BOARD_C, color: BOARD_ON, border: \`1.5px solid \${BOARD_C}\` } },
        { label: 'Shaded = in the word, different square', style: { background: 'color-mix(in srgb, var(--stg-ink) 34%, transparent)', color: INK, border: '1.5px solid var(--stg-line2)' } },
      ] : [
        { label: 'Dark = right letter, right square', style: { background: COLORS.ink, color: T.white, border: \`1.5px solid \${COLORS.ink}\` } },
        { label: 'Yellow = in the word, different square', style: { background: '#e6b93f', color: '#5c4a06', border: '1.5px solid #5c4a06' } },
      ]}`, 'legend chips');

one(`        <>A dark letter <b>locks in</b>, and its crossings lock with it.</>,`,
  `        <>A {STAGE ? 'filled' : 'dark'} letter <b>locks in</b>, and its crossings lock with it.</>,`,
  'locks-in step');

fs.writeFileSync(path.join(ROOT, P), s);
console.log(`patch-crux-legend: ${TOTAL} edits`);
