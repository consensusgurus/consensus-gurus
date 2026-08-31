// DO NOT run the colour codemod over this file. It was tried on 2026-08-02 and broke the
// build two ways at once:
//   1. Every card function declares its OWN `const T = (txt, style) => ...` text helper (52 of
//      them), which shadows an `import { T } from '@/lib/theme'` at module scope, so T.ink
//      silently resolves to a property of the arrow function instead of a colour.
//   2. The icon is assembled as an SVG *string* inside a template literal, where an attribute
//      written as fill={T.white} is not JSX, just invalid markup baked into the data URI.
// If this file ever needs theme colours, import them under a different name (e.g. THEME) and
// leave the SVG strings alone.
import { ImageResponse } from 'next/og';
import React from 'react';
import { getAllSources } from '@/lib/sources';
import { SHARE_HOST, SITE_HOST } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const h = React.createElement;

// Icon (rounded blue square + target rings + gold star) with faint
// converging rings, emitted as an SVG data URI so Satori lays it out as one img.
function iconRingsDataURI() {
  const mark = '<g transform="translate(56,59) scale(1.74)">'
    + '<path d="M20 52l40-34 40 34" stroke="#0b0d12" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    + '<path d="M14 102h92" stroke="#0b0d12" stroke-width="6" stroke-linecap="round"/>'
    + '<g transform="translate(31,48) scale(0.53)"><path d="M14 42C12 28 22 16 36 16C40 8 54 6 60 14C70 8 84 14 86 26C96 30 98 44 88 50C92 58 86 66 76 64C74 72 64 74 60 66C48 70 36 66 32 56C20 56 12 50 14 42Z" fill="#2563eb"/></g>'
    + '</g>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">${mark}</svg>`;
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
  const lbl = h('div', { style: { display: 'flex', fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#233a63', textTransform: 'uppercase' } }, label);
  if (!faviconUri) return lbl;
  return h('div', { style: { display: 'flex', alignItems: 'center' } }, [
    h('img', { key: 'fav', src: faviconUri, width: 60, height: 60, style: { borderRadius: 14, marginRight: '18px', border: '1px solid #e2e5ea' } }),
    lbl,
  ]);
}

// Sized for the width X and other timelines actually render (roughly 500-680px
// wide, JPEG re-encoded), not for the 1200px source. Thin grey glyphs on a
// near-white field smear at that scale, so the payload text is large and either
// near-black, navy, or knocked out of a solid navy pill. Everything sits inside
// the central 2:1 band, since X crops 15px off the top and bottom of a
// summary_large_image.
function buildCard(count) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('img', { key: 'icon', src: iconRingsDataURI(), width: 330, height: 330, style: { marginTop: '-40px' } }),
    T('Mind Loft', { fontSize: 104, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', marginTop: '-66px' }),
    h('div', { key: 'div', style: { display: 'flex', width: '460px', height: '6px', borderRadius: '3px', background: '#2563eb', margin: '14px 0 22px' } }),
    T('ELEVATE YOUR THINKING', { fontSize: 42, fontWeight: 700, letterSpacing: '9px', color: '#233a63' }),
    T('DAILY PUZZLES AND QUIZZES TO SHARPEN YOUR BRAIN', { fontSize: 22, fontWeight: 700, letterSpacing: '2px', color: '#ffffff', background: '#233a63', borderRadius: '999px', padding: '15px 38px 15px 41px', marginTop: '30px' }),
    T('MINDLOFTDAILY.COM', { fontSize: 25, fontWeight: 800, letterSpacing: '4.5px', color: '#2563eb', marginTop: '22px' }),
  ]);
}

async function woff(w) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-${w}-normal.woff`);
    if (r.ok) return await r.arrayBuffer();
  } catch (e) { /* fall through */ }
  return null;
}

function buildListsCard(count) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('img', { key: 'icon', src: iconRingsDataURI(), width: 330, height: 330, style: { marginTop: '-40px' } }),
    T('Mind Loft', { fontSize: 104, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', marginTop: '-66px' }),
    h('div', { key: 'div', style: { display: 'flex', width: '460px', height: '6px', borderRadius: '3px', background: '#2563eb', margin: '14px 0 22px' } }),
    T('WHERE EXPERTS AND AGGREGATORS AGREE', { fontSize: 42, fontWeight: 700, letterSpacing: '9px', color: '#233a63' }),
    T('TOP 10 LISTS · EXPERT AND READER CONSENSUS', { fontSize: 26, fontWeight: 700, letterSpacing: '3px', color: '#ffffff', background: '#233a63', borderRadius: '999px', padding: '15px 38px 15px 41px', marginTop: '30px' }),
    T(SITE_HOST.toUpperCase(), { fontSize: 25, fontWeight: 800, letterSpacing: '4.5px', color: '#2563eb', marginTop: '22px' }),
  ]);
}

// The /lists brand card. Same layout as the Mind Loft one, but the lists surface keeps its
// own name and positioning: it is an archive that still carries the site's search history,
// so its share cards must not start advertising a different brand.
export async function renderListsBrandCard() {
  let count = 0;
  try { count = getAllSources().length; } catch (e) { count = 0; }
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  return new ImageResponse(buildListsCard(count), { ...size, fonts });
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


// Daily Puzzles hub share card (app/daily). Distinct from the default brand card:
// centered layout, a navy DAILY PUZZLES badge as the hero, and a games-focused
// tagline + play-daily banner, so a shared /daily link reads as the games hub
// rather than the generic consensus/lists brand card.
function buildDailyCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', fontFamily: 'Manrope', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('img', { key: 'icon', src: iconRingsDataURI(), width: 234, height: 234, style: { marginTop: '-8px' } }),
    T('Mind Loft', { fontSize: 58, fontWeight: 800, letterSpacing: '-1.8px', color: '#0b0d12', marginTop: '-28px' }),
    h('div', { key: 'badge', style: { display: 'flex', alignItems: 'center', background: '#233a63', borderRadius: 16, padding: '12px 30px', marginTop: 22 } }, [
      T('DAILY PUZZLES', { fontSize: 50, fontWeight: 800, letterSpacing: '4px', color: '#ffffff' }),
    ]),
    T('A new word, number, and logic puzzle every day.', { fontSize: 30, fontWeight: 600, color: '#646c7a', marginTop: 26 }),
    T('CRUX · GARBLE · LINKS · SPAN · SUDS · AND MORE', { fontSize: 20, fontWeight: 700, letterSpacing: '2px', color: '#233a63', marginTop: 24 }),
    T('PLAY FREE · MINDLOFTDAILY.COM/DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#9aa0ab', marginTop: 14 }),
  ]);
}

export async function renderDailyCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildDailyCard(), { ...size, fonts });
}


// Per-quiz share card in the SAME rebranded style (Manrope, near-white, blue/gold
// logo) as the homepage brand card, so quiz links no longer share the old
// cream/red Fraunces card. Shows the quiz title + blurb + a "· QUIZ" label.
function buildQuizCard({ title, blurb, category }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const blurbText = (blurb || '').length > 190 ? (blurb || '').slice(0, 187).trimEnd() + '…' : (blurb || '');
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 132, height: 132, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#233a63', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(title || 'Mind Loft Quiz', { fontSize: 58, fontWeight: 800, letterSpacing: '-1.5px', color: '#0b0d12', lineHeight: 1.05, maxWidth: '96%' }),
      blurbText ? T(blurbText, { fontSize: 27, fontWeight: 600, color: '#646c7a', lineHeight: 1.32, marginTop: '22px', maxWidth: '94%' }) : h('div', { key: 'nob', style: { display: 'flex' } }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T('A MIND LOFT QUIZ', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
      T('PLAY AT MINDLOFTDAILY.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#233a63' }),
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


// THE GAUNTLET'S SHARE CARD, and the only DARK card on the site.
//
// Every other card here is #f7f8fa, because every other surface it advertises
// is. The run is a dark stage with a ladder down the side of it, and a card
// that looked like the rest of the site would be advertising a page that does
// not exist. It is also, bluntly, the one that stops a thumb in a feed.
//
// IT IS THE STAGE, NOT A CARD ABOUT THE STAGE (owner, 2026-08-31: "it should
// be dark and match styling of our gameplay page"). The first dark card was
// dark and shared the ground, and that was all it shared: it drew the ladder
// sideways as a bar chart under a headline, a composition the run does not
// have anywhere. So it is now the GATE, redrawn at 1200x630 out of the gate's
// own parts, in the gate's own order:
//
//   the CAP      eyebrow over the circuit's name, then the three figures
//                (quizzes, asked, one life each) as mono numerals
//   the TICK     the run's progress hairline, in the ladder ramp
//   the GUTTER   the ladder, vertical, 150px, hairline down its right edge
//   the GATE     mono eyebrow, the two line headline whose second line is the
//                run's coral, the roster rows each with its 4px ramp strip,
//                and the sky call to action
//
// EVERY COLOUR AND SIZE BELOW IS LIFTED FROM RunClient's stylesheet rather
// than invented to look similar. If the stage's palette moves, move GA with
// it. The run's own note explains why the primary is sky rather than the brand
// blue: that screen is near black plus exactly one family of colour, and a
// mid-tone saturated fill reads as a button imported from another design.
//
// THERE IS NO LOGO MARK, deliberately. The old card drew iconRingsDataURI,
// whose strokes are #0b0d12: near-black ink for a near-white card, invisible
// on this one, so the brand rendered as a stray blue dot. The stage's own cap
// carries no logo either; the eyebrow and the footer URL carry the name.
//
// Geometry is computed in PIXELS rather than left to flex-grow: Satori's flex
// is good but not the browser's, and 180 children sharing a column by ratio is
// exactly where it drifts. Everything below is a literal width and height.
const GA = {
  ground: '#0b0f1a',   // T.ground, and body's background on the run
  capEye: '#9fc2ff',   // .rn-cid i
  eye: '#60a5fa',      // T.blue400, .rn-eye
  accent: '#ef8577',   // .rn-h1 u, the headline's second line
  body: '#9aa8c4',     // .rn-rrow i
  num: '#8ea6d6',      // .rn-rrow em, and the cap's figure labels
  mut: '#66748f',      // .rn-fine, .rn-lcap
  cta: '#7dd3fc',      // .rn-go
  ctaInk: '#08222e',
  line: 'rgba(255,255,255,.09)',  // .rn-roster border-top
  rule: 'rgba(255,255,255,.07)',  // .rn-rrow border-bottom
  edge: 'rgba(255,255,255,.08)',  // .rn-gutter border-right
  track: 'rgba(255,255,255,.07)', // .rn-tick
};

async function monoWoff() {
  try {
    const r = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/dm-mono@5.1.0/files/dm-mono-latin-500-normal.woff');
    if (r.ok) return await r.arrayBuffer();
  } catch (e) { /* fall through */ }
  return null;
}

export async function renderGauntletCard(opts = {}) {
  const [w8, w7, w6, mono] = await Promise.all([woff(800), woff(700), woff(600), monoWoff()]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : [];
  // The stage sets every eyebrow and every figure in DM Mono. If that fetch
  // fails the card must still render, so the family NAME is threaded through
  // the tree rather than written into it: nothing ever asks Satori for a font
  // it was not given.
  if (mono) fonts.push({ name: 'DM Mono', data: mono, weight: 500, style: 'normal' });
  return new ImageResponse(buildGauntletCard({ ...opts, mono: mono ? 'DM Mono' : 'Manrope' }), { ...size, fonts });
}

// THE LADDER, in the gutter, vertical, exactly where the run keeps it: one
// rung per question, blocks in run order, each block as tall as its share of
// the run, and each rung wider than the last because the questions get harder
// as the block goes on.
function gauntletGutterEl(banks, H, W) {
  const GAP = 8;           // BLOCK_GAP in GauntletLadder
  const total = banks.reduce((a, b) => a + (b.asked || 0), 0) || 1;
  const usable = H - GAP * Math.max(0, banks.length - 1);
  return h('div', { style: { display: 'flex', flexDirection: 'column', height: H + 'px' } },
    banks.map((b, bi) => {
      const n = b.asked || 0;
      const blockH = Math.max(2, Math.round((n / total) * usable));
      // THE RUNG IS THE PITCH, with no gap taken out of it, which is the same
      // call `.gl-col` makes and for the same reason: 180 questions in a 372px
      // gutter is a pitch near 2px, and a 1px rung beside a 1px hole reads as
      // a faint dotted line rather than a ladder. The tier ramp still shows,
      // because in this orientation the ramp is the rung's WIDTH.
      const rh = Math.max(1, Math.floor((blockH / Math.max(1, n)) * 100) / 100);
      const rungs = [];
      for (let i = 0; i < n; i += 1) {
        const t = n > 1 ? i / (n - 1) : 0;
        rungs.push(h('div', {
          key: 'r' + i,
          style: {
            display: 'flex',
            height: rh + 'px',
            // 40% to 100%, the ladder's own --t.
            width: Math.round(W * (0.4 + 0.6 * t)) + 'px',
            background: b.color,
          },
        }));
      }
      return h('div', {
        key: b.key || bi,
        style: {
          display: 'flex', flexDirection: 'column',
          marginBottom: bi === banks.length - 1 ? '0px' : GAP + 'px',
        },
      }, rungs);
    }));
}

function buildGauntletCard({ name, eyebrow, gateEyebrow, line1, line2, cta, banks = [], asked = 0, mono = 'Manrope' }) {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const n = banks.length;
  // The roster is the tallest thing on the card, so its row height is what
  // keeps a longer roster inside 630px. Seven is today's run; the other two
  // steps are here so a roster change cannot silently overflow the card.
  const pad = n >= 9 ? 4 : n >= 8 ? 6 : 7;
  const nameSize = n >= 9 ? 16 : n >= 8 ? 17 : 19;
  const total = banks.reduce((a, b) => a + (b.asked || 0), 0) || 1;

  const figure = (v, l) => h('div', { key: l, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '108px' } }, [
    T(v, { fontFamily: mono, fontSize: 26, fontWeight: 500, color: '#ffffff', lineHeight: 1 }),
    T(l, { fontSize: 10.5, fontWeight: 800, letterSpacing: '1.1px', color: GA.num, marginTop: '7px' }),
  ]);

  const row = (b, i) => h('div', {
    key: b.key || i,
    style: {
      display: 'flex', alignItems: 'center',
      padding: pad + 'px 0 ' + pad + 'px 14px',
      borderBottom: '1px solid ' + GA.rule,
      borderLeft: '4px solid ' + b.color,
    },
  }, [
    T(clampStr(b.name, 16), { fontSize: nameSize, fontWeight: 800, letterSpacing: '-0.35px', color: '#ffffff', width: '104px', flexShrink: 0 }),
    T(clampStr(b.sub || '', 26), { fontSize: 15, fontWeight: 600, color: GA.body, flexGrow: 1, marginLeft: '14px' }),
    T(String(b.asked || 0), { fontFamily: mono, fontSize: 14.5, fontWeight: 500, color: GA.num, width: '42px', flexShrink: 0, justifyContent: 'flex-end' }),
  ]);

  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: GA.ground, fontFamily: 'Manrope' } }, [
    // THE CAP, the run's own: who this is on the left, the three figures on
    // the right, and nothing between them.
    h('div', { key: 'cap', style: { display: 'flex', alignItems: 'center', padding: '28px 54px 22px' } }, [
      h('div', { key: 'cid', style: { display: 'flex', flexDirection: 'column', flexGrow: 1 } }, [
        T(eyebrow || 'MIND LOFT · TRIVIA', { fontFamily: mono, fontSize: 12, fontWeight: 500, letterSpacing: '1.9px', color: GA.capEye, marginBottom: '5px' }),
        T(clampStr(name || 'Trivia Gauntlet', 34), { fontSize: 23, fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }),
      ]),
      h('div', { key: 'cf', style: { display: 'flex', flexShrink: 0 } }, [
        figure(String(n), 'QUIZZES'),
        figure(String(asked || total), 'ASKED'),
        figure('1', 'LIFE EACH'),
      ]),
    ]),
    // THE TICK. On the run this is the progress hairline under the cap; here
    // it carries the whole roster at once, each bank as wide as its share of
    // the questions, which is the same fact the gutter draws vertically.
    h('div', { key: 'tick', style: { display: 'flex', width: '1200px', height: '4px', background: GA.track } },
      banks.map((b, i) => h('div', {
        key: b.key || i,
        style: { display: 'flex', width: Math.round(((b.asked || 0) / total) * 1200) + 'px', height: '4px', background: b.color },
      }))),
    // THE STAGE: the ladder's gutter, then the gate.
    h('div', { key: 'stage', style: { display: 'flex', flexGrow: 1, padding: '0 54px' } }, [
      h('div', { key: 'gut', style: { display: 'flex', flexDirection: 'column', width: '150px', flexShrink: 0, paddingTop: '26px', paddingRight: '18px', marginRight: '26px', borderRight: '1px solid ' + GA.edge } }, [
        T('RUN', { fontFamily: mono, fontSize: 10, fontWeight: 500, letterSpacing: '1.3px', color: GA.mut, marginBottom: '12px' }),
        gauntletGutterEl(banks, 372, 132),
      ]),
      h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: '24px' } }, [
        T(gateEyebrow || 'TRIVIA GAUNTLET · ONE LONG QUIZ', { fontFamily: mono, fontSize: 12, fontWeight: 500, letterSpacing: '1.9px', color: GA.eye, marginBottom: '9px' }),
        T(line1 || '', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.7px', lineHeight: 1.03, color: '#ffffff' }),
        T(line2 || 'One life each.', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.7px', lineHeight: 1.03, color: GA.accent }),
        h('div', { key: 'ros', style: { display: 'flex', flexDirection: 'column', marginTop: '20px', borderTop: '1px solid ' + GA.line } },
          banks.map(row)),
        h('div', { key: 'foot', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' } }, [
          T(cta || 'Take your run', { background: GA.cta, color: GA.ctaInk, borderRadius: '11px', padding: '14px 22px', fontSize: 16, fontWeight: 800 }),
          T('PLAY FREE · ' + SHARE_HOST.replace(/^https?:\/\//, '').toUpperCase() + '/TRIVIA', { fontSize: 15, fontWeight: 800, letterSpacing: '1.2px', color: GA.mut }),
        ]),
      ]),
    ]),
  ]);
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        T(`${clampStr(category || 'Top 10', 26)} · ${isUnranked ? 'THE SET' : 'TOP 10'}`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#233a63', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Mind Loft', 64), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#0b0d12', lineHeight: 1.05, maxWidth: '96%' }),
      T(isUnranked ? 'A handpicked set. Not ranked, just the ones worth owning.' : 'Counting down from ten. Top five revealed on site.', { fontSize: 24, fontWeight: 600, color: '#646c7a', marginTop: '14px' }),
      h('div', { key: 'items', style: { display: 'flex', flexDirection: 'column', marginTop: '24px' } },
        previewItems.map((name, idx) => h('div', { key: idx, style: { display: 'flex', alignItems: 'center', marginBottom: '6px' } }, [
          h('div', { key: 'r', style: { display: 'flex', fontSize: 34, fontWeight: 800, color: '#233a63', width: isUnranked ? 34 : 70, justifyContent: 'flex-end', marginRight: '24px', lineHeight: 1.1 } }, isUnranked ? '•' : String(startPosition - idx)),
          h('div', { key: 'n', style: { display: 'flex', fontSize: 28, fontWeight: 600, color: '#0b0d12', lineHeight: 1.1, maxWidth: 900 } }, clampStr(name, 52) || 'Untitled'),
        ]))
      ),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T(isUnranked ? `See the full set at ${SITE_HOST}` : `See 5 through 1 at ${SITE_HOST}`, { fontSize: 18, fontWeight: 600, color: '#9aa0ab' }),
      T(isUnranked ? 'BROWSE THE PICKS' : 'READ THE FULL RANKING', { fontSize: 18, fontWeight: 700, letterSpacing: '1px', color: '#233a63' }),
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
  const titleText = (title || 'Mind Loft Quiz').length > 96 ? (title || '').slice(0, 95).trimEnd() + '…' : (title || 'Mind Loft Quiz');
  const beat = (typeof pct === 'number' && pct > 0 && pct < 100) ? `Top ${100 - pct}% of players. Can you beat it?` : 'Can you beat it?';
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 40, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        headerRight(`${(category || 'Quiz')} · RESULT`, faviconUri),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' } }, [
      h('div', { key: 'sc', style: { display: 'flex', alignItems: 'baseline' } }, [
        T(String(score), { fontSize: 150, fontWeight: 800, letterSpacing: '-4px', color: '#0b0d12', lineHeight: 1 }),
        T(` / ${total}`, { fontSize: 64, fontWeight: 800, color: '#9aa0ab', marginLeft: '8px' }),
      ]),
      T(titleText, { fontSize: 40, fontWeight: 800, letterSpacing: '-1px', color: '#233a63', lineHeight: 1.08, marginTop: '14px', maxWidth: '94%' }),
      T(beat, { fontSize: 27, fontWeight: 600, color: '#646c7a', marginTop: '12px' }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T('A MIND LOFT QUIZ', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#9aa0ab' }),
      T('PLAY AT MINDLOFTDAILY.COM', { fontSize: 18, fontWeight: 700, letterSpacing: '2px', color: '#233a63' }),
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
  const path = `${SHARE_HOST}/quiz/${id || ''}`;
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '52px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 124, height: 124, style: { marginLeft: '-18px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        T(`${(category || 'Quiz')} · QUIZ`, { fontSize: 22, fontWeight: 700, letterSpacing: '3px', color: '#233a63', textTransform: 'uppercase' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '8px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column' } }, [
      T(clampStr(title || 'Mind Loft Quiz', 70), { fontSize: 56, fontWeight: 800, letterSpacing: '-1.5px', color: '#0b0d12', lineHeight: 1.04, maxWidth: '96%' }),
      blurbText ? T(blurbText, { fontSize: 26, fontWeight: 600, color: '#646c7a', lineHeight: 1.32, marginTop: '18px', maxWidth: '94%' }) : h('div', { key: 'nob', style: { display: 'flex' } }),
      T('Play the quiz. Elevate your thinking.', { fontSize: 24, fontWeight: 800, color: '#233a63', marginTop: '20px' }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '18px' } }, [
      T(path, { fontSize: 24, fontWeight: 800, color: '#0b0d12' }),
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
  const ttl = clampStr(title || 'Mind Loft Quiz', 44);
  const path = `${SHARE_HOST}/quiz/${id || ''}`;
  const chip = (c, i) => h('div', { key: 'c' + i, style: { display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 0, background: '#fff', border: '1px solid #e2e5ea', borderRadius: '12px', padding: '15px 18px' } }, [
    h('div', { key: 'l', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, borderRadius: '9px', background: '#e8effb', color: '#233a63', fontSize: '23px', fontWeight: 800, marginRight: '15px' } }, letters[i]),
    h('div', { key: 't', style: { display: 'flex', fontSize: '26px', fontWeight: 600, color: '#0b0d12', lineHeight: 1.08 } }, clampStr(c || '', 40)),
  ]);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '44px 64px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 102, height: 102, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 38, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        headerRight(`${(category || 'Quiz')} · QUIZ`, faviconUri),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '8px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),
    h('div', { key: 'body', style: { display: 'flex', flexDirection: 'column', flex: '1 1 0', justifyContent: 'center', paddingTop: '6px' } }, [
      h('div', { key: 'qh', style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '12px' } }, [
        T(`QUESTION ${qIndex || 1} OF ${total || ''}`.trim(), { fontSize: 19, fontWeight: 800, letterSpacing: '2.5px', color: '#9aa0ab' }),
        T(ttl, { fontSize: 25, fontWeight: 800, letterSpacing: '-0.5px', color: '#0b0d12' }),
      ]),
      T(qText, { fontSize: 41, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12', lineHeight: 1.1, marginBottom: '20px', maxWidth: '100%' }),
      h('div', { key: 'r1', style: { display: 'flex', gap: '16px', marginBottom: '12px' } }, [chip(choices[0], 0), chip(choices[1], 1)]),
      h('div', { key: 'r2', style: { display: 'flex', gap: '16px' } }, [chip(choices[2], 2), chip(choices[3], 3)]),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '15px' } }, [
      T(path, { fontSize: 22, fontWeight: 800, color: '#0b0d12' }),
      T('PLAY FREE, TOP THE LEADERBOARD', { fontSize: 19, fontWeight: 800, letterSpacing: '1px', color: '#233a63' }),
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
        cells.push(h('div', { key: c, style: { ...base, background: '#fff', color: '#0b0d12', fontSize: 34, fontWeight: 800, border: '1.5px solid rgba(20,22,28,0.16)' } }, cell.ch));
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Crux', { fontSize: 104, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#233a63', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('A clueless crossword.', { fontSize: 33, fontWeight: 800, color: '#233a63', letterSpacing: '-0.5px' }),
      T('Eight hidden words interlock, four categories to untangle, eighteen shared guesses.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      h('div', { key: 'legend', style: { display: 'flex', alignItems: 'center', marginTop: 24 } }, [pill('#e6b93f'), pill('#5aa96a'), pill('#5a97dd'), pill('#d96363')]),
      T('PLAY FREE · MINDLOFTDAILY.COM/CRUX', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
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
    return h('div', { key, style: { ...base, background: '#fff', color: '#0b0d12', border: '1.5px solid rgba(20,22,28,0.16)' } }, ch);
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Garble', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#233a63', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('Five garbled words. One clued finale.', { fontSize: 32, fontWeight: 800, color: '#233a63', letterSpacing: '-0.5px' }),
      T('Untangle each word — its gold letters feed the finale. Solve the finale any time; it ends the game.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/GARBLE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
    h('div', { key, style: { display: 'flex', width: W, height: H, alignItems: 'center', justifyContent: 'center', borderRadius: 9, fontSize: 17, fontWeight: 800, background: on ? '#0b0d12' : '#fff', color: on ? '#fff' : '#0b0d12', border: on ? '1.5px solid #0b0d12' : '1.5px solid rgba(20,22,28,0.3)' } }, txt);
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Links', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#233a63', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('Sixteen words. Four hidden threads.', { fontSize: 32, fontWeight: 800, color: '#233a63', letterSpacing: '-0.5px' }),
      T('Find the four groups of four before four mistakes find you. The words that look like they belong together usually don’t.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/LINKS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
    if (kind === 'start') return h('div', { key, style: { ...base, background: '#0b0d12', color: '#fff' } }, txt);
    if (kind === 'end') return h('div', { key, style: { ...base, background: '#fff', color: '#0b0d12', border: '2px dashed rgba(20,22,28,0.45)' } }, txt);
    return h('div', { key, style: { ...base, background: '#eefaf1', color: '#14532d', border: '1.5px solid rgba(21,128,61,0.45)' } }, txt);
  };
  const down = (key) => h('div', { key, style: { display: 'flex', color: '#9aa0ab', fontSize: 24, fontWeight: 800, margin: '-4px 0 8px 26px' } }, '↓');
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '26px 30px 16px' } }, [
    h('div', { key: 'par', style: { display: 'flex', fontSize: 16, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 16 } }, 'PORTUGAL → GREECE · PERFECT 8'),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '640px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Span', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15803d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('Cross the map, border by border.', { fontSize: 32, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }),
      T('Two countries a day. Chain land borders between them in the fewest moves — perfect is the shortest road on the map.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 600 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SPAN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
      h('div', { key: 't', style: { display: 'flex', flexGrow: 1, fontSize: 18, fontWeight: 800, color: locked ? '#14532d' : '#0b0d12' } }, txt),
      yr
        ? h('div', { key: 'y', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: locked ? '#14532d' : '#4c1d95', background: locked ? '#d8f2e0' : '#f5f0ff', borderRadius: 7, padding: '4px 10px' } }, yr)
        : h('div', { key: 'y', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#9aa0ab' } }, '↑↓'),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '24px 26px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EARLIEST TO LATEST · 3 CHECKS'),
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '580px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Dating', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c3aed', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('Put history in order.', { fontSize: 33, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }),
      T('Five moments a day, shuffled out of sequence. Arrange them oldest to newest — three checks, and every right placement locks in its year.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/DATING', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
    if (blocked.has(key)) return h('div', { key, style: { ...base, background: '#0b0d12' } });
    const v = demo[r][c];
    return h('div', { key, style: { ...base, background: '#fff', border: '2px solid rgba(28,30,36,0.42)', fontSize: 30, fontWeight: 800, color: '#0b0d12' } }, v ? String(v) : '');
  };
  const tgt = (val, key) => h('div', { key, style: { ...base, background: '#15803d', fontSize: 26, fontWeight: 800, color: '#fff' } }, String(val));
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row', marginBottom: GAP } }, [
    ...Array.from({ length: N }, (_, c) => cellEl(r, c)),
    tgt(rowT[r], 'rt'),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 22px 15px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY ROW & COLUMN HITS ITS TARGET'),
    ...Array.from({ length: N }, (_, r) => rowEl(r)),
    h('div', { key: 'ct', style: { display: 'flex', flexDirection: 'row' } }, colT.map((v, c) => tgt(v, `ct${c}`))),
  ]);
}
function buildTallyCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Tally', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15803d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', margin: '16px 0 18px' } }),
      T('Balance the books.', { fontSize: 33, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }),
      T('Fill the grid from your rack so every row and column adds up to its target. One solution — the fewest moves wins, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/TALLY', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
      fontSize: FS, fontWeight: 700, color: '#0b0d12',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY ROW, COLUMN & BOX HOLDS 1–9'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildSudsCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#ea580c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Suds', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#ea580c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#ea580c', margin: '16px 0 18px' } }),
      T('The daily sudoku.', { fontSize: 33, fontWeight: 800, color: '#ea580c', letterSpacing: '-0.5px' }),
      T('Fill the 9×9 grid so every row, column, and 3×3 box holds 1–9 exactly once. One logical solution — a clean solve wins, and Sundays go harder.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SUDS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
// Quilt share card — snapshot of the game. The demo board is a real generated
// Quilt board from a throwaway seed, checked against the shipped bank so it can
// never spoil a day. Evergreen.
function quiltBoardEl() {
  const CELL = 44, FS = 25;
  const TINT = ['#fdf2f8', '#eff6ff', '#f0fdf4', '#fefce8', '#faf5ff', '#ecfeff', '#fff7ed', '#f1f5f9', '#f7fee7'];
  const reg = [[1,1,1,1,1,0,0,2,2],[1,1,1,0,0,0,2,2,2],[1,3,0,0,0,2,2,2,2],[3,3,3,4,0,4,4,8,8],[6,3,4,4,4,4,4,8,5],[6,3,3,3,3,8,4,8,5],[6,7,7,7,8,8,8,8,5],[6,6,7,7,7,5,5,5,5],[6,6,6,6,7,7,7,5,5]];
  const demo = [[0,6,4,2,0,0,7,0,0],[0,0,8,0,4,2,0,0,7],[7,9,0,0,0,4,0,1,0],[1,0,0,6,0,0,0,2,3],[0,8,0,4,0,0,9,0,0],[0,2,0,3,0,0,0,0,9],[2,3,0,0,0,0,8,0,0],[0,0,0,0,2,0,0,8,0],[0,5,0,9,8,0,4,0,0]];
  const wall = 'rgba(28,30,36,0.85)', hair = 'rgba(28,30,36,0.22)';
  const cellEl = (r, c) => {
    const v = demo[r][c];
    const right = c === 8 ? hair : (reg[r][c + 1] !== reg[r][c] ? wall : hair);
    const bottom = r === 8 ? hair : (reg[r + 1][c] !== reg[r][c] ? wall : hair);
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: TINT[reg[r][c]],
      borderTop: `1px solid ${hair}`, borderLeft: `1px solid ${hair}`,
      borderRight: `${c === 8 || reg[r][c + 1] !== reg[r][c] ? 2 : 1}px solid ${right}`,
      borderBottom: `${r === 8 || reg[r + 1][c] !== reg[r][c] ? 2 : 1}px solid ${bottom}`,
      fontSize: FS, fontWeight: 700, color: '#0b0d12',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY ROW, COLUMN & REGION HOLDS 1–9'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildQuiltCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#a21caf)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Quilt', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#a21caf', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#a21caf', margin: '16px 0 18px' } }),
      T('Sudoku with no straight lines.', { fontSize: 33, fontWeight: 800, color: '#a21caf', letterSpacing: '-0.5px' }),
      T('The nine boxes have been redrawn into nine crooked regions. Every row, column and region still holds 1–9 exactly once, and there is always a line to the answer that never needs a guess.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/QUILT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, quiltBoardEl()),
  ]);
}

export async function renderQuiltCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildQuiltCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Cages share card — snapshot of the game. The demo board is a real generated
// killer board from a throwaway seed, checked against the shipped bank so it can
// never spoil a day. Evergreen.
//
// Each cage carries its own TINT, exactly as the game does, coloured so that no
// two touching cages share one. That is what makes the shapes readable, on the
// card as on the board: an outline alone cannot carry thirty of them. TINT_OF is
// precomputed for this one demo board rather than solved at request time, since
// the board never changes.
//
// The cage walls are drawn SOLID here rather than dashed as they are in the
// game. Satori renders this on the Edge at request time and solid is the one
// that is certain to come out.
function cagesBoardEl() {
  const CELL = 44, ACC = '#6b21a8';
  const TINTS = ['#ece5fa', '#dfeafc', '#d9f0ee', '#e4f5e2', '#fbeed3', '#fbe3ec', '#e6e9f0'];
  const TINT_OF = [3,0,0,2,0,1,1,2,0,3,0,2,0,2,1,2,1,4,0,0,3,2,0,1,2,3,3,4,3,1,1];
  const cage = [[9,9,18,26,8,8,6,11,11],[9,18,18,26,27,7,6,11,1],[24,23,23,26,27,7,4,11,1],[24,23,15,12,12,16,4,5,28],[19,19,15,12,12,16,3,5,28],[29,20,30,25,25,16,3,3,10],[29,20,30,17,25,2,0,0,10],[22,22,30,17,2,2,14,21,10],[22,22,13,13,13,14,14,21,21]];
  const sumAt = [[22,0,9,17,5,0,3,20,0],[0,0,0,0,8,15,0,0,16],[9,13,0,0,0,0,11,0,0],[0,0,13,18,0,16,0,8,7],[13,0,0,0,0,0,24,0,0],[6,11,17,13,0,0,0,0,12],[0,0,0,15,0,18,4,0,0],[15,0,0,0,0,0,13,18,0],[0,0,16,0,0,0,0,0,0]];
  const demo = [[7,0,0,0,0,0,0,0,0],[0,0,0,0,5,0,0,0,0],[0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,2,0],[0,0,0,0,8,0,0,0,0],[0,0,0,4,0,0,0,0,0],[0,0,0,0,0,0,3,0,0],[0,0,0,8,0,0,0,0,0],[0,0,0,0,4,0,0,0,0]];
  const hair = 'rgba(28,30,36,0.22)', rule = 'rgba(28,30,36,0.85)';
  const cellEl = (r, c) => {
    const k = cage[r][c], v = demo[r][c], sum = sumAt[r][c];
    const wallR = c === 8 || cage[r][c + 1] !== k;
    const wallB = r === 8 || cage[r + 1][c] !== k;
    const wallT = r === 0 || cage[r - 1][c] !== k;
    const wallL = c === 0 || cage[r][c - 1] !== k;
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      width: CELL, height: CELL, background: TINTS[TINT_OF[k] % TINTS.length],
      borderTop: `${wallT ? 2 : 1}px solid ${wallT ? ACC : hair}`,
      borderLeft: `${wallL ? 2 : 1}px solid ${wallL ? ACC : hair}`,
      borderRight: `${wallR ? 2 : (c % 3 === 2 ? 2 : 1)}px solid ${wallR ? ACC : (c % 3 === 2 ? rule : hair)}`,
      borderBottom: `${wallB ? 2 : (r % 3 === 2 ? 2 : 1)}px solid ${wallB ? ACC : (r % 3 === 2 ? rule : hair)}`,
      fontSize: 25, fontWeight: 700, color: '#0b0d12',
    } }, [
      sum ? h('div', { key: 's', style: { display: 'flex', position: 'absolute', top: 1, left: 3, fontSize: 12, fontWeight: 800, color: ACC } }, String(sum)) : null,
      v ? h('div', { key: 'v', style: { display: 'flex' } }, String(v)) : null,
    ].filter(Boolean));
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'NO CLUES. EVERY CAGE ADDS UP.'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildCagesCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#6b21a8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Cages', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#6b21a8', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#6b21a8', margin: '16px 0 18px' } }),
      T('The daily killer sudoku.', { fontSize: 33, fontWeight: 800, color: '#6b21a8', letterSpacing: '-0.5px' }),
      T('Not one digit is printed. The grid is cut into cages, each labelled with the total of the digits inside it, and that is the whole clue set. One logical solution, never a guess.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CAGES', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, cagesBoardEl()),
  ]);
}

export async function renderCagesCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCagesCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Sando share card — snapshot of the game. The demo board is a real generated
// sandwich board from a throwaway seed, checked against the shipped bank so it
// can never spoil a day. Evergreen.
//
// The card leads with the GUTTER, because the border sums are the whole reason
// the game exists: a reader who only sees the grid is looking at a sudoku.
function sandoBoardEl() {
  const CELL = 42, GUT = 30, ACC = '#15616b';
  const rowSums = [13,0,16,11,13,11,27,0,28];
  const colSums = [15,31,0,0,30,3,0,21,35];
  const demo = [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,8,0,0],[0,0,0,9,0,0,0,0,0],[0,0,3,0,0,5,0,0,0],[6,0,0,0,7,0,0,0,0],[0,7,0,3,0,0,2,6,0],[0,0,0,0,0,0,0,9,0],[0,0,4,0,0,1,0,0,2],[7,0,0,0,5,0,0,0,0]];
  const hair = 'rgba(28,30,36,0.22)', rule = 'rgba(28,30,36,0.85)';
  const sumCell = (txt, key, wide) => h('div', { key, style: {
    display: 'flex', alignItems: wide ? 'flex-end' : 'center', justifyContent: wide ? 'center' : 'flex-end',
    width: wide ? CELL : GUT, height: wide ? GUT : CELL,
    paddingRight: wide ? 0 : 5, paddingBottom: wide ? 4 : 0,
    fontSize: 17, fontWeight: 800, color: ACC,
  } }, txt);
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: '#fff',
      borderTop: `${r === 0 ? 2 : (r % 3 === 0 ? 2 : 1)}px solid ${r % 3 === 0 ? rule : hair}`,
      borderLeft: `${c === 0 ? 2 : (c % 3 === 0 ? 2 : 1)}px solid ${c % 3 === 0 ? rule : hair}`,
      borderRight: `${c === 8 ? 2 : 1}px solid ${c === 8 ? rule : hair}`,
      borderBottom: `${r === 8 ? 2 : 1}px solid ${r === 8 ? rule : hair}`,
      fontSize: 24, fontWeight: 700, color: '#0b0d12',
    } }, v ? String(v) : '');
  };
  const topRow = h('div', { key: 'top', style: { display: 'flex', flexDirection: 'row' } },
    [h('div', { key: 'corner', style: { display: 'flex', width: GUT, height: GUT } })]
      .concat(Array.from({ length: 9 }, (_, c) => sumCell(String(colSums[c]), `t${c}`, true))));
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    [sumCell(String(rowSums[r]), `l${r}`, false)]
      .concat(Array.from({ length: 9 }, (_, c) => cellEl(r, c))));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'THE TOTAL BETWEEN THE 1 AND THE 9'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } },
      [topRow].concat(Array.from({ length: 9 }, (_, r) => rowEl(r)))),
  ]);
}
function buildSandoCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#15616b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '540px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Sando', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15616b', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#15616b', margin: '16px 0 18px' } }),
      T('The daily sandwich sudoku.', { fontSize: 33, fontWeight: 800, color: '#15616b', letterSpacing: '-0.5px' }),
      T('Every row holds one 1 and one 9, and the number in the margin totals the digits between them. Side by side and the sandwich is empty, which is a 0. One logical solution, never a guess.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 520 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SANDO', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sandoBoardEl()),
  ]);
}

export async function renderSandoCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSandoCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Circa share card — snapshot of the game. Demo hunt is NEUTRAL (the Eiffel
// Tower, which is not in the Circa bank), so it never spoils today. Evergreen.
function circaBoardEl() {
  const row = (n, yr, chip, chipStyle, key) =>
    h('div', { key, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '400px', background: '#fbf9f4', border: '2px solid rgba(28,30,36,0.22)', borderRadius: 12, padding: '12px 18px', marginBottom: 10 } }, [
      h('div', { key: 'n', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: '#646c7a', width: '26px' } }, String(n)),
      h('div', { key: 'y', style: { display: 'flex', fontSize: 32, fontWeight: 800, color: '#0b0d12', letterSpacing: '2px' } }, yr),
      h('div', { key: 'c', style: { display: 'flex', fontSize: 16, fontWeight: 800, borderRadius: 8, padding: '6px 12px', marginLeft: 'auto', ...chipStyle } }, chip),
    ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 24px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 8 } }, 'WHAT YEAR WAS THIS?'),
    h('div', { key: 'ev', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#0b0d12', marginBottom: 16 } }, 'The Eiffel Tower is completed'),
    row(1, '1600', 'LATER · COLD', { color: '#475569', background: '#e2e8f0' }, 'r1'),
    row(2, '1850', 'LATER · WARM', { color: '#92610b', background: '#fef3c7' }, 'r2'),
    row(3, '1889', 'DEAD ON', { color: '#fff', background: '#15803d' }, 'r3'),
  ]);
}
function buildCircaCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#0e7490)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Circa', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0e7490', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0e7490', margin: '16px 0 18px' } }),
      T('Name the year.', { fontSize: 33, fontWeight: 800, color: '#0e7490', letterSpacing: '-0.5px' }),
      T('One historical moment a day. Six guesses to pin the exact year — every miss tells you earlier or later, hotter or colder. Within three years counts.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CIRCA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
  const bar = (w, key) => h('div', { key, style: { display: 'flex', width: `${w}px`, height: '26px', background: '#0b0d12', borderRadius: 4, marginRight: 10, marginBottom: 8, marginTop: 6 } });
  const word = (t, key) => h('div', { key, style: { display: 'flex', fontSize: 30, fontWeight: 700, color: '#0b0d12', marginRight: 10, marginBottom: 4 } }, t);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#faf7ef', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 16px', width: '440px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 8 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'The Daily Truth'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#b91c1c', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'EXTRA'),
    ]),
    h('div', { key: 'dl', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px solid rgba(28,30,36,0.35)', paddingBottom: 8, marginBottom: 12, width: '100%' } }, [
      h('div', { key: 'b', style: { display: 'flex', width: '150px', height: '13px', background: 'rgba(28,30,36,0.7)', borderRadius: 3 } }),
      h('div', { key: 't', style: { display: 'flex', fontSize: 13, fontWeight: 600, color: '#646c7a', marginLeft: 10, fontStyle: 'italic' } }, 'dateline withheld'),
    ]),
    h('div', { key: 'hl', style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } }, [
      bar(96, 'b1'), word('UNVEILS ITS', 'w1'), bar(110, 'b2'), word('OF', 'w2'), bar(84, 'b3'),
      word("FOR THE WORLD'S FAIR", 'w3'),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 14 } }, 'NAME THE STORY · SIX TEARS'),
  ]);
}
function buildExtraCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#b91c1c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
      T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Extra', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#b91c1c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#b91c1c', margin: '16px 0 18px' } }),
      T('Name the story.', { fontSize: 33, fontWeight: 800, color: '#b91c1c', letterSpacing: '-0.5px' }),
      T('A historic front page with the giveaway words blacked out. Guess wrong and a word tears free — name it cold for a perfect score.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/EXTRA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
      borderRight: rt ? '4px solid #0b0d12' : '1px solid rgba(28,30,36,0.2)',
      borderBottom: bt ? '4px solid #0b0d12' : '1px solid rgba(28,30,36,0.2)',
      fontSize: FS, fontWeight: 700, color: '#0b0d12',
    } }, String(v));
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 5 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY BLOCK ADDS TO THE SAME TARGET'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', border: '3px solid #0b0d12' } }, Array.from({ length: 5 }, (_, r) => rowEl(r))),
  ]);
}
function buildCarveCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#7c3aed)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Carve', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c3aed', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c3aed', margin: '16px 0 18px' } }),
      T('The daily equal-sum puzzle.', { fontSize: 33, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }),
      T('Carve the grid into connected blocks, one grown from each anchor, so every block adds to the same target. Exactly one valid carving — clean cuts win, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CARVE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
      return h('div', { key: `${r},${c}`, style: { display: 'flex', width: CELL, height: CELL, background: '#0b0d12', borderTop: '1px solid rgba(28,30,36,0.3)', borderLeft: '1px solid rgba(28,30,36,0.3)' } });
    }
    const key = `${r},${c}`;
    const sel = key === '4,2';
    const bg = sel ? '#f6d9f9' : (active[key] ? '#fbeefc' : '#fff');
    const kids = [];
    if (nums[key]) kids.push(h('div', { key: 'n', style: { display: 'flex', position: 'absolute', top: 3, left: 6, fontSize: 15, fontWeight: 700, color: 'rgba(28,30,36,0.55)' } }, String(nums[key])));
    if (!hide[key]) kids.push(h('div', { key: 'l', style: { display: 'flex', fontSize: FS, fontWeight: 800, color: '#0b0d12' } }, ch));
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
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'THE DAILY MINI CROSSWORD'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', border: '3px solid #0b0d12' } }, Array.from({ length: 5 }, (_, r) => rowEl(r))),
  ]);
}
function buildEmceeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#c026d3)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Emcee', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#c026d3', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#c026d3', margin: '16px 0 18px' } }),
      T('The daily mini crossword.', { fontSize: 33, fontWeight: 800, color: '#c026d3', letterSpacing: '-0.5px' }),
      T('Five by five, everyday words, fair clues — most grids fall in a minute or two. The grid checks itself when the last square lands, and a clean, fast solve tops the board. Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/EMCEE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
  const word = (t, style) => h('div', { style: { display: 'flex', fontSize: 27, fontWeight: 700, color: '#0b0d12', marginRight: 9, marginBottom: 6, ...style } }, t);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fbf9f4', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px', width: '460px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'The Copy Desk'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#0369a1', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'STET'),
    ]),
    h('div', { key: 's1', style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' } }, [
      word('In', {}), word('the', {}), word('end,', {}), word('critics', {}), word('got', {}), word('their', {}), word('just', {}),
      h('div', { key: 'w', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 9, marginBottom: 6 } }, [
        h('div', { key: 'a', style: { display: 'flex', fontSize: 27, fontWeight: 800, color: '#c0392b', textDecoration: 'line-through' } }, 'desserts.'),
      ]),
      word('deserts.', { color: '#15803d', fontWeight: 800 }),
    ]),
    h('div', { key: 'note', style: { display: 'flex', fontSize: 16, fontWeight: 600, color: '#646c7a', marginTop: 6, fontStyle: 'italic' } }, 'One wrong word per sentence. Spellcheck is no help.'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 16 } }, 'TAP IT · FIX IT · FIVE SENTENCES'),
  ]);
}
function buildStetCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#0369a1)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Stet', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0369a1', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0369a1', margin: '16px 0 18px' } }),
      T('Spot the error, fix the copy.', { fontSize: 33, fontWeight: 800, color: '#0369a1', letterSpacing: '-0.5px' }),
      T('Almost every sentence hides one wrong word or grammar slip — a real word, so spellcheck sails past it. Fix it, or stamp clean copy stet.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/STET', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px', width: '440px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 16 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'You vs. the crowd'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#e8b43a', background: '#1f2937', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'OUTWIT'),
    ]),
    h('div', { key: 'bars', style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', width: '100%', height: '150px' } },
      BARS.map((v, i) => h('div', { key: 'b' + i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, marginRight: i === BARS.length - 1 ? 0 : 8 } }, [
        h('div', { key: 'bar', style: { display: 'flex', width: '38px', height: `${v}px`, background: i === YOU ? '#e8b43a' : '#c8cfd9', borderRadius: '6px 6px 0 0' } }),
      ]))
    ),
    h('div', { key: 'base', style: { display: 'flex', width: '100%', height: '3px', background: '#0b0d12', marginTop: 0 } }),
    h('div', { key: 'you', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#8a6d1a', marginTop: 10 } }, 'you — closer than 82% of the field'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 12 } }, 'FIVE DUELS · NO RIGHT ANSWERS'),
  ]);
}
function buildOutwitCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#1f2937 55%,#e8b43a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Outwit', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#e8b43a', background: '#1f2937', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1f2937', margin: '16px 0 18px' } }),
      T('Beat everyone playing today.', { fontSize: 33, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px' }),
      T('Five game-theory duels against the whole field. No right answers — only what the crowd does. Then see where everyone actually went.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/OUTWIT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
// Outrank share card — snapshot of the game. Demo slate is NEUTRAL (seasons of
// the year, which is not in the Outrank bank), so it never spoils today.
function outrankBoardEl() {
  const rows = [
    ['1', 'Fall', 74, true],
    ['2', 'Summer', 58, false],
    ['3', 'Spring', 40, false],
    ['4', 'Winter', 22, false],
  ];
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 24px 16px', width: '430px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 6 } }, 'HOW DOES THE CROWD RANK...'),
    h('div', { key: 'th', style: { display: 'flex', fontSize: 24, fontWeight: 800, color: '#0b0d12', marginBottom: 16 } }, 'The seasons of the year'),
    ...rows.map(([nr, name, w, gold], i) =>
      h('div', { key: 'r' + i, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 10 } }, [
        h('div', { key: 'n', style: { display: 'flex', fontSize: 18, fontWeight: 800, color: gold ? '#8a6d1a' : '#646c7a', width: '28px' } }, nr),
        h('div', { key: 'l', style: { display: 'flex', fontSize: 20, fontWeight: 800, color: '#0b0d12', width: '120px' } }, name),
        h('div', { key: 'b', style: { display: 'flex', width: `${w * 2.2}px`, height: '20px', background: gold ? '#e8b43a' : '#8b8af5', borderRadius: 6 } }),
      ])),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 8 } }, 'VOTE · THEN CALL THE ORDER'),
  ]);
}
function buildOutrankCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#4338ca 55%,#e8b43a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
      T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Outrank', { fontSize: 88, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4338ca', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4338ca', margin: '16px 0 18px' } }),
      T('Call the crowd\u2019s order.', { fontSize: 33, fontWeight: 800, color: '#4338ca', letterSpacing: '-0.5px' }),
      T('One themed slate a day. Vote your favorite, then predict how everyone playing ranks the whole list \u2014 the crowd itself is the answer key.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE \u00b7 MINDLOFTDAILY.COM/OUTRANK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, outrankBoardEl()),
  ]);
}

export async function renderOutrankCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildOutrankCard(), { ...size, fonts });
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
          fontSize: 27, fontWeight: 800, color: '#0b0d12',
        },
      }, ch || ''));
    }
    rows.push(h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } }, row));
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Your grid, your score'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#92400e', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'TUCK'),
    ]),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, rows),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 14 } }, '14 LETTERS · BEAT THE BENCHMARK'),
  ]);
}
function buildTuckCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#92400e)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Tuck', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#92400e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#92400e', margin: '16px 0 18px' } }),
      T('Same letters. Highest score wins.', { fontSize: 33, fontWeight: 800, color: '#92400e', letterSpacing: '-0.5px' }),
      T('Everyone gets the same rack. Interlock your own grid — intersections score double — and beat the day’s benchmark.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/TUCK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
    h('div', { key: 'n', style: { display: 'flex', width: '84px', justifyContent: 'flex-end', paddingRight: 10, fontSize: 18, fontWeight: 800, color: '#0b0d12' } }, nm),
    ...marks[r].map((m, c) => h('div', { key: `m${c}`, style: { display: 'flex' } }, mark(m))),
  ]));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, "Detective's board"),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#8b1e2d', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'ALIBI'),
    ]),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, rows),
    h('div', { key: 'note', style: { display: 'flex', fontSize: 16, fontWeight: 600, color: '#646c7a', marginTop: 10, fontStyle: 'italic' } }, 'Every statement is true. Exactly one solution.'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 12 } }, 'FOUR SUSPECTS · ONE ANSWER'),
  ]);
}
function buildAlibiCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#8b1e2d)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Alibi', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#8b1e2d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#8b1e2d', margin: '16px 0 18px' } }),
      T('A fresh mystery every day.', { fontSize: 33, fontWeight: 800, color: '#8b1e2d', letterSpacing: '-0.5px' }),
      T('Four suspects, four rooms, four alibis. Every witness statement is true — work the boards and close the case.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/ALIBI', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
    h('div', { key: 'c', style: { display: 'flex', fontSize: 26, fontWeight: 800, color: '#0b0d12', lineHeight: 1 } }, ch),
    h('div', { key: 'd', style: { display: 'flex', fontSize: 16, fontWeight: 800, color: '#0f766e', marginTop: 3 } }, dg),
  ]);
  const row = (word, digits, op, pad) => h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' } }, [
    h('div', { key: 'op', style: { display: 'flex', width: '30px', fontSize: 26, fontWeight: 800, color: '#646c7a', justifyContent: 'center' } }, op || ''),
    ...Array.from({ length: pad }, (_, i) => h('div', { key: `p${i}`, style: { display: 'flex', width: '56px' } })),
    ...word.split('').map((ch, i) => h('div', { key: `c${i}`, style: { display: 'flex' } }, cell(ch, digits[i]))),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f7f6', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Letters are digits'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#0f766e', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'CIPHER'),
    ]),
    row('SEND', ['9', '5', '6', '7'], '', 1),
    row('MORE', ['1', '0', '8', '5'], '+', 1),
    h('div', { key: 'rule', style: { display: 'flex', width: '100%', height: '4px', background: '#0b0d12', margin: '6px 0' } }),
    row('MONEY', ['1', '0', '6', '5', '2'], '', 0),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 14 } }, 'ONE SOLUTION · NO GUESSING'),
  ]);
}
function buildCipherCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#0f766e)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Cipher', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f766e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0f766e', margin: '16px 0 18px' } }),
      T('Every letter hides a digit.', { fontSize: 33, fontWeight: 800, color: '#0f766e', letterSpacing: '-0.5px' }),
      T('One equation a day, machine-verified to a single solution. Pure column logic cracks it — no guessing required.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CIPHER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
// its distance in miles to the secret city (no direction).
function pingBoardEl() {
  const W = 420;
  const row = (city, mi, kind, key) => {
    const found = kind === 'found';
    const bg = found ? '#eefaf1' : kind === 'hot' ? '#ffedd5' : kind === 'warm' ? '#fef3c7' : '#dbeafe';
    const bd = found ? 'rgba(21,128,61,0.55)' : kind === 'hot' ? 'rgba(234,88,12,0.5)' : kind === 'warm' ? 'rgba(217,119,6,0.5)' : 'rgba(14,29,64,0.4)';
    const ink = found ? '#14532d' : '#0b0d12';
    return h('div', { key, style: { display: 'flex', alignItems: 'center', width: W, borderRadius: 10, padding: '13px 16px', marginBottom: 10, background: bg, border: `2px solid ${bd}` } }, [
      h('div', { key: 'c', style: { display: 'flex', flexGrow: 1, fontSize: 20, fontWeight: 800, color: ink } }, city),
      found
        ? h('div', { key: 'f', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#14532d' } }, 'found it')
        : h('div', { key: 'm', style: { display: 'flex', fontSize: 18, fontWeight: 800, color: '#0284c7' } }, mi),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '24px 26px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'NO CLUES · GUESS BY DISTANCE'),
    row('Chicago', '4,120 mi', 'cold', 'r0'),
    row('Reykjavik', '1,510 mi', 'cool', 'r1'),
    row('Madrid', '990 mi', 'warm', 'r2'),
    row('Porto', '175 mi', 'hot', 'r3'),
    row('Lisbon', '', 'found', 'r4'),
  ]);
}

function buildPingCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Ping', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0284c7', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0284c7', margin: '16px 0 18px' } }),
      T('Find the secret city.', { fontSize: 33, fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }),
      T('One city a day, no clues. Guess any city and get the exact miles to the target. Home in and find it in as few guesses as you can.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/PING', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f7f8fa', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Your guesses'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#dc2626', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'WARMER'),
    ]),
    ...rows.map((r, i) => h('div', { key: `r${i}`, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '4px 0' } }, [
      h('div', { key: 'w', style: { display: 'flex', width: '108px', fontSize: 22, fontWeight: 800, color: '#0b0d12' } }, r[0]),
      warmerHeatBar(r[2], r[3]),
      h('div', { key: 'rk', style: { display: 'flex', width: '64px', justifyContent: 'flex-end', fontSize: 20, fontWeight: 700, color: '#646c7a' } }, r[1]),
    ])),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 12 } }, 'CLOSE IN MEANING WINS'),
  ]);
}
function buildWarmerCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#dc2626)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Warmer', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#dc2626', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#dc2626', margin: '16px 0 18px' } }),
      T('Guess by meaning.', { fontSize: 33, fontWeight: 800, color: '#dc2626', letterSpacing: '-0.5px' }),
      T('One secret word a day. Every guess is scored hotter or colder by how close it is in meaning — steer from freezing to the word itself.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/WARMER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
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

// ---------------------------------------------------------------------------
// Jester share card — snapshot of the game. The demo board is a real 6x6
// court (verified unique) that is NOT in the bank (bank days are 8x8/9x9),
// so it never spoils today. Violet identity (#7c3aed).
const JESTER_DEMO_REGIONS = [[1,1,1,0,0,0],[1,1,1,1,0,0],[1,2,2,2,0,3],[1,1,4,2,5,3],[4,4,4,4,5,3],[4,4,4,4,5,5]];
const JESTER_DEMO_COLS = [3,0,2,5,1,4];
const JESTER_FILLS = ['#fde2e2', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#fce7f3'];
function jesterHatDataURI(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 15 5 6l4.2 4L12 3l2.8 7L19 6l2 9z" fill="${color}"/><circle cx="3.4" cy="14.6" r="1.6" fill="${color}"/><circle cx="5" cy="5.6" r="1.6" fill="${color}"/><circle cx="12" cy="2.9" r="1.6" fill="${color}"/><circle cx="19" cy="5.6" r="1.6" fill="${color}"/><circle cx="20.6" cy="14.6" r="1.6" fill="${color}"/><rect x="4" y="17" width="16" height="3.6" rx="1.4" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function jesterBoardEl() {
  const n = 6, cell = 56;
  const rows = JESTER_DEMO_REGIONS.map((row, r) =>
    h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
      row.map((id, c) => {
        const bTop = r > 0 && JESTER_DEMO_REGIONS[r - 1][c] !== id ? '2.5px solid #0b0d12' : r > 0 ? '1px solid rgba(28,30,36,0.2)' : '0px solid transparent';
        const bLeft = c > 0 && JESTER_DEMO_REGIONS[r][c - 1] !== id ? '2.5px solid #0b0d12' : c > 0 ? '1px solid rgba(28,30,36,0.2)' : '0px solid transparent';
        const star = JESTER_DEMO_COLS[r] === c;
        return h('div', { key: `c${c}`, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${cell}px`, height: `${cell}px`, background: JESTER_FILLS[id], borderTop: bTop, borderLeft: bLeft } },
          star ? [h('img', { key: 'j', src: jesterHatDataURI('#5b21b6'), width: 34, height: 34 })] : []);
      })
    )
  );
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 18px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'One per row, column & court'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#7c3aed', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'JESTERS'),
    ]),
    h('div', { key: 'bd', style: { display: 'flex', flexDirection: 'column', border: '3px solid #0b0d12', borderRadius: 8, overflow: 'hidden' } }, rows),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 12 } }, 'NO TOUCHING · ONE SOLUTION'),
  ]);
}
function buildJesterCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#7c3aed)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
      T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Jesters', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c3aed', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c3aed', margin: '16px 0 18px' } }),
      T('Seat the court.', { fontSize: 33, fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.5px' }),
      T('One jester per row, per column, per colored court, and two apiece Thursday through Sunday. No two may touch. Every board falls to pure deduction, no guessing.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/JESTERS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, jesterBoardEl()),
  ]);
}

