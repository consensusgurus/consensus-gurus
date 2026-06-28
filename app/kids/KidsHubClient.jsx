'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import SiteHeader from '../SiteHeader';
import Grain from '../Grain';
import Footer from '../Footer';
import { formatCount } from '../Count';

const Eye = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);

// Kids Corner hub. A landing page that lists kids' games and learning
// activities as tiles; the first playable one is Memory Match. New activities
// drop in as additional entries in ACTIVITIES. Styled to match the live site
// (Manrope, #f7f8fa surface, white cards, blue #2563eb accent, sentence case).
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const PREVIEW = [
  '<svg viewBox="0 0 100 100"><g><path d="M50 16 L78 78 H22 Z" fill="#f4d58a"/><path d="M22 78 H78 l-4 -9 H26 z" fill="#e0a85a"/><circle cx="44" cy="52" r="5" fill="#c0392b"/><circle cx="58" cy="60" r="5" fill="#c0392b"/><circle cx="50" cy="36" r="4" fill="#c0392b"/></g></svg>',
  '<svg viewBox="0 0 100 100"><g><path d="M38 50 h24 l-12 34 z" fill="#e0b070"/><circle cx="50" cy="40" r="18" fill="#f7a6c4"/><circle cx="50" cy="22" r="4" fill="#c0392b"/></g></svg>',
  '<svg viewBox="0 0 100 100"><g><rect x="16" y="40" width="68" height="22" rx="11" fill="#e7b96a"/><rect x="22" y="46" width="56" height="12" rx="6" fill="#c0392b"/><path d="M26 52 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 10 0" fill="none" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></g></svg>',
];

const ICON_COUNT = '<svg viewBox="0 0 100 100"><g fill="none" stroke="#1d9e75" stroke-width="7" stroke-linecap="round"><path d="M34 26 L26 26 L26 74"/><path d="M52 26 q22 0 22 14 q0 14 -22 18 q22 4 22 18 q0 14 -22 14"/></g></svg>';
const ICON_SHAPES = '<svg viewBox="0 0 100 100"><circle cx="32" cy="34" r="16" fill="#e24b4a"/><rect x="52" y="50" width="30" height="30" rx="5" fill="#2563eb"/><path d="M30 58 L46 86 L14 86 Z" fill="#f2b705"/></svg>';
const ICON_SPOT = '<svg viewBox="0 0 100 100"><g fill="none" stroke="#7f5ad6" stroke-width="7" stroke-linecap="round"><circle cx="42" cy="42" r="22"/><path d="M58 58 L78 78"/></g></svg>';

const ACTIVITIES = [
  { id: 'memory-match', href: '/kids/memory-match', title: 'Memory Match', desc: 'Flip the cards and find the matching snacks. One player or two.', tag: 'Game', ready: true, band: '#eef3fe', preview: PREVIEW },
  { id: 'counting', title: 'Counting Fun', desc: 'Tap and count along with friendly pictures.', tag: 'Learning', ready: false, band: '#e7f6ef', icon: ICON_COUNT },
  { id: 'shapes', title: 'Shapes & Colors', desc: 'Match the shape to its color and name.', tag: 'Learning', ready: false, band: '#fdeedd', icon: ICON_SHAPES },
  { id: 'spot', title: 'Spot the Difference', desc: 'Find what changed between two pictures.', tag: 'Game', ready: false, band: '#f1ecfb', icon: ICON_SPOT },
];

function Tile({ a }) {
  const inner = (
    <div className="kc-tile">
      <div className="kc-band" style={{ background: a.band }}>
        {a.preview ? (
          <div className="kc-prev">
            {a.preview.map((svg, i) => (
              <span key={i} className="kc-prevcard" dangerouslySetInnerHTML={{ __html: svg }} />
            ))}
          </div>
        ) : (
          <span className="kc-icon" dangerouslySetInnerHTML={{ __html: a.icon }} />
        )}
        <span className={`kc-pill${a.ready ? ' on' : ''}`}>{a.ready ? 'Play' : 'Coming soon'}</span>
      </div>
      <div className="kc-body">
        <span className="kc-tag">{a.tag}</span>
        <h3 className="kc-title">{a.title}</h3>
        <p className="kc-desc">{a.desc}</p>
      </div>
    </div>
  );
  if (a.ready && a.href) return <Link href={a.href} className="kc-link">{inner}</Link>;
  return <div className="kc-link kc-soft" aria-disabled="true">{inner}</div>;
}

export default function KidsHubClient() {
  const [views, setViews] = useState(null);
  useEffect(() => {
    let on = true;
    fetch('/api/quiz/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: 'kids' }) })
      .then((r) => r.json())
      .then((d) => { if (on && d && typeof d.count === 'number') setViews(d.count); })
      .catch(() => {});
    return () => { on = false; };
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: C.ink, position: 'relative', overflow: 'clip', fontFamily: FONT }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteHeader active="" />
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '20px 22px 70px' }}>
        <style>{`
          .kc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-top:22px;}
          .kc-link{text-decoration:none;color:inherit;display:block;}
          .kc-tile{height:100%;background:#fff;border:1px solid ${C.line};border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:box-shadow .15s,transform .15s,border-color .15s;}
          .kc-link:not(.kc-soft):hover .kc-tile{box-shadow:0 8px 24px rgba(20,22,28,0.10);transform:translateY(-2px);border-color:${C.accent};}
          .kc-soft{cursor:default;}
          .kc-soft .kc-tile{opacity:.72;}
          .kc-band{position:relative;height:128px;display:flex;align-items:center;justify-content:center;}
          .kc-prev{display:flex;gap:10px;}
          .kc-prevcard{width:54px;height:54px;background:#fff;border:1px solid ${C.line};border-radius:11px;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(20,22,28,0.08);}
          .kc-prevcard svg{width:70%;height:70%;}
          .kc-icon{width:64px;height:64px;display:flex;}
          .kc-icon svg{width:100%;height:100%;}
          .kc-pill{position:absolute;top:10px;right:10px;font-size:11px;font-weight:800;letter-spacing:.02em;padding:4px 10px;border-radius:999px;background:rgba(28,30,36,0.55);color:#fff;}
          .kc-pill.on{background:${C.accent};}
          .kc-body{padding:13px 15px 15px;display:flex;flex-direction:column;flex:1;}
          .kc-tag{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${C.soft};}
          .kc-title{font-size:17px;font-weight:800;letter-spacing:-0.01em;margin:5px 0 6px;}
          .kc-desc{font-size:13px;color:${C.muted};line-height:1.45;margin:0;}
          .kc-views{display:flex;align-items:center;gap:6px;font-size:13px;color:${C.soft};font-weight:600;margin:22px 2px 0;}
        `}</style>

        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: C.accent }}>Kids Corner</span>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', margin: '6px 0 8px' }}>Games and Learning for Kids</h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.55, margin: 0, maxWidth: 600 }}>
          A growing collection of simple, free games and activities. No sign-up, no ads in the way, just tap and play. Start with Memory Match below.
        </p>

        <div className="kc-grid">
          {ACTIVITIES.map((a) => <Tile key={a.id} a={a} />)}
        </div>
        <div className="kc-views"><Eye /> {views == null ? '—' : formatCount(views)} views</div>
      </div>
      <Footer />
    </div>
  );
}
