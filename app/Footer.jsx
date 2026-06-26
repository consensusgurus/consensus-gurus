'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Shared, site-wide footer. Deliberately font/brand-neutral (it inherits the
// surrounding page's body font and uses neutral grays) so it reads correctly on
// BOTH the cream list/home pages and the blue quiz pages. No heavy accent color.
const NEUTRAL = {
  ink: '#1c1e24',
  muted: '#6b7280',
  soft: '#9aa0ab',
  line: 'rgba(20,22,28,0.12)',
};

const COLS = [
  {
    head: 'Lists',
    links: [
      { label: 'Browse Lists', href: '/' },
      { label: 'Activity Log', href: '/feed' },
      { label: 'Experts and Aggregators', href: '/experts-and-aggregators' },
      { label: 'Request a List', href: '/request' },
    ],
  },
  {
    head: 'Quizzes',
    links: [
      { label: 'Browse Quizzes', href: '/quizzes' },
      { label: 'NYC Restaurant Geo Guesser', href: '/quiz/nyc-restaurant-geo-guesser' },
      { label: 'Stat Hub', href: '/quizzes/hub' },
      { label: 'Request a Quiz', href: '/request' },
    ],
  },
  {
    head: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Disclosure', href: '/disclosure' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [vis, setVis] = useState(null);
  useEffect(() => {
    let on = true;
    fetch('/api/visitors').then((r) => r.json()).then((d) => { if (on && d && typeof d.visitors === 'number') setVis(d.visitors); }).catch(() => {});
    return () => { on = false; };
  }, []);
  return (
    <footer
      style={{
        borderTop: `1px solid ${NEUTRAL.line}`,
        marginTop: 30,
        padding: '26px 24px 20px',
        position: 'relative',
        zIndex: 2,
        background: 'transparent',
        color: NEUTRAL.ink,
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: 250 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>Source of Truths</div>
          <div style={{ fontSize: 12, color: NEUTRAL.muted, marginTop: 5, lineHeight: 1.5 }}>
            Consensus lists and timed quizzes for everything worth knowing.
          </div>
          {vis != null && (<div style={{ fontSize: 11.5, color: NEUTRAL.soft, marginTop: 10 }}>{vis.toLocaleString()} visitors</div>)}
        </div>
        {COLS.map((col) => (
          <div key={col.head}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: NEUTRAL.soft,
                marginBottom: 9,
              }}
            >
              {col.head}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ fontSize: 12.5, color: NEUTRAL.muted, textDecoration: 'none' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          maxWidth: 1040,
          margin: '16px auto 0',
          paddingTop: 14,
          borderTop: `1px solid ${NEUTRAL.line}`,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
          color: NEUTRAL.soft,
        }}
      >
        <span>© {year} Source of Truths</span>
        <span>As an Amazon Associate, Source of Truths earns from qualifying purchases.</span>
      </div>
    </footer>
  );
}
