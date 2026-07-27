import { renderHedgeCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Hedge — a daily loop puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one loop a day, same look): render the Hedge snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderHedgeCard()
}
