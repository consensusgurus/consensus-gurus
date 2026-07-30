'use client';
import React from 'react';

// Shared "Your standing" XP panel for quiz results cards. Renders three
// metrics (XP earned, Global rank, Category rank) as compact SIDE-BY-SIDE
// columns so the results card stays short enough to fit on small screens.
// Returns null until the post-game profile is known. Pass `fill` to sit
// beside the leaderboard snippet (timed-mcq); omit it for a centered card.
// Props keep their historical names (eloAfter/eloBefore are simply the
// /api/quiz/me profiles after/before the game) so none of the eleven board
// callers had to change when Elo was retired for XP (2026-07-08).
const C = { ember: '#0e1d40', ink: '#1c1e24', faded: '#262b35', forest: '#10b981' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function QuizStandings({ eloAfter, eloBefore, eloDept, eloDeptLabel = 'Category', fill = false, hideCategory = false }) {
  if (!eloAfter) return null;
  const fmtN = (x) => (x == null ? null : x.toLocaleString());
  const aXp = eloAfter.xp != null ? eloAfter.xp : 0;
  const bXp = eloBefore && eloBefore.xp != null ? eloBefore.xp : null;
  const aLevel = eloAfter.level || 1;
  const bLevel = eloBefore && eloBefore.level != null ? eloBefore.level : null;
  const rg = (eloAfter.recent && eloAfter.recent[0]) ? eloAfter.recent[0] : null;
  const gained = (rg && typeof rg.xp === 'number') ? rg.xp : (bXp != null ? Math.max(0, aXp - bXp) : null);
  const leveledUp = bLevel != null && aLevel > bLevel;
  const aGlobal = eloAfter.rank != null ? eloAfter.rank : null;
  const bGlobal = eloBefore && eloBefore.found ? eloBefore.rank : null;
  const aCatObj = eloAfter.byCategory && eloAfter.byCategory[eloDept];
  const bCatObj = eloBefore && eloBefore.byCategory && eloBefore.byCategory[eloDept];
  const aCat = aCatObj ? aCatObj.rank : null;
  const bCat = bCatObj ? bCatObj.rank : null;
  const rankRows = [
    { label: 'Global rank', oldVal: bGlobal != null ? `#${fmtN(bGlobal)}` : null, newVal: aGlobal != null ? `#${fmtN(aGlobal)}` : '—', delta: (bGlobal != null && aGlobal != null) ? bGlobal - aGlobal : ((rg && typeof rg.rankDelta === 'number') ? rg.rankDelta : null), isNew: bGlobal == null },
    { label: `${eloDeptLabel} rank`, oldVal: bCat != null ? `#${fmtN(bCat)}` : null, newVal: aCat != null ? `#${fmtN(aCat)}` : '—', delta: (bCat != null && aCat != null) ? bCat - aCat : ((rg && typeof rg.catRankDelta === 'number') ? rg.catRankDelta : null), isNew: bCat == null },
  ];
  const shownRankRows = hideCategory ? rankRows.slice(0, 1) : rankRows;
  const outer = fill ? { flex: '1 1 0', minWidth: 0 } : { margin: '0 auto 18px', maxWidth: 360 };
  const cellSt = (first) => ({ padding: '11px 6px 13px', textAlign: 'center', borderLeft: first ? 'none' : `1px solid ${C.faded}22` });
  const lblSt = { fontFamily: FONT, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faded, marginBottom: 6, lineHeight: 1.25, minHeight: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' };
  const bigSt = { fontFamily: FONT, fontWeight: 800, fontSize: 20, color: C.ink, lineHeight: 1 };
  return (
    <div style={{ ...outer, background: '#fbf7ef', border: `1px solid ${C.faded}33`, overflow: 'hidden' }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ember, textAlign: 'center', padding: '9px 0 8px' }}>Your standing</div>
      <div style={{ display: 'grid', gridTemplateColumns: hideCategory ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', borderTop: `1px solid ${C.faded}22` }}>
        <div style={cellSt(true)}>
          <div style={lblSt}>XP earned</div>
          <div style={{ ...bigSt, color: (gained || 0) > 0 ? C.forest : C.ink }}>{gained != null ? `+${fmtN(gained)}` : fmtN(aXp)}</div>
          <div style={{ marginTop: 6, minHeight: 15, lineHeight: 1 }}>
            {leveledUp ? (
              <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: C.forest, background: '#e7ecdf', padding: '2px 6px' }}>▲ LEVEL {aLevel}!</span>
            ) : (
              <span style={{ fontFamily: FONT, fontSize: 10, color: C.faded }}>Level {aLevel} · {fmtN(aXp)} XP</span>
            )}
          </div>
        </div>
        {shownRankRows.map((r) => (
          <div key={r.label} style={cellSt(false)}>
            <div style={lblSt}>{r.label}</div>
            <div style={bigSt}>{r.newVal}</div>
            <div style={{ marginTop: 6, minHeight: 15, lineHeight: 1 }}>
              {r.isNew ? (
                <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: C.forest, background: '#e7ecdf', padding: '2px 6px' }}>NEW</span>
              ) : (r.delta == null || r.delta === 0) ? (
                <span style={{ fontFamily: FONT, fontSize: 10, color: C.faded }}>{r.oldVal != null ? `was ${r.oldVal}` : '—'}</span>
              ) : (
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: r.delta > 0 ? C.forest : C.ember }}>
                  {r.delta > 0 ? '▲' : '▼'} {Math.abs(r.delta).toLocaleString()}
                  {r.oldVal != null ? <span style={{ color: C.faded, fontWeight: 500 }}>{` from ${r.oldVal}`}</span> : null}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
