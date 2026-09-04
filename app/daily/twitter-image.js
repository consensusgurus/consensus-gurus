import { renderDailyCard } from '@/lib/og-stage-cards'

export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Daily Puzzles — a new word, number, and logic puzzle every day from Mind Loft'
export { size, contentType } from '@/lib/og-stage-cards'

export default async function Image() {
  return renderDailyCard()
}
