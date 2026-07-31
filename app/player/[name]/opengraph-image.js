import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'nodejs';
export const alt = 'Source of Truths player profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamicParams = true;
export function generateStaticParams() { return []; }

const h = React.createElement;

// Brand icon as an SVG data URI (same mark as lib/og-brand-card.js).
function iconDataURI() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 64 64"><defs><linearGradient id="b" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1e3a6b"/><stop offset="1" stop-color="#0a1730"/></linearGradient><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#ffe24d"/><stop offset="0.55" stop-color="#fbb615"/><stop offset="1" stop-color="#f59008"/></radialGradient></defs><rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#b)"/><circle cx="32" cy="32.5" r="16.4" fill="#ffffff"/><circle cx="32" cy="32.5" r="12.2" fill="#112446"/><circle cx="32" cy="32.5" r="9.6" fill="#e8eaed"/><path d="M 32 25.1 L 33.77 30.73 L 36.1 32.5 L 33.77 34.27 L 32 39.9 L 30.23 34.27 L 27.9 32.5 L 30.23 30.73 Z" stroke="#0e1d40" stroke-width="0.4" stroke-linejoin="round" fill="url(#g)"/></svg>`;
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
    const r = await fetch(`https://sourceoftruths.com/api/quiz/player?username=${encodeURIComponent(name)}`, { signal: ctrl.signal });
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
    h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
      h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
      h('div', { key: 'head', style: { display: 'flex', alignItems: 'center', marginTop: '-8px' } }, [
        h('img', { key: 'icon', src: iconDataURI(), width: 120, height: 120 }),
        h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column', marginLeft: '22px' } }, [
          T('SOURCE OF TRUTHS', { fontSize: 30, fontWeight: 800, letterSpacing: '6px', color: '#1e3a6b' }),
          T('PLAYER PROFILE', { fontSize: 22, fontWeight: 700, letterSpacing: '8px', color: '#0e1d40', marginTop: '6px' }),
        ]),
      ]),
      T(name, { fontSize: name.length > 14 ? 76 : 96, fontWeight: 800, letterSpacing: '-2px', color: '#12141a', marginTop: '18px', maxWidth: '1100px' }),
      tier
        ? T(`${tier} TIER`, { fontSize: 26, fontWeight: 800, letterSpacing: '5px', color: '#8a5300', background: '#fbf2dc', border: '2px solid #e8b43a', borderRadius: '999px', padding: '10px 30px', marginTop: '16px' })
        : h('div', { key: 'sp', style: { display: 'flex', height: '14px' } }),
      statBits.length
        ? T(statBits.join('  ·  '), { fontSize: 32, fontWeight: 800, letterSpacing: '2px', color: '#ffffff', background: '#0e1d40', borderRadius: '999px', padding: '16px 40px', marginTop: '26px' })
        : T('DAILY PUZZLES · QUIZZES · TROPHIES', { fontSize: 30, fontWeight: 700, letterSpacing: '3px', color: '#ffffff', background: '#0e1d40', borderRadius: '999px', padding: '16px 40px', marginTop: '26px' }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM', { fontSize: 24, fontWeight: 800, letterSpacing: '4px', color: '#1e3a6b', marginTop: '24px' }),
    ]),
    { ...size, fonts },
  );
}
