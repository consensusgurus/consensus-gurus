'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// Letter Match: 26 pairs (52 cards), each a capital letter (dark) matched to its
// lowercase letter (blue). Faces are SVG text so they scale with the card. The
// board is capped (boardMax) so squares stay modest on desktop, and the fluid
// engine sizing shrinks them to fit a phone screen (larger on desktop/tablet).
const up = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="53" font-size="56" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#14141a">${t}</text></svg>`;
const lo = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="53" font-size="56" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#3a4152">${t}</text></svg>`;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const PAIRS = LETTERS.map((L) => ({ a: up(L), b: lo(L.toLowerCase()), name: `${L} ${L.toLowerCase()}` }));

export default function LetterMatchClient() {
  return (
    <MatchGame
      pairs={PAIRS}
      cols={16}
      maxCard={72}
      quizId="kids-letter-match"
      title="Letter Match"
      intro="Match each capital letter to its lowercase letter, like A with a. Find all twenty-six pairs. Play on your own, or with up to four players."
    />
  );
}
