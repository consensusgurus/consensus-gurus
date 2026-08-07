import { renderAnonCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Anon — a daily acrostic with no clues, from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

export default async function Image() {
  return renderAnonCard()
}
