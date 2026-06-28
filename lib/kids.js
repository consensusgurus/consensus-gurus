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
  { id: 'color-match', title: 'Color Match', href: '/kids/color-match' },
  { id: 'addition-match', title: 'Addition Match', href: '/kids/addition-match' },
  { id: 'letter-match', title: 'Letter Match', href: '/kids/letter-match' },
  { id: 'fantasy-match', title: 'Fantasy Match', href: '/kids/fantasy-match' },
  { id: 'word-match', title: 'Word Match', href: '/kids/word-match' },
  { id: 'number-match', title: 'Number Match', href: '/kids/number-match' },
];

export const KIDS_GAME_COUNT = KIDS_GAMES.length;
