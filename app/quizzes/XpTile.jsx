'use client';

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';

// Top SoT Player tile on /quizzes. Took the Featured Sports slot in row 2 on
// 2026-07-20 (the Newest tile was retired and Geo + Sports each shifted left).
//
// Same shape and behaviour as CommunityTile next to it, different board: this
// one ranks by XP earned in the LAST 30 DAYS rather than all-time. The window
// is the point of the tile: an all-time board freezes after a few months and
// stops being something a new player can win, whereas a rolling 30 days is
// always in play. /api/quiz/xp?sort=xp30d does the ranking server side.
//
// The hover panel explains the XP system itself, because the tile is the only
// place on the hub that says out loud what XP is and how to earn it.

const C = { accent: '#0e1d40', cta: '#e8b43a', gold: '#ffd166' };
// Gold / silver / bronze, matching the medal palette used on the ranking pages.
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];

// The leader's name is the tile's headline, so it is set as large as will fit
// rather than at a fixed size. Same binary-search fitter as CommunityTile.
const NAME_MIN = 17;
const NAME_MAX = 42;
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useFittedName(text) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const el = textRef.current;
    if (!wrap || !el || !text) return;
    const avail = wrap.clientWidth;
    if (!avail) return;
    let lo = NAME_MIN;
    let hi = NAME_MAX;
    let best = NAME_MIN;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      el.style.fontSize = `${mid}px`;
      // +1 absorbs sub-pixel rounding, which otherwise costs a whole step.
      if (el.scrollWidth <= avail + 1) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    el.style.fontSize = `${best}px`;
  }, [text]);

  useIsoLayoutEffect(() => {
    fit();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fit]);

  // Webfonts land after first paint and change the metrics, so refit once ready.
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts?.ready) return;
    document.fonts.ready.then(fit).catch(() => {});
  }, [fit]);

  return { wrapRef, textRef };
}

const num = (n) => Number(n || 0).toLocaleString();

