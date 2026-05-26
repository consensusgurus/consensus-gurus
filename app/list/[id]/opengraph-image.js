import { ImageResponse } from 'next/og'
import { LISTS } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Consensus Gurus list preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }) {
  const list = LISTS.find(l => l.id === params.id)

  if (!list) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f4ead5',
            fontSize: 60,
            fontFamily: 'serif',
            color: '#1a1a1a',
          }}
        >
          Consensus Gurus
        </div>
      ),
      { ...size }
    )
  }

  const rawItems =
    (list.sources && list.sources.ai && list.sources.ai.items) ||
    (list.vote && list.vote.items) ||
    []

  // Positions 6 through 10, reversed so they render as 10, 9, 8, 7, 6
  const previewItems = rawItems.slice(5, 10).reverse()
  const startPosition = 5 + previewItems.length // first row position (10 when list is full)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f4ead5',
          padding: '48px 72px',
          fontFamily: 'serif',
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px double #1a1a1a',
            paddingBottom: 14,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#1a1a1a',
              fontWeight: 600,
            }}
          >
            Consensus Gurus
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              color: '#c0392b',
              textTransform: 'uppercase',
              letterSpacing: 2,
              fontWeight: 600,
            }}
          >
            {list.category || 'Top Ten'}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 56,
            fontWeight: 700,
            color: '#1a1a1a',
            lineHeight: 1.05,
            marginBottom: 10,
            maxWidth: '92%',
          }}
        >
          {list.title}
        </div>

        {/* Teaser line */}
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#5a5a5a',
            fontStyle: 'italic',
            marginBottom: 22,
          }}
        >
          Counting down from ten. Top five revealed on site.
        </div>

        {/* Items 10 through 6 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 6,
          }}
        >
          {previewItems.map((item, idx) => {
            const position = startPosition - idx
            const name =
              typeof item === 'string'
                ? item
                : (item && (item.name || item.title)) || ''
            return (
              <div
                key={position}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 44,
                    fontWeight: 700,
                    color: '#c0392b',
                    minWidth: 78,
                    justifyContent: 'flex-end',
                  }}
                >
                  {position}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontSize: 32,
                    color: '#1a1a1a',
                    fontWeight: 500,
                    maxWidth: 920,
                  }}
                >
                  {name}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #c4b896',
            paddingTop: 12,
            marginTop: 16,
            fontSize: 20,
            color: '#5a5a5a',
          }}
        >
          <div style={{ display: 'flex' }}>
            See 5 through 1 at consensusgurus.com
          </div>
          <div style={{ display: 'flex', color: '#c0392b', fontWeight: 600 }}>
            Read the full ranking
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}