import { renderFourCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Four — a daily Connect Four puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Four snapshot card
// once. Satori draws it from a neutral demo position that is NOT in the bank, so
// it never spoils today.
export default async function Image() {
  return renderFourCard()
}
