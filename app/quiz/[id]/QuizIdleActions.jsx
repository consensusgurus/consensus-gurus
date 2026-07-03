'use client';
import React from 'react';
import { Swords, Trophy } from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';

// Standard pre-quiz (idle screen) action block, shared by EVERY board format
// (owner rule, 2026-07-02): START on its own full-width line (double height on
// desktop, normal on mobile), then Challenge Someone + Leaderboard side by side
// below. All three buttons share the same rounded-rect shape (no pill). The
// covered-board intro card on every quiz page renders this so the pre-quiz
// screen is identical across formats.

const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const C = { cream: '#f7f8fa', ink: '#1c1e24', ember: '#2563eb' };

export default function QuizIdleActions({ onStart, startLabel = 'Start', startDisabled = false, quizId, onLeaderboard, style }) {
  const _q = QUIZZES.find((x) => x.id === quizId);
  const similar = React.useMemo(() => {
    if (!_q) return [];
    const stripped = _q.id.replace(/-\d+$/, '');
    const pool = QUIZZES.filter((x) => x.id !== _q.id && !x.hideFromRelated);
    const fam = pool.filter((x) => x.id.replace(/-\d+$/, '') === stripped);
    const cat = pool.filter((x) => _q.category && x.category === _q.category);
    const seen = new Set(); const out = [];
    for (const x of [...fam, ...cat, ...pool]) { if (!seen.has(x.id)) { seen.add(x.id); out.push(x); } }
    return out.slice(0, 6);
  }, [quizId]);
  const base = {
    fontFamily: FONT, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700,
    height: 52, padding: '0 10px', boxSizing: 'border-box', borderRadius: 10,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    border: 'none', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
  };
  const startStyle = { ...base };
  delete startStyle.height; // height comes from the .qz-start class (2x on desktop, 1x on mobile)
  delete startStyle.fontSize; // font-size (and letter-spacing) come from the .qz-start class so it isn't overridden by the inline base
  delete startStyle.letterSpacing;
  return (
    <div style={{ maxWidth: 640, margin: '16px auto 0', ...style }}>
      <style>{`.qz-start{height:104px;font-size:21px;letter-spacing:0.08em;}@media (max-width:760px){.qz-start{height:52px;font-size:12.5px;letter-spacing:0.05em;}}`}</style>
      <button className="qz-start" onClick={onStart} disabled={startDisabled} style={{ ...startStyle, width: '100%', background: C.ember, color: '#fff', opacity: startDisabled ? 0.5 : 1, cursor: startDisabled ? 'default' : 'pointer' }}>
        {startLabel}
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 10 }}>
        <a href={`/duel/new?quiz=${encodeURIComponent(quizId || '')}`} style={{ ...base, background: C.ink, color: '#fff' }}>
          <Swords size={14} strokeWidth={2.5} /> Challenge Someone
        </a>
        <button onClick={onLeaderboard} style={{ ...base, background: C.cream, color: C.ink, border: `1.5px solid ${C.ink}` }}>
          <Trophy size={14} strokeWidth={2.5} /> Leaderboard
        </button>
      </div>
      {similar.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginBottom: 12, textAlign: 'left' }}>Similar quizzes</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {similar.map((rq) => (
              <a key={rq.id} href={`/quiz/${rq.id}`} style={{ textDecoration: 'none', color: '#fff', background: '#2563eb', borderRadius: 10, border: '1px solid #2563eb', padding: '12px 14px', display: 'block', textAlign: 'left' }}>
                <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', fontWeight: 700, marginBottom: 6 }}>{rq.category || 'Quiz'}</div>
                <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{rq.title}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