export async function renderJesterCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildJesterCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Sworn share card — snapshot of the game. The demo docket is a NEUTRAL cast
// (names/statements not from the bank), internally consistent, so it never
// spoils a real day. Berry identity (#be185d).
function swornMarkDataURI(lying) {
  const color = lying ? '#b91c1c' : '#15803d';
  const path = lying
    ? '<path d="M6 6 18 18 M18 6 6 18" stroke="COLOR" stroke-width="3.4" stroke-linecap="round" fill="none"/>'
    : '<path d="M4.5 12.5 10 18 19.5 6.5" stroke="COLOR" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${path.replace(/COLOR/g, color)}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function swornBoardEl() {
  const W = 430;
  const row = (name, stmt, lying, key) => h('div', { key, style: { display: 'flex', alignItems: 'center', width: W, borderRadius: 10, padding: '11px 14px', marginBottom: 9, background: '#fff', border: '1.5px solid rgba(28,30,36,0.16)', borderLeft: '4px solid #be185d' } }, [
    h('div', { key: 'v', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: 7, marginRight: 12, background: lying ? '#fee2e2' : '#dcfce7', border: `1.5px solid ${lying ? '#b91c1c' : '#15803d'}` } }, [h('img', { key: 'm', src: swornMarkDataURI(lying), width: 18, height: 18 })]),
    h('div', { key: 'tx', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'n', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: '#9d174d', letterSpacing: '0.5px' } }, name.toUpperCase()),
      h('div', { key: 's', style: { display: 'flex', fontSize: 18, fontWeight: 700, color: '#0b0d12' } }, stmt),
    ]),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 12 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Exactly 2 are lying'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#be185d', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'SWORN'),
    ]),
    row('Nora', '“Piers is lying.”', false, 'r0'),
    row('Piers', '“I am not the thief.”', true, 'r1'),
    row('Ada', '“Nora is telling the truth.”', false, 'r2'),
    row('Judd', '“Ada is the thief.”', true, 'r3'),
    row('Wren', '“Judd is innocent.”', false, 'r4'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '4px 0 6px' } }, 'ONE STORY HOLDS · NAME THE THIEF'),
  ]);
}
function buildSwornCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#be185d)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Sworn', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#be185d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#be185d', margin: '16px 0 18px' } }),
      T('Somebody is lying.', { fontSize: 33, fontWeight: 800, color: '#be185d', letterSpacing: '-0.5px' }),
      T('Everyone testified. An exact number of them lied, and one is the thief. Follow the contradictions — only one story holds together.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SWORN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, swornBoardEl()),
  ]);
}

