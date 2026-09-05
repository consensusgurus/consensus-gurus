// Par vs Perfect — the shared target model for the exactly-solved dailies.
//
// Every banked board on Parker, Impound, Junkyard, Rung and Taire carries the exact solver
// minimum. Until 2026-07-31 that number was shown to players as "par", which
// read backwards: in golf par is what an ordinary round lands on, not the best
// line that exists on the course. So the minimum is now called PERFECT, and PAR
// is a cushioned target above it that a good-but-not-flawless solve reaches.
//
// The cushion scales with the board so par means the same thing on a twelve
// move Tuesday and a thirty-eight move Sunday, and the penalty step scales with
// it in turn. The arithmetic is arranged so that, on every board:
//
//   perfect       -> 10 / 10
//   par           ->  8 / 10
//   par + step    ->  7 / 10, and on down to a floor of 1
//
// The cushion is a quarter over the minimum, rounded to an even number so the
// step is a whole number of moves, and never less than four.
//
// SCOPE: this model belongs to Parker, Impound, Junkyard, Rung and Taire, whose par stands in for
// an ordinary round. Span, Tuck and Babel do NOT use it. Their targets are a
// proven minimum (Span calls it perfect) or a solver mark to beat (Tuck and
// Babel call it a benchmark), and neither is an average, so neither is a par.

export function cushionFor(perfect) {
  const p = Math.max(0, Number(perfect) || 0);
  return Math.max(4, 2 * Math.round((p * 0.25) / 2));
}

export function stepFor(perfect) {
  return cushionFor(perfect) / 2;
}

export function parFor(perfect) {
  return (Number(perfect) || 0) + cushionFor(perfect);
}

// 10 at perfect, 8 at par, one point per step over, floor of 1. Finishing
// always beats walking away.
export function scoreFor(used, perfect) {
  const over = Math.max(0, (Number(used) || 0) - (Number(perfect) || 0));
  return Math.max(1, Math.min(10, 10 - Math.floor(over / stepFor(perfect))));
}
