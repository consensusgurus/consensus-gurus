'use client';
import { useEffect } from 'react';

// Mounts only when a quiz's end screen appears (the result card / QuizResultModal
// render on finish), then smooth-scrolls the window to the top so the score and
// the Play again button land in view instead of leaving the player stranded
// partway down a tall board.
export default function ScrollToTopOnMount() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }, []);
  return null;
}
