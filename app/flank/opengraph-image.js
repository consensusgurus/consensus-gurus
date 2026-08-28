import { renderFlankCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Flank — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one country a day, same look): render the Flank snapshot card
// once, from a demo board (Peru) that is deliberately never in the bank, so
// it never spoils a day.
export default async function Image() {
  return renderFlankCard()
}
