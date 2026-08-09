import { renderSweepCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Sweep — a daily minesweeper with no bottom edge from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (the same look every day): render the Sweep snapshot card once.
// Satori draws a hand-made demo fragment that is not from the bank and does not
// obey the solver, so the card can never hand anyone a real day's read.
export default async function Image() {
  return renderSweepCard()
}
