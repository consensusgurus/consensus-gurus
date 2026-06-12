import { ImageResponse } from 'next/og'
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
  // Load Fraunces (masthead serif) + DM Serif italic so the card matches the site.
  let frauncesData = null
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.0.20/files/fraunces-latin-900-normal.woff')
    if (res.ok) frauncesData = await res.arrayBuffer()
  } catch (e) { frauncesData = null }
  let dmData = null
  try {
    const res2 = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/dm-serif-display@5/files/dm-serif-display-latin-400-italic.woff')
    if (res2.ok) dmData = await res2.arrayBuffer()
  } catch (e) { dmData = null }
  const fonts = [
    ...(frauncesData ? [{ name: 'Fraunces', data: frauncesData, weight: 900, style: 'normal' }] : []),
    ...(dmData ? [{ name: 'DMSerif', data: dmData, weight: 400, style: 'italic' }] : []),
  ]
  const ff = frauncesData ? 'Fraunces' : 'serif'
  const dmFF = dmData ? 'DMSerif' : 'serif'

  const count = Array.isArray(QUIZZES) ? QUIZZES.length : 0
  const byId = Object.fromEntries((QUIZZES || []).map((q) => [q.id, q]))

  // Feature the most-played quizzes; fill from the curated marquee (then the
  // rest) when fewer than four have been played yet.
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

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f4ead5', padding: '40px 72px', fontFamily: ff }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 10 }}>
              <div style={{ display: 'flex', fontSize: 42, color: '#1a1a1a', fontWeight: 700, lineHeight: 1 }}>Source of Truths</div>
              <div style={{ display: 'flex', fontSize: 18, color: '#c0392b', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 600, paddingBottom: 6 }}>The Quizzes</div>
            </div>
            <div style={{ display: 'flex', width: '100%', height: 1, background: '#1a1a1a' }} />
            <div style={{ display: 'flex', width: '100%', height: 3, background: '#c0392b', marginTop: 3 }} />
          </div>
          <div style={{ display: 'flex', fontSize: 78, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.0, marginBottom: 14 }}>
            Test what you know.
          </div>
          <div style={{ display: 'flex', fontSize: 26, fontFamily: dmFF, fontStyle: 'italic', color: '#5a5a5a', lineHeight: 1.25, maxWidth: '92%' }}>
            {count} timed quizzes across film, music, sports, and beyond. Name them, match them, map them, beat the clock.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {featured.map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', width: 36, alignItems: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid #c0392b' }} />
              </div>
              <div style={{ display: 'flex', fontSize: 30, color: '#1a1a1a', fontWeight: 500, lineHeight: 1.15 }}>{strip(q.title)}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #c4b896', paddingTop: 14, fontSize: 19, color: '#5a5a5a' }}>
          <div style={{ display: 'flex' }}>Beat the clock, then the leaderboard.</div>
          <div style={{ display: 'flex', color: '#c0392b', fontWeight: 600 }}>Play at sourceoftruths.com/quizzes</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
