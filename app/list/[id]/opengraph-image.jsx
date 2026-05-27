import { ImageResponse } from 'next/og';
import { LISTS } from '@/lib/data';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateImageMetadata({ params }) {
  const list = LISTS.find((l) => l.id === params.id);
  return { alt: list?.title || 'Consensus Gurus' };
}

export default async function Image({ params }) {
  const list = LISTS.find((l) => l.id === params.id);
  const title = list?.title || 'Consensus Gurus';

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
          padding: '60px',
        }}
      >
        <div style={{ height: '1px', width: '100%', backgroundColor: '#282828', marginBottom: '40px' }} />
        <div style={{ fontSize: '16px', color: '#999', marginBottom: '20px', letterSpacing: '4px' }}>
          CONSENSUS GURUS
        </div>
        <h1
          style={{
            fontSize: title.length > 40 ? '48px' : '64px',
            fontWeight: 'bold',
            color: '#282828',
            textAlign: 'center',
            margin: '0 0 30px 0',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <div style={{ fontSize: '18px', color: '#c0392b', fontStyle: 'italic' }}>
          Ranked by Expert Consensus
        </div>
        <div style={{ height: '1px', width: '100%', backgroundColor: '#282828', marginTop: '40px' }} />
      </div>
    ),
    size,
  );
}