export default function XpTile() {
  const [top, setTop] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dead = false;
    fetch('/api/quiz/xp?sort=xp30d')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (dead || !d || !Array.isArray(d.players)) return;
        // Anyone on zero for the window is not a leader, they are just first in
        // the fallback all-time tiebreak, so drop them before picking a podium.
        setTop(d.players.filter((p) => (p.xp30d || 0) > 0).slice(0, 3));
      })
      .catch(() => { /* tile falls back to its empty state */ });
    return () => { dead = true; };
  }, []);

  const leader = top && top[0] ? top[0] : null;
  const { wrapRef, textRef } = useFittedName(leader?.name || '');

  return (
    <div
      className={`ttile xptile${open ? ' xp-open' : ''}`}
      onClick={() => setOpen((v) => !v)}
      onMouseLeave={() => setOpen(false)}
    >
      <style>{`
        /* Electric-blue ground, so it reads as the XP slot and stays distinct
           from the bronze Community tile it sits in a row with. */
        .xptile{background:radial-gradient(135% 105% at 24% 36%, rgba(91,139,255,.34) 0%, rgba(91,139,255,.08) 46%, rgba(0,0,0,0) 74%), linear-gradient(155deg,#132a5c 0%,#0e1d40 58%,#080f23 100%);cursor:pointer;}
        .xptile .xp-tag{position:absolute;top:12px;left:12px;font-size:10px;font-weight:800;letter-spacing:.08em;background:#fff;border-radius:10px;padding:4px 10px;z-index:3;color:#0e1d40;display:inline-flex;align-items:center;gap:4px;}
        .xptile .xp-body{position:relative;z-index:1;padding:18px 16px 15px;}
        .xptile .xp-namewrap{width:100%;}
        /* Auto-fitted: font-size is set inline by useFittedName. */
        .xptile .xp-who{display:block;white-space:nowrap;font-size:${NAME_MAX}px;font-weight:800;letter-spacing:-1.1px;line-height:1.02;color:#a9c6ff;text-shadow:0 2px 18px rgba(0,0,0,.55);}
        .xptile .xp-sub{font-size:12px;font-weight:600;color:rgba(214,228,255,.74);margin-top:5px;}
        .xptile .xp-podium{margin-top:9px;display:flex;flex-direction:column;gap:3px;border-top:1px solid rgba(139,178,255,.18);padding-top:7px;}
        .xptile .xp-prow{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.25;min-width:0;}
        .xptile .xp-medal{flex:none;width:14px;height:14px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#12172a;}
        .xptile .xp-pname{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;color:rgba(255,255,255,.82);}
        .xptile .xp-pname.xp-vacant{color:rgba(255,255,255,.34);font-weight:600;font-style:italic;}
        .xptile .xp-pn{flex:none;font-weight:800;color:rgba(214,228,255,.66);font-variant-numeric:tabular-nums;}
        .xptile .xp-foot{display:flex;align-items:center;gap:6px;margin-top:9px;font-size:12px;font-weight:800;color:rgba(255,255,255,.9);}
        .xptile .xp-panel{position:absolute;inset:0;z-index:4;background:rgba(8,15,35,.975);padding:13px 14px;display:flex;flex-direction:column;gap:5px;opacity:0;pointer-events:none;transition:opacity .16s ease;overflow:auto;}
        .xptile:hover .xp-panel,.xptile:focus-within .xp-panel,.xptile.xp-open .xp-panel{opacity:1;pointer-events:auto;}
        .xptile .xp-h{font-size:12px;font-weight:800;letter-spacing:.07em;color:${C.cta};text-transform:uppercase;}
        .xptile .xp-why{font-size:12px;line-height:1.34;font-weight:700;color:${C.gold};}
        .xptile .xp-p{font-size:12px;line-height:1.38;color:rgba(255,255,255,.86);}
        .xptile .xp-cta{display:inline-flex;align-items:center;gap:6px;margin-top:auto;align-self:flex-start;font-size:12.5px;font-weight:800;color:#0e1d40;background:${C.cta};border-radius:8px;padding:8px 11px;text-decoration:none;}
      `}</style>

      <span className="xp-tag"><Zap size={11} style={{ verticalAlign: -1, color: '#5b8bff' }} fill="#5b8bff" /> TOP SOT PLAYER</span>

      <div className="xp-body">
        {leader ? (
          <>
            <div className="xp-namewrap" ref={wrapRef}>
              <span className="xp-who" ref={textRef}>{leader.name}</span>
            </div>
            <div className="xp-sub">{num(leader.xp30d)} XP earned over the last 30 days</div>
            {/* Runners-up, so the tile reads as a podium rather than a single
                name. Empty places render as "Open" on purpose: it shows the
                spot is contested and reachable instead of hiding that it is free. */}
            <div className="xp-podium">
              {[1, 2].map((i) => {
                const r = top && top[i] ? top[i] : null;
                return (
                  <div className="xp-prow" key={i}>
                    <span className="xp-medal" style={{ background: MEDAL[i] }}>{i + 1}</span>
                    {r ? (
                      <>
                        <span className="xp-pname">{r.name}</span>
                        <span className="xp-pn">{num(r.xp30d)}</span>
                      </>
                    ) : (
                      <span className="xp-pname xp-vacant">Open</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="xp-namewrap" ref={wrapRef}>
              <span className="xp-who" ref={textRef} style={{ fontSize: 24, color: '#fff' }}>This spot is open</span>
            </div>
            <div className="xp-sub">Nobody has banked XP in the last 30 days yet.</div>
          </>
        )}
        <div className="xp-foot">Full leaderboard <ArrowRight size={13} style={{ verticalAlign: -1 }} /></div>
      </div>

      <div className="xp-panel">
        <div className="xp-h">How XP works</div>
        {/* The "why": XP rewards volume, not just talent, so the board is
            winnable by anyone willing to keep playing. */}
        <div className="xp-why">The more you play, the more you win.</div>
        <div className="xp-p">
          Every correct answer banks XP, scaled by how hard the quiz is, and a
          perfect run pays a 25% bonus. There is no cap and no losing points, so
          XP only ever goes up: keep playing and you climb.
        </div>
        <div className="xp-p">
          This board counts the last 30 days only, so it resets itself and the
          top spot is always up for grabs.
        </div>
        {/* The full XP ranking lives in the Stat Hub's Player tab (PlayerPanel
            renders the whole board); there is no standalone leaderboard route. */}
        <Link href="/quizzes/hub?tab=player" className="xp-cta" onClick={(e) => e.stopPropagation()}>
          Full leaderboard <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
