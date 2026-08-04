import { renderChainCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Chain — a daily dots and boxes endgame from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Chain snapshot card
// once. Satori draws it from a hand-made demo position that is NOT in the bank,
// so it never spoils today.
export default async function Image() {
  return renderChainCard()
}
