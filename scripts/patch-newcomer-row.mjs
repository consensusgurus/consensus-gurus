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
// categoryOnrampLight is the ink that carries ON a light-register step. Every
// object in this row is a FILLED control, and a WARM step keeps its value in the
// light register and flips its INK rather than darkening, so the ink has to be
// resolved per category per register. Without it the light default is white,
// which on the Trivia step is white on orange at about 2:1.
edit(
  'import categoryOnrampLight',
  "import { RAMP_ORDER, categoryColor, categoryColorLight, RAMP_INK } from '@/lib/category-ramp';",
  (a) => a.replace(
    'categoryColorLight, RAMP_INK }',
    'categoryColorLight, categoryOnrampLight, RAMP_INK }',
  ),
);

/* ── 1b. RUN_GAMES, the site's own name for the timed multiple-choice set ── */
edit(
  'import RUN_GAMES',
  "import { DISPLAY_CIRCUITS, circuitKeysFor, circuitEntryHref } from '@/lib/circuits';",
  (a) => a.replace(
    '{ DISPLAY_CIRCUITS,',
    '{ DISPLAY_CIRCUITS, RUN_GAMES,',
  ),
);

/* ── 2. the constants ───────────────────────────────────────────────────── */
edit(
  'newcomer constants',
  "const CIRC_LEAD = ['gauntlet', 'five', 'sudoku'];\n",
  (a) => a + `
// THE NEWCOMER'S ROW (owner, 2026-09-04). A reader with NO footprint at all gets
// one row above everything else: two circuits sharing a line, then the busiest
// daily in each of the ten categories. EVERY object in it is FILLED with its
// category step and carries that step's own ink, which is the treatment the
// circuit CTA already had and which nothing else on this page wears. That is the
// whole point of the row: a first-time reader meets ten colours that mean the
// ten categories, and meets them before the page asks them to read anything.
//
// WHY THESE TWO CIRCUITS. The Gauntlet is already the site's lead (CIRC_LEAD
// pins it first on the shelf below and /trivia pops its door for exactly this
// visitor) and the Five is the marquee. They are the two runs the rest of the
// page leads with, said one screen earlier.
const NEWCOMER_CIRCS = ['gauntlet', 'five'];

// NO TILE MAY NAME A GAME THE GAUNTLET ALREADY HOLDS (owner, 2026-09-04).
// RUN_GAMES is the site's own name for the seven one-life, twenty-second,
// four-choice quizzes, and it is exactly the Gauntlet's roster, so reading it
// rather than hand-listing keys keeps this correct when that roster next moves.
// Two reasons the row skips them. The Gauntlet is already the first card on it,
// so a tile naming one of its members says the same thing twice. And they are
// structurally ONE game over seven banks, which is why they dominate their two
// categories on plays alone (measured 2026-09-04: the six run-shaped Trivia
// games took 26 to 41 plays and every other Trivia game 12 or fewer, and Atlas
// took 35 against 12 to 15 for the rest of Geography). Ranking on the raw count
// would therefore hand Trivia and Geography to the quiz shape every day and the
// row would never show what else those two categories contain.
//
// Only Trivia and Geography are affected, since those are the only categories
// RUN_GAMES draws from. A category left with nothing keeps its whole roster.
const NEWCOMER_SKIP = new Set(RUN_GAMES);

// THE EDITORIAL FLOOR (owner ruling, 2026-09-04). Today's plays are the real
// ordering and they cost nothing, since board.games carries them already. But at
// 6am ET every category is on single digits, so the ten picks would be noise. A
// category therefore keeps its hand-picked default until its busiest game clears
// NEWCOMER_FLOOR. The COUNT itself is never printed (owner, same day): the floor
// decides which game the tile names and nothing else.
//
// ONE KEY PER RAMP_ORDER CATEGORY. A key that has retired, or that has been
// moved to another category, falls through to that category's first game rather
// than blanking the tile.
const NEWCOMER_PICKS = {
  Word: 'encore',
  Numbers: 'crunch',
  Logic: 'alibi',
  'End Game': 'mate',
  // Trivia and Geography name their busiest NON-run game, measured 2026-09-04.
  Trivia: 'dating',
  Geography: 'span',
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
  // then. Costs no request: playsBy is already on the page.
  const newcomerPicks = useMemo(() => cats.map(({ cat, games }) => {
    // The run-shaped quizzes come out FIRST, so they can win neither the count
    // nor the fallback. A category they would empty keeps its whole roster.
    const open = games.filter((g) => !NEWCOMER_SKIP.has(g.key));
    const pool = open.length ? open : games;
    let best = null; let bn = -1;
    for (const g of pool) {
      const p = playsBy.get(g.key) || 0;
      if (p > bn) { bn = p; best = g; }
    }
    if (best && bn >= NEWCOMER_FLOOR) return { cat, game: best };
    const pick = DAILY_GAME_MAP[NEWCOMER_PICKS[cat]];
    const ok = pick && pick.cat === cat && LIVE_KEYS.has(pick.key) && !NEWCOMER_SKIP.has(pick.key);
    return { cat, game: ok ? pick : pool[0] };
  }), [cats, playsBy]);
`,
);