export async function renderSwornCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSwornCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Axiom share card — snapshot of the game. The demo board is NEUTRAL (words and
// verdicts invented for the card, not drawn from the bank), so it never spoils
// a real day. Laboratory teal identity (#0f766e).
function axiomTileEl(word, state, key) {
  const bg = state === 'yes' ? '#dcfce7' : state === 'no' ? '#fee2e2' : '#fff';
  const bd = state === 'yes' ? '#15803d' : state === 'no' ? '#b91c1c' : 'rgba(28,30,36,0.18)';
  const ink = state === 'yes' ? '#14532d' : state === 'no' ? '#7f1d1d' : '#0b0d12';
  return h('div', { key, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 128, height: 52, borderRadius: 9, margin: 5, background: bg, border: `2px solid ${bd}`, fontSize: 19, fontWeight: 800, letterSpacing: '0.5px', color: ink } }, word);
}
function axiomBoardEl() {
  const rows = [
    [['EFFORT', 'yes'], ['BANNED', 'no'], ['ACCESS', 'yes']],
    [['LUNCH', 'grey'], ['ACCENT', 'yes'], ['TRAIL', 'grey']],
    [['FALSE', 'no'], ['LOOP', 'grey'], ['BEGINS', 'grey']],
  ];
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 18px 12px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 10 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 21, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'One rule fits them all'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#0f766e', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'AXIOM'),
    ]),
    ...rows.map((r, ri) => h('div', { key: 'r' + ri, style: { display: 'flex', flexDirection: 'row' } }, r.map(([w, s], ci) => axiomTileEl(w, s, 'c' + ri + ci)))),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '8px 0 4px' } }, 'SIX TESTS · ONE TRUE RULE'),
  ]);
}
function buildAxiomCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#0f766e)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Axiom', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f766e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0f766e', margin: '16px 0 18px' } }),
      T('Find the hidden rule.', { fontSize: 33, fontWeight: 800, color: '#0f766e', letterSpacing: '-0.5px' }),
      T('Green tiles obey a rule you cannot see. Red ones break it. Five candidates, a handful of tests, and most tiles teach you nothing.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/AXIOM', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, axiomBoardEl()),
  ]);
}

export async function renderAxiomCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildAxiomCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Hearsay share card — snapshot of the game. The demo shortlist and dialogue are
// NEUTRAL (invented for the card, not from the bank), so it never spoils a real
// day. Parlour violet identity (#7c2d92).
function hearsayRowEl(label, chips, key) {
  return h('div', { key, style: { display: 'flex', alignItems: 'center', width: 430, borderRadius: 10, padding: '9px 12px', marginBottom: 8, background: '#fff', border: '1.5px solid rgba(28,30,36,0.16)', borderLeft: '4px solid #7c2d92' } }, [
    h('div', { key: 'l', style: { display: 'flex', width: 96, fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#5b1d6d' } }, label.toUpperCase()),
    h('div', { key: 'c', style: { display: 'flex', flexDirection: 'row' } }, chips.map((c, i) => h('div', { key: 'c' + i, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 7, padding: '0 11px', marginRight: 6, background: '#f7f8fa', border: '1.5px solid rgba(28,30,36,0.2)', fontSize: 16, fontWeight: 800, color: '#0b0d12' } }, c))),
  ]);
}
function hearsayBoardEl() {
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 22px 14px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 12 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 21, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'One of these is the one'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#7c2d92', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'HEARSAY'),
    ]),
    hearsayRowEl('Bergen', ['Mon', 'Thu'], 'r0'),
    hearsayRowEl('Cadiz', ['Tue', 'Thu', 'Sat'], 'r1'),
    hearsayRowEl('Split', ['Mon', 'Fri'], 'r2'),
    h('div', { key: 's1', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: '#0b0d12', marginTop: 4 } }, 'Marisol: “I don’t know which sailing it is.”'),
    h('div', { key: 's2', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: '#0b0d12', marginTop: 4 } }, 'Ivo: “Then neither do I.”'),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '10px 0 2px' } }, 'IGNORANCE IS EVIDENCE'),
  ]);
}
function buildHearsayCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#7c2d92)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Hearsay', { fontSize: 88, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c2d92', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c2d92', margin: '16px 0 18px' } }),
      T('Nobody knows. That’s the clue.', { fontSize: 31, fontWeight: 800, color: '#7c2d92', letterSpacing: '-0.5px' }),
      T('Each of them was told one detail and nothing else. Then they speak, and every admission of ignorance cuts the shortlist. One survives.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/HEARSAY', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, hearsayBoardEl()),
  ]);
}

export async function renderHearsayCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildHearsayCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Venn share card. The demo sheet is NEUTRAL (words and circles invented for
// the card), so it never spoils a real board. Ledger amber (#b45309).
function vennBoardEl() {
  const chip = (t, key) => h('div', { key, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 30, borderRadius: 7, padding: '0 10px', margin: 3, background: '#fff', border: '1.5px solid rgba(28,30,36,0.2)', fontSize: 15, fontWeight: 800, color: '#0b0d12' } }, t);
  const ring = (cx, cy, color) => h('div', { key: 'r' + cx + cy, style: { position: 'absolute', left: cx, top: cy, width: 180, height: 180, borderRadius: 90, border: `3px solid ${color}`, display: 'flex' } });
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 20px 14px', width: 420 } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 10 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 20, fontWeight: 800, color: '#0b0d12' } }, 'Seven regions, every one used'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#b45309', borderRadius: 5, padding: '3px 9px', marginLeft: 12 } }, 'VENN'),
    ]),
    h('div', { key: 'd', style: { position: 'relative', display: 'flex', width: 300, height: 250 } }, [
      ring(20, 10, '#2563eb'), ring(100, 10, '#be185d'), ring(60, 70, '#0f766e'),
      h('div', { key: 'c1', style: { position: 'absolute', left: 34, top: 78, display: 'flex', fontSize: 13, fontWeight: 800, color: '#646c7a' } }, '2'),
      h('div', { key: 'c2', style: { position: 'absolute', left: 250, top: 78, display: 'flex', fontSize: 13, fontWeight: 800, color: '#646c7a' } }, '2'),
      h('div', { key: 'c3', style: { position: 'absolute', left: 140, top: 60, display: 'flex', fontSize: 13, fontWeight: 800, color: '#646c7a' } }, '1'),
      h('div', { key: 'c4', style: { position: 'absolute', left: 140, top: 128, display: 'flex', fontSize: 15, fontWeight: 800, color: '#b45309' } }, '1'),
      h('div', { key: 'c5', style: { position: 'absolute', left: 140, top: 210, display: 'flex', fontSize: 13, fontWeight: 800, color: '#646c7a' } }, '3'),
    ]),
    h('div', { key: 'tray', style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 } }, [chip('KETTLE','k1'), chip('ORANGE','k2'), chip('BALLOON','k3')]),
  ]);
}
function buildVennCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 56px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#b45309)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Venn', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#b45309', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#b45309', margin: '16px 0 18px' } }),
      T('The counts are the proof.', { fontSize: 33, fontWeight: 800, color: '#b45309', letterSpacing: '-0.5px' }),
      T('Three circles, twelve words, seven regions. Each region says how many words belong in it, so a misfiling is a number that refuses to add up.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/VENN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, vennBoardEl()),
  ]);
}
export async function renderVennCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildVennCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Stands share card. The demo league is NEUTRAL (invented clubs and results),
// so it never spoils a real season. Ledger blue (#1d4ed8).
function standsBoardEl() {
  const cell = (v, key) => {
    const bg = v === 'W' ? '#dcfce7' : v === 'D' ? '#fef3c7' : v === 'L' ? '#fee2e2' : '#f4f2f5';
    const bd = v === 'W' ? '#15803d' : v === 'D' ? '#b45309' : v === 'L' ? '#b91c1c' : 'rgba(28,30,36,0.14)';
    const ink = v === 'W' ? '#14532d' : v === 'D' ? '#78350f' : v === 'L' ? '#7f1d1d' : '#646c7a';
    return h('div', { key, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 38, margin: 3, borderRadius: 8, background: bg, border: `2px solid ${bd}`, fontSize: 17, fontWeight: 800, color: ink } }, v === '.' ? '' : v);
  };
  const rows = [['.','W','D','W'], ['L','.','W','.'], ['D','L','.','W'], ['L','.','L','.']];
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 20px 12px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 10 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 20, fontWeight: 800, color: '#0b0d12' } }, 'One table fits the facts'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#1d4ed8', borderRadius: 5, padding: '3px 9px', marginLeft: 12 } }, 'STANDS'),
    ]),
    ...rows.map((r, ri) => h('div', { key: 'r' + ri, style: { display: 'flex', flexDirection: 'row' } }, r.map((v, ci) => cell(v, 'c' + ri + ci)))),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '8px 0 4px' } }, 'WIN 3 · DRAW 1 · REBUILD IT ALL'),
  ]);
}
function buildStandsCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#1d4ed8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Stands', { fontSize: 88, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#1d4ed8', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1d4ed8', margin: '16px 0 18px' } }),
      T('The results sheet is gone.', { fontSize: 32, fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }),
      T('Everyone played everyone once. A points total here, an unbeaten run there, and exactly one set of results that fits every surviving fact.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/STANDS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, standsBoardEl()),
  ]);
}
export async function renderStandsCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildStandsCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Bracket share card. The demo draw is NEUTRAL (invented matchups), so it never
// spoils a real day. Draw orange (#c2410c).
function bracketSlotEl(t, state, key) {
  const bg = state === 'win' ? '#ffedd5' : '#fff';
  const bd = state === 'win' ? '#c2410c' : 'rgba(28,30,36,0.16)';
  const ink = state === 'win' ? '#9a3412' : '#0b0d12';
  return h('div', { key, style: { display: 'flex', alignItems: 'center', width: 170, height: 34, borderRadius: 8, padding: '0 10px', margin: '3px 0', background: bg, border: `2px solid ${bd}`, fontSize: 15, fontWeight: 800, color: ink } }, t);
}
function bracketBoardEl() {
  const col = (rows, key, style) => h('div', { key, style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', ...style } }, rows);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 20px 14px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 10 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 19, fontWeight: 800, color: '#0b0d12' } }, 'Which came first?'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#c2410c', borderRadius: 5, padding: '3px 9px', marginLeft: 12 } }, 'BRACKET'),
    ]),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
      col([bracketSlotEl('The zipper', 'win', 'a1'), bracketSlotEl('The tea bag', '', 'a2'),
           bracketSlotEl('The fax machine', 'win', 'a3'), bracketSlotEl('Canned beer', '', 'a4')], 'c1', {}),
      h('div', { key: 'gap', style: { display: 'flex', width: 22 } }),
      col([bracketSlotEl('The zipper', '', 'b1'), bracketSlotEl('The fax machine', 'win', 'b2')], 'c2', { height: 150 }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '10px 0 2px' } }, 'ONE BAD PICK BUSTS THE LOT'),
  ]);
}
function buildBracketCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 56px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#c2410c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '540px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Bracket', { fontSize: 88, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#c2410c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#c2410c', margin: '16px 0 18px' } }),
      T('Name every winner.', { fontSize: 33, fontWeight: 800, color: '#c2410c', letterSpacing: '-0.5px' }),
      T('Sixteen real things, one question, fifteen picks, and no feedback until the end. Your winners carry forward, so one bad call in round one takes the whole sheet with it.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 520 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/BRACKET', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, bracketBoardEl()),
  ]);
}
export async function renderBracketCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildBracketCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Pricer share card. Bracket's card with money in it. The copy is DIRECTION-NEUTRAL
// on purpose: 13 of 30 boards ask which costs LESS, so a card promising "higher price
// wins" is wrong on nearly half of them, launch day included.
// The demo draw is NEUTRAL
// (invented matchups) AND the prices are withheld behind "$?", which is also
// exactly how the game plays: you call every matchup before a single price is
// revealed. So the card can never spoil a real board. Money green (#15803d).
function pricerSlotEl(t, state, key) {
  const bg = state === 'win' ? '#dcfce7' : '#fff';
  const bd = state === 'win' ? '#15803d' : 'rgba(28,30,36,0.16)';
  const ink = state === 'win' ? '#14532d' : '#0b0d12';
  return h('div', { key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 190, height: 34, borderRadius: 8, padding: '0 10px', margin: '3px 0', background: bg, border: `2px solid ${bd}`, fontSize: 15, fontWeight: 800, color: ink } }, [
    h('div', { key: 'n', style: { display: 'flex' } }, t),
    h('div', { key: 'p', style: { display: 'flex', fontSize: 13, fontWeight: 800, color: state === 'win' ? '#15803d' : '#9aa5b4' } }, '$?'),
  ]);
}
function pricerBoardEl() {
  const col = (rows, key, style) => h('div', { key, style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', ...style } }, rows);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f4f2f5', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 20px 14px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 10 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 19, fontWeight: 800, color: '#0b0d12' } }, 'More? Or less?'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#15803d', borderRadius: 5, padding: '3px 9px', marginLeft: 12 } }, 'PRICER'),
    ]),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
      col([pricerSlotEl('A ski pass', 'win', 'a1'), pricerSlotEl('A bar tab', '', 'a2'),
           pricerSlotEl('A gym year', 'win', 'a3'), pricerSlotEl('A haircut', '', 'a4')], 'c1', {}),
      h('div', { key: 'gap', style: { display: 'flex', width: 22 } }),
      col([pricerSlotEl('A ski pass', '', 'b1'), pricerSlotEl('A gym year', 'win', 'b2')], 'c2', { height: 150 }),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', margin: '10px 0 2px' } }, 'NO PRICES UNTIL YOU HAND IT IN'),
  ]);
}
function buildPricerCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 56px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#15803d)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '520px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Pricer', { fontSize: 88, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#15803d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#15803d', margin: '16px 0 18px' } }),
      T('The question flips daily.', { fontSize: 33, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }),
      T('Sixteen real things from one category, one money question, fifteen picks, and not a single price until the end. Your winners carry forward, so one bad call in round one takes the whole sheet with it.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 510 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/PRICER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, pricerBoardEl()),
  ]);
}
export async function renderPricerCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildPricerCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Lode share card — snapshot of the game. Demo cluster is NEUTRAL (an invented
// set of letters, not a banked board), so it never spoils today. Evergreen.
function lodeBoardEl() {
  const rows = [['A', 'G', 'R'], ['N'], ['I', 'T', 'Y']];
  const cell = (ch, core) => h('div', {
    key: ch,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '62px', height: '62px', margin: '5px', borderRadius: 10,
      background: core ? '#a16207' : '#fff',
      border: core ? '2px solid #7a4a05' : '2px solid rgba(28,30,36,0.14)',
      fontSize: 31, fontWeight: 800, color: core ? '#fff' : '#0b0d12',
    },
  }, ch);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fef7e0', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 26px 16px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 16 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Every word uses the core'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#a16207', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'LODE'),
    ]),
    ...rows.map((row, i) => h('div', { key: `r${i}`, style: { display: 'flex', flexDirection: 'row' } }, row.map((ch) => cell(ch, i === 1)))),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#a16207', marginTop: 14 } }, 'GRAINY · RARE · +15'),
  ]);
}
function buildLodeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#a16207)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Lode', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#a16207', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#a16207', margin: '16px 0 18px' } }),
      T('Seven letters. Rare words pay.', { fontSize: 33, fontWeight: 800, color: '#a16207', letterSpacing: '-0.5px' }),
      T('Points come from how rare a word is, not how long. Strike the vein, then dig for the Mother Lode.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/LODE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, lodeBoardEl()),
  ]);
}

export async function renderLodeCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildLodeCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Etch share card — snapshot of the game. The demo picture is a plain star,
// which is NOT one of the banked subjects, so the card never spoils today.
// Evergreen.
function etchBoardEl() {
  const CELL = 40, CLUE = 26;
  const art = ['...##...','...##...','..####..','########','.######.','..####..','.##..##.','.#....#.'];
  const rows = [[2],[2],[4],[8],[6],[4],[2,2],[1,1]];
  const cols = [[1],[2,2],[5],[6],[6],[5],[2,2],[1]];
  const clueCell = (txt, key) => h('div', { key, style: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: CLUE, height: CLUE, fontSize: 17, fontWeight: 600, color: '#646c7a',
  } }, txt);
  // two rows of column clues, right-aligned within each column
  const topRow = (k) => h('div', { key: `t${k}`, style: { display: 'flex', flexDirection: 'row' } }, [
    h('div', { key: 'pad', style: { display: 'flex', width: CLUE * 2, height: CLUE } }),
    ...cols.map((list, c) => {
      const off = 2 - list.length;
      const v = k >= off ? list[k - off] : '';
      return h('div', { key: `tc${c}`, style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: CELL, height: CLUE, fontSize: 17, fontWeight: 600, color: '#646c7a' } }, v === '' ? '' : String(v));
    }),
  ]);
  const rowEl = (r) => {
    const list = rows[r];
    const off = 2 - list.length;
    return h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } }, [
      ...[0, 1].map((k) => clueCell(k >= off ? String(list[k - off]) : '', `rc${r}-${k}`)),
      ...Array.from({ length: 8 }, (_, c) => h('div', { key: `${r},${c}`, style: {
        display: 'flex', width: CELL, height: CELL,
        background: art[r][c] === '#' ? '#0b0d12' : '#fff',
        border: '1px solid rgba(28,30,36,0.22)',
      } })),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'THE CLUES ARE THE RUN LENGTHS'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, [
      topRow(0), topRow(1),
      ...Array.from({ length: 8 }, (_, r) => rowEl(r)),
    ]),
  ]);
}
function buildEtchCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#4d7c0f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Etch', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4d7c0f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4d7c0f', margin: '16px 0 18px' } }),
      T('A picture, hidden in the numbers.', { fontSize: 33, fontWeight: 800, color: '#4d7c0f', letterSpacing: '-0.5px' }),
      T('The daily nonogram. Fill every square the row and column clues force and the picture appears. One solution, pure logic, no guessing, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/ETCH', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, etchBoardEl()),
  ]);
}

