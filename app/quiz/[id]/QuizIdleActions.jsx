'use client';
import React from 'react';
import { Swords, Trophy } from 'lucide-react';

// Standard pre-quiz (idle screen) action block, shared by EVERY board format
// (owner rule, 2026-07-02): START on its own full-width line (double height on
// desktop, normal on mobile), then Challenge Someone + Leaderboard side by side
// below. All three buttons share the same rounded-rect shape (no pill). The
// covered-board intro card on every quiz page renders this so the pre-quiz
// screen is identical across formats.

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const C = { cream: '#f7f8fa', ink: '#1c1e24', ember: '#2563eb' };

export default function QuizIdleActions({ onStart, startLabel = 'Start', startDisabled = false, quizId, onLeaderboard, style }) {
  const base = {
    fontFamily: FONT, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700,
    height: 52, padding: '0 10px', boxSizing: 'border-box', borderRadius: 10,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
  };
  const startStyle = { ...base };
  delete startStyle.height; // height comes from the .qz-start class (2x on desktop, 1x on mobile)
  return (
    <div style={{ maxWidth: 640, margin: '16px auto 0', ...style }}>
      <style>{`.qz-start{height:104px;font-size:15px;letter-spacing:0.08em;}@media (max-width:760px){.qz-start{height:52px;font-size:12.5px;letter-spacing:0.05em;}}`}</style>
      <button className="qz-start" onClick={onStart} disabled={startDisabled} style={{ ...startStyle, width: '100%', background: C.ember, color: '#fff', opacity: startDisabled ? 0.5 : 1, cursor: startDisabled ? 'default' : 'pointer' }}>
        {startLabel}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 10 }}>
        <a href={`/duel/new?quiz=${encodeURIComponent(quizId || '')}`} style={{ ...base, background: C.ink, color: '#fff' }}>
          <Swords size={14} strokeWidth={2.5} /> Challenge Someone
        </a>
        <button onClick={onLeaderboard} style={{ ...base, background: C.cream, color: C.ink, border: `1.5px solid ${C.ink}` }}>
          <Trophy size={14} strokeWidth={2.5} /> Leaderboard
        </button>
      </div>
    </div>
  );
}
