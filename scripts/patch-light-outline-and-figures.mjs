#!/usr/bin/env node
// FOUR OWNER CHANGES IN ONE PUSH (2026-09-04), applied as anchored edits.
//
//   1. The newcomer row keeps its category FILL on the dark register and takes
//      an OUTLINE in the same step on the light one.
//   2. The cap date sits on the wordmark's own baseline instead of hanging off
//      the mark's bottom edge.
//   3. "rank today" in the cap adopts the convention every tile and end card
//      on the site already uses.
//   4. The Gauntlet run screen stops printing two different sizes for today's
//      field on one screen.
//
// Every anchor must match EXACTLY ONCE against a copy taken from the fetch in
// the SAME deploy step: zero means origin moved, two means the anchor is not
// specific enough and the patch would land twice. Both throw.
//
//   node scripts/patch-light-outline-and-figures.mjs <repo-root>

import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
if (!root) { console.error('usage: patch-light-outline-and-figures.mjs <repo-root>'); process.exit(1); }

let cur = null; let src = ''; let n = 0;

function open(rel) {
  if (cur) fs.writeFileSync(cur, src);
  cur = path.join(root, rel);
  src = fs.readFileSync(cur, 'utf8');
  console.log(`\n${rel}`);
}
function close() { if (cur) fs.writeFileSync(cur, src); cur = null; }

function edit(label, anchor, build) {
  const hits = src.split(anchor).length - 1;
  if (hits !== 1) throw new Error(`anchor "${label}" matched ${hits} times, expected exactly 1`);
  src = src.replace(anchor, build(anchor));
  n += 1;
  console.log(`  ok  ${label}`);
}

/* ══ app/today/StageToday.jsx ═══════════════════════════════════════════════ */
open('app/today/StageToday.jsx');

/* ── 1a. the ramp already solved "this step, on paper, as a line" ───────── */
// CATEGORY_RAMP_INK_LIGHT is the light register's step deepened until it is
// legible AS TEXT, and scripts/verify-category-ramp.mjs holds every one of the
// ten to 4.5:1 on all three surfaces the register paints, a white card
// included. That is exactly what an outline and the words inside it need, and
// it is the only value on the ramp that all ten steps can share: the three
// warm ones (End Game, Trivia, Arcade) keep their light VALUE because they are
// drawn to be FILLED, so as a hairline on paper they measure 1.5 to 2:1 and
// the row would come out with three cards that barely have an edge.
edit(
  'import categoryAccentInkLight',
  "import { RAMP_ORDER, categoryColor, categoryColorLight, categoryOnrampLight, RAMP_INK } from '@/lib/category-ramp';",
  (a) => a.replace(
    'categoryColorLight, categoryOnrampLight,',
    'categoryColorLight, categoryAccentInkLight, categoryOnrampLight,',
  ),
);

/* ── 1b. every card publishes its own line colour ───────────────────────── */
// Set on BOTH registers because it costs nothing and only the light rules read
// it; a card that carries its own value cannot fall back to another category.
edit(
  'circuit card publishes --ccl',
  `                      style={{
                        '--cc': c.hue,
                        '--stg-onramp': light ? categoryOnrampLight(c.cat) : RAMP_INK,
                      }}>`,
  () => `                      style={{
                        '--cc': c.hue,
                        '--ccl': categoryAccentInkLight(c.cat),
                        '--stg-onramp': light ? categoryOnrampLight(c.cat) : RAMP_INK,
                      }}>`,
);
edit(
  'tile publishes --ccl',
  `                    style={{
                      '--cc': hueFor(cat),
                      '--stg-onramp': light ? categoryOnrampLight(cat) : RAMP_INK,
                    }}>`,
  () => `                    style={{
                      '--cc': hueFor(cat),
                      '--ccl': categoryAccentInkLight(cat),
                      '--stg-onramp': light ? categoryOnrampLight(cat) : RAMP_INK,
                    }}>`,
);

