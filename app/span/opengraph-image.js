import { renderGameCard, gameCardAlt } from '@/lib/og-stage-cards'

export const runtime = 'nodejs'
export const alt = gameCardAlt('span')
export { size, contentType } from '@/lib/og-stage-cards'

// The card is a hue and a glyph off this game's row in lib/daily-games.js, so
// there is nothing here to keep in step with the board. Every other game is
// baked to public/og/ by scripts/bake-og.mjs and pointed at from page.js
// metadata; these four kept live routes and can stay that way.
export default async function Image() {
  return renderGameCard('span')
}
