// The Loft format flag.
//
// Two ways in, both explicit:
//
//   1. A ROUTE can opt in by passing `loft` down (app/new-daily-preview does
//      this). That is how the preview shows the new format while the game's
//      own URL keeps the old one, so /crux is untouched for every player.
//   2. A SLUG can opt in by being listed here, which is how the rollout would
//      actually ship, one line per game.
//
// LOFT_GAMES is deliberately EMPTY: nothing is live on the new format yet.
export const LOFT_GAMES = new Set();

export function isLoft(slug) {
  return !!slug && LOFT_GAMES.has(slug);
}