/* ── 1c. THE LIGHT REGISTER OUTLINES WHAT THE DARK ONE FILLS ────────────── */
// NO APOSTROPHES and NO BACKTICKS below: this is a text child of a style
// element (React escapes them) inside a JS template literal.
edit(
  'light-register outline',
  '.sty-new .sty-pop .sty-g:focus-visible,.sty-new .sty-two .sty-next:focus-visible{\n'
  + '  outline:2px solid currentColor;outline-offset:2px;}\n',
  (a) => a + `
/* -- and the SAME row, outlined, on the light register (owner, 2026-09-04) --
   TEN FILLED CARDS ARE A DIFFERENT OBJECT ON A PALE GROUND. On the dark
   register a filled step is the brightest thing in view and the row reads as
   ten colours; on the pale one the page is already bright, so the same ten
   fills stop being an accent and become the surface, and the row shouts over
   everything under it. The colour still has to say which category each card
   speaks for, so it moves from the fill to a 2px ring, and the card goes back
   to the ground and the ink every other card on this page uses. The dark rules
   above are untouched: only the register changes.

   THE LINE IS --ccl, NOT --cc. A step drawn to be FILLED is not a colour you
   can draw a hairline in: End Game, Trivia and Arcade keep their light value
   on this register and flip their ink instead of darkening, so as an edge on
   paper they measure 1.5 to 2:1 and those three cards would read as having no
   border at all beside the other seven. --ccl is the ramp value that already
   solves this -- CATEGORY_RAMP_INK_LIGHT, the step deepened until it is
   legible as TEXT, held to 4.5:1 on a white card by the ramp verifier -- so
   all ten edges come out at one strength, and the category name and the glyph
   can carry the colour too instead of going grey. */
[data-stage-theme=light] .sty-new .sty-pop .sty-g{
  background:var(--stg-surf);color:var(--stg-ink);
  border-color:var(--ccl);box-shadow:inset 0 0 0 1px var(--ccl);}
[data-stage-theme=light] .sty-new .sty-pop .sty-gi,
[data-stage-theme=light] .sty-new .sty-pop .sty-pcat{color:var(--ccl);}
[data-stage-theme=light] .sty-new .sty-pop .sty-gt{color:var(--stg-mute);}
/* The hover ring thickens the edge the tile already has rather than being a
   second, different mark. */
[data-stage-theme=light] .sty-new .sty-pop .sty-g:hover{
  border-color:var(--ccl);box-shadow:inset 0 0 0 2px var(--ccl);}
[data-stage-theme=light] .sty-new .sty-pop .sty-g:focus-visible,
[data-stage-theme=light] .sty-new .sty-two .sty-next:focus-visible{
  outline:2px solid var(--ccl);}
/* The two circuit cards are the same object one size up, so they take the same
   treatment: nothing on this row should be filled while its neighbour is not. */
[data-stage-theme=light] .sty-new .sty-two .sty-next{
  background:var(--stg-surf);color:var(--stg-ink);
  box-shadow:inset 0 0 0 2px var(--ccl);}
[data-stage-theme=light] .sty-new .sty-two .sty-next .sty-eb{color:var(--ccl);}
[data-stage-theme=light] .sty-new .sty-two .sty-next .sty-tag{color:var(--stg-mute);}
[data-stage-theme=light] .sty-new .sty-two .sty-next .sty-gi{color:var(--ccl);opacity:1;}
/* THE ONE FILLED MOMENT LEFT is the chip under the pointer. It fills with the
   same deepened value the rest of the card is drawn in, so the card ground is
   the ink: white on all ten by the same 4.5:1 the ramp verifier holds them to,
   which is the one inversion that needs no per-step ink at all. */
[data-stage-theme=light] .sty-new .sty-two .sty-next .sty-go{
  border-color:var(--ccl);color:var(--ccl);}
[data-stage-theme=light] .sty-new .sty-two .sty-next:hover .sty-go{
  background:var(--ccl);color:var(--stg-surf);border-color:var(--ccl);}
`,
);