export async function renderEtchCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildEtchCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Hedge share card — snapshot of the game. The demo loop is a 6x6 board, a size
// that is NOT in the bank (weekdays are 7x7, Sundays 10x10), so it never spoils
// today. Evergreen.
function hedgeBoardEl() {
  const CELL = 46, PAD = 20, N = 6;
  const clues = [[1,1,null,null,null,null],[2,null,2,1,3,2],[2,null,1,null,null,null],[null,null,null,2,1,null],[null,null,null,1,null,null],[3,null,1,null,null,2]];
  const HS = [[0,4],[0,5],[1,0],[1,1],[1,2],[1,4],[2,4],[3,0],[3,3],[4,2],[4,3],[4,4],[5,0],[5,4],[6,0],[6,1],[6,4],[6,5]];
  const VS = [[0,4],[0,6],[1,0],[1,3],[1,5],[1,6],[2,0],[2,3],[2,4],[2,6],[3,1],[3,6],[4,1],[4,2],[4,5],[4,6],[5,0],[5,2],[5,4],[5,6]];
  const X = (j) => PAD + j * CELL, Y = (i) => PAD + i * CELL;
  const box = N * CELL + PAD * 2;
  const kids = [];
  clues.forEach((row, i) => row.forEach((c, j) => {
    if (c === null) return;
    kids.push(h('div', { key: `c${i}-${j}`, style: {
      position: 'absolute', left: X(j), top: Y(i), width: CELL, height: CELL,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 19, fontWeight: 600, color: '#0b0d12',
    } }, String(c)));
  }));
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    kids.push(h('div', { key: `d${i}-${j}`, style: {
      position: 'absolute', left: X(j) - 2.5, top: Y(i) - 2.5, width: 5, height: 5,
      borderRadius: 3, background: '#9aa2b4', display: 'flex',
    } }));
  }
  HS.forEach(([i, j], k) => kids.push(h('div', { key: `h${k}`, style: {
    position: 'absolute', left: X(j) - 2, top: Y(i) - 2.5, width: CELL + 4, height: 5,
    borderRadius: 3, background: '#0891b2', display: 'flex',
  } })));
  VS.forEach(([i, j], k) => kids.push(h('div', { key: `v${k}`, style: {
    position: 'absolute', left: X(j) - 2.5, top: Y(i) - 2, width: 5, height: CELL + 4,
    borderRadius: 3, background: '#0891b2', display: 'flex',
  } })));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'ONE CLOSED LOOP, EVERY NUMBER MET'),
    h('div', { key: 'bd', style: { display: 'flex', position: 'relative', width: box, height: box } }, kids),
  ]);
}
function buildHedgeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#0891b2)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Hedge', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0891b2', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0891b2', margin: '16px 0 18px' } }),
      T('One loop. No branches.', { fontSize: 33, fontWeight: 800, color: '#0891b2', letterSpacing: '-0.5px' }),
      T('The daily loop puzzle. Every number says how many of that cell’s four sides the loop uses. One solution, a clean solve wins, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/HEDGE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, hedgeBoardEl()),
  ]);
}

export async function renderHedgeCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildHedgeCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Listed share card — snapshot of the game. Demo board is NEUTRAL (no banked
// puzzle ranks moons). Evergreen, spoiler-free.
function listedBoardEl() {
  const W = 410;
  const row = (txt, val, kind, key) => {
    const locked = kind === 'locked';
    const near = kind === 'near';
    return h('div', { key, style: { display: 'flex', alignItems: 'center', width: W, borderRadius: 10, padding: '13px 16px', marginBottom: 10, background: locked ? '#eefaf1' : near ? '#fdf6e3' : '#fff', border: locked ? '2px solid rgba(21,128,61,0.5)' : near ? '2px solid #b7791f' : '2px solid rgba(20,22,28,0.3)' } }, [
      h('div', { key: 't', style: { display: 'flex', flexGrow: 1, fontSize: 18, fontWeight: 800, color: locked ? '#14532d' : '#0b0d12' } }, txt),
      val
        ? h('div', { key: 'v', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: '#14532d', background: '#d8f2e0', borderRadius: 7, padding: '4px 10px' } }, val)
        : near
          ? h('div', { key: 'v', style: { display: 'flex', fontSize: 13, fontWeight: 800, color: '#7c5410', background: '#fbeec4', borderRadius: 7, padding: '4px 10px' } }, 'OFF BY ONE')
          : h('div', { key: 'v', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#9aa0ab' } }, '↑↓'),
    ]);
  };
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '24px 26px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'BIGGEST MOONS · 5 SUBMITS'),
    row('Ganymede', '5,268 km', 'locked', 'r0'),
    row('Titan', null, 'near', 'r1'),
    row('Io', null, 'open', 'r2'),
    row('Callisto', null, 'open', 'r3'),
    row('The Moon', null, 'open', 'r4'),
  ]);
}

function buildListedCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#86198f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Listed', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#86198f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#86198f', margin: '16px 0 18px' } }),
      T('Rank the list, top to bottom.', { fontSize: 33, fontWeight: 800, color: '#86198f', letterSpacing: '-0.5px' }),
      T('Eight real things and one measurable quantity. Five submits: green locks a row that is exactly right, amber means you are off by a single place.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/LISTED', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, listedBoardEl()),
  ]);
}

export async function renderListedCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildListedCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Mate share card — snapshot of the game. The demo position is a plain back
// rank picture (Ra8 mate) that is NOT in the bank, whose boards are all sparse
// endgame studies, so it never spoils today. Evergreen.
//
// The board is built as ONE inline SVG data URI rather than as Satori divs,
// because the pieces are vector paths: Satori renders an <img> data URI
// faithfully, and the Unicode chess glyphs are not in Manrope (or in most system
// fonts on a server), so drawing them as text would produce six tofu boxes.
const MATE_PIECE_PATH = {
  K: 'M22.5 3.2 h4.6 v4.4 h4.4 v4.6 h-4.4 v3.1 a7.4 7.4 0 0 1 4.9 6.9 c0 2.6 -1.4 4.4 -3.1 6.6 l-1.9 2.4 h6.9 a3 3 0 0 1 3 3 v3.6 h-27 v-3.6 a3 3 0 0 1 3 -3 h6.9 l-1.9 -2.4 c-1.7 -2.2 -3.1 -4 -3.1 -6.6 a7.4 7.4 0 0 1 4.9 -6.9 v-3.1 h-4.4 v-4.6 h4.4 v-4.4 z',
  Q: 'M8.4 12.6 a2.7 2.7 0 1 1 2.7 2.7 l2.3 8.2 l3.4 -9.9 a2.7 2.7 0 1 1 3.1 -0.1 l3.6 10.4 l3.6 -10.4 a2.7 2.7 0 1 1 3.1 0.1 l3.4 9.9 l2.3 -8.2 a2.7 2.7 0 1 1 2.7 -2.7 a2.7 2.7 0 0 1 -1.6 2.5 l-3.4 12.4 h-19.6 l-3.4 -12.4 a2.7 2.7 0 0 1 -1.6 -2.5 z M12.8 30.5 h19.4 l0.9 3.2 h-21.2 z M10.5 35.6 h24 a2.6 2.6 0 0 1 2.6 2.6 v3.2 h-29.2 v-3.2 a2.6 2.6 0 0 1 2.6 -2.6 z',
  R: 'M10.2 8 h4.9 v3.4 h4.6 v-3.4 h5.6 v3.4 h4.6 v-3.4 h4.9 v8.4 l-3.2 3 v12.6 l3.2 3.1 v3.7 h-24.6 v-3.7 l3.2 -3.1 v-12.6 l-3.2 -3 z',
  B: 'M22.5 4.6 a2.9 2.9 0 0 1 1.9 5.1 c2.9 2.3 6.2 6.3 6.2 11 c0 2.8 -1.2 4.8 -2.6 6.6 h-11 c-1.4 -1.8 -2.6 -3.8 -2.6 -6.6 c0 -4.7 3.3 -8.7 6.2 -11 a2.9 2.9 0 0 1 1.9 -5.1 z M13.6 29.3 h17.8 a2 2 0 0 1 0 4 h-17.8 a2 2 0 0 1 0 -4 z M10 35.3 h25 a2.6 2.6 0 0 1 2.6 2.6 v3.5 h-30.2 v-3.5 a2.6 2.6 0 0 1 2.6 -2.6 z',
  N: 'M15.4 41.4 c0.6 -6.6 3.4 -10.2 7.4 -13.6 c2.1 -1.8 2.9 -3 2.8 -4.4 l-3.8 2.6 c-1.9 1.3 -3.6 1.6 -5 0.9 c-1.9 -1 -2.4 -3.3 -1.6 -5.6 l-2.4 0.7 c-1.2 0.3 -2.1 -0.6 -1.7 -1.8 c1.6 -4.9 4.6 -9 8.6 -11.6 l0.7 -2.9 a1.3 1.3 0 0 1 2.4 -0.2 l0.8 1.8 c4.3 0.3 8.3 2.6 10.6 6.6 c2 3.4 2.6 7.6 2.6 12.6 c0 6 -0.7 10.6 -1.4 14.9 z',
  P: 'M22.5 8.4 a5.6 5.6 0 0 1 3.6 9.9 c2.4 1.5 4.1 4 4.1 7.1 c0 2.3 -0.9 4 -1.9 5.6 h-11.6 c-1 -1.6 -1.9 -3.3 -1.9 -5.6 c0 -3.1 1.7 -5.6 4.1 -7.1 a5.6 5.6 0 0 1 3.6 -9.9 z M11.6 35.7 h21.8 a2.6 2.6 0 0 1 2.6 2.6 v3.1 h-27 v-3.1 a2.6 2.6 0 0 1 2.6 -2.6 z',
};
function mateBoardDataURI() {
  const CELL = 47, PAD = 4, BOARD = CELL * 8, BOX = BOARD + PAD * 2;
  const rows = '6k1/5ppp/8/8/8/8/5PPP/R5K1'.split('/');
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">`];
  parts.push(`<rect x="0" y="0" width="${BOX}" height="${BOX}" rx="8" fill="#0b0d12"/>`);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    parts.push(`<rect x="${PAD + c * CELL}" y="${PAD + r * CELL}" width="${CELL}" height="${CELL}" fill="${(r + c) % 2 ? '#b58863' : '#efd9b5'}"/>`);
  }
  // the mating square, flagged the way the game flags its last move
  parts.push(`<rect x="${PAD}" y="${PAD}" width="${CELL}" height="${CELL}" fill="#e8b43a" opacity="0.55"/>`);
  for (let r = 0; r < 8; r++) {
    let f = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '9') { f += Number(ch); continue; }
      const white = ch === ch.toUpperCase();
      const s = (CELL * 0.92) / 45;
      const off = (CELL - 45 * s) / 2;
      parts.push(
        `<g transform="translate(${PAD + f * CELL + off},${PAD + r * CELL + off}) scale(${s})">` +
        `<path d="${MATE_PIECE_PATH[ch.toUpperCase()]}" fill="${white ? '#ffffff' : '#0b0d12'}" ` +
        `stroke="${white ? '#0b0d12' : '#ffffff'}" stroke-width="${white ? 2 : 1.1}" stroke-linejoin="round"/></g>`
      );
      f++;
    }
  }
  parts.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(parts.join('')).toString('base64');
}
function mateBoardEl() {
  const BOX = 47 * 8 + 8;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'WHITE TO PLAY AND MATE'),
    h('img', { key: 'bd', src: mateBoardDataURI(), width: BOX, height: BOX, style: { display: 'flex' } }),
  ]);
}
function buildMateCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#6b4423)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Mate', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#6b4423', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#6b4423', margin: '16px 0 18px' } }),
      T('One move. Every other fails.', { fontSize: 33, fontWeight: 800, color: '#6b4423', letterSpacing: '-0.5px' }),
      T('The daily chess endgame. White to play and force checkmate in two, with exactly one first move that works. Tap a piece, tap a square, no notation needed. Sundays go to mate in three.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/MATE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, mateBoardEl()),
  ]);
}

// ---------------------------------------------------------------------------
// Defend share card — snapshot of the game, drawn from the defender's side of
// the argument. The demo board is a neutral picture that is NOT in the bank, so
// it never spoils today. Evergreen.
//
// It reuses MATE_PIECE_PATH above rather than redrawing the pieces: it is the
// same board, and the point of the pair is that they look like siblings.
function defendBoardDataURI() {
  const CELL = 47, PAD = 4, BOARD = CELL * 8, BOX = BOARD + PAD * 2;
  const rows = '6k1/5ppp/8/8/7Q/8/5PPP/R5K1'.split('/');
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">`];
  parts.push(`<rect x="0" y="0" width="${BOX}" height="${BOX}" rx="8" fill="#0b0d12"/>`);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    parts.push(`<rect x="${PAD + c * CELL}" y="${PAD + r * CELL}" width="${CELL}" height="${CELL}" fill="${(r + c) % 2 ? '#b58863' : '#efd9b5'}"/>`);
  }
  // the king under fire, flagged rather than the mating square: on this card the
  // piece in trouble is the subject
  parts.push(`<rect x="${PAD + 6 * CELL}" y="${PAD}" width="${CELL}" height="${CELL}" fill="#c0392b" opacity="0.42"/>`);
  for (let r = 0; r < 8; r++) {
    let f = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '9') { f += Number(ch); continue; }
      const white = ch === ch.toUpperCase();
      const s = (CELL * 0.92) / 45;
      const off = (CELL - 45 * s) / 2;
      parts.push(
        `<g transform="translate(${PAD + f * CELL + off},${PAD + r * CELL + off}) scale(${s})">` +
        `<path d="${MATE_PIECE_PATH[ch.toUpperCase()]}" fill="${white ? '#ffffff' : '#0b0d12'}" ` +
        `stroke="${white ? '#0b0d12' : '#ffffff'}" stroke-width="${white ? 2 : 1.1}" stroke-linejoin="round"/></g>`
      );
      f++;
    }
  }
  parts.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(parts.join('')).toString('base64');
}
function defendBoardEl() {
  const BOX = 47 * 8 + 8;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'BLACK TO PLAY AND SURVIVE'),
    h('img', { key: 'bd', src: defendBoardDataURI(), width: BOX, height: BOX, style: { display: 'flex' } }),
  ]);
}
function buildDefendCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2f4f4f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Defend', { fontSize: 92, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#2f4f4f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#2f4f4f', margin: '16px 0 18px' } }),
      T('One move saves you. Then another.', { fontSize: 30, fontWeight: 800, color: '#2f4f4f', letterSpacing: '-0.5px' }),
      T('The daily chess puzzle from the defending side. White is threatening mate and five moves look like they answer it. One does, and finding it only buys you the next one. Sundays hold for four.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/DEFEND', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, defendBoardEl()),
  ]);
}
export async function renderDefendCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildDefendCard(), { ...size, fonts });
}

export async function renderMateCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildMateCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Four share card — snapshot of the game. The demo board is a neutral mid-game
// picture that is NOT in the bank, so it never spoils today's position.
// Evergreen.
//
// Like the Mate card, the board is built as ONE inline SVG data URI rather than
// as Satori divs: Satori renders an <img> data URI faithfully, and drawing 42
// nested rounded elements as divs is both slower and softer than a single
// vector.
const FOUR_DEMO = [
  '.......',
  '.......',
  '...R...',
  '..YRY..',
  '..RYR..',
  '.YRYRY.',
];
function fourBoardDataURI() {
  const CELL = 54, PAD = 7, W = CELL * 7 + PAD * 2, H = CELL * 6 + PAD * 2;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  p.push(`<defs>
    <linearGradient id="bd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#233a63"/><stop offset="1" stop-color="#152a63"/></linearGradient>
    <radialGradient id="r" cx="34%" cy="30%"><stop offset="0" stop-color="#d62828"/><stop offset="1" stop-color="#a11d1d"/></radialGradient>
    <radialGradient id="y" cx="34%" cy="30%"><stop offset="0" stop-color="#f4c02c"/><stop offset="1" stop-color="#c08f0e"/></radialGradient>
  </defs>`);
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="url(#bd)"/>`);
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      const cx = PAD + c * CELL + CELL / 2, cy = PAD + r * CELL + CELL / 2, rad = CELL * 0.40;
      const ch = FOUR_DEMO[r][c];
      const fill = ch === 'R' ? 'url(#r)' : ch === 'Y' ? 'url(#y)' : '#f1f3f7';
      p.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}"/>`);
    }
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}
function fourBoardEl() {
  const CELL = 54, PAD = 7;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'RED TO PLAY AND WIN'),
    h('img', { key: 'bd', src: fourBoardDataURI(), width: CELL * 7 + PAD * 2, height: CELL * 6 + PAD * 2, style: { display: 'flex' } }),
  ]);
}
function buildFourCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#d62828)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Four', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#233a63', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#233a63', margin: '16px 0 18px' } }),
      T('One column wins. No take-backs.', { fontSize: 33, fontWeight: 800, color: '#233a63', letterSpacing: '-0.5px' }),
      T('The daily Connect Four position. You are already winning, in four moves, and exactly one column keeps it. Drop the wrong one and a perfect engine plays the game out. Sundays go to a win in five.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/FOUR', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, fourBoardEl()),
  ]);
}

