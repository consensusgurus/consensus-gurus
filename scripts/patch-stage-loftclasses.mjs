#!/usr/bin/env node
// I BROKE THE STAGE LAYOUT AND MY OWN CHECK SAID IT WAS SAFE.
//
// Mounting LoftCap's 870-line sheet on the stage (so the end card would stop
// rendering as naked HTML) was verified like this: every selector in the sheet
// is scoped to a .loft- or .lcap- class, therefore none of it can match a
// .stage-page or .stg- element.
//
// Both halves true. The conclusion does not follow. A converted daily has LOFT
// TRUE as well as STAGE, so the stage's OWN play area was still wearing
// loft-stage, loft-card, loft-face and loft-flip. Those class names had been
// inert only because the sheet was absent. Mounting it switched on Loft LAYOUT
// rules underneath the stage: .loft-stage went display:flex and put a 640px
// max-width on the column, .cl-panel collapsed to width 0, and every label
// wrapped one word per line.
//
// I checked what the SELECTORS could match. I should have checked what the
// STAGE'S DOM WAS WEARING. Those are different questions and only the second
// one was the risk.
//
// Fix: on the stage, the client renders no loft class at all, so the only
// loft-classed elements left on the page are inside LoftFinish, which is the
// one subtree that sheet is there for. Verifiable in one line:
//   [...document.querySelectorAll('.stage-page [class*="loft-"]')]
//     .every((e) => e.closest('.loft-res, .loft-card, .loft-lb') || ...)
// or more simply: nothing loft-classed outside the finish card.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2];
const GAMES = process.argv.slice(3);
if (!ROOT || !GAMES.length) { console.error('usage: patch-stage-loftclasses.mjs <root> <game>...'); process.exit(1); }

// Each entry is [find, replace, minimum expected hits]. Every one of these is
// a CLASSNAME on the client's own markup, never inside LoftFinish.
const RULES = [
  [`className={LOFT ? 'loft-stage' : undefined}`,
   `className={LOFT && !STAGE ? 'loft-stage' : undefined}`],
  [`className={LOFT ? 'loft-card' : undefined}`,
   `className={LOFT && !STAGE ? 'loft-card' : undefined}`],
  [`className={LOFT ? 'loft-sheet' : undefined}`,
   `className={LOFT && !STAGE ? 'loft-sheet' : undefined}`],
  [`className={LOFT && !playing ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}`,
   `className={LOFT && !STAGE && !playing ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}`],
  [`className={LOFT && !playing ? 'loft-flip-in' : undefined}`,
   `className={LOFT && !STAGE && !playing ? 'loft-flip-in' : undefined}`],
  [`className={LOFT && !playing ? 'loft-face' : undefined}`,
   `className={LOFT && !STAGE && !playing ? 'loft-face' : undefined}`],
  [`className={LOFT && !playing && !endHold.held ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}`,
   `className={LOFT && !STAGE && !playing && !endHold.held ? (revealed ? 'loft-flip' : 'loft-flip on') : undefined}`],
  [`className={LOFT && !playing && !endHold.held ? 'loft-flip-in' : undefined}`,
   `className={LOFT && !STAGE && !playing && !endHold.held ? 'loft-flip-in' : undefined}`],
  [`className={LOFT && !playing && !endHold.held ? 'loft-face' : undefined}`,
   `className={LOFT && !STAGE && !playing && !endHold.held ? 'loft-face' : undefined}`],
  // The bare ones. Cosmetic rather than layout-breaking, but there is no
  // reason for a stage page to wear any of them.
  [`className="loft-showopts"`, `className={STAGE ? undefined : 'loft-showopts'}`],
  [`className="loft-report"`, `className={STAGE ? undefined : 'loft-report'}`],
  [`className="loft-tailnote"`, `className={STAGE ? undefined : 'loft-tailnote'}`],
  [`className="loft-sol"`, `className={STAGE ? undefined : 'loft-sol'}`],
];

let edits = 0;
for (const game of GAMES) {
  const dir = path.join(ROOT, 'app', game);
  const name = fs.readdirSync(dir).find((f) => /^[A-Z][A-Za-z]*Client\.jsx$/.test(f));
  const rel = path.join('app', game, name);
  let s = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  let n = 0;
  for (const [find, repl] of RULES) {
    const hits = s.split(find).length - 1;
    if (!hits) continue;
    s = s.split(find).join(repl);
    n += hits; edits += hits;
  }
  fs.writeFileSync(path.join(ROOT, rel), s);
  // A client that already carries the gate contributes 0 and that is fine.
  const left = (s.match(/className=(\{LOFT \?|"loft-)/g) || []).length;
  console.log(`${left ? '…' : '  '} ${game.padEnd(8)} ${n} gated${left ? `, ${left} ungated left` : ''}`);
}
console.log(`\npatch-stage-loftclasses: ${edits} edits`);
