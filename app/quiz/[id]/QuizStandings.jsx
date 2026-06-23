'use client';
import React from 'react';

// Shared "Your standing" ELO panel (Was / Change / Now) for quiz results cards.
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
  const outer = fill ? { flex: '1 1 0', minWidth: 0 } : { margin: '0 auto 18px', maxWidth: 340 };
  return (
    <div style={{ ...outer, background: '#fbf7ef', border: `1px solid ${C.faded}33` }}>
      <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.ember, textAlign: 'center', padding: '9px 0 6px' }}>Your standing</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, padding: '0 16px 5px', fontFamily: FONT, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faded }}>
        <span style={{ textAlign: 'right' }}>Was</span><span style={{ textAlign: 'center' }}>Change</span><span style={{ textAlign: 'left' }}>Now</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{ padding: '9px 16px', borderTop: `1px solid ${C.faded}22` }}>
          <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.faded, textAlign: 'center', marginBottom: 4 }}>{r.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10 }}>
            <span style={{ textAlign: 'right', fontFamily: FONT, fontWeight: 600, fontSize: 16, color: C.faded }}>{r.oldVal != null ? r.oldVal : '—'}</span>
            <span style={{ textAlign: 'center' }}>
              {r.isNew ? (
                <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.forest, background: '#e7ecdf', padding: '2px 7px' }}>NEW</span>
              ) : (r.delta == null || r.delta === 0) ? (
                <span style={{ fontFamily: FONT, fontSize: 13, color: C.faded }}>&rarr;</span>
              ) : (
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: r.delta > 0 ? C.forest : C.ember, background: r.delta > 0 ? '#e7ecdf' : '#f6e2dd', padding: '2px 7px' }}>{r.delta > 0 ? '▲' : '▼'} {Math.abs(r.delta).toLocaleString()}</span>
              )}
            </span>
            <span style={{ textAlign: 'left', fontFamily: FONT, fontWeight: 800, fontSize: 20, color: C.ink }}>{r.newVal}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
