import { ImageResponse } from 'next/og'
import React from 'react'
import { CONTEST, COPY } from '@/lib/contest'

export const runtime = 'nodejs';
// The prize and dates come from lib/contest.js, but the DAYS LEFT is derived at
// request time, so this regenerates hourly rather than being baked once.
export const revalidate = 3600;

export const alt = `Win ${CONTEST.prizeLabel}: the Mind Loft referral contest`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const h = React.createElement

// Mind Loft mark (caret over brain), matching app/quizzes/opengraph-image.js and
// lib/og-brand-card.js. Hexes stay LITERAL: this is a string, not JSX.
function iconRingsDataURI() {
  const mark = '<g transform="translate(56,59) scale(1.74)">' + "<path d=\"M20 52l40-34 40 34\" stroke=\"#0b0d12\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M14 102h92\" stroke=\"#0b0d12\" stroke-width=\"6\" stroke-linecap=\"round\"/><g transform=\"translate(31,48) scale(0.53)\"><path d=\"M14 42C12 28 22 16 36 16C40 8 54 6 60 14C70 8 84 14 86 26C96 30 98 44 88 50C92 58 86 66 76 64C74 72 64 74 60 66C48 70 36 66 32 56C20 56 12 50 14 42Z\" fill=\"#2563eb\"/></g>" + '</g>'
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

  const left = Math.max(0, Math.ceil((Date.parse(CONTEST.endsAt) - Date.now()) / 86400000))
  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt)

  const place = (label, amount, lead) => h('div', {
    key: label,
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: lead ? '14px 30px' : '14px 24px',
      borderRadius: 14,
      background: lead ? '#eef3ff' : '#f7f8fa',
      border: lead ? '2px solid #cddffb' : '2px solid #eef0f4',
      marginRight: 12,
    },
  }, [
    T(label, { fontSize: 19, fontWeight: 700, color: '#646c7a', marginBottom: 2 }),
    T(amount, { fontSize: lead ? 44 : 32, fontWeight: 800, color: lead ? '#233a63' : '#0b0d12', letterSpacing: '-1px' }),
  ])

  const card = h('div', {
    style: {
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope',
      padding: '48px 72px', position: 'relative',
    },
  }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#0b0d12,#233a63 55%,#2563eb)' } }),

    h('div', { key: 'top', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
        h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
          h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
          T('Mind Loft', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#0b0d12' }),
        ]),
        T(`${left} DAYS LEFT`, { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#233a63' }),
      ]),
      h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e5e7eb', marginTop: '10px' } }),
      h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#2563eb', marginTop: '3px' } }),
    ]),

    h('div', { key: 'mid', style: { display: 'flex', flexDirection: 'column' } }, [
      T(`Win ${CONTEST.prizeLabel}.`, { fontSize: 92, fontWeight: 800, letterSpacing: '-2px', color: '#0b0d12', lineHeight: 1.0, marginBottom: 10 }),
      T('Bring the most new players to Mind Loft.', { fontSize: 30, fontWeight: 600, color: '#646c7a', lineHeight: 1.25, marginBottom: 20 }),
      h('div', { key: 'places', style: { display: 'flex', alignItems: 'flex-end' } }, [
        place('1st', `$${CONTEST.prizes[0]}`, true),
        place('2nd', `$${CONTEST.prizes[1]}`, false),
        place('3rd', `$${CONTEST.prizes[2]}`, false),
      ]),
    ]),

    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: '16px', fontSize: 19 } }, [
      T(`Free to enter. Ends ${CONTEST.deadlineLabel}.`, { color: '#646c7a', fontWeight: 600 }),
      T('MINDLOFTDAILY.COM', { color: '#233a63', fontWeight: 700 }),
    ]),
  ])

  return new ImageResponse(card, { ...size, fonts })
}
