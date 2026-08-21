// Puzzle data for Race, the daily pawn-race endgame. Imported ONLY by the
// server page (app/race/page.js), which filters live<=today and STRIPS
// keyUci/keySan before handing boards to the client, so neither tomorrow's
// position nor any day's key move ever ships to the browser.
//
// Each puzzle is a Breakthrough-style pawn endgame with WHITE TO MOVE and a
// proven win in exactly `winIn` White moves against perfect defence. Pawns
// move one square straight forward onto an empty square or one square
// diagonally forward onto an empty square or an enemy pawn (the capture;
// straight captures do not exist). First pawn to the far rank wins; a side
// with no pawns or no legal move loses; every move advances a pawn, so the
// game always ends and there are no draws of any kind.
//
//   cols/rows        the board (6x6 or 7x7 by the weekday ramp)
//   white/black      pawn cells, file letter + rank number, rank 1 at the
//                    bottom; White runs UP toward the top rank
//   winIn            White's proven distance in White moves. No draws exist,
//                    so EVERY other first move loses outright; exactly one
//                    wins, and the losers include real traps that lose slowly
//                    enough to tempt.
//   keyUci / keySan  the key move, for the verifier and the reveal-to-solvers
//                    line. Stripped server-side, never sent to the browser.
//   states           the reachable game tree's size, kept under 200k so the
//                    browser re-solves the position exactly and Black's play
//                    is perfect, never heuristic.
//
// The ramp was MEASURED (2026-08-21), not guessed: three pawns a side is the
// deepest this game goes under an exactly-solvable tree (a fourth pawn blows
// the cap and collapses the win to two moves), and small boards run DEEPER
// than big ones because the defence is more constrained. Mon 6x6 and Tue 7x7
// win in 3; Wed 6x6, Thu 7x7, Fri 7x7 win in 4; Saturday keeps win in 4 but
// hides the key among at least six legal moves and four slow traps; the
// Sunday Edition is the longest race of the week, 7x7 and win in 5. All of it
// is enforced by scripts/verify-race.mjs with its own independent solver.
export const PUZZLES = [
  { num: 1, quizId: 'race-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['d3', 'f3', 'g3'], black: ['d5', 'g5', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 161529 },
  { num: 2, quizId: 'race-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'e3', 'g3'], black: ['a5', 'b5', 'd4'], keyUci: 'e3d4', keySan: 'e3xd4', states: 179958 },
  { num: 3, quizId: 'race-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['g3', 'f2', 'g2'], black: ['f5', 'f4', 'g4'], keyUci: 'g3f4', keySan: 'g3xf4', states: 63623 },
  { num: 4, quizId: 'race-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['d3', 'a2', 'b2'], black: ['d5', 'a4', 'b4'], keyUci: 'd3d4', keySan: 'd3-d4', states: 93264 },
  { num: 5, quizId: 'race-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['a4', 'f3', 'g2'], black: ['a5', 'e4', 'g4'], keyUci: 'a4b5', keySan: 'a4-b5', states: 76325 },
  { num: 6, quizId: 'race-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['a3', 'b3', 'a2'], black: ['b5', 'c5', 'a4'], keyUci: 'b3b4', keySan: 'b3-b4', states: 12717 },
  { num: 7, quizId: 'race-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'f3'], black: ['g6', 'f5', 'a4'], keyUci: 'b3a4', keySan: 'b3xa4', states: 179390 },
  { num: 8, quizId: 'race-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'g3'], black: ['c5', 'd5', 'a4'], keyUci: 'b3a4', keySan: 'b3xa4', states: 184166 },
  { num: 9, quizId: 'race-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'f3'], black: ['a5', 'g5', 'a4'], keyUci: 'b3a4', keySan: 'b3xa4', states: 135001 },
  { num: 10, quizId: 'race-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['a3', 'd3', 'c2'], black: ['c5', 'a4', 'c4'], keyUci: 'd3c4', keySan: 'd3xc4', states: 195640 },
  { num: 11, quizId: 'race-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['c3', 'd2', 'e2'], black: ['c5', 'd4', 'e4'], keyUci: 'c3c4', keySan: 'c3-c4', states: 119411 },
  { num: 12, quizId: 'race-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['a4', 'b3', 'd3'], black: ['a6', 'b4', 'd4'], keyUci: 'a4a5', keySan: 'a4-a5', states: 109926 },
  { num: 13, quizId: 'race-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['a3', 'b3', 'e2'], black: ['b5', 'c5', 'a4'], keyUci: 'b3b4', keySan: 'b3-b4', states: 39019 },
  { num: 14, quizId: 'race-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['c3', 'f3', 'g3'], black: ['b5', 'g5', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 184556 },
  { num: 15, quizId: 'race-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'g3'], black: ['a5', 'f5', 'a4'], keyUci: 'b3a4', keySan: 'b3xa4', states: 137780 },
  { num: 16, quizId: 'race-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'f3', 'g3'], black: ['a5', 'g5', 'e4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 180040 },
  { num: 17, quizId: 'race-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['e3', 'f3', 'e2'], black: ['a5', 'e4', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 184955 },
  { num: 18, quizId: 'race-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['a3', 'b2', 'e2'], black: ['a5', 'b4', 'e4'], keyUci: 'a3a4', keySan: 'a3-a4', states: 90528 },
  { num: 19, quizId: 'race-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['a4', 'b3', 'c3'], black: ['a5', 'b4', 'c4'], keyUci: 'a4b5', keySan: 'a4-b5', states: 31161 },
  { num: 20, quizId: 'race-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['a3', 'b3', 'c2'], black: ['a5', 'b5', 'a4'], keyUci: 'b3b4', keySan: 'b3-b4', states: 20971 },
  { num: 21, quizId: 'race-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['e3', 'f3', 'g3'], black: ['e5', 'g5', 'e4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 133102 },
  { num: 22, quizId: 'race-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['c4', 'a3', 'd3'], black: ['c6', 'c5', 'b4'], keyUci: 'a3b4', keySan: 'a3xb4', states: 191715 },
  { num: 23, quizId: 'race-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'd3'], black: ['a5', 'd5', 'a4'], keyUci: 'b3a4', keySan: 'b3xa4', states: 161529 },
  { num: 24, quizId: 'race-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['a3', 'b3', 'c2'], black: ['g5', 'a4', 'c4'], keyUci: 'b3c4', keySan: 'b3xc4', states: 147374 },
  { num: 25, quizId: 'race-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['c3', 'a2', 'e2'], black: ['c5', 'b4', 'e4'], keyUci: 'c3c4', keySan: 'c3-c4', states: 152076 },
  { num: 26, quizId: 'race-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['g4', 'a3', 'f3'], black: ['g6', 'a5', 'a4'], keyUci: 'g4g5', keySan: 'g4-g5', states: 80291 },
  { num: 27, quizId: 'race-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['e3', 'f3', 'f2'], black: ['d5', 'e5', 'f4'], keyUci: 'e3e4', keySan: 'e3-e4', states: 12717 },
  { num: 28, quizId: 'race-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'f3', 'g3'], black: ['a5', 'e5', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 183638 },
  { num: 29, quizId: 'race-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['f3', 'f2', 'g2'], black: ['g5', 'f4', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 41532 },
  { num: 30, quizId: 'race-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'b3', 'c3'], black: ['a5', 'c5', 'c4'], keyUci: 'b3c4', keySan: 'b3xc4', states: 133102 },
  { num: 31, quizId: 'race-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['f3', 'g3', 'g2'], black: ['c5', 'e4', 'g4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 77010 },
  { num: 32, quizId: 'race-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['b3', 'c2', 'f2'], black: ['b5', 'd4', 'f4'], keyUci: 'b3b4', keySan: 'b3-b4', states: 132104 },
  { num: 33, quizId: 'race-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['g4', 'a3', 'e2'], black: ['g5', 'a4', 'f4'], keyUci: 'g4f5', keySan: 'g4-f5', states: 72113 },
  { num: 34, quizId: 'race-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['e3', 'f3', 'f2'], black: ['e5', 'f5', 'f4'], keyUci: 'e3e4', keySan: 'e3-e4', states: 7530 },
  { num: 35, quizId: 'race-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'f3', 'g3'], black: ['a5', 'f5', 'f4'], keyUci: 'g3f4', keySan: 'g3xf4', states: 188895 },
  { num: 36, quizId: 'race-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['f3', 'g3', 'e2'], black: ['g5', 'e4', 'g4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 91640 },
  { num: 37, quizId: 'race-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a3', 'f3', 'g3'], black: ['a5', 'b5', 'e4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 158075 },
  { num: 38, quizId: 'race-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['a3', 'f3', 'a2'], black: ['e5', 'a4', 'e4'], keyUci: 'f3e4', keySan: 'f3xe4', states: 188887 },
  { num: 39, quizId: 'race-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, cols: 6, rows: 6, winIn: 3, white: ['f3', 'a2', 'd2'], black: ['f5', 'a4', 'd4'], keyUci: 'f3f4', keySan: 'f3-f4', states: 105028 },
  { num: 40, quizId: 'race-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, cols: 7, rows: 7, winIn: 3, white: ['a4', 'g3', 'b2'], black: ['a5', 'c4', 'g4'], keyUci: 'a4b5', keySan: 'a4-b5', states: 103981 },
  { num: 41, quizId: 'race-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, cols: 6, rows: 6, winIn: 4, white: ['e3', 'f3', 'a2'], black: ['d5', 'e5', 'f4'], keyUci: 'e3e4', keySan: 'e3-e4', states: 32078 },
  { num: 42, quizId: 'race-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['a4', 'd3', 'a2'], black: ['a6', 'a5', 'c4'], keyUci: 'd3c4', keySan: 'd3xc4', states: 134083 },
  { num: 43, quizId: 'race-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['b3', 'f3', 'g3'], black: ['c5', 'g5', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 185867 },
  { num: 44, quizId: 'race-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, cols: 7, rows: 7, winIn: 4, white: ['e3', 'f3', 'g3'], black: ['e5', 'g5', 'g4'], keyUci: 'f3g4', keySan: 'f3xg4', states: 95172 },
  { num: 45, quizId: 'race-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, cols: 7, rows: 7, winIn: 5, white: ['a3', 'b3', 'b2'], black: ['a5', 'g5', 'b4'], keyUci: 'a3a4', keySan: 'a3-a4', states: 137423 },
];
