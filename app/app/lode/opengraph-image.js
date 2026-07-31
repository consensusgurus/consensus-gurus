import { renderLodeCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Lode — the daily letter-mining word puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Lode snapshot card
// once. Satori draws it from a neutral demo cluster so it never spoils today.
export default async function Image() {
  return renderLodeCard()
}
