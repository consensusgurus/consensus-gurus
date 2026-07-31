// Puzzle data for Circa, the daily year hunt. CIRCA IS RETIRED (owner ruling
// 2026-07-20): the bank is capped at No. 7 (2026-07-20), its final drop. The
// archive stays playable from /daily (Retired section) and /circa?p=N, but no
// new puzzles run and the game is out of the hub lineups. Do NOT bank new days.
//
// Original header: Imported ONLY by the server
// page (app/circa/page.js), which filters live<=today before passing puzzles
// to the client — so future moments, and their years, never ship to the
// browser bundle.
//
// One historical moment per day. `title` is the event as shown on the board
// (present tense, no year clues in the wording); `year` is the exact answer,
// always between 1000 and the current year (no BC — the input stays a clean
// four digits). `d` is the end-screen story line (one short factual sentence,
// 15–110 chars), shown only after the game ends. Sundays (`sunday: true`) are
// the same mechanic with a trickier, more obscure moment to place. Never
// reuse a moment already banked here or in app/dating/puzzles.js.
export const PUZZLES = [
  {
    num: 1,
    quizId: 'circa-7-14-26',
    live: '2026-07-14',
    dateLabel: 'July 14, 2026',
    sunday: false,
    title: 'The Battle of Hastings is fought',
    year: 1066,
    d: 'William took England in a day; the Bayeux Tapestry tells the story in 230 feet of embroidery.',
  },
  {
    num: 2,
    quizId: 'circa-7-15-26',
    live: '2026-07-15',
    dateLabel: 'July 15, 2026',
    sunday: false,
    title: 'The Titanic sinks on its maiden voyage',
    year: 1912,
    d: 'The "unsinkable" liner went down in under three hours; the wreck was not found until 1985.',
  },
  {
    num: 3,
    quizId: 'circa-7-16-26',
    live: '2026-07-16',
    dateLabel: 'July 16, 2026',
    sunday: false,
    title: 'The Berlin Wall falls',
    year: 1989,
    d: 'A fumbled answer at a press conference opened the gates; crowds with hammers did the rest.',
  },
  {
    num: 4,
    quizId: 'circa-7-17-26',
    live: '2026-07-17',
    dateLabel: 'July 17, 2026',
    sunday: false,
    title: 'The Great Fire of London burns',
    year: 1666,
    d: 'It destroyed some 13,000 houses, yet the official death toll was just six.',
  },
  {
    num: 5,
    quizId: 'circa-7-18-26',
    live: '2026-07-18',
    dateLabel: 'July 18, 2026',
    sunday: false,
    title: 'The stock market crashes on Black Tuesday',
    year: 1929,
    d: 'The Dow needed 25 years to climb back to its 1929 peak.',
  },
  {
    num: 6,
    quizId: 'circa-7-19-26',
    live: '2026-07-19',
    dateLabel: 'July 19, 2026',
    sunday: true,
    title: 'The Black Death reaches England',
    year: 1348,
    d: 'Within two years the plague had killed at least a third of the country.',
  },
  {
    num: 7,
    quizId: 'circa-7-20-26',
    live: '2026-07-20',
    dateLabel: 'July 20, 2026',
    sunday: false,
    title: 'World War I begins',
    year: 1914,
    d: "A wrong turn put the archduke's car in front of his assassin; the war killed 17 million.",
  },
];
