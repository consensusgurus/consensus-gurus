'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// 14 pizza styles, each a round inline-SVG pie (no image files, no licensing),
// distinguished by topping color and pattern. Base = tan crust + cheese; a few
// styles override the inner fill (white, pesto, buffalo).
const BASE = '<circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#f4d58a"/>';

const PIZZAS = [
  { n: 'Cheese', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="#e8c96a"><circle cx="42" cy="44" r="2"/><circle cx="58" cy="48" r="2"/><circle cx="48" cy="60" r="2"/><circle cx="60" cy="58" r="2"/></g></svg>` },
  { n: 'Pepperoni', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="#c0392b"><circle cx="40" cy="40" r="5.5"/><circle cx="60" cy="42" r="5.5"/><circle cx="50" cy="54" r="5.5"/><circle cx="38" cy="60" r="5.5"/><circle cx="62" cy="60" r="5.5"/></g></svg>` },
  { n: 'Margherita', s: `<svg viewBox="0 0 100 100">${BASE}<circle cx="40" cy="44" r="6" fill="#ffffff"/><circle cx="60" cy="56" r="6" fill="#ffffff"/><circle cx="53" cy="40" r="4" fill="#c0392b"/><circle cx="42" cy="60" r="4" fill="#c0392b"/><path d="M44 56 q4 -7 9 -3 q-4 7 -9 3z" fill="#4a7c2f"/><path d="M58 42 q4 -7 9 -3 q-4 7 -9 3z" fill="#4a7c2f"/></svg>` },
  { n: 'Mushroom', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="#bda079"><ellipse cx="42" cy="44" rx="6" ry="4"/><rect x="40" y="46" width="4" height="5" rx="1"/><ellipse cx="60" cy="50" rx="6" ry="4"/><rect x="58" y="52" width="4" height="5" rx="1"/><ellipse cx="48" cy="62" rx="6" ry="4"/><rect x="46" y="64" width="4" height="5" rx="1"/></g></svg>` },
  { n: 'Hawaiian', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="#f2c14e"><rect x="38" y="40" width="7" height="7" rx="1.5"/><rect x="55" y="48" width="7" height="7" rx="1.5"/><rect x="44" y="58" width="7" height="7" rx="1.5"/></g><circle cx="58" cy="41" r="4" fill="#e88b9a"/><circle cx="40" cy="56" r="4" fill="#e88b9a"/></svg>` },
  { n: 'Veggie', s: `<svg viewBox="0 0 100 100">${BASE}<rect x="37" y="42" width="9" height="3.5" rx="1.7" fill="#3b8a3b"/><rect x="53" y="52" width="9" height="3.5" rx="1.7" fill="#c0392b"/><rect x="44" y="58" width="9" height="3.5" rx="1.7" fill="#e8a72b" transform="rotate(38 48 60)"/><circle cx="58" cy="44" r="3" fill="#6a2c91"/><circle cx="39" cy="56" r="3" fill="#3b8a3b"/></svg>` },
  { n: 'Sausage', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="#8a5a2b"><circle cx="42" cy="44" r="4"/><circle cx="58" cy="42" r="3.5"/><circle cx="51" cy="54" r="4.5"/><circle cx="40" cy="60" r="3.5"/><circle cx="62" cy="58" r="4"/><circle cx="53" cy="43" r="2.5"/></g></svg>` },
  { n: 'BBQ Chicken', s: `<svg viewBox="0 0 100 100">${BASE}<path d="M34 42 q16 8 32 0" stroke="#6e3b14" stroke-width="3" fill="none"/><path d="M34 56 q16 8 32 0" stroke="#6e3b14" stroke-width="3" fill="none"/><g fill="#e0c48a"><rect x="40" y="46" width="7" height="5" rx="2"/><rect x="54" y="50" width="7" height="5" rx="2"/><rect x="46" y="59" width="7" height="5" rx="2"/></g></svg>` },
  { n: 'Buffalo', s: `<svg viewBox="0 0 100 100">${BASE}<circle cx="50" cy="50" r="31" fill="#e8771f" opacity="0.5"/><g fill="#cf6418"><rect x="42" y="44" width="7" height="5" rx="2"/><rect x="54" y="52" width="7" height="5" rx="2"/><rect x="44" y="59" width="7" height="5" rx="2"/></g></svg>` },
  { n: 'Olive', s: `<svg viewBox="0 0 100 100">${BASE}<g fill="none" stroke="#222" stroke-width="2.6"><circle cx="42" cy="44" r="3.5"/><circle cx="60" cy="46" r="3.5"/><circle cx="50" cy="56" r="3.5"/><circle cx="40" cy="60" r="3.5"/><circle cx="61" cy="60" r="3.5"/></g></svg>` },
  { n: 'Supreme', s: `<svg viewBox="0 0 100 100">${BASE}<circle cx="40" cy="42" r="4" fill="#c0392b"/><rect x="54" y="43" width="6" height="3" rx="1.5" fill="#3b8a3b"/><circle cx="58" cy="57" r="3.4" fill="none" stroke="#222" stroke-width="2"/><circle cx="44" cy="58" r="3.6" fill="#8a5a2b"/><circle cx="50" cy="50" r="3" fill="#6a2c91"/><rect x="37" y="50" width="6" height="3" rx="1.5" fill="#e8a72b"/></svg>` },
  { n: 'White', s: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#fdf3df"/><path d="M43 44 q4 -6 9 -2 q-4 6 -9 2z" fill="#5a8a3a"/><path d="M56 56 q4 -6 9 -2 q-4 6 -9 2z" fill="#5a8a3a"/><g fill="#d8c08a"><circle cx="58" cy="44" r="2.3"/><circle cx="42" cy="58" r="2.3"/><circle cx="50" cy="52" r="2.3"/></g></svg>` },
  { n: 'Pesto', s: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#e0a85a"/><circle cx="50" cy="50" r="33" fill="#7a9a4a"/><g fill="#e6dba0"><circle cx="42" cy="44" r="2.5"/><circle cx="58" cy="46" r="2.5"/><circle cx="48" cy="58" r="2.5"/><circle cx="61" cy="58" r="2.5"/></g><circle cx="52" cy="49" r="4.5" fill="#ffffff" opacity="0.85"/></svg>` },
  { n: 'Bacon', s: `<svg viewBox="0 0 100 100">${BASE}<path d="M34 44 q8 4 16 0 q8 -4 16 0" stroke="#a8443a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 56 q8 4 16 0 q8 -4 16 0" stroke="#a8443a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M34 44 q8 4 16 0 q8 -4 16 0" stroke="#e0a090" stroke-width="1.4" fill="none"/><path d="M34 56 q8 4 16 0 q8 -4 16 0" stroke="#e0a090" stroke-width="1.4" fill="none"/></svg>` },
];

export default function PizzaMatchClient() {
  return (
    <MatchGame
      items={PIZZAS}
      cols={7}
      quizId="kids-pizza-match"
      title="Pizza Match"
      intro="Match the pizzas. Flip the cards and find all fourteen pizza pairs. Play on your own, or pass and play with a friend."
    />
  );
}
