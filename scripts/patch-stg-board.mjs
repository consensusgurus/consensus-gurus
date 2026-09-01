// PATCH: mark the stage's board wrapper with `stg-board`.
//
// The board card is gone on the stage (owner, 2026-08-31) and the rule that
// removes it lives in app/globals.css. This script only supplies the hook.
//
// THE HOOK COMES FROM THE loft-card MARKER, and that is the whole reason this
// is a one-line-per-file edit rather than a judgement call in 77 clients. The
// Loft conversion had already identified the board wrapper in every game and
// given it `loft-card`; measured on the bank, that class appears EXACTLY ONCE
// per client and never on a secondary panel. The `STAGE ? SURF` shape does NOT
// have that property: it appears 189 times across 78 files and covers stat
// rows, prompt cards, docks and modals as well, so matching on it would have
// stripped panels that are meant to read as raised.
//
// Every anchor must match EXACTLY ONCE. Zero means origin moved under us, two
// means the anchor is not specific enough and the patch would land twice; both
// throw rather than write, per the deploy section's stale-base rule.
import { readFileSync, writeFileSync } from 'node:fs';

// THE TWO FILES THAT CARRY loft-card TWICE, and which of the two is the board.
// Emcee and Encore each mark a SECOND panel with the class: a 12px/14px strip
// with a 1.5px hairline, sitting under the board. The board is the first one in
// source order, and it is the one wearing the board card's own shape (2px ink
// border, '13px 15px 15px'). Named here rather than inferred so that a future
// edit which reorders them fails the once-only check instead of silently
// stripping the wrong panel.
const FIRST_OF_TWO = new Set(['app/emcee/EmceeClient.jsx', 'app/encore/EncoreClient.jsx']);

const SUBS = [
  ["LOFT && !STAGE ? 'loft-card' : undefined",
   "STAGE ? 'stg-board' : (LOFT ? 'loft-card' : undefined)"],
  ["(LOFT && !STAGE) ? 'loft-card' : undefined",
   "STAGE ? 'stg-board' : (LOFT ? 'loft-card' : undefined)"],
  ["STAGE ? 'cl-panel' : (LOFT ? 'cl-panel loft-card' : 'cl-panel')",
   "STAGE ? 'cl-panel stg-board' : (LOFT ? 'cl-panel loft-card' : 'cl-panel')"],
  ["LOFT && !STAGE ? 'loft-card et-card' : 'et-card'",
   "STAGE ? 'et-card stg-board' : (LOFT ? 'loft-card et-card' : 'et-card')"],
];

const files = process.argv.slice(2);
let touched = 0, sites = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  // Only a CLIENT that puts the class on an element is a target. LoftCap.jsx
  // also contains the string, in the stylesheet that defines it.
  if (!/className=\{[^\n]*loft-card/.test(src)) continue;
  let out = src, n = 0;
  for (const [from, to] of SUBS) {
    const hits = out.split(from).length - 1;
    if (!hits) continue;
    if (hits > 1 && !FIRST_OF_TWO.has(f)) throw new Error(`${f}: anchor matched ${hits} times: ${from}`);
    if (hits > 2) throw new Error(`${f}: anchor matched ${hits} times, expected at most 2`);
    out = out.replace(from, to);   // String#replace takes the FIRST match only
    n++;
  }
  if (n === 0) throw new Error(`${f}: has loft-card but no anchor matched`);
  if (n > 1) throw new Error(`${f}: ${n} board wrappers, expected 1`);
  if (out !== src) { writeFileSync(f, out); touched++; sites += n; }
}
console.log(`patched ${touched} files, ${sites} board wrappers`);
