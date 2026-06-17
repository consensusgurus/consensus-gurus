// Quiz "challenges": curated leaderboards over a fixed set of quizzes since a
// start time. Each challenge powers the live board at /quizzes/leaderboard and
// the read API at /api/quiz/challenge-leaderboard.
//
// To launch a NEW challenge: add an entry to CHALLENGES (set `since` to the
// moment it opens, list the quizzes grouped into columns) and, if it should be
// the one shown by default, set DEFAULT_CHALLENGE_ID to its id. Nothing else
// needs to change — the API and page read everything from here.
//
// Shape:
//   id        unique slug (used in the ?id= query param)
//   title     headline; `accent` is the word rendered in italic ember
//   kicker    small eyebrow label
//   blurb     one-line description under the title
//   since     ISO timestamp the window opens (results before it are ignored)
//   until     OPTIONAL ISO timestamp the window closes (omit = open-ended)
//   sinceLabel human-readable version of `since` for the header
//   groups    sections shown side by side, each with its own colour + icon and
//             1+ columns. A column = one quiz: { quizId, label, icon }.

export const CHALLENGES = [
  {
    id: 'continents',
    title: 'The Continents Challenge',
    accent: 'Continents',
    kicker: 'Quiz Event',
    blurb: 'Twelve geography quizzes — name the flags and click the country with no outline, two for every continent. Registered players ranked by total correct, then by least time spent.',
    since: '2026-06-15T15:40:00.000Z',
    sinceLabel: 'Mon Jun 15, 2026 · 11:40 AM ET',
    groups: [
      { key: 'north-america', label: 'North America', emoji: '🗽', color: '#c0392b',
        columns: [
          { quizId: 'flags-of-north-america', label: 'Flags', icon: '🚩' },
          { quizId: 'north-america-no-outline', label: 'Map', icon: '🗺️' },
        ] },
      { key: 'south-america', label: 'South America', emoji: '🗿', color: '#2e7d4f',
        columns: [
          { quizId: 'flags-of-south-america', label: 'Flags', icon: '🚩' },
          { quizId: 'south-america-no-outline', label: 'Map', icon: '🗺️' },
        ] },
      { key: 'europe', label: 'Europe', emoji: '🏰', color: '#2f6f9f',
        columns: [
          { quizId: 'flags-of-europe', label: 'Flags', icon: '🚩' },
          { quizId: 'europe-no-outline', label: 'Map', icon: '🗺️' },
        ] },
      { key: 'africa', label: 'Africa', emoji: '🦁', color: '#d98a2b',
        columns: [
          { quizId: 'flags-of-africa', label: 'Flags', icon: '🚩' },
          { quizId: 'africa-no-outline', label: 'Map', icon: '🗺️' },
        ] },
      { key: 'asia', label: 'Asia', emoji: '🏯', color: '#a23b72',
        columns: [
          { quizId: 'flags-of-asia', label: 'Flags', icon: '🚩' },
          { quizId: 'asia-no-outline', label: 'Map', icon: '🗺️' },
        ] },
      { key: 'oceania', label: 'Oceania', emoji: '🦘', color: '#1f9b8e',
        columns: [
          { quizId: 'flags-of-oceania', label: 'Flags', icon: '🚩' },
          { quizId: 'oceania-no-outline', label: 'Map', icon: '🗺️' },
        ] },
    ],
  },
];

export const DEFAULT_CHALLENGE_ID = 'continents';

export function getChallenge(id) {
  if (!id) return CHALLENGES.find((c) => c.id === DEFAULT_CHALLENGE_ID) || null;
  return CHALLENGES.find((c) => c.id === id) || null;
}

export function challengeColumns(ch) {
  return (ch.groups || []).flatMap((g) => g.columns.map((col) => ({ ...col, group: g })));
}

export function challengeQuizIds(ch) {
  return (ch.groups || []).flatMap((g) => g.columns.map((col) => col.quizId));
}
