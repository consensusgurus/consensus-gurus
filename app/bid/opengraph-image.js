import { renderBidCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Bid — a daily puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Bid snapshot card
// once, from a demo that is NOT in the bank, so it never spoils today.
export default async function Image() {
  return renderBidCard()
}
