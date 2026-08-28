// The condensed one-page breakdown PDF. Builder in lib/gridiron-pdf.js.
import { buildGridironPdf } from '@/lib/gridiron-pdf';
import { computeComposite } from '@/lib/gridiron';
import { GRIDIRON } from '@/lib/gridiron-data';
import { SOT_URL } from '@/lib/site';

export const runtime = 'nodejs';

const TIER_ORDER = ['market', 'model', 'media', 'official'];

export async function GET() {
  const src = GRIDIRON.cfb.sources;
  const { ranked, weights, tierShare, depth, status } = computeComposite(src, 'cfb');
  // Same column order the page uses: heaviest tier first.
  const ids = Object.keys(src).sort(
    (a, b) => TIER_ORDER.indexOf(src[a].tier) - TIER_ORDER.indexOf(src[b].tier)
      || ((weights[b] || 0) - (weights[a] || 0))
  );
  const sources = ids.map((id) => ({
    id, short: src[id].short, label: src[id].label, tier: src[id].tier,
    weight: weights[id] || 0, ok: status[id].ok,
  }));

  const bytes = buildGridironPdf({
    ranked, sources, tierShare, depth,
    fetchedAt: GRIDIRON.fetchedAt,
    title: 'College Football Consensus Top 50',
    eyebrow: 'FBS 2026 season',
    url: `${SOT_URL.replace(/^https?:\/\//, '')}/collegefootballrankings`,
  });

  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="college-football-consensus-top-50.pdf"',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
