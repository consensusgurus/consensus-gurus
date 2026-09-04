// Parker's solver: the shared sliding-block engine, bound to Parker's board.
//
// The rules, the bitboard search and the exact minimum all live in
// lib/jam-core.js, because Impound (app/impound) is the same puzzle on a 7x7
// board and a second copy of these rules would be a second answer to "what is
// perfect here". This file is the six-by-six binding and nothing else: it exists
// so that ParkerClient.jsx and scripts/verify-parker.mjs keep the exact
// call signatures they already had, with no board size to pass and no chance of
// passing the wrong one.
//
// PARKER IS SIX BY SIX WITH THE EXIT ON ROW 2, and that is frozen. Every banked
// board, every stored par and every leaderboard row behind them assumes it. A
// bigger Parker is a DIFFERENT GAME with its own key, its own bank and its own
// route, which is what Impound is; it is not a new value for N here.

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

export const N = 6;
export const EXIT_ROW = 2;

export const cells = jamCells;
export const grid = (ps) => jamGrid(ps, N);
export const moves = (ps) => jamMoves(ps, N);
export const solved = (ps) => jamSolved(ps, N);
export const solve = (ps, cap) => jamSolve(ps, N, cap);
export const exitOpen = (ps) => jamExitOpen(ps, N);

export { key, apply, fromData, toData, signature };
