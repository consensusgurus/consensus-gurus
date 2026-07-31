import { renderDailyCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Shards - a daily jigsaw crossword from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one puzzle a day, same board look): render the shared daily
// card so the preview never spoils today's grid.
export default async function Image() {
  return renderDailyCard()
}
