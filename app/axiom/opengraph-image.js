import { renderAxiomCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Axiom — the daily hidden-rule game from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Axiom snapshot card
// once. Satori draws it from a neutral demo board so it never spoils today.
export default async function Image() {
  return renderAxiomCard()
}
