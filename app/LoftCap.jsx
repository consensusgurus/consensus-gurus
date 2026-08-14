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
import React from 'react';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

export default function LoftCap({
  name,
  outcome = null,     // null while playing, then 'won' | 'part' | 'lost'
  cat = '',
  num = null,
  dateLabel = '',
  figures = [],
  onHelp = null,
  sunday = null,
  progress = null,   // 0-100, draws the hairline at the foot of the cap
  extra = null,      // an optional third tier (Anon's spine, for instance)
}) {
  const eyebrow = [cat, num != null ? `No. ${num}` : null, dateLabel]
    .filter(Boolean).join(' · ');
  return (
    <div className={outcome ? `lcap lcap-${outcome}` : 'lcap'}>
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
.lcap-won{background:var(--success-deep)}
.lcap-won .lcap-eb,.lcap-won .lcap-k{color:#b9f0d0}
.lcap-lost{background:var(--danger)}
.lcap-lost .lcap-eb,.lcap-lost .lcap-k{color:#f6cfc9}
/* An intermediate result is neither: amber. It uses the DEEP gold rather than
   the flat one, because the cap's text is white and white on var(--gold) is
   unreadable. */
.lcap-part{background:var(--gold-ink)}
.lcap-part .lcap-eb,.lcap-part .lcap-k{color:#ffe9a8}
.lcap-id{flex:1;min-width:0;padding:8px 12px}
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
   sheet below supply their own spacing. */
.loft-page .cx-wrap{padding-top:0!important;padding-bottom:0!important}
/* The end state lives INSIDE the stage, under the solved board, so the finish
   is one dark block and the light tail below is unchanged from playing. */
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
.loft-face{backface-visibility:hidden;-webkit-backface-visibility:hidden}
.loft-back{position:absolute;inset:0 0 12px 0;transform:rotateY(180deg);background:var(--white);
  border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,0.34);padding:12px;overflow:auto;
  display:flex;flex-direction:column;color:var(--ink)}
.loft-res{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;
  padding-bottom:9px;border-bottom:1px solid var(--border)}
.loft-res b{font-weight:800;font-size:17px;line-height:1}
.loft-res s{text-decoration:none;font-weight:700;font-size:11px;color:var(--slate)}
.loft-opt{display:block;width:100%;text-align:left;margin-bottom:7px;padding:11px 12px;
  border-radius:10px;border:2px solid var(--border);background:var(--white);color:var(--ink);
  font-family:inherit;font-weight:800;font-size:14px;line-height:1;cursor:pointer;text-decoration:none}
.loft-opt .sub{display:block;font-weight:600;font-size:11px;line-height:1.3;margin-top:4px;opacity:.72}
.loft-opt.pri{background:var(--blue);border-color:var(--blue);color:var(--white)}
.loft-opt.gold{background:var(--gold);border-color:var(--gold);color:#3a2a05}
.loft-opt:last-child{margin-bottom:0}
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
        <span className="lcap-nm">{name}{sunday
          ? (typeof sunday === 'string'
              ? <span className="lcap-sun">{sunday}</span>
              : <span className="lcap-sunnode">{sunday}</span>)
          : null}</span>
      </div>
      {onHelp ? (
        <button className="lcap-help" onClick={onHelp} aria-label="How to play">?</button>
      ) : null}
      {figures.length ? (
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
