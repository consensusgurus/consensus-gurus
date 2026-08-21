import { ImageResponse } from 'next/og'
import React from 'react'
import { QUIZZES } from '@/lib/quizzes'

export const runtime = 'nodejs';
// Regenerate hourly so the featured row tracks current popularity without
// hammering the database on every scrape.
export const revalidate = 3600;

export const alt = 'Mind Loft quizzes: elevate your thinking'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const h = React.createElement

// Mind Loft mark (caret over brain), matching lib/og-brand-card.js. Emitted as an SVG
// data URI so Satori lays it out as one img. Hexes stay LITERAL: this is a string, not JSX.
function iconRingsDataURI() {
  const mark = '<g transform="translate(56,59) scale(1.74)">' + "<path d=\"M20 52l40-34 40 34\" stroke=\"#0b0d12\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M14 102h92\" stroke=\"#0b0d12\" stroke-width=\"6\" stroke-linecap=\"round\"/><g transform=\"translate(31,48) scale(0.53)\"><path d=\"M14 42C12 28 22 16 36 16C40 8 54 6 60 14C70 8 84 14 86 26C96 30 98 44 88 50C92 58 86 66 76 64C74 72 64 74 60 66C48 70 36 66 32 56C20 56 12 50 14 42Z\" fill=\"#2f6fe4\"/></g>" + '</g>'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">${mark}</svg>`
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
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2f6fe4)' } }),
    h('div', { key: 'top', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column', marginBottom: 20 } }, [
        h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
          h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
            h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
            T('Mind Loft', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
          ]),
          T('The Quizzes', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#233a63', textTransform: 'uppercase' }),
        ]),
        h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e5e7eb', marginTop: '10px' } }),
        h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2f6fe4', marginTop: '3px' } }),
      ]),
      T('Elevate Your Thinking.', { fontSize: 74, fontWeight: 800, letterSpacing: '-1.5px', color: '#0b0d12', lineHeight: 1.0, marginBottom: 14 }),
      T(`${count} timed quizzes across film, music, sports, and beyond. Name them, match them, map them, beat the clock.`, { fontSize: 26, fontWeight: 600, color: '#646c7a', lineHeight: 1.3, maxWidth: '92%' }),
    ]),
    h('div', { key: 'feat', style: { display: 'flex', flexDirection: 'column' } },
      SAMPLES.map((s, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', marginBottom: '8px' } }, [
        h('div', { key: 't', style: { display: 'flex', width: 36, alignItems: 'center' } }, [
          h('div', { key: 'tri', style: { width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #233a63' } }),
        ]),
        h('div', { key: 'n', style: { display: 'flex', fontSize: 30, fontWeight: 600, color: '#0b0d12', lineHeight: 1.15 } }, s),
      ]))
    ),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '16px', fontSize: 19 } }, [
      T('Beat the clock, then the leaderboard.', { color: '#646c7a', fontWeight: 600 }),
      T('PLAY AT MINDLOFTDAILY.COM/QUIZZES', { color: '#233a63', fontWeight: 700 }),
    ]),
  ])

  return new ImageResponse(card, { ...size, fonts })
}
