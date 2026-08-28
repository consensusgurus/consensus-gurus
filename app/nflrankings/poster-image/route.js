// One-pager PNG of the full NFL consensus, all 32 teams.
// Shared renderer in app/gridiron-poster.jsx; see it for the Satori constraints.
import { renderGridironPoster } from '@/app/gridiron-poster';
import { GRIDIRON } from '@/lib/gridiron-data';

export const runtime = 'nodejs';

export async function GET() {
  return renderGridironPoster({
    sources: GRIDIRON.nfl.sources,
    sport: 'nfl',
    fetchedAt: GRIDIRON.fetchedAt,
    title: 'NFL Consensus Power Rankings',
    eyebrow: '2026 season',
    url: 'sourceoftruths.com/nflrankings',
  });
}
