import { ImageResponse } from 'next/og'
import React from 'react'
import { QUIZZES } from '@/lib/quizzes'
import { supabaseAdmin } from '@/lib/supabase-server'
import { fetchAllRows } from '@/lib/fetch-all'

export const runtime = 'nodejs';
// Regenerate hourly so the featured row tracks current popularity without
// hammering the database on every scrape.
export const revalidate = 3600;

export const alt = 'Source of Truths quizzes: test what you know'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const h = React.createElement

// Curated marquee used only to fill the featured row when there aren't yet
// enough played quizzes to rank by popularity.
const FALLBACK_IDS = [
  'top-grossing-films-1990s',
  'best-selling-albums-all-time',
  'most-streamed-spotify-songs',
  'best-selling-games-all-time',
]

function strip(title) {
  return (title || '').replace(/^Name the /, '').replace(/^Name /, '')
}

// Rebranded ringed blue/gold brand icon (matches the homepage + per-quiz cards),
// emitted as an SVG data URI so Satori lays it out as one img.
function iconRingsDataURI() {
  let rings = ''
  for (let i = 1; i <= 5; i++) {
    rings += `<circle cx="160" cy="160" r="${52 + i * 22}" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-opacity="${(0.075 - i * 0.011).toFixed(3)}"/>`
  }
  const icon = `<g transform="translate(85,85) scale(${150 / 64})"><rect x="3" y="3" width="58" height="58" rx="17.5" fill="url(#b)"/><circle cx="32" cy="32.5" r="16.4" stroke="#fff" stroke-width="4.2" fill="none"/><circle cx="32" cy="32.5" r="9.6" stroke="#fff" stroke-width="4.2" fill="none" stroke-opacity="0.9"/><path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill="url(#g)"/></g>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="b" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3b74f0"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient><radialGradient id="g" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="#ffe24d"/><stop offset="0.55" stop-color="#fbb615"/><stop offset="1" stop-color="#f59008"/></radialGradient></defs>${rings}${icon}</svg>`
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')
}

async function woff(w) {
  try {
    const r = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/manrope@5.1.0/files/manrope-latin-${w}-normal.woff`)
    if (r.ok) return await r.arrayBuffer()
  } catch (e) { /* fall through */ }
  return null
}

// The quizzes with the most completed plays, most-played first. Returns null on
// any failure so the caller can fall back to the curated marquee.
async function quizzesByPlays() {
  try {
    const { data, error } = await fetchAllRows(supabaseAdmin, 'quiz_results', 'quiz_id', ['quiz_id'])
    if (error || !Array.isArray(data)) return null
    const byQuiz = {}
    for (const r of data) byQuiz[r.quiz_id] = (byQuiz[r.quiz_id] || 0) + 1
    const ranked = (QUIZZES || [])
      .filter((q) => byQuiz[q.id])
      .sort((a, b) => (byQuiz[b.id] - byQuiz[a.id]) || a.title.localeCompare(b.title))
    return ranked.length ? ranked : null
  } catch (e) {
    return null
  }
}

export default async function Image() {
  const [w8, w7, w6] = await Promise.all([woff(800), woff(700), woff(600)])
  const any = w8 || w7 || w6
  const loaded = { 800: w8, 700: w7, 600: w6 }
  const fonts = any
    ? [800, 700, 600].map((wt) => ({ name: 'Manrope', data: loaded[wt] || any, weight: wt, style: 'normal' }))
    : []

  const count = Array.isArray(QUIZZES) ? QUIZZES.length : 0
  const byId = Object.fromEntries((QUIZZES || []).map((q) => [q.id, q]))

  let featured = (await quizzesByPlays()) || []
  if (featured.length < 4) {
    const seen = new Set(featured.map((q) => q.id))
    const fill = [...FALLBACK_IDS.map((id) => byId[id]).filter(Boolean), ...(QUIZZES || [])]
    for (const q of fill) {
      if (featured.length >= 4) break
      if (!seen.has(q.id)) { featured.push(q); seen.add(q.id) }
    }
  }
  featured = featured.slice(0, 4)

  const T = (txt, style) => h('div', { style: { display: 'flex', ...style } }, txt)

  const card = h('div', { style: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f7f8fa', fontFamily: 'Manrope', padding: '48px 72px', position: 'relative' } }, [
    h('div', { key: 'bar', style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '9px', display: 'flex', background: 'linear-gradient(90deg,#1d4ed8,#3b74f0 55%,#fbb615)' } }),
    h('div', { key: 'top', style: { display: 'flex', flexDirection: 'column' } }, [
      h('div', { key: 'hd', style: { display: 'flex', flexDirection: 'column', marginBottom: 20 } }, [
        h('div', { key: 'row', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }, [
          h('div', { key: 'brand', style: { display: 'flex', alignItems: 'center' } }, [
            h('img', { key: 'i', src: iconRingsDataURI(), width: 116, height: 116, style: { marginLeft: '-16px', marginRight: '-2px' } }),
            T('Source of Truths', { fontSize: 42, fontWeight: 800, letterSpacing: '-1.2px', color: '#1c1e24' }),
          ]),
          T('The Quizzes', { fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#2563eb', textTransform: 'uppercase' }),
        ]),
        h('div', { key: 'l1', style: { display: 'flex', width: '100%', height: '2px', background: '#e2e5ea', marginTop: '10px' } }),
        h('div', { key: 'l2', style: { display: 'flex', width: '210px', height: '4px', background: '#fbb615', marginTop: '3px' } }),
      ]),
      T('Test what you know.', { fontSize: 74, fontWeight: 800, letterSpacing: '-1.5px', color: '#1c1e24', lineHeight: 1.0, marginBottom: 14 }),
      T(`${count} timed quizzes across film, music, sports, and beyond. Name them, match them, map them, beat the clock.`, { fontSize: 26, fontWeight: 600, color: '#6b7280', lineHeight: 1.3, maxWidth: '92%' }),
    ]),
    h('div', { key: 'feat', style: { display: 'flex', flexDirection: 'column' } },
      featured.map((q, i) => h('div', { key: i, style: { display: 'flex', alignItems: 'center', marginBottom: '8px' } }, [
        h('div', { key: 't', style: { display: 'flex', width: 36, alignItems: 'center' } }, [
          h('div', { key: 'tri', style: { width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #2563eb' } }),
        ]),
        h('div', { key: 'n', style: { display: 'flex', fontSize: 30, fontWeight: 600, color: '#1c1e24', lineHeight: 1.15 } }, strip(q.title)),
      ]))
    ),
    h('div', { key: 'ft', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e5ea', paddingTop: '16px', fontSize: 19 } }, [
      T('Beat the clock, then the leaderboard.', { color: '#9aa0ab', fontWeight: 600 }),
      T('PLAY AT SOURCEOFTRUTHS.COM/QUIZZES', { color: '#2563eb', fontWeight: 700 }),
    ]),
  ])

  return new ImageResponse(card, { ...size, fonts })
}
