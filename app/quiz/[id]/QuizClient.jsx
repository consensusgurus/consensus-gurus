'use client';

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check, X, Flag, Trophy, HelpCircle, Eye, SkipForward } from 'lucide-react';
import { QUIZZES, getQuiz } from '@/lib/quizzes';
import { quizDept as deptOf } from '@/lib/quiz-departments';
import Grain from '../../Grain';
import Footer from '../../Footer';
import Count from '../../Count';
import SiteHeader from '../../SiteHeader';
import dynamic from 'next/dynamic';

const MapQuizBoard = dynamic(() => import('./MapQuizBoard'), { ssr: false, loading: () => null });
const MatchQuizBoard = dynamic(() => import('./MatchQuizBoard'), { ssr: false, loading: () => null });
const BankQuizBoard = dynamic(() => import('./BankQuizBoard'), { ssr: false, loading: () => null });
const TypeItBoard = dynamic(() => import('./TypeItBoard'), { ssr: false, loading: () => null });
const TimedMcqBoard = dynamic(() => import('./TimedMcqClient'), { ssr: false, loading: () => null });
const LogicGridBoard = dynamic(() => import('./LogicGridClient'), { ssr: false, loading: () => null });
const PhotoBoard = dynamic(() => import('./PhotoBoard'), { ssr: false, loading: () => null });
const PhotoMatchBoard = dynamic(() => import('./PhotoMatchBoard'), { ssr: false, loading: () => null });
const GridFillBoard = dynamic(() => import('./GridFillBoard'), { ssr: false, loading: () => null });

