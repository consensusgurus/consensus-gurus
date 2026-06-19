'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { COLORS } from '@/lib/data';
import { getAllSources } from '@/lib/sources';
import SourcesGrid from './SourcesGrid';

// Inline trigger (used in the homepage blurb) that reveals a popover listing
// every publication behind the consensus, with logos and how many lists each
// appears in. Hover to open; also toggles on click and closes on Escape /
// outside click for keyboard and touch users.
// `emphasis` (V2 homepage): renders the trigger bold with a solid ember
// underline instead of the default dotted underline. Default unchanged.
export default function SourcesPopover({ label, emphasis, align, href }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);
  const sources = useMemo(() => getAllSources(), []);
  // Exact, live count of distinct publications (updates as lists are added)
  // unless an explicit label override is passed.
  const triggerLabel = label || `${sources.length} experts and aggregators`;

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      style={{ position: 'relative', display: 'inline' }}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') { cancelClose(); setOpen(true); } }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') scheduleClose(); }}
    >
      <Link
        href={href || '/experts-and-aggregators'}
        style={{
          font: 'inherit',
          letterSpacing: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          fontWeight: emphasis ? 700 : 'inherit',
          // Underline via text-decoration (not a border-bottom) so wrapped lines
          // keep even spacing. Emphasis = solid blue; default = dotted blue.
          textDecoration: 'underline',
          textDecorationStyle: emphasis ? 'solid' : 'dotted',
          textDecorationThickness: emphasis ? '2px' : 'auto',
          textUnderlineOffset: '3px',
          textDecorationColor: '#2563eb',
        }}
      >
        {triggerLabel}
      </Link>

      {open && (
        <>
          <style>{`
            .sot-pop{
              position:absolute;top:calc(100% + 10px);${align === 'left' ? 'left:0;right:auto;' : 'right:0;left:auto;'}
              z-index:50;width:min(720px,90vw);max-height:64vh;overflow-y:auto;
              background:#ffffff;border:1px solid rgba(20,22,28,0.12);border-radius:14px;
              box-shadow:0 14px 44px rgba(20,22,28,0.18);padding:0;text-align:left;cursor:default;
            }
            @media(max-width:640px){
              .sot-pop{
                position:fixed;top:64px;left:50%;right:auto;transform:translateX(-50%);
                width:92vw;max-height:78vh;box-shadow:0 10px 40px rgba(26,22,17,0.35);
              }
            }
          `}</style>
        <div
          role="dialog"
          aria-label="The experts and aggregators behind the consensus"
          className="sot-pop"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              background: '#ffffff',
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              margin: 0,
              padding: '16px 16px 10px',
              borderBottom: `1px solid rgba(20,22,28,0.10)`,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Manrope', system-ui, sans-serif",
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#2563eb',
                  marginBottom: 4,
                }}
              >
                Experts and Aggregators
              </div>
              <div style={{ fontFamily: "'Manrope', system-ui, sans-serif", fontSize: 12, color: '#6b7280' }}>
                {sources.length} publications, with how many lists each shapes
              </div>
            </div>
            <Link
              href="/experts-and-aggregators"
              style={{
                flex: '0 0 auto',
                fontFamily: "'Manrope', system-ui, sans-serif",
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#1c1e24',
                textDecoration: 'none',
                borderBottom: `2px solid #2563eb`,
                paddingBottom: 2,
              }}
            >
              See all &#8594;
            </Link>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <SourcesGrid sources={sources} theme="site" minColWidth={210} />
          </div>
        </div>
        </>
      )}
    </span>
  );
}
