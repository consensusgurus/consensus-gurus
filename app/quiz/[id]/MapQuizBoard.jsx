'use client';

import React, { useState, useEffect } from 'react';

// Lazy, per-region geometry — each import() is a static specifier so webpack
// code-splits one chunk per region; only the played region's geometry loads.
const LOADERS = {
  'europe': () => import('@/lib/europe-geo.js').then((m) => m.EUROPE_GEO),
  'north-america': () => import('@/lib/na-geo.js').then((m) => m.GEO),
  'south-america': () => import('@/lib/sa-geo.js').then((m) => m.GEO),
  'africa': () => import('@/lib/africa-geo.js').then((m) => m.GEO),
  'asia': () => import('@/lib/asia-geo.js').then((m) => m.GEO),
  'us-states': () => import('@/lib/us-geo.js').then((m) => m.GEO),
  'central-america': () => import('@/lib/central-america-geo.js').then((m) => m.GEO),
  'southeast-asia': () => import('@/lib/southeast-asia-geo.js').then((m) => m.GEO),
  'caribbean': () => import('@/lib/caribbean-geo.js').then((m) => m.GEO),
  'oceania': () => import('@/lib/oceania-geo.js').then((m) => m.GEO),
};

const LAND = '#eef1f4';
const LINE = '#94a0b0';
const SEA = '#bcd4ec';
const GREEN = '#10b981';
const RED = '#c0392b';
const HOVER = '#e8effb';
const CTRL_INK = '#1c1e24';
const CTRL_ACCENT = '#2563eb';

// In-window size control. The map was capped at 680px wide and centered, which
// renders small on a wide-but-short region (e.g. the no-outline lower-48). These
// presets let the player enlarge it past the play column with the full-bleed
// technique (centered on the viewport; the page scrolls vertically - never a
// separate window). 'lg' is the default so maps open larger than the old cap.
const SIZES = {
  fit: { label: 'Fit', width: '680px', bleed: false },
  lg: { label: 'Large', width: 'min(1100px, 94vw)', bleed: true },
  xl: { label: 'Full', width: '96vw', bleed: true },
};
const SIZE_ORDER = ['fit', 'lg', 'xl'];
const SIZE_KEY = 'sot_map_size';

