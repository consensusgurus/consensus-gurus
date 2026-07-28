'use client';

// Sworn — the daily liars puzzle (a Knights-and-Knaves whodunit).
//
// One inquest a day: a handful of locals are sworn in, each gives exactly one
// statement, and you are told exactly how many of them are lying. Liars'
// statements are false, truth-tellers' are true, and exactly one suspect is
// the thief. Every banked case is machine-verified to a unique
// (thief, liar-set) world AND to fall to pure propagation — no guessing
// (see scripts/verify-sworn.mjs). Mark your scratch verdicts, then accuse.
//
// The client never receives the solution over the wire: the server page
// strips it, and this component re-derives the unique world by brute force
// over every thief x liar-subset (tiny at 5-6 suspects).
//
// Scoring: name the thief for max(1, 12 - 2×wrong accusations) out of 12 — a
// first-try accusation is a perfect 12. Ties on the daily board break by
// fewest wrong accusations, then fastest time. Revealing ends the day at 0.
// One free hint (verifies one witness) — unregistered players only.
//
// Same daily plumbing as Alibi/Circa/Suds: banked cases gated by Eastern date
// on the server (app/sworn/page.js), per-puzzle localStorage saves, /sworn?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Lightbulb, Scale, Eraser } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#be185d',        // Sworn identity — courtroom berry
  accentSoft: '#fce7f3',
  accentDeep: '#9d174d',
  green: '#15803d',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_sworn_help_seen';
const STATS_KEY = 'sot_sworn_stats';
const TOTAL = 12;

const isIosDevice = () =>
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function pickPuzzle(puzzles, forceNum) {
  if (forceNum) { const p = puzzles.find((x) => x.num === forceNum); if (p) return p; }
  const today = etToday();
  const open = puzzles.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : puzzles[0];
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function msToMidnightET() {
  try {
    const now = new Date();
    const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const next = new Date(et);
    next.setHours(24, 0, 0, 0);
    return next - et;
  } catch (e) {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next - now;
  }
}
function fmtCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
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
  } catch (e) { return null; }
}
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

// ─── Solver: re-derive THE unique world from the testimony (no answer wire) ─
function stmtTruth(st, speaker, thief, liarMask) {
  const isLiar = (i) => (liarMask >> i) & 1;
  switch (st.type) {
    case 'accuse': return thief === st.x;
    case 'innocent': return thief !== st.x;
    case 'selfInnocent': return thief !== speaker;
    case 'liar': return !!isLiar(st.x);
    case 'honest': return !isLiar(st.x);
    case 'thiefLiar': return !!isLiar(thief);
    case 'thiefHonest': return !isLiar(thief);
  }
  return false;
}
function solveCase(n, k, statements) {
  for (let thief = 0; thief < n; thief++) {
    for (let mask = 0; mask < (1 << n); mask++) {
      let bits = 0;
      for (let i = 0; i < n; i++) bits += (mask >> i) & 1;
      if (bits !== k) continue;
      let ok = true;
      for (let s = 0; s < n && ok; s++) {
        if (stmtTruth(statements[s], s, thief, mask) === !!((mask >> s) & 1)) ok = false;
      }
      if (ok) return { thief, mask }; // banked cases are verified unique
    }
  }
  return null;
}

// ─── Personal stats + streak (localStorage), Circa/Suds pattern ─────────────
function getStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s && s.v === 1 && s.rec) return s;
  } catch (e) {}
  return { v: 1, rec: {} };
}
function recordStat(num, entry) {
  const s = getStats();
  if (s.rec[num]) return s;
  const s2 = { ...s, rec: { ...s.rec, [num]: entry } };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}
