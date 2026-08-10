import { renderDocketCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Docket — a daily logic game from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (the same look every day): render the Docket card once. The board
// drawn on it is a neutral three-condition demo with five slots, a shape the bank
// never uses (weekdays run six or seven), so the card can never leak a real day.
export default async function Image() {
  return renderDocketCard()
}
