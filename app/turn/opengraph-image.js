import { renderTurnCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Turn — a daily Othello endgame from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Turn snapshot card
// once. Satori draws it from a hand-made demo position that is NOT in the bank,
// so it never spoils today.
export default async function Image() {
  return renderTurnCard()
}
