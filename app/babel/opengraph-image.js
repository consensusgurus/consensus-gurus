import { renderBabelCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Babel — the daily Scrabble endgame from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one endgame a day, same look): render the Babel snapshot card
// once. Satori draws it from a neutral demo rack and board so it never spoils
// today's position.
export default async function Image() {
  return renderBabelCard()
}
