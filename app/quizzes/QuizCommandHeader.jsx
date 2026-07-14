'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import SourcesPopover from '../SourcesPopover';
import { getAllSources } from '@/lib/sources';
import { QUIZ_COUNT } from '../SiteHeader';

// Full-bleed command-bar header for the quizzes HOME page only (individual
// quiz pages, the Stat Hub, and the lists site keep SiteHeader). One 56px
// blue bar spanning the whole viewport: brand, search (bound to the browse
// filter below), player chip, Lists/Quizzes nav, Stat Hub CTA. Under it runs
// a live ticker tape of recent plays, correct-today leaders, duel results,
// and new quizzes, built from data the page already fetches. Collapse order
// as the window narrows: sources pill -> player stat subline + Stat Hub text
// -> wordmark shortens to SoT and search becomes an icon -> avatar only.
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const SOURCE_COUNT = getAllSources().length;

function fmtK(n) { return (typeof n === 'number' && n > 999) ? `${(n / 1000).toFixed(1)}k` : (n != null ? n.toLocaleString() : n); }

let __qchLogoSeq = 0;
function Logo({ size = 30 }) {
  const uid = useMemo(() => `qch${(__qchLogoSeq += 1)}`, []);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Source of Truths" style={{ flex: 'none', display: 'block' }}>
      <defs>
        <radialGradient id={`g-${uid}`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" /><stop offset="0.55" stopColor="#fbb615" /><stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill="rgba(255,255,255,0.14)" />
      <circle cx="32" cy="32.5" r="16.4" stroke="#ffffff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#ffffff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill={`url(#g-${uid})`} />
    </svg>
  );
}

const SearchIcon = ({ c = '#dbe7ff' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" style={{ flex: 'none' }} aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

// Per-type ticker icons (play / lead / duel / new / stat).
const TICO = {
  play: <svg width="10" height="10" viewBox="0 0 24 24" fill="#5ad48f" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>,
  lead: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#e8b43a" strokeWidth="2.4" aria-hidden="true"><path d="M3 17h18M4 17 3 7l5 4 4-7 4 7 5-4-1 10" /></svg>,
  duel: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f08a8a" strokeWidth="2.2" aria-hidden="true"><path d="m4 4 16 16M20 4 4 20" /></svg>,
  new: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9dbcf7" strokeWidth="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  stat: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9dbcf7" strokeWidth="2.4" aria-hidden="true"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>,
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
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }, 350);
  } catch {}
}

