'use client';
import React from 'react';
import { T } from '@/lib/theme';

// Shared results-card leaderboard snippet used by every quiz board: top 3, a
// gap, then the player's finishing place (highlighted) when outside the top 3.
// Returns null when the quiz has no scores yet. Pass `fill` for a flex-1 column
// that sits beside the standings panel (timed-mcq); omit it for a centered card.
const C = { ember: T.accent, ink: T.ink, faded: T.muted };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function LeaderboardSnippet({ board, identity, score, lastElapsed, fill = false, maxWidth = 320, margin = '0 auto 18px' }) {
  const rows = (identity ? board && board.leaderboard : board && board.leaderboardAll) || [];
  if (!rows.length) return null;
  let myRank = null;
  if (lastElapsed != null && score != null) {
    let b = 0;
    for (const r of rows) { if (r.score > score || (r.score === score && (r.timeElapsed != null ? r.timeElapsed : Infinity) < lastElapsed)) b++; }
    myRank = b + 1;
  }
  const top = rows.slice(0, 3);
  const showYou = myRank != null && myRank > 3;
  const mine = (r) => !!(identity && r.username === identity.username);
  const row = (rank, name, sc, hot) => (
    <div key={`lb${rank}-${name}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderTop: `1px solid var(--stg-line,${C.faded}14)`, background: hot ? `var(--stg-acc-tint,${T.accentSoft})` : 'transparent' }}>
      <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, width: 22, flex: 'none', color: hot ? `var(--stg-acc-ink,${C.ember})` : (rank <= 3 ? `var(--stg-acc-ink,${C.ember})` : `var(--stg-mute,${C.faded})`) }}>{rank}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: hot ? 800 : 500, color: hot ? `var(--stg-acc-ink,${C.ember})` : `var(--stg-ink,${C.ink})`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      <span style={{ fontFamily: FONT, fontSize: 13, flex: 'none' }}>{sc}</span>
    </div>
  );
  const outer = fill ? { flex: '1 1 0', minWidth: 0 } : { margin, maxWidth };
  return (
    <div style={{ ...outer, background: `var(--stg-surf,${T.white})`, border: `1px solid var(--stg-line,${C.faded}33)` }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: `var(--stg-acc-ink,${C.ember})`, textAlign: 'center', padding: '9px 0 3px' }}>Leaderboard</div>
      {top.map((r, i) => row(i + 1, (r.username || 'Player') + (mine(r) ? ' (you)' : ''), r.score, mine(r)))}
      {showYou ? (
        <>
          <div style={{ textAlign: 'center', color: `var(--stg-mute,${C.faded})`, fontSize: 12, letterSpacing: '0.3em', padding: '2px 0 0', borderTop: `1px solid ${C.faded}14` }}>...</div>
          {row(myRank, identity ? `${identity.username} (you)` : 'You', score, true)}
        </>
      ) : null}
    </div>
  );
}
