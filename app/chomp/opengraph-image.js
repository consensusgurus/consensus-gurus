import { renderChompCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Chomp — a daily route puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (the same look every day): render the Chomp card once. Satori
// draws a neutral 9x9 demo board carrying four pellets, a shape the bank never
// deals (every real board is 11x11 with nine pellets, twelve on a Sunday), so
// the card can never look like a real day's puzzle or leak a route.
export default async function Image() {
  return renderChompCard()
}
