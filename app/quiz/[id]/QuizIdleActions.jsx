'use client';
import React from 'react';
import { Swords, Trophy } from 'lucide-react';

// Standard pre-quiz (idle screen) action row, shared by EVERY board format
// (owner rule, 2026-07-02): three buttons, all the SAME size, in this order:
//
//   [ Start ]  [ Challenge Someone ]  [ Leaderboard ]
//
// Start begins the game (per-board handler). Challenge Someone links to the
// duel composer for this quiz, styled exactly like the end-game Challenge
// Someone buttons (ink background, Swords icon). Leaderboard opens the quiz's
// Stats & Leaderboard view. The covered-board intro card on every quiz page
// renders this row so the pre-quiz screen is identical across formats.

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const C = { cream: '#f7f8fa', ink: '#1c1e24', ember: '#2563eb' };

export default function QuizIdleActions({ onStart, startLabel = 'Start', startDisabled = false, quizId, onLeaderboard, style }) {
  const base = {
    fontFamily: FONT,
    fontSize: 12.5,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontWeight: 700,
    height: 52,
    padding: '0 10px',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, maxWidth: 640, margin: '16px auto 0', ...style }}>
      <button onClick={onStart} disabled={startDisabled} style={{ ...base, background: C.ember, color: '#fff', opacity: startDisabled ? 0.5 : 1, cursor: startDisabled ? 'default' : 'pointer' }}>
        {startLabel}
      </button>
      <a href={`/duel/new?quiz=${encodeURIComponent(quizId || '')}`} style={{ ...base, background: C.ink, color: '#fff' }}>
        <Swords size={14} strokeWidth={2.5} /> Challenge Someone
      </a>
      <button onClick={onLeaderboard} style={{ ...base, background: C.cream, color: C.ink, border: `1.5px solid ${C.ink}` }}>
        <Trophy size={14} strokeWidth={2.5} /> Leaderboard
      </button>
    </div>
  );
}
