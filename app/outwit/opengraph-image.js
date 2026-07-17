import { renderOutwitCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Outwit — the daily crowd game from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one crowd a day, same look): render the Outwit snapshot card
// once. Satori draws it from a neutral demo distribution so it never spoils today.
export default async function Image() {
  return renderOutwitCard()
}
