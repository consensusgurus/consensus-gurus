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
// Fields, all re-derived by scripts/verify-chomp.mjs rather than trusted:
//
//   w, h      board size. TEN by ten from day two (owner, 2026-08-08). Thirteen
//             was measured to have NO difficulty band at all: so much spare room
//             that "keep every mascot reachable" is always satisfiable and the
//             puzzle solves itself. Day one is 13x13 and frozen.
//   cast      the mascots in EATING ORDER; cast[i] sits on pellets[i]. Only the
//             BULLDOG is fixed, always first, so every run opens the same way.
//             Everything after it is a random order drawn from the other seven,
//             and the COUNT varies: five to seven on a weekday, all eight on a
//             Sunday.
//   start     the head's square at the drop, one square long.
//   pellets   the mascot positions, in the same order as `cast`.
//   floor     the fewest moves any legal route could POSSIBLY use: the sum of
//             the legs' Manhattan distances. A true lower bound, not a target.
//   solution  the length of a route an INDEPENDENT solver actually found. This
//             is the important one: the board is built backwards from a walk, so
//             a solution always exists, but existing is not the same as being
//             findable, and a board only the generator can solve is a needle hunt
//             rather than a puzzle. Every board here fell to a search that knows
//             nothing about how it was built.
//
// There is deliberately no claimed minimum. Under rule 1 the true optimum is a
// self-avoiding-path problem that cannot be honestly computed at this size, and
// a "perfect" the game cannot prove would be worse than none. Ties on the daily
// leaderboard break on fewest moves, then on time.
//
// HARDNESS GATE (owner, 2026-08-08: too easy even on the easiest days). Not
// clearing was never enough on its own: a board the myopic shortest-path line
// got five-of-six on is a board a person walks. It is now thrown away unless
// that line is stopped inside the first 60% of the cast, and the five-mascot day
// is gone so the shortest cast is six.
//
// The gate is the difficulty lever rather than a higher floor, and that was
// measured rather than guessed: raising the floor does make a board harder, but
// past about 52 it also makes it unsolvable (2.4% of candidates cracked at floor
// 56 against 10% at 48), which is the opposite of what a puzzle needs. So the
// floor sits where routes are still findable and the gate does the work.
//
// Day one had already gone live and is left exactly as it shipped.
//
// SUNDAY EDITION: the WHOLE cast of eight, spread further apart (a Manhattan
// floor of 74 against a weekday's 58). Two knobs pulling the same way: more
// mascots means more legs, and longer legs mean more of the board is already
// wall by the time the last one is in reach. `sunday` must be true if and only if `live` really
// is a Sunday; the flag is the ONLY source of truth for the badge.
export const MASCOTS = ["bulldog","ibis","gamecock","tiger","eagle","longhorn","wildcat","seminole"];

