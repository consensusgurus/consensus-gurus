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

// Fetch a company favicon (Google s2, PNG) as a data URI for embedding in a
// share card. Returns null on any failure so the card still renders.
async function faviconDataURI(domain) {
  if (!domain) return null;
  try {
    const res = await fetch(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    if (!res || !res.ok) return null;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!/png|jpe?g/.test(ct)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (!buf || buf.length < 50) return null;
    const mime = /jpe?g/.test(ct) ? 'image/jpeg' : 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch (e) { return null; }
}

// The top-right header element: the "CATEGORY · LABEL" tag, optionally preceded
// by a company favicon badge (company earnings quizzes).
function headerRight(label, faviconUri) {
  const lbl = h('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#2563eb', textTransform: 'uppercase' } }, label);
  if (!faviconUri) return lbl;
  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('img', { key: 'fav', src: faviconUri, width: 60, height: 60, style: { borderRadius: 14, marginRight: '18px', border: '1px solid #e2e5ea' } }),
    lbl,
  ]);
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
function buildResultCard({ title, category, score, total, pct, faviconUri }) {
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
        headerRight(`${(category || 'Quiz')} · RESULT`, faviconUri),
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

export async function renderQuizResultCard({ title, category, score, total, pct, faviconDomain } = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  const faviconUri = faviconDomain ? await faviconDataURI(faviconDomain) : null;
  return new ImageResponse(buildResultCard({ title, category, score, total, pct, faviconUri }), { ...size, fonts });
}


// Per-quiz PROMO share card (1200x630) built for posting as a standalone IMAGE
// (no link, better X reach). Features the quiz TITLE + its DESCRIPTION, a
// play/test-your-knowledge CTA, and the quiz URL printed as text so it stays
// findable without a clickable link. Rendered by app/quiz/[id]/share-image/route.js.
function buildQuizPromoCard({ title, blurb, category, id }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const blurbText = (blurb || '').length > 200 ? (blurb || '').slice(0, 197).trimEnd() + '…' : (blurb || '');
  const path = `sourceoftruths.com/quiz/${id || ''}`;
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '52px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 124, height: 124, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#2563eb', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '8px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Source of Truths Quiz', 70), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.04, maxWidth: '96%' }),
      blurbText ? T(blurbText, { fontSize: 26, fontWeight: 600, color: '#6b7280', lineHeight: 1.32, marginTop: '18px', maxWidth: '94%' }) : h('div', { key: 'nob', style: { display: 'flex' } }),
      T('Play the quiz. Test your knowledge.', { fontSize: 24, fontWeight: 800, color: '#2563eb', marginTop: '20px' }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T(path, { fontSize: 24, fontWeight: 800, color: '#1c1e24' }),
      T('FREE · NO ADS', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
    ]),
  ]);
}

export async function renderQuizPromoCard({ title, blurb, category, id } = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildQuizPromoCard({ title, blurb, category, id }), { ...size, fonts });
}


// Featured-QUESTION share card for business-news timed-mcq quizzes: shows the
// quiz's first (best) question and its four options, the quiz title, a company
// favicon (earnings quizzes), and a leaderboard call to action. The answer is
// not revealed.
function buildQuestionCard({ title, category, question, qIndex, total, id, faviconUri }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const q = question || {};
  const choices = Array.isArray(q.choices) ? q.choices.slice(0, 4) : [];
  const letters = ['A', 'B', 'C', 'D'];
  const qText = clampStr(q.q || '', 150);
  const ttl = clampStr(title || 'Source of Truths Quiz', 44);
  const path = `sourceoftruths.com/quiz/${id || ''}`;
  const chip = (c, i) => h('div', { key: 'c' + i, style: { display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0, background: '#fff', border: '1px solid #e2e5ea', borderRadius: '12px', padding: '15px 18px' } }, [
    h('div', { key: 'l', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, borderRadius: '9px', background: '#e8effb', color: '#2563eb', fontSize: '23px', fontWeight: 800, marginRight: '15px' } }, letters[i]),
    h('div', { key: 't', style: { display: 'flex', fontSize: '26px', fontWeight: 600, color: '#1c1e24', lineHeight: 1.08 } }, clampStr(c || '', 40)),
  ]);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '44px 64px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 102, height: 102, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 38, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        headerRight(`${(category || 'Quiz')} · QUIZ`, faviconUri),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '8px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column', flex: '1 1 0', justifyContent: 'center', paddingTop: '6px' } }, [
      h('div', { key: 'qh', style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' } }, [
        T(`QUESTION ${qIndex || 1} OF ${total || ''}`.trim(), { fontSize: 19, fontWeight: 800, letterSpacing: '2.5px', color: '#9aa0ab' }),
        T(ttl, { fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px', color: '#1c1e24' }),
      ]),
      T(qText, { fontSize: 41, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24', lineHeight: 1.1, marginBottom: '20px', maxWidth: '100%' }),
      h('div', { key: 'r1', style: { display: 'flex', gap: '16px', marginBottom: '12px' } }, [chip(choices[0], 0), chip(choices[1], 1)]),
      h('div', { key: 'r2', style: { display: 'flex', gap: '16px' } }, [chip(choices[2], 2), chip(choices[3], 3)]),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '15px' } }, [
      T(path, { fontSize: 22, fontWeight: 800, color: '#1c1e24' }),
      T('PLAY FREE, TOP THE LEADERBOARD', { fontSize: 19, fontWeight: 800, letterSpacing: '1px', color: '#2563eb' }),
    ]),
  ]);
}

