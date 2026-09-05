// Junkyard's solver: the shared sliding-block engine, bound to Junkyard's board.
//
// The rules, the bitboard search and the exact minimum all live in
// lib/jam-core.js, which Parker (6x6) and Impound (7x7) bind the same way. This
// file is the eight-by-eight binding and nothing else: it exists so that
// JunkyardClient.jsx and scripts/verify-junkyard.mjs keep call signatures with
// no board size to pass and no chance of passing the wrong one.
//
// JUNKYARD IS EIGHT BY EIGHT WITH THE EXIT ON ROW 4, and that is frozen. Every
// banked board, every stored par and every leaderboard row behind them assumes
// it. Eight by eight is also the LARGEST this family can ever go: jam-core packs
// occupancy into two 32-bit words, so 64 cells is the ceiling, and it throws
// rather than silently truncating past it.
//
// WHY ROW 4 RATHER THAN ROW 3. An even board has no true middle rank, so the
// exit lane has to lean one way. Parker's row 2 on a 6x6 leaves two ranks above
// and three below; row 4 here leaves four above and three below, the opposite
// lean, so the two even-sided boards in the family do not jam the same way.
// Impound, being odd, sits on its true middle and leans neither way.

import {
  cells as jamCells,
  grid as jamGrid,
  moves as jamMoves,
  solved as jamSolved,
  solve as jamSolve,
  exitOpen as jamExitOpen,
  key,
  apply,
  fromData,
  toData,
  signature,
} from '../../lib/jam-core.js';

export const N = 8;
export const EXIT_ROW = 4;

export const cells = jamCells;
export const grid = (ps) => jamGrid(ps, N);
export const moves = (ps) => jamMoves(ps, N);
export const solved = (ps) => jamSolved(ps, N);
export const solve = (ps, cap) => jamSolve(ps, N, cap);
export const exitOpen = (ps) => jamExitOpen(ps, N);

export { key, apply, fromData, toData, signature };
