'use client';

// Photo quiz board (format: 'photo').
//
// One photograph at a time. The player types the city the landmark belongs to,
// or skips to cycle to the next photo and come back later. A correct guess marks
// the photo solved, reveals the landmark name briefly, and advances. The whole
// deck runs against one overall clock; the score is the number of cities named.
// Misses are revealed (city + landmark) in the end-of-game recap. Reuses the same
// /api/quiz/* endpoints, leaderboard, and visual language as QuizClient.jsx.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, X, Flag, Trophy, HelpCircle, Camera, SkipForward } from 'lucide-react';
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

function shuffleIdx(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
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

export default function PhotoQuizClient({ quizId }) {
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

  const answers = quiz.answers || [];
  const total = answers.length;
  const noun = quiz.noun || 'city';

  const [tab, setTab] = useState('play');

  // ── Game state ──
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [solved, setSolved] = useState(() => new Array(total).fill(false));
  const orderRef = useRef(null);
  const [pos, setPos] = useState(0);            // position into orderRef.current
  const [guess, setGuess] = useState('');
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('Press Play to start the clock.');
  const [hintBad, setHintBad] = useState(false);
  const [flash, setFlash] = useState(null);     // { ok, city, landmark } overlay after a correct/skip
  const [lastElapsed, setLastElapsed] = useState(null);

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
  const flashRef = useRef(null);
  const viewedRef = useRef(false);

  const score = solved.filter(Boolean).length;
  const curIdx = orderRef.current ? orderRef.current[pos] : 0;
  const cur = answers[curIdx];
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
      fetch('/api/quiz/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId }) }).catch(() => {});
    }
    return () => { clearInterval(timerRef.current); clearTimeout(flashRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  function focusInput() { setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0); }

  function start() {
    if (phase !== 'idle') return;
    endedRef.current = false;
    orderRef.current = shuffleIdx(total);
    setSolved(new Array(total).fill(false));
    setPos(0);
    setPhase('playing');
    setHint('Name the city the landmark is in. Stuck? Skip and it comes back around.');
    setHintBad(false);
    startRef.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timerRef.current); finish(false); return 0; }
        return t - 1;
      });
    }, 1000);
    focusInput();
  }

  // Advance to the next unsolved photo starting AFTER the given position, with a
  // solved-override so we can pass the freshly updated solved array.
  function advanceFrom(fromPos, solvedArr) {
    const ord = orderRef.current || [];
    for (let step = 1; step <= total; step++) {
      const p = (fromPos + step) % total;
      if (!solvedArr[ord[p]]) { setPos(p); focusInput(); return true; }
    }
    return false; // nothing unsolved left
  }

  // Silent auto-accept (universal quiz rule): on every keystroke we test the
  // guess against the current photo and accept the moment it matches, no Enter
  // needed. Returns true on a match (and clears the input); false otherwise,
  // with NO failure hint so partial typing isn't nagged.
  function tryAccept(raw) {
    if (phase !== 'playing' || flash) return false;
    const g = norm(raw);
    if (!g) return false;
    const a = answers[curIdx];
    if (anyKey(g, a.keys) && !anyKey(g, a.anti)) {
      const next = solved.slice();
      next[curIdx] = true;
      setSolved(next);
      setGuess('');
      setHintBad(false);
      setHint(`Correct — ${a.t}`);
      // Brief reveal overlay, then advance.
      setFlash({ ok: true, city: a.t, landmark: a.landmark });
      clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => {
        setFlash(null);
        if (next.every(Boolean)) { finish(true, next); return; }
        advanceFrom(pos, next);
      }, 950);
      return true;
    }
    return false;
  }

  function onChange(e) {
    const v = e.target.value;
    if (!tryAccept(v)) setGuess(v); // a match clears the input inside tryAccept
  }

  // Enter is an optional fallback; on a wrong full guess it gives feedback.
  function onKey(e) {
    if (e.key !== 'Enter' || phase !== 'playing' || flash) return;
    if (!tryAccept(e.target.value)) {
      setHint(`Not ${noun === 'city' ? 'the city' : 'it'} — try again, or Skip to come back.`);
      setHintBad(true);
    }
  }

  function skip() {
    if (phase !== 'playing' || flash) return;
    const ord = orderRef.current || [];
    const remaining = ord.filter((i) => !solved[i]);
    if (remaining.length <= 1) { setHint('This is the last one — name it.'); setHintBad(false); return; }
    setGuess('');
    setHint('Skipped — you will come back to it.');
    setHintBad(false);
    advanceFrom(pos, solved);
  }

  function finish(win, solvedOverride) {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    clearTimeout(flashRef.current);
    setFlash(null);
    setPhase('done');
    const finalSolved = solvedOverride || solved;
    const finalScore = finalSolved.filter(Boolean).length;
    const elapsed = startRef.current ? Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000)) : quiz.timeLimit;
    setLastElapsed(elapsed);
    setStats(recordResult(quizId, finalScore));
    setHint(win ? `Perfect — all ${total} named in ${fmtTime(elapsed)}!` : `Done. You named ${finalScore}/${total}.`);
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

  function giveUp() { if (phase === 'playing') finish(false); }

  function playAgain() {
    endedRef.current = false;
    setPhase('idle');
    setSolved(new Array(total).fill(false));
    setPos(0);
    setGuess('');
    setFlash(null);
    setTime(quiz.timeLimit);
    setHint('Press Play to start the clock.');
    setHintBad(false);
    setLastElapsed(null);
  }

  async function submitJoin() {
    setJoinErr(false);
    if (!jName.trim() || jName.trim().length > 40) { setJoinErr(true); setJoinMsg('Pick a username (max 40 characters).'); return; }
    if (!EMAIL_RE.test(jEmail.trim())) { setJoinErr(true); setJoinMsg('Enter a valid email.'); return; }
    setJoinBusy(true);
    try {
      const res = await fetch('/api/quiz/join', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: jName.trim(), email: jEmail.trim(), anonId: getAnonId() }) });
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
      await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listId: quiz.id, listTitle: `[Quiz] ${quiz.title}`, message: qMsg.trim(), name: qName.trim(), email: qEmail.trim() }) });
    } catch (e) { /* swallow */ }
    setQSent(true);
    setQBusy(false);
  }

  const clock = fmtTime(time);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sourceoftruths.com/quiz/${quiz.id}`;
  function share() {
    const text = phase === 'done'
      ? `I named ${score}/${total} cities from their landmarks on "${quiz.title}" at Source of Truths. Can you beat me?`
      : `Can you name all ${total} cities from a single photo? "${quiz.title}" at Source of Truths.`;
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
  const photoNum = phase === 'idle' ? '—' : Math.min(pos + 1, total);
  const lowClock = time <= 15 && phase === 'playing';

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 920, margin: '0 auto', padding: '24px 20px 80px' }}>

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 8px', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{score}<span style={{ fontSize: 19, color: COLORS.faded }}>/{total}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Named</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1, color: COLORS.ember }}>{bestLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Best</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{photoNum}<span style={{ fontSize: 19, color: COLORS.faded }}>/{total}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Photo</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 23, color: lowClock ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>

            {/* IDLE — start screen */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '26px 24px 30px', border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                <Camera size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
                <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: '8px 0 6px' }}>One photo at a time.</h2>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: '#4a4339', maxWidth: 470, margin: '0 auto 6px' }}>
                  {total} photographs, each of a famous landmark or building. Name the city it sits in and type it in, then Enter. Can't place one? Skip it and it cycles back around. You have {fmtTime(quiz.timeLimit)} on the clock to name as many as you can.
                </p>
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.faded, margin: '0 0 20px' }}>
                  The landmark name is revealed only when you get the city, or at the end.
                </p>
                <button onClick={start} style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 40px', lineHeight: '52px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer' }}>
                  Play
                </button>
              </div>
            )}

            {/* PLAYING — the photo + input */}
            {phase === 'playing' && cur && (
              <div>
                {/* Photo */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', maxHeight: 500, background: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, overflow: 'hidden', marginBottom: 14 }}>
                  <img
                    src={cur.img}
                    alt="Name the city this landmark is in"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  {flash && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,22,17,0.62)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
                      <Check size={40} strokeWidth={3} style={{ color: '#fff' }} />
                      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(26px, 5vw, 38px)', color: '#fff', marginTop: 6 }}>{flash.city}</div>
                      {flash.landmark && <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', color: '#f4ede0cc', marginTop: 4 }}>{flash.landmark}</div>}
                    </div>
                  )}
                </div>

                {/* Input + Skip */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                  <input
                    ref={inputRef}
                    value={guess}
                    disabled={!!flash}
                    onChange={onChange}
                    onKeyDown={onKey}
                    placeholder={`Type the ${noun}…`}
                    autoComplete="off"
                    style={{ flex: 1, fontFamily: SANS, fontSize: 17, padding: '14px 16px', border: `1.5px solid ${COLORS.ink}`, background: flash ? COLORS.paper : '#fff', color: COLORS.ink, opacity: flash ? 0.5 : 1 }}
                  />
                  <button onClick={skip} disabled={!!flash} style={{ flex: 'none', fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 20px', border: `1.5px solid ${COLORS.ink}`, background: 'transparent', color: COLORS.ink, cursor: flash ? 'default' : 'pointer', opacity: flash ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <SkipForward size={14} strokeWidth={2.5} /> Skip
                  </button>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 18, marginBottom: 18, color: hintBad ? COLORS.ember : COLORS.faded }}>{hint}</div>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  {(orderRef.current || []).map((ansIdx, p) => {
                    const done = solved[ansIdx];
                    const here = p === pos;
                    return <span key={p} style={{ width: here ? 22 : 9, height: 9, borderRadius: 5, background: done ? COLORS.forest : (here ? COLORS.rust : COLORS.faded + '44'), transition: 'all .2s' }} />;
                  })}
                </div>

                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                  <button onClick={giveUp} style={ghostBtn(false)}>
                    <Flag size={12} strokeWidth={2.5} /> Give up
                  </button>
                </div>
              </div>
            )}

            {/* DONE — results + recap */}
            {phase === 'done' && (
              <div>
                <div style={{ padding: 24, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>
                    {score === total ? 'Perfect score' : time <= 0 ? 'Time!' : 'Gave up'}
                  </div>
                  <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 44, lineHeight: 1, marginBottom: 6 }}>{score}<span style={{ fontSize: 24, color: COLORS.faded }}>/{total}</span></div>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, lineHeight: 1.15, marginBottom: 10 }}>
                    {isTopScore ? 'You are the top score' : `You beat ${percentile(score, total)}% of players`}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                    {board.best != null ? (score >= board.best ? `That matches the high score of ${board.best}.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'} The cities you missed are revealed below.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button onClick={playAgain} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 28px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer' }}>Play again</button>
                    {!identity && (
                      <button onClick={() => setTab('join')} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={14} strokeWidth={2.5} /> Join the leaderboard
                      </button>
                    )}
                  </div>
                </div>

                {/* Recap grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, margin: '18px 0 0' }}>
                  {answers.map((a, i) => {
                    const got = solved[i];
                    return (
                      <div key={i} style={{ border: `1px solid ${got ? COLORS.forest : COLORS.rust}`, background: got ? '#fff' : '#f6ead9' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', background: COLORS.ink, overflow: 'hidden' }}>
                          <img src={a.img} alt={`${a.t} — ${a.landmark || ''}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: got ? 1 : 0.92 }} />
                          <span style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, background: got ? COLORS.forest : COLORS.rust, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {got ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                          </span>
                        </div>
                        <div style={{ padding: '8px 10px 10px' }}>
                          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.1, color: got ? COLORS.ink : COLORS.rust }}>{a.t}</div>
                          {a.landmark && <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, marginTop: 3, lineHeight: 1.25 }}>{a.landmark}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{phase === 'done' ? `You named ${score} of ${total}. Challenge someone to beat it.` : 'Send this to someone who thinks they know the cities of the world.'}</p>
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
            <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="e.g. globetrotter" style={fieldStyle} />
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