export async function renderFourCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildFourCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Parker share card — snapshot of the game. The demo lot is hand-made and is
// NOT in the bank, so it never spoils today. Evergreen. Drawn as one inline SVG
// data URI, the established pattern here: Satori renders an <img> faithfully
// and it beats stacking thirteen nested divs.
//
// The headline used to read "Par is the proven minimum", which sold the scoring
// footnote instead of the game and, after the 2026-07-31 par rework, was not
// even true. It now sells the predicament.
const PARKER_DEMO = [
  // [len, horiz, fixed, pos] — block 0 is the red one on row 2
  [2, 1, 2, 1], [3, 0, 0, 0], [2, 0, 3, 0], [2, 1, 0, 1], [3, 0, 5, 1],
  [2, 1, 4, 2], [2, 0, 1, 3], [2, 1, 5, 3], [2, 0, 4, 3],
];
function parkerBoardDataURI() {
  const CELL = 58, PAD = 10, W = CELL * 6 + PAD * 2;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">`];
  p.push(`<rect x="0" y="0" width="${W}" height="${W}" rx="12" fill="#2f2a24"/>`);
  p.push(`<rect x="${PAD}" y="${PAD}" width="${CELL * 6}" height="${CELL * 6}" fill="#e7e2d8"/>`);
  for (let i = 1; i < 6; i++) {
    p.push(`<rect x="${PAD + i * CELL}" y="${PAD}" width="1" height="${CELL * 6}" fill="#c9c2b4"/>`);
    p.push(`<rect x="${PAD}" y="${PAD + i * CELL}" width="${CELL * 6}" height="1" fill="#c9c2b4"/>`);
  }
  // the exit gap, cut through the right wall on row 2
  p.push(`<rect x="${PAD + CELL * 6}" y="${PAD + 2 * CELL}" width="${PAD}" height="${CELL}" fill="#e7e2d8"/>`);
  const paint = ['#6b7f9e', '#8a9a6b', '#a8846b', '#7f9e94', '#9e8a6b', '#6b8a9e', '#a89a6b', '#8a6b7f'];
  const truck = ['#3f4a5c', '#4c5c3f', '#5c4c3f', '#3f5c55'];
  PARKER_DEMO.forEach(([len, horiz, fixed, pos], i) => {
    const row = horiz ? fixed : pos, col = horiz ? pos : fixed;
    const w = (horiz ? len : 1) * CELL - 8, h = (horiz ? 1 : len) * CELL - 8;
    const fill = i === 0 ? '#c0392b' : len >= 3 ? truck[i % truck.length] : paint[i % paint.length];
    p.push(`<rect x="${PAD + col * CELL + 4}" y="${PAD + row * CELL + 4}" width="${w}" height="${h}" rx="9" fill="${fill}"${i === 0 ? ' stroke="#7a2318" stroke-width="2"' : ''}/>`);
  });
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}
function parkerBoardEl() {
  const BOX = 58 * 6 + 20;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'GET THE RED ONE OUT'),
    h('img', { key: 'bd', src: parkerBoardDataURI(), width: BOX, height: BOX, style: { display: 'flex' } }),
  ]);
}
function buildParkerCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#7c5c2e 55%,#c0392b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Parker', { fontSize: 92, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c5c2e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c5c2e', margin: '16px 0 18px' } }),
      T('You are the red one. Get out.', { fontSize: 33, fontWeight: 800, color: '#7c5c2e', letterSpacing: '-0.5px' }),
      T('The daily sliding-block jam. A packed lot, every block stuck on one axis, and one gap in the wall. Shove the others out of your way and drive off. No undo, no reversing, one board a day.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/PARKER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, parkerBoardEl()),
  ]);
}
export async function renderParkerCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildParkerCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Check share card. The demo position is a plain two-on-two that is NOT in the
// bank, so it never spoils today. Keep every reader-facing string on this card
// about the GOAL (sweep the board in N) and never about the method: the share
// copy used to name the key idea outright, which gave every future board away.
const CHECK_DEMO = [
  // [row, col, piece] with 1 red man, 2 red king, 3 black man
  [5, 2, 1], [5, 6, 1], [4, 3, 1], [2, 3, 3], [2, 5, 3], [1, 6, 3], [3, 0, 2],
];
function checkBoardDataURI() {
  const CELL = 44, PAD = 8, W = CELL * 8 + PAD * 2;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">`];
  p.push(`<defs>
    <radialGradient id="cr" cx="34%" cy="30%"><stop offset="0" stop-color="#c0392b"/><stop offset="1" stop-color="#7a2318"/></radialGradient>
    <radialGradient id="cb" cx="34%" cy="30%"><stop offset="0" stop-color="#3f4757"/><stop offset="1" stop-color="#0e0f12"/></radialGradient>
  </defs>`);
  p.push(`<rect x="0" y="0" width="${W}" height="${W}" rx="10" fill="#0b0d12"/>`);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const dark = ((r + c) & 1) === 1;
    p.push(`<rect x="${PAD + c * CELL}" y="${PAD + r * CELL}" width="${CELL}" height="${CELL}" fill="${dark ? '#4f6b58' : '#e9e2d0'}"/>`);
  }
  for (const [r, c, v] of CHECK_DEMO) {
    const cx = PAD + c * CELL + CELL / 2, cy = PAD + r * CELL + CELL / 2, rad = CELL * 0.37;
    p.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${v === 3 ? 'url(#cb)' : 'url(#cr)'}"/>`);
    if (v === 2) p.push(`<circle cx="${cx}" cy="${cy}" r="${rad * 0.42}" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="2"/>`);
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}
function checkBoardEl() {
  const BOX = 44 * 8 + 16;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'RED TO PLAY AND SWEEP'),
    h('img', { key: 'bd', src: checkBoardDataURI(), width: BOX, height: BOX, style: { display: 'flex' } }),
  ]);
}
function buildCheckCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#166e5a 55%,#c0392b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Check', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#166e5a', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#166e5a', margin: '16px 0 18px' } }),
      T('Red to play and sweep.', { fontSize: 33, fontWeight: 800, color: '#166e5a', letterSpacing: '-0.5px' }),
      T('The daily checkers shot. Take every black piece in three moves, four on Sundays. Exactly one first move does it, and there is no take-back.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CHECK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, checkBoardEl()),
  ]);
}
export async function renderCheckCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCheckCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Rung share card. The demo ladder is short and hand-made, and is NOT in the
// bank, so it never spoils today's climb. Evergreen.
const RUNG_DEMO = ['cold', 'cord', 'card', 'ward', 'warm'];
function rungBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 26px 20px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'ONE LETTER AT A TIME'),
    ...RUNG_DEMO.map((w, r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row', marginBottom: 7 } },
      w.split('').map((ch, i) => {
        const changed = r > 0 && RUNG_DEMO[r - 1][i] !== ch;
        return h('div', {
          key: `c${i}`,
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '58px', height: '62px', marginRight: '7px', borderRadius: '8px',
            fontSize: 34, fontWeight: 800, textTransform: 'uppercase',
            background: changed ? '#155e75' : '#f3f1ea',
            color: changed ? '#ffffff' : '#0b0d12',
            border: `2px solid ${changed ? '#155e75' : '#d5d0c4'}`,
          },
        }, ch.toUpperCase());
      }))),
  ]);
}
function buildRungCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#155e75 55%,#7fd4e8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Rung', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#155e75', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#155e75', margin: '16px 0 18px' } }),
      T('Perfect is the shortest ladder there is.', { fontSize: 33, fontWeight: 800, color: '#155e75', letterSpacing: '-0.5px' }),
      T('The daily word ladder. Change one letter at a time, every rung a real word, and try to match the shortest route between the two ends. Most days there is only one.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/RUNG', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, rungBoardEl()),
  ]);
}
export async function renderRungCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildRungCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Crunch share card. The demo round is a plain one that is NOT in the bank.
const CRUNCH_DEMO = { numbers: [75, 50, 8, 6, 3, 2], target: 484 };
function crunchBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const tile = (n, i) => h('div', {
    key: `t${i}`,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '86px', height: '86px', marginRight: '10px', marginBottom: '10px',
      borderRadius: '10px', background: '#f3f1ea', border: '2px solid #0b0d12',
      fontSize: 36, fontWeight: 800, color: '#0b0d12',
    },
  }, String(n));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'TARGET'),
    T(String(CRUNCH_DEMO.target), { fontSize: 76, fontWeight: 800, color: '#b45309', lineHeight: 1, marginBottom: 18 }),
    h('div', { key: 'r1', style: { display: 'flex', flexDirection: 'row' } }, CRUNCH_DEMO.numbers.slice(0, 3).map(tile)),
    h('div', { key: 'r2', style: { display: 'flex', flexDirection: 'row' } }, CRUNCH_DEMO.numbers.slice(3).map((n, i) => tile(n, i + 3))),
  ]);
}
function buildCrunchCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#b45309 55%,#f0c07a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Crunch', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#b45309', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#b45309', margin: '16px 0 18px' } }),
      T('Six numbers. One target.', { fontSize: 33, fontWeight: 800, color: '#b45309', letterSpacing: '-0.5px' }),
      T('The daily numbers round. Add, subtract, multiply and divide your way to the target, using each number once and never going negative or fractional. Always reachable, rarely obvious.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CRUNCH', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, crunchBoardEl()),
  ]);
}
export async function renderCrunchCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCrunchCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Taire share card. The demo spread below is a tidy arrangement that is NOT in
// the bank, whose deals are all machine generated, so it never spoils today.
const TAIRE_DEMO = [
  [{ r: 7, s: 0 }, { r: 3, s: 1 }, { r: 10, s: 0 }],
  [{ r: 2, s: 1 }, { r: 9, s: 0 }, { r: 4, s: 1 }],
  [{ r: 6, s: 1 }, { r: 1, s: 0 }, { r: 8, s: 1 }],
  [{ r: 5, s: 0 }, { r: 10, s: 1 }, { r: 2, s: 0 }],
  [{ r: 9, s: 1 }, { r: 6, s: 0 }, { r: 3, s: 0 }],
];
const TAIRE_LABEL = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
function taireBoardDataURI() {
  const CW = 52, CH = 72, GAP = 10, OVER = 26, PAD = 16;
  const W = PAD * 2 + CW * 5 + GAP * 4;
  const H = PAD * 2 + 96 + CH + OVER * 2 + 12;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#1f6b52"/>`);
  // Satori rasterises this SVG WITHOUT a font, so <text> silently vanishes and
  // every card comes out blank. Rank pips and suits are therefore drawn as
  // geometry: repeated suit marks, the way a real pip card is laid out.
  const suitPath = (cx, cy, z, s) => (s === 1
    ? `M ${cx} ${cy + z * 0.62} C ${cx - z * 1.25} ${cy - z * 0.12} ${cx - z * 0.62} ${cy - z * 0.95} ${cx} ${cy - z * 0.38} C ${cx + z * 0.62} ${cy - z * 0.95} ${cx + z * 1.25} ${cy - z * 0.12} ${cx} ${cy + z * 0.62} Z`
    : `M ${cx} ${cy - z * 0.66} C ${cx + z * 1.18} ${cy + z * 0.16} ${cx + z * 0.56} ${cy + z * 0.56} ${cx + z * 0.14} ${cy + z * 0.3} L ${cx + z * 0.24} ${cy + z * 0.66} L ${cx - z * 0.24} ${cy + z * 0.66} L ${cx - z * 0.14} ${cy + z * 0.3} C ${cx - z * 0.56} ${cy + z * 0.56} ${cx - z * 1.18} ${cy + z * 0.16} ${cx} ${cy - z * 0.66} Z`);
  // where the pips sit on a card of each rank, as fractions of the card box
  const PIPS = {
    1: [[0.5, 0.5]],
    2: [[0.5, 0.28], [0.5, 0.72]],
    3: [[0.5, 0.26], [0.5, 0.5], [0.5, 0.74]],
    4: [[0.33, 0.28], [0.67, 0.28], [0.33, 0.72], [0.67, 0.72]],
    5: [[0.33, 0.26], [0.67, 0.26], [0.5, 0.5], [0.33, 0.74], [0.67, 0.74]],
    6: [[0.33, 0.24], [0.67, 0.24], [0.33, 0.5], [0.67, 0.5], [0.33, 0.76], [0.67, 0.76]],
    7: [[0.33, 0.24], [0.67, 0.24], [0.5, 0.37], [0.33, 0.5], [0.67, 0.5], [0.33, 0.76], [0.67, 0.76]],
    8: [[0.33, 0.22], [0.67, 0.22], [0.5, 0.36], [0.33, 0.5], [0.67, 0.5], [0.5, 0.64], [0.33, 0.78], [0.67, 0.78]],
    9: [[0.33, 0.22], [0.67, 0.22], [0.33, 0.41], [0.67, 0.41], [0.5, 0.5], [0.33, 0.59], [0.67, 0.59], [0.33, 0.78], [0.67, 0.78]],
    10: [[0.33, 0.2], [0.67, 0.2], [0.5, 0.31], [0.33, 0.4], [0.67, 0.4], [0.33, 0.6], [0.67, 0.6], [0.5, 0.69], [0.33, 0.8], [0.67, 0.8]],
  };
  const card = (x, y, r, s) => {
    const col = s === 1 ? '#c0392b' : '#0b0d12';
    const body = (PIPS[r] || PIPS[1]).map(([fx, fy]) =>
      `<path d="${suitPath(x + CW * fx, y + CH * fy, r === 1 ? 11 : 5.4, s)}" fill="${col}"/>`).join('');
    const idx = `<path d="${suitPath(x + 8, y + 10, 4.2, s)}" fill="${col}"/>`;
    return `<g><rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="7" fill="#fdfcf9" stroke="rgba(20,22,28,0.30)"/>${idx}${body}</g>`;
  };
  // free cells on the left, home piles on the right
  for (let i = 0; i < 2; i++) {
    p.push(`<rect x="${PAD + i * (CW + GAP)}" y="${PAD}" width="${CW}" height="${CH}" rx="7" fill="rgba(0,0,0,0.12)" stroke="rgba(255,255,255,0.34)" stroke-dasharray="5 4"/>`);
  }
  p.push(card(W - PAD - CW * 2 - GAP, PAD, 1, 0));
  p.push(card(W - PAD - CW, PAD, 2, 1));
  // five columns
  for (let c = 0; c < 5; c++) {
    const x = PAD + c * (CW + GAP);
    TAIRE_DEMO[c].forEach((cd, k) => p.push(card(x, PAD + 96 + k * OVER, cd.r, cd.s)));
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}
function taireBoardEl() {
  const W = 16 * 2 + 52 * 5 + 10 * 4, H = 16 * 2 + 96 + 72 + 26 * 2 + 12;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'SEND ALL TWENTY HOME'),
    h('img', { key: 'bd', src: taireBoardDataURI(), width: W, height: H, style: { display: 'flex' } }),
  ]);
}
function buildTaireCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#1d6b4f 55%,#c0392b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Taire', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#1d6b4f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1d6b4f', margin: '16px 0 18px' } }),
      T('Nothing hidden. No luck in it.', { fontSize: 33, fontWeight: 800, color: '#1d6b4f', letterSpacing: '-0.5px' }),
      T('The daily solitaire. Twenty cards face up, two suits, a free cell or two, and a perfect line that is the proven minimum rather than a guess. Nobody beats perfect. The whole game is how close you get.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/TAIRE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, taireBoardEl()),
  ]);
}
export async function renderTaireCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildTaireCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Fib share card. The demo grid below is a hand-drawn arrangement that is NOT
// in the bank, whose boards are all machine generated, so it never spoils
// today. Built from Satori divs rather than an embedded SVG, because Satori
// rasterises an SVG data URI without a font and any <text> in it vanishes.
const FIB_DEMO_VALS = [
  [3, 0, 5, 0, 1],
  [0, 4, 0, 2, 0],
  [5, 0, 1, 0, 3],
  [0, 2, 0, 4, 0],
  [1, 0, 3, 0, 5],
];
// [row, col, glyph, lying] for the sign to the RIGHT of that cell
const FIB_DEMO_H = [[0, 0, '>', false], [2, 2, '<', true], [4, 1, '<', false], [1, 3, '>', false], [3, 0, '>', false], [0, 3, '<', false]];
// [row, col, glyph, lying] for the sign BELOW that cell
// Satori's Manrope subset has no U+2227/U+2228 wedges, so the demo card sticks
// to the ascii signs the font actually carries and skips the vertical ones.
const FIB_DEMO_V = [];
function fibBoardEl() {
  const CELL = 64, SIGN = 28, INK = '#0b0d12', ACC = '#4c1d95', AMBER = '#b45309';
  const hAt = (r, c) => FIB_DEMO_H.find((x) => x[0] === r && x[1] === c);
  const vAt = (r, c) => FIB_DEMO_V.find((x) => x[0] === r && x[1] === c);
  const rows = [];
  for (let r = 0; r < 5; r++) {
    const cells = [];
    for (let c = 0; c < 5; c++) {
      const v = FIB_DEMO_VALS[r][c];
      cells.push(h('div', {
        key: `c${r}-${c}`,
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: `${CELL}px`, height: `${CELL}px`, borderRadius: '7px',
          border: '2px solid rgba(28,30,36,0.30)', background: v ? '#eceef1' : '#fff',
          fontSize: 34, fontWeight: 800, color: v ? INK : '#fff',
        },
      }, v ? String(v) : ''));
      if (c < 4) {
        const s = hAt(r, c);
        cells.push(h('div', {
          key: `hs${r}-${c}`,
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: `${SIGN}px`, height: `${CELL}px`, fontSize: 40, fontWeight: 800,
            color: s ? (s[3] ? AMBER : '#8b93a1') : '#fff',
          },
        }, s ? s[2] : ''));
      }
    }
    rows.push(h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } }, cells));
    if (r < 4) {
      const gaps = [];
      for (let c = 0; c < 5; c++) {
        const s = vAt(r, c);
        gaps.push(h('div', {
          key: `vs${r}-${c}`,
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: `${CELL}px`, height: `${SIGN}px`, fontSize: 26, fontWeight: 800,
            color: s ? (s[3] ? AMBER : '#8b93a1') : '#fff',
          },
        }, s ? s[2] : ''));
        if (c < 4) gaps.push(h('div', { key: `vp${r}-${c}`, style: { display: 'flex', width: `${SIGN}px`, height: `${SIGN}px` } }, ''));
      }
      rows.push(h('div', { key: `g${r}`, style: { display: 'flex', flexDirection: 'row' } }, gaps));
    }
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'ONE OF THESE SIGNS IS LYING'),
    h('div', { key: 'bd', style: { display: 'flex', flexDirection: 'column' } }, rows),
  ]);
}
function buildFibCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#4c1d95 55%,#c0392b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Fib', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4c1d95', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4c1d95', margin: '16px 0 18px' } }),
      T('One clue is lying to you.', { fontSize: 33, fontWeight: 800, color: '#4c1d95', letterSpacing: '-0.5px' }),
      T('Every row and column holds each number once, and the open end of each sign points at the larger of two neighbours. Exactly one sign is false, so a contradiction might be your mistake, or might be the fib. Solve the grid, then name the liar.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/FIB', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, fibBoardEl()),
  ]);
}
export async function renderFibCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildFibCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Streak share card. The demo question is a plain one that is NOT in the bank.
const STREAK_DEMO = {
  q: 'Which country has more islands than any other?',
  choices: ['Sweden', 'Norway', 'Canada', 'Indonesia'],
};
function streakBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0d12' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('17 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#e11d48', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(STREAK_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0d12', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, STREAK_DEMO.choices.map(row)),
  ]);
}
function buildStreakCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#e11d48 55%,#fb7185)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Streak', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#e11d48', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#e11d48', margin: '16px 0 18px' } }),
      T('Forty questions. One life.', { fontSize: 33, fontWeight: 800, color: '#e11d48', letterSpacing: '-0.5px' }),
      T('The daily trivia gauntlet. Questions climb from gimme to brutal, twenty seconds each, and one wrong answer ends the run. How deep can you go?', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/STREAK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, streakBoardEl()),
  ]);
}
export async function renderStreakCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildStreakCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Feud share card — snapshot of the game. Demo board is NEUTRAL (an invented
// prompt that is not in the bank, plausible shares), so it never spoils today.
function feudBoardEl() {
  const rows = [
    { rank: 1, label: 'SUNGLASSES', pct: 34, gold: true },
    { rank: 2, label: 'THEIR KEYS', pct: 22 },
    { rank: 3, label: 'FLIP FLOPS', pct: 15 },
    { rank: 4, label: 'THE SUNSCREEN', pct: 9 },
    { rank: 5, label: 'THEIR PHONE', pct: 6 },
  ];
  const bars = rows.map((r, i) => h('div', { key: `r${i}`, style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: i ? 10 : 0 } }, [
    h('div', { key: 'n', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: 8, background: '#eceef1', fontSize: 17, fontWeight: 800, color: '#646c7a', marginRight: 10 } }, String(r.rank)),
    h('div', { key: 'b', style: { display: 'flex', flexDirection: 'column', width: '330px' } }, [
      h('div', { key: 't', style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' } }, [
        h('div', { key: 'l', style: { display: 'flex', fontSize: 17, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, r.label),
        h('div', { key: 'p', style: { display: 'flex', fontSize: 16, fontWeight: 800, color: '#646c7a' } }, `${r.pct}%`),
      ]),
      h('div', { key: 'bar', style: { display: 'flex', width: '330px', height: '11px', background: '#eceef1', borderRadius: 6, marginTop: 4 } }, [
        h('div', { key: 'f', style: { display: 'flex', width: `${Math.round((r.pct / 34) * 330)}px`, height: '11px', background: r.gold ? '#e8b43a' : '#e6a5b6', borderRadius: 6 } }),
      ]),
    ]),
  ]));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 24px 20px' } }, [
    h('div', { key: 'mh', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', borderBottom: '3px solid #0b0d12', paddingBottom: 8, marginBottom: 14 } }, [
      h('div', { key: 't', style: { display: 'flex', fontSize: 20, fontWeight: 800, color: '#0b0d12', letterSpacing: '0.5px' } }, 'Lost at the beach?'),
      h('div', { key: 'x', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '1.5px', color: '#fff', background: '#9f1239', borderRadius: 5, padding: '3px 9px', marginLeft: 14 } }, 'LIVE'),
    ]),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, bars),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginTop: 14 } }, 'THE CROWD IS STILL VOTING' ),
  ]);
}
function buildFeudCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#9f1239)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Feud', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#9f1239', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#9f1239', margin: '16px 0 18px' } }),
      T('Match the crowd. The answer key is live.', { fontSize: 33, fontWeight: 800, color: '#9f1239', letterSpacing: '-0.5px' }),
      T('Five everyday prompts, three answers each. The key is whatever today’s players say — every answer is a vote, and the shares shift all day.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/FEUD', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, feudBoardEl()),
  ]);
}

export async function renderFeudCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildFeudCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Babel share card — snapshot of the game. The demo position is a NEUTRAL
// invented endgame (not in the bank, whose boards are all self-played), so it
// never spoils today. Evergreen.
//
// Drawn as Satori divs rather than an SVG: tiles are just letters on coloured
// boxes, and Manrope has the glyphs, so there is nothing here that needs paths.
function babelTileEl(ch, pts, key, opts = {}) {
  const size = opts.size || 52;
  return h('div', {
    key,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      width: size, height: size, marginRight: opts.gap == null ? 7 : opts.gap,
      background: opts.bg || '#f7edda', borderRadius: 6,
      border: '2px solid rgba(120,80,20,0.45)',
      fontSize: Math.round(size * 0.55), fontWeight: 800, color: '#0b0d12',
    },
  }, [
    h('div', { key: 'l', style: { display: 'flex' } }, ch),
    pts ? h('div', { key: 'p', style: { display: 'flex', position: 'absolute', right: 4, bottom: 1, fontSize: Math.round(size * 0.2), fontWeight: 800, color: '#7a5a20' } }, String(pts)) : null,
  ]);
}

function babelBoardEl() {
  // A five-square strip of board with a word already down and the premium
  // squares showing, plus the rack underneath. Enough to read as a tile game
  // without being a real position.
  const cell = (content, bg, fg, key) => h('div', {
    key,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 54, height: 54, marginRight: 5, borderRadius: 5,
      background: bg, color: fg, fontSize: 26, fontWeight: 800,
    },
  }, content);
  const row = (cells, key) => h('div', { key, style: { display: 'flex', flexDirection: 'row', marginBottom: 5 } }, cells);
  return h('div', {
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: '#0d3b20', border: '3px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px',
    },
  }, [
    row([
      cell('3W', '#e2725b', '#fff', 'a'),
      cell('Q', '#f7edda', '#0b0d12', 'b'),
      cell('U', '#f7edda', '#0b0d12', 'c'),
      cell('2L', '#b3d4ea', '#1f4e6b', 'd'),
      cell('', '#e9efe9', '#0b0d12', 'e'),
    ], 'r1'),
    row([
      cell('', '#e9efe9', '#0b0d12', 'f'),
      cell('', '#e9efe9', '#0b0d12', 'g'),
      cell('N', '#f7edda', '#0b0d12', 'h'),
      cell('3L', '#4a90d9', '#fff', 'i'),
      cell('2W', '#f0b5ac', '#7a2e20', 'j'),
    ], 'r2'),
    row([
      cell('J', '#cfe8d6', '#14532d', 'k'),
      cell('A', '#cfe8d6', '#14532d', 'l'),
      cell('I', '#cfe8d6', '#14532d', 'm'),
      cell('T', '#f7edda', '#0b0d12', 'n'),
      cell('', '#e9efe9', '#0b0d12', 'o'),
    ], 'r3'),
    h('div', { key: 'lbl', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#b9d6c3', margin: '10px 0 12px' } }, 'YOUR RACK · BAG EMPTY'),
    h('div', { key: 'rack', style: { display: 'flex', flexDirection: 'row' } }, [
      babelTileEl('E', 1, 't1'), babelTileEl('R', 1, 't2'), babelTileEl('V', 4, 't3'),
      babelTileEl('O', 1, 't4'), babelTileEl('D', 2, 't5', { gap: 0 }),
    ]),
  ]);
}

function buildBabelCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#14532d 55%,#4d7c0f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Babel', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#14532d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#14532d', margin: '16px 0 18px' } }),
      T('The bag is empty.', { fontSize: 33, fontWeight: 800, color: '#14532d', letterSpacing: '-0.5px' }),
      T('A word tile game picked up at the very end. Nothing is left to draw, so their rack is not a secret. Race them out, or make them sit on a tile they cannot play.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/BABEL', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, babelBoardEl()),
  ]);
}

export async function renderBabelCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildBabelCard(), { ...size, fonts });
}
// ---------------------------------------------------------------------------
// Glyph share card — snapshot of the game. The demo grid is a 6x6 fragment that
// is NOT in the bank (weekdays are 15x15, Sundays 17x17), so it never spoils
// today. Two squares are "solved" to show the number-to-letter idea. Evergreen.
function glyphBoardEl() {
  const CELL = 52, PAD = 18, N = 6;
  // 0 = block; otherwise the printed number. L = the letter already cracked.
  const NUM = [
    [4, 9, 12, 0, 7, 3],
    [9, 0, 4, 0, 12, 0],
    [12, 7, 3, 9, 4, 7],
    [0, 3, 0, 0, 9, 0],
    [7, 12, 9, 4, 3, 12],
    [3, 0, 7, 0, 0, 9],
  ];
  const SOLVED = { 9: 'E', 3: 'T' };
  const kids = [];
  NUM.forEach((row, i) => row.forEach((n, j) => {
    const x = PAD + j * CELL, y = PAD + i * CELL;
    if (!n) {
      kids.push(h('div', { key: `b${i}-${j}`, style: {
        position: 'absolute', left: x, top: y, width: CELL, height: CELL,
        background: '#0b0d12', display: 'flex',
      } }));
      return;
    }
    const L = SOLVED[n];
    kids.push(h('div', { key: `c${i}-${j}`, style: {
      position: 'absolute', left: x, top: y, width: CELL, height: CELL,
      border: '1px solid #d3d8e0', background: L ? '#eef2f7' : '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    } }, L ? h('div', { style: { display: 'flex', fontSize: 27, fontWeight: 800, color: '#334155' } }, L) : ''));
    kids.push(h('div', { key: `n${i}-${j}`, style: {
      position: 'absolute', left: x + 4, top: y + 2, fontSize: 13, fontWeight: 600,
      color: '#98a1b0', display: 'flex',
    } }, String(n)));
  }));
  const box = N * CELL + PAD * 2;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'NO CLUES. EVERY LETTER IS A NUMBER.'),
    h('div', { key: 'bd', style: { display: 'flex', position: 'relative', width: box, height: box } }, kids),
  ]);
}
function buildGlyphCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#334155)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Glyph', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#334155', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#334155', margin: '16px 0 18px' } }),
      T('Crack all 26.', { fontSize: 33, fontWeight: 800, color: '#334155', letterSpacing: '-0.5px' }),
      T('The daily codeword. Every letter is swapped for a number, the same number always the same letter, and two given letters are all you get. One solution, common words only, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/GLYPH', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, glyphBoardEl()),
  ]);
}

export async function renderGlyphCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildGlyphCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Hands share card. The demo board below is a hand-arranged snapshot that is
// NOT in the bank, whose deals are all machine generated, so it never spoils
// today. Satori rasterises this SVG WITHOUT a font, so <text> would silently
// vanish: ranks and suits are drawn as geometry, the way a real pip card is.
// Suit codes here match the game's own order: 0 spades, 1 hearts, 2 diamonds.
// Clubs are left out of the demo art deliberately, because the three-lobed club
// is illegible at 40px and reads as a smudge next to the spade.
const HANDS_DEMO = [
  [{ r: 10, s: 0 }, { r: 10, s: 1 }, null, { r: 4, s: 0 }, null],
  [null, { r: 7, s: 2 }, { r: 7, s: 0 }, null, { r: 9, s: 1 }],
  [{ r: 3, s: 1 }, null, null, { r: 5, s: 0 }, { r: 6, s: 0 }],
  [null, { r: 2, s: 0 }, { r: 8, s: 2 }, null, null],
  [{ r: 1, s: 2 }, null, null, { r: 9, s: 1 }, null],
];
function handsBoardDataURI() {
  const CW = 40, CH = 54, GAP = 6, PAD = 14;
  const W = PAD * 2 + CW * 5 + GAP * 4;
  const H = PAD * 2 + CH * 5 + GAP * 4;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#7c2230"/>`);
  const suitPath = (cx, cy, z, s) => ((s === 1 || s === 2)
    ? (s === 2
      ? `M ${cx} ${cy - z} L ${cx + z * 0.78} ${cy} L ${cx} ${cy + z} L ${cx - z * 0.78} ${cy} Z`
      : `M ${cx} ${cy + z * 0.62} C ${cx - z * 1.25} ${cy - z * 0.12} ${cx - z * 0.62} ${cy - z * 0.95} ${cx} ${cy - z * 0.38} C ${cx + z * 0.62} ${cy - z * 0.95} ${cx + z * 1.25} ${cy - z * 0.12} ${cx} ${cy + z * 0.62} Z`)
    : `M ${cx} ${cy - z * 0.66} C ${cx + z * 1.18} ${cy + z * 0.16} ${cx + z * 0.56} ${cy + z * 0.56} ${cx + z * 0.14} ${cy + z * 0.3} L ${cx + z * 0.24} ${cy + z * 0.66} L ${cx - z * 0.24} ${cy + z * 0.66} L ${cx - z * 0.14} ${cy + z * 0.3} C ${cx - z * 0.56} ${cy + z * 0.56} ${cx - z * 1.18} ${cy + z * 0.16} ${cx} ${cy - z * 0.66} Z`);
  const PIPS = {
    1: [[0.5, 0.5]],
    2: [[0.5, 0.28], [0.5, 0.72]],
    3: [[0.5, 0.26], [0.5, 0.5], [0.5, 0.74]],
    4: [[0.33, 0.28], [0.67, 0.28], [0.33, 0.72], [0.67, 0.72]],
    5: [[0.33, 0.26], [0.67, 0.26], [0.5, 0.5], [0.33, 0.74], [0.67, 0.74]],
    6: [[0.33, 0.24], [0.67, 0.24], [0.33, 0.5], [0.67, 0.5], [0.33, 0.76], [0.67, 0.76]],
    7: [[0.33, 0.24], [0.67, 0.24], [0.5, 0.37], [0.33, 0.5], [0.67, 0.5], [0.33, 0.76], [0.67, 0.76]],
    8: [[0.33, 0.22], [0.67, 0.22], [0.5, 0.36], [0.33, 0.5], [0.67, 0.5], [0.5, 0.64], [0.33, 0.78], [0.67, 0.78]],
    9: [[0.33, 0.22], [0.67, 0.22], [0.33, 0.41], [0.67, 0.41], [0.5, 0.5], [0.33, 0.59], [0.67, 0.59], [0.33, 0.78], [0.67, 0.78]],
    10: [[0.33, 0.2], [0.67, 0.2], [0.5, 0.31], [0.33, 0.4], [0.67, 0.4], [0.33, 0.6], [0.67, 0.6], [0.5, 0.69], [0.33, 0.8], [0.67, 0.8]],
  };
  const card = (x, y, r, s, cw, ch) => {
    const col = (s === 1 || s === 2) ? '#c0392b' : '#0b0d12';
    const z = cw > 50 ? 6.6 : 4.3;
    const body = (PIPS[r] || PIPS[1]).map(([fx, fy]) =>
      `<path d="${suitPath(x + cw * fx, y + ch * fy, r === 1 ? z * 2 : z, s)}" fill="${col}"/>`).join('');
    const idx = `<path d="${suitPath(x + 7, y + 9, 3.4, s)}" fill="${col}"/>`;
    return `<g><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="#fdfcf9" stroke="rgba(20,22,28,0.30)"/>${idx}${body}</g>`;
  };
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const x = PAD + c * (CW + GAP), y = PAD + r * (CH + GAP);
      const cd = HANDS_DEMO[r][c];
      if (cd) p.push(card(x, y, cd.r, cd.s, CW, CH));
      else p.push(`<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="6" fill="rgba(0,0,0,0.14)" stroke="rgba(255,255,255,0.30)" stroke-dasharray="5 4"/>`);
    }
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}
function handsBoardEl() {
  const W = 14 * 2 + 40 * 5 + 6 * 4, H = 14 * 2 + 54 * 5 + 6 * 4;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'FIVE ACROSS, FIVE DOWN'),
    h('img', { key: 'bd', src: handsBoardDataURI(), width: W, height: H, style: { display: 'flex' } }),
  ]);
}
function buildHandsCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#7f1d1d 55%,#c0392b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Hands', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7f1d1d', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7f1d1d', margin: '16px 0 18px' } }),
      T('Everybody gets the same deal.', { fontSize: 33, fontWeight: 800, color: '#7f1d1d', letterSpacing: '-0.5px' }),
      T('The daily poker solitaire. Twenty five cards, one at a time, into a grid that scores as ten hands. A placed card never moves and you get one muck. Same shuffle for every player, so it ranks decisions, not luck.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/HANDS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, handsBoardEl()),
  ]);
}
export async function renderHandsCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildHandsCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Chain share card — snapshot of the game. The demo fragment is hand-made and
// is NOT in the bank, so it never spoils today. Evergreen. Drawn as one inline
// SVG data URI, the established pattern here.
//
// The board is a 3x5 endgame with six boxes already claimed and the safe edges
// nearly gone, which is the shape a player actually meets. The headline sells
// the trap rather than the rules: the free box is the thing that loses games.
const CHAIN_DEMO_H = [
  [1, 1, 1, 1, 1],
  [1, 1, 0, 0, 1],
  [1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1],
];
const CHAIN_DEMO_V = [
  [1, 1, 1, 0, 0, 1],
  [1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1],
];
// Who owns each completed box. Keyed "row,col"; every box listed here is
// complete under the arrays above, and no complete box is left out.
const CHAIN_DEMO_OWN = { '0,0': 1, '0,1': 2, '1,0': 1, '1,1': 2, '2,2': 1, '2,4': 2 };

function chainBoardDataURI() {
  const ROWS = 3, COLS = 5, CELL = 64, PAD = 20, LINE = 7, DOTR = 5.5;
  const W = COLS * CELL + PAD * 2, H = ROWS * CELL + PAD * 2;
  const px = (c) => PAD + c * CELL;
  const py = (r) => PAD + r * CELL;
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#fbf9fb"/>`);
  // claimed boxes, under the lines
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const own = CHAIN_DEMO_OWN[`${r},${c}`];
      if (!own) continue;
      p.push(`<rect x="${px(c) + 5}" y="${py(r) + 5}" width="${CELL - 10}" height="${CELL - 10}" rx="5" fill="${own === 1 ? '#f3e3f7' : '#eceae6'}"/>`);
      p.push(`<text x="${px(c) + CELL / 2}" y="${py(r) + CELL / 2 + 8}" text-anchor="middle" font-family="monospace" font-size="23" fill="${own === 1 ? '#4a044e' : '#8a837c'}">${own === 1 ? 'Y' : 'E'}</text>`);
    }
  }
  // horizontals, then verticals: drawn in ink, still-open ones as a faint rule
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const on = CHAIN_DEMO_H[r][c];
      p.push(`<rect x="${px(c)}" y="${py(r) - LINE / 2}" width="${CELL}" height="${LINE}" rx="${LINE / 2}" fill="${on ? '#43414a' : '#e6e1e8'}"/>`);
    }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS; c++) {
      const on = CHAIN_DEMO_V[r][c];
      p.push(`<rect x="${px(c) - LINE / 2}" y="${py(r)}" width="${LINE}" height="${CELL}" rx="${LINE / 2}" fill="${on ? '#43414a' : '#e6e1e8'}"/>`);
    }
  }
  for (let r = 0; r <= ROWS; r++) {
    for (let c = 0; c <= COLS; c++) p.push(`<circle cx="${px(c)}" cy="${py(r)}" r="${DOTR}" fill="#1c1e24"/>`);
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}

