// A LIFT CHANNEL WAS TOO CLEVER, and this is the correction.
//
// One channel re-grounds a surface: swap 255,255,255 for 11,15,26 and every
// raised thing flips. It does NOT re-scale one, and that is the half I missed.
// White at 4.5% on near-black is a clearly raised cell. Black at 4.5% on
// near-white is nothing at all, which is exactly what the light stage looked
// like: a crossword whose empty cells you could not see.
//
// ALPHA IS NOT TRANSFERABLE BETWEEN REGISTERS. Worse, the two registers do not
// even agree on DIRECTION: on a dark ground a surface is lighter than its
// ground and a border is lighter still, while on a pale ground the surface is
// WHITE and the border is DARK. No single channel expresses that.
//
// So the 50 call sites collapse into five named tokens by role, and each
// register defines all five for itself:
//
//   --stg-surf    a raised surface        (a cell, a card, a key)
//   --stg-surf2   a more raised one       (a hover, a pressed key, a panel)
//   --stg-line    a hairline
//   --stg-line2   a stronger rule
//   --stg-line3   the strongest rule      (a sudoku's box divisions)
//
// The dark values are the alphas those sites already used, bucketed, so the
// dark stage moves by at most a couple of percent on a handful of them.
import { readFileSync, writeFileSync } from 'node:fs';

// bucket ceiling -> token
const BUCKETS = [
  [0.055, '--stg-surf'],
  [0.095, '--stg-surf2'],
  [0.145, '--stg-line'],
  [0.25, '--stg-line2'],
  [1, '--stg-line3'],
];
const FALLBACK = {
  '--stg-surf': 'rgba(255,255,255,0.045)',
  '--stg-surf2': 'rgba(255,255,255,0.08)',
  '--stg-line': 'rgba(255,255,255,0.11)',
  '--stg-line2': 'rgba(255,255,255,0.17)',
  '--stg-line3': 'rgba(255,255,255,0.42)',
};

const files = process.argv.slice(2);
if (!files.length) throw new Error('usage: patch-stage-surfaces-tokens.mjs <file...>');
let grand = 0;
const tally = {};

for (const file of files) {
  let s = readFileSync(file, 'utf8');
  let n = 0;
  s = s.replace(/rgba\(var\(--stg-lift,255,255,255\),(\.?[0-9.]+)\)/g, (_m, a) => {
    const alpha = parseFloat(a.startsWith('.') ? `0${a}` : a);
    const token = (BUCKETS.find(([ceil]) => alpha <= ceil) || BUCKETS[BUCKETS.length - 1])[1];
    tally[token] = (tally[token] || 0) + 1;
    n += 1;
    return `var(${token},${FALLBACK[token]})`;
  });
  writeFileSync(file, s);
  console.log(`  ${file.split('/').pop().padEnd(20)} ${n}`);
  grand += n;
}
console.log(`${grand} sites -> ${Object.keys(tally).length} tokens`);
for (const [k, v] of Object.entries(tally)) console.log(`  ${k.padEnd(14)} ${v}`);
