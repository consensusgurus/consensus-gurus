import { ImageResponse } from 'next/og'
import React from 'react'
import { QUIZZES } from '@/lib/quizzes'

export const runtime = 'nodejs';
// Regenerate hourly so the featured row tracks current popularity without
// hammering the database on every scrape.
export const revalidate = 3600;

export const alt = 'Source of Truths quizzes: exercise your mind'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const h = React.createElement

// Rebranded ringed blue/gold brand icon (matches the homepage + per-quiz cards),
// emitted as an SVG data URI so Satori lays it out as one img.
function iconRingsDataURI() {
  let rings = ''
  for (let i = 1; i <= 5; i++) {
    rings += `<circle cx="160" cy="160" r="${52 + i * 22}" fill="none" stroke="#0a1730" stroke-width="2" stroke-opacity="${(0.075 - i * 0.011).toFixed(3)}"/>`
  }
  const icon = `<g transform="translate(85,85) scale(${150 / 64})"><rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#b)"/><circle cx="32" cy="32.5" r="16.4" fill="#ffffff"/><circle cx="32" cy="32.5" r="12.2" fill="#112446"/><circle cx="32" cy="32.5" r="9.6" fill="#e8eaed"/><path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#g)"/></g>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="b" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1e3a6b"/><stop offset="1" stop-color="#0a1730"/></linearGradient><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#ffe24d"/><stop offset="0.55" stop-color="#fbb615"/><stop offset="1" stop-color="#f59008"/></radialGradient></defs>${rings}${icon}</svg>`
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

async function woff(w) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-${w}-normal.woff`)
    if (r.ok) return await r.arrayBuffer()
  } catch (e) { /* fall through */ }
  return null
}

export default async function Image() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)])
  const any = w8 || w7 || w6
  const loaded = { 800: w8, 700: w7, 600: w6 }
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : []

  const count = Array.isArray(QUIZZES) ? QUIZZES.length : 0

  // Three fixed sample quizzes showcase the range of formats (name / click /
  // match). Kept to three so the featured row doesn't feel dense.
  const SAMPLES = [
    'Name the NYC Pizzeria from the Pizza Photo',
    'Click the European Country with No Outlines',
    'Match the Slogan to the Company',
  ]

  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt)

  const card = h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0a1730,#1e3a6b 55%,#fbb615)' } }),
    h('div', { key: 'top', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column', marginBottom: 20 } }, [
        h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
          h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
            h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
            T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
          ]),
          T('The Quizzes', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#0e1d40', textTransform: 'uppercase' }),
        ]),
        h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
        h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
      ]),
      T('Exercise Your Mind.', { fontSize: 74, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.0, marginBottom: 14 }),
      T(`${count} timed quizzes across film, music, sports, and beyond. Name them, match them, map them, beat the clock.`, { fontSize: 26, fontWeight: 600, color: '#6b7280', lineHeight: 1.3, maxWidth: '92%' }),
    ]),
    h('div', { key: 'feat', style: { display: 'flex', flexDirection: 'column' } },
      SAMPLES.map((s, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', marginBottom: '8px' } }, [
        h('div', { key: 't', style: { display: 'flex', width: 36, alignItems: 'center' } }, [
          h('div', { key: 'tri', style: { width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #0e1d40' } }),
        ]),
        h('div', { key: 'n', style: { display: 'flex', fontSize: 30, fontWeight: 600, color: '#1c1e24', lineHeight: 1.15 } }, s),
      ]))
    ),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '16px', fontSize: 19 } }, [
      T('Beat the clock, then the leaderboard.', { color: '#9aa0ab', fontWeight: 600 }),
      T('PLAY AT SOURCEOFTRUTHS.COM/QUIZZES', { color: '#0e1d40', fontWeight: 700 }),
    ]),
  ])

  return new ImageResponse(card, { ...size, fonts })
}
