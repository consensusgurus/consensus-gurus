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

// Kids Corner hub. Lists the playable matching games as tiles; each runs on the
// shared MatchGame engine. New games drop in as ACTIVITIES entries. Styled to
// match the live site (Manrope, #f7f8fa surface, white cards, blue #2563eb).
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const PREVIEW = [
  '<svg viewBox="0 0 100 100"><g><path d="M50 16 L78 78 H22 Z" fill="#f4d58a"/><path d="M22 78 H78 l-4 -9 H26 z" fill="#e0a85a"/><circle cx="44" cy="52" r="5" fill="#c0392b"/><circle cx="58" cy="60" r="5" fill="#c0392b"/><circle cx="50" cy="36" r="4" fill="#c0392b"/></g></svg>',
  '<svg viewBox="0 0 100 100"><g><path d="M38 50 h24 l-12 34 z" fill="#e0b070"/><circle cx="50" cy="40" r="18" fill="#f7a6c4"/><circle cx="50" cy="22" r="4" fill="#c0392b"/></g></svg>',
  '<svg viewBox="0 0 100 100"><g><rect x="16" y="40" width="68" height="22" rx="11" fill="#e7b96a"/><rect x="22" y="46" width="56" height="12" rx="6" fill="#c0392b"/><path d="M26 52 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 10 0" fill="none" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></g></svg>',
];

const PIZZA_PREVIEW = [
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#f4d58a"/><g fill="#c0392b"><circle cx="40" cy="40" r="5.5"/><circle cx="60" cy="42" r="5.5"/><circle cx="50" cy="54" r="5.5"/><circle cx="38" cy="60" r="5.5"/><circle cx="62" cy="60" r="5.5"/></g></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#f4d58a"/><g fill="#bda079"><ellipse cx="42" cy="44" rx="6" ry="4"/><rect x="40" y="46" width="4" height="5" rx="1"/><ellipse cx="60" cy="50" rx="6" ry="4"/><rect x="58" y="52" width="4" height="5" rx="1"/><ellipse cx="48" cy="62" rx="6" ry="4"/><rect x="46" y="64" width="4" height="5" rx="1"/></g></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#7a9a4a"/><g fill="#e6dba0"><circle cx="42" cy="44" r="2.5"/><circle cx="58" cy="46" r="2.5"/><circle cx="48" cy="58" r="2.5"/><circle cx="61" cy="58" r="2.5"/></g><circle cx="52" cy="49" r="4.5" fill="#fff" opacity="0.85"/></svg>',
];

const DOG_PREVIEW = [
  '<svg viewBox="0 0 100 100"><ellipse cx="28" cy="46" rx="10" ry="18" fill="#c8893a"/><ellipse cx="72" cy="46" rx="10" ry="18" fill="#c8893a"/><circle cx="50" cy="48" r="26" fill="#e0a24e"/><ellipse cx="50" cy="62" rx="13" ry="11" fill="#efc480"/><circle cx="50" cy="58" r="3.5" fill="#3a2a1a"/><circle cx="41" cy="44" r="3" fill="#3a2a1a"/><circle cx="59" cy="44" r="3" fill="#3a2a1a"/></svg>',
  '<svg viewBox="0 0 100 100"><ellipse cx="26" cy="44" rx="9" ry="16" fill="#2a2a2a"/><ellipse cx="74" cy="44" rx="9" ry="16" fill="#cfcfcf"/><circle cx="50" cy="48" r="26" fill="#fafafa"/><ellipse cx="50" cy="62" rx="13" ry="11" fill="#fff"/><circle cx="50" cy="58" r="3.5" fill="#2a2a2a"/><circle cx="41" cy="44" r="3" fill="#2a2a2a"/><circle cx="59" cy="44" r="3" fill="#2a2a2a"/><g fill="#2a2a2a"><circle cx="38" cy="54" r="3"/><circle cx="62" cy="50" r="2.5"/><circle cx="58" cy="64" r="2.5"/></g></svg>',
  '<svg viewBox="0 0 100 100"><path d="M30 32 l-7 -18 16 9z" fill="#5f6772"/><path d="M70 32 l7 -18 -16 9z" fill="#5f6772"/><circle cx="50" cy="50" r="26" fill="#8b95a0"/><path d="M50 28 q-9 8 -9 22 q0 8 9 14 q9 -6 9 -14 q0 -14 -9 -22z" fill="#f2f5f8"/><ellipse cx="50" cy="62" rx="8" ry="7" fill="#f2f5f8"/><circle cx="50" cy="58" r="3" fill="#2a2a2a"/><circle cx="42" cy="48" r="2.8" fill="#3a6a9a"/><circle cx="58" cy="48" r="2.8" fill="#3a6a9a"/></svg>',
];

const ADD_PREVIEW = [
  '<svg viewBox="0 0 100 100"><text x="50" y="55" font-size="30" font-family="Manrope, system-ui, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">1+1</text></svg>',
  '<svg viewBox="0 0 100 100"><text x="50" y="55" font-size="56" font-family="Manrope, system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#2563eb">2</text></svg>',
  '<svg viewBox="0 0 100 100"><text x="50" y="55" font-size="30" font-family="Manrope, system-ui, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">3+4</text></svg>',
];

const LETTER_PREVIEW = [
  '<svg viewBox="0 0 100 100"><text x="50" y="56" font-size="62" font-family="Manrope, system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">A</text></svg>',
  '<svg viewBox="0 0 100 100"><text x="50" y="56" font-size="62" font-family="Manrope, system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#2563eb">a</text></svg>',
  '<svg viewBox="0 0 100 100"><text x="50" y="56" font-size="62" font-family="Manrope, system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">B</text></svg>',
];

const COLOR_PREVIEW = [
  '<svg viewBox="0 0 100 100"><text x="50" y="55" font-size="26" font-family="Manrope, system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">Red</text></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="33" fill="#e23b3b"/></svg>',
  '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="33" fill="#2f7be0"/></svg>',
];

const ACTIVITIES = [
  { id: 'memory-match', href: '/kids/memory-match', title: 'Treats Match', desc: 'Flip the cards and find the matching treats. Up to four players.', tag: 'Game', ready: true, band: '#eef3fe', preview: PREVIEW },
  { id: 'pizza-match', href: '/kids/pizza-match', title: 'Pizza Match', desc: 'Find all fourteen matching pizzas. Up to four players.', tag: 'Game', ready: true, band: '#fdeede', preview: PIZZA_PREVIEW },
  { id: 'dog-match', href: '/kids/dog-match', title: 'Dog Match', desc: 'Find all fourteen matching dog breeds. Up to four players.', tag: 'Game', ready: true, band: '#eaf6ef', preview: DOG_PREVIEW },
  { id: 'color-match', href: '/kids/color-match', title: 'Color Match', desc: 'Match each color word to its color. Ten pairs.', tag: 'Learning', ready: true, band: '#fdeaea', preview: COLOR_PREVIEW },
  { id: 'addition-match', href: '/kids/addition-match', title: 'Addition Match', desc: 'Match each addition to its answer. Fourteen pairs.', tag: 'Learning', ready: true, band: '#eef3fe', preview: ADD_PREVIEW },
  { id: 'letter-match', href: '/kids/letter-match', title: 'Letter Match', desc: 'Match capital and lowercase letters. Twenty-six pairs.', tag: 'Learning', ready: true, band: '#fde7f0', preview: LETTER_PREVIEW },
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
          A growing collection of simple, free games and activities. No sign-up, no ads in the way, just tap and play. Pick a game below to start.
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
