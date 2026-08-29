"use client";

// GauntletPop — the once-a-day nudge to play the Trivia Gauntlet (owner,
// 2026-08-29).
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
//
// It owns no copy of its own beyond the headline: the line under it is the
// circuit's own share invite out of lib/circuits, so a rename or a reworded
// invite reaches this pop-up with no edit here.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { circuitById, circuitName, runHref } from '@/lib/circuits';

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

  if (!open) return null;

  const circuit = circuitById(ID);
  const name = circuitName(ID);
  const invite = (circuit && circuit.share && circuit.share.invite) || '';
  const n = (circuit && Array.isArray(circuit.keys) && circuit.keys.length) || 5;

  return (
    <div className="gnp-bd" role="dialog" aria-modal="true" aria-labelledby="gnp-h" onClick={close}>
      <style>{CSS}</style>
      <div className="gnp" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="gnp-x" onClick={close} aria-label="Close">
          <X size={15} strokeWidth={2.6} />
        </button>
        <span className="gnp-e">{n} games &middot; one run</span>
        <h2 className="gnp-h" id="gnp-h">Play the {name}</h2>
        <p className="gnp-p">{invite}</p>
        <div className="gnp-acts">
          <a className="gnp-go" href={runHref(ID)}>
            Start the run
            <ArrowRight size={15} strokeWidth={2.6} />
          </a>
          <button type="button" className="gnp-no" onClick={close}>Not now</button>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.gnp-bd{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;
        padding:20px;background:rgba(5,12,28,.62);backdrop-filter:blur(2px);
        animation:gnpfade .18s ease-out;}
.gnp{position:relative;width:100%;max-width:430px;background:var(--ground,#14264f);color:#fff;
     border-radius:15px;padding:24px 26px 22px;overflow:hidden;
     font-family:'Manrope',system-ui,-apple-system,sans-serif;
     box-shadow:0 22px 60px rgba(0,0,0,.45);animation:gnprise .2s ease-out;}
.gnp::before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--blue,#2563eb);}
.gnp-x{position:absolute;top:11px;right:11px;background:transparent;border:none;color:#9fb6e8;
       cursor:pointer;padding:5px;line-height:0;border-radius:7px;}
.gnp-x:hover{color:#fff;background:#1b2b52;}
.gnp-e{display:block;font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#9fc2ff;}
.gnp-h{font-size:25px;font-weight:800;letter-spacing:-.6px;line-height:1.1;margin:5px 0 0;}
.gnp-p{font-size:13.5px;font-weight:600;color:#c3d5f5;line-height:1.5;margin:9px 0 0;}
.gnp-acts{display:flex;gap:9px;margin-top:17px;flex-wrap:wrap;align-items:center;}
.gnp-go{display:inline-flex;align-items:center;gap:8px;background:var(--cta,#2563eb);color:#fff;
        border:none;border-radius:10px;padding:12px 18px;font-size:13px;font-weight:800;
        letter-spacing:.03em;text-decoration:none;cursor:pointer;}
.gnp-go:hover{filter:brightness(1.08);}
.gnp-no{background:transparent;border:1.5px solid #253357;color:#c3d5f5;border-radius:10px;
        padding:12px 16px;font-size:13px;font-weight:800;letter-spacing:.03em;cursor:pointer;
        font-family:inherit;}
.gnp-no:hover{background:#101c39;color:#fff;}
@keyframes gnpfade{from{opacity:0}to{opacity:1}}
@keyframes gnprise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@media(max-width:520px){
  .gnp{padding:21px 20px 19px;}
  .gnp-h{font-size:22px;}
  .gnp-acts{flex-direction:column;align-items:stretch;}
  .gnp-go,.gnp-no{justify-content:center;text-align:center;}
}
@media(prefers-reduced-motion:reduce){
  .gnp-bd,.gnp{animation:none;}
}
`;
