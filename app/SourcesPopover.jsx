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
export default function SourcesPopover({ label, emphasis }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const closeTimer = useRef(null);
  const sources = useMemo(() => getAllSources(), []);
  // Exact, live count of distinct publications (updates as lists are added)
  // unless an explicit label override is passed.
  const triggerLabel = label || `${sources.length} sources`;

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
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          fontWeight: emphasis ? 700 : 'inherit',
          textDecoration: emphasis ? 'none' : 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
          textDecorationColor: COLORS.ember,
          borderBottom: emphasis ? `2px solid ${COLORS.ember}` : 'none',
          paddingBottom: emphasis ? 1 : 0,
        }}
      >
        {triggerLabel}
      </button>

      {open && (
        <>
          <style>{`
            .sot-pop{
              position:absolute;top:calc(100% + 10px);right:0;left:auto;
              z-index:50;width:min(660px,86vw);max-height:62vh;overflow-y:auto;
              background:${COLORS.cream};border:1.5px solid ${COLORS.ink};
              box-shadow:6px 6px 0 ${COLORS.ink};padding:0;text-align:left;cursor:default;
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
          aria-label="The sources behind the consensus"
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
              background: COLORS.cream,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 12,
              margin: 0,
              padding: '16px 16px 10px',
              borderBottom: `1px solid ${COLORS.ink}`,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: COLORS.ember,
                  marginBottom: 4,
                }}
              >
                The Sources
              </div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: COLORS.faded }}>
                {sources.length} publications, with how many lists each shapes
              </div>
            </div>
            <Link
              href="/sources"
              style={{
                flex: '0 0 auto',
                fontFamily: 'DM Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: COLORS.ink,
                textDecoration: 'none',
                borderBottom: `1.5px solid ${COLORS.ember}`,
                paddingBottom: 2,
              }}
            >
              See all &#8594;
            </Link>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <SourcesGrid sources={sources} />
          </div>
        </div>
        </>
      )}
    </span>
  );
}
