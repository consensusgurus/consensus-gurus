export const runtime = 'nodejs';
export const revalidate = 3600;
export const alt = 'Mind Loft: Sharpen Your Mind. Daily puzzles and quizzes, free every day.';
export { size, contentType } from '@/lib/og-stage-cards';
import { renderBrandCard } from '@/lib/og-stage-cards';
export default function Image() { return renderBrandCard(); }
