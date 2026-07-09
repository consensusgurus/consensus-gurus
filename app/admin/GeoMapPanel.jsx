'use client';
// Player Map tab of the admin Analytics panel: two zoomable world bubble maps
// built from the full located-play history (see lib/geo-locate.js) —
//   1. Users by location   (distinct players, pinned at their latest located play)
//   2. Games played by location (every located completed game)
// Bubbles are area-scaled to the count; every location with 2+ gets a leader
// line to a "Name N" label so the totals read directly off the map (no size
// key to decode). Dashed bubbles are approximate pins (city string that
// couldn't be matched, pinned at region/country centroid). Pan by dragging,
// zoom with the wheel / buttons / region presets; hover any bubble for detail.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WORLD } from '@/lib/admin-world-map';
import { projectPoint } from '@/lib/geo-project';

const C = {
  paper: '#ffffff',
  ink: '#1c1e24',
  faded: '#6b7280',
  line: 'rgba(20,22,28,0.09)',
  land: '#e9edf3',
  landLine: '#ffffff',
  leader: '#a7adba',
  users: '#2563eb',
  plays: '#b45309',
};
const MONO = 'DM Mono, monospace';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const plural = (n, one, many) => `${fmt(n)} ${Number(n) === 1 ? one : many}`;

function fmtDay(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

// Fit a lon/lat box into the SVG frame -> {k, x, y} view transform. Samples
// edge midpoints too, since Natural Earth curves the parallels.
function fitBBox([lon0, lat0, lon1, lat1], pad = 24) {
  const lons = [lon0, (lon0 + lon1) / 2, lon1];
  const lats = [lat0, (lat0 + lat1) / 2, lat1];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const lon of lons) {
    for (const lat of lats) {
      const [px, py] = projectPoint(WORLD, lon, lat);
      if (px < x0) x0 = px;
      if (px > x1) x1 = px;
      if (py < y0) y0 = py;
      if (py > y1) y1 = py;
    }
  }
  const { width: W, height: H } = WORLD;
  const k = Math.max(1, Math.min((W - pad * 2) / Math.max(1, x1 - x0), (H - pad * 2) / Math.max(1, y1 - y0)));
  return { k, x: W / 2 - (k * (x0 + x1)) / 2, y: H / 2 - (k * (y0 + y1)) / 2 };
}

const PRESETS = [
  { id: 'world', label: 'World', view: { k: 1, x: 0, y: 0 } },
  { id: 'na', label: 'N. America', bbox: [-126, 24, -64, 51] },
  { id: 'eu', label: 'Europe', bbox: [-11, 35, 33, 60] },
  { id: 'as', label: 'Asia-Pacific', bbox: [60, -45, 180, 50] },
];