export async function renderQuizQuestionCard({ title, category, question, qIndex, total, id, faviconDomain } = {}) {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  const faviconUri = faviconDomain ? await faviconDataURI(faviconDomain) : null;
  return new ImageResponse(buildQuestionCard({ title, category, question, qIndex, total, id, faviconUri }), { ...size, fonts });
}


// ---------------------------------------------------------------------------
// Crux daily-word-game share card (1200x630). A SNAPSHOT of the actual board:
// an interlocking mini-crossword with a few words already "filed" under their
// category colors (coral / teal / steel / plum), sitting beside the game's
// pitch. The letters are a neutral, self-consistent DEMO layout — NOT any real
// puzzle's solution — so the card never spoils the day's answers and needs no
// per-day regeneration. Rendered by app/crux/opengraph-image.js (+ twitter).
const CRUX_CATS = [{ bg: '#e6b93f', tc: '#5c4a06' }, { bg: '#5aa96a', tc: '#173f1f' }, { bg: '#5a97dd', tc: '#0c3a66' }, { bg: '#d96363', tc: '#571212' }]; // yellow green blue red — matches game CAT_COLORS
const CRUX_BOARD = {
  cols: 5,
  rows: 7,
  // A REAL mini-Crux (not any day's solution): two category pairs that
  // actually belong together — fruits LEMON+MELON (yellow) crossing metals
  // STEEL+BRASS (blue). Clean lattice, no nonsense runs, no spoilers.
  cells: {
    '0,0': { ch: 'B', cat: 2 },
    '1,0': { ch: 'R', cat: 2 },
    '2,0': { ch: 'A', cat: 2 }, '2,4': { ch: 'M', cat: 0 },
    '3,0': { ch: 'S', cat: 2 }, '3,4': { ch: 'E', cat: 0 },
    '4,0': { ch: 'S', cat: 2 }, '4,1': { ch: 'T', cat: 2 }, '4,2': { ch: 'E', cat: 2 }, '4,3': { ch: 'E', cat: 2 }, '4,4': { ch: 'L', cat: 2 },
    '5,4': { ch: 'O', cat: 0 },
    '6,0': { ch: 'L', cat: 0 }, '6,1': { ch: 'E', cat: 0 }, '6,2': { ch: 'M', cat: 0 }, '6,3': { ch: 'O', cat: 0 }, '6,4': { ch: 'N', cat: 0 },
  },
};

function cruxBoardEl() {
  const CELL = 66, GAP = 9;
  const rows = [];
  for (let r = 0; r < CRUX_BOARD.rows; r++) {
    const cells = [];
    for (let c = 0; c < CRUX_BOARD.cols; c++) {
      const cell = CRUX_BOARD.cells[r + ',' + c];
      const base = { display: 'flex', width: CELL, height: CELL, marginRight: c === CRUX_BOARD.cols - 1 ? 0 : GAP, alignItems: 'center', justifyContent: 'center', borderRadius: 10 };
      if (!cell) {
        cells.push(h('div', { key: c, style: { ...base, background: 'transparent' } }));
      } else if (cell.cat !== undefined) {
        cells.push(h('div', { key: c, style: { ...base, background: CRUX_CATS[cell.cat].bg, color: CRUX_CATS[cell.cat].tc, fontSize: 34, fontWeight: 800 } }, cell.ch));
      } else {
        cells.push(h('div', { key: c, style: { ...base, background: '#fff', color: '#1c1e24', fontSize: 34, fontWeight: 800, border: '1.5px solid rgba(20,22,28,0.16)' } }, cell.ch));
      }
    }
    rows.push(h('div', { key: r, style: { display: 'flex', marginBottom: r === CRUX_BOARD.rows - 1 ? 0 : GAP } }, cells));
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column' } }, rows);
}

function buildCruxCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const pill = (bg) => h('div', { key: bg, style: { display: 'flex', width: 52, height: 20, borderRadius: 10, background: bg, marginRight: 12 } });
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Crux', { fontSize: 104, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#2563eb', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('A clueless crossword.', { fontSize: 33, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }),
      T('Eight hidden words interlock, four categories to untangle, eighteen shared guesses.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      h('div', { key: 'legend', style: { display: 'flex', alignItems: 'center', marginTop: 24 } }, [pill('#e6b93f'), pill('#5aa96a'), pill('#5a97dd'), pill('#d96363')]),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/CRUX', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, cruxBoardEl()),
  ]);
}