function shuffleIdx(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Palette inlined (not imported from the 3.6MB lib/data) to keep this route
// bundle tiny.
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

// Brand mark (gradient ids suffixed per render so multiple instances stay unique).
let __logoSeq = 0;
function Logo({ size = 22 }) {
  const uid = useMemo(() => `l${(__logoSeq += 1)}`, []);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flex: 'none' }} aria-hidden="true">
      <defs>
        <linearGradient id={`bh-${uid}`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3b74f0" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        <radialGradient id={`gh-${uid}`} cx="0.5" cy="0.42" r="0.7">
          <stop offset="0" stopColor="#ffe24d" />
          <stop offset="0.55" stopColor="#fbb615" />
          <stop offset="1" stopColor="#f59008" />
        </radialGradient>
      </defs>
      <rect x="3" y="3" width="58" height="58" rx="17.5" fill={`url(#bh-${uid})`} />
      <circle cx="32" cy="32.5" r="16.4" stroke="#fff" strokeWidth="4.2" fill="none" />
      <circle cx="32" cy="32.5" r="9.6" stroke="#fff" strokeWidth="4.2" fill="none" strokeOpacity="0.9" />
      <path d="M 32 24.9 C 32.775 31.725 32.775 31.725 39.6 32.5 C 32.775 33.275 32.775 33.275 32 40.1 C 31.225 33.275 31.225 33.275 24.4 32.5 C 31.225 31.725 31.225 31.725 32 24.9 Z" fill={`url(#gh-${uid})`} />
    </svg>
  );
}


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
function deArticle(s) {
  return s.replace(/^(?:the|a|an) (?=.{2})/, '');
}
function keyHit(g, key) {
  const k = deArticle(norm(key));
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
  if (quiz.format === 'logic-grid') {
    return <LogicGridBoard quizId={quizId} />;
  }
  if (quiz.format === 'grid-fill') {
    return <GridFillBoard quizId={quizId} />;
  }
  const answers = quiz.answers;
  const matched = quiz.format === 'matched';
  const nameKeys = useMemo(() => buildImplicitNameKeys(answers), [answers]);
  const mapMode = quiz.format === 'map';
  const pairsMode = quiz.format === 'pairs';
  const bankMode = quiz.format === 'bank';
  const typeMode = quiz.format === 'type-it';
  const photoMode = quiz.format === 'photo';
  const photoMatchMode = quiz.format === 'photo-match';
  const logosMode = quiz.format === 'logos' || quiz.format === 'posters' || quiz.format === 'images';
  const tallTiles = quiz.format === 'posters' || quiz.imgTall === true;
  const squareTiles = quiz.imgSquare === true;
  const tileMode = pairsMode || bankMode || typeMode || photoMode || photoMatchMode;
  // Tile-mode (bank/pairs) quizzes are answered one prompt per PAIR, so the score
  // denominator is the pair count, not the number of distinct answer tiles. A
  // many-to-one bank quiz (e.g. cocktail -> base spirit: 16 cocktails, 6 spirits)
  // otherwise mis-displays as 13/6 and drives the guesses-left counter negative.
  const total = tileMode && Array.isArray(quiz.pairs) ? quiz.pairs.length : answers.length;
  const ordered = matched && quiz.ordered === true;
  // The "reveal the answers" gate is only for quizzes with no companion list and
  // no map board (the plain "table" quizzes). List quizzes already send you to
  // the full ranking to see misses; map quizzes have no table to fill in.
  const canReveal = !quiz.listId;
  const moreLikeThis = (() => {
    const d = deptOf(quiz);
    // Other parts of a multi-part quiz (pt 2, pt 3...) ALWAYS lead, so they are
    // never crowded out of the eight shown. A part-set is a base quiz (e.g.
    // 'movie-taglines') plus its numbered siblings ('movie-taglines-2'); we only
    // treat the stripped base as a set when it is itself a real quiz id, so an
    // unrelated trailing number (e.g. a date slug) is never mis-grouped.
    const stripped = quiz.id.replace(/-\d+$/, '');
    const partBase = QUIZZES.some((x) => x.id === stripped) ? stripped : null;
    const parts = partBase
      ? QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated && x.id.replace(/-\d+$/, '') === partBase)
      : [];
    const sameCat = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated && quiz.category && x.category === quiz.category);
    const sameDept = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated && deptOf(x) === d);
    const rest = QUIZZES.filter((x) => x.id !== quiz.id && !x.hideFromRelated);
    const seen = new Set();
    const out = [];
    for (const x of [...parts, ...sameCat, ...sameDept, ...rest]) {
      if (!seen.has(x.id)) { seen.add(x.id); out.push(x); }
    }
    return out.slice(0, 8);
  })();

  const [tab, setTab] = useState('play');
  const [found, setFound] = useState(() => new Array(total).fill(false));
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(quiz.timeLimit);
  const [hint, setHint] = useState('');
  const [hintBad, setHintBad] = useState(false);
  // Transient right/wrong verdict banner (mobile users miss the small hint line).
  const [cue, setCue] = useState(null);
  const cueTimer = useRef(null);
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
  const [board, setBoard] = useState({ plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [] });
  const [lbView, setLbView] = useState('registered');
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
  const [gameOverDismissed, setGameOverDismissed] = useState(false); // hides the Game Over overlay once acknowledged

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
  const slotRefs = useRef([]);
  const viewedRef = useRef(false);
  const ribbonRef = useRef(null);
  // Keep a ref pointing at the LATEST endGame closure. The countdown
  // setInterval is created once in start(), so the endGame it captured
  // closes over the game-start state (found = all false). On a natural
  // timeout that stale closure posted score 0 at full time. endGame is a
  // hoisted function declaration, so this assignment (re-run every render)
  // always holds the current closure with fresh `found`.
  const endRef = useRef(null);
  endRef.current = endGame;
  const scoreRef = useRef(null);
  const [ribScroll, setRibScroll] = useState({ left: false, right: false });
  // Measured height of the frozen score/answer block, so each format's clue bar
  // (map Find, photo/bank/type prompt) can stick FLUSH right beneath it. The
  // score block pins to the top (top:0); the nav ribbon is not sticky.
  const [scoreH, setScoreH] = useState(150);
  const stickyTop = scoreH;
  useEffect(() => {
    const measure = () => { if (scoreRef.current) setScoreH(scoreRef.current.offsetHeight); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab, started, ended, mapMode]);
  useEffect(() => {
    const el = ribbonRef.current;
    if (!el) return undefined;
    const update = () => { const more = el.scrollWidth - el.clientWidth; setRibScroll({ left: el.scrollLeft > 2, right: more > 2 && el.scrollLeft < more - 2 }); };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  // One-click retry: the Game Over "Retry with 1 click" button reloads the page
  // after leaving this sessionStorage flag, so the fresh mount auto-starts a new
  // round instead of waiting for the player to press Play again.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let t;
    try {
      if (sessionStorage.getItem('sot_quiz_retry') === quizId) {
        sessionStorage.removeItem('sot_quiz_retry');
        t = setTimeout(() => { start(); }, 50);
      }
    } catch (e) { /* sessionStorage unavailable */ }
    return () => { if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = found.filter(Boolean).length;
  const dispScore = tileMode ? pairsMatched : score;
  // Outright #1 across ALL completed plays (anonymous included): the finished run
  // holds the best score AND ties/beats the fastest time recorded at that score
  // (this run is already counted in board.best/board.topTime, so equality = top).
  const isTopScore = ended && board.best != null && lastElapsed != null
    && dispScore === board.best && board.topTime != null && lastElapsed <= board.topTime;
  const activeIdx = found.findIndex((x) => !x);
  const foundNamesSet = mapMode ? new Set(answers.filter((a, i) => found[i]).map((a) => a.t)) : null;

  function refreshBoard() {
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ plays: d.plays || 0, best: d.best != null ? Math.min(d.best, total) : null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [] }); })
      .catch(() => {});
  }

  useEffect(() => {
    setStats(loadStats(quizId));
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.username) { setIdentity(id); setJName(id.username || ''); setJEmail(id.email || ''); }
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
    const finalScore = scoreOverride != null ? scoreOverride : tileMode ? pairsMatchedRef.current : (foundOverride || found).filter(Boolean).length;
    const elapsed = startRef.current ? Math.min(quiz.timeLimit, Math.round((Date.now() - startRef.current) / 1000)) : quiz.timeLimit;
    setLastElapsed(elapsed);
    setStats(recordResult(quizId, finalScore));
    setHint(win ? `Perfect — all ${total} named in ${fmtTime(elapsed)}!` : `Time! You got ${finalScore}/${total}.`);
    setHintBad(!win);
    setGameOverDismissed(false);
    // Map games AND tile games (bank/type-it) keep the board on screen behind
    // the Game Over card so their answer grid is revealed; other formats still
    // jump to the results/leaderboard tab as before.
    if (!mapMode && !tileMode) setTab('stats');

    // Record the completed game (makes play count + average real; attributes
    // to the leaderboard if signed up).
    fetch('/api/quiz/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, score: finalScore, total, timeElapsed: elapsed, email: identity?.email || undefined, anonId: getAnonId() }),
    })
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) { setBoard({ plays: d.plays || 0, best: d.best != null ? Math.min(d.best, total) : null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [] }); setLastResultId(d.resultId ?? null); } })
      .catch(() => {});
  }

  // Retroactively post the just-finished anonymous game to the leaderboard:
  // join by email, then attach THIS result row to the new identity.
  async function submitClaim() {
    setClaimErr(false);
    if (!jName.trim() || jName.trim().length > 40) { setClaimErr(true); setClaimMsg('Pick a display name (max 40 characters).'); return; }
    if (jEmail.trim() && !EMAIL_RE.test(jEmail.trim())) { setClaimErr(true); setClaimMsg('Enter a valid email or leave it blank.'); return; }
    setClaimBusy(true);
    try {
      const res = await fetch('/api/quiz/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, resultId: lastResultId, username: jName.trim(), email: jEmail.trim() || undefined, anonId: getAnonId() }),
      });
      const d = await res.json();
      if (d.error) { setClaimErr(true); setClaimMsg(d.error); setClaimBusy(false); return; }
      const id = { username: d.username, email: d.email };
      try { localStorage.setItem('sot_quiz_identity', JSON.stringify(id)); } catch {}
      setIdentity(id);
      setBoard({ plays: d.plays || 0, best: d.best != null ? Math.min(d.best, total) : null, topTime: d.topTime ?? null, leaderboard: d.leaderboard || [], leaderboardAll: d.leaderboardAll || [] });
      setClaimErr(false);
      setClaimOpen(false);
      if (canReveal) {
        setRevealed(true);
        setClaimMsg('Posted! The answers you missed are now filled in below, highlighted.');
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
      setHint(quiz.suddenDeath
        ? `Find ${answers[ord[0]].t} — click it. One wrong click ends the game.`
        : `Find ${answers[ord[0]].t} — click it. You get ${total} guesses, one per country.`);
    } else if (bankMode) {
      setHint('Match the prompt to a tile in the bank below.');
    } else if (pairsMode) {
      setHint('Pick a slogan, then the company it belongs to.');
    } else if (typeMode) {
      setHint('Type the answer for the clue above. Next skips it for now.');
    } else if (photoMode) {
      setHint(`Name the ${quiz.noun || 'city'} in the photo above. Next skips it for now.`);
    } else if (photoMatchMode) {
      setHint(`Tap the title tile that matches the ${quiz.noun || 'picture'} shown. Every tap spends a guess.`);
    } else {
      setHint(ordered ? 'Go — answer in order, from the top.' : matched ? (quiz.noun ? `Go — type each ${quiz.noun}.` : "Go — name each year's winner.") : 'Go — name them all.');
    }
    setHintBad(false);
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) { clearInterval(timerRef.current); (endRef.current || endGame)(false); return 0; }
        return t - 1;
      });
    }, 1000);
    if (inputRef.current) inputRef.current.focus();
  }

  // Flash a bold colored verdict and buzz the device so a right/wrong result
  // is unmissable on a phone, where the 12px hint line alone goes unnoticed.
  function fireCue(ok) {
    const id = Date.now() + Math.random();
    setCue({ ok, id });
    try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ok ? 22 : [0, 38, 55, 38]); } catch (e) {}
    clearTimeout(cueTimer.current);
    cueTimer.current = setTimeout(() => setCue((c) => (c && c.id === id ? null : c)), 1000);
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
        fireCue(true);
        if (next.every(Boolean)) endGame(true, next);
        return;
      }
    }
    setHint('Not on the list — try another.');
    setHintBad(true);
    fireCue(false);
  }

  function onKey(e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkGuess(e.target.value);
    setGuess('');
  }

  // After a slot is answered, move focus to the next still-blank slot input.
  // Done synchronously inside the user gesture so the mobile on-screen keyboard
  // stays up and the typing cursor does not reset (no re-tap needed).
  function focusNextSlot(fromIdx, foundArr) {
    const n = foundArr.length;
    for (let k = 1; k <= n; k++) {
      const j = (fromIdx + k) % n;
      if (!foundArr[j] && slotRefs.current[j]) { slotRefs.current[j].focus(); return; }
    }
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
      fireCue(true);
      if (next.every(Boolean)) endGame(true, next);
      else focusNextSlot(i, next);
    } else {
      setHint(quiz.noun ? "Not quite. Try again." : "Not that year's winner. Try again.");
      setHintBad(true);
      fireCue(false);
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
      fireCue(true);
      if (next.every(Boolean)) endGame(true, next);
    } else {
      setHint(`Not the ${a.label != null ? a.label + ' ' : ''}answer. Work down in order, try again.`);
      setHintBad(true);
      fireCue(false);
    }
  }
  function onOrderedKey(e) {
    if (e.key !== 'Enter' || !started || ended) return;
    checkOrdered(e.target.value);
    setGuess('');
  }

  // Live auto-submit: accept a typed guess THE MOMENT it matches an unsolved
  // answer, with no Enter and no wrong-answer feedback while still typing. Enter
  // (the check* handlers) still works and is what surfaces a miss. Returns true
  // when a guess was accepted so the caller can clear the field.
  function autoName(raw) {
    const g = norm(raw);
    if (!g) return false;
    for (let i = 0; i < answers.length; i++) {
      if (found[i]) continue;
      const a = answers[i];
      if ((anyKey(g, a.keys) || anyKey(g, nameKeys[i])) && !anyKey(g, a.anti)) {
        const next = found.slice();
        next[i] = true;
        setFound(next);
        setHint(`Correct — ${a.t}`);
        setHintBad(false);
        fireCue(true);
        if (next.every(Boolean)) endGame(true, next);
        return true;
      }
    }
    return false;
  }
  function autoOrdered(raw) {
    const g = norm(raw);
    if (!g) return false;
    const i = found.findIndex((x) => !x);
    if (i < 0) return false;
    const a = answers[i];
    if ((anyKey(g, a.keys) || anyKey(g, nameKeys[i])) && !anyKey(g, a.anti)) {
      const next = found.slice();
      next[i] = true;
      setFound(next);
      setHint(`Correct — ${a.label != null ? a.label + ': ' : ''}${a.t}`);
      setHintBad(false);
      fireCue(true);
      if (next.every(Boolean)) endGame(true, next);
      return true;
    }
    return false;
  }
  function autoSlot(i, raw) {
    const g = norm(raw);
    if (!g || found[i]) return false;
    const a = answers[i];
    if ((anyKey(g, a.keys) || anyKey(g, nameKeys[i])) && !anyKey(g, a.anti)) {
      const next = found.slice();
      next[i] = true;
      setFound(next);
      setHint(`Correct — ${a.label != null ? a.label + ': ' : ''}${a.t}`);
      setHintBad(false);
      fireCue(true);
      if (next.every(Boolean)) endGame(true, next);
      else focusNextSlot(i, next);
      return true;
    }
    return false;
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
      fireCue(true);
      setTimeout(() => setFlash((f) => (f && f.name === name ? null : f)), 400);
      const ord = orderRef.current || [];
      const remaining = ord.filter((j) => !next[j]);
      if (!remaining.length) { setHint(`Correct — ${name}. That's all of them.`); setHintBad(false); setCurName(null); endGame(true, next); return; }
      if (left <= 0) { setHint(`Correct — ${name}. That was your last guess.`); setHintBad(false); setCurName(null); endGame(false, next); return; }
      const nn = answers[remaining[0]].t;
      setCurName(nn);
      setHint(quiz.suddenDeath
        ? `Correct — ${name}. ${left} to go. Now find ${nn}.`
        : `Correct — ${name}. ${left} ${left === 1 ? 'guess' : 'guesses'} left. Now find ${nn}.`);
      setHintBad(false);
    } else {
      setFlash({ name, ok: false });
      setTimeout(() => setFlash((f) => (f && f.name === name ? null : f)), 400);
      fireCue(false);
      // Sudden-death map: one wrong click ends the run on the spot.
      if (quiz.suddenDeath) { setHint(`That was ${name}, not ${curName}. One wrong click ends it — game over.`); setHintBad(true); endGame(false); return; }
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
  function onBankWrong(errorCount, prompt) {
    setPairsErrors(errorCount);
    setHint(`Not the match for ${prompt}. That cost you a guess.`);
    setHintBad(true);
  }

  async function submitJoin() {
    setJoinErr(false);
    if (!jName.trim() || jName.trim().length > 40) { setJoinErr(true); setJoinMsg('Pick a display name (max 40 characters).'); return; }
    if (jEmail.trim() && !EMAIL_RE.test(jEmail.trim())) { setJoinErr(true); setJoinMsg('Enter a valid email or leave it blank.'); return; }
    setJoinBusy(true);
    try {
      const res = await fetch('/api/quiz/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: jName.trim(), email: jEmail.trim() || undefined, anonId: getAnonId() }),
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
    const pct = total ? Math.round((dispScore / total) * 100) : 0;
    const text = ended
      ? `I scored ${dispScore}/${total} (${pct}%) on "${quiz.title}" at Source of Truths. Can you beat me?`
      : `How well do you know "${quiz.title}"? Take the timed quiz at Source of Truths.`;
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
  // Leaderboard ranks with ties: equal score AND time share a rank (and are
  // ordered alphabetically by the API), so they display as a tie (T#).
  const lb = lbView === 'all' ? (board.leaderboardAll || []) : board.leaderboard;
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

  // Column layout. An EXPLICIT quiz.columnSplit is a fixed reference grid (e.g.
  // a periodic-table block) and is NEVER reordered. Everything else long enough
  // auto-wraps into balanced columns purely for fit, and those columns DO cycle
  // (answered items sink to the bottom) exactly like a single column.
  // quiz.singleColumn forces one column. See the cycling note in CLAUDE.md.
  const explicitCols = (() => {
    if (quiz.singleColumn) return null;
    const cs = quiz.columnSplit;
    if (Array.isArray(cs) && cs.reduce((acc, n) => acc + n, 0) === answers.length) {
      const cols = []; let gi = 0;
      for (const n of cs) { const r = []; for (let k = 0; k < n; k++) r.push(gi++); cols.push(r); }
      return cols;
    }
    return null;
  })();
  const colSplit = explicitCols; // fixed-grid render path uses this
  const autoColCount = (() => {
    if (quiz.singleColumn || explicitCols) return 1;
    // These formats render their own board, not the answer list.
    if (mapMode || pairsMode || bankMode || typeMode || photoMode || photoMatchMode) return 1;
    const n = answers.length;
    const maxLen = answers.reduce((m, a) => {
      const labelLen = a && a.label != null ? String(a.label).length + 2 : 0;
      return Math.max(m, String((a && a.t) || '').length + labelLen);
    }, 0);
    let widthCap;
    if (maxLen <= 14) widthCap = 4;
    else if (maxLen <= 28) widthCap = 3;
    else if (maxLen <= 40) widthCap = 2;
    else widthCap = 1;
    // Aim for at least ~6 rows per column so columns never look sparse.
    let cols = Math.max(1, Math.min(widthCap, Math.floor(n / 6)));
    const per = Math.ceil(n / Math.max(1, cols));
    cols = Math.ceil(n / per); // trim a near-empty trailing column
    return Math.max(1, cols);
  })();
  const asOfRaw = quiz.publishedDate || (quiz.publishedAt ? quiz.publishedAt.slice(0, 10) : null);
  const asOfLabel = asOfRaw ? new Date(asOfRaw + 'T12:00:00Z').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : null;

  // ── Solved-item cycling ──────────────────────────────────────────────────
  // Move answered items to the bottom so the next unanswered one is always near
  // the input bar. Keeps the action at the top of the page, which makes the
  // long-list scroll (and the sticky-input fight on mobile) a non-issue. Only
  // the single-input name-them-all modes (plain list + image grid) cycle;
  // matched/ordered per-slot, map, and tile boards keep their fixed order, and
  // multi-column (colSplit) layouts are left alone. Each item keeps its own rank
  // number because the row/tile is always handed its ORIGINAL index.
  const cyclingOn = started && !ended && !matched && !mapMode && !tileMode && !explicitCols;
  const displayOrder = useMemo(() => {
    const base = answers.map((_, i) => i);
    if (!cyclingOn) return base;
    return [...base.filter((i) => !found[i]), ...base.filter((i) => found[i])];
  }, [answers, cyclingOn, found]);

  // FLIP: when the order changes, slide each row/tile from its old position to
  // its new one instead of jumping. Cheap (a handful of nodes) and only fires
  // when the solved set, play state, or active tab changes.
  const flipEls = useRef(new Map());   // originalIndex -> element
  const flipPrev = useRef(new Map());  // originalIndex -> { top, left }
  const setFlipRef = (i) => (el) => { if (el) flipEls.current.set(i, el); else flipEls.current.delete(i); };
  useLayoutEffect(() => {
    if (tab !== 'play') { flipPrev.current = new Map(); return; }
    const els = flipEls.current;
    const next = new Map();
    els.forEach((el, idx) => { if (el && el.isConnected) { const r = el.getBoundingClientRect(); next.set(idx, { top: r.top, left: r.left }); } });
    const prev = flipPrev.current;
    next.forEach((np, idx) => {
      const op = prev.get(idx);
      if (!op) return;
      const dx = op.left - np.left, dy = op.top - np.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      const el = els.get(idx);
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform .32s cubic-bezier(.22,.61,.36,1)';
        el.style.transform = '';
      });
    });
    flipPrev.current = next;
  }, [found, started, ended, tab]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, color: COLORS.ink, position: 'relative', overflowX: 'clip' }}>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '24px 20px 80px' }}>

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        <SiteHeader active="quizzes" />

        {/* Header */}
        <div style={{ paddingBottom: 0, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(16px, 4vw, 28px)' }}>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(30px, 5vw, 50px)', lineHeight: 1.02, letterSpacing: '-0.02em', margin: 0, color: COLORS.ink, fontVariationSettings: '"SOFT" 100' }}>{quiz.title}</h1>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, margin: '10px 0 0', color: COLORS.faded, maxWidth: 680 }}>{quiz.blurb}</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 14, justifyContent: 'flex-end' }}>
          <button onClick={() => setTab('share')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: tab === 'share' ? COLORS.ember : COLORS.faded, display: 'flex', alignItems: 'center', gap: 5 }}><Share2 size={13} strokeWidth={2.5} /> Share</button>
          <button onClick={() => { setQSent(false); setQOpen(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 5 }}><HelpCircle size={13} strokeWidth={2.5} /> Error(s)?</button>
        </div>

        {/* Ribbon */}
        <div style={{ marginTop: 8 }}>
          <div style={{ position: 'relative' }}>
            <style>{`@keyframes qzCueR{0%,100%{transform:translate(0,-50%);}50%{transform:translate(3px,-50%);}}@keyframes qzCueL{0%,100%{transform:translate(0,-50%);}50%{transform:translate(-3px,-50%);}}.qz-cue{position:absolute;top:50%;z-index:3;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:${COLORS.ember};color:#fff;box-shadow:0 1px 4px rgba(26,22,17,0.45);pointer-events:none;font-size:15px;line-height:1;}.qz-cue-r{right:10px;animation:qzCueR 1.4s ease-in-out infinite;}.qz-cue-l{left:10px;animation:qzCueL 1.4s ease-in-out infinite;}@media(min-width:760px){.qz-cue{display:none;}}.qz-ribbon{scrollbar-width:none;-ms-overflow-style:none;}.qz-ribbon::-webkit-scrollbar{display:none;}@keyframes qzCueOk{0%{transform:scale(.96);opacity:0;}55%{transform:scale(1.03);}100%{transform:scale(1);opacity:1;}}@keyframes qzCueNo{0%,100%{transform:translateX(0);}15%{transform:translateX(-7px);}30%{transform:translateX(6px);}45%{transform:translateX(-5px);}60%{transform:translateX(4px);}75%{transform:translateX(-2px);}}`}</style>
            <div ref={ribbonRef} className="qz-ribbon" style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'nowrap', overflowX: 'auto', background: '#eceef1', borderRadius: 10, padding: 4, gap: 6 }}>
              {chip('play', 'Play')}
              {chip('stats', 'Leaderboard')}
              {chip('join', 'Sign-up', <Trophy size={12} strokeWidth={2.5} />)}
            </div>
            {ribScroll.left && <span aria-hidden="true" className="qz-cue qz-cue-l">&#8249;</span>}
            {ribScroll.right && <span aria-hidden="true" className="qz-cue qz-cue-r">&#8250;</span>}
          </div>
        </div>

        {ended && (
          <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 10, border: `1px solid ${COLORS.faded}33`, background: COLORS.paper }}>
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
                  <Eye size={14} strokeWidth={2.5} /> Reveal Answers
                </button>
              )}
              {canReveal && revealed && (
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: COLORS.forest, lineHeight: '46px' }}>Answers revealed below — your misses are highlighted.</span>
              )}
              {!identity && !claimOpen && (
                <button onClick={() => { setClaimMsg(''); setClaimErr(false); setClaimOpen(true); }} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, lineHeight: '46px', padding: '0 24px', background: COLORS.ember, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {canReveal
                    ? (<><Eye size={14} strokeWidth={2.5} /> Reveal Answers</>)
                    : (<><Trophy size={14} strokeWidth={2.5} /> Post this to the leaderboard</>)}
                </button>
              )}
              {!identity && claimOpen && (
                <div style={{ flexBasis: '100%', maxWidth: 420, margin: '0 auto' }}>
                  <p style={{ fontFamily: SANS, fontSize: 13, color: '#4a4339', margin: '0 0 10px', textAlign: 'center' }}>
                    {canReveal
                      ? `Pick a display name to reveal the answers you missed. It also posts this ${dispScore}/${total} to the leaderboard. Email is optional (required only for prizes), and no password is needed.`
                      : `Pick a display name to post this ${dispScore}/${total} to the leaderboard. Email is optional (required only for prizes), and no password is needed.`}
                  </p>
                  <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="Display Name" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={fieldStyle} />
                  <input value={jEmail} onChange={(e) => setJEmail(e.target.value)} type="email" placeholder="Email (optional, required for prizes)" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={{ ...fieldStyle, marginTop: 10 }} />
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
            {/* Freeze the score/time bar AND the answer input together, pinned to
                the top of the viewport. The nav ribbon above is NOT sticky, so
                this is the only frozen element; the list/board scrolls under. */}
            <div ref={scoreRef} style={{ position: 'sticky', top: 0, zIndex: 24, background: COLORS.cream }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, borderRadius: 12, padding: '16px 8px', marginBottom: 0 }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}>{dispScore}<span style={{ fontSize: 20, color: COLORS.faded }}>/{total}</span></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Your score</div>
              </div>
              {mapMode ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: (guessesLeft == null ? total : guessesLeft) <= 3 && started && !ended ? COLORS.ember : COLORS.ink }}>{guessesLeft == null ? total : guessesLeft}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>{quiz.suddenDeath ? 'States left' : 'Guesses left'}</div>
              </div>
              ) : bankMode || photoMatchMode ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: (total - pairsMatched - pairsErrors) <= 3 && started && !ended ? COLORS.ember : COLORS.ink }}>{Math.max(0, total - pairsMatched - pairsErrors)}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Guesses left</div>
              </div>
              ) : (typeMode || photoMode) ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: COLORS.ink }}>{Math.max(0, total - pairsMatched)}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Remaining</div>
              </div>
              ) : tileMode ? (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1, color: pairsErrors > 0 ? COLORS.ember : COLORS.ink }}>{pairsErrors}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Errors</div>
              </div>
              ) : (
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 34, lineHeight: 1 }}><Count value={board.plays} /></div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Total plays</div>
              </div>
              )}
              <div style={{ textAlign: 'center', padding: '0 8px', borderLeft: `1px solid ${COLORS.faded}33` }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: time <= 10 && started && !ended ? COLORS.ember : COLORS.ink }}>{clock}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>Time left</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              {!mapMode && !tileMode && (!matched || ordered) && (
                <input
                  ref={inputRef}
                  value={guess}
                  disabled={!started || ended}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (started && !ended && (ordered ? autoOrdered(v) : autoName(v))) { setGuess(''); }
                    else { setGuess(v); }
                  }}
                  onKeyDown={ordered ? onOrderedKey : onKey}
                  placeholder={started ? (ordered ? `Type the ${quiz.noun || 'answer'} for ${answers[activeIdx] ? answers[activeIdx].label : ''}…` : `Type ${/^[aeiou]/.test(quiz.noun || '') ? 'an' : 'a'} ${quiz.noun || 'answer'}…`) : 'Press Play to begin…'}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  style={{ flex: 1, fontFamily: SANS, fontSize: 17, padding: '14px 16px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, borderRadius: 8, background: !started || ended ? COLORS.paper : '#eceef1', color: COLORS.ink, opacity: !started || ended ? 0.5 : 1 }}
                />
              )}
              <div style={{ position: 'relative', display: 'flex', flex: (matched && !ordered) || mapMode || tileMode ? 1 : 'none' }}>
              <button onClick={start} disabled={started || ended} style={{ flex: 1, fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 22px', height: matched || mapMode || tileMode ? 52 : 'auto', border: 'none', background: COLORS.ember, color: '#fff', cursor: started || ended ? 'default' : 'pointer', opacity: started || ended ? 0.5 : 1 }}>
                {ended ? 'Done' : started ? 'Playing' : (matched && !ordered) ? (quiz.noun ? 'Play' : 'Play — name each year') : 'Play'}
              </button>
              {/* Correct/wrong verdict pops over the Play button (replaces the old
                  full-width banner, which forced a large gap below the input). */}
              {cue && started && !ended && (
                <div key={cue.id} aria-live="assertive" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cue.ok ? COLORS.forest : COLORS.ember, color: '#fff', pointerEvents: 'none', animation: `${cue.ok ? 'qzCueOk' : 'qzCueNo'} .45s ease both` }}>
                  {cue.ok ? <Check size={22} strokeWidth={3} /> : <X size={22} strokeWidth={3} />}
                </div>
              )}
              </div>
            </div>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, minHeight: 15, marginTop: 2, marginBottom: 8, color: hintBad ? COLORS.ember : COLORS.faded }}>{hint}</div>

            {photoMode ? (
            <PhotoBoard items={quiz.answers} started={started} ended={ended} revealed={revealed} onMatch={onPairMatch} onWrong={onBankWrong} onEnd={onPairEnd} onHint={onPairHint} answerNoun={quiz.noun} photoAspect={quiz.photoAspect} stickyTop={stickyTop} />
            ) : typeMode ? (
            <TypeItBoard items={quiz.answers} started={started} ended={ended} revealed={revealed} onMatch={onPairMatch} onWrong={onBankWrong} onEnd={onPairEnd} onHint={onPairHint} promptLabel={quiz.leftLabel} answerNoun={quiz.noun} stickyTop={stickyTop} />
            ) : bankMode ? (
            <BankQuizBoard pairs={quiz.pairs} started={started} ended={ended} revealed={revealed} onMatch={onPairMatch} onWrong={onBankWrong} onEnd={onPairEnd} onHint={onPairHint} promptLabel={quiz.leftLabel} bankLabel={quiz.rightLabel} stickyTop={stickyTop} />
            ) : photoMatchMode ? (
            <PhotoMatchBoard items={quiz.answers} started={started} ended={ended} revealed={revealed} onMatch={onPairMatch} onWrong={onBankWrong} onEnd={onPairEnd} onHint={onPairHint} answerNoun={quiz.noun} stickyTop={stickyTop} />
            ) : pairsMode ? (
            <MatchQuizBoard pairs={quiz.pairs} started={started} ended={ended} revealed={revealed} onMatch={onPairMatch} onError={onPairError} onEnd={onPairEnd} onHint={onPairHint} leftLabel={quiz.leftLabel} rightLabel={quiz.rightLabel} sortLeft={quiz.sortLeft} />
            ) : mapMode ? (
            <div>
              <div style={{ position: 'sticky', top: stickyTop, zIndex: 4, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, background: started && !ended ? COLORS.ink : COLORS.paper, color: started && !ended ? COLORS.cream : COLORS.faded, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '12px 16px', marginBottom: 10, minHeight: 30 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.7, flex: 'none' }}>Find</span>
                {(() => { const clueText = ended ? 'Game over' : started ? (curName || '—') : 'Press Play to start'; return (<span key={clueText} style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 'clamp(20px, 3.4vw, 26px)', lineHeight: 1.1, flex: '1 1 320px', minWidth: 0, overflowWrap: 'break-word', transform: 'translateZ(0)' }}>{clueText}</span>); })()}
                {started && !ended && (
                  <button onClick={skipCountry} title="Can't find it? Skip and come back to it later." style={{ marginLeft: 'auto', flex: 'none', fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, padding: '8px 14px', background: 'transparent', color: COLORS.cream, border: '1px solid rgba(244,237,224,0.4)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <SkipForward size={12} strokeWidth={2.5} /> Skip
                  </button>
                )}
              </div>
              <MapQuizBoard region={quiz.region || 'europe'} noBorders={quiz.noBorders} started={started} ended={ended} revealed={revealed} foundNames={foundNamesSet} flash={flash} onPick={pickCountry} />
            </div>
            ) : logosMode ? (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${tallTiles || squareTiles ? 134 : 112}px, 1fr))`, gap: 8 }}>
              {displayOrder.map((i) => {
                const a = answers[i];
                const f = found[i];
                const reveal = ended && revealed && !f;
                const bd = f ? COLORS.forest : reveal ? COLORS.rust : COLORS.faded + '33';
                return (
                  <li key={i} ref={setFlipRef(i)} style={{ borderRadius: 10, border: `1px solid ${bd}`, borderRadius: 10, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: tallTiles || squareTiles ? 6 : 8, transition: 'background .2s, border-color .2s, box-shadow .2s', boxShadow: f ? `inset 0 -3px 0 ${COLORS.forest}` : reveal ? `inset 0 -3px 0 ${COLORS.rust}` : 'none' }}>
                    <div style={{ ...(squareTiles ? { aspectRatio: '1 / 1' } : { height: tallTiles ? 208 : 62 }), width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
                      {started || ended ? (
                        <img src={a.img} alt={f || reveal ? a.t : `Image ${i + 1}`} loading="lazy" style={{ maxWidth: tallTiles || squareTiles ? '100%' : '90%', maxHeight: squareTiles ? '100%' : tallTiles ? 206 : 56, objectFit: 'contain' }} />
                      ) : (
                        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: tallTiles || squareTiles ? 40 : 26, color: COLORS.faded, opacity: 0.3 }}>?</span>
                      )}
                    </div>
                    <div style={{ minHeight: 30, marginTop: 5, textAlign: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 13, lineHeight: 1.12, color: f ? COLORS.forest : reveal ? COLORS.rust : COLORS.faded }}>
                      {f || reveal ? a.t : <span style={{ fontFamily: MONO, fontSize: 17, opacity: 0.4 }}>?</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            ) : (
            (() => {
              const renderRow = (a, i) => {
                const f = found[i];
                const isActive = ordered && started && !ended && i === activeIdx;
                const reveal = ended && revealed && !f; // a missed answer, now filled in
                return (
                  <li key={i} ref={setFlipRef(i)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 16px', borderRadius: 10, border: `1px solid ${f ? COLORS.forest : isActive ? COLORS.ember : reveal ? COLORS.rust : COLORS.faded + '33'}`, marginBottom: 8, background: reveal ? '#f6ead9' : f || isActive ? '#fff' : COLORS.paper, boxShadow: isActive ? `inset 4px 0 0 ${COLORS.ember}` : reveal ? `inset 4px 0 0 ${COLORS.rust}` : 'none', transition: 'background .2s, border-color .2s, box-shadow .2s, color .2s' }}>
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
                        ref={(el) => { slotRefs.current[i] = el; if (i === 0) inputRef.current = el; }}
                        enterKeyHint="next"
                        disabled={!started || ended}
                        onChange={(e) => { if (started && !ended && autoSlot(i, e.target.value)) e.target.value = ''; }}
                        onKeyDown={(e) => onSlotKey(i, e)}
                        placeholder={started ? `Type the ${quiz.noun || 'winner'}…` : ''}
                        autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                        style={{ flex: 1, fontFamily: SANS, fontSize: 16, padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, borderRadius: 8, background: !started || ended ? COLORS.paper : '#eceef1', color: COLORS.ink, opacity: !started || ended ? 0.5 : 1 }}
                      />
                    ) : isActive ? (
                      <span style={{ fontFamily: SANS, fontSize: 14, fontStyle: 'italic', color: COLORS.ember, flex: 1 }}>Type it in the box above</span>
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
              if (quiz.format === 'author-grid') {
                const gridOrder = answers.map((a, gi) => gi).sort((x, y) => (!!found[x] === !!found[y] ? x - y : (found[x] ? 1 : -1)));
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {gridOrder.map((gi) => {
                      const a = answers[gi];
                      const f = found[gi];
                      const rev = ended && revealed && !f;
                      return (
                        <div key={gi} style={{ borderRadius: 10, border: `1px solid ${f ? COLORS.forest : rev ? COLORS.rust : COLORS.faded + '33'}`, borderRadius: 8, background: f ? '#fff' : rev ? '#f6ead9' : COLORS.paper, padding: '9px 11px', transition: 'all .2s' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, flex: 'none' }}>{gi + 1}</span>
                            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: COLORS.ink, lineHeight: 1.2 }}>{a.clue}</span>
                          </div>
                          <div style={{ marginTop: 4, marginLeft: 22, minHeight: 18 }}>
                            {f || rev ? (
                              <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 500, lineHeight: 1.2, color: f ? COLORS.forest : COLORS.rust }}>{a.t}</span>
                            ) : (
                              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.04em', color: COLORS.faded, opacity: 0.5 }}>&mdash;&nbsp;&mdash;&nbsp;&mdash;</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }
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
              if (autoColCount > 1) {
                // Auto-wrapped columns follow displayOrder (column-major), so as
                // items are solved they sink toward the last column's bottom and
                // the next unsolved one stays near the input bar.
                const per = Math.ceil(displayOrder.length / autoColCount);
                const cols = [];
                for (let c = 0; c < autoColCount; c++) cols.push(displayOrder.slice(c * per, (c + 1) * per));
                return (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {cols.map((idxs, ci) => (
                      <ol key={ci} style={{ margin: 0, padding: 0, listStyle: 'none', flex: '1 1 200px', minWidth: 0 }}>
                        {idxs.map((i) => renderRow(answers[i], i))}
                      </ol>
                    ))}
                  </div>
                );
              }
              return (
                <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {displayOrder.map((i) => renderRow(answers[i], i))}
                </ol>
              );
            })()
            )}

            {ended && (
              <div style={{ marginTop: 22, padding: 24, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, textAlign: 'center' }}>
                <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 8 }}>{dispScore === total ? 'Perfect score' : time <= 0 ? 'Time!' : tileMode ? 'Out of moves' : 'Gave up'}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, lineHeight: 1.1, marginBottom: 10 }}>{dispScore} of {total} · {isTopScore ? 'you are the top score' : `you beat ${percentile(dispScore, total)}% of players`}</div>
                <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', maxWidth: 440, margin: '0 auto 18px' }}>
                  {board.best != null ? (dispScore >= board.best ? `That matches the high score of ${board.best}.` : `The high score to beat is ${board.best}.`) : 'Be the first to set the pace.'}
                  {quiz.listId ? ' See the ones you missed in the full ranking, with sources and the consensus breakdown.' : canReveal ? (revealed ? ' The ones you missed are filled in above, highlighted.' : ' Create a display name above to reveal the ones you missed.') : ''}
                </p>
              </div>
            )}

            <div style={{ marginTop: 22, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => endGame(false)} disabled={ended || !started} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '12px 26px', border: 'none', background: COLORS.ember, color: '#fff', cursor: ended || !started ? 'default' : 'pointer', opacity: ended || !started ? 0.4 : 1, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Flag size={14} strokeWidth={2.5} color="#fff" /> Give up
              </button>
              {ended && (
                <button onClick={share} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '12px 26px', border: 'none', background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Challenge a friend'}
                </button>
              )}
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
                <StatBox label="Total plays" value={<Count value={board.plays} />} />
                <StatBox label="Best score" value={board.best != null ? `${board.best}/${total}` : '—'} />
                <StatBox label="On the leaderboard" value={lb.length} />
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

              {lb.length === 0 ? (
                <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded }}>
                  No one has posted a score yet. <button onClick={() => setTab('join')} style={{ background: 'none', border: 'none', padding: 0, color: COLORS.ember, font: 'inherit', fontStyle: 'italic', textDecoration: 'underline', cursor: 'pointer' }}>Join the leaderboard</button> and be first.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, padding: '0 14px 8px', fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded }}>
                    <span>#</span><span>Display Name</span><span style={{ textAlign: 'right' }}>Correct</span><span style={{ textAlign: 'right' }}>Time</span>
                  </div>
                  {lb.map((row, i) => {
                    const mine = identity && row.username === identity.username;
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 76px 64px', gap: 8, alignItems: 'center', padding: '11px 14px', marginBottom: 6, background: mine ? '#fff' : COLORS.paper, borderRadius: 10, border: `1px solid ${mine ? COLORS.ember : COLORS.faded + '22'}` }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, color: lbRanks[i] <= 3 ? COLORS.ember : COLORS.faded }}>{lbTied[i] ? `T${lbRanks[i]}` : lbRanks[i]}</span>
                        <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.username}{mine ? ' (you)' : ''}{row.tryNum ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400, color: COLORS.faded, marginLeft: 6 }}>{row.tryNum > 1 ? '(retried)' : '(1st Try)'}</span> : ''}</span>
                          {row.playedAt ? <span style={{ fontFamily: MONO, fontSize: 10.5, color: COLORS.faded }}>{fmtWhen(row.playedAt)}</span> : null}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 14, textAlign: 'right' }}>{row.score}/{total}</span>
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
            <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, color: COLORS.ink, maxWidth: 480, margin: '0 auto 20px' }}>{ended ? `You scored ${dispScore} of ${total}. Challenge someone to beat it.` : 'Send this quiz to someone who thinks they know better.'}</p>
            <button onClick={share} style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, padding: '0 28px', lineHeight: '46px', border: 'none', background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : (ended ? 'Challenge a friend' : 'Share this quiz')}
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
              Sign up with a display name and it appears on the leaderboard after you finish a game. No password needed.
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, color: '#4a4339', margin: '0 0 6px' }}>
              Adding an email lets you reconnect on another device or after clearing your browser. Without one, your spot is saved in this browser.
            </p>
            <p style={{ fontFamily: MONO, fontSize: 12, color: COLORS.faded, margin: '0 0 22px' }}>
              Your display name is shown publicly. Email is optional, required only for prizes, and kept private.
            </p>

            <label style={labelStyle}>Display Name</label>
            <input value={jName} onChange={(e) => setJName(e.target.value)} maxLength={40} placeholder="e.g. skyhopper42" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={fieldStyle} />
            <label style={{ ...labelStyle, marginTop: 16 }}>Email (optional, required for prizes)</label>
            <input value={jEmail} onChange={(e) => setJEmail(e.target.value)} type="email" placeholder="you@email.com" autoCapitalize="none" autoCorrect="off" spellCheck={false} style={fieldStyle} />

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
              <a href={quiz.source.url} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.ember }}>{quiz.source.label}</a>
            ) : (
              quiz.source.label
            )}
          </div>
        )}

        {moreLikeThis.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${COLORS.faded}33` }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, marginBottom: 16 }}>More quizzes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {moreLikeThis.map((rq) => (
                <a key={rq.id} href={`/quiz/${rq.id}`} style={{ textDecoration: 'none', color: COLORS.ink, background: COLORS.paper, borderRadius: 10, border: `1px solid ${COLORS.faded}33`, padding: '12px 14px', display: 'block', transition: 'all 0.15s ease' }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: COLORS.ember, fontWeight: 700, marginBottom: 6 }}>{rq.category || 'Quiz'}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 600, lineHeight: 1.15 }}>{rq.title}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      {ended && !gameOverDismissed && (
        <div
          onClick={() => setGameOverDismissed(true)}
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(26,22,17,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6vh 16px' }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: COLORS.cream, borderRadius: 10, border: `2px solid ${COLORS.ink}`, padding: '28px 26px', textAlign: 'center', boxShadow: '0 18px 60px rgba(26,22,17,0.4)' }}>
            {(() => {
              const win = dispScore === total;
              const timeout = !win && time <= 0;
              const heading = win ? 'Perfect!' : timeout ? "Time's Up" : 'Game Over';
              const reason = win
                ? `All ${total} found${lastElapsed != null ? ` in ${fmtTime(lastElapsed)}` : ''}.`
                : timeout
                  ? 'The clock ran out.'
                  : (mapMode && quiz.suddenDeath)
                    ? 'One wrong click ends the run.'
                    : 'You ended the round.';
              return (
                <>
                  <div style={{ display: 'inline-flex', marginBottom: 12, color: win ? COLORS.forest : COLORS.ember }}>
                    {win ? <Trophy size={40} strokeWidth={2} /> : <Flag size={40} strokeWidth={2} />}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', color: win ? COLORS.forest : COLORS.ember, marginBottom: 8 }}>{heading}</div>
                  <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 40, lineHeight: 1, marginBottom: 6 }}>{dispScore}<span style={{ fontSize: 24, color: COLORS.faded }}> / {total}</span></div>
                  <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: COLORS.faded, margin: '0 0 4px' }}>{reason}</p>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: '#4a4339', margin: '0 0 20px' }}>{isTopScore ? 'You are the top score.' : <>You beat {percentile(dispScore, total)}% of players.{board.best != null ? (dispScore >= board.best ? ' That ties the high score.' : ` High score to beat: ${board.best}.`) : ''}</>}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10, width: '100%', maxWidth: 300, margin: '0 auto' }}>
                    <button onClick={() => { try { sessionStorage.setItem('sot_quiz_retry', quizId); } catch (e) { /* no-op */ } window.location.reload(); }} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ember}`, background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Retry with 1 click</button>
                    <button onClick={() => { setGameOverDismissed(true); setRevealed(true); setTab('play'); }} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Eye size={14} strokeWidth={2.5} /> Reveal Answers</button>
                    <button onClick={() => { setGameOverDismissed(true); if (identity) { setTab('stats'); } else { setClaimMsg(''); setClaimErr(false); setClaimOpen(true); setTab('play'); } }} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Trophy size={14} strokeWidth={2.5} /> Post to Leaderboard</button>
                    <button onClick={share} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Share2 size={14} strokeWidth={2.5} /> {copied ? 'Link copied!' : 'Challenge a friend'}</button>
                    <button onClick={() => { const pool = QUIZZES.filter((qq) => qq && qq.id && qq.id !== quizId); const r = pool[Math.floor(Math.random() * pool.length)]; if (r) router.push(`/quiz/${r.id}`); }} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ember}`, background: COLORS.ember, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Play a Random Quiz</button>
                    <button onClick={() => router.push('/quizzes')} style={{ width: '100%', boxSizing: 'border-box', fontFamily: MONO, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '13px 22px', borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.ink, color: COLORS.cream, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>All Quizzes</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
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
                  <input
                    type="text"
                    value={qName}
                    onChange={(e) => setQName(e.target.value)}
                    maxLength={120}
                    placeholder="Name (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                  <input
                    type="email"
                    value={qEmail}
                    onChange={(e) => setQEmail(e.target.value)}
                    maxLength={200}
                    placeholder="Email (optional)"
                    style={{ flex: 1, minWidth: 140, boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none' }}
                  />
                </div>
                <textarea
                  value={qMsg}
                  onChange={(e) => setQMsg(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="What's your question or comment? (optional)"
                  style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, background: COLORS.paper, fontFamily: SANS, fontSize: 14, color: COLORS.ink, outline: 'none', resize: 'vertical', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setQOpen(false)}
                    style={{ cursor: 'pointer', background: 'transparent', color: COLORS.ink, borderRadius: 10, border: `1.5px solid ${COLORS.ink}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuestion}
                    disabled={qBusy}
                    style={{ cursor: 'pointer', background: COLORS.ember, color: '#fff', borderRadius: 10, border: `1.5px solid ${COLORS.ember}`, padding: '10px 18px', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, opacity: qBusy ? 0.6 : 1 }}
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
