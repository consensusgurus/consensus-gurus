import { renderHearsayCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Hearsay — the daily puzzle of what other people do not know'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one case a day, same look): render the Hearsay snapshot card
// once. Satori draws it from a neutral demo shortlist so it never spoils today.
export default async function Image() {
  return renderHearsayCard()
}
