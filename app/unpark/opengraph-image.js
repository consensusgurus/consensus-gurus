import { renderUnparkCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Unpark — a daily puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Unpark snapshot card
// once. Satori draws it from a demo position that is NOT in the bank, so it
// never spoils today.
export default async function Image() {
  return renderUnparkCard()
}
