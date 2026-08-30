// The stage's colours become CSS CUSTOM PROPERTIES, ahead of light mode.
//
//   node scripts/patch-stage-tokens.mjs app/StageChrome.jsx app/crux/CruxClient.jsx ...
//
// WHY NOW AND NOT LATER. Every conversion so far writes the stage's colours as
// inline hex in the client. Five clients is a morning to refactor. Eighty is a
// rewrite, and eighty is where this is going. A toggle then costs one class
// swap instead of touching every daily on the roster.
//
// WHY NOT A BLANKET SWEEP. Of 117 stage-looking literals in the converted
// files, only about half are ON the stage path: the rest are Loft-branch box
// shadows and highlights that must stay white, because the light page is still
// live for every unconverted game. So this converts exactly two shapes:
//
//   1. The TRUE branch of a `STAGE ? '<literal>' : ...` ternary, which is on the
//      stage path by construction.
//   2. Whole files that only ever render on the stage (StageChrome, and Crux's
//      STAGE_BOARD_CSS), where a blanket sweep is safe.
//
// StageLadder is deliberately NOT converted: it renders on the home too, and it
// already takes a `light` prop that answers the same question properly.
//
// EVERY VAR CARRIES ITS CURRENT VALUE AS A FALLBACK. var(--stg-ink,#e9edf4)
// means a missing stylesheet, a missing class or a stale cache degrades to
// exactly what ships today rather than to no colour at all.
import { readFileSync, writeFileSync } from 'node:fs';

// The named tokens. The lift CHANNEL is one variable rather than one per alpha:
// every rgba(255,255,255,a) on this surface means "lift the ground by a", and in
// light mode all of them become rgba(11,15,26,a) at once.
const NAMED = [
  ['#e9edf4', '--stg-ink'],
  ['#aab5c7', '--stg-ink2'],
  ['#8b95a8', '--stg-mute'],
  ['#66748f', '--stg-mute2'],
  ['#5a657d', '--stg-dim'],
  ['#0e131f', '--stg-raise'],
  ['#0d1220', '--stg-panel'],
  ['#0b0f1a', '--stg-ground'],
  ['#08222e', '--stg-onramp'],
];
const v = (hex, name) => `var(${name},${hex})`;

const files = process.argv.slice(2);
if (!files.length) throw new Error('usage: patch-stage-tokens.mjs <file...>');
// These render only on the stage, so every literal in them is stage path.
const WHOLE_FILE = /StageChrome\.jsx$/;

let grand = 0;
for (const file of files) {
  let s = readFileSync(file, 'utf8');
  let n = 0;
  const whole = WHOLE_FILE.test(file);

  for (const [hex, name] of NAMED) {
    const token = v(hex, name);
    if (whole) {
      const re = new RegExp(hex, 'gi');
      const hits = (s.match(re) || []).length;
      if (hits) { s = s.replace(re, token); n += hits; }
    } else {
      // Only the true branch of a STAGE ternary.
      const re = new RegExp("(STAGE \\? ')" + hex + "(')", 'gi');
      const hits = (s.match(re) || []).length;
      if (hits) { s = s.replace(re, `$1${token}$2`); n += hits; }
      // and the same literal inside a stage-only object or template
      const re2 = new RegExp("(SPAL = STAGE \\? \\{[\\s\\S]{0,600}?)" + hex, 'gi');
      if (re2.test(s)) { s = s.replace(re2, `$1${token}`); n += 1; }
    }
  }

  // the lift channel
  const liftRe = whole
    ? /rgba\(255,255,255,([0-9.]+)\)/g
    : /(STAGE \? ')rgba\(255,255,255,([0-9.]+)\)(')/g;
  const liftHits = (s.match(liftRe) || []).length;
  if (liftHits) {
    s = whole
      ? s.replace(liftRe, 'rgba(var(--stg-lift,255,255,255),$1)')
      : s.replace(liftRe, '$1rgba(var(--stg-lift,255,255,255),$2)$3');
    n += liftHits;
  }

  // Crux keeps its board stylesheet at module scope and it is stage-only.
  if (/STAGE_BOARD_CSS = `/.test(s)) {
    const i = s.indexOf('const STAGE_BOARD_CSS = `');
    const j = s.indexOf('`;', i);
    if (i >= 0 && j > i) {
      let block = s.slice(i, j);
      const before = block;
      for (const [hex, name] of NAMED) block = block.replace(new RegExp(hex, 'gi'), v(hex, name));
      block = block.replace(/rgba\(255,255,255,([0-9.]+)\)/g, 'rgba(var(--stg-lift,255,255,255),$1)');
      if (block !== before) { s = s.slice(0, i) + block + s.slice(j); n += 1; }
    }
  }

  writeFileSync(file, s);
  console.log(`  ${file.split('/').pop().padEnd(20)} ${n} literal(s) tokenised${whole ? ' (whole file)' : ''}`);
  grand += n;
}
console.log(`${grand} total`);