/* ── 4. the two circuit cards ───────────────────────────────────────────── */
// Declared AFTER the circuits memo, not beside newcomerPicks: a useMemo body
// runs during render, so reading \`circuits\` from above its own declaration is a
// temporal dead zone, which has taken this page down before.
edit(
  'newcomerCircs memo',
  '  }, [day, done, light, playsBy]);   // eslint-disable-line react-hooks/exhaustive-deps\n',
  (a) => a + `
  // THE TWO CIRCUITS ON THE NEWCOMER ROW, read out of the shelf's own memo so
  // the name, the blurb and the hue cannot disagree with the shelf below, and so
  // the Five's hue follows its rotating lead game rather than being guessed. It
  // needs the day, so both cards arrive with the rest of the day's data; the ten
  // tiles under them do not wait on it.
  const newcomerCircs = useMemo(() => NEWCOMER_CIRCS
    .map((id) => circuits.find((c) => c.id === id))
    .filter((c) => c && c.games.length)
    .map((c) => ({ ...c, cat: c.games[0].cat })), [circuits]);
`,
);

/* ── 5. the JSX ─────────────────────────────────────────────────────────── */
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
            flicker in and back out.

            EVERY CARD HERE IS FILLED, and each one publishes its own
            --stg-onramp, because the ink that carries on a step is a property of
            the STEP and of the register, not of the page. */}
        {returning === false ? (
          <section className="sty-cat sty-new sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>
            <div className="sty-cathead">
              <h2>Start here</h2>
              <b>{newcomerPicks.length}<i>&nbsp;categories</i></b>
            </div>
            <div className="sty-one">
              {newcomerCircs.length ? (
                <div className="sty-two">
                  {newcomerCircs.map((c) => (
                    <a key={c.id} className="sty-next" href={withTq(circuitEntryHref(c.id))}
                      style={{
                        '--cc': c.hue,
                        '--stg-onramp': light ? categoryOnrampLight(c.cat) : RAMP_INK,
                      }}>
                      <div className="sty-newl">
                        <div className="sty-eb">Circuit</div>
                        <div className="sty-nm">{c.name}</div>
                        {c.blurb ? <div className="sty-tag">{c.blurb}</div> : null}
                      </div>
                      <span className="sty-go">Play</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <div className="sty-pop">
                {newcomerPicks.map(({ cat, game }) => (
                  <a key={cat} className="sty-g" href={\`\${routeOf(game)}\${tq ? '?' + tq.slice(1) : ''}\`}
                    style={{
                      '--cc': hueFor(cat),
                      '--stg-onramp': light ? categoryOnrampLight(cat) : RAMP_INK,
                    }}>
                    <span className="sty-pcat">{cat}</span>
                    <span className="sty-gn"><Glyph k={game.key} size={17} />{game.name}</span>
                    <span className="sty-gt">{game.tag}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}
`,
);

/* -- 5b. My games speaks to a reader who has none ------------------------- */
// The section rendered only once a reader had starred something, so the one
// person who does not know starring exists was the one person never told. It now
// also renders for a reader with NO NAME, carrying the same Choose a Name offer
// the cap makes, at the size of the cards above it.
//
// GATED ON THE NAME, not on `returning`. A returning guest has no account and no
// pins either, and the row is exactly as true for them; a reader who HAS a name
// and has pinned nothing still sees nothing, because the offer would be spent.
edit(
  'My games empty state',
  `        {mineTot ? (
          <section className="sty-cat sty-mine sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>
            <div className="sty-cathead" onClick={headClick(MINE_ID)}>
              <h2>My games</h2>
              <b>{mineDone}<i>/{mineTot}</i></b>
              {cav(MINE_ID)}
            </div>
`,
  () => `        {(mineTot || !who) ? (
          <section className="sty-cat sty-mine sty-rev" style={{ '--cc': 'var(--stg-ink2)' }}>
            {/* An empty section has nothing to collapse and no fraction to
                print, so the head keeps its title and drops both. */}
            <div className="sty-cathead" onClick={mineTot ? headClick(MINE_ID) : undefined}>
              <h2>My games</h2>
              {mineTot ? <b>{mineDone}<i>/{mineTot}</i></b> : null}
              {mineTot ? cav(MINE_ID) : null}
            </div>
            {!mineTot ? (
              <a className="sty-join" href="/quizzes?signup=1">
                <div className="sty-newl">
                  <div className="sty-eb">Nothing pinned yet</div>
                  <div className="sty-jn">Choose a Name</div>
                  <div className="sty-tag">Keep your stats, take a rank on the daily
                    boards, and star any game to pin it here.</div>
                </div>
                <span className="sty-go">Choose</span>
              </a>
            ) : null}
`,
);

/* ── 6. the slate heading sits closer to what it names ──────────────────── */
// It is a LABEL for everything below it, not a peer of the sections, but as a
// flex child of .sty-wrap it was spending a full inter-section gap (26px, 22 on
// a phone) PLUS its own 14px bottom margin: 40px of air under a one-line
// heading. The negative margin gives most of that gap back, landing on 14px and
// 10px, which is what a .sty-cathead already sits above its own grid.
edit(
  'slate heading gap',
  '.sty-slate{margin:4px 0 14px;',
  () => `/* A LABEL, NOT A PEER. .sty-wrap is a flex column with a 26px gap (22 on a
   phone), so this heading was spending a whole section gap plus its own margin,
   40px of air under one line of type. The negative bottom margin hands most of
   that back: 14px here and 10px on a phone, the same distance a category head
   already sits above its own grid. */
.sty-slate{margin:4px 0 -12px;`,
);

/* ── 7. the stylesheet ──────────────────────────────────────────────────── */
// NO APOSTROPHES and NO BACKTICKS in this block: it is a text child of a style
// element (React escapes them) inside a JS template literal.
edit(
  'newcomer CSS',
  '@media (max-width:380px){\n  .sty-figs{gap:12px;}\n}\n',
  (a) => a + `
/* -- the newcomer row ---------------------------------------------------- */
/* The circuits and the tiles are one stack, so the shelf below keeps the wrap
   gap it has rather than the row spending two of them. */
.sty-one{display:flex;flex-direction:column;gap:9px;}
/* TWO CIRCUITS SHARE A LINE, and the line breaks itself: auto-fit against a
   300px floor gives two across on a desktop and one on a phone with no media
   query to keep in step with the others. */
.sty-two{display:grid;gap:9px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));}
/* Half the width takes the name down a step. The bar was written as the one
   full-width control on the page. */
.sty-two .sty-nm{font-size:21px;}
.sty-newl{min-width:0;}
/* NO OPACITY ON A FILLED CARD. Its two quiet lines inherit the fill ink and then
   dim it, which on this ground composites TOWARD the fill: measured on the
   Trivia step the eyebrow lands at 3.85:1 and the blurb at 4.47, both under the
   4.5 they owe at their sizes. Hierarchy comes from size and weight, which is
   the same ruling the category bands carry. */
.sty-new .sty-next .sty-eb,.sty-new .sty-next .sty-tag{opacity:1;}
/* The same 184px track the category shelves deal on, so the tiles line up with
   the rows underneath instead of forming a second grid. */
.sty-pop{display:grid;gap:7px;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));}
/* THE TILES ARE INVERTED (owner, 2026-09-04): the category step is the FILL
   rather than a hairline and a glyph, and everything on the tile takes that
   ink that step carries. Elsewhere on this page a hue is an edge; here it is
   the subject, because the row exists to say what the ten categories ARE. */
.sty-new .sty-pop .sty-g{background:var(--cc);border-color:transparent;color:var(--stg-onramp);}
.sty-new .sty-pop .sty-gi,.sty-new .sty-pop .sty-pcat,.sty-new .sty-pop .sty-gt{color:currentColor;}
/* A border cannot mark a hover on a card whose border is its own fill, so the
   ring goes inside and is drawn in the ink the tile already carries. */
.sty-new .sty-pop .sty-g:hover{border-color:transparent;box-shadow:inset 0 0 0 2px currentColor;}
/* And the focus ring cannot be --cc here either: that is the fill it would be
   drawn on top of. */
.sty-new .sty-pop .sty-g:focus-visible,.sty-new .sty-two .sty-next:focus-visible{
  outline:2px solid currentColor;outline-offset:2px;}
/* MY GAMES, TO A READER WHO HAS NONE. The same offer the cap makes, at the size
   of the cards above it, and on the same tokens the cap button already proved in
   both registers: the accent as the fill and the ink published for it. */
.sty-join{display:flex;align-items:center;gap:18px;text-decoration:none;
  background:var(--stg-acc);color:var(--stg-onramp);border-radius:12px;padding:18px 20px;}
.sty-join .sty-eb{color:inherit;margin-bottom:5px;}
.sty-join .sty-jn{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.1;}
.sty-join .sty-tag{font-size:13.5px;font-weight:600;margin-top:4px;}
.sty-join:hover .sty-go{background:currentColor;color:var(--stg-acc);}
.sty-join:focus-visible{outline:2px solid currentColor;outline-offset:2px;}
/* ONE LINE IS ALL THE ROW ADDS TO A TILE: which category it speaks for. */
.sty-pcat{display:block;font-family:\${MONO};font-size:8.5px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;margin-bottom:4px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
@media (max-width:560px){
  .sty-pop{grid-template-columns:minmax(0,1fr) minmax(0,1fr);}
  /* A name, a blurb and a button do not share a 390px line, so a circuit card
     stacks and the control keeps the left edge the copy above it has. */
  .sty-next,.sty-join{flex-direction:column;align-items:flex-start;}
  .sty-two .sty-nm{font-size:19px;}
  .sty-join .sty-jn{font-size:21px;}
  .sty-next .sty-go,.sty-join .sty-go{margin-left:0;}
}
`,
);

fs.writeFileSync(file, src);
console.log(`\n${n} anchored edits applied to ${file}`);
