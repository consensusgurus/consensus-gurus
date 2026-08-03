import { renderOutrankCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Outrank — the daily crowd-ranking puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one crowd a day, same look): render the Outrank snapshot card
// once. Satori draws it from a neutral demo slate so it never spoils today.
export default async function Image() {
  return renderOutrankCard()
}
