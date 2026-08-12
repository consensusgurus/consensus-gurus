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
    <div className="lcap">
      <style>{`
.lcap{background:var(--blue);border-left:4px solid var(--gold);display:flex;
  flex-wrap:wrap;align-items:center;position:relative;font-family:${SANS};z-index:4}
.lcap-id{flex:1;min-width:0;padding:8px 12px}
.lcap-eb{display:block;font-weight:800;font-size:11.5px;line-height:1;letter-spacing:.13em;
  text-transform:uppercase;color:var(--blue-200);margin-bottom:4px}
.lcap-nm{display:block;font-weight:800;font-size:22px;line-height:1;letter-spacing:-.022em;color:var(--white)}
.lcap-sun{display:inline-block;margin-left:8px;font-weight:800;font-size:9px;line-height:1;
  letter-spacing:.11em;text-transform:uppercase;color:var(--gold-ink);background:var(--gold);
  border-radius:4px;padding:3px 6px;vertical-align:middle}
.lcap-help{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,0.18);
  display:grid;place-items:center;font-weight:800;font-size:15px;color:var(--white);
  border:0;cursor:pointer;margin-right:12px;flex:none;font-family:inherit}
.lcap-figs{display:flex;border-top:1px solid rgba(255,255,255,0.22);flex:0 0 100%}
.lcap-figs>div{flex:1;padding:6px 6px 8px;text-align:center;border-right:1px solid rgba(255,255,255,0.22)}
.lcap-figs>div:last-child{border-right:0}
.lcap-v{display:block;font-weight:800;font-size:15px;line-height:1;color:var(--white)}
.lcap-k{display:block;font-weight:700;font-size:8.5px;line-height:1;letter-spacing:.1em;
  text-transform:uppercase;color:var(--blue-200);margin-top:4px}
.lcap-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,0.18)}
.lcap-bar i{display:block;height:100%;background:var(--gold);transition:width .2s}
@media(min-width:900px){
  /* ALIGN TO THE HOME PAGE. The site header and the home rails both sit in a
     1560px column with 34px padding, so their content begins 207px in at a
     1905px viewport. The cap is a full-bleed band like the header, but its
     CONTENT is inset to that same column so the wordmark and the game name
     share one left edge. The subtractions are the pieces that already inset
     the first and last child: 4px gold border + 12px .lcap-id padding on the
     left, and .lcap-help's 12px margin on the right. */
  .lcap{padding-left:max(8px, calc((100% - 1560px) / 2 + 18px));
        padding-right:max(8px, calc((100% - 1560px) / 2 + 22px))}
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
/* The navy is the PLAY STAGE only, not the page. A navy page ground looked
   right on a long page and broke on a short one: in focus mode the content
   ends just under the board, so the light region below became a stripe with
   navy under it. The stage carries its own navy and the page stays light, so
   whatever is left at the bottom is simply page. */
      `}</style>
      <div className="lcap-id">
        <span className="lcap-eb">{eyebrow}</span>
        <span className="lcap-nm">{name}{sunday ? <span className="lcap-sun">{sunday}</span> : null}</span>
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
      {progress != null ? (
        <div className="lcap-bar"><i style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
      ) : null}
    </div>
  );
}
