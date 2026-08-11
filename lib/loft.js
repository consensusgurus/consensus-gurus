// The Loft format rollout flag.
//
// Adding a slug here switches that daily page to the Loft chrome: the compact
// brand bar, the blue cap carrying the game's live figures, no selector ribbon
// (puzzle selection moves below the board), and the navy play stage with the
// board as the one light object on screen.
//
// Everything is per-slug on purpose. A game not listed here renders exactly as
// it did before, so the rollout is one line per game and the blast radius of a
// mistake is one game.
export const LOFT_GAMES = new Set(['crux']);

export function isLoft(slug) {
  return !!slug && LOFT_GAMES.has(slug);
}
