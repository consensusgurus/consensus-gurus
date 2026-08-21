'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// Color Match: 10 pairs, each a color word (dark text) matched to a swatch of
// that color. The word is neutral ink so the player reads it rather than just
// matching colors. Faces are SVG so they scale with the card.
const word = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="52" font-size="22" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#14141a">${t}</text></svg>`;
const swatch = (hex, stroke) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="33" fill="${hex}"${stroke ? ` stroke="${stroke}" stroke-width="3"` : ''}/></svg>`;

const COLORS = [
  ['Red', '#e23b3b'],
  ['Orange', '#ef8a2b'],
  ['Yellow', '#f4c81e'],
  ['Green', '#34a23a'],
  ['Blue', '#2f7be0'],
  ['Purple', '#8a4fd0'],
  ['Pink', '#ee6fae'],
  ['Brown', '#8a5a2b'],
  ['Black', '#2b2b2b'],
  ['White', T.white, '#c8ccd2'],
];

const PAIRS = COLORS.map(([name, hex, stroke]) => ({ a: word(name), b: swatch(hex, stroke), name }));

export default function ColorMatchClient() {
  return (
    <MatchGame
      pairs={PAIRS}
      cols={5}
      quizId="kids-color-match"
      title="Color Match"
      intro="Match each color word to its color, like Red with the red card. Find all ten pairs. Up to four players."
    />
  );
}
