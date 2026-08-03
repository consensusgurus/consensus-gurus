import { renderFibCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Fib — a daily logic puzzle with one lying clue, from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one grid a day, same look): render the Fib snapshot card once.
// Satori draws it from a neutral demo grid so it never spoils today.
export default async function Image() {
  return renderFibCard()
}
