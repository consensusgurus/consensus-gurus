// The light surfaces a RESTING SCREENSHOT cannot show you.
//
//   node scripts/patch-stage-surfaces.mjs app/crux/CruxClient.jsx
//
// audit-stage-residue.mjs found these on all four games I had already called
// converted, and every one of them is invisible until something happens: a
// modal opens, a secondary button renders, or a tile flips. Looking at the page
// is necessary and it is not sufficient; counting what the source still paints
// is the other half.
//
// THREE CLASSES, all of them near-identical across clients, which is why this
// is one generic pass and not four board patches:
//
//   1. MODAL SHEETS. Every client builds them the same way, a white or cream
//      card behind a stopPropagation handler. Seven of them across four games.
//   2. SECONDARY BUTTONS, .cl-btn / .mt-btn / .sd-btn / .an-btn and the .*-tool
//      variants. Same rule text, different two-letter prefix.
//   3. A WHITE FLASH INSIDE @keyframes. Crux's tile flip animates FROM
//      var(--white), so every letter reveal strobes white on a near-black
//      board. Nothing at rest is wrong, which is exactly why it survived.
//
// Every rule is OPTIONAL and reports its count: a client that does not have one
// is normal, a client where a count changes unexpectedly is not.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-stage-surfaces.mjs <Client.jsx>');
let s = readFileSync(path, 'utf8');
let touched = 0;

function sweep(name, re, to) {
  const hits = (s.match(re) || []).length;
  if (hits) { s = s.replace(re, to); touched += hits; }
  console.log(`  · ${name}: ${hits}`);
}

// 1. modal sheets. The white one and the cream one, both behind the same
//    stopPropagation handler every client uses.
sweep('modal sheet, white',
  /(onClick=\{\(e\) => e\.stopPropagation\(\)\} style=\{\{[^}]*?background: )T\.white\b/g,
  "$1STAGE ? '#0e131f' : T.white");
sweep('modal sheet, cream',
  /(onClick=\{\(e\) => e\.stopPropagation\(\)\} style=\{\{[^}]*?background: )COLORS\.cream\b/g,
  "$1STAGE ? '#0e131f' : COLORS.cream");
// their borders, which are a two pixel ink rule that vanishes on this ground
sweep('modal border',
  /(onClick=\{\(e\) => e\.stopPropagation\(\)\} style=\{\{[^}]*?border: )`2px solid \$\{COLORS\.ink\}`/g,
  "$1STAGE ? '1px solid rgba(255,255,255,0.12)' : `2px solid ${COLORS.ink}`");
sweep('modal hairline',
  /(onClick=\{\(e\) => e\.stopPropagation\(\)\} style=\{\{[^}]*?border: )'1\.5px solid rgba\(20,22,28,0\.12\)'/g,
  "$1STAGE ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(20,22,28,0.12)'");

// 2. the secondary button, whatever its two-letter prefix.
//    THE BOUND IS [^\n], NOT [^}]. These rules carry ${SANS} and ${MONO}
//    interpolations, so a brace-excluding class stops at the first } inside
//    ${...} and the rule never matches. CLAUDE.md documents this exact trap for
//    scanning CSS in template literals; it is just as true when patching it.
//    Every rule here is one line, so a newline bound is both safe and correct.
sweep('secondary button',
  /(\.[a-z]{2}-btn\{[^\n]*?)background:var\(--white\);/g,
  "$1background:${STAGE ? 'transparent' : 'var(--white)'};");
sweep('tool button',
  /(\.[a-z]{2}-tool\{[^\n]*?)background:var\(--white\);/g,
  "$1background:${STAGE ? 'rgba(255,255,255,0.07)' : 'var(--white)'};");

// 2b. THE PLAIN PANEL SHEET. Anon builds its passage and its bank as two of
//     these, which are the two most looked-at surfaces in the game and are not
//     rendered until play starts. That is the second thing a resting
//     screenshot cannot show, and it is why "zero white boxes" passed on a
//     board that has two.
sweep('panel sheet',
  /(style=\{\{ background: )T\.white(, border: )'1px solid rgba\(28,30,36,0\.1[0-9]\)'/g,
  "$1STAGE ? 'rgba(255,255,255,0.04)' : T.white$2STAGE ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(28,30,36,0.12)'");

// 2c. PALE ERROR TINTS. A near-white pink says "careful" on paper and says
//     nothing at all on a near-black ground, where the same warning has to be
//     carried by the red itself. Suds arms its clear-grid button this way and
//     Anon marks a wrong cell with it.
sweep('pale error tint',
  /background: '#(?:fdeeee|fee2e2|fdf2f3)'/g,
  "background: STAGE ? 'rgba(220,38,38,0.22)' : '#fdeeee'");

// 3. THE FLASH. A keyframe that animates from white strobes white on every
//    reveal. Transparent lets the tile's own colour carry the motion instead.
sweep('keyframe flash',
  /(@keyframes [A-Za-z0-9]+\{from\{[^\n]*?)background:var\(--white\);/g,
  "$1background:${STAGE ? 'transparent' : 'var(--white)'};");

writeFileSync(path, s);
console.log(`${touched} light surface(s) converted in ${path}`);
