import { renderBracketCard } from '@/lib/og-brand-card'
export const runtime = 'nodejs'
export const alt = 'Bracket — the daily bracket of facts from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'
// Static route: Satori draws a neutral demo bracket so it never spoils today.
export default async function Image() { return renderBracketCard() }
