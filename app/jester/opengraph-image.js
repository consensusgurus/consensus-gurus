import { renderJesterCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Jester — the daily court-placement puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Jester snapshot card
// once. Satori draws it from a neutral demo board so it never spoils today.
export default async function Image() {
  return renderJesterCard()
}
