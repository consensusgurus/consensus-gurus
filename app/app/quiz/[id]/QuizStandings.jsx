'use client';
import React from 'react';

// Shared "Your standing" ELO panel for quiz results cards. Renders the three
// metrics (ELO rating, Global rank, Category rank) as compact SIDE-BY-SIDE
// columns so the results card stays short enough to fit on small screens.
// Returns null until the post-game ELO is known. Pass `fill` to sit beside the
// leaderboard snippet (timed-mcq); omit it for a centered card.
const C = { ember: '#2563eb', ink: '#1c1e24', faded: '#6b7280', forest: '#10b981' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function QuizStandings({ eloAfter, eloBefore, eloDept, eloDeptLabel = 'Category', fill = false }) {
  if (!eloAfter) return null;
  const fmtN = (x) => (x == null ? null : x.toLocaleString());
  const aRating = eloAfter.rating;
  const bRating = eloBefore && eloBefore.rating != null ? eloBefore.rating : null;
  const aGlobal = eloAfter.rank != null ? eloAfter.rank : null;
  const bGlobal = eloBefore && eloBefore.found ? eloBefore.rank : null;
  const aCatObj = eloAfter.byCategory && eloAfter.byCategory[eloDept];
  const bCatObj = eloBefore && eloBefore.byCategory && eloBefore.byCategory[eloDept];
  const aCat = aCatObj ? aCatObj.rank : null;
  const bCat = bCatObj ? bCatObj.rank : null;
  const perGame = (eloAfter.recent && eloAfter.recent[0] && typeof eloAfter.recent[0].delta === 'number') ? eloAfter.recent[0].delta : (bRating != null ? aRating - bRating : null);
  const rg = (eloAfter.recent && eloAfter.recent[0]) ? eloAfter.recent[0] : null;
  const rows = [
    { label: 'ELO rating', oldVal: bRating != null ? fmtN(bRating) : (perGame != null ? fmtN(aRating - perGame) : null), newVal: fmtN(aRating), delta: bRating != null ? aRating - bRating : perGame, isNew: bRating == null },
    { label: 'Global rank', oldVal: bGlobal != null ? `#${fmtN(bGlobal)}` : null, newVal: aGlobal != null ? `#${fmtN(aGlobal)}` : '—', delta: (bGlobal != null && aGlobal != null) ? bGlobal - aGlobal : ((rg && typeof rg.rankDelta === 'number') ? rg.rankDelta : null), isNew: bGlobal == null },
    { label: `${eloDeptLabel} rank`, oldVal: bCat != null ? `#${fmtN(bCat)}` : null, newVal: aCat != null ? `#${fmtN(aCat)}` : '—', delta: (bCat != null && aCat != null) ? bCat - aCat : ((rg && typeof rg.catRankDelta === 'number') ? rg.catRankDelta : null), isNew: bCat == null },
  ];
  const outer = fill ? { flex: '1 1 0', minWidth: 0 } : { margin: '0 auto 18px', maxWidth: 360 };
  return (
    <div style={{ ...outer, background: '#fbf7ef', border: `1px solid ${C.faded}33`, overflow: 'hidden' }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ember, textAlign: 'center', padding: '9px 0 8px' }}>Your standing</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', borderTop: `1px solid ${C.faded}22` }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{ padding: '11px 6px 13px', textAlign: 'center', borderLeft: i === 0 ? 'none' : `1px solid ${C.faded}22` }}>
            <div style={{ fontFamily: FONT, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.faded, marginBottom: 6, lineHeight: 1.25, minHeight: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.label}</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: C.ink, lineHeight: 1 }}>{r.newVal}</div>
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
