// Crux on the stage, brought back to the APPROVED MOCKUP.
//
// The first conversion diverged from it in two ways and I talked myself into
// both. This codebase already learned that lesson once, in the Gauntlet ladder
// rebuild: WHEN A MOCKUP IS APPROVED IT IS THE SPEC, including its chrome and
// its palette, and adapting it to the surrounding page is not "done".
//
// 1. THE LADDER IS A GUTTER, NOT A RAIL. I moved it to a full-width strip under
//    the cap and reasoned that a board filling the column has no gutter to
//    give. The mockup put it in a 96px column beside the board, which is where
//    it reads as the board's own progress rather than as another band of
//    chrome. StageLadder already renders both ways and already lies down under
//    640px, so this is a layout change and not a component one.
//
// 2. THE FOUR CATEGORIES TAKE FOUR RAMP STEPS. The mockup drew them sky, mint,
//    lime and gold, and I shipped the game's original yellow/green/blue/red,
//    which are four bright mid-tone cards dominating a near-black page.
//
//    This is the ONE place the "a stage is one colour" rule bends, and it bends
//    for a reason: in Crux the four categories are the puzzle's own structure,
//    the thing the whole game asks you to work out, so they need to be four
//    tellable things. Taking those four from the RAMP keeps them inside the
//    stage's palette instead of importing a second one. Every OTHER game stays
//    on its single category step; this is not a licence to colour boards.
import { readFileSync, writeFileSync } from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('usage: patch-crux-stage-2.mjs <CruxClient.jsx>');
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

edit('ramp import',
  "import { gameColor, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';",
  "import { gameColor, CATEGORY_RAMP, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';");

// A category's colour, in one place, so the chips, the grid reveal and the
// ladder cannot drift apart.
edit('catColour helper',
  /^(\s*)const STAGE_C = gameColor\('crux'\);$/m,
  "$1const STAGE_C = gameColor('crux');\n"
  + "$1// One source for a category's colour, so the chips, the end-of-game grid\n"
  + "$1// reveal and the ladder can never disagree about which is which.\n"
  + "$1const catTone = (ci) => (STAGE\n"
  + "$1  ? { bg: CATEGORY_RAMP[ci % CATEGORY_RAMP.length], tc: RAMP_INK }\n"
  + "$1  : CAT_COLORS[ci]);");

// 1. the chips
edit('chips',
  "                const cc = CAT_COLORS[ci];",
  "                const cc = catTone(ci);");
edit('chip box',
  "                    style={{ background: cc.bg, borderRadius: 8, padding: '10px 12px', border: '1.5px solid rgba(28,30,36,0.35)', boxShadow: '2px 2px 0 rgba(28,30,36,0.10)', cursor: clickable ? 'pointer' : 'default', outline: clickable ? `2.5px dashed ${cc.tc}` : 'none', outlineOffset: 2 }}>",
  "                    style={{ background: cc.bg, borderRadius: 8, padding: '10px 12px', border: STAGE ? 'none' : '1.5px solid rgba(28,30,36,0.35)', boxShadow: STAGE ? 'none' : '2px 2px 0 rgba(28,30,36,0.10)', cursor: clickable ? 'pointer' : 'default', outline: clickable ? `2.5px dashed ${cc.tc}` : 'none', outlineOffset: 2 }}>");
edit('chip name',
  "textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.25, textShadow: '0 1px 0 rgba(255,255,255,0.35)' }}>{cat.name}</div>",
  "textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.25, textShadow: STAGE ? 'none' : '0 1px 0 rgba(255,255,255,0.35)' }}>{cat.name}</div>");

// 2. the end-of-game grid reveal, which tints a cell by its true category
edit('grid reveal',
  "          cat = CAT_COLORS[catIdx];",
  "          cat = catTone(catIdx);");

// 3. the ladder blocks take their category's own step
edit('ladder colour',
  "    c: STAGE_C,\n    on: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] !== undefined),",
  "    c: STAGE ? CATEGORY_RAMP[ci % CATEGORY_RAMP.length] : STAGE_C,\n    on: cat.words.map((w) => PUZZLE.slots.some((s) => s.word === w && g.solved[s.id]) && g.assigned[w] !== undefined),");

// 4. gutter, not rail
edit('drop the rail',
  "          ladder={<StageLadder height={44} label=\"Words\" blocks={stageBlocks} />}\n",
  "");
edit('add the gutter',
  "        <div className=\"cx-a\">",
  "        <div className=\"cx-a\">\n"
  + "        {STAGE && (\n"
  + "          <div className=\"cx-gut\">\n"
  + "            <StageLadder vertical label=\"Words\" blocks={stageBlocks} />\n"
  + "          </div>\n"
  + "        )}");
edit('gutter css',
  ".stage-page .cl-key:not(.cl-kx){background:rgba(255,255,255,0.07)!important;",
  ".stage-page .cx-a{display:flex;gap:26px;align-items:stretch;}\n"
  + ".stage-page .cx-gut{flex:0 0 96px;min-height:340px;}\n"
  + ".stage-page .cx-a > *:not(.cx-gut){flex:1 1 auto;min-width:0;}\n"
  + "@media(max-width:640px){\n"
  + "  .stage-page .cx-a{flex-direction:column;gap:12px;align-items:stretch;}\n"
  + "  .stage-page .cx-gut{flex:none;min-height:0;}\n"
  + "}\n"
  + ".stage-page .cl-key:not(.cl-kx){background:rgba(255,255,255,0.07)!important;");

// 5. an em dash in reader-facing copy, against a standing house rule. Pre-dates
//    the stage; it is one character and it is on screen, so it goes now.
// BOTH of them. The first grep found one and stopped; the line above it says
// the same thing in the other game state and carries the same dash.
edit('em dash, playing',
  ": <>The categories &mdash; each hides",
  ": <>The categories: each hides");
edit('em dash, filing',
  "? <>The categories &mdash; tap to file completed words</>",
  "? <>The categories: tap to file completed words</>");

// 6. THE REST OF THE EM DASHES IN THIS FILE. Six in all, not the two the first
//    grep found: one in the in-game filing prompt and three in the About prose,
//    which is hidden on the stage but is on the Loft page and is what search
//    engines read. A standing house rule with six live violations in one file
//    is not a rule anyone is keeping, and leaving known ones behind in a file
//    already open is worse than not having looked. Each takes the punctuation
//    the sentence actually wants rather than a blanket swap.
edit('em dash, placing',
  "</span> &mdash; tap a category above</>",
  "</span>: tap a category above</>");
edit('em dash, about lead',
  "free daily word puzzle from Mind Loft &mdash; a clueless crossword.",
  "free daily word puzzle from Mind Loft, a clueless crossword.");
edit('em dash, about scoring',
  "under its category &mdash; a point per solve, a point per correct placement.",
  "under its category: a point per solve, a point per correct placement.");
edit('em dash, about signup',
  "No app, no signup &mdash; play free in your browser",
  "No app, no signup. Play free in your browser");
{
  const left = (s.match(/&mdash;/g) || []).length;
  const inCopy = s.split('\n').filter((l) => l.includes('&mdash;') && !l.trim().startsWith('//')).length;
  if (inCopy) throw new Error(`${inCopy} line(s) still carry an em dash in copy`);
  console.log(`  · em dashes left in this file: ${left}, all inside code comments`);
}

writeFileSync(path, s);
console.log(`patched ${n} edits`);
