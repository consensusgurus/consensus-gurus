'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// Addition Match: 14 pairs, each an addition equation (dark) matched to its
// answer (blue). Answers are all distinct so every card has exactly one match.
// Faces are SVG text so they scale with the card.
const eq = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="51" font-size="24" font-family="'Manrope', system-ui, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#0b0d12">${t}</text></svg>`;
const ans = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="51" font-size="46" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill="#233a63">${t}</text></svg>`;

const SUMS = [
  ['0 + 1', 1], ['1 + 1', 2], ['1 + 2', 3], ['1 + 3', 4], ['2 + 3', 5],
  ['2 + 4', 6], ['3 + 4', 7], ['3 + 5', 8], ['4 + 5', 9], ['4 + 6', 10],
  ['5 + 6', 11], ['5 + 7', 12], ['6 + 7', 13], ['6 + 8', 14],
];

const PAIRS = SUMS.map(([q, sum]) => ({ a: eq(q), b: ans(String(sum)), name: `${q} = ${sum}` }));

export default function AdditionMatchClient() {
  return (
    <MatchGame
      pairs={PAIRS}
      cols={7}
      quizId="kids-addition-match"
      title="Addition Match"
      intro="Match each addition to its answer, like 1 + 3 with 4. Find all fourteen pairs. Play on your own, or with up to four players."
    />
  );
}
