'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { nextQuizMeta } from '@/lib/quiz-similar';
import { getQuiz } from '@/lib/quizzes';
import { useChallengeRun } from './useChallengeRun';
import { T } from '@/lib/theme';

// Auto-advance "Up next" card shown on the end-of-quiz recap, directly under the
// Play again button (mirrors the daily-game end card's countdown-to-next-game).
// It counts down (default 25s) and then opens the CLOSEST related quiz, computed
// by nextQuizMeta (next unplayed series part, else same category / department,
// else any unplayed). "Not now" cancels the countdown but keeps a manual link.
//
// Self-suppresses (renders nothing) when there is no related quiz to offer, and
// during a Daily Challenge run, where the challenge overlay owns advancing to
// the next step (detected via useChallengeRun on this quiz's id).
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const BLUE = T.blue;
const RING_C = 150.8; // 2*pi*24

export default function UpNextCard({ quiz, seconds = 25 }) {
  const { runActive } = useChallengeRun(quiz && quiz.id ? quiz.id : '');
  const meta = useMemo(() => {
    if (typeof window === 'undefined' || !quiz) return null;
    try { return nextQuizMeta(quiz); } catch (e) { return null; }
  }, [quiz]);

  const [secs, setSecs] = useState(seconds);
  const [cancelled, setCancelled] = useState(false);
  const autoRun = !!meta && !runActive && !cancelled;

  useEffect(() => {
    if (!autoRun) return undefined;
    if (secs <= 0) {
      if (typeof window !== 'undefined' && meta) window.location.href = `/quiz/${meta.id}`;
      return undefined;
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [autoRun, secs, meta]);

  if (!meta || runActive) return null;

  const cat = (() => {
    try { const q = getQuiz(meta.id); return q && q.category ? q.category : 'Quiz'; } catch (e) { return 'Quiz'; }
  })();
  const ringOffset = autoRun ? (RING_C * (seconds - secs)) / seconds : 0;
  const tag = `${cat} · Quiz${autoRun ? (secs > 0 ? ` · opens in ${secs}s` : ' · opening…') : ''}`;
  const mini = { fontFamily: FONT, fontWeight: 700, fontSize: 12, borderRadius: 9, padding: '9px 13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none', whiteSpace: 'nowrap', border: 'none' };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, border: `1px solid ${T.accentBorder}`, background: T.accentSoft, borderRadius: 14, padding: '13px 15px' }}>
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r="24" fill="none" stroke="#dbe6f7" strokeWidth="5" />
          <circle cx="28" cy="28" r="24" fill="none" stroke={BLUE} strokeWidth="5" strokeLinecap="round" transform="rotate(-90 28 28)" strokeDasharray={RING_C} strokeDashoffset={ringOffset} />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 18, fontWeight: 800, color: T.ink }}>
          {autoRun ? (secs > 0 ? secs : '') : <ArrowRight size={18} strokeWidth={2.4} color={BLUE} />}
        </span>
      </div>
      <div style={{ minWidth: 0, flex: '1 1 200px' }}>
        <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: BLUE, marginBottom: 2 }}>Up next · closest related{meta.badge ? ` · part ${meta.badge.part} of ${meta.badge.total}` : ''}</div>
        <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15, color: T.ink }}>{meta.title}</div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: 'var(--stg-ink2,#4a4339)', marginTop: 2 }}>{tag}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
        <a href={`/quiz/${meta.id}`} style={{ ...mini, background: BLUE, color: T.white }}>Go to quiz</a>
        {autoRun ? <button onClick={() => setCancelled(true)} style={{ ...mini, background: `var(--stg-surf,${T.white})`, color: `var(--stg-mute,${T.muted})`, border: '1px solid rgba(20,22,28,0.14)' }}>Not now</button> : null}
      </div>
    </div>
  );
}
