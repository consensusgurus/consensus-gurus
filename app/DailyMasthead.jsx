'use client';

// DailyMasthead — shared masthead meta for the daily games.
//
// Renders the game's letter blocks alongside the issue No., the date, and the
// sourceoftruths.com/<slug> URL (so the URL shows on every screenshot / share).
// The No./date/URL group regroups responsively in three tiers, measured live
// with a ResizeObserver against the masthead's own width:
//
//   Tier 1 (wide):   [blocks]  No. # + date        (URL on the row below, beside blocks)
//                              sourceoftruths.com/x
//   Tier 2 (medium): [blocks]  No. #                (No. stays up on the blocks row)
//                    date  sourceoftruths.com/x     (date + URL together, full-width row below)
//   Tier 3 (narrow): [blocks]                       (blocks alone on row 1)
//                    No. # + date                   (all three below as a two-row box)
//                    sourceoftruths.com/x
//
// ink/faded/MONO are identical across every game's COLORS, so they are baked in
// here; only the accent (URL color) is passed per game.

import React, { useRef, useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const INK = '#1c1e24';
const FADED = '#6b7280';

export default function DailyMasthead({
  blocks,
  blockGap = 5,
  num,
  dateLabel,
  slug,
  accent,
  sunday = null,
  onHelp,
  marginBottom = 14,
  helpTop = 10,
}) {
  const wrapRef = useRef(null);
  const blocksRef = useRef(null);
  const noRef = useRef(null);
  const dateRef = useRef(null);
  const urlRef = useRef(null);
  const [tier, setTier] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const GAP = 14, COLGAP = 10;
    const measure = () => {
      const cW = wrap.clientWidth - 28; // reserve the help-button gutter (paddingRight)
      const bW = blocksRef.current ? blocksRef.current.offsetWidth : 0;
      const noW = noRef.current ? noRef.current.offsetWidth : 0;
      const dtW = dateRef.current ? dateRef.current.offsetWidth : 0;
      const urlW = urlRef.current ? urlRef.current.offsetWidth : 0;
      if (!cW || !bW) return;
      const boxW = Math.max(noW + COLGAP + dtW, urlW);   // Tier 1: two-row meta box beside blocks
      const dateUrlW = dtW + COLGAP + urlW;              // Tier 2: date + URL on one row
      let t;
      if (bW + GAP + boxW <= cW) t = 1;
      else if (dateUrlW <= cW && bW + GAP + noW <= cW) t = 2;
      else t = 3;
      setTier((prev) => (prev === t ? prev : t));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [num, dateLabel, slug, accent]);

  const noEl = (
    <h1 ref={noRef} style={{ margin: 0, fontFamily: MONO, fontSize: 13, letterSpacing: '0.05em', fontWeight: 500, color: INK, whiteSpace: 'nowrap' }}>No. {num}</h1>
  );
  const dateEl = (
    <span ref={dateRef} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.03em', color: FADED, whiteSpace: 'nowrap' }}>{dateLabel}</span>
  );
  const urlEl = (
    <span ref={urlRef} style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: '0.02em', color: accent, whiteSpace: 'nowrap' }}>sourceoftruths.com/{slug}</span>
  );

  return (
    <div ref={wrapRef} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
      <div ref={blocksRef} style={{ display: 'flex', gap: blockGap, alignItems: 'flex-end' }}>{blocks}</div>

      {tier === 2 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>{noEl}{sunday}</div>
          <div style={{ flexBasis: '100%', display: 'flex', alignItems: 'baseline', columnGap: 10, rowGap: 3, flexWrap: 'wrap' }}>{dateEl}{urlEl}</div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', rowGap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', columnGap: 10, rowGap: 3, flexWrap: 'wrap' }}>{noEl}{sunday}{dateEl}</div>
          {urlEl}
        </div>
      )}

      <button onClick={onHelp} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: helpTop, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: FADED, padding: 0, display: 'flex' }}>
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
