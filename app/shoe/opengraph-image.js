import { renderShoeCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Shoe — the daily blackjack shoe from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one shoe a day, same look): render the Shoe snapshot card
// once. Satori draws it from a demo hand of its own so it never spoils today.
export default async function Image() {
  return renderShoeCard()
}
