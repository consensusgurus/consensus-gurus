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
    rings += `<circle cx="160" cy="160" r="${52 + i * 22}" fill="none" stroke="#0a1730" stroke-width="2" stroke-opacity="${(0.075 - i * 0.011).toFixed(3)}"/>`;
  }
  const icon = `<g transform="translate(85,85) scale(${150 / 64})"><rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#b)"/><circle cx="32" cy="32.5" r="16.4" stroke="#fff" stroke-width="4.2" fill="none"/><circle cx="32" cy="32.5" r="9.6" stroke="#fff" stroke-width="4.2" fill="none" stroke-opacity="0.9"/><path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#g)"/></g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="b" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1e3a6b"/><stop offset="1" stop-color="#0a1730"/></linearGradient><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#ffe24d"/><stop offset="0.55" stop-color="#fbb615"/><stop offset="1" stop-color="#f59008"/></radialGradient></defs>${rings}${icon}</svg>`;
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
  const lbl = h('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#0e1d40', textTransform: 'uppercase' } }, label);
  if (!faviconUri) return lbl;
  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('img', { key: 'fav', src: faviconUri, width: 60, height: 60, style: { borderRadius: 14, marginRight: '18px', border: '1px solid #e2e5ea' } }),
    lbl,
  ]);
}

