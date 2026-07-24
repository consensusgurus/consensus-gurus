// Puzzle data for Cipher, the daily cryptarithm. Imported ONLY by the server
// page (app/cipher/page.js), which filters live<=today before passing puzzles
// to the client — future equations never ship early.
//
// Each puzzle carries an `op`: "add" (WORD + WORD = WORD, the Sunday Edition
// stacks three addends), "sub" (WORD - WORD = WORD), or "mul" (WORD x WORD =
// WORD). VARIETY RULE (from 2026-07-25): the operation never repeats two days
// in a row. Sundays are always the three-addend addition edition; every other
// day rotates through subtraction, multiplication, and two-addend addition so
// no two consecutive drops share an op. Drops before 2026-07-25 are all
// addition and grandfathered (already live and played).
//
// Every equation here is MACHINE-VERIFIED to have exactly one solution
// (distinct digits per letter, leading letters nonzero). The solution is not
// stored anywhere — the client checks the arithmetic directly. Validate with
// scripts/verify-cipher.mjs after ANY edit: it brute-forces every equation and
// fails unless each has exactly one solution, <= 10 distinct letters, and the
// op never repeats on consecutive days (from the variety-launch date on).
export const PUZZLES = [
  { num: 1, quizId: "cipher-7-18-26", live: "2026-07-18", dateLabel: "July 18, 2026", sunday: false, op: "add", lhs: ["SEND","MORE"], rhs: "MONEY" },
  { num: 2, quizId: "cipher-7-19-26", live: "2026-07-19", dateLabel: "July 19, 2026", sunday: false, op: "add", lhs: ["FIFTY","STATES"], rhs: "AMERICA" },
  { num: 3, quizId: "cipher-7-20-26", live: "2026-07-20", dateLabel: "July 20, 2026", sunday: false, op: "add", lhs: ["EAT","THAT"], rhs: "APPLE" },
  { num: 4, quizId: "cipher-7-21-26", live: "2026-07-21", dateLabel: "July 21, 2026", sunday: false, op: "add", lhs: ["BASE","BALL"], rhs: "GAMES" },
  { num: 5, quizId: "cipher-7-22-26", live: "2026-07-22", dateLabel: "July 22, 2026", sunday: false, op: "add", lhs: ["SEA","REEF"], rhs: "WHALE" },
  { num: 6, quizId: "cipher-7-23-26", live: "2026-07-23", dateLabel: "July 23, 2026", sunday: false, op: "add", lhs: ["COCA","COLA"], rhs: "OASIS" },
  { num: 7, quizId: "cipher-7-24-26", live: "2026-07-24", dateLabel: "July 24, 2026", sunday: false, op: "add", lhs: ["BEAR","DEER"], rhs: "ZEBRA" },
  { num: 8, quizId: "cipher-7-25-26", live: "2026-07-25", dateLabel: "July 25, 2026", sunday: false, op: "sub", lhs: ["GRAPE","APPLE"], rhs: "PEAR" },
  { num: 9, quizId: "cipher-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: true, op: "add", lhs: ["SNOW","MOON","NOON"], rhs: "STORM" },
  { num: 10, quizId: "cipher-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false, op: "sub", lhs: ["EAGLE","GRAPE"], rhs: "ZEBRA" },
  { num: 11, quizId: "cipher-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false, op: "add", lhs: ["CROSS","ROADS"], rhs: "DANGER" },
  { num: 12, quizId: "cipher-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false, op: "sub", lhs: ["TIGER","GRAPE"], rhs: "EARTH" },
  { num: 13, quizId: "cipher-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false, op: "add", lhs: ["MIST","FROST"], rhs: "WINTER" },
  { num: 14, quizId: "cipher-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false, op: "mul", lhs: ["SEA","SEA"], rhs: "WHALE" },
  { num: 15, quizId: "cipher-8-1-26", live: "2026-08-01", dateLabel: "August 1, 2026", sunday: false, op: "sub", lhs: ["BREAD","APPLE"], rhs: "PLAZA" },
  { num: 16, quizId: "cipher-8-2-26", live: "2026-08-02", dateLabel: "August 2, 2026", sunday: true, op: "add", lhs: ["SNOW","NOON","SOON"], rhs: "SLEET" },
  { num: 17, quizId: "cipher-8-3-26", live: "2026-08-03", dateLabel: "August 3, 2026", sunday: false, op: "sub", lhs: ["MANGO","LIME"], rhs: "MILE" },
  { num: 18, quizId: "cipher-8-4-26", live: "2026-08-04", dateLabel: "August 4, 2026", sunday: false, op: "add", lhs: ["GREEN","ORANGE"], rhs: "COLORS" },
  { num: 19, quizId: "cipher-8-5-26", live: "2026-08-05", dateLabel: "August 5, 2026", sunday: false, op: "sub", lhs: ["SHORE","FISH"], rhs: "FRIES" },
  { num: 20, quizId: "cipher-8-6-26", live: "2026-08-06", dateLabel: "August 6, 2026", sunday: false, op: "add", lhs: ["PARK","PLAZA"], rhs: "STREET" },
  { num: 21, quizId: "cipher-8-7-26", live: "2026-08-07", dateLabel: "August 7, 2026", sunday: false, op: "mul", lhs: ["RED","RED"], rhs: "BREAD" },
  { num: 22, quizId: "cipher-8-8-26", live: "2026-08-08", dateLabel: "August 8, 2026", sunday: false, op: "sub", lhs: ["WHALE","SALAD"], rhs: "SEED" },
  { num: 23, quizId: "cipher-8-9-26", live: "2026-08-09", dateLabel: "August 9, 2026", sunday: true, op: "add", lhs: ["SNOW","MOSS","TREE"], rhs: "ROOTS" },
  { num: 24, quizId: "cipher-8-10-26", live: "2026-08-10", dateLabel: "August 10, 2026", sunday: false, op: "sub", lhs: ["SHARK","BREAD"], rhs: "HORSE" },
  { num: 25, quizId: "cipher-8-11-26", live: "2026-08-11", dateLabel: "August 11, 2026", sunday: false, op: "add", lhs: ["APPLE","GRAPE"], rhs: "CHERRY" },
  { num: 26, quizId: "cipher-8-12-26", live: "2026-08-12", dateLabel: "August 12, 2026", sunday: false, op: "sub", lhs: ["SUGAR","TOAST"], rhs: "SONG" },
  { num: 27, quizId: "cipher-8-13-26", live: "2026-08-13", dateLabel: "August 13, 2026", sunday: false, op: "add", lhs: ["SATURN","URANUS"], rhs: "PLANETS" },
  { num: 28, quizId: "cipher-8-14-26", live: "2026-08-14", dateLabel: "August 14, 2026", sunday: false, op: "mul", lhs: ["DOG","RED"], rhs: "GREEN" },
  { num: 29, quizId: "cipher-8-15-26", live: "2026-08-15", dateLabel: "August 15, 2026", sunday: false, op: "sub", lhs: ["MONEY","LEMON"], rhs: "WOLF" },
  { num: 30, quizId: "cipher-8-16-26", live: "2026-08-16", dateLabel: "August 16, 2026", sunday: true, op: "add", lhs: ["SNOW","SOON","SEEN"], rhs: "GEESE" },
  { num: 31, quizId: "cipher-8-17-26", live: "2026-08-17", dateLabel: "August 17, 2026", sunday: false, op: "sub", lhs: ["ONION","APPLE"], rhs: "LANE" },
  { num: 32, quizId: "cipher-8-18-26", live: "2026-08-18", dateLabel: "August 18, 2026", sunday: false, op: "add", lhs: ["TUNE","SONG"], rhs: "NOTES" },
];
