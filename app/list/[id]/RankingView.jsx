'use client';
import React from 'react';
import { getSources } from '@/lib/helpers';
import { HERO_IMAGES } from '@/lib/hero-images';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { buildLinks, picsConfig } from './ListOverview';

const C = { ink: '#1c1e24', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accent: '#2563eb', accsoft: '#e8effb', bg: '#f7f8fa' };
const MEDAL = ['#e8b43a', '#b8bcc4', '#c8814b'];
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const CHIP = [['#f3ddd8', '#c0392b'], ['#dbe4ee', '#34506e'], ['#e6dcf1', '#6b3fa0'], ['#d9ecdf', '#1f8a4c'], ['#f4e2cd', '#b5560f'], ['#eceef1', '#3a3f47']];
function chipColor(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return CHIP[h % CHIP.length]; }
function grad(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return `linear-gradient(135deg,hsl(${h},42%,42%),hsl(${(h + 28) % 360},46%,30%))`; }
function parseItem(full) {
  const m = String(full).match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), locality: m[2].trim() };
  return { name: String(full).trim(), locality: '' };
}
function shortLabel(label) {
  return String(label || '').replace(/\s*[·|–—-].*$/, '').replace(/\s*\(.*$/, '').replace(/\s*(Guide|Reviews?|Ranked by Rating).*$/i, '').trim();
}
function heroUrl(map, item) {
  if (!map) return null;
  const e = map[item];
  const src = e && (typeof e === 'string' ? e : e.src);
  return src && /^https?:/.test(src) ? src : null;
}
function chipsFor(item, publications) {
  const key = item.toLowerCase().trim();
  const seen = new Set();
  const out = [];
  for (const p of publications) {
    if (!p.items || !p.items.some((i) => i.toLowerCase().trim() === key)) continue;
    const lab = shortLabel(p.label);
    if (!lab || seen.has(lab.toLowerCase())) continue;
    seen.add(lab.toLowerCase());
    out.push(lab);
  }
  return out;
}

const BTN = { display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '6px 11px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', color: C.ink, textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap' };
const BTN_PRIMARY = { ...BTN, background: C.accent, borderColor: C.accent, color: '#fff' };

function ActionRow({ item, list }) {
  const links = buildLinks(item, list);
  const pics = picsConfig(list);
  const isPlace = (list.linkType || 'mapsCity') === 'mapsCity';
  const primaryLabel = isPlace ? 'Map' : list.linkLabel ? list.linkLabel : list.linkType === 'amazon' ? 'Buy' : 'View';
  const rel = isPlace ? 'noopener noreferrer' : 'noopener noreferrer sponsored';
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
      {links.map && <a href={links.map} target="_blank" rel={rel} style={BTN_PRIMARY}>{primaryLabel}</a>}
      {links.website && <a href={links.website} target="_blank" rel="noopener noreferrer" style={BTN}>Website</a>}
      {pics.links.map(([k, label]) => (links[k] ? <a key={k} href={links[k]} target="_blank" rel="noopener noreferrer" style={BTN}>{label}</a> : null))}
    </div>
  );
}

function Chips({ names, light }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {names.slice(0, 5).map((n) => {
        if (light) return <span key={n} style={{ fontSize: 9.5, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 5, padding: '2px 7px' }}>{n}</span>;
        const [bg, fg] = chipColor(n);
        return <span key={n} style={{ fontSize: 9.5, fontWeight: 700, background: bg, color: fg, borderRadius: 5, padding: '2px 7px' }}>{n}</span>;
      })}
    </div>
  );
}

