// app/collegefootballrankings/page.js
//
// The college football consensus, EVERY FBS TEAM (owner rule, 2026-09-04,
// raised from a top 50). Its NFL sibling is /nflrankings; the two share
// GridironTable and differ only in copy and which slice of the snapshot they
// render. Rules in CLAUDE-RANKINGS.md.
//
// The team count is read off the board rather than written into the copy, for
// the reason the layout rules give for the callouts: the FBS changes
// membership most years, and a number typed into a title goes stale silently
// while a number computed from the board cannot.

import SotHeader from '@/app/SotHeader';
import Footer from '@/app/Footer';
import GridironTable from '@/app/GridironTable';
import PageViewBeacon from '@/app/PageViewBeacon';
import { GRIDIRON } from '@/lib/gridiron-data';
import { computeComposite } from '@/lib/gridiron';
import { SOT_URL } from '@/lib/site';
import { T } from '@/lib/theme';

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const TITLE = 'College Football Consensus Rankings: Every FBS Team | Source of Truths';
const DESCRIPTION =
  'All 138 FBS teams rated on results, betting markets and analytics models, with no polls: what happened, what money says and what the models say, each in points and shown side by side.';

// Share copy is written for the moment someone sees it in a feed, so it leads
// with what makes the page different (the consensus, and that the disagreement
// is visible) rather than repeating the page title. The site name already rides
// along in `siteName`, so the share title does not carry the "| Mind Loft".
// "Every bowl team" is the hook: everyone ranks 25, a few rank 50, and nobody
// publishes a rated board that runs all the way to the bottom of the FBS.
const SHARE_TITLE = 'The College Football Consensus: Every Bowl Team, Ranked';
// Kept under ~200 characters: Twitter truncates a card description around there.
const SHARE_DESCRIPTION =
  'All 138 FBS teams rated on results, betting markets and analytics models, no polls. Every team in points better than average, with the résumé and the market side by side so you can see where they disagree.';

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
  const { ranked } = computeComposite(GRIDIRON.cfb, 'cfb');
  const N = ranked.length;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `College Football Rankings Consensus: All ${N} FBS Teams`,
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
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '10px 20px 40px' }}>
        <div style={{ paddingBottom: 13, marginBottom: 14, borderBottom: `1px solid rgba(20,22,28,0.30)` }}>
          <h1 style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(25px, 4.6vw, 40px)',
            lineHeight: 1.03, letterSpacing: '-0.03em', margin: 0, color: T.ink,
          }}>
            College football <span style={{ color: T.accent }}>consensus, all {N} bowl teams</span>
          </h1>
          <p style={{ marginTop: 10, maxWidth: 660, fontSize: 15, lineHeight: 1.55, color: T.muted }}>
            Results, betting markets and analytics models, scored into one rating in points. No
            polls: a score, a price and a measurement each answer to something real, while poll
            voters lean on reputation and preseason expectation. Every team that can play in a bowl
            is rated, not just the ones already being talked about.
          </p>
        </div>

        <GridironTable
          data={GRIDIRON.cfb}
          fetchedAt={GRIDIRON.fetchedAt}
          sport="cfb"
          eyebrow="College football &middot; FBS &middot; 2026 season"
          boardTitle={`Consensus, all ${N} FBS teams`}
        />

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <a
            href="/collegefootballrankings/breakdown"
            target="_blank"
            rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700,
              padding: '9px 15px', borderRadius: 9, textDecoration: 'none',
              background: T.accent, color: T.white,
            }}
          >
            Download the breakdown (PDF)
          </a>
          <a
            href="/collegefootballrankings/poster-image"
            target="_blank"
            rel="noopener"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700,
              padding: '9px 15px', borderRadius: 9, textDecoration: 'none',
              background: T.white, color: T.accent, border: `1px solid ${T.border}`,
            }}
          >
            Share image
          </a>
          <span style={{ fontSize: 11.5, color: T.slate }}>
            All {N} teams, every source column. The share image is the ranking only.
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
