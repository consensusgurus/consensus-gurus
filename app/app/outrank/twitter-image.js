import { renderOutrankCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Outrank — the daily crowd-ranking puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

export default async function Image() {
  return renderOutrankCard()
}
