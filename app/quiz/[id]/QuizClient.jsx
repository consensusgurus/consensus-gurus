'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, Flag, Trophy, HelpCircle, Eye, SkipForward } from 'lucide-react';
import { QUIZZES, getQuiz } from '@/lib/quizzes';
import Grain from '../../Grain';
import Footer from '../../Footer';
import dynamic from 'next/dynamic';

const MapQuizBoard = dynamic(() => import('./MapQuizBoard'), { ssr: false, loading: () => null });
const MatchQuizBoard = dynamic(() => import('./MatchQuizBoard'), { ssr: false, loading: () => null });
const TimedMcqBoard = dynamic(() => import('./TimedMcqClient'), { ssr: false, loading: () => null });

function shuffleIdx(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Palette inlined (not imported from the 3.6MB lib/data) to keep this route
// bundle tiny.
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

// Order-independent key match. A key counts when the normalized guess CONTAINS
// it as a substring (so a fuller guess satisfies a short key, e.g. "delta air
// lines" -> key "delta"), OR when the key is two-plus words and every one of
// those words appears as a whole token in the guess regardless of order (so
// "disneyland tokyo" satisfies the key "tokyo disneyland"). Single-word keys
// stay substring-only, which preserves partial-typing and the existing
// collision rules. Used for both keys (accept) and anti (block).
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
// The bare name a player naturally types: the answer's display `t` with any
// parenthetical disambiguator stripped ("Moscow (Idaho)" -> "moscow"). Authored
// `keys` sometimes only list the disambiguated forms ("moscow idaho"), which a
// multi-word key never matches from the short guess, so the answer silently
// rejects its own name. We accept the bare name implicitly to close that gap.
function baseName(t) {
  return norm(String(t || '').replace(/\([^)]*\)/g, ' '));
}
// For each answer, the implicit name keys accepted IN ADDITION to its authored
// keys: the full normalized name and the parenthetical-stripped base name, but
// ONLY when that candidate is UNAMBIGUOUS across the quiz, i.e. it does not match
// any other answer's keys, is not a substring of any other answer's name, and is
// not another answer's base name. The guard guarantees an implicit key can only
// ever credit its own slot, so this never steals a guess from a sibling answer
// (sequel/substring collisions still require authored `anti`, exactly as before).
function buildImplicitNameKeys(answers) {
  const list = answers || [];
  const norms = list.map((a) => norm(a && a.t));
  const bases = list.map((a) => baseName(a && a.t));
  const unambiguous = (cand, i) => {
    if (!cand) return false;
    for (let j = 0; j < list.length; j++) {
      if (j === i) continue;
      if (anyKey(cand, list[j].keys)) return false; // would match another slot's key
      if (norms[j] && norms[j].includes(cand)) return false; // substring of another name
      if (bases[j] && bases[j] === cand) return false; // shared base name
    }
    return true;
  };
  return list.map((a, i) => {
    const out = [];
    for (const cand of [norms[i], bases[i]]) {
      if (cand && !out.includes(cand) && unambiguous(cand, i)) out.push(cand);
    }
    return out;
  });
}
function deptOf(q) {
  const id = q.id || '';
  if (q.format === 'map') return 'geography';
  if (q.type === 'travel') return 'travel';
  if (/film|movie|box-office|director|actor|animated/.test(id)) return 'movies';
  if (/song|album|single|spotify|music-video|concert-tour|billboard|soundtrack/.test(id)) return 'music';
  if (/games|video-games/.test(id)) return 'games';
  return 'other';
}
function fmtTime(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Ordinal label for a per-user attempt number: 1 -> "1st", 2 -> "2nd", 23 -> "23rd".
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

// ── Personal stats (client-side) ──
function statsKey(id) {
  return `sot_quiz_${id}`;
}
function loadStats(id) {
  if (typeof window === 'undefined') return { attempts: 0, best: 0, totalCorrect: 0 };
  try {
    return JSON.parse(localStorage.getItem(statsKey(id))) || { attempts: 0, best: 0, totalCorrect: 0 };
  } catch {
    return { attempts: 0, best: 0, totalCorrect: 0 };
  }
}
function recordResult(id, score) {
  const s = loadStats(id);
  const next = { attempts: s.attempts + 1, best: Math.max(s.best, score), totalCorrect: s.totalCorrect + score };
  try {
    localStorage.setItem(statsKey(id), JSON.stringify(next));
  } catch {}
  return next;
}
// Stable per-browser anonymous id. Sent with every result and used on join/claim
// to link games played BEFORE signing up to the new account, so warm-up runs
// can't be hidden to fake a "1st Try" high score.
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try {
    let a = localStorage.getItem('sot_quiz_anon');
    if (!a) {
      a = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('sot_quiz_anon', a);
    }
    return a;
  } catch {
    return null;
  }
}

