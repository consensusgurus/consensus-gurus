import { renderQuiltCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Quilt — a daily jigsaw sudoku from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Quilt snapshot card
// once. Satori draws it from a demo board generated off a throwaway seed and
// confirmed absent from the bank, so it never spoils today.
export default async function Image() {
  return renderQuiltCard()
}
