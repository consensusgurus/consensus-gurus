import { renderMercuryCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Mercury — a daily thermo sudoku from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Mercury snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderMercuryCard()
}
