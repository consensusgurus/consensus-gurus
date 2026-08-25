import { renderAtlasCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Atlas — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one map a day, same look): render the Atlas snapshot card
// once, from a demo question that is NOT in the bank, so it never spoils.
export default async function Image() {
  return renderAtlasCard()
}
