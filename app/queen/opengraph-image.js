import { renderQueenCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Queen — a daily king-and-pawn endgame from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one position a day, same look): render the Queen snapshot card
// once. Satori draws it from a neutral demo position that is NOT in the bank,
// so it never spoils today.
export default async function Image() {
  return renderQueenCard()
}
