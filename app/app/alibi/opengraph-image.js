import { renderAlibiCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Alibi — the nightly whodunit from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one case a day, same look): render the Alibi snapshot card
// once. Satori draws it from a neutral demo board so it never spoils today.
export default async function Image() {
  return renderAlibiCard()
}
