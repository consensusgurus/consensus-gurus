import { renderStetCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Stet — the daily copy-desk puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one brief a day, same look): render the Stet snapshot card
// once. Satori draws it from a neutral demo sentence so it never spoils today.
export default async function Image() {
  return renderStetCard()
}
