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
    T('EXPERTS AND AGGREGATORS', { fontSize: 33, fontWeight: 700, letterSpacing: '8px', color: '#2563eb' }),
    T(`WHERE ${count} AGREE · SOURCEOFTRUTHS.COM`, { fontSize: 19, fontWeight: 700, letterSpacing: '2.5px', color: '#9aa0ab', marginTop: '24px' }),
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


// Per-quiz share card in the SAME rebranded style (Manrope, near-white, blue/gold
// logo) as the homepage brand card, so quiz links no longer share the old
// cream/red Fraunces card. Shows the quiz title + blurb + a "· QUIZ" label.
function buildQuizCard({ title, blurb, category }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const blurbText = (blurb || '').length > 190 ? (blurb || '').slice(0, 187).trimEnd() + '…' : (blurb || '');
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 132, height: 132, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#2563eb', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(title || 'Source of Truths Quiz', { fontSize: 58, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.05, maxWidth: '96%' }),
      blurbText ? T(blurbText, { fontSize: 27, fontWeight: 600, color: '#6b7280', lineHeight: 1.32, marginTop: '22px', maxWidth: '94%' }) : h('div', { key: 'nob', style: { display: 'flex' } }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T('A SOURCE OF TRUTHS QUIZ', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
      T('PLAY AT SOURCEOFTRUTHS.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#2563eb' }),
    ]),
  ]);
}

export async function renderQuizCard({ title, blurb, category } = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  return new ImageResponse(buildQuizCard({ title, blurb, category }), { ...size, fonts });
}


// Truncate a name/title to a max char count with an ellipsis so a very long
// string can never overflow the card width.
function clampStr(str, max) {
  str = str || '';
  return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str;
}

// Per-list share card in the SAME rebranded style (Manrope, near-white,
// blue/gold ringed logo) as the homepage and quiz cards. Shows the list title,
// category, and a ranking countdown preview (10 -> 6, or bullets when unranked).
function buildListCard({ title, category, previewItems = [], startPosition = 10, isUnranked = false }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${clampStr(category || 'Top 10', 26)} · ${isUnranked ? 'THE SET' : 'TOP 10'}`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#2563eb', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Source of Truths', 64), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.05, maxWidth: '96%' }),
      T(isUnranked ? 'A handpicked set. Not ranked, just the ones worth owning.' : 'Counting down from ten. Top five revealed on site.', { fontSize: 24, fontWeight: 600, color: '#6b7280', marginTop: '14px' }),
      h('div', { key: 'items', style: { display: 'flex', flexDirection: 'column', marginTop: '24px' } },
        previewItems.map((name, idx) => h('div', { key: idx, style: { display: 'flex', alignItems: 'center', marginBottom: '6px' } }, [
          h('div', { key: 'r', style: { display: 'flex', fontSize: 34, fontWeight: 800, color: '#2563eb', width: isUnranked ? 34 : 70, justifyContent: 'flex-end', marginRight: '24px', lineHeight: 1.1 } }, isUnranked ? '•' : String(startPosition - idx)),
          h('div', { key: 'n', style: { display: 'flex', fontSize: 28, fontWeight: 600, color: '#1c1e24', lineHeight: 1.1, maxWidth: 900 } }, clampStr(name, 52) || 'Untitled'),
        ]))
      ),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T(isUnranked ? 'See the full set at sourceoftruths.com' : 'See 5 through 1 at sourceoftruths.com', { fontSize: 18, fontWeight: 600, color: '#9aa0ab' }),
      T(isUnranked ? 'BROWSE THE PICKS' : 'READ THE FULL RANKING', { fontSize: 18, fontWeight: 700, letterSpacing: '1px', color: '#2563eb' }),
    ]),
  ]);
}

export async function renderListCard(opts = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  return new ImageResponse(buildListCard(opts), { ...size, fonts });
}


// Personalized RESULT share card: same rebranded style, but the hero is the
// player's SCORE so a shared result reads "I got 47 / 196" instead of the
// generic quiz card. Rendered by app/quiz/[id]/result-image/route.js.
function buildResultCard({ title, category, score, total, pct }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const titleText = (title || 'Source of Truths Quiz').length > 96 ? (title || '').slice(0, 95).trimEnd() + '…' : (title || 'Source of Truths Quiz');
  const beat = (typeof pct === 'number' && pct > 0 && pct < 100) ? `Top ${100 - pct}% of players. Can you beat it?` : 'Can you beat it?';
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${(category || 'Quiz')} · RESULT`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#2563eb', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }, [
      h('div', { key: 'sc', style: { display: 'flex', alignItems: 'baseline' } }, [
        T(String(score), { fontSize: 150, fontWeight: 800, letterSpacing: '-4px', color: '#1c1e24', lineHeight: 1 }),
        T(` / ${total}`, { fontSize: 64, fontWeight: 800, color: '#9aa0ab', marginLeft: '8px' }),
      ]),
      T(titleText, { fontSize: 40, fontWeight: 800, letterSpacing: '-1px', color: '#2563eb', lineHeight: 1.08, marginTop: '14px', maxWidth: '94%' }),
      T(beat, { fontSize: 27, fontWeight: 600, color: '#6b7280', marginTop: '12px' }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T('A SOURCE OF TRUTHS QUIZ', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
      T('PLAY AT SOURCEOFTRUTHS.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#2563eb' }),
    ]),
  ]);
}

export async function renderQuizResultCard({ title, category, score, total, pct } = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  return new ImageResponse(buildResultCard({ title, category, score, total, pct }), { ...size, fonts });
}
