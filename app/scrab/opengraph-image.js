import { renderScrabCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Scrab — the daily Scrabble endgame from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one endgame a day, same look): render the Scrab snapshot card
// once. Satori draws it from a neutral demo rack and board so it never spoils
// today's position.
export default async function Image() {
  return renderScrabCard()
}