export default function MapQuizBoard({ region, started, ended, revealed, foundNames, flash, onPick, noBorders: noBordersProp, mobile = false }) {
  const [geo, setGeo] = useState(null);
  const [hover, setHover] = useState(null);
  const [size, setSize] = useState('lg');
  const isMobile = mobile;

  // Restore the saved size preference (ssr:false, so localStorage is safe;
  // read in an effect to avoid a hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIZE_KEY);
      if (saved && SIZES[saved]) setSize(saved);
    } catch {}
  }, []);

  function chooseSize(s) {
    setSize(s);
    try { localStorage.setItem(SIZE_KEY, s); } catch {}
  }

  useEffect(() => {
    let live = true;
    const load = LOADERS[region] || LOADERS.europe;
    load().then((g) => { if (live) setGeo(g); }).catch(() => {});
    return () => { live = false; };
  }, [region]);

  const live = started && !ended;
  // A "no borders" map (e.g. the lower-48 states quiz) renders as a single blank
  // silhouette: no internal boundary lines AND no hover shape-preview, so the
  // player can't trace a state's outline before clicking. Found/flash colors
  // still show as feedback.
  const noBorders = !!(geo && geo.noBorders) || !!noBordersProp;

  function fillFor(name, base) {
    if (foundNames && foundNames.has(name)) return GREEN;
    if (revealed) return RED;
    if (flash && flash.name === name) return flash.ok ? GREEN : RED;
    if (hover === name && live && !noBorders) return HOVER;
    return base;
  }

  if (!geo) {
    return (
      <div style={{ border: '1px solid rgba(138,130,118,0.25)', borderRadius: 2, background: SEA, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f7585', fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        Loading map…
      </div>
    );
  }

  const sz = SIZES[size] || SIZES.lg;
  // Full-bleed for the larger presets: center on the viewport and break out of
  // the play column; the page scrolls vertically if the map is tall. 'Fit'
  // keeps the original centered cap.
  const wrapStyle = isMobile
    ? { width: '100%' }
    : sz.bleed
    ? { width: sz.width, maxWidth: '96vw', position: 'relative', left: '50%', transform: 'translateX(-50%)' }
    : { maxWidth: 680, margin: '0 auto' };

  return (
    <div>
      {!isMobile && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9aa0ab', marginRight: 2 }}>Map size</span>
        {SIZE_ORDER.map((s) => {
          const on = s === size;
          return (
            <button
              key={s}
              onClick={() => chooseSize(s)}
              style={{
                fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                padding: '4px 11px', cursor: 'pointer', borderRadius: 6,
                border: `1px solid ${on ? CTRL_INK : 'rgba(20,22,28,0.18)'}`,
                background: on ? CTRL_INK : '#fff',
                color: on ? '#fff' : '#6b7280',
              }}
            >
              {SIZES[s].label}
            </button>
          );
        })}
      </div>
      )}
      <div style={{ ...wrapStyle, border: '1px solid rgba(138,130,118,0.25)', borderRadius: 2, overflow: 'hidden', background: SEA }}>
      <svg
        viewBox={geo.viewBox}
        style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'manipulation' }}
        role="img"
        aria-label="Map. Click the country named in the prompt above."
      >
        <rect x="0" y="0" width={geo.width} height={geo.height} fill={SEA} />
        {geo.paths.map((p) => {
          const f = fillFor(p.name, LAND);
          // Borderless map: stroke each path with its OWN fill color so the
          // internal seams between adjacent same-color states disappear (the
          // map reads as one clean cream silhouette) without drawing any
          // boundary line that would give away where a state is.
          return (
            <path
              key={p.name}
              d={p.d}
              fill={f}
              stroke={noBorders ? f : LINE}
              strokeWidth={noBorders ? 1 : 0.6}
              strokeLinejoin="round"
              style={{ cursor: live ? 'pointer' : 'default', transition: 'fill .12s' }}
              onMouseEnter={() => setHover(p.name)}
              onMouseLeave={() => setHover((h) => (h === p.name ? null : h))}
              onClick={() => live && onPick(p.name)}
            />
          );
        })}
        {geo.markers.map((m) => {
          const s = isMobile ? 13 : 9;
          // A marker with lx/ly is a callout: the clickable box is pulled out
          // into open water at (lx,ly) and a leader line ties it back to the
          // island's true location (x,y), where a small anchor dot sits. This
          // keeps tightly-clustered island states (the Lesser Antilles) from
          // overlapping into one unclickable blob.
          const hasCallout = m.lx != null && m.ly != null;
          const bx = hasCallout ? m.lx : m.x;
          const by = hasCallout ? m.ly : m.y;
          const tint = fillFor(m.name, '#ffffff');
          const active = (foundNames && foundNames.has(m.name)) || (flash && flash.name === m.name) || (hover === m.name && live);
          const lineColor = active ? tint : LINE;
          const enter = () => setHover(m.name);
          const leave = () => setHover((h) => (h === m.name ? null : h));
          const pick = () => live && onPick(m.name);
          const cursor = live ? 'pointer' : 'default';
          return (
            <g key={m.name}>
              {hasCallout && (
                <>
                  <line
                    x1={m.x}
                    y1={m.y}
                    x2={bx}
                    y2={by}
                    stroke={lineColor}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    style={{ transition: 'stroke .12s' }}
                  />
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={2}
                    fill={lineColor}
                    stroke={LINE}
                    strokeWidth={0.5}
                    style={{ transition: 'fill .12s' }}
                  />
                </>
              )}
              <rect
                x={bx - s / 2}
                y={by - s / 2}
                width={s}
                height={s}
                rx={1.5}
                fill={tint}
                stroke={LINE}
                strokeWidth={1}
                style={{ cursor, transition: 'fill .12s' }}
                onMouseEnter={enter}
                onMouseLeave={leave}
                onClick={pick}
              />
            </g>
          );
        })}
      </svg>
      </div>
    </div>
  );
}
