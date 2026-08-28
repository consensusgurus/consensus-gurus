// app/nflrankings/page.js
//
// The NFL consensus ranking. Its college sibling is /collegefootballrankings;
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

const TITLE = 'NFL Consensus Power Rankings: All 32 Teams | Source of Truths';
const DESCRIPTION =
  'One consensus from every NFL power ranking worth reading: analytics models, betting markets and media, each scored 1 to 32 and weighted by tier. Every source shown side by side.';

// Share copy is written for the moment someone sees it in a feed, so it leads
// with what makes the page different (the consensus, and that the disagreement
// is visible) rather than repeating the page title. The site name already rides
// along in `siteName`, so the share title does not carry the "| Mind Loft".
const SHARE_TITLE = 'The NFL Consensus, All 32 Teams';
// Kept under ~200 characters: Twitter truncates a card description around there.
const SHARE_DESCRIPTION =
  'Every NFL power ranking in one table, and the consensus they add up to. Models, betting markets and media side by side, so you can see exactly where they disagree and by how much.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Absolute, on the old host: these pages are canonical there (see lib/site.js).
  alternates: { canonical: `${SOT_URL}/nflrankings` },
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: `${SOT_URL}/nflrankings`,
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export default function NflRankingsPage() {
  const { ranked } = computeComposite(GRIDIRON.nfl.sources, 'nfl');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'NFL Power Rankings Consensus',
    url: `${SOT_URL}/nflrankings`,
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
      { '@type': 'ListItem', position: 2, name: 'NFL Power Rankings Consensus' },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', background: T.white, color: T.ink, fontFamily: FONT }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <PageViewBeacon id="nfl-rankings" />
      <SotHeader active="nfl" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 20px 40px' }}>
        <div style={{ paddingBottom: 13, marginBottom: 14, borderBottom: `1px solid rgba(20,22,28,0.30)` }}>
          <h1 style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(25px, 4.6vw, 40px)',
            lineHeight: 1.03, letterSpacing: '-0.03em', margin: 0, color: T.ink,
          }}>
            NFL <span style={{ color: T.accent }}>consensus power rankings</span>
          </h1>
          <p style={{ marginTop: 10, maxWidth: 660, fontSize: 15, lineHeight: 1.55, color: T.muted }}>
            Every NFL ranking scored into one. Betting markets and analytics models carry the most
            weight because they carry the least bias: money and math have no attachment to a brand
            name, while media voters lean on reputation and on last season.
          </p>
        </div>

        <GridironTable
          data={{ sources: GRIDIRON.nfl.sources, fetchedAt: GRIDIRON.fetchedAt }}
          sport="nfl"
          eyebrow="NFL &middot; 2026 season"
          boardTitle="Consensus 1 through 32"
        />

        <p style={{ marginTop: 18, fontSize: 12.5, lineHeight: 1.65, color: T.muted, maxWidth: 760 }}>
          Looking for college? See the{' '}
          <a href="/collegefootballrankings" style={{ color: T.blue, fontWeight: 700 }}>
            college football consensus top 50
          </a>.
        </p>
      </div>
      <Footer />
    </div>
  );
}
