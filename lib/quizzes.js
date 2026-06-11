// Quiz definitions for /quiz/[id].
//
// A quiz mirrors the look of a list page (same ink ribbon, Fraunces/DM Mono
// type, cream + ember palette) but plays as a timed "name them all" game.
//
// Shape:
//   id            kebab-case slug -> /quiz/<id>. Pair it with a list by using
//                 the same id as the list when one exists.
//   listId        OPTIONAL paired /list/<listId>. Omit for quizzes that have
//                 no underlying ranked list (the results-card link is hidden).
//   title         "Name the ..." headline, Fraunces.
//   category      eyebrow label (matches the list page's "Category" tag).
//   blurb         one-line italic description under the title.
//   timeLimit     seconds on the clock.
//   stats         { avg, plays } community baseline shown on the Stats tab.
//                 Personal stats are tracked client-side in localStorage.
//   answers       ranked slots, best-to-worst (slot i = rank i+1). Each:
//                   t     canonical display name (revealed title-only on miss)
//                   keys  lowercase substrings that count as a correct guess
//                   anti  OPTIONAL substrings that BLOCK a match (disambiguation)
//
// The airlines answer set below is the live Borda consensus of the paired
// best-airlines-north-america list (Skytrax + The Points Guy + WSJ + Cirium),
// which resolves to the same order as that list's seed.

export const QUIZZES = [
  {
    id: 'best-airlines-north-america',
    listId: 'best-airlines-north-america',
    publishedDate: '2026-06-11',
    title: 'Name the Best Airlines in North America',
    category: 'Travel',
    type: 'travel',
    tags: ['travel', 'other'],
    timeLimit: 90,
    blurb: 'The ranked consensus of Skytrax, The Points Guy, the WSJ scorecard, and Cirium on-time data. Ninety seconds on the clock. Name all ten.',
    stats: { avg: 4.6, plays: 1284 },
    answers: [
      { t: 'Delta Air Lines', keys: ['delta'] },
      { t: 'United Airlines', keys: ['united'] },
      { t: 'Alaska Airlines', keys: ['alaska'] },
      { t: 'Southwest Airlines', keys: ['southwest', 'south west'] },
      { t: 'JetBlue', keys: ['jetblue', 'jet blue'] },
      { t: 'American Airlines', keys: ['american'] },
      { t: 'Allegiant Air', keys: ['allegiant'] },
      { t: 'Air Canada', keys: ['air canada'] },
      { t: 'Frontier Airlines', keys: ['frontier'] },
      { t: 'Porter Airlines', keys: ['porter'] },
    ],
  },
];

export function getQuiz(id) {
  return QUIZZES.find((q) => q.id === id);
}
