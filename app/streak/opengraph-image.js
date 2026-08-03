import { renderStreakCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Streak — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one gauntlet a day, same look): render the Streak snapshot
// card once, from a demo question that is NOT in the bank, so it never spoils.
export default async function Image() {
  return renderStreakCard()
}
