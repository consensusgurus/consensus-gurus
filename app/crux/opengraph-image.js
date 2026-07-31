import { renderCruxCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Crux — a daily word puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the Crux snapshot
// card once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderCruxCard()
}
