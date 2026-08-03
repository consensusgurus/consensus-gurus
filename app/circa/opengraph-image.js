import { renderCircaCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Circa — the daily year hunt from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one moment a day, same look): render the Circa snapshot card
// once. Satori draws it from a neutral demo hunt so it never spoils today.
export default async function Image() {
  return renderCircaCard()
}
