'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Swords } from 'lucide-react';
import SiteHeader from '../../SiteHeader';
import QuizPlayerBar from '../../quiz/[id]/QuizPlayerBar';
import Grain from '../../Grain';
import Footer from '../../Footer';
import DuelSignup from '../DuelSignup';
import { QUIZZES } from '@/lib/quizzes';

const C = { bg: '#f7f8fa', surface: '#fff', ink: '#1c1e24', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.10)', accent: '#2563eb', accsoft: '#e8effb', gold: '#e8b43a', win: '#16a34a', lose: '#c0392b' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

function anonId() { if (typeof window === 'undefined') return null; try { return localStorage.getItem('sot_quiz_anon'); } catch { return null; } }
function storedName() { if (typeof window === 'undefined') return ''; try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')); return (j && j.username) || ''; } catch { return ''; } }
function storedEmail() { if (typeof window === 'undefined') return ''; try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')); return (j && j.email) || ''; } catch { return ''; } }
function fmtTime(s) { if (s == null) return ''; const m = Math.floor(s / 60), ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; }
function devLabel(d) { return d === 'mobile' ? 'Mobile only' : d === 'desktop' ? 'Desktop only' : ''; }

export default function DuelClient({ token }) {
  const [duel, setDuel] = useState(null);
  const [mine, setMine] = useState('new'); // server-resolved side across the account's browsers
  const [state, setState] = useState('loading');
  const [errCode, setErrCode] = useState('');
  const [me, setMe] = useState({ anon: null, name: '' });
  const [nameInput, setNameInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => { setMe({ anon: anonId(), name: storedName() }); setNameInput(storedName()); }, []);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ token });
      const a = anonId(); const em = storedEmail();
      if (a) qs.set('anonId', a);
      if (em) qs.set('email', em);
      const r = await fetch(`/api/duel/get?${qs.toString()}`);
      const d = await r.json();
      if (d && d.duel) { setDuel(d.duel); if (d.mine) setMine(d.mine); setState('ready'); }
      else { setErrCode(d && d.error || 'error'); setState('error'); }
    } catch { setErrCode('error'); setState('error'); }
  }, [token]);

  // Silently attach the caller's score once they've played, so no manual
  // "submit my score" tap is needed. Only for players already in the duel
  // (challenger or the named opponent); an open-invite viewer joins explicitly.
  const autoSubmit = useCallback(async () => {
    if (!duel || !me.anon) return;
    if (mine === 'new') return;
    const already = mine === 'challenger' ? duel.challenger_score : duel.opponent_score;
    if (already != null) return;
    const nm = (me.name || storedName() || '').trim().slice(0, 40);
    if (!nm) return;
    try {
      const r = await fetch('/api/duel/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, anonId: me.anon, name: nm, email: storedEmail() || undefined }) });
      const d = await r.json();
      if (d && d.duel) setDuel(d.duel);
    } catch {}
  }, [duel, me.anon, me.name, token, mine]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!duel || duel.status === 'complete' || duel.status === 'declined') return;
    // Skip hidden tabs (egress fix 2026-07-12): the visibilitychange handler
    // below already refreshes + attaches the score the moment the tab returns.
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      load(); autoSubmit();
    }, 6000);
    return () => clearInterval(id);
  }, [duel, load, autoSubmit]);
  // Returning from playing (tab visible again) refreshes and attaches the score at once.
  useEffect(() => {
    function onVis() { if (typeof document !== 'undefined' && document.visibilityState === 'visible') { load(); autoSubmit(); } }
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    return () => { if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis); };
  }, [load, autoSubmit]);

  const quiz = duel ? QUIZZES.find((q) => q.id === duel.quiz_id) : null;
  const quizTitle = quiz ? quiz.title : (duel ? duel.quiz_id : '');
  const dev = (duel && duel.device) || 'any';
  const localSide = duel && me.anon
    ? (duel.challenger_anon === me.anon ? 'challenger' : (duel.opponent_anon === me.anon ? 'opponent' : 'new'))
    : 'new';
  const side = mine !== 'new' ? mine : localSide;
  const myScore = side === 'challenger' ? duel?.challenger_score : side === 'opponent' ? duel?.opponent_score : null;
  const iSubmitted = myScore != null;
  const done = duel && (duel.status === 'complete' || duel.status === 'declined');

  async function submit() {
    const nm = (me.name || storedName() || '').trim().slice(0, 40);
    if (!nm) { setSignupOpen(true); return; }  // no free-text: claim a name first
    setBusy(true); setMsg('');
    try {
      const r = await fetch('/api/duel/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, anonId: me.anon, name: nm, email: storedEmail() || undefined }) });
      const d = await r.json();
      if (d && d.duel) { setDuel(d.duel); setMe((m) => ({ ...m, name: nm })); }
      else if (d && d.error === 'no_play') setMsg(`No recent play of ${quizTitle} found. Tap Play the Quiz and your score sends to this duel automatically when you finish. (Rounds played within the last hour count too.)`);
      else if (d && d.error === 'device_mismatch') setMsg(`This duel is ${d.device} only. Play on ${d.device === 'mobile' ? 'your phone' : 'a computer'}, then submit.`);
      else if (d && d.error === 'duel_full') setMsg('This duel already has two players.');
      else setMsg('Could not submit. Try again.');
    } catch { setMsg('Could not submit. Try again.'); }
    setBusy(false);
  }

  async function decline() {
    setBusy(true); setMsg('');
    try {
      const nm = (me.name || storedName() || 'Player').trim().slice(0, 40);
      const r = await fetch('/api/duel/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, anonId: me.anon, name: nm, email: storedEmail() || undefined }) });
      const d = await r.json();
      if (d && d.duel) setDuel(d.duel);
      else setMsg('Could not turn down. Try again.');
    } catch { setMsg('Could not turn down. Try again.'); }
    setBusy(false);
  }

  function copyLink() {
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + `/duel/${token}`;
    try { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); } catch {}
  }

  function Side({ who, name, score, total, time, winnerFlag, faded }) {
    const waiting = score == null;
    return (
      <div style={{ flex: 1, minWidth: 0, background: winnerFlag ? C.accent : C.surface, color: winnerFlag ? '#fff' : C.ink, border: `1px solid ${winnerFlag ? C.accent : C.line}`, borderRadius: 14, padding: '18px 16px', textAlign: 'center', opacity: faded ? 0.55 : 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: winnerFlag ? 'rgba(255,255,255,0.8)' : C.soft }}>{who}</div>
        <div style={{ fontSize: 18, fontWeight: 800, margin: '4px 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || (who === 'Opponent' ? 'Waiting…' : 'Player')}</div>
        <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{waiting ? '—' : score}<span style={{ fontSize: 15, fontWeight: 700, color: winnerFlag ? 'rgba(255,255,255,0.75)' : C.soft }}>{waiting ? '' : `/${total}`}</span></div>
        <div style={{ fontSize: 12, fontWeight: 600, color: winnerFlag ? 'rgba(255,255,255,0.8)' : C.soft, marginTop: 6, minHeight: 16 }}>{waiting ? 'Not played yet' : (time != null ? fmtTime(time) : '')}</div>
      </div>
    );
  }

  const declined = duel && duel.status === 'declined';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.ink, position: 'relative' }}>
      <Grain />
      {signupOpen && <DuelSignup anonId={me.anon} onClose={() => setSignupOpen(false)} onDone={(un) => { setMe((m) => ({ ...m, name: un })); setSignupOpen(false); }} />}
      <SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} />
      <div className="qzf-w" style={{ maxWidth: 1180, margin: '0 auto', padding: '12px 38px 70px', position: 'relative' }}>
        <div className="qzf-line" aria-hidden="true" />
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link href="/quizzes/hub?tab=duels" style={{ fontSize: 13, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>← Duel Leaderboard</Link>

          {state === 'loading' && <div style={{ marginTop: 40, color: C.soft, fontWeight: 600 }}>Loading duel…</div>}

          {state === 'error' && (
            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{errCode === 'duels_not_ready' ? 'Duels are almost ready' : 'Duel not found'}</div>
              <div style={{ color: C.muted, marginBottom: 20 }}>{errCode === 'duels_not_ready' ? 'This feature is being switched on. Check back shortly.' : 'This duel link is invalid or has expired.'}</div>
              <Link href="/duel/new" style={{ background: C.accent, color: '#fff', padding: '11px 18px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Start a Duel</Link>
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
                <Side who="Challenger" name={duel.challenger_name} score={duel.challenger_score} total={duel.challenger_total} time={duel.challenger_time} winnerFlag={duel.status === 'complete' && duel.winner === 'challenger'} faded={declined} />
                <div style={{ alignSelf: 'center', fontSize: 13, fontWeight: 800, color: C.soft }}>VS</div>
                <Side who="Opponent" name={duel.opponent_name} score={duel.opponent_score} total={duel.opponent_total} time={duel.opponent_time} winnerFlag={duel.status === 'complete' && duel.winner === 'opponent'} faded={declined} />
              </div>

              {duel.status === 'complete' && (
                <div style={{ marginTop: 18, textAlign: 'center', fontSize: 20, fontWeight: 800, color: duel.winner === 'tie' ? C.ink : (duel.winner === side ? C.win : (side === 'new' ? C.ink : C.lose)) }}>
                  {duel.winner === 'tie' ? "It's a tie!" : (duel.winner === side ? 'You win! 🏆' : (side === 'new' ? `${duel.winner === 'challenger' ? duel.challenger_name : duel.opponent_name} wins` : 'You lost'))}
                </div>
              )}

              {declined && (
                <div style={{ marginTop: 18, textAlign: 'center', fontSize: 18, fontWeight: 800, color: C.muted }}>
                  {side === 'challenger' ? `${duel.opponent_name || 'Your opponent'} turned down this duel.` : 'You turned down this duel.'}
                </div>
              )}

              {!done && (
                <div style={{ marginTop: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
                  {iSubmitted ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Your score is in.</div>
                      <div style={{ color: C.muted, fontSize: 14 }}>Waiting for your opponent to play. Share the link below.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{side === 'challenger' ? 'Play your round' : `${duel.challenger_name} challenged you`}</div>
                      <div style={{ color: C.muted, fontSize: 14, marginBottom: 14 }}>Tap {'"'}Play the quiz{'"'}{dev !== 'any' ? ` on ${dev === 'mobile' ? 'your phone' : 'a computer'} (this duel is ${dev} only)` : ''}. When you finish, your score is sent to this duel automatically.</div>
                      {!me.name && (
                        <button onClick={() => setSignupOpen(true)} style={{ width: '100%', boxSizing: 'border-box', textAlign: 'left', background: '#fff', color: C.accent, border: `1.5px solid ${C.accent}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Claim your display name to play +</button>
                      )}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <a href={`/quiz/${duel.quiz_id}?duel=${token}`} style={{ flex: '1 1 160px', textAlign: 'center', background: C.accent, color: '#fff', padding: '12px 16px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Play the Quiz →</a>
                        <button onClick={submit} disabled={busy} style={{ flex: '1 1 160px', background: C.surface, color: C.accent, border: `1.5px solid ${C.accent}`, padding: '12px 16px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>{busy ? 'Working…' : "I've Played — Submit My Score"}</button>
                      </div>
                      {side !== 'challenger' && (
                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                          <button onClick={decline} disabled={busy} style={{ background: 'transparent', color: C.muted, border: 'none', fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Turn Down This Challenge</button>
                        </div>
                      )}
                      {msg && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: C.lose }}>{msg}</div>}
                    </>
                  )}
                </div>
              )}

              {/* The invite link is only useful while the duel still needs a play:
                  once complete (or declined) the token page just shows the result,
                  so the box is hidden to avoid reading like a rematch link. */}
              {!done && (
                <div style={{ marginTop: 18, background: C.accsoft, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>Invite link</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input readOnly value={(typeof window !== 'undefined' ? window.location.origin : '') + `/duel/${token}`} onFocus={(e) => e.target.select()}
                      style={{ flex: '1 1 220px', minWidth: 0, boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${C.line}`, borderRadius: 10, fontFamily: FONT, fontSize: 13, background: '#fff', color: C.muted, outline: 'none' }} />
                    <button onClick={copyLink} style={{ background: C.accent, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', fontFamily: FONT }}>{copied ? 'Copied!' : 'Copy'}</button>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: C.soft }}>Send this to whoever you want to duel. They open it, play the same quiz{dev !== 'any' ? ` on ${dev === 'mobile' ? 'mobile' : 'desktop'}` : ''}, and the winner is decided automatically.</div>
                </div>
              )}

              <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
                <Link href="/duel/new" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: `linear-gradient(135deg, ${C.accent} 0%, #1d4ed8 100%)`, color: '#fff', padding: '14px 30px', borderRadius: 12, fontWeight: 800, fontSize: 15, letterSpacing: '0.01em', textDecoration: 'none', boxShadow: '0 10px 26px rgba(37,99,235,0.38)' }}><Swords size={18} /> Start Another Duel</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