// Greedy leader-line label placement in zoom space (positions scale with k,
// pan is a pure translate on top, so the layout only recomputes on zoom).
const ANGLES = [0, -Math.PI / 4, Math.PI / 4, Math.PI, (-3 * Math.PI) / 4, (3 * Math.PI) / 4, -Math.PI / 2, Math.PI / 2];
function layoutLabels(pts, k) {
  // Declutter: zoomed out only the biggest totals get labels (bubbles, hover
  // tooltips and the table still carry everything); zooming in raises the
  // budget until every 2+ location is labeled. A label that still can't find
  // a spot without heavy overlap at this zoom is skipped rather than drawn
  // illegibly on top of its neighbors.
  const budget = k < 2 ? 30 : k < 4 ? 70 : k < 8 ? 110 : 150;
  const placed = [];
  const labels = [];
  const obstacles = pts.slice(0, 40).map((p) => ({
    x0: p.x * k - p.r, y0: p.y * k - p.r, x1: p.x * k + p.r, y1: p.y * k + p.r,
  }));
  const overlapArea = (a, b) => {
    const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
    const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
    return w > 0 && h > 0 ? w * h : 0;
  };
  let n = 0;
  for (const p of pts) {
    if (p.count < 2) continue;
    if (n >= budget) break;
    const text = `${p.short} ${fmt(p.count)}`;
    const w = text.length * 6.4 + 6;
    const h = 15;
    const zx = p.x * k;
    const zy = p.y * k;
    let best = null;
    let bestScore = Infinity;
    let bestBase = 0;
    for (let ring = 0; ring < 3; ring++) {
      const dist = p.r + 10 + ring * 17;
      for (let ai = 0; ai < ANGLES.length; ai++) {
        const ang = ANGLES[ai];
        const ax = zx + Math.cos(ang) * dist;
        const ay = zy + Math.sin(ang) * dist;
        const cos = Math.cos(ang);
        const anchor = cos > 0.35 ? 'start' : cos < -0.35 ? 'end' : 'middle';
        const x0 = anchor === 'start' ? ax : anchor === 'end' ? ax - w : ax - w / 2;
        const vshift = anchor === 'middle' ? (Math.sin(ang) > 0 ? h / 2 : -h / 2) : 0;
        const rect = { x0, y0: ay - h / 2 + vshift, x1: x0 + w, y1: ay + h / 2 + vshift };
        // Base cost prefers close rings and earlier (east/west) angles; overlap
        // with already-placed labels dominates, bubbles cost less.
        let score = ring * 3 + ai * 0.35;
        for (const r of placed) score += overlapArea(rect, r) * 2;
        for (const o of obstacles) score += overlapArea(rect, o) * 0.6;
        if (score < bestScore) {
          bestScore = score;
          bestBase = ring * 3 + ai * 0.35;
          best = { rect, ax, ay: ay + vshift, anchor, ang };
        }
      }
      if (best && bestScore <= ring * 3 + ANGLES.length * 0.35) break; // clean spot found on this ring
    }
    if (!best || bestScore - bestBase > 120) continue; // too crowded at this zoom
    n += 1;
    placed.push(best.rect);
    labels.push({
      key: p.key,
      text,
      short: p.short,
      count: p.count,
      x: best.ax,
      y: best.ay,
      anchor: best.anchor,
      lx0: zx + Math.cos(best.ang) * (p.r + 1.5),
      ly0: zy + Math.sin(best.ang) * (p.r + 1.5),
      lx1: best.ax - Math.cos(best.ang) * 2,
      ly1: best.ay - Math.sin(best.ang) * 2,
    });
  }
  return labels;
}

function ZoomButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 26,
        height: 26,
        background: C.paper,
        border: `1px solid rgba(20,22,28,0.18)`,
        color: C.ink,
        fontFamily: MONO,
        fontSize: 13,
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function BubbleMap({ title, subtitle, accent, points, unitSingular, unitPlural, footnote }) {
  const { width: W, height: H } = WORLD;
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [hover, setHover] = useState(null);
  const [preset, setPreset] = useState('world');
  const svgRef = useRef(null);
  const drag = useRef(null);

  const maxC = points.length ? points[0].count : 1;
  const pts = useMemo(() => {
    const rMin = 4;
    const rMax = 24;
    const kk = (rMax - rMin) / Math.sqrt(Math.max(maxC - 1, 1));
    return points.map((p) => ({ ...p, r: rMin + kk * Math.sqrt(Math.max(p.count - 1, 0)) }));
  }, [points, maxC]);

  const labels = useMemo(() => layoutLabels(pts, view.k), [pts, view.k]);

  // Wheel zoom about the cursor. Native listener: React's onWheel is passive,
  // and the page must not scroll while zooming the map.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      const my = ((e.clientY - rect.top) / rect.height) * H;
      setPreset('');
      setView((v) => {
        const factor = Math.exp(-e.deltaY * 0.0015);
        const k = Math.max(1, Math.min(48, v.k * factor));
        const scale = k / v.k;
        return { k, x: mx - (mx - v.x) * scale, y: my - (my - v.y) * scale };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [W, H]);

  const toLocal = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * W, ((e.clientY - rect.top) / rect.height) * H];
  };
  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    const [mx, my] = toLocal(e);
    drag.current = { mx, my, x: view.x, y: view.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const [mx, my] = toLocal(e);
    const dx = mx - drag.current.mx;
    const dy = my - drag.current.my;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.current.moved = true;
    setView((v) => ({ ...v, x: drag.current.x + dx, y: drag.current.y + dy }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const zoomBy = (factor) => {
    setPreset('');
    setView((v) => {
      const k = Math.max(1, Math.min(48, v.k * factor));
      const scale = k / v.k;
      const cx = W / 2;
      const cy = H / 2;
      return { k, x: cx - (cx - v.x) * scale, y: cy - (cy - v.y) * scale };
    });
  };
  const applyPreset = (p) => {
    setPreset(p.id);
    setView(p.view || fitBBox(p.bbox));
  };

  const visible = (zx, zy, pad) => {
    const sx = zx + view.x;
    const sy = zy + view.y;
    return sx > -pad && sx < W + pad && sy > -pad && sy < H + pad;
  };

  const hoverPt = hover ? pts.find((p) => p.key === hover) : null;
  const hoverSx = hoverPt ? hoverPt.x * view.k + view.x : 0;
  const hoverSy = hoverPt ? hoverPt.y * view.k + view.y : 0;
  const unit = (n) => (n === 1 ? unitSingular : unitPlural);

  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: accent, display: 'inline-block' }} />
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: C.ink }}>{title}</span>
          </div>
          <div style={{ fontSize: 12, color: C.faded, marginTop: 4 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => {
            const on = preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                style={{
                  padding: '5px 10px',
                  background: on ? `${accent}14` : 'transparent',
                  border: `1px solid ${on ? accent : C.line}`,
                  color: on ? accent : C.faded,
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'grab', touchAction: 'none', background: C.paper }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => { onPointerUp(); setHover(null); }}
          onDoubleClick={() => zoomBy(1.8)}
          role="img"
          aria-label={`${title} world map`}
        >
          <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
            <path d={WORLD.sphere} fill="none" stroke={C.line} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {WORLD.countries.map((c, i) => (
              <path key={i} d={c.d} fill={C.land} stroke={C.landLine} strokeWidth={0.75} vectorEffect="non-scaling-stroke">
                <title>{c.n}</title>
              </path>
            ))}
          </g>
          <g transform={`translate(${view.x},${view.y})`}>
            {labels.map((l) =>
              visible(l.x, l.y, 180) ? (
                <g key={`ll-${l.key}`}>
                  <line x1={l.lx0} y1={l.ly0} x2={l.lx1} y2={l.ly1} stroke={C.leader} strokeWidth={1} />
                </g>
              ) : null
            )}
            {pts.map((p) =>
              visible(p.x * view.k, p.y * view.k, 60) ? (
                <g key={p.key} transform={`translate(${p.x * view.k},${p.y * view.k})`}>
                  <circle r={p.r + 1.25} fill="none" stroke={C.paper} strokeWidth={2.5} />
                  <circle
                    r={p.r}
                    fill={accent}
                    fillOpacity={hover === p.key ? 0.45 : 0.24}
                    stroke={accent}
                    strokeWidth={1.5}
                    strokeDasharray={p.approx ? '3 2' : 'none'}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHover(p.key)}
                    onMouseLeave={() => setHover(null)}
                  />
                  <circle r={Math.max(p.r, 9)} fill="transparent" onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }} />
                </g>
              ) : null
            )}
            {labels.map((l) =>
              visible(l.x, l.y, 180) ? (
                <text
                  key={`lt-${l.key}`}
                  x={l.x + (l.anchor === 'start' ? 3 : l.anchor === 'end' ? -3 : 0)}
                  y={l.y}
                  textAnchor={l.anchor}
                  dominantBaseline="middle"
                  style={{ fontFamily: MONO, fontSize: 10.5, paintOrder: 'stroke', stroke: C.paper, strokeWidth: 3, strokeLinejoin: 'round', fill: C.ink, pointerEvents: 'none' }}
                >
                  {l.short} <tspan style={{ fontWeight: 700 }}>{fmt(l.count)}</tspan>
                </text>
              ) : null
            )}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ZoomButton title="Zoom in" onClick={() => zoomBy(1.6)}>+</ZoomButton>
          <ZoomButton title="Zoom out" onClick={() => zoomBy(1 / 1.6)}>−</ZoomButton>
          <ZoomButton title="Reset view" onClick={() => applyPreset(PRESETS[0])}>⟲</ZoomButton>
        </div>
        {hoverPt ? (
          <div
            style={{
              position: 'absolute',
              left: `${(hoverSx / W) * 100}%`,
              top: `${(hoverSy / H) * 100}%`,
              transform: 'translate(-50%, -115%)',
              marginTop: -hoverPt.r,
              background: C.ink,
              color: '#f7f8fa',
              padding: '7px 10px',
              fontSize: 11.5,
              lineHeight: 1.45,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 5,
              boxShadow: '0 4px 14px rgba(20,22,28,0.25)',
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hoverPt.city || hoverPt.short}
              {hoverPt.region && hoverPt.city ? `, ${hoverPt.region}` : ''}
              {hoverPt.precision !== 'country' ? ` · ${hoverPt.countryName}` : ''}
            </div>
            <div style={{ fontFamily: MONO }}>
              {fmt(hoverPt.count)} {unit(hoverPt.count)}
            </div>
            {hoverPt.approx ? <div style={{ color: '#c7cbd4' }}>≈ approximate ({hoverPt.precision}-level pin)</div> : null}
          </div>
        ) : null}
      </div>
      <div style={{ fontSize: 11, color: C.faded, marginTop: 8, lineHeight: 1.5 }}>{footnote}</div>
      <details style={{ marginTop: 8 }}>
        <summary style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faded, cursor: 'pointer' }}>
          All {fmt(points.length)} locations (table)
        </summary>
        <div style={{ maxHeight: 260, overflow: 'auto', marginTop: 8, border: `1px solid ${C.line}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Location', 'Country', unitPlural, 'Pin'].map((h) => (
                  <th key={h} style={{ position: 'sticky', top: 0, background: '#f7f8fa', textAlign: h === unitPlural ? 'right' : 'left', padding: '6px 10px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faded, borderBottom: `1px solid ${C.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.key}>
                  <td style={{ padding: '5px 10px', borderBottom: `1px solid ${C.line}` }}>{p.short}</td>
                  <td style={{ padding: '5px 10px', borderBottom: `1px solid ${C.line}`, color: C.faded }}>{p.countryName}</td>
                  <td style={{ padding: '5px 10px', borderBottom: `1px solid ${C.line}`, textAlign: 'right', fontFamily: MONO, fontVariantNumeric: 'tabular-nums' }}>{fmt(p.count)}</td>
                  <td style={{ padding: '5px 10px', borderBottom: `1px solid ${C.line}`, color: C.faded }}>{p.precision}{p.approx ? ' ≈' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function Chip({ label, value, muted }) {
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, padding: '10px 14px', minWidth: 108 }}>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faded }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: muted ? C.faded : C.ink, marginTop: 2 }}>{value}</div>
    </div>
  );
}

