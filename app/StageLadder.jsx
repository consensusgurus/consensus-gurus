'use client';

// THE LADDER, generalised off the Gauntlet run.
//
// It is not a chart of trivia questions. It is a drawing of A COUNTABLE THING
// YOU GET THROUGH, IN NAMED BLOCKS, which is what almost every daily on the
// roster is. Only the unit changes: a question per bank on the run, a word per
// category on Crux, a free cell per box on a sudoku, a ply per move on an End
// Game title.
//
// THREE LAYERS, the same three the run draws:
//   1. YOURS      a rung is lit when you have it.
//   2. THEIRS     an unlit rung is brightened by `field`, the share of today's
//                 finishers who had it at this point. Pass no field and every
//                 unlit rung is the same dim, which is the honest rendering
//                 when there is no field to draw. NEVER invent one.
//   3. the handover, which is the finish card's business, not this file's.
//
// A FIXED RUNG SIZE IS THE THING THAT BREAKS THIS. 180 rungs at 4px is 720px
// of fixed track and it overflowed the page under 900px on the run. Rungs FLEX:
// a block takes flex weight equal to its count, so the ladder is exactly its
// container at any length. The tier is the OTHER axis, height when the ladder
// lies down and width when it stands in a gutter, so it never fights the fit.
//
// Under 640px the gap between rungs goes to zero. Measured on the run at 390px:
// with a 1px gap the rungs came out 1.63px and the block read as noise rather
// than as one shape.
import React from 'react';

// An unlit rung, by ground. White at 10% is the right dim on near-black and
// is simply not there on a pale surface, which is what the home is.
// On a stage this follows the register through the lift channel; the
// fallback is what every surface off the stage gets, and the home overrides
// it explicitly because it has no channel to read.
const DIM = 'var(--stg-line,rgba(255,255,255,0.11))';
const DIM_LIGHT = 'rgba(11,15,26,0.11)';

// THE FIELD LAYER IS A GRADIENT, so it is the one thing that genuinely needs a
// channel rather than a role token: its alpha varies per rung by how much of
// today's field got that far. It reads --stg-fieldink, which each register sets
// once, and keeps its own alpha ramp.
function fieldInk(v, light) {
  const f = Math.max(0, Math.min(1, Number(v) || 0));
  return light
    ? 'rgba(11,15,26,' + (0.07 + 0.14 * f).toFixed(3) + ')'
    : 'rgba(var(--stg-fieldink,255,255,255),' + (0.07 + 0.16 * f).toFixed(3) + ')';
}

export default function StageLadder({
  blocks = [],
  light = false,
  vertical = false,
  height = null,
  className = '',
  label = null,
}) {
  const cls = 'stl' + (vertical ? ' v' : '') + (className ? ' ' + className : '');
  return (
    <div className={vertical ? 'stl-wrap v' : 'stl-wrap'}>
      <style>{CSS}</style>
      {label ? <div className="stl-l">{label}</div> : null}
      <div className={cls} style={height ? { height } : undefined} aria-hidden="true">
        {blocks.map((b, bi) => (
          <div className="stl-b" key={bi} style={{ flex: (b.n || 0) + ' 1 0' }}>
            {Array.from({ length: b.n || 0 }, (_, i) => {
              const lit = b.on ? !!b.on[i] : i < (b.lit || 0);
              const half = !lit && b.half ? !!b.half[i] : false;
              const tier = b.w && b.w[i] != null ? Math.max(0.12, Math.min(1, b.w[i])) : 1;
              const size = Math.round(tier * 100) + '%';
              const style = vertical ? { width: size } : { height: size };
              if (lit) style.background = b.c;
              else if (half) {
                style.background = 'linear-gradient(' + (vertical ? '90deg' : '0deg')
                  + ',' + b.c + ' 50%,' + (light ? DIM_LIGHT : DIM) + ' 50%)';
              } else {
                style.background = b.field ? fieldInk(b.field[i], light) : (light ? DIM_LIGHT : DIM);
              }
              // AN UNLIT RUNG IS A TICK, NOT A BLOCK. In the vertical gutter
              // each rung spans the full column, so eight unplayed ones stack
              // into a grey slab down the side of the board (owner, 2026-08-31:
              // "grey panels on the sides"). Lit and half-lit rungs keep the
              // full width, because those carry the progress; only the empties
              // shrink to a stub, and the graphic stops competing with the
              // board it is meant to annotate.
              const off = !lit && !half && !(b.field && b.field[i]);
              return <span className={off ? 'stl-r off' : 'stl-r'} key={i} style={style} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.stl-wrap{display:flex;flex-direction:column;gap:9px;min-width:0;}
.stl-wrap.v{height:100%;}
.stl-l{font-family:'DM Mono',ui-monospace,monospace;font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--stg-mute2,#66748f);}
.stl{display:flex;align-items:flex-end;gap:5px;width:100%;}
.stl-b{display:flex;align-items:flex-end;gap:1px;min-width:0;height:100%;}
.stl-r{flex:1 1 0;min-width:1px;min-height:2px;border-radius:1px;background:var(--stg-line,rgba(255,255,255,0.11));}
.stl.v{flex-direction:column;align-items:stretch;height:100%;gap:5px;}
.stl.v .stl-b{flex-direction:column;align-items:stretch;height:auto;width:100%;}
.stl.v .stl-r{width:100%;}
/* Only in the VERTICAL gutter: horizontally the ladder is a wide strip and its
   empties already read as a baseline rather than a panel. */
.stl.v .stl-r.off{width:30%;}
.stl-wrap.v .stl{flex:1 1 auto;}
@media(max-width:640px){
  .stl-b{gap:0;}
  .stl-wrap.v{height:auto;}
  .stl-wrap.v .stl{flex-direction:row;align-items:flex-end;height:16px;}
  .stl-wrap.v .stl-b{flex-direction:row;align-items:flex-end;height:100%;width:auto;}
  .stl-wrap.v .stl-r{width:auto;height:100%;}
}
`;
