import { renderPingCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Ping — the daily city hunt from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one city a day, same look): render the Ping snapshot card once.
// Satori draws it from a neutral demo hunt so it never spoils today's city.
export default async function Image() {
  return renderPingCard()
}
