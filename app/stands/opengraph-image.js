import { renderStandsCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Stands — a daily logic puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): Satori draws a neutral demo board
// so the card never spoils today.
export default async function Image() {
  return renderStandsCard()
}
