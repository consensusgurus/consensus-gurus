import { renderSpanCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Span — a daily border-hopping geography puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the Span snapshot
// card once. Satori draws it from a neutral demo route so it never spoils today.
export default async function Image() {
  return renderSpanCard()
}
