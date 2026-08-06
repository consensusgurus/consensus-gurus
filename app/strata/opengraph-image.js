import { renderStrataCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Strata — a daily word game with gravity, from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (same look every day): render the Strata card once. Satori draws
// an ABSTRACT grid that is not in the bank, so it never spoils today.
export default async function Image() {
  return renderStrataCard()
}
