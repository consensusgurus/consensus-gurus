'use client';
import { useMemo, useEffect, useRef, useState } from 'react';
import { guestHandleFromAnon } from '@/lib/quiz-xp';
import Link from 'next/link';
import SourcesPopover from '../SourcesPopover';
import { getAllSources } from '@/lib/sources';
import { QUIZ_COUNT } from '../SiteHeader';
import { T } from '@/lib/theme';
import MindLoftMark from '../MindLoftMark';

// Full-bleed command-bar header for the quizzes HOME page only (individual
// quiz pages, the Stat Hub, and the lists site keep SiteHeader). One 56px
// blue bar spanning the whole viewport: brand, welcome + rank chip,
// Lists/Quizzes nav, Stat Hub CTA. The search box moved OUT of this bar on
// 2026-07-29 and now lives in the full-width row below the three-column daily
// section (see QuizHomeClient's .qz-toolrow). Under it runs
// a live ticker tape of recent plays, correct-today leaders, duel results,
// and new quizzes, built from data the page already fetches. Collapse order
// as the window narrows: sources pill -> player stat subline + Stat Hub text
// -> wordmark shortens to SoT and the search icon button appears -> avatar
// circle drops.
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const SOURCE_COUNT = getAllSources().length;

function fmtK(n) { return (typeof n === 'number' && n > 999) ? `${(n / 1000).toFixed(1)}k` : (n != null ? n.toLocaleString() : n); }

let __qchLogoSeq = 0;
function Logo( size = 30 ) {
  return <MindLoftMark size={size} />;
}

// eslint-disable-next-line no-unused-vars -- size default kept at 30

