'use client';

// Grid cross-fill board (format: 'grid-fill').
//
// Several labeled COLUMNS (e.g. one per year), each a short ranked list of items
// that are all instances of the same kind of answer (companies). A single input:
// one correct guess fills EVERY cell across ALL columns whose answer is that
// company, so naming "Exxon" can light up eight year-columns at once. Order within
// a column does not matter. One overall clock; score = number of CELLS filled.
// Reuses the same /api/quiz/* endpoints, leaderboard, share, and visual language
// as QuizClient.jsx / PhotoQuizClient.jsx — the page chrome is identical by rule.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, X, Flag, Trophy, HelpCircle, LayoutGrid } from 'lucide-react';
import JoinLeaderboardForm from './JoinLeaderboardForm';
import LeaderboardSnippet from './LeaderboardSnippet';
import LeaderboardStrip from './LeaderboardStrip';
import QuizResultModal from './QuizResultModal';
import QuizDoneRecap from './QuizDoneRecap';
import { similarQuizId } from '@/lib/quiz-similar';
import { getQuiz } from '@/lib/quizzes';
import { useChallengeRun, ChallengeRunOverlay } from './useChallengeRun';
import useAbandonFlush from './useAbandonFlush';
import Grain from '../../Grain';
import Footer from '../../Footer';
import SiteHeader from '../../SiteHeader';
import QuizPlayerBar from './QuizPlayerBar';
import QuizPlayOverlay from './QuizPlayOverlay';
import { isMobileDevice } from '@/lib/is-mobile';
import { LB_POPS, LB_FILTERS, pickLb, lbEmptyNote } from '@/lib/quiz-lb';
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
// Resolve a raw guess to a company id, or null. Exact ticker match wins first;
// otherwise the longest matching key across all companies wins (so "exxon mobil"
// resolves to exxon, not mobil), and a company's `anti` list blocks a match.
function matchCompany(raw, companies, autoMode) {
  const g = norm(raw);
  if (!g) return null;
  // autoMode (live, every-keystroke): ignore 1-2 char tickers, which would
  // otherwise fire mid-word (typing "tesla" would grab AT&T on the first "t").
  for (const id in companies) {
    if ((companies[id].tk || []).some((t) => norm(t) === g && (!autoMode || norm(t).length >= 3))) return id;
  }
  let best = null;
  let bestLen = -1;
  for (const id in companies) {
    const o = companies[id];
    if ((o.anti || []).some((a) => g.includes(norm(a)))) continue;
    for (const k of o.keys || []) {
      const nk = norm(k);
      if (keyHit(g, nk) && nk.length > bestLen) { best = id; bestLen = nk.length; }
    }
  }
  return best;
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

function statsKey(id) { return `sot_quiz_${id}`; }
function loadStats(id) {
  if (typeof window === 'undefined') return { attempts: 0, best: 0, totalCorrect: 0 };
  try { return JSON.parse(localStorage.getItem(statsKey(id))) || { attempts: 0, best: 0, totalCorrect: 0 }; }
  catch { return { attempts: 0, best: 0, totalCorrect: 0 }; }
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

export default function GridFillBoard({ quizId, mobile = false }) {
  const router = useRouter();
  const quiz = useMemo(() => getQuiz(quizId), [quizId]);
  const chRun = useChallengeRun(quizId);

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

  const companies = quiz.companies || {};
  const columns = quiz.columns || [];
  const totalCells = useMemo(() => columns.reduce((n, c) => n + (c.items ? c.items.length : 0), 0), [columns]);
  const totalCompanies = useMemo(() => {
    const s = new Set();
    columns.forEach((c) => (c.items || []).forEach((it) => s.add(it.id)));
    return s.size;
  }, [columns]);
  const noun = quiz.noun || 'company';

  const [tab, setTab] = useState('play');

  // ── Game state ──
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [reviewing, setReviewing] = useState(false); // done: popup vs reviewing the grid
  // Mobile: dock the scoreboard + answer input to the bottom thumb zone during
  // play, lifting above the on-screen keyboard via visualViewport.
  const [kbInset, setKbInset] = useState(0);
  useEffect(() => {
    if (!(mobile && phase === 'playing')) { setKbInset(0); return undefined; }
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onVV = () => setKbInset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    onVV();
    vv.addEventListener('resize', onVV);
    vv.addEventListener('scroll', onVV);
    return () => { vv.removeEventListener('resize', onVV); vv.removeEventListener('scroll', onVV); };
  }, [mobile, phase]);
  const dock = mobile && phase === 'playing';
  const playBarStyle = dock
    ? { position: 'fixed', left: 0, right: 0, bottom: kbInset, zIndex: 40, background: COLORS.cream, padding: '8px 12px', paddingBottom: kbInset > 0 ? 6 : 'calc(8px + env(safe-area-inset-bottom))', borderTop: `1px solid ${COLORS.faded}22`, boxShadow: '0 -7px 18px rgba(20,22,28,0.12)' }
    : { position: 'sticky', top: 0, zIndex: 24, background: COLORS.cream, paddingTop: 6, paddingBottom: 8, marginBottom: 8 };
  const [found, setFound] = useState(() => new Set()); // company ids
  const [guess, setGuess] = useState('');
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('Press Play to start the clock.');
  const [hintBad, setHintBad] = useState(false);
  const [justId, setJustId] = useState(null);
  const [lastElapsed, setLastElapsed] = useState(null);

  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [board, setBoard] = useState({ plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} });
  const [lbPop, setLbPop] = useState('registered');
  const [lbFilter, setLbFilter] = useState('all');
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
  const foundRef = useRef(found);
  const inputRef = useRef(null);
  const justRef = useRef(null);
  const viewedRef = useRef(false);

  const filledCells = useMemo(() => {
    let n = 0;
    columns.forEach((c) => (c.items || []).forEach((it) => { if (found.has(it.id)) n++; }));
    return n;
  }, [columns, found]);
  const score = filledCells;
  const isTopScore = phase === 'done' && board.best != null && lastElapsed != null
    && score === board.best && board.topTime != null && lastElapsed <= board.topTime;

  function refreshBoard() {
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [], leaderboardMobile: d.leaderboardMobile || [], leaderboardFirst: d.leaderboardFirst || [], leaderboards: d.leaderboards || {} }); })
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
    return () => { clearInterval(timerRef.current); clearTimeout(justRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Record an in-progress game if the player leaves before finishing.
  const abandon = useAbandonFlush(() => {
    if (endedRef.current || !startRef.current) return null;
    if (phase === 'idle' || phase === 'done') return null;
    const elapsed = Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000));
    if (!elapsed) return null;
    const finalFound = foundRef.current;
    let finalScore = 0;
    columns.forEach((c) => (c.items || []).forEach((it) => { if (finalFound.has(it.id)) finalScore++; }));
    return { quizId, score: finalScore, total: totalCells, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId() };
  });

  function focusInput() { setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0); }

  function start() {
    setReviewing(false);
    if (phase !== 'idle') return;
    endedRef.current = false;
    foundRef.current = new Set();
    setFound(new Set());
    setGuess('');
    setPhase('playing');
    setHint(`Name a ${noun} and it fills every year it was a giant. Order doesn't matter.`);
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

  function acceptId(id) {
    const next = new Set(foundRef.current);
    next.add(id);
    foundRef.current = next;
    setFound(next);
    setGuess('');
    setHintBad(false);
    let n = 0;
    columns.forEach((c) => (c.items || []).forEach((it) => { if (it.id === id) n++; }));
    setHint(`Correct: ${companies[id].name} (${n} year${n > 1 ? 's' : ''}).`);
    setJustId(id);
    clearTimeout(justRef.current);
    justRef.current = setTimeout(() => setJustId(null), 900);
    if (next.size >= totalCompanies) { finish(true, next); }
  }

  // Live auto-accept: every keystroke. A correct company is taken the instant
  // its name (or a 3+ char ticker) is typed, no Enter needed, and the box
  // clears. No error noise while typing; misses are silent here.
  function onType(v) {
    if (phase === 'playing') {
      const id = matchCompany(v, companies, true);
      if (id && !foundRef.current.has(id)) { acceptId(id); return; }
    }
    setGuess(v);
  }

  // Explicit submit (Enter / Guess button): full matcher including short
  // tickers, with not-found / already-found messaging.
  function submitGuess(raw) {
    if (phase !== 'playing') return;
    const g = norm(raw);
    if (!g) return;
    const id = matchCompany(raw, companies);
    if (!id) { setHint(`No match for "${raw.trim()}".`); setHintBad(true); return; }
    if (foundRef.current.has(id)) { setHint(`${companies[id].name} already found.`); setHintBad(false); setGuess(''); return; }
    acceptId(id);
  }

  function onKey(e) {
    if (e.key !== 'Enter') return;
    submitGuess(e.target.value);
  }

  function finish(win, foundOverride) {
    if (endedRef.current) return;
    abandon.markFlushed();
    endedRef.current = true;
    clearInterval(timerRef.current);
    clearTimeout(justRef.current);
    setJustId(null);
    setPhase('done');
    const finalFound = foundOverride || foundRef.current;
    let finalScore = 0;
    columns.forEach((c) => (c.items || []).forEach((it) => { if (finalFound.has(it.id)) finalScore++; }));
    const elapsed = startRef.current ? Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000)) : quiz.timeLimit;
    setLastElapsed(elapsed);
    chRun.recordStep(finalScore, totalCells, elapsed);
    setStats(recordResult(quizId, finalScore));
    setHint(win ? `Perfect! All ${totalCells} cells in ${fmtTime(elapsed)}.` : `Done. You filled ${finalScore}/${totalCells} cells.`);
    setHintBad(!win);
    fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, score: finalScore, total: totalCells, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
    })
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best ?? null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [], leaderboardMobile: d.leaderboardMobile || [], leaderboardFirst: d.leaderboardFirst || [], leaderboards: d.leaderboards || {} }); })
      .catch(() => {});
  }

  function giveUp() { if (phase === 'playing') finish(false); }

  function playAgain() {
    setReviewing(false);
    endedRef.current = false;
    foundRef.current = new Set();
    setPhase('idle');
    setFound(new Set());
    setGuess('');
    setTime(quiz.timeLimit);
    setHint('Press Play to start the clock.');
    setHintBad(false);
    setLastElapsed(null);
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
  const resultMsg = phase === 'done' ? `I scored ${score}/${totalCells} on "${quiz.title}". Can you beat me?` : `Can you beat my score on "${quiz.title}"?`;
  const promoImgUrl = `https://sourceoftruths.com/quiz/${quiz.id}/share-image`;
  const resultImgUrl = `https://sourceoftruths.com/quiz/${quiz.id}/result-image?s=${score}&t=${totalCells}&p=0`;
  function openShare(kind) { const u = encodeURIComponent(shareUrl); const t = encodeURIComponent(resultMsg); const url = kind === 'x' ? `https://twitter.com/intent/tweet?text=${t}&url=${u}` : kind === 'reddit' ? `https://www.reddit.com/submit?url=${u}&title=${t}` : kind === 'facebook' ? `https://www.facebook.com/sharer/sharer.php?u=${u}` : kind === 'whatsapp' ? `https://api.whatsapp.com/send?text=${t}%20${u}` : shareUrl; try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) {} }
  function copyResult() { try { navigator.clipboard?.writeText(`${resultMsg}\n${shareUrl}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); } catch (e) {} }
  async function downloadPromoImage() { try { const r = await fetch(promoImgUrl); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `source-of-truths-${quiz.id}.png`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); } catch (e) {} }
  async function downloadResultImage() { try { const r = await fetch(resultImgUrl); const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `source-of-truths-${quiz.id}-score.png`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); } catch (e) {} }
  function share() {
    const text = 'Can you beat my score?';
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
  const lbRows = pickLb(board, lbPop, lbFilter);
  const lowClock = time <= 15 && phase === 'playing';
  const revealMode = phase === 'done';

  // One year-block (column). During play, unfilled cells show only the rank;
  // in done mode every cell shows its label, missed ones in rust.
  function Block({ col }) {
    return (
      <div style={{ flex: mobile ? '0 0 calc(50% - 6px)' : '0 0 calc(20% - 8px)', minWidth: mobile ? 0 : 132, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}44`, borderRadius: 4, padding: '6px 7px 4px' }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, textAlign: 'center', color: COLORS.ink, borderBottom: `2px solid #4d6b8a`, paddingBottom: 4, marginBottom: 3 }}>{col.year}</div>
        {(col.items || []).map((it, i) => {
          const got = found.has(it.id);
          const show = got || revealMode;
          const isJust = justId === it.id;
          const color = got ? COLORS.ink : (revealMode ? COLORS.rust : 'transparent');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 3px', borderBottom: i === col.items.length - 1 ? 'none' : `1px solid ${COLORS.faded}22`, minHeight: 21, background: isJust ? '#fff7d6' : 'transparent', transition: 'background .5s' }}>
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: COLORS.faded, minWidth: 12 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12, lineHeight: 1.12, color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {show ? it.label : ''}
              </span>
              {revealMode && !got && <X size={11} strokeWidth={3} style={{ color: COLORS.rust, flex: 'none', marginLeft: 'auto' }} />}
            </div>
          );
        })}
      </div>
    );
  }

  // Mobile fullscreen play popup: open while the game is actively running.
  // On 'done' it closes and the QuizResultModal popup takes over; pre-game
  // ('idle') the board renders inline as before.
  const mPlayOverlay = mobile === true && phase === 'playing';

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflow: 'clip' }}>
      <Grain />
      <ChallengeRunOverlay run={chRun} />
      <div style={{ position: 'relative', zIndex: 3 }}><SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} /></div>
      <div className="qzf-w" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '4px 38px 80px' }}><style>{`@media(max-width:560px){.qzf-w{padding-left:14px !important;padding-right:14px !important;}}`}</style><div className="qzf-line" aria-hidden="true" />

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Header */}
        <div style={{ paddingBottom: 0, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, color: COLORS.ink, fontVariationSettings: '"SOFT" 100' }}>{quiz.title}</h1>
            <div style={{ flex: 1, minWidth: 120, marginBottom: 6 }}>
              <div style={{ borderBottom: `1px solid ${COLORS.ink}`, marginBottom: 4 }} />
              <div style={{ borderBottom: `2px solid ${COLORS.ember}` }} />
            </div>
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 1.45, margin: '12px 0 0', color: COLORS.faded, maxWidth: 640 }}>{quiz.blurb}</p>
          {tab !== 'stats' && <LeaderboardStrip board={board} identity={identity} onOpen={() => setTab('stats')} />}
        </div>

        {/* Ribbon (not sticky - the scoreboard + input pin to the top instead) */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: '#eceef1', borderRadius: 10, padding: 4, gap: 6 }}>
            {chip('play', 'Play')}
            {chip('stats', 'Leaderboard')}
            {chip('join', 'Sign-up', <Trophy size={12} strokeWidth={2.5} />)}
            {chip('share', 'Share', <Share2 size={12} strokeWidth={2.5} />)}
            <button
              onClick={() => { setQSent(false); setQOpen(true); }}
              style={{ flex: '1 0 auto', justifyContent: 'center', background: 'transparent', color: COLORS.faded, border: 'none', borderRadius: 7, padding: '9px 14px', whiteSpace: 'nowrap', fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <HelpCircle size={12} strokeWidth={2.5} />
              Error(s)?
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24 }} />

        {/* ── PLAY ── */}
        {tab === 'play' && (
          <QuizPlayOverlay open={mPlayOverlay}>
            {/* Sticky top: the scoreboard + live input pin to the top of the viewport */}
            <div style={phase === 'done' ? { display: 'none' } : playBarStyle}>
            {/* Scoreboard */}
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', alignItems: 'center', background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '16px 8px', marginBottom: 0 }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{score}<span style={{ fontSize: 19, color: COLORS.faded }}>/{totalCells}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Cells</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1, color: COLORS.ember }}>{bestLabel}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Best</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{found.size}<span style={{ fontSize: 19, color: COLORS.faded }}>/{totalCompanies}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Companies</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 23, color: lowClock ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>
            {phase === 'playing' && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    ref={inputRef}
                    value={guess}
                    onChange={(e) => onType(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Start typing a company or ticker…"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    style={{ flex: 1, fontFamily: SANS, fontSize: 17, padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: '#fff', color: COLORS.ink }}
                  />
                  <button onClick={() => submitGuess(guess)} style={{ flex: 'none', fontFamily: MONO, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 22px', border: 'none', background: COLORS.ink, color: COLORS.cream, cursor: 'pointer' }}>
                    Guess
                  </button>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 18, marginTop: 6, color: hintBad ? COLORS.ember : COLORS.forest }}>{hint}</div>
              </div>
            )}
            </div>

            {/* IDLE — start screen */}
            {phase === 'idle' && (
              <div style={{ textAlign: 'center', padding: '26px 24px 30px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper }}>
                <LayoutGrid size={26} strokeWidth={2.2} style={{ color: COLORS.ember }} />
                <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: '8px 0 6px' }}>One name, many years.</h2>
                <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: '#4a4339', maxWidth: 500, margin: '0 auto 6px' }}>
                  {columns.length} year-blocks, each the 10 biggest US companies that December 31. Type a company (its name or ticker) and it fills in <b>every</b> year it ranked. Order inside a block does not matter. You have {fmtTime(quiz.timeLimit)} to fill as many of the {totalCells} cells as you can.
                </p>
                <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.faded, margin: '0 0 20px' }}>
                  Hint: the long-reigning giants that stayed on top for decades unlock the most cells.
                </p>
                <button onClick={start} style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '0 40px', lineHeight: '52px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer' }}>
                  Play
                </button>
              </div>
            )}

            {/* PLAYING / DONE — the grid + input */}
            {(phase === 'playing' || phase === 'done') && (
              <div>
                {/* Grid of year-blocks (wraps ~5 per row) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {columns.map((col) => <Block key={col.year} col={col} />)}
                </div>

                {phase === 'playing' && (
                  <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
                    <button onClick={giveUp} style={ghostBtn(false)}>
                      <Flag size={12} strokeWidth={2.5} /> Give up
                    </button>
                  </div>
                )}

                {/* DONE — results popup (the revealed grid stays behind it) */}
                {phase === 'done' && (
                  <>
                    <QuizDoneRecap quiz={quiz} score={score} total={totalCells} onPlayAgain={playAgain} onShare={() => setTab('share')} onPlaySimilar={() => { const sid = similarQuizId(quiz); if (sid) router.push(`/quiz/${sid}`); }} />
                  <QuizResultModal quiz={quiz}
                open={!reviewing}
                onClose={() => setReviewing(true)}
                eyebrow={score === totalCells ? 'Perfect score' : time <= 0 ? 'Time!' : 'Gave up'}
                score={score}
                total={totalCells}
                headline={isTopScore ? 'You are the top score' : `You beat ${percentile(score, totalCells)}% of players`}
                subline={`You named ${found.size} of ${totalCompanies} companies. ${board.best != null ? (score >= board.best ? `That matches the high score of ${board.best}.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}`}
                leaderboard={<LeaderboardSnippet board={board} identity={identity} score={score} lastElapsed={lastElapsed} fill />}
                standings={null}
                onPlayAgain={playAgain}
                onPlaySimilar={() => { const sid = similarQuizId(quiz); if (sid) router.push(`/quiz/${sid}`); }}
                onLeaderboard={() => setTab('stats')}
                onShare={() => setTab('share')}
                onReport={() => { setQSent(false); setQOpen(true); }}
              />
                  </>
                )}
              </div>
            )}
          {dock && <div aria-hidden="true" style={{ height: 'calc(170px + env(safe-area-inset-bottom))' }} />}
          </QuizPlayOverlay>
        )}

        {/* ── STATS ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 14 }}>Your record</div>
            {stats.attempts === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: COLORS.faded }}>Play a round and your record shows up here. Join the leaderboard to keep it, no email needed.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatBox label="Best score" value={`${stats.best}/${totalCells}`} accent />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, width: 'fit-content' }}>
                  <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${COLORS.faded}55`, width: 'fit-content' }}>
                    {LB_POPS.map(([k, label], idx) => {
                      const on = lbPop === k;
                      return (
                        <button key={k} onClick={() => setLbPop(k)} style={{ padding: '6px 14px', background: on ? COLORS.ink : 'transparent', color: on ? '#fff' : COLORS.faded, border: 'none', borderLeft: idx === 0 ? 'none' : `1px solid ${COLORS.faded}55`, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${COLORS.faded}55`, width: 'fit-content' }}>
                    {LB_FILTERS.map(([k, label], idx) => {
                      const on = lbFilter === k;
                      return (
                        <button key={k} onClick={() => setLbFilter(k)} style={{ padding: '6px 14px', background: on ? COLORS.ink : 'transparent', color: on ? '#fff' : COLORS.faded, border: 'none', borderLeft: idx === 0 ? 'none' : `1px solid ${COLORS.faded}55`, fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>{label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {lbRows.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded }}>
                  {lbEmptyNote(lbFilter) || <>No one has posted a score yet. <button onClick={() => setTab('join')} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.ember, font: 'inherit', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>Join the leaderboard</button> and be first.</>}
                </p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, padding: '0 14px 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>
                    <span>#</span><span>Username</span><span style={{ textAlign: 'right' }}>Score</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  {lbRows.map((row, i) => {
                    const mine = identity && row.username === identity.username;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? '#fff' : COLORS.paper, borderRadius: 10, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}` }}>
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
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{phase === 'done' ? `You filled ${score} of ${totalCells} cells. Challenge someone to beat it.` : 'Send this to someone who thinks they know their corporate history.'}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
              {[['x', 'X'], ['reddit', 'Reddit'], ['facebook', 'Facebook'], ['whatsapp', 'WhatsApp']].map(([k, label]) => (
                <button key={k} onClick={() => openShare(k)} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '10px 18px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer' }}>{label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
              <button onClick={copyResult} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer' }}>Copy result</button>
              <button onClick={downloadPromoImage} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer' }}>Save quiz image</button>
              {phase === 'done' && (
                <button onClick={downloadResultImage} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, padding: '10px 20px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.cream, color: COLORS.ink, cursor: 'pointer' }}>Download image</button>
              )}
            </div>
            <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Share this quiz'}
            </button>
            <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 16, wordBreak: 'break-all' }}>{shareUrl}</div>
          </div>
        )}

        {/* ── JOIN ── */}
        {tab === 'join' && (
          <JoinLeaderboardForm identity={identity} onJoined={(id) => { setIdentity(id); refreshBoard(); }} onViewLeaderboard={() => setTab('stats')} />
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
