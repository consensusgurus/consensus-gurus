'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import QuizPlayerBar from '../../quiz/[id]/QuizPlayerBar';
import Grain from '../../Grain';
import Footer from '../../Footer';
import { QUIZZES } from '@/lib/quizzes';

const C = { bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.10)', accent: '#2563eb', accsoft: '#e8effb', gold: '#e8b43a', win: '#16a34a', lose: '#c0392b' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function anonId() { if (typeof window === 'undefined') return null; try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function storedName() { if (typeof window === 'undefined') return ''; try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')); return (j && j.username) || ''; } catch { return ''; } }
function fmtTime(s) { if (s == null) return ''; const m = Math.floor(s / 60), ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; }
function devLabel(d) { return d === 'mobile' ? 'Mobile only' : d === 'desktop' ? 'Desktop only' : ''; }

export default function DuelClient({ token }) {
  const [duel, setDuel] = useState(null);
  const [state, setState] = useState('loading');
  const [errCode, setErrCode] = useState('');
  const [me, setMe] = useState({ anon: null, name: '' });
  const [nameInput, setNameInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => { setMe({ anon: anonId(), name: storedName() }); setNameInput(storedName()); }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/duel/get?token=${encodeURIComponent(token)}`);
      const d = await r.json();
      if (d && d.duel) { setDuel(d.duel); setState('ready'); }
      else { setErrCode(d && d.error || 'error'); setState('error'); }
    } catch { setErrCode('error'); setState('error'); }
  }, [token]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!duel || duel.status === 'complete') return;
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, [duel, load]);

  const quiz = duel ? QUIZZES.find((q) => q.id === duel.quiz_id) : null;
  const quizTitle = quiz ? quiz.title : (duel ? duel.quiz_id : '');
  const dev = (duel && duel.device) || 'any';
  const side = duel && me.anon
    ? (duel.challenger_anon === me.anon ? 'challenger' : (duel.opponent_anon === me.anon ? 'opponent' : 'new'))
    : 'new';
  const myScore = side === 'challenger' ? duel?.challenger_score : side === 'opponent' ? duel?.opponent_score : null;
  const iSubmitted = myScore != null;

  async function submit() {
    setBusy(true); setMsg('');
    try {
      const nm = (nameInput || me.name || 'Player').trim().slice(0, 40);
      try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')) || {}; localStorage.setItem('sot_quiz_identity', JSON.stringify({ ...j, username: nm })); } catch {}
      const r = await fetch('/api/duel/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, anonId: me.anon, name: nm }) });
      const d = await r.json();
      if (d && d.duel) { setDuel(d.duel); setMe((m) => ({ ...m, name: nm })); }
      else if (d && d.error === 'no_play') setMsg(`Play ${quizTitle} first, then come back and submit your score.`);
      else if (d && d.error === 'device_mismatch') setMsg(`This duel is ${d.device} only. Play on ${d.device === 'mobile' ? 'your phone' : 'a computer'}, then submit.`);
      else if (d && d.error === 'duel_full') setMsg('This duel already has two players.');
      else setMsg('Could not submit. Try again.');
    } catch { setMsg('Could not submit. Try again.'); }
    setBusy(false);
  }

  function copyLink() {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + `/duel/${token}`;
    try { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); } catch {}
  }

  function Side({ who, name, score, total, time, winnerFlag }) {
    const waiting = score == null;
    return (
      <div style={{ flex: 1, minWidth: 0, background: winnerFlag ? C.accent : C.surface, color: winnerFlag ? '#fff' : C.ink, border: `1px solid ${winnerFlag ? C.accent : C.line}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: winnerFlag ? 'rgba(255,255,255,0.8)' : C.soft }}>{who}</div>
        <div style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || (who === 'Opponent' ? 'Waiting…' : 'Player')}</div>
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{waiting ? '—' : score}<span style={{ fontSize: 15, fontWeight: 700, color: winnerFlag ? 'rgba(255,255,255,0.75)' : C.soft }}>{waiting ? '' : `/${total}`}</span></div>
        <div style={{ fontSize: 12, fontWeight: 600, color: winnerFlag ? 'rgba(255,255,255,0.8)' : C.soft, marginTop: 6, minHeight: 16 }}>{waiting ? 'Not played yet' : (time != null ? fmtTime(time) : '')}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.ink, position: 'relative' }}>
      <Grain />
      <SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} />
      <div className="qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative' }}>
        <div className="qzf-line" aria-hidden="true" />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link href="/quizzes" style={{ fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>← Back to quizzes</Link>

          {state === 'loading' && <div style={{ marginTop: 40, color: C.soft, fontWeight: 600 }}>Loading duel…</div>}

          {state === 'error' && (
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{errCode === 'duels_not_ready' ? 'Duels are almost ready' : 'Duel not found'}</div>
              <div style={{ color: C.muted, marginBottom: 20 }}>{errCode === 'duels_not_ready' ? 'This feature is being switched on. Check back shortly.' : 'This duel link is invalid or has expired.'}</div>
              <Link href="/duel/new" style={{ background: C.accent, color: '#fff', padding: '11px 18px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Start a duel</Link>
            </div>
          )}

          {state === 'ready' && duel && (
            <>
              <div style={{ marginTop: 16, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.accent }}>Duel</span>
                {dev !== 'any' && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: C.ink, borderRadius: 999, padding: '3px 9px' }}>{devLabel(dev)}</span>}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 18px' }}>{quizTitle}</h1>

              <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                <Side who="Challenger" name={duel.challenger_name} score={duel.challenger_score} total={duel.challenger_total} time={duel.challenger_time} winnerFlag={duel.status === 'complete' && duel.winner === 'challenger'} />
                <div style={{ alignSelf: 'center', fontSize: 13, fontWeight: 800, color: C.soft }}>VS</div>
                <Side who="Opponent" name={duel.opponent_name} score={duel.opponent_score} total={duel.opponent_total} time={duel.opponent_time} winnerFlag={duel.status === 'complete' && duel.winner === 'opponent'} />
              </div>

              {duel.status === 'complete' && (
                <div style={{ marginTop: 18, textAlign: 'center', fontSize: 20, fontWeight: 800, color: duel.winner === 'tie' ? C.ink : (duel.winner === side ? C.win : (side === 'new' ? C.ink : C.lose)) }}>
                  {duel.winner === 'tie' ? "It's a tie!" : (duel.winner === side ? 'You win! 🏆' : (side === 'new' ? `${duel.winner === 'challenger' ? duel.challenger_name : duel.opponent_name} wins` : 'You lost'))}
                </div>
              )}

              {duel.status !== 'complete' && (
                <div style={{ marginTop: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
                  {iSubmitted ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Your score is in.</div>
                      <div style={{ color: C.muted, fontSize: 14 }}>Waiting for your opponent to play. Share the link below.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{side === 'challenger' ? 'Play your round' : `${duel.challenger_name} challenged you`}</div>
                      <div style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>Play {quizTitle}{dev !== 'any' ? ` on ${dev === 'mobile' ? 'your phone' : 'a computer'} (this duel is ${dev} only)` : ''}, then come back here and submit your score.</div>
                      {!me.name && (
                        <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="Your name" maxLength={40}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 14, marginBottom: 12, outline: 'none' }} />
                      )}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link href={`/quiz/${duel.quiz_id}`} style={{ flex: '1 1 160px', textAlign: 'center', background: C.accent, color: '#fff', padding: '12px 16px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Play the quiz →</Link>
                        <button onClick={submit} disabled={busy} style={{ flex: '1 1 160px', background: C.surface, color: C.accent, border: `1.5px solid ${C.accent}`, padding: '12px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>{busy ? 'Submitting…' : "I've played — submit my score"}</button>
                      </div>
                      {msg && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: C.lose }}>{msg}</div>}
                    </>
                  )}
                </div>
              )}

              <div style={{ marginTop: 18, background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>Invite link</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input readOnly value={(typeof window !== 'undefined' ? window.location.origin : '') + `/duel/${token}`} onFocus={(e) => e.target.select()}
                    style={{ flex: '1 1 220px', minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 13, background: '#fff', color: C.muted, outline: 'none' }} />
                  <button onClick={copyLink} style={{ background: C.accent, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: C.soft }}>Send this to whoever you want to duel. They open it, play the same quiz{dev !== 'any' ? ` on ${dev === 'mobile' ? 'mobile' : 'desktop'}` : ''}, and the winner is decided automatically.</div>
              </div>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Link href="/duel/new" style={{ fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>Start another duel</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
