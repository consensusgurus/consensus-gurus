import { renderSwornCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Sworn — the daily liars puzzle from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one inquest a day, same look): render the Sworn snapshot card
// once. Satori draws it from a neutral demo docket so it never spoils today.
export default async function Image() {
  return renderSwornCard()
}
