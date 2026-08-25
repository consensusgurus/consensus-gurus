import { renderSportCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Sport — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one set a day, same look): render the Sport snapshot card
// once, from a demo question that is NOT in the bank, so it never spoils.
export default async function Image() {
  return renderSportCard()
}
