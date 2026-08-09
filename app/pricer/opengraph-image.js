import { renderPricerCard } from '@/lib/og-brand-card'
export const runtime = 'nodejs'
export const alt = 'Pricer — the daily price bracket from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'
// Static route: Satori draws a neutral demo bracket so it never spoils today.
export default async function Image() { return renderPricerCard() }
