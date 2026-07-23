import { renderDailyCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const revalidate = 3600
export const alt = 'Daily Games — a new word, number, and logic game every day from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

export default async function Image() {
  return renderDailyCard()
}
