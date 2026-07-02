'use client';
import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw, Shuffle, Trophy, Swords, Play } from 'lucide-react';
import { nextQuizMeta } from '@/lib/quiz-similar';

// Shared full-screen results popup for every quiz board.
//
// Standard end-of-game layout (one place, used by every board so they stay in
// sync): a dismissable centered card over a dimmed/blurred backdrop, rendered
// through a portal to document.body so it sits above all page chrome. Shows the
// score once, the ELO standing + leaderboard, then a 2-column action grid
//   [ Play Again | Play Similar ]
//   [ Leaderboard | Challenge Someone ]
// and a small "Report an error" text link. An X in the top-right closes the
// popup (the board controls `open`, so closing reveals the page behind).
//
// Props: open, onClose (X), eyebrow, score, total, headline, subline,
// leaderboard / standings nodes, and the onPlayAgain / onPlaySimilar /
// onLeaderboard / onReport handlers. A handler left undefined hides its
// control. The Challenge Someone cell links to the duel composer with this
// quiz prefilled (shown whenever `quiz` is supplied); the old onShare prop is
// accepted but ignored.

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
  quiz = null,
  onPlayAgain,
  onPlaySimilar,
  onLeaderboard,
  onReport,
}) {
  // The "play next" pick shown by title on the Play Similar cell (next unplayed
  // series part, else unplayed same category/department). Navigation is still
  // onPlaySimilar, which resolves to the same deterministic pick.
  const nextMeta = useMemo(() => {
    if (typeof window === 'undefined' || !quiz) return null;
    try { return nextQuizMeta(quiz); } catch (e) { return null; }
  }, [quiz]);
  // End-game duel CTA: straight into the duel composer with this quiz picked.
  const duelHref = quiz && quiz.id ? `/duel/new?quiz=${encodeURIComponent(quiz.id)}` : null;
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

        {/* Summary (left) and leaderboard (right), side by side to save height */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 2 }}>
          <div style={{ flex: '1 1 0', minWidth: 0, textAlign: 'center' }}>
            {eyebrow ? (
              <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.ember, marginBottom: 6 }}>
                {eyebrow}
              </div>
            ) : null}
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 'clamp(34px, 10vw, 46px)', lineHeight: 1, letterSpacing: '-0.02em' }}>
              {score}
              <span style={{ fontSize: 'clamp(18px, 5vw, 24px)', color: C.faded }}>/{total}</span>
            </div>
            {headline ? (
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, lineHeight: 1.2, margin: '8px 0 4px' }}>
                {headline}
              </div>
            ) : null}
            {subline ? (
              <p style={{ fontFamily: FONT, fontSize: 12.5, color: C.faded, margin: 0 }}>
                {subline}
              </p>
            ) : null}
          </div>
          {leaderboard ? (
            <div style={{ flex: '1 1 0', minWidth: 0 }}>{leaderboard}</div>
          ) : null}
        </div>

        {standings ? <div style={{ marginTop: 12 }}>{standings}</div> : null}

        {/* Actions: Play Again and Play Next each on their own full-width row,
            then Leaderboard + Share paired. */}
        <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
          {onPlayAgain ? (
            <button onClick={onPlayAgain} style={{ ...cellBase, background: C.ember, color: '#fff' }}>
              <RotateCcw size={14} strokeWidth={2.5} /> Play Again
            </button>
          ) : null}
          {onPlaySimilar ? (
            nextMeta ? (
              <button onClick={onPlaySimilar} title={nextMeta.title} style={{ ...cellBase, height: 'auto', minHeight: 46, lineHeight: 1.18, textTransform: 'none', letterSpacing: 0, padding: '8px 14px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 3, background: C.forest, color: '#fff' }}>
                <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.13em', textTransform: 'uppercase', fontWeight: 800, opacity: 0.9, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Play size={11} strokeWidth={3} /> {nextMeta.label}{nextMeta.badge ? ` · part ${nextMeta.badge.part} of ${nextMeta.badge.total}` : ''}</span>
                <span style={{ width: '100%', fontSize: 14, fontWeight: 700, lineHeight: 1.18 }}>{nextMeta.title}</span>
              </button>
            ) : (
              <button onClick={onPlaySimilar} style={{ ...cellBase, background: C.forest, color: '#fff' }}>
                <Shuffle size={14} strokeWidth={2.5} /> Play Similar
              </button>
            )
          ) : null}
          {(onLeaderboard || duelHref) ? (
            <div style={{ display: 'grid', gridTemplateColumns: onLeaderboard && duelHref ? 'repeat(auto-fit, minmax(170px, 1fr))' : '1fr', gap: 10 }}>
              {onLeaderboard ? (
                <button onClick={onLeaderboard} style={{ ...cellBase, background: '#fff', color: C.ink, border: `1.5px solid ${C.ink}` }}>
                  <Trophy size={14} strokeWidth={2.5} /> Leaderboard
                </button>
              ) : null}
              {duelHref ? (
                <a href={duelHref} style={{ ...cellBase, background: C.ink, color: C.cream, textDecoration: 'none', whiteSpace: 'nowrap', fontSize: 12, letterSpacing: '0.04em', gap: 6, borderRadius: 999 }}>
                  <Swords size={14} strokeWidth={2.5} /> Challenge Someone
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Footer links: duel ladder + report */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, marginTop: 14 }}>
          <a href="/quizzes/hub?tab=duels" style={{ padding: 4, fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.faded, textDecoration: 'underline', textUnderlineOffset: 3 }}>Duel Leaderboard</a>
          {onReport ? (
            <button onClick={onReport} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.faded, textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Report an error
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
