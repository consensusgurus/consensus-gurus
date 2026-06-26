'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, Shuffle, Trophy, Share2 } from 'lucide-react';

// Shared full-screen results popup for every quiz board.
//
// Standard end-of-game layout (one place, used by every board so they stay in
// sync): a dismissable centered card over a dimmed/blurred backdrop, rendered
// through a portal to document.body so it sits above all page chrome. Shows the
// score once, the ELO standing + leaderboard, then a 2-column action grid
//   [ Play Again | Play Similar ]
//   [ Leaderboard | Share       ]
// and a small "Report an error" text link. An X in the top-right closes the
// popup (the board controls `open`, so closing reveals the page behind).
//
// Props: open, onClose (X), eyebrow, score, total, headline, subline,
// leaderboard / standings nodes, and the onPlayAgain / onPlaySimilar /
// onLeaderboard / onShare / onReport handlers. A handler left undefined hides
// its control.

const C = {
  cream: '#f7f8fa',
  ink: '#1c1e24',
  ember: '#2563eb',
  forest: '#10b981',
  faded: '#6b7280',
};
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const cellBase = {
  fontFamily: FONT,
  fontSize: 13,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  fontWeight: 700,
  lineHeight: '46px',
  width: '100%',
  padding: '0 8px',
  boxSizing: 'border-box',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

export default function QuizResultModal({
  open,
  onClose,
  eyebrow,
  score,
  total,
  headline,
  subline,
  leaderboard = null,
  standings = null,
  onPlayAgain,
  onPlaySimilar,
  onLeaderboard,
  onShare,
  onReport,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(12px, 4vw, 44px) clamp(10px, 3vw, 24px)',
        background: 'rgba(17, 19, 24, 0.72)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          margin: 'auto',
          background: C.cream,
          borderRadius: 16,
          boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
          padding: 'clamp(22px, 4.5vw, 32px)',
        }}
      >
        {/* Close (X) */}
        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 34,
              height: 34,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              border: `1px solid ${C.faded}33`,
              background: '#fff',
              color: C.faded,
              cursor: 'pointer',
            }}
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        ) : null}

        {/* Summary — the score, printed once */}
        <div style={{ textAlign: 'center', padding: '0 28px' }}>
          {eyebrow ? (
            <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginBottom: 10 }}>
              {eyebrow}
            </div>
          ) : null}
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(44px, 12vw, 56px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {score}
            <span style={{ fontSize: 'clamp(22px, 6vw, 28px)', color: C.faded }}>/{total}</span>
          </div>
          {headline ? (
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(16px, 4.4vw, 19px)', lineHeight: 1.2, margin: '12px 0 8px' }}>
              {headline}
            </div>
          ) : null}
          {subline ? (
            <p style={{ fontFamily: FONT, fontSize: 14, color: C.faded, maxWidth: 400, margin: '0 auto' }}>
              {subline}
            </p>
          ) : null}
        </div>

        {/* Leaderboard + ELO standing, stacked full width */}
        {(leaderboard || standings) ? (
          <div style={{ marginTop: 18 }}>
            {leaderboard}
            {standings ? <div style={{ marginTop: 12 }}>{standings}</div> : null}
          </div>
        ) : null}

        {/* Action grid: [Play Again | Play Similar] / [Leaderboard | Share] */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
          {onPlayAgain ? (
            <button onClick={onPlayAgain} style={{ ...cellBase, background: C.ember, color: '#fff' }}>
              <RotateCcw size={14} strokeWidth={2.5} /> Play Again
            </button>
          ) : <span />}
          {onPlaySimilar ? (
            <button onClick={onPlaySimilar} style={{ ...cellBase, background: C.forest, color: '#fff' }}>
              <Shuffle size={14} strokeWidth={2.5} /> Play Similar
            </button>
          ) : <span />}
          {onLeaderboard ? (
            <button onClick={onLeaderboard} style={{ ...cellBase, background: '#fff', color: C.ink, border: `1.5px solid ${C.ink}` }}>
              <Trophy size={14} strokeWidth={2.5} /> Leaderboard
            </button>
          ) : <span />}
          {onShare ? (
            <button onClick={onShare} style={{ ...cellBase, background: C.ink, color: C.cream }}>
              <Share2 size={14} strokeWidth={2.5} /> Share
            </button>
          ) : <span />}
        </div>

        {/* Report link */}
        {onReport ? (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={onReport} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.faded, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Report an error
            </button>
          </div>
        ) : null}

      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
