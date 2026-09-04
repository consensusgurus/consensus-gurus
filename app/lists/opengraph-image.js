export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Mind Loft Top 10 Lists, where experts and aggregators agree';
export { size, contentType } from '@/lib/og-stage-cards';
import { renderListsBrandCard } from '@/lib/og-stage-cards';
export default function Image() { return renderListsBrandCard(); }
