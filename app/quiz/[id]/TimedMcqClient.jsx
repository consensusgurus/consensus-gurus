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
import { ArrowLeft, Share2, Check, X, Flag, Trophy, HelpCircle, Zap, ScrollText } from 'lucide-react';
import { getQuiz, QUIZZES } from '@/lib/quizzes';
import { quizDept as deptOf, DEPT_LABEL } from '@/lib/quiz-departments';
import Grain from '../../Grain';
import Footer from '../../Footer';
import SiteHeader from '../../SiteHeader';
import Count from '../../Count';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  forest: '#10b981',
  faded: '#6b7280',
};
const MONO = "'Manrope', system-ui, -apple-system, sans-serif";
const SERIF = "'Manrope', system-ui, -apple-system, sans-serif";
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Local date + time a leaderboard entry was played (viewer's timezone).
function fmtWhen(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
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
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) {
      a = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sot_quiz_anon', a);
    }
    return a;
  } catch { return null; }
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

export default function TimedMcqClient({ quizId, mobile = false }) {
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
  // Leniency: you bank FULL points if you answer within a short grace window
  // (~3s, tunable per quiz via graceSeconds), then points decay linearly to the
  // buzzer. This makes a perfect points game actually reachable for someone who
  // knows the answers, instead of requiring literally-instant clicks.
  const graceMs = Math.max(0, (quiz.graceSeconds != null ? quiz.graceSeconds : 3) * 1000);
  const ptsFrac = (rem) => {
    const el = perMs - Math.max(0, Math.min(perMs, rem));   // time taken to answer
    if (el <= graceMs) return 1;
    const span = perMs - graceMs;
    return span > 0 ? Math.max(0, (perMs - el) / span) : 0;
  };

  const [tab, setTab] = useState('play');
  const ribbonRef = useRef(null);
  const [ribScroll, setRibScroll] = useState({ left: false, right: false });
  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return undefined;
    const update = () => { const more = el.scrollWidth - el.clientWidth; setRibScroll({ left: el.scrollLeft > 2, right: more > 2 && el.scrollLeft < more - 2 }); };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  const [mcqRevealed, setMcqRevealed] = useState(false); // answer key hidden until revealed

  // ── Game state ──
  const [phase, setPhase] = useState('idle'); // idle | playing | reveal | done
  const [qIndex, setQIndex] = useState(0);
  const [remaining, setRemaining] = useState(perMs);
  const [picked, setPicked] = useState(null);   // chosen option index, or null on timeout
  const [results, setResults] = useState([]);   // [{ pts, correct }]
  const [lastElapsed, setLastElapsed] = useState(null);

  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [board, setBoard] = useState({ plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [] });
  const [lbView, setLbView] = useState('registered');
  const [identity, setIdentity] = useState(null);
  const [eloBefore, setEloBefore] = useState(null);
  const [eloAfter, setEloAfter] = useState(null);

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
  // Outright #1 across ALL completed plays (anonymous included): this run holds
  // the best points total AND ties/beats the fastest time recorded at it.
  const isTopScore = phase === 'done' && board.best != null && lastElapsed != null
    && points === board.best && board.topTime != null && lastElapsed <= board.topTime;

  function fetchQuizMe(setter) {
    try {
      const qs = new URLSearchParams();
      const anon = getAnonId();
      if (anon) qs.set('anonId', anon);
      let em = identity && identity.email ? identity.email : null;
      if (!em) { try { const j = JSON.parse(localStorage.getItem('sot_quiz_identity')); if (j && j.email) em = j.email; } catch (e) {} }
      if (em) qs.set('email', em);
      fetch(`/api/quiz/me?${qs.toString()}`).then((r) => r.json()).then((d) => { if (d && d.found) setter(d); }).catch(() => {});
    } catch (e) {}
  }

  function refreshBoard() {
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [] }); })
      .catch(() => {});
  }

  useEffect(() => {
    setStats(loadStats(quizId));
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) { setIdentity(id); setJName(id.username || ''); setJEmail(id.email || ''); }
    } catch {}
    refreshBoard();
    fetchQuizMe(setEloBefore);
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', {
        method: 'POST',
        keepalive: true,
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
    const pts = correct ? Math.max(1, Math.round(maxPer * ptsFrac(left))) : 0;
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
      const firstAttempt = loadStats(quizId).attempts === 0; // only the first play counts on the leaderboard
      setLastElapsed(elapsed);
      setStats(recordResult(quizId, finalPoints));
      if (firstAttempt) {
        fetch('/api/quiz/result', {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId, score: finalPoints, total: maxPoints, correct: prev.filter((r) => r.correct).length, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId() }),
        })
          .then((r) => r.json())
          .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [] }); })
          .then(() => fetchQuizMe(setEloAfter))
          .catch(() => { fetchQuizMe(setEloAfter); });
      } else {
        fetchQuizMe(setEloAfter);
      }
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
        body: JSON.stringify({ username: jName.trim(), email: jEmail.trim(), anonId: getAnonId() }),
      });
      const d = await res.json();
      if (d.error) { setJoinErr(true); setJoinMsg(d.error); setJoinBusy(false); return; }
      const id = { username: d.username, email: d.email };
      try { localStorage.setItem('sot_quiz_identity', JSON.stringify(id)); } catch {}
      setIdentity(id);
      setJoinErr(false);
      setJoinMsg(`You're in. "${d.username}" will appear on the leaderboard once you finish a game.`);
      setMcqRevealed(true); setTab('play');
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
    const correct = results.filter((r) => r.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const text = phase === 'done'
      ? `I got ${correct}/${total} right (${pct}%) on "${quiz.title}" at Source of Truths. Beat the clock and beat me.`
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
        style={{ flex: '1 0 auto', justifyContent: 'center', background: active ? '#fff' : 'transparent', color: active ? COLORS.ink : COLORS.faded, border: 'none', borderRadius: 7, padding: '9px 14px', whiteSpace: 'nowrap', fontFamily: SANS, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: active ? '0 1px 2px rgba(20,22,28,0.06)' : 'none' }}
      >
        {icon}
        {label}
      </button>
    );
  }

  const bestLabel = board.best != null ? board.best : '—';
  const lbRows = lbView === 'all' ? (board.leaderboardAll || []) : board.leaderboard;
  const q = questions[qIndex];
  const frac = Math.max(0, Math.min(1, remaining / perMs));
  const liveValue = Math.max(0, Math.round(maxPer * ptsFrac(remaining)));        // points if you answer right now
  const lowClock = phase === 'playing' && remaining <= 8000;
  const correctIdx = q ? q.correct : -1;

  const eloDept = deptOf(quiz);
  const eloDeptLabel = DEPT_LABEL[eloDept] || 'Category';
  const eloPanel = eloAfter ? (() => {
    const fmtN = (x) => (x == null ? null : x.toLocaleString());
    const aRating = eloAfter.rating;
    const bRating = eloBefore && eloBefore.rating != null ? eloBefore.rating : null;
    const aGlobal = eloAfter.rank != null ? eloAfter.rank : null;
    const bGlobal = eloBefore && eloBefore.found ? eloBefore.rank : null;
    const aCatObj = eloAfter.byCategory && eloAfter.byCategory[eloDept];
    const bCatObj = eloBefore && eloBefore.byCategory && eloBefore.byCategory[eloDept];
    const aCat = aCatObj ? aCatObj.rank : null;
    const bCat = bCatObj ? bCatObj.rank : null;
    const perGame = (eloAfter.recent && eloAfter.recent[0] && typeof eloAfter.recent[0].delta === 'number') ? eloAfter.recent[0].delta : (bRating != null ? aRating - bRating : null);
    const rg = (eloAfter.recent && eloAfter.recent[0]) ? eloAfter.recent[0] : null;
    const rows = [
      { label: 'ELO rating', value: fmtN(aRating), was: perGame != null ? `was ${fmtN(aRating - perGame)}` : null, delta: perGame, isNew: bRating == null },
      { label: 'Global rank', value: aGlobal != null ? `#${fmtN(aGlobal)}` : '—', was: bGlobal != null ? `was #${fmtN(bGlobal)}` : 'new entry', delta: (rg && typeof rg.rankDelta === 'number') ? rg.rankDelta : ((bGlobal != null && aGlobal != null) ? bGlobal - aGlobal : null), isNew: bGlobal == null },
      { label: `${eloDeptLabel} rank`, value: aCat != null ? `#${fmtN(aCat)}` : '—', was: bCat != null ? `was #${fmtN(bCat)}` : 'new entry', delta: (rg && typeof rg.catRankDelta === 'number') ? rg.catRankDelta : ((bCat != null && aCat != null) ? bCat - aCat : null), isNew: bCat == null },
    ];
    return (
      <div style={{ margin: '18px auto 0', maxWidth: 300, background: '#fbf7ef', border: `1px solid ${COLORS.faded}33` }}>
        <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.ember, textAlign: 'center', padding: '9px 0 1px' }}>Your standing</div>
        {rows.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderTop: i === 0 ? 'none' : `1px solid ${COLORS.faded}22` }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.13em', textTransform: 'uppercase', color: COLORS.faded }}>{r.label}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 19, lineHeight: 1.15, color: COLORS.ink }}>{r.value}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {r.was ? <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded }}>{r.was}</div> : null}
              {r.isNew ? (
                <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: COLORS.forest, background: '#e7ecdf', padding: '3px 8px', display: 'inline-block', marginTop: 3 }}>NEW</div>
              ) : (r.delta == null || r.delta === 0) ? (
                <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, marginTop: 3 }}>±0</div>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: r.delta > 0 ? COLORS.forest : COLORS.ember, background: r.delta > 0 ? '#e7ecdf' : '#f6e2dd', padding: '3px 8px', display: 'inline-block', marginTop: 3 }}>{r.delta > 0 ? '▲' : '▼'} {Math.abs(r.delta).toLocaleString()}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  })() : null;

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <div style={{ position: 'relative', zIndex: 3 }}><SiteHeader active="quizzes" /></div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '4px 24px 80px' }}>

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Header */}
        <div style={{ paddingBottom: 0, marginTop: 8 }}>
          <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: 'clamp(28px, 4.5vw, 44px)', lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0, color: COLORS.ink }}>{quiz.title}</h1>
          <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, margin: '10px 0 0', color: COLORS.faded, maxWidth: 680 }}>{quiz.blurb}</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 14, justifyContent: 'flex-end' }}>
          <button onClick={() => setTab('share')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: tab === 'share' ? COLORS.ember : COLORS.faded, display: 'flex', alignItems: 'center', gap: 5 }}><Share2 size={13} strokeWidth={2.5} /> Share</button>
          <button onClick={() => { setQSent(false); setQOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 5 }}><HelpCircle size={13} strokeWidth={2.5} /> Error(s)?</button>
        </div>

        {/* Ribbon */}
        <div style={{ marginTop: 8 }}>
          <div style={{ position: 'relative' }}>
            <style>{`@keyframes qzCueR{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}@keyframes qzCueL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}.qz-cue{position:absolute;top:50%;z-index:3;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:#fff;box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}.qz-cue-r{right:10px;animation:qzCueR 1.4s ease-in-out infinite;}.qz-cue-l{left:10px;animation:qzCueL 1.4s ease-in-out infinite;}@media(min-width:760px){.qz-cue{display:none;}}.qz-ribbon{scrollbar-width:none;-ms-overflow-style:none;}.qz-ribbon::-webkit-scrollbar{display:none;}`}</style>
            <div ref={ribbonRef} className="qz-ribbon" style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: '#eceef1', borderRadius: 10, padding: 4, gap: 6 }}>
            {chip('play', 'Play')}
            {chip('stats', 'Leaderboard')}
            {chip('join', 'Sign-up', <Trophy size={12} strokeWidth={2.5} />)}
            </div>
            {ribScroll.left && <span aria-hidden="true" className="qz-cue qz-cue-l">&#8249;</span>}
            {ribScroll.right && <span aria-hidden="true" className="qz-cue qz-cue-r">&#8250;</span>}
          </div>
        </div>

        <div style={{ marginTop: 24 }} />

        {/* ── PLAY ── */}
        {tab === 'play' && (
          <>
            {/* Freeze the score/timer bar at the top (44 = ribbon height), mirroring the
                name-them-all board so the countdown and points stay visible as the
                question and options scroll underneath. */}
            <div style={{ position: 'sticky', top: 0, zIndex: 24, background: COLORS.cream, paddingBottom: 4 }}>
            {/* Scoreboard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, borderRadius: 12, padding: '16px 20px', marginBottom: 0 }}>
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{points}<span style={{ fontSize: 20, color: COLORS.faded }}>/{maxPoints}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Points</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${COLORS.faded}33`, borderRight: `1px solid ${COLORS.faded}33`, padding: '0 22px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: COLORS.ember }}>{bestLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Best · <Count value={board.plays} /> {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: phase === 'idle' || phase === 'done' ? COLORS.faded : COLORS.ink }}>
                  {phase === 'idle' ? `Q —/${total}` : `Q ${Math.min(qIndex + 1, total)}/${total}`}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Question</div>
              </div>
            </div>
            {/* Live timer bar + point value, frozen with the scoreboard so the countdown is always visible. */}
            {(phase === 'playing' || phase === 'reveal') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <div style={{ flex: 1, height: 12, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}44`, position: 'relative', overflow: 'hidden' }}>
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
            )}
            </div>

            {/* IDLE — start screen */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '26px 24px 30px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                <Zap size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
                <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: '8px 0 6px' }}>Beat the clock.</h2>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: '#4a4339', maxWidth: 460, margin: '0 auto 6px' }}>
                  {total} questions, four answers each. You get {perSec} seconds per question, and the points you bank for a right answer fall as the clock ticks. Answer within about {Math.round(graceMs/1000)} seconds for the full {maxPer}; after that the points decay to the buzzer. A wrong answer scores zero.
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
                        style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', padding: '15px 18px', borderRadius: 10, background: bg, border: `1.5px solid ${border}`, color: fg, cursor: revealing ? 'default' : 'pointer', fontFamily: SANS, fontSize: 17, lineHeight: 1.3, transition: 'background .15s, border-color .15s' }}
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
                <div style={{ padding: 24, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>
                    {points === maxPoints ? 'Theoretical maximum' : answeredCount < total ? 'Ended early' : 'Final score'}
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{points}<span style={{ fontSize: 24, color: COLORS.faded }}>/{maxPoints}</span></div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginBottom: 10 }}>
                    {results.filter((r) => r.correct).length} of {total} right · {isTopScore ? 'you are the top score' : `you beat ${percentile(points, maxPoints)}% of players`}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                    {board.best != null ? (points >= board.best ? `That is the high score to beat.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {!mcqRevealed && (
                      <button onClick={() => setMcqRevealed(true)} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', width: 210, padding: 0, boxSizing: 'border-box', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <ScrollText size={14} strokeWidth={2.5} /> Quiz Summary
                      </button>
                    )}
                    {!identity && (
                      <button onClick={() => setTab('join')} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', width: 210, padding: 0, boxSizing: 'border-box', background: 'transparent', color: COLORS.ink, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <Trophy size={14} strokeWidth={2.5} /> Post to Leaderboard
                      </button>
                    )}
                    <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', width: 210, padding: 0, boxSizing: 'border-box', background: COLORS.ink, color: COLORS.cream, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Challenge a friend'}
                    </button>
                  </div>
                </div>

                {eloPanel}

                {/* Per-question recap (answer key) - hidden until revealed */}
                {!mcqRevealed && (
                  <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.faded, textAlign: 'center', marginTop: 22 }}>Press Quiz Summary for the results and the story behind each answer.</p>
                )}
                {mcqRevealed && (
                <ol style={{ margin: '18px 0 0', padding: 0, listStyle: 'none' }}>
                  {questions.map((qq, i) => {
                    const r = results[i];
                    const answered = !!r;
                    const good = answered && r.correct;
                    return (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${good ? COLORS.forest : COLORS.faded + '33'}`, marginBottom: 8, background: good ? '#fff' : COLORS.paper }}>
                        <span style={{ width: 22, flex: 'none', color: good ? COLORS.forest : COLORS.ember }}>{good ? <Check size={17} strokeWidth={3} /> : <X size={17} strokeWidth={3} />}</span>
                        <span style={{ flex: 1, fontFamily: SANS, fontSize: 14, lineHeight: 1.35 }}>
                          <span style={{ color: '#4a4339' }}>{qq.q}</span>
                          <span style={{ display: 'block', fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 3 }}>
                            Answer: <span style={{ color: COLORS.ink }}>{qq.choices[qq.correct]}</span>
                          </span>
                          {qq.note && (
                            <span style={{ display: 'block', fontFamily: SANS, fontSize: 13, color: '#4a4339', marginTop: 6, lineHeight: 1.45 }}>{qq.note}</span>
                          )}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 14, color: good ? COLORS.forest : COLORS.faded, flex: 'none' }}>+{answered ? r.pts : 0}</span>
                      </li>
                    );
                  })}
                </ol>
                )}
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
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', color: COLORS.faded }}>{bestLabel} best · <Count value={board.plays} /> {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>

              {board.plays > 0 && (
                <div style={{ display: 'flex', marginBottom: 14, borderRadius: 10, border: `1px solid ${COLORS.faded}55`, width: 'fit-content' }}>
                  {[['registered', 'Registered'], ['all', 'All players']].map(([k, label], idx) => {
                    const on = lbView === k;
                    return (
                      <button key={k} onClick={() => setLbView(k)} style={{ padding: '6px 14px', background: on ? COLORS.ink : 'transparent', color: on ? '#fff' : COLORS.faded, border: 'none', borderLeft: idx === 0 ? 'none' : `1px solid ${COLORS.faded}55`, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                    );
                  })}
                </div>
              )}

              {lbRows.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded }}>
                  No one has posted a score yet. <button onClick={() => setTab('join')} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.ember, font: 'inherit', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>Join the leaderboard</button> and be first.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, padding: '0 14px 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>
                    <span>#</span><span>Username</span><span style={{ textAlign: 'right' }}>Points</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  {lbRows.map((row, i) => {
                    const mine = identity && row.username === identity.username;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? '#fff' : COLORS.paper, borderRadius: 10, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}` }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, color: i < 3 ? COLORS.ember : COLORS.faded }}>{i + 1}</span>
                        <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.userKey ? <a href={`/quizzes/hub?player=${encodeURIComponent(row.userKey)}`} style={{ color: 'inherit', textDecoration: 'none', borderBottom: `1px dotted ${COLORS.faded}88`, cursor: 'pointer' }}>{row.username}</a> : row.username}{mine ? ' (you)' : ''}{row.tryNum ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400, color: COLORS.faded, marginLeft: 6 }}>{row.tryNum > 1 ? '(retried)' : '(1st Try)'}</span> : ''}</span>
                          {row.playedAt ? <span style={{ fontFamily: MONO, fontSize: 10.5, color: COLORS.faded }}>{fmtWhen(row.playedAt)}</span> : null}
                        </span>
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
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : (phase === 'done' ? 'Challenge a friend' : 'Share this quiz')}
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
                ? <a href={quiz.source.url} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.ember }}>{quiz.source.label}</a>
                : quiz.source.label}
          </div>
        )}

        {(() => {
          const more = [
            ...QUIZZES.filter((x) => x.id !== quiz.id && quiz.category && x.category === quiz.category),
            ...QUIZZES.filter((x) => x.id !== quiz.id && !(quiz.category && x.category === quiz.category)),
          ].slice(0, 8);
          if (more.length === 0) return null;
          return (
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.faded}33` }}>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 16 }}>More quizzes</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {more.map((rq) => (
                  <a key={rq.id} href={`/quiz/${rq.id}`} style={{ textDecoration: 'none', color: COLORS.ink, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '12px 14px', display: 'block' }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700, marginBottom: 6 }}>{rq.category || 'Quiz'}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{rq.title}</div>
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

      </div>

      {qOpen && (
        <div
          onClick={() => setQOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(26,22,17,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vh 16px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: COLORS.cream, borderRadius: 10, border: `2px solid ${COLORS.ink}`, padding: 24 }}>
            {qSent ? (
              <>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 22, margin: '0 0 10px' }}>Thanks, noted.</h3>
                <p style={{ fontFamily: SANS, fontSize: 15, color: COLORS.faded, margin: '0 0 20px' }}>
                  Your question went to the editors' desk. We read every one.
                </p>
                <button
                  onClick={() => { setQOpen(false); setQSent(false); setQMsg(''); setQName(''); setQEmail(''); }}
                  style={{ cursor: 'pointer', background: COLORS.ink, color: COLORS.cream, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, padding: '12px 20px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}
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
                  <input type="text" value={qName} onChange={(e) => setQName(e.target.value)} maxLength={120} placeholder="Name (optional)" style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }} />
                  <input type="email" value={qEmail} onChange={(e) => setQEmail(e.target.value)} maxLength={200} placeholder="Email (optional)" style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }} />
                </div>
                <textarea value={qMsg} onChange={(e) => setQMsg(e.target.value)} maxLength={1000} rows={4} placeholder="What's your question or comment? (optional)" style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setQOpen(false)} style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Cancel</button>
                  <button onClick={submitQuestion} disabled={qBusy} style={{ cursor: 'pointer', background: COLORS.ember, color: '#fff', borderRadius: 10, border: `1.5px solid ${COLORS.ember}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: qBusy ? 0.6 : 1 }}>{qBusy ? 'Sending…' : 'Send to editors'}</button>
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
  return { fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, padding: '10px 18px', background: 'transparent', color: COLORS.faded, borderRadius: 10, border: `1px solid ${COLORS.faded}55`, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 };
}

const labelStyle = { display: 'block', fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 6 };
const fieldStyle = { width: '100%', fontFamily: SANS, fontSize: 16, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: '#fff', color: COLORS.ink };

function StatBox({ label, value, accent }) {
  return (
    <div style={{ background: accent ? COLORS.paper : '#eceef1', borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '18px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, lineHeight: 1, color: accent ? COLORS.ember : COLORS.ink }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, marginTop: 8 }}>{label}</div>
    </div>
  );
}
