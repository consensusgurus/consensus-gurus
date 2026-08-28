// The one-pager: the whole consensus board as a single shareable PNG.
//
// Rendered by next/og (Satori), which is flex-only and does NOT resolve CSS
// custom properties, so every colour here is a literal hex from lib/theme.js
// rather than a var(). Same constraint the list poster route works under.
//
// NO TEAM LOGOS ON PURPOSE. Satori fetches every remote image at render time,
// and fifty of them would make the route slow and give it fifty ways to fail.
// Fifty 26px logos also read as noise at this size. Rank, team and score carry
// it, which is what makes the sheet legible as a one-pager.
import { ImageResponse } from 'next/og';
import { computeComposite } from '@/lib/gridiron';

// lib/theme.js values, inlined: Satori silently drops var().
const PAL = {
  ground: '#0b0f1a', ink: '#0b0d12', white: '#ffffff',
  accent: '#233a63', blue: '#2563eb', blue400: '#60a5fa',
  slate: '#646c7a', muted: '#3f4757', border: '#e5e7eb', surface: '#f7f8fa',
  gold: '#e8b43a', silver: '#aeb4bd', bronze: '#c88a55',
};
const MEDAL = [PAL.gold, PAL.silver, PAL.bronze];

const TIER_LABEL = {
  market: 'Betting markets', model: 'Analytics models',
  media: 'Media rankings', official: 'Official polls',
};
const TIER_ORDER = ['market', 'model', 'media', 'official'];

async function loadFont(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

function Row({ r, height, fontScale }) {
  const medal = r.rank <= 3 ? MEDAL[r.rank - 1] : null;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', height,
        borderTop: `1px solid ${PAL.border}`, paddingLeft: 4, paddingRight: 4,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 28, marginRight: 12, flexShrink: 0,
          borderRadius: 6,
          background: medal || 'transparent',
          color: medal ? PAL.white : PAL.slate,
          fontSize: 19 * fontScale, fontWeight: 800,
        }}
      >
        {r.rank}
      </div>
      <div
        style={{
          display: 'flex', flexGrow: 1, overflow: 'hidden',
          fontSize: 22 * fontScale, fontWeight: 700, color: PAL.ink,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        }}
      >
        {r.team}
      </div>
      <div
        style={{
          display: 'flex', flexShrink: 0, marginLeft: 10,
          fontSize: 19 * fontScale, fontWeight: 800, color: PAL.accent,
        }}
      >
        {r.score.toFixed(1)}
      </div>
    </div>
  );
}

export async function renderGridironPoster({ sources, sport, fetchedAt, title, eyebrow, url }) {
  const { ranked, tierShare, depth } = computeComposite(sources, sport);

  const [w800, w700, w600] = await Promise.all([
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-800-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-700-normal.woff'),
    loadFont('https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-600-normal.woff'),
  ]);
  const fonts = [];
  if (w800) fonts.push({ name: 'Manrope', data: w800, weight: 800, style: 'normal' });
  if (w700) fonts.push({ name: 'Manrope', data: w700, weight: 700, style: 'normal' });
  if (w600) fonts.push({ name: 'Manrope', data: w600, weight: 600, style: 'normal' });

  const W = 1200;
  const perCol = Math.ceil(ranked.length / 2);
  const rowH = depth > 32 ? 50 : 52;
  const fontScale = depth > 32 ? 0.94 : 1;
  const H = 232 + perCol * rowH + 76;

  const left = ranked.slice(0, perCol);
  const right = ranked.slice(perCol);

  const weightLine = TIER_ORDER
    .filter((t) => tierShare[t])
    .map((t) => `${TIER_LABEL[t]} ${Math.round(tierShare[t] * 100)}%`)
    .join('   ·   ');

  return new ImageResponse(
    (
      <div style={{
        width: W, height: H, display: 'flex', flexDirection: 'column',
        background: PAL.white, fontFamily: 'Manrope',
      }}>
        {/* masthead */}
        <div style={{
          display: 'flex', flexDirection: 'column', background: PAL.ground,
          padding: '30px 52px 26px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', fontSize: 22, fontWeight: 800, color: PAL.white, letterSpacing: '-0.02em' }}>
              Source of <span style={{ color: PAL.blue400, marginLeft: 7 }}>Truths</span>
            </div>
            <div style={{ display: 'flex', fontSize: 13, fontWeight: 700, color: '#9fb0cc', letterSpacing: '0.14em' }}>
              {eyebrow.toUpperCase()}
            </div>
          </div>
          <div style={{
            display: 'flex', marginTop: 14, fontSize: 52, fontWeight: 800,
            color: PAL.white, letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            {title}
          </div>
          <div style={{ display: 'flex', marginTop: 12, fontSize: 15, fontWeight: 600, color: '#9fb0cc' }}>
            {weightLine}
          </div>
        </div>
        {/* the gradient brand rule, as on the site masthead */}
        <div style={{
          display: 'flex', height: 4, flexShrink: 0,
          background: `linear-gradient(90deg, ${PAL.accent}, ${PAL.blue} 55%, ${PAL.blue400})`,
        }} />

        {/* two columns */}
        <div style={{ display: 'flex', flexGrow: 1, padding: '14px 52px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0, marginRight: 34 }}>
            {left.map((r) => <Row key={r.team} r={r} height={rowH} fontScale={fontScale} />)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0 }}>
            {right.map((r) => <Row key={r.team} r={r} height={rowH} fontScale={fontScale} />)}
          </div>
        </div>

        {/* footer */}
        <div style={{
          display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 52px 24px', fontSize: 13, fontWeight: 700, color: PAL.slate,
        }}>
          <div style={{ display: 'flex' }}>{`Consensus of every published ranking  ·  built ${fetchedAt}`}</div>
          <div style={{ display: 'flex', color: PAL.accent }}>{url}</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts }
  );
}
