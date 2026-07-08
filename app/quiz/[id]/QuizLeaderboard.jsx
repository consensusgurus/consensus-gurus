'use client';
import React, { useState } from 'react';
import { LB_POPS, LB_FILTERS, pickLb, lbEmptyNote } from '@/lib/quiz-lb';

// Shared full leaderboard element (owner rule, 2026-07-02).
//
// The complete leaderboard the quiz results and the Leaderboard tab both show:
// the "best score · N plays" header, the Registered/All-players and
// All/Mobile/First-try toggles, and the ranked table with the player's row
// highlighted. Self-contained (own toggle state); pass the board payload,
// identity, and the quiz total. No "Quiz stats" boxes (that info lives in the
// header line), per the owner rule.

const C = { ink: '#1c1e24', ember: '#2563eb', faded: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)', accSoft: '#eef3ff', accBorder: '#cddffb' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function fmtTime(sec) { if (sec == null) return '—'; const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; }
function fmtWhen(ts) { try { const d = new Date(ts); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }

export default function QuizLeaderboard({ board, identity, total }) {
  const [lbPop, setLbPop] = useState('registered');
  const [lbFilter, setLbFilter] = useState('all');
  const bestLabel = board.best != null ? board.best : '—';
  const lb = pickLb(board, lbPop, lbFilter);
  const hasGuesses = lb.some((r) => r.guessesUsed != null);
  const gridCols = hasGuesses ? '40px 1fr 76px 70px 64px' : '40px 1fr 76px 64px';
  const lbRanks = [], lbTied = [];
  for (let i = 0; i < lb.length; i++) { const p = i > 0 && lb[i].score === lb[i - 1].score && lb[i].timeElapsed === lb[i - 1].timeElapsed; lbRanks[i] = p ? lbRanks[i - 1] : i + 1; }
  for (let i = 0; i < lb.length; i++) { const p = i > 0 && lb[i].score === lb[i - 1].score && lb[i].timeElapsed === lb[i - 1].timeElapsed; const n = i < lb.length - 1 && lb[i].score === lb[i + 1].score && lb[i].timeElapsed === lb[i + 1].timeElapsed; lbTied[i] = p || n; }
  const chip = (on) => ({ padding: '6px 14px', background: on ? '#fff' : 'transparent', color: on ? C.ink : C.soft, border: 'none', borderRadius: 7, fontFamily: FONT, fontSize: 11, letterSpacing: '0.04em', fontWeight: 700, cursor: 'pointer', boxShadow: on ? '0 1px 2px rgba(20,22,28,0.06)' : 'none' });
  return (
    <div>
      <style>{`.qlb-grid{grid-template-columns:40px 1fr 76px 70px 64px;}
@media(max-width:560px){.qlb-grid{grid-template-columns:34px 1fr 64px 56px;}.qlb-time{display:none;}}`}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.faded }}>Leaderboard</div>
        <div style={{ fontFamily: FONT, fontSize: 11, letterSpacing: '0.08em', color: C.faded }}>{bestLabel} best score · {board.plays} {board.plays === 1 ? 'play' : 'plays'}</div>
      </div>
      {board.plays > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, width: 'fit-content' }}>
          <div style={{ display: 'inline-flex', gap: 4, borderRadius: 10, background: '#eef1f5', padding: 4, width: 'fit-content' }}>
            {LB_POPS.map(([k, label]) => <button key={k} onClick={() => setLbPop(k)} style={chip(lbPop === k)}>{label}</button>)}
          </div>
          <div style={{ display: 'inline-flex', gap: 4, borderRadius: 10, background: '#eef1f5', padding: 4, width: 'fit-content' }}>
            {LB_FILTERS.map(([k, label]) => <button key={k} onClick={() => setLbFilter(k)} style={chip(lbFilter === k)}>{label}</button>)}
          </div>
        </div>
      )}
      {lb.length === 0 ? (
        <p style={{ fontFamily: FONT, fontStyle: 'italic', fontSize: 16, color: C.faded }}>{lbEmptyNote(lbFilter) || 'No one has posted a score yet. Be the first.'}</p>
      ) : (
        <div>
          <div className={hasGuesses ? 'qlb-grid' : undefined} style={{ display: 'grid', gridTemplateColumns: hasGuesses ? undefined : gridCols, gap: 8, padding: '0 14px 8px', fontFamily: FONT, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.faded }}>
            <span>#</span><span>Display Name</span><span style={{ textAlign: 'right' }}>Correct</span>{hasGuesses ? <span style={{ textAlign: 'right' }}>Guesses</span> : null}<span className={hasGuesses ? 'qlb-time' : undefined} style={{ textAlign: 'right' }}>Time</span>
          </div>
          {lb.map((row, i) => { const mine = identity && row.username === identity.username; return (
            <div key={i} className={hasGuesses ? 'qlb-grid' : undefined} style={{ display: 'grid', gridTemplateColumns: hasGuesses ? undefined : gridCols, gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? C.accSoft : '#fff', borderRadius: 10, border: `1px solid ${mine ? C.accBorder : C.line}` }}>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, color: lbRanks[i] <= 3 ? C.ember : C.faded }}>{lbTied[i] ? `T${lbRanks[i]}` : lbRanks[i]}</span>
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.userKey ? <a href={`/quizzes/hub?player=${encodeURIComponent(row.userKey)}`} style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px dotted ${C.faded}88` }}>{row.username}</a> : row.username}{mine ? ' (you)' : ''}{row.tryNum ? <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 400, color: C.faded, marginLeft: 6 }}>{row.tryNum > 1 ? '(retried)' : '(1st Try)'}</span> : ''}</span>
                {row.playedAt ? <span style={{ fontFamily: FONT, fontSize: 10.5, color: C.faded }}>{fmtWhen(row.playedAt)}</span> : null}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 14, textAlign: 'right' }}>{row.score}/{total}</span>
              {hasGuesses ? <span style={{ fontFamily: FONT, fontSize: 14, textAlign: 'right', color: C.faded }}>{row.guessesUsed != null ? row.guessesUsed : '\u2014'}</span> : null}
              <span className={hasGuesses ? 'qlb-time' : undefined} style={{ fontFamily: FONT, fontSize: 14, textAlign: 'right', color: C.faded }}>{fmtTime(row.timeElapsed)}</span>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}
