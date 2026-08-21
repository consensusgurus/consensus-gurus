// Puzzle data for Queen, the daily king-and-pawn promotion endgame. Imported
// ONLY by the server page (app/queen/page.js), which filters live<=today and
// STRIPS keyUci/keySan before handing boards to the client, so neither
// tomorrow's position nor any day's key move ever ships to the browser.
//
// Each puzzle is a position with WHITE TO MOVE: a king and one pawn against a
// bare king, with a tablebase-proven promotion in exactly `winIn` White moves.
//
//   fen      full FEN. Only K, P and k ever appear; castling and en passant are
//            structurally impossible and the engine (app/queen/kpk.js) plays
//            the position perfectly from a per-file tablebase built in the
//            browser.
//   winIn    White's whole budget, in White moves. EXACTLY ONE first move
//            preserves the win inside it; at least two of the alternatives
//            throw the win away outright (a draw, not a slower win). Winning
//            means promoting SAFELY: a queen the Black king can take back, or a
//            push that delivers stalemate, is the draw it deserves to be.
//   keyUci / keySan  the key move, for the verifier and the reveal-to-solvers
//            line. Stripped server-side, never sent to the browser.
//
// Weekday ramp (win in N White moves): Mon 5, Tue 6, Wed 7, Thu 8, Fri 8,
// Sat 9, and the Sunday Edition at 12, the long walk. Bank rules, all enforced
// by scripts/verify-queen.mjs with its own independent solver: exact winIn,
// unique key, at least two outright refutations, at least four legal first
// moves, no duplicate positions, a pawn file at most 8 times per bank and never
// twice running, and roughly a third of the keys pawn moves.
export const PUZZLES = [
  { num: 1, quizId: 'queen-8-21-26', live: '2026-08-21', dateLabel: 'August 21, 2026', sunday: false, winIn: 8, fen: '5k2/8/7K/8/8/8/5P2/8 w - - 0 1', keyUci: 'h6g6', keySan: 'Kg6' },
  { num: 2, quizId: 'queen-8-22-26', live: '2026-08-22', dateLabel: 'August 22, 2026', sunday: false, winIn: 9, fen: '8/7k/5K2/8/8/6P1/8/8 w - - 0 1', keyUci: 'g3g4', keySan: 'g4' },
  { num: 3, quizId: 'queen-8-23-26', live: '2026-08-23', dateLabel: 'August 23, 2026', sunday: true, winIn: 12, fen: '8/8/2k5/8/8/5P2/4K3/8 w - - 0 1', keyUci: 'e2e3', keySan: 'Ke3' },
  { num: 4, quizId: 'queen-8-24-26', live: '2026-08-24', dateLabel: 'August 24, 2026', sunday: false, winIn: 5, fen: 'k7/8/1K6/8/4P3/8/8/8 w - - 0 1', keyUci: 'b6c7', keySan: 'Kc7' },
  { num: 5, quizId: 'queen-8-25-26', live: '2026-08-25', dateLabel: 'August 25, 2026', sunday: false, winIn: 6, fen: '6K1/8/8/8/8/8/6P1/5k2 w - - 0 1', keyUci: 'g2g4', keySan: 'g4' },
  { num: 6, quizId: 'queen-8-26-26', live: '2026-08-26', dateLabel: 'August 26, 2026', sunday: false, winIn: 7, fen: '2k5/8/8/1K2P3/8/8/8/8 w - - 0 1', keyUci: 'b5c6', keySan: 'Kc6' },
  { num: 7, quizId: 'queen-8-27-26', live: '2026-08-27', dateLabel: 'August 27, 2026', sunday: false, winIn: 8, fen: '2k5/8/8/5P2/8/4K3/8/8 w - - 0 1', keyUci: 'e3f4', keySan: 'Kf4' },
  { num: 8, quizId: 'queen-8-28-26', live: '2026-08-28', dateLabel: 'August 28, 2026', sunday: false, winIn: 8, fen: '8/8/1K6/8/5k2/3P4/8/8 w - - 0 1', keyUci: 'd3d4', keySan: 'd4' },
  { num: 9, quizId: 'queen-8-29-26', live: '2026-08-29', dateLabel: 'August 29, 2026', sunday: false, winIn: 9, fen: '3k4/8/8/4K3/8/1P6/8/8 w - - 0 1', keyUci: 'e5d6', keySan: 'Kd6' },
  { num: 10, quizId: 'queen-8-30-26', live: '2026-08-30', dateLabel: 'August 30, 2026', sunday: true, winIn: 12, fen: '8/7k/8/8/8/8/2P5/6K1 w - - 0 1', keyUci: 'g1f2', keySan: 'Kf2' },
  { num: 11, quizId: 'queen-8-31-26', live: '2026-08-31', dateLabel: 'August 31, 2026', sunday: false, winIn: 5, fen: '8/8/8/8/1K6/8/6Pk/8 w - - 0 1', keyUci: 'g2g4', keySan: 'g4' },
  { num: 12, quizId: 'queen-9-1-26', live: '2026-09-01', dateLabel: 'September 1, 2026', sunday: false, winIn: 6, fen: '4k3/8/8/2K5/3P4/8/8/8 w - - 0 1', keyUci: 'c5d6', keySan: 'Kd6' },
  { num: 13, quizId: 'queen-9-2-26', live: '2026-09-02', dateLabel: 'September 2, 2026', sunday: false, winIn: 7, fen: '8/K7/8/3k4/8/8/P7/8 w - - 0 1', keyUci: 'a7b6', keySan: 'Kb6' },
  { num: 14, quizId: 'queen-9-3-26', live: '2026-09-03', dateLabel: 'September 3, 2026', sunday: false, winIn: 8, fen: '8/8/8/2K5/8/8/1kP5/8 w - - 0 1', keyUci: 'c2c4', keySan: 'c4' },
  { num: 15, quizId: 'queen-9-4-26', live: '2026-09-04', dateLabel: 'September 4, 2026', sunday: false, winIn: 8, fen: '8/5k2/8/8/1P6/4K3/8/8 w - - 0 1', keyUci: 'e3d4', keySan: 'Kd4' },
  { num: 16, quizId: 'queen-9-5-26', live: '2026-09-05', dateLabel: 'September 5, 2026', sunday: false, winIn: 9, fen: '4k3/8/3K4/8/6P1/8/8/8 w - - 0 1', keyUci: 'd6e6', keySan: 'Ke6' },
  { num: 17, quizId: 'queen-9-6-26', live: '2026-09-06', dateLabel: 'September 6, 2026', sunday: true, winIn: 12, fen: '8/8/1k6/8/1K6/8/1P6/8 w - - 0 1', keyUci: 'b2b3', keySan: 'b3' },
  { num: 18, quizId: 'queen-9-7-26', live: '2026-09-07', dateLabel: 'September 7, 2026', sunday: false, winIn: 5, fen: '8/8/6K1/8/6Pk/8/8/8 w - - 0 1', keyUci: 'g6f5', keySan: 'Kf5' },
  { num: 19, quizId: 'queen-9-8-26', live: '2026-09-08', dateLabel: 'September 8, 2026', sunday: false, winIn: 6, fen: '8/8/6K1/8/8/6k1/3P4/8 w - - 0 1', keyUci: 'g6f5', keySan: 'Kf5' },
  { num: 20, quizId: 'queen-9-9-26', live: '2026-09-09', dateLabel: 'September 9, 2026', sunday: false, winIn: 7, fen: 'k7/4K3/8/8/8/2P5/8/8 w - - 0 1', keyUci: 'c3c4', keySan: 'c4' },
  { num: 21, quizId: 'queen-9-10-26', live: '2026-09-10', dateLabel: 'September 10, 2026', sunday: false, winIn: 8, fen: 'k7/8/8/8/3P4/5K2/8/8 w - - 0 1', keyUci: 'f3e4', keySan: 'Ke4' },
  { num: 22, quizId: 'queen-9-11-26', live: '2026-09-11', dateLabel: 'September 11, 2026', sunday: false, winIn: 8, fen: '8/8/8/8/P2k4/K7/8/8 w - - 0 1', keyUci: 'a3b4', keySan: 'Kb4' },
  { num: 23, quizId: 'queen-9-12-26', live: '2026-09-12', dateLabel: 'September 12, 2026', sunday: false, winIn: 9, fen: '8/8/3k4/1K6/8/8/2P5/8 w - - 0 1', keyUci: 'c2c4', keySan: 'c4' },
  { num: 24, quizId: 'queen-9-13-26', live: '2026-09-13', dateLabel: 'September 13, 2026', sunday: true, winIn: 12, fen: '8/2k5/8/8/1K6/8/5P2/8 w - - 0 1', keyUci: 'b4c5', keySan: 'Kc5' },
  { num: 25, quizId: 'queen-9-14-26', live: '2026-09-14', dateLabel: 'September 14, 2026', sunday: false, winIn: 5, fen: '8/K2k4/8/8/P7/8/8/8 w - - 0 1', keyUci: 'a7b7', keySan: 'Kb7' },
  { num: 26, quizId: 'queen-9-15-26', live: '2026-09-15', dateLabel: 'September 15, 2026', sunday: false, winIn: 6, fen: '8/2K1k3/8/8/8/8/2P5/8 w - - 0 1', keyUci: 'c2c4', keySan: 'c4' },
  { num: 27, quizId: 'queen-9-16-26', live: '2026-09-16', dateLabel: 'September 16, 2026', sunday: false, winIn: 7, fen: '1k6/8/8/8/3P1K2/8/8/8 w - - 0 1', keyUci: 'f4e5', keySan: 'Ke5' },
  { num: 28, quizId: 'queen-9-17-26', live: '2026-09-17', dateLabel: 'September 17, 2026', sunday: false, winIn: 8, fen: '8/8/8/8/1P2k3/2K5/8/8 w - - 0 1', keyUci: 'c3c4', keySan: 'Kc4' },
  { num: 29, quizId: 'queen-9-18-26', live: '2026-09-18', dateLabel: 'September 18, 2026', sunday: false, winIn: 8, fen: '8/8/4K3/8/k7/8/2P5/8 w - - 0 1', keyUci: 'c2c4', keySan: 'c4' },
  { num: 30, quizId: 'queen-9-19-26', live: '2026-09-19', dateLabel: 'September 19, 2026', sunday: false, winIn: 9, fen: '8/k7/8/8/4P3/8/7K/8 w - - 0 1', keyUci: 'h2g3', keySan: 'Kg3' },
  { num: 31, quizId: 'queen-9-20-26', live: '2026-09-20', dateLabel: 'September 20, 2026', sunday: true, winIn: 12, fen: '8/2k5/8/8/8/3P1K2/8/8 w - - 0 1', keyUci: 'f3e4', keySan: 'Ke4' },
  { num: 32, quizId: 'queen-9-21-26', live: '2026-09-21', dateLabel: 'September 21, 2026', sunday: false, winIn: 5, fen: '8/8/1K6/8/8/8/k1P5/8 w - - 0 1', keyUci: 'c2c4', keySan: 'c4' },
  { num: 33, quizId: 'queen-9-22-26', live: '2026-09-22', dateLabel: 'September 22, 2026', sunday: false, winIn: 6, fen: '8/8/8/1K2k3/8/P7/8/8 w - - 0 1', keyUci: 'b5c6', keySan: 'Kc6' },
  { num: 34, quizId: 'queen-9-23-26', live: '2026-09-23', dateLabel: 'September 23, 2026', sunday: false, winIn: 7, fen: '4k3/8/8/3K2P1/8/8/8/8 w - - 0 1', keyUci: 'd5e6', keySan: 'Ke6' },
  { num: 35, quizId: 'queen-9-24-26', live: '2026-09-24', dateLabel: 'September 24, 2026', sunday: false, winIn: 8, fen: '8/8/8/8/1K6/2Pk4/8/8 w - - 0 1', keyUci: 'c3c4', keySan: 'c4' },
  { num: 36, quizId: 'queen-9-25-26', live: '2026-09-25', dateLabel: 'September 25, 2026', sunday: false, winIn: 8, fen: '8/8/8/1k6/4P3/5K2/8/8 w - - 0 1', keyUci: 'f3f4', keySan: 'Kf4' },
  { num: 37, quizId: 'queen-9-26-26', live: '2026-09-26', dateLabel: 'September 26, 2026', sunday: false, winIn: 9, fen: '8/7k/8/4K3/8/8/6P1/8 w - - 0 1', keyUci: 'e5f6', keySan: 'Kf6' },
  { num: 38, quizId: 'queen-9-27-26', live: '2026-09-27', dateLabel: 'September 27, 2026', sunday: true, winIn: 12, fen: '8/6k1/8/8/8/6K1/5P2/8 w - - 0 1', keyUci: 'g3f4', keySan: 'Kf4' },
  { num: 39, quizId: 'queen-9-28-26', live: '2026-09-28', dateLabel: 'September 28, 2026', sunday: false, winIn: 5, fen: '8/6k1/4P3/8/5K2/8/8/8 w - - 0 1', keyUci: 'f4e5', keySan: 'Ke5' },
  { num: 40, quizId: 'queen-9-29-26', live: '2026-09-29', dateLabel: 'September 29, 2026', sunday: false, winIn: 6, fen: '8/7K/8/8/4k3/8/7P/8 w - - 0 1', keyUci: 'h7g6', keySan: 'Kg6' },
  { num: 41, quizId: 'queen-9-30-26', live: '2026-09-30', dateLabel: 'September 30, 2026', sunday: false, winIn: 7, fen: '8/8/1K6/8/8/1P6/k7/8 w - - 0 1', keyUci: 'b3b4', keySan: 'b4' },
  { num: 42, quizId: 'queen-10-1-26', live: '2026-10-01', dateLabel: 'October 1, 2026', sunday: false, winIn: 8, fen: '8/8/2k5/8/3K4/8/7P/8 w - - 0 1', keyUci: 'd4e5', keySan: 'Ke5' },
  { num: 43, quizId: 'queen-10-2-26', live: '2026-10-02', dateLabel: 'October 2, 2026', sunday: false, winIn: 8, fen: '8/4k3/8/8/2KP4/8/8/8 w - - 0 1', keyUci: 'c4c5', keySan: 'Kc5' },
  { num: 44, quizId: 'queen-10-3-26', live: '2026-10-03', dateLabel: 'October 3, 2026', sunday: false, winIn: 9, fen: '8/8/4k3/6K1/8/5P2/8/8 w - - 0 1', keyUci: 'f3f4', keySan: 'f4' },
  { num: 45, quizId: 'queen-10-4-26', live: '2026-10-04', dateLabel: 'October 4, 2026', sunday: true, winIn: 12, fen: '8/4k3/8/8/8/5K2/6P1/8 w - - 0 1', keyUci: 'f3g4', keySan: 'Kg4' },
];
