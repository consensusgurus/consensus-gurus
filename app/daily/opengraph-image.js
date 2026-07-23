import { renderDailyCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Daily Games — a new word, number, and logic game every day from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// The Daily Games hub share image, distinct from the default Source of Truths
// brand card so a shared /daily link reads as the games hub.
export default async function Image() {
  return renderDailyCard()
}
