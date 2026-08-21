import { renderNicheCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Niche — the daily trivia grid from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Niche snapshot card
// once. Satori draws it from a demo grid of its own so it never spoils today.
export default async function Image() {
  return renderNicheCard()
}
