'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Slim mobile-only quiz header: a back control + the quiz title, replacing the
// full SiteHeader so the game gets the screen. Used by QuizClient AND the three
// full-page boards (TimedMcq, LogicGrid, GridFill) so every format's mobile
// chrome is identical. Not sticky by design — the score/timer block beneath it
// is the element that pins to the top on scroll, consistently across formats.
export default function QuizMobileHeader({ title }) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderBottom: '1px solid rgba(20,22,28,0.10)', background: '#f7f8fa' }}>
      <button onClick={() => router.push('/quizzes')} aria-label="Back to quizzes" style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(20,22,28,0.14)', background: '#fff', color: '#15181d', cursor: 'pointer' }}>
        <ArrowLeft size={18} strokeWidth={2.4} />
      </button>
      <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: "'Manrope', system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: '#15181d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
    </div>
  );
}
