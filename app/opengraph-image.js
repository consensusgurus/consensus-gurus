import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Consensus Gurus - Top Ten Lists from Every Angle'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f4ead5',
          padding: '48px 80px',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: '#999',
            letterSpacing: 3,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex' }}>VOL. 1 NO. 1</div>
          <div style={{ display: 'flex' }}>EST. 2026</div>
        </div>

        {/* Center: masthead */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 2,
              background: '#1a1a1a',
              marginBottom: 32,
            }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 108,
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: 6,
              textTransform: 'uppercase',
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            CONSENSUS
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontStyle: 'italic',
              color: '#c0392b',
              letterSpacing: 4,
              lineHeight: 1,
              marginBottom: 28,
            }}
          >
            gurus
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: '#1a1a1a',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Top Ten Lists from Every Angle
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: 2,
              background: '#1a1a1a',
              marginTop: 32,
            }}
          />
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: '#1a1a1a',
              color: '#f4ead5',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '8px 20px',
              textTransform: 'uppercase',
            }}
          >
            Consensus Gurus
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 16,
              color: '#999',
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            VOTE · SHARE · DEBATE
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
