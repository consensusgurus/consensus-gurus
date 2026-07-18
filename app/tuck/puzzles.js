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
  { num: 9, quizId: "tuck-7-26-26", live: "2026-07-26", dateLabel: "July 26, 2026", sunday: false, letters: ["T","I","V","R","O","J","Q","D","L","B","O","E","E","N"], par: 56 },
  { num: 10, quizId: "tuck-7-27-26", live: "2026-07-27", dateLabel: "July 27, 2026", sunday: false, letters: ["P","W","B","A","Z","I","X","A","E","T","I","E","N","N"], par: 62 },
  { num: 11, quizId: "tuck-7-28-26", live: "2026-07-28", dateLabel: "July 28, 2026", sunday: false, letters: ["Y","D","I","E","N","E","F","T","M","A","V","I","R","T"], par: 45 },
  { num: 12, quizId: "tuck-7-29-26", live: "2026-07-29", dateLabel: "July 29, 2026", sunday: false, letters: ["I","J","A","E","E","R","S","F","L","M","F","H","O","A"], par: 55 },
  { num: 13, quizId: "tuck-7-30-26", live: "2026-07-30", dateLabel: "July 30, 2026", sunday: false, letters: ["I","I","I","U","B","I","W","A","T","M","H","C","H","Q"], par: 63 },
  { num: 14, quizId: "tuck-7-31-26", live: "2026-07-31", dateLabel: "July 31, 2026", sunday: false, letters: ["C","S","D","R","E","I","A","E","L","Q","G","H","E","G"], par: 52 },
];
