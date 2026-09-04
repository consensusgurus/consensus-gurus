// TEAM CRESTS ON THE DARK REGISTER: give the logo a white keyline.
//
// ANCHORED PATCH, not a whole-file splice, for the reason the 9/4 pushes all
// learned: origin moves under a long session and a splice of a file someone
// else has touched erases their work. Each edit below must match EXACTLY ONCE
// or this throws and changes nothing, so it can be re-run against a newer tree
// and will either apply cleanly or say which anchor moved.
//
// Usage: node scripts/patch-gridiron-logo-dark.mjs [path-to-GridironTable.jsx]
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = process.argv[2] || 'app/GridironTable.jsx';

const EDITS = [
  {
    what: 'the .gr-lg rule gains the dark-register keyline',
    find: '.gr-lg{width:26px;height:26px;flex:none;object-fit:contain;}\n',
    to:
`.gr-lg{width:26px;height:26px;flex:none;object-fit:contain;}
/* A TEAM CREST IS ARTWORK DRAWN FOR A WHITE PAGE, and on the dark register the
   navy and black ones are not dim, they are GONE: measured against this board's
   own --stg-raise (#0d1220) across all 200 crests in the registry, 97 put less
   than half their ink above 3:1 and a dozen of those put NONE of it there.
   Penn State, Oklahoma, Kansas State, TCU, SMU, San Diego State and Utah State
   each rendered as an empty 26px square where the mark should be, on a column
   whose whole job is to let a reader find their team by its shape.
   The crest cannot be recoloured: it is a third-party PNG and the colour IS the
   brand. So it gets an EDGE instead, the same answer the board palette gave for
   the hue. Two 1px white drop-shadows stacked trace the alpha edge of whatever
   the file happens to contain, which is why this needs no per-team data and
   covers a sport that has not been added yet: a dark mark gains an outline and
   reads, a mark that is already light gains a white edge on a white shape and
   is unchanged. One shadow was measured too and is too thin on the darkest
   navies, a single soft 3px reads as a glow and blurs the mark.
   ESPN's own 500-dark variant was the other candidate and was measured against
   the same ground: it exists for every one of the 200, but it is BYTE-IDENTICAL
   to the light file for 79 of them and repairs only 45 of the 97, so it is not
   sufficient on its own. It also costs a second URL per team, in a second
   next/image entry, fetched on a register the reader may never open, and it
   throws the team's colour away where it does differ (a white OU, a white A).
   THE LIGHT REGISTER TURNS IT OFF THROUGH THE BOOT STAMP, the same guard the
   pillar-hue block above uses, and for the same reason: this wrapper's data-stage-theme is server
   rendered as the default and corrected in an effect, so for one frame it
   claims light on a reader who chose dark, and <html> is what holds the answer
   by then. Dark needs no mirror of this: dark is the unguarded rule. */
.gr-lg{filter:drop-shadow(0 0 1px rgba(255,255,255,.9)) drop-shadow(0 0 1px rgba(255,255,255,.9));}
html:not([data-stage-boot='dark']) [data-stage-theme='light'] .gr-lg{filter:none;}
`,
  },
];

let src = readFileSync(FILE, 'utf8');
for (const e of EDITS) {
  const n = src.split(e.find).length - 1;
  if (n !== 1) {
    throw new Error(`anchor matched ${n} times (need exactly 1): ${e.what}`);
  }
  src = src.replace(e.find, e.to);
}
if (src.includes('.gr-lg{filter:') === false) throw new Error('keyline rule missing after patch');
writeFileSync(FILE, src);
console.log(`patched ${FILE}: ${EDITS.length} edit(s)`);
