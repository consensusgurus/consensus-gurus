'use client';
import React from 'react';
import { Trophy } from 'lucide-react';

// Slim, always-visible top-3 leaderboard strip rendered directly under the quiz
// title on EVERY quiz format. One scrollable line: a trophy, the top three
// names and scores, the current player highlighted, and a "View all" affordance
// that opens the full Leaderboard tab. Returns null until the quiz has at least
// one posted score. Mirrors LeaderboardSnippet's registered/all-players choice
// so a signed-in player sees the registered board and everyone else sees all.

const C = { ember: '#2563eb', ink: '#1c1e24', faded: '#6b7280' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function LeaderboardStrip({ board, identity, onOpen }) {
  const rows = (identity ? board && board.leaderboard : board && board.leaderboardAll) || [];
  if (!rows.length) return null;
  const top = rows.slice(0, 3);
  const mine = (r) => !!(identity && r.username === identity.username);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onOpen) onOpen(); } }}
      title="See the full leaderboard"
      className="qz-lbstrip"
      style={{ display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box', margin: '12px 0 0', padding: '8px 12px', background: '#fff', border: `1px solid ${C.faded}33`, borderLeft: `3px solid ${C.ember}`, borderRadius: 8, cursor: 'pointer', overflowX: 'auto', whiteSpace: 'nowrap' }}
    >
      <style>{`.qz-lbstrip{scrollbar-width:none;-ms-overflow-style:none;}.qz-lbstrip::-webkit-scrollbar{display:none;}`}</style>
      <Trophy size={13} strokeWidth={2.5} color={C.ember} style={{ flex: 'none', marginRight: 8 }} />
      <span style={{ flex: 'none', fontFamily: FONT, fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginRight: 12 }}>Leaderboard</span>
      {top.map((r, i) => (
        <span
          key={`${r.username || 'p'}-${i}`}
          style={{ flex: 'none', display: 'inline-flex', alignItems: 'baseline', gap: 5, marginRight: i < top.length - 1 ? 13 : 0, paddingRight: i < top.length - 1 ? 13 : 0, borderRight: i < top.length - 1 ? `1px solid ${C.faded}22` : 'none' }}
        >
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: C.ember }}>{i + 1}</span>
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: mine(r) ? 800 : 600, color: mine(r) ? C.ember : C.ink, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(r.username || 'Player') + (mine(r) ? ' (you)' : '')}</span>
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.faded }}>{r.score}</span>
        </span>
      ))}
      <span style={{ flex: 'none', marginLeft: 'auto', paddingLeft: 16, fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.ember }}>View all &rarr;</span>
    </div>
  );
}
