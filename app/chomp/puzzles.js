// Puzzle data for Chomp, the daily route puzzle. Imported ONLY by the server
// page (app/chomp/page.js), which filters live<=today before handing the bank to
// the client, and by the daily API routes that need the day's row.
//
// TWO RULES CARRY THE GAME:
//
//   1. The body NEVER retracts. Every square the head touches belongs to it for
//      the rest of the run, so the trail is a permanent wall.
//   2. A mascot is SOLID until its turn. You cannot cross the lion on the way to
//      the gamecock. That follows from rule 1: with a permanent trail, crossing
//      one early would leave it stranded under your own body forever, and a
//      visible wall is fairer than a board ruined twenty moves before anyone
//      notices.
//
// YOU DO NOT HAVE TO EAT THEM ALL. The score is how far down the cast you got,
// so a run that stalls on the fifth still counts for five. Clearing the whole
// day's cast is the perfect, whatever its length.
//
// ⚠️ REBUILT 2026-08-09 (owner: too easy, and the Sunday Edition worst of all).
// The bank this replaced passed every check it had and still played itself. Two
// things were wrong with it, and they are worth writing down because the checks
// looked fine while both were true:
//
//   THE GATE TESTED THE WRONG PLAYER. It asked that a CAREFUL GREEDY BOT get
//   stuck. Measured afterwards, a beam planner that keeps a few hundred ideas
//   alive at once cleared 63 of those 70 boards. So the boards were hard for a
//   bot and easy for a person, which is exactly backwards. The gate is now that
//   PLANNER (see scripts/verify-chomp.mjs), on every day of the week including
//   Monday.
//
//   THE BOARD WAS FAR TOO BIG. On a 10x10 the shortest legal route ran about 40
//   moves into 100 squares, so 60% of the board was still empty at the finish
//   and the permanent trail almost never became a real wall. The old day two,
//   the Sunday, forced 46% of its board; day one forced 31%.
//
// THE DIAL IS FORCED COVERAGE, and it is the one number that matters here.
// Because a leg can never be walked in fewer moves than its Manhattan distance,
// the sum of the legs is a PROVEN lower bound on the length of any legal route,
// so it is the share of the board the player has no choice but to use. That sum
// is `floor`, the true optimum is `min`, and coverage is (min + 1) / (w * h).
// It cannot be raised on a big board: long enough legs to force it there make
// the board unsolvable instead (measured: 0 of ~100 candidates at 9x9 and up).
// Hence the small boards below. This is the owner's ask in one line, that ideally
// a player uses up every square of the map but does not have to every day.
//
// Fields, all re-derived by scripts/verify-chomp.mjs rather than trusted:
//
//   w, h      board size, set by the weekday together with the cast, per RAMP:
//
//                     board  cast   forced coverage
//               Mon    8x8    6       56-66%    the most slack of the week
//               Tue    8x8    6       64-72%
//               Wed    8x8    7       70-78%
//               Thu    8x8    7       76-84%
//               Fri    7x7    6       80-88%
//               Sat    7x7    7       84-92%
//               Sun    7x7    8       88-100%   the whole cast, nearly every square
//
//             6x6 was measured OUT: it is small enough that the beam planner
//             clears every board on it, so there is no difficulty band there at
//             all (0 of 2,765 candidates survived). 8x8 is the roomiest size
//             where coverage still reaches the sixties. Days one and two are
//             frozen at the sizes they shipped on.
//   cast      the mascots in EATING ORDER; cast[i] sits on pellets[i]. Only the
//             BULLDOG is fixed, always first, so every run opens the same way.
//             Everything after it is a random order drawn from the other seven,
//             and the COUNT is the weekday's, six to seven on a weekday and the
//             whole eight on a Sunday.
//   start     the head's square at the drop, one square long.
//   pellets   the mascot positions, in the same order as `cast`.
//   floor     the sum of the legs' Manhattan distances. A proven lower bound on
//             any legal route, never a target.
//   min       the length of the SHORTEST legal route, found by exhaustive search
//             (IDA* on length) that knows nothing about how the board was built.
//             It replaces the old `solution` field, which recorded merely a route
//             somebody found and so said nothing about how much room was left.
//             `min` is what pins the coverage: a player cannot finish this board
//             in fewer than `min` moves, so `min + 1` squares WILL be used.
//
// The boards are generated backwards from a random Hamiltonian walk, with the
// mascots taken as waypoints along it, so a solution exists by construction and
// the generator never wastes its time on unsolvable layouts (random placement at
// this size is roughly 80% unsolvable). The waypoints are then chosen by exact DP
// to hit a target leg sum, which is how the weekday band above is dialled in.
//
// SUNDAY EDITION: the whole cast of eight on the smallest board of the week, at
// 88-100% forced coverage. One of the nine banked Sundays requires literally
// every square on the board. `sunday` must be true if and only if `live` really
// is a Sunday; the flag is the ONLY source of truth for the badge.
export const MASCOTS = ["bulldog","ibis","gamecock","tiger","eagle","longhorn","wildcat","seminole"];

