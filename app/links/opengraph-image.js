import { renderLinksCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Links — a daily word grouping puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the Links snapshot
// card once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderLinksCard()
}
