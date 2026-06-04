// Hero photos for the top-3 tiles on the list overview page.
// Key: list ID -> item name (exact string, parenthetical included) -> path
// under /public. Images are pre-optimized WebP (~640px wide, quality ~72,
// roughly 25-60KB each) and rendered with loading="lazy" decoding="async",
// so they cost almost nothing in memory or bandwidth until scrolled into view.
export const HERO_IMAGES = {
  