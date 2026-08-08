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
//   w, h      board size. Always 13x13, so 169 squares.
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
  { num: 2, quizId: 'chomp-8-9-26', live: '2026-08-09', dateLabel: 'August 9, 2026', sunday: true, w: 13, h: 13, start: [1,10], floor: 70, solution: 86,
    cast: ['bulldog', 'gamecock', 'ibis', 'longhorn', 'eagle', 'seminole', 'wildcat', 'tiger'],
    pellets: [[8,12], [4,10], [0,3], [9,9], [1,6], [5,4], [7,8], [6,3]] },
  { num: 3, quizId: 'chomp-8-10-26', live: '2026-08-10', dateLabel: 'August 10, 2026', sunday: false, w: 13, h: 13, start: [1,2], floor: 58, solution: 74,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'gamecock', 'longhorn', 'seminole'],
    pellets: [[7,2], [12,1], [8,5], [3,12], [10,10], [4,8], [9,4]] },
  { num: 4, quizId: 'chomp-8-11-26', live: '2026-08-11', dateLabel: 'August 11, 2026', sunday: false, w: 13, h: 13, start: [2,12], floor: 64, solution: 64,
    cast: ['bulldog', 'longhorn', 'tiger', 'ibis', 'seminole', 'eagle', 'gamecock'],
    pellets: [[1,0], [2,11], [10,5], [11,0], [7,2], [7,8], [5,3]] },
  { num: 5, quizId: 'chomp-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false, w: 13, h: 13, start: [1,7], floor: 75, solution: 75,
    cast: ['bulldog', 'tiger', 'wildcat', 'longhorn', 'gamecock', 'eagle', 'ibis'],
    pellets: [[6,10], [12,0], [0,1], [11,7], [5,4], [10,5], [7,2]] },
  { num: 6, quizId: 'chomp-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false, w: 13, h: 13, start: [3,2], floor: 60, solution: 90,
    cast: ['bulldog', 'ibis', 'longhorn', 'wildcat', 'tiger', 'eagle'],
    pellets: [[12,12], [1,10], [6,11], [6,2], [10,4], [9,10]] },
  { num: 7, quizId: 'chomp-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false, w: 13, h: 13, start: [9,6], floor: 55, solution: 63,
    cast: ['bulldog', 'gamecock', 'seminole', 'ibis', 'tiger', 'eagle'],
    pellets: [[4,7], [7,4], [3,6], [12,9], [3,0], [9,1]] },
  { num: 8, quizId: 'chomp-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false, w: 13, h: 13, start: [8,12], floor: 68, solution: 68,
    cast: ['bulldog', 'longhorn', 'eagle', 'seminole', 'gamecock', 'wildcat', 'tiger'],
    pellets: [[2,12], [8,10], [0,10], [3,7], [11,1], [0,4], [8,0]] },
  { num: 9, quizId: 'chomp-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true, w: 13, h: 13, start: [8,0], floor: 67, solution: 81,
    cast: ['bulldog', 'longhorn', 'ibis', 'wildcat', 'tiger', 'eagle', 'seminole', 'gamecock'],
    pellets: [[10,4], [7,11], [11,6], [6,10], [1,0], [2,5], [4,9], [7,6]] },
  { num: 10, quizId: 'chomp-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false, w: 13, h: 13, start: [7,7], floor: 58, solution: 84,
    cast: ['bulldog', 'seminole', 'longhorn', 'gamecock', 'eagle', 'tiger', 'ibis'],
    pellets: [[5,0], [11,5], [2,8], [4,12], [4,4], [5,9], [7,5]] },
  { num: 11, quizId: 'chomp-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false, w: 13, h: 13, start: [7,12], floor: 53, solution: 53,
    cast: ['bulldog', 'wildcat', 'seminole', 'longhorn', 'tiger', 'gamecock', 'ibis'],
    pellets: [[1,12], [6,9], [12,11], [7,6], [11,4], [4,2], [0,0]] },
  { num: 12, quizId: 'chomp-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false, w: 13, h: 13, start: [6,0], floor: 50, solution: 78,
    cast: ['bulldog', 'ibis', 'seminole', 'longhorn', 'wildcat', 'tiger'],
    pellets: [[0,0], [12,0], [11,11], [5,11], [12,10], [12,4]] },
  { num: 13, quizId: 'chomp-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false, w: 13, h: 13, start: [8,3], floor: 63, solution: 63,
    cast: ['bulldog', 'gamecock', 'eagle', 'seminole', 'ibis', 'tiger', 'longhorn'],
    pellets: [[12,1], [0,4], [3,8], [0,12], [4,7], [12,5], [7,9]] },
  { num: 14, quizId: 'chomp-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, w: 13, h: 13, start: [2,12], floor: 55, solution: 61,
    cast: ['bulldog', 'seminole', 'ibis', 'wildcat', 'gamecock', 'longhorn'],
    pellets: [[9,3], [6,9], [8,5], [0,7], [1,1], [6,3]] },
  { num: 15, quizId: 'chomp-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, w: 13, h: 13, start: [4,9], floor: 52, solution: 82,
    cast: ['bulldog', 'tiger', 'wildcat', 'seminole', 'gamecock', 'longhorn'],
    pellets: [[11,10], [9,5], [2,12], [3,2], [1,6], [1,12]] },
  { num: 16, quizId: 'chomp-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, w: 13, h: 13, start: [1,5], floor: 76, solution: 78,
    cast: ['bulldog', 'gamecock', 'ibis', 'longhorn', 'eagle', 'tiger', 'seminole', 'wildcat'],
    pellets: [[0,12], [8,12], [1,8], [1,0], [10,10], [3,9], [8,8], [9,1]] },
  { num: 17, quizId: 'chomp-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, w: 13, h: 13, start: [9,4], floor: 53, solution: 55,
    cast: ['bulldog', 'tiger', 'wildcat', 'seminole', 'longhorn', 'ibis'],
    pellets: [[7,12], [0,8], [6,11], [2,6], [2,0], [3,7]] },
  { num: 18, quizId: 'chomp-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, w: 13, h: 13, start: [9,11], floor: 72, solution: 76,
    cast: ['bulldog', 'seminole', 'ibis', 'gamecock', 'eagle', 'tiger', 'wildcat'],
    pellets: [[0,5], [1,10], [10,6], [10,12], [11,0], [7,7], [2,4]] },
  { num: 19, quizId: 'chomp-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, w: 13, h: 13, start: [9,5], floor: 50, solution: 58,
    cast: ['bulldog', 'seminole', 'eagle', 'tiger', 'wildcat', 'ibis', 'gamecock'],
    pellets: [[12,8], [4,9], [2,4], [0,9], [0,2], [5,3], [0,0]] },
  { num: 20, quizId: 'chomp-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, w: 13, h: 13, start: [9,5], floor: 59, solution: 103,
    cast: ['bulldog', 'longhorn', 'tiger', 'seminole', 'ibis', 'eagle', 'wildcat'],
    pellets: [[5,8], [10,10], [1,7], [5,10], [3,3], [9,0], [12,5]] },
  { num: 21, quizId: 'chomp-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, w: 13, h: 13, start: [8,0], floor: 56, solution: 80,
    cast: ['bulldog', 'ibis', 'tiger', 'eagle', 'seminole', 'wildcat', 'gamecock'],
    pellets: [[12,6], [5,1], [8,4], [4,10], [10,10], [5,9], [9,7]] },
  { num: 22, quizId: 'chomp-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, w: 13, h: 13, start: [6,6], floor: 58, solution: 74,
    cast: ['bulldog', 'eagle', 'tiger', 'seminole', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[5,12], [10,11], [2,0], [6,3], [11,1], [9,5], [11,9]] },
  { num: 23, quizId: 'chomp-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, w: 13, h: 13, start: [5,2], floor: 61, solution: 109,
    cast: ['bulldog', 'eagle', 'ibis', 'wildcat', 'longhorn', 'gamecock', 'seminole', 'tiger'],
    pellets: [[11,0], [9,6], [10,0], [1,5], [2,10], [4,6], [3,11], [5,7]] },
  { num: 24, quizId: 'chomp-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, w: 13, h: 13, start: [9,12], floor: 62, solution: 64,
    cast: ['bulldog', 'seminole', 'wildcat', 'longhorn', 'gamecock', 'tiger', 'ibis'],
    pellets: [[0,4], [2,8], [2,0], [4,5], [9,6], [12,0], [7,4]] },
  { num: 25, quizId: 'chomp-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, w: 13, h: 13, start: [8,10], floor: 57, solution: 77,
    cast: ['bulldog', 'wildcat', 'seminole', 'tiger', 'longhorn', 'eagle', 'ibis'],
    pellets: [[10,3], [9,9], [5,11], [9,3], [5,1], [1,5], [8,3]] },
  { num: 26, quizId: 'chomp-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, w: 13, h: 13, start: [8,8], floor: 58, solution: 62,
    cast: ['bulldog', 'gamecock', 'tiger', 'wildcat', 'longhorn', 'eagle', 'seminole'],
    pellets: [[7,0], [11,5], [8,2], [7,10], [5,5], [2,12], [3,5]] },
  { num: 27, quizId: 'chomp-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, w: 13, h: 13, start: [2,12], floor: 56, solution: 66,
    cast: ['bulldog', 'seminole', 'eagle', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[8,12], [0,12], [12,1], [8,3], [2,3], [4,8]] },
  { num: 28, quizId: 'chomp-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, w: 13, h: 13, start: [5,11], floor: 67, solution: 77,
    cast: ['bulldog', 'tiger', 'wildcat', 'gamecock', 'seminole', 'eagle'],
    pellets: [[1,0], [8,9], [12,5], [3,1], [7,6], [5,2]] },
  { num: 29, quizId: 'chomp-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, w: 13, h: 13, start: [6,6], floor: 65, solution: 93,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'longhorn', 'gamecock', 'eagle'],
    pellets: [[12,8], [7,3], [10,12], [4,12], [8,10], [1,0], [0,5]] },
  { num: 30, quizId: 'chomp-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, w: 13, h: 13, start: [1,3], floor: 70, solution: 72,
    cast: ['bulldog', 'tiger', 'eagle', 'ibis', 'seminole', 'gamecock', 'wildcat', 'longhorn'],
    pellets: [[7,0], [1,8], [4,3], [5,9], [6,2], [11,4], [7,10], [8,4]] },
  { num: 31, quizId: 'chomp-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, w: 13, h: 13, start: [6,3], floor: 56, solution: 62,
    cast: ['bulldog', 'seminole', 'gamecock', 'wildcat', 'longhorn', 'eagle'],
    pellets: [[12,1], [8,12], [2,11], [0,0], [2,5], [3,0]] },
  { num: 32, quizId: 'chomp-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, w: 13, h: 13, start: [4,0], floor: 50, solution: 50,
    cast: ['bulldog', 'seminole', 'ibis', 'longhorn', 'tiger', 'eagle'],
    pellets: [[0,4], [12,2], [10,8], [4,9], [9,10], [2,10]] },
  { num: 33, quizId: 'chomp-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, w: 13, h: 13, start: [11,12], floor: 66, solution: 96,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'seminole', 'longhorn', 'tiger'],
    pellets: [[2,11], [12,1], [4,2], [6,6], [5,1], [11,4], [10,9]] },
  { num: 34, quizId: 'chomp-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, w: 13, h: 13, start: [2,11], floor: 57, solution: 65,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'wildcat', 'longhorn', 'ibis'],
    pellets: [[7,12], [5,0], [12,1], [6,3], [8,10], [9,5], [10,10]] },
  { num: 35, quizId: 'chomp-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, w: 13, h: 13, start: [0,7], floor: 53, solution: 53,
    cast: ['bulldog', 'seminole', 'wildcat', 'gamecock', 'eagle', 'longhorn', 'tiger'],
    pellets: [[1,12], [5,10], [12,3], [11,8], [10,1], [4,2], [6,6]] },
  { num: 36, quizId: 'chomp-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, w: 13, h: 13, start: [11,9], floor: 56, solution: 60,
    cast: ['bulldog', 'longhorn', 'eagle', 'ibis', 'wildcat', 'tiger'],
    pellets: [[5,2], [4,10], [9,9], [2,12], [1,3], [1,11]] },
  { num: 37, quizId: 'chomp-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, w: 13, h: 13, start: [4,12], floor: 60, solution: 60,
    cast: ['bulldog', 'eagle', 'longhorn', 'gamecock', 'wildcat', 'seminole', 'tiger', 'ibis'],
    pellets: [[9,10], [4,9], [9,0], [8,5], [3,1], [0,4], [3,7], [1,3]] },
  { num: 38, quizId: 'chomp-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, w: 13, h: 13, start: [7,8], floor: 54, solution: 54,
    cast: ['bulldog', 'eagle', 'wildcat', 'ibis', 'longhorn', 'tiger', 'gamecock'],
    pellets: [[11,11], [5,10], [0,0], [6,0], [12,0], [6,1], [1,2]] },
  { num: 39, quizId: 'chomp-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, w: 13, h: 13, start: [0,9], floor: 57, solution: 59,
    cast: ['bulldog', 'seminole', 'tiger', 'gamecock', 'longhorn', 'wildcat'],
    pellets: [[12,10], [6,7], [1,8], [5,2], [11,0], [0,0]] },
  { num: 40, quizId: 'chomp-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, w: 13, h: 13, start: [6,2], floor: 53, solution: 57,
    cast: ['bulldog', 'gamecock', 'tiger', 'longhorn', 'wildcat', 'eagle'],
    pellets: [[1,0], [5,6], [12,0], [12,8], [6,11], [11,10]] },
  { num: 41, quizId: 'chomp-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, w: 13, h: 13, start: [1,1], floor: 52, solution: 76,
    cast: ['bulldog', 'seminole', 'wildcat', 'tiger', 'ibis', 'eagle'],
    pellets: [[12,0], [12,11], [7,12], [4,5], [10,6], [8,10]] },
  { num: 42, quizId: 'chomp-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, w: 13, h: 13, start: [9,0], floor: 56, solution: 56,
    cast: ['bulldog', 'ibis', 'tiger', 'gamecock', 'seminole', 'eagle', 'wildcat'],
    pellets: [[11,11], [7,5], [8,0], [2,0], [5,4], [6,10], [3,6]] },
  { num: 43, quizId: 'chomp-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, w: 13, h: 13, start: [8,5], floor: 51, solution: 65,
    cast: ['bulldog', 'tiger', 'seminole', 'wildcat', 'longhorn', 'ibis', 'eagle'],
    pellets: [[4,1], [7,5], [11,12], [5,12], [0,11], [0,5], [4,8]] },
  { num: 44, quizId: 'chomp-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, w: 13, h: 13, start: [12,0], floor: 70, solution: 80,
    cast: ['bulldog', 'gamecock', 'tiger', 'wildcat', 'eagle', 'ibis', 'seminole', 'longhorn'],
    pellets: [[4,0], [0,2], [12,10], [11,4], [7,10], [8,5], [9,10], [9,3]] },
  { num: 45, quizId: 'chomp-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, w: 13, h: 13, start: [6,7], floor: 50, solution: 56,
    cast: ['bulldog', 'seminole', 'longhorn', 'eagle', 'ibis', 'tiger', 'wildcat'],
    pellets: [[4,3], [4,9], [3,4], [1,12], [0,5], [1,0], [9,0]] },
  { num: 46, quizId: 'chomp-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, w: 13, h: 13, start: [0,11], floor: 53, solution: 65,
    cast: ['bulldog', 'longhorn', 'eagle', 'ibis', 'seminole', 'tiger'],
    pellets: [[7,12], [0,4], [6,0], [5,7], [2,4], [6,6]] },
  { num: 47, quizId: 'chomp-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, w: 13, h: 13, start: [1,8], floor: 60, solution: 80,
    cast: ['bulldog', 'gamecock', 'eagle', 'tiger', 'longhorn', 'ibis', 'seminole'],
    pellets: [[10,2], [0,3], [4,1], [9,2], [2,4], [7,5], [2,7]] },
  { num: 48, quizId: 'chomp-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, w: 13, h: 13, start: [4,6], floor: 50, solution: 50,
    cast: ['bulldog', 'eagle', 'wildcat', 'longhorn', 'seminole', 'ibis'],
    pellets: [[0,1], [5,5], [3,12], [9,12], [9,4], [12,10]] },
  { num: 49, quizId: 'chomp-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, w: 13, h: 13, start: [10,12], floor: 52, solution: 52,
    cast: ['bulldog', 'gamecock', 'wildcat', 'tiger', 'eagle', 'seminole'],
    pellets: [[5,11], [2,5], [12,7], [7,1], [3,4], [9,5]] },
  { num: 50, quizId: 'chomp-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, w: 13, h: 13, start: [8,8], floor: 62, solution: 64,
    cast: ['bulldog', 'wildcat', 'seminole', 'ibis', 'gamecock', 'eagle', 'tiger'],
    pellets: [[3,12], [11,9], [4,9], [11,2], [5,3], [2,8], [0,4]] },
  { num: 51, quizId: 'chomp-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, w: 13, h: 13, start: [10,12], floor: 79, solution: 79,
    cast: ['bulldog', 'gamecock', 'longhorn', 'seminole', 'wildcat', 'eagle', 'tiger', 'ibis'],
    pellets: [[3,11], [12,1], [6,0], [2,2], [8,10], [11,1], [9,5], [5,2]] },
  { num: 52, quizId: 'chomp-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, w: 13, h: 13, start: [7,11], floor: 62, solution: 72,
    cast: ['bulldog', 'ibis', 'tiger', 'longhorn', 'wildcat', 'seminole', 'gamecock'],
    pellets: [[1,12], [0,2], [4,4], [12,12], [3,11], [5,7], [1,9]] },
  { num: 53, quizId: 'chomp-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, w: 13, h: 13, start: [11,9], floor: 58, solution: 106,
    cast: ['bulldog', 'gamecock', 'seminole', 'wildcat', 'ibis', 'eagle', 'longhorn'],
    pellets: [[7,1], [2,0], [9,4], [4,3], [6,9], [0,12], [2,8]] },
  { num: 54, quizId: 'chomp-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, w: 13, h: 13, start: [6,3], floor: 68, solution: 90,
    cast: ['bulldog', 'wildcat', 'gamecock', 'longhorn', 'tiger', 'eagle', 'ibis'],
    pellets: [[0,12], [2,0], [6,5], [8,9], [11,2], [11,9], [9,4]] },
  { num: 55, quizId: 'chomp-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, w: 13, h: 13, start: [1,8], floor: 57, solution: 91,
    cast: ['bulldog', 'ibis', 'wildcat', 'seminole', 'tiger', 'gamecock', 'eagle'],
    pellets: [[9,0], [11,5], [8,8], [8,2], [1,5], [0,0], [5,1]] },
  { num: 56, quizId: 'chomp-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, w: 13, h: 13, start: [5,0], floor: 58, solution: 112,
    cast: ['bulldog', 'gamecock', 'wildcat', 'longhorn', 'seminole', 'eagle', 'ibis'],
    pellets: [[9,3], [3,10], [9,10], [4,9], [10,7], [2,7], [10,5]] },
  { num: 57, quizId: 'chomp-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, w: 13, h: 13, start: [5,5], floor: 58, solution: 66,
    cast: ['bulldog', 'gamecock', 'wildcat', 'longhorn', 'ibis', 'tiger', 'seminole'],
    pellets: [[11,0], [5,3], [10,2], [8,12], [9,7], [12,11], [12,4]] },
  { num: 58, quizId: 'chomp-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, w: 13, h: 13, start: [2,1], floor: 62, solution: 102,
    cast: ['bulldog', 'ibis', 'eagle', 'wildcat', 'gamecock', 'seminole', 'tiger', 'longhorn'],
    pellets: [[8,0], [12,4], [2,3], [6,1], [4,8], [10,11], [6,9], [11,8]] },
  { num: 59, quizId: 'chomp-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, w: 13, h: 13, start: [6,11], floor: 56, solution: 72,
    cast: ['bulldog', 'wildcat', 'tiger', 'eagle', 'ibis', 'gamecock', 'seminole'],
    pellets: [[1,12], [4,8], [2,3], [4,7], [11,1], [5,2], [7,10]] },
  { num: 60, quizId: 'chomp-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, w: 13, h: 13, start: [5,0], floor: 57, solution: 67,
    cast: ['bulldog', 'longhorn', 'eagle', 'tiger', 'seminole', 'wildcat'],
    pellets: [[11,3], [1,11], [8,6], [10,10], [9,5], [11,9]] },
  { num: 61, quizId: 'chomp-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, w: 13, h: 13, start: [9,2], floor: 50, solution: 52,
    cast: ['bulldog', 'seminole', 'tiger', 'wildcat', 'eagle', 'longhorn', 'gamecock'],
    pellets: [[10,12], [5,11], [0,12], [2,7], [6,5], [9,0], [12,3]] },
  { num: 62, quizId: 'chomp-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, w: 13, h: 13, start: [4,5], floor: 63, solution: 91,
    cast: ['bulldog', 'longhorn', 'eagle', 'gamecock', 'tiger', 'wildcat', 'seminole'],
    pellets: [[12,12], [8,8], [5,5], [1,0], [8,6], [10,2], [7,5]] },
  { num: 63, quizId: 'chomp-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, w: 13, h: 13, start: [0,11], floor: 59, solution: 75,
    cast: ['bulldog', 'seminole', 'longhorn', 'wildcat', 'gamecock', 'tiger'],
    pellets: [[12,12], [2,10], [11,4], [7,7], [10,4], [8,0]] },
  { num: 64, quizId: 'chomp-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, w: 13, h: 13, start: [0,11], floor: 54, solution: 56,
    cast: ['bulldog', 'seminole', 'tiger', 'ibis', 'gamecock', 'wildcat'],
    pellets: [[3,8], [12,5], [0,5], [7,0], [2,1], [7,2]] },
  { num: 65, quizId: 'chomp-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true, w: 13, h: 13, start: [12,6], floor: 64, solution: 64,
    cast: ['bulldog', 'ibis', 'seminole', 'eagle', 'tiger', 'wildcat', 'longhorn', 'gamecock'],
    pellets: [[9,12], [3,11], [8,9], [2,9], [1,1], [8,8], [3,7], [7,5]] },
  { num: 66, quizId: 'chomp-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, w: 13, h: 13, start: [3,0], floor: 59, solution: 59,
    cast: ['bulldog', 'seminole', 'ibis', 'tiger', 'wildcat', 'gamecock', 'eagle'],
    pellets: [[0,5], [11,8], [2,6], [0,10], [6,11], [1,10], [6,8]] },
  { num: 67, quizId: 'chomp-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, w: 13, h: 13, start: [0,2], floor: 63, solution: 67,
    cast: ['bulldog', 'wildcat', 'seminole', 'eagle', 'longhorn', 'gamecock', 'ibis'],
    pellets: [[7,0], [4,3], [12,11], [1,12], [5,10], [0,9], [6,7]] },
  { num: 68, quizId: 'chomp-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, w: 13, h: 13, start: [7,10], floor: 60, solution: 60,
    cast: ['bulldog', 'seminole', 'longhorn', 'tiger', 'gamecock', 'wildcat', 'eagle'],
    pellets: [[0,8], [5,0], [9,4], [12,0], [12,11], [11,6], [10,11]] },
  { num: 69, quizId: 'chomp-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, w: 13, h: 13, start: [1,7], floor: 56, solution: 94,
    cast: ['bulldog', 'longhorn', 'seminole', 'wildcat', 'gamecock', 'ibis', 'eagle'],
    pellets: [[3,11], [3,1], [9,6], [12,3], [11,12], [8,8], [12,10]] },
  { num: 70, quizId: 'chomp-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, w: 13, h: 13, start: [12,6], floor: 49, solution: 49,
    cast: ['bulldog', 'longhorn', 'eagle', 'tiger', 'ibis', 'seminole'],
    pellets: [[12,12], [6,9], [0,10], [2,0], [5,6], [3,2]] },
];
