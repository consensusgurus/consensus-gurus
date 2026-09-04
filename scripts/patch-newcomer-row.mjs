#!/usr/bin/env node
// THE NEWCOMER'S ROW, applied as anchored edits to app/today/StageToday.jsx.
//
// The file is 2,254 lines, so it is patched by anchor + insertion against a copy
// taken from the fetch performed in the SAME deploy step, never from the working
// tree (the stale-base rule). Every anchor must match EXACTLY ONCE: zero means
// origin moved, two means the anchor is not specific enough and the patch would
// land twice. Both throw.
//
//   node scripts/patch-newcomer-row.mjs <path-to-StageToday.jsx>

import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: patch-newcomer-row.mjs <StageToday.jsx>'); process.exit(1); }
let src = fs.readFileSync(file, 'utf8');
let n = 0;

function edit(label, anchor, build) {
  const hits = src.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${label}" matched ${hits} times, expected exactly 1`);
  src = src.replace(anchor, build(anchor));
  n += 1;
  console.log(`  ok  ${label}`);
}

/* ── 1. the import ──────────────────────────────────────────────────────── */
// categoryOnrampLight is the ink that carries ON a light-register step. The
// Gauntlet bar is a filled control and Trivia is a WARM step, so it keeps its
// value in the light register and flips its INK rather than darkening; without
// this the bar paints white on orange at about 2:1.
edit(
  'import categoryOnrampLight',
  "import { RAMP_ORDER, categoryColor, categoryColorLight, RAMP_INK } from '@/lib/category-ramp';",
  (a) => a.replace(
    'categoryColorLight, RAMP_INK }',
    'categoryColorLight, categoryOnrampLight, RAMP_INK }',
  ),
);

/* ── 2. the constants ───────────────────────────────────────────────────── */
edit(
  'newcomer constants',
  "const CIRC_LEAD = ['gauntlet', 'five', 'sudoku'];\n",
  (a) => a + `
// THE NEWCOMER'S ROW (owner, 2026-09-04). A reader with NO footprint at all
// gets one row above everything else: the Trivia Gauntlet on the filled bar,
// and the busiest daily in each of the ten categories under it as tiles.
//
// WHY THE GAUNTLET AND NOT THE BUSIEST GAME. It is already the site's lead --
// CIRC_LEAD pins it first on the shelf below and /trivia pops its door for
// exactly this visitor -- so the bar says one screen earlier what the page was
// going to say anyway, and it answers the question a first-time reader actually
// has, which is where to start. The ten tiles then say the site is far wider
// than one run without asking anyone to choose between ten things they have
// never heard of.
const NEWCOMER_LEAD = 'gauntlet';
// Its category, for the bar's hue and its ink. Fixed rather than read off the
// circuit's lead game, because that membership needs the day and this bar has
// to paint on the first frame it renders.
const NEWCOMER_LEAD_CAT = 'Trivia';

// THE EDITORIAL FLOOR (owner ruling, 2026-09-04). Today's plays are the real
// ordering and they cost nothing, since board.games carries them already. But
// at 6am ET every category is on single digits, so the ten picks would be noise
// and eight of ten tiles would read "4 playing", which sells the row backwards.
// So a category keeps its hand-picked default until its busiest game clears
// NEWCOMER_FLOOR, and the crowd figure renders only above that line.
//
// ONE KEY PER RAMP_ORDER CATEGORY. A key that has retired, or that has been
// moved to another category, falls through to that category's first game rather
// than blanking the tile.
const NEWCOMER_PICKS = {
  Word: 'encore',
  Numbers: 'crunch',
  Logic: 'alibi',
  'End Game': 'mate',
  Trivia: 'streak',
  Geography: 'ping',
  Cards: 'taire',
  'Crowd Psychology': 'feud',
  Arcade: 'sweep',
  Sudoku: 'suds',
};
const NEWCOMER_FLOOR = 25;
`,
);

/* ── 3. the picks memo ──────────────────────────────────────────────────── */
edit(
  'newcomerPicks memo',
  `  const playsBy = useMemo(() => {
    const m = new Map();
    const gs = board && Array.isArray(board.games) ? board.games : [];
    for (const g of gs) if (g && g.key) m.set(g.key, g.plays || 0);
    return m;
  }, [board]);
`,
  (a) => a + `
  // THE NEWCOMER'S TEN. One tile per category, in ramp order rather than the
  // reader's own (a reader with no footprint has not ordered anything, and the
  // ramp is the order the categories are numbered in). The busiest daily in the
  // category once its leader has cleared the floor, the editorial default until
  // then; \`crowd\` is null below the floor so no tile prints a figure that reads
  // as an empty room. Costs no request: playsBy is already on the page.
  const newcomerPicks = useMemo(() => cats.map(({ cat, games }) => {
    let best = null; let bn = -1;
    for (const g of games) {
      const p = playsBy.get(g.key) || 0;
      if (p > bn) { bn = p; best = g; }
    }
    if (best && bn >= NEWCOMER_FLOOR) return { cat, game: best, crowd: bn };
    const pick = DAILY_GAME_MAP[NEWCOMER_PICKS[cat]];
    const ok = pick && pick.cat === cat && LIVE_KEYS.has(pick.key);
    return { cat, game: ok ? pick : games[0], crowd: null };
  }), [cats, playsBy]);

  // The bar's copy comes from the circuit registry, so the name and the blurb
  // cannot disagree with the shelf below. Static, so it paints on the first
  // frame rather than waiting on the day.
  const newcomerLead = useMemo(
    () => DISPLAY_CIRCUITS.find((c) => c.id === NEWCOMER_LEAD) || null,
    [],
  );
`,
);

