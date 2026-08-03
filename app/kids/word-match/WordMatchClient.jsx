'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// Word Match: 12 pairs, each an everyday word (dark text) matched to a picture
// of that thing, drawn as inline SVG. Like Color Match but word <-> picture.
const word = (t) => `<svg viewBox="0 0 100 100"><text x="50" y="51" font-size="${t.length > 7 ? 15 : t.length > 5 ? 18 : 22}" font-family="'Manrope', system-ui, sans-serif" font-weight="800" text-anchor="middle" dominant-baseline="central" fill=T.ink>${t}</text></svg>`;

const ITEMS = [
  ['School bus', '<svg viewBox="0 0 100 100"><rect x="14" y="38" width="72" height="34" rx="6" fill="#f5c518"/><rect x="20" y="44" width="12" height="11" rx="2" fill="#bfe3f5"/><rect x="36" y="44" width="12" height="11" rx="2" fill="#bfe3f5"/><rect x="52" y="44" width="12" height="11" rx="2" fill="#bfe3f5"/><rect x="68" y="44" width="12" height="11" rx="2" fill="#bfe3f5"/><rect x="14" y="62" width="72" height="5" fill="#e0a800"/><circle cx="30" cy="74" r="7" fill="#2a2a2a"/><circle cx="70" cy="74" r="7" fill="#2a2a2a"/></svg>'],
  ['House', '<svg viewBox="0 0 100 100"><path d="M20 46 L50 22 L80 46 Z" fill={T.danger}/><rect x="28" y="46" width="44" height="34" fill="#e8b06a"/><rect x="44" y="58" width="12" height="22" fill="#7a4a22"/><rect x="33" y="52" width="9" height="9" fill="#bfe3f5"/><rect x="58" y="52" width="9" height="9" fill="#bfe3f5"/></svg>'],
  ['Dog', '<svg viewBox="0 0 100 100"><ellipse cx="30" cy="48" rx="9" ry="16" fill="#a06a2e"/><ellipse cx="70" cy="48" rx="9" ry="16" fill="#a06a2e"/><circle cx="50" cy="50" r="24" fill="#c8893a"/><ellipse cx="50" cy="62" rx="12" ry="10" fill="#e8c08a"/><circle cx="50" cy="58" r="3.5" fill="#2a1a0a"/><circle cx="42" cy="46" r="3" fill="#2a1a0a"/><circle cx="58" cy="46" r="3" fill="#2a1a0a"/></svg>'],
  ['Cat', '<svg viewBox="0 0 100 100"><path d="M28 34 L32 18 L46 30 Z" fill="#8a8f98"/><path d="M72 34 L68 18 L54 30 Z" fill="#8a8f98"/><circle cx="50" cy="52" r="24" fill="#9aa0aa"/><circle cx="42" cy="48" r="3" fill="#2a2a2a"/><circle cx="58" cy="48" r="3" fill="#2a2a2a"/><path d="M50 56 l-3 4 h6 z" fill="#e88b9a"/><path d="M50 60 q-5 4 -12 2 M50 60 q5 4 12 2" stroke="#5a5f68" stroke-width="1.5" fill="none"/></svg>'],
  ['Sun', '<svg viewBox="0 0 100 100"><g stroke="#f5b800" stroke-width="4" stroke-linecap="round"><path d="M50 14 V24"/><path d="M50 76 V86"/><path d="M14 50 H24"/><path d="M76 50 H86"/><path d="M24 24 l7 7"/><path d="M69 69 l7 7"/><path d="M76 24 l-7 7"/><path d="M31 69 l-7 7"/></g><circle cx="50" cy="50" r="18" fill="#f5c518"/></svg>'],
  ['Tree', '<svg viewBox="0 0 100 100"><rect x="45" y="58" width="10" height="26" fill="#7a4a22"/><circle cx="50" cy="44" r="22" fill="#3aa24a"/><circle cx="34" cy="50" r="13" fill="#34953f"/><circle cx="66" cy="50" r="13" fill="#34953f"/></svg>'],
  ['Apple', '<svg viewBox="0 0 100 100"><circle cx="42" cy="56" r="18" fill="#e23b3b"/><circle cx="58" cy="56" r="18" fill="#e23b3b"/><rect x="48" y="26" width="4" height="14" rx="2" fill="#7a4a22"/><path d="M52 30 q10 -6 15 1 q-9 6 -15 -1z" fill="#3aa24a"/></svg>'],
  ['Ball', '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="#2f7be0"/><path d="M50 24 q14 26 0 52" stroke={T.white} stroke-width="3" fill="none"/><path d="M24 50 q26 -10 52 0" stroke={T.white} stroke-width="3" fill="none"/><circle cx="50" cy="50" r="26" fill="none" stroke="#1f5aa8" stroke-width="2"/></svg>'],
  ['Fish', '<svg viewBox="0 0 100 100"><path d="M62 50 L84 38 L84 62 Z" fill="#ef8a2b"/><ellipse cx="44" cy="50" rx="28" ry="18" fill="#f5a73a"/><circle cx="30" cy="46" r="3" fill="#2a2a2a"/><path d="M44 40 q6 4 0 8 M52 38 q7 5 0 10" stroke="#e0852a" stroke-width="2" fill="none"/></svg>'],
  ['Car', '<svg viewBox="0 0 100 100"><path d="M18 64 L24 50 Q28 44 38 44 L62 44 Q70 44 76 52 L82 64 Z" fill="#e23b3b"/><path d="M34 48 L60 48 L64 56 L30 56 Z" fill="#bfe3f5"/><rect x="16" y="62" width="68" height="8" rx="4" fill={T.danger}/><circle cx="32" cy="70" r="8" fill="#2a2a2a"/><circle cx="68" cy="70" r="8" fill="#2a2a2a"/></svg>'],
  ['Star', '<svg viewBox="0 0 100 100"><path d="M50 16 L61 40 L87 43 L67 61 L73 87 L50 73 L27 87 L33 61 L13 43 L39 40 Z" fill="#f5c518"/></svg>'],
  ['Flower', '<svg viewBox="0 0 100 100"><rect x="48" y="50" width="4" height="34" fill="#3aa24a"/><path d="M52 70 q12 -2 14 -10 q-10 0 -14 10z" fill="#3aa24a"/><g fill="#ee6fae"><circle cx="50" cy="28" r="11"/><circle cx="68" cy="40" r="11"/><circle cx="61" cy="60" r="11"/><circle cx="39" cy="60" r="11"/><circle cx="32" cy="40" r="11"/></g><circle cx="50" cy="44" r="10" fill="#f5c518"/></svg>'],
];

const PAIRS = ITEMS.map(([name, svg]) => ({ a: word(name), b: svg, name }));

export default function WordMatchClient() {
  return (
    <MatchGame
      pairs={PAIRS}
      cols={6}
      quizId="kids-word-match"
      title="Word Match"
      intro="Match each word to its picture, like Dog with the dog. Find all twelve pairs. Up to four players."
    />
  );
}
