import { renderPlotCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Plot — a daily rectangle puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Plot snapshot card
// once. Satori draws it from a 6x6 demo board, a size that is NOT in the bank,
// so it never spoils today.
export default async function Image() {
  return renderPlotCard()
}
