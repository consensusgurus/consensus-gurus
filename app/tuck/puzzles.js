// Puzzle data for Tuck, the daily tile-tucking word game. Imported ONLY by the
// server page (app/tuck/page.js), which filters live<=today before passing
// puzzles to the client — future racks never ship to the browser.
//
// Each day is a RACK of 14 letters (Scrabble-weighted bag, 4-6 vowels) plus a
// PAR: a score our ladder solver actually achieved on that rack, so every par
// is provably beatable. Racks are rerolled at authoring time until par >= 45.
// Validate with scripts/verify-tuck.mjs after ANY edit (it recomputes par from
// public/tuck-dict.txt and fails if a stored par is not achievable).
export const PUZZLES = [
  { num: 1, quizId: "tuck-7-18-26", live: "2026-07-18", dateLabel: "July 18, 2026", sunday: false, letters: ["N","I","B","F","E","Q","L","E","M","J","E","S","U","L"], par: 59 },
  { num: 2, quizId: "tuck-7-19-26", live: "2026-07-19", dateLabel: "July 19, 2026", sunday: false, letters: ["E","B","S","B","I","S","O","L","E","M","R","S","Z","E"], par: 52 },
  { num: 3, quizId: "tuck-7-20-26", live: "2026-07-20", dateLabel: "July 20, 2026", sunday: false, letters: ["U","F","N","R","R","P","I","A","Q","D","W","T","R","U"], par: 54 },
  { num: 4, quizId: "tuck-7-21-26", live: "2026-07-21", dateLabel: "July 21, 2026", sunday: false, letters: ["D","Y","N","U","O","E","J","K","A","N","A","R","A","H"], par: 59 },
  { num: 5, quizId: "tuck-7-22-26", live: "2026-07-22", dateLabel: "July 22, 2026", sunday: false, letters: ["D","S","G","N","B","R","Y","D","R","A","O","U","Q","E"], par: 49 },
  { num: 6, quizId: "tuck-7-23-26", live: "2026-07-23", dateLabel: "July 23, 2026", sunday: false, letters: ["I","H","W","B","S","A","F","N","I","R","L","M","I","T"], par: 46 },
  { num: 7, quizId: "tuck-7-24-26", live: "2026-07-24", dateLabel: "July 24, 2026", sunday: false, letters: ["P","T","R","R","R","A","W","G","A","U","E","L","R","X"], par: 47 },
  { num: 8, quizId: "tuck-7-25-26", live: "2026-07-25", dateLabel: "July 25, 2026", sunday: false, letters: ["C","W","L","Y","A","Z","E","F","E","U","N","H","R","U"], par: 66 },
  { num: 9, quizId: "tuck-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: true, letters: ["A","I","C","C","E","Y","Z","O","V","B","D","R","T","E","U"], par: 62 },
  { num: 10, quizId: "tuck-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false, letters: ["P","W","B","A","Z","I","X","A","E","T","I","E","N","N"], par: 62 },
  { num: 11, quizId: "tuck-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false, letters: ["Y","D","I","E","N","E","F","T","M","A","V","I","R","T"], par: 45 },
  { num: 12, quizId: "tuck-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false, letters: ["I","J","A","E","E","R","S","F","L","M","F","H","O","A"], par: 55 },
  { num: 13, quizId: "tuck-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false, letters: ["I","I","I","U","B","I","W","A","T","M","H","C","H","Q"], par: 63 },
  { num: 14, quizId: "tuck-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false, letters: ["C","S","D","R","E","I","A","E","L","Q","G","H","E","G"], par: 52 },
  { num: 15, quizId: "tuck-8-1-26", live: "2026-08-01", dateLabel: "August 1, 2026", sunday: false, letters: ["T","O","E","S","M","A","H","S","U","E","Q","I","S","G"], par: 54 },
  { num: 16, quizId: "tuck-8-2-26", live: "2026-08-02", dateLabel: "August 2, 2026", sunday: true, letters: ["R","E","T","A","I","L","S","O","N","D","B","U","C","G","E"], par: 38 },
  { num: 17, quizId: "tuck-8-3-26", live: "2026-08-03", dateLabel: "August 3, 2026", sunday: false, letters: ["R","E","T","A","I","L","S","O","N","D","B","U","C","G"], par: 37 },
  { num: 18, quizId: "tuck-8-4-26", live: "2026-08-04", dateLabel: "August 4, 2026", sunday: false, letters: ["A","E","I","O","U","R","S","T","N","L","D","K","P","Z"], par: 56 },
  { num: 19, quizId: "tuck-8-5-26", live: "2026-08-05", dateLabel: "August 5, 2026", sunday: false, letters: ["E","A","O","I","B","G","H","K","L","N","R","S","T","W"], par: 47 },
  { num: 20, quizId: "tuck-8-6-26", live: "2026-08-06", dateLabel: "August 6, 2026", sunday: false, letters: ["A","E","E","I","O","F","M","P","R","S","T","V","Y","D"], par: 49 },
  { num: 21, quizId: "tuck-8-7-26", live: "2026-08-07", dateLabel: "August 7, 2026", sunday: false, letters: ["A","A","E","I","U","C","H","K","L","N","R","T","Z","S"], par: 58 },
  { num: 22, quizId: "tuck-8-8-26", live: "2026-08-08", dateLabel: "August 8, 2026", sunday: false, letters: ["E","O","U","A","B","D","K","G","L","M","N","R","S","T"], par: 43 },
  { num: 23, quizId: "tuck-8-9-26", live: "2026-08-09", dateLabel: "August 9, 2026", sunday: true, letters: ["A","E","I","O","U","E","B","K","D","L","M","N","R","S","W"], par: 49 },
  { num: 24, quizId: "tuck-8-10-26", live: "2026-08-10", dateLabel: "August 10, 2026", sunday: false, letters: ["I","O","U","E","A","J","K","P","R","S","T","L","N","D"], par: 52 },
  { num: 25, quizId: "tuck-8-11-26", live: "2026-08-11", dateLabel: "August 11, 2026", sunday: false, letters: ["A","E","E","O","B","C","D","H","N","T","V","W","Y","Z"], par: 64 },
  { num: 26, quizId: "tuck-8-12-26", live: "2026-08-12", dateLabel: "August 12, 2026", sunday: false, letters: ["E","I","I","O","U","C","D","K","N","N","P","T","V","Y"], par: 49 },
  { num: 27, quizId: "tuck-8-13-26", live: "2026-08-13", dateLabel: "August 13, 2026", sunday: false, letters: ["A","A","A","A","E","O","F","G","L","M","N","N","Q","R"], par: 47 },
  { num: 28, quizId: "tuck-8-14-26", live: "2026-08-14", dateLabel: "August 14, 2026", sunday: false, letters: ["A","E","I","I","O","D","H","H","K","M","S","S","S","T"], par: 47 },
  { num: 29, quizId: "tuck-8-15-26", live: "2026-08-15", dateLabel: "August 15, 2026", sunday: false, letters: ["A","A","A","U","U","U","C","F","F","H","S","V","W","W"], par: 53 },
  { num: 30, quizId: "tuck-8-16-26", live: "2026-08-16", dateLabel: "August 16, 2026", sunday: true, letters: ["A","E","I","I","O","O","U","D","G","H","K","L","N","N","Z"], par: 60 },
  { num: 31, quizId: "tuck-8-17-26", live: "2026-08-17", dateLabel: "August 17, 2026", sunday: false, letters: ["A","A","A","E","D","F","G","L","N","R","R","T","V","Z"], par: 53 },
  { num: 32, quizId: "tuck-8-18-26", live: "2026-08-18", dateLabel: "August 18, 2026", sunday: false, letters: ["E","I","I","O","B","G","H","J","M","R","S","S","T","Y"], par: 54 },
  { num: 33, quizId: "tuck-8-19-26", live: "2026-08-19", dateLabel: "August 19, 2026", sunday: false, letters: ["A","A","A","O","O","B","C","D","F","L","M","R","V","W"], par: 49 },
  { num: 34, quizId: "tuck-8-20-26", live: "2026-08-20", dateLabel: "August 20, 2026", sunday: false, letters: ["A","E","E","I","U","B","D","D","G","J","K","R","R","Y"], par: 57 },
  { num: 35, quizId: "tuck-8-21-26", live: "2026-08-21", dateLabel: "August 21, 2026", sunday: false, letters: ["A","E","I","I","O","D","D","G","H","K","L","N","Q","W"], par: 56 },
  { num: 36, quizId: "tuck-8-22-26", live: "2026-08-22", dateLabel: "August 22, 2026", sunday: false, letters: ["E","E","I","O","U","B","C","C","D","J","M","N","S","W"], par: 56 },
  { num: 37, quizId: "tuck-8-23-26", live: "2026-08-23", dateLabel: "August 23, 2026", sunday: true, letters: ["A","A","E","I","O","U","D","F","P","P","R","S","T","T","Y"], par: 46 },
  { num: 38, quizId: "tuck-8-24-26", live: "2026-08-24", dateLabel: "August 24, 2026", sunday: false, letters: ["A","E","E","I","I","O","C","H","J","M","M","R","S","T"], par: 53 },
  { num: 39, quizId: "tuck-8-25-26", live: "2026-08-25", dateLabel: "August 25, 2026", sunday: false, letters: ["A","O","O","O","U","H","K","P","P","R","R","R","S","V"], par: 47 },
  { num: 40, quizId: "tuck-8-26-26", live: "2026-08-26", dateLabel: "August 26, 2026", sunday: false, letters: ["A","E","I","I","I","U","C","F","J","P","R","S","T","V"], par: 53 },
  { num: 41, quizId: "tuck-8-27-26", live: "2026-08-27", dateLabel: "August 27, 2026", sunday: false, letters: ["A","E","O","O","O","C","C","D","F","L","R","T","T","X"], par: 52 },
  { num: 42, quizId: "tuck-8-28-26", live: "2026-08-28", dateLabel: "August 28, 2026", sunday: false, letters: ["A","E","E","U","B","C","C","F","G","K","R","R","T","W"], par: 51 },
  { num: 43, quizId: "tuck-8-29-26", live: "2026-08-29", dateLabel: "August 29, 2026", sunday: false, letters: ["A","I","O","O","O","U","B","B","D","D","F","P","P","T"], par: 45 },
  { num: 44, quizId: "tuck-8-30-26", live: "2026-08-30", dateLabel: "August 30, 2026", sunday: true, letters: ["A","A","I","I","I","I","O","F","K","L","L","M","N","P","W"], par: 49 },
];
