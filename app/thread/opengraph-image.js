import { renderThreadCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Thread — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): the Thread card draws the RULE,
// a 3x3 of loglines with one lit and the thread redacted, and never a real
// day's sentences, so it can never spoil a day.
export default async function Image() {
  return renderThreadCard()
}
