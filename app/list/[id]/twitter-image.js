import { ImageResponse } from 'next/og'
import { LISTS } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Source of Truths list preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function getItemName(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.name || item.title || item.label || ''
}

// Borda scoring — mirrors lib/helpers.js getSources exactly.
function computeConsensus(list) {
  const sources = list.sources || {}
  const mode = list.mode || 'both'

  if (mode === 'facts' || mode === 'scores' || mode === 'unranked') {
    return (sources.ai && sources.ai.items ? sources.ai.items : []).slice(0, 10)
  }

  const publications = Object.entries(sources)
    .filter(([id]) => id !== 'ai')
    .map(([id, src]) => ({ id, items: src.items || [], unordered: src.unordered }))

  if (publications.length === 0) return sources.ai ? (sources.ai.items || []).slice(0, 10) : []

  const universeMap = {}
  publications.forEach(src => {
    src.items.forEach(item => {
      const name = getItemName(item)
      const key = name.toLowerCase().trim()
      if (key && !universeMap[key]) universeMap[key] = name
    })
  })

  const universe = Object.values(universeMap)
  if (universe.length === 0) return sources.ai ? (sources.ai.items || []).slice(0, 10) : []

  const scores = {}
  universe.forEach(item => { scores[item.toLowerCase().trim()] = 0 })

  const bordaFromRank = rank => (rank < 1 || rank > 10) ? 0 : 11 - rank
  // Unordered sources: budget = top-n slice of a ranked top-10
  // (n<=10: flat=(21-n)/2; n>10: flat=55/n). Kept in sync with lib/helpers.js.
  const FLAT_BUDGET = 55
  const flatUnordered = n => (n <= 0 ? 0 : n <= 10 ? (21 - n) / 2 : FLAT_BUDGET / n)

  publications.forEach(src => {
    if (src.unordered) {
      const listed = new Set(src.items.map(i => getItemName(i).toLowerCase().trim()))
      const flat = flatUnordered(listed.size)
      universe.forEach(item => {
        const key = item.toLowerCase().trim()
        if (listed.has(key)) scores[key] += flat
      })
      return
    }
    const pubRanks = {}
    src.items.forEach((item, idx) => {
      const name = getItemName(item)
      if (name) pubRanks[name.toLowerCase().trim()] = idx + 1
    })
    universe.forEach(item => {
      const key = item.toLowerCase().trim()
      if (pubRanks[key] !== undefined) scores[key] += bordaFromRank(pubRanks[key])
    })
  })

  const appearanceCount = {}
  universe.forEach(item => {
    const key = item.toLowerCase().trim()
    appearanceCount[key] = publications.reduce((n, src) => {
      return n + (src.items.some(i => getItemName(i).toLowerCase().trim() === key) ? 1 : 0)
    }, 0)
  })

  const consensusItems = [...universe].sort((a, b) => {
    const ka = a.toLowerCase().trim()
    const kb = b.toLowerCase().trim()
    if (scores[kb] !== scores[ka]) return scores[kb] - scores[ka]
    if (appearanceCount[kb] !== appearanceCount[ka]) return appearanceCount[kb] - appearanceCount[ka]
    return a.localeCompare(b)
  }).slice(0, 10)

  return consensusItems
}

export default async function Image({ params }) {
  const list = LISTS.find(l => l.id === params.id)

  if (!list) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4ead5', fontSize: 60, color: '#1a1a1a' }}>
          <div style={{ display: 'flex' }}>Source of Truths</div>
        </div>
      ),
      { ...size }
    )
  }

  // Load Fraunces (the site masthead serif) so the preview matches the header.
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

  const isUnranked = (list.mode || 'both') === 'unranked'
  const consensusItems = computeConsensus(list)
  const sliced = isUnranked ? consensusItems.slice(0, 5) : consensusItems.slice(5, 10)
  const previewItems = isUnranked ? sliced : sliced.slice().reverse()
  const startPosition = 5 + (isUnranked ? 0 : sliced.length)

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f4ead5', padding: '40px 72px', fontFamily: ff }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 10 }}>
              <div style={{ display: 'flex', fontSize: 42, color: '#1a1a1a', fontWeight: 700, lineHeight: 1 }}>Source of Truths</div>
              <div style={{ display: 'flex', fontSize: 18, color: '#c0392b', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, paddingBottom: 6 }}>
                {list.category || 'Top Ten'}
              </div>
            </div>
            <div style={{ display: 'flex', width: '100%', height: 1, background: '#1a1a1a' }} />
            <div style={{ display: 'flex', width: '100%', height: 3, background: '#c0392b', marginTop: 3 }} />
          </div>
          <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.05, marginBottom: 6, maxWidth: '94%' }}>
            {list.title}
          </div>
          <div style={{ display: 'flex', fontSize: 20, color: '#5a5a5a', fontStyle: 'italic', lineHeight: 1.2 }}>
            {isUnranked ? 'A handpicked set. Not ranked \u2014 just the ones worth owning.' : 'Counting down from ten. Top five revealed on site.'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {previewItems.map((item, idx) => {
            const position = startPosition - idx
            const name = getItemName(item)
            return (
              <div key={position} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#c0392b', width: isUnranked ? 34 : 70, justifyContent: 'flex-end', marginRight: 22, lineHeight: 1.1 }}>
                  {isUnranked ? '\u2022' : String(position)}
                </div>
                <div style={{ display: 'flex', fontSize: 26, color: '#1a1a1a', fontWeight: 500, maxWidth: 900, lineHeight: 1.1 }}>
                  {name || 'Untitled'}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #c4b896', paddingTop: 12, fontSize: 18, color: '#5a5a5a' }}>
          <div style={{ display: 'flex' }}>{isUnranked ? 'See the full set at sourceoftruths.com' : 'See 5 through 1 at sourceoftruths.com'}</div>
          <div style={{ display: 'flex', color: '#c0392b', fontWeight: 600 }}>{isUnranked ? 'Browse the picks' : 'Read the full ranking'}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
