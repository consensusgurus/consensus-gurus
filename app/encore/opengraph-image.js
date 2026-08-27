import { renderEncoreCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Encore — the daily crossword from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one grid a day, same look): render the Encore snapshot card
// once. Satori draws it from a neutral demo grid that appears on no day of the
// bank, so it never spoils today.
export default async function Image() {
  return renderEncoreCard()
}
