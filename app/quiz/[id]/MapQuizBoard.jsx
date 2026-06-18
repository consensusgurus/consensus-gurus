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

export default function MapQuizBoard({ region, started, ended, revealed, foundNames, flash, onPick, noBorders: noBordersProp }) {
  const [geo, setGeo] = useState(null);
  const [hover, setHover] = useState(null);

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

  return (
    <div style={{ border: '1px solid rgba(138,130,118,0.25)', borderRadius: 2, overflow: 'hidden', background: SEA }}>
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
          const s = 9;
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
  );
}
