import { renderEtchCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Etch — a daily nonogram from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one picture a day, same look): render the Etch snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderEtchCard()
}
