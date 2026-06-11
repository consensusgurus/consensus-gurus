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
};

const LAND = '#fbf7ef';
const LINE = '#8a8276';
const SEA = '#cfe0ea';
const GREEN = '#3d4f2b';
const RED = '#c0392b';
const HOVER = '#efe7d6';

export default function MapQuizBoard({ region, started, ended, foundNames, flash, onPick }) {
  const [geo, setGeo] = useState(null);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let live = true;
    const load = LOADERS[region] || LOADERS.europe;
    load().then((g) => { if (live) setGeo(g); }).catch(() => {});
    return () => { live = false; };
  }, [region]);

  const live = started && !ended;

  function fillFor(name, base) {
    if (foundNames && foundNames.has(name)) return GREEN;
    if (flash && flash.name === name) return flash.ok ? GREEN : RED;
    if (hover === name && live) return HOVER;
    return base;
  }

  if (!geo) {
    return (
      <div style={{ border: '1px solid rgba(138,130,118,0.25)', borderRadius: 2, background: SEA, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f7585', fontFamily: 'DM Mono, monospace', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
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
        {geo.paths.map((p) => (
          <path
            key={p.name}
            d={p.d}
            fill={fillFor(p.name, LAND)}
            stroke={LINE}
            strokeWidth={0.6}
            strokeLinejoin="round"
            style={{ cursor: live ? 'pointer' : 'default', transition: 'fill .12s' }}
            onMouseEnter={() => setHover(p.name)}
            onMouseLeave={() => setHover((h) => (h === p.name ? null : h))}
            onClick={() => live && onPick(p.name)}
          />
        ))}
        {geo.markers.map((m) => {
          const s = 9;
          return (
            <rect
              key={m.name}
              x={m.x - s / 2}
              y={m.y - s / 2}
              width={s}
              height={s}
              rx={1.5}
              fill={fillFor(m.name, '#ffffff')}
              stroke={LINE}
              strokeWidth={1}
              style={{ cursor: live ? 'pointer' : 'default', transition: 'fill .12s' }}
              onMouseEnter={() => setHover(m.name)}
              onMouseLeave={() => setHover((h) => (h === m.name ? null : h))}
              onClick={() => live && onPick(m.name)}
            />
          );
        })}
      </svg>
    </div>
  );
}
