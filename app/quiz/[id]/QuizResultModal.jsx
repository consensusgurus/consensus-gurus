'use client';
import React, { useEffect } from 'react';

// Shared full-screen results popup for every quiz board.
//
// Replaces the old inline results card that sat UNDER the live in-game
// scoreboard HUD (which left the same score printed three times on the page).
// This renders as a centered modal over a dimmed/blurred backdrop, so the game
// chrome behind it is no longer legible and the final score appears exactly
// once. The board passes the already-computed pieces as props/slots:
//   eyebrow     small uppercase tag ("Ended early" / "Final score" / ...)
//   score,total the single big score readout
//   headline    the one-line result summary (placed/percentile/top-score)
//   subline     the "high score to beat" sentence
//   leaderboard  <LeaderboardSnippet ... fill /> node (optional)
//   standings    <QuizStandings ... fill /> node (optional)
//   actions      the action buttons (Play again / Share / Report / ...)
//   children     optional recap content shown inside the scrollable card
//
// The board keeps ownership of all handlers; this component is presentational.

const C = {
  cream: '#f7f8fa',
  ink: '#1c1e24',
  ember: '#2563eb',
  faded: '#6b7280',
};
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function QuizResultModal({
  open,
  eyebrow,
  score,
  total,
  headline,
  subline,
  leaderboard = null,
  standings = null,
  actions = null,
  children = null,
}) {
  // Lock background scroll while the popup is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
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
          width: '100%',
          maxWidth: 520,
          margin: 'auto',
          background: C.cream,
          borderRadius: 16,
          boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
          padding: 'clamp(22px, 4.5vw, 34px)',
        }}
      >
        {/* Summary — the score, printed once */}
        <div style={{ textAlign: 'center' }}>
          {eyebrow ? (
            <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginBottom: 10 }}>
              {eyebrow}
            </div>
          ) : null}
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(46px, 13vw, 58px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {score}
            <span style={{ fontSize: 'clamp(22px, 6vw, 28px)', color: C.faded }}>/{total}</span>
          </div>
          {headline ? (
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 'clamp(17px, 4.6vw, 20px)', lineHeight: 1.2, margin: '12px 0 8px' }}>
              {headline}
            </div>
          ) : null}
          {subline ? (
            <p style={{ fontFamily: FONT, fontSize: 14.5, color: C.faded, maxWidth: 420, margin: '0 auto' }}>
              {subline}
            </p>
          ) : null}
        </div>

        {/* Standing — leaderboard + ELO, side by side then stacked on mobile */}
        {(leaderboard || standings) ? (
          <div className="qzm-row" style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap', alignItems: 'stretch' }}>
            {leaderboard}
            {standings}
          </div>
        ) : null}

        {/* Actions */}
        {actions ? (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
            {actions}
          </div>
        ) : null}

        {/* Optional recap (revealed map / globe / per-question summary) */}
        {children ? (
          <div style={{ marginTop: 22 }}>{children}</div>
        ) : null}

        <style>{`@media(max-width:440px){.qzm-row{flex-direction:column !important;}}`}</style>
      </div>
    </div>
  );
}