export default function GeoMapPanel({ data }) {
  const d = data || { users: [], plays: [], totals: {}, since: null };
  const t = d.totals || {};
  const since = fmtDay(d.since);
  const baseNote = since ? `Full history since location tracking began (first located game ${since}).` : 'No located games yet — location capture fills in as games are played on the live site.';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Chip label="Located users" value={fmt(t.locatedPlayers || 0)} />
        <Chip label="Located games" value={fmt(t.locatedPlays || 0)} />
        <Chip label="Cities" value={fmt(t.cities || 0)} />
        <Chip label="Countries" value={fmt(t.countries || 0)} />
        <Chip label="No location" value={`${plural(t.unlocatedPlayers || 0, 'user', 'users')} · ${plural(t.unlocatedPlays || 0, 'game', 'games')}`} muted />
      </div>
      <BubbleMap
        title="Users by location"
        subtitle={`${baseNote} Each distinct player (registered or anonymous) counts once, at their most recent located game.`}
        accent={C.users}
        points={d.users || []}
        unitSingular="user"
        unitPlural="users"
        footnote={`Bubble area = users at that location; labels show the largest totals first and every 2+ location as you zoom in. Dashed = approximate pin (city not in the coordinate index, pinned to its region/country). Players with no located game: ${fmt(t.unlocatedPlayers || 0)} (played before tracking began or without geo headers).`}
      />
      <BubbleMap
        title="Games played by location"
        subtitle={`${baseNote} Every completed game with a location, all formats, replays included.`}
        accent={C.plays}
        points={d.plays || []}
        unitSingular="game"
        unitPlural="games"
        footnote={`Bubble area = games played from that location; labels show the largest totals first and every 2+ location as you zoom in. Dashed = approximate pin. Games with no location: ${fmt(t.unlocatedPlays || 0)} of ${fmt(t.plays || 0)} all-time (played before tracking began).`}
      />
    </div>
  );
}