export const PUZZLES = [
  { num: 1, quizId: 'chomp-8-8-26', live: '2026-08-08', dateLabel: 'August 8, 2026', sunday: false, w: 13, h: 13, start: [9,10], floor: 52, solution: 68,
    cast: ['bulldog', 'tiger', 'gamecock', 'ibis', 'seminole', 'longhorn'],
    pellets: [[12,7], [0,0], [6,0], [1,2], [7,4], [3,2]] },
  { num: 2, quizId: 'chomp-8-9-26', live: '2026-08-09', dateLabel: 'August 9, 2026', sunday: true, w: 10, h: 10, start: [0,7], floor: 42, solution: 74,
    cast: ['bulldog', 'gamecock', 'ibis', 'longhorn', 'eagle', 'seminole', 'wildcat', 'tiger'],
    pellets: [[3,8], [4,2], [9,5], [7,9], [5,7], [5,3], [7,1], [8,5]] },
  { num: 3, quizId: 'chomp-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false, w: 10, h: 10, start: [1,5], floor: 46, solution: 54,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'gamecock', 'longhorn'],
    pellets: [[9,7], [2,0], [4,4], [5,0], [7,4], [6,0]] },
  { num: 4, quizId: 'chomp-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false, w: 10, h: 10, start: [6,0], floor: 47, solution: 61,
    cast: ['bulldog', 'longhorn', 'tiger', 'ibis', 'seminole', 'eagle'],
    pellets: [[9,3], [6,9], [3,0], [5,7], [4,2], [1,4]] },
  { num: 5, quizId: 'chomp-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false, w: 10, h: 10, start: [3,4], floor: 41, solution: 49,
    cast: ['bulldog', 'tiger', 'wildcat', 'longhorn', 'gamecock', 'eagle', 'ibis'],
    pellets: [[0,1], [4,0], [9,0], [8,5], [5,9], [1,8], [7,7]] },
  { num: 6, quizId: 'chomp-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false, w: 10, h: 10, start: [9,1], floor: 41, solution: 43,
    cast: ['bulldog', 'ibis', 'longhorn', 'wildcat', 'tiger', 'eagle'],
    pellets: [[2,0], [2,5], [9,8], [4,6], [2,9], [6,7]] },
  { num: 7, quizId: 'chomp-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false, w: 10, h: 10, start: [4,9], floor: 44, solution: 80,
    cast: ['bulldog', 'gamecock', 'seminole', 'ibis', 'tiger', 'eagle'],
    pellets: [[0,6], [0,1], [6,6], [1,6], [6,1], [2,3]] },
  { num: 8, quizId: 'chomp-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false, w: 10, h: 10, start: [6,7], floor: 43, solution: 65,
    cast: ['bulldog', 'longhorn', 'eagle', 'seminole', 'gamecock', 'wildcat', 'tiger'],
    pellets: [[4,0], [9,2], [9,7], [6,5], [1,3], [1,8], [5,7]] },
  { num: 9, quizId: 'chomp-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true, w: 10, h: 10, start: [6,7], floor: 53, solution: 81,
    cast: ['bulldog', 'longhorn', 'ibis', 'wildcat', 'tiger', 'eagle', 'seminole', 'gamecock'],
    pellets: [[1,0], [2,7], [8,4], [3,2], [5,5], [7,3], [4,2], [6,4]] },
  { num: 10, quizId: 'chomp-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false, w: 10, h: 10, start: [0,9], floor: 51, solution: 53,
    cast: ['bulldog', 'seminole', 'longhorn', 'gamecock', 'eagle', 'tiger'],
    pellets: [[0,1], [9,3], [5,9], [2,2], [6,3], [2,6]] },
  { num: 11, quizId: 'chomp-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false, w: 10, h: 10, start: [0,7], floor: 48, solution: 62,
    cast: ['bulldog', 'wildcat', 'seminole', 'longhorn', 'tiger', 'gamecock'],
    pellets: [[6,8], [9,3], [0,6], [7,2], [3,1], [4,5]] },
  { num: 12, quizId: 'chomp-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false, w: 10, h: 10, start: [2,7], floor: 48, solution: 78,
    cast: ['bulldog', 'ibis', 'seminole', 'longhorn', 'wildcat', 'tiger'],
    pellets: [[8,0], [1,5], [6,2], [4,5], [8,6], [4,7]] },
  { num: 13, quizId: 'chomp-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false, w: 10, h: 10, start: [8,0], floor: 46, solution: 60,
    cast: ['bulldog', 'gamecock', 'eagle', 'seminole', 'ibis', 'tiger'],
    pellets: [[9,8], [4,9], [8,2], [3,6], [1,3], [6,4]] },
  { num: 14, quizId: 'chomp-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, w: 10, h: 10, start: [8,8], floor: 45, solution: 53,
    cast: ['bulldog', 'seminole', 'ibis', 'wildcat', 'gamecock', 'longhorn'],
    pellets: [[0,8], [3,4], [7,8], [4,3], [9,0], [5,2]] },
  { num: 15, quizId: 'chomp-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, w: 10, h: 10, start: [1,3], floor: 41, solution: 41,
    cast: ['bulldog', 'tiger', 'wildcat', 'seminole', 'gamecock', 'longhorn'],
    pellets: [[3,9], [8,5], [5,2], [4,6], [2,1], [8,1]] },
  { num: 16, quizId: 'chomp-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, w: 10, h: 10, start: [6,7], floor: 41, solution: 45,
    cast: ['bulldog', 'gamecock', 'ibis', 'longhorn', 'eagle', 'tiger', 'seminole', 'wildcat'],
    pellets: [[4,9], [0,8], [2,3], [5,5], [8,0], [8,4], [6,2], [3,1]] },
  { num: 17, quizId: 'chomp-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, w: 10, h: 10, start: [8,2], floor: 43, solution: 71,
    cast: ['bulldog', 'tiger', 'wildcat', 'seminole', 'longhorn', 'ibis'],
    pellets: [[0,5], [9,7], [4,7], [7,5], [3,3], [7,2]] },
  { num: 18, quizId: 'chomp-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, w: 10, h: 10, start: [5,7], floor: 49, solution: 51,
    cast: ['bulldog', 'seminole', 'ibis', 'gamecock', 'eagle', 'tiger', 'wildcat'],
    pellets: [[8,9], [1,9], [7,1], [1,3], [4,5], [2,2], [6,3]] },
  { num: 19, quizId: 'chomp-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, w: 10, h: 10, start: [3,8], floor: 52, solution: 52,
    cast: ['bulldog', 'seminole', 'eagle', 'tiger', 'wildcat', 'ibis'],
    pellets: [[7,0], [0,1], [5,3], [0,9], [4,4], [1,2]] },
  { num: 20, quizId: 'chomp-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, w: 10, h: 10, start: [2,4], floor: 41, solution: 45,
    cast: ['bulldog', 'longhorn', 'tiger', 'seminole', 'ibis', 'eagle'],
    pellets: [[7,1], [9,7], [1,5], [6,5], [8,8], [8,3]] },
  { num: 21, quizId: 'chomp-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, w: 10, h: 10, start: [4,2], floor: 47, solution: 51,
    cast: ['bulldog', 'ibis', 'tiger', 'eagle', 'seminole', 'wildcat'],
    pellets: [[2,6], [4,9], [9,0], [6,8], [7,3], [5,6]] },
  { num: 22, quizId: 'chomp-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, w: 10, h: 10, start: [8,8], floor: 49, solution: 49,
    cast: ['bulldog', 'eagle', 'tiger', 'seminole', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[3,9], [9,5], [0,3], [4,1], [8,2], [2,2], [5,4]] },
  { num: 23, quizId: 'chomp-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, w: 10, h: 10, start: [1,9], floor: 51, solution: 57,
    cast: ['bulldog', 'eagle', 'ibis', 'wildcat', 'longhorn', 'gamecock', 'seminole', 'tiger'],
    pellets: [[8,7], [8,2], [1,7], [7,8], [6,3], [5,6], [5,2], [2,3]] },
  { num: 24, quizId: 'chomp-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, w: 10, h: 10, start: [2,0], floor: 45, solution: 45,
    cast: ['bulldog', 'seminole', 'wildcat', 'longhorn', 'gamecock', 'tiger', 'ibis'],
    pellets: [[0,6], [1,2], [4,8], [8,5], [6,2], [7,7], [5,4]] },
  { num: 25, quizId: 'chomp-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, w: 10, h: 10, start: [2,4], floor: 45, solution: 63,
    cast: ['bulldog', 'wildcat', 'seminole', 'tiger', 'longhorn', 'eagle', 'ibis'],
    pellets: [[0,1], [6,0], [8,5], [3,1], [7,3], [4,5], [7,8]] },
  { num: 26, quizId: 'chomp-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, w: 10, h: 10, start: [2,9], floor: 42, solution: 68,
    cast: ['bulldog', 'gamecock', 'tiger', 'wildcat', 'longhorn', 'eagle'],
    pellets: [[0,4], [8,7], [5,1], [2,3], [5,5], [2,7]] },
  { num: 27, quizId: 'chomp-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, w: 10, h: 10, start: [9,7], floor: 48, solution: 50,
    cast: ['bulldog', 'seminole', 'eagle', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[3,9], [2,0], [8,6], [7,1], [3,4], [7,5]] },
  { num: 28, quizId: 'chomp-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, w: 10, h: 10, start: [7,0], floor: 44, solution: 54,
    cast: ['bulldog', 'tiger', 'wildcat', 'gamecock', 'seminole', 'eagle'],
    pellets: [[0,4], [9,5], [5,9], [9,8], [5,7], [1,8]] },
  { num: 29, quizId: 'chomp-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, w: 10, h: 10, start: [0,8], floor: 48, solution: 50,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'longhorn', 'gamecock', 'eagle'],
    pellets: [[4,9], [0,1], [2,5], [5,2], [8,6], [9,0], [7,3]] },
  { num: 30, quizId: 'chomp-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, w: 10, h: 10, start: [3,1], floor: 49, solution: 63,
    cast: ['bulldog', 'tiger', 'eagle', 'ibis', 'seminole', 'gamecock', 'wildcat', 'longhorn'],
    pellets: [[8,0], [9,5], [0,8], [0,1], [1,5], [2,8], [2,3], [3,6]] },
  { num: 31, quizId: 'chomp-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, w: 10, h: 10, start: [2,6], floor: 44, solution: 72,
    cast: ['bulldog', 'seminole', 'gamecock', 'wildcat', 'longhorn', 'eagle'],
    pellets: [[0,3], [3,0], [5,9], [0,9], [8,5], [7,1]] },
  { num: 32, quizId: 'chomp-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, w: 10, h: 10, start: [1,4], floor: 49, solution: 61,
    cast: ['bulldog', 'seminole', 'ibis', 'longhorn', 'tiger', 'eagle'],
    pellets: [[0,8], [4,9], [8,3], [3,8], [7,0], [5,5]] },
  { num: 33, quizId: 'chomp-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, w: 10, h: 10, start: [7,0], floor: 62, solution: 84,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'seminole', 'longhorn', 'tiger'],
    pellets: [[9,9], [4,0], [1,8], [1,2], [2,7], [4,2], [7,6]] },
  { num: 34, quizId: 'chomp-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, w: 10, h: 10, start: [0,5], floor: 41, solution: 41,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'wildcat', 'longhorn'],
    pellets: [[4,2], [9,1], [4,5], [9,9], [9,4], [8,8]] },
  { num: 35, quizId: 'chomp-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, w: 10, h: 10, start: [4,1], floor: 41, solution: 59,
    cast: ['bulldog', 'seminole', 'wildcat', 'gamecock', 'eagle', 'longhorn'],
    pellets: [[0,0], [0,7], [3,3], [7,9], [5,6], [9,3]] },
  { num: 36, quizId: 'chomp-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, w: 10, h: 10, start: [8,3], floor: 42, solution: 54,
    cast: ['bulldog', 'longhorn', 'eagle', 'ibis', 'wildcat', 'tiger'],
    pellets: [[3,0], [4,5], [8,7], [0,8], [5,6], [0,7]] },
  { num: 37, quizId: 'chomp-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, w: 10, h: 10, start: [6,1], floor: 53, solution: 59,
    cast: ['bulldog', 'eagle', 'longhorn', 'gamecock', 'wildcat', 'seminole', 'tiger', 'ibis'],
    pellets: [[0,3], [8,8], [7,3], [5,9], [2,8], [6,7], [2,6], [4,4]] },
  { num: 38, quizId: 'chomp-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, w: 10, h: 10, start: [3,1], floor: 42, solution: 54,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'longhorn', 'tiger', 'gamecock'],
    pellets: [[1,6], [5,5], [3,9], [7,8], [9,1], [8,5], [9,9]] },
  { num: 39, quizId: 'chomp-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, w: 10, h: 10, start: [6,2], floor: 40, solution: 52,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[6,8], [4,0], [3,8], [3,3], [0,5], [2,8]] },
  { num: 40, quizId: 'chomp-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, w: 10, h: 10, start: [5,6], floor: 44, solution: 50,
    cast: ['bulldog', 'gamecock', 'tiger', 'longhorn', 'wildcat', 'eagle'],
    pellets: [[0,8], [4,0], [9,0], [4,2], [9,5], [5,4]] },
  { num: 41, quizId: 'chomp-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, w: 10, h: 10, start: [7,7], floor: 41, solution: 71,
    cast: ['bulldog', 'seminole', 'wildcat', 'tiger', 'ibis', 'eagle'],
    pellets: [[5,0], [4,7], [2,2], [6,5], [8,2], [7,6]] },
  { num: 42, quizId: 'chomp-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, w: 10, h: 10, start: [0,7], floor: 49, solution: 53,
    cast: ['bulldog', 'ibis', 'tiger', 'gamecock', 'seminole', 'eagle'],
    pellets: [[6,9], [9,3], [0,2], [8,5], [2,5], [5,3]] },
  { num: 43, quizId: 'chomp-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, w: 10, h: 10, start: [9,2], floor: 43, solution: 49,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'longhorn', 'ibis', 'eagle'],
    pellets: [[1,0], [5,2], [0,3], [3,5], [5,9], [9,8], [4,8]] },
  { num: 44, quizId: 'chomp-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, w: 10, h: 10, start: [9,7], floor: 40, solution: 48,
    cast: ['bulldog', 'gamecock', 'tiger', 'wildcat', 'eagle', 'ibis', 'seminole', 'longhorn'],
    pellets: [[7,2], [5,0], [0,0], [1,5], [6,6], [5,3], [4,6], [3,3]] },
  { num: 45, quizId: 'chomp-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, w: 10, h: 10, start: [6,6], floor: 42, solution: 86,
    cast: ['bulldog', 'seminole', 'longhorn', 'eagle', 'ibis', 'tiger'],
    pellets: [[4,0], [4,7], [2,0], [2,8], [1,4], [0,0]] },
  { num: 46, quizId: 'chomp-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, w: 10, h: 10, start: [0,0], floor: 44, solution: 62,
    cast: ['bulldog', 'longhorn', 'eagle', 'ibis', 'seminole', 'tiger'],
    pellets: [[0,6], [1,0], [9,5], [3,3], [5,6], [7,3]] },
  { num: 47, quizId: 'chomp-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, w: 10, h: 10, start: [9,2], floor: 47, solution: 47,
    cast: ['bulldog', 'gamecock', 'eagle', 'tiger', 'longhorn', 'ibis', 'seminole'],
    pellets: [[0,8], [4,7], [1,4], [4,6], [8,4], [4,5], [7,3]] },
  { num: 48, quizId: 'chomp-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, w: 10, h: 10, start: [3,2], floor: 42, solution: 52,
    cast: ['bulldog', 'eagle', 'wildcat', 'longhorn', 'seminole', 'ibis'],
    pellets: [[2,9], [9,4], [8,8], [5,4], [6,8], [7,4]] },
  { num: 49, quizId: 'chomp-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, w: 10, h: 10, start: [0,0], floor: 45, solution: 73,
    cast: ['bulldog', 'gamecock', 'wildcat', 'tiger', 'eagle', 'seminole'],
    pellets: [[6,1], [0,5], [6,7], [8,4], [2,8], [3,4]] },
  { num: 50, quizId: 'chomp-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, w: 10, h: 10, start: [8,5], floor: 45, solution: 47,
    cast: ['bulldog', 'wildcat', 'seminole', 'ibis', 'gamecock', 'eagle'],
    pellets: [[6,0], [9,6], [4,3], [2,9], [0,4], [1,9]] },
  { num: 51, quizId: 'chomp-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, w: 10, h: 10, start: [1,4], floor: 45, solution: 49,
    cast: ['bulldog', 'gamecock', 'longhorn', 'seminole', 'wildcat', 'eagle', 'tiger', 'ibis'],
    pellets: [[0,7], [7,6], [1,5], [5,0], [6,3], [4,1], [0,0], [1,3]] },
  { num: 52, quizId: 'chomp-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, w: 10, h: 10, start: [5,9], floor: 50, solution: 56,
    cast: ['bulldog', 'ibis', 'tiger', 'longhorn', 'wildcat', 'seminole', 'gamecock'],
    pellets: [[8,2], [1,0], [5,6], [2,9], [2,4], [3,8], [1,5]] },
  { num: 53, quizId: 'chomp-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, w: 10, h: 10, start: [4,7], floor: 43, solution: 43,
    cast: ['bulldog', 'gamecock', 'seminole', 'wildcat', 'ibis', 'eagle', 'longhorn'],
    pellets: [[0,2], [1,6], [3,2], [7,5], [8,0], [6,3], [4,0]] },
  { num: 54, quizId: 'chomp-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, w: 10, h: 10, start: [4,8], floor: 41, solution: 43,
    cast: ['bulldog', 'wildcat', 'gamecock', 'longhorn', 'tiger', 'eagle', 'ibis'],
    pellets: [[0,6], [6,9], [5,5], [3,2], [6,4], [9,1], [7,4]] },
  { num: 55, quizId: 'chomp-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, w: 10, h: 10, start: [8,9], floor: 43, solution: 45,
    cast: ['bulldog', 'ibis', 'wildcat', 'seminole', 'tiger', 'gamecock'],
    pellets: [[4,7], [9,3], [3,0], [7,5], [3,4], [7,3]] },
  { num: 56, quizId: 'chomp-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, w: 10, h: 10, start: [8,3], floor: 41, solution: 75,
    cast: ['bulldog', 'gamecock', 'wildcat', 'longhorn', 'seminole', 'eagle'],
    pellets: [[4,0], [7,7], [3,8], [4,3], [6,6], [2,2]] },
  { num: 57, quizId: 'chomp-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, w: 10, h: 10, start: [9,9], floor: 49, solution: 67,
    cast: ['bulldog', 'gamecock', 'wildcat', 'longhorn', 'ibis', 'tiger', 'seminole'],
    pellets: [[2,8], [7,2], [8,7], [4,6], [3,0], [1,5], [3,2]] },
  { num: 58, quizId: 'chomp-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, w: 10, h: 10, start: [8,0], floor: 40, solution: 76,
    cast: ['bulldog', 'ibis', 'eagle', 'wildcat', 'gamecock', 'seminole', 'tiger', 'longhorn'],
    pellets: [[9,3], [8,6], [5,1], [1,3], [2,7], [3,4], [4,1], [5,5]] },
  { num: 59, quizId: 'chomp-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, w: 10, h: 10, start: [5,8], floor: 52, solution: 68,
    cast: ['bulldog', 'wildcat', 'tiger', 'eagle', 'ibis', 'gamecock', 'seminole'],
    pellets: [[9,4], [4,1], [8,2], [0,5], [2,9], [2,3], [7,6]] },
  { num: 60, quizId: 'chomp-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, w: 10, h: 10, start: [3,3], floor: 47, solution: 67,
    cast: ['bulldog', 'longhorn', 'eagle', 'tiger', 'seminole', 'wildcat'],
    pellets: [[0,6], [5,3], [9,1], [1,7], [7,6], [9,2]] },
  { num: 61, quizId: 'chomp-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, w: 10, h: 10, start: [9,4], floor: 51, solution: 59,
    cast: ['bulldog', 'seminole', 'tiger', 'wildcat', 'eagle', 'longhorn', 'gamecock'],
    pellets: [[0,0], [1,6], [4,4], [2,9], [9,7], [6,9], [8,6]] },
  { num: 62, quizId: 'chomp-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, w: 10, h: 10, start: [9,4], floor: 40, solution: 76,
    cast: ['bulldog', 'longhorn', 'eagle', 'gamecock', 'tiger', 'wildcat'],
    pellets: [[1,8], [6,5], [7,1], [3,2], [7,3], [3,4]] },
  { num: 63, quizId: 'chomp-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, w: 10, h: 10, start: [9,5], floor: 49, solution: 65,
    cast: ['bulldog', 'seminole', 'longhorn', 'wildcat', 'gamecock', 'tiger'],
    pellets: [[8,0], [0,9], [1,5], [7,7], [4,3], [3,8]] },
  { num: 64, quizId: 'chomp-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, w: 10, h: 10, start: [7,1], floor: 41, solution: 53,
    cast: ['bulldog', 'seminole', 'tiger', 'ibis', 'gamecock', 'wildcat'],
    pellets: [[2,0], [9,2], [5,8], [0,7], [3,5], [1,8]] },
  { num: 65, quizId: 'chomp-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true, w: 10, h: 10, start: [2,4], floor: 43, solution: 43,
    cast: ['bulldog', 'ibis', 'seminole', 'eagle', 'tiger', 'wildcat', 'longhorn', 'gamecock'],
    pellets: [[2,9], [9,9], [7,5], [5,3], [8,0], [5,2], [1,1], [6,1]] },
  { num: 66, quizId: 'chomp-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, w: 10, h: 10, start: [7,7], floor: 45, solution: 77,
    cast: ['bulldog', 'seminole', 'ibis', 'tiger', 'wildcat', 'gamecock', 'eagle'],
    pellets: [[7,0], [6,4], [4,8], [1,2], [3,8], [2,4], [3,0]] },
  { num: 67, quizId: 'chomp-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, w: 10, h: 10, start: [9,6], floor: 46, solution: 62,
    cast: ['bulldog', 'wildcat', 'seminole', 'eagle', 'longhorn', 'gamecock'],
    pellets: [[0,8], [8,6], [2,5], [4,0], [2,3], [7,2]] },
  { num: 68, quizId: 'chomp-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, w: 10, h: 10, start: [1,1], floor: 40, solution: 52,
    cast: ['bulldog', 'seminole', 'longhorn', 'tiger', 'gamecock', 'wildcat', 'eagle'],
    pellets: [[5,0], [1,4], [7,4], [7,9], [6,5], [2,7], [6,8]] },
  { num: 69, quizId: 'chomp-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, w: 10, h: 10, start: [1,3], floor: 46, solution: 58,
    cast: ['bulldog', 'longhorn', 'seminole', 'wildcat', 'gamecock', 'ibis'],
    pellets: [[6,9], [4,1], [8,2], [2,2], [5,8], [2,6]] },
  { num: 70, quizId: 'chomp-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, w: 10, h: 10, start: [0,0], floor: 43, solution: 55,
    cast: ['bulldog', 'longhorn', 'eagle', 'tiger', 'ibis', 'seminole'],
    pellets: [[0,5], [9,5], [6,0], [9,2], [2,3], [8,1]] },
];
