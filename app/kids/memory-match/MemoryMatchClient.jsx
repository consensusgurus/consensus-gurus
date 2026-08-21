'use client';

import MatchGame from '../MatchGame';
import { T } from '@/lib/theme';

// Treats Match: the original Kids Corner matching game, 10 pairs of kid-friendly
// snacks drawn as inline SVG. Runs on the shared MatchGame engine. The route and
// quizId stay 'memory-match' / 'kids-memory-match' so the live URL and view
// count are preserved; only the display name is "Treats Match".
const TREATS = [
  { n: 'Chicken tenders', s: '<svg viewBox="0 0 100 100"><g><rect x="18" y="32" width="26" height="46" rx="13" fill="#d9933a" transform="rotate(-14 31 55)"/><rect x="40" y="26" width="26" height="50" rx="13" fill="#e6a94e" transform="rotate(8 53 51)"/><circle cx="30" cy="50" r="2" fill="#a9701f"/><circle cx="35" cy="62" r="2" fill="#a9701f"/><circle cx="52" cy="44" r="2" fill="#b87d28"/><circle cx="56" cy="58" r="2" fill="#b87d28"/></g></svg>' },
  { n: 'French fries', s: '<svg viewBox="0 0 100 100"><g><rect x="38" y="22" width="7" height="40" rx="2" fill="#f2c14e"/><rect x="47" y="16" width="7" height="46" rx="2" fill="#f7cf63"/><rect x="56" y="24" width="7" height="38" rx="2" fill="#f2c14e"/><rect x="30" y="30" width="7" height="34" rx="2" fill="#f7cf63"/><rect x="64" y="32" width="7" height="32" rx="2" fill="#f2c14e"/><path d="M28 56 h44 l-6 28 h-32 z" fill="#e24b4a"/><rect x="34" y="62" width="32" height="8" fill="#ffffff" opacity="0.85"/></g></svg>' },
  { n: 'Ketchup', s: '<svg viewBox="0 0 100 100"><g><rect x="40" y="14" width="20" height="10" rx="3" fill="#a32d2d"/><rect x="36" y="24" width="28" height="60" rx="12" fill="#e24b4a"/><rect x="40" y="44" width="20" height="22" rx="4" fill="#ffffff"/><circle cx="50" cy="55" r="6" fill="#e24b4a"/></g></svg>' },
  { n: 'Popsicle', s: '<svg viewBox="0 0 100 100"><g><rect x="46" y="64" width="8" height="24" rx="3" fill="#c79a5b"/><rect x="32" y="16" width="36" height="56" rx="18" fill="#ef6ea0"/><rect x="38" y="22" width="8" height="18" rx="4" fill="#ffffff" opacity="0.5"/></g></svg>' },
  { n: 'Hot dog', s: '<svg viewBox="0 0 100 100"><g><rect x="16" y="40" width="68" height="22" rx="11" fill="#e7b96a"/><rect x="22" y="46" width="56" height="12" rx="6" fill="#8f1d24"/><path d="M26 52 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 10 0" fill="none" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></g></svg>' },
  { n: 'Ice cream', s: '<svg viewBox="0 0 100 100"><g><path d="M38 50 h24 l-12 34 z" fill="#e0b070"/><path d="M42 56 l16 -8 M45 66 l13 -7" stroke="#c79a5b" stroke-width="2" fill="none"/><circle cx="50" cy="40" r="18" fill="#f7a6c4"/><circle cx="50" cy="22" r="4" fill="#8f1d24"/></g></svg>' },
  { n: 'Smoothie', s: '<svg viewBox="0 0 100 100"><g><rect x="44" y="10" width="6" height="34" rx="3" fill="#7f77dd" transform="rotate(12 47 28)"/><path d="M34 34 h32 l-4 50 h-24 z" fill="#f4c0d1"/><path d="M34 34 h32 l-1 12 h-30 z" fill="#ed93b1"/><rect x="32" y="30" width="36" height="8" rx="3" fill="#d4537e"/></g></svg>' },
  { n: 'Dino nuggets', s: '<svg viewBox="0 0 100 100"><g fill="#d99a3e"><path d="M22 76 q-7 -2 -7 -11 q0 -11 11 -13 q2 -9 11 -11 q0 -19 17 -19 q13 0 13 15 q0 9 -9 13 q13 2 15 15 q1 9 -4 15 z"/><rect x="28" y="71" width="6" height="11" rx="3"/><rect x="52" y="73" width="6" height="11" rx="3"/></g><g fill="#b1772a"><circle cx="30" cy="58" r="1.6"/><circle cx="40" cy="50" r="1.6"/><circle cx="36" cy="64" r="1.6"/><circle cx="50" cy="44" r="1.6"/><circle cx="44" cy="38" r="1.6"/><circle cx="55" cy="61" r="1.6"/></g><circle cx="46" cy="27" r="2" fill="#6b4a17"/></svg>' },
  { n: 'Pizza', s: '<svg viewBox="0 0 100 100"><g><path d="M50 16 L78 78 H22 Z" fill="#f4d58a"/><path d="M22 78 H78 l-4 -9 H26 z" fill="#e0a85a"/><circle cx="44" cy="52" r="5" fill="#8f1d24"/><circle cx="58" cy="60" r="5" fill="#8f1d24"/><circle cx="50" cy="36" r="4" fill="#8f1d24"/></g></svg>' },
  { n: 'Quesadilla', s: '<svg viewBox="0 0 100 100"><g><path d="M50 24 L80 76 H20 Z" fill="#e7b96a"/><path d="M50 24 L80 76 H20 Z" fill="none" stroke="#c79a5b" stroke-width="3" stroke-linejoin="round"/><path d="M50 24 V76" stroke="#c79a5b" stroke-width="2"/><path d="M40 60 q5 8 11 4" stroke="#f2c14e" stroke-width="3" fill="none"/><circle cx="42" cy="50" r="2" fill="#d9933a"/><circle cx="58" cy="58" r="2" fill="#d9933a"/></g></svg>' },
];

export default function MemoryMatchClient() {
  return (
    <MatchGame
      items={TREATS}
      cols={5}
      quizId="kids-memory-match"
      title="Treats Match"
      intro="Flip the cards and find all ten matching treats. Play on your own, or pass and play with a friend."
    />
  );
}
