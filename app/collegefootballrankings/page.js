// app/collegefootballrankings/page.js
//
// The college football consensus, 50 deep. Its NFL sibling is /nflrankings;
// the two share GridironTable and differ only in copy and which slice of the
// snapshot they render. Rules in CLAUDE-RANKINGS.md.

import SotHeader from '@/app/SotHeader';
import Footer from '@/app/Footer';
import GridironTable from '@/app/GridironTable';
import PageViewBeacon from '@/app/PageViewBeacon';
import { GRIDIRON } from '@/lib/gridiron-data';
import { computeComposite } from '@/lib/gridiron';
import { SOT_URL } from '@/lib/site';
import { T } from '@/lib/theme';

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const TITLE = 'College Football Consensus Rankings: Top 50 | Source of Truths';
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
  // Absolute, on the old host: these pages are canonical there (see lib/site.js).
  alternates: { canonical: `${SOT_URL}/collegefootballrankings` },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: `${SOT_URL}/collegefootballrankings`,
    type: 'website',
    siteName: 'Source of Truths',
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
    url: `${SOT_URL}/collegefootballrankings`,
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
      { '@type': 'ListItem', position: 1, name: 'Source of Truths Sports Rankings', item: `${SOT_URL}/collegefootballrankings` },
      { '@type': 'ListItem', position: 2, name: 'College Football Rankings Consensus' },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: T.white, color: T.ink, fontFamily: FONT }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageViewBeacon id="cfb-rankings" />
      <SotHeader active="cfb" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 20px 40px' }}>
        <div style={{ paddingBottom: 13, marginBottom: 14, borderBottom: `1px solid rgba(20,22,28,0.30)` }}>
          <h1 style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(25px, 4.6vw, 40px)',
            lineHeight: 1.03, letterSpacing: '-0.03em', margin: 0, color: T.ink,
          }}>
            College football <span style={{ color: T.accent }}>consensus top 50</span>
          </h1>
          <p style={{ marginTop: 10, maxWidth: 660, fontSize: 15, lineHeight: 1.55, color: T.muted }}>
            Seven rankings scored into one. Betting markets and analytics models carry the most
            weight because they carry the least bias: money and math have no attachment to a brand
            name, while poll voters lean on reputation and preseason expectation.
          </p>
        </div>

        <GridironTable
          data={{ sources: GRIDIRON.cfb.sources, fetchedAt: GRIDIRON.fetchedAt }}
          sport="cfb"
          eyebrow="College football &middot; FBS &middot; 2026 season"
          boardTitle="Consensus Top 50"
        />

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href="/collegefootballrankings/poster-image"
            target="_blank"
            rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700,
              padding: '9px 15px', borderRadius: 9, textDecoration: 'none',
              background: T.accent, color: T.white,
            }}
          >
            Download the one-pager
          </a>
          <span style={{ fontSize: 11.5, color: T.slate }}>
            The whole board as a single image, for sharing or printing.
          </span>
        </div>

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
