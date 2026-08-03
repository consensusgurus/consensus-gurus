export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Mind Loft: Elevate Your Thinking';
export { size, contentType } from '@/lib/og-brand-card';
import { renderBrandCard } from '@/lib/og-brand-card';
export default function Image() { return renderBrandCard(); }
