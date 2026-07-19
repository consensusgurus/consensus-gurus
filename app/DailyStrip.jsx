'use client';

// The unified daily-games tile: one horizontal strip that packages every daily
// into a single card, each game still its own link. A fixed left cap carries the
// DAILY GAMES label and a live progress bar; each cell shows the game's motif +
// name, and a game finished TODAY gets a green check overlay that dims the cell
// but never blocks the click (tap through to replay or review). Completion
// follows the signed-in player across devices via /api/quiz/daily-status, with
// the same-device localStorage breadcrumb (sot_<key>_day) driving the first
// paint. Adding a game to GAMES adds it to the strip everywhere it's used.
//
// TWO ROWS (owner ruling 2026-07-18, at 16 games): the cells lay out as a
// 2-row × 8-column grid, and the fixed left cap spans both rows.
//
// LEADERBOARD (optional): pass `board` (the /api/quiz/daily-combined payload)
// and the left cap becomes today's board in miniature — the overall TOP 3
// (rank, name, points) — plus the expand arrow. Expanding grows this SAME
// pill into the detail region with the overall top-5 and every game's top-3.
// Each cell ALSO keeps its own game leader chip (crown + name) while collapsed
// (owner: keep the game-specific leaders alongside the top-3 cap).

import React, { useState, useEffect } from 'react';
import { Crown, ChevronDown } from 'lucide-react';
import useDailyOrder, { sortByDailyOrder } from './useDailyOrder';

const GAMES = [
  { key: 'crux', href: '/crux', name: 'Crux', img: '/games/btn-crux.png', store: 'sot_crux_day', tag: "A clueless crossword" },
  { key: 'emcee', href: '/emcee', name: 'Emcee', img: '/games/btn-emcee.png', store: 'sot_emcee_day', tag: "The daily mini crossword" },
  { key: 'garble', href: '/garble', name: 'Garble', img: '/games/btn-garble.png', store: 'sot_garble_day', tag: "Untangle five words" },
  { key: 'links', href: '/links', name: 'Links', img: '/games/btn-links.png', store: 'sot_links_day', tag: "Four hidden threads" },
  { key: 'span', href: '/span', name: 'Span', img: '/games/btn-span.png', store: 'sot_span_day', tag: "Cross the map" },
  { key: 'dating', href: '/dating', name: 'Dating', img: '/games/btn-dating.png', store: 'sot_dating_day', tag: "Put history in order" },
  { key: 'tally', href: '/tally', name: 'Tally', img: '/games/btn-tally.png', store: 'sot_tally_day', tag: "Balance the books" },
  { key: 'suds', href: '/suds', name: 'Suds', img: '/games/btn-suds.png', store: 'sot_suds_day', tag: "The daily sudoku" },
  { key: 'carve', href: '/carve', name: 'Carve', img: '/games/btn-carve.png', store: 'sot_carve_day', tag: "Equal-sum blocks" },
  { key: 'circa', href: '/circa', name: 'Circa', img: '/games/btn-circa.png', store: 'sot_circa_day', tag: "Guess the year" },
  { key: 'extra', href: '/extra', name: 'Extra', img: '/games/btn-extra.png', store: 'sot_extra_day', tag: "Name the story" },
  { key: 'stet', href: '/stet', name: 'Stet', img: '/games/btn-stet.png', store: 'sot_stet_day', tag: "Fix the wrong word" },
  { key: 'outwit', href: '/outwit', name: 'Outwit', img: '/games/btn-outwit.png', store: 'sot_outwit_day', tag: "Beat the crowd" },
  { key: 'tuck', href: '/tuck', name: 'Tuck', img: '/games/btn-tuck.png', store: 'sot_tuck_day', tag: "Build your own crossword" },
  { key: 'alibi', href: '/alibi', name: 'Alibi', img: '/games/btn-alibi.png', store: 'sot_alibi_day', tag: "Solve the nightly whodunit" },
  { key: 'cipher', href: '/cipher', name: 'Cipher', img: '/games/btn-cipher.png', store: 'sot_cipher_day', tag: "Crack the letter math" },
  { key: 'ping', href: '/ping', name: 'Ping', img: '/games/btn-ping.png', store: 'sot_ping_day', tag: "Guess the secret city" },
  { key: 'warmer', href: '/warmer', name: 'Warmer', img: '/games/btn-warmer.png', store: 'sot_warmer_day', tag: "Hotter or colder" },
  { key: 'jester', href: '/jester', name: 'Jesters', img: '/games/btn-jester.png', store: 'sot_jester_day', tag: "Seat the court" },
  { key: 'sworn', href: '/sworn', name: 'Sworn', img: '/games/btn-sworn.png', store: 'sot_sworn_day', tag: "Spot the liars" },
];

