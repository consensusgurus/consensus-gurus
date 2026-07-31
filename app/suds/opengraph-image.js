import { renderSudsCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Suds — a daily sudoku from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Suds snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderSudsCard()
}
