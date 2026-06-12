'use client';

// Timed multiple-choice quiz board (format: 'timed-mcq').
//
// Ten questions, four options each, 30 seconds per question. The score for a
// correct answer decays LINEARLY with the time taken: answer the instant the
// question appears and you bank the full 30 points; answer at the buzzer and you
// bank ~1. A wrong answer (or letting the clock run out) is 0. Max 300 points,
// reachable only in theory. Reuses the same /api/quiz/* endpoints, leaderboard,
// and visual language as the name-them-all board in QuizClient.jsx.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, X, Flag, Trophy, HelpCircle, Zap } from 'lucide-react';
import { getQuiz } from '@/lib/quizzes';
import Grain from '../../Grain';
import Footer from '../../Footer';

const COLORS = {
  cream: '#f4ede0',
  paper: '#ebe2d0',
  ink: '#1a1611',
  ember: '#c0392b',
  rust: '#a44a26',
  forest: '#3d4f2b',
  faded: '#7a6f5e',
};
const MONO = 'DM Mono, monospace';
const SERIF = 'Fraunces, serif';
const SANS = 'DM Sans, sans-serif';

function fmtTime(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function ordinal(n) {
  const v = Number(n) || 0;
  const mod100 = v % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`;
  switch (v % 10) {
    case 1: return `${v}st`;
    case 2: return `${v}nd`;
    case 3: return `${v}rd`;
    default: return `${v}th`;
  }
}

// ── Personal stats (client-side, same key scheme as QuizClient) ──
function statsKey(id) { return `sot_quiz_${id}`; }
function loadStats(id) {
  if (typeof window === 'undefined') return { attempts: 0, best: 0, totalCorrect: 0 };
  try {
    return JSON.parse(localStorage.getItem(statsKey(id))) || { attempts: 0, best: 0, totalCorrect: 0 };
  } catch { return { attempts: 0, best: 0, totalCorrect: 0 }; }
}
function recordResult(id, points) {
  const s = loadStats(id);
  const next = { attempts: s.attempts + 1, best: Math.max(s.best, points), totalCorrect: s.totalCorrect + points };
  try { localStorage.setItem(statsKey(id), JSON.stringify(next)); } catch {}
  return next;
}
function percentile(points, max) {
  const frac = max ? points / max : 0;
  return Math.round(Math.min(99, Math.max(2, Math.pow(frac, 1.35) * 100)));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TICK_MS = 80;

export default function TimedMcqClient({ quizId }) {
  const router = useRouter();
  const quiz = useMemo(() => getQuiz(quizId), [quizId]);

  if (!quiz) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative' }}>
        <Grain />
        <div style={{ position: 'relative', zIndex: 2, padding: 48, textAlign: 'center' }}>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', color: COLORS.faded }}>That quiz seems to have wandered off.</p>
          <button onClick={() => router.push('/')} style={{ marginTop: 16, background: COLORS.ink, color: COLORS.cream, border: 'none', padding: '10px 20px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>Back home</button>
        </div>
        <Footer />
      </div>
    );
  }

  const questions = quiz.questions || [];
  const total = questions.length;
  const perSec = quiz.perQuestionTime || 30;
  const perMs = perSec * 1000;
  const maxPer = quiz.maxPerQuestion || 30;
  const maxPoints = total * maxPer;

  const [tab, setTab] = useState('play');

  // ── Game state ──
  const [phase, setPhase] = useState('idle'); // idle | playing | reveal | done
  const [qIndex, setQIndex] = useState(0);
  const [remaining, setRemaining] = useState(perMs);
  const [picked, setPicked] = useState(null);   // chosen option index, or null on timeout
  const [results, setResults] = useState([]);   // [{ pts, correct }]
  const [lastElapsed, setLastElapsed] = useState(null);

  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [board, setBoard] = useState({ plays: 0, best: null, leaderboard: [] });
  const [identity, setIdentity] = useState(null);

  // Join form
  const [jName, setJName] = useState('');
  const [jEmail, setJEmail] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinErr, setJoinErr] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);

  const [copied, setCopied] = useState(false);

  // Critique modal
  const [qOpen, setQOpen] = useState(false);
  const [qMsg, setQMsg] = useState('');
  const [qName, setQName] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qSent, setQSent] = useState(false);
  const [qBusy, setQBusy] = useState(false);

  const timerRef = useRef(null);
  const advanceRef = useRef(null);
  const deadlineRef = useRef(0);
  const startRef = useRef(null);
  const endedRef = useRef(false);
  const viewedRef = useRef(false);

  const points = results.reduce((s, r) => s + (r.pts || 0), 0);
  const answeredCount = results.length;

  function refreshBoard() {
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, leaderboard: d.leaderboard || [] }); })
      .catch(() => {});
  }

  useEffect(() => {
    setStats(loadStats(quizId));
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) { setIdentity(id); setJName(id.username || ''); setJEmail(id.email || ''); }
    } catch {}
    refreshBoard();
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId }),
      }).catch(() => {});
    }
    return () => { clearInterval(timerRef.current); clearTimeout(advanceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  function stopTimer() { clearInterval(timerRef.current); timerRef.current = null; }

  function beginQuestion(i) {
    setQIndex(i);
    setPicked(null);
    setPhase('playing');
    setRemaining(perMs);
    deadlineRef.current = Date.now() + perMs;
    stopTimer();
    timerRef.current = setInterval(() => {
      const left = deadlineRef.current - Date.now();
      if (left <= 0) {
        stopTimer();
        setRemaining(0);
        onExpire();
      } else {
        setRemaining(left);
      }
    }, TICK_MS);
  }

  function startGame() {
    if (phase !== 'idle') return;
    endedRef.current = false;
    setResults([]);
    startRef.current = Date.now();
    beginQuestion(0);
  }

  function settle(choiceIndex) {
    // choiceIndex === null means the clock ran out.
    stopTimer();
    const q = questions[qIndex];
    const left = Math.max(0, deadlineRef.current - Date.now());
    const correct = choiceIndex != null && choiceIndex === q.correct;
    const pts = correct ? Math.max(1, Math.round(maxPer * (left / perMs))) : 0;
    setPicked(choiceIndex);
    setPhase('reveal');
    setResults((prev) => {
      const next = [...prev, { pts, correct }];
      return next;
    });
    clearTimeout(advanceRef.current);
    advanceRef.current = setTimeout(() => {
      if (qIndex + 1 < total) beginQuestion(qIndex + 1);
      else finishGame();
    }, 1400);
  }

  function pick(choiceIndex) {
    if (phase !== 'playing') return;
    settle(choiceIndex);
  }
  function onExpire() {
    if (phase !== 'playing') return;
    settle(null);
  }

  function finishGame() {
    if (endedRef.current) return;
    endedRef.current = true;
    stopTimer();
    clearTimeout(advanceRef.current);
    setPhase('done');
    // Read the final tally from state via the functional form so we never miss
    // the last question's points.
    setResults((prev) => {
      const finalPoints = prev.reduce((s, r) => s + (r.pts || 0), 0);
      const elapsed = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : total * perSec;
      setLastElapsed(elapsed);
      setStats(recordResult(quizId, finalPoints));
      fetch('/api/quiz/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, score: finalPoints, total: maxPoints, timeElapsed: elapsed, email: identity?.email || undefined }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, leaderboard: d.leaderboard || [] }); })
        .catch(() => {});
      return prev;
    });
  }

  function giveUp() {
    if (phase === 'idle' || phase === 'done') return;
    finishGame();
  }

  async function submitJoin() {
    setJoinErr(false);
    if (!jName.trim() || jName.trim().length > 40) { setJoinErr(true); setJoinMsg('Pick a username (max 40 characters).'); return; }
    if (!EMAIL_RE.test(jEmail.trim())) { setJoinErr(true); setJoinMsg('Enter a valid email.'); return; }
    setJoinBusy(true);
    try {
      const res = await fetch('/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: jName.trim(), email: jEmail.trim() }),
      });
      const d = await res.json();
      if (d.error) { setJoinErr(true); setJoinMsg(d.error); setJoinBusy(false); return; }
      const id = { username: d.username, email: d.email };
      try { localStorage.setItem('sot_quiz_identity', JSON.stringify(id)); } catch {}
      setIdentity(id);
      setJoinErr(false);
      setJoinMsg(`You're in. "${d.username}" will appear on the leaderboard once you finish a game.`);
    } catch (e) {
      setJoinErr(true);
      setJoinMsg('Could not join right now. Try again.');
    }
    setJoinBusy(false);
  }

  async function submitQuestion() {
    if (qBusy) return;
    setQBusy(true);
    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: quiz.id, listTitle: `[Quiz] ${quiz.title}`, message: qMsg.trim(), name: qName.trim(), email: qEmail.trim() }),
      });
    } catch (e) { /* swallow */ }
    setQSent(true);
    setQBusy(false);
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sourceoftruths.com/quiz/${quiz.id}`;
  function share() {
    const text = phase === 'done'
      ? `I scored ${points}/${maxPoints} on "${quiz.title}" at Source of Truths. Beat the clock and beat me.`
      : `${total} questions, ${perSec} seconds each, answer fast for points. "${quiz.title}" at Source of Truths.`;
    if (navigator.share) {
      navigator.share({ title: quiz.title, text, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${shareUrl}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    }
  }

  function chip(key, label, icon) {
    const active = tab === key;
    return (
      <button
        onClick={() => setTab(key)}
        style={{ flex: '1 0 auto', justifyContent: 'center', background: active ? COLORS.ember : 'transparent', color: COLORS.cream, border: 'none', borderRight: '1px solid rgba(244,237,224,0.18)', padding: '0 16px', height: 42, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {icon}
        {label}
      </button>
    );
  }

  const bestLabel = board.best != null ? board.best : '—';
  const q = questions[qIndex];
  const frac = Math.max(0, Math.min(1, remaining / perMs));
  const liveValue = Math.max(0, Math.round(maxPer * frac));        // points if you answer right now
  const lowClock = phase === 'playing' && remaining <= 8000;
  const correctIdx = q ? q.correct : -1;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '24px 20px 80px' }}>

        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
          <ArrowLeft size={14} strokeWidth={2.5} />
          Back to all quizzes
        </button>

        {/* Header */}
        <div style={{ paddingBottom: 0, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, color: COLORS.ink, fontVariationSettings: '"SOFT" 100' }}>{quiz.title}</h1>
            <div style={{ flex: 1, minWidth: 120, marginBottom: 6 }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(9px, 1.1vw, 11px)', letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ember, textAlign: 'right', marginBottom: 8 }}>{quiz.category} · Quiz</div>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 1.45, margin: '12px 0 0', color: COLORS.faded, maxWidth: 640 }}>{quiz.blurb}</p>
        </div>

        {/* Ribbon */}
        <div style={{ position: 'sticky', top: 0, zIndex: 25, marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: COLORS.ink, borderBottom: `3px solid ${COLORS.ember}` }}>
            {chip('play', 'Play')}
            {chip('stats', 'Stats & Leaderboard')}
            {chip('join', 'Join the Leaderboard', <Trophy size={12} strokeWidth={2.5} />)}
            {chip('share', 'Share', <Share2 size={12} strokeWidth={2.5} />)}
            <button
              onClick={() => { setQSent(false); setQOpen(true); }}
              style={{ flex: '1 0 auto', justifyContent: 'center', background: 'transparent', color: COLORS.cream, border: 'none', padding: '0 16px', height: 42, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <HelpCircle size={12} strokeWidth={2.5} />
              Critique?
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24 }} />

        {/* ── PLAY ── */}
        {tab === 'play' && (
          <>
            {/* Scoreboard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 20px', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{points}<span style={{ fontSize: 20, color: COLORS.faded }}>/{maxPoints}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Points</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${COLORS.faded}33`, borderRight: `1px solid ${COLORS.faded}33`, padding: '0 22px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: COLORS.ember }}>{bestLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Best · {board.plays.toLocaleString()} {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: phase === 'idle' || phase === 'done' ? COLORS.faded : COLORS.ink }}>
                  {phase === 'idle' ? `Q —/${total}` : `Q ${Math.min(qIndex + 1, total)}/${total}`}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Question</div>
              </div>
            </div>

            {/* IDLE — start screen */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '26px 24px 30px', border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                <Zap size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
                <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: '8px 0 6px' }}>Beat the clock.</h2>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: '#4a4339', maxWidth: 460, margin: '0 auto 6px' }}>
                  {total} questions, four answers each. You get {perSec} seconds per question, and the points you bank for a right answer fall as the clock ticks. Answer instantly for the full {maxPer}; answer at the buzzer for almost nothing. A wrong answer scores zero.
                </p>
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.faded, margin: '0 0 20px' }}>
                  {maxPoints} points in play. No one gets all {maxPoints}.
                </p>
                <button onClick={startGame} style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 40px', lineHeight: '52px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer' }}>
                  Start
                </button>
              </div>
            )}

            {/* PLAYING / REVEAL — the question */}
            {(phase === 'playing' || phase === 'reveal') && q && (
              <div>
                {/* Timer bar + live point value */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 12, background: COLORS.paper, border: `1px solid ${COLORS.faded}44`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: lowClock ? COLORS.ember : COLORS.forest, transition: phase === 'playing' ? `width ${TICK_MS}ms linear` : 'none' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 96, justifyContent: 'flex-end' }}>
                    <Zap size={15} strokeWidth={2.5} style={{ color: phase === 'reveal' ? COLORS.faded : (lowClock ? COLORS.ember : COLORS.rust) }} />
                    <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 500, color: phase === 'reveal' ? COLORS.faded : COLORS.ink }}>
                      {phase === 'reveal' ? '+' + (results[results.length - 1]?.pts ?? 0) : liveValue}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded }}>pts</span>
                  </div>
                </div>

                {/* Question */}
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(20px, 3vw, 27px)', lineHeight: 1.18, margin: '4px 0 18px' }}>
                  {q.q}
                </div>

                {/* Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {q.choices.map((c, ci) => {
                    const revealing = phase === 'reveal';
                    const isCorrect = ci === correctIdx;
                    const isPicked = ci === picked;
                    let bg = '#fff', border = COLORS.ink, fg = COLORS.ink, mark = null;
                    if (revealing) {
                      if (isCorrect) { bg = '#eef3e6'; border = COLORS.forest; fg = COLORS.ink; mark = <Check size={18} strokeWidth={3} style={{ color: COLORS.forest }} />; }
                      else if (isPicked) { bg = '#f7e7e3'; border = COLORS.ember; fg = COLORS.ember; mark = <X size={18} strokeWidth={3} style={{ color: COLORS.ember }} />; }
                      else { bg = COLORS.paper; border = COLORS.faded + '33'; fg = COLORS.faded; }
                    }
                    return (
                      <button
                        key={ci}
                        onClick={() => pick(ci)}
                        disabled={revealing}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', padding: '15px 18px', background: bg, border: `1.5px solid ${border}`, color: fg, cursor: revealing ? 'default' : 'pointer', fontFamily: SANS, fontSize: 17, lineHeight: 1.3, transition: 'background .15s, border-color .15s' }}
                      >
                        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: revealing && !isCorrect && !isPicked ? COLORS.faded : COLORS.ember, width: 18, flex: 'none' }}>{String.fromCharCode(65 + ci)}</span>
                        <span style={{ flex: 1 }}>{c}</span>
                        <span style={{ width: 20, flex: 'none' }}>{mark}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Reveal note */}
                {phase === 'reveal' && (
                  <div style={{ marginTop: 14, padding: '12px 16px', background: COLORS.paper, borderLeft: `3px solid ${results[results.length - 1]?.correct ? COLORS.forest : COLORS.ember}` }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: results[results.length - 1]?.correct ? COLORS.forest : COLORS.ember, marginRight: 8 }}>
                      {results[results.length - 1]?.correct ? `Correct · +${results[results.length - 1]?.pts}` : (picked == null ? 'Time' : 'Wrong')}
                    </span>
                    {q.note && <span style={{ fontFamily: SANS, fontSize: 14, color: '#4a4339' }}>{q.note}</span>}
                  </div>
                )}

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 22 }}>
                  {questions.map((_, i) => {
                    const done = i < results.length;
                    const cur = i === qIndex;
                    const good = done && results[i]?.correct;
                    return (
                      <span key={i} style={{ width: cur ? 22 : 9, height: 9, borderRadius: 5, background: done ? (good ? COLORS.forest : COLORS.ember) : (cur ? COLORS.rust : COLORS.faded + '44'), transition: 'all .2s' }} />
                    );
                  })}
                </div>

                <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
                  <button onClick={giveUp} style={ghostBtn(false)}>
                    <Flag size={12} strokeWidth={2.5} /> End now
                  </button>
                </div>
              </div>
            )}

            {/* DONE — results card */}
            {phase === 'done' && (
              <div>
                <div style={{ padding: 24, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>
                    {points === maxPoints ? 'Theoretical maximum' : answeredCount < total ? 'Ended early' : 'Final score'}
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{points}<span style={{ fontSize: 24, color: COLORS.faded }}>/{maxPoints}</span></div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginBottom: 10 }}>
                    {results.filter((r) => r.correct).length} of {total} right · you beat {percentile(points, maxPoints)}% of players
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                    {board.best != null ? (points >= board.best ? `That is the high score to beat.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => { setPhase('idle'); setResults([]); setQIndex(0); setPicked(null); setRemaining(perMs); endedRef.current = false; }} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 28px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer' }}>Play again</button>
                    {!identity && (
                      <button onClick={() => setTab('join')} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={14} strokeWidth={2.5} /> Join the leaderboard
                      </button>
                    )}
                  </div>
                </div>

                {/* Per-question recap */}
                <ol style={{ margin: '18px 0 0', padding: 0, listStyle: 'none' }}>
                  {questions.map((qq, i) => {
                    const r = results[i];
                    const answered = !!r;
                    const good = answered && r.correct;
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: `1px solid ${good ? COLORS.forest : COLORS.faded + '33'}`, marginBottom: 8, background: good ? '#fff' : COLORS.paper }}>
                        <span style={{ width: 22, flex: 'none', color: good ? COLORS.forest : COLORS.ember }}>{good ? <Check size={17} strokeWidth={3} /> : <X size={17} strokeWidth={3} />}</span>
                        <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, lineHeight: 1.35 }}>
                          <span style={{ color: '#4a4339' }}>{qq.q}</span>
                          <span style={{ display: 'block', fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 3 }}>
                            Answer: <span style={{ color: COLORS.ink }}>{qq.choices[qq.correct]}</span>
                          </span>
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 14, color: good ? COLORS.forest : COLORS.faded, flex: 'none' }}>+{answered ? r.pts : 0}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 14 }}>Your record</div>
            {stats.attempts === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: COLORS.faded }}>Play a round and your record shows up here. It stays on this device.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatBox label="Best score" value={`${stats.best}`} accent />
                <StatBox label="Your average" value={`${Math.round(stats.totalCorrect / stats.attempts)}`} />
                <StatBox label="Attempts" value={stats.attempts} />
              </div>
            )}

            <div style={{ borderTop: `1px solid ${COLORS.faded}33`, marginTop: 26, paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.faded }}>Leaderboard</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', color: COLORS.faded }}>{bestLabel} best · {board.plays.toLocaleString()} {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>

              {board.leaderboard.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded }}>
                  No one has posted a score yet. <button onClick={() => setTab('join')} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.ember, font: 'inherit', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>Join the leaderboard</button> and be first.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, padding: '0 14px 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>
                    <span>#</span><span>Username</span><span style={{ textAlign: 'right' }}>Points</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  {board.leaderboard.map((row, i) => {
                    const mine = identity && row.username === identity.username;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? '#fff' : COLORS.paper, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}` }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, color: i < 3 ? COLORS.ember : COLORS.faded }}>{i + 1}</span>
                        <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.username}{mine ? ' (you)' : ''}{row.tryNum ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400, color: COLORS.faded, marginLeft: 6 }}>({ordinal(row.tryNum)} Try)</span> : ''}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, textAlign: 'right' }}>{row.score}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, textAlign: 'right', color: COLORS.faded }}>{fmtTime(row.timeElapsed)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SHARE ── */}
        {tab === 'share' && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{phase === 'done' ? `You scored ${points} of ${maxPoints}. Challenge someone to beat it.` : 'Send this quiz to someone who thinks they kept up with the business news.'}</p>
            <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Share this quiz'}
            </button>
            <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 16, wordBreak: 'break-all' }}>{shareUrl}</div>
          </div>
        )}

        {/* ── JOIN ── */}
        {tab === 'join' && (
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trophy size={22} strokeWidth={2.2} style={{ color: COLORS.ember }} />
              <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: 0 }}>Join the Leaderboard</h2>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', margin: '0 0 6px' }}>
              Sign up and your username will appear on the leaderboard after you finish a game. No password needed.
            </p>
            <p style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, margin: '0 0 22px' }}>
              Your username is shown publicly; your email is kept private.
            </p>

            <label style={labelStyle}>Username</label>
            <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="e.g. dealwatcher" style={fieldStyle} />
            <label style={{ ...labelStyle, marginTop: 16 }}>Email</label>
            <input value={jEmail} onChange={(e) => setJEmail(e.target.value)} type="email" placeholder="you@email.com" style={fieldStyle} />

            <button onClick={submitJoin} disabled={joinBusy} style={{ marginTop: 22, width: '100%', fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '48px', border: 'none', background: COLORS.ember, color: '#fff', cursor: joinBusy ? 'default' : 'pointer', opacity: joinBusy ? 0.6 : 1 }}>
              {joinBusy ? 'Joining…' : identity ? 'Update my name' : 'Join the leaderboard'}
            </button>

            {joinMsg && (
              <p style={{ fontFamily: MONO, fontSize: 12, marginTop: 14, color: joinErr ? COLORS.ember : COLORS.forest }}>{joinMsg}</p>
            )}
            {identity && !joinMsg && (
              <p style={{ fontFamily: MONO, fontSize: 12, marginTop: 14, color: COLORS.faded }}>You're signed up as "{identity.username}". Finish a game to post your score.</p>
            )}

            <button onClick={() => setTab('stats')} style={{ marginTop: 18, background: 'transparent', border: 'none', color: COLORS.faded, cursor: 'pointer', fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'underline', padding: 0 }}>
              View the leaderboard →
            </button>
          </div>
        )}

        {quiz.source && (
          <div style={{ marginTop: 40, paddingTop: 18, borderTop: `1px solid ${COLORS.faded}33`, fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', color: COLORS.faded }}>
            Source:{' '}
            {typeof quiz.source === 'string'
              ? quiz.source
              : quiz.source.url
                ? <a href={quiz.source.url} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust }}>{quiz.source.label}</a>
                : quiz.source.label}
          </div>
        )}

      </div>

      {qOpen && (
        <div
          onClick={() => setQOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,22,17,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vh 16px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: COLORS.cream, border: `2px solid ${COLORS.ink}`, padding: 24 }}>
            {qSent ? (
              <>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: '0 0 10px' }}>Thanks, noted.</h3>
                <p style={{ fontFamily: SANS, fontSize: 15, color: COLORS.faded, margin: '0 0 20px' }}>
                  Your question went to the editors' desk. We read every one.
                </p>
                <button
                  onClick={() => { setQOpen(false); setQSent(false); setQMsg(''); setQName(''); setQEmail(''); }}
                  style={{ cursor: 'pointer', background: COLORS.ink, color: COLORS.cream, border: `1.5px solid ${COLORS.ink}`, padding: '12px 20px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>Comments? Critique?</h3>
                <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.faded, margin: '0 0 14px' }}>
                  Spot an answer that should count, or something off about this quiz? Tell the editors.
                </p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input type="text" value={qName} onChange={(e) => setQName(e.target.value)} maxLength={120} placeholder="Name (optional)" style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }} />
                  <input type="email" value={qEmail} onChange={(e) => setQEmail(e.target.value)} maxLength={200} placeholder="Email (optional)" style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }} />
                </div>
                <textarea value={qMsg} onChange={(e) => setQMsg(e.target.value)} maxLength={1000} rows={4} placeholder="What's your question or comment? (optional)" style={{ width: '100%', boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setQOpen(false)} style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Cancel</button>
                  <button onClick={submitQuestion} disabled={qBusy} style={{ cursor: 'pointer', background: COLORS.rust, color: COLORS.cream, border: `1.5px solid ${COLORS.rust}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: qBusy ? 0.6 : 1 }}>{qBusy ? 'Sending…' : 'Send to editors'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function ghostBtn(disabled) {
  return { fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, padding: '10px 18px', background: 'transparent', color: COLORS.faded, border: `1px solid ${COLORS.faded}55`, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 };
}

const labelStyle = { display: 'block', fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 6 };
const fieldStyle = { width: '100%', fontFamily: SANS, fontSize: 16, padding: '12px 14px', border: `1.5px solid ${COLORS.ink}`, background: '#fff', color: COLORS.ink };

function StatBox({ label, value, accent }) {
  return (
    <div style={{ background: accent ? COLORS.paper : '#fff', border: `1px solid ${COLORS.faded}33`, padding: '18px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, lineHeight: 1, color: accent ? COLORS.ember : COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginTop: 8 }}>{label}</div>
    </div>
  );
}
