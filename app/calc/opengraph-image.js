import { renderCalcCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Calc — a daily number path puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

// Static route (one board a day, same look): render the Calc snapshot card once.
// Satori draws it from a throwaway demo board with its own invented target, so
// it never spoils a day.
export default async function Image() {
  return renderCalcCard()
}
