// Impound's solver: the shared sliding-block engine, bound to Impound's board.
//
// The rules, the bitboard search and the exact minimum all live in
// lib/jam-core.js, which Parker (app/parker/solver.js) binds to its own six by
// six. This file is the seven-by-seven binding and nothing else, so
// ImpoundClient.jsx and scripts/verify-impound.mjs never pass a board size and
// therefore can never pass the wrong one.
//
// SEVEN BY SEVEN WITH THE EXIT ON ROW 3. Seven is odd, so unlike Parker's 6x6
// the exit lane is the true middle rank of the lot, with three ranks of traffic
// above it and three below. That symmetry is the point of the size rather than a
// side effect of it: on Parker the exit sits one off centre, so the half of the
// board below it is always the deeper half and the jams lean the same way every
// day.
//
// WHY NOT EIGHT. Measured before the size was chosen: at 7x7 the whole reachable
// state space of a random board at this density is a few thousand states in the
// median case, and the search reaches par 42. At 8x8 a 400-board sample did not
// finish in ten minutes, because the space grows faster than the difficulty does
// and the verifier has to re-solve every banked board from scratch. Seven is
// where the ladder is long and the proof stays cheap.

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

export const N = 7;
export const EXIT_ROW = 3;

export const cells = jamCells;
export const grid = (ps) => jamGrid(ps, N);
export const moves = (ps) => jamMoves(ps, N);
export const solved = (ps) => jamSolved(ps, N);
export const solve = (ps, cap) => jamSolve(ps, N, cap);
export const exitOpen = (ps) => jamExitOpen(ps, N);

export { key, apply, fromData, toData, signature };
