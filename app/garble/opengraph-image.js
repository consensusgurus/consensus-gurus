import { renderGarbleCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Garble — a daily word scramble puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the Garble snapshot
// card once. The demo scramble is neutral, so it never spoils today's puzzle.
export default async function Image() {
  return renderGarbleCard()
}
