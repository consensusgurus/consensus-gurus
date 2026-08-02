import { renderGlyphCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Glyph — a daily codeword from Source of Truths'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one grid a day, same look): render the Glyph snapshot card
// once. Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderGlyphCard()
}
