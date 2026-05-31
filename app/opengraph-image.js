import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Consensus Gurus - Where Experts Agree'
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
          background: '#f4ede0',
          padding: '56px 96px 48px',
        }}
      >
        {/* Vol / Est row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 14,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#999',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex' }}>Vol. I · No. 1</div>
          <div style={{ display: 'flex' }}>Est. 2026</div>
        </div>

        {/* Main title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            borderTop: '2px solid #282828',
            borderBottom: '2px solid #282828',
            paddingTop: 40,
            paddingBottom: 40,
          }}
        >
          {/* CONSENSUS */}
          <div
            style={{
              display: 'flex',
              fontSize: 130,
              fontWeight: 900,
              color: '#282828',
              letterSpacing: -5,
              lineHeight: 0.85,
              marginBottom: 4,
            }}
          >
            CONSENSUS
          </div>
          {/* gurus italic red */}
          <div
            style={{
              display: 'flex',
              fontSize: 130,
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#c0392b',
              letterSpacing: -5,
              lineHeight: 0.85,
              marginBottom: 32,
            }}
          >
            gurus
          </div>
          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#282828',
              letterSpacing: 1,
            }}
          >
            Where Experts Agree
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 28,
            fontSize: 14,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: '#999',
          }}
        >
          <div style={{ display: 'flex' }}>consensusgurus.com</div>
          <div style={{ display: 'flex' }}>Vote · Share · Debate</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
