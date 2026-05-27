import { ImageResponse } from 'next/og';
import { LISTS } from '@/lib/data';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

/**
 * Compute Consensus ranking using Borda scoring
 */
function computeConsensus(list) {
  const sources = list.sources || {};
  
  // Get all publications (exclude 'ai' source)
  const publications = Object.entries(sources)
    .filter(([id]) => id !== 'ai')
    .map(([id, src]) => ({
      id,
      label: src.label,
      items: src.items || []
    }));
  
  if (publications.length === 0) {
    return sources.ai?.items || [];
  }
  
  // Gather universe of all items
  const universeMap = {};
  publications.forEach((src) => {
    src.items.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (!universeMap[key]) universeMap[key] = item;
    });
  });
  
  const universe = Object.values(universeMap);
  if (universe.length === 0) return [];
  
  // Borda scoring
  const scores = {};
  universe.forEach((item) => {
    scores[item.toLowerCase().trim()] = 0;
  });
  
  const bordaFromRank = (rank) => {
    if (rank < 1 || rank > 10) return 0;
    return 11 - rank;
  };
  
  // Score each publication
  publications.forEach((src) => {
    const pubRanks = {};
    src.items.forEach((item, idx) => {
      pubRanks[item.toLowerCase().trim()] = idx + 1;
    });
    
    const rankedKeys = Object.keys(pubRanks);
    let avgScore = 0;
    if (rankedKeys.length > 0) {
      const total = rankedKeys.reduce(
        (sum, k) => sum + bordaFromRank(pubRanks[k]),
        0
      );
      avgScore = total / rankedKeys.length;
    }
    
    universe.forEach((item) => {
      const key = item.toLowerCase().trim();
      if (pubRanks[key] !== undefined) {
        scores[key] += bordaFromRank(pubRanks[key]);
      } else {
        scores[key] += avgScore;
      }
    });
  });
  
  // Tie-breaker: appearance count
  const appearanceCount = {};
  universe.forEach((item) => {
    const key = item.toLowerCase().trim();
    appearanceCount[key] = publications.reduce((n, src) => {
      return (
        n +
        (src.items.some((i) => i.toLowerCase().trim() === key) ? 1 : 0)
      );
    }, 0);
  });
  
  // Sort by score, then appearance count, then alphabetically
  const consensusItems = [...universe]
    .sort((a, b) => {
      const ka = a.toLowerCase().trim();
      const kb = b.toLowerCase().trim();
      if (scores[kb] !== scores[ka]) return scores[kb] - scores[ka];
      if (appearanceCount[kb] !== appearanceCount[ka]) {
        return appearanceCount[kb] - appearanceCount[ka];
      }
      return a.localeCompare(b);
    });
  
  return consensusItems;
}

export async function generateImageMetadata({ params }) {
  const list = LISTS.find((l) => l.id === params.id);
  if (!list) {
    return {
      alt: 'List Not Found',
    };
  }
  return {
    alt: list.title,
  };
}

export default async function Image({ params }) {
  const list = LISTS.find((l) => l.id === params.id);
  
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
            backgroundColor: '#f4ede0',
            fontSize: '32px',
          }}
        >
          List not found
        </div>
      ),
      size,
    );
  }
  
  // Compute consensus and get items 6-10
  const consensusItems = computeConsensus(list);
  const items610 = consensusItems.slice(5, 10);
  
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#f4ede0',
          fontFamily: 'Georgia, serif',
          padding: '40px',
          position: 'relative',
        }}
      >
        {/* Top line */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#282828',
            marginBottom: '30px',
          }}
        />

        {/* Title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            margin: '0 0 30px 0',
            color: '#282828',
            textAlign: 'center',
          }}
        >
          {list.title}
        </h1>

        {/* Label */}
        <div
          style={{
            fontSize: '22px',
            color: '#c0392b',
            marginBottom: '20px',
            fontWeight: 'bold',
          }}
        >
          6-10 of Consensus:
        </div>

        {/* Items 6-10 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {items610.map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: '22px',
                color: '#282828',
              }}
            >
              {i + 6}. {item.length > 70 ? item.substring(0, 70) + '...' : item}
            </div>
          ))}
        </div>

        {/* Bottom spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom line */}
        <div
          style={{
            height: '1px',
            backgroundColor: '#282828',
            marginBottom: '20px',
          }}
        />

        {/* Footer */}
        <div
          style={{
            fontSize: '14px',
            color: '#646464',
            textAlign: 'center',
          }}
        >
          Ranked by Expert Consensus | Consensus Gurus
        </div>
      </div>
    ),
    size,
  );
}
