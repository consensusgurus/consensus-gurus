// One-pager PNG of the full college football consensus top 50.
// Shared renderer in app/gridiron-poster.jsx; see it for the Satori constraints.
import { renderGridironPoster } from '@/app/gridiron-poster';
import { GRIDIRON } from '@/lib/gridiron-data';

export const runtime = 'nodejs';

export async function GET() {
  return renderGridironPoster({
    block: GRIDIRON.cfb,
    sport: 'cfb',
    fetchedAt: GRIDIRON.fetchedAt,
    title: 'College Football Consensus Top 50',
    eyebrow: 'FBS · 2026 season',
    url: 'sourceoftruths.com/collegefootballrankings',
  });
}
