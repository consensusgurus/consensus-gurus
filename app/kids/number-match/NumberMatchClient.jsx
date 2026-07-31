'use client';

import MatchGame from '../MatchGame';

// Number Match: 16 pairs, each a number (blue) matched to its spelling (dark),
// 0 through 15. Faces are SVG text so they scale with the card.
const num = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="51" font-size="46" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#0e1d40">${t}</text></svg>`;
const word = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="51" font-size="${t.length > 6 ? 17 : 21}" font-family="'Manrope', system-ui, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#1c1e24">${t}</text></svg>`;

const SPELL = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen'];

const PAIRS = SPELL.map((w, i) => ({ a: num(String(i)), b: word(w), name: `${i} = ${w}` }));

export default function NumberMatchClient() {
  return (
    <MatchGame
      pairs={PAIRS}
      cols={8}
      quizId="kids-number-match"
      title="Number Match"
      intro="Match each number to its spelling, like 7 with Seven. Find all sixteen pairs, 0 to 15. Up to four players."
    />
  );
}
