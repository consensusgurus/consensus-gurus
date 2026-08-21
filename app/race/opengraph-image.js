import { renderRaceCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Race — a daily pawn race from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one position a day, same look): render the Race snapshot card
// once. Satori draws it from a neutral demo board that is NOT in the bank, so
// it never spoils today.
export default async function Image() {
  return renderRaceCard()
}
