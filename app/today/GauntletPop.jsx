"use client";

// GauntletPop — the once-a-day nudge to play the Trivia Gauntlet (owner,
// 2026-08-29; SIMPLIFIED 2026-08-30).
//
// IT IS THE ONLY POP-UP LEFT ON THE SITE. The contest interstitial, its QR
// poster follow-on, the share sheet and the homepage install card all came off
// on 2026-08-30, so this is the one thing that appears without being asked
// for. That is the reason it says so little: three things only, the name of the
// circuit, what is in it, and a way to start it. Anything else here is a fourth
// thing an uninvited box is asking a reader to deal with.
//
// IT WEARS THE GAUNTLET PAGE'S CLOTHES, not its own. /circuits/gauntlet is a
// navy card with a blue left rule over a column of white rows, each carrying
// its game's colour as a rule and reading as a category. This is that, at
// pop-up size, so arriving on the page after pressing Play is not a change of
// scene. The rows come out of circuitGamesFor, which is the same accessor the
// page itself uses, so a roster change or a recoloured game reaches this
// pop-up with no edit here.
//
// THREE CONDITIONS, all of them required, and the reason for each:
//
//   READY. The prompt waits for the day's combined board, which is the
//   SERVER's word on what this player has already played. Acting on this
//   device's breadcrumbs alone would nudge somebody who ran the Gauntlet on
//   their phone an hour ago. A short delay on top of that lets the three play
//   passes in TodayClient settle before anything is decided.
//
//   UNPLAYED. Not a single game of the circuit finished today. Somebody who
//   is three games in does not need to be told to start.
//
//   FIRST VISIT OF THE DAY. Stamped in localStorage under the ET date the
//   moment it is shown, so a reload, a second tab, or coming back after
//   dinner is silent. It is per device and per browser by nature, which is the
//   right grain for something whose whole job is to not become wallpaper.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { circuitGamesFor, circuitName, runHref } from '@/lib/circuits';

const STORE = 'sot_gauntlet_nudge';
const ID = 'gauntlet';
const WAIT_MS = 1500;

export default function GauntletPop({ ready = false, unplayed = false, day = '' }) {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);
  // The timer fires later than it was set, so it must read the CURRENT props
  // rather than the ones it closed over: `unplayed` flips as the passes land.
  const live = useRef({ unplayed, day });
  live.current = { unplayed, day };

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!ready || !day || fired.current) return undefined;
    const t = setTimeout(() => {
      const now = live.current;
      if (fired.current || !now.unplayed || !now.day) return;
      // A browser that refuses storage (private mode, blocked cookies) gets
      // the prompt once per page load rather than never: the read failing is
      // not evidence it has been seen.
      try { if (localStorage.getItem(STORE) === now.day) return; } catch (e) {}
      try { localStorage.setItem(STORE, now.day); } catch (e) {}
      fired.current = true;
      setOpen(true);
    }, WAIT_MS);
    return () => clearTimeout(t);
  }, [ready, day]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Today's roster, in today's run order, through the same accessor the landing
  // page uses. Keyed on `day` rather than read at module scope because the
  // circuit shuffles its middle daily and the ET date is a prop here.
  const games = useMemo(() => (day ? circuitGamesFor(ID, day) : []), [day]);

  if (!open) return null;

  const name = circuitName(ID);

  return (
    <div className="gnp-bd" role="dialog" aria-modal="true" aria-labelledby="gnp-h" onClick={close}>
      <style>{CSS}</style>
      <div className="gnp" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="gnp-x" onClick={close} aria-label="Close">
          <X size={15} strokeWidth={2.6} />
        </button>
        <h2 className="gnp-h" id="gnp-h">Daily {name}</h2>

        <ul className="gnp-list">
          {games.map((g) => (
            <li
              key={g.key}
              className="gnp-row"
              style={{ '--cc': g.colorNavy || g.color || '#c9d2e0' }}
            >
              {g.subject || g.cat}
            </li>
          ))}
        </ul>

        <a className="gnp-go" href={runHref(ID)}>
          Play
          <ArrowRight size={15} strokeWidth={2.6} />
        </a>
      </div>
    </div>
  );
}

const CSS = `
.gnp-bd{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;
        padding:20px;background:rgba(5,12,28,.62);backdrop-filter:blur(2px);
        animation:gnpfade .18s ease-out;}
.gnp{position:relative;width:100%;max-width:380px;max-height:calc(100vh - 40px);overflow-y:auto;
     background:var(--ground,#14264f);color:#fff;border-radius:15px;padding:22px 24px 22px 26px;
     font-family:'Manrope',system-ui,-apple-system,sans-serif;
     box-shadow:0 22px 60px rgba(0,0,0,.45);animation:gnprise .2s ease-out;}
.gnp::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--blue,#2563eb);
             border-radius:15px 0 0 15px;}
.gnp-x{position:absolute;top:11px;right:11px;background:transparent;border:none;color:#9fb6e8;
       cursor:pointer;padding:5px;line-height:0;border-radius:7px;}
.gnp-x:hover{color:#fff;background:#1b2b52;}
.gnp-h{font-size:24px;font-weight:800;letter-spacing:-.6px;line-height:1.1;margin:0 30px 0 0;}
.gnp-list{list-style:none;margin:15px 0 0;padding:0;display:flex;flex-direction:column;gap:6px;}
/* The landing page's row, at pop-up size: white card, its game's colour as a
   4px rule down the left. The rule is a ::before rather than a border-left so
   it squares off inside the radius instead of curving into it. */
.gnp-row{position:relative;background:var(--white,#fff);color:var(--ink,#0f172a);
         border-radius:9px;padding:10px 13px 10px 17px;overflow:hidden;
         font-size:14px;font-weight:800;letter-spacing:-.2px;}
.gnp-row::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--cc,#c9d2e0);}
.gnp-go{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;
        background:var(--cta,#2563eb);color:#fff;border:none;border-radius:10px;padding:13px 18px;
        font-size:14px;font-weight:800;letter-spacing:.03em;text-decoration:none;cursor:pointer;}
.gnp-go:hover{filter:brightness(1.08);}
@keyframes gnpfade{from{opacity:0}to{opacity:1}}
@keyframes gnprise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(max-width:520px){
  .gnp{padding:20px 18px 20px 21px;}
  .gnp-h{font-size:21px;}
}
@media(prefers-reduced-motion:reduce){
  .gnp-bd,.gnp{animation:none;}
}
`;