function chainBoardEl() {
  const W = 5 * 64 + 40, H = 3 * 64 + 40;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'YOUR MOVE, AND YOU ARE AHEAD'),
    h('img', { key: 'bd', src: chainBoardDataURI(), width: W, height: H, style: { display: 'flex' } }),
  ]);
}

function buildChainCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#4a044e 55%,#c084fc)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Chain', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4a044e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4a044e', margin: '16px 0 18px' } }),
      T('One edge wins. The free box is bait.', { fontSize: 33, fontWeight: 800, color: '#4a044e', letterSpacing: '-0.5px' }),
      T('The daily boxes endgame. The safe moves are gone, the count is in your favour, and exactly one edge keeps it. Take the wrong box and a perfect engine plays out the rest. Sundays go to a bigger board.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CHAIN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, chainBoardEl()),
  ]);
}

export async function renderChainCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildChainCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Turn share card — snapshot of the game. The demo position is a real, legal
// endgame produced by the same self-play walk the bank uses, then checked NOT
// to be any board in the bank, so it reads as a genuine position without ever
// spoiling a day someone still has to play. Evergreen. Drawn as one inline SVG
// data URI, the established pattern here.
//
// Ten squares left, black (you) ahead 34-20, five legal squares ringed. The
// headline sells the trap rather than the rules: the disc count is not the
// thing that decides an Othello endgame.
const TURN_DEMO_BOARD =
  '1111111211211121101111211122221111122111111212001022220002222000';
const TURN_DEMO_LEGAL = [41, 22, 14, 5, 6];   // b6 g3 g2 f1 g1

function turnBoardDataURI() {
  const CELL = 46, PAD = 10, GAP = 2;
  const W = 8 * CELL + PAD * 2, H = W;
  const at = (i) => PAD + i * CELL;
  const legal = new Set(TURN_DEMO_LEGAL);
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  p.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#2f5a29"/>`);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = r * 8 + c;
      const v = TURN_DEMO_BOARD[sq];
      const x = at(c), y = at(r);
      p.push(`<rect x="${x}" y="${y}" width="${CELL - GAP}" height="${CELL - GAP}" fill="#407637"/>`);
      const cx = x + (CELL - GAP) / 2, cy = y + (CELL - GAP) / 2, R = (CELL - GAP) * 0.38;
      if (v === '1') p.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#16181c"/>`);
      else if (v === '2') p.push(`<circle cx="${cx}" cy="${cy}" r="${R}" fill="#f5f2e9"/>`);
      else if (legal.has(sq)) p.push(`<circle cx="${cx}" cy="${cy}" r="${R * 0.34}" fill="#ffffff" fill-opacity="0.55"/>`);
    }
  }
  p.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(p.join('')).toString('base64');
}

function turnBoardEl() {
  const W = 8 * 46 + 20;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'YOUR MOVE, AND YOU ARE AHEAD'),
    h('img', { key: 'bd', src: turnBoardDataURI(), width: W, height: W, style: { display: 'flex' } }),
  ]);
}

function buildTurnCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#226218 55%,#8cda81)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Turn', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#226218', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#226218', margin: '16px 0 18px' } }),
      T('Ten squares left. One of them wins.', { fontSize: 33, fontWeight: 800, color: '#226218', letterSpacing: '-0.5px' }),
      T('The daily Othello endgame. The count is in your favor and exactly one square keeps it, solved to the last disc. Flip the whole row or flip one: only one of them holds, and there are no take-backs. Sundays leave two more squares.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/TURN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, turnBoardEl()),
  ]);
}

export async function renderTurnCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildTurnCard(), { ...size, fonts });
}

// ── Suffice ─────────────────────────────────────────────────────────────────
// The board element is an ABSTRACT item, not one from the bank, so the card can
// never spoil a live day: two blank statement bars and the five fixed choices.
function sufficeBoardEl() {
  const bar = (label, w) => h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 14 } }, [
    h('div', { key: 'n', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#4338ca', width: 40 } }, label),
    h('div', { key: 'b', style: { display: 'flex', width: w, height: 26, borderRadius: 8, background: '#dfe3ee' } }),
  ]);
  const pill = (k, on) => h('div', { key: k, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54, borderRadius: 12, marginRight: 10, fontSize: 26, fontWeight: 800, background: on ? '#4338ca' : '#e9ecf4', color: on ? '#ffffff' : '#8a92a3' } }, k);
  return h('div', { style: { display: 'flex', flexDirection: 'column', width: '470px', height: '400px', background: '#ffffff', borderRadius: 20, border: '3px solid #e2e6ef', padding: '34px 32px', justifyContent: 'center' } }, [
    h('div', { key: 'q', style: { display: 'flex', width: '300px', height: 30, borderRadius: 8, background: '#0b0d12', marginBottom: 26 } }),
    h('div', { key: 's1', style: { display: 'flex' } }, bar('(1)', '330px')),
    h('div', { key: 's2', style: { display: 'flex' } }, bar('(2)', '270px')),
    h('div', { key: 'ch', style: { display: 'flex', flexDirection: 'row', marginTop: 22 } }, ['A', 'B', 'C', 'D', 'E'].map((k) => pill(k, k === 'C'))),
  ]);
}

function buildSufficeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#4338ca 55%,#a5b4fc)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Suffice', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4338ca', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4338ca', margin: '16px 0 18px' } }),
      T('Eight questions you never answer.', { fontSize: 33, fontWeight: 800, color: '#4338ca', letterSpacing: '-0.5px' }),
      T('Each one comes with two statements, and the only thing you decide is whether they are enough to settle it. Working out the actual answer is wasted effort. Every item is proved by exhaustive check before it ships. Sundays run twelve.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SUFFICE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sufficeBoardEl()),
  ]);
}

export async function renderSufficeCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSufficeCard(), { ...size, fonts });
}

// ── Strata ──────────────────────────────────────────────────────────────────
// The board here is ABSTRACT and is not in the bank, so the card never spoils a
// day. It shows the one thing the game is about: a word lifting out of the grid
// and the column above it dropping into the hole.
function strataBoardEl() {
  const CELL = 62, GAP = 7, COLS = 5, ROWS = 5;
  const grid = [
    ['C', 'L', 'A', 'S', 'P'],
    ['R', 'A', 'W', 'N', 'E'],
    ['D', 'I', 'V', 'O', 'T'],
    ['M', 'E', 'S', 'H', 'B'],
    ['K', 'N', 'U', 'R', 'L'],
  ];
  const lit = new Set(['2,0', '2,1', '2,2', '2,3', '2,4']);   // the word going out
  const kids = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const on = lit.has(`${r},${c}`);
      kids.push(h('div', {
        key: `${r}-${c}`,
        style: {
          position: 'absolute',
          top: `${r * (CELL + GAP)}px`,
          left: `${c * (CELL + GAP)}px`,
          width: `${CELL}px`,
          height: `${CELL}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 800,
          borderRadius: 9,
          background: on ? '#15803d' : '#ffffff',
          color: on ? '#ffffff' : '#0b0d12',
          border: on ? '2px solid #15803d' : '2px solid #e2e5ea',
        },
      }, grid[r][c]));
    }
  }
  // the arrows that say "and now everything above this falls"
  for (let c = 0; c < COLS; c += 1) {
    kids.push(h('div', {
      key: `a-${c}`,
      style: {
        position: 'absolute',
        top: `${2 * (CELL + GAP) + CELL + 6}px`,
        left: `${c * (CELL + GAP) + CELL / 2 - 7}px`,
        width: '14px', height: '14px', display: 'flex',
        background: '#9a3412', borderRadius: '3px', opacity: 0.55,
      },
    }));
  }
  return h('div', {
    style: {
      position: 'relative',
      width: `${COLS * CELL + (COLS - 1) * GAP}px`,
      height: `${ROWS * CELL + (ROWS - 1) * GAP}px`,
      display: 'flex',
    },
  }, kids);
}

function buildStrataCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#9a3412 55%,#f4a06a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Strata', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#9a3412', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#9a3412', margin: '16px 0 18px' } }),
      T('Find a word, watch the board fall.', { fontSize: 33, fontWeight: 800, color: '#9a3412', letterSpacing: '-0.5px' }),
      T('Every letter belongs to one of the hidden words, and they are all members of a category you are not told. Take one out and the letters above it drop, which is the point: most of the day cannot be read until the grid has collapsed under it. Bigger board and two threads on Sundays.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/STRATA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, strataBoardEl()),
  ]);
}

export async function renderStrataCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildStrataCard(), { ...size, fonts });
}

// ── Redact ──────────────────────────────────────────────────────────────────
// The board element is an ABSTRACT redacted paragraph, not a day from the
// bank, so the card can never spoil a live article: rows of ink slabs with a
// few uncovered stand-in words and one amber fresh hit.
function redactBoardEl() {
  const slab = (w, color) => h('div', { style: { display: 'flex', width: w, height: 22, borderRadius: 5, background: color || '#18181b', marginRight: 10, marginBottom: 14 } });
  const word = (txt, hot) => h('div', { style: { display: 'flex', fontSize: 21, fontWeight: 700, color: hot ? '#7c2d12' : '#3f3f46', background: hot ? '#fef3c7' : 'transparent', borderRadius: 5, padding: hot ? '0 6px' : '0', marginRight: 10, marginBottom: 14, lineHeight: 1.1 } }, txt);
  const row = (kids) => h('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, kids);
  return h('div', { style: { display: 'flex', flexDirection: 'column', width: '470px', height: '400px', background: '#ffffff', borderRadius: 20, border: '3px solid #e2e6ef', padding: '34px 32px', justifyContent: 'center' } }, [
    h('div', { key: 't', style: { display: 'flex', width: '250px', height: 34, borderRadius: 7, background: '#18181b', marginBottom: 26 } }),
    h('div', { key: 'r1', style: { display: 'flex' } }, row([word('The'), slab('92px'), word('was'), slab('64px'), word('of'), slab('118px')])),
    h('div', { key: 'r2', style: { display: 'flex' } }, row([slab('74px'), word('in'), word('1912', true), word('and'), slab('96px')])),
    h('div', { key: 'r3', style: { display: 'flex' } }, row([word('its'), slab('128px'), word('became'), slab('58px')])),
    h('div', { key: 'r4', style: { display: 'flex' } }, row([slab('86px'), slab('66px'), word('the'), slab('102px')])),
  ]);
}

function buildRedactCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#27272a 55%,#b45309)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Redact', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#18181b', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#b45309', margin: '16px 0 18px' } }),
      T('An entire article, blacked out.', { fontSize: 33, fontWeight: 800, color: '#18181b', letterSpacing: '-0.5px' }),
      T('One story a day about one famous subject, every meaningful word hidden. Guess a word and it is uncovered everywhere it appears. Follow the shape of the sentences, close in, and name the subject. Sundays hide someone harder.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/REDACT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, redactBoardEl()),
  ]);
}

export async function renderRedactCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildRedactCard(), { ...size, fonts });
}

// ── Paths ───────────────────────────────────────────────────────────────────
// The board element is an ABSTRACT six by five lattice, not a day from the
// bank, so the card can never hand anyone a cheapest network. A tan ridge, a
// blue river with a jog in it, a depot, four towns, and a trunk line that
// crosses once and branches, which is the shape of a good answer.
function pathsBoardEl() {
  const L = (i) => 44 + i * 74;            // dot x
  const Tp = (j) => 52 + j * 74;           // dot y
  const dot = (i, j) => h('div', { key: `d${i}${j}`, style: { display: 'flex', position: 'absolute', left: L(i) - 3, top: Tp(j) - 3, width: 6, height: 6, borderRadius: 3, background: '#b9c1cf' } });
  const hRun = (i, j, len, color, w) => h('div', { key: `h${i}${j}${len}${color || ''}`, style: { display: 'flex', position: 'absolute', left: L(i), top: Tp(j) - (w || 7) / 2, width: 74 * len, height: w || 7, borderRadius: 4, background: color || '#233a63' } });
  const vRun = (i, j, len, color, w) => h('div', { key: `v${i}${j}${len}${color || ''}`, style: { display: 'flex', position: 'absolute', left: L(i) - (w || 7) / 2, top: Tp(j), width: w || 7, height: 74 * len, borderRadius: 4, background: color || '#233a63' } });
  const town = (i, j, ch) => h('div', { key: `t${ch}`, style: { display: 'flex', position: 'absolute', left: L(i) - 16, top: Tp(j) - 16, width: 32, height: 32, borderRadius: 16, background: '#15803d', color: '#ffffff', fontSize: 16, fontWeight: 800, alignItems: 'center', justifyContent: 'center' } }, ch);
  const kids = [];
  // terrain first, so the track paints over it
  kids.push(h('div', { key: 'ridge', style: { display: 'flex', position: 'absolute', left: L(2) - 30, top: Tp(0) - 26, width: 134, height: 122, borderRadius: 26, background: '#e6dcc6' } }));
  kids.push(h('div', { key: 'riv1', style: { display: 'flex', position: 'absolute', left: L(1) + 34, top: 0, width: 9, height: 190, borderRadius: 4, background: '#bfdbfe' } }));
  kids.push(h('div', { key: 'riv2', style: { display: 'flex', position: 'absolute', left: L(1) + 34, top: 181, width: 87, height: 9, borderRadius: 4, background: '#bfdbfe' } }));
  kids.push(h('div', { key: 'riv3', style: { display: 'flex', position: 'absolute', left: L(2) + 43, top: 181, width: 9, height: 219, borderRadius: 4, background: '#bfdbfe' } }));
  for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) kids.push(dot(i, j));
  // the lattice itself, faint
  for (let j = 0; j < 5; j++) kids.push(hRun(0, j, 5, '#e4e8ef', 2));
  for (let i = 0; i < 6; i++) kids.push(vRun(i, 0, 4, '#e4e8ef', 2));
  // the network: one trunk, one crossing, three branches
  kids.push(hRun(0, 1, 2));
  kids.push(vRun(2, 1, 1));
  kids.push(hRun(2, 2, 2));
  kids.push(vRun(4, 2, 2));
  kids.push(vRun(0, 1, 2));
  kids.push(hRun(0, 3, 1));
  kids.push(town(0, 1, 'A'));
  kids.push(town(4, 2, 'B'));
  kids.push(town(1, 3, 'C'));
  kids.push(town(4, 4, 'D'));
  kids.push(h('div', { key: 'depot', style: { display: 'flex', position: 'absolute', left: L(2) - 17, top: Tp(2) - 17, width: 34, height: 34, borderRadius: 10, background: '#0b0d12', color: '#ffffff', alignItems: 'center', justifyContent: 'center' } }, h('div', { key: 'dp', style: { display: 'flex', width: 13, height: 13, borderRadius: 4, background: '#ffffff' } })));
  return h('div', { style: { display: 'flex', position: 'relative', width: '470px', height: '400px', background: '#ffffff', borderRadius: 20, border: '3px solid #e2e6ef' } }, kids);
}

function buildPathsCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#065f46 55%,#34d399)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Paths', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#065f46', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#34d399', margin: '16px 0 18px' } }),
      T('Link every town. Cheaply.', { fontSize: 33, fontWeight: 800, color: '#065f46', letterSpacing: '-0.5px' }),
      T('One depot, eight towns, a river and two ridges. Lay track until they all connect, and pay as little as you can. Every board carries a proven cheapest network, so a perfect score is real.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/PATHS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, pathsBoardEl()),
  ]);
}

export async function renderPathsCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildPathsCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Deep share card. The demo topic and question are NOT in the bank.
const DEEP_DEMO = {
  topic: 'THE TITANIC',
  q: 'Which port was the ship sailing to when she sank?',
  choices: ['Boston', 'New York', 'Halifax', 'Montreal'],
};
function deepBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0d12' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T(DEEP_DEMO.topic, { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0c4a6e', borderRadius: 7, padding: '5px 11px' }),
      T('ROUND 4 OF 5', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(DEEP_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0d12', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, DEEP_DEMO.choices.map(row)),
  ]);
}
function buildDeepCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#0c4a6e 55%,#7dd3fc)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Deep', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0c4a6e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0c4a6e', margin: '16px 0 18px' } }),
      T('One topic. Fifteen questions.', { fontSize: 33, fontWeight: 800, color: '#0c4a6e', letterSpacing: '-0.5px' }),
      T('A new subject every day, and the questions get harder the further down you go. Twenty seconds each, one life, and your score is simply how deep you got.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/DEEP', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, deepBoardEl()),
  ]);
}

export async function renderDeepCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildDeepCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Blitz share card. The demo problem is NOT in the bank, so the card can never
// hand anyone a live answer. Its four options are built the way the bank builds
// them: 47 x 6 = 282, with 272 (a dropped carry, and the option that closes the
// last-digit sieve), 384 (48 x 8, a slipped multiple) and 292 alongside.
const BLITZ_DEMO = {
  q: '47 x 6',
  choices: ['272', '282', '292', '384'],
};
function blitzBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const cell = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '172px', border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '13px 10px', margin: '0 5px 10px 5px', background: '#fff',
    },
  }, [
    T(String(i + 1), { fontSize: 14, fontWeight: 800, color: '#9ca3af', marginRight: 10 }),
    T(txt, { fontSize: 27, fontWeight: 700, color: '#0b0d12' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 18px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 6 } }, [
      T('ROUND 3 OF 5', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a' }),
      T('15s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#fff', background: '#657512', borderRadius: 7, padding: '5px 11px', marginLeft: 14 }),
    ]),
    T(BLITZ_DEMO.q, { fontSize: 62, fontWeight: 700, color: '#0b0d12', letterSpacing: '-2px', justifyContent: 'center', width: '364px', margin: '10px 0 20px' }),
    h('div', { key: 'r1', style: { display: 'flex', flexDirection: 'row' } }, [cell(BLITZ_DEMO.choices[0], 0), cell(BLITZ_DEMO.choices[1], 1)]),
    h('div', { key: 'r2', style: { display: 'flex', flexDirection: 'row' } }, [cell(BLITZ_DEMO.choices[2], 2), cell(BLITZ_DEMO.choices[3], 3)]),
  ]);
}
function buildBlitzCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#657512 55%,#c3d94a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Blitz', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#657512', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#657512', margin: '16px 0 18px' } }),
      T('Twenty problems. One life.', { fontSize: 33, fontWeight: 800, color: '#657512', letterSpacing: '-0.5px' }),
      T('Mental arithmetic against the clock, climbing from the times tables to two-digit multiplication and cubes. Fifteen seconds a problem, no calculator, and one wrong answer ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE - MINDLOFTDAILY.COM/BLITZ', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, blitzBoardEl()),
  ]);
}

export async function renderBlitzCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildBlitzCard(), { ...size, fonts });
}

// ── Anon ─────────────────────────────────────────────────────────────────────────
// The board element is an ABSTRACT acrostic head with INVENTED prose beneath
// it, not a day from the bank, so the card can never hand anyone the author or
// a single answer: a row of initial boxes with three filled, over the opening
// lines of an unsigned passage and the blank byline it is missing.
function anonBoardEl() {
  const box = (ch, i) => h('div', { key: `b${i}`, style: { display: 'flex', width: 46, height: 56, borderRadius: 9, border: ch ? '3px solid #8c2f39' : '3px solid #e2e6ef', background: ch ? '#8c2f39' : '#ffffff', color: '#ffffff', fontSize: 25, fontWeight: 800, alignItems: 'center', justifyContent: 'center', marginRight: 9 } }, ch || '');
  const line = (txt, w) => h('div', { key: `l${w}`, style: { display: 'flex', fontSize: 20, fontWeight: 600, color: '#646c7a', lineHeight: 1.1, maxWidth: w, marginBottom: 11 } }, txt);
  return h('div', { style: { display: 'flex', flexDirection: 'column', width: '470px', height: '400px', background: '#ffffff', borderRadius: 20, border: '3px solid #e2e6ef', padding: '32px 30px', justifyContent: 'center' } }, [
    h('div', { key: 'row', style: { display: 'flex', flexDirection: 'row', marginBottom: 28 } }, [
      box('', 0), box('W', 1), box('', 2), box('T', 3), box('', 4), box('', 5), box('R', 6),
    ]),
    line('The road bent away from the river, and for a', 410),
    line('mile or more nobody in the cart said anything', 410),
    line('at all.', 410),
    h('div', { key: 'rule', style: { display: 'flex', width: '210px', height: '3px', background: '#e2e6ef', margin: '16px 0 13px' } }),
    h('div', { key: 'sig', style: { display: 'flex', fontSize: 22, fontWeight: 800, color: '#8c2f39' } }, '— ?'),
  ]);
}

function buildAnonCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#8c2f39 55%,#e8969f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '545px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Anon', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#8c2f39', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#e8969f', margin: '16px 0 18px' } }),
      T('A clueless acrostic.', { fontSize: 33, fontWeight: 800, color: '#8c2f39', letterSpacing: '-0.5px' }),
      T("One unsigned passage a day, and a bank of answers built from its own letters. Work them out, read the first letter of each one down the column, and it spells whoever wrote it. Sundays run a longer passage.", { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 530 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/ANON', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, anonBoardEl()),
  ]);
}

export async function renderAnonCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildAnonCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Blocks share card. The demo well is 9 columns wide, a width the bank never
// deals (weekdays are 10, Sundays 8), so the evergreen card can never be
// mistaken for a real day's board. Shades are the game's own single-hue ramp.
const BLOCKS_DEMO = {
  cols: 9,
  rows: 11,
  // stack: [row, col, lightness]
  stack: [
    [7, 0, 74], [7, 1, 74], [7, 2, 64], [7, 5, 49], [7, 6, 49], [7, 7, 36], [7, 8, 36],
    [8, 0, 59], [8, 1, 59], [8, 2, 64], [8, 3, 64], [8, 5, 49], [8, 6, 44], [8, 7, 44], [8, 8, 36],
    [9, 0, 69], [9, 1, 69], [9, 2, 54], [9, 3, 64], [9, 4, 27], [9, 5, 27], [9, 6, 44], [9, 7, 74], [9, 8, 74],
    [10, 0, 69], [10, 1, 69], [10, 2, 54], [10, 3, 54], [10, 4, 27], [10, 5, 49], [10, 6, 44], [10, 7, 74], [10, 8, 74],
  ],
  // the shape in the air, plus its landing shadow
  live: [[1, 4, 27], [2, 3, 27], [2, 4, 27], [2, 5, 27], [3, 4, 27]],
  ghost: [[4, 4], [5, 3], [5, 4], [5, 5], [6, 4]],
};
function blocksBoardEl() {
  const CELL = 40, PAD = 16;
  const { cols, rows } = BLOCKS_DEMO;
  const W = cols * CELL + PAD * 2, H = rows * CELL + PAD * 2;
  const kids = [];
  const tile = (key, r, c, l, opts) => {
    const o = opts || {};
    kids.push(h('div', {
      key,
      style: {
        position: 'absolute', left: PAD + c * CELL + 2, top: PAD + r * CELL + 2,
        width: CELL - 5, height: CELL - 5, borderRadius: 6, display: 'flex',
        background: o.ghost ? 'transparent' : `hsl(217,91%,${l}%)`,
        border: o.ghost ? `3px solid hsl(217,91%,60%)` : `2px solid hsl(217,91%,${Math.max(14, l - 18)}%)`,
        opacity: o.ghost ? 0.34 : 1,
      },
    }));
  };
  BLOCKS_DEMO.stack.forEach(([r, c, l], i) => tile(`s${i}`, r, c, l));
  BLOCKS_DEMO.ghost.forEach(([r, c], i) => tile(`g${i}`, r, c, 60, { ghost: true }));
  BLOCKS_DEMO.live.forEach(([r, c, l], i) => tile(`l${i}`, r, c, l));
  return h('div', {
    style: {
      position: 'relative', display: 'flex', width: `${W}px`, height: `${H}px`,
      background: '#fff', border: '3px solid #93b4f0', borderRadius: 16,
    },
  }, kids);
}
function buildBlocksCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#1d4ed8 55%,#93b4f0)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '585px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Blocks', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#1d4ed8', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#93b4f0', margin: '16px 0 18px' } }),
      T('Same shapes, same order, everybody.', { fontSize: 33, fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }),
      T('A short well that never speeds up, so a run ends on a hole you left three shapes ago. Play as many runs as you like and your best one takes the board. Sundays narrow the well.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 560 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/BLOCKS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, blocksBoardEl()),
  ]);
}

export async function renderBlocksCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildBlocksCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Chomp share card. The demo board is 9x9 and carries four pellets, a shape the
// bank never deals (a real board is 7x7 and carries six to eight mascots), so the
// evergreen card can never be mistaken for a day's puzzle and can never hand
// anyone a route. The pellets are drawn as plain numbered discs rather than the
// mascot art: Satori would have to inline seven PNGs for a card nobody reads at
// that level of detail.
const CHOMP_DEMO = {
  n: 9,
  // head first, so index 0 is the mouth and the rest fades back down the tail
  body: [[5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 5], [5, 5], [6, 5], [6, 4]],
  pellets: [[7, 3], [1, 1], [7, 7], [1, 7]],
};
function chompBoardEl() {
  const CELL = 42, PAD = 14, N = CHOMP_DEMO.n;
  const W = N * CELL + PAD * 2, H = N * CELL + PAD * 2;
  const kids = [];
  for (let i = 1; i < N; i++) {
    kids.push(h('div', { key: `v${i}`, style: { position: 'absolute', left: PAD + i * CELL, top: PAD + 6, width: '1px', height: `${N * CELL - 12}px`, background: '#eef1f5', display: 'flex' } }));
    kids.push(h('div', { key: `hz${i}`, style: { position: 'absolute', left: PAD + 6, top: PAD + i * CELL, width: `${N * CELL - 12}px`, height: '1px', background: '#eef1f5', display: 'flex' } }));
  }
  CHOMP_DEMO.body.forEach(([c, r], i) => {
    if (i === 0) return;   // the head is drawn after the tail, below
    const t = (i - 1) / (CHOMP_DEMO.body.length - 2);
    const pad = 4 + t * 3;
    kids.push(h('div', {
      key: `b${i}`,
      style: {
        position: 'absolute', left: PAD + c * CELL + pad, top: PAD + r * CELL + pad,
        width: CELL - pad * 2, height: CELL - pad * 2, borderRadius: 9, display: 'flex',
        background: '#a8430f', opacity: 0.92 - t * 0.5,
      },
    }));
  });
  // The head: a dark circle with a wedge of jaw bitten out of the leading edge.
  // Satori has no arc primitive, so the wedge is a board-coloured square turned
  // 45 degrees and hung off the front of the circle, which cuts the same notch.
  {
    const [c, r] = CHOMP_DEMO.body[0];
    const D = CELL - 5;
    kids.push(h('div', {
      key: 'head',
      style: {
        position: 'absolute', left: PAD + c * CELL + 2.5, top: PAD + r * CELL + 2.5,
        width: D, height: D, borderRadius: D, background: '#3f8f3f', display: 'flex',
      },
    }));
    kids.push(h('div', {
      key: 'jaw',
      style: {
        position: 'absolute', left: PAD + c * CELL + CELL * 0.60, top: PAD + r * CELL + CELL * 0.5 - CELL * 0.30,
        width: CELL * 0.60, height: CELL * 0.60, background: '#fff', display: 'flex',
        transform: 'rotate(45deg)',
      },
    }));
    kids.push(h('div', {
      key: 'eye',
      style: {
        position: 'absolute', left: PAD + c * CELL + CELL * 0.30, top: PAD + r * CELL + CELL * 0.20,
        width: CELL * 0.24, height: CELL * 0.24, borderRadius: CELL, background: '#fff', display: 'flex',
      },
    }));
  }
  CHOMP_DEMO.pellets.forEach(([c, r], i) => {
    const next = i === 0;
    kids.push(h('div', {
      key: `p${i}`,
      style: {
        position: 'absolute', left: PAD + c * CELL + 6, top: PAD + r * CELL + 6,
        width: CELL - 12, height: CELL - 12, borderRadius: CELL, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: next ? '#a8430f' : 'transparent',
        border: next ? '2px solid #a8430f' : '2px solid #c4ccd8',
        color: next ? '#fff' : '#8d97a6', fontSize: 19, fontWeight: 800,
      },
    }, String(i + 1)));
  });
  return h('div', {
    style: {
      position: 'relative', display: 'flex', width: `${W}px`, height: `${H}px`,
      background: '#fff', border: '3px solid #f0c4a8', borderRadius: 16,
    },
  }, kids);
}
function buildChompCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#a8430f 55%,#f0c4a8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '565px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Chomp', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#a8430f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#f0c4a8', margin: '16px 0 18px' } }),
      T('Eat them in order. Mind your trail.', { fontSize: 33, fontWeight: 800, color: '#a8430f', letterSpacing: '-0.5px' }),
      T('Seven mascots, one board, and a trail that never goes away. Nothing chases you and nothing is on a clock. The only thing in your way is where you have already been.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CHOMP', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, chompBoardEl()),
  ]);
}

export async function renderChompCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildChompCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Sweep share card. The demo field is a hand-drawn 9x11 fragment that is NOT
// from the bank and does not obey the solver, so the evergreen card can never
// hand anyone a real day's read. Numbers use the game's own palette.
const SWEEP_DEMO = {
  cols: 9, rows: 11,
  // [row, col, cell]: a digit 1-8, 0 for an opened blank, 'F' for a flag,
  // 'M' for the one that ends it. Anything unlisted stays covered.
  cells: [
    [0, 0, 0], [0, 1, 0], [0, 2, 0], [0, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 0], [0, 7, 0], [0, 8, 0],
    [1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 3, 1], [1, 4, 'F'], [1, 5, 1], [1, 6, 0], [1, 7, 1], [1, 8, 1],
    [2, 0, 1], [2, 1, 1], [2, 2, 1], [2, 3, 1], [2, 4, 2], [2, 5, 2], [2, 6, 1], [2, 7, 1], [2, 8, 'F'],
    [3, 0, 1], [3, 1, 'F'], [3, 2, 1], [3, 3, 0], [3, 4, 1], [3, 5, 'F'], [3, 6, 1], [3, 7, 2], [3, 8, 2],
    [4, 0, 2], [4, 1, 2], [4, 2, 2], [4, 3, 1], [4, 4, 2], [4, 5, 2], [4, 6, 2], [4, 7, 1], [4, 8, 'F'],
    [5, 0, 1], [5, 1, 'F'], [5, 2, 2], [5, 3, 'F'], [5, 4, 2], [5, 5, 1], [5, 6, 'F'], [5, 7, 2], [5, 8, 2],
    [6, 0, 1], [6, 1, 2], [6, 2, 3], [6, 3, 2], [6, 4, 3], [6, 5, 2], [6, 6, 2], [6, 7, 2], [6, 8, 1],
    [7, 2, 1], [7, 3, 1], [7, 4, 2], [7, 5, 'F'], [7, 6, 1],
  ],
};
const SWEEP_NUM = ['#94a3b8', '#2563eb', '#15803d', '#c0392b', '#233a63', '#a16207', '#0e7490', '#0b0d12', '#6b7280'];
function sweepBoardEl() {
  const CELL = 40, PAD = 14;
  const { cols, rows } = SWEEP_DEMO;
  const W = cols * CELL + PAD * 2, H = rows * CELL + PAD * 2;
  const map = new Map(SWEEP_DEMO.cells.map(([r, c, v]) => [`${r},${c}`, v]));
  const kids = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const v = map.get(`${r},${c}`);
    const open = v !== undefined && v !== 'F';
    const flag = v === 'F';
    kids.push(h('div', {
      key: `${r},${c}`,
      style: {
        position: 'absolute', left: PAD + c * CELL + 2, top: PAD + r * CELL + 2,
        width: CELL - 5, height: CELL - 5, borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 800,
        background: flag ? '#fde68a' : open ? '#fff' : '#c9d2e2',
        color: flag ? '#a16207' : SWEEP_NUM[Number(v) || 0],
        border: open ? '2px solid #e5e7eb' : '2px solid #b7c2d6',
      },
    }, flag ? '⚑' : (open && v ? String(v) : '')));
  }
  return h('div', {
    style: {
      position: 'relative', display: 'flex', width: `${W}px`, height: `${H}px`,
      background: '#eef1f6', border: '3px solid #0f766e', borderRadius: 16,
    },
  }, kids);
}
function buildSweepCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#0f766e 55%,#7fd1c6)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Sweep', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f766e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7fd1c6', margin: '16px 0 18px' } }),
      T('Minesweeper with no bottom edge.', { fontSize: 33, fontWeight: 800, color: '#0f766e', letterSpacing: '-0.5px' }),
      T('The same field for everybody, and every field is checked before it ships, so it can always be solved without a guess. One life a run, unlimited runs, and your best one takes the board.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 575 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SWEEP', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sweepBoardEl()),
  ]);
}

export async function renderSweepCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSweepCard(), { ...size, fonts });
}

// ─────────────────────────── Docket ──────────────────────────────────────────
// The board on the card is a deliberately NEUTRAL demo: five slots and three
// conditions, a shape the bank never ships (weekdays run six or seven entities),
// so the share card cannot leak or resemble a real day's puzzle.
const DOCKET_INK = '#5b2333';
const DOCKET_SOFT = '#c9a3ae';

function docketBoardEl() {
  const slots = ['C', 'A', '', 'E', ''];
  const conds = ['A is heard before E', 'C is heard first', 'D and B are not consecutive'];
  return h('div', {
    style: {
      display: 'flex', flexDirection: 'column', width: '430px',
      background: '#fff', border: `3px solid ${DOCKET_SOFT}`, borderRadius: 16, padding: '26px 24px',
    },
  }, [
    h('div', { key: 'eyebrow', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: DOCKET_INK, marginBottom: 16 } }, 'THE DOCKET'),
    // the row of slots
    h('div', { key: 'slots', style: { display: 'flex', flexDirection: 'row' } },
      slots.map((s, i) => h('div', {
        key: `s${i}`,
        style: {
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: i === slots.length - 1 ? 0 : 10,
        },
      }, [
        h('div', {
          key: 'box',
          style: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '62px', height: '62px', borderRadius: 10,
            background: s ? DOCKET_INK : '#f7f8fa',
            border: s ? `2px solid ${DOCKET_INK}` : `2px dashed ${DOCKET_SOFT}`,
            color: s ? '#fff' : DOCKET_SOFT, fontSize: 30, fontWeight: 800,
          },
        }, s || '?'),
        h('div', { key: 'n', style: { display: 'flex', fontSize: 15, fontWeight: 700, color: '#9aa1ad', marginTop: 7 } }, String(i + 1)),
      ]))),
    h('div', { key: 'rule', style: { display: 'flex', width: '100%', height: '2px', background: '#eceef2', margin: '20px 0 16px' } }),
    // the conditions
    ...conds.map((c, i) => h('div', {
      key: `c${i}`,
      style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', marginBottom: i === conds.length - 1 ? 0 : 10 },
    }, [
      h('div', { key: 'n', style: { display: 'flex', fontSize: 18, fontWeight: 800, color: DOCKET_INK, marginRight: 9 } }, `(${i + 1})`),
      h('div', { key: 't', style: { display: 'flex', fontSize: 18, fontWeight: 600, color: '#4a5160', lineHeight: 1.25 } }, c),
    ])),
  ]);
}

function buildDocketCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: `linear-gradient(90deg,#0b0d12,${DOCKET_INK} 55%,${DOCKET_SOFT})` } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '600px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Docket', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: DOCKET_INK, borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: DOCKET_SOFT, margin: '16px 0 18px' } }),
      T('One setup. Five deductions.', { fontSize: 33, fontWeight: 800, color: DOCKET_INK, letterSpacing: '-0.5px' }),
      T('A small world, a few conditions, and five questions about what those conditions force. The reasoning section a well known standardized test ran for decades, then retired. Every answer proved by exhaustive enumeration before it ships.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 575 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/DOCKET', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, docketBoardEl()),
  ]);
}

export async function renderDocketCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildDocketCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Barter share card — snapshot of the game. The demo lattice is NOT in the
// bank (sedan/organ/meaty across, storm/dogma/nanny down), so it never spoils
// a real day; two tiles are shown mid-trade in yellow. Evergreen.
function barterBoardEl() {
  const CELL = 52, GAP = 7
  // [letter, state] per cell; state g=green y=yellow w=grey, '.'=hole
  const rows = [
    [['S','g'],['R','y'],['D','w'],['A','w'],['N','g']],
    [['T','w'],null,['O','g'],null,['A','w']],
    [['O','w'],['E','y'],['G','g'],['A','w'],['N','w']],
    [['R','g'],null,['M','w'],null,['N','w']],
    [['M','w'],['E','g'],['A','w'],['T','w'],['Y','g']],
  ]
  const tile = (cell, j) => {
    if (!cell) return h('div', { key: `h${j}`, style: { width: CELL, height: CELL, display: 'flex' } })
    const [ch, st] = cell
    const bg = st === 'g' ? '#15803d' : st === 'y' ? '#e9b949' : '#fff'
    const ink = st === 'g' ? '#fff' : '#0b0d12'
    const border = st === 'w' ? '2.5px solid #b9bfcc' : '2.5px solid transparent'
    return h('div', { key: `t${j}`, style: {
      width: CELL, height: CELL, borderRadius: 10, background: bg, color: ink, border,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 27, fontWeight: 800,
    } }, ch)
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'TRADE TWO TILES AT A TIME'),
    h('div', { key: 'bd', style: { display: 'flex', flexDirection: 'column' } },
      rows.map((row, i) => h('div', { key: `r${i}`, style: { display: 'flex', marginTop: i ? GAP : 0 } },
        row.map((cell, j) => h('div', { key: `c${j}`, style: { display: 'flex', marginLeft: j ? GAP : 0 } }, tile(cell, j))))),
    ),
  ])
}
function buildBarterCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt)
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#be123c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Barter', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#be123c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#be123c', margin: '16px 0 18px' } }),
      T('Trade the letters home.', { fontSize: 33, fontWeight: 800, color: '#be123c', letterSpacing: '-0.5px' }),
      T('Six words interlock, and every letter they need is already on the board. Trade two tiles at a time against a proven par: green locks, yellow belongs in a crossing word. Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE \u00b7 MINDLOFTDAILY.COM/BARTER', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, barterBoardEl()),
  ])
}

