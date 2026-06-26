'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Fullscreen live-play popup for mobile quiz play.
//
// When `open`, the play surface (HUD + answer board) is rendered as a fixed,
// full-viewport, app-like overlay portaled to document.body. It covers the site
// header/footer and locks background scroll, so a phone player sees nothing but
// the game. When NOT open (desktop, or before Play is pressed), this renders its
// children inline exactly as before, so the page layout is untouched.
//
// There is intentionally NO close control: an in-progress game is left only by
// finishing it or letting the timer expire (owner ruling, 2026-06-25). The
// caller keeps ownership of all game state and handlers; this component is a
// presentational shell. Toggling `open` moves the same children between the
// inline tree and the portal, which remounts the play subtree once at Play
// press; the caller refocuses the input (via flushSync) so the mobile keyboard
// opens within the Play gesture.

export default function QuizPlayOverlay({ open, background = '#f7f8fa', children }) {
  // Lock background scroll while the overlay owns the screen.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return <>{children}</>;
  if (typeof document === 'undefined') return <>{children}</>;

  const overlay = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background,
        color: '#1c1e24',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        padding: '12px 14px 0',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );

  return createPortal(overlay, document.body);
}
