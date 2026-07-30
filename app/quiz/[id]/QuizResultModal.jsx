'use client';
import React, { useMemo } from 'react';
import { RotateCcw, Swords } from 'lucide-react';
import { QUIZZES } from '@/lib/quizzes';
import SimilarQuizTiles from './SimilarQuizTiles';
import UpNextCard from './UpNextCard';
import ScrollToTopOnMount from './ScrollToTopOnMount';
import RegisterRankLine from './RegisterRankLine';
import { registerRank } from '@/lib/quiz-lb';

// Shared end-of-game results for every quiz board (owner rule, 2026-07-02).
//
// This used to be a dismissable popup over a dimmed backdrop. It is now an
// INLINE results panel rendered in normal page flow (no portal, no overlay, no
// close X), matching the QuizClient results screen so every quiz type looks the
// same: score + percentile top-left, placement number top-right, the two
// stacked actions (Play again, Challenge a friend), a "Similar quizzes" grid,
// then the full leaderboard element the board passes in, then a Report link.
//
// The board still controls visibility with `open` and places this component
// where the results should appear. onClose / onPlaySimilar / onLeaderboard are
// accepted for back-compat but ignored (no popup to close; Play similar was
// replaced by the Similar quizzes grid; the leaderboard is shown inline).
//
// Props: open, eyebrow, score, total, headline, subline, placement (number|null
// for the top-right rank), leaderboard (node = the full leaderboard element),
// standings (node), quiz (Challenge + Similar quizzes), onPlayAgain, onReport.

const C = { cream: '#f7f8fa', ink: '#1c1e24', ember: '#0e1d40', forest: '#10b981', faded: '#4b5563', line: 'rgba(20,22,28,0.16)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";
const stackBtn = { fontFamily: FONT, fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 700, borderRadius: 10, padding: '14px 12px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', boxSizing: 'border-box', textDecoration: 'none' };

export default function QuizResultModal({
  open,
  eyebrow,
  score,
  total,
  headline,
  subline,
  leaderboard = null,
  standings = null,
  quiz = null,
  placement = null,
  board = null,
  identity = null,
  lastElapsed = null,
  onRegister = null,
  onPlayAgain,
  onReport,
  onClose, onPlaySimilar, onLeaderboard,
}) {
  const duelHref = quiz && quiz.id ? `/duel/new?quiz=${encodeURIComponent(quiz.id)}` : null;
  const regRank = (!identity && onRegister && board) ? registerRank(board.leaderboard, score, lastElapsed) : null;
  const similar = useMemo(() => {
    if (!quiz) return [];
    const stripped = quiz.id.replace(/-\d+$/, '');
    const fam = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated && x.id.replace(/-\d+$/, '') === stripped);
    const cat = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated && quiz.category && x.category === quiz.category);
    const rest = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated);
    const seen = new Set();
    const out = [];
    for (const x of [...fam, ...cat, ...rest]) { if (!seen.has(x.id)) { seen.add(x.id); out.push(x); } }
    return out.slice(0, 8);
  }, [quiz]);

  if (!open) return null;

  return (
    <div style={{ maxWidth: 640, margin: '16px auto 0' }}>
      <ScrollToTopOnMount />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div>
          {eyebrow ? <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginBottom: 6 }}>{eyebrow}</div> : null}
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, lineHeight: 1 }}>{score}<span style={{ fontSize: 22, color: C.faded }}> / {total}</span></div>
          {(headline || subline) ? <p style={{ fontFamily: FONT, fontSize: 13, color: '#4a4339', margin: '6px 0 0' }}>{headline}{headline && subline ? ' · ' : ''}{subline}</p> : null}
        </div>
        {placement != null ? (
          <div style={{ textAlign: 'right', flex: 'none' }}>
            <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 800, color: C.faded, marginBottom: 2 }}>You placed</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 46, lineHeight: 1, color: C.ember }}>#{placement}</div>
          </div>
        ) : null}
      </div>

      <RegisterRankLine rank={regRank} onRegister={onRegister} />

      {standings ? <div style={{ marginBottom: 12 }}>{standings}</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {onPlayAgain ? <button onClick={onPlayAgain} style={{ ...stackBtn, background: '#e8b43a', color: '#1c1e24' }}><RotateCcw size={15} strokeWidth={2.5} /> Play again</button> : null}
        <UpNextCard quiz={quiz} />
        {duelHref ? <a href={duelHref} style={{ ...stackBtn, background: C.ink, color: '#fff' }}><Swords size={15} strokeWidth={2.5} /> Challenge a friend</a> : null}
      </div>

      {similar.length > 0 ? (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, marginBottom: 16 }}>Similar quizzes</div>
          <SimilarQuizTiles items={similar} />
        </div>
      ) : null}

      {leaderboard ? <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>{leaderboard}</div> : null}

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        {onReport ? <button onClick={onReport} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', fontFamily: FONT, fontSize: 12, fontWeight: 600, color: C.faded, textDecoration: 'underline', textUnderlineOffset: 3 }}>Report an error</button> : null}
      </div>
    </div>
  );
}
