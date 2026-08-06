import { renderRedactCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Redact — a daily uncover-the-article game from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (same look every day): render the Redact card once. Satori
// draws an ABSTRACT redacted paragraph, never a day from the bank, so the
// card cannot spoil today's article.
export default async function Image() {
  return renderRedactCard()
}
