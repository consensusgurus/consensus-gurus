// Puzzle data for Cipher, the daily cryptarithm. Imported ONLY by the server
// page (app/cipher/page.js), which filters live<=today before passing puzzles
// to the client — future equations never ship early.
//
// Every equation here is MACHINE-VERIFIED to have exactly one solution
// (distinct digits per letter, leading letters nonzero). The solution is not
// stored anywhere — the client checks the arithmetic directly. Validate with
// scripts/verify-cipher.mjs after ANY edit: it brute-forces every equation and
// fails unless each has exactly one solution and <= 10 distinct letters.
export const PUZZLES = [
  { num: 1, quizId: "cipher-7-18-26", live: "2026-07-18", dateLabel: "July 18, 2026", sunday: false, lhs: ["SEND","MORE"], rhs: "MONEY" },
  { num: 2, quizId: "cipher-7-19-26", live: "2026-07-19", dateLabel: "July 19, 2026", sunday: false, lhs: ["FIFTY","STATES"], rhs: "AMERICA" },
  { num: 3, quizId: "cipher-7-20-26", live: "2026-07-20", dateLabel: "July 20, 2026", sunday: false, lhs: ["EAT","THAT"], rhs: "APPLE" },
  { num: 4, quizId: "cipher-7-21-26", live: "2026-07-21", dateLabel: "July 21, 2026", sunday: false, lhs: ["BASE","BALL"], rhs: "GAMES" },
  { num: 5, quizId: "cipher-7-22-26", live: "2026-07-22", dateLabel: "July 22, 2026", sunday: false, lhs: ["SEA","REEF"], rhs: "WHALE" },
  { num: 6, quizId: "cipher-7-23-26", live: "2026-07-23", dateLabel: "July 23, 2026", sunday: false, lhs: ["COCA","COLA"], rhs: "OASIS" },
  { num: 7, quizId: "cipher-7-24-26", live: "2026-07-24", dateLabel: "July 24, 2026", sunday: false, lhs: ["BEAR","DEER"], rhs: "ZEBRA" },
  { num: 8, quizId: "cipher-7-25-26", live: "2026-07-25", dateLabel: "July 25, 2026", sunday: false, lhs: ["CROSS","ROADS"], rhs: "DANGER" },
  { num: 9, quizId: "cipher-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: true, lhs: ["SNOW","MOON","NOON"], rhs: "STORM" },
  { num: 10, quizId: "cipher-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false, lhs: ["MIST","FROST"], rhs: "WINTER" },
  { num: 11, quizId: "cipher-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false, lhs: ["GREEN","ORANGE"], rhs: "COLORS" },
  { num: 12, quizId: "cipher-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false, lhs: ["PARK","PLAZA"], rhs: "STREET" },
  { num: 13, quizId: "cipher-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false, lhs: ["APPLE","GRAPE"], rhs: "CHERRY" },
  { num: 14, quizId: "cipher-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false, lhs: ["SATURN","URANUS"], rhs: "PLANETS" },
  { num: 15, quizId: "cipher-8-1-26", live: "2026-08-01", dateLabel: "August 1, 2026", sunday: false, lhs: ["TUNE","SONG"], rhs: "NOTES" },
];