/* ── 4. the JSX ─────────────────────────────────────────────────────────── */
edit(
  'newcomer row JSX',
  '        <h2 className="sty-slate">Today&rsquo;s fresh slate of puzzles</h2>\n',
  (a) => a + `
        {/* THE NEWCOMER'S ROW, and ONLY for a reader with no footprint.
            \`returning\` is the footprint test the A-to-Z bar's ordBelow already
            uses (a saved identity, any sot_<key>_day breadcrumb, any per-puzzle
            save), and it is null until its effect runs. So the server and the
            first client paint render NOTHING and the row arrives after mount:
            a returning reader, who is the far commoner case, never sees it
            flicker in and back out. */}
        {returning === false ? (
          <section className="sty-cat sty-new sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>
            <div className="sty-cathead">
              <h2>Start here</h2>
              <b>{newcomerPicks.length}<i>&nbsp;categories</i></b>
            </div>
            <div className="sty-one">
              {/* THE ONE FILLED CONTROL on this page, as Up Next was. A WARM
                  ramp step keeps its value on the light register and flips its
                  ink, so --stg-onramp is published here per register rather
                  than left to the light default, which is white. */}
              {newcomerLead ? (
                <a className="sty-next" href={withTq(circuitEntryHref(newcomerLead.id))}
                  style={{
                    '--cc': hueFor(NEWCOMER_LEAD_CAT),
                    '--stg-onramp': light ? categoryOnrampLight(NEWCOMER_LEAD_CAT) : RAMP_INK,
                  }}>
                  <div className="sty-newl">
                    <div className="sty-eb">Start here &middot; Circuit</div>
                    <div className="sty-nm">{newcomerLead.name}</div>
                    {newcomerLead.blurb ? <div className="sty-tag">{newcomerLead.blurb}</div> : null}
                  </div>
                  <span className="sty-go">Play</span>
                </a>
              ) : null}
              <div className="sty-pop">
                {newcomerPicks.map(({ cat, game, crowd }) => (
                  <a key={cat} className="sty-g" href={\`\${routeOf(game)}\${tq ? '?' + tq.slice(1) : ''}\`}
                    style={{ '--cc': hueFor(cat) }}>
                    <span className="sty-pcat">{cat}</span>
                    <span className="sty-gn"><Glyph k={game.key} size={17} />{game.name}</span>
                    <span className="sty-gt">{game.tag}</span>
                    {crowd ? <span className="sty-pn">{crowd.toLocaleString()} playing</span> : null}
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}
`,
);

/* ── 5. the stylesheet ──────────────────────────────────────────────────── */
// NO APOSTROPHES and NO BACKTICKS in this block: it is a text child of a style
// element (React escapes them) inside a JS template literal.
edit(
  'newcomer CSS',
  '@media (max-width:380px){\n  .sty-figs{gap:12px;}\n}\n',
  (a) => a + `
/* -- the newcomer row ---------------------------------------------------- */
/* The bar and the tiles are one stack, so the shelf below keeps the wrap gap
   it has rather than the row spending two of them. */
.sty-one{display:flex;flex-direction:column;gap:9px;}
/* The same 184px track the category shelves deal on, so the tiles line up with
   the rows underneath instead of forming a second grid. */
.sty-pop{display:grid;gap:7px;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));}
/* ONE LINE IS ALL THE ROW ADDS TO A TILE: which category it speaks for. In the
   category hue, because the tile is standing in for that whole shelf and the
   glyph is the only other thing on it wearing the colour. */
.sty-pcat{display:block;font-family:\${MONO};font-size:8.5px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;color:var(--cc);margin-bottom:4px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
/* ON A PALE GROUND A CATEGORY HUE IS A RULE, NOT INK: the warm steps are around
   2:1 as text on white, so the light register deepens the hue rather than
   dropping it, exactly as the circuit count does. */
[data-stage-theme=light] .sty-pcat{color:color-mix(in srgb, var(--cc) 70%, #0b0d12);}
/* The crowd figure, and it renders only above NEWCOMER_FLOOR. */
.sty-pn{display:block;font-family:\${MONO};font-size:10px;font-weight:700;
  font-variant-numeric:tabular-nums;color:var(--stg-mute);margin-top:5px;}
.sty-newl{min-width:0;}
/* NO OPACITY ON THE FILLED BAR. Its two quiet lines inherit the fill ink and
   then dim it, which on this ground composites TOWARD the fill: measured on the
   Trivia step, the eyebrow lands at 3.85:1 and the blurb at 4.47, both under
   the 4.5 they owe at 9.5px and 13.5px. Same ruling the category bands carry --
   hierarchy comes from size and weight, never from opacity. */
.sty-new .sty-next .sty-eb,.sty-new .sty-next .sty-tag{opacity:1;}
@media (max-width:560px){
  .sty-pop{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
  /* A 26px name, a blurb and a button do not share a 390px line, so the bar
     stacks and the control keeps the left edge the copy above it has. */
  .sty-next{flex-direction:column;align-items:flex-start;}
  .sty-next .sty-nm{font-size:22px;}
  .sty-next .sty-go{margin-left:0;}
}
`,
);

fs.writeFileSync(file, src);
console.log(`\n${n} anchored edits applied to ${file}`);
