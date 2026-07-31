import { renderListedCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Listed: a daily ranking puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the Listed snapshot
// card once. Satori draws it from a neutral demo board so it never spoils today.
export default async function Image() {
  return renderListedCard()
}
