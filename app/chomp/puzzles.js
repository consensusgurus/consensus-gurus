// Puzzle data for Chomp, the daily route puzzle. Imported ONLY by the server
// page (app/chomp/page.js), which filters live<=today before handing the bank to
// the client, and by the daily API routes that need the day's row.
//
// TWO RULES CARRY THE GAME:
//
//   1. The body NEVER retracts. Every square the head touches belongs to it for
//      the rest of the run, so the trail is a permanent wall.
//   2. A mascot is SOLID until its turn. You cannot cross the tiger on the way to
//      the gamecock. That follows from rule 1: with a permanent trail, crossing
//      one early would leave it stranded under your own body forever, and a
//      visible wall is fairer than a board ruined twenty moves before anyone
//      notices.
//
// YOU DO NOT HAVE TO EAT THEM ALL. The score is how far down the cast you got,
// so a run that stalls on the fifth still counts for five.
//
// ⚠️ REBUILT 2026-08-11, THE THIRD DIFFICULTY REBUILD, AND IT REVERSES THE
// SECOND. The owner cleared the first board of the previous bank first try,
// having barely thought about it. Read this before touching the generator,
// because the previous two rebuilds each made the boards MEASURABLY harder and
// PLAYABLY easier, and the reason is not obvious.
//
// WHAT WENT WRONG. Coverage was the dial: the sum of the mascots' Manhattan
// separations is a proven lower bound on any route, so a high sum forces the
// player to fill the board, and the generator MAXIMISED it. That works, and it
// is precisely what made the boards trivial. Maximising leg length puts
// consecutive mascots in OPPOSITE CORNERS, and a long hop across open board is a
// corridor, not a decision: there is one obvious way to walk it and you walk it.
// Measured across the 67 boards this replaces:
//
//   longest leg   mean 10.2, out of a possible 12 on a 7x7
//   detour        min - floor was ZERO on 60 of 67 boards, so not one square
//                 anywhere on the bank ever required walking AWAY from a mascot
//   rim           half of every route ran along the outside edge
//   shape         mascots on a ring, route a lap around it, 3.1 squares per
//                 straight run
//
// The board the owner rejected had SEVEN optimal routes and 117 winning routes
// in total. That is not hard, it is a single visible snake you trace.
//
// WHY THE CHECKER NEVER SAW IT. Every gate, in all three rounds, asked "can this
// bot finish". Twelve player models have now been written against these boards
// (myopic lines, careful greedy, a 300- and a 2000-wide beam, wall-hugging
// sweepers, straight-preferring reflex players, one and two mascots of lookahead)
// and they clear the rejected bank roughly 0% of the time. A BOT IS NOT THE THING
// THE BOARD IS SHOWN TO. A model optimises the next square; a person sees a 7x7
// grid whole and reads the route off it before moving. Do not write a thirteenth.
//
// THE INVERSION. Difficulty now comes from mascots that are CLOSE TOGETHER and
// hard to get between, not far apart and easy:
//
//   longest leg  <= 6, and the leg BAND is targeted rather than capped, because
//                under a cap the generator drives the distance to its minimum,
//                the floor collapses and the board ends up 60% untouched, which
//                is loose in a new way rather than hard.
//   detour       >= 4 EVERYWHERE. This is the real dial: moves the optimum must
//                spend above the Manhattan bound, i.e. squares where the only way
//                to your target is away from it. It shipped at >= 2 first and the
//                owner played it and said it still looked easy, correctly: 2 on a
//                41-move route is about 5% of the board asking anything of you.
//                It is 4 and not 5 because 5 was MEASURED as unreachable at
//                Saturday's rung, and a band nobody can hit is not a stricter
//                gate, it is a build that starves and gets quietly relaxed.
//   turn density <= 2.4 squares per straight run, measured on the TIDIEST of all
//                shortest routes, never on whichever one the solver returned
//                first. A board can hold both a tangled optimum and a straight
//                one and the player walks whichever they find; gating on an
//                arbitrary route let three boards through at 3.0+ during this
//                very rebuild.
//   coverage     still forced, but by the NUMBER of legs rather than their
//                length. Ten short legs reach the same floor as six long ones.
//
// THE CAST IS THE RAMP, 8 on Monday to 11 on Sunday (Friday is 9, not 10: at cast
// 10 with spare 4-5 the rung is empty, because spare 4-5 means min 43-44, detour 4
// means floor <= 39-40, and ten legs cannot be that short without the optimum
// collapsing back onto the floor. Saturday is TIGHTER and easier to satisfy, since
// a higher min leaves more room above the floor), which is what the knight,
// smokey and the bull were drawn for (owner, 2026-08-11: "you can build a golden
// knight, another dog named smokey, a bull"). More mascots is more legs, more
// solid obstacles, and more of the board consumed. Spare squares still fall
// through the week and every band is at or BELOW the bank this replaces: a first
// pass put Monday at 12 spare against the old 9 and was thrown away rather than
// shipped, because loosening the one dial the owner had already signed off on
// while claiming to be harder is asking to be taken on trust.
//
// Boards are still built BACKWARDS from a self-avoiding walk with the mascots
// hung on it in walk order, so solvability is by construction. The waypoints are
// now chosen to maximise walk distance MINUS Manhattan distance, which is the
// detour, instead of maximising Manhattan distance, which was the corridor.
//
// Bands were MEASURED against what the generator can reach before being written
// down. Round one wrote bands about twenty points under the ceiling and that is
// how a Monday came to hand out twenty-four free squares.
//
// Fields, all re-derived by scripts/verify-chomp.mjs rather than trusted:
//
//   w, h      7 and 7 from 2026-08-11. The first three boards are live history
//             and keep the sizes they shipped on.
//   cast      the mascots in EATING ORDER; cast[i] sits on pellets[i]. Only the
//             BULLDOG is fixed, always first, so every run opens the same way.
//   floor     the Manhattan leg sum, a proven lower bound on any legal route.
//   min       the TRUE optimum, found by exhaustive search. min - floor is the
//             detour, and it is the number that matters most on this bank.
//
// SUNDAY EDITION: the whole cast of eleven, 0-2 spare squares. `sunday` must be
// true if and only if `live` really is a Sunday; the flag is the ONLY source of
// truth for the badge.

