'use client';
import React from 'react';
import { Trophy } from 'lucide-react';

// Slim, always-visible top-3 leaderboard strip rendered directly under the quiz
// title on EVERY quiz format. One scrollable line: a trophy, medal-ranked top
// three with scores (the current player highlighted), the play count, and a
// "View all" affordance that opens the full Leaderboard. When the quiz has no
// scores yet it still renders a thin "be the first" link so the leaderboard
// stays reachable without the old tab selector. Styled to the index system
// (white card, hairline border, medal circles, blue accent).

const C = { ink: '#1c1e24', soft: '#9aa0ab', muted: '#6b7280', acc: '#2563eb', line: 'rgba(20,22,28,0.09)', gold: '#e8b43a', silver: '#aeb4bd', bronze: '#c88a55' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const MEDAL = [C.gold, C.silver, C.bronze];

export default function LeaderboardStrip({ board, identity, onOpen }) {
  const rows = (identity ? board && board.leaderboard : board && board.leaderboardAll) || [];
  const plays = (board && board.plays) || 0;
  const wrap = (kids) => (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (onOpen) onOpen(); } }}
      title="See the full leaderboard"
      className="qz-lbstrip"
      style={{ display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box', margin: '11px 0 0', padding: '8px 12px', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer', overflowX: 'auto', whiteSpace: 'nowrap', fontFamily: FONT }}
    >
      <style>{`.qz-lbstrip{scrollbar-width:none;-ms-overflow-style:none;}.qz-lbstrip::-webkit-scrollbar{display:none;}`}</style>
      <Trophy size={13} strokeWidth={2.5} color={C.acc} style={{ flex: 'none', marginRight: 8 }} />
      <span style={{ flex: 'none', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.soft, marginRight: 12 }}>Leaderboard</span>
      {kids}
    </div>
  );
  if (!rows.length) {
    return wrap(<span style={{ flex: 'none', fontSize: 12.5, color: C.muted }}>Be the first to post a score <span style={{ color: C.acc, fontWeight: 700 }}>&rarr;</span></span>);
  }
  const top = rows.slice(0, 3);
  const mine = (r) => !!(identity && r.username === identity.username);
  return wrap(
    <>
      {top.map((r, i) => (
        <span key={`${r.username || 'p'}-${i}`} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 13 }}>
          <span style={{ width: 17, height: 17, borderRadius: '50%', background: MEDAL[i], color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{i + 1}</span>
          <span style={{ fontSize: 12.5, fontWeight: mine(r) ? 800 : 600, color: mine(r) ? C.acc : C.ink, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(r.username || 'Player') + (mine(r) ? ' (you)' : '')}</span>
          <span style={{ fontSize: 12.5, color: C.soft }}>{r.score}</span>
        </span>
      ))}
      {plays ? <span style={{ flex: 'none', fontSize: 11.5, color: C.soft }}>&middot; {plays.toLocaleString()} {plays === 1 ? 'play' : 'plays'}</span> : null}
      <span style={{ flex: 'none', marginLeft: 'auto', paddingLeft: 14, fontSize: 11, fontWeight: 700, color: C.acc }}>View all &rarr;</span>
    </>
  );
}
