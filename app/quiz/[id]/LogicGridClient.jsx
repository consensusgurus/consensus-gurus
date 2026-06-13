'use client';

// Country logic-grid quiz board (format: 'logic-grid').
//
// A faithful recreation of Sporcle's "Country Trivia Logic Puzzle": a 6-column
// by 5-row grid of 30 cells. Each row is one continent (hidden until the end)
// and most cells carry a trivia/logic clue. Read the clues, deduce which
// country belongs in each box, click a box and type the country. Solving every
// box is the perfect score. Reuses the same /api/quiz/* endpoints, leaderboard,
// and visual language as the other quiz boards.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, Flag, Trophy, HelpCircle, Globe } from 'lucide-react';
import { getQuiz } from '@/lib/quizzes';
import Grain from '../../Grain';
import Footer from '../../Footer';
import Count from '../../Count';

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

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Same order-independent key match used across the quiz boards.
function keyHit(g, key) {
  const k = norm(key);
  if (!k) return false;
  if (g.includes(k)) return true;
  const kt = k.split(' ');
  if (kt.length < 2) return false;
  const gt = g.split(' ');
  return kt.every((w) => gt.includes(w));
}
function anyKey(g, keys) {
  return (keys || []).some((k) => keyHit(g, k));
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
function recordResult(id, score) {
  const s = loadStats(id);
  const next = { attempts: s.attempts + 1, best: Math.max(s.best, score), totalCorrect: s.totalCorrect + score };
  try { localStorage.setItem(statsKey(id), JSON.stringify(next)); } catch {}
  return next;
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
function percentile(score, total) {
  const frac = total ? score / total : 0;
  return Math.round(Math.min(99, Math.max(2, Math.pow(frac, 1.35) * 100)));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LogicGridClient({ quizId }) {
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

  const cells = quiz.cells || [];
  const total = cells.length;
  const cols = quiz.cols || 6;
  const rowLabels = quiz.rowLabels || [];
  const intro = quiz.intro || [];

  const [tab, setTab] = useState('play');

  // ── Game state ──
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [solved, setSolved] = useState(() => new Array(total).fill(false));
  const [active, setActive] = useState(null);  // index of the selected cell
  const [guess, setGuess] = useState('');
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('Press Start to read the clues and begin.');
  const [hintBad, setHintBad] = useState(false);
  const [lastElapsed, setLastElapsed] = useState(null);
  const [revealed, setRevealed] = useState(false); // after end: misses filled in

  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [board, setBoard] = useState({ plays: 0, best: null, topTime: null, leaderboard: [] });
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
  const startRef = useRef(null);
  const endedRef = useRef(false);
  const inputRef = useRef(null);
  const viewedRef = useRef(false);

  const score = solved.filter(Boolean).length;
  const isTopScore = phase === 'done' && board.best != null && lastElapsed != null
    && score === board.best && board.topTime != null && lastElapsed <= board.topTime;

  function refreshBoard() {
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [] }); })
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
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  function endGame(win, solvedOverride) {
    if (endedRef.current) return;
    endedRef.current = true;
    setPhase('done');
    clearInterval(timerRef.current);
    setActive(null);
    const finalSolved = solvedOverride || solved;
    const finalScore = finalSolved.filter(Boolean).length;
    const elapsed = startRef.current ? Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000)) : quiz.timeLimit;
    setLastElapsed(elapsed);
    setStats(recordResult(quizId, finalScore));
    setRevealed(true);
    setHint(win ? `Solved — all ${total} boxes in ${fmtTime(elapsed)}!` : `Time's up. You placed ${finalScore}/${total}.`);
    setHintBad(!win);
    fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, score: finalScore, total, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId() }),
    })
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [] }); })
      .catch(() => {});
  }

  function startGame() {
    if (phase !== 'idle') return;
    endedRef.current = false;
    setPhase('playing');
    startRef.current = Date.now();
    setHint('Read the clues, then click a box and type the country.');
    setHintBad(false);
    // Select the first cell that carries a clue, so the input bar has context.
    const firstClued = cells.findIndex((c) => c.clue);
    setActive(firstClued >= 0 ? firstClued : 0);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(false); return 0; }
        return t - 1;
      });
    }, 1000);
    setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 30);
  }

  function selectCell(i) {
    if (phase !== 'playing' || solved[i]) return;
    setActive(i);
    if (inputRef.current) inputRef.current.focus();
  }

  function submitGuess(raw) {
    if (phase !== 'playing' || active == null) return;
    const g = norm(raw);
    if (!g) return;
    const cell = cells[active];
    if (anyKey(g, cell.keys) && !anyKey(g, cell.anti)) {
      const next = solved.slice();
      next[active] = true;
      setSolved(next);
      setGuess('');
      setHint(`Correct — ${cell.id} is ${cell.t}.`);
      setHintBad(false);
      if (next.every(Boolean)) { endGame(true, next); return; }
      // Advance to the next unsolved cell (prefer one with a clue).
      const order = [...cells.keys()].filter((j) => !next[j]);
      const nextClued = order.find((j) => cells[j].clue);
      setActive(nextClued != null ? nextClued : order[0]);
    } else {
      setHint(`Not the country for ${cell.id}. Try another box or guess.`);
      setHintBad(true);
    }
  }
  function onKey(e) {
    if (e.key !== 'Enter') return;
    submitGuess(e.target.value);
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
      refreshBoard();
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

  const clock = fmtTime(time);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sourceoftruths.com/quiz/${quiz.id}`;
  function share() {
    const text = phase === 'done'
      ? `I placed ${score}/${total} on "${quiz.title}" at Source of Truths. Can you solve the grid?`
      : `Can you solve all ${total} boxes? "${quiz.title}" at Source of Truths.`;
    if (navigator.share) {
      navigator.share({ title: quiz.title, text, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${shareUrl}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    }
  }

  function chip(key, label, icon) {
    const isActive = tab === key;
    return (
      <button
        onClick={() => setTab(key)}
        style={{ flex: '1 0 auto', justifyContent: 'center', background: isActive ? COLORS.ember : 'transparent', color: COLORS.cream, border: 'none', borderRight: '1px solid rgba(244,237,224,0.18)', padding: '0 16px', height: 42, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        {icon}
        {label}
      </button>
    );
  }

  const bestLabel = board.best != null ? board.best : '—';
  const activeCell = active != null ? cells[active] : null;
  // Group cells into rows for the grid (cells are stored in row-major order).
  const rows = [];
  for (let r = 0; r < total / cols; r++) rows.push(cells.slice(r * cols, r * cols + cols));

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1060, margin: '0 auto', padding: '24px 20px 80px' }}>

        <button onClick={() => router.push('/quizzes')} style={{ background: 'transparent', border: 'none', fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLORS.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 8px', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{score}<span style={{ fontSize: 20, color: COLORS.faded }}>/{total}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Boxes placed</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: COLORS.ember }}>{bestLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Best · <Count value={board.plays} /> {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: time <= 30 && phase === 'playing' ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>

            {/* IDLE — start screen with the rules */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '26px 24px 30px', border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                <Globe size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
                <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: '8px 0 6px' }}>Trivia meets logic.</h2>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: '#4a4339', maxWidth: 500, margin: '0 auto 14px' }}>
                  Thirty boxes, one country in each. Most boxes carry a clue; the rest you deduce. Click a box, read its clue, and type the country. Every box is solvable from the clues alone, no guessing required.
                </p>
                {intro.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: '0 auto 18px', padding: 0, maxWidth: 520, textAlign: 'left' }}>
                    {intro.map((line, i) => (
                      <li key={i} style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.5, color: COLORS.faded, paddingLeft: 16, position: 'relative', marginBottom: 6 }}>
                        <span style={{ position: 'absolute', left: 0, color: COLORS.ember }}>›</span>{line}
                      </li>
                    ))}
                  </ul>
                )}
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.faded, margin: '0 0 20px' }}>
                  {fmtTime(quiz.timeLimit)} on the clock.
                </p>
                <button onClick={startGame} style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 40px', lineHeight: '52px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer' }}>
                  Start
                </button>
              </div>
            )}

            {/* PLAYING / DONE — the input bar + grid */}
            {phase !== 'idle' && (
              <>
                {/* Input bar — types into the selected cell */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 6, alignItems: 'stretch' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.ember, minHeight: 14 }}>
                      {activeCell ? `Box ${activeCell.id}` : phase === 'done' ? 'Game over' : 'Pick a box'}
                    </div>
                    <input
                      ref={inputRef}
                      value={guess}
                      disabled={phase !== 'playing'}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={onKey}
                      placeholder={phase === 'playing' ? (activeCell ? `Type the country for ${activeCell.id}, then Enter…` : 'Click a box to select it…') : 'Game over'}
                      autoComplete="off"
                      style={{ fontFamily: SANS, fontSize: 17, padding: '14px 16px', border: `1.5px solid ${COLORS.ink}`, background: phase !== 'playing' ? COLORS.paper : '#fff', color: COLORS.ink, opacity: phase !== 'playing' ? 0.5 : 1 }}
                    />
                  </div>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 18, marginBottom: 16, color: hintBad ? COLORS.ember : COLORS.faded }}>{hint}</div>

                {/* The grid */}
                <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                  <div style={{ minWidth: 620 }}>
                    {rows.map((rowCells, r) => (
                      <div key={r} style={{ display: 'grid', gridTemplateColumns: `40px repeat(${cols}, 1fr)`, gap: 6, marginBottom: 6 }}>
                        {/* Row label gutter — continent revealed at the end */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: COLORS.ink, color: COLORS.cream, padding: '4px 2px' }}>
                          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{r + 1}</span>
                          {revealed && rowLabels[r] && (
                            <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.02em', textTransform: 'uppercase', color: COLORS.cream, opacity: 0.8, marginTop: 3, textAlign: 'center', lineHeight: 1.1 }}>{rowLabels[r]}</span>
                          )}
                        </div>
                        {rowCells.map((cell) => {
                          const i = cells.indexOf(cell);
                          const isSolved = solved[i];
                          const isActive = i === active && phase === 'playing';
                          const isMiss = phase === 'done' && !isSolved;
                          const bg = isSolved ? '#eef3e6' : isMiss ? '#f6ead9' : isActive ? '#fff' : COLORS.paper;
                          const bdr = isSolved ? COLORS.forest : isMiss ? COLORS.rust : isActive ? COLORS.ember : COLORS.faded + '33';
                          return (
                            <button
                              key={cell.id}
                              onClick={() => selectCell(i)}
                              disabled={phase !== 'playing' || isSolved}
                              style={{ position: 'relative', textAlign: 'left', minHeight: 96, padding: '7px 8px 8px', background: bg, border: `1.5px solid ${bdr}`, boxShadow: isActive ? `inset 3px 0 0 ${COLORS.ember}` : 'none', cursor: phase === 'playing' && !isSolved ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: COLORS.ember }}>{cell.id}</span>
                                {isSolved && <Check size={13} strokeWidth={3} style={{ color: COLORS.forest }} />}
                              </div>
                              {(isSolved || isMiss) && (
                                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14, lineHeight: 1.1, color: isMiss ? COLORS.rust : COLORS.ink }}>{cell.t}</span>
                              )}
                              {cell.clue ? (
                                <span style={{ fontFamily: SANS, fontSize: 11, lineHeight: 1.25, color: isSolved || isMiss ? COLORS.faded : '#4a4339' }}>{cell.clue}</span>
                              ) : (
                                !isSolved && !isMiss && <span style={{ fontFamily: MONO, fontSize: 10, fontStyle: 'italic', color: COLORS.faded, opacity: 0.7 }}>no clue — deduce it</span>
                              )}
                              {isMiss && <span style={{ position: 'absolute', bottom: 6, right: 8, fontFamily: MONO, fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.rust, fontWeight: 700 }}>Missed</span>}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONE — results card */}
                {phase === 'done' && (
                  <div style={{ marginTop: 22, padding: 24, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                    <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>{score === total ? 'Grid solved' : time <= 0 ? "Time's up" : 'Gave up'}</div>
                    <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 40, lineHeight: 1, marginBottom: 6 }}>{score}<span style={{ fontSize: 22, color: COLORS.faded }}>/{total}</span></div>
                    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginBottom: 10 }}>{isTopScore ? 'you are the top score' : `you beat ${percentile(score, total)}% of players`}</div>
                    <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 460, margin: '0 auto 6px' }}>
                      {board.best != null ? (score >= board.best ? `That matches the high score of ${board.best}.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}
                    </p>
                    <p style={{ fontFamily: SANS, fontSize: 14, color: COLORS.faded, maxWidth: 460, margin: '0 auto 18px' }}>The answers you missed are filled in above in rust, and each row's continent is now shown.</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button onClick={() => { setPhase('idle'); setSolved(new Array(total).fill(false)); setActive(null); setGuess(''); setTime(quiz.timeLimit); setRevealed(false); endedRef.current = false; setHint('Press Start to read the clues and begin.'); setHintBad(false); }} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 28px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer' }}>Play again</button>
                      {!identity && (
                        <button onClick={() => setTab('join')} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <Trophy size={14} strokeWidth={2.5} /> Join the leaderboard
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Give up */}
                {phase === 'playing' && (
                  <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={() => endGame(false)} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '12px 26px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Flag size={14} strokeWidth={2.5} color="#fff" /> Give up
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── STATS & LEADERBOARD ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 14 }}>Your record</div>
            {stats.attempts === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: COLORS.faded }}>Play a round and your record shows up here. It stays on this device.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatBox label="Best score" value={`${stats.best}/${total}`} accent />
                <StatBox label="Your average" value={`${Math.round(stats.totalCorrect / stats.attempts)}`} />
                <StatBox label="Attempts" value={stats.attempts} />
              </div>
            )}

            <div style={{ borderTop: `1px solid ${COLORS.faded}33`, marginTop: 26, paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.faded }}>Leaderboard</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', color: COLORS.faded }}>{bestLabel} best · <Count value={board.plays} /> {board.plays === 1 ? 'play' : 'plays'}</div>
              </div>

              {board.leaderboard.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded }}>
                  No one has posted a score yet. <button onClick={() => setTab('join')} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.ember, font: 'inherit', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>Join the leaderboard</button> and be first.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, padding: '0 14px 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>
                    <span>#</span><span>Username</span><span style={{ textAlign: 'right' }}>Score</span><span style={{ textAlign: 'right' }}>Time</span>
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
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{phase === 'done' ? `You placed ${score} of ${total}. Challenge someone to solve the grid.` : 'Send this puzzle to someone who thinks they know their countries.'}</p>
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
            <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="e.g. atlasmind" style={fieldStyle} />
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
