'use client';

// The unified daily-games tile: one horizontal strip that packages every daily
// into a single card, each game still its own link. A fixed left cap carries the
// DAILY GAMES label and a live progress bar; each cell shows the game's motif +
// name, and a game finished TODAY gets a green check overlay that dims the cell
// but never blocks the click (tap through to replay or review). Completion
// follows the signed-in player across devices via /api/quiz/daily-status, with
// the same-device localStorage breadcrumb (sot_<key>_day) driving the first
// paint. Adding a game to GAMES adds it to the strip everywhere it's used.

import React, { useState, useEffect } from 'react';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', img: '/games/btn-crux.png', store: 'sot_crux_day' },
  { key: 'emcee', href: '/emcee', name: 'Emcee', img: '/games/btn-emcee.png', store: 'sot_emcee_day' },
  { key: 'garble', href: '/garble', name: 'Garble', img: '/games/btn-garble.png', store: 'sot_garble_day' },
  { key: 'links', href: '/links', name: 'Links', img: '/games/btn-links.png', store: 'sot_links_day' },
  { key: 'span', href: '/span', name: 'Span', img: '/games/btn-span.png', store: 'sot_span_day' },
  { key: 'dating', href: '/dating', name: 'Dating', img: '/games/btn-dating.png', store: 'sot_dating_day' },
  { key: 'tally', href: '/tally', name: 'Tally', img: '/games/btn-tally.png', store: 'sot_tally_day' },
  { key: 'suds', href: '/suds', name: 'Suds', img: '/games/btn-suds.png', store: 'sot_suds_day' },
  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day' },
  { key: 'circa', href: '/circa', name: 'Circa', img: '/games/btn-circa.png', store: 'sot_circa_day' },
  { key: 'extra', href: '/extra', name: 'Extra', img: '/games/btn-extra.png', store: 'sot_extra_day' },
];

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function DailyStrip() {
  const [done, setDone] = useState(() => new Set());

  // first paint: same-device breadcrumbs
  useEffect(() => {
    const today = etToday();
    const d = new Set();
    for (const g of GAMES) {
      try {
        const c = JSON.parse(localStorage.getItem(g.store) || 'null');
        if (c && c.d === today && c.done) d.add(g.key);
      } catch (e) {}
    }
    if (d.size) setDone(d);
  }, []);

  // cross-device: the signed-in player's finished-today set from the server
  useEffect(() => {
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); email = id && id.email; } catch (e) {}
    const qs = new URLSearchParams();
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    if (!qs.toString()) return;
    let alive = true;
    fetch('/api/quiz/daily-status?' + qs.toString())
      .then((r) => r.json())
      .then((data) => {
        if (!alive || !data) return;
        const [Y, M, D] = etToday().split('-').map(Number);
        const yy = Y % 100;
        const completed = new Set(data.completed || []);
        const played = new Set(data.played || []);
        setDone((cur) => {
          const next = new Set(cur);
          for (const g of GAMES) {
            const id = `${g.key}-${M}-${D}-${yy}`;
            if (completed.has(id) || played.has(id)) next.add(g.key);
          }
          return next;
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const n = GAMES.filter((g) => done.has(g.key)).length;
  const pct = Math.round((n / GAMES.length) * 100);

  return (
    <div className="dstrip-wrap">
      <style>{`
        .dstrip-wrap{margin-bottom:14px;}
        .dstrip{display:flex;background:#0e1d40;border:1px solid rgba(20,22,28,0.14);border-radius:16px;overflow:hidden;}
        .dstrip{scrollbar-width:thin;scrollbar-color:rgba(159,176,212,0.45) #0b1733;}
        .dstrip::-webkit-scrollbar{height:9px;}
        .dstrip::-webkit-scrollbar-track{background:#0b1733;}
        .dstrip::-webkit-scrollbar-thumb{background:rgba(159,176,212,0.4);border-radius:99px;border:2px solid #0b1733;}
        .dstrip::-webkit-scrollbar-thumb:hover{background:rgba(159,176,212,0.65);}
        .dstrip::-webkit-scrollbar-button{display:none;width:0;height:0;}
        .dstrip-cap{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:12px 16px;background:#0b1733;border-right:1px solid rgba(255,255,255,0.07);min-width:104px;}
        .dstrip-cap .lab{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f8b84a;}
        .dstrip-cap .cty{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.2px;line-height:1;}
        .dstrip-bar{display:block;height:5px;width:60px;border-radius:99px;background:rgba(255,255,255,0.14);overflow:hidden;margin-top:3px;}
        .dstrip-fill{display:block;height:100%;width:0;background:#34d399;border-radius:99px;transition:width .4s ease;}
        .dstrip-n{font-family:'DM Mono',ui-monospace,monospace;font-size:10px;color:#9fb0d4;letter-spacing:.04em;}
        .dstrip-cells{display:flex;flex:1 1 auto;}
        .dstrip-cell{position:relative;flex:1 1 0;min-width:66px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:13px 6px 11px;text-decoration:none;border-left:1px solid rgba(255,255,255,0.055);transition:background .12s;}
        .dstrip-cell:first-child{border-left:none;}
        .dstrip-cell:hover{background:rgba(91,139,255,0.14);}
        .dstrip-cell img{height:34px;width:auto;max-width:40px;object-fit:contain;}
        .dstrip-cell .nm{font-size:11.5px;font-weight:800;color:#fff;letter-spacing:-.2px;white-space:nowrap;}
        .dstrip-cell.done img{opacity:.4;}
        .dstrip-cell.done .nm{color:#9fb0d4;}
        .dstrip-check{position:absolute;top:6px;right:6px;width:16px;height:16px;border-radius:99px;background:#34d399;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #0e1d40;pointer-events:none;}
        @media(max-width:820px){
          .dstrip{overflow-x:auto;-webkit-overflow-scrolling:touch;}
          .dstrip-cap{position:sticky;left:0;z-index:1;}
        }
        @media(max-width:560px){
          .dstrip-cap{min-width:78px;padding:10px 11px;}
          .dstrip-cell{min-width:60px;padding:11px 5px 9px;}
          .dstrip-cell img{height:28px;}
          .dstrip-cell .nm{font-size:10.5px;}
        }
      `}</style>
      <div className="dstrip" role="navigation" aria-label="Daily games">
        <div className="dstrip-cap">
          <span className="lab">Daily</span>
          <span className="cty">Games</span>
          <span className="dstrip-bar"><span className="dstrip-fill" style={{ width: `${pct}%` }} /></span>
          <span className="dstrip-n">{n} / {GAMES.length} today</span>
        </div>
        <div className="dstrip-cells">
          {GAMES.map((g) => (
            <a key={g.key} href={g.href} className={`dstrip-cell${done.has(g.key) ? ' done' : ''}`} aria-label={`${g.name}${done.has(g.key) ? ' — done today' : ''} — daily game`}>
              {done.has(g.key) && (
                <span className="dstrip-check" aria-hidden="true">
                  <svg viewBox="0 0 12 12" width="9" height="9" fill="none"><path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#04121f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              )}
              <img src={g.img} alt="" aria-hidden="true" />
              <span className="nm">{g.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
