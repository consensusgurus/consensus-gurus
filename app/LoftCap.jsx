'use client';

// LoftCap — the blue cap that replaces a daily page's title block.
//
// It carries the game's identity (eyebrow, 800-weight name) and its LIVE
// FIGURES, which previously sat in a monospace strip inside the board card.
// Moving them up here is the point: the game's state and the player's state
// then use one vocabulary, and the board gets that space back.
//
// Renders full-bleed, so mount it OUTSIDE the page's max-width wrapper,
// immediately after <DailyChrome />.
//
// Layout is a wrapping flex row so the desktop arrangement is pure `order`:
// on a phone it is name / figures / (extra), and at 900px it becomes one
// header bar with the name left, the figures and the help control at the
// right edge. `.help` is a direct child rather than nested in the id block,
// which is what lets `order` reach it.
import React, { useEffect, useRef } from 'react';
import { DAILY_GAMES, isRetiredDaily } from '@/lib/daily-games';
import useDailyRoster from './useDailyRoster';

// Alphabetical, retired games dropped, computed once at module load: it is the
// same list on every page and never changes within a session.
const ALL_AZ = DAILY_GAMES
  .filter((g) => !isRetiredDaily(g.key))
  .map((g) => ({ key: g.key, name: g.name, tag: g.tag, href: g.href || `/${g.key}` }))
  .sort((a, b) => a.name.localeCompare(b.name));

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

