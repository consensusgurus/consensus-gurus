import { renderExtraCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Extra — the daily front page from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one page a day, same look): render the Extra snapshot card
// once. Satori draws it from a neutral demo headline so it never spoils today.
export default async function Image() {
  return renderExtraCard()
}
