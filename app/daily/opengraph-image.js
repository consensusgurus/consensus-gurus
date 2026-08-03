import { renderDailyCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Daily Puzzles — a new word, number, and logic puzzle every day from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// The Daily Puzzles hub share image, distinct from the default Mind Loft
// brand card so a shared /daily link reads as the games hub.
export default async function Image() {
  return renderDailyCard()
}
