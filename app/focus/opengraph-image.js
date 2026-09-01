import { renderFocusCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Focus — a daily puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one photo a day, same look): the Focus card draws the RULE,
// a six-frame ladder pulling back from a crop, and never a real day's photo,
// so it can never spoil a day.
export default async function Image() {
  return renderFocusCard()
}
