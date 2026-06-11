'use client';

import React, { useState } from 'react';
import { EUROPE_GEO } from '@/lib/europe-geo';

// Standalone, lazy-loaded (next/dynamic) so the ~150KB geometry never lands in
// the shared quiz bundle — only the map quiz route pulls this chunk.
const LAND = '#fbf7ef';
const LINE = '#8a8276';
const SEA = '#cfe0ea';
const GREEN = '#3d4f2b';
const RED = '#c0392b';
const HOVER = '#efe7d6';

export default function EuropeMapBoard({ started, ended, foundNames, flash, onPick }) {
  const [hover, setHover] = useState(null);
  const live = started && !ended;

  function fillFor(name, base) {
    if (foundNames && foundNames.has(name)) return GREEN;
    if (flash && flash.name === name) return flash.ok ? GREEN : RED;
    if (hover === name && live) return HOVER;
    return base;
  }

  return (
    <div style={{ border: '1px solid rgba(138,130,118,0.25)', borderRadius: 2, overflow: 'hidden', background: SEA }}>
      <svg
        viewBox={EUROPE_GEO.viewBox}
        style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'manipulation' }}
        role="img"
        aria-label="Map of Europe. Click the country named in the prompt above."
      >
        <rect x="0" y="0" width={EUROPE_GEO.width} height={EUROPE_GEO.height} fill={SEA} />
        {EUROPE_GEO.paths.map((p) => (
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
        {EUROPE_GEO.markers.map((m) => {
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
            >
              <title>{foundNames && foundNames.has(m.name) ? m.name : 'Micro-state'}</title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
