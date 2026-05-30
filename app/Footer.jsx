import Link from 'next/link';
import { COLORS } from '@/lib/data';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: `2px solid ${COLORS.ink}`,
        padding: '32px 24px',
        position: 'relative',
        zIndex: 2,
        background: COLORS.cream,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 15,
            margin: 0,
            color: COLORS.ink,
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          As an Amazon Associate, Consensus Gurus earns from qualifying purchases. Some other outbound links may also be affiliate links.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          <Link href="/" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Home
          </Link>
          <Link href="/submit" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Submit a list
          </Link>
          <Link href="/create" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Create Your Own Grid
          </Link>
          <Link href="/disclosure" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Disclosure
          </Link>
          <Link href="/privacy" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Privacy
          </Link>
          <Link href="/terms" style={{ color: COLORS.ink, textDecoration: 'none' }}>
            Terms
          </Link>
        </div>
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.faded,
          }}
        >
          © {year} Consensus Gurus
        </div>
      </div>
    </footer>
  );
}