export default function QuizCommandHeader({ search, onSearch, me, onSignup, ticker = [] }) {
  const found = !!(me && me.found);
  const signed = !!(found && me.signed);
  const rank = found ? ((me.ranks && me.ranks.xp) || me.rank) : null;
  const completed = (found && me.activity && me.activity.completed != null) ? me.activity.completed : null;
  // Duplicate short item lists so the looping track never shows a hole.
  const items = ticker.length ? (ticker.length < 8 ? [...ticker, ...ticker] : ticker) : [];
  const dur = `${Math.min(96, Math.max(36, items.length * 5))}s`;
  return (
    <div className="qch" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .qch-bar{display:flex;align-items:center;gap:12px;min-height:56px;padding:9px clamp(14px,2vw,24px);background:linear-gradient(100deg,#2f6bee,#1d4ed8);}
        .qch-word{font-size:18px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#fff;text-decoration:underline;text-decoration-color:rgba(255,255,255,0.35);text-underline-offset:3px;text-decoration-thickness:1px;white-space:nowrap;flex:none;}
        .qch-word em{font-style:normal;color:#c9ced8;font-weight:600;}
        .qch-ws{display:none;}
        .qch-src{font-size:9.5px;font-weight:800;letter-spacing:normal;text-transform:uppercase;color:#fff;flex:none;}
        .qch-search{flex:1 1 0;min-width:120px;max-width:640px;display:flex;align-items:center;gap:7px;height:36px;padding:0 12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);border-radius:11px;}
        .qch-search input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#fff;font-family:inherit;font-size:13px;font-weight:600;}
        .qch-search input::placeholder{color:#c7d7fb;opacity:1;}
        .qch-search:focus-within{border-color:rgba(255,255,255,0.55);background:rgba(255,255,255,0.2);}
        .qch-searchbtn{display:none;align-items:center;justify-content:center;width:36px;height:36px;flex:none;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.22);border-radius:10px;cursor:pointer;padding:0;}
        .qch-me{margin-left:auto;flex:none;min-width:0;}
        .qch-melink{display:flex;align-items:center;gap:8px;text-decoration:none;min-width:0;}
        .qch-ava{width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;flex:none;}
        .qch-mecol{display:flex;flex-direction:column;gap:2px;min-width:0;}
        .qch-nm{display:flex;align-items:center;gap:5px;font-size:13.5px;font-weight:800;color:#fff;line-height:1;white-space:nowrap;max-width:150px;overflow:hidden;text-overflow:ellipsis;}
        .qch-sub{font-size:10.5px;font-weight:700;color:#bcd2fb;line-height:1;white-space:nowrap;}
        .qch-rankm{display:none;font-size:11px;font-weight:800;color:#dbe7ff;line-height:1;white-space:nowrap;}
        .qch-chk{display:inline-flex;width:13px;height:13px;border-radius:50%;background:#fff;color:#2563eb;font-size:8.5px;font-weight:800;align-items:center;justify-content:center;flex:none;}
        .qch-signup{display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid rgba(255,255,255,0.45);border-radius:9px;color:#fff;font-family:inherit;font-size:12.5px;font-weight:800;padding:8px 12px;cursor:pointer;white-space:nowrap;}
        .qch-signup:hover{background:rgba(255,255,255,0.14);border-color:#fff;}
        .qch-seg{display:flex;gap:2px;background:rgba(255,255,255,0.16);border-radius:999px;padding:3px;flex:none;}
        .qch-seg a{font-size:12px;font-weight:700;color:#fff;text-decoration:none;padding:6px 12px;border-radius:999px;white-space:nowrap;}
        .qch-seg a.on{background:#fff;color:#2563eb;}
        .qch-hub{display:inline-flex;align-items:center;gap:6px;background:#fff;color:#2563eb;font-size:12.5px;font-weight:800;border-radius:10px;padding:8px 13px;text-decoration:none;white-space:nowrap;flex:none;}
        .qch-tickwrap{display:flex;align-items:stretch;background:#0e1b33;}
        .qch-tlabel{display:flex;align-items:center;gap:6px;flex:none;padding:0 14px 0 clamp(14px,2vw,24px);background:#132443;font-size:10px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#8ea6d8;position:relative;z-index:2;}
        .qch-pulse{width:6px;height:6px;border-radius:50%;background:#5ad48f;box-shadow:0 0 0 0 rgba(90,212,143,0.5);animation:qchpul 2s infinite;}
        @keyframes qchpul{0%{box-shadow:0 0 0 0 rgba(90,212,143,0.45)}70%{box-shadow:0 0 0 7px rgba(90,212,143,0)}100%{box-shadow:0 0 0 0 rgba(90,212,143,0)}}
        .qch-ticker{position:relative;overflow:hidden;flex:1 1 0;min-width:0;height:34px;}
        .qch-ticker:before,.qch-ticker:after{content:'';position:absolute;top:0;bottom:0;width:30px;z-index:1;pointer-events:none;}
        .qch-ticker:before{left:0;background:linear-gradient(90deg,#0e1b33,rgba(14,27,51,0));}
        .qch-ticker:after{right:0;background:linear-gradient(270deg,#0e1b33,rgba(14,27,51,0));}
        .qch-track{display:flex;align-items:center;height:34px;width:max-content;animation:qchtick linear infinite;}
        @keyframes qchtick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .qch-ticker:hover .qch-track{animation-play-state:paused;}
        @media (prefers-reduced-motion: reduce){.qch-track{animation:none;}}
        .qch-set{display:flex;align-items:center;flex:none;}
        .qch-titem{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#dfe7f5;text-decoration:none;white-space:nowrap;}
        .qch-titem:hover .qch-ts{text-decoration:underline;text-underline-offset:2px;}
        .qch-ts{color:#fff;font-weight:800;}
        .qch-td{color:#8ea6d8;}
        .qch-tdot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.25);margin:0 14px;flex:none;}
        .qch-tico{width:17px;height:17px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;flex:none;}
        .qch-tico-play{background:rgba(46,163,106,0.22);}
        .qch-tico-lead{background:rgba(232,180,58,0.2);}
        .qch-tico-duel{background:rgba(201,79,79,0.22);}
        .qch-tico-new,.qch-tico-stat{background:rgba(59,116,232,0.28);}
        .qch-hub-me{margin-left:2px;}
        @media(max-width:1180px){.qch-src{display:none;}}
        @media(max-width:1024px){.qch-hub-me{display:none;}}
        @media(max-width:980px){.qch-sub{display:none;}.qch-hubtxt{display:none;}.qch-hub{padding:8px 10px;}}
        @media(max-width:820px){.qch-wl{display:none;}.qch-ws{display:inline;}.qch-search{display:none;}}
        @media(max-width:620px){.qch-brandlogo{display:none;}.qch-rankm{display:block;}.qch-nm{max-width:120px;}.qch-bar{gap:9px;padding-left:12px;padding-right:12px;}.qch-seg a{padding:6px 10px;font-size:11px;}.qch-tlabel{display:none;}.qch-word{font-size:17px;}}
        @media(max-width:560px){.qch-bar{padding-top:calc(9px + env(safe-area-inset-top));}}
      `}</style>
      <div className="qch-bar">
        <Link href="/" className="qch-brandlogo" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><Logo size={30} /></Link>
        <Link href="/" className="qch-word"><span className="qch-wl">Source <em>of</em> Truths</span><span className="qch-ws">S<em>o</em>T</span></Link>
        <span className="qch-src"><SourcesPopover align="left" onDark href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /></span>
        <div className="qch-search">
          <SearchIcon />
          <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={`Search ${QUIZ_COUNT.toLocaleString()} quizzes…`} aria-label="Search quizzes" autoComplete="off" />
        </div>
        <button type="button" className="qch-searchbtn" onClick={focusListSearch} aria-label="Search quizzes"><SearchIcon /></button>
        <div className="qch-me">
          {found ? (
            <Link href="/quizzes/hub" className="qch-melink" title="Stat Hub - your stats">
              <span className="qch-ava">{(me.name || '?').slice(0, 1).toUpperCase()}</span>
              <span className="qch-mecol">
                <span className="qch-nm">{me.name}{signed ? <span className="qch-chk">✓</span> : null}</span>
                <span className="qch-sub">{rank ? `Rank #${fmtK(rank)}` : ''}{rank && completed != null ? ' · ' : ''}{completed != null ? `${completed} completed` : ''}</span>
                {rank ? <span className="qch-rankm">Rank #{fmtK(rank)}</span> : null}
              </span>
            </Link>
          ) : (
            <button type="button" className="qch-signup" onClick={onSignup}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M15 19a5 5 0 0 0-10 0M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19 8v6M22 11h-6" /></svg>
              Sign Up
            </button>
          )}
        </div>
        {/* Desktop-only Stat Hub button sitting right by the player chip. The
            name/avatar itself still links to the hub; this is the explicit CTA
            brought back for signed-in players. It collapses at <=1024px (see
            .qch-hub-me), one step after the sources pill (1180px) — so the
            "Experts and Aggregators" pill is always the first thing to drop. */}
        {found ? (
          <Link href="/quizzes/hub" className="qch-hub qch-hub-me" title="Stat Hub — your stats">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
            <span className="qch-hubtxt">Stat Hub</span>
          </Link>
        ) : null}
        <nav className="qch-seg">
          <Link href="/">Top 10 Lists</Link>
          <Link href="/quizzes" className="on">Quizzes</Link>
        </nav>
        {/* New visitors (no player chip yet) get the end-of-bar Stat Hub CTA.
            Signed-in players get the qch-hub-me button by their chip above
            instead, and can also click their name/avatar to reach the hub. */}
        {!found ? (
          <Link href="/quizzes/hub" className="qch-hub">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
            <span className="qch-hubtxt">Stat Hub</span>
          </Link>
        ) : null}
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
