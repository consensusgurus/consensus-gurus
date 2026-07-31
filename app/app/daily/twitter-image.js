import { renderDailyCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Daily Puzzles — a new word, number, and logic puzzle every day from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

export default async function Image() {
  return renderDailyCard()
}
