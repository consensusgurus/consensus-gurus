'use client';
import React from 'react';
import { RotateCcw, Shuffle, Share2 } from 'lucide-react';

// Persistent end-of-quiz results panel.
//
// Every quiz board ends by popping a results popup (the QuizResultModal on the
// map/geo/globe/timed/grid boards, the Game Over overlay in QuizClient), which
// is dismissable. This panel renders in the play area so closing the popup
// reveals a usable results screen instead of nothing: a compact header (final
// score, then Play Again / Play Similar / Share) and, where supplied, an answer
// key (the correct answers and how the player did).
//
// Props:
//   score, total      — the final tally, printed once (omit with hideScore when
//                       the board already shows a live scoreboard while ended).
//   hideScore         — drop the score line, render just the action buttons.
//   rows              — optional answer-key rows: [{ label, detail?, sub?, good? }].
//   answersTitle      — heading above the rows.
//   onPlayAgain, onPlaySimilar, onShare — handlers; a missing one drops its button.

const C = { cream: '#f7f8fa', paper: '#eceef1', ink: '#1c1e24', ember: '#2563eb', forest: '#10b981', faded: '#6b7280' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function btn(bg, fg, outline) {
  return { fontFamily: FONT, fontSize: 11, letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 700, padding: '0 6px', lineHeight: '42px', border: outline ? `1.5px solid ${C.ink}` : 'none', borderRadius: 10, background: bg, color: fg, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden' };
}

export default function QuizDoneRecap({ score, total, hideScore = false, rows = null, answersTitle = 'The answers', onPlayAgain, onPlaySimilar, onShare }) {
  const btns = [];
  if (onPlayAgain) btns.push(<button key="a" onClick={onPlayAgain} style={btn(C.ember, '#fff')}><RotateCcw size={13} strokeWidth={2.5} /> Play Again</button>);
  if (onPlaySimilar) btns.push(<button key="s" onClick={onPlaySimilar} style={btn(C.forest, '#fff')}><Shuffle size={13} strokeWidth={2.5} /> Play Similar</button>);
  if (onShare) btns.push(<button key="h" onClick={onShare} style={btn(C.ink, C.cream)}><Share2 size={13} strokeWidth={2.5} /> Share</button>);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ background: C.paper, borderRadius: 12, border: `1px solid ${C.faded}33`, padding: hideScore ? '12px 14px' : '13px 14px' }}>
        {hideScore ? null : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{score}<span style={{ fontSize: 17, color: C.faded }}>/{total}</span></div>
            <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faded }}>Final score</div>
          </div>
        )}
        {btns.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${btns.length}, minmax(0, 1fr))`, gap: 8 }}>
            {btns}
          </div>
        ) : null}
      </div>

      {rows && rows.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.ember, fontWeight: 700, marginBottom: 10 }}>{answersTitle}</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {rows.map((r, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1px solid ${r.good ? C.forest : C.faded + '33'}`, marginBottom: 8, background: r.good ? '#fff' : C.paper }}>
                <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.faded, minWidth: 20 }}>{i + 1}</span>
                <span style={{ flex: 1, fontFamily: FONT, fontSize: 15, fontWeight: 600 }}>{r.label}</span>
                {r.detail != null ? <span style={{ fontFamily: FONT, fontSize: 12, color: C.faded }}>{r.detail}</span> : null}
                {r.sub != null ? <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: r.good ? C.forest : C.faded, minWidth: 44, textAlign: 'right' }}>{r.sub}</span> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
