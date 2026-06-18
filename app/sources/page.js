import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Grain from '@/app/Grain';
import Footer from '@/app/Footer';
import SourcesGrid from '@/app/SourcesGrid';
import { COLORS } from '@/lib/data';
import { getAllSources } from '@/lib/sources';

export const metadata = {
  title: 'The Sources | Source of Truths',
  description:
    'Every publication behind the Source of Truths consensus, from Michelin and Condé Nast Traveler to Wirecutter, Goodreads, and Yelp, with how many lists each one shapes.',
};

export default function SourcesPage() {
  const sources = getAllSources();
  const totalAppearances = sources.reduce((a, s) => a + s.count, 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.cream,
        color: COLORS.ink,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Grain />
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 24px 60px',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.ink,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 0',
          }}
        >
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to all lists
        </Link>

        <div style={{ borderBottom: `2px solid ${COLORS.ink}`, paddingBottom: 20, marginTop: 16, marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: COLORS.ember,
              marginBottom: 12,
            }}
          >
            The Sources
          </div>
          <h1
            style={{
              fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(40px, 9vw, 76px)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
              margin: 0,
              color: COLORS.ink,
              fontVariationSettings: '"SOFT" 100',
            }}
          >
            Who we{' '}
            <span style={{ fontStyle: 'italic', color: COLORS.ember }}>listen to</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 680,
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 16,
              lineHeight: 1.6,
              color: COLORS.ink,
            }}
          >
            Every ranking on Source of Truths is a consensus of expert critics and everyday users.
            These are the {sources.length} publications and platforms whose rankings feed that
            consensus, from Michelin, Condé Nast Traveler, and The Infatuation to Wirecutter,
            Goodreads, and Yelp. The number beside each shows how many lists it currently shapes.
          </p>
          <div
            style={{
              marginTop: 16,
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: COLORS.faded,
            }}
          >
            {sources.length} sources &nbsp;·&nbsp; {totalAppearances.toLocaleString()} list appearances
          </div>
        </div>

        <SourcesGrid sources={sources} minColWidth={220} linked />
      </div>
      <Footer />
    </div>
  );
}