export const MASCOTS = ["bulldog","ibis","gamecock","tiger","eagle","longhorn","wildcat","seminole","knight","smokey","bull"];

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
  { num: 5, quizId: 'chomp-8-12-26', live: '2026-08-12', dateLabel: 'August 12, 2026', sunday: false, w: 7, h: 7, start: [5,4], floor: 38, min: 42,
    cast: ['bulldog', 'ibis', 'longhorn', 'tiger', 'smokey', 'wildcat', 'bull', 'knight', 'gamecock'],
    pellets: [[6,1], [4,3], [3,0], [0,1], [3,2], [1,5], [3,3], [6,5], [2,5]] },
  { num: 6, quizId: 'chomp-8-13-26', live: '2026-08-13', dateLabel: 'August 13, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 38, min: 42,
    cast: ['bulldog', 'eagle', 'ibis', 'gamecock', 'seminole', 'knight', 'tiger', 'longhorn', 'smokey'],
    pellets: [[2,6], [1,3], [0,6], [4,4], [6,6], [5,3], [6,0], [3,1], [0,0]] },
  { num: 7, quizId: 'chomp-8-14-26', live: '2026-08-14', dateLabel: 'August 14, 2026', sunday: false, w: 7, h: 7, start: [5,2], floor: 38, min: 44,
    cast: ['bulldog', 'longhorn', 'smokey', 'tiger', 'seminole', 'knight', 'bull', 'gamecock', 'ibis'],
    pellets: [[5,6], [4,3], [3,6], [0,5], [3,4], [1,1], [3,3], [6,1], [2,1]] },
  { num: 8, quizId: 'chomp-8-15-26', live: '2026-08-15', dateLabel: 'August 15, 2026', sunday: false, w: 7, h: 7, start: [2,5], floor: 40, min: 44,
    cast: ['bulldog', 'ibis', 'gamecock', 'tiger', 'eagle', 'seminole', 'wildcat', 'knight', 'smokey', 'longhorn'],
    pellets: [[6,5], [3,4], [6,3], [5,0], [4,3], [3,0], [0,1], [2,3], [1,6], [1,2]] },
  { num: 9, quizId: 'chomp-8-16-26', live: '2026-08-16', dateLabel: 'August 16, 2026', sunday: true, w: 7, h: 7, start: [1,3], floor: 42, min: 46,
    cast: ['bulldog', 'ibis', 'wildcat', 'tiger', 'seminole', 'longhorn', 'eagle', 'smokey', 'gamecock', 'knight', 'bull'],
    pellets: [[1,6], [1,2], [0,0], [2,1], [6,0], [6,4], [4,6], [2,5], [5,4], [3,1], [4,4]] },
  { num: 10, quizId: 'chomp-8-17-26', live: '2026-08-17', dateLabel: 'August 17, 2026', sunday: false, w: 7, h: 7, start: [6,5], floor: 33, min: 37,
    cast: ['bulldog', 'tiger', 'wildcat', 'longhorn', 'eagle', 'ibis', 'smokey', 'bull'],
    pellets: [[3,6], [5,4], [5,0], [4,3], [1,1], [3,3], [0,2], [1,5]] },
  { num: 11, quizId: 'chomp-8-18-26', live: '2026-08-18', dateLabel: 'August 18, 2026', sunday: false, w: 7, h: 7, start: [6,5], floor: 37, min: 41,
    cast: ['bulldog', 'wildcat', 'seminole', 'ibis', 'eagle', 'gamecock', 'bull', 'tiger'],
    pellets: [[0,5], [4,5], [6,3], [0,3], [3,2], [0,0], [3,1], [6,0]] },
  { num: 12, quizId: 'chomp-8-19-26', live: '2026-08-19', dateLabel: 'August 19, 2026', sunday: false, w: 7, h: 7, start: [1,2], floor: 37, min: 41,
    cast: ['bulldog', 'seminole', 'smokey', 'wildcat', 'tiger', 'bull', 'longhorn', 'knight', 'ibis'],
    pellets: [[1,6], [2,3], [0,1], [3,2], [2,5], [5,6], [4,3], [6,0], [5,3]] },
  { num: 13, quizId: 'chomp-8-20-26', live: '2026-08-20', dateLabel: 'August 20, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 38, min: 42,
    cast: ['bulldog', 'bull', 'knight', 'wildcat', 'longhorn', 'smokey', 'gamecock', 'tiger', 'seminole'],
    pellets: [[6,4], [3,5], [6,6], [4,2], [6,0], [3,1], [0,0], [1,3], [0,6]] },
  { num: 14, quizId: 'chomp-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, w: 7, h: 7, start: [4,1], floor: 39, min: 43,
    cast: ['bulldog', 'gamecock', 'bull', 'longhorn', 'wildcat', 'knight', 'seminole', 'ibis', 'smokey'],
    pellets: [[0,2], [0,6], [1,3], [3,1], [3,6], [4,2], [6,0], [5,3], [4,6]] },
  { num: 15, quizId: 'chomp-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, w: 7, h: 7, start: [4,5], floor: 41, min: 45,
    cast: ['bulldog', 'gamecock', 'bull', 'longhorn', 'tiger', 'wildcat', 'seminole', 'knight', 'ibis', 'eagle'],
    pellets: [[0,5], [3,4], [0,3], [1,0], [2,3], [3,0], [4,3], [5,6], [4,2], [6,0]] },
  { num: 16, quizId: 'chomp-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, w: 7, h: 7, start: [5,3], floor: 40, min: 46,
    cast: ['bulldog', 'wildcat', 'gamecock', 'smokey', 'seminole', 'ibis', 'bull', 'tiger', 'longhorn', 'eagle', 'knight'],
    pellets: [[5,6], [5,2], [6,0], [4,1], [0,1], [3,2], [0,3], [0,6], [4,5], [1,4], [3,3]] },
  { num: 17, quizId: 'chomp-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, w: 7, h: 7, start: [5,0], floor: 35, min: 39,
    cast: ['bulldog', 'gamecock', 'longhorn', 'smokey', 'eagle', 'wildcat', 'tiger', 'seminole'],
    pellets: [[5,6], [5,2], [3,0], [4,3], [1,5], [3,3], [0,4], [2,2]] },
  { num: 18, quizId: 'chomp-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, w: 7, h: 7, start: [1,0], floor: 37, min: 41,
    cast: ['bulldog', 'eagle', 'gamecock', 'tiger', 'smokey', 'knight', 'longhorn', 'seminole'],
    pellets: [[1,6], [1,2], [3,0], [3,6], [4,3], [6,6], [5,3], [6,0]] },
  { num: 19, quizId: 'chomp-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 38, min: 42,
    cast: ['bulldog', 'knight', 'tiger', 'longhorn', 'seminole', 'ibis', 'wildcat', 'eagle', 'bull'],
    pellets: [[6,1], [3,2], [6,3], [5,6], [4,3], [1,5], [3,3], [0,4], [0,0]] },
  { num: 20, quizId: 'chomp-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, w: 7, h: 7, start: [2,5], floor: 39, min: 43,
    cast: ['bulldog', 'knight', 'seminole', 'gamecock', 'smokey', 'bull', 'eagle', 'longhorn', 'ibis'],
    pellets: [[6,4], [6,0], [5,3], [3,5], [3,0], [2,4], [0,6], [1,3], [2,0]] },
  { num: 21, quizId: 'chomp-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, w: 7, h: 7, start: [1,4], floor: 39, min: 43,
    cast: ['bulldog', 'gamecock', 'smokey', 'wildcat', 'ibis', 'eagle', 'bull', 'longhorn', 'knight'],
    pellets: [[2,0], [6,0], [3,1], [1,3], [6,3], [2,4], [0,6], [3,5], [6,4]] },
  { num: 22, quizId: 'chomp-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, w: 7, h: 7, start: [1,2], floor: 41, min: 45,
    cast: ['bulldog', 'smokey', 'ibis', 'wildcat', 'tiger', 'knight', 'seminole', 'gamecock', 'longhorn', 'bull'],
    pellets: [[1,6], [2,3], [3,6], [6,5], [3,4], [6,3], [3,2], [0,1], [4,2], [6,0]] },
  { num: 23, quizId: 'chomp-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, w: 7, h: 7, start: [1,3], floor: 42, min: 46,
    cast: ['bulldog', 'wildcat', 'bull', 'smokey', 'gamecock', 'longhorn', 'eagle', 'knight', 'ibis', 'tiger', 'seminole'],
    pellets: [[1,6], [2,4], [5,6], [6,2], [5,0], [5,4], [3,5], [3,0], [3,3], [0,2], [2,0]] },
  { num: 24, quizId: 'chomp-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, w: 7, h: 7, start: [0,5], floor: 34, min: 38,
    cast: ['bulldog', 'seminole', 'eagle', 'wildcat', 'bull', 'knight', 'smokey', 'tiger'],
    pellets: [[5,5], [1,5], [0,1], [2,3], [6,3], [5,0], [2,1], [4,3]] },
  { num: 25, quizId: 'chomp-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, w: 7, h: 7, start: [5,1], floor: 36, min: 40,
    cast: ['bulldog', 'eagle', 'tiger', 'seminole', 'smokey', 'bull', 'gamecock', 'wildcat'],
    pellets: [[5,6], [5,2], [3,0], [3,6], [2,3], [0,0], [1,3], [2,6]] },
  { num: 26, quizId: 'chomp-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 38, min: 42,
    cast: ['bulldog', 'seminole', 'smokey', 'eagle', 'bull', 'tiger', 'ibis', 'gamecock', 'longhorn'],
    pellets: [[6,1], [3,2], [6,3], [5,6], [4,3], [1,5], [3,3], [0,4], [0,0]] },
  { num: 27, quizId: 'chomp-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 38, min: 42,
    cast: ['bulldog', 'wildcat', 'knight', 'ibis', 'longhorn', 'bull', 'tiger', 'seminole', 'eagle'],
    pellets: [[2,6], [1,3], [0,6], [4,4], [6,6], [5,3], [6,0], [3,1], [0,0]] },
  { num: 28, quizId: 'chomp-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, w: 7, h: 7, start: [3,5], floor: 39, min: 43,
    cast: ['bulldog', 'knight', 'longhorn', 'bull', 'ibis', 'tiger', 'wildcat', 'smokey', 'seminole'],
    pellets: [[0,6], [2,4], [2,0], [6,0], [3,1], [1,3], [6,2], [3,3], [5,6]] },
  { num: 29, quizId: 'chomp-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, w: 7, h: 7, start: [1,2], floor: 40, min: 44,
    cast: ['bulldog', 'gamecock', 'smokey', 'knight', 'seminole', 'ibis', 'bull', 'tiger', 'longhorn', 'wildcat'],
    pellets: [[1,6], [2,3], [3,6], [6,5], [3,4], [6,3], [5,0], [3,2], [0,1], [4,1]] },
  { num: 30, quizId: 'chomp-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, w: 7, h: 7, start: [0,2], floor: 40, min: 46,
    cast: ['bulldog', 'knight', 'tiger', 'wildcat', 'smokey', 'gamecock', 'bull', 'seminole', 'eagle', 'ibis', 'longhorn'],
    pellets: [[1,0], [1,3], [1,6], [2,4], [6,4], [5,0], [2,1], [5,2], [2,3], [3,5], [5,3]] },
  { num: 31, quizId: 'chomp-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, w: 7, h: 7, start: [6,3], floor: 35, min: 39,
    cast: ['bulldog', 'seminole', 'bull', 'smokey', 'tiger', 'longhorn', 'gamecock', 'knight'],
    pellets: [[5,6], [4,3], [0,5], [3,4], [1,1], [3,3], [2,0], [6,0]] },
  { num: 32, quizId: 'chomp-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, w: 7, h: 7, start: [6,1], floor: 36, min: 40,
    cast: ['bulldog', 'tiger', 'seminole', 'bull', 'longhorn', 'smokey', 'knight', 'wildcat'],
    pellets: [[1,1], [5,1], [6,6], [4,3], [0,3], [1,6], [2,3], [4,5]] },
  { num: 33, quizId: 'chomp-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, w: 7, h: 7, start: [2,6], floor: 38, min: 42,
    cast: ['bulldog', 'longhorn', 'gamecock', 'tiger', 'seminole', 'smokey', 'eagle', 'knight', 'wildcat'],
    pellets: [[6,5], [2,5], [5,4], [5,0], [4,3], [1,1], [3,3], [0,2], [1,5]] },
  { num: 34, quizId: 'chomp-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, w: 7, h: 7, start: [4,4], floor: 39, min: 43,
    cast: ['bulldog', 'longhorn', 'wildcat', 'ibis', 'tiger', 'eagle', 'smokey', 'seminole', 'gamecock'],
    pellets: [[5,0], [4,3], [3,0], [0,1], [3,2], [1,5], [3,3], [2,6], [6,5]] },
  { num: 35, quizId: 'chomp-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 40, min: 44,
    cast: ['bulldog', 'knight', 'smokey', 'eagle', 'tiger', 'longhorn', 'bull', 'gamecock', 'wildcat'],
    pellets: [[6,0], [4,2], [5,6], [4,3], [0,5], [3,4], [0,2], [2,0], [1,3]] },
  { num: 36, quizId: 'chomp-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, w: 7, h: 7, start: [4,5], floor: 41, min: 45,
    cast: ['bulldog', 'gamecock', 'wildcat', 'smokey', 'seminole', 'ibis', 'bull', 'knight', 'tiger', 'eagle'],
    pellets: [[0,5], [3,4], [0,3], [1,0], [2,3], [3,0], [4,3], [5,6], [4,2], [6,0]] },
  { num: 37, quizId: 'chomp-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, w: 7, h: 7, start: [0,4], floor: 42, min: 46,
    cast: ['bulldog', 'seminole', 'ibis', 'smokey', 'eagle', 'tiger', 'longhorn', 'knight', 'gamecock', 'wildcat', 'bull'],
    pellets: [[1,6], [0,2], [1,0], [2,3], [2,6], [2,1], [6,1], [4,2], [6,5], [4,6], [5,3]] },
  { num: 38, quizId: 'chomp-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, w: 7, h: 7, start: [6,1], floor: 35, min: 39,
    cast: ['bulldog', 'bull', 'gamecock', 'eagle', 'knight', 'seminole', 'smokey', 'tiger'],
    pellets: [[0,1], [4,1], [6,3], [2,2], [1,5], [3,3], [2,6], [4,4]] },
  { num: 39, quizId: 'chomp-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, w: 7, h: 7, start: [4,4], floor: 36, min: 40,
    cast: ['bulldog', 'bull', 'ibis', 'eagle', 'gamecock', 'wildcat', 'smokey', 'longhorn'],
    pellets: [[5,0], [0,0], [3,1], [5,3], [0,4], [3,3], [2,6], [5,5]] },
  { num: 40, quizId: 'chomp-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 38, min: 42,
    cast: ['bulldog', 'seminole', 'ibis', 'eagle', 'longhorn', 'tiger', 'bull', 'wildcat', 'gamecock'],
    pellets: [[0,1], [3,2], [0,3], [1,6], [2,3], [5,5], [3,3], [6,4], [6,0]] },
  { num: 41, quizId: 'chomp-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 38, min: 42,
    cast: ['bulldog', 'seminole', 'longhorn', 'wildcat', 'ibis', 'knight', 'tiger', 'eagle', 'gamecock'],
    pellets: [[4,6], [5,3], [6,6], [2,4], [0,6], [1,3], [0,0], [3,1], [6,0]] },
  { num: 42, quizId: 'chomp-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, w: 7, h: 7, start: [3,1], floor: 40, min: 44,
    cast: ['bulldog', 'gamecock', 'ibis', 'smokey', 'seminole', 'knight', 'wildcat', 'tiger', 'eagle'],
    pellets: [[0,0], [2,2], [1,6], [2,3], [6,5], [3,4], [6,3], [3,2], [6,0]] },
  { num: 43, quizId: 'chomp-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, w: 7, h: 7, start: [5,4], floor: 41, min: 45,
    cast: ['bulldog', 'smokey', 'seminole', 'knight', 'tiger', 'longhorn', 'eagle', 'gamecock', 'bull', 'wildcat'],
    pellets: [[5,0], [4,3], [3,0], [0,1], [3,2], [0,3], [3,4], [6,5], [2,4], [0,6]] },
  { num: 44, quizId: 'chomp-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, w: 7, h: 7, start: [5,3], floor: 42, min: 46,
    cast: ['bulldog', 'longhorn', 'bull', 'tiger', 'gamecock', 'ibis', 'wildcat', 'knight', 'smokey', 'eagle', 'seminole'],
    pellets: [[5,0], [4,2], [0,1], [3,2], [0,3], [1,6], [1,3], [3,6], [3,3], [5,6], [6,4]] },
  { num: 45, quizId: 'chomp-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, w: 7, h: 7, start: [6,5], floor: 34, min: 38,
    cast: ['bulldog', 'eagle', 'gamecock', 'tiger', 'seminole', 'ibis', 'longhorn', 'bull'],
    pellets: [[3,6], [5,4], [5,0], [4,3], [1,1], [3,3], [0,2], [1,6]] },
  { num: 46, quizId: 'chomp-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, w: 7, h: 7, start: [0,3], floor: 36, min: 40,
    cast: ['bulldog', 'ibis', 'wildcat', 'seminole', 'tiger', 'bull', 'eagle', 'longhorn'],
    pellets: [[1,6], [2,3], [6,5], [3,4], [5,1], [3,3], [4,0], [0,1]] },
  { num: 47, quizId: 'chomp-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, w: 7, h: 7, start: [2,4], floor: 38, min: 42,
    cast: ['bulldog', 'ibis', 'longhorn', 'tiger', 'knight', 'bull', 'seminole', 'eagle', 'wildcat'],
    pellets: [[1,0], [2,3], [3,0], [6,1], [3,2], [5,5], [3,3], [4,6], [0,6]] },
  { num: 48, quizId: 'chomp-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 38, min: 42,
    cast: ['bulldog', 'eagle', 'smokey', 'seminole', 'tiger', 'wildcat', 'gamecock', 'ibis', 'longhorn'],
    pellets: [[5,6], [4,3], [3,6], [0,5], [3,4], [1,1], [3,3], [2,0], [5,1]] },
  { num: 49, quizId: 'chomp-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, w: 7, h: 7, start: [5,4], floor: 39, min: 43,
    cast: ['bulldog', 'knight', 'ibis', 'bull', 'wildcat', 'gamecock', 'smokey', 'eagle', 'seminole'],
    pellets: [[5,0], [4,3], [3,0], [0,1], [3,2], [1,6], [2,3], [5,5], [2,6]] },
  { num: 50, quizId: 'chomp-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, w: 7, h: 7, start: [5,2], floor: 41, min: 45,
    cast: ['bulldog', 'wildcat', 'seminole', 'gamecock', 'bull', 'knight', 'tiger', 'smokey', 'eagle', 'longhorn'],
    pellets: [[5,6], [4,3], [3,6], [0,5], [3,4], [0,3], [3,2], [6,1], [2,2], [0,0]] },
  { num: 51, quizId: 'chomp-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, w: 7, h: 7, start: [1,3], floor: 42, min: 46,
    cast: ['bulldog', 'longhorn', 'gamecock', 'knight', 'wildcat', 'smokey', 'eagle', 'bull', 'tiger', 'ibis', 'seminole'],
    pellets: [[1,0], [2,2], [5,0], [6,3], [6,6], [5,4], [3,2], [4,6], [2,3], [0,5], [2,6]] },
  { num: 52, quizId: 'chomp-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, w: 7, h: 7, start: [5,2], floor: 35, min: 39,
    cast: ['bulldog', 'smokey', 'ibis', 'eagle', 'tiger', 'knight', 'longhorn', 'seminole'],
    pellets: [[5,6], [4,3], [0,5], [3,4], [0,2], [3,3], [5,1], [2,0]] },
  { num: 53, quizId: 'chomp-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, w: 7, h: 7, start: [6,5], floor: 37, min: 41,
    cast: ['bulldog', 'gamecock', 'tiger', 'knight', 'smokey', 'seminole', 'longhorn', 'bull'],
    pellets: [[0,5], [4,5], [6,3], [0,3], [1,0], [3,3], [2,0], [5,1]] },
  { num: 54, quizId: 'chomp-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, w: 7, h: 7, start: [2,4], floor: 38, min: 42,
    cast: ['bulldog', 'bull', 'longhorn', 'eagle', 'seminole', 'knight', 'ibis', 'smokey', 'gamecock'],
    pellets: [[1,0], [2,3], [3,0], [6,1], [3,2], [5,5], [3,3], [4,6], [1,5]] },
  { num: 55, quizId: 'chomp-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, w: 7, h: 7, start: [6,2], floor: 39, min: 43,
    cast: ['bulldog', 'eagle', 'wildcat', 'longhorn', 'bull', 'tiger', 'smokey', 'ibis', 'knight'],
    pellets: [[5,6], [5,2], [4,5], [0,5], [3,4], [1,1], [3,3], [2,0], [6,1]] },
  { num: 56, quizId: 'chomp-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, w: 7, h: 7, start: [2,2], floor: 39, min: 43,
    cast: ['bulldog', 'ibis', 'smokey', 'eagle', 'longhorn', 'tiger', 'bull', 'wildcat', 'gamecock'],
    pellets: [[1,6], [2,3], [3,6], [6,5], [3,4], [5,1], [3,3], [4,0], [0,1]] },
  { num: 57, quizId: 'chomp-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, w: 7, h: 7, start: [5,4], floor: 40, min: 44,
    cast: ['bulldog', 'eagle', 'wildcat', 'tiger', 'longhorn', 'smokey', 'seminole', 'knight', 'gamecock', 'ibis'],
    pellets: [[5,0], [4,3], [3,0], [0,1], [3,2], [0,3], [1,6], [3,4], [6,5], [2,5]] },
  { num: 58, quizId: 'chomp-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, w: 7, h: 7, start: [3,1], floor: 42, min: 46,
    cast: ['bulldog', 'wildcat', 'bull', 'longhorn', 'smokey', 'knight', 'tiger', 'gamecock', 'seminole', 'ibis', 'eagle'],
    pellets: [[0,0], [4,1], [6,0], [5,2], [5,6], [5,3], [3,6], [0,5], [1,2], [3,4], [1,5]] },
  { num: 59, quizId: 'chomp-10-5-26', live: '2026-10-05', dateLabel: 'October 5, 2026', sunday: false, w: 7, h: 7, start: [3,6], floor: 33, min: 37,
    cast: ['bulldog', 'longhorn', 'bull', 'wildcat', 'ibis', 'eagle', 'smokey', 'gamecock'],
    pellets: [[0,5], [1,2], [3,4], [3,0], [4,3], [6,0], [5,3], [6,6]] },
  { num: 60, quizId: 'chomp-10-6-26', live: '2026-10-06', dateLabel: 'October 6, 2026', sunday: false, w: 7, h: 7, start: [1,6], floor: 37, min: 41,
    cast: ['bulldog', 'bull', 'gamecock', 'seminole', 'smokey', 'eagle', 'ibis', 'tiger'],
    pellets: [[1,0], [1,4], [3,6], [3,0], [4,4], [6,6], [5,3], [4,0]] },
  { num: 61, quizId: 'chomp-10-7-26', live: '2026-10-07', dateLabel: 'October 7, 2026', sunday: false, w: 7, h: 7, start: [4,2], floor: 38, min: 42,
    cast: ['bulldog', 'smokey', 'gamecock', 'ibis', 'wildcat', 'seminole', 'tiger', 'knight', 'eagle'],
    pellets: [[5,6], [4,3], [3,6], [0,5], [3,4], [1,1], [3,3], [2,0], [6,0]] },
  { num: 62, quizId: 'chomp-10-8-26', live: '2026-10-08', dateLabel: 'October 8, 2026', sunday: false, w: 7, h: 7, start: [3,3], floor: 38, min: 42,
    cast: ['bulldog', 'gamecock', 'longhorn', 'knight', 'tiger', 'eagle', 'smokey', 'seminole', 'wildcat'],
    pellets: [[0,2], [3,1], [0,0], [2,4], [0,6], [3,5], [6,6], [5,3], [6,0]] },
  { num: 63, quizId: 'chomp-10-9-26', live: '2026-10-09', dateLabel: 'October 9, 2026', sunday: false, w: 7, h: 7, start: [3,5], floor: 39, min: 43,
    cast: ['bulldog', 'knight', 'seminole', 'longhorn', 'wildcat', 'smokey', 'bull', 'ibis', 'eagle'],
    pellets: [[6,6], [4,4], [5,0], [4,3], [0,1], [3,2], [0,3], [3,4], [0,5]] },
  { num: 64, quizId: 'chomp-10-10-26', live: '2026-10-10', dateLabel: 'October 10, 2026', sunday: false, w: 7, h: 7, start: [2,5], floor: 41, min: 45,
    cast: ['bulldog', 'gamecock', 'tiger', 'smokey', 'knight', 'ibis', 'eagle', 'wildcat', 'bull', 'longhorn'],
    pellets: [[6,5], [3,4], [6,3], [5,0], [4,3], [3,0], [2,3], [1,6], [2,2], [0,0]] },
  { num: 65, quizId: 'chomp-10-11-26', live: '2026-10-11', dateLabel: 'October 11, 2026', sunday: true, w: 7, h: 7, start: [5,3], floor: 42, min: 46,
    cast: ['bulldog', 'eagle', 'wildcat', 'seminole', 'bull', 'tiger', 'smokey', 'knight', 'longhorn', 'ibis', 'gamecock'],
    pellets: [[5,0], [4,2], [0,1], [3,2], [0,3], [1,6], [2,3], [2,6], [4,3], [6,4], [4,6]] },
  { num: 66, quizId: 'chomp-10-12-26', live: '2026-10-12', dateLabel: 'October 12, 2026', sunday: false, w: 7, h: 7, start: [5,6], floor: 35, min: 39,
    cast: ['bulldog', 'ibis', 'longhorn', 'gamecock', 'wildcat', 'smokey', 'seminole', 'eagle'],
    pellets: [[5,0], [5,4], [3,6], [0,5], [3,4], [1,1], [3,3], [0,4]] },
  { num: 67, quizId: 'chomp-10-13-26', live: '2026-10-13', dateLabel: 'October 13, 2026', sunday: false, w: 7, h: 7, start: [6,1], floor: 37, min: 41,
    cast: ['bulldog', 'gamecock', 'ibis', 'seminole', 'tiger', 'longhorn', 'eagle', 'knight'],
    pellets: [[0,1], [4,1], [6,3], [0,3], [4,4], [6,6], [3,5], [0,4]] },
  { num: 68, quizId: 'chomp-10-14-26', live: '2026-10-14', dateLabel: 'October 14, 2026', sunday: false, w: 7, h: 7, start: [2,4], floor: 38, min: 42,
    cast: ['bulldog', 'eagle', 'gamecock', 'tiger', 'longhorn', 'smokey', 'wildcat', 'knight', 'ibis'],
    pellets: [[1,0], [2,3], [3,0], [6,1], [3,2], [5,5], [3,3], [4,6], [0,6]] },
  { num: 69, quizId: 'chomp-10-15-26', live: '2026-10-15', dateLabel: 'October 15, 2026', sunday: false, w: 7, h: 7, start: [0,4], floor: 39, min: 43,
    cast: ['bulldog', 'seminole', 'knight', 'ibis', 'tiger', 'longhorn', 'bull', 'wildcat', 'gamecock'],
    pellets: [[1,0], [1,4], [2,1], [6,1], [3,2], [5,5], [3,3], [4,6], [0,5]] },
  { num: 70, quizId: 'chomp-10-16-26', live: '2026-10-16', dateLabel: 'October 16, 2026', sunday: false, w: 7, h: 7, start: [1,3], floor: 39, min: 43,
    cast: ['bulldog', 'tiger', 'seminole', 'eagle', 'wildcat', 'knight', 'ibis', 'gamecock', 'longhorn'],
    pellets: [[0,6], [2,4], [6,5], [3,4], [5,0], [4,3], [3,0], [2,3], [1,0]] },
];
