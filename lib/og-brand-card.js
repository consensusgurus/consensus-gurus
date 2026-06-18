import { ImageResponse } from 'next/og';
import React from 'react';
import { getAllSources } from '@/lib/sources';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const h = React.createElement;

// Icon (rounded blue square + target rings + gold star) with faint
// converging rings, emitted as an SVG data URI so Satori lays it out as one img.
function iconRingsDataURI() {
  let rings = '';
  for (let i = 1; i <= 5; i++) {
    rings += `<circle cx="160" cy="160" r="${52 + i * 22}" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-opacity="${(0.075 - i * 0.011).toFixed(3)}"/>`;
  }
  const icon = `<g transform="translate(85,85) scale(${150 / 64})"><rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#b)"/><circle cx="32" cy="32.5" r="16.4" stroke="#fff" stroke-width="4.2" fill="none"/><circle cx="32" cy="32.5" r="9.6" stroke="#fff" stroke-width="4.2" fill="none" stroke-opacity="0.9"/><path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#g)"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="b" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3b74f0"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#ffe24d"/><stop offset="0.55" stop-color="#fbb615"/><stop offset="1" stop-color="#f59008"/></radialGradient></defs>${rings}${icon}</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

function buildCard(count) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('img', { key: 'icon', src: iconRingsDataURI(), width: 300, height: 300, style: { marginTop: '-8px' } }),
    T('Source of Truths', { fontSize: 86, fontWeight: 800, letterSpacing: '-2.5px', color: '#1c1e24', marginTop: '-44px' }),
    h('div', { key: 'div', style: { display: 'flex', width: '340px', height: '3px', background: '#fbb615', margin: '10px 0 20px' } }),
    T('PRODUCING OBJECTIVITY', { fontSize: 33, fontWeight: 700, letterSpacing: '11px', color: '#2563eb' }),
    T('Ranking the best of everything, plus quizzes', { fontSize: 27, fontWeight: 600, color: '#6b7280', marginTop: '22px' }),
    T(`FROM ${count} SOURCES · SOURCEOFTRUTHS.COM`, { fontSize: 19, fontWeight: 700, letterSpacing: '2.5px', color: '#9aa0ab', marginTop: '24px' }),
  ]);
}

async function woff(w) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-${w}-normal.woff`);
    if (r.ok) return await r.arrayBuffer();
  } catch (e) { /* fall through */ }
  return null;
}

export async function renderBrandCard() {
  let count = 0;
  try { count = getAllSources().length; } catch (e) { count = 0; }
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  // Backfill any weight that failed to fetch with another that succeeded so
  // Satori always resolves every weight the card uses (avoids a 500).
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  return new ImageResponse(buildCard(count), { ...size, fonts });
}
