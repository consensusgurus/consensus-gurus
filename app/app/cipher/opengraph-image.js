import { renderCipherCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Cipher — the daily cryptarithm from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one equation a day, same look): render the Cipher snapshot
// card once. Satori draws it from the classic SEND+MORE=MONEY demo so it
// never spoils today.
export default async function Image() {
  return renderCipherCard()
}
