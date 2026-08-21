import { ImageResponse } from 'next/og';
import React from 'react';
import { SITE_URL } from '@/lib/site';

export const runtime = 'nodejs';
export const alt = 'Mind Loft player profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamicParams = true;
export function generateStaticParams() { return []; }

const h = React.createElement;

// Mind Loft mark (caret over brain), same mark as lib/og-brand-card.js.
// Hexes stay LITERAL: this is an SVG string, not JSX.
function iconDataURI() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 120 120"><path d="M20 52l40-34 40 34" stroke="#14141a" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M14 102h92" stroke="#14141a" stroke-width="6" stroke-linecap="round"/><g transform="translate(31,48) scale(0.53)"><path d="M14 42C12 28 22 16 36 16C40 8 54 6 60 14C70 8 84 14 86 26C96 30 98 44 88 50C92 58 86 66 76 64C74 72 64 74 60 66C48 70 36 66 32 56C20 56 12 50 14 42Z" fill="#2563eb"/></g></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

async function woff(w) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-${w}-normal.woff`);
    if (r.ok) return await r.arrayBuffer();
  } catch (e) { /* fall through */ }
  return null;
}

// Best-effort live stats: the profile API is heavy, so give it a short leash
// and render the name-only card when it does not answer in time.
async function fetchProfile(name) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4500);
    const r = await fetch(`${SITE_URL}/api/quiz/player?username=${encodeURIComponent(name)}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const d = await r.json();
    return d && d.found ? d : null;
  } catch (e) { return null; }
}

// Timeline-sized (X crops to ~2:1 and shows the card at ~500-680px): big,
// dark, high-contrast text in the central band; no thin grey copy.
export default async function Image({ params }) {
  const name = decodeURIComponent(params.name || 'Player');
  const p = await fetchProfile(name);
  const [w800, w700] = await Promise.all([woff(800), woff(700)]);
  const fonts = [];
  if (w800) fonts.push({ name: 'Manrope', data: w800, weight: 800, style: 'normal' });
  if (w700) fonts.push({ name: 'Manrope', data: w700, weight: 700, style: 'normal' });

  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const tier = p && p.tier ? String(p.tier).replace(/ Tier$/, '').toUpperCase() : null;
  const troph = p && p.trophies ? p.trophies.earnedCount : null;
  const statBits = [];
  if (p) {
    statBits.push(`LEVEL ${p.level || 1}`);
    statBits.push(`${(p.xp || 0).toLocaleString()} IQ`);
    if (p.rank) statBits.push(`RANK #${p.rank.toLocaleString()}`);
    if (troph != null) statBits.push(`${troph} ${troph === 1 ? 'TROPHY' : 'TROPHIES'}`);
  }

  return new ImageResponse(
    h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fbfaf9', fontFamily: 'Manrope', position: 'relative' } }, [
      h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#14141a,#1e3a8a 55%,#2563eb)' } }),
      h('div', { key: 'head', style: { display: 'flex', alignItems: 'center', marginTop: '-8px' } }, [
        h('img', { key: 'icon', src: iconDataURI(), width: 120, height: 120 }),
        h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column', marginLeft: '22px' } }, [
          T('MIND LOFT', { fontSize: 30, fontWeight: 800, letterSpacing: '6px', color: '#1e3a8a' }),
          T('PLAYER PROFILE', { fontSize: 22, fontWeight: 700, letterSpacing: '8px', color: '#1e3a8a', marginTop: '6px' }),
        ]),
      ]),
      T(name, { fontSize: name.length > 14 ? 76 : 96, fontWeight: 800, letterSpacing: '-2px', color: '#14141a', marginTop: '18px', maxWidth: '1100px' }),
      tier
        ? T(`${tier} TIER`, { fontSize: 26, fontWeight: 800, letterSpacing: '5px', color: '#8a5300', background: '#fbf2dc', border: '2px solid #e0ae4a', borderRadius: '999px', padding: '10px 30px', marginTop: '16px' })
        : h('div', { key: 'sp', style: { display: 'flex', height: '14px' } }),
      statBits.length
        ? T(statBits.join('  ·  '), { fontSize: 32, fontWeight: 800, letterSpacing: '2px', color: '#ffffff', background: '#1e3a8a', borderRadius: '999px', padding: '16px 40px', marginTop: '26px' })
        : T('DAILY PUZZLES · QUIZZES · TROPHIES', { fontSize: 30, fontWeight: 700, letterSpacing: '3px', color: '#ffffff', background: '#1e3a8a', borderRadius: '999px', padding: '16px 40px', marginTop: '26px' }),
      T('PLAY FREE · MINDLOFTDAILY.COM', { fontSize: 24, fontWeight: 800, letterSpacing: '4px', color: '#1e3a8a', marginTop: '24px' }),
    ]),
    { ...size, fonts },
  );
}