/* ── 2. THE DATE SITS ON THE WORDMARK'S LINE ────────────────────────────── */
// A flex container only EXPOSES a baseline when one of its own items is
// baseline-aligned. .sty-brand centred both of its items, so it had none, and
// a flex item with no baseline gets one synthesised from its bottom margin
// edge -- the bottom of the 20px mark. .sty-id was therefore aligning the date
// to the bottom of the LOGO rather than to the baseline of the words beside
// it, which is the drop the owner is looking at.
//
// The fix keeps both halves of the original intent: the mark still centres on
// the words (align-self on the svg), and the date still hangs off the NAME's
// baseline -- which is now a baseline that actually exists.
edit(
  'cap date baseline',
  `.sty-id{display:flex;align-items:baseline;gap:11px;min-width:0;}
/* The mark and the words are ONE object, so they centre on each other; the date
   still hangs off the NAME's baseline, which is what .sty-id keeps its baseline
   alignment for. */
.sty-brand{display:flex;align-items:center;gap:8px;min-width:0;}`,
  () => `.sty-id{display:flex;align-items:baseline;gap:11px;min-width:0;}
/* The mark and the words are ONE object, so they centre on each other; the date
   still hangs off the NAME's baseline, which is what .sty-id keeps its baseline
   alignment for.

   A FLEX BOX ONLY HAS A BASELINE IF ONE OF ITS ITEMS IS ALIGNED TO ONE (owner,
   2026-09-04). This box centred BOTH of its items, so it exposed none, and a
   flex item without a baseline is given one synthesised from its bottom margin
   edge: .sty-id was aligning the date to the bottom of the 20px MARK rather
   than to the baseline of the words, and the date sat a few pixels low and off
   the line. So the box is baseline-aligned and the mark alone opts out, which
   keeps the mark centred on the words exactly as before and hands .sty-id the
   name's real baseline to hang the date on. */
.sty-brand{display:flex;align-items:baseline;gap:8px;min-width:0;}
.sty-brand>svg{align-self:center;}`,
);

/* ══ lib/quiz-derived-cache.js ══════════════════════════════════════════════ */
open('lib/quiz-derived-cache.js');

edit(
  'registered day numbering',
  `  const posDay = new Map();
  for (let i = 0; i < dayRanked.length; i++) posDay.set(dayRanked[i].key, i + 1);
  const dayField = dayRanked.length;

  const value = { gained, posNow, posThen, posDay, dayField };`,
  () => `  const posDay = new Map();
  for (let i = 0; i < dayRanked.length; i++) posDay.set(dayRanked[i].key, i + 1);
  const dayField = dayRanked.length;

  // THE DAY'S NUMBERING IS THE REGISTERED BOARD'S (owner, 2026-09-04), which is
  // the rule every other standing on this site already follows: rank among the
  // NAMED players, renumbered 1,2,3 with no gaps, printed against a field that
  // still counts everyone who played. posDay above interleaves guests, so the
  // cap was reporting a position no board on the site would confirm -- a player
  // reading #14 of 48 in the header and #9 of 48 on their own tiles, with the
  // difference being five guests the public boards do not show. dayField is
  // deliberately NOT narrowed: the denominator is the whole pool, exactly as
  // the per-game "of N" is.
  //
  // dayRanked is already ordered by today's gain, so the filter preserves it
  // and regDayGained comes out descending, which is what the guest slot-in
  // below can walk and stop early on.
  const dayReg = dayRanked.filter((p) => !p.isAnon && p.username);
  const posDayReg = new Map();
  const regDayGained = [];
  for (let i = 0; i < dayReg.length; i++) {
    posDayReg.set(dayReg[i].key, i + 1);
    regDayGained.push(gained.get(dayReg[i].key) || 0);
  }

  const value = { gained, posNow, posThen, posDay, dayField, posDayReg, regDayGained };`,
);

