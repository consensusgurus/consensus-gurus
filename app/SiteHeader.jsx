'use client';
import Link from 'next/link';
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

export default function SiteHeader({ active = 'lists', maxWidth = 1180, visitors }) {
  const linkStyle = (isOn) => ({ textDecoration: 'none', fontSize: 14, fontWeight: isOn ? 700 : 500, color: isOn ? C.ink : C.muted });
  const plain = { color: 'inherit', textDecoration: 'none' };
  return (
    <div style={{ fontFamily: FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        .sh-bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:14px;border-bottom:1px solid ${C.line};flex-wrap:wrap;}
        .sh-brand{display:flex;align-items:center;gap:11px;text-decoration:none;flex:none;}
        .sh-word{font-size:24px;font-weight:800;letter-spacing:-0.025em;line-height:1;color:${C.ink};}
        .sh-right{text-align:right;}
        .sh-nav{display:flex;align-items:center;gap:20px;justify-content:flex-end;}
        .sh-stat{font-size:11.5px;color:${C.muted};margin-top:6px;letter-spacing:0.01em;}
        @media(max-width:560px){
          .sh-bar{gap:10px;}
          .sh-word{font-size:19px;}
          .sh-right{flex:1 1 100%;text-align:left;}
          .sh-nav{justify-content:flex-start;gap:18px;}
          .sh-stat{font-size:11px;margin-top:8px;line-height:1.7;}
        }
      `}</style>
      <div style={{ maxWidth, margin: '0 auto', padding: '16px 24px 0' }}>
        <div className="sh-bar">
          <Link href="/" className="sh-brand">
            <Logo size={40} />
            <span className="sh-word">Source <span style={{ color: C.accent, fontWeight: 600 }}>of</span> Truths</span>
          </Link>
          <div className="sh-right">
            <nav className="sh-nav">
              <Link href="/" style={linkStyle(active === 'lists')}>Lists</Link>
              <Link href="/quizzes" style={linkStyle(active === 'quizzes')}>Quizzes</Link>
            </nav>
            <div className="sh-stat">
              {LIST_COUNT.toLocaleString()} lists{' '}&middot;{' '}
              <Link href="/sources" style={plain}>{SOURCE_COUNT.toLocaleString()} sources</Link>{' '}&middot;{' '}
              <Link href="/quizzes" style={plain}>{QUIZ_COUNT.toLocaleString()} quizzes</Link>{typeof visitors === 'number' ? ` · ${visitors.toLocaleString()} visitors` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
