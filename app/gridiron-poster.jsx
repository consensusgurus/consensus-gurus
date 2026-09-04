import fs from 'node:fs';
import path from 'node:path';
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

const TIER_LABEL = { results: 'Results', market: 'Betting markets', model: 'Analytics models' };
const TIER_ORDER = ['results', 'market', 'model'];

// Fonts come off disk, not the network (2026-09-04). Fetching a woff from a CDN
// inside an image route means Satori throws "No fonts are loaded" the moment
// that CDN is unreachable, which turns a hiccup into a 500. @fontsource/manrope
// is a dependency; read it.
function loadFont(rel) {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'node_modules', rel));
  } catch (e) {
    return null;
  }
}

function Row({ r, height, fontScale, dp = 1 }) {
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
          fontSize: (r.tied ? 16 : 19) * fontScale, fontWeight: 800,
        }}
      >
        {/* Tied teams print T<rank>, as on the page and in the PDF. */}
        {r.tied ? `T${r.rank}` : r.rank}
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
        {(r.score > 0 ? '+' : '') + r.score.toFixed(dp)}
      </div>
    </div>
  );
}

export async function renderGridironPoster({ block, sport, fetchedAt, title, eyebrow, url }) {
  const { ranked, tierShare, depth } = computeComposite(block, sport);

  const [w800, w700, w600] = await Promise.all([
    loadFont('@fontsource/manrope/files/manrope-latin-800-normal.woff'),
    loadFont('@fontsource/manrope/files/manrope-latin-700-normal.woff'),
    loadFont('@fontsource/manrope/files/manrope-latin-600-normal.woff'),
  ]);
  const fonts = [];
  if (w800) fonts.push({ name: 'Manrope', data: w800, weight: 800, style: 'normal' });
  if (w700) fonts.push({ name: 'Manrope', data: w700, weight: 700, style: 'normal' });
  if (w600) fonts.push({ name: 'Manrope', data: w600, weight: 600, style: 'normal' });

  // The sheet grows SIDEWAYS, not downwards (2026-09-04). Two columns held 50
  // rows at a sane shape; the full FBS board in two columns is 69 rows a side,
  // a 1200x3758 ribbon that no feed will render and nobody can read. The column
  // stays a fixed 600px so a row renders exactly as it always did, and the
  // sheet takes as many columns as the board needs: 2 up to 100 teams, 3 for
  // the FBS, capped at 4 so a column never gets too narrow for a team name.
  const COL_W = 600;
  const cols = Math.min(4, Math.max(2, Math.ceil(ranked.length / 50)));
  const W = COL_W * cols;
  const perCol = Math.ceil(ranked.length / cols);
  // See the note on `scoreDp` in app/GridironTable.jsx: a run-scale board needs
  // a second decimal or a third of its rows print "-0.0".
  const sv = ranked.map((r) => r.score);
  const dp = Math.max(...sv) - Math.min(...sv) < 5 ? 2 : 1;
  const rowH = depth > 32 ? 50 : 52;
  const fontScale = depth > 32 ? 0.94 : 1;
  const H = 232 + perCol * rowH + 76;

  const columns = Array.from({ length: cols }, (_, i) => ranked.slice(i * perCol, (i + 1) * perCol));

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

        {/* the board, in as many columns as it takes. Satori is flex-only, so
            these are explicit flex children with flexBasis 0 rather than a grid. */}
        <div style={{ display: 'flex', flexGrow: 1, padding: '14px 52px 0' }}>
          {columns.map((colRows, i) => (
            <div
              key={i}
              style={{
                display: 'flex', flexDirection: 'column', flexGrow: 1, flexBasis: 0,
                marginRight: i === columns.length - 1 ? 0 : 34,
              }}
            >
              {colRows.map((r) => <Row key={r.team} r={r} height={rowH} fontScale={fontScale} dp={dp} />)}
            </div>
          ))}
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
