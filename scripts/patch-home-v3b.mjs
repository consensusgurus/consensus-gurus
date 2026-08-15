/* Home v3, final board shape. Operates on the CURRENT origin state.
 *
 * The first script (patch-home-v3.mjs) bootstrapped this feature from an
 * unpatched tree, and after a dozen rounds of design changes it had been cut
 * about so much that it no longer produced valid output. It is retired. Origin
 * already carries every working piece (the Loft rail, the three-card cap, the
 * v3 two-column layout, the circuits, the module-scope helpers), so nothing has
 * to be re-derived from scratch: this script makes only the REMAINING changes,
 * and asserts every anchor.
 *
 * WHAT IT DOES, all of it owner-directed 2026-08-15:
 *   1. Deletes the category tile board. Four versions of it died of the same
 *      thing: 24 boxes holding a name, a count and a 4px bar is ~300px of
 *      content, and a grid told to fill ~500px pads the difference into every
 *      tile. A list is as tall as its contents, so the slate's own rows come
 *      back as the middle element.
 *   2. Widens that list to THREE columns. The single 340px rail replaced two
 *      rails totalling 584px, so the centre is ~240px wider than it was and a
 *      third column fits without squeezing the row.
 *   3. Folds the circuits into the slate's existing filter strip, which wraps
 *      to two rows rather than scrolling sideways.
 *
 * Mobile is untouched: every rule added here is inside min-width:901px, and the
 * phone keeps the slate it ships with. The side column follows the desktop Loft
 * because HomeRails renders the same branch at every width and simply stacks.
 *
 *   node scripts/patch-home-v3b.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3b.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, count = 1) {
  // repl !== '' guard, and it is not paranoia: src.includes('') is ALWAYS true,
  // so a deletion written as sub(x, find, '') skips itself every single time.
  // That is exactly how the call to renderCatBoard survived the removal of
  // renderCatBoard, which is a ReferenceError waiting for the first render.
  // Deletions go through del() below.
  if (repl !== '' && src.includes(repl)) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== count) throw new Error(`ANCHOR ${label}: expected ${count}, found ${n}`);
  N += n;
  return src.split(find).join(repl);
}
/* Cut from startMark up to and including endMark. Asserts BOTH ends, which is
 * the lesson from the last script: a range replacement that does not assert
 * what it is removing ate a whole declaration and cost a red build. */
function cut(src, startMark, endMark, label) {
  const i = src.indexOf(startMark);
  if (i === -1) { SKIP += 1; return src; }
  const j = src.indexOf(endMark, i);
  if (j === -1) throw new Error(`CUT ${label}: end marker missing after start`);
  N += 1;
  return src.slice(0, i) + src.slice(j + endMark.length);
}

/* Deletion. Separate from sub() on purpose, see the guard in it. */
function del_(src, text, label) {
  if (!src.includes(text)) { SKIP += 1; return src; }
  N += 1;
  return src.split(text).join('');
}

let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* ── 1. the tile board comes out ──────────────────────────────────────── */
s = del_(s, `            {cats ? renderCatBoard() : null}
`, 'DS:unrender-tiles');

s = cut(s,
  '  const renderCatBoard = () => {',
  '\n  };\n',
  'DS:drop-renderCatBoard');

/* ── 2. the slate's own rows are the middle element, three columns wide ── */
s = sub(s,
  `        .dhome.cats .sl-filtw,.dhome.cats .sl-more{display:none !important;}`,
  `        .dhome.cats .sl-more{display:none !important;}`,
  'DS:show-filtstrip');

s = cut(s,
  '        .dhome.cats .dh-board:not(.cb-open) .sl-row,',
  '.cb-sect{display:none !important;}\n',
  'DS:drop-rowhiding');