export async function renderCruxCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCruxCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Garble share card — snapshot of the game, same framing as the Crux card.
// Demo content is NEUTRAL (no banked puzzle uses it): scramble RAGBLE →
// GARBLE with its G and E marked gold, feeding a four-letter finale GEMS
// that still needs two letters. Evergreen, spoiler-free.
const GARBLE_GOLD = { bg: '#e6b93f', tc: '#5c4a06' }; // matches game COLORS.gold/goldInk
const GARBLE_PAPER = { bg: '#eceef1', tc: '#8a8f99' };

function garbleBoardEl() {
  const CELL = 64, GAP = 9;
  const tile = (ch, kind, key, cell = CELL) => {
    const base = { display: 'flex', width: cell, height: cell, alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: Math.round(cell * 0.52), fontWeight: 800, marginRight: GAP };
    if (kind === 'paper') return h('div', { key, style: { ...base, background: GARBLE_PAPER.bg, color: GARBLE_PAPER.tc } }, ch);
    if (kind === 'gold') return h('div', { key, style: { ...base, background: GARBLE_GOLD.bg, color: GARBLE_GOLD.tc } }, ch);
    return h('div', { key, style: { ...base, background: '#fff', color: '#1c1e24', border: '1.5px solid rgba(20,22,28,0.16)' } }, ch);
  };
  const row = (chars, kinds, key, cell = CELL) =>
    h('div', { key, style: { display: 'flex' } }, chars.map((ch, i) => tile(ch, kinds[i], key + i, cell)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }, [
    row(['R', 'A', 'G', 'B', 'L', 'E'], ['paper', 'paper', 'paper', 'paper', 'paper', 'paper'], 'scr'),
    h('div', { key: 'arr', style: { display: 'flex', color: '#9aa0ab', fontSize: 30, fontWeight: 800, margin: '6px 0 6px 18px' } }, '↓'),
    row(['G', 'A', 'R', 'B', 'L', 'E'], ['gold', 'white', 'white', 'white', 'white', 'gold'], 'ans'),
    h('div', { key: 'fin', style: { display: 'flex', flexDirection: 'column', marginTop: 26, background: '#fff', border: '1.5px solid rgba(20,22,28,0.16)', borderRadius: 14, padding: '16px 18px' } }, [
      h('div', { key: 'lbl', style: { display: 'flex', fontSize: 16, fontWeight: 800, letterSpacing: '2px', color: GARBLE_GOLD.tc, marginBottom: 10 } }, 'THE FINALE'),
      row(['G', '?', '?', 'E'], ['gold', 'paper', 'paper', 'gold'], 'fcell', 52),
    ]),
  ]);
}

function buildGarbleCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Garble', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#2563eb', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Five garbled words. One clued finale.', { fontSize: 32, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }),
      T('Untangle each word — its gold letters feed the finale. Solve the finale any time; it ends the game.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/GARBLE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, garbleBoardEl()),
  ]);
}

export async function renderGarbleCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildGarbleCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Links share card — snapshot of the game, same framing as the Crux/Garble
// cards. Demo content is NEUTRAL (no banked puzzle uses these words):
// a banked yellow thread of chess pieces plus twelve unsolved tiles from
// three obvious demo sets. Evergreen, spoiler-free.
const LINKS_CATS = [
  { bg: '#e6b93f', tc: '#5c4a06' },
  { bg: '#5aa96a', tc: '#173f1f' },
  { bg: '#5a97dd', tc: '#0c3a66' },
  { bg: '#d96363', tc: '#571212' },
];