function deriveStats(s, todayNum) {
  const rec = s && s.rec ? s.rec : {};
  const nums = Object.keys(rec).map(Number).sort((a, b) => a - b);
  const played = nums.length;
  const perfect = nums.filter((n) => rec[n].won).length;
  let max = 0, run = 0, prev = null;
  for (const n of nums) {
    run = prev != null && n === prev + 1 ? run + 1 : 1;
    if (run > max) max = run;
    prev = n;
  }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played, perfect, cur, max };
}
function mergeServerStats(s, recent, puzzles) {
  if (!s || !Array.isArray(recent) || !recent.length) return s;
  const byQuiz = {};
  for (const p of puzzles) byQuiz[p.quizId] = p;
  let rec = s.rec, changed = false;
  for (const m of recent) {
    const p = m && byQuiz[m.quizId];
    if (!p || m.attempt !== 1) continue;
    if (rec[p.num]) continue;
    const sc = Math.max(0, Math.min(TOTAL, Math.round(((m.scorePct || 0) / 100) * TOTAL)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: TOTAL, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState(n) {
  return {
    v: 1,
    marks: Array(n).fill(0),    // scratch verdicts: 0 unknown | 1 truthful | 2 lying
    accusedWrong: [],           // suspect indexes already accused wrongly
    verified: null,             // hint: { x, honest } — one witness verified
    hintUsed: false,
    status: 'playing',          // playing | done | lost
    wrong: 0,                   // wrong accusations
    t0: null,
    tEnd: null,
  };
}

export default function SwornClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const N = PUZZLE.suspects.length;
  const STORE_KEY = `sot_sworn_${PUZZLE.num}`;
  const SOLUTION = useMemo(() => solveCase(N, PUZZLE.k, PUZZLE.statements), [N, PUZZLE]);

  const [g, setG] = useState(() => freshState(N));
  const [verdict, setVerdict] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false); // start tile: full rules (first-timer) vs compact start card
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [installEvt, setInstallEvt] = useState(null);
  const [showA2hsHelp, setShowA2hsHelp] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [mobileUi, setMobileUi] = useState(false);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);

  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;   // not begun: show the start tile where the board goes
  const started = playing && !!g.t0;    // clock running: show the board
  const focusMode = playing && !showChrome;
  const won = g.status === 'done' && g.wrong === 0;
  const score = g.status === 'done' ? Math.max(1, TOTAL - 2 * g.wrong) : 0;
  const liarsMarked = g.marks.filter((m) => m === 2).length;

  useEffect(() => {
    try {
      setStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
      setMobileUi(isMobileDevice());
    } catch {}
    const onBip = (e) => { e.preventDefault(); setInstallEvt(e); };
    const onInstalled = () => { setStandalone(true); setInstallEvt(null); };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBip); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  const a2hsClick = () => { const e = installEvt; if (e) { setInstallEvt(null); e.prompt(); } else { setShowA2hsHelp(true); } };

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      let restored = null;
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && saved.marks && saved.marks.length === N) { restored = saved; setG({ ...freshState(N), ...saved }); }
      }
      // The start tile shows in place of the board until the player begins (t0 set
      // on Start). First-timers see the full rules on the tile; a returning player
      // gets the compact start card with a "Show instructions" toggle.
      setGateRules(!localStorage.getItem(HELP_KEY));
    } catch (e) {}
    try { setStats(getStats()); } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_sworn_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_sworn_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  useEffect(() => {
    if (g.status === 'playing') return;
    const tick = () => setCountdown(fmtCountdown(msToMidnightET()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [g.status]);

  // ---- metrics + leaderboard (same /api/quiz/* flow as every other board) ----
  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    try {
      const anon = getAnonId();
      let em = '';
      try {
        const idj = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
        if (idj && idj.email) em = `&email=${encodeURIComponent(idj.email)}`;
      } catch (e) {}
      if (anon || em) {
        fetch(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}`)
          .then((r) => r.json())
          .then((d) => {
            if (d && Array.isArray(d.recent)) {
              setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles));
            }
            if (d && d.found && d.name) setPlayer({ name: d.name, rank: (d.ranks && d.ranks.xp) || d.rank || null, key: d.userKey || null });
          })
          .catch(() => {});
      }
    } catch (e) {}
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
      .catch(() => {});
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  // Record an in-progress inquest if the player interacts then leaves before
  // accusing (Tuck's abandoned-game pattern). Loading the page does NOT count;
  // the first mark/accusation sets g.t0, which is the "started" signal. On
  // exit we post a 0-score result so every started game lands in the stats
  // even when abandoned. The localStorage marker stops a resume-then-leave-
  // again cycle from double-posting; markFlushed() in postResult suppresses
  // the exit post once the game concludes normally (accusation or reveal).
  const REC_KEY = `sot_sworn_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    // A play counts only once the player actually acts (a mark, wrong accusation,
    // hint, or clear). Merely opening the puzzle and dismissing the start gate does
    // not log a 0-score attempt.
    const acted = g.marks.some((m) => m > 0) || g.wrong > 0 || g.hintUsed || g.accusedWrong.length > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: g.wrong, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.wrong, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = wrong accusations, so the daily board's ties break by
        // the surer juror.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.wrong, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // Closing the start gate begins the clock (sets t0) and marks the rules as seen.
  // A no-op once started, so re-reading the rules later never resets the timer.
  function startInquest() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function tapMark(i) {
    if (!playing) return;
    setG((cur) => {
      const marks = cur.marks.slice();
      marks[i] = (marks[i] + 1) % 3;
      return { ...cur, marks, t0: cur.t0 || Date.now() };
    });
    setVerdict(null);
  }
  function clearMarks() {
    if (!playing) return;
    setG((cur) => ({ ...cur, marks: Array(N).fill(0) }));
    setVerdict(null);
  }

  function accuse(i) {
    if (!playing || !SOLUTION) return;
    if (g.accusedWrong.includes(i)) { say(`${PUZZLE.suspects[i]} already beat that charge.`); return; }
    if (i === SOLUTION.thief) {
      const g2 = { ...g, status: 'done', tEnd: Date.now(), t0: g.t0 || Date.now() };
      setG(g2);
      setVerdict(null);
      setEndClosed(false);
      postResult(g2, Math.max(1, TOTAL - 2 * g2.wrong));
    } else {
      setG((cur) => ({ ...cur, wrong: cur.wrong + 1, accusedWrong: [...cur.accusedWrong, i], t0: cur.t0 || Date.now() }));
      setVerdict({ msg: `${PUZZLE.suspects[i]} has an ironclad defence — the charge fails. (−2)` });
    }
  }

  // one free hint: verify one witness (unregistered players only). Picks a
  // non-thief so the accusation itself is never handed over.
  function useHint() {
    if (!playing || g.hintUsed || !SOLUTION) return;
    setG((cur) => {
      let x = -1;
      for (let i = 0; i < N; i++) {
        if (i !== SOLUTION.thief && !cur.accusedWrong.includes(i)) { x = i; break; }
      }
      if (x === -1) return { ...cur, hintUsed: true };
      const honest = !((SOLUTION.mask >> x) & 1);
      const marks = cur.marks.slice();
      marks[x] = honest ? 1 : 2;
      return { ...cur, marks, verified: { x, honest }, hintUsed: true, t0: cur.t0 || Date.now() };
    });
  }

  function reveal() {
    if (!playing || !SOLUTION) return;
    setG((cur) => {
      const marks = cur.marks.slice();
      for (let i = 0; i < N; i++) marks[i] = (SOLUTION.mask >> i) & 1 ? 2 : 1;
      const g2 = { ...cur, marks, status: 'lost', tEnd: Date.now(), t0: cur.t0 || Date.now() };
      postResult(g2, 0);
      return g2;
    });
    setVerdict(null);
    setEndClosed(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(N)); setVerdict(null); setEndClosed(false);
  }

  function stmtText(st, s) {
    const S = PUZZLE.suspects;
    switch (st.type) {
      case 'accuse': return <>&ldquo;<b>{S[st.x]}</b> is the thief.&rdquo;</>;
      case 'innocent': return <>&ldquo;<b>{S[st.x]}</b> is innocent.&rdquo;</>;
      case 'selfInnocent': return <>&ldquo;I am not the thief.&rdquo;</>;
      case 'liar': return <>&ldquo;<b>{S[st.x]}</b> is lying.&rdquo;</>;
      case 'honest': return <>&ldquo;<b>{S[st.x]}</b> is telling the truth.&rdquo;</>;
      case 'thiefLiar': return <>&ldquo;The thief is lying.&rdquo;</>;
      case 'thiefHonest': return <>&ldquo;The thief is telling the truth.&rdquo;</>;
    }
    return null;
  }

  const thiefName = SOLUTION ? PUZZLE.suspects[SOLUTION.thief] : '';

  // Shared rules body — rendered in both the how-to-play modal and the start gate.
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>One of the sworn is the <b>thief</b>. Each gives one statement, and you&rsquo;re told <b>exactly how many are lying</b>. Liars&rsquo; statements are false; truth-tellers&rsquo; are true.</p>
      <p style={{ margin: '0 0 9px' }}>Test each theory: assume a suspect is the thief and see whether the lie count works out. Tap the <b>?</b> next to a name to keep scratch verdicts (truthful ✓ / lying ✗) as you go.</p>
      <p style={{ margin: '0 0 9px' }}>When you&rsquo;re sure, hit <b>Accuse</b>. A first-try accusation is a perfect 12 &mdash; each wrong accusation costs 2.</p>
      <p style={{ margin: 0 }}>Every case has exactly one consistent story, reachable by pure logic. Ties on the daily board break by fewest wrong accusations, then fastest time. Six are sworn for Sunday&rsquo;s Grand Inquest.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="sw-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.sw-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .sw-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .sw-btn:hover{background:${COLORS.paper};}
          .sw-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;}
          .sw-btn.primary:hover{background:${COLORS.accentDeep};}
          .sw-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid rgba(28,30,36,0.14);border-left:3px solid ${COLORS.accent};border-radius:9px;padding:10px 12px;margin-bottom:8px;}
          .sw-card b{color:${COLORS.accentDeep};}
          .sw-mark{flex:0 0 auto;width:38px;height:38px;border-radius:8px;border:1.5px solid rgba(28,30,36,0.25);background:#fff;font-size:17px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;user-select:none;}
          .sw-mark.truth{background:#dcfce7;border-color:#15803d;color:#15803d;}
          .sw-mark.lie{background:#fee2e2;border-color:#b91c1c;color:#b91c1c;}
          .sw-accuse{flex:0 0 auto;font-family:${SANS};font-weight:800;font-size:12px;border:1.5px solid rgba(190,24,93,0.55);background:${COLORS.accentSoft};color:${COLORS.accentDeep};border-radius:8px;padding:8px 11px;cursor:pointer;}
          .sw-accuse:hover{background:#fbcfe8;}
          .sw-accuse:disabled{opacity:0.4;cursor:not-allowed;text-decoration:line-through;}
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead */}
        <DailyMasthead
          slug="sworn"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={4}
          helpTop={8}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Grand Inquest</span>}
          blocks={'SWORN'.split('').map((ch, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 23, background: i === 0 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {/* the story — hidden behind the start tile until the player begins */}
        {!preStart && (
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.6, background: '#fff', border: '1px solid rgba(28,30,36,0.14)', borderLeft: `4px solid ${COLORS.accent}`, borderRadius: 8, padding: '12px 16px', margin: '0 0 12px', color: COLORS.ink }}>
          Last night at {PUZZLE.venue}, {PUZZLE.stolen} vanished. {N === 6 ? 'Six' : 'Five'} locals were sworn in, and one of them is the thief. Each gave exactly one statement &mdash; but <b style={{ fontStyle: 'normal' }}>exactly {PUZZLE.k} of the {N} are lying</b>. Liars&rsquo; statements are false; everyone else&rsquo;s are true. Find the thief.
        </div>
        )}

        {/* status bar */}
        {started && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
          <span>liars <b style={{ color: COLORS.ink, fontWeight: 500 }}>{PUZZLE.k}</b> of {N}</span>
          <span>marked lying <b style={{ color: liarsMarked > PUZZLE.k ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{liarsMarked}</b></span>
          <span>wrong accusations <b style={{ color: g.wrong ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{g.wrong}</b></span>
          {g.hintUsed && <span>&#128161; hint used</span>}
        </div>
        )}

        {/* start tile — sits where the board goes; the testimony stays sealed
            (not rendered) until the player presses Start, which begins the clock. */}
        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px 22px', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'The court is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>{N === 6 ? 'Six' : 'Five'} locals are under oath, and one of them is the thief. Their testimony stays sealed until you begin.</p>
              </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: 18 }}>
              <button className="sw-btn" onClick={startInquest} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start the inquest</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* the testimony */}
        {!preStart && (
        <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 8 }}>The testimony</div>
        )}
        {!preStart && PUZZLE.suspects.map((name, i) => {
          const m = g.marks[i];
          const isVerified = g.verified && g.verified.x === i;
          return (
            <div key={name} className="sw-card">
              <button
                type="button"
                className={`sw-mark${m === 1 ? ' truth' : m === 2 ? ' lie' : ''}`}
                onClick={() => tapMark(i)}
                title="Your scratch verdict: blank → truthful → lying"
                aria-label={`${name}: ${m === 0 ? 'unmarked' : m === 1 ? 'marked truthful' : 'marked lying'}`}
              >{m === 1 ? '✓' : m === 2 ? '✗' : '?'}</button>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: COLORS.ink, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  {name}
                  {isVerified && (
                    <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, color: g.verified.honest ? COLORS.green : '#b91c1c', background: g.verified.honest ? '#dcfce7' : '#fee2e2', borderRadius: 4, padding: '2px 6px' }}>
                      verified {g.verified.honest ? 'truthful' : 'lying'}
                    </span>
                  )}
                  {g.accusedWrong.includes(i) && (
                    <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, color: COLORS.faded, background: COLORS.paper, borderRadius: 4, padding: '2px 6px' }}>cleared</span>
                  )}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.45, marginTop: 2 }}>{stmtText(PUZZLE.statements[i], i)}</div>
              </div>
              {playing && (
                <button type="button" className="sw-accuse" onClick={() => accuse(i)} disabled={g.accusedWrong.includes(i)}>
                  Accuse
                </button>
              )}
            </div>
          );
        })}

        {verdict && (
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.rust, margin: '4px 0 10px', lineHeight: 1.45 }}>
            {verdict.msg}
          </div>
        )}
        {started && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 6px' }}>
            <button type="button" className="sw-btn" onClick={clearMarks}><Eraser size={14} /> Clear marks</button>
            {!identity && !g.hintUsed && (
              <button type="button" className="sw-btn" onClick={useHint} title="Verify one witness (one hint per day)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(190,24,93,0.5)', color: COLORS.accentDeep }}>
                <Lightbulb size={14} /> Hint: verify a witness
              </button>
            )}
            {g.wrong >= 3 && (
              <button type="button" className="sw-btn" style={{ borderColor: '#c3c8cf', color: COLORS.faded }} onClick={reveal}>Reveal (ends the day)</button>
            )}
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '8px 0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : g.status === 'done' ? COLORS.ink : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {g.status === 'done'
                    ? (won ? <>It was <b>{thiefName}</b> — nailed on the first accusation.</> : <>It was <b>{thiefName}</b> — found after {g.wrong} wrong accusation{g.wrong === 1 ? '' : 's'}.</>)
                    : <>The inquest collapsed — it was <b>{thiefName}</b> all along.</>}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}{g.hintUsed ? ' · 1 hint' : ''}</span>
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>A new inquest is sworn in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new inquest is sworn at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/sworn?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        reopen yesterday&rsquo;s inquest &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/sworn" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s inquest &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0', maxWidth: 640 }}>
          <DailyGamesGrid
            self="sworn"
            maxWidth={640}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="sworn" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider
          />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Sworn to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s inquest, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s inquest, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div id="daily-join" style={{ margin: '18px auto 0', maxWidth: 640 }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}

        {/* Personal stats wiring (myStats) is retained for the share string and
            streak logic; the on-page "Your stats" tile row is no longer shown.
            The daily leaderboard now renders in DailyGamesGrid's boardSlot,
            directly under the Challenge / Share actions (owner, 2026-07-23). */}
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="sworn"
          won={won}
          headline={g.status === 'done' ? <>The thief is named</> : <>The inquest collapsed</>}
          subline={<>Sworn #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.wrong} wrong accusation{g.wrong === 1 ? '' : 's'} &middot; {elapsed}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* help modal */}
      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button className="sw-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Sworn — crawlable prose for search, server-rendered */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Sworn</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Sworn is a free daily logic puzzle from Source of Truths &mdash; a classic liars puzzle in the Knights-and-Knaves tradition, dressed as a village inquest. Something has been stolen, a handful of locals are put under oath, and every one of them gives a single statement. The catch: an exact number of them are lying, liars&rsquo; statements are always false, and one of the sworn is the thief.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The reasoning is pure case-work: suppose a suspect is the thief, follow what each statement would make of its speaker, and check the lie count. Wrong theories collapse under their own contradictions; the truth is the one story that holds together. Every case is generated with a constraint solver and machine-verified to have exactly one consistent world &mdash; and to be crackable by clean deduction, never guesswork.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new inquest is sworn every day at midnight Eastern, with six suspects at Sunday&rsquo;s Grand Inquest. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/alibi" style={{ color: COLORS.ink, fontWeight: 800 }}>Alibi</a>, our nightly whodunit, <a href="/jester" style={{ color: COLORS.ink, fontWeight: 800 }}>Jester</a>, our court-placement puzzle, and <a href="/cipher" style={{ color: COLORS.ink, fontWeight: 800 }}>Cipher</a>, our daily cryptarithm.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 && g.status !== 'playing' ? ` · streak ${myStats.cur}` : '';
    const solvedBit = g.status === 'done'
      ? `⚖️ Named the thief in ${elapsed} · ${g.wrong} wrong accusation${g.wrong === 1 ? '' : 's'}${hintBit}`
      : g.status === 'lost' ? '⚖️ The inquest collapsed' : '⚖️ Still weighing the testimony…';
    const text = playing
      ? `Sworn #${PUZZLE.num} — the daily liars puzzle from Source of Truths.\n${withRef(`sourceoftruths.com/sworn${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`
      : `Sworn — Inquest #${PUZZLE.num}\n${solvedBit}${streakBit}\n${withRef(`sourceoftruths.com/sworn${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`;
    if (notifyShareCredit(text)) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
    } catch (e) {}
    try {
      navigator.clipboard?.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } catch (e) {}
  }
}