const NAME_BY_KEY = GAMES.reduce((m, g) => { m[g.key] = g.name; return m; }, {});
// Navy-legible per-game accents for the mini-board titles (match DailyCombinedLeaderboard).
const ACCENTS = { crux: '#5b9bff', emcee: '#e879f9', garble: '#f0c95a', links: '#4ca878', span: '#e06aa0', dating: '#a483f0', tally: '#4cb377', suds: '#f0894c', circa: '#38b6cf', extra: '#e06a6a', carve: '#a483f0', stet: '#41b1e8', outwit: '#c3cfe3', tuck: '#e0a568', alibi: '#ef8896', cipher: '#3fc9b8', ping: '#4cb3f0', warmer: '#f3705c', jester: '#a78bfa', sworn: '#f472b6' };

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

function fmtPts(x) { const v = Math.round(Number(x) * 10) / 10; return Number.isInteger(v) ? String(v) : v.toFixed(1); }

export default function DailyStrip({ board = null }) {
  const [done, setDone] = useState(() => new Set());
  const [open, setOpen] = useState(false);
  // Display order = yesterday's popularity (canonical order until it loads).
  const dailyOrder = useDailyOrder();
  const games = sortByDailyOrder(GAMES, dailyOrder);

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

  // ── leaderboard wiring (only when a board payload is provided) ──
  const bgames = board && Array.isArray(board.games) ? board.games : null;
  const byKey = {};
  if (bgames) for (const g of bgames) byKey[g.key] = g;
  const hasBoard = !!(bgames && bgames.length);
  const overall = board && Array.isArray(board.overall) ? board.overall : [];
  const maxTotal = (board && board.maxTotal) || 75;
  const gameCount = (board && board.gameCount) || (bgames ? bgames.length : 0);
  const bestN = board && board.bestN != null ? board.bestN : Math.min(5, gameCount || 5);
  const meKey = board && board.me ? board.me.userKey : null;
  const top5 = overall.slice(0, 5);
  const meShown = meKey && top5.some((r) => r.userKey === meKey);

  return (
    <div className="dstrip-wrap">
      <style>{`
        .dstrip-wrap{margin-bottom:14px;}
        .dstrip{display:flex;flex-direction:column;background:#0e1d40;border:1px solid rgba(20,22,28,0.14);border-radius:16px;overflow:hidden;}
        .dstrip.has-board{border-color:rgba(232,180,58,0.4);}
        .dstrip-main{display:flex;}
        .dstrip-main{scrollbar-width:thin;scrollbar-color:rgba(159,176,212,0.45) #0b1733;}
        .dstrip-main::-webkit-scrollbar{height:9px;}
        .dstrip-main::-webkit-scrollbar-track{background:#0b1733;}
        .dstrip-main::-webkit-scrollbar-thumb{background:rgba(159,176,212,0.4);border-radius:99px;border:2px solid #0b1733;}
        .dstrip-main::-webkit-scrollbar-thumb:hover{background:rgba(159,176,212,0.65);}
        .dstrip-main::-webkit-scrollbar-button{display:none;width:0;height:0;}
        .dstrip-cap{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:5px;padding:12px 16px;background:#0b1733;border-right:1px solid rgba(255,255,255,0.07);min-width:104px;}
        .dstrip-cap.has-top3{min-width:168px;max-width:196px;}
        .dstrip-cap .lab{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#f8b84a;}
        .dstrip-cap .cty{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.2px;line-height:1;}
        .dstrip-bar{display:block;height:5px;width:60px;border-radius:99px;background:rgba(255,255,255,0.14);overflow:hidden;margin-top:3px;}
        .dstrip-fill{display:block;height:100%;width:0;background:#34d399;border-radius:99px;transition:width .4s ease;}
        .dstrip-exp{margin-top:2px;align-self:flex-start;display:inline-flex;align-items:center;gap:4px;background:rgba(232,180,58,0.14);border:1px solid rgba(232,180,58,0.42);color:#f5d878;font-family:inherit;font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-radius:7px;padding:3px 8px;cursor:pointer;transition:background .15s;}
        .dstrip-exp:hover{background:rgba(232,180,58,0.24);}
        /* the cap's miniature daily board: today's overall top 3 */
        .dstrip-t3{display:flex;flex-direction:column;gap:2px;margin-top:2px;min-width:0;}
        .dstrip-t3 .t3h{font-size:8.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8fa3cf;margin-bottom:1px;}
        .dstrip-t3r{display:flex;align-items:baseline;gap:5px;min-width:0;font-size:11px;font-weight:700;color:#eaf0fb;line-height:1.35;}
        .dstrip-t3r .rk{flex:0 0 auto;width:10px;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;}
        .dstrip-t3r .nm3{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dstrip-t3r .pt{flex:0 0 auto;font-size:10px;color:#93a7cc;font-variant-numeric:tabular-nums;font-weight:600;}
        .dstrip-t3r.me .nm3{color:#f5d878;}
        .dstrip-t3 .t3none{font-size:10.5px;font-weight:600;color:#6a80a8;line-height:1.35;}
        /* 16 games in a 2-row × 8-column grid; the cap spans both rows */
        .dstrip-cells{display:grid;grid-template-columns:repeat(10,minmax(72px,1fr));grid-auto-rows:1fr;flex:1 1 auto;min-width:0;}
        .dstrip-cell{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:11px 6px 9px;text-decoration:none;border-left:1px solid rgba(255,255,255,0.055);transition:background .12s;}
        .dstrip-cell:nth-child(10n+1){border-left:none;}
        .dstrip-cell:nth-child(n+11){border-top:1px solid rgba(255,255,255,0.055);}
        .dstrip-cell:hover{background:rgba(91,139,255,0.14);}
        .dstrip-cell img{height:30px;width:auto;max-width:38px;object-fit:contain;}
        .dstrip-cell .nm{font-size:11px;font-weight:800;color:#fff;letter-spacing:-.2px;white-space:nowrap;}
        .dstrip-cell.done img{opacity:.4;}
        .dstrip-cell.done .nm{color:#9fb0d4;}
        .dstrip-check{position:absolute;top:5px;right:5px;width:16px;height:16px;border-radius:99px;background:#34d399;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px #0e1d40;pointer-events:none;}
        .dstrip-lead{margin-top:2px;display:flex;align-items:center;gap:3px;max-width:100%;min-width:0;font-size:10px;font-weight:700;color:#eaf0fb;}
        .dstrip-lead svg{color:#e8b43a;flex:none;}
        .dstrip-lead > span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dstrip-lead.none{color:#6a80a8;font-weight:600;}
        /* hover blurb: the one-line description fades in over the cell */
        .dstrip-tip{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;text-align:center;padding:6px 8px;background:rgba(11,23,51,0.96);color:#eaf0fb;font-size:10.5px;font-weight:700;line-height:1.4;opacity:0;transition:opacity .14s ease;pointer-events:none;}
        .dstrip-cell:hover .dstrip-tip,.dstrip-cell:focus-visible .dstrip-tip{opacity:1;}
        @media (hover:none){.dstrip-tip{display:none;}}
        /* expanded detail: attached inside the same pill */
        .dsd{border-top:1px solid rgba(232,180,58,0.28);background:#0b1733;padding:16px 16px 14px;}
        .dsd-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px;}
        .dsd-l{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#e8b43a;font-weight:800;}
        .dsd-r{font-size:10.5px;color:#93a7cc;font-weight:600;}
        .dsd-grid{display:grid;grid-template-columns:320px 1fr;gap:18px;align-items:start;}
        @media(max-width:900px){.dsd-grid{grid-template-columns:1fr;}}
        .dsd-sub{font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#8fa3cf;font-weight:800;margin-bottom:8px;}
        .dsd-cols{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;padding:0 11px 6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#93a7cc;}
        .dsd-row{display:grid;grid-template-columns:24px 1fr 46px 60px;gap:8px;align-items:center;padding:8px 11px;margin-bottom:5px;border-radius:10px;background:rgba(232,180,58,.08);border:1px solid rgba(232,180,58,.22);}
        .dsd-row.plain{background:rgba(255,255,255,.045);border-color:rgba(255,255,255,.09);}
        .dsd-row.me{background:rgba(232,180,58,.16);border-color:rgba(232,180,58,.55);}
        .dsd-rk{font-weight:800;font-size:15px;color:#f5d878;font-variant-numeric:tabular-nums;}
        .dsd-row.plain .dsd-rk{color:#93a7cc;}
        .dsd-pn{font-size:13.5px;font-weight:500;color:#eaf0fb;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .dsd-pn b{color:#e8b43a;font-weight:700;}
        .dsd-g{font-size:12px;color:#93a7cc;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;}
        .dsd-tt{font-size:13.5px;font-weight:800;color:#f5d878;text-align:right;font-variant-numeric:tabular-nums;}
        .dsd-tt s{font-size:10px;font-weight:600;color:#6a80a8;text-decoration:none;}
        .dsd-empty{font-size:12.5px;color:#93a7cc;font-weight:600;padding:8px 2px;}
        .dsd-minis{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;}
        @media(max-width:1200px){.dsd-minis{grid-template-columns:repeat(4,1fr);}}
        @media(max-width:900px){.dsd-minis{grid-template-columns:repeat(2,1fr);}}
        .dsd-mini{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:10px 11px;}
        .dsd-gt{font-size:11px;font-weight:800;margin-bottom:7px;display:flex;justify-content:space-between;align-items:baseline;text-decoration:none;}
        .dsd-gt span{font-size:9px;color:#6a80a8;font-weight:600;}
        .dsd-mr{display:flex;gap:6px;align-items:baseline;font-size:11.5px;padding:2px 0;}
        .dsd-k{width:11px;font-weight:800;color:#f5d878;font-variant-numeric:tabular-nums;flex:0 0 auto;}
        .dsd-n2{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#eaf0fb;font-weight:500;}
        .dsd-n2 b{color:#e8b43a;font-weight:700;}
        .dsd-p{color:#93a7cc;font-variant-numeric:tabular-nums;font-weight:600;font-size:10.5px;}
        .dsd-none{color:#6a80a8;font-size:10.5px;padding:2px 0;}
        /* Enable horizontal scroll whenever the 8 columns can't all fit: narrow widths
           AND short landscape phones (which can be wider than 820 but still overflow).
           Without this the strip's overflow:hidden clips the right-hand games and they
           become unreachable (the "frozen strip" bug on landscape). Both rows scroll
           together — the grid keeps a floor width and the cap stays sticky. */
        @media (max-width:1024px), (max-height:600px){
          .dstrip-main{overflow-x:auto;-webkit-overflow-scrolling:touch;}
          .dstrip-cap{position:sticky;left:0;z-index:1;}
          .dstrip-cells{min-width:560px;}
        }
        @media(max-width:560px){
          .dstrip-cap{min-width:78px;padding:10px 11px;}
          .dstrip-cap.has-top3{min-width:148px;max-width:164px;}
          .dstrip-cells{grid-template-columns:repeat(10,minmax(62px,1fr));min-width:620px;}
          .dstrip-cell{padding:9px 5px 8px;}
          .dstrip-cell img{height:26px;}
          .dstrip-cell .nm{font-size:10px;}
        }
      `}</style>
      <div className={`dstrip${hasBoard ? ' has-board' : ''}`} role="navigation" aria-label="Daily games">
        <div className="dstrip-main">
          <div className={`dstrip-cap${hasBoard ? ' has-top3' : ''}`}>
            <span className="lab">Daily</span>
            <span className="cty">Games</span>
            <span className="dstrip-bar"><span className="dstrip-fill" style={{ width: `${pct}%` }} /></span>
            {hasBoard ? (
              <span className="dstrip-t3">
                <span className="t3h"><Crown size={8} style={{ display: 'inline', verticalAlign: '-1px', color: '#e8b43a' }} /> Today&rsquo;s Top 3</span>
                {top5.length ? top5.slice(0, 3).map((r) => {
                  const mine = meKey && r.userKey === meKey;
                  return (
                    <span key={r.userKey} className={`dstrip-t3r${mine ? ' me' : ''}`}>
                      <span className="rk">{r.rank}</span>
                      <span className="nm3">{r.username || 'Player'}</span>
                      <span className="pt">{fmtPts(r.total)}</span>
                    </span>
                  );
                }) : <span className="t3none">No scores yet — be the first.</span>}
              </span>
            ) : null}
            {hasBoard ? (
              <button type="button" className="dstrip-exp" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                <ChevronDown size={11} strokeWidth={2.6} style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
                {open ? 'Hide' : 'Full board'}
              </button>
            ) : null}
          </div>
          <div className="dstrip-cells">
            {games.map((g) => {
              const lead = hasBoard && byKey[g.key] && byKey[g.key].board && byKey[g.key].board[0] ? byKey[g.key].board[0].username : null;
              return (
                <a key={g.key} href={g.href} className={`dstrip-cell${done.has(g.key) ? ' done' : ''}`} title={`${g.name} — ${g.tag}`} aria-label={`${g.name} — ${g.tag}${done.has(g.key) ? ' — done today' : ''} — daily game`}>
                  {done.has(g.key) && (
                    <span className="dstrip-check" aria-hidden="true">
                      <svg viewBox="0 0 12 12" width="9" height="9" fill="none"><path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#04121f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  )}
                  <img src={g.img} alt="" aria-hidden="true" />
                  <span className="nm">{g.name}</span>
                  <span className="dstrip-tip" aria-hidden="true">{g.tag}</span>
                  {hasBoard && !open ? (
                    lead ? <span className="dstrip-lead"><Crown size={10} /><span>{lead}</span></span> : <span className="dstrip-lead none">—</span>
                  ) : null}
                </a>
              );
            })}
          </div>
        </div>
        {hasBoard && open ? (
          <div className="dsd">
            <div className="dsd-head">
              <span className="dsd-l">Daily Leaderboard</span>
              <span className="dsd-r">Best {bestN} of {gameCount} · {maxTotal} pts max · resets at midnight</span>
            </div>
            <div className="dsd-grid">
              <div>
                <div className="dsd-sub">Overall · Top 5</div>
                <div className="dsd-cols"><span>#</span><span>Player</span><span style={{ textAlign: 'right' }}>Games</span><span style={{ textAlign: 'right' }}>Total</span></div>
                {top5.length ? top5.map((r) => {
                  const mine = meKey && r.userKey === meKey;
                  return (
                    <div key={r.userKey} className={`dsd-row${r.rank <= 3 ? '' : ' plain'}${mine ? ' me' : ''}`}>
                      <span className="dsd-rk">{r.rank}</span>
                      <span className="dsd-pn">{r.username || 'Player'}{mine ? <b> (you)</b> : ''}</span>
                      <span className="dsd-g">{r.gamesPlayed}/{gameCount}</span>
                      <span className="dsd-tt">{fmtPts(r.total)}<s>/{maxTotal}</s></span>
                    </div>
                  );
                }) : <div className="dsd-empty">No daily scores yet today. Be the first.</div>}
                {meKey && board.me && !meShown ? (
                  <div className="dsd-row me" style={{ marginTop: 7 }}>
                    <span className="dsd-rk">{board.me.rank}</span>
                    <span className="dsd-pn">{board.me.username || 'You'} <b>(you)</b></span>
                    <span className="dsd-g">{board.me.gamesPlayed}/{gameCount}</span>
                    <span className="dsd-tt">{fmtPts(board.me.total)}<s>/{maxTotal}</s></span>
                  </div>
                ) : null}
                <a href="/daily" className="dsd-gt" style={{ marginTop: 9, color: '#f5d878' }}>Full standings &amp; game boards →</a>
              </div>
              <div>
                <div className="dsd-sub">Each Game · Top 3</div>
                <div className="dsd-minis">
                  {sortByDailyOrder(bgames, dailyOrder).map((g) => {
                    const t3 = (g.board || []).slice(0, 3);
                    const acc = ACCENTS[g.key] || '#f5d878';
                    return (
                      <div key={g.key} className="dsd-mini">
                        <a href={g.href || `/${g.key}`} className="dsd-gt" style={{ color: acc }}>{NAME_BY_KEY[g.key] || g.key} →<span>top 3</span></a>
                        {t3.length ? t3.map((r, i) => {
                          const mine = meKey && r.userKey === meKey;
                          return (
                            <div key={r.userKey || i} className="dsd-mr"><span className="dsd-k">{i + 1}</span><span className="dsd-n2">{r.username || 'Player'}{mine ? <b> (you)</b> : ''}</span><span className="dsd-p">{fmtPts(r.points)}</span></div>
                          );
                        }) : <div className="dsd-none">No scores yet</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
