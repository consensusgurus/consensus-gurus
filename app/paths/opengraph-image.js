import { renderPathsCard } from '@/lib/og-brand-card'

export const runtime = 'nodejs'
export const alt = 'Paths — a daily network puzzle from Mind Loft'
export { size, contentType } from '@/lib/og-brand-card'

export default async function Image() {
  return renderPathsCard()
}
