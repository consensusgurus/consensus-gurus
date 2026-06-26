'use client';
import React from 'react';
import { RotateCcw, Share2, ListChecks } from 'lucide-react';

// Persistent end-of-quiz results panel.
//
// Every quiz board ends by popping the shared QuizResultModal, but that modal is
// dismissable (its X sets the board's `dismissed`/`reviewing` flag). On the
// map/geo/globe/timed boards the play area behind the modal was EMPTY once the
// popup was closed, so a finished game showed a blank screen. This panel renders
// in that same spot so dismissing the popup reveals a real results screen: the
// final score, an answer key (the correct answers, with how the player did), and
// a Play Again button — plus See full results (reopens the popup) and Share.
//
// Props:
//   score, total      — the final tally, printed once.
//   rows              — optional answer-key rows: [{ label, detail?, sub?, good? }].
//                       label = the correct answer; detail = small note (e.g. "0.3 mi off");
//                       sub = trailing points (e.g. "+80"); good = green-highlight a strong row.
//                       Omit on boards that already reveal their answers (a grid behind the modal).
//   answersTitle      — heading above the rows.
//   onPlayAgain, onShare, onResults — handlers; a missing one hides its button.

const C = { cream: '#f7f8fa', paper: '#eceef1', ink: '#1c1e24', ember: '#2563eb', forest: '#10b981', faded: '#6b7280' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function solid(bg, fg) {
  return { fontFamily: FONT, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '0 18px', lineHeight: '42px', border: 'none', borderRadius: 10, background: bg, color: fg, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 };
}
function outline() {
  return { fontFamily: FONT, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '0 18px', lineHeight: '42px', borderRadius: 10, background: '#fff', color: C.ink, border: `1.5px solid ${C.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 };
}

export default function QuizDoneRecap({ score, total, rows = null, answersTitle = 'The answers', onPlayAgain, onShare, onResults }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', background: C.paper, borderRadius: 12, border: `1px solid ${C.faded}33`, padding: '14px 18px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{score}<span style={{ fontSize: 18, color: C.faded }}>/{total}</span></div>
          <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faded, marginTop: 4 }}>Final score</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {onPlayAgain ? <button onClick={onPlayAgain} style={solid(C.ember, '#fff')}><RotateCcw size={14} strokeWidth={2.5} /> Play Again</button> : null}
          {onResults ? <button onClick={onResults} style={outline()}><ListChecks size={14} strokeWidth={2.5} /> See full results</button> : null}
          {onShare ? <button onClick={onShare} style={solid(C.ink, C.cream)}><Share2 size={14} strokeWidth={2.5} /> Share</button> : null}
        </div>
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