export async function renderBarterCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)])
  const any = w8 || w7 || w6
  const loaded = { 800: w8, 700: w7, 600: w6 }
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : []
  return new ImageResponse(buildBarterCard(), { ...size, fonts })
}

// ---------------------------------------------------------------------------
// Plot share card — snapshot of the game. The demo board is 6x6, a size that is
// NOT in the bank (weekdays are 10x10, Sundays 12x12), so it never spoils
// today. Evergreen.
function plotBoardEl() {
  const CELL = 52, N = 6;
  // [row, col, width, height] — a complete tiling of the 6x6
  const rects = [
    [0, 0, 3, 1], [0, 3, 3, 1], [1, 0, 1, 2], [1, 1, 2, 2], [1, 3, 3, 2],
    [3, 0, 2, 2], [3, 2, 1, 2], [3, 3, 3, 1], [4, 3, 3, 1], [5, 0, 6, 1],
  ];
  const clues = [[0, 1, 3], [0, 4, 3], [1, 0, 2], [2, 1, 4], [1, 4, 6], [3, 0, 4], [4, 2, 2], [3, 4, 3], [4, 3, 3], [5, 2, 6]];
  const tint = [
    ['#e8eef7', '#2f4f7a'], ['#efe9f6', '#4b3f6e'], ['#e6f2ec', '#2f6350'],
    ['#f7ece8', '#7a4030'], ['#f2eee2', '#5f5636'], ['#e9f0f2', '#31585f'],
  ];
  const own = Array.from({ length: N }, () => Array(N).fill(-1));
  rects.forEach((R, i) => {
    for (let r = R[0]; r < R[0] + R[3]; r++) for (let c = R[1]; c < R[1] + R[2]; c++) own[r][c] = i;
  });
  const clueAt = {};
  for (const [r, c, v] of clues) clueAt[`${r},${c}`] = v;
  const edge = (a, b) => (a !== b ? 3 : 1);
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: N }, (_, c) => {
      const id = own[r][c];
      const pair = tint[id % tint.length];
      const up = r === 0 ? -2 : own[r - 1][c];
      const left = c === 0 ? -2 : own[r][c - 1];
      const down = r === N - 1 ? -2 : own[r + 1][c];
      const right = c === N - 1 ? -2 : own[r][c + 1];
      const v = clueAt[`${r},${c}`];
      return h('div', { key: `${r},${c}`, style: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: CELL, height: CELL, background: pair[0],
        borderTop: `${edge(id, up)}px solid ${edge(id, up) === 3 ? pair[1] : 'rgba(28,30,36,0.14)'}`,
        borderLeft: `${edge(id, left)}px solid ${edge(id, left) === 3 ? pair[1] : 'rgba(28,30,36,0.14)'}`,
        borderBottom: `${edge(id, down)}px solid ${edge(id, down) === 3 ? pair[1] : 'rgba(28,30,36,0.14)'}`,
        borderRight: `${edge(id, right)}px solid ${edge(id, right) === 3 ? pair[1] : 'rgba(28,30,36,0.14)'}`,
        fontSize: 24, fontWeight: 800, color: pair[1],
      } }, v === undefined ? '' : String(v));
    }));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'EVERY NUMBER IS THE SIZE OF ITS PLOT'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: N }, (_, r) => rowEl(r))),
  ]);
}
function buildPlotCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#78350f)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Plot', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#78350f', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#78350f', margin: '16px 0 18px' } }),
      T('Divide the whole board.', { fontSize: 33, fontWeight: 800, color: '#78350f', letterSpacing: '-0.5px' }),
      T('The daily rectangle puzzle. Every number is the size of the plot it belongs to, and every plot holds exactly one number. One solution, pure deduction, no guessing, and Sundays go bigger.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/PLOT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, plotBoardEl()),
  ]);
}

export async function renderPlotCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildPlotCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Sixes share card — snapshot of the game. The demo grid is a throwaway 6x6
// board generated from a seed of its own and checked against the shipped bank
// (no solution grid and no clue pattern in common), so it can never spoil a
// day. It is shown part-solved: twelve squares blanked in a 180-symmetric mask
// that leaves exactly two blanks per row, per column and per box, so the
// picture reads as a sudoku in progress however you scan it. Evergreen.
function sixesBoardEl() {
  const CELL = 62, FS = 34;
  const demo = [
    [6, 0, 1, 4, 0, 5],
    [0, 3, 4, 2, 1, 0],
    [3, 6, 0, 0, 5, 4],
    [4, 1, 0, 0, 2, 3],
    [0, 4, 3, 5, 6, 0],
    [1, 0, 6, 3, 0, 2],
  ];
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: v ? '#fff' : '#fbfbfc',
      border: '1px solid rgba(28,30,36,0.22)',
      // a box is 3 wide and 2 tall, so the heavy gaps fall after column 2 and
      // after rows 1 and 3
      marginRight: c === 2 ? 6 : 0,
      marginBottom: (r === 1 || r === 3) ? 6 : 0,
      fontSize: FS, fontWeight: 700, color: '#0b0d12',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 6 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '22px 22px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'EVERY ROW, COLUMN & BOX HOLDS 1–6'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, Array.from({ length: 6 }, (_, r) => rowEl(r))),
  ]);
}
function buildSixesCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#1d4ed8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Sixes', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#1d4ed8', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1d4ed8', margin: '16px 0 18px' } }),
      T('The daily mini sudoku.', { fontSize: 33, fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }),
      T('Fill the 6×6 grid so every row, column, and box holds 1–6 exactly once. One logical solution and about two minutes, so nothing counts against you and the clock decides the day.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SIXES', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sixesBoardEl()),
  ]);
}

export async function renderSixesCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSixesCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Niche share card — snapshot of the game. The demo board is a throwaway 3x3
// (invented headers, two filled cells, one of them the gold rare find), so it
// can never spoil a day. Evergreen.
function nicheBoardEl() {
  const CELLW = 128, HEADH = 44, GAP = 7;
  const TEAL = '#115e59', TEALSOFT = '#ecfdf8', TEALTINT = '#cdf0e8', GOLD = '#e8b43a', GOLDSOFT = '#fff7e6';
  const headEl = (txt, key, vertical) => h('div', { key, style: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    width: vertical ? HEADH + 46 : CELLW, height: vertical ? CELLW : HEADH,
    background: TEALTINT, borderRadius: 8, color: '#0b3f3b',
    fontSize: 15, fontWeight: 800, lineHeight: 1.1, padding: '0 6px',
  } }, txt);
  const cellEl = (key, kind, txt, sub) => h('div', { key, style: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: CELLW, height: 74, borderRadius: 10,
    background: kind === 'gold' ? GOLDSOFT : kind === 'fill' ? TEALSOFT : '#ffffff',
    border: kind === 'gold' ? `3px solid ${GOLD}` : '2px solid rgba(28,30,36,0.18)',
  } }, [
    h('div', { key: 't', style: { display: 'flex', fontSize: txt === '+' ? 26 : 17, fontWeight: 800, color: txt === '+' ? '#c3c8d1' : '#0b0d12' } }, txt),
    sub ? h('div', { key: 's', style: { display: 'flex', fontSize: 12, fontWeight: 700, color: kind === 'gold' ? '#8a6415' : '#646c7a' } }, sub) : null,
  ]);
  const row = (key, kids) => h('div', { key, style: { display: 'flex', flexDirection: 'row', gap: GAP } }, kids);
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: GAP, background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 6 } }, 'EVERY CELL FITS ITS ROW AND ITS COLUMN'),
    row('r0', [
      h('div', { key: 'corner', style: { display: 'flex', width: HEADH + 46, height: HEADH } }),
      headEl('Landlocked', 'c1'), headEl('Island nation', 'c2'), headEl('Borders Brazil', 'c3'),
    ]),
    row('r1', [headEl('In Europe', 'h1', true), cellEl('a', 'fill', 'Switzerland', '34% picked'), cellEl('b', '', '+'), cellEl('c', '', '+')]),
    row('r2', [headEl('In Asia', 'h2', true), cellEl('d', '', '+'), cellEl('e', 'gold', 'Bahrain', '2% rare find'), cellEl('f', '', '+')]),
    row('r3', [headEl('In South America', 'h3', true), cellEl('g', '', '+'), cellEl('i', '', '+'), cellEl('j', 'fill', 'Bolivia', '41% picked')]),
  ]);
}
function buildNicheCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 56px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#115e59 55%,#e8b43a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '530px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Niche', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#115e59', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#115e59', margin: '16px 0 18px' } }),
      T('The daily trivia grid.', { fontSize: 33, fontWeight: 800, color: '#115e59', letterSpacing: '-0.5px' }),
      T('Fill the grid with answers that fit both their row and their column, then see how rare your picks were against the day’s players. A different universe every day of the week: countries, states, animals, movies, TV, teams, musicians.', { fontSize: 22, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 520 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/NICHE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, nicheBoardEl()),
  ]);
}

export async function renderNicheCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildNicheCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Shoe share card — snapshot of the game. The demo hand is a throwaway (an
// invented deal, mid-decision), so it can never spoil a day. Evergreen.
function shoeBoardEl() {
  const MARINE = '#0c4a6e', FELT = '#0d5175', FELTEDGE = '#082f49', GOLD = '#e8b43a', RED = '#c8282e', INK = '#0b0d12';
  const card = (key, rank, suit, red) => h('div', { key, style: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    width: 64, height: 90, borderRadius: 8, background: '#fdfcf9',
    border: '1.5px solid rgba(20,22,28,0.3)', color: red ? RED : INK,
  } }, [
    h('div', { key: 'r', style: { display: 'flex', fontSize: 24, fontWeight: 800 } }, rank),
    h('div', { key: 's', style: { display: 'flex', fontSize: 20, fontWeight: 800 } }, suit),
  ]);
  const back = (key) => h('div', { key, style: {
    display: 'flex', width: 64, height: 90, borderRadius: 8,
    background: FELTEDGE, border: '1.5px solid rgba(255,255,255,0.35)',
  } });
  const lab = (txt, key) => h('div', { key, style: { display: 'flex', width: 86, fontSize: 13, fontWeight: 800, letterSpacing: '2px', color: 'rgba(255,255,255,0.8)' } }, txt);
  const act = (txt, key, gold) => h('div', { key, style: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1,
    height: 44, borderRadius: 9, fontSize: 17, fontWeight: 800,
    background: gold ? '#f4d98d' : 'rgba(255,255,255,0.94)', color: gold ? '#5b4104' : INK,
    border: gold ? '2px solid #e8b43a' : '2px solid rgba(255,255,255,0.9)',
  } }, txt);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 20px 16px', width: 440 } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'SAME SHOE, SAME ORDER, FOR EVERYONE'),
    h('div', { key: 'felt', style: { display: 'flex', flexDirection: 'column', background: FELT, border: `8px solid ${FELTEDGE}`, borderRadius: 12, padding: '16px 14px 14px' } }, [
      h('div', { key: 'dr', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 } }, [
        lab('DEALER', 'l1'), card('d1', '10', '♠', false), back('d2'),
      ]),
      h('div', { key: 'pr', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 } }, [
        lab('YOU', 'l2'), card('p1', 'A', '♥', true), card('p2', '7', '♦', true),
        h('div', { key: 'tot', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 7, padding: '0 12px', background: 'rgba(255,255,255,0.92)', fontSize: 16, fontWeight: 800, color: INK } }, 'soft 18'),
      ]),
      h('div', { key: 'acts', style: { display: 'flex', flexDirection: 'row', gap: 8 } }, [
        act('HIT', 'a1'), act('STAND', 'a2'), act('DOUBLE', 'a3', true),
      ]),
    ]),
    h('div', { key: 'ft', style: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 } }, [
      h('div', { key: 'b', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: MARINE } }, 'BANK +20'),
      h('div', { key: 'p', style: { display: 'flex', fontSize: 15, fontWeight: 700, color: '#646c7a' } }, 'PAR +10 · HAND 3 OF 5'),
      h('div', { key: 'g', style: { display: 'flex', fontSize: 15, fontWeight: 800, color: GOLD } }, '♦ COUNT IT'),
    ]),
  ]);
}
function buildShoeCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 56px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#0c4a6e 55%,#e8b43a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Shoe', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0c4a6e', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0c4a6e', margin: '16px 0 18px' } }),
      T('The daily blackjack shoe.', { fontSize: 33, fontWeight: 800, color: '#0c4a6e', letterSpacing: '-0.5px' }),
      T('Five hands of blackjack off one fixed shoe: the same cards in the same order for every player, a par set by the book line, and a count to beat it with. Sundays deal seven hands off the entire deck.', { fontSize: 22, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SHOE', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, shoeBoardEl()),
  ]);
}

