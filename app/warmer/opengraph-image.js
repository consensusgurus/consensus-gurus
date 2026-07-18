import { renderWarmerCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Warmer — a daily hot-and-cold word game from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one word a day, same look): render the Warmer snapshot card
// once. Satori draws a neutral demo ladder so it never spoils today's word.
export default async function Image() {
  return renderWarmerCard()
}
