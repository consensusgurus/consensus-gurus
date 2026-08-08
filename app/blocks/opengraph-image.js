import { renderBlocksCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Blocks — a daily falling-shapes puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (the same look every day): render the Blocks snapshot card once.
// Satori draws a neutral demo well that is 9 columns wide, a width the bank
// never uses (weekdays are 10, Sundays 8), so the card can never look like a
// real day's board.
export default async function Image() {
  return renderBlocksCard()
}
