'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Fullscreen live-play popup for mobile quiz play.
//
// When `open`, the play surface (HUD + answer board) is rendered as a fixed,
// app-like overlay portaled to document.body. When NOT open (desktop, or before
// Play is pressed), it renders its children inline exactly as before, so the page
// layout is untouched. There is intentionally NO close control: a game is left
// only by finishing it or letting the timer expire (owner ruling).
//
// The overlay TRACKS THE VISUAL VIEWPORT (top/left/size follow
// window.visualViewport) so that when the on-screen keyboard opens, the overlay
// is exactly the visible area ABOVE the keyboard. This is what makes the whole
// board scrollable to the very top: with a plain `inset:0` overlay, iOS scrolls
// the page underneath the position:fixed overlay when an input is focused, which
// strands the top rows above the visible area with no way to scroll back. Pinning
// the overlay to the visual viewport removes that, and keeps a bottom-docked input
// (position:fixed, bottom:kbInset) aligned to the top of the keyboard.

export default function QuizPlayOverlay({ open, background = '#f7f8fa', children }) {
  const [vp, setVp] = useState(null); // { top, left, width, height } from visualViewport

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    const update = () => {
      if (vv) setVp({ top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height });
    };
    update();
    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    return () => {
      document.body.style.overflow = prev;
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
    };
  }, [open]);

  if (!open) return <>{children}</>;
  if (typeof document === 'undefined') return <>{children}</>;

  // Pin to the visual viewport when we have it; otherwise fall back to the full
  // layout viewport.
  const pos = vp
    ? { top: vp.top, left: vp.left, width: vp.width, height: vp.height }
    : { inset: 0 };

  const overlay = (
    <div
      style={{
        position: 'fixed',
        ...pos,
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
