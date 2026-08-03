'use client';
import React from 'react';
import { T } from '@/lib/theme';

// One-line CTA on the end-of-game card for players who have NOT registered:
// it tells them where their just-finished score would land on the REGISTERED
// leaderboard, with "register" as an inline link that opens the sign-up form.
// The card supplies onRegister (QuizClient opens the inline claim box; the other
// boards switch to the Join tab). Renders nothing when the rank can't be
// computed or no register handler is supplied (so it never shows for players who
// are already registered, or in the non-results leaderboard views).
const C = { ink: T.ink, ember: T.accent, accSoft: T.accentSoft, accBorder: T.accentBorder };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function RegisterRankLine({ rank, onRegister, margin = '0 0 16px' }) {
  if (rank == null || !onRegister) return null;
  return (
    <div style={{ margin, background: C.accSoft, border: `1px solid ${C.accBorder}`, borderRadius: 10, padding: '11px 14px', fontFamily: FONT, fontSize: 13.5, lineHeight: 1.4, color: C.ink, textAlign: 'center' }}>
      You would be <b style={{ color: C.ember, fontWeight: 800 }}>#{rank}</b> on the leaderboard if you{' '}
      <button onClick={onRegister} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: C.ember, fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>register</button>.
    </div>
  );
}
