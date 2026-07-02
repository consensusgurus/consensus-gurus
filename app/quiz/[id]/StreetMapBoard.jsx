'use client';

// Typed "name them all" board rendered as a map (format: 'street-map'). The
// player types street names into QuizClient's normal single input; each correct
// answer drops a marker on the silhouette. Unlike place-map there is no clicking:
// QuizClient owns the input/matching/scoring, this board only visualizes `found`.

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { PLACE_MAP_GEO } from '@/lib/place-map-geo';

const LAND = '#eef1f4', LINE = '#94a0b0', SEA = '#bcd4ec';
const GREEN = '#10b981', RED = '#c0392b', INK = '#1c1e24', FADED = '#6b7280';
const MONO = "'Manrope', system-ui, -apple-system, sans-serif";

export default function StreetMapBoard({ answers, found, revealed, region, mobile = false }) {
  const geo = useMemo(() => {
    const reg = PLACE_MAP_GEO[region];
    if (!reg || !reg.mainland) return null;
    const rings = [reg.mainland, ...(reg.islands || [])];
    const pts = [].concat(...rings, answers.map((a) => [a.lon, a.lat]));
    const lats = pts.map((p) => p[1]), lons = pts.map((p) => p[0]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const PAD = 16, W = 680, kx = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
    const minX = minLon * kx, maxX = maxLon * kx;
    const lonR = (maxX - minX) || 1, latR = (maxLat - minLat) || 1;
    const innerW = W - 2 * PAD, innerH = innerW * latR / lonR, H = innerH + 2 * PAD;
    const proj = (lon, lat) => [PAD + (lon * kx - minX) / lonR * innerW, PAD + (maxLat - lat) / latR * innerH];
    const pathOf = (ring) => 'M' + ring.map((p, i) => { const q = proj(p[0], p[1]); return (i ? 'L' : '') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('') + 'Z';
    return { W, H, proj, mainPath: pathOf(reg.mainland), islandPaths: (reg.islands || []).filter((r) => r.length >= 4).map(pathOf) };
  }, [region, answers]);

  // Briefly label the most-recently-found street so a correct type is confirmed.
  const prev = useRef(null);
  const [last, setLast] = useState(null);
  useEffect(() => {
    const p = prev.current;
    if (p) { for (let i = 0; i < found.length; i++) { if (found[i] && !p[i]) { setLast(i); break; } } }
    prev.current = found.slice();
  }, [found]);

  if (!geo) return null;
  const foundCount = found.filter(Boolean).length;
  const missed = revealed ? answers.map((a, i) => (!found[i] ? a.t : null)).filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];

  return (
    <div>
      <div style={{ maxWidth: 560, margin: '0 auto', borderRadius: 6, overflow: 'hidden', border: `1px solid ${FADED}44`, background: SEA }}>
        <svg viewBox={`0 0 ${geo.W} ${geo.H.toFixed(1)}`} style={{ display: 'block', width: '100%', height: 'auto' }} role="img" aria-label="Lower Manhattan map. Type street names to drop a marker on each.">
          <rect x="0" y="0" width={geo.W} height={geo.H} fill={SEA} />
          <path d={geo.mainPath} fill={LAND} stroke={LINE} strokeWidth={1} />
          {geo.islandPaths.map((d, i) => (<path key={i} d={d} fill={LAND} stroke={LINE} strokeWidth={1} />))}
          {answers.map((a, i) => {
            const f = found[i];
            if (!f && !revealed) return null;
            const xy = geo.proj(a.lon, a.lat);
            const isLast = f && i === last;
            return <circle key={i} cx={xy[0].toFixed(1)} cy={xy[1].toFixed(1)} r={isLast ? 3.6 : 2.2} fill={f ? GREEN : RED} stroke="#fff" strokeWidth={isLast ? 1 : 0.5} opacity={f ? 1 : 0.85} />;
          })}
          {last != null && found[last] && !revealed && (() => { const xy = geo.proj(answers[last].lon, answers[last].lat); return (
            <text x={xy[0]} y={(xy[1] - 6).toFixed(1)} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={800} fill={INK} stroke="#fff" strokeWidth={2.4} paintOrder="stroke">{answers[last].t}</text>
          ); })()}
        </svg>
      </div>
      <div style={{ textAlign: 'center', marginTop: 8, fontFamily: MONO, fontSize: 12, color: FADED }}>
        {revealed ? `${foundCount} of ${answers.length} found` : `${foundCount} placed`}
      </div>
      {revealed && missed.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: RED, marginBottom: 6 }}>Missed ({missed.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
            {missed.map((n, i) => (<span key={i} style={{ fontFamily: MONO, fontSize: 12, color: RED }}>{n}{i < missed.length - 1 ? ',' : ''}</span>))}
          </div>
        </div>
      )}
    </div>
  );
}