function percentile(score, total) {
  const frac = total ? score / total : 0;
  return Math.round(Math.min(99, Math.max(2, Math.pow(frac, 1.35) * 100)));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function QuizClient({ quizId }) {
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

  if (quiz.format === 'timed-mcq') {
    return <TimedMcqBoard quizId={quizId} />;
  }

  const answers = quiz.answers;
  const total = answers.length;
  const matched = quiz.format === 'matched';
  const nameKeys = useMemo(() => buildImplicitNameKeys(answers), [answers]);
  const mapMode = quiz.format === 'map';
  const pairsMode = quiz.format === 'pairs';
  const ordered = matched && quiz.ordered === true;
  // The "reveal the answers" gate is only for quizzes with no companion list and
  // no map board (the plain "table" quizzes). List quizzes already send you to
  // the full ranking to see misses; map quizzes have no table to fill in.
  const canReveal = !quiz.listId && !mapMode && !pairsMode;
  const relatedQuizzes = (() => {
    const d = deptOf(quiz);
    let r = QUIZZES.filter((x) => x.id !== quiz.id && deptOf(x) === d);
    if (r.length < 4) r = r.concat(QUIZZES.filter((x) => x.id !== quiz.id && !r.includes(x)));
    return r.slice(0, 4);
  })();

  const [tab, setTab] = useState('play');
  const [found, setFound] = useState(() => new Array(total).fill(false));
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('Press Play to start the clock.');
  const [hintBad, setHintBad] = useState(false);
  const [guess, setGuess] = useState('');
  const orderRef = useRef(null);
  const [curName, setCurName] = useState(null);
  const [flash, setFlash] = useState(null);
  const [guessesLeft, setGuessesLeft] = useState(null);
  const [lastElapsed, setLastElapsed] = useState(null);
  const [pairsMatched, setPairsMatched] = useState(0);
  const [pairsErrors, setPairsErrors] = useState(0);
  const pairsMatchedRef = useRef(0);

  const [stats, setStats] = useState({ attempts: 0, best: 0, totalCorrect: 0 });
  const [board, setBoard] = useState({ plays: 0, best: null, leaderboard: [] });
  const [identity, setIdentity] = useState(null); // { username, email }

  // Join form
  const [jName, setJName] = useState('');
  const [jEmail, setJEmail] = useState('');
  const [joinMsg, setJoinMsg] = useState('');
  const [joinErr, setJoinErr] = useState(false);
  const [joinBusy, setJoinBusy] = useState(false);
  const [lastResultId, setLastResultId] = useState(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');
  const [claimErr, setClaimErr] = useState(false);

  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false); // non-list quizzes: misses shown after username gate

  // Critique? modal (mirrors the list-page Request Review modal; routes to the
  // same /api/complaints pipeline -> admin Notices tab + daily digest email).
  const [qOpen, setQOpen] = useState(false);
  const [qMsg, setQMsg] = useState('');
  const [qName, setQName] = useState('');
  const [qEmail, setQEmail] = useState('');
  const [qSent, setQSent] = useState(false);
  const [qBusy, setQBusy] = useState(false);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const inputRef = useRef(null);
  const viewedRef = useRef(false);
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

  const score = found.filter(Boolean).length;
  const dispScore = pairsMode ? pairsMatched : score;
  const activeIdx = found.findIndex((x) => !x);
  const foundNamesSet = mapMode ? new Set(answers.filter((a, i) => found[i]).map((a) => a.t)) : null;

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
    // Count one quiz-page view per load (admin analytics). Guarded so React's
    // dev double-invoke and any re-run don't double-count. Best-effort.
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

  function endGame(win, foundOverride, scoreOverride) {
    if (ended) return;
    setEnded(true);
    clearInterval(timerRef.current);
    const finalScore = scoreOverride != null ? scoreOverride : pairsMode ? pairsMatchedRef.current : (foundOverride || found).filter(Boolean).length;
    const elapsed = startRef.current ? Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000)) : quiz.timeLimit;
    setLastElapsed(elapsed);
    setStats(recordResult(quizId, finalScore));
    setHint(win ? `Perfect — all ${total} named in ${fmtTime(elapsed)}!` : `Time! You got ${finalScore}/${total}.`);
    setHintBad(!win);
    setTab('stats');

    // Record the completed game (makes play count + average real; attributes
    // to the leaderboard if signed up).
    fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, score: finalScore, total, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId() }),
    })
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) { setBoard({ plays: d.plays || 0, best: d.best ?? null, leaderboard: d.leaderboard || [] }); setLastResultId(d.resultId ?? null); } })
      .catch(() => {});
  }

  // Retroactively post the just-finished anonymous game to the leaderboard:
  // join by email, then attach THIS result row to the new identity.
  async function submitClaim() {
    setClaimErr(false);
    if (!jName.trim() || jName.trim().length > 40) { setClaimErr(true); setClaimMsg('Pick a username (max 40 characters).'); return; }
    if (!EMAIL_RE.test(jEmail.trim())) { setClaimErr(true); setClaimMsg('Enter a valid email.'); return; }
    setClaimBusy(true);
    try {
      const res = await fetch('/api/quiz/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, resultId: lastResultId, username: jName.trim(), email: jEmail.trim(), anonId: getAnonId() }),
      });
      const d = await res.json();
      if (d.error) { setClaimErr(true); setClaimMsg(d.error); setClaimBusy(false); return; }
      const id = { username: d.username, email: d.email };
      try { localStorage.setItem('sot_quiz_identity', JSON.stringify(id)); } catch {}
      setIdentity(id);
      setBoard({ plays: d.plays || 0, best: d.best ?? null, leaderboard: d.leaderboard || [] });
      setClaimErr(false);
      setClaimOpen(false);
      if (canReveal) {
        setRevealed(true);
        setClaimMsg('Posted! The answers you missed are now filled in under Play, highlighted.');
        setTab('play');
      } else {
        setClaimMsg(`Posted! You're on the leaderboard below.`);
        setTab('stats');
      }
    } catch (e) {
      setClaimErr(true);
      setClaimMsg('Could not post right now. Try again.');
    }
    setClaimBusy(false);
  }

  function start() {
    if (started || ended) return;
    setStarted(true);
    startRef.current = Date.now();
    if (mapMode) {
      const ord = shuffleIdx(total);
      orderRef.current = ord;
      setCurName(answers[ord[0]].t);
      setGuessesLeft(total);
      setHint(`Find ${answers[ord[0]].t} — click it. You get ${total} guesses, one per country.`);
    } else if (pairsMode) {
      setHint('Pick a slogan, then the company it belongs to.');
    } else {
      setHint(ordered ? 'Go — answer in order, from the top.' : matched ? "Go — name each year's winner." : 'Go — name them all.');
    }
    setHintBad(false);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(false); return 0; }
        return t - 1;
      });
    }, 1000);
    if (inputRef.current) inputRef.current.focus();
  }

  function checkGuess(raw) {
    const g = norm(raw);
    if (!g) return;
    for (let i = 0; i < answers.length; i++) {
      if (found[i]) continue;
      const a = answers[i];
      const hit = anyKey(g, a.keys) || anyKey(g, nameKeys[i]);
      const blocked = anyKey(g, a.anti);
      if (hit && !blocked) {
        const next = found.slice();
        next[i] = true;
        setFound(next);
        setHint(`Correct — ${a.t}`);
        setHintBad(false);
        if (next.every(Boolean)) endGame(true, next);
        return;
      }
    }
    setHint('Not on the list — try another.');
    setHintBad(true);
  }

  function onKey(e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkGuess(e.target.value);
    setGuess('');
  }

  // Matched mode: each slot has its own input that only accepts that slot's answer.
  function checkSlot(i, raw) {
    const g = norm(raw);
    if (!g || found[i]) return;
    const a = answers[i];
    const hit = anyKey(g, a.keys) || anyKey(g, nameKeys[i]);
    const blocked = anyKey(g, a.anti);
    if (hit && !blocked) {
      const next = found.slice();
      next[i] = true;
      setFound(next);
      setHint(`Correct — ${a.label != null ? a.label + ': ' : ''}${a.t}`);
      setHintBad(false);
      if (next.every(Boolean)) endGame(true, next);
    } else {
      setHint("Not that year's winner. Try again.");
      setHintBad(true);
    }
  }
  function onSlotKey(i, e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkSlot(i, e.target.value);
    e.target.value = '';
  }

  // Ordered matched mode: ONE fixed input; slots must be answered in sequence.
  function checkOrdered(raw) {
    const g = norm(raw);
    if (!g) return;
    const i = found.findIndex((x) => !x);
    if (i < 0) return;
    const a = answers[i];
    const hit = anyKey(g, a.keys) || anyKey(g, nameKeys[i]);
    const blocked = anyKey(g, a.anti);
    if (hit && !blocked) {
      const next = found.slice();
      next[i] = true;
      setFound(next);
      setHint(`Correct — ${a.label != null ? a.label + ': ' : ''}${a.t}`);
      setHintBad(false);
      if (next.every(Boolean)) endGame(true, next);
    } else {
      setHint(`Not the ${a.label != null ? a.label + ' ' : ''}answer. Work down in order, try again.`);
      setHintBad(true);
    }
  }
  function onOrderedKey(e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkOrdered(e.target.value);
    setGuess('');
  }

  function pickCountry(name) {
    if (!started || ended || !mapMode) return;
    const i = answers.findIndex((a) => a.t === name);
    if (i < 0) return;
    // Clicking a country you've already named is harmless and free.
    if (found[i]) {
      if (name !== curName) { setFlash({ name, ok: false }); setTimeout(() => setFlash((f) => (f && f.name === name ? null : f)), 400); }
      return;
    }
    // Every genuine pick (right OR wrong) spends one guess from the budget,
    // which equals the number of countries. This makes a perfect game require
    // one correct click per country and stops spam-clicking to 100%.
    const left = (guessesLeft == null ? total : guessesLeft) - 1;
    setGuessesLeft(left);
    if (name === curName) {
      const next = found.slice();
      next[i] = true;
      setFound(next);
      setFlash({ name, ok: true });
      setTimeout(() => setFlash((f) => (f && f.name === name ? null : f)), 400);
      const ord = orderRef.current || [];
      const remaining = ord.filter((j) => !next[j]);
      if (!remaining.length) { setHint(`Correct — ${name}. That's all of them.`); setHintBad(false); setCurName(null); endGame(true, next); return; }
      if (left <= 0) { setHint(`Correct — ${name}. That was your last guess.`); setHintBad(false); setCurName(null); endGame(false, next); return; }
      const nn = answers[remaining[0]].t;
      setCurName(nn);
      setHint(`Correct — ${name}. ${left} ${left === 1 ? 'guess' : 'guesses'} left. Now find ${nn}.`);
      setHintBad(false);
    } else {
      setFlash({ name, ok: false });
      setTimeout(() => setFlash((f) => (f && f.name === name ? null : f)), 400);
      if (left <= 0) { setHint(`That was ${name}, not ${curName}. Out of guesses.`); setHintBad(true); endGame(false); return; }
      setHint(`Not ${curName} — try again. ${left} ${left === 1 ? 'guess' : 'guesses'} left.`);
      setHintBad(true);
    }
  }

  // Skip the current country: rotate it to the back of the queue (it stays
  // unfound, so it comes back around) and advance to the next one. Lets a
  // player move on when they can't spot a country on the map.
  function skipCountry() {
    if (!started || ended || !mapMode || !curName) return;
    const curIdx = answers.findIndex((a) => a.t === curName);
    if (curIdx < 0) return;
    const ord = orderRef.current || [];
    const remaining = ord.filter((j) => !found[j]);
    if (remaining.length <= 1) {
      setHint(`${curName} is the last one — find it on the map.`);
      setHintBad(false);
      return;
    }
    const newOrd = ord.filter((j) => j !== curIdx).concat(curIdx);
    orderRef.current = newOrd;
    const nn = answers[newOrd.filter((j) => !found[j])[0]].t;
    setCurName(nn);
    setHint(`Skipped ${curName} — you'll come back to it. Now find ${nn}.`);
    setHintBad(false);
  }

  function onPairMatch(companyIndex, matchedCount, company, slogan) {
    pairsMatchedRef.current = matchedCount;
    setPairsMatched(matchedCount);
    setHint(`Match — ${company}: “${slogan}”.`);
    setHintBad(false);
  }
  function onPairError(errorCount, company) {
    setPairsErrors(errorCount);
    setHint(`Not it. ${company} is struck out for good.`);
    setHintBad(true);
  }
  function onPairHint(msg, bad) {
    setHint(msg);
    setHintBad(!!bad);
  }
  function onPairEnd(win, matchedCount) {
    pairsMatchedRef.current = matchedCount;
    setPairsMatched(matchedCount);
    endGame(win, null, matchedCount);
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
      setJoinMsg(`You're in. "${d.username}" is on the leaderboard, including any games you already finished.`);
      setTab('stats');
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
      // Reuse the list complaints pipeline. Prefixing the title with [Quiz]
      // lets the admin Notices tab and digest distinguish quiz questions and
      // link them to /quiz/{id}.
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId: quiz.id, listTitle: `[Quiz] ${quiz.title}`, message: qMsg.trim(), name: qName.trim(), email: qEmail.trim() }),
      });
    } catch (e) {
      // swallow - we still acknowledge the question to the reader
    }
    setQSent(true);
    setQBusy(false);
  }

  const clock = fmtTime(time);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://sourceoftruths.com/quiz/${quiz.id}`;
  function share() {
    const text = ended
      ? `I named ${dispScore}/${total} on "${quiz.title}" at Source of Truths. Can you beat me?`
      : `Can you name the ${total}? "${quiz.title}" at Source of Truths.`;
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
  // Leaderboard ranks with ties: equal score AND time share a rank (and are
  // ordered alphabetically by the API), so they display as a tie (T#).
  const lb = board.leaderboard;
  const lbRanks = [];
  const lbTied = [];
  for (let i = 0; i < lb.length; i++) {
    const prevSame = i > 0 && lb[i].score === lb[i - 1].score && lb[i].timeElapsed === lb[i - 1].timeElapsed;
    lbRanks[i] = prevSame ? lbRanks[i - 1] : i + 1;
  }
  for (let i = 0; i < lb.length; i++) {
    const prevSame = i > 0 && lb[i].score === lb[i - 1].score && lb[i].timeElapsed === lb[i - 1].timeElapsed;
    const nextSame = i < lb.length - 1 && lb[i].score === lb[i + 1].score && lb[i].timeElapsed === lb[i + 1].timeElapsed;
    lbTied[i] = prevSame || nextSame;
  }

  const colSplit = (() => {
    const cs = quiz.columnSplit;
    if (!Array.isArray(cs) || cs.reduce((acc, n) => acc + n, 0) !== answers.length) return null;
    const cols = []; let gi = 0;
    for (const n of cs) { const r = []; for (let k = 0; k < n; k++) r.push(gi++); cols.push(r); }
    return cols;
  })();
  const asOfRaw = quiz.publishedDate || (quiz.publishedAt ? quiz.publishedAt.slice(0, 10) : null);
  const asOfLabel = asOfRaw ? new Date(asOfRaw + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : null;

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
          <div style={{ position: 'relative' }}>
            <style>{`@keyframes qzCueR{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}@keyframes qzCueL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}.qz-cue{position:absolute;top:50%;z-index:3;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:#fff;box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}.qz-cue-r{right:10px;animation:qzCueR 1.4s ease-in-out infinite;}.qz-cue-l{left:10px;animation:qzCueL 1.4s ease-in-out infinite;}@media(min-width:760px){.qz-cue{display:none;}}.qz-ribbon{scrollbar-width:none;-ms-overflow-style:none;}.qz-ribbon::-webkit-scrollbar{display:none;}`}</style>
            <div ref={ribbonRef} className="qz-ribbon" style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: COLORS.ink, borderBottom: `3px solid ${COLORS.ember}` }}>
              {chip('play', 'Play')}
              {chip('stats', 'Stats & Leaderboard')}
              {chip('join', 'Join the Leaderboard', <Trophy size={12} strokeWidth={2.5} />)}
              {chip('share', 'Share', <Share2 size={12} strokeWidth={2.5} />)}
              <button
                onClick={() => { setQSent(false); setQOpen(true); }}
                style={{ flex: '1 0 auto', justifyContent: 'center', background: 'transparent', color: COLORS.cream, border: 'none', borderRight: '1px solid rgba(244,237,224,0.18)', padding: '0 16px', height: 42, whiteSpace: 'nowrap', fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <HelpCircle size={12} strokeWidth={2.5} />
                Critique?
              </button>
            </div>
            {ribScroll.left && <span aria-hidden="true" className="qz-cue qz-cue-l">&#8249;</span>}
            {ribScroll.right && <span aria-hidden="true" className="qz-cue qz-cue-r">&#8250;</span>}
          </div>
        </div>

        {ended && (
          <div style={{ marginTop: 16, padding: '14px 18px', border: `1px solid ${COLORS.faded}33`, background: COLORS.paper }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {quiz.listId && (
                <a href={`/list/${quiz.listId}`} style={{ display: 'inline-block', fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 28px', background: COLORS.ember, color: '#fff', textDecoration: 'none' }}>See the full list detail</a>
              )}
              {/* Non-list quizzes: reveal the missed answers in place. Already
                  signed-up players get a one-click reveal in place of the
                  list-detail button; the new-player path is the signup button
                  below, which reveals on success. */}
              {canReveal && identity && !revealed && (
                <button onClick={() => { setRevealed(true); setTab('play'); }} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Eye size={14} strokeWidth={2.5} /> Reveal the answers
                </button>
              )}
              {canReveal && revealed && (
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.forest, lineHeight: '46px' }}>Answers revealed under Play — your misses are highlighted.</span>
              )}
              {!identity && !claimOpen && (
                <button onClick={() => { setClaimMsg(''); setClaimErr(false); setClaimOpen(true); }} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {canReveal
                    ? (<><Eye size={14} strokeWidth={2.5} /> Create a username to reveal the answers</>)
                    : (<><Trophy size={14} strokeWidth={2.5} /> Post this to the leaderboard</>)}
                </button>
              )}
              {!identity && claimOpen && (
                <div style={{ flexBasis: '100%', maxWidth: 420, margin: '0 auto' }}>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: '#4a4339', margin: '0 0 10px', textAlign: 'center' }}>
                    {canReveal
                      ? `Create a username and add your email to reveal the answers you missed. It also posts this ${dispScore}/${total} to the leaderboard. No password needed, and reusing the same email later keeps you attached.`
                      : `Add a name and email to post this ${dispScore}/${total} to the leaderboard. No password needed, and reusing the same email later keeps you attached.`}
                  </p>
                  <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="Username" style={fieldStyle} />
                  <input value={jEmail} onChange={(e) => setJEmail(e.target.value)} type="email" placeholder="you@email.com" style={{ ...fieldStyle, marginTop: 10 }} />
                  <button onClick={submitClaim} disabled={claimBusy} style={{ marginTop: 12, width: '100%', fontFamily: MONO, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: claimBusy ? 'default' : 'pointer', opacity: claimBusy ? 0.6 : 1 }}>
                    {claimBusy ? (canReveal ? 'Revealing…' : 'Posting…') : (canReveal ? 'Reveal the answers' : 'Post this to the leaderboard')}
                  </button>
                </div>
              )}
              {claimMsg && (
                <p style={{ flexBasis: '100%', fontFamily: MONO, fontSize: 12, margin: '6px 0 0', textAlign: 'center', color: claimErr ? COLORS.ember : COLORS.forest }}>{claimMsg}</p>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24 }} />

        {/* ── PLAY ── */}
        {tab === 'play' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '16px 8px', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{dispScore}<span style={{ fontSize: 20, color: COLORS.faded }}>/{total}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Your score</div>
              </div>
              {mapMode ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: (guessesLeft == null ? total : guessesLeft) <= 3 && started && !ended ? COLORS.ember : COLORS.ink }}>{guessesLeft == null ? total : guessesLeft}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Guesses left</div>
              </div>
              ) : pairsMode ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: pairsErrors > 0 ? COLORS.ember : COLORS.ink }}>{pairsErrors}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Errors</div>
              </div>
              ) : (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{board.plays.toLocaleString()}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Total plays</div>
              </div>
              )}
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: time <= 10 && started && !ended ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              {!mapMode && !pairsMode && (!matched || ordered) && (
                <input
                  ref={inputRef}
                  value={guess}
                  disabled={!started || ended}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={ordered ? onOrderedKey : onKey}
                  placeholder={started ? (ordered ? `Type the ${quiz.noun || 'answer'} for ${answers[activeIdx] ? answers[activeIdx].label : ''}…` : `Type ${/^[aeiou]/.test(quiz.noun || '') ? 'an' : 'a'} ${quiz.noun || 'answer'}, then Enter…`) : 'Press Play to begin…'}
                  autoComplete="off"
                  style={{ flex: 1, fontFamily: SANS, fontSize: 17, padding: '14px 16px', border: `1.5px solid ${COLORS.ink}`, background: !started || ended ? COLORS.paper : '#fff', color: COLORS.ink, opacity: !started || ended ? 0.5 : 1 }}
                />
              )}
              <button onClick={start} disabled={started || ended} style={{ flex: (matched && !ordered) || mapMode || pairsMode ? 1 : 'none', fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 22px', height: matched || mapMode || pairsMode ? 52 : 'auto', border: 'none', background: COLORS.ember, color: '#fff', cursor: started || ended ? 'default' : 'pointer', opacity: started || ended ? 0.5 : 1 }}>
                {ended ? 'Done' : started ? 'Playing' : (matched && !ordered) ? 'Play — name each year' : 'Play'}
              </button>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 18, marginBottom: 20, color: hintBad ? COLORS.ember : COLORS.faded }}>{hint}</div>

            {pairsMode ? (
            <MatchQuizBoard pairs={quiz.pairs} started={started} ended={ended} onMatch={onPairMatch} onError={onPairError} onEnd={onPairEnd} onHint={onPairHint} leftLabel={quiz.leftLabel} rightLabel={quiz.rightLabel} sortLeft={quiz.sortLeft} />
            ) : mapMode ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: started && !ended ? COLORS.ink : COLORS.paper, color: started && !ended ? COLORS.cream : COLORS.faded, border: `1px solid ${COLORS.faded}33`, padding: '12px 16px', marginBottom: 10, minHeight: 30 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>Find</span>
                <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(20px, 4vw, 26px)', lineHeight: 1 }}>{ended ? 'Game over' : started ? (curName || '—') : 'Press Play to start'}</span>
                {started && !ended && (
                  <button onClick={skipCountry} title="Can't find it? Skip and come back to it later." style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '8px 14px', background: 'transparent', color: COLORS.cream, border: '1px solid rgba(244,237,224,0.4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <SkipForward size={12} strokeWidth={2.5} /> Skip
                  </button>
                )}
              </div>
              <MapQuizBoard region={quiz.region || 'europe'} started={started} ended={ended} foundNames={foundNamesSet} flash={flash} onPick={pickCountry} />
            </div>
            ) : (
            (() => {
              const renderRow = (a, i) => {
                const f = found[i];
                const isActive = ordered && started && !ended && i === activeIdx;
                const reveal = ended && revealed && !f; // a missed answer, now filled in
                return (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 16px', border: `1px solid ${f ? COLORS.forest : isActive ? COLORS.ember : reveal ? COLORS.rust : COLORS.faded + '33'}`, marginBottom: 8, background: reveal ? '#f6ead9' : f || isActive ? '#fff' : COLORS.paper, boxShadow: isActive ? `inset 4px 0 0 ${COLORS.ember}` : reveal ? `inset 4px 0 0 ${COLORS.rust}` : 'none', transform: f || isActive || reveal ? 'translateX(2px)' : 'none', transition: 'all .2s' }}>
                    {a.label != null ? (
                      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, width: 52, color: COLORS.ember, flex: 'none', textAlign: 'left', letterSpacing: '0.04em' }}>{a.label}</span>
                    ) : (
                      <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 22, width: 30, color: COLORS.ember, flex: 'none', textAlign: 'center' }}>{i + 1}</span>
                    )}
                    {f ? (
                      <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, flex: 1 }}>{a.t}</span>
                    ) : reveal ? (
                      <span style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 500, flex: 1, color: COLORS.rust }}>{a.t}</span>
                    ) : (matched && !ordered) ? (
                      <input
                        ref={i === 0 ? inputRef : undefined}
                        disabled={!started || ended}
                        onKeyDown={(e) => onSlotKey(i, e)}
                        placeholder={started ? 'Type the winner, then Enter…' : ''}
                        autoComplete="off"
                        style={{ flex: 1, fontFamily: SANS, fontSize: 16, padding: '9px 12px', border: `1.5px solid ${COLORS.ink}`, background: !started || ended ? COLORS.paper : '#fff', color: COLORS.ink, opacity: !started || ended ? 0.5 : 1 }}
                      />
                    ) : isActive ? (
                      <span style={{ fontFamily: SANS, fontSize: 14, fontStyle: 'italic', color: COLORS.ember, flex: 1 }}>Type it in the box above, then Enter</span>
                    ) : (
                      <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.06em', color: COLORS.faded, opacity: 0.55, flex: 1 }}>— — — — —</span>
                    )}
                    {reveal ? (
                      <span style={{ flex: 'none', fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.rust, fontWeight: 700 }}>Missed</span>
                    ) : (
                      <span style={{ width: 20, flex: 'none', color: COLORS.forest, opacity: f ? 1 : 0 }}><Check size={17} strokeWidth={3} /></span>
                    )}
                  </li>
                );
              };
              if (colSplit) {
                return (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {colSplit.map((idxs, ci) => (
                      <ol key={ci} style={{ margin: 0, padding: 0, listStyle: 'none', flex: '1 1 200px', minWidth: 0 }}>
                        {idxs.map((gi) => renderRow(answers[gi], gi))}
                      </ol>
                    ))}
                  </div>
                );
              }
              return (
                <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {answers.map((a, i) => renderRow(a, i))}
                </ol>
              );
            })()
            )}

            {ended && (
              <div style={{ marginTop: 22, padding: 24, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>{dispScore === total ? 'Perfect score' : time <= 0 ? 'Time!' : pairsMode ? 'Out of moves' : 'Gave up'}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1.1, marginBottom: 10 }}>{dispScore} of {total} · you beat {percentile(dispScore, total)}% of players</div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                  {board.best != null ? (dispScore >= board.best ? `That matches the high score of ${board.best}.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}
                  {quiz.listId ? ' See the ones you missed in the full ranking, with sources and the consensus breakdown.' : canReveal ? (revealed ? ' The ones you missed are filled in above, highlighted.' : ' Create a username above to reveal the ones you missed.') : ''}
                </p>
              </div>
            )}

            <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => endGame(false)} disabled={ended || !started} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '12px 26px', border: 'none', background: COLORS.ember, color: '#fff', cursor: ended || !started ? 'default' : 'pointer', opacity: ended || !started ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Flag size={14} strokeWidth={2.5} color="#fff" /> Give up
              </button>
            </div>
          </>
        )}

        {/* ── STATS & LEADERBOARD (quiz stats + leaderboard) ── */}
        {tab === 'stats' && (
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 14 }}>Quiz stats</div>
            {board.plays === 0 ? (
              <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 17, color: COLORS.faded }}>No one has played this quiz yet. Be the first to set the pace.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatBox label="Total plays" value={board.plays.toLocaleString()} />
                <StatBox label="Best score" value={board.best != null ? `${board.best}/${total}` : '—'} />
                <StatBox label="On the leaderboard" value={lb.length} />
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
                    <span>#</span><span>Username</span><span style={{ textAlign: 'right' }}>Correct</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  {board.leaderboard.map((row, i) => {
                    const mine = identity && row.username === identity.username;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? '#fff' : COLORS.paper, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}` }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, color: lbRanks[i] <= 3 ? COLORS.ember : COLORS.faded }}>{lbTied[i] ? `T${lbRanks[i]}` : lbRanks[i]}</span>
                        <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.username}{mine ? ' (you)' : ''}{row.tryNum ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400, color: COLORS.faded, marginLeft: 6 }}>({ordinal(row.tryNum)} Try)</span> : ''}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, textAlign: 'right' }}>{row.score}/{total}</span>
                        <span style={{ fontFamily: MONO, fontSize: 14, textAlign: 'right', color: COLORS.faded }}>{fmtTime(row.timeElapsed)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {relatedQuizzes.length > 0 && (
              <div style={{ borderTop: `1px solid ${COLORS.faded}33`, marginTop: 26, paddingTop: 20 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 14 }}>More quizzes</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {relatedQuizzes.map((rq) => (
                    <a key={rq.id} href={`/quiz/${rq.id}`} style={{ textDecoration: 'none', color: COLORS.ink, background: COLORS.paper, border: `1px solid ${COLORS.faded}33`, padding: '12px 14px', display: 'block', transition: 'all 0.15s ease' }}>
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700, marginBottom: 6 }}>{rq.category || 'Quiz'}</div>
                      <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{rq.title}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SHARE ── */}
        {tab === 'share' && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{ended ? `You named ${dispScore} of ${total}. Challenge someone to beat it.` : 'Send this quiz to someone who thinks they can name them all.'}</p>
            <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Share this quiz'}
            </button>
            <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, marginTop: 16, wordBreak: 'break-all' }}>{shareUrl}</div>
          </div>
        )}

        {/* ── JOIN THE LEADERBOARD (sign-up) ── */}
        {tab === 'join' && (
          <div style={{ maxWidth: 440, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trophy size={22} strokeWidth={2.2} style={{ color: COLORS.ember }} />
              <h2 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, margin: 0 }}>Join the Leaderboard</h2>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', margin: '0 0 6px' }}>
              Sign up and your username will appear on the leaderboard after you finish a game. No password needed.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', margin: '0 0 6px' }}>
              Already joined? Enter the same email to reconnect your account. If you clear your browser or switch devices, just rejoin with that email and your scores and leaderboard spot come right back.
            </p>
            <p style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, margin: '0 0 22px' }}>
              Your username is shown publicly; your email is kept private.
            </p>

            <label style={labelStyle}>Username</label>
            <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="e.g. skyhopper42" style={fieldStyle} />
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

        {asOfLabel && (
          <div style={{ marginTop: 36, paddingTop: 16, borderTop: `1px solid ${COLORS.faded}33`, fontFamily: MONO, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, textAlign: 'center' }}>
            Data as of {asOfLabel}
          </div>
        )}
        {quiz.source && (
          <div style={{ marginTop: 40, paddingTop: 18, borderTop: `1px solid ${COLORS.faded}33`, fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', color: COLORS.faded }}>
            Source:{' '}
            {quiz.source.url ? (
              <a href={quiz.source.url} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.rust }}>{quiz.source.label}</a>
            ) : (
              quiz.source.label
            )}
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
                  <input
                    type="text"
                    value={qName}
                    onChange={(e) => setQName(e.target.value)}
                    maxLength={120}
                    placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                  <input
                    type="email"
                    value={qEmail}
                    onChange={(e) => setQEmail(e.target.value)}
                    maxLength={200}
                    placeholder="Email (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                </div>
                <textarea
                  value={qMsg}
                  onChange={(e) => setQMsg(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="What's your question or comment? (optional)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setQOpen(false)}
                    style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuestion}
                    disabled={qBusy}
                    style={{ cursor: 'pointer', background: COLORS.rust, color: COLORS.cream, border: `1.5px solid ${COLORS.rust}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: qBusy ? 0.6 : 1 }}
                  >
                    {qBusy ? 'Sending...' : 'Send to editors'}
                  </button>
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
