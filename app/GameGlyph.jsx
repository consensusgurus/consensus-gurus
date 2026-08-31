// THE ONE GLYPH COMPONENT. There were four hand-written copies of this six-line
// function (StageToday, LoftFinish, StageFinish, CircuitScorecard) and three
// more surfaces about to need it — which is the fifth-mirror trap this project
// keeps paying for. Import it; do not retype it.
//
// It paints in `currentColor` and takes NO opinion about which colour that is,
// because only the caller knows its ground. The registry carries two variants
// per game and they are not interchangeable:
//
//     color      dark  — for a light card (#fff, --surface, a tinted tile)
//     colorNavy  bright — for a dark panel (the navy circuit tiles)
//
// Using the wrong one is not a crash, it is a pastel on white or a near-black
// on navy, which is why it survives every check that is not a pair of eyes.
import { GLYPHS, GLYPH_BOX } from '@/lib/game-glyphs';

export default function GameGlyph({ gameKey, size = 22, className, style }) {
  const d = GLYPHS[gameKey];
  if (!d) return null;
  return (
    <svg className={className} style={style} viewBox={GLYPH_BOX} width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
}