function linksBoardEl() {
  const W = 118, H = 52, GAP = 8;
  const tile = (txt, key, on) =>
    h('div', { key, style: { display: 'flex', width: W, height: H, alignItems: 'center', justifyContent: 'center', borderRadius: 9, fontSize: 17, fontWeight: 800, background: on ? '#1c1e24' : '#fff', color: on ? '#fff' : '#1c1e24', border: on ? '1.5px solid #1c1e24' : '1.5px solid rgba(20,22,28,0.3)' } }, txt);
  const row = (words, key, ons = []) =>
    h('div', { key, style: { display: 'flex', gap: GAP, marginBottom: GAP } }, words.map((w, i) => tile(w, key + i, ons[i])));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }, [
    h('div', { key: 'bank', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: W * 4 + GAP * 3, borderRadius: 10, background: LINKS_CATS[0].bg, padding: '9px 0', marginBottom: GAP } }, [
      h('div', { key: 'n', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: LINKS_CATS[0].tc } }, 'CHESS PIECES'),
      h('div', { key: 'w', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: LINKS_CATS[0].tc, marginTop: 3 } }, 'PAWN, ROOK, BISHOP, KING'),
    ]),
    row(['NORTH', 'PECAN', 'PINKY', 'WEST'], 'r1', [false, true, false, false]),
    row(['THUMB', 'EAST', 'WALNUT', 'INDEX'], 'r2', [false, false, true, false]),
    row(['ALMOND', 'RING', 'SOUTH', 'CASHEW'], 'r3', [true, false, false, true]),
  ]);
}

function buildLinksCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Links', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#2563eb', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Sixteen words. Four hidden threads.', { fontSize: 32, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }),
      T('Find the four groups of four before four mistakes find you. The words that look like they belong together usually don’t.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/LINKS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, linksBoardEl()),
  ]);
}

export async function renderLinksCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildLinksCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Span share card — snapshot of the game. Demo route is NEUTRAL (Portugal to
// Greece is not a banked puzzle). Evergreen, spoiler-free.
function spanBoardEl() {
  const chipEl = (txt, kind, key) => {
    const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 21, fontWeight: 800, padding: '12px 18px', marginBottom: 12 };
    if (kind === 'start') return h('div', { key, style: { ...base, background: '#1c1e24', color: '#fff' } }, txt);
    if (kind === 'end') return h('div', { key, style: { ...base, background: '#fff', color: '#1c1e24', border: '2px dashed rgba(20,22,28,0.45)' } }, txt);
    return h('div', { key, style: { ...base, background: '#eefaf1', color: '#14532d', border: '1.5px solid rgba(21,128,61,0.45)' } }, txt);
  };
  const down = (key) => h('div', { key, style: { display: 'flex', color: '#9aa0ab', fontSize: 24, fontWeight: 800, margin: '-4px 0 8px 26px' } }, '↓');
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '26px 30px 16px' } }, [
    h('div', { key: 'par', style: { display: 'flex', fontSize: 16, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 16 } }, 'PORTUGAL → GREECE · PAR 8'),
    chipEl('PORTUGAL', 'start', 'c0'),
    down('d0'),
    chipEl('SPAIN', 'step', 'c1'),
    down('d1'),
    chipEl('FRANCE', 'step', 'c2'),
    down('d2'),
    h('div', { key: 'dots', style: { display: 'flex', color: '#9aa0ab', fontSize: 26, fontWeight: 800, margin: '0 0 10px 22px' } }, '· · ·'),
    chipEl('GREECE', 'end', 'c9'),
  ]);
}

function buildSpanCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '640px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Span', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15803d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Cross the map, border by border.', { fontSize: 32, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }),
      T('Two countries a day. Chain land borders between them in the fewest moves — par is the shortest road on the map.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 600 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/SPAN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, spanBoardEl()),
  ]);
}

