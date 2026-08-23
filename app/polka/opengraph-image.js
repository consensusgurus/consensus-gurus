import { renderPolkaCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Polka — a daily kropki sudoku from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one deal a day, same look): render the Polka snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderPolkaCard()
}
