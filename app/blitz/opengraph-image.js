import { renderBlitzCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Blitz — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (the same shape of problem every day): render the Blitz snapshot
// card once, from a demo problem that is NOT in the bank, so it never spoils.
export default async function Image() {
  return renderBlitzCard()
}
