#!/usr/bin/env node
// Fold the loft-class gate into the CHROME CONVERTER, so the next batch cannot
// repeat what the last one hit.
//
// StageChrome renders LoftCap's whole .loft-* sheet (LoftFinish depends on it),
// and a converted daily has LOFT true as well as STAGE, so any loft className
// the CLIENT still renders comes alive under the stage and applies Loft LAYOUT
// to the board. That is what collapsed .cl-panel to width 0.
//
// Matched by SHAPE rather than by a list of known strings. A list only knows
// the clients it was written against: Etch renders
// `LOFT ? 'loft-card et-card' : 'et-card'`, a compound the list could not see,
// and the guard refused a whole conversion over it.
//
// The three rules were unit-tested against all seven real shapes for output,
// idempotence and strays before going anywhere near the converter, because the
// first draft ran them in the wrong order and the guarded rule re-matched what
// the ternary rule had just produced (`LOFT && !STAGE && !STAGE ??`).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('usage: patch-converter-loftclasses.mjs <repo-root>'); process.exit(1); }
const P = 'scripts/patch-stage-chrome.mjs';
let s = fs.readFileSync(path.join(ROOT, P), 'utf8');

const FIND = `writeFileSync(path, s);
console.log(\`patched \${n} edits in \${path}\`);`;

const BODY = String.raw`// 10. NO LOFT CLASS ON THE STAGE.
//
//     StageChrome renders LoftCap's entire .loft-* sheet, because LoftFinish
//     carries no rules of its own and rendered as naked HTML without it. A
//     converted client has LOFT TRUE as well as STAGE, so every loft className
//     it still renders comes alive under the stage and applies LOFT LAYOUT to
//     the board: .loft-stage went display:flex with a 640px max-width and
//     collapsed .cl-panel to width 0 across the whole first batch.
//
//     ORDER IS LOAD-BEARING. The guarded form runs FIRST; run the ternary form
//     first and its own output (LOFT && !STAGE ? ...) is then re-matched by the
//     guarded rule, which yields LOFT && !STAGE && !STAGE ??. The negative
//     lookahead is the second guard against exactly that.
//
//     The root's own LOFT ? 'loft-page' is rewritten back in step 3, so it is
//     already gone and correctly untouched here.
countedReplace('loft class (guarded)',
  /className=\{LOFT && (?!!STAGE)((?:[^{}]|\{[^{}]*\})*loft-(?:[^{}]|\{[^{}]*\})*)\}/g,
  'className={LOFT && !STAGE && $1}');
countedReplace('loft class (ternary)',
  /className=\{LOFT \?((?:[^{}]|\{[^{}]*\})*loft-(?:[^{}]|\{[^{}]*\})*)\}/g,
  'className={LOFT && !STAGE ?$1}');
countedReplace('loft class (bare)', /className="(loft-[a-z0-9- ]+)"/g,
  "className={STAGE ? undefined : '$1'}");

//     Anything the three shapes above did not reach is a NEW shape, and on the
//     stage it would be live. Look at it rather than ship it.
//
//     The invariant this is protecting, checkable in the browser rather than by
//     reading, is:
//       document.querySelectorAll('.stage-page [class*="loft-"]').length === 0
//     Anything left there belongs to LoftFinish, the subtree the sheet is for.
{
  const stray = s.match(/className=\{LOFT (?!&& !STAGE)[^{}]*loft-|className="loft-/g);
  if (stray) {
    throw new Error('ungated loft className(s) left, extend step 10: ' + [...new Set(stray)].join(' | '));
  }
}
`;

const TAIL = 'writeFileSync(path, s);\nconsole.log(`patched ${n} edits in ${path}`);';

const n = s.split(FIND).length - 1;
if (n !== 1) throw new Error(`tail anchor matched ${n}, expected 1`);
s = s.replace(FIND, BODY + '\n' + TAIL);
fs.writeFileSync(path.join(ROOT, P), s);
console.log('patch-converter-loftclasses: 1 edit');