export default function LoftCap({
  name,
  outcome = null,     // null while playing, then 'won' | 'part' | 'lost'
  cat = '',
  num = null,
  dateLabel = '',
  figures = [],
  tiles = null,      // once finished, what to play next, in place of the figures
  onHelp = null,
  sunday = null,
  progress = null,   // 0-100, draws the hairline at the foot of the cap
  extra = null,      // an optional third tier (Anon's spine, for instance)
}) {
  // Only asks the network once the game is over, which is the only time the
  // strip is shown.
  const { played } = useDailyRoster({ active: !!outcome });
  const strip = outcome ? ALL_AZ.filter((g) => g.name !== name) : null;

  const azRef = useRef(null);
  // A screenful less an overlap, so a reader keeps a landmark across a press.
  const azNudge = (dir) => {
    const el = azRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(160, el.clientWidth - 80), behavior: 'smooth' });
  };
  useEffect(() => {
    const el = azRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      const next = el.scrollLeft + e.deltaY;
      if ((e.deltaY < 0 && el.scrollLeft > 0) || (e.deltaY > 0 && el.scrollLeft < max)) {
        e.preventDefault();
        el.scrollLeft = Math.max(0, Math.min(max, next));
      }
    };
    const wrap = el.parentElement;
    const sync = () => {
      if (!wrap) return;
      const max = el.scrollWidth - el.clientWidth;
      wrap.classList.toggle('at-start', el.scrollLeft <= 1);
      wrap.classList.toggle('at-end', el.scrollLeft >= max - 1);
    };
    sync();
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [outcome]);

  useEffect(() => {
    const board = () => document.querySelector('.loft-sheet') || document.querySelector('.loft-card');
    const apply = () => {
      const el = board();
      if (!el) return;
      const w = Math.round(el.getBoundingClientRect().width);
      // guard against measuring a collapsed or hidden card
      if (w > 240) document.documentElement.style.setProperty('--loft-col', `${w}px`);
    };
    apply();
    const el = board();
    const ro = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    if (ro && el) ro.observe(el);
    window.addEventListener('resize', apply);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', apply); };
  });

  const eyebrow = [cat, num != null ? `No. ${num}` : null, dateLabel]
    .filter(Boolean).join(' · ');
  return (
    <div className={outcome ? `lcap lcap-done lcap-${outcome}` : 'lcap'}>
      <div className="lcap-col">
      <style>{`
.lcap{background:var(--blue);position:relative;font-family:${SANS};z-index:4}
/* THE CAP IS A FULL-WIDTH BAND WHOSE CONTENT SITS OVER THE BOARD.
   The band runs edge to edge like the chrome above it, but everything in it is
   centred on the game's own column, so the name and the figures line up with
   the board rather than with the site header. --loft-col is measured from the
   column the cap is mounted in (see DailyMasthead); 640 is the fallback and is
   what Crux uses, since its cap is mounted outside that column.
   The gold rule moves onto the column with the content: at 1920 a rule pinned
   to the screen edge sits 640px away from the thing it is marking. */
.lcap-col{display:flex;flex-wrap:wrap;align-items:center;max-width:var(--loft-col,640px);
  margin:0 auto;border-left:4px solid var(--gold)}
/* Finished. The cap is already the object tracking your game, so it resolves
   into the verdict rather than a card appearing over the top of everything, and
   the colour carries the outcome: green solved, red not. Anything else would
   make a miss look like a win at a glance, which is the one thing the cap is
   there to say. */
/* THE CAP NO LONGER CARRIES THE VERDICT (owner, 2026-08-14). It used to turn
   green, amber or red on a finish. The verdict moved to the END CARD's own
   header, which is where the result is: colouring the page furniture as well
   said it twice, and the band is the game's identity rather than its outcome.
   The colour classes are kept as hooks but paint nothing. */
.lcap-won .lcap-col{border-left-color:var(--success-deep)}
.lcap-lost .lcap-col{border-left-color:var(--danger)}
.lcap-part .lcap-col{border-left-color:var(--gold)}

.lcap-won .lcap-eb,.lcap-won .lcap-k{color:#b9f0d0}

.lcap-lost .lcap-eb,.lcap-lost .lcap-k{color:#f6cfc9}
/* An intermediate result is neither: amber. FLAT GOLD WITH DARK INK, which is
   the pairing the home slate already uses on its paused cards (var(--gold)
   ground, #2a1f04 ink), so a partial result reads the same here as it does
   there (owner, 2026-08-14).
   This was the DEEP gold with white text, on the reasoning that the cap's text
   is white and white on flat gold is unreadable. That reasoning was right about
   the contrast and wrong about the fix: the answer is to re-ink the cap, not to
   darken the ground, because the ground is what carries the meaning. So every
   white-on-blue token inside the cap gets a dark counterpart here, including
   the hairline borders and the help button, which are white-alpha and vanish
   on gold. */

/* .lcap-part re-inking removed 2026-08-14: the band is always blue now, so the
   dark ink only made the game name unreadable. The divider rules above still
   carry the state. */
.lcap-part .lcap-bar{background:rgba(0,0,0,0.16)}
.lcap-part .lcap-bar i{background:#2a1f04}
.lcap-id{flex:1;min-width:0;padding:8px 12px}
/* Finished: the eyebrow goes and the block shrinks to the game's title, so the
   width it was using goes to the next-up tiles beside it. */
.lcap-done .lcap-eb{display:none}
.lcap-done .lcap-id{flex:0 0 auto}
.lcap-tiles{display:flex;gap:6px;flex:1;min-width:0;padding:6px 12px 8px;overflow-x:auto}
.lcap-tiles a{display:flex;align-items:center;gap:8px;
  flex:1 1 0;min-width:88px;text-decoration:none;background:rgba(255,255,255,0.95);
  border-radius:9px;padding:6px 9px;color:var(--ink)}
.lcap-tiles a:hover{background:var(--white)}
.lcap-tiles b{display:block;font-weight:800;font-size:12.5px;line-height:1;white-space:nowrap;
  overflow:hidden;text-overflow:ellipsis}
.lcap-tiles i{display:block;font-style:normal;font-weight:600;font-size:9.5px;line-height:1.25;
  margin-top:3px;color:var(--slate);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* THE ICON SITS ON A WHITE PLATE, square and contained. The art is 76x76 and
   a non-square box renders it narrow, which throws the name out of line: that
   is the bug that shipped on the home rail when one game's art was 88x76. */
.lcap-tiles img{flex:0 0 auto;width:34px;height:34px;border-radius:7px;
  object-fit:contain;display:block}
.lcap-tiles a>span{min-width:0}
@media(min-width:900px){.lcap-tiles{flex:0 0 auto;order:3;margin-left:auto}
  .lcap-tiles a{flex:0 0 168px}
  /* The roster is long, so it takes the width that is going and scrolls inside
     it rather than pushing the band wider. */
  .lcap-azwrap{flex:1 1 auto;max-width:min(62vw,860px)}
  .lcap-azbtn{display:flex}
  .lcap-tiles.az a{flex:0 0 auto}}
/* NAME-ONLY CHIPS, tight, so a lot of the roster is in view at once. */
.lcap-azwrap{position:relative;min-width:0;display:flex}
.lcap-tiles.az{gap:5px;padding:5px 12px 7px;align-items:center;
  scroll-snap-type:none;scrollbar-width:none;-ms-overflow-style:none}
.lcap-azbtn{display:none;position:absolute;top:0;bottom:0;z-index:2;width:34px;
  align-items:center;justify-content:center;cursor:pointer;
  border:0;padding:0;font-family:inherit;font-size:21px;font-weight:800;line-height:1;
  color:var(--white)}
.lcap-azbtn.prev{left:0;background:linear-gradient(90deg,var(--blue) 45%,rgba(37,99,235,0) 100%)}
.lcap-azbtn.next{right:0;background:linear-gradient(270deg,var(--blue) 45%,rgba(37,99,235,0) 100%)}
.lcap-azwrap.at-start .lcap-azbtn.prev,.lcap-azwrap.at-end .lcap-azbtn.next{display:none}
.lcap-tiles.az a{display:block;flex:0 0 auto;min-width:0;white-space:nowrap;
  background:rgba(255,255,255,0.14);color:var(--white);border-radius:7px;
  padding:6px 10px;font-weight:800;font-size:12.5px;line-height:1.1;gap:0}
.lcap-tiles.az a:hover{background:rgba(255,255,255,0.30)}
.lcap-tiles.az::-webkit-scrollbar{display:none}
/* Finished today: still there, still reachable, just not competing with the
   ones you have not played. */
.lcap-tiles.az a.done{opacity:.5}
/* PHONE: a snapping slider. Three tiles across a 390px row leaves each about
   118px, which truncates most taglines, so the row scrolls instead and shows
   about two and a half. The scrollbar is hidden because the partial tile at
   the edge is the affordance. */
@media(max-width:899px) and (orientation:portrait){
  .lcap-done .lcap-nm{font-size:17px;line-height:1.08;white-space:normal;max-width:5.2em}
  .lcap-tiles{scroll-snap-type:x mandatory}
  .lcap-tiles i{display:block}
  .lcap-tiles.az a{flex:0 0 auto!important;scroll-snap-align:none}
  .lcap-tiles a{flex:0 0 78%!important;scroll-snap-align:start;min-width:0;
    gap:8px;padding-left:9px;padding-right:9px}
  .lcap-tiles b{font-size:12.5px}
}
@media(max-width:899px){
  .lcap-tiles{scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .lcap-tiles::-webkit-scrollbar{display:none}
  .lcap-tiles a{flex:0 0 44%;scroll-snap-align:start}}
.lcap-eb{display:block;font-weight:800;font-size:11.5px;line-height:1;letter-spacing:.13em;
  text-transform:uppercase;color:var(--blue-200);margin-bottom:4px}
.lcap-nm{display:block;font-weight:800;font-size:22px;line-height:1;letter-spacing:-.022em;color:var(--white)}
.lcap-sun{display:inline-block;margin-left:8px;font-weight:800;font-size:9px;line-height:1;
  letter-spacing:.11em;text-transform:uppercase;color:var(--gold-ink);background:var(--gold);
  border-radius:4px;padding:3px 6px;vertical-align:middle}
.lcap-sunnode{display:inline-flex;align-items:center;margin-left:8px;vertical-align:middle}
/* The shared masthead sits inside the page column, so the cap has to break out
   of it to run edge to edge the way the bands above it do. */
.lcap-bleed{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);margin-bottom:14px}
.lcap-help{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.18);
  display:grid;place-items:center;font-weight:800;font-size:15px;color:var(--white);
  border:0;cursor:pointer;margin-right:12px;flex:none;font-family:inherit}
.lcap-figs{display:flex;border-top:1px solid rgba(255,255,255,0.22);flex:0 0 100%}
.lcap-figs>div{flex:1;padding:6px 6px 8px;text-align:center;white-space:nowrap;
  border-right:1px solid rgba(255,255,255,0.22)}
.lcap-figs>div:last-child{border-right:0}
.lcap-v{display:block;font-weight:800;font-size:15px;line-height:1;color:var(--white)}
.lcap-k{display:block;font-weight:700;font-size:8.5px;line-height:1;letter-spacing:.1em;
  text-transform:uppercase;color:var(--blue-200);margin-top:4px}
.lcap-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,0.18)}
.lcap-bar i{display:block;height:100%;background:var(--gold);transition:width .2s}
@media(min-width:900px){
  /* THE HELP BUTTON NEVER WRAPS. The column is the board's width, but the cap
     must fit a name, up to four figures and the control on one line, and on a
     narrow board that needs more room than the board has. min-width:fit-content
     lets the HEADER, and only the header, take exactly the extra it needs: at or
     under the board's width nothing changes, above it the column grows to the
     one-line width and no further, capped at the band. */
  .lcap-col{width:var(--loft-col,640px);min-width:fit-content;max-width:100%}
  .lcap-id{flex:0 1 auto}
  .lcap-figs{flex:0 0 auto;order:3;border-top:0;margin-left:auto;
    border-left:1px solid rgba(255,255,255,0.22)}
  .lcap-figs>div{flex:0 0 124px}
  .lcap-help{order:4}
}

/* The play stage: navy, full bleed, with the board card as the one light
   object on it. Sits inside the centered page column, so the negative margin
   pulls it out to the viewport and the padding puts its content back. */
.loft-stage{background:var(--accent);margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);
  padding:14px calc(50vw - 50%) 22px;
  /* Fill the first screen. Without this the navy stops at the card and the
     page shows a band of light under it, which reads as an unfinished edge
     rather than as the start of the next region. The offset is the brand bar
     plus the cap; overshooting only pushes the tail below the fold, which is
     where it belongs, so it is deliberately generous. */
  min-height:calc(100vh - 100px);min-height:calc(100dvh - 100px);
  display:flex;flex-direction:column;justify-content:flex-start}
.loft-card{background:var(--white)!important;border:0!important;border-radius:14px!important;
  box-shadow:0 10px 30px rgba(0,0,0,0.34)!important}
/* The page column carries its own top and bottom padding, which on the navy
   ground showed as a white band above the stage. Zero it; the stage and the
   sheet below supply their own spacing.

   MATCHED BY SHAPE, NOT BY NAME. This was ".loft-page .cx-wrap", which is
   Crux's own wrapper class, so every game converted after it would have had to
   add its own selector here: there are 57 distinct wrapper classes across the
   dailies (cx-wrap, mc-wrap, tl-wrap, sd-wrap ...) and two of them are shared
   by a pair of games. Keying off the "-wrap" SUFFIX covers all of them at once
   and means a newly converted client needs no edit in this file at all.

   THE CHILD COMBINATOR IS LOAD-BEARING; measured on the live page, not
   assumed. A descendant selector matches .ri-wrap too, the Report-an-issue
   block sitting deep in the tail, and zeroing its padding is not wanted.
   Restricting to direct children leaves exactly the page column.

   The :not(.dch-wrap) is belt and braces rather than strictly required: on a
   loft page DailyChrome's wrapper renders as "dch-wrap dch-loft", and an
   attribute selector tests the WHOLE class string, which then ends in
   "dch-loft" and does not match. It is kept because that is a coincidence of
   the second class, not a guarantee.

   TWO WAYS A GAME FALLS OUTSIDE THIS, both silent. Because [class$=] tests the
   whole attribute, a wrapper carrying a SECOND class stops matching: keep the
   page column's className a single class, or add that game explicitly. And a
   game with no wrapper class at all (babel, blocks, chomp, glyph and sweep have
   none) needs one added when it is converted.

   NO BACKTICKS IN THIS COMMENT. It lives inside a template literal, so a
   backtick here closes the style block and breaks the build. */
.loft-page > [class$="-wrap"]:not(.dch-wrap){padding-top:0!important;padding-bottom:0!important}
.loft-page{background:var(--accent)!important}
/* NO GRAIN ON A LOFT PAGE. The grain is a fixed, 12%-opacity multiply layer at
   z-index 1, so it DARKENS whatever sits under it, and the About section and
   the footer carry z-index 2 and sit over it. The result was a page in two
   different navies with a hard seam above the footer, which is exactly the
   difference the owner reported. It is a paper texture for the cream magazine
   theme and has no job on a flat navy ground. */
.loft-page > svg{display:none}
.loft-page .loft-stage{min-height:0;padding-bottom:16px}
.loft-page .loft-stage ~ div{margin-top:14px!important}
.loft-page section{padding-top:0!important;padding-bottom:20px!important}
.loft-page footer{margin-top:0!important;padding-top:18px!important}
.loft-page .loft-stage ~ p{color:#bfd0ee!important}
.loft-page .loft-stage ~ p a{color:#ffd45e!important}
.loft-page .loft-stage ~ p b{color:var(--white)!important}
.loft-page section h2{color:var(--white)!important}
.loft-page section p{color:#bfd0ee!important}
.loft-page section a{color:#ffd45e!important}
.loft-page section em,.loft-page section i{color:#93a9d6!important}
.loft-page .loft-stage ~ div:not([style*="fixed"]) > p{color:#bfd0ee!important}
.loft-page .loft-stage ~ div:not([style*="fixed"]):not(:has(.loft-report)):not(:has(.loft-showchrome)),
.loft-page .loft-stage ~ div:not([style*="fixed"]):not(:has(.loft-report)):not(:has(.loft-showchrome)) *:not([style*="background"]):not([style*="background"] *){
  color:#bfd0ee!important}
.loft-page .loft-stage ~ div:not([style*="fixed"]):not(:has(.loft-report)):not(:has(.loft-showchrome)) b:not([style*="background"] b),
.loft-page .loft-stage ~ div:not([style*="fixed"]):not(:has(.loft-report)):not(:has(.loft-showchrome)) strong{
  color:var(--white)!important}
.loft-page > [class$="-wrap"] > div > p{color:#bfd0ee!important}
/* The "Show overview and more" control was styled for a light page: deep blue
   ink, no ground, a faint border. All three disappear on navy (owner: "it
   blends into background now"). It reads as a proper button here. */
.loft-page .loft-showchrome{color:var(--white)!important;
  background:rgba(255,255,255,0.10)!important;border:1.5px solid rgba(255,255,255,0.45)!important;
  border-radius:9px!important;padding:10px 20px!important}
.loft-page .loft-showchrome:hover{background:rgba(255,255,255,0.20)!important}
.loft-page footer{color:#bfd0ee!important;border-top-color:rgba(255,255,255,0.18)!important}
.loft-page footer b,.loft-page footer strong,.loft-page footer h3,.loft-page footer h4{color:var(--white)!important}
.loft-page footer a{color:#dbe9ff!important}
.loft-page footer div,.loft-page footer p,.loft-page footer span,.loft-page footer li{color:inherit!important}
/* UNUSED as of 2026-08-14, kept for a game that wants a figure on the navy
   under its board. Crux was the only caller and its IQ figure moved ONTO the
   end card (.loft-fiq below), because that is where a player looks for it.
   Delete both blocks if nothing has claimed them by the time the format ships. */
.loft-iq{margin-top:12px;padding:11px 12px;background:rgba(255,255,255,0.09);
  border-left:4px solid var(--gold);border-radius:0 9px 9px 0;color:var(--white)}
.loft-iq .l{display:block;font-weight:800;font-size:9.5px;line-height:1;letter-spacing:.11em;
  text-transform:uppercase;color:#ffd45e;margin-bottom:7px}
.loft-iq .v{font-weight:800;font-size:24px;line-height:1}
.loft-iq .v small{font-weight:700;font-size:12px;color:#9dc0f5;margin-left:8px;letter-spacing:0}
.loft-acts{display:flex;gap:8px;margin-top:10px}
.loft-acts button{flex:1;border-radius:10px;padding:13px 8px;text-align:center;font-weight:800;
  font-size:13.5px;font-family:inherit;cursor:pointer;border:1px solid rgba(255,255,255,0.22);
  background:rgba(255,255,255,0.12);color:var(--white)}
.loft-acts button.gold{background:var(--gold);border-color:var(--gold);color:#3a2a05}
/* THE FINISH IS THE BOARD TURNING OVER.
   The front face is the board you just played. The back is what to do next.
   The container takes its height from the FRONT, and the back is absolutely
   positioned inside it, so a short options list can never make the card jump
   and a long one scrolls instead. */
.loft-flip{perspective:1400px}
.loft-flip-in{position:relative;transition:transform .5s cubic-bezier(.4,.1,.2,1);
  transform-style:preserve-3d}
.loft-flip.on .loft-flip-in{transform:rotateY(180deg)}
/* BOTH FACES MUST HIDE THEIR BACK, and the back one was missing it. The front
   had backface-visibility:hidden and the back did not, so pressing Reveal (which
   drops the .on class to turn the card back to the board) left the options panel
   painted on top of the board, MIRRORED, because it was now facing away. It also
   still swallowed the taps: a hit test at the middle of the card landed on
   .loft-opt. That is the whole of the "reveal is broken" bug, measured on the
   live page 2026-08-14, and it is why the panel in the report looked mirrored.
   pointer-events is belt and braces: whichever face is turned away cannot be
   clicked even if an engine mispaints the backface. */
.loft-face{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.loft-back{position:absolute;inset:0 0 12px 0;transform:rotateY(180deg);background:var(--white);
  border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.34);
  display:flex;flex-direction:column;color:var(--ink);
  /* THE SCROLL MOVED INSIDE (owner, 2026-08-14: "right corners need to be
     rounded"). With overflow:auto on this element the scrollbar is painted in
     the element's own padding box, which squares off both right-hand corners
     however large the radius is. Clipping here and scrolling on a child keeps
     the corner. */
  overflow:hidden;
  backface-visibility:hidden;-webkit-backface-visibility:hidden}
.loft-backin{flex:1;min-height:0;overflow:auto;padding:12px;display:flex;flex-direction:column;
  border-radius:14px}
/* REPORT AN ISSUE, at the foot of every loft daily (owner, 2026-08-14). It used
   to live inside the games grid in the tail, which is gone, and it is the one
   thing down there worth keeping. Navy pill, white letters, on the stage under
   the board. */
.loft-report{margin-top:14px;display:flex;justify-content:center}
.loft-report .ri-wrap{width:auto}
.loft-report .ri-link{background:rgba(255,255,255,0.12);color:var(--white);border:1.5px solid rgba(255,255,255,0.45);
  border-radius:10px;padding:10px 18px;font-weight:800;font-size:12.5px;text-decoration:none;opacity:1}
.loft-report .ri-link:hover{background:rgba(255,255,255,0.22)}
.loft-report .ri-form,.loft-report .ri-sent{background:var(--white);border-radius:12px;padding:12px;margin-top:10px;text-align:left}
.loft-fiq .bi{flex:none;color:var(--blue);margin-right:2px}
.loft-back-btn{margin-left:auto;border:2px solid var(--border);background:var(--surface-alt);
  color:var(--slate);border-radius:9px;padding:7px 12px;font-family:inherit;font-weight:800;
  font-size:12.5px;cursor:pointer}
.loft-flip .loft-back{pointer-events:none}
.loft-flip.on .loft-back{pointer-events:auto}
.loft-flip.on .loft-face{pointer-events:none}
.loft-res{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;
  padding-bottom:9px;border-bottom:1px solid var(--border)}
.loft-res b{font-weight:800;font-size:17px;line-height:1}
/* The verdict, moved off the cap. A full-bleed tinted header with a solid left
   rule in the same colour, so the result is the first thing on the card. */
.loft-res-won,.loft-res-part,.loft-res-lost{margin:-12px -12px 10px;padding:12px;
  border-bottom:0;border-radius:14px 14px 0 0}
.loft-res-won{background:var(--success-deep);border-left:6px solid var(--success-deep)}
.loft-res.loft-res-won b,.loft-res.loft-res-won s{color:var(--white)}
.loft-res-part{background:var(--gold);border-left:6px solid var(--gold)}
.loft-res.loft-res-part b,.loft-res.loft-res-part s{color:#2a1f04}
.loft-res-lost{background:var(--danger);border-left:6px solid var(--danger)}
.loft-res.loft-res-lost b,.loft-res.loft-res-lost s{color:var(--white)}
.loft-res s{text-decoration:none;font-weight:700;font-size:11px;color:var(--slate)}
/* THE OPTIONS ARE A TWO-ACROSS GRID THAT GROWS (owner, 2026-08-14: "these
   buttons all need to be larger, and can split width if needed").
   They were a single stacked column of 11px-padded rows, which on a card sized
   to the BOARD left most of the card empty below them: the back takes its
   height from the front, so on a tall board the options used the top third and
   nothing used the rest. Two across halves the run of them and doubles the
   width each one gets, and flex:1 on the grid lets the rows stretch into the
   space that was empty, so the buttons get larger for free rather than by
   picking a bigger fixed height that would overflow a short card.
   The "wide" class spans both columns; LoftFinish sets it on the primary and
   on a trailing odd one, so the grid never ends on a half-width orphan.
   NO BACKTICKS IN THIS COMMENT: it is inside a template literal, so one closes
   the style block and breaks the build. */
.loft-opts{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11px;
  flex:1;min-height:0;align-content:stretch}
.loft-opt{display:flex;flex-direction:column;justify-content:center;text-align:left;
  min-height:64px;padding:13px 15px;
  border-radius:11px;border:2px solid var(--border);background:var(--white);color:var(--ink);
  font-family:inherit;font-weight:800;font-size:15.5px;line-height:1.15;cursor:pointer;text-decoration:none}
.loft-opt .sub{display:block;font-weight:600;font-size:11.5px;line-height:1.3;margin-top:5px;opacity:.72}
/* A LONG GAME NAME MUST NOT BLOW THE BUTTON OUT. "Play another Crux" is short,
   but the roster carries names well past it and these sit two to a row on a
   phone, so the label has to be allowed to wrap and to break inside a word if
   it ever has to. min-height rather than height means the button simply grows
   to whatever the name needs, and its partner in the row grows with it. */
.loft-opt{overflow-wrap:anywhere;word-break:normal}
.loft-opt .sub{overflow-wrap:anywhere}
.loft-opt.wide{grid-column:1 / -1}
.loft-opt.pri{background:var(--blue);border-color:var(--blue);color:var(--white)}
.loft-opt.gold{background:var(--gold);border-color:var(--gold);color:#3a2a05}
@media(max-width:400px){.loft-opts{grid-template-columns:1fr}.loft-opt{min-height:0}}

/* IQ earned, ON the card. It used to sit below the stage in .loft-iq, styled
   white-on-navy; the end card is the place a player looks for it, so it moves
   inside and takes light-card ink. Same gold rule, same figure. */
.loft-fiq{min-height:64px;box-sizing:border-box;
  display:flex;align-items:center;gap:13px;margin-top:11px;padding:11px 14px;
  background:var(--surface-alt);border-left:4px solid var(--gold);border-radius:0 10px 10px 0}
.loft-fiq .n{font-weight:800;font-size:29px;line-height:1;color:var(--ink);letter-spacing:-.02em}
.loft-fiq .t{min-width:0}
.loft-fiq .l{display:block;font-weight:800;font-size:9.5px;line-height:1;letter-spacing:.11em;
  text-transform:uppercase;color:var(--ink);margin-bottom:5px}
.loft-fiq .m{display:block;font-weight:700;font-size:11.5px;line-height:1.3;color:var(--slate)}
.loft-fiq .today{flex:none;margin-left:auto;padding-left:12px;text-align:right}
.loft-fiq .today b{display:block;font-weight:800;font-size:18px;line-height:1;color:var(--blue-deep)}
.loft-fiq .today i{display:block;font-style:normal;font-weight:700;font-size:9px;line-height:1;
  letter-spacing:.09em;text-transform:uppercase;color:var(--slate);margin-top:4px}

/* Today's board, top three plus you when you are outside it. */
/* Three rows plus the header and the Show-all bar. A board that comes back with
   fewer rows leaves the space rather than snapping the card shorter. */
.loft-lb{margin-top:11px;min-height:150px}
.loft-lb .h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:6px}
.loft-lb .h b{font-weight:800;font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted)}
.loft-lb .h s{text-decoration:none;font-weight:700;font-size:11px;color:var(--slate)}
.loft-lbr{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:8px;
  font-weight:700;font-size:13px;color:var(--ink)}
.loft-lbr+.loft-lbr{margin-top:3px}
.loft-lbr .r{flex:none;width:18px;font-weight:800;font-size:12px;color:var(--muted);
  font-variant-numeric:tabular-nums}
.loft-lbr .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.loft-lbr .s{flex:none;font-weight:800;font-variant-numeric:tabular-nums}
.loft-lbr .s i{font-style:normal;font-weight:700;color:var(--slate);margin-left:7px}
.loft-lbr.first{background:rgba(232,180,58,0.18)}
.loft-lbr.first .r{color:#8a6d1a}
.loft-lbr.me{background:var(--accent-soft)}
.loft-lbr.me .r{color:var(--blue)}
/* EXPANDED: the score keeps its own column and the game's own miss column and
   the clock join it. The miss column is labelled per game from the registry's
   "miss" field, because Guesses, Errors, Moves and Tries are not the same thing
   and one shared header would be wrong on most of them. */
.loft-lbr .c{flex:none;width:52px;text-align:right;font-weight:700;font-size:12px;
  color:var(--slate);font-variant-numeric:tabular-nums}
.loft-lbr.cols .s{width:44px;text-align:right}
.loft-lbr.head{font-weight:800;font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;
  color:var(--muted);padding-bottom:2px}
.loft-lbr.head .s,.loft-lbr.head .c{font-size:9.5px;color:var(--muted)}
.loft-more{width:100%;margin-top:6px;padding:8px;border-radius:8px;border:2px solid var(--border);
  background:var(--surface-alt);color:var(--slate);font-family:inherit;font-weight:800;
  font-size:12px;cursor:pointer}
.loft-empty{display:block;padding:8px 2px;font-weight:700;font-size:12.5px;color:var(--slate)}

/* The day, under the IQ tile: what the game paid, then where that leaves you. */
.loft-day{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.loft-day span{flex:1 1 22%;min-width:96px}
.loft-day span{min-height:52px;box-sizing:border-box;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  flex:1;padding:9px 10px;border-radius:10px;background:var(--surface-alt);
  font-weight:700;font-size:10.5px;line-height:1.2;color:var(--slate);text-align:center;
  overflow-wrap:anywhere}
/* One colour per figure, drawn from tokens already on this page: blue for the
   IQ the site scores you on, green for progress through the day, gold for a
   ranking (the same gold the leaderboard's first place uses) and ember for the
   streak. Tinted grounds with a matching ink, not four greys. */
@media(max-width:560px){
  .loft-day{flex-wrap:wrap;gap:6px}
  .loft-day span{flex:1 1 calc(50% - 3px);min-width:0;padding:8px 6px;font-size:9.5px}
  .loft-day span b{font-size:15px}
  .loft-fiq{gap:9px;padding:10px 11px}
  .loft-fiq .n{font-size:23px}
  .loft-fiq .m{font-size:10.5px}
  .loft-fiq .today b{font-size:15px}
}
.loft-day .d1{background:var(--accent-soft)}
.loft-day .d1 b{color:var(--blue-deep)}
.loft-day .d2{background:rgba(21,128,61,0.10)}
.loft-day .d2 b{color:var(--success-deep)}
.loft-day .d3{background:rgba(232,180,58,0.20)}
.loft-day .d3 b{color:#8a6d1a}
.loft-day .d4{background:rgba(217,119,6,0.12)}
.loft-day .d4 b{color:#b45309}
.loft-day b{display:block;font-weight:800;font-size:17px;line-height:1;color:var(--ink);margin-bottom:4px}

/* CALCULATING, never a blank or a zero. Every figure on this card comes from a
   read that races the player's own result write and retries for several
   seconds, so while it waits the honest thing to say is that it is being worked
   out. The dots animate so it reads as pending rather than stuck. */
.loft-calc{display:inline-flex;align-items:baseline;font-weight:800;font-size:13px;color:var(--muted);
  white-space:nowrap;max-width:100%;overflow:hidden}
/* The placeholder occupies the same line height as the figure it stands in for,
   so swapping one for the other moves nothing. */
.loft-day .loft-calc{font-size:17px;line-height:1}
.loft-day span b{display:block;line-height:1;white-space:nowrap}
/* The tile's own label cannot wrap either, or a two-word category name makes
   the row taller than the tiles beside it. */
.loft-day span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loft-fiq .loft-calc{font-size:18px;line-height:1}
.loft-calc.wide{display:flex;padding:10px 2px}
.loft-calc i{font-style:normal;animation:loftdot 1.4s infinite}
.loft-calc i:nth-child(2){animation-delay:.2s}
.loft-calc i:nth-child(3){animation-delay:.4s}
@keyframes loftdot{0%,60%,100%{opacity:.25}30%{opacity:1}}

/* The archive, opened IN the card. */
.loft-arch{margin-top:4px}
.loft-archr{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;
  text-decoration:none;color:var(--ink);font-weight:700;font-size:13px}
.loft-archr+.loft-archr{margin-top:3px}
.loft-archr:hover{background:var(--surface-alt)}
.loft-archr .d{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.loft-archr .no{flex:none;font-weight:700;font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.loft-archr .v{flex:none;min-width:44px;text-align:right;font-weight:800;font-size:12px;color:var(--blue)}
.loft-archr.done .v{color:var(--success-deep)}
.loft-opt.on{background:var(--surface-alt)}

/* NO INNER SCROLLER ON A PHONE (owner, 2026-08-14: "it should all fit on the
   card itself"). The back is absolutely positioned inside the flip so it
   inherits the FRONT's height, which is the board's, so its own content can
   never fit by construction: on a 390px screen it overran by a few pixels and
   on a game with a short board it would overrun badly. Below 760px the flip
   stops being a 3D turn and becomes a swap. The front leaves the flow, the back
   goes back into it, and the card is then as tall as whatever is on it. The
   turn animation is no loss here: on a phone the card fills the screen, so
   almost none of it was ever visible. */
/* NO SCROLLER, AT ANY WIDTH (owner, 2026-08-14, twice: "no scroller! make the
   box longer"). This was gated to phones, and desktop kept its inner scrollbar
   because the back is absolutely positioned inside the flip and so inherits the
   FRONT's height, which is the board's. Its own content can never fit by
   construction, whatever the screen. So the swap is universal now: the front
   leaves the flow, the back rejoins it, and the card is exactly as tall as the
   finish needs. The cost is the 3D turn, which is the right trade for never
   hiding half the card behind a scrollbar. */
.loft-flip{perspective:none}
.loft-flip.on .loft-flip-in{transform:none}
.loft-flip.on .loft-face{display:none}
.loft-back{position:relative;inset:auto;transform:none;overflow:visible}
.loft-flip:not(.on) .loft-back{margin-top:14px}
.loft-backin{overflow:visible}
@media(max-width:760px){
  .loft-day span{padding:7px 8px;font-size:9.5px}
  .loft-day b{font-size:15px;margin-bottom:3px}
  .loft-opt{min-height:52px;height:auto;padding:10px 11px;font-size:13.5px;line-height:1.2}
  .loft-opt .sub{font-size:10.5px;margin-top:3px}
}

/* THE FOUR SECONDARY OPTIONS LOOKED ALIKE. Reveal is filled blue and Share is
   filled gold, but Archive, Play another, Play similar and Replay were four
   identical outlined boxes. Each takes a tint and a coloured left rule: blue
   for another round of THIS game, green for a different game, slate for the
   unscored replay, ember for the archive. */
.loft-opt.t-another{background:var(--accent-soft);border-color:rgba(37,99,235,0.28);
  border-left:5px solid var(--blue)}
.loft-opt.t-similar{background:rgba(21,128,61,0.08);border-color:rgba(21,128,61,0.26);
  border-left:5px solid var(--success-deep)}
.loft-opt.t-replay{background:var(--surface-alt);border-color:var(--border);
  border-left:5px solid var(--slate)}
.loft-opt.t-main{background:var(--surface-alt);border-color:var(--border);
  border-left:5px solid var(--blue-deep)}
.loft-opt.t-reveal{background:rgba(109,40,217,0.08);border-color:rgba(109,40,217,0.26);
  border-left:5px solid #6d28d9}
/* THE CATEGORY BROWSER. Its own tone, slate, so it does not read as one of the
   coloured actions above it: it opens a panel rather than going anywhere. */
.loft-opt.t-browse{background:var(--surface-alt);border-color:var(--border);
  border-left:5px solid var(--muted)}
.loft-browse{grid-column:1 / -1;margin-top:2px}
.loft-cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.loft-cats button{font-family:inherit;font-weight:800;font-size:11.5px;cursor:pointer;
  padding:6px 10px;border-radius:999px;border:1.5px solid var(--border);
  background:var(--white);color:var(--slate);display:inline-flex;align-items:center;gap:6px}
.loft-cats button i{font-style:normal;font-weight:700;font-size:9.5px;color:var(--slate);
  background:var(--surface-alt);border-radius:999px;padding:1px 5px}
.loft-cats button.on{background:var(--blue);border-color:var(--blue);color:var(--white)}
.loft-cats button.on i{background:rgba(255,255,255,0.24);color:var(--white)}
/* Two across on a desktop card, one on a phone: a tagline needs the width more
   than the grid needs a third column. */
.loft-gtiles{display:grid;grid-template-columns:1fr 1fr;gap:7px}
@media(max-width:560px){.loft-gtiles{grid-template-columns:1fr}}
.loft-gtiles a{display:flex;align-items:center;gap:9px;text-decoration:none;
  border:1.5px solid var(--border);border-radius:10px;padding:8px 10px;background:var(--white);
  color:var(--ink);min-width:0}
.loft-gtiles a:hover{border-color:var(--blue);background:var(--accent-soft)}
.loft-gtiles img{flex:0 0 auto;width:30px;height:30px;border-radius:7px;object-fit:contain;display:block}
.loft-gtiles span{min-width:0;flex:1}
.loft-gtiles b{display:block;font-weight:800;font-size:13px;line-height:1.1;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.loft-gtiles i{display:block;font-style:normal;font-weight:600;font-size:10.5px;line-height:1.25;
  margin-top:2px;color:var(--slate);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* A game you have already finished today stays reachable, just quieter. */
.loft-gtiles a.played{background:var(--surface-alt);border-color:var(--border)}
.loft-gtiles a.played b,.loft-gtiles a.played i{color:var(--slate)}
.loft-gtiles em{flex:0 0 auto;font-style:normal;font-weight:800;font-size:9px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--success-deep)}
.loft-opt.t-archive{background:rgba(217,119,6,0.09);border-color:rgba(217,119,6,0.26);
  border-left:5px solid #b45309}

/* Played rows read as played, and a Sunday Edition is marked. */
.loft-archr .d{display:flex;align-items:center;gap:7px}
.loft-archr .sunchip{font-style:normal;font-weight:800;font-size:8.5px;letter-spacing:.09em;
  text-transform:uppercase;color:var(--gold-ink);background:var(--gold);border-radius:4px;padding:2px 5px}
.loft-archr.sun{background:rgba(232,180,58,0.10)}
.loft-archr .v em{font-style:normal;font-weight:800;font-size:10px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--success-deep);margin-left:6px}
.loft-archr .v b{font-weight:800;font-size:13px;color:var(--ink)}
.loft-archr.done{background:rgba(21,128,61,0.06)}
.loft-sheet{background:var(--white);border-radius:14px;padding:14px 16px 16px;
  box-shadow:0 10px 30px rgba(0,0,0,0.34)}
.loft-sheet .loft-card{box-shadow:none!important;background:transparent!important;
  border-radius:0!important}
@media(max-width:560px){.loft-sheet{padding:11px 11px 13px;border-radius:12px}}
.loft-prompt{font-family:inherit;font-weight:700;font-size:12px;line-height:1.3;color:var(--slate);
  text-align:center;padding:0 2px 10px;border-bottom:1px solid rgba(20,22,28,0.10);margin-bottom:12px}
.loft-showopts{width:100%;margin-top:10px;padding:11px;border-radius:10px;border:2px solid var(--border);
  background:var(--surface-alt);color:var(--muted);font-family:inherit;font-weight:800;font-size:13px;cursor:pointer}

/* Up next sits ABOVE the leaderboard: after a finish the strongest next move is
   the next puzzle, not the standings. */
.loft-next{display:flex;align-items:center;gap:11px;margin-top:10px;padding:11px 12px;
  background:rgba(232,180,58,0.16);border-left:4px solid var(--gold);border-radius:0 9px 9px 0;
  text-decoration:none}
.loft-next .t{flex:1;min-width:0}
.loft-next .n1{display:block;font-weight:800;font-size:15px;line-height:1;color:var(--white)}
.loft-next .n2{display:block;font-weight:600;font-size:11px;line-height:1.3;color:#e8c884;margin-top:4px}
.loft-next .go{flex:none;background:var(--gold);color:#3a2a05;border-radius:8px;padding:9px 14px;
  font-weight:800;font-size:12.5px;line-height:1}

/* The navy is the PLAY STAGE only, not the page. A navy page ground looked
   right on a long page and broke on a short one: in focus mode the content
   ends just under the board, so the light region below became a stripe with
   navy under it. The stage carries its own navy and the page stays light, so
   whatever is left at the bottom is simply page. */
      `}</style>
      <div className="lcap-id">
        <span className="lcap-eb">{eyebrow}</span>
        <span className="lcap-nm">{strip && strip.length ? 'All puzzles:' : name}{sunday
          ? (typeof sunday === 'string'
              ? <span className="lcap-sun">{sunday}</span>
              : <span className="lcap-sunnode">{sunday}</span>)
          : null}</span>
      </div>
      {onHelp && !outcome ? (
        <button className="lcap-help" onClick={onHelp} aria-label="How to play">?</button>
      ) : null}
      {strip && strip.length ? (
        <div className="lcap-azwrap at-start">
        <button type="button" className="lcap-azbtn prev" aria-label="Scroll back"
          onClick={() => azNudge(-1)}>&#8249;</button>
        <button type="button" className="lcap-azbtn next" aria-label="Scroll on"
          onClick={() => azNudge(1)}>&#8250;</button>
        <div className="lcap-tiles az" ref={azRef}>
          {strip.map((t) => (
            <a key={t.key} href={t.href} className={played[t.key] ? 'done' : undefined}>{t.name}</a>
          ))}
        </div>
        </div>
      ) : null}
      {!(tiles && tiles.length) && figures.length ? (
        <div className="lcap-figs">
          {figures.map((f, i) => (
            <div key={i}>
              <span className="lcap-v">{f.v}</span>
              <span className="lcap-k">{f.k}</span>
            </div>
          ))}
        </div>
      ) : null}
      {extra}
      </div>
      {progress != null ? (
        <div className="lcap-bar"><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
      ) : null}
    </div>
  );
}