export async function renderShoeCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildShoeCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Queen share card — snapshot of the game. The demo position (a king escorting
// its pawn with the enemy king in front) is NOT in the bank, so it never
// spoils today. It reuses MATE_PIECE_PATH above: same board, and the chess
// dailies should read as siblings. Evergreen.
function queenBoardDataURI() {
  const CELL = 47, PAD = 4, BOARD = CELL * 8, BOX = BOARD + PAD * 2;
  const rows = '8/5k2/8/3K4/4P3/8/8/8'.split('/');
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}">`];
  parts.push(`<rect x="0" y="0" width="${BOX}" height="${BOX}" rx="8" fill="#14141a"/>`);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    parts.push(`<rect x="${PAD + c * CELL}" y="${PAD + r * CELL}" width="${CELL}" height="${CELL}" fill="${(r + c) % 2 ? '#b58863' : '#efd9b5'}"/>`);
  }
  // the promotion square, flagged: the whole game is the walk to it
  parts.push(`<rect x="${PAD + 4 * CELL}" y="${PAD}" width="${CELL}" height="${CELL}" fill="#e0ae4a" opacity="0.55"/>`);
  for (let r = 0; r < 8; r++) {
    let f = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '9') { f += Number(ch); continue; }
      const white = ch === ch.toUpperCase();
      const s = (CELL * 0.92) / 45;
      const off = (CELL - 45 * s) / 2;
      parts.push(
        `<g transform="translate(${PAD + f * CELL + off},${PAD + r * CELL + off}) scale(${s})">` +
        `<path d="${MATE_PIECE_PATH[ch.toUpperCase()]}" fill="${white ? '#ffffff' : '#14141a'}" ` +
        `stroke="${white ? '#14141a' : '#ffffff'}" stroke-width="${white ? 2 : 1.1}" stroke-linejoin="round"/></g>`
      );
      f++;
    }
  }
  parts.push('</svg>');
  return 'data:image/svg+xml;base64,' + Buffer.from(parts.join('')).toString('base64');
}
function queenBoardEl() {
  const BOX = 47 * 8 + 8;
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #14141a', borderRadius: 14, padding: '20px 20px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#716d79', marginBottom: 12 } }, 'WHITE TO PLAY AND PROMOTE'),
    h('img', { key: 'bd', src: queenBoardDataURI(), width: BOX, height: BOX, style: { display: 'flex' } }),
  ]);
}
function buildQueenCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#fbfaf9', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#14141a,#3a4152 55%,#a16207)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#14141a' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Queen', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#14141a', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#a16207', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#a16207', margin: '16px 0 18px' } }),
      T('Walk the pawn in. Every move exact.', { fontSize: 30, fontWeight: 800, color: '#a16207', letterSpacing: '-0.5px' }),
      T('The daily king-and-pawn endgame. A proven promotion in a fixed number of moves, exactly one first move that keeps it, and a perfect defence checking your technique. Opposition, tempi, the square of the pawn.', { fontSize: 24, fontWeight: 600, color: '#716d79', lineHeight: 1.34, marginTop: 15, maxWidth: 545 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/QUEEN', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#14141a', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, queenBoardEl()),
  ]);
}
export async function renderQueenCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildQueenCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Towers share card — snapshot of the game. The demo is a throwaway 4x4 (the
// live boards are 5x5 and 7x7, so nothing here can spoil a day), shown
// part-solved with a handful of border clues. Evergreen.
function towersBoardEl() {
  const CELL = 58, GUT = 34, FS = 30;
  const demo = [
    [2, 1, 4, 3],
    [4, 0, 2, 0],
    [3, 4, 0, 2],
    [0, 2, 3, 4],
  ];
  const top = [2, 3, 1, 0];
  const left = [2, 1, 0, 4];
  const clue = (v, key) => h('div', { key, style: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: key.startsWith('l') ? GUT : CELL, height: key.startsWith('t') ? GUT : CELL,
    fontSize: 22, fontWeight: 700, color: '#646c7a',
  } }, v ? String(v) : '');
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: v ? '#fff' : '#fbfbfc',
      border: '1px solid rgba(28,30,36,0.22)',
      fontSize: FS, fontWeight: 700, color: '#0b0c0e',
    } }, v ? String(v) : '');
  };
  const topRow = h('div', { key: 'top', style: { display: 'flex', flexDirection: 'row', marginLeft: GUT } },
    Array.from({ length: 4 }, (_, c) => clue(top[c], `t${c}`)));
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } }, [
    clue(left[r], `l${r}`),
    h('div', { key: 'cells', style: { display: 'flex', flexDirection: 'row', border: r === 0 ? '2px solid #0b0c0e' : '0 solid #0b0c0e', borderTopWidth: r === 0 ? 2 : 0, borderBottomWidth: r === 3 ? 2 : 0, borderLeftWidth: 2, borderRightWidth: 2 } },
      Array.from({ length: 4 }, (_, c) => cellEl(r, c))),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 22px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 8 } }, 'EACH CLUE COUNTS THE TOWERS IN VIEW'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column' } }, [topRow, ...Array.from({ length: 4 }, (_, r) => rowEl(r))]),
  ]);
}
function buildTowersCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#1e3a8a 55%,#075985)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Towers', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#075985', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#075985', margin: '16px 0 18px' } }),
      T('The daily skyscrapers puzzle.', { fontSize: 33, fontWeight: 800, color: '#075985', letterSpacing: '-0.5px' }),
      T('Every row and column holds each tower height once, and the border clues count the towers you can see, taller ones hiding shorter ones. One logical solution, 5×5 weekdays and 7×7 Sundays.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/TOWERS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, towersBoardEl()),
  ]);
}

export async function renderTowersCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildTowersCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Mercury share card — snapshot of the game. The demo is a throwaway 4x4 (the
// live boards are 9x9, so nothing here can spoil a day) with one thermometer
// drawn as a bulb and rounded stem, part-solved. Evergreen.
function mercuryBoardEl() {
  const CELL = 66, FS = 32;
  const demo = [
    [0, 0, 4, 1],
    [0, 4, 1, 0],
    [4, 0, 2, 3],
    [1, 2, 3, 0],
  ];
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: '#fff',
      border: '1px solid rgba(28,30,36,0.22)',
      fontSize: FS, fontWeight: 700, color: '#0b0c0e',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 4 }, (_, c) => cellEl(r, c)));
  // one thermometer up the left column then right along the top: bulb at
  // (3,0)=1, through (2,0), (1,0), tip at (1,1)=4
  const TH = 'rgba(148,163,184,0.55)';
  const thermo = [
    h('div', { key: 'bulb', style: { position: 'absolute', display: 'flex', left: 12, top: 3 * CELL + 12, width: 42, height: 42, borderRadius: 21, background: TH } }),
    h('div', { key: 'stemv', style: { position: 'absolute', display: 'flex', left: 22, top: CELL + 22, width: 22, height: 2 * CELL + 11, borderRadius: 11, background: TH } }),
    h('div', { key: 'stemh', style: { position: 'absolute', display: 'flex', left: 22, top: CELL + 22, width: CELL + 22, height: 22, borderRadius: 11, background: TH } }),
  ];
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '22px 22px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'DIGITS CLIMB EVERY THERMOMETER'),
    h('div', { key: 'wrap', style: { display: 'flex', flexDirection: 'column', position: 'relative', border: '2px solid #0b0c0e' } },
      [...Array.from({ length: 4 }, (_, r) => rowEl(r)), ...thermo]),
  ]);
}
function buildMercuryCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#1e3a8a 55%,#991b1b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Mercury', { fontSize: 96, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#991b1b', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#991b1b', margin: '16px 0 18px' } }),
      T('The daily thermo sudoku.', { fontSize: 33, fontWeight: 800, color: '#991b1b', letterSpacing: '-0.5px' }),
      T('An ordinary 9×9 plus thermometers: digits climb from each bulb to its tip, and the ordering does the work no sums are asked to do. One logical solution, and Sundays run nine thermometers with just eight printed digits.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/MERCURY', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, mercuryBoardEl()),
  ]);
}

export async function renderMercuryCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildMercuryCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Polka share card — snapshot of the game. The demo is a throwaway 4x4 (the
// live deals are 9x9, so nothing here can spoil a day): a nearly empty grid
// carrying white and black dots on its edges, two digits placed. Evergreen.
function polkaBoardEl() {
  const CELL = 66, FS = 32, R = 11;
  const demo = [
    [1, 2, 0, 0],
    [0, 0, 0, 2],
    [2, 0, 4, 0],
    [0, 3, 0, 0],
  ];
  // dots as [row, col, vertical?, black?] between (r,c) and its right/down
  // neighbour, matching the demo's implied 1234/3412/2143/4321 square
  const DOTS = [
    [0, 0, false, true], [0, 1, false, false], [0, 2, false, false],
    [1, 0, false, false], [2, 1, false, false], [3, 0, false, false],
    [0, 1, true, true], [1, 2, true, false], [2, 0, true, true], [2, 3, true, false],
  ];
  const cellEl = (r, c) => {
    const v = demo[r][c];
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL, background: '#fff',
      border: '1px solid rgba(28,30,36,0.22)',
      fontSize: FS, fontWeight: 700, color: '#0b0c0e',
    } }, v ? String(v) : '');
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 4 }, (_, c) => cellEl(r, c)));
  const dotEls = DOTS.map(([r, c, vert, black], i) => h('div', { key: `d${i}`, style: {
    position: 'absolute', display: 'flex',
    left: (vert ? c * CELL + CELL / 2 : (c + 1) * CELL) - R + 2,
    top: (vert ? (r + 1) * CELL : r * CELL + CELL / 2) - R + 2,
    width: R * 2, height: R * 2, borderRadius: R,
    background: black ? '#0b0c0e' : '#fff',
    border: '3px solid #0b0c0e',
  } }));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '22px 22px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'NO NUMBERS. ONLY DOTS.'),
    h('div', { key: 'wrap', style: { display: 'flex', flexDirection: 'column', position: 'relative', border: '2px solid #0b0c0e' } },
      [...Array.from({ length: 4 }, (_, r) => rowEl(r)), ...dotEls]),
  ]);
}
function buildPolkaCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#1e3a8a 55%,#16a34a)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Polka', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#16a34a', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#16a34a', margin: '16px 0 18px' } }),
      T('The daily kropki sudoku.', { fontSize: 33, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.5px' }),
      T('Not one digit is printed. A white dot means the neighbours differ by 1, a black dot means one is double the other, and no dot means neither — the silences do half the solving. One logical solution, hardest on Sundays.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/POLKA', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, polkaBoardEl()),
  ]);
}

export async function renderPolkaCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildPolkaCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Atlas share card. The demo question is a plain geography one that is NOT in
// the bank, so the card can never hand anyone a live answer.
const ATLAS_DEMO = {
  q: 'Which country has the longest coastline in the world?',
  choices: ['Russia', 'Canada', 'Australia', 'Indonesia'],
};
function atlasBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0c0e' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('12 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#047857', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(ATLAS_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0c0e', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, ATLAS_DEMO.choices.map(row)),
  ]);
}
function buildAtlasCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#047857 55%,#5eead4)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Atlas', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#047857', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#047857', margin: '16px 0 18px' } }),
      T('Twenty-five questions. One life.', { fontSize: 33, fontWeight: 800, color: '#047857', letterSpacing: '-0.5px' }),
      T('The daily geography gauntlet. Capitals, rivers, flags and landmarks climb from easy to expert, twenty seconds each, and one wrong answer ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE \u00b7 MINDLOFTDAILY.COM/ATLAS', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, atlasBoardEl()),
  ]);
}
export async function renderAtlasCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildAtlasCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Sport share card. The demo question is a plain sports one that is NOT in the
// bank, so the card can never hand anyone a live answer.
const SPORT_DEMO = {
  q: 'How many rings are on the Olympic flag?',
  choices: ['Four', 'Five', 'Six', 'Seven'],
};
function sportBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0c0e' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('14 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c2d12', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(SPORT_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0c0e', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, SPORT_DEMO.choices.map(row)),
  ]);
}
function buildSportCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#7c2d12 55%,#f2a56b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Sport', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#7c2d12', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#7c2d12', margin: '16px 0 18px' } }),
      T('Twenty-five questions. One life.', { fontSize: 33, fontWeight: 800, color: '#7c2d12', letterSpacing: '-0.5px' }),
      T('The daily sports gauntlet. The NFL, the NBA, MLB, soccer and everything else, climbing from easy to expert, twenty seconds each, and one wrong answer ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE \u00b7 MINDLOFTDAILY.COM/SPORT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, sportBoardEl()),
  ]);
}
export async function renderSportCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildSportCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Calc share card — snapshot of the game. The demo board is a throwaway 5x5
// with a target of its own (never a shipped board, which run 6x6 and 7x7), so
// it can never spoil a day. The rose buttons are a REAL route on it:
// 2 - 1 * 6 * 9 - 3, read left to right, comes out at 51, and six routes on
// that board reach 51. Evergreen.
function calcBoardEl() {
  const CELL = 62, GAP = 8, N = 5;
  const ROSE = '#be123c', ROSESOFT = '#fff1f4', ROSETINT = '#ffdde5', DEEP = '#8c0d2d';
  const cells = ['2', '/', '8', '/', '8', '-', '4', '*', '2', '/', '1', '*', '6', '*', '9', '+', '8', '/', '2', '-', '2', '-', '3', '-', '3'];
  const route = [0, 5, 10, 11, 12, 13, 14, 19, 24];
  const glyph = (v) => (v === '*' ? '×' : v === '/' ? '÷' : v);
  const keyEl = (i) => {
    const r = (i / N) | 0, c = i % N;
    const num = (r + c) % 2 === 0;
    const on = route.includes(i);
    const term = i === 0 || i === N * N - 1;
    return h('div', { key: `k${i}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL,
      borderRadius: term ? 16 : CELL / 2,
      background: on ? ROSE : num ? ROSESOFT : '#ffffff',
      border: `2px solid ${on ? ROSE : num ? ROSETINT : 'rgba(28,30,36,0.18)'}`,
      color: on ? '#ffffff' : num ? DEEP : '#646c7a',
      fontSize: 27, fontWeight: 700,
    } }, glyph(cells[i]));
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row', gap: GAP } },
    Array.from({ length: N }, (_, c) => keyEl(r * N + c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '20px 22px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 14 } }, [
      h('div', { key: 'l', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginRight: 12 } }, 'TARGET'),
      h('div', { key: 'v', style: { display: 'flex', fontSize: 40, fontWeight: 800, letterSpacing: '-1px', color: ROSE, lineHeight: 1 } }, '51'),
    ]),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', gap: GAP } }, Array.from({ length: N }, (_, r) => rowEl(r))),
    h('div', { key: 'ft', style: { display: 'flex', fontSize: 17, fontWeight: 700, color: '#0b0d12', marginTop: 15 } }, '2 - 1 × 6 × 9 - 3'),
  ]);
}
function buildCalcCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 58px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#be123c)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 20 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Calc', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#be123c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#be123c', margin: '16px 0 18px' } }),
      T('Walk the calculator.', { fontSize: 33, fontWeight: 800, color: '#be123c', letterSpacing: '-0.5px' }),
      T('Step from the first button to the last across a grid of numbers and operators, one touching button at a time. The route you walk is a sum, it reads left to right, and it has to land on exactly the target. Sundays set three.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/CALC', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 28 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, calcBoardEl()),
  ]);
}

export async function renderCalcCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildCalcCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Encore share card — snapshot of the game. The demo grid is NEUTRAL: it is a
// legal Encore fill that appears on no day of the bank, so the card can be
// static and evergreen without ever spoiling a live board.
function encoreBoardEl() {
  const CELL = 46, FS = 21;
  const demo = [
    '###GAS###',
    '#STORES##',
    '#AIRMAIL#',
    'BUGGY#LET',
    'ACHE#WEAR',
    'NET#NANNY',
    '#REJOICE#',
    '##RINSED#',
    '###GET###',
  ];
  const nums = { '0,3': 1, '0,4': 2, '0,5': 3, '1,1': 4, '1,2': 5, '1,6': 6, '2,1': 7, '2,7': 8, '3,0': 9, '3,6': 10, '3,8': 11, '4,0': 12, '4,5': 13, '5,0': 14, '5,4': 15, '6,1': 16, '6,3': 17, '7,2': 18, '8,3': 19 };
  const hide = { '6,5': 1, '6,6': 1, '6,7': 1 };                                  // 16-Across still being filled
  const active = { '6,1': 1, '6,2': 1, '6,3': 1, '6,4': 1, '6,5': 1, '6,6': 1, '6,7': 1 };
  const cellEl = (r, c) => {
    const ch = demo[r][c];
    if (ch === '#') {
      return h('div', { key: `${r},${c}`, style: { display: 'flex', width: CELL, height: CELL, background: '#0b0d12', borderTop: '1px solid rgba(28,30,36,0.3)', borderLeft: '1px solid rgba(28,30,36,0.3)' } });
    }
    const key = `${r},${c}`;
    const sel = key === '6,5';
    const bg = sel ? '#dbeafe' : (active[key] ? '#eff6ff' : '#fff');
    const kids = [];
    if (nums[key]) kids.push(h('div', { key: 'n', style: { display: 'flex', position: 'absolute', top: 2, left: 4, fontSize: 11, fontWeight: 700, color: 'rgba(28,30,36,0.55)' } }, String(nums[key])));
    if (!hide[key]) kids.push(h('div', { key: 'l', style: { display: 'flex', fontSize: FS, fontWeight: 800, color: '#0b0d12' } }, ch));
    return h('div', { key, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      width: CELL, height: CELL, background: bg,
      borderTop: '1px solid rgba(28,30,36,0.3)',
      borderLeft: '1px solid rgba(28,30,36,0.3)',
      boxShadow: sel ? 'inset 0 0 0 3px #1d4ed8' : 'none',
    } }, kids);
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: 9 }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0d12', borderRadius: 14, padding: '18px 18px 14px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 12 } }, 'THE DAILY CROSSWORD'),
    h('div', { key: 'grid', style: { display: 'flex', flexDirection: 'column', border: '3px solid #0b0d12' } }, Array.from({ length: 9 }, (_, r) => rowEl(r))),
  ]);
}
function buildEncoreCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 54px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#1d4ed8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '520px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 18 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0d12' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Encore', { fontSize: 92, fontWeight: 800, letterSpacing: '-3px', color: '#0b0d12', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#1d4ed8', borderRadius: 8, padding: '6px 12px', marginLeft: 18 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#1d4ed8', margin: '14px 0 16px' } }),
      T('The big grid, every day.', { fontSize: 32, fontWeight: 800, color: '#1d4ed8', letterSpacing: '-0.5px' }),
      T('Nine by nine and around twenty-six answers, so it is a sit-down rather than a sprint. Everyday words, fair clues, and the grid checks itself when the last square lands. Sundays run eleven by eleven.', { fontSize: 23, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 13, maxWidth: 520 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/ENCORE', { fontSize: 19, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0d12', marginTop: 26 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, encoreBoardEl()),
  ]);
}

export async function renderEncoreCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildEncoreCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Biz share card. The demo question is a plain accounting one that is NOT in
// the bank, so the card can never hand anyone a live answer.
const BIZ_DEMO = {
  q: "In a company's accounts, money owed to it by its customers is called what?",
  choices: ['Accounts payable', 'Accounts receivable', 'Retained earnings', 'Working capital'],
};
function bizBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0c0e' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('17 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f5132', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(BIZ_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0c0e', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, BIZ_DEMO.choices.map(row)),
  ]);
}
function buildBizCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#0f5132 55%,#4fbf8b)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Biz', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#0f5132', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#0f5132', margin: '16px 0 18px' } }),
      T('Twenty-five questions. One life.', { fontSize: 33, fontWeight: 800, color: '#0f5132', letterSpacing: '-0.5px' }),
      T('The daily business gauntlet. Brands, markets, founders, deals and business history climb from easy to expert, twenty seconds each, and one wrong answer ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE \u00b7 MINDLOFTDAILY.COM/BIZ', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, bizBoardEl()),
  ]);
}
export async function renderBizCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildBizCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Flank share card — snapshot of the game. The demo board is Peru, which is
// deliberately NEVER in the Flank bank (the generator refuses it), so the
// card can never spoil a day. Three of its five borders are shown banked.
const FLANK_DEMO = { country: 'PERU', total: 5, found: ['Bolivia', 'Colombia', 'Ecuador'], blanks: 2 };
function flankBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const OLIVE = '#3f6212', OLIVESOFT = '#eef7e2', OLIVEDEEP = '#2c4a0a';
  const slot = (txt, i, filled) => h('div', {
    key: `s${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '340px',
      border: `2px solid ${filled ? OLIVE : 'rgba(28,30,36,0.28)'}`, borderRadius: '9px',
      padding: '9px 14px', marginBottom: '8px', background: filled ? OLIVESOFT : '#fff',
    },
  }, [
    T(String(i + 1), { fontSize: 13, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 800, color: filled ? OLIVEDEEP : '#9ca3af' }),
  ]);
  const rows = [];
  FLANK_DEMO.found.forEach((nm, i) => rows.push(slot(nm, i, true)));
  for (let i = 0; i < FLANK_DEMO.blanks; i++) rows.push(slot('· · · · ·', FLANK_DEMO.found.length + i, false));
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T("TODAY'S COUNTRY", { fontSize: 13, fontWeight: 800, letterSpacing: '2px', color: '#646c7a' }),
      T('3/5 BORDERS', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#fff', background: OLIVE, borderRadius: 7, padding: '5px 11px', marginLeft: 14 }),
    ]),
    T(FLANK_DEMO.country, { fontSize: 40, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e', marginBottom: 14, lineHeight: 1 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, rows),
  ]);
}
function buildFlankCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#3f6212 55%,#b1d977)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Flank', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#3f6212', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#3f6212', margin: '16px 0 18px' } }),
      T('One country. Every border.', { fontSize: 33, fontWeight: 800, color: '#3f6212', letterSpacing: '-0.5px' }),
      T('The daily borders game. Name every country that touches the day’s country before three wrong guesses end the run. Monday is one border; Sunday is a fourteen-neighbor giant.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/FLANK', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, flankBoardEl()),
  ]);
}
export async function renderFlankCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildFlankCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Knight share card — snapshot of the rule rather than of a board. The demo is
// a throwaway 5x5 (the live boards are 9x9, so nothing here can spoil a day):
// one digit in the middle and the eight squares a knight's move from it tinted,
// which is the whole game in one picture. Evergreen.
function knightBoardEl() {
  const CELL = 60, FS = 30, N = 5;
  const CENTER = [2, 2];
  const STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  const reach = new Set(STEPS
    .map(([dr, dc]) => [CENTER[0] + dr, CENTER[1] + dc])
    .filter(([r, c]) => r >= 0 && r < N && c >= 0 && c < N)
    .map(([r, c]) => `${r},${c}`));
  const cellEl = (r, c) => {
    const isCenter = r === CENTER[0] && c === CENTER[1];
    const hit = reach.has(`${r},${c}`);
    return h('div', { key: `${r},${c}`, style: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: CELL, height: CELL,
      background: isCenter ? '#3730a3' : (hit ? '#eceafc' : '#fff'),
      border: hit ? '1px solid rgba(55,48,163,0.45)' : '1px solid rgba(28,30,36,0.22)',
      fontSize: FS, fontWeight: 700, color: isCenter ? '#fff' : '#3730a3',
    } }, isCenter ? '7' : (hit ? '×' : ''));
  };
  const rowEl = (r) => h('div', { key: `r${r}`, style: { display: 'flex', flexDirection: 'row' } },
    Array.from({ length: N }, (_, c) => cellEl(r, c)));
  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '22px 22px 18px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', fontSize: 15, fontWeight: 800, letterSpacing: '2px', color: '#646c7a', marginBottom: 14 } }, 'NO 7 A KNIGHT’S MOVE AWAY'),
    h('div', { key: 'wrap', style: { display: 'flex', flexDirection: 'column', border: '2px solid #0b0c0e' } },
      Array.from({ length: N }, (_, r) => rowEl(r))),
  ]);
}
function buildKnightCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#1e3a8a 55%,#3730a3)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Knight', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#3730a3', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#3730a3', margin: '16px 0 18px' } }),
      T('The daily anti-knight sudoku.', { fontSize: 33, fontWeight: 800, color: '#3730a3', letterSpacing: '-0.5px' }),
      T('One rule added to sudoku: no digit may repeat a chess knight’s move away from itself. Nothing is drawn on the grid, and the rule reaches across boxes instead of inside them, so the board prints far fewer digits than a sudoku has any right to need.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/KNIGHT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, knightBoardEl()),
  ]);
}

export async function renderKnightCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildKnightCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Script share card. The demo question is a plain one that is NOT in the bank,
// so the card can never hand anyone a live answer.
const SCRIPT_DEMO = {
  q: 'Which 1994 film tells three interwoven stories out of chronological order?',
  choices: ['Reservoir Dogs', 'Pulp Fiction', 'Short Cuts', 'Magnolia'],
};
function scriptBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0c0e' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('14 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4a1d6b', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(SCRIPT_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0c0e', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, SCRIPT_DEMO.choices.map(row)),
  ]);
}
function buildScriptCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#4a1d6b 55%,#c9a4ea)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Script', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#4a1d6b', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#4a1d6b', margin: '16px 0 18px' } }),
      T('Twenty-five questions. One life.', { fontSize: 33, fontWeight: 800, color: '#4a1d6b', letterSpacing: '-0.5px' }),
      T('The daily movie and television gauntlet. Films, series, the people who make them, the awards and the money, and what happened behind the camera, twenty seconds each, and one wrong answer ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/SCRIPT', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, scriptBoardEl()),
  ]);
}
export async function renderScriptCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildScriptCard(), { ...size, fonts });
}

// ---------------------------------------------------------------------------
// Quotes share card. The demo line is the most famous attribution there is and
// is deliberately NOT in the bank, so the card cannot hand over a live answer.
const QUOTES_DEMO = {
  q: 'Who told a nation in depression that the only thing to fear was fear itself?',
  choices: ['Woodrow Wilson', 'Herbert Hoover', 'Franklin D. Roosevelt', 'Harry S. Truman'],
};
function quotesBoardEl() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  const row = (txt, i) => h('div', {
    key: `c${i}`,
    style: {
      display: 'flex', alignItems: 'center', width: '360px',
      border: '2px solid rgba(28,30,36,0.4)', borderRadius: '9px',
      padding: '10px 14px', marginBottom: '9px', background: '#fff',
    },
  }, [
    T(String.fromCharCode(65 + i), { fontSize: 15, fontWeight: 800, color: '#9ca3af', marginRight: 12 }),
    T(txt, { fontSize: 19, fontWeight: 700, color: '#0b0c0e' }),
  ]);
  return h('div', { style: { display: 'flex', flexDirection: 'column', background: '#fff', border: '2px solid #0b0c0e', borderRadius: 14, padding: '20px 22px 12px' } }, [
    h('div', { key: 'hd', style: { display: 'flex', alignItems: 'center', marginBottom: 12 } }, [
      T('19 STRAIGHT', { fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#3d4f7c', borderRadius: 7, padding: '5px 11px' }),
      T('20s', { fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: '#646c7a', marginLeft: 14 }),
    ]),
    T(QUOTES_DEMO.q, { fontSize: 21, fontWeight: 800, color: '#0b0c0e', marginBottom: 14, maxWidth: 360, lineHeight: 1.3 }),
    h('div', { key: 'rows', style: { display: 'flex', flexDirection: 'column' } }, QUOTES_DEMO.choices.map(row)),
  ]);
}
function buildQuotesCard() {
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt);
  return h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '54px 60px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0c0e,#3d4f7c 55%,#a8b8e8)' } }),
    h('div', { key: 'left', style: { display: 'flex', flexDirection: 'column', width: '560px' } }, [
      h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center', marginBottom: 22 } }, [
        h('img', { key: 'i', src: iconRingsDataURI(), width: 72, height: 72, style: { marginLeft: '-10px', marginRight: '2px' } }),
        T('Mind Loft', { fontSize: 28, fontWeight: 800, letterSpacing: '-1px', color: '#0b0c0e' }),
      ]),
      h('div', { key: 'ttl', style: { display: 'flex', alignItems: 'center' } }, [
        T('Quotes', { fontSize: 100, fontWeight: 800, letterSpacing: '-3px', color: '#0b0c0e', lineHeight: 1 }),
        T('DAILY', { fontSize: 20, fontWeight: 800, letterSpacing: '2px', color: '#fff', background: '#3d4f7c', borderRadius: 8, padding: '6px 12px', marginLeft: 20 }),
      ]),
      h('div', { key: 'div', style: { display: 'flex', width: '210px', height: '4px', background: '#3d4f7c', margin: '16px 0 18px' } }),
      T('Twenty-five lines. One life.', { fontSize: 33, fontWeight: 800, color: '#3d4f7c', letterSpacing: '-0.5px' }),
      T('The daily who-said-it gauntlet. Presidents, generals, scientists, writers, and the odd film character, twenty seconds a line, and one wrong attribution ends the run.', { fontSize: 24, fontWeight: 600, color: '#646c7a', lineHeight: 1.34, marginTop: 15, maxWidth: 540 }),
      T('PLAY FREE · MINDLOFTDAILY.COM/QUOTES', { fontSize: 20, fontWeight: 800, letterSpacing: '1.5px', color: '#0b0c0e', marginTop: 30 }),
    ]),
    h('div', { key: 'right', style: { display: 'flex' } }, quotesBoardEl()),
  ]);
}
export async function renderQuotesCard() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)]);
  const any = w8 || w7 || w6;
  const loaded = { 800: w8, 700: w7, 600: w6 };
  const fonts = any ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' })) : [];
  return new ImageResponse(buildQuotesCard(), { ...size, fonts });
}
