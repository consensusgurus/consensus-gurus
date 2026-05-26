import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Consensus Gurus — Top Ten Lists from Every Angle';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLORS = {
  cream: '#f4ede0',
  ink: '#1a1611',
  ember: '#c0392b',
  faded: '#7a6f5e',
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: COLORS.cream,
          color: COLORS.ink,
          padding: '52px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `2px solid ${COLORS.ink}`,
            paddingBottom: 14,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: COLORS.faded,
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'flex' }}>Vol. I · No. 1</span>
          <span style={{ display: 'flex' }}>Est. 2026</span>
        </div>

        {/* Big title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <h1
            style={{
              fontFamily: 'serif',
              fontWeight: 900,
              fontSize: 180,
              lineHeight: 0.85,
              letterSpacing: -6,
              margin: 0,
              color: COLORS.ink,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ display: 'flex' }}>CONSENSUS</span>
            <span style={{ display: 'flex', fontStyle: 'italic', color: COLORS.ember, fontSize: 160 }}>
              gurus
            </span>
          </h1>
          <p
            style={{
              fontFamily: 'serif',
              fontStyle: 'italic',
              fontSize: 26,
              color: COLORS.faded,
              margin: '28px 0 0',
              maxWidth: 720,
              lineHeight: 1.3,
            }}
          >
            Top ten lists from every angle. AI, consensus, publications, and reader votes.
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `2px solid ${COLORS.ink}`,
            paddingTop: 12,
            fontSize: 14,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: COLORS.ink,
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'flex' }}>consensusgurus.com</span>
          <span style={{ display: 'flex', color: COLORS.faded }}>Vote · Share · Debate</span>
        </div>
      </div>
    ),
    size
  );
}
