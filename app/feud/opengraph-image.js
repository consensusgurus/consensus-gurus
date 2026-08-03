import { renderFeudCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Feud — the daily crowd-survey game from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one survey a day, same look): render the Feud snapshot card
// once. The demo board is neutral, so it never spoils today.
export default async function Image() {
  return renderFeudCard()
}
