import { renderTuckCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Tuck — the daily tile-tucking word puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one rack a day, same look): render the Tuck snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderTuckCard()
}
