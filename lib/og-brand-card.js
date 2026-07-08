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
  cols: 6,
  rows: 5,
  // Neutral demo layout — every across/down run is a REAL word (across: PLANET,
  // AGO, NEAR; down: PIANO, ACORN, TIGER), NOT any puzzle's solution, so the
  // card never spoils the day and never shows a nonsense word. cat -> CRUX_CATS.
  cells: {
    '0,0': { ch: 'P', cat: 1 }, '0,1': { ch: 'L' }, '0,2': { ch: 'A', cat: 2 }, '0,3': { ch: 'N' }, '0,4': { ch: 'E' }, '0,5': { ch: 'T', cat: 0 },
    '1,0': { ch: 'I', cat: 1 }, '1,2': { ch: 'C', cat: 2 }, '1,5': { ch: 'I', cat: 0 },
    '2,0': { ch: 'A', cat: 1 }, '2,1': { ch: 'G' }, '2,2': { ch: 'O', cat: 2 }, '2,5': { ch: 'G', cat: 0 },
    '3,0': { ch: 'N', cat: 1 }, '3,2': { ch: 'R', cat: 2 }, '3,5': { ch: 'E', cat: 0 },
    '4,0': { ch: 'O', cat: 1 }, '4,2': { ch: 'N', cat: 3 }, '4,3': { ch: 'E', cat: 3 }, '4,4': { ch: 'A', cat: 3 }, '4,5': { ch: 'R', cat: 3 },
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
      T('A word game with no clues.', { fontSize: 33, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px' }),
      T('Eight hidden words interlock in a mini crossword. Four secret categories. Eighteen shared guesses.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
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