const SearchIcon = ({ c = T.ink }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" style={{ flex: 'none' }} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

// Per-type ticker icons (play / lead / duel / new / stat).
const TICO = {
  play: <svg width="10" height="10" viewBox="0 0 24 24" fill="#5ad48f" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>,
  lead: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2.4" aria-hidden="true"><path d="M3 17h18M4 17 3 7l5 4 4-7 4 7 5-4-1 10" /></svg>,
  duel: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f08a8a" strokeWidth="2.2" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>,
  new: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9dbcf7" strokeWidth="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  stat: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9dbcf7" strokeWidth="2.4" aria-hidden="true"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>,
  // Community leader (crown), category champion (trophy), achievement (star), streak (flame).
  top: <svg width="11" height="11" viewBox="0 0 24 24" fill={T.gold} aria-hidden="true"><path d="M3 7l3.8 3.4L12 3l5.2 7.4L21 7l-1.7 12H4.7z" /></svg>,
  champ: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2.1" aria-hidden="true"><path d="M6 4h12v3.5a6 6 0 0 1-12 0zM6 5H3.5v1.8a3 3 0 0 0 3 3M18 5h2.5v1.8a3 3 0 0 1-3 3M9.5 20h5M12 13.5V20" /></svg>,
  ach: <svg width="11" height="11" viewBox="0 0 24 24" fill="#b79cf2" aria-hidden="true"><path d="M12 2.5l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.3 6.5 19.2l1.2-6.1L3.2 8.9l6.1-.8z" /></svg>,
  streak: <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5893e" aria-hidden="true"><path d="M12 2c1 4-2 5.2-2 8a2 2 0 0 0 4 0c2 2 3 4 3 6a5 5 0 0 1-10 0C7 12 11 10 12 2z" /></svg>,
};

function TickSet({ items, hidden }) {
  return (
    <div className="qch-set" aria-hidden={hidden ? 'true' : undefined}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Link href={it.href || '/quizzes'} className="qch-titem" tabIndex={hidden ? -1 : undefined}>
            <span className={`qch-tico qch-tico-${it.type}`}>{TICO[it.type] || TICO.stat}</span>
            {it.segs.map((s, j) => (
              <span key={j} className={s.strong ? 'qch-ts' : s.dim ? 'qch-td' : undefined}>{s.text}</span>
            ))}
          </Link>
          <span className="qch-tdot" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

function focusListSearch() {
  try {
    const el = document.getElementById('qz-main-search');
    if (!el) return;
    // Focus FIRST, synchronously inside the click's gesture stack: iOS/Android
    // only raise the soft keyboard for a focus() that is still part of the user
    // gesture, so deferring it behind a setTimeout silently kills the keyboard.
    try { el.focus({ preventScroll: true }); } catch { el.focus(); }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch {}
}

export default function QuizCommandHeader({ me, onSignup, ticker = [] }) {
  const found = !!(me && me.found);
  // A signed-out visitor still gets a name: the same stable Guest-XXXX handle
  // the leaderboards already show them under, derived from this browser's anon
  // id. Resolved after mount because it reads localStorage.
  const [guestName, setGuestName] = useState('');
  useEffect(() => {
    if (found) return;
    try {
      const a = localStorage.getItem('sot_quiz_anon');
      if (a) setGuestName(guestHandleFromAnon(a));
    } catch (e) {}
  }, [found]);
  const signed = !!(found && me.signed);
  const rank = found ? ((me.ranks && me.ranks.xp) || me.rank) : null;
  const completed = (found && me.activity && me.activity.completed != null) ? me.activity.completed : null;
  // Lifetime IQ Points. A running total, so it renders bare: the "+" prefix is
  // reserved for amounts EARNED (the Your day strip, the end card).
  const xp = (found && typeof me.xp === 'number') ? me.xp : null;
  const totalPlayers = (found && typeof me.totalPlayers === 'number' && me.totalPlayers > 0) ? me.totalPlayers : null;
  // Share of the whole catalogue this player has completed, shown next to the
  // raw count (owner 2026-07-29). Under 10% keeps one decimal so an early
  // player does not read a flat 0%; anything that rounds to nothing shows <0.1%.
  const donePct = (completed != null && QUIZ_COUNT > 0) ? (() => {
    const v = (completed / QUIZ_COUNT) * 100;
    if (v > 0 && v < 0.1) return '<0.1%';
    return `${v < 10 ? v.toFixed(1) : Math.round(v)}%`;
  })() : null;
  // Duplicate short item lists so the looping track never shows a hole.
  const items = ticker.length ? (ticker.length < 8 ? [...ticker, ...ticker] : ticker) : [];
  const dur = `${Math.min(96, Math.max(36, items.length * 5))}s`;
  // Progressive collapse on mobile: a long player name gets room by dropping
  // the brand logo first, then the search icon. CSS cannot see truncation, so
  // measure it (scrollWidth > clientWidth) and re-run on every resize. Always
  // clear the classes before measuring so the elements come back when the name
  // shortens or the viewport grows.
  const barRef = useRef(null);
  const nmRef = useRef(null);
  const logoRef = useRef(null);
  const btnRef = useRef(null);
  const meName = me && me.name;
  useEffect(() => {
    const bar = barRef.current;
    if (!bar || typeof ResizeObserver === 'undefined') return;
    const fit = () => {
      const logo = logoRef.current, btn = btnRef.current, nm = nmRef.current;
      if (logo) logo.classList.remove('qch-hidefit');
      if (btn) btn.classList.remove('qch-hidefit');
      if (!nm || window.innerWidth > 820) return;
      const cut = () => nm.scrollWidth > nm.clientWidth + 1;
      if (!cut()) return;
      if (logo) { logo.classList.add('qch-hidefit'); if (!cut()) return; }
      if (btn) btn.classList.add('qch-hidefit');
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, [meName, found]);
  return (
    <div className="qch" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .qch-bar{display:flex;align-items:center;gap:12px;min-height:56px;padding:9px clamp(14px,2vw,24px);background:var(--white);border-bottom:1.5px solid var(--border);}
        .qch-word{font-size:18px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:var(--ink);text-decoration:none;white-space:nowrap;flex:none;}
        .qch-word em{font-style:normal;color:var(--blue);font-weight:800;}
        .qch-ws{display:none;}
        .qch-src{font-size:9.5px;font-weight:800;letter-spacing:normal;text-transform:uppercase;color:var(--ink);flex:none;}
        /* The search INPUT left this bar on 2026-07-29 (it now sits in the
           full-width tool row under the three-column daily section), so the
           welcome/rank block simply takes the free space with margin-left:auto
           and the Stat Hub + toggle group stays flush right. The mobile search
           ICON button stays exactly as it was: hidden on desktop, shown at
           <=820px, where it focuses the browse-row field (the one visible at
           that width) so phone layout is untouched. */
        .qch-searchbtn{display:none;align-items:center;justify-content:center;width:36px;height:36px;flex:none;background:var(--surface);border:1.5px solid var(--border);border-radius:10px;cursor:pointer;padding:0;}
        .qch-me{margin-left:auto;flex:none;min-width:0;}
        .qch-melink{display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0;}
        .qch-ava{width:30px;height:30px;border-radius:50%;background:var(--surface-alt);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:var(--ink);flex:none;}
        .qch-mecol{display:flex;flex-direction:column;gap:2px;min-width:0;}
        .qch-nm{display:flex;align-items:center;gap:5px;font-size:13.5px;font-weight:800;color:var(--ink);line-height:1;white-space:nowrap;max-width:260px;overflow:hidden;text-overflow:ellipsis;}
        .qch-hi{font-weight:600;color:var(--slate);}
        .qch-of{display:none;}
        /* Wide bars had a large dead gap between the brand and the player chip
           (owner 2026-07-29). From 1181px up the welcome and the rank detail sit
           on ONE line, separated by a rule and a fluid gap that grows with the
           viewport, so the block reaches back into that space instead of
           huddling at the right edge. Rank also gains its "of N players" tail
           here. Below 1181px everything collapses to the stacked two-line chip,
           unchanged, and the existing 980 / 620 rules still take over from there. */
        @media(min-width:1181px){
          /* The welcome block is centred on the PAGE, not parked at the right
             edge (owner, 2026-07-29). Taking it out of flow is what makes it a
             true centre: the brand keeps the left, and the Stat Hub + toggle
             group is pushed flush right by the auto margin below. */
          .qch-bar{position:relative;}
          .qch-me{position:absolute;left:50%;transform:translateX(-50%);margin-left:0;flex:none;display:flex;justify-content:center;max-width:min(48vw,640px);}
          .qch-me ~ .qch-hub{margin-left:auto;}
          .qch-melink{gap:13px;}
          .qch-mecol{flex-direction:row;align-items:center;gap:clamp(14px,2.6vw,38px);}
          .qch-nm{font-size:15px;max-width:none;}
          .qch-sub{font-size:12.5px;border-left:1.5px solid var(--border);padding-left:clamp(14px,2.6vw,38px);}
          .qch-of{display:inline;color:var(--muted);}
        }
        .qch-sub{font-size:10.5px;font-weight:700;color:var(--slate);line-height:1;white-space:nowrap;}
        .qch-rankm{display:none;font-size:11px;font-weight:800;color:var(--ink);line-height:1;white-space:nowrap;}
        .qch-chk{display:inline-flex;width:13px;height:13px;border-radius:50%;background:var(--surface-alt);color:var(--accent);font-size:8.5px;font-weight:800;align-items:center;justify-content:center;flex:none;}
        .qch-signup{display:inline-flex;align-items:center;gap:6px;background:var(--cta);border:1px solid var(--cta);border-radius:9px;color:var(--cta-ink);font-family:inherit;font-size:12.5px;font-weight:800;padding:8px 13px;cursor:pointer;white-space:nowrap;flex:none;}
        .qch-signup:hover{background:var(--cta-hover);border-color:var(--cta-hover);color:var(--cta-ink);}
        .qch-seg{display:flex;gap:2px;background:var(--surface-alt);border-radius:999px;padding:3px;flex:none;}.qch-burger{display:none;position:relative;flex:none;}.qch-burger>summary{list-style:none;display:flex;align-items:center;justify-content:center;width:38px;height:34px;border-radius:9px;background:var(--surface-alt);border:1.5px solid var(--border);cursor:pointer;}.qch-burger>summary::-webkit-details-marker{display:none;}.qch-bmenu{position:absolute;top:calc(100% + 8px);right:0;z-index:70;min-width:200px;background:var(--white);border:1px solid rgba(20,22,28,0.12);border-radius:11px;box-shadow:0 12px 30px rgba(10,16,32,0.28);padding:4px;}.qch-bmenu a{display:block;padding:11px 13px;border-radius:8px;font-size:14px;font-weight:700;color:var(--ink);text-decoration:none;white-space:nowrap;}.qch-bmenu a.on,.qch-bmenu a:hover{background:#eef2fb;color:var(--accent);}@media(max-width:600px){.qch-seg{display:none;}.qch-burger{display:block;}}
        .qch-seg a{font-size:12px;font-weight:700;color:var(--ink);text-decoration:none;padding:6px 12px;border-radius:999px;white-space:nowrap;}
        .qch-seg a.on{background:var(--accent);color:var(--white);}
        .qch-hub{display:inline-flex;align-items:center;gap:6px;background:var(--cta);color:var(--cta-ink);font-size:12.5px;font-weight:800;border-radius:10px;padding:8px 13px;text-decoration:none;white-space:nowrap;flex:none;}
        .qch-hub:hover{background:var(--cta-hover);color:var(--cta-ink);}
        .qch-tickwrap{display:flex;align-items:stretch;background:var(--white);}
        .qch-tlabel{display:flex;align-items:center;gap:6px;flex:none;padding:0 14px 0 clamp(14px,2vw,24px);background:var(--white);font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);position:relative;z-index:2;}
        .qch-pulse{width:6px;height:6px;border-radius:50%;background:#5ad48f;box-shadow:0 0 0 0 rgba(90,212,143,0.5);animation:qchpul 2s infinite;}
        @keyframes qchpul{0%{box-shadow:0 0 0 0 rgba(90,212,143,0.45)}70%{box-shadow:0 0 0 7px rgba(90,212,143,0)}100%{box-shadow:0 0 0 0 rgba(90,212,143,0)}}
        .qch-ticker{position:relative;overflow:hidden;flex:1 1 0;min-width:0;height:34px;}
        .qch-ticker:before,.qch-ticker:after{content:'';position:absolute;top:0;bottom:0;width:30px;z-index:1;pointer-events:none;}
        .qch-ticker:before{left:0;background:linear-gradient(90deg,var(--white),rgba(255,255,255,0));}
        .qch-ticker:after{right:0;background:linear-gradient(270deg,var(--white),rgba(255,255,255,0));}
        .qch-track{display:flex;align-items:center;height:34px;width:max-content;animation:qchtick linear infinite;}
        @keyframes qchtick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .qch-ticker:hover .qch-track{animation-play-state:paused;}
        @media (prefers-reduced-motion: reduce){.qch-track{animation:none;}}
        .qch-set{display:flex;align-items:center;flex:none;}
        .qch-titem{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--slate);text-decoration:none;white-space:nowrap;}
        .qch-titem:hover .qch-ts{text-decoration:underline;text-underline-offset:2px;}
        .qch-ts{color:var(--ink);font-weight:800;}
        .qch-td{color:var(--muted);}
        .qch-tdot{width:4px;height:4px;border-radius:50%;background:var(--border);margin:0 14px;flex:none;}
        .qch-tico{width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;flex:none;}
        .qch-tico-play{background:rgba(46,163,106,0.22);}
        .qch-tico-lead{background:rgba(232,180,58,0.2);}
        .qch-tico-duel{background:rgba(201,79,79,0.22);}
        .qch-tico-new,.qch-tico-stat{background:rgba(59,116,232,0.28);}
        .qch-tico-top{background:rgba(232,180,58,0.22);}
        .qch-tico-champ{background:rgba(232,180,58,0.16);}
        .qch-tico-ach{background:rgba(183,156,242,0.24);}
        .qch-tico-streak{background:rgba(245,137,62,0.22);}
        .qch-hub-me{margin-left:2px;}
        .qch-hidefit{display:none !important;}
        @media(max-width:1180px){.qch-src{display:none;}}
        @media(max-width:1024px){.qch-hub-me{display:none;}}
        @media(max-width:980px){.qch-sub{display:none;}.qch-hubtxt{display:none;}.qch-hub{padding:8px 10px;}}
        @media(max-width:820px){.qch-wl{display:none;}.qch-ws{display:inline-flex;align-items:center;}.qch-searchbtn{display:inline-flex;margin-left:auto;}.qch-me{margin-left:0;}.qch-nm{max-width:none;}}
        @media(max-width:620px){.qch-rankm{display:block;}.qch-ava{display:none;}.qch-hi{display:none;}.qch-bar{gap:9px;padding-left:12px;padding-right:12px;}.qch-seg a{padding:6px 10px;font-size:11px;}.qch-tlabel{display:none;}.qch-word{font-size:17px;}}
        @media(max-width:768px){.qch-tickwrap{display:none;}}
        @media(max-width:560px){.qch-bar{padding-top:calc(9px + env(safe-area-inset-top));}}
        /* Mobile header (owner 2026-07-29, rev 3): three slots, edges fixed, the
           identity absolutely centred in the bar for BOTH states so it is centred
           in the header rather than merely sitting between the side controls.
           Registered players put the search button on the left edge, so the brand
           steps aside there. Guests keep the brand on the left instead, since they
           get no search, and no Stat Hub either. Note .qch-brandlogo carries an
           inline display:flex, so hiding it needs !important. */
        @media(max-width:600px){
          .qch-bar{justify-content:space-between;}
          /* Owner 2026-07-30: keep the SoT wordmark on the left edge (it already
             precedes the search button in the DOM). Only the tagline goes. */
          .qch-src{display:none !important;}
          .qch-word{font-size:15px;flex:none;}
          .qch-hub{display:none !important;}
          .qch-searchbtn{margin-left:0 !important;flex:none;}
          .qch-burger{margin-left:auto;flex:none;}
          /* Reserve grew from 132px: the wordmark now sits on the left edge
             alongside the search button, and the identity is absolutely centred,
             so it must be told about the extra side furniture or it overlaps. */
          .qch-me{position:absolute;left:50%;transform:translateX(-50%);margin:0;display:flex;justify-content:center;flex:none;max-width:calc(100% - 188px);}
          .qch-melink{justify-content:center;min-width:0;gap:0;}
          .qch-mecol{flex-direction:column;align-items:center;gap:1px;min-width:0;}
          .qch-nm,.qch-rankm{text-align:center;max-width:100%;}
          .qch-bar.is-user .qch-brandlogo{display:none !important;}
          .qch-bar.is-guest .qch-searchbtn{display:none !important;}
          .qch-bar.is-guest .qch-brandlogo{flex:none;}
          .qch-bar.is-guest .qch-melink{gap:9px;}
        }
      `}</style>
      <div className={`qch-bar ${found ? 'is-user' : 'is-guest'}`} ref={barRef}>
        <Link href="/" className="qch-brandlogo" ref={logoRef} style={{ flex: 'none', display: 'flex' }} aria-label="Mind Loft home"><Logo size={30} /></Link>
        <Link href="/" className="qch-word"><span className="qch-wl">Mind <em>Loft</em></span><span className="qch-ws"><MindLoftMark size={22} /></span></Link>
        <span className="qch-src">Elevate Your Thinking</span>
        <button type="button" className="qch-searchbtn" ref={btnRef} onClick={focusListSearch} aria-label="Search quizzes"><SearchIcon /></button>
        <div className="qch-me">
          {found ? (
            <Link href="/quizzes/hub" className="qch-melink" title="Stat Hub - your stats">
              <span className="qch-ava">{(me.name || '?').slice(0, 1).toUpperCase()}</span>
              <span className="qch-mecol">
                <span className="qch-nm" ref={nmRef}><span className="qch-hi">Welcome</span> {me.name}{signed ? <span className="qch-chk">✓</span> : null}</span>
                <span className="qch-sub">
                  {rank ? <>{`Rank #${fmtK(rank)}`}{totalPlayers ? <span className="qch-of">{` of ${totalPlayers.toLocaleString()}`}</span> : null}</> : null}
                  {rank && xp != null ? ' · ' : ''}
                  {xp != null ? `${xp.toLocaleString()} IQ` : ''}
                  {(rank || xp != null) && completed != null ? ' · ' : ''}
                  {completed != null ? `${completed.toLocaleString()} completed` : ''}
                  {completed != null && donePct ? ` · ${donePct}` : ''}
                </span>
                {rank || xp != null ? (
                  <span className="qch-rankm">
                    {rank ? `Rank #${fmtK(rank)}` : ''}
                    {rank && xp != null ? ' · ' : ''}
                    {xp != null ? `${xp.toLocaleString()} IQ` : ''}
                  </span>
                ) : null}
              </span>
            </Link>
          ) : (
            <div className="qch-melink">
              {guestName ? (
                <>
                  <span className="qch-ava">G</span>
                  <span className="qch-mecol">
                    <span className="qch-nm" ref={nmRef}><span className="qch-hi">Welcome</span> {guestName}</span>
                    <span className="qch-sub">Sign up to keep your scores and rank</span>
                  </span>
                </>
              ) : null}
              <button type="button" className="qch-signup" onClick={onSignup}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M15 19a5 5 0 0 0-10 0M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 8v6M22 11h-6" /></svg>
                Sign Up
              </button>
            </div>
          )}
        </div>
        {/* Stat Hub button. ALWAYS sits immediately to the LEFT of the
            Lists/Quizzes toggle, whether or not the visitor is signed in.
            Signed-in players get qch-hub-me, which collapses at <=1024px (one
            step after the sources pill at 1180px, since the name/avatar also
            links to the hub). New visitors get the plain qch-hub, which shrinks
            to an icon on mobile but never fully hides. Same responsive hide /
            shift-to-icon rules as before; only the signed-out button moved (it
            used to sit to the RIGHT of the toggle). */}
        <Link href="/quizzes/hub" className={found ? 'qch-hub qch-hub-me' : 'qch-hub'} title="Stat Hub — your stats">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
          <span className="qch-hubtxt">Stat Hub</span>
        </Link>
        <nav className="qch-seg">
          <Link href="/" className="on">Puzzles &amp; Quizzes</Link>
          <Link href="/lists">Top 10 Lists</Link>
        </nav>
        <details className="qch-burger">
          <summary aria-label="Open menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2.4" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></summary>
          <div className="qch-bmenu">
            <Link href="/" className="on">Puzzles &amp; Quizzes</Link>
            <Link href="/lists">Top 10 Lists</Link>
          </div>
        </details>
      </div>
      {items.length ? (
        <div className="qch-tickwrap">
          <div className="qch-tlabel"><span className="qch-pulse" /> Live</div>
          <div className="qch-ticker">
            <div className="qch-track" style={{ animationDuration: dur }}>
              <TickSet items={items} />
              <TickSet items={items} hidden />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
