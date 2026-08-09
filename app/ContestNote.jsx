'use client';

// The contest terms, in ONE component, shown in EVERY share pop-up (owner,
// 2026-08-08).
//
// A button that promises a prize has to land the reader somewhere that states
// the prize, the deadline and the rules. Three surfaces open off a Share
// button (the global ShareCreditPop, the quiz-home "How to get credit" modal,
// and any future one) and each was free to say something different about the
// contest, or nothing at all. They all render THIS instead, and every figure
// in it comes from lib/contest, so changing the prize or the window stays a
// one-file edit.
//
// Renders NOTHING when the contest is not live, so a pop-up outside the window
// simply goes back to being about the share link.

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import { CONTEST, COPY, contestIsLive } from '@/lib/contest';

export default function ContestNote({ style }) {
  // The clock is read AFTER mount, never during render: these pop-ups ship
  // inside statically rendered pages, and a server/client disagreement about
  // whether the contest is live is a hydration error.
  const [live, setLive] = useState(false);
  useEffect(() => { setLive(contestIsLive()); }, []);
  if (!live) return null;
  return (
    <div style={{
      background: T.accentSoft,
      border: `1px solid ${T.accentBorder}`,
      borderRadius: 12,
      padding: '12px 14px',
      margin: '0 0 16px',
      fontFamily: "'Manrope', system-ui, -apple-system, sans-serif",
      ...(style || {}),
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: T.accent, letterSpacing: '-.01em' }}>{COPY.headline}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.slate }}>{COPY.prizeLine}</span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: T.ink, lineHeight: 1.45, marginBottom: 3 }}>
        {COPY.formulaLine}
      </div>
      <div style={{ fontSize: 11.5, color: T.slate, lineHeight: 1.45, marginBottom: 5 }}>
        {COPY.formulaSub}
      </div>
      <div style={{ fontSize: 11.5, color: T.slate, lineHeight: 1.45 }}>
        {COPY.deadlineLine} {COPY.emailLine} {COPY.fraudLine}{' '}
        <a href="/quizzes/contest" style={{ color: T.blue, fontWeight: 700, textDecoration: 'none' }}>Full rules</a>
      </div>
    </div>
  );
}
