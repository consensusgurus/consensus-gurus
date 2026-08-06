import { renderSufficeCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Suffice — a daily data-sufficiency puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (same look every day): render the Suffice card once. Satori
// draws an ABSTRACT item that is not in the bank, so it never spoils today.
export default async function Image() {
  return renderSufficeCard()
}
