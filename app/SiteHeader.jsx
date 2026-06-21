'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SourcesPopover from './SourcesPopover';
import { getAllSources } from '@/lib/sources';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';

// Shared site header (Lists browse + detail, Quizzes, preload). Inline target/
// star logo. Right side: nav + one stat line (lists/sources/quizzes/visitors);
// "sources" and "quizzes" are clickable but plain-text styled. Responsive:
// on mobile the right block drops to its own full-width, left-aligned row.
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const SOURCE_COUNT = getAllSources().length;
const LIST_COUNT = LISTS.length;
const QUIZ_COUNT = Array.isArray(QUIZZES) ? QUIZZES.length : 0;

// Compact visitor count for the mobile header (e.g. 12,345 -> 12.3k) so the
// figure fits on the same row as the nav buttons.
function compactVis(n) {
  if (typeof n !== 'number' || n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 100 ? Math.round(k) : Math.round(k * 10) / 10}k`;
}

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

export default function SiteHeader({ active = 'lists', maxWidth = 1180, visitors, bare = false }) {
  const linkStyle = (isOn) => ({ textDecoration: 'none', fontSize: 14, fontWeight: isOn ? 700 : 500, color: isOn ? C.ink : C.muted });
  const plain = { color: 'inherit', textDecoration: 'none' };
  // One consistent site-wide visitors figure on EVERY page: fetch it here so the
  // home, quizzes, list-detail, and quiz-play headers all show the same number,
  // regardless of what (if anything) each page passes in.
  // Visitor count moved to the footer (Footer.jsx) so an async load can't shift the header nav.
  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .sh-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:11px 16px;background:#2563eb;border-radius:14px;flex-wrap:wrap;}
        .sh-brand{display:flex;align-items:center;gap:11px;text-decoration:none;flex:none;}
        .sh-word{font-size:21px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:#fff;}
        .sh-right{display:flex;align-items:center;justify-content:flex-end;gap:14px;}
        .sh-nav{display:flex;align-items:center;gap:12px;justify-content:flex-end;flex-wrap:wrap;}
        .sh-navbtn{display:inline-flex;align-items:center;gap:5px;text-decoration:none;font-size:13.5px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:8px;padding:7px 13px;background:transparent;transition:background .15s,border-color .15s,color .15s;}
        .sh-navbtn:hover{background:rgba(255,255,255,0.14);border-color:#fff;color:#fff;}
        .sh-navbtn.on{background:#fff;border-color:#fff;color:${C.accent};}
        .sh-navct{font-weight:600;opacity:0.65;font-size:12px;}
        .sh-stat{font-size:11.5px;color:${C.muted};letter-spacing:0.01em;white-space:nowrap;}
        .sh-vis-compact{display:none;}
        @media(max-width:560px){
          .sh-bar{gap:10px;}
          .sh-word{font-size:19px;}
          .sh-right{flex:1 1 100%;display:flex;align-items:center;justify-content:flex-start;gap:12px;text-align:left;}
          .sh-nav{justify-content:flex-start;gap:12px;flex-wrap:nowrap;flex:1 1 100%;}.sh-navbtn{flex:1 1 0;justify-content:center;}
          .sh-stat{font-size:11px;margin-top:0;line-height:1.4;white-space:nowrap;flex:none;}
          .sh-vis-full{display:none;}
          .sh-vis-compact{display:inline;}
        }
      `}</style>
      <div style={bare ? { padding: '2px 0 0' } : { maxWidth, margin: '0 auto', padding: '10px 24px 0' }}>
        <div className="sh-bar">
          <div className="sh-brand">
            <Link href="/" style={{ flex: 'none', display: 'flex' }} aria-label="Source of Truths home"><Logo size={34} /></Link>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/" className="sh-word" style={{ textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.35)', textUnderlineOffset: '3px', textDecorationThickness: '1px', color: '#fff' }}>Source <span style={{ color: '#000', fontWeight: 600 }}>of</span> Truths</Link>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 'normal', textTransform: 'uppercase', color: '#fff', marginTop: 3 }}>Where <SourcesPopover align="left" href="/experts-and-aggregators" label={`${SOURCE_COUNT.toLocaleString()} Experts and Aggregators`} /> Agree</span>
            </span>
          </div>
          <div className="sh-right">
            <nav className="sh-nav">
              <Link href="/" className={`sh-navbtn${active === 'lists' ? ' on' : ''}`}>Lists <span className="sh-navct">({LIST_COUNT.toLocaleString()})</span></Link>
              <Link href="/quizzes" className={`sh-navbtn${active === 'quizzes' ? ' on' : ''}`}>Quizzes <span className="sh-navct">({QUIZ_COUNT.toLocaleString()})</span></Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