export const PUZZLES = [
  { num: 1, quizId: 'chomp-8-8-26', live: '2026-08-08', dateLabel: 'August 8, 2026', sunday: false, w: 13, h: 13, start: [9,10], floor: 52, min: 52,
    cast: ['bulldog', 'tiger', 'gamecock', 'ibis', 'seminole', 'longhorn'],
    pellets: [[12,7], [0,0], [6,0], [1,2], [7,4], [3,2]] },
  { num: 2, quizId: 'chomp-8-9-26', live: '2026-08-09', dateLabel: 'August 9, 2026', sunday: true, w: 9, h: 9, start: [8,8], floor: 36, min: 36,
    cast: ['bulldog', 'ibis', 'longhorn', 'wildcat', 'seminole', 'tiger', 'gamecock', 'eagle'],
    pellets: [[3,7], [0,0], [4,1], [1,1], [2,3], [4,2], [6,3], [7,5]] },
  { num: 3, quizId: 'chomp-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false, w: 8, h: 8, start: [7,5], floor: 37, min: 39,
    cast: ['bulldog', 'ibis', 'eagle', 'longhorn', 'gamecock', 'wildcat'],
    pellets: [[1,0], [2,7], [1,6], [3,1], [4,5], [6,7]] },
  { num: 4, quizId: 'chomp-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false, w: 8, h: 8, start: [7,5], floor: 43, min: 43,
    cast: ['bulldog', 'ibis', 'eagle', 'tiger', 'longhorn', 'gamecock'],
    pellets: [[6,2], [0,7], [4,0], [1,4], [6,0], [5,0]] },
  { num: 5, quizId: 'chomp-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false, w: 8, h: 8, start: [3,5], floor: 47, min: 47,
    cast: ['bulldog', 'gamecock', 'longhorn', 'eagle', 'seminole', 'tiger', 'ibis'],
    pellets: [[5,6], [7,2], [0,7], [4,3], [0,0], [1,2], [7,0]] },
  { num: 6, quizId: 'chomp-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false, w: 8, h: 8, start: [0,0], floor: 49, min: 49,
    cast: ['bulldog', 'ibis', 'longhorn', 'wildcat', 'seminole', 'tiger', 'eagle'],
    pellets: [[6,6], [0,4], [2,7], [7,2], [3,3], [6,1], [3,0]] },
  { num: 7, quizId: 'chomp-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false, w: 7, h: 7, start: [1,1], floor: 39, min: 41,
    cast: ['bulldog', 'seminole', 'tiger', 'longhorn', 'wildcat', 'eagle'],
    pellets: [[4,6], [1,2], [5,4], [2,0], [6,5], [5,6]] },
  { num: 8, quizId: 'chomp-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 40, min: 42,
    cast: ['bulldog', 'ibis', 'wildcat', 'gamecock', 'seminole', 'tiger', 'eagle'],
    pellets: [[2,3], [0,0], [4,6], [3,4], [6,6], [3,1], [5,3]] },
  { num: 9, quizId: 'chomp-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true, w: 7, h: 7, start: [6,0], floor: 42, min: 44,
    cast: ['bulldog', 'longhorn', 'gamecock', 'seminole', 'tiger', 'eagle', 'wildcat', 'ibis'],
    pellets: [[2,2], [0,0], [2,6], [4,2], [5,4], [6,1], [4,6], [2,4]] },
  { num: 10, quizId: 'chomp-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false, w: 8, h: 8, start: [7,7], floor: 36, min: 36,
    cast: ['bulldog', 'longhorn', 'tiger', 'ibis', 'eagle', 'gamecock'],
    pellets: [[2,0], [6,2], [1,0], [0,3], [0,6], [3,5]] },
  { num: 11, quizId: 'chomp-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false, w: 8, h: 8, start: [1,6], floor: 43, min: 43,
    cast: ['bulldog', 'eagle', 'seminole', 'longhorn', 'gamecock', 'wildcat'],
    pellets: [[0,2], [7,7], [4,6], [7,0], [3,4], [1,1]] },
  { num: 12, quizId: 'chomp-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false, w: 8, h: 8, start: [7,0], floor: 48, min: 48,
    cast: ['bulldog', 'gamecock', 'ibis', 'longhorn', 'tiger', 'eagle', 'seminole'],
    pellets: [[5,1], [7,7], [4,1], [0,7], [2,3], [0,5], [3,0]] },
  { num: 13, quizId: 'chomp-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false, w: 8, h: 8, start: [6,3], floor: 49, min: 51,
    cast: ['bulldog', 'longhorn', 'eagle', 'gamecock', 'seminole', 'ibis', 'wildcat'],
    pellets: [[0,7], [6,4], [0,5], [4,1], [3,3], [7,2], [2,0]] },
  { num: 14, quizId: 'chomp-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, w: 7, h: 7, start: [1,5], floor: 38, min: 40,
    cast: ['bulldog', 'eagle', 'tiger', 'longhorn', 'seminole', 'wildcat'],
    pellets: [[6,6], [0,3], [6,0], [5,3], [3,0], [0,2]] },
  { num: 15, quizId: 'chomp-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, w: 7, h: 7, start: [6,0], floor: 40, min: 42,
    cast: ['bulldog', 'eagle', 'tiger', 'seminole', 'ibis', 'longhorn', 'gamecock'],
    pellets: [[1,2], [0,0], [2,6], [6,2], [4,5], [6,6], [2,4]] },
  { num: 16, quizId: 'chomp-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, w: 7, h: 7, start: [3,5], floor: 43, min: 45,
    cast: ['bulldog', 'gamecock', 'seminole', 'ibis', 'wildcat', 'tiger', 'longhorn', 'eagle'],
    pellets: [[0,0], [5,3], [6,0], [5,4], [6,6], [3,3], [1,5], [2,1]] },
  { num: 17, quizId: 'chomp-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, w: 8, h: 8, start: [5,3], floor: 37, min: 37,
    cast: ['bulldog', 'wildcat', 'gamecock', 'seminole', 'longhorn', 'ibis'],
    pellets: [[7,0], [0,0], [2,6], [7,2], [5,4], [4,1]] },
  { num: 18, quizId: 'chomp-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, w: 8, h: 8, start: [7,5], floor: 43, min: 45,
    cast: ['bulldog', 'ibis', 'gamecock', 'seminole', 'eagle', 'tiger'],
    pellets: [[2,0], [5,4], [1,7], [5,5], [1,1], [0,5]] },
  { num: 19, quizId: 'chomp-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, w: 8, h: 8, start: [0,7], floor: 46, min: 46,
    cast: ['bulldog', 'eagle', 'gamecock', 'tiger', 'ibis', 'longhorn', 'wildcat'],
    pellets: [[7,0], [5,2], [7,3], [1,1], [6,5], [3,7], [4,5]] },
  { num: 20, quizId: 'chomp-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, w: 8, h: 8, start: [1,1], floor: 47, min: 49,
    cast: ['bulldog', 'ibis', 'longhorn', 'tiger', 'eagle', 'gamecock', 'seminole'],
    pellets: [[7,3], [3,1], [5,5], [0,3], [3,7], [7,4], [4,7]] },
  { num: 21, quizId: 'chomp-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, w: 7, h: 7, start: [6,0], floor: 39, min: 39,
    cast: ['bulldog', 'longhorn', 'tiger', 'seminole', 'gamecock', 'ibis'],
    pellets: [[1,5], [5,0], [0,5], [5,6], [6,5], [6,3]] },
  { num: 22, quizId: 'chomp-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, w: 7, h: 7, start: [1,1], floor: 39, min: 41,
    cast: ['bulldog', 'eagle', 'wildcat', 'gamecock', 'seminole', 'longhorn', 'tiger'],
    pellets: [[0,0], [2,6], [6,0], [4,5], [6,4], [5,6], [2,3]] },
  { num: 23, quizId: 'chomp-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, w: 7, h: 7, start: [6,6], floor: 46, min: 48,
    cast: ['bulldog', 'ibis', 'tiger', 'seminole', 'wildcat', 'eagle', 'longhorn', 'gamecock'],
    pellets: [[4,0], [1,4], [5,6], [0,4], [4,2], [1,1], [3,0], [0,2]] },
  { num: 24, quizId: 'chomp-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, w: 8, h: 8, start: [1,4], floor: 37, min: 41,
    cast: ['bulldog', 'ibis', 'eagle', 'gamecock', 'tiger', 'wildcat'],
    pellets: [[1,2], [7,7], [2,4], [3,3], [0,1], [5,5]] },
  { num: 25, quizId: 'chomp-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, w: 8, h: 8, start: [1,6], floor: 43, min: 45,
    cast: ['bulldog', 'longhorn', 'ibis', 'tiger', 'seminole', 'wildcat'],
    pellets: [[3,0], [1,3], [7,0], [3,5], [7,4], [3,7]] },
  { num: 26, quizId: 'chomp-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, w: 8, h: 8, start: [2,4], floor: 46, min: 48,
    cast: ['bulldog', 'wildcat', 'gamecock', 'eagle', 'ibis', 'longhorn', 'seminole'],
    pellets: [[4,6], [7,3], [1,7], [1,0], [5,4], [7,1], [2,2]] },
  { num: 27, quizId: 'chomp-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, w: 8, h: 8, start: [0,7], floor: 49, min: 51,
    cast: ['bulldog', 'eagle', 'ibis', 'longhorn', 'wildcat', 'seminole', 'tiger'],
    pellets: [[7,1], [1,2], [5,3], [7,4], [1,7], [3,3], [6,6]] },
  { num: 28, quizId: 'chomp-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 39, min: 41,
    cast: ['bulldog', 'seminole', 'gamecock', 'tiger', 'wildcat', 'longhorn'],
    pellets: [[0,6], [1,1], [5,3], [4,0], [6,6], [2,3]] },
  { num: 29, quizId: 'chomp-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, w: 7, h: 7, start: [6,4], floor: 41, min: 43,
    cast: ['bulldog', 'wildcat', 'tiger', 'seminole', 'eagle', 'longhorn', 'ibis'],
    pellets: [[6,6], [1,0], [5,1], [3,6], [1,2], [1,6], [0,1]] },
  { num: 30, quizId: 'chomp-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, w: 7, h: 7, start: [4,0], floor: 44, min: 46,
    cast: ['bulldog', 'wildcat', 'tiger', 'ibis', 'seminole', 'gamecock', 'longhorn', 'eagle'],
    pellets: [[0,2], [5,5], [1,4], [3,2], [0,6], [6,4], [5,1], [6,2]] },
  { num: 31, quizId: 'chomp-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, w: 8, h: 8, start: [1,4], floor: 41, min: 41,
    cast: ['bulldog', 'seminole', 'eagle', 'wildcat', 'tiger', 'longhorn'],
    pellets: [[7,7], [0,0], [3,3], [5,0], [6,3], [6,0]] },
  { num: 32, quizId: 'chomp-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, w: 8, h: 8, start: [1,5], floor: 43, min: 45,
    cast: ['bulldog', 'eagle', 'tiger', 'ibis', 'seminole', 'wildcat'],
    pellets: [[0,2], [3,7], [1,0], [6,7], [6,2], [4,5]] },
  { num: 33, quizId: 'chomp-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, w: 8, h: 8, start: [7,6], floor: 46, min: 48,
    cast: ['bulldog', 'gamecock', 'seminole', 'wildcat', 'ibis', 'longhorn', 'tiger'],
    pellets: [[0,2], [2,6], [7,1], [4,0], [6,4], [2,1], [3,0]] },
  { num: 34, quizId: 'chomp-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, w: 8, h: 8, start: [6,3], floor: 50, min: 52,
    cast: ['bulldog', 'longhorn', 'tiger', 'gamecock', 'seminole', 'wildcat', 'eagle'],
    pellets: [[0,0], [4,2], [6,1], [0,7], [7,4], [4,7], [6,5]] },
  { num: 35, quizId: 'chomp-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, w: 7, h: 7, start: [5,5], floor: 39, min: 41,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'eagle', 'gamecock'],
    pellets: [[0,0], [4,6], [1,1], [5,4], [5,1], [4,1]] },
  { num: 36, quizId: 'chomp-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 40, min: 42,
    cast: ['bulldog', 'ibis', 'gamecock', 'tiger', 'eagle', 'longhorn', 'seminole'],
    pellets: [[5,3], [2,1], [0,6], [2,3], [0,0], [6,6], [4,4]] },
  { num: 37, quizId: 'chomp-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, w: 7, h: 7, start: [0,0], floor: 44, min: 46,
    cast: ['bulldog', 'longhorn', 'gamecock', 'ibis', 'wildcat', 'eagle', 'tiger', 'seminole'],
    pellets: [[1,3], [6,0], [2,3], [6,6], [4,3], [3,6], [0,4], [2,6]] },
  { num: 38, quizId: 'chomp-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, w: 8, h: 8, start: [5,5], floor: 37, min: 39,
    cast: ['bulldog', 'longhorn', 'gamecock', 'tiger', 'ibis', 'eagle'],
    pellets: [[0,2], [7,7], [5,1], [6,3], [5,2], [2,1]] },
  { num: 39, quizId: 'chomp-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, w: 8, h: 8, start: [4,3], floor: 41, min: 43,
    cast: ['bulldog', 'longhorn', 'ibis', 'wildcat', 'gamecock', 'tiger'],
    pellets: [[3,5], [0,0], [7,6], [4,0], [7,3], [7,5]] },
  { num: 40, quizId: 'chomp-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, w: 8, h: 8, start: [1,3], floor: 47, min: 47,
    cast: ['bulldog', 'longhorn', 'gamecock', 'ibis', 'eagle', 'tiger', 'wildcat'],
    pellets: [[0,7], [7,0], [5,5], [7,7], [2,6], [6,3], [4,1]] },
  { num: 41, quizId: 'chomp-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, w: 8, h: 8, start: [0,7], floor: 50, min: 50,
    cast: ['bulldog', 'gamecock', 'ibis', 'tiger', 'eagle', 'seminole', 'longhorn'],
    pellets: [[7,0], [4,4], [7,2], [4,5], [7,7], [2,2], [1,4]] },
  { num: 42, quizId: 'chomp-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 41, min: 41,
    cast: ['bulldog', 'gamecock', 'eagle', 'longhorn', 'ibis', 'tiger'],
    pellets: [[0,6], [6,0], [0,2], [2,1], [4,2], [0,3]] },
  { num: 43, quizId: 'chomp-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, w: 7, h: 7, start: [0,2], floor: 41, min: 43,
    cast: ['bulldog', 'seminole', 'ibis', 'eagle', 'gamecock', 'longhorn', 'tiger'],
    pellets: [[1,0], [0,6], [6,4], [2,0], [4,4], [6,0], [4,1]] },
  { num: 44, quizId: 'chomp-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, w: 7, h: 7, start: [2,2], floor: 44, min: 46,
    cast: ['bulldog', 'tiger', 'wildcat', 'longhorn', 'gamecock', 'eagle', 'ibis', 'seminole'],
    pellets: [[1,3], [0,0], [3,4], [0,6], [6,0], [4,2], [5,6], [6,2]] },
  { num: 45, quizId: 'chomp-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, w: 8, h: 8, start: [1,7], floor: 36, min: 38,
    cast: ['bulldog', 'gamecock', 'seminole', 'wildcat', 'longhorn', 'eagle'],
    pellets: [[3,0], [1,3], [5,4], [7,0], [4,7], [4,6]] },
  { num: 46, quizId: 'chomp-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, w: 8, h: 8, start: [0,1], floor: 43, min: 45,
    cast: ['bulldog', 'seminole', 'eagle', 'tiger', 'ibis', 'wildcat'],
    pellets: [[7,5], [1,1], [3,6], [0,5], [6,7], [4,6]] },
  { num: 47, quizId: 'chomp-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, w: 8, h: 8, start: [6,6], floor: 46, min: 46,
    cast: ['bulldog', 'gamecock', 'wildcat', 'seminole', 'longhorn', 'eagle', 'tiger'],
    pellets: [[1,0], [7,5], [4,7], [4,5], [0,6], [5,3], [2,4]] },
  { num: 48, quizId: 'chomp-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, w: 8, h: 8, start: [2,0], floor: 49, min: 49,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'longhorn', 'eagle', 'wildcat'],
    pellets: [[0,4], [4,6], [1,1], [7,4], [2,2], [6,5], [2,7]] },
  { num: 49, quizId: 'chomp-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 39, min: 39,
    cast: ['bulldog', 'wildcat', 'seminole', 'eagle', 'longhorn', 'tiger'],
    pellets: [[0,6], [6,0], [4,3], [3,1], [0,1], [3,4]] },
  { num: 50, quizId: 'chomp-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, w: 7, h: 7, start: [6,6], floor: 41, min: 41,
    cast: ['bulldog', 'seminole', 'ibis', 'gamecock', 'tiger', 'longhorn', 'wildcat'],
    pellets: [[4,3], [6,4], [3,0], [0,6], [2,0], [0,4], [1,2]] },
  { num: 51, quizId: 'chomp-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, w: 7, h: 7, start: [5,1], floor: 43, min: 45,
    cast: ['bulldog', 'ibis', 'seminole', 'longhorn', 'eagle', 'tiger', 'gamecock', 'wildcat'],
    pellets: [[2,6], [5,4], [0,6], [5,3], [0,1], [3,0], [3,1], [5,0]] },
  { num: 52, quizId: 'chomp-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, w: 8, h: 8, start: [7,0], floor: 36, min: 38,
    cast: ['bulldog', 'tiger', 'longhorn', 'seminole', 'gamecock', 'ibis'],
    pellets: [[2,7], [2,4], [6,6], [6,4], [1,7], [0,3]] },
  { num: 53, quizId: 'chomp-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, w: 8, h: 8, start: [7,2], floor: 45, min: 45,
    cast: ['bulldog', 'longhorn', 'ibis', 'wildcat', 'seminole', 'eagle'],
    pellets: [[3,0], [1,6], [7,3], [1,7], [0,1], [2,4]] },
  { num: 54, quizId: 'chomp-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, w: 8, h: 8, start: [7,7], floor: 45, min: 45,
    cast: ['bulldog', 'ibis', 'eagle', 'tiger', 'longhorn', 'seminole', 'wildcat'],
    pellets: [[1,1], [6,7], [3,5], [2,6], [0,3], [5,0], [6,1]] },
  { num: 55, quizId: 'chomp-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, w: 8, h: 8, start: [3,0], floor: 49, min: 51,
    cast: ['bulldog', 'gamecock', 'eagle', 'longhorn', 'ibis', 'wildcat', 'seminole'],
    pellets: [[0,6], [6,1], [4,4], [7,6], [4,0], [1,2], [2,6]] },
  { num: 56, quizId: 'chomp-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, w: 7, h: 7, start: [0,6], floor: 38, min: 42,
    cast: ['bulldog', 'gamecock', 'tiger', 'eagle', 'seminole', 'ibis'],
    pellets: [[4,1], [6,3], [3,0], [0,5], [3,2], [5,5]] },
  { num: 57, quizId: 'chomp-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, w: 7, h: 7, start: [5,5], floor: 42, min: 42,
    cast: ['bulldog', 'gamecock', 'eagle', 'ibis', 'wildcat', 'seminole', 'longhorn'],
    pellets: [[1,3], [5,0], [0,4], [3,4], [0,5], [4,6], [6,0]] },
  { num: 58, quizId: 'chomp-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, w: 7, h: 7, start: [1,1], floor: 43, min: 45,
    cast: ['bulldog', 'wildcat', 'gamecock', 'seminole', 'ibis', 'tiger', 'eagle', 'longhorn'],
    pellets: [[0,0], [6,2], [0,6], [1,3], [6,6], [4,4], [6,4], [3,2]] },
  { num: 59, quizId: 'chomp-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, w: 8, h: 8, start: [7,5], floor: 39, min: 39,
    cast: ['bulldog', 'ibis', 'eagle', 'seminole', 'gamecock', 'wildcat'],
    pellets: [[0,7], [6,0], [4,4], [4,6], [6,2], [7,4]] },
  { num: 60, quizId: 'chomp-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, w: 8, h: 8, start: [6,4], floor: 43, min: 45,
    cast: ['bulldog', 'gamecock', 'ibis', 'eagle', 'tiger', 'seminole'],
    pellets: [[2,1], [4,7], [0,1], [7,2], [5,6], [5,2]] },
  { num: 61, quizId: 'chomp-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, w: 8, h: 8, start: [6,4], floor: 45, min: 45,
    cast: ['bulldog', 'gamecock', 'wildcat', 'tiger', 'ibis', 'longhorn', 'eagle'],
    pellets: [[0,0], [7,5], [2,2], [4,5], [0,6], [4,6], [5,6]] },
  { num: 62, quizId: 'chomp-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, w: 8, h: 8, start: [1,4], floor: 51, min: 51,
    cast: ['bulldog', 'ibis', 'longhorn', 'gamecock', 'eagle', 'wildcat', 'seminole'],
    pellets: [[0,0], [7,7], [2,0], [6,2], [2,3], [6,4], [4,6]] },
  { num: 63, quizId: 'chomp-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, w: 7, h: 7, start: [5,5], floor: 40, min: 40,
    cast: ['bulldog', 'eagle', 'tiger', 'seminole', 'ibis', 'gamecock'],
    pellets: [[0,0], [6,6], [2,4], [3,6], [0,5], [3,3]] },
  { num: 64, quizId: 'chomp-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, w: 7, h: 7, start: [1,3], floor: 40, min: 42,
    cast: ['bulldog', 'ibis', 'wildcat', 'eagle', 'gamecock', 'longhorn', 'seminole'],
    pellets: [[6,0], [2,6], [5,4], [1,1], [2,2], [0,6], [0,4]] },
  { num: 65, quizId: 'chomp-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true, w: 7, h: 7, start: [1,3], floor: 44, min: 46,
    cast: ['bulldog', 'wildcat', 'longhorn', 'ibis', 'seminole', 'tiger', 'eagle', 'gamecock'],
    pellets: [[6,6], [4,3], [6,0], [1,5], [4,0], [0,1], [1,2], [1,1]] },
  { num: 66, quizId: 'chomp-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, w: 8, h: 8, start: [0,0], floor: 36, min: 38,
    cast: ['bulldog', 'ibis', 'wildcat', 'seminole', 'gamecock', 'tiger'],
    pellets: [[1,4], [1,3], [3,0], [6,7], [1,6], [6,2]] },
  { num: 67, quizId: 'chomp-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, w: 8, h: 8, start: [7,0], floor: 43, min: 43,
    cast: ['bulldog', 'wildcat', 'seminole', 'gamecock', 'ibis', 'eagle'],
    pellets: [[0,7], [2,4], [6,5], [0,0], [2,2], [0,4]] },
  { num: 68, quizId: 'chomp-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, w: 8, h: 8, start: [0,7], floor: 47, min: 47,
    cast: ['bulldog', 'longhorn', 'wildcat', 'ibis', 'eagle', 'seminole', 'tiger'],
    pellets: [[7,5], [5,2], [7,3], [4,0], [0,6], [3,0], [3,5]] },
  { num: 69, quizId: 'chomp-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, w: 8, h: 8, start: [7,7], floor: 49, min: 49,
    cast: ['bulldog', 'wildcat', 'seminole', 'eagle', 'tiger', 'ibis', 'gamecock'],
    pellets: [[2,0], [6,2], [2,7], [5,3], [1,4], [1,0], [0,5]] },
  { num: 70, quizId: 'chomp-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 40, min: 42,
    cast: ['bulldog', 'seminole', 'longhorn', 'eagle', 'ibis', 'wildcat'],
    pellets: [[3,1], [0,6], [3,5], [0,0], [6,6], [5,1]] },
];
