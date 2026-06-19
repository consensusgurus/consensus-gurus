import SiteHeader from '@/app/SiteHeader';
import Footer from '@/app/Footer';
import SourcesGrid from '@/app/SourcesGrid';
import { getAllSources } from '@/lib/sources';

export const metadata = {
  title: 'Experts and Aggregators | Source of Truths',
  description:
    'Every publication behind the Source of Truths consensus, from Michelin and Condé Nast Traveler to Wirecutter, Goodreads, and Yelp, with how many lists each one shapes.',
};

const C = {
  bg: '#f7f8fa',
  ink: '#1c1e24',
  muted: '#6b7280',
  soft: '#9aa0ab',
  accent: '#2563eb',
  line: 'rgba(20,22,28,0.09)',
};
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function SourcesPage() {
  const sources = getAllSources();
  const totalAppearances = sources.reduce((a, s) => a + s.count, 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: FONT }}>
      <SiteHeader active="sources" />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 40px' }}>
        <div style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 22, marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.accent,
              marginBottom: 12,
            }}
          >
            Experts and Aggregators
          </div>
          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 'clamp(34px, 7vw, 60px)',
              lineHeight: 1.0,
              letterSpacing: '-0.03em',
              margin: 0,
              color: C.ink,
            }}
          >
            Who we{' '}
            <span style={{ color: C.accent }}>listen to</span>
          </h1>
          <p
            style={{
              marginTop: 16,
              maxWidth: 680,
              fontSize: 16,
              lineHeight: 1.6,
              color: C.muted,
            }}
          >
            Every ranking on Source of Truths is a consensus of expert critics and everyday users.
            These are the {sources.length} publications and platforms whose rankings feed that
            consensus, from Michelin, Condé Nast Traveler, and The Infatuation to Wirecutter,
            Goodreads, and Yelp. The number beside each shows how many lists it currently shapes.
          </p>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: C.soft,
            }}
          >
            {sources.length} experts and aggregators &nbsp;&middot;&nbsp; {totalAppearances.toLocaleString()} list appearances
          </div>
        </div>

        <SourcesGrid sources={sources} minColWidth={220} linked theme="site" />
      </div>
      <Footer />
    </div>
  );
}
