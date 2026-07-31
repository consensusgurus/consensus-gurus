import { renderTaireCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Taire — a daily puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one deal a day, same look): render the Taire snapshot card
// once. Satori draws it from a demo layout that is NOT in the bank, so it
// never spoils today.
export default async function Image() {
  return renderTaireCard()
}
