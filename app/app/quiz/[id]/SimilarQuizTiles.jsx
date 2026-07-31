'use client';
import React from 'react';
import { tileHero } from '@/lib/quiz-tile-hero';

// Shared "Similar quizzes" tile grid used by every non-daily quiz board (the
// inline end screen in QuizClient and the shared QuizResultModal). Each tile
// carries a hero image resolved via tileHero(); quizzes without a registered
// hero fall back to a deterministic gradient + monogram so a tile is never blank.

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const GRADS = [
  'linear-gradient(135deg, #1f6feb 0%, #0b3ea6 100%)',
  'linear-gradient(135deg, #3f4756 0%, #1c1e24 100%)',
  'linear-gradient(135deg, #0f8a6a 0%, #094b3a 100%)',
  'linear-gradient(135deg, #7a5cf0 0%, #3a2b8c 100%)',
];

function initial(title) {
  return String(title || '?').replace(/^(the|a|an)\s+/i, '').charAt(0).toUpperCase();
}

export default function SimilarQuizTiles({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      {items.map((rq, i) => {
        const hero = tileHero(rq);
        const grad = GRADS[i % GRADS.length];
        return (
          <a key={rq.id} href={`/quiz/${rq.id}`} style={{ position: 'relative', display: 'block', textDecoration: 'none', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(20,22,28,0.30)', background: '#1c1e24', aspectRatio: '16 / 10', boxShadow: '0 1px 2px rgba(20,22,28,0.06)' }}>
            <div style={{ position: 'absolute', inset: 0, background: grad }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 64, fontWeight: 800, letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.16)' }}>{initial(rq.title)}</div>
            {hero ? (
              <img src={hero.src} alt="" referrerPolicy="no-referrer" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: hero.pos }} />
            ) : null}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,20,0) 34%, rgba(12,14,20,0.35) 58%, rgba(12,14,20,0.9) 100%)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '13px 14px' }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e7cf73', fontWeight: 800, marginBottom: 5, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{rq.category || 'Quiz'}</div>
              <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, lineHeight: 1.14, color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>{rq.title}</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
