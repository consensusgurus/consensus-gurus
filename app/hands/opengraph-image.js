import { renderHandsCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Hands — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one deal a day, same look): render the Hands snapshot card
// once. Satori draws it from a demo board that is NOT in the bank, so it never
// spoils today.
export default async function Image() {
  return renderHandsCard()
}
