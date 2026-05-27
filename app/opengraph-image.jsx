import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Consensus Gurus - Top Ten Lists from Every Angle';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#f4ede0',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          padding: '40px',
        }}
      >
        {/* Top section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: '14px',
            marginBottom: '20px',
            color: '#999',
          }}
        >
          <span>VOL. 1 NO. 1</span>
          <span>EST. 2026</span>
        </div>

        {/* Top line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#282828',
            marginBottom: '40px',
          }}
        />

        {/* Main text */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            style={{
              fontSize: '110px',
              fontWeight: 'bold',
              margin: '0 0 10px 0',
              color: '#282828',
              letterSpacing: '3px',
            }}
          >
            CONSENSUS
          </h1>
          <h2
            style={{
              fontSize: '85px',
              fontStyle: 'italic',
              margin: '0 0 20px 0',
              color: '#c0392b',
              letterSpacing: '2px',
            }}
          >
            gurus
          </h2>
          <p
            style={{
              fontSize: '18px',
              margin: '0',
              color: '#282828',
            }}
          >
            Top Ten Lists from Every Angle
          </p>
        </div>

        {/* Bottom section */}
        <div
          style={{
            width: '100%',
            marginTop: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          {/* Bottom line */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#282828',
              position: 'absolute',
              bottom: '80px',
              left: '0',
            }}
          />

          {/* Bottom content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              marginTop: '40px',
              fontSize: '13px',
            }}
          >
            <div
              style={{
                backgroundColor: '#282828',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              Consensus Gurus
            </div>
            <div style={{ color: '#999', letterSpacing: '3px' }}>
              VOTE | SHARE | DEBATE
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
