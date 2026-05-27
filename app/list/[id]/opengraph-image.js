import { ImageResponse } from 'next/og'
import { LISTS } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Consensus Gurus list preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function getItemName(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.name || item.title || item.label || ''
}

function computeConsensus(list) {
  const sources = list.sources || {}
  const publications = Object.entries(sources)
    .filter(([id]) => id !== 'ai' && id !== 'consensus')
    .map(([id, src]) => ({
      id,
      items: Array.isArray(src) ? src : (src && Array.isArray(src.items) ? src.items : [])
    }))
    .filter(pub => pub.items.length > 0)

  if (publications.length === 0) {
    return (sources.ai && sources.ai.items) || []
  }

  const universeMap = {}
  publications.forEach(src => {
    src.items.forEach(item => {
      const name = getItemName(item)
      if (name) universeMap[name.toLowerCase().trim()] = name
    })
  })
  const universe = Object.values(universeMap)
  if (universe.length === 0) return (sources.ai && sources.ai.items) || []

  const scores = {}
  universe.forEach(item => { scores[item.toLowerCase().trim()] = 0 })

  publications.forEach(src => {
    const pubRanks = {}
    src.items.forEach((item, idx) => {
      const name = getItemName(item)
      if (name) pubRanks[name.toLowerCase().trim()] = idx + 1
    })
    const rankedKeys = Object.keys(pubRanks)
    const avgScore = rankedKeys.length > 0
      ? rankedKeys.reduce((sum, k) => sum + Math.max(0, 11 - pubRanks[k]), 0) / rankedKeys.length
      : 0
    universe.forEach(item => {
      const key = item.toLowerCase().trim()
      scores[key] += pubRanks[key] !== undefined ? Math.max(0, 11 - pubRanks[key]) : avgScore
    })
  })

  return [...universe].sort((a, b) => {
    const ka = a.toLowerCase().trim()
    const kb = b.toLowerCase().trim()
    return scores[kb] - scores[ka]
  })
}

export default async function Image({ params }) {
  const list = LISTS.find(l => l.id === params.id)

  if (!list) {
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4ead5', fontSize: 60, color: '#1a1a1a' }}>
          <div style={{ display: 'flex' }}>Consensus Gurus</div>
        </div>
      ),
      { ...size }
    )
  }

  const consensusItems = computeConsensus(list)
  const sliced = consensusItems.slice(5, 10)
  const previewItems = sliced.slice().reverse()
  const startPosition = 5 + sliced.length

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f4ead5', padding: '40px 72px' }}>
        {/* TOP SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Masthead */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 18, borderBottom: '1px solid #1a1a1a', boxShadow: 'inset 0 -6px 0 #f4ead5, inset 0 -7px 0 #1a1a1a' }}>
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 4, textTransform: 'uppercase', color: '#1a1a1a', fontWeight: 600 }}>
              Consensus Gurus
            </div>
            <div style={{ display: 'flex', fontSize: 18, color: '#c0392b', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600 }}>
              {list.category || 'Top Ten'}
            </div>
          </div>
          {/* Title */}
          <div style={{ display: 'flex', fontSize: 48, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.05, marginBottom: 6, maxWidth: '94%' }}>
            {list.title}
          </div>
          {/* Teaser */}
          <div style={{ display: 'flex', fontSize: 20, color: '#5a5a5a', fontStyle: 'italic', lineHeight: 1.2 }}>
            Counting down from ten. Top five revealed on site.
          </div>
        </div>

        {/* MIDDLE SECTION: consensus items 10 through 6 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {previewItems.map((item, idx) => {
            const position = startPosition - idx
            const name = getItemName(item)
            return (
              <div key={position} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <div style={{ display: 'flex', fontSize: 36, fontWeight: 700, color: '#c0392b', width: 70, justifyContent: 'flex-end', marginRight: 22, lineHeight: 1.1 }}>
                  {String(position)}
                </div>
                <div style={{ display: 'flex', fontSize: 26, color: '#1a1a1a', fontWeight: 500, maxWidth: 900, lineHeight: 1.1 }}>
                  {name || 'Untitled'}
                </div>
              </div>
            )
          })}
        </div>

        {/* BOTTOM SECTION: footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #c4b896', paddingTop: 12, fontSize: 18, color: '#5a5a5a' }}>
          <div style={{ display: 'flex' }}>See 5 through 1 at consensusgurus.com</div>
          <div style={{ display: 'flex', color: '#c0392b', fontWeight: 600 }}>Read the full ranking</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
