// Kids Corner games that are live and playable. These count toward the
// site-wide quiz total shown in the header, alongside the trivia quizzes
// (lib/quizzes.js) and the exam practice tests (app/exams/examData.js).
//
// Keep this in sync with the READY (non "coming soon") tiles in
// app/kids/KidsHubClient.jsx: every playable game listed there belongs here,
// and nothing that is still "coming soon" does.
export const KIDS_GAMES = [
  { id: 'memory-match', title: 'Treats Match', href: '/kids/memory-match' },
  { id: 'pizza-match', title: 'Pizza Match', href: '/kids/pizza-match' },
  { id: 'dog-match', title: 'Dog Match', href: '/kids/dog-match' },
];

export const KIDS_GAME_COUNT = KIDS_GAMES.length;
