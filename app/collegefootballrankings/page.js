// app/collegefootballrankings/page.js
//
// The college football consensus, 50 deep. Its NFL sibling is /nflrankings;
// the two share GridironTable and differ only in copy and which slice of the
// snapshot they render. Rules in CLAUDE-RANKINGS.md.

import SiteHeader from '@/app/SiteHeader';
import Footer from '@/app/Footer';
import GridironTable from '@/app/GridironTable';
import { GRIDIRON } from '@/lib/gridiron-data';
import { computeComposite } from '@/lib/gridiron';
import { SITE_URL } from '@/lib/site';
import { T } from '@/lib/theme';

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const TITLE = 'College Football Consensus Rankings: Top 50 | Mind Loft';
const DESCRIPTION =
  'Seven rankings, one consensus: the AP and Coaches polls, four analytics models and the betting market, each scored 50 deep and weighted by tier. Every source shown side by side.';

// Share copy is written for the moment someone sees it in a feed, so it leads
// with what makes the page different (the consensus, and that the disagreement
// is visible) rather than repeating the page title. The site name already rides
// along in `siteName`, so the share title does not carry the "| Mind Loft".
const SHARE_TITLE = 'The College Football Consensus, 50 Deep';
// Kept under ~200 characters: Twitter truncates a card description around there.
const SHARE_DESCRIPTION =
  'Every major college football ranking in one table, and the consensus they add up to. Polls, models and the betting market side by side, so you can see exactly where they disagree and by how much.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/collegefootballrankings' },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: '/collegefootballrankings',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export default function CollegeFootballRankingsPage() {
  const { ranked } = computeComposite(GRIDIRON.cfb.sources, 'cfb');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'College Football Rankings Consensus Top 50',
    url: `${SITE_URL}/collegefootballrankings`,
    description: DESCRIPTION,
    numberOfItems: ranked.length,
    itemListElement: ranked.map((r) => ({
      '@type': 'ListItem', position: r.rank, name: r.team,
    })),
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
      { '@type': 'ListItem', position: 2, name: 'College Football Rankings Consensus' },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: T.white, color: T.ink, fontFamily: FONT }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <SiteHeader active="rankings" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 24px 40px' }}>
        <div style={{ paddingBottom: 20, marginBottom: 22, borderBottom: `1px solid rgba(20,22,28,0.30)` }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 9, color: T.goldInk,
            fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em',
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            <span style={{ width: 22, height: 3, borderRadius: 2, background: T.gold, display: 'inline-block' }} />
            The Sports Ranking Source of Truth
          </div>
          <h1 style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(30px, 6vw, 52px)',
            lineHeight: 1.0, letterSpacing: '-0.03em', margin: 0, color: T.ink,
          }}>
            College football <span style={{ color: T.accent }}>consensus top 50</span>
          </h1>
          <p style={{ marginTop: 15, maxWidth: 700, fontSize: 16, lineHeight: 1.6, color: T.muted }}>
            Seven rankings scored into one. The AP and Coaches polls, four analytics models and the
            betting market each get truncated to the same depth, scored by position, and weighted by
            tier rather than by outlet, so adding another publication cannot drown out a poll.
            Analytics models are weighted above the human polls. The board runs 50 deep because the
            polls publish vote totals beneath their top 25, which carry real signal past the cutoff.
          </p>
        </div>

        <GridironTable
          data={{ sources: GRIDIRON.cfb.sources, fetchedAt: GRIDIRON.fetchedAt }}
          sport="cfb"
          eyebrow="College football &middot; FBS &middot; 2026 season"
          boardTitle="Consensus Top 50"
        />

        <p style={{ marginTop: 18, fontSize: 12.5, lineHeight: 1.65, color: T.muted, maxWidth: 760 }}>
          Looking for the pros? See the{' '}
          <a href="/nflrankings" style={{ color: T.blue, fontWeight: 700 }}>
            NFL power rankings consensus
          </a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}
