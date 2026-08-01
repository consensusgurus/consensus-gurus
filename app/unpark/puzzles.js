// Puzzle data for Unpark, the daily sliding-block jam. Imported ONLY by the
// server page (app/unpark/page.js), which filters live<=today before handing the
// bank to the client, so tomorrow's board never reaches a browser.
//
// NOTE the quizId prefix stays 'park-': the game shipped as Park on 2026-07-30
// and was renamed 2026-07-31, and the ids are the leaderboard keys, so they are
// deliberately left alone. Only the route and the reader-facing name moved.
//
// Six by six. Each block is [len, horiz, fixed, pos]:
//   len    2 or 3 squares long
//   horiz  1 if it slides left and right, 0 if up and down
//   fixed  the coordinate it can never change (its row if horizontal, its
//          column if vertical)
//   pos    where its top or left end sits along the axis it slides on
// Block 0 is always the RED one: two long, horizontal, on row 2, and it leaves
// through the gap in the right-hand wall on that row.
//
//   par    the EXACT minimum number of moves, where one move is one block
//          sliding any distance. This is what the game now calls PERFECT; the
//          field keeps its old name so no banked board has to be rewritten, and
//          the softer target players are shown is derived from it in lib/par.js.
//          Not an estimate: found by breadth-first search
//          over the whole reachable state space, then confirmed by a second
//          solver that works on grid strings rather than on this block list.
//          The week climbs in three rungs: Monday to Wednesday run 11 to 14,
//          Thursday to Saturday 16 to 20, and Sundays 32 to 38. Each rung also
//          ramps inside itself, so Monday is the gentlest board of the week and
//          Saturday the stiffest short of the Sunday Edition.
export const PUZZLES = [
  {
    num: 1,
    quizId: 'park-7-30-26',
    live: '2026-07-30',
    dateLabel: 'July 30, 2026',
    sunday: false,
    par: 16,
    pieces: [[2,1,2,2],[3,0,4,1],[3,0,5,2],[3,0,1,2],[2,1,0,3],[2,0,0,2],[2,1,4,3],[2,0,5,0],[2,1,1,1],[2,1,5,3],[2,1,0,0],[2,1,3,2],[2,0,2,4]],
  },
  {
    num: 2,
    quizId: 'park-7-31-26',
    live: '2026-07-31',
    dateLabel: 'July 31, 2026',
    sunday: false,
    par: 17,
    pieces: [[2,1,2,3],[2,1,0,1],[2,0,5,3],[2,0,4,3],[2,1,0,4],[2,0,0,0],[3,1,5,3],[2,1,5,0],[2,0,0,2],[2,0,3,0],[2,0,1,1],[2,0,5,1],[2,1,3,1],[2,0,2,4]],
  },
  {
    num: 3,
    quizId: 'park-8-1-26',
    live: '2026-08-01',
    dateLabel: 'August 1, 2026',
    sunday: false,
    par: 19,
    pieces: [[2,1,2,2],[3,0,4,1],[3,0,5,1],[3,0,1,2],[2,1,0,0],[2,0,0,3],[2,1,4,4],[2,1,1,0],[2,1,5,0],[2,1,0,2],[2,1,3,2],[2,0,2,4],[2,1,5,4]],
  },
  {
    num: 4,
    quizId: 'park-8-2-26',
    live: '2026-08-02',
    dateLabel: 'August 2, 2026',
    sunday: true,
    par: 32,
    pieces: [[2,1,2,2],[2,0,5,1],[2,1,3,0],[2,1,0,4],[3,0,4,1],[2,1,5,3],[2,1,5,1],[3,0,1,0],[3,0,0,0],[2,0,2,3],[2,1,0,2],[2,1,4,3],[2,1,1,2],[3,0,5,3]],
  },
  {
    num: 5,
    quizId: 'park-8-3-26',
    live: '2026-08-03',
    dateLabel: 'August 3, 2026',
    sunday: false,
    par: 11,
    pieces: [[2,1,2,1],[2,1,4,3],[3,0,5,0],[2,1,0,0],[2,1,3,4],[3,1,5,1],[3,0,0,3],[2,0,2,3],[2,1,0,3],[2,1,1,2],[2,0,3,2],[2,1,1,0]],
  },
  {
    num: 6,
    quizId: 'park-8-4-26',
    live: '2026-08-04',
    dateLabel: 'August 4, 2026',
    sunday: false,
    par: 12,
    pieces: [[2,1,2,0],[2,1,5,4],[3,0,4,2],[2,0,3,4],[2,0,5,0],[2,0,3,2],[2,0,1,4],[2,0,0,4],[3,0,2,3],[2,0,5,2],[2,1,1,2],[3,1,0,2]],
  },
  {
    num: 7,
    quizId: 'park-8-5-26',
    live: '2026-08-05',
    dateLabel: 'August 5, 2026',
    sunday: false,
    par: 13,
    pieces: [[2,1,2,0],[2,1,5,4],[2,0,2,1],[3,0,5,0],[2,0,3,1],[2,0,2,4],[2,1,1,0],[2,1,3,1],[3,0,3,3],[2,1,0,3],[2,1,0,1],[2,0,4,2]],
  },
  {
    num: 8,
    quizId: 'park-8-6-26',
    live: '2026-08-06',
    dateLabel: 'August 6, 2026',
    sunday: false,
    par: 16,
    pieces: [[2,1,2,0],[2,0,3,2],[2,1,5,1],[2,1,5,4],[2,1,0,2],[2,0,3,4],[2,0,1,0],[2,0,5,0],[2,0,4,0],[3,0,5,2],[2,0,0,4],[2,0,2,3]],
  },
  {
    num: 9,
    quizId: 'park-8-7-26',
    live: '2026-08-07',
    dateLabel: 'August 7, 2026',
    sunday: false,
    par: 18,
    pieces: [[2,1,2,2],[2,1,4,4],[2,1,3,0],[3,0,4,1],[2,0,0,1],[2,1,0,4],[2,0,5,2],[2,0,2,0],[2,1,3,2],[2,1,5,0],[2,0,3,4],[2,1,5,4],[2,0,1,1]],
  },
  {
    num: 10,
    quizId: 'park-8-8-26',
    live: '2026-08-08',
    dateLabel: 'August 8, 2026',
    sunday: false,
    par: 20,
    pieces: [[2,1,2,2],[2,1,5,3],[2,0,5,4],[3,1,0,3],[2,1,1,0],[2,0,0,4],[2,1,0,1],[2,0,5,2],[3,0,2,3],[2,0,0,2],[3,0,4,2],[2,0,1,2],[3,1,1,3]],
  },
  {
    num: 11,
    quizId: 'park-8-9-26',
    live: '2026-08-09',
    dateLabel: 'August 9, 2026',
    sunday: true,
    par: 34,
    pieces: [[2,1,2,0],[3,0,2,0],[3,1,5,2],[2,0,1,0],[2,0,0,4],[2,1,4,1],[2,0,3,3],[2,0,5,4],[2,1,3,1],[2,1,0,3],[2,0,3,1],[2,1,3,4]],
  },
  {
    num: 12,
    quizId: 'park-8-10-26',
    live: '2026-08-10',
    dateLabel: 'August 10, 2026',
    sunday: false,
    par: 11,
    pieces: [[2,1,2,0],[2,0,5,3],[2,0,3,2],[2,0,0,0],[2,1,5,4],[3,1,3,0],[2,0,5,1],[2,1,0,2],[2,0,4,3],[2,1,5,2],[2,0,2,1],[2,1,4,2],[2,0,4,0]],
  },
  {
    num: 13,
    quizId: 'park-8-11-26',
    live: '2026-08-11',
    dateLabel: 'August 11, 2026',
    sunday: false,
    par: 13,
    pieces: [[2,1,2,1],[2,0,3,1],[2,1,3,1],[2,1,0,2],[2,0,0,3],[2,0,3,4],[2,0,1,0],[2,0,4,0],[2,0,2,4],[2,0,5,4],[2,1,5,0],[2,0,5,0]],
  },
  {
    num: 14,
    quizId: 'park-8-12-26',
    live: '2026-08-12',
    dateLabel: 'August 12, 2026',
    sunday: false,
    par: 14,
    pieces: [[2,1,2,1],[2,1,0,3],[2,1,5,4],[3,1,3,0],[2,1,3,3],[3,1,4,3],[2,1,4,1],[2,0,0,4],[3,1,0,0],[2,0,3,1],[3,0,5,1],[2,1,5,2]],
  },
  {
    num: 15,
    quizId: 'park-8-13-26',
    live: '2026-08-13',
    dateLabel: 'August 13, 2026',
    sunday: false,
    par: 17,
    pieces: [[2,1,2,1],[2,1,4,4],[2,0,2,4],[2,1,3,0],[3,0,4,1],[2,1,3,2],[2,1,5,4],[3,0,5,1],[2,0,0,1],[2,0,3,4],[2,1,5,0],[2,1,0,0]],
  },
  {
    num: 16,
    quizId: 'park-8-14-26',
    live: '2026-08-14',
    dateLabel: 'August 14, 2026',
    sunday: false,
    par: 18,
    pieces: [[2,1,2,1],[2,1,5,0],[2,1,4,2],[2,0,0,1],[2,1,3,4],[2,0,2,0],[2,1,5,3],[2,0,0,3],[2,0,1,0],[2,1,3,1],[2,0,4,1],[2,0,5,4],[3,0,3,1],[2,1,0,3]],
  },
  {
    num: 17,
    quizId: 'park-8-15-26',
    live: '2026-08-15',
    dateLabel: 'August 15, 2026',
    sunday: false,
    par: 20,
    pieces: [[2,1,2,1],[3,1,4,1],[2,0,4,2],[2,0,2,0],[2,1,4,4],[2,1,1,3],[3,1,5,3],[2,0,3,2],[3,0,5,0],[2,0,0,0],[2,1,0,3],[2,1,3,0],[2,1,5,0]],
  },
  {
    num: 18,
    quizId: 'park-8-16-26',
    live: '2026-08-16',
    dateLabel: 'August 16, 2026',
    sunday: true,
    par: 36,
    pieces: [[2,1,2,0],[2,1,4,1],[2,0,5,4],[2,0,0,4],[2,0,3,1],[3,1,5,1],[2,0,3,3],[2,1,3,4],[2,0,1,0],[3,0,2,1],[2,1,3,0],[2,1,0,2]],
  },
  {
    num: 19,
    quizId: 'park-8-17-26',
    live: '2026-08-17',
    dateLabel: 'August 17, 2026',
    sunday: false,
    par: 12,
    pieces: [[2,1,2,3],[2,0,1,0],[2,0,5,1],[2,1,0,4],[2,0,5,4],[3,0,0,1],[2,1,1,3],[2,0,1,2],[2,1,0,2],[2,1,5,2],[2,1,5,0],[3,1,4,1],[2,0,4,4],[2,1,3,4]],
  },
  {
    num: 20,
    quizId: 'park-8-18-26',
    live: '2026-08-18',
    dateLabel: 'August 18, 2026',
    sunday: false,
    par: 13,
    pieces: [[2,1,2,0],[2,0,4,1],[2,0,1,3],[2,0,5,1],[3,1,4,2],[3,1,0,0],[2,1,3,3],[2,0,0,4],[3,0,5,3],[2,1,5,1],[2,1,1,1],[2,0,2,2]],
  },
  {
    num: 21,
    quizId: 'park-8-19-26',
    live: '2026-08-19',
    dateLabel: 'August 19, 2026',
    sunday: false,
    par: 14,
    pieces: [[2,1,2,0],[2,0,1,0],[3,1,0,3],[2,0,4,4],[2,0,4,2],[2,0,5,1],[2,1,1,3],[2,0,0,0],[3,0,2,0],[2,1,3,1],[2,0,5,3],[3,1,5,0],[2,0,3,2]],
  },
  {
    num: 22,
    quizId: 'park-8-20-26',
    live: '2026-08-20',
    dateLabel: 'August 20, 2026',
    sunday: false,
    par: 16,
    pieces: [[2,1,2,0],[2,0,2,1],[2,0,3,2],[3,0,4,2],[2,0,0,3],[2,0,1,0],[2,0,5,0],[2,1,0,3],[2,1,3,1],[2,1,5,1],[2,0,5,4],[2,0,3,4]],
  },
  {
    num: 23,
    quizId: 'park-8-21-26',
    live: '2026-08-21',
    dateLabel: 'August 21, 2026',
    sunday: false,
    par: 19,
    pieces: [[2,1,2,1],[2,1,0,3],[3,0,3,3],[2,0,1,3],[2,0,4,1],[2,0,2,0],[2,0,3,1],[3,0,0,2],[3,1,5,0],[2,1,1,0],[2,0,4,4],[2,0,5,0],[3,0,5,2]],
  },
  {
    num: 24,
    quizId: 'park-8-22-26',
    live: '2026-08-22',
    dateLabel: 'August 22, 2026',
    sunday: false,
    par: 20,
    pieces: [[2,1,2,0],[2,0,2,1],[2,1,3,0],[3,0,4,2],[2,1,0,2],[2,0,0,4],[2,0,3,4],[2,0,5,2],[2,0,4,0],[2,0,1,0],[2,0,3,1],[2,1,5,4]],
  },
  {
    num: 25,
    quizId: 'park-8-23-26',
    live: '2026-08-23',
    dateLabel: 'August 23, 2026',
    sunday: true,
    par: 38,
    pieces: [[2,1,2,0],[2,1,4,1],[2,0,3,3],[3,0,2,1],[2,1,3,0],[2,1,3,4],[3,1,5,2],[2,1,0,4],[2,0,0,4],[2,0,3,1],[2,0,5,4],[2,1,0,1]],
  },
  {
    num: 26,
    quizId: 'park-8-24-26',
    live: '2026-08-24',
    dateLabel: 'August 24, 2026',
    sunday: false,
    par: 11,
    pieces: [[2,1,2,3],[2,1,1,2],[2,1,5,0],[2,0,1,1],[2,1,0,0],[3,0,5,1],[2,0,2,3],[2,1,4,4],[2,0,3,4],[2,1,3,0],[2,0,4,0],[2,0,0,1]],
  },
  {
    num: 27,
    quizId: 'park-8-25-26',
    live: '2026-08-25',
    dateLabel: 'August 25, 2026',
    sunday: false,
    par: 12,
    pieces: [[2,1,2,1],[3,0,0,2],[2,0,3,4],[3,0,2,3],[2,1,3,3],[2,0,3,1],[2,0,2,0],[2,0,1,0],[2,0,5,4],[2,1,0,4],[2,0,4,1],[2,0,4,4]],
  },
  {
    num: 28,
    quizId: 'park-8-26-26',
    live: '2026-08-26',
    dateLabel: 'August 26, 2026',
    sunday: false,
    par: 14,
    pieces: [[2,1,2,2],[3,0,5,3],[3,0,1,1],[2,1,5,0],[2,0,2,4],[2,1,0,1],[2,0,0,0],[2,0,5,1],[2,1,3,2],[3,0,4,2],[2,1,5,3],[2,1,4,0],[2,1,0,4]],
  },
];
