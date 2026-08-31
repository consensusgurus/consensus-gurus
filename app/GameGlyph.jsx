// THE ONE GLYPH COMPONENT. There were six hand-written copies of this drawing
// (StageToday, LoftFinish, StageFinish, CircuitScorecard, and two inline in the
// circuit pages) — the fifth-mirror trap this project keeps paying for. Import
// it; do not retype it.
//
// ⚠️ THE `on` PROP EXISTS BECAUSE I GOT THE COLOUR WRONG THREE TIMES IN A ROW.
//
// Every game carries TWO colours, and which one a `color` field holds depends
// on the surface, NOT on the field name:
//
//     registry `color`      dark   — for a light card
//     registry `colorNavy`  bright — for a dark panel
//
// but a page whose header is navy hands its children a `g.color` that is
// ALREADY `colorNavy` (CircuitLanding does exactly this), so reading `g.color`
// or a `--cc` set from it gives you the opposite of what you reasoned about.
// Both mistakes render — a pastel on white, or a near-black on navy — so they
// survive every check that is not a pair of eyes on the live page.
//
// So callers no longer name a colour. They name their GROUND, and this resolves
// the variant from the registry by key, which is unambiguous:
//
//     on="light"    a white/tinted card      -> color
//     on="dark"     a navy/dark panel        -> colorNavy
//     on="inherit"  take the parent's ink    -> currentColor (the default)
import { GLYPHS, GLYPH_BOX } from '@/lib/game-glyphs';
import { DAILY_GAME_MAP } from '@/lib/daily-games';

export default function GameGlyph({ gameKey, size = 22, on = 'inherit', className, style }) {
  const d = GLYPHS[gameKey];
  if (!d) return null;
  const g = DAILY_GAME_MAP[gameKey] || {};
  const ink = on === 'light' ? (g.color || '#33415c')
    : on === 'dark' ? (g.colorNavy || '#eef2fa')
    : undefined;
  return (
    <svg className={className} style={ink ? { color: ink, ...style } : style}
      viewBox={GLYPH_BOX} width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
}
