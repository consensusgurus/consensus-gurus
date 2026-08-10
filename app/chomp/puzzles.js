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
// ⚠️ TIGHTENED 2026-08-10 (owner: still far too easy, early-week days included).
// This is the SECOND difficulty rebuild, and the first one is worth reading as a
// cautionary tale because it half-fixed the problem and then hid it:
//
//   ROUND ONE (2026-08-09) FOUND THE RIGHT DIAL AND SET IT TOO LOW. It correctly
//   identified FORCED COVERAGE as the thing that matters and moved the boards off
//   10x10, but it then wrote a Monday band of 56-66%, which leaves TWENTY-FOUR
//   squares the player never has to touch. Measured afterwards: on such a board
//   79% of the moves available to you at any moment still win, so almost nothing
//   you do is a mistake. The ceiling was never tested. It is far higher: 7x7 with
//   a cast of six reaches 88% comfortably.
//
//   THE GATE WAS OVERFIT, AGAIN. Round one required a 300-wide beam planner to get
//   stuck. The SAME beam at width 2000 clears 90% of the boards it approved, and a
//   beam of the same width with a different scoring function clears several of them
//   outright. That is the FOURTH player model in a row to be beaten this way (a
//   myopic line, then a careful bot, then a 300-beam). A bot gate normalises every
//   board to "just barely beats this bot" and says nothing about a person, so it is
//   no longer a gate here at all. It is printed as a diagnostic and ignored.
//
// THE DIAL IS FORCED COVERAGE, AND THE HONEST UNIT IS SPARE SQUARES. Because a leg
// can never be walked in fewer moves than its Manhattan distance, the sum of the
// legs is a PROVEN lower bound on any legal route. That sum is `floor`, the true
// optimum is `min`, and `cells - (min + 1)` is the number of squares the player is
// free to waste. Monday now leaves NINE. Sunday leaves none or one, and five of the
// nine banked Sundays are a Hamiltonian path: every square, no spare at all.
//
// THE WHOLE WEEK IS 7x7 (owner, 2026-08-10). 8x8 with a cast of six tops out around
// 80% coverage and 9x9 and up cannot be squeezed at all (long enough legs to force
// it make the board unsolvable instead: 0 of ~100 candidates). 6x6 is out the other
// end, small enough that the boards stop having any shape. 7x7 is the only size
// where every rung of the week is reachable, so the ramp is carried by the cast and
// by the coverage instead of by the board.
//
// Fields, all re-derived by scripts/verify-chomp.mjs rather than trusted:
//
//   w, h      7 and 7 on every board from 2026-08-11. The first three boards are
//             live history and keep the sizes they shipped on.
//   cast      the mascots in EATING ORDER; cast[i] sits on pellets[i]. Only the
//             BULLDOG is fixed, always first, so every run opens the same way.
//             Everything after it is a random order drawn from the other seven,
//             and the COUNT is the weekday's, per RAMP:
//
//                    cast   spare squares   forced coverage
//              Mon     6        9-10             80-82%
//              Tue     6         7-8             84-86%
//              Wed     7           6                88%
//              Thu     7           5                90%
//              Fri     7           4                92%
//              Sat     7         2-3             94-96%
//              Sun     8         0-1            98-100%   the whole cast, and on
//                                                         five of nine, literally
//                                                         every square
//
//   start     the head's square at the drop, one square long.
//   pellets   the mascot positions, in the same order as `cast`.
//   floor     the sum of the legs' Manhattan distances. A proven lower bound on
//             any legal route, never a target.
//   min       the length of the SHORTEST legal route, found by exhaustive search
//             (IDA* on length) that knows nothing about how the board was built.
//             `min` is what pins the coverage: a player cannot finish this board
//             in fewer than `min` moves, so `min + 1` squares WILL be used.
//
// The boards are generated backwards from a random Hamiltonian walk, with the
// mascots taken as waypoints ALONG that walk, so a solution exists by construction
// and the generator never wastes the solver on unsolvable layouts (random placement
// at this size is roughly 80% unsolvable). The waypoints are then chosen by exact DP
// to hit a target leg sum, which is how the rung above is dialled in. Every board is
// then mapped through a random symmetry of the square, because the walk generator
// left to itself favours the same corners and the bank starts to look like one board
// sixty times.
//
// SECOND GATE, ADDED 2026-08-10: FORGIVENESS. Coverage says how much of the board
// you must use; forgiveness says how much the board punishes you, and a board can
// have one without the other. It is measured by walking a winning route and asking,
// at every single ply, how many of the legal moves still leave the board winnable.
// The bank this replaced ran 79% on a Monday, so four moves in five were survivable
// and carelessness cost nothing. Every board here is at or under 70%, and the
// Sundays run 59-64% with all but one ply having exactly ONE right answer.
//
// SUNDAY EDITION: the whole cast of eight, 0-1 spare squares. `sunday` must be true
// if and only if `live` really is a Sunday; the flag is the ONLY source of truth for
// the badge.

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
  { num: 4, quizId: 'chomp-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false, w: 7, h: 7, start: [1,3], floor: 40, min: 40,
    cast: ['bulldog', 'ibis', 'wildcat', 'longhorn', 'eagle', 'tiger'],
    pellets: [[0,6], [3,2], [4,4], [0,0], [5,6], [6,0]] },
  { num: 5, quizId: 'chomp-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 42, min: 42,
    cast: ['bulldog', 'wildcat', 'ibis', 'gamecock', 'seminole', 'tiger', 'eagle'],
    pellets: [[6,6], [4,4], [6,0], [0,3], [4,1], [2,6], [0,4]] },
  { num: 6, quizId: 'chomp-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false, w: 7, h: 7, start: [0,4], floor: 43, min: 43,
    cast: ['bulldog', 'longhorn', 'tiger', 'seminole', 'ibis', 'eagle', 'gamecock'],
    pellets: [[1,6], [0,0], [6,6], [2,1], [3,6], [4,5], [3,2]] },
  { num: 7, quizId: 'chomp-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false, w: 7, h: 7, start: [1,1], floor: 44, min: 44,
    cast: ['bulldog', 'eagle', 'wildcat', 'gamecock', 'tiger', 'ibis', 'longhorn'],
    pellets: [[5,2], [1,2], [6,6], [3,4], [6,0], [0,3], [2,6]] },
  { num: 8, quizId: 'chomp-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 45, min: 45,
    cast: ['bulldog', 'wildcat', 'gamecock', 'eagle', 'tiger', 'seminole', 'longhorn'],
    pellets: [[3,3], [1,2], [5,5], [0,0], [4,2], [6,0], [1,6]] },
  { num: 9, quizId: 'chomp-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true, w: 7, h: 7, start: [5,5], floor: 48, min: 48,
    cast: ['bulldog', 'tiger', 'eagle', 'gamecock', 'wildcat', 'seminole', 'longhorn', 'ibis'],
    pellets: [[1,1], [5,2], [3,1], [6,0], [2,4], [6,6], [0,0], [2,0]] },
  { num: 10, quizId: 'chomp-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 37, min: 39,
    cast: ['bulldog', 'wildcat', 'longhorn', 'gamecock', 'seminole', 'eagle'],
    pellets: [[6,4], [0,0], [2,5], [4,2], [6,6], [3,6]] },
  { num: 11, quizId: 'chomp-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false, w: 7, h: 7, start: [0,2], floor: 39, min: 41,
    cast: ['bulldog', 'tiger', 'ibis', 'seminole', 'wildcat', 'eagle'],
    pellets: [[2,4], [0,0], [6,6], [0,5], [2,1], [4,3]] },
  { num: 12, quizId: 'chomp-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false, w: 7, h: 7, start: [6,0], floor: 42, min: 42,
    cast: ['bulldog', 'wildcat', 'tiger', 'eagle', 'gamecock', 'longhorn', 'seminole'],
    pellets: [[1,3], [5,0], [0,6], [1,4], [3,6], [6,4], [4,6]] },
  { num: 13, quizId: 'chomp-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false, w: 7, h: 7, start: [6,0], floor: 43, min: 43,
    cast: ['bulldog', 'seminole', 'gamecock', 'eagle', 'longhorn', 'ibis', 'tiger'],
    pellets: [[5,1], [0,0], [6,6], [1,1], [5,5], [3,4], [4,3]] },
  { num: 14, quizId: 'chomp-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 44, min: 44,
    cast: ['bulldog', 'tiger', 'eagle', 'gamecock', 'wildcat', 'seminole', 'longhorn'],
    pellets: [[1,5], [6,3], [0,6], [3,1], [4,3], [6,0], [0,2]] },
  { num: 15, quizId: 'chomp-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, w: 7, h: 7, start: [5,5], floor: 44, min: 46,
    cast: ['bulldog', 'gamecock', 'seminole', 'tiger', 'longhorn', 'eagle', 'wildcat'],
    pellets: [[0,4], [6,6], [2,0], [4,4], [0,1], [1,0], [4,2]] },
  { num: 16, quizId: 'chomp-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, w: 7, h: 7, start: [3,5], floor: 47, min: 47,
    cast: ['bulldog', 'wildcat', 'seminole', 'longhorn', 'gamecock', 'ibis', 'tiger', 'eagle'],
    pellets: [[0,6], [6,6], [2,2], [6,4], [5,0], [0,4], [1,1], [5,2]] },
  { num: 17, quizId: 'chomp-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, w: 7, h: 7, start: [2,4], floor: 39, min: 39,
    cast: ['bulldog', 'seminole', 'longhorn', 'gamecock', 'eagle', 'tiger'],
    pellets: [[1,1], [6,6], [4,3], [6,0], [0,6], [2,5]] },
  { num: 18, quizId: 'chomp-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, w: 7, h: 7, start: [2,0], floor: 40, min: 40,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'ibis', 'gamecock'],
    pellets: [[0,6], [6,0], [6,4], [2,3], [6,6], [2,6]] },
  { num: 19, quizId: 'chomp-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, w: 7, h: 7, start: [4,0], floor: 42, min: 42,
    cast: ['bulldog', 'seminole', 'eagle', 'wildcat', 'ibis', 'tiger', 'longhorn'],
    pellets: [[6,4], [1,2], [3,0], [0,6], [1,3], [6,6], [4,4]] },
  { num: 20, quizId: 'chomp-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, w: 7, h: 7, start: [0,2], floor: 43, min: 43,
    cast: ['bulldog', 'wildcat', 'seminole', 'longhorn', 'eagle', 'tiger', 'ibis'],
    pellets: [[5,5], [3,3], [5,1], [1,4], [0,0], [6,1], [3,6]] },
  { num: 21, quizId: 'chomp-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, w: 7, h: 7, start: [0,4], floor: 44, min: 44,
    cast: ['bulldog', 'eagle', 'seminole', 'ibis', 'wildcat', 'tiger', 'gamecock'],
    pellets: [[4,6], [0,0], [3,4], [6,0], [4,2], [6,6], [4,4]] },
  { num: 22, quizId: 'chomp-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 45, min: 45,
    cast: ['bulldog', 'wildcat', 'gamecock', 'ibis', 'tiger', 'seminole', 'longhorn'],
    pellets: [[4,6], [3,3], [5,1], [0,6], [6,0], [4,4], [6,5]] },
  { num: 23, quizId: 'chomp-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, w: 7, h: 7, start: [5,5], floor: 48, min: 48,
    cast: ['bulldog', 'seminole', 'ibis', 'longhorn', 'tiger', 'wildcat', 'gamecock', 'eagle'],
    pellets: [[6,6], [0,0], [1,5], [6,0], [2,4], [3,1], [2,0], [4,2]] },
  { num: 24, quizId: 'chomp-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, w: 7, h: 7, start: [0,6], floor: 38, min: 38,
    cast: ['bulldog', 'gamecock', 'eagle', 'wildcat', 'ibis', 'seminole'],
    pellets: [[4,0], [1,4], [2,2], [6,6], [4,2], [6,0]] },
  { num: 25, quizId: 'chomp-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, w: 7, h: 7, start: [0,2], floor: 40, min: 40,
    cast: ['bulldog', 'gamecock', 'wildcat', 'eagle', 'tiger', 'longhorn'],
    pellets: [[3,5], [0,6], [6,0], [5,5], [2,0], [4,2]] },
  { num: 26, quizId: 'chomp-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 42, min: 42,
    cast: ['bulldog', 'eagle', 'seminole', 'wildcat', 'longhorn', 'ibis', 'tiger'],
    pellets: [[3,2], [2,6], [5,2], [4,6], [6,0], [1,6], [0,2]] },
  { num: 27, quizId: 'chomp-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 43, min: 43,
    cast: ['bulldog', 'ibis', 'tiger', 'seminole', 'eagle', 'wildcat', 'longhorn'],
    pellets: [[1,1], [6,2], [0,0], [3,5], [0,6], [6,3], [2,3]] },
  { num: 28, quizId: 'chomp-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, w: 7, h: 7, start: [4,4], floor: 44, min: 44,
    cast: ['bulldog', 'ibis', 'gamecock', 'tiger', 'eagle', 'wildcat', 'longhorn'],
    pellets: [[3,1], [6,6], [0,0], [1,5], [3,3], [4,6], [0,4]] },
  { num: 29, quizId: 'chomp-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, w: 7, h: 7, start: [5,5], floor: 45, min: 45,
    cast: ['bulldog', 'wildcat', 'tiger', 'longhorn', 'gamecock', 'seminole', 'eagle'],
    pellets: [[2,0], [1,5], [0,0], [6,6], [4,0], [6,2], [6,1]] },
  { num: 30, quizId: 'chomp-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, w: 7, h: 7, start: [2,6], floor: 47, min: 47,
    cast: ['bulldog', 'eagle', 'wildcat', 'gamecock', 'longhorn', 'tiger', 'ibis', 'seminole'],
    pellets: [[6,3], [0,6], [4,4], [0,0], [3,1], [1,2], [6,0], [5,2]] },
  { num: 31, quizId: 'chomp-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, w: 7, h: 7, start: [4,4], floor: 39, min: 39,
    cast: ['bulldog', 'gamecock', 'ibis', 'eagle', 'wildcat', 'longhorn'],
    pellets: [[5,1], [1,4], [3,3], [2,6], [6,0], [0,5]] },
  { num: 32, quizId: 'chomp-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, w: 7, h: 7, start: [2,0], floor: 40, min: 40,
    cast: ['bulldog', 'ibis', 'gamecock', 'longhorn', 'seminole', 'wildcat'],
    pellets: [[3,4], [0,0], [2,6], [6,0], [6,6], [5,3]] },
  { num: 33, quizId: 'chomp-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, w: 7, h: 7, start: [1,5], floor: 42, min: 42,
    cast: ['bulldog', 'wildcat', 'gamecock', 'seminole', 'eagle', 'tiger', 'ibis'],
    pellets: [[3,0], [0,6], [5,4], [3,6], [6,1], [4,2], [6,0]] },
  { num: 34, quizId: 'chomp-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, w: 7, h: 7, start: [5,3], floor: 43, min: 43,
    cast: ['bulldog', 'wildcat', 'tiger', 'ibis', 'gamecock', 'longhorn', 'eagle'],
    pellets: [[6,4], [4,1], [6,0], [2,2], [6,6], [0,0], [2,5]] },
  { num: 35, quizId: 'chomp-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, w: 7, h: 7, start: [6,2], floor: 44, min: 44,
    cast: ['bulldog', 'tiger', 'seminole', 'gamecock', 'ibis', 'longhorn', 'wildcat'],
    pellets: [[1,5], [4,4], [4,5], [6,4], [0,6], [6,0], [1,3]] },
  { num: 36, quizId: 'chomp-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, w: 7, h: 7, start: [0,0], floor: 46, min: 46,
    cast: ['bulldog', 'seminole', 'wildcat', 'ibis', 'gamecock', 'tiger', 'eagle'],
    pellets: [[6,6], [1,3], [4,4], [1,0], [6,4], [5,0], [5,1]] },
  { num: 37, quizId: 'chomp-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, w: 7, h: 7, start: [4,2], floor: 48, min: 48,
    cast: ['bulldog', 'tiger', 'longhorn', 'seminole', 'eagle', 'ibis', 'wildcat', 'gamecock'],
    pellets: [[3,2], [6,6], [0,0], [6,1], [5,2], [1,1], [5,5], [1,3]] },
  { num: 38, quizId: 'chomp-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, w: 7, h: 7, start: [5,3], floor: 38, min: 38,
    cast: ['bulldog', 'gamecock', 'ibis', 'seminole', 'longhorn', 'tiger'],
    pellets: [[2,5], [6,6], [2,0], [5,2], [0,6], [0,2]] },
  { num: 39, quizId: 'chomp-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, w: 7, h: 7, start: [0,4], floor: 41, min: 41,
    cast: ['bulldog', 'wildcat', 'seminole', 'ibis', 'gamecock', 'longhorn'],
    pellets: [[3,0], [0,6], [6,0], [3,5], [4,4], [4,1]] },
  { num: 40, quizId: 'chomp-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, w: 7, h: 7, start: [1,1], floor: 42, min: 42,
    cast: ['bulldog', 'wildcat', 'eagle', 'tiger', 'ibis', 'longhorn', 'seminole'],
    pellets: [[6,0], [2,2], [6,6], [3,3], [1,4], [3,6], [0,0]] },
  { num: 41, quizId: 'chomp-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 43, min: 43,
    cast: ['bulldog', 'ibis', 'eagle', 'tiger', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[6,3], [0,0], [4,6], [1,1], [3,4], [6,5], [5,6]] },
  { num: 42, quizId: 'chomp-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, w: 7, h: 7, start: [0,2], floor: 44, min: 44,
    cast: ['bulldog', 'seminole', 'ibis', 'eagle', 'tiger', 'gamecock', 'longhorn'],
    pellets: [[6,6], [4,5], [6,0], [5,3], [0,0], [3,5], [1,3]] },
  { num: 43, quizId: 'chomp-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 45, min: 45,
    cast: ['bulldog', 'wildcat', 'longhorn', 'tiger', 'ibis', 'seminole', 'eagle'],
    pellets: [[1,2], [4,0], [0,4], [6,0], [0,6], [3,4], [4,5]] },
  { num: 44, quizId: 'chomp-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, w: 7, h: 7, start: [1,5], floor: 47, min: 47,
    cast: ['bulldog', 'seminole', 'longhorn', 'gamecock', 'wildcat', 'ibis', 'eagle', 'tiger'],
    pellets: [[2,3], [6,6], [0,0], [6,4], [3,0], [2,0], [5,2], [4,3]] },
  { num: 45, quizId: 'chomp-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, w: 7, h: 7, start: [0,4], floor: 39, min: 39,
    cast: ['bulldog', 'longhorn', 'wildcat', 'gamecock', 'ibis', 'seminole'],
    pellets: [[2,6], [5,1], [3,6], [6,0], [0,3], [0,1]] },
  { num: 46, quizId: 'chomp-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, w: 7, h: 7, start: [6,4], floor: 41, min: 41,
    cast: ['bulldog', 'eagle', 'wildcat', 'longhorn', 'ibis', 'gamecock'],
    pellets: [[5,0], [6,6], [0,0], [3,2], [0,6], [2,3]] },
  { num: 47, quizId: 'chomp-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, w: 7, h: 7, start: [6,6], floor: 42, min: 42,
    cast: ['bulldog', 'wildcat', 'gamecock', 'tiger', 'seminole', 'ibis', 'longhorn'],
    pellets: [[2,1], [3,4], [5,1], [6,4], [3,0], [0,6], [0,2]] },
  { num: 48, quizId: 'chomp-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, w: 7, h: 7, start: [4,0], floor: 43, min: 43,
    cast: ['bulldog', 'wildcat', 'gamecock', 'ibis', 'seminole', 'tiger', 'eagle'],
    pellets: [[2,1], [3,3], [6,0], [2,6], [5,4], [0,0], [1,6]] },
  { num: 49, quizId: 'chomp-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, w: 7, h: 7, start: [6,0], floor: 44, min: 44,
    cast: ['bulldog', 'ibis', 'tiger', 'seminole', 'gamecock', 'eagle', 'wildcat'],
    pellets: [[3,6], [5,5], [1,1], [2,6], [0,0], [5,2], [3,1]] },
  { num: 50, quizId: 'chomp-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, w: 7, h: 7, start: [6,6], floor: 45, min: 45,
    cast: ['bulldog', 'eagle', 'ibis', 'seminole', 'tiger', 'wildcat', 'gamecock'],
    pellets: [[3,3], [5,6], [2,1], [0,6], [3,0], [6,3], [5,0]] },
  { num: 51, quizId: 'chomp-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, w: 7, h: 7, start: [6,0], floor: 48, min: 48,
    cast: ['bulldog', 'tiger', 'longhorn', 'gamecock', 'eagle', 'seminole', 'wildcat', 'ibis'],
    pellets: [[0,4], [4,1], [3,3], [6,1], [4,6], [5,4], [0,6], [2,2]] },
  { num: 52, quizId: 'chomp-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, w: 7, h: 7, start: [2,0], floor: 39, min: 39,
    cast: ['bulldog', 'wildcat', 'gamecock', 'seminole', 'eagle', 'ibis'],
    pellets: [[0,6], [6,5], [1,2], [6,4], [3,0], [4,1]] },
  { num: 53, quizId: 'chomp-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 40, min: 40,
    cast: ['bulldog', 'tiger', 'seminole', 'longhorn', 'gamecock', 'wildcat'],
    pellets: [[2,4], [6,1], [0,6], [3,0], [1,5], [3,5]] },
  { num: 54, quizId: 'chomp-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, w: 7, h: 7, start: [0,6], floor: 42, min: 42,
    cast: ['bulldog', 'seminole', 'longhorn', 'gamecock', 'tiger', 'ibis', 'wildcat'],
    pellets: [[6,3], [2,4], [4,2], [0,4], [2,0], [6,2], [1,1]] },
  { num: 55, quizId: 'chomp-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, w: 7, h: 7, start: [6,4], floor: 43, min: 43,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'eagle', 'longhorn', 'wildcat'],
    pellets: [[0,6], [1,2], [2,5], [0,0], [5,5], [4,0], [5,2]] },
  { num: 56, quizId: 'chomp-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 44, min: 44,
    cast: ['bulldog', 'ibis', 'tiger', 'gamecock', 'eagle', 'seminole', 'longhorn'],
    pellets: [[0,0], [6,2], [4,6], [5,1], [0,6], [2,2], [1,5]] },
  { num: 57, quizId: 'chomp-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, w: 7, h: 7, start: [4,4], floor: 44, min: 46,
    cast: ['bulldog', 'tiger', 'seminole', 'longhorn', 'eagle', 'ibis', 'gamecock'],
    pellets: [[3,1], [5,5], [1,1], [0,6], [0,5], [5,0], [2,6]] },
  { num: 58, quizId: 'chomp-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, w: 7, h: 7, start: [1,3], floor: 47, min: 47,
    cast: ['bulldog', 'wildcat', 'tiger', 'seminole', 'eagle', 'ibis', 'longhorn', 'gamecock'],
    pellets: [[2,2], [1,2], [4,0], [0,4], [4,2], [0,6], [5,0], [6,5]] },
  { num: 59, quizId: 'chomp-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, w: 7, h: 7, start: [1,3], floor: 37, min: 39,
    cast: ['bulldog', 'eagle', 'ibis', 'wildcat', 'tiger', 'seminole'],
    pellets: [[2,1], [1,5], [6,1], [4,6], [0,4], [4,1]] },
  { num: 60, quizId: 'chomp-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, w: 7, h: 7, start: [1,3], floor: 39, min: 41,
    cast: ['bulldog', 'gamecock', 'eagle', 'tiger', 'wildcat', 'ibis'],
    pellets: [[2,0], [0,5], [5,2], [2,3], [5,0], [1,6]] },
  { num: 61, quizId: 'chomp-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, w: 7, h: 7, start: [0,0], floor: 42, min: 42,
    cast: ['bulldog', 'eagle', 'longhorn', 'gamecock', 'wildcat', 'tiger', 'seminole'],
    pellets: [[6,2], [2,1], [6,4], [2,6], [5,4], [0,2], [1,5]] },
  { num: 62, quizId: 'chomp-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, w: 7, h: 7, start: [0,0], floor: 43, min: 43,
    cast: ['bulldog', 'eagle', 'tiger', 'gamecock', 'ibis', 'wildcat', 'longhorn'],
    pellets: [[2,3], [0,2], [1,6], [5,1], [2,6], [6,4], [3,0]] },
  { num: 63, quizId: 'chomp-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, w: 7, h: 7, start: [0,6], floor: 44, min: 44,
    cast: ['bulldog', 'gamecock', 'seminole', 'tiger', 'longhorn', 'eagle', 'ibis'],
    pellets: [[2,0], [1,6], [6,5], [2,2], [4,4], [3,0], [6,4]] },
  { num: 64, quizId: 'chomp-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, w: 7, h: 7, start: [0,6], floor: 44, min: 46,
    cast: ['bulldog', 'ibis', 'gamecock', 'tiger', 'seminole', 'longhorn', 'wildcat'],
    pellets: [[2,1], [0,5], [3,0], [5,5], [3,3], [6,5], [4,0]] },
  { num: 65, quizId: 'chomp-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true, w: 7, h: 7, start: [6,6], floor: 48, min: 48,
    cast: ['bulldog', 'ibis', 'eagle', 'tiger', 'gamecock', 'wildcat', 'longhorn', 'seminole'],
    pellets: [[0,5], [6,4], [2,3], [5,1], [0,4], [1,0], [6,3], [3,3]] },
  { num: 66, quizId: 'chomp-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 37, min: 39,
    cast: ['bulldog', 'ibis', 'gamecock', 'wildcat', 'seminole', 'longhorn'],
    pellets: [[2,3], [5,1], [4,5], [0,1], [6,2], [1,6]] },
  { num: 67, quizId: 'chomp-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, w: 7, h: 7, start: [6,4], floor: 39, min: 41,
    cast: ['bulldog', 'tiger', 'seminole', 'eagle', 'longhorn', 'wildcat'],
    pellets: [[4,6], [6,1], [2,6], [3,2], [1,6], [3,0]] },
  { num: 68, quizId: 'chomp-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, w: 7, h: 7, start: [6,6], floor: 42, min: 42,
    cast: ['bulldog', 'tiger', 'gamecock', 'wildcat', 'ibis', 'longhorn', 'eagle'],
    pellets: [[4,0], [5,6], [0,1], [3,0], [1,1], [4,5], [2,4]] },
  { num: 69, quizId: 'chomp-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 43, min: 43,
    cast: ['bulldog', 'ibis', 'gamecock', 'seminole', 'tiger', 'wildcat', 'longhorn'],
    pellets: [[0,1], [4,6], [6,4], [1,5], [5,1], [6,3], [1,0]] },
  { num: 70, quizId: 'chomp-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, w: 7, h: 7, start: [0,0], floor: 44, min: 44,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'tiger', 'gamecock', 'longhorn'],
    pellets: [[6,3], [0,1], [1,6], [4,2], [2,6], [6,4], [5,5]] },
];
