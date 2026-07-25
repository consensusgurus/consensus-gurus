// Puzzle data for Stands, the daily round-robin reconstruction. Imported ONLY
// by the server page (app/stands/page.js), which filters live<=today before
// passing boards to the client.
//
// Everyone played everyone once. Win 3, draw 1, loss 0. The results sheet is
// gone and a handful of facts survive; rebuild every result.
//
// Clue schema (x, y are indexes into teams):
//   beat {x,y}      x beat y
//   drew {x,y}      x and y drew
//   points {x,p}    x finished on p points
//   wins {x,n}      x won exactly n
//   draws {x,n}     x drew exactly n
//   unbeaten {x}    x lost none
//   winless {x}     x won none
//   above {x,y}     x finished strictly above y on points
//   totalDraws {n}  exactly n matches were drawn
//
// LEAK GUARD: the results are NOT stored. Every board is machine-verified
// (scripts/verify-stands.mjs) to admit exactly one table, and to carry a
// MINIMAL clue set: drop any single clue and the table stops being unique. The
// client re-derives the table with the same bounded search.
export const PUZZLES = [
  {
    num: 1, quizId: 'stands-7-24-26', live: '2026-07-24', dateLabel: 'July 24, 2026', sunday: false,
    teams: ['Alderton', 'Brackwell', 'Corvale', 'Dunmoor', 'Eastfield'],
    clues: [
      { type: 'points', x: 1, p: 2 },
      { type: 'points', x: 4, p: 6 },
      { type: 'wins', x: 2, n: 1 },
      { type: 'wins', x: 4, n: 1 },
      { type: 'draws', x: 3, n: 1 },
      { type: 'draws', x: 2, n: 1 },
      { type: 'drew', x: 0, y: 3 },
    ],
  },
  {
    num: 2, quizId: 'stands-7-25-26', live: '2026-07-25', dateLabel: 'July 25, 2026', sunday: false,
    teams: ['Ashcombe', 'Bellhaven', 'Croftwood', 'Dalridge', 'Elmsworth'],
    clues: [
      { type: 'draws', x: 4, n: 1 },
      { type: 'unbeaten', x: 0 },
      { type: 'draws', x: 3, n: 1 },
      { type: 'wins', x: 0, n: 2 },
      { type: 'unbeaten', x: 3 },
      { type: 'drew', x: 0, y: 1 },
      { type: 'wins', x: 1, n: 0 },
      { type: 'draws', x: 1, n: 1 },
    ],
  },
  {
    num: 3, quizId: 'stands-7-26-26', live: '2026-07-26', dateLabel: 'July 26, 2026', sunday: true,
    teams: ['Ardwick', 'Bexley Vale', 'Calderhurst', 'Draymoor', 'Endsleigh', 'Foxholm'],
    clues: [
      { type: 'points', x: 1, p: 6 },
      { type: 'points', x: 5, p: 4 },
      { type: 'unbeaten', x: 4 },
      { type: 'draws', x: 3, n: 1 },
      { type: 'wins', x: 2, n: 3 },
      { type: 'beat', x: 5, y: 2 },
      { type: 'beat', x: 0, y: 5 },
      { type: 'points', x: 0, p: 8 },
      { type: 'totalDraws', n: 4 },
    ],
  },
  {
    num: 4, quizId: 'stands-7-27-26', live: '2026-07-27', dateLabel: 'July 27, 2026', sunday: false,
    teams: ['Alderton', 'Brackwell', 'Corvale', 'Dunmoor', 'Eastfield'],
    clues: [
      { type: 'totalDraws', n: 2 },
      { type: 'beat', x: 1, y: 2 },
      { type: 'winless', x: 2 },
      { type: 'draws', x: 1, n: 2 },
      { type: 'points', x: 3, p: 3 },
      { type: 'unbeaten', x: 0 },
    ],
  },
  {
    num: 5, quizId: 'stands-7-28-26', live: '2026-07-28', dateLabel: 'July 28, 2026', sunday: false,
    teams: ['Ashcombe', 'Bellhaven', 'Croftwood', 'Dalridge', 'Elmsworth'],
    clues: [
      { type: 'above', x: 2, y: 1 },
      { type: 'draws', x: 4, n: 3 },
      { type: 'beat', x: 3, y: 2 },
      { type: 'points', x: 0, p: 0 },
      { type: 'draws', x: 1, n: 1 },
    ],
  },
  {
    num: 6, quizId: 'stands-7-29-26', live: '2026-07-29', dateLabel: 'July 29, 2026', sunday: false,
    teams: ['Ardwick', 'Bexley Vale', 'Calderhurst', 'Draymoor', 'Endsleigh'],
    clues: [
      { type: 'above', x: 2, y: 3 },
      { type: 'draws', x: 0, n: 3 },
      { type: 'beat', x: 1, y: 4 },
      { type: 'points', x: 3, p: 4 },
      { type: 'above', x: 1, y: 2 },
      { type: 'beat', x: 1, y: 0 },
      { type: 'wins', x: 4, n: 2 },
    ],
  },
  {
    num: 7, quizId: 'stands-7-30-26', live: '2026-07-30', dateLabel: 'July 30, 2026', sunday: false,
    teams: ['Alderton', 'Brackwell', 'Corvale', 'Dunmoor', 'Eastfield'],
    clues: [
      { type: 'drew', x: 0, y: 2 },
      { type: 'wins', x: 0, n: 2 },
      { type: 'points', x: 4, p: 5 },
      { type: 'draws', x: 3, n: 1 },
      { type: 'beat', x: 0, y: 1 },
      { type: 'points', x: 2, p: 7 },
      { type: 'winless', x: 1 },
      { type: 'unbeaten', x: 0 },
      { type: 'beat', x: 2, y: 3 },
    ],
  },
  {
    num: 8, quizId: 'stands-7-31-26', live: '2026-07-31', dateLabel: 'July 31, 2026', sunday: false,
    teams: ['Ashcombe', 'Bellhaven', 'Croftwood', 'Dalridge', 'Elmsworth'],
    clues: [
      { type: 'beat', x: 3, y: 4 },
      { type: 'draws', x: 0, n: 1 },
      { type: 'beat', x: 3, y: 0 },
      { type: 'winless', x: 1 },
      { type: 'beat', x: 2, y: 0 },
      { type: 'above', x: 4, y: 3 },
      { type: 'draws', x: 2, n: 2 },
    ],
  },
  {
    num: 9, quizId: 'stands-8-1-26', live: '2026-08-01', dateLabel: 'August 1, 2026', sunday: false,
    teams: ['Ardwick', 'Bexley Vale', 'Calderhurst', 'Draymoor', 'Endsleigh'],
    clues: [
      { type: 'points', x: 3, p: 4 },
      { type: 'wins', x: 2, n: 1 },
      { type: 'points', x: 4, p: 8 },
      { type: 'beat', x: 2, y: 3 },
      { type: 'unbeaten', x: 2 },
      { type: 'wins', x: 1, n: 2 },
    ],
  },
  {
    num: 10, quizId: 'stands-8-2-26', live: '2026-08-02', dateLabel: 'August 2, 2026', sunday: true,
    teams: ['Alderton', 'Brackwell', 'Corvale', 'Dunmoor', 'Eastfield', 'Farrowgate'],
    clues: [
      { type: 'totalDraws', n: 3 },
      { type: 'draws', x: 1, n: 1 },
      { type: 'wins', x: 3, n: 4 },
      { type: 'points', x: 5, p: 10 },
      { type: 'points', x: 2, p: 9 },
      { type: 'wins', x: 4, n: 1 },
      { type: 'above', x: 0, y: 4 },
      { type: 'beat', x: 0, y: 3 },
    ],
  },
  {
    num: 11, quizId: 'stands-8-3-26', live: '2026-08-03', dateLabel: 'August 3, 2026', sunday: false,
    teams: ['Ashcombe', 'Bellhaven', 'Croftwood', 'Dalridge', 'Elmsworth'],
    clues: [
      { type: 'drew', x: 1, y: 3 },
      { type: 'points', x: 3, p: 6 },
      { type: 'above', x: 1, y: 0 },
      { type: 'beat', x: 4, y: 1 },
      { type: 'points', x: 2, p: 7 },
      { type: 'draws', x: 4, n: 0 },
      { type: 'draws', x: 0, n: 2 },
    ],
  },
  {
    num: 12, quizId: 'stands-8-4-26', live: '2026-08-04', dateLabel: 'August 4, 2026', sunday: false,
    teams: ['Ardwick', 'Bexley Vale', 'Calderhurst', 'Draymoor', 'Endsleigh'],
    clues: [
      { type: 'above', x: 0, y: 1 },
      { type: 'points', x: 4, p: 6 },
      { type: 'totalDraws', n: 4 },
      { type: 'beat', x: 3, y: 1 },
      { type: 'points', x: 2, p: 7 },
      { type: 'above', x: 4, y: 3 },
      { type: 'drew', x: 1, y: 2 },
    ],
  },
  {
    num: 13, quizId: 'stands-8-5-26', live: '2026-08-05', dateLabel: 'August 5, 2026', sunday: false,
    teams: ['Alderton', 'Brackwell', 'Corvale', 'Dunmoor', 'Eastfield'],
    clues: [
      { type: 'wins', x: 4, n: 2 },
      { type: 'beat', x: 0, y: 4 },
      { type: 'draws', x: 3, n: 0 },
      { type: 'beat', x: 1, y: 2 },
      { type: 'draws', x: 1, n: 2 },
      { type: 'above', x: 1, y: 3 },
      { type: 'above', x: 2, y: 1 },
    ],
  },
  {
    num: 14, quizId: 'stands-8-6-26', live: '2026-08-06', dateLabel: 'August 6, 2026', sunday: false,
    teams: ['Ashcombe', 'Bellhaven', 'Croftwood', 'Dalridge', 'Elmsworth'],
    clues: [
      { type: 'points', x: 1, p: 7 },
      { type: 'drew', x: 2, y: 3 },
      { type: 'wins', x: 3, n: 2 },
      { type: 'points', x: 2, p: 7 },
      { type: 'beat', x: 4, y: 0 },
      { type: 'beat', x: 4, y: 1 },
      { type: 'beat', x: 1, y: 0 },
    ],
  },
];
