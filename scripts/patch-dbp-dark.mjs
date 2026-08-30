// DailyBoardPanel on a dark ground.
//
// The stage mounts THIS component rather than a second copy of it, which was
// the right call: the rankings panel is one of the most detailed things on the
// site and a stage-native rewrite would be a second 500 line stylesheet to keep
// in step. What it left behind is a white card with the stage's light text on
// it, which is what the owner saw and reported as "the rankings use the old
// styling".
//
// THE FIX IS FIVE NAMES, NOT AN OVERRIDE LIST. This stylesheet already
// interpolates ${INK}, ${SLATE}, ${FADED}, ${BLUE}, ${NAVY} and ${BORD} for
// almost every colour it sets, so shadowing those inside the component covers
// most of the panel for free. An external `.stg-panel .dbp-*{...!important}`
// list would have to be maintained against 500 lines of CSS forever; six names
// cannot drift from the rules that read them.
//
// What is left after that is eight genuinely hardcoded light surfaces, and they
// are converted one at a time below.
//
// It defaults to LIGHT. This component is on every Loft page too, and those are
// not going anywhere until STAGE_GAMES holds the whole roster.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-dbp-dark.mjs <DailyBoardPanel.jsx>');
let s = readFileSync(path, 'utf8');
let n = 0;
function edit(name, anchor, replacement) {
  const hits = typeof anchor === 'string'
    ? s.split(anchor).length - 1
    : (s.match(new RegExp(anchor.source, anchor.flags.includes('g') ? anchor.flags : anchor.flags + 'g')) || []).length;
  if (hits !== 1) throw new Error(`anchor "${name}" matched ${hits} times, expected exactly 1`);
  s = s.replace(anchor, replacement);
  n += 1;
}

edit('signature',
  "export default function DailyBoardPanel({ self, quizId = null, maxWidth = 620, streak = null }) {",
  "export default function DailyBoardPanel({ self, quizId = null, maxWidth = 620, streak = null, dark = false }) {\n"
  + "  // Shadowing the module tokens, which is what makes this one prop rather\n"
  + "  // than an override list. Everything the stylesheet below interpolates\n"
  + "  // follows automatically; only genuinely hardcoded surfaces need naming.\n"
  + "  const INK = dark ? '#e9edf4' : T.ink;\n"
  + "  const SLATE = dark ? '#aab5c7' : T.slate;\n"
  + "  const FADED = dark ? '#8b95a8' : T.muted;\n"
  + "  const NAVY = dark ? '#e9edf4' : T.accent;\n"
  + "  const BLUE = dark ? '#7dd3fc' : T.blue;\n"
  + "  const BORD = dark ? 'rgba(255,255,255,0.12)' : '#e7eaf1';\n"
  + "  const SURF = dark ? 'rgba(255,255,255,0.05)' : 'var(--white)';\n"
  + "  const SOFT = dark ? 'rgba(125,211,252,0.12)' : '#eff4fd';");

// the panel's own card, and the board box inside it
edit('panel card',
  ".dbp{font-family:${SANS};background:var(--white);border:1.5px solid rgba(20,22,28,0.12);",
  ".dbp{font-family:${SANS};background:${dark ? 'transparent' : 'var(--white)'};border:1.5px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(20,22,28,0.12)'};");
edit('board box',
  ".dbp-board{border:1px solid ${BORD};border-radius:12px;padding:11px 13px 10px;margin-top:11px;background:var(--white);}",
  ".dbp-board{border:1px solid ${BORD};border-radius:12px;padding:11px 13px 10px;margin-top:11px;background:${SURF};}");

// the three big rank tiles
edit('rank tile',
  "border:2px solid #cfdcf4;background:linear-gradient(180deg,var(--white),#eff5ff);border-radius:14px;padding:15px 10px 12px;min-width:0;box-shadow:0 3px 13px rgba(20,30,60,.08);",
  "border:2px solid ${dark ? 'rgba(255,255,255,0.12)' : '#cfdcf4'};background:${dark ? 'rgba(255,255,255,0.05)' : 'linear-gradient(180deg,var(--white),#eff5ff)'};border-radius:14px;padding:15px 10px 12px;min-width:0;box-shadow:${dark ? 'none' : '0 3px 13px rgba(20,30,60,.08)'};");

// the sign-up chip and the two "this row is you" tints
edit('signup chip',
  "color:${BLUE};background:#eff4fd;border:1px solid #cfe0fb;",
  "color:${BLUE};background:${SOFT};border:1px solid ${dark ? 'rgba(125,211,252,0.3)' : '#cfe0fb'};");
edit('lb me row', ".dbp-lbrow.me{background:#eff4fd;}", ".dbp-lbrow.me{background:${SOFT};}");
edit('grid me row', ".dbp-grow.me{background:#eff4fd;}", ".dbp-grow.me{background:${SOFT};}");

// the archive calendar: an unplayed day is a surface, a played one is a state
edit('cal unplayed',
  "a.dbp-cal-cell.unplayed{background:var(--white);color:${SLATE};border:1px solid ${BORD};}",
  "a.dbp-cal-cell.unplayed{background:${SURF};color:${SLATE};border:1px solid ${BORD};}");
edit('cal played',
  "a.dbp-cal-cell.played{background:#e8f5ec;color:var(--success-deep);border:1px solid #bfe3ca;}",
  "a.dbp-cal-cell.played{background:${dark ? 'rgba(52,168,110,0.22)' : '#e8f5ec'};color:${dark ? '#7fe0ad' : 'var(--success-deep)'};border:1px solid ${dark ? 'rgba(127,224,173,0.35)' : '#bfe3ca'};}");
edit('cal none', ".dbp-cal-cell.none{color:#c9cdd6;}", ".dbp-cal-cell.none{color:${dark ? '#4a5468' : '#c9cdd6'};}");
edit('rank dash', ".dbp-tile-rk .dash{color:#c2c8d2;}", ".dbp-tile-rk .dash{color:${dark ? '#4a5468' : '#c2c8d2'};}");

writeFileSync(path, s);
console.log(`patched ${n} edits`);
