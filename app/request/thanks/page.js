import Link from 'next/link';
import Grain from '@/app/Grain';
import Footer from '@/app/Footer';
import { COLORS } from '@/lib/data';

export const metadata = {
  title: 'Thanks for your request | Source of Truths',
};

export default function ThanksPage() {
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
          maxWidth: 720,
          margin: '0 auto',
          padding: '80px 20px 60px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: 11,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: COLORS.ember,
            marginBottom: 14,
          }}
        >
          Received
        </div>
        <h1
          style={{
            fontFamily: 'Fraunces, serif',
            fontWeight: 600,
            fontSize: 'clamp(42px, 10vw, 84px)',
            lineHeight: 0.9,
            letterSpacing: '-0.015em',
            margin: 0,
            color: COLORS.ink,
            fontVariationSettings: '"SOFT" 100',
          }}
        >
          Thanks for your
          <br />
          <span style={{ fontStyle: 'italic', color: COLORS.ember }}>request</span>
        </h1>
        <p
          style={{
            fontFamily: 'Fraunces, serif',
            fontStyle: 'italic',
            fontSize: 19,
            lineHeight: 1.5,
            margin: '24px auto 0',
            color: COLORS.faded,
            maxWidth: 520,
          }}
        >
          Your request is in the queue for review. An editor will take a look and publish it shortly. Once it goes live, it shows up on the site like any other list or quiz.
        </p>
        <div style={{ marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              background: COLORS.ink,
              color: COLORS.cream,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '12px 22px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `3px 3px 0 ${COLORS.ember}`,
            }}
          >
            Back to all lists
          </Link>
          <Link
            href="/request"
            style={{
              background: 'transparent',
              color: COLORS.ink,
              border: `1.5px solid ${COLORS.ink}`,
              padding: '12px 22px',
              fontFamily: 'DM Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Request another
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