s = sub(s,
  `        .dhome.cats .dh-board{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;height:auto;max-height:none;overflow:hidden;gap:0;background:#e4ebf5;}`,
  `        /* THREE COLUMNS (owner, 2026-08-15). The one 340px rail replaced two
           rails totalling 584px, so the centre is about 240px wider than it was
           and a third column fits without squeezing the row. height:auto and
           the flex sizing because the console above hands this its height now,
           rather than --dh-fit measuring it independently. */
        .dhome.cats .dh-board.slate{grid-template-columns:1fr 1fr 1fr;flex:1 1 auto;min-height:0;height:auto;max-height:none;}
        /* THE FILTER STRIP WRAPS rather than scrolling sideways: with the
           circuits in it there are 26 chips, and a one-line strip hides most of
           them behind an arrow. The circuits are the half a reader has not seen
           before, so they are the worst half to hide. */
        .dhome.cats .sl-filt{flex-wrap:wrap;overflow:visible;}
        .dhome.cats .sl-filtw::before,.dhome.cats .sl-filtw::after{display:none !important;}`,
  'DS:three-columns');

/* ── 3. circuits join the filter strip ────────────────────────────────── */
s = sub(s,
  `            .concat(slateCats.map((c) => [c, CAT_SHORT[c] || c]))`,
  `            .concat(slateCats.map((c) => [c, CAT_SHORT[c] || c]))
            // The circuits, on the same strip and driving the same state. A
            // category says what a game IS, a circuit what SKILL it exercises,
            // so they are two axes over one list rather than two controls.
            .concat(cats ? CIRCUITS.map(([n]) => ['circuit:' + n, n]) : [])`,
  'DS:filt-circuits');

/* ── 4. the tile stylesheet is dead with the tiles ────────────────────── */
s = cut(s,
  '        /* 24 tiles, four across and six down',
  '.cb-tiles.circs .cb-tile{padding:9px 11px;gap:6px;}\n',
  'DS:drop-tile-css');
for (const dead of ['.cb-sect{', '.cb-tnm{', '.cb-tct{', '.cb-bar{', '.cb-bar i{', '.cb-dot{', '.cb-trow{', '.cb-sq{', '.cb-sq svg{', '.cb-hd{', '.cb-hd span{', '.cb-hsq{']) {
  const i = s.indexOf('        ' + dead);
  if (i === -1) continue;
  const j = s.indexOf('}\n', i);
  if (j === -1) continue;
  s = s.slice(0, i) + s.slice(j + 2);
  N += 1;
}

/* FULL PANEL CAP (owner, 2026-08-15: should match existing and be full panel,
   not with a white border). The cards were rounded boxes floating on a grey
   ground with a 10px gutter; the slate's own cap is padding 0, gap 0,
   transparent, with its cells divided by a rule rather than by space. Match it. */
s = sub(s,
  `        .cb-cap{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;padding:10px;background:#e4ebf5;}`,
  `        .cb-cap{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding:0;background:transparent;}`,
  'DS:cap-fullbleed');
s = sub(s,
  `        .cb-card{display:flex;align-items:center;gap:10px;padding:12px 13px;border-radius:8px;text-decoration:none;border-left:5px solid rgba(255,255,255,0.45);min-width:0;}`,
  `        .cb-card{display:flex;align-items:center;gap:10px;padding:15px 16px;border-radius:0;text-decoration:none;border-left:none;min-width:0;}
        .cb-card + .cb-card{box-shadow:inset 1.5px 0 0 rgba(255,255,255,.30);}`,
  'DS:card-fullbleed');
s = sub(s,
  `        .cb-cap{gap:8px;padding:8px;}`,
  `        .cb-cap{gap:0;padding:0;}`,
  'DS:cap-fullbleed-narrow');

/* The strip has to shrink to hold two rows. Its OWN edit, not folded into the
   three-column block above, because that block is already on origin and an
   amendment inside it would never apply. That rule has now cost five separate
   fixes in this feature; it is the single most expensive thing I have learned
   here. */