export async function renderSpanCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSpanCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Dating share card — snapshot of the game. Demo board is NEUTRAL (no banked
// puzzle uses these events). Evergreen, spoiler-free.
function datingBoardEl() {
  const W = 400;
  const row = (txt, yr, kind, key) => {
    const locked = kind === 'locked';
    return h('div', { key, style: { display: 'flex', alignItems: 'center', width: W, borderRadius: 10, padding: '13px 16px', marginBottom: 10, background: locked ? '#eefaf1' : '#fff', border: locked ? '2px solid rgba(21,128,61,0.5)' : '2px solid rgba(20,22,28,0.3)' } }, [
      h('div', { key: 't', style: { display: 'flex', flexGrow: 1, fontSize: 18, fontWeight: 800, color: locked ? '#14532d' : '#1c1e24' } }, txt),
      yr
        ? h('div', { key: 'y', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: locked ? '#14532d' : '#4c1d95', background: locked ? '#d8f2e0' : '#f5f0ff', borderRadius: 7, padding: '4px 10px' } }, yr)
        : h('div', { key: 'y', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#9aa0ab' } }, '↑↓'),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '24px 26px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'EARLIEST TO LATEST · 3 CHECKS'),
    row('Vikings reach North America', 'c. 1000', 'locked', 'r0'),
    row('The Ming dynasty begins', null, 'open', 'r1'),
    row('Shakespeare is born', null, 'open', 'r2'),
    row('The first photograph is taken', null, 'open', 'r3'),
    row('The Titanic sets sail', '1912', 'locked', 'r4'),
  ]);
}

function buildDatingCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '580px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Dating', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c3aed', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Put history in order.', { fontSize: 33, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }),
      T('Five moments a day, shuffled out of sequence. Arrange them oldest to newest — three checks, and every right placement locks in its year.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/DATING', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, datingBoardEl()),
  ]);
}

export async function renderDatingCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildDatingCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Tally share card — snapshot of the game. Demo board is NEUTRAL (no banked
// puzzle uses this arrangement). Evergreen, spoiler-free.
function tallyBoardEl() {
  // Every square — play cells, blocked cells, and both target rails — is the
  // SAME size and sits on one aligned grid: N cells + a target column per row,
  // then a matching target row beneath (the bottom-right corner is left blank).
  const CELL = 66, GAP = 7, N = 4;
  const demo = [
    [3, null, 5, 9],
    [null, 8, 2, null],
    [6, 4, null, 7],
    [1, null, 7, 3],
  ];
  const blocked = new Set(['0,1', '1,0', '1,3', '2,2', '3,1']);
  const rowT = [17, 10, 17, 11];
  const colT = [10, 12, 14, 19];
  const base = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: CELL, height: CELL, borderRadius: 10, marginRight: GAP };
  const cellEl = (r, c) => {
    const key = `${r},${c}`;
    if (blocked.has(key)) return h('div', { key, style: { ...base, background: '#1c1e24' } });
    const v = demo[r][c];
    return h('div', { key, style: { ...base, background: '#fff', border: '2px solid rgba(28,30,36,0.42)', fontSize: 30, fontWeight: 800, color: '#1c1e24' } }, v ? String(v) : '');
  };
  const tgt = (val, key) => h('div', { key, style: { ...base, background: '#15803d', fontSize: 26, fontWeight: 800, color: '#fff' } }, String(val));
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row', marginBottom: GAP } }, [
    ...Array.from({ length: N }, (_, c) => cellEl(r, c)),
    tgt(rowT[r], 'rt'),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '22px 22px 15px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'EVERY ROW & COLUMN HITS ITS TARGET'),
    ...Array.from({ length: N }, (_, r) => rowEl(r)),
    h('div', { key: 'ct', style: { display: 'flex', flexDirection: 'row' } }, colT.map((v, c) => tgt(v, `ct${c}`))),
  ]);
}
function buildTallyCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Tally', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15803d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Balance the books.', { fontSize: 33, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }),
      T('Fill the grid from your rack so every row and column adds up to its target. One solution — the fewest moves wins, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/TALLY', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, tallyBoardEl()),
  ]);
}

export async function renderTallyCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildTallyCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Suds share card — snapshot of the game. Demo board is the neutral canonical
// sudoku (not a banked Suds board), so it never spoils today. Evergreen.
function sudsBoardEl() {
  const CELL = 44, FS = 25;
  // classic textbook grid — recognizably sudoku, not one of our puzzles
  const demo = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ];
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: v ? '#fff' : '#fbfbfc',
      border: '1px solid rgba(28,30,36,0.22)',
      marginRight: (c === 2 || c === 5) ? 5 : 0,
      marginBottom: (r === 2 || r === 5) ? 5 : 0,
      fontSize: FS, fontWeight: 700, color: '#1c1e24',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'EVERY ROW, COLUMN & BOX HOLDS 1–9'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildSudsCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#ea580c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Suds', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#ea580c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#ea580c', margin: '16px 0 18px' } }),
      T('The daily sudoku.', { fontSize: 33, fontWeight: 800, color: '#ea580c', letterSpacing: '-0.5px' }),
      T('Fill the 9×9 grid so every row, column, and 3×3 box holds 1–9 exactly once. One logical solution — a clean solve wins, and Sundays go harder.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/SUDS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sudsBoardEl()),
  ]);
}

export async function renderSudsCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSudsCard(), { ...size, fonts });
}
