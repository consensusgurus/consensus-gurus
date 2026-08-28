// app/nflrankings/page.js
//
// The NFL consensus ranking. Its college sibling is /collegefootballrankings;
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

const TITLE = 'NFL Power Rankings Consensus | Mind Loft';
const DESCRIPTION =
  'Every published NFL power ranking in one table: analytics models, betting markets and media rankings side by side, plus the composite they add up to. Updated weekly.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/nflrankings' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/nflrankings',
    type: 'website',
    siteName: 'Mind Loft',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function NflRankingsPage() {
  const { ranked } = computeComposite(GRIDIRON.nfl.sources, 'nfl');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'NFL Power Rankings Consensus',
    url: `${SITE_URL}/nflrankings`,
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
      { '@type': 'ListItem', position: 2, name: 'NFL Power Rankings Consensus' },
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
            NFL <span style={{ color: T.accent }}>power rankings</span>
          </h1>
          <p style={{ marginTop: 15, maxWidth: 680, fontSize: 16, lineHeight: 1.6, color: T.muted }}>
            The NFL has no official poll, so this composite is built from three independent kinds of
            signal: analytics models, betting markets, and the one media power ranking that publishes
            a full list at a stable address. Every source is shown, so you can see who disagrees and
            by how much.
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