function buildCard(count) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('img', { key: 'icon', src: iconRingsDataURI(), width: 300, height: 300, style: { marginTop: '-8px' } }),
    T('Source of Truths', { fontSize: 86, fontWeight: 800, letterSpacing: '-2.5px', color: '#1c1e24', marginTop: '-44px' }),
    h('div', { key: 'div', style: { display: 'flex', width: '340px', height: '3px', background: '#fbb615', margin: '10px 0 20px' } }),
    T('DAILY BRAIN EXERCISES', { fontSize: 33, fontWeight: 700, letterSpacing: '8px', color: '#0e1d40' }),
    T('QUIZZES · TOP 10 LISTS · SOURCEOFTRUTHS.COM', { fontSize: 19, fontWeight: 700, letterSpacing: '2.5px', color: '#9aa0ab', marginTop: '24px' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 132, height: 132, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#0e1d40', textTransform: 'uppercase' }),
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
      T('PLAY AT SOURCEOFTRUTHS.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#0e1d40' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${clampStr(category || 'Top 10', 26)} · ${isUnranked ? 'THE SET' : 'TOP 10'}`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#0e1d40', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Source of Truths', 64), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.05, maxWidth: '96%' }),
      T(isUnranked ? 'A handpicked set. Not ranked, just the ones worth owning.' : 'Counting down from ten. Top five revealed on site.', { fontSize: 24, fontWeight: 600, color: '#6b7280', marginTop: '14px' }),
      h('div', { key: 'items', style: { display: 'flex', flexDirection: 'column', marginTop: '24px' } },
        previewItems.map((name, idx) => h('div', { key: idx, style: { display: 'flex', alignItems: 'center', marginBottom: '6px' } }, [
          h('div', { key: 'r', style: { display: 'flex', fontSize: 34, fontWeight: 800, color: '#0e1d40', width: isUnranked ? 34 : 70, justifyContent: 'flex-end', marginRight: '24px', lineHeight: 1.1 } }, isUnranked ? '•' : String(startPosition - idx)),
          h('div', { key: 'n', style: { display: 'flex', fontSize: 28, fontWeight: 600, color: '#1c1e24', lineHeight: 1.1, maxWidth: 900 } }, clampStr(name, 52) || 'Untitled'),
        ]))
      ),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T(isUnranked ? 'See the full set at sourceoftruths.com' : 'See 5 through 1 at sourceoftruths.com', { fontSize: 18, fontWeight: 600, color: '#9aa0ab' }),
      T(isUnranked ? 'BROWSE THE PICKS' : 'READ THE FULL RANKING', { fontSize: 18, fontWeight: 700, letterSpacing: '1px', color: '#0e1d40' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
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
      T(titleText, { fontSize: 40, fontWeight: 800, letterSpacing: '-1px', color: '#0e1d40', lineHeight: 1.08, marginTop: '14px', maxWidth: '94%' }),
      T(beat, { fontSize: 27, fontWeight: 600, color: '#6b7280', marginTop: '12px' }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T('A SOURCE OF TRUTHS QUIZ', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
      T('PLAY AT SOURCEOFTRUTHS.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#0e1d40' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 124, height: 124, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#0e1d40', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '8px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Source of Truths Quiz', 70), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.04, maxWidth: '96%' }),
      blurbText ? T(blurbText, { fontSize: 26, fontWeight: 600, color: '#6b7280', lineHeight: 1.32, marginTop: '18px', maxWidth: '94%' }) : h('div', { key: 'nob', style: { display: 'flex' } }),
      T('Play the quiz. Test your knowledge.', { fontSize: 24, fontWeight: 800, color: '#0e1d40', marginTop: '20px' }),
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
    h('div', { key: 'l', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, borderRadius: '9px', background: '#e8effb', color: '#0e1d40', fontSize: '23px', fontWeight: 800, marginRight: '15px' } }, letters[i]),
    h('div', { key: 't', style: { display: 'flex', fontSize: '26px', fontWeight: 600, color: '#1c1e24', lineHeight: 1.08 } }, clampStr(c || '', 40)),
  ]);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '44px 64px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
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
      T('PLAY FREE, TOP THE LEADERBOARD', { fontSize: 19, fontWeight: 800, letterSpacing: '1px', color: '#0e1d40' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Crux', { fontSize: 104, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0e1d40', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('A clueless crossword.', { fontSize: 33, fontWeight: 800, color: '#0e1d40', letterSpacing: '-0.5px' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Garble', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0e1d40', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Five garbled words. One clued finale.', { fontSize: 32, fontWeight: 800, color: '#0e1d40', letterSpacing: '-0.5px' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Links', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0e1d40', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', margin: '16px 0 18px' } }),
      T('Sixteen words. Four hidden threads.', { fontSize: 32, fontWeight: 800, color: '#0e1d40', letterSpacing: '-0.5px' }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#ea580c)' } }),
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

// ---------------------------------------------------------------------------
// Circa share card — snapshot of the game. Demo hunt is NEUTRAL (the Eiffel
// Tower, which is not in the Circa bank), so it never spoils today. Evergreen.
function circaBoardEl() {
  const row = (n, yr, chip, chipStyle, key) =>
    h('div', { key, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '400px', background: '#fbf9f4', border: '2px solid rgba(28,30,36,0.22)', borderRadius: 12, padding: '12px 18px', marginBottom: 10 } }, [
      h('div', { key: 'n', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: '#6b7280', width: '26px' } }, String(n)),
      h('div', { key: 'y', style: { display: 'flex', fontSize: 32, fontWeight: 800, color: '#1c1e24', letterSpacing: '2px' } }, yr),
      h('div', { key: 'c', style: { display: 'flex', fontSize: 16, fontWeight: 800, borderRadius: 8, padding: '6px 12px', marginLeft: 'auto', ...chipStyle } }, chip),
    ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '22px 24px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 8 } }, 'WHAT YEAR WAS THIS?'),
    h('div', { key: 'ev', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#1c1e24', marginBottom: 16 } }, 'The Eiffel Tower is completed'),
    row(1, '1600', 'LATER · COLD', { color: '#475569', background: '#e2e8f0' }, 'r1'),
    row(2, '1850', 'LATER · WARM', { color: '#92610b', background: '#fef3c7' }, 'r2'),
    row(3, '1889', 'DEAD ON', { color: '#fff', background: '#15803d' }, 'r3'),
  ]);
}
function buildCircaCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#0e7490)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Circa', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0e7490', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0e7490', margin: '16px 0 18px' } }),
      T('Name the year.', { fontSize: 33, fontWeight: 800, color: '#0e7490', letterSpacing: '-0.5px' }),
      T('One historical moment a day. Six guesses to pin the exact year — every miss tells you earlier or later, hotter or colder. Within three years counts.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/CIRCA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, circaBoardEl()),
  ]);
}

export async function renderCircaCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCircaCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Extra share card — snapshot of the game. Demo page is NEUTRAL (the Eiffel
// Tower, which is not in the Extra bank), so it never spoils today. Evergreen.
function extraBoardEl() {
  const bar = (w, key) => h('div', { key, style: { display: 'flex', width: `${w}px`, height: '26px', background: '#1c1e24', borderRadius: 4, marginRight: 10, marginBottom: 8, marginTop: 6 } });
  const word = (t, key) => h('div', { key, style: { display: 'flex', fontSize: 30, fontWeight: 700, color: '#1c1e24', marginRight: 10, marginBottom: 4 } }, t);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#faf7ef', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 16px', width: '440px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 8 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'The Daily Truth'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#b91c1c', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'EXTRA'),
    ]),
    h('div', { key: 'dl', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px solid rgba(28,30,36,0.35)', paddingBottom: 8, marginBottom: 12, width: '100%' } }, [
      h('div', { key: 'b', style: { display: 'flex', width: '150px', height: '13px', background: 'rgba(28,30,36,0.7)', borderRadius: 3 } }),
      h('div', { key: 't', style: { display: 'flex', fontSize: 13, fontWeight: 600, color: '#6b7280', marginLeft: 10, fontStyle: 'italic' } }, 'dateline withheld'),
    ]),
    h('div', { key: 'hl', style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } }, [
      bar(96, 'b1'), word('UNVEILS ITS', 'w1'), bar(110, 'b2'), word('OF', 'w2'), bar(84, 'b3'),
      word("FOR THE WORLD'S FAIR", 'w3'),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 14 } }, 'NAME THE STORY · SIX TEARS'),
  ]);
}
function buildExtraCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#b91c1c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
      T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Extra', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#b91c1c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#b91c1c', margin: '16px 0 18px' } }),
      T('Name the story.', { fontSize: 33, fontWeight: 800, color: '#b91c1c', letterSpacing: '-0.5px' }),
      T('A historic front page with the giveaway words blacked out. Guess wrong and a word tears free — name it cold for a perfect score.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/EXTRA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, extraBoardEl()),
  ]);
}

export async function renderExtraCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildExtraCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Carve share card — snapshot of the game. Demo board is a neutral 5x5 example
// (not a banked Carve board — those are 6x6/7x7), so it never spoils today.
function carveBoardEl() {
  const CELL = 78, FS = 30;
  const demo = [
    [1,2,9,4,2],
    [6,9,2,9,5],
    [5,8,3,3,8],
    [7,3,8,5,1],
    [6,2,3,5,9],
  ];
  const zone = [
    [0,1,1,2,2],
    [0,3,1,1,2],
    [0,3,3,1,2],
    [0,3,4,2,2],
    [0,3,4,4,4],
  ];
  const SOFT = ['#ede4ff', '#dcefff', '#ffefd6', '#ddf5e5', '#ffe3e0'];
  const cellEl = (r, c) => {
    const v = demo[r][c];
    const rt = c < 4 && zone[r][c] !== zone[r][c + 1];
    const bt = r < 4 && zone[r][c] !== zone[r + 1][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: SOFT[zone[r][c]],
      borderTop: '1px solid rgba(28,30,36,0.2)',
      borderLeft: '1px solid rgba(28,30,36,0.2)',
      borderRight: rt ? '4px solid #1c1e24' : '1px solid rgba(28,30,36,0.2)',
      borderBottom: bt ? '4px solid #1c1e24' : '1px solid rgba(28,30,36,0.2)',
      fontSize: FS, fontWeight: 700, color: '#1c1e24',
    } }, String(v));
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 5 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'EVERY BLOCK ADDS TO THE SAME TARGET'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', border: '3px solid #1c1e24' } }, Array.from({ length: 5 }, (_, r) => rowEl(r))),
  ]);
}
function buildCarveCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#7c3aed)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Carve', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c3aed', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c3aed', margin: '16px 0 18px' } }),
      T('The daily equal-sum puzzle.', { fontSize: 33, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }),
      T('Carve the grid into connected blocks, one grown from each anchor, so every block adds to the same target. Exactly one valid carving — clean cuts win, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/CARVE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, carveBoardEl()),
  ]);
}

export async function renderCarveCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCarveCard(), { ...size, fonts });
}
// ---------------------------------------------------------------------------
// Emcee share card — snapshot of the game. Demo grid is a neutral 5x5 example
// (not a banked Emcee grid), mid-solve with the active word highlighted, so it
// never spoils today.
function emceeBoardEl() {
  const CELL = 78, FS = 34;
  const demo = [
    '#STAR',
    'WHILE',
    'EATEN',
    'SMART',
    'TENT#',
  ];
  const nums = { '0,1': 1, '0,2': 2, '0,3': 3, '0,4': 4, '1,0': 5, '2,0': 6, '3,0': 7, '4,0': 8 };
  const hide = { '4,2': 1, '4,3': 1 };          // the in-progress word's empty squares
  const active = { '4,0': 1, '4,1': 1, '4,2': 1, '4,3': 1 }; // 8-Across highlighted
  const cellEl = (r, c) => {
    const ch = demo[r][c];
    if (ch === '#') {
      return h('div', { key: `${r},${c}`, style: { display: 'flex', width: CELL, height: CELL, background: '#1c1e24', borderTop: '1px solid rgba(28,30,36,0.3)', borderLeft: '1px solid rgba(28,30,36,0.3)' } });
    }
    const key = `${r},${c}`;
    const sel = key === '4,2';
    const bg = sel ? '#f6d9f9' : (active[key] ? '#fbeefc' : '#fff');
    const kids = [];
    if (nums[key]) kids.push(h('div', { key: 'n', style: { display: 'flex', position: 'absolute', top: 3, left: 6, fontSize: 15, fontWeight: 700, color: 'rgba(28,30,36,0.55)' } }, String(nums[key])));
    if (!hide[key]) kids.push(h('div', { key: 'l', style: { display: 'flex', fontSize: FS, fontWeight: 800, color: '#1c1e24' } }, ch));
    return h('div', { key, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      width: CELL, height: CELL, background: bg,
      borderTop: '1px solid rgba(28,30,36,0.3)',
      borderLeft: '1px solid rgba(28,30,36,0.3)',
      boxShadow: sel ? 'inset 0 0 0 3px #c026d3' : 'none',
    } }, kids);
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 5 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'THE DAILY MINI CROSSWORD'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', border: '3px solid #1c1e24' } }, Array.from({ length: 5 }, (_, r) => rowEl(r))),
  ]);
}
function buildEmceeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#c026d3)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Emcee', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#c026d3', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#c026d3', margin: '16px 0 18px' } }),
      T('The daily mini crossword.', { fontSize: 33, fontWeight: 800, color: '#c026d3', letterSpacing: '-0.5px' }),
      T('Five by five, everyday words, fair clues — most grids fall in a minute or two. The grid checks itself when the last square lands, and a clean, fast solve tops the board. Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/EMCEE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, emceeBoardEl()),
  ]);
}

export async function renderEmceeCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildEmceeCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Stet share card — snapshot of the game. Demo sentence is NEUTRAL (a
// wrong-word pair not in the Stet bank), so it never spoils today. Evergreen.
function stetBoardEl() {
  const word = (t, style) => h('div', { style: { display: 'flex', fontSize: 27, fontWeight: 700, color: '#1c1e24', marginRight: 9, marginBottom: 6, ...style } }, t);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fbf9f4', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px', width: '460px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'The Copy Desk'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#0369a1', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'STET'),
    ]),
    h('div', { key: 's1', style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } }, [
      word('In', {}), word('the', {}), word('end,', {}), word('critics', {}), word('got', {}), word('their', {}), word('just', {}),
      h('div', { key: 'w', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 9, marginBottom: 6 } }, [
        h('div', { key: 'a', style: { display: 'flex', fontSize: 27, fontWeight: 800, color: '#c0392b', textDecoration: 'line-through' } }, 'desserts.'),
      ]),
      word('deserts.', { color: '#15803d', fontWeight: 800 }),
    ]),
    h('div', { key: 'note', style: { display: 'flex', fontSize: 16, fontWeight: 600, color: '#6b7280', marginTop: 6, fontStyle: 'italic' } }, 'One wrong word per sentence. Spellcheck is no help.'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 16 } }, 'TAP IT · FIX IT · FIVE SENTENCES'),
  ]);
}
function buildStetCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#0369a1)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Stet', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0369a1', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0369a1', margin: '16px 0 18px' } }),
      T('Fix the wrong word.', { fontSize: 33, fontWeight: 800, color: '#0369a1', letterSpacing: '-0.5px' }),
      T('Almost every sentence hides one wrong word — a real word, so spellcheck sails past it. Fix it, or stamp clean copy stet.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/STET', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, stetBoardEl()),
  ]);
}

export async function renderStetCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildStetCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Outwit share card — snapshot of the game. Demo distribution is NEUTRAL
// (invented bars, no real prompt), so it never spoils today. Evergreen.
function outwitBoardEl() {
  const BARS = [22, 38, 62, 88, 54, 30, 44, 16];
  const YOU = 3;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px', width: '440px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 16 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'You vs. the crowd'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#e8b43a', background: '#1f2937', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'OUTWIT'),
    ]),
    h('div', { key: 'bars', style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', width: '100%', height: '150px' } },
      BARS.map((v, i) => h('div', { key: 'b' + i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, marginRight: i === BARS.length - 1 ? 0 : 8 } }, [
        h('div', { key: 'bar', style: { display: 'flex', width: '38px', height: `${v}px`, background: i === YOU ? '#e8b43a' : '#c8cfd9', borderRadius: '6px 6px 0 0' } }),
      ]))
    ),
    h('div', { key: 'base', style: { display: 'flex', width: '100%', height: '3px', background: '#1c1e24', marginTop: 0 } }),
    h('div', { key: 'you', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#8a6d1a', marginTop: 10 } }, 'you — closer than 82% of the field'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 12 } }, 'FIVE DUELS · NO RIGHT ANSWERS'),
  ]);
}
function buildOutwitCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1f2937 55%,#e8b43a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Outwit', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#e8b43a', background: '#1f2937', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1f2937', margin: '16px 0 18px' } }),
      T('Beat everyone playing today.', { fontSize: 33, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px' }),
      T('Five game-theory duels against the whole field. No right answers — only what the crowd does. Then see where everyone actually went.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/OUTWIT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, outwitBoardEl()),
  ]);
}

export async function renderOutwitCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildOutwitCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Tuck share card — snapshot of the game. Demo grid is NEUTRAL (an invented
// little build, not a banked rack), so it never spoils today. Evergreen.
function tuckBoardEl() {
  // a tiny demo build: TUCK across, with UNIT and CORD hanging off it
  const G = 7;
  const cells = {};
  const put = (r, c, ch) => { cells[`${r},${c}`] = ch; };
  'TUCK'.split('').forEach((ch, i) => put(1, 1 + i, ch));
  'UNIT'.split('').forEach((ch, i) => put(1 + i, 2, ch));
  'CORD'.split('').forEach((ch, i) => put(1 + i, 4, ch));
  const rows = [];
  for (let r = 0; r < G - 1; r++) {
    const row = [];
    for (let c = 0; c < G; c++) {
      const ch = cells[`${r},${c}`];
      row.push(h('div', {
        key: `c${c}`,
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '52px', height: '52px', margin: '2px', borderRadius: 7,
          background: ch ? '#f7edda' : '#f1eee7',
          border: ch ? '2px solid rgba(146,64,14,0.5)' : '2px solid rgba(28,30,36,0.05)',
          fontSize: 27, fontWeight: 800, color: '#1c1e24',
        },
      }, ch || ''));
    }
    rows.push(h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } }, row));
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'Your grid, your score'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#92400e', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'TUCK'),
    ]),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, rows),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 14 } }, '14 LETTERS · BEAT THE PAR'),
  ]);
}
function buildTuckCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#92400e)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Tuck', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#92400e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#92400e', margin: '16px 0 18px' } }),
      T('Fourteen letters. Your grid.', { fontSize: 33, fontWeight: 800, color: '#92400e', letterSpacing: '-0.5px' }),
      T('Everyone gets the same rack. Build your own interlocking crossword — intersections score double — and beat the day’s par.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/TUCK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, tuckBoardEl()),
  ]);
}

export async function renderTuckCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildTuckCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Alibi share card — snapshot of the game. Demo board is NEUTRAL (invented
// names and marks, no banked case), so it never spoils today. Evergreen.
function alibiBoardEl() {
  const mark = (m) => h('div', {
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '48px', height: '44px', margin: '1px', borderRadius: 6,
      background: m === 2 ? '#f6e3e5' : '#fff',
      border: '1.5px solid rgba(28,30,36,0.16)',
      fontSize: 22, fontWeight: 800, color: m === 2 ? '#8b1e2d' : '#b9b2a6',
    },
  }, m === 2 ? '●' : m === 1 ? '✗' : '');
  const namesCol = ['Vera', 'Hugo', 'Opal', 'Silas'];
  const marks = [
    [1, 2, 1, 1],
    [2, 1, 1, 1],
    [1, 1, 1, 2],
    [1, 1, 2, 1],
  ];
  const rows = namesCol.map((nm, r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
    h('div', { key: 'n', style: { display: 'flex', width: '84px', justifyContent: 'flex-end', paddingRight: 10, fontSize: 18, fontWeight: 800, color: '#1c1e24' } }, nm),
    ...marks[r].map((m, c) => h('div', { key: `m${c}`, style: { display: 'flex' } }, mark(m))),
  ]));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, "Detective's board"),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#8b1e2d', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'ALIBI'),
    ]),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, rows),
    h('div', { key: 'note', style: { display: 'flex', fontSize: 16, fontWeight: 600, color: '#6b7280', marginTop: 10, fontStyle: 'italic' } }, 'Every statement is true. Exactly one solution.'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 12 } }, 'FOUR SUSPECTS · ONE ANSWER'),
  ]);
}
function buildAlibiCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#8b1e2d)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Alibi', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#8b1e2d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#8b1e2d', margin: '16px 0 18px' } }),
      T('A fresh mystery every day.', { fontSize: 33, fontWeight: 800, color: '#8b1e2d', letterSpacing: '-0.5px' }),
      T('Four suspects, four rooms, four alibis. Every witness statement is true — work the boards and close the case.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/ALIBI', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, alibiBoardEl()),
  ]);
}

export async function renderAlibiCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildAlibiCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Cipher share card — snapshot of the game. Demo equation is the 1924 classic
// SEND+MORE=MONEY (day one's puzzle is the classic on purpose; the card is
// evergreen brand art, not a spoiler of the rotating bank).
function cipherBoardEl() {
  const cell = (ch, dg) => h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '52px', height: '62px', margin: '2px', borderRadius: 8, background: '#fff', border: '1.5px solid rgba(28,30,36,0.16)' } }, [
    h('div', { key: 'c', style: { display: 'flex', fontSize: 26, fontWeight: 800, color: '#1c1e24', lineHeight: 1 } }, ch),
    h('div', { key: 'd', style: { display: 'flex', fontSize: 16, fontWeight: 800, color: '#0f766e', marginTop: 3 } }, dg),
  ]);
  const row = (word, digits, op, pad) => h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' } }, [
    h('div', { key: 'op', style: { display: 'flex', width: '30px', fontSize: 26, fontWeight: 800, color: '#6b7280', justifyContent: 'center' } }, op || ''),
    ...Array.from({ length: pad }, (_, i) => h('div', { key: `p${i}`, style: { display: 'flex', width: '56px' } })),
    ...word.split('').map((ch, i) => h('div', { key: `c${i}`, style: { display: 'flex' } }, cell(ch, digits[i]))),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f7f6', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'Letters are digits'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#0f766e', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'CIPHER'),
    ]),
    row('SEND', ['9', '5', '6', '7'], '', 1),
    row('MORE', ['1', '0', '8', '5'], '+', 1),
    h('div', { key: 'rule', style: { display: 'flex', width: '100%', height: '4px', background: '#1c1e24', margin: '6px 0' } }),
    row('MONEY', ['1', '0', '6', '5', '2'], '', 0),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 14 } }, 'ONE SOLUTION · NO GUESSING'),
  ]);
}
function buildCipherCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#0f766e)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Cipher', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f766e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0f766e', margin: '16px 0 18px' } }),
      T('Every letter hides a digit.', { fontSize: 33, fontWeight: 800, color: '#0f766e', letterSpacing: '-0.5px' }),
      T('One equation a day, machine-verified to a single solution. Pure column logic cracks it — no guessing required.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/CIPHER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, cipherBoardEl()),
  ]);
}

export async function renderCipherCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCipherCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Ping share card — snapshot of the game. Demo board is NEUTRAL: the guesses
// and the "found" city (Lisbon) are NOT in the Ping bank, so it never spoils a
// real day. Evergreen. Azure identity (#0284c7). Each row shows a guess city,
// the distance in miles, and a compass arrow pointing at the secret city.
function pingBoardEl() {
  const W = 420;
  const row = (city, mi, arrow, kind, key) => {
    const found = kind === 'found';
    const bg = found ? '#eefaf1' : kind === 'hot' ? '#ffedd5' : kind === 'warm' ? '#fef3c7' : '#dbeafe';
    const bd = found ? 'rgba(21,128,61,0.55)' : kind === 'hot' ? 'rgba(234,88,12,0.5)' : kind === 'warm' ? 'rgba(217,119,6,0.5)' : 'rgba(14,29,64,0.4)';
    const ink = found ? '#14532d' : '#1c1e24';
    return h('div', { key, style: { display: 'flex', alignItems: 'center', width: W, borderRadius: 10, padding: '13px 16px', marginBottom: 10, background: bg, border: `2px solid ${bd}` } }, [
      h('div', { key: 'c', style: { display: 'flex', flexGrow: 1, fontSize: 20, fontWeight: 800, color: ink } }, city),
      found
        ? h('div', { key: 'f', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#14532d' } }, 'found it')
        : h('div', { key: 'm', style: { display: 'flex', alignItems: 'center' } }, [
            h('div', { key: 'mi', style: { display: 'flex', fontSize: 18, fontWeight: 800, color: '#1c1e24', marginRight: 12 } }, mi),
            h('div', { key: 'ar', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#0284c7' } }, arrow),
          ]),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #1c1e24', borderRadius: 14, padding: '24px 26px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginBottom: 14 } }, 'NO CLUES · GUESS BY DISTANCE'),
    row('Chicago', '4,120 mi', '↗', 'cold', 'r0'),
    row('Reykjavik', '1,510 mi', '↘', 'cool', 'r1'),
    row('Madrid', '990 mi', '↗', 'warm', 'r2'),
    row('Porto', '175 mi', '↓', 'hot', 'r3'),
    row('Lisbon', '', '', 'found', 'r4'),
  ]);
}

function buildPingCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Ping', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0284c7', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0284c7', margin: '16px 0 18px' } }),
      T('Find the secret city.', { fontSize: 33, fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }),
      T('One city a day, no clues. Guess any city and get the miles and a compass arrow to the target. Home in and find it in as few guesses as you can.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/PING', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, pingBoardEl()),
  ]);
}

export async function renderPingCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildPingCard(), { ...size, fonts });
}


// ---------------------------------------------------------------------------
// Warmer share card — snapshot of the game. The demo guess ladder uses neutral
// words with invented ranks (never a banked answer), so it never spoils today.
function warmerHeatBar(frac, color) {
  return h('div', { style: { display: 'flex', width: '120px', height: '18px', background: '#e9ecf0', borderRadius: 9, overflow: 'hidden' } }, [
    h('div', { key: 'f', style: { display: 'flex', width: `${Math.round(frac * 120)}px`, height: '18px', background: color, borderRadius: 9 } }),
  ]);
}
function warmerBoardEl() {
  const rows = [
    ['signal', '#57', 0.78, '#ea580c'],
    ['harbor', '#210', 0.55, '#f59e0b'],
    ['meadow', '#900', 0.30, '#0ea5e9'],
    ['asphalt', '#4102', 0.10, '#3b5bdb'],
  ];
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f7f8fa', border: '2px solid #1c1e24', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #1c1e24', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#1c1e24', letterSpacing: '0.5px' } }, 'Your guesses'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#dc2626', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'WARMER'),
    ]),
    ...rows.map((r, i) => h('div', { key: `r${i}`, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '4px 0' } }, [
      h('div', { key: 'w', style: { display: 'flex', width: '108px', fontSize: 22, fontWeight: 800, color: '#1c1e24' } }, r[0]),
      warmerHeatBar(r[2], r[3]),
      h('div', { key: 'rk', style: { display: 'flex', width: '64px', justifyContent: 'flex-end', fontSize: 20, fontWeight: 700, color: '#6b7280' } }, r[1]),
    ])),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#6b7280', marginTop: 12 } }, 'CLOSE IN MEANING WINS'),
  ]);
}
function buildWarmerCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#dc2626)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Source of Truths', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#1c1e24' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Warmer', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#1c1e24', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#dc2626', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#dc2626', margin: '16px 0 18px' } }),
      T('Guess by meaning.', { fontSize: 33, fontWeight: 800, color: '#dc2626', letterSpacing: '-0.5px' }),
      T('One secret word a day. Every guess is scored hotter or colder by how close it is in meaning — steer from freezing to the word itself.', { fontSize: 24, fontWeight: 600, color: '#6b7280', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · SOURCEOFTRUTHS.COM/WARMER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#1c1e24', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, warmerBoardEl()),
  ]);
}

export async function renderWarmerCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildWarmerCard(), { ...size, fonts });
}