export default function RankingView({ list, voteData, extras }) {
  const mode = list.mode || 'both';
  const heroMap = HERO_IMAGES[list.id];
  const descs = DESCRIPTIONS[list.id] || {};

  if (mode === 'facts' || mode === 'scores' || mode === 'unranked' || mode === 'votes') {
    const items = (mode === 'votes' ? (list.vote && list.vote.items) : (list.sources && list.sources.ai && list.sources.ai.items)) || [];
    return (
      <div style={{ fontFamily: FONT }}>
        <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
          {items.map((item, i) => {
            const { name, locality } = parseItem(item);
            return (
              <div key={item} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '13px 15px', borderTop: i === 0 ? 'none' : `1px solid ${C.line}` }}>
                <span style={{ flex: 'none', width: 24, fontWeight: 800, fontSize: 16, color: C.ink, textAlign: 'center', marginTop: 1 }}>{i + 1}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{name}</div>
                  {locality && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{locality}</div>}
                  {i < 10 && descs[item] && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5, lineHeight: 1.5 }}>{descs[item]}</div>}
                  <ActionRow item={item} list={list} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const sources = getSources(list, voteData, extras, { limit: Infinity });
  const consensus = sources.find((s) => s.id === 'consensus');
  const publications = sources.filter((s) => s.id !== 'consensus');
  const items = (consensus && consensus.items) || [];
  const rawScores = (consensus && consensus.scores) || {};
  const top = Math.max(1, ...items.map((it) => rawScores[it] || 0));
  // Scale to a 60-100 band (not 0-100): #1 = 100, the weakest item lands ~60,
  // so a thin top-10 entry never reads like a near-zero score.
  const FLOOR = 60;
  const score100 = (it) => Math.round(FLOOR + (100 - FLOOR) * (rawScores[it] || 0) / top);

  const podium = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <div style={{ fontFamily: FONT }}>
      {podium.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.soft, margin: '2px 2px 10px' }}>Top 3 · The Podium</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 6 }}>
            {podium.map((item, i) => {
              const { name, locality } = parseItem(item);
              const src = heroUrl(heroMap, item);
              const big = i === 0;
              return (
                <div key={item} style={{ gridColumn: big ? '1 / -1' : 'auto', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', minHeight: big ? 210 : 180, backgroundImage: src ? `url("${src}")` : grad(name), backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,13,16,0.86), rgba(12,13,16,0.18) 58%, rgba(12,13,16,0))' }} />
                    <span style={{ position: 'absolute', top: 12, left: 12, width: 30, height: 30, borderRadius: '50%', background: MEDAL[i], color: '#1c1e24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, zIndex: 2, boxShadow: '0 2px 6px rgba(0,0,0,.25)' }}>{i + 1}</span>
                    <span style={{ position: 'absolute', top: 12, right: 14, zIndex: 2, color: '#fff', fontSize: 25, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,.4)' }}>{score100(item)}<small style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.85, marginTop: 3 }}>consensus</small></span>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 18px', color: '#fff' }}>
                      <div style={{ fontSize: big ? 24 : 19, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{name}</div>
                      {locality && <div style={{ fontSize: 12, opacity: 0.85, margin: '3px 0 10px' }}>{locality}</div>}
                      <Chips names={chipsFor(item, publications)} light />
                    </div>
                  </div>
                  <div style={{ padding: '13px 16px' }}>
                    {descs[item] && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, margin: 0 }}>{descs[item]}</p>}
                    <ActionRow item={item} list={list} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {rest.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.soft, margin: '20px 2px 8px' }}>The Rest of the Ranking</div>
          <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
            {rest.map((item, idx) => {
              const i = idx + 3;
              const { name, locality } = parseItem(item);
              const src = heroUrl(heroMap, item);
              return (
                <div key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '13px 15px', borderTop: idx === 0 ? 'none' : `1px solid ${C.line}` }}>
                  <span style={{ flex: 'none', width: 22, fontWeight: 800, fontSize: 18, color: C.ink, textAlign: 'center', marginTop: 2 }}>{i + 1}</span>
                  <span style={{ flex: 'none', width: 54, height: 54, borderRadius: 10, backgroundImage: src ? `url("${src}")` : grad(name), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>{name}</div>
                    {locality && <div style={{ fontSize: 11.5, color: C.muted, margin: '2px 0 0' }}>{locality}</div>}
                    {i < 10 && descs[item] && <div style={{ fontSize: 12.5, color: C.muted, margin: '5px 0 0', lineHeight: 1.5 }}>{descs[item]}</div>}
                    <div style={{ marginTop: 7 }}><Chips names={chipsFor(item, publications)} /></div>
                    <ActionRow item={item} list={list} />
                  </div>
                  <div style={{ flex: 'none', textAlign: 'right' }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: C.accent, fontVariantNumeric: 'tabular-nums' }}>{score100(item)}</div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.soft }}>consensus</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
