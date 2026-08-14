import { renderBarterCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Barter — the daily letter-trade puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Barter snapshot card
// once. Satori draws it from a neutral demo lattice so it never spoils today.
export default async function Image() {
  return renderBarterCard()
}
