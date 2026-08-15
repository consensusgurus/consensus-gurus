/* Home v3, filter strip split into two rows. Operates on CURRENT origin state.
 *
 * Owner, 2026-08-15, before this goes live:
 *   Ready is the same as Unplayed, so one of them goes.
 *   All must show every game, completed and paused and failed included, and be
 *     the default view.
 *   Top row is game state plus the major categories; bottom row is the
 *     subcategories, shaded a slightly different blue to tell them apart.
 *   Classic Board Games becomes Board Games.
 *   If a row does not fit, an arrow to scroll it.
 *
 *   node scripts/patch-home-v3c.mjs <indir> <outdir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [, , IN, OUT] = process.argv;
if (!IN || !OUT) { console.error('usage: patch-home-v3c.mjs <indir> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

let N = 0, SKIP = 0;
function sub(src, find, repl, label, count = 1) {
  if (repl !== '' && src.includes(repl)) { SKIP += 1; return src; }
  const n = src.split(find).length - 1;
  if (n !== count) throw new Error(`ANCHOR ${label}: expected ${count}, found ${n}`);
  N += n;
  return src.split(find).join(repl);
}

let s = readFileSync(join(IN, 'DailyStrip.jsx'), 'utf8');

/* ── 1. Classic Board Games is just Board Games ───────────────────────── */
s = sub(s,
  `  ['Classic Board Games', ['Check', 'Four', 'Turn', 'Chain', 'Babel']],`,
  `  ['Board Games', ['Check', 'Four', 'Turn', 'Chain', 'Babel']],`,
  'DS:board-games');

/* ── 2. Ready replaces Unplayed rather than sitting beside it ──────────
   They are the same question asked twice: todo is not-done, which quietly
   includes the paused ones, and Ready is the stricter and more honest reading
   now that Paused has a chip of its own. */
s = sub(s,
  `          {[['all', 'All'], ['todo', 'Unplayed']]`,
  `          {[['all', 'All']]`,
  'DS:drop-unplayed');

/* ── 3. the strip becomes TWO rows ────────────────────────────────────
   State and the major categories on top, the circuits underneath. They are
   different kinds of question, so they stop sharing a line: what STATE a game
   is in and what it IS, against what SKILL it exercises. */
s = sub(s,
  `            .concat(slateCats.map((c) => [c, CAT_SHORT[c] || c]))
            // The circuits, on the same strip and driving the same state. A
            // category says what a game IS, a circuit what SKILL it exercises,
            // so they are two axes over one list rather than two controls.
            .concat(cats ? CIRCUITS.map(([n]) => ['circuit:' + n, n]) : [])`,
  `            .concat(slateCats.map((c) => [c, CAT_SHORT[c] || c]))`,
  'DS:strip-row1');

s = sub(s,
  `        {filtMore.l ? (`,
  `        {/* ROW TWO: the circuits. Its own strip, a shade lighter than the
            row above so the two read as different questions rather than one
            long overflowing line, and it scrolls horizontally on its own with
            the same chevron affordance when it does not fit. */}
        {cats ? (
          <div className="sl-filt sl-filt2" role="tablist" aria-label="Filter by circuit">
            {CIRCUITS.map(([n]) => (
              <button
                key={'circuit:' + n}
                type="button"
                role="tab"
                aria-selected={filter === 'circuit:' + n}
                className={filter === 'circuit:' + n ? 'on' : undefined}
                onClick={() => setFilter('circuit:' + n)}
              >{n}</button>
            ))}
          </div>
        ) : null}
        {filtMore.l ? (`,
  'DS:strip-row2');

/* ── 4. styling for the second row, and All really showing everything ── */
s = sub(s,
  `        .dhome.cats .sl-filt{flex-wrap:wrap;overflow:visible;gap:4px;padding:7px 12px;}
        .dhome.cats .sl-filt button{font-size:9.5px;letter-spacing:.04em;padding:5px 9px;}`,
  `        /* TWO ROWS, each one line and each scrolling on its own. Wrapping was
           the previous attempt and it made a block of chips of indeterminate
           height that pushed the board around; a scroller is a fixed height
           whatever is in it. */
        .dhome.cats .sl-filt{flex-wrap:nowrap;overflow-x:auto;}
        .dhome.cats .sl-filt button{font-size:10px;letter-spacing:.06em;padding:7px 11px;}
        /* The circuits row: a shade lighter than the navy above it, which is
           the whole point, and its own bottom rule so the pair reads as a unit
           rather than as one strip that happens to have wrapped. */
        .dhome.cats .sl-filt2{background:#2c4fa8;border-top:1px solid #16306e;}
        .dhome.cats .sl-filt2 button{color:#c6d6f4;}
        .dhome.cats .sl-filt2 button:hover{color:var(--white);}
        .dhome.cats .sl-filt2 button.on{color:var(--white);border-bottom-color:var(--white);}
        /* ALL MEANS ALL (owner, 2026-08-15), and it is the default. The slate
           hides done rows behind a peek budget, which is right when the board
           is a to-do list and wrong when the strip has a Done chip of its own:
           the state chips are how you narrow now, so the unfiltered view stops
           narrowing anything. */
        .dhome.cats .dh-board .sl-row.sl-hid{display:grid !important;}`,
  'DS:two-rows-css');

/* ── 5. the stray column rule ─────────────────────────────────────────
   The slate draws its column divider as a background gradient with a hard 1px
   stop at exactly 50%, which is right for two columns and wrong for three: at
   three it lands mid-column and reads as a line down the middle of the board
   with nothing either side of it (owner, 2026-08-15). Two stops at the real
   boundaries instead, a third and two thirds. Folded into the three-column
   rule, which is unique, because the 50% gradient itself appears twice. */
s = sub(s,
  `        .dhome.cats .dh-board.slate{grid-template-columns:1fr 1fr 1fr;flex:1 1 auto;min-height:0;height:auto;max-height:none;}`,
  `        .dhome.cats .dh-board.slate{grid-template-columns:1fr 1fr 1fr;flex:1 1 auto;min-height:0;height:auto;max-height:none;
          background:linear-gradient(to right,
            transparent calc(33.333% - .5px),#eef0f4 calc(33.333% - .5px),#eef0f4 calc(33.333% + .5px),
            transparent calc(33.333% + .5px),transparent calc(66.667% - .5px),
            #eef0f4 calc(66.667% - .5px),#eef0f4 calc(66.667% + .5px),transparent calc(66.667% + .5px));}`,
  'DS:three-col-rules');

writeFileSync(join(OUT, 'DailyStrip.jsx'), s);
console.log(`patch-home-v3c: ${N} edits, ${SKIP} already present`);
