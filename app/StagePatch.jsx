'use client';

// THE PATCH: a loading cover for ONE cell that is waiting on a read, and
// nothing else on the page (owner, 2026-09-01: "maybe another animation to
// cover that part of the page only").
//
// The home is fed by four requests with very different clocks (daily-status
// 130ms warm, totals ~300ms, daily-combined 3 to 4s cold), and every figure
// on it renders only once its own read has answered. So the page used to
// paint with holes where the numbers would be, then snap or fade them in one
// section at a time. A full-screen cover over all of that is the wrong size:
// it holds the rank box hostage to the board. This covers exactly the cell
// that is waiting, with the ten-rung loop of the category ramp running along
// its foot, and it leaves on ITS OWN read by the same clip collapse the
// endings use, so the figure lands behind it. The fast cells fill fast and
// only the slow one is still visibly loading, which is the truth of it.
//
// THREE RULES, all measured against the doorway:
//   * THE FLOOR. Nothing mounts unless the cell is still waiting FLOOR ms after
//     the patch itself mounts. A warm read answers inside it, and covering a
//     cell for 130ms is a flash, not a loading state.
//   * THE MINIMUM. Once shown it stays at least MIN ms, so a read that lands
//     one frame after the floor does not blink it.
//   * IT NEVER WAITS ON A RAF. The loop is a CSS animation and the exit is a
//     timer, so a hidden tab (which runs no frames) still unmounts it.
//
// It carries NO stylesheet of its own: a page mounts several, so the CSS is
// exported once (PATCH_CSS) and the page interpolates it into its own <style>.
// The cover is the DARK ground in both registers, deliberately: on the pale
// home it is the same door the once-a-day arrival draws, at the size of one
// cell, and a reader who saw the Ramp at breakfast recognises it at lunch.
//
// Usage: a positioned parent, then <StagePatch on={stillWaiting} />.

import { useEffect, useRef, useState } from 'react';
import { CATEGORY_RAMP } from '@/lib/category-ramp';

const FLOOR = 260;   // the doorway's warm-cache floor
const MIN = 400;     // the least a shown patch may stay
const LEAVE = 520;   // the collapse, then unmount

export default function StagePatch({ on, radius = 6 }) {
  // 'wait' -> 'on' -> 'leaving' -> 'gone'. Starts waiting even when `on` is
  // already false, because a cell that answered before the patch mounted has
  // nothing to cover and must render nothing, not a collapse.
  const [state, setState] = useState(on ? 'wait' : 'gone');
  const shownAt = useRef(0);
  const timers = useRef([]);
  const at = (ms, fn) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  useEffect(() => {
    if (on) {
      if (state === 'gone' || state === 'leaving') return undefined;
      if (state !== 'wait') return undefined;
      const t = setTimeout(() => { shownAt.current = Date.now(); setState('on'); }, FLOOR);
      return () => clearTimeout(t);
    }
    // The read answered.
    if (state === 'wait') { setState('gone'); return undefined; }
    if (state === 'on') {
      const left = Math.max(0, MIN - (Date.now() - shownAt.current));
      const t = setTimeout(() => {
        setState('leaving');
        at(LEAVE, () => setState('gone'));
      }, left);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, state]);

  if (state === 'gone' || state === 'wait') return null;
  return (
    <span
      className={'stg-patch' + (state === 'leaving' ? ' out' : '')}
      style={{ borderRadius: radius }}
      aria-hidden="true"
    >
      {CATEGORY_RAMP.map((c, i) => (
        <i key={c} style={{ background: c, animationDelay: `${i * 0.1}s` }} />
      ))}
    </span>
  );
}

export const PATCH_CSS = `
.stg-patch{position:absolute;inset:0;z-index:3;background:#0b0f1a;overflow:hidden;
  display:flex;align-items:flex-end;gap:2px;pointer-events:none;
  -webkit-clip-path:inset(0 0 0 0);clip-path:inset(0 0 0 0);}
.stg-patch i{flex:1;height:4px;opacity:.18;animation:stg-rung 1.2s linear infinite;}
/* THE EXIT IS A CLIP, NOT A FADE: it shrinks to a hairline at the cell's foot, the
   same move the endings make onto the cap, so the figure appears from behind it
   rather than through it. */
.stg-patch.out{-webkit-clip-path:inset(100% 0 0 0);clip-path:inset(100% 0 0 0);
  transition:clip-path ${LEAVE - 40}ms cubic-bezier(.4,0,.2,1),-webkit-clip-path ${LEAVE - 40}ms cubic-bezier(.4,0,.2,1);}
@keyframes stg-rung{0%{opacity:.18}12%{opacity:1}45%{opacity:.18}100%{opacity:.18}}
@media (prefers-reduced-motion: reduce){
  .stg-patch i{animation:none;opacity:.5;}
  .stg-patch.out{transition:none;}
}
`;