/* ══ app/api/quiz/daily-status/route.js ═════════════════════════════════════ */
open('app/api/quiz/daily-status/route.js');

edit(
  'day rank reads the registered board',
  `        if (mineToday > 0 && st.posDay) {
          dayRank = st.posDay.get(xpKey) || null;
          dayField = st.dayField || null;
        }`,
  () => `        if (mineToday > 0 && st.posDay) {
          // The field is the whole pool, guests included, which is the same
          // denominator every per-game "#N of M" on the site already prints.
          dayField = st.dayField || null;
          // A REGISTERED PLAYER READS THE REGISTERED BOARD'S OWN NUMBER, so the
          // cap agrees with the tiles, the end cards and the board panels
          // instead of quoting a gappy full-field position none of them show.
          if (st.posDayReg && st.posDayReg.has(xpKey)) {
            dayRank = st.posDayReg.get(xpKey);
          } else {
            // A GUEST HAS NO PLACE ON THAT BOARD, so they are slotted into it
            // by what they earned today -- and NEVER AHEAD OF A REGISTERED
            // PLAYER (owner ruling, 2026-09-04). Hence >=, not >: a guest level
            // with a named player lands behind them rather than sharing or
            // taking the slot. Compared on the rounded figure the cap actually
            // prints, so two days that display the same IQ rank the same.
            //
            // regDayGained is descending, so the first row that is not ahead
            // ends the walk.
            const mine = Math.round(mineToday);
            let ahead = 0;
            for (const g of (st.regDayGained || [])) {
              if (Math.round(g) >= mine) ahead += 1; else break;
            }
            dayRank = ahead + 1;
          }
        }`,
);

/* ══ app/circuits/[id]/run/RunClient.jsx ════════════════════════════════════ */
open('app/circuits/[id]/run/RunClient.jsx');

edit(
  'one field figure',
  `  const boardNow = boardQ.data || boardGate.data || null;
  const boardRows = boardNow && Array.isArray(boardNow.overall) ? boardNow.overall : [];
`,
  (a) => a + `
  // ONE FIGURE FOR TODAY'S FIELD (owner, 2026-09-04). Two of them were on the
  // same screen and they disagreed: the gate headline printed field.started,
  // which is the biggest single BANK's play count, while the strip and the
  // rankings panel printed overallField, the distinct players on the circuit's
  // board. Both are true and they answer different questions, which is exactly
  // why having both visible reads as one of them being broken (live 2026-09-04:
  // 52 players in the panel, 47 played today on the gate).
  //
  // THE WIDER ONE IS THE CIRCUIT'S FIELD, and it is also the honest one: a
  // player who has run any bank is on this circuit today, and a per-bank count
  // can only ever be a floor for that. Every surface on the run now reads this
  // and nothing can drift again. boardRows.length is the floor for a payload
  // that has rows but no overallField.
  const fieldToday = Math.max(
    (boardNow && boardNow.overallField) || 0,
    boardRows.length,
    (field && field.started) || 0,
  );
`,
);

edit(
  'strip field figure',
  `            &middot; {boardNow.overallField || boardRows.length}{' '}
            {(boardNow.overallField || boardRows.length) === 1 ? 'player' : 'players'}`,
  () => `            &middot; {fieldToday}{' '}
            {fieldToday === 1 ? 'player' : 'players'}`,
);

edit(
  'panel field figure',
  '                    {boardNow ? `${boardNow.overallField || boardRows.length} ` : \'\'}\n'
  + "                    {boardNow && (boardNow.overallField || boardRows.length) === 1 ? 'player' : 'players'}",
  () => '                    {boardNow ? `${fieldToday} ` : \'\'}\n'
  + "                    {boardNow && fieldToday === 1 ? 'player' : 'players'}",
);

edit(
  'gate headline field figure',
  '                    <var>{field.started}</var> played today.<br />',
  () => '                    <var>{fieldToday}</var> played today.<br />',
);

close();
console.log(`\n${n} anchored edits applied under ${root}`);
