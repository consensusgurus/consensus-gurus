'use client';

// DailyTopNav — the quiet top strip on every daily game page: links out to the
// rest of the site (Quizzes, Top 10 Lists) on the left, and the player's
// name + rank chip on the right. Shown full-size before the game starts and in
// a COMPACT form during play (pass compact={playing}), so it stays available
// the whole time without crowding the board — the "lighter page" nav that used
// to disappear on `playing`.
//
// One component so all daily clients share the exact same strip and compact
// behavior. Used by: links, span, dating, tally, suds, carve, circa, extra.

import React from 'react';

const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const COLORS = { ink: '#1c1e24', faded: '#262b35', ember: '#0e1d40', paper: '#eceef1' };

export default function DailyTopNav({ player, compact = false }) {
  const fz = compact ? 10 : 11;
  const navStyle = {
    fontFamily: MONO, fontSize: fz, letterSpacing: '0.12em', textTransform: 'uppercase',
    color: COLORS.faded, textDecoration: 'none', borderBottom: '1px solid rgba(28,30,36,0.25)', paddingBottom: 1,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 12 : 18, marginBottom: compact ? 11 : 20, flexWrap: 'wrap' }}>
      <a href="/" style={navStyle}>Puzzles &amp; Quizzes</a>
      <a href="/lists" style={navStyle}>Top 10 Lists</a>
      {player && (
        <a href={player.key ? `/quizzes/hub?player=${encodeURIComponent(player.key)}` : '/quizzes/hub'} title="Your Stat Hub"
          style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: compact ? 5 : 7, fontFamily: MONO, fontSize: fz, letterSpacing: '0.06em', color: COLORS.ink, background: COLORS.paper, border: '1.5px solid rgba(28,30,36,0.35)', borderRadius: 5, padding: compact ? '3px 8px' : '4px 10px', textDecoration: 'none' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: compact ? 120 : 150, fontWeight: 500 }}>{player.name}</span>
          {player.rank ? <span style={{ color: COLORS.ember, fontWeight: 500 }}>Rank #{player.rank}</span> : null}
        </a>
      )}
    </div>
  );
}
