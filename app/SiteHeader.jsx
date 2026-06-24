'use client';
import Link from 'next/link';
import SourcesPopover from './SourcesPopover';
import { getAllSources } from '@/lib/sources';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';

// Shared site header. Blue header card with the brand + Lists/Quizzes nav on the
// top row, and an optional INLAY slot (a white pill the page passes in) below it:
// category nav on lists home, the section tabs on a list, the player stat bar on
// quizzes. Desktop keeps the card inset and rounded; mobile goes full-bleed and
// the nav condenses to a compact segmented toggle next to the "SoT" mark.
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const SOURCE_COUNT = getAllSources().length;
const LIST_COUNT = LISTS.length;
const QUIZ_COUNT = Array.isArray(QUIZZES) ? QUIZZES.length : 0;

function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Source of Truths" style={{ flex: 'none' }}>
      <defs>
        <linearGradient id="shLogoBlue" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b74f0" /><stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id="shLogoGold" cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" /><stop offset="0.55" stopColor="#fbb615" /><stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#shLogoBlue)" />
      <circle cx="32" cy="32.5" r="16.4" stroke="#ffffff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#ffffff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#shLogoGold)" />
    </svg>
  );
}

export default function SiteHeader({ active = 'lists', maxWidth = 1180, visitors, bare = false, inlay = null }) {
  return (
    <div className="sh-root" style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .sh-bar{display:flex;flex-direction:column;padding:12px 16px;background:#2563eb;border-radius:16px;}
        .sh-top{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;position:relative;z-index:5;}
        .sh-inlay{margin-top:12px;position:relative;z-index:1;}
        .sh-outer{padding:10px 24px 0;}
        .sh-brand{display:flex;align-items:center;gap:11px;text-decoration:none;flex:none;}
        .sh-word{font-size:21px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#fff;}
        .sh-word-sot{display:none;}
        .sh-right{display:flex;align-items:center;justify-content:flex-end;gap:14px;flex:none;}
        .sh-nav{display:flex;align-items:center;gap:12px;justify-content:flex-end;flex-wrap:wrap;}
        .sh-navbtn{display:inline-flex;align-items:center;gap:5px;text-decoration:none;font-size:13.5px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:8px;padding:7px 13px;background:transparent;transition:background .15s,border-color .15s,color .15s;}
        .sh-navbtn:hover{background:rgba(255,255,255,0.14);border-color:#fff;color:#fff;}
        .sh-navbtn.on{background:#fff;border-color:#fff;color:#2563eb;}
        .sh-navct{font-weight:600;opacity:0.65;font-size:12px;}
        @media(max-width:560px){
          .sh-outer{padding:0;}
          .sh-root{width:100vw;margin-left:calc(50% - 50vw);}
          .sh-bar{border-radius:0;padding:calc(11px + env(safe-area-inset-top)) 14px 11px;}
          .sh-top{flex-wrap:nowrap;}
          .sh-word{font-size:18px;}
          .sh-tag{display:none;}
          .sh-right{gap:0;}
          .sh-nav{gap:2px;flex-wrap:nowrap;background:rgba(255,255,255,0.16);border-radius:999px;padding:2px;}
          .sh-navbtn{flex:none;border:none;padding:6px 13px;border-radius:999px;font-size:11.5px;}
          .sh-navbtn:hover{background:transparent;color:#fff;}
          .sh-navbtn.on{background:#fff;color:#2563eb;}
          .sh-navct{display:none;}
          .sh-inlay{margin-top:10px;}
        }
      `}</style>
      <div className={bare ? undefined : 'sh-outer'} style={bare ? { padding: '2px 0 0' } : { maxWidth, margin: '0 auto' }}>
        <div className="sh-bar">
          <div className="sh-top">
            <div className="sh-brand">
              <Link href="/" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><Logo size={34} /></Link>
              <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/" className="sh-word" style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.35)', textUnderlineOffset: '3px', textDecorationThickness: '1px', color: '#fff' }}><span className="sh-word-full">Source <span style={{ color: '#c9ced8', fontWeight: 600 }}>of</span> Truths</span><span className="sh-word-sot">S<span style={{ color: '#c9ced8', fontWeight: 600 }}>o</span>T</span></Link>
                <span className="sh-tag" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 'normal', textTransform: 'uppercase', color: '#fff', marginTop: 0 }}>Where <SourcesPopover align="left" onDark href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /> Agree</span>
              </span>
            </div>
            <div className="sh-right">
              <nav className="sh-nav">
                <Link href="/" className={`sh-navbtn${active === 'lists' ? ' on' : ''}`}>Lists <span className="sh-navct">({LIST_COUNT.toLocaleString()})</span></Link>
                <Link href="/quizzes" className={`sh-navbtn${active === 'quizzes' ? ' on' : ''}`}>Quizzes <span className="sh-navct">({QUIZ_COUNT.toLocaleString()})</span></Link>
              </nav>
            </div>
          </div>
          {inlay ? <div className="sh-inlay">{inlay}</div> : null}
        </div>
      </div>
    </div>
  );
}