s = sub(s,
  `        .dhome.cats .sl-filt{flex-wrap:wrap;overflow:visible;}`,
  `        /* TWO ROWS, and it has to be smaller to manage it: with the four
           state chips, nine categories, fifteen circuits and Sundays there are
           about thirty, which at the strip's normal size is three rows. */
        .dhome.cats .sl-filt{flex-wrap:wrap;overflow:visible;gap:4px;padding:7px 12px;}
        .dhome.cats .sl-filt button{font-size:9.5px;letter-spacing:.04em;padding:5px 9px;}`,
  'DS:strip-two-rows');

/* ── 5. the Paused and Done bands become chips ────────────────────────────
   Owner, 2026-08-15: instead of the coloured bars at the bottom, on desktop AND
   mobile, put those in the category row as selections. A band is a heading you
   scroll to; a chip is a control you press, and the strip is already where every
   other way of narrowing this list lives. The counts come with them, so nothing
   the bars said is lost. */
s = sub(s,
  `  const slateMatch = (g) => (filter === 'all' ? true
    : filter === 'todo' ? !done.has(g.key)`,
  `  const slateMatch = (g) => (filter === 'all' ? true
    : filter === 'ready' ? (!done.has(g.key) && !inprog.has(g.key))
      : filter === 'paused' ? (inprog.has(g.key) && !done.has(g.key))
      : filter === 'failed' ? isFail(g.key)
      : filter === 'done' ? (done.has(g.key) && !isFail(g.key))
        : filter === 'todo' ? !done.has(g.key)`,
  'DS:match-state');
s = sub(s,
  `        : g.cat === filter);`,
  `          : g.cat === filter);`,
  'DS:match-indent');

s = sub(s,
  `          {[['all', 'All'], ['todo', 'Unplayed']]`,
  `          {[['all', 'All'], ['todo', 'Unplayed']]
            // Paused and Done, which used to be the gold and green bands at the
            // foot of the board. They carry their counts because that is the
            // one thing a band said that a chip otherwise would not.
            .concat(cats ? [['ready', 'Ready ' + nReadyAll]] : [])
            .concat(cats && nProgAll ? [['paused', 'Paused ' + nProgAll]] : [])
            .concat(cats && nFailAll ? [['failed', 'Failed ' + nFailAll]] : [])
            .concat(cats && nDoneAll ? [['done', 'Done ' + nDoneAll]] : [])`,
  'DS:state-chips');

/* The two counts, computed where the other slate figures are. */
s = sub(s,
  `  const slateMatch = (g) => (filter === 'all' ? true`,
  `  const nReadyAll = games.filter((g) => !done.has(g.key) && !inprog.has(g.key)).length;
  const nProgAll = games.filter((g) => inprog.has(g.key) && !done.has(g.key)).length;
  const nFailAll = games.filter((g) => isFail(g.key)).length;
  const nDoneAll = games.filter((g) => done.has(g.key) && !isFail(g.key)).length;
  const slateMatch = (g) => (filter === 'all' ? true`,
  'DS:state-counts');

/* And the bands themselves go, at BOTH widths, which is why this rule sits
   outside the min-width:901px block. The Ready band goes too: with Paused and
   Done gone it is the only one left and a sole heading over the whole list
   labels nothing. */
s = sub(s,
  `        .dhome.cats .sl-more{display:none !important;}`,
  `        .dhome.cats .sl-more{display:none !important;}`,
  'DS:noop-marker');
s = sub(s,
  `      /* Below 901px the catboard does not exist:`,
  `      /* THE BANDS ARE GONE AT BOTH WIDTHS, so this rule sits outside the
         desktop block on purpose. Their job moved to the filter strip, where
         Ready, Paused, Failed and Done are now selections rather than coloured
         bars you scroll to (owner, 2026-08-15). */
      .dhome.cats .sl-band{display:none !important;}
      /* Below 901px the catboard does not exist:`,
  'DS:hide-bands');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);
console.log(`patch-home-v3b: ${N} edits, ${SKIP} already present`);
