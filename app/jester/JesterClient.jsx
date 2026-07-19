'use client';

// Jester — the daily court-placement logic puzzle (Star Battle, one star).
//
// One board a day: seat exactly one jester in every row, every column, and
// every colored court; no two jesters may touch, not even diagonally. Every
// banked board is machine-verified to a UNIQUE solution and to fall to pure
// deduction (see scripts/verify-jester.mjs). Tap a cell to cycle blank → ✗
// (ruled out) → 🃏 (jester). The board solves itself the instant all jesters
// are seated legally.
//
// The client never receives the solution over the wire: the server page
// strips it, and this component re-derives the unique placement from the
// regions with a backtracking solver (instant at 8x8/9x9).
//
// Scoring: a solve is 10/10; the daily board ranks solvers by fewest
// placements (tap-downs of a jester), then fastest time. Revealing ends the
// day at 0. One free hint (seats one correct jester) — unregistered players
// only, per the house rule.
//
// Same daily plumbing as Circa/Suds/Alibi: banked boards gated by Eastern
// date on the server (app/jester/page.js), per-puzzle localStorage saves,
// /jester?p=N archive pinning, streaks + stats, and the shared /api/quiz/*
// board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Lightbulb, Eraser, Eye } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#7c3aed',        // Jester identity — motley violet
  accentSoft: '#ede9fe',
  accentDeep: '#5b21b6',
  green: '#15803d',
};
const REGION_FILLS = ['#fde2e2', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#fce7f3', '#e0f2fe', '#ffedd5', '#e2e8f0'];
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_jester_help_seen';
const STATS_KEY = 'sot_jester_stats';
const TOTAL = 10;

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

// ─── Solver: re-derive THE unique placement from the regions (no answer wire)
function solveBoard(n, regions) {
  const usedCol = Array(n).fill(false);
  const usedReg = Array(n).fill(false);
  const cols = [];
  const walk = (r) => {
    if (r === n) return true;
    for (let c = 0; c < n; c++) {
      if (usedCol[c] || usedReg[regions[r][c]]) continue;
      if (r > 0 && Math.abs(cols[r - 1] - c) <= 1) continue;
      usedCol[c] = true; usedReg[regions[r][c]] = true; cols.push(c);
      if (walk(r + 1)) return true;
      cols.pop(); usedCol[c] = false; usedReg[regions[r][c]] = false;
    }
    return false;
  };
  return walk(0) ? cols : null;
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

function freshCells(n) {
  return Array.from({ length: n }, () => Array(n).fill(0)); // 0 blank | 1 x | 2 jester
}
function freshState(n) {
  return {
    v: 1,
    cells: freshCells(n),
    locked: [],                 // [r,c] pairs seated by the hint (not removable)
    placements: 0,              // total jester tap-downs (daily-board tiebreak)
    hintUsed: false,
    status: 'playing',          // playing | done | lost
    t0: null,
    tEnd: null,
  };
}

// A little motley-hat mark, drawn inline so it is crisp at any cell size.
function JesterMark({ size = 22, color = COLORS.accentDeep, conflict = false }) {
  const fill = conflict ? '#b91c1c' : color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M3 15 5 6l4.2 4L12 3l2.8 7L19 6l2 9z" fill={fill} />
      <circle cx="3.4" cy="14.6" r="1.6" fill={fill} />
      <circle cx="5" cy="5.6" r="1.6" fill={fill} />
      <circle cx="12" cy="2.9" r="1.6" fill={fill} />
      <circle cx="19" cy="5.6" r="1.6" fill={fill} />
      <circle cx="20.6" cy="14.6" r="1.6" fill={fill} />
      <rect x="4" y="17" width="16" height="3.6" rx="1.4" fill={fill} />
    </svg>
  );
}

export default function JesterClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const N = PUZZLE.size;
  const STORE_KEY = `sot_jester_${PUZZLE.num}`;
  const SOLUTION = useMemo(() => solveBoard(N, PUZZLE.regions), [N, PUZZLE]);

  const [g, setG] = useState(() => freshState(N));
  const [autoX, setAutoX] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [player, setPlayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [revealArmed, setRevealArmed] = useState(false);
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
  const focusMode = playing && !showChrome;
  const won = g.status === 'done';
  const score = g.status === 'done' ? TOTAL : 0;

  // conflicts: pairs of jesters sharing a row/col/region or touching
  const { jesters, conflictSet, seated } = useMemo(() => {
    const js = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g.cells[r][c] === 2) js.push([r, c]);
    const bad = new Set();
    for (let i = 0; i < js.length; i++) for (let j = i + 1; j < js.length; j++) {
      const [r1, c1] = js[i], [r2, c2] = js[j];
      const clash = r1 === r2 || c1 === c2 ||
        PUZZLE.regions[r1][c1] === PUZZLE.regions[r2][c2] ||
        (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1);
      if (clash) { bad.add(r1 * N + c1); bad.add(r2 * N + c2); }
    }
    return { jesters: js, conflictSet: bad, seated: js.length };
  }, [g.cells, N, PUZZLE]);

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
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && saved.cells && saved.cells.length === N) setG({ ...freshState(N), ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
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
        localStorage.setItem('sot_jester_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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

  // Record an in-progress board if the player interacts then leaves before
  // finishing (Tuck's abandoned-game pattern). Loading the page does NOT
  // count; the first tap sets g.t0, which is the "started" signal. On exit we
  // post a 0-score result so every started game lands in the stats even when
  // abandoned. The localStorage marker stops a resume-then-leave-again cycle
  // from double-posting; markFlushed() in postResult suppresses the exit post
  // once the game concludes normally (solve or reveal).
  const REC_KEY = `sot_jester_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: g.placements, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.placements, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = jester placements, so the daily board's ties break by
        // the surer solver (fewest tap-downs), then by time.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.placements, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // auto-solve the instant the seating is legal and complete
  useEffect(() => {
    if (!hydrated || !playing || !SOLUTION) return;
    if (seated === N && conflictSet.size === 0) {
      setG((cur) => {
        if (cur.status !== 'playing') return cur;
        const g2 = { ...cur, status: 'done', tEnd: Date.now(), t0: cur.t0 || Date.now() };
        postResult(g2, TOTAL);
        return g2;
      });
      setEndClosed(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seated, conflictSet, hydrated, playing]);

  function isLocked(r, c) {
    return g.locked.some(([lr, lc]) => lr === r && lc === c);
  }

  function tapCell(r, c) {
    if (!playing) return;
    if (isLocked(r, c)) { say('The hint seated that jester — it stays.'); return; }
    setG((cur) => {
      const cells = cur.cells.map((row) => row.slice());
      const v = cells[r][c];
      const next = (v + 1) % 3;
      cells[r][c] = next;
      let placements = cur.placements;
      if (next === 2) {
        placements++;
        if (autoX) {
          for (let c2 = 0; c2 < N; c2++) if (c2 !== c && cells[r][c2] === 0) cells[r][c2] = 1;
          for (let r2 = 0; r2 < N; r2++) if (r2 !== r && cells[r2][c] === 0) cells[r2][c] = 1;
          for (let r2 = 0; r2 < N; r2++) for (let c2 = 0; c2 < N; c2++) {
            if (PUZZLE.regions[r2][c2] === PUZZLE.regions[r][c] && (r2 !== r || c2 !== c) && cells[r2][c2] === 0) cells[r2][c2] = 1;
          }
          for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
            const r2 = r + dr, c2 = c + dc;
            if ((dr || dc) && r2 >= 0 && r2 < N && c2 >= 0 && c2 < N && cells[r2][c2] === 0) cells[r2][c2] = 1;
          }
        }
      }
      return { ...cur, cells, placements, t0: cur.t0 || Date.now() };
    });
  }

  function clearBoard() {
    if (!playing) return;
    setG((cur) => {
      const cells = freshCells(N);
      for (const [r, c] of cur.locked) cells[r][c] = 2;
      return { ...cur, cells };
    });
  }

  // one free hint: seat one correct jester (unregistered players only)
  function useHint() {
    if (!playing || g.hintUsed || !SOLUTION) return;
    setG((cur) => {
      // prefer a row whose correct cell is not already seated
      let target = null;
      for (let r = 0; r < N; r++) {
        if (cur.cells[r][SOLUTION[r]] !== 2) { target = [r, SOLUTION[r]]; break; }
      }
      if (!target) return { ...cur, hintUsed: true };
      const [r, c] = target;
      const cells = cur.cells.map((row) => row.slice());
      // clear any misplaced jester in that row first
      for (let c2 = 0; c2 < N; c2++) if (cells[r][c2] === 2) cells[r][c2] = 0;
      cells[r][c] = 2;
      return { ...cur, cells, locked: [...cur.locked, [r, c]], hintUsed: true, placements: cur.placements + 1, t0: cur.t0 || Date.now() };
    });
    say('One jester seated for you.');
  }

  function reveal() {
    if (!playing || !SOLUTION) return;
    if (!revealArmed) { setRevealArmed(true); setTimeout(() => setRevealArmed(false), 3500); return; }
    setRevealArmed(false);
    setG((cur) => {
      const cells = freshCells(N);
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) cells[r][c] = SOLUTION[r] === c ? 2 : 1;
      }
      const g2 = { ...cur, cells, status: 'lost', tEnd: Date.now(), t0: cur.t0 || Date.now() };
      postResult(g2, 0);
      return g2;
    });
    setEndClosed(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(N)); setEndClosed(false);
  }

  const cellPx = N === 9 ? 42 : 46;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="je-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.je-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .je-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .je-btn:hover{background:${COLORS.paper};}
          .je-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;}
          .je-btn.primary:hover{background:${COLORS.accentDeep};}
          .je-cell{position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;}
          .je-cell:hover::after{content:'';position:absolute;inset:0;background:rgba(28,30,36,0.07);}
          .je-x{color:rgba(28,30,36,0.45);font-size:15px;font-weight:800;}
          @media(max-width:560px){.je-board-scroll{overflow-x:auto;padding-bottom:6px;}}
        `}</style>

        <div style={{ maxWidth: 940, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 14, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {'JESTERS'.split('').map((ch, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 23, background: i === 0 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>Court No. {PUZZLE.num}</h1>
            <span style={{ color: COLORS.faded }}>&middot;</span>
            <span style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>The Sunday Jubilee &middot; 9&times;9</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 8, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* status bar */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
          <span>seated <b style={{ color: COLORS.ink, fontWeight: 500 }}>{seated}</b>/{N}</span>
          <span>quarrels <b style={{ color: conflictSet.size ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{conflictSet.size ? conflictSet.size : 0}</b></span>
          {g.hintUsed && <span>&#128161; hint used</span>}
          {playing && (
            <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: SANS, fontSize: 12, fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
              <input type="checkbox" checked={autoX} onChange={(e) => setAutoX(e.target.checked)} style={{ accentColor: COLORS.accent }} />
              auto-✗ when you seat a jester
            </label>
          )}
        </div>

        {/* the board */}
        <div className="je-board-scroll">
          <div style={{ display: 'inline-block', border: '3px solid #1c1e24', borderRadius: 10, overflow: 'hidden', background: '#1c1e24', boxShadow: '0 2px 10px rgba(20,22,28,0.12)' }}>
            {PUZZLE.regions.map((row, r) => (
              <div key={r} style={{ display: 'flex' }}>
                {row.map((id, c) => {
                  const v = g.cells[r][c];
                  const conflict = v === 2 && conflictSet.has(r * N + c);
                  const locked = isLocked(r, c);
                  const bTop = r > 0 && PUZZLE.regions[r - 1][c] !== id ? '2px solid #1c1e24' : r > 0 ? '1px solid rgba(28,30,36,0.18)' : 'none';
                  const bLeft = c > 0 && PUZZLE.regions[r][c - 1] !== id ? '2px solid #1c1e24' : c > 0 ? '1px solid rgba(28,30,36,0.18)' : 'none';
                  return (
                    <div
                      key={c}
                      className="je-cell"
                      onClick={() => tapCell(r, c)}
                      role="button"
                      aria-label={`Row ${r + 1}, column ${c + 1}: ${v === 0 ? 'blank' : v === 1 ? 'ruled out' : 'jester'}${conflict ? ', quarrelling' : ''}`}
                      style={{ width: cellPx, height: cellPx, background: conflict ? '#fecaca' : REGION_FILLS[id % REGION_FILLS.length], borderTop: bTop, borderLeft: bLeft, boxShadow: locked ? `inset 0 0 0 2px ${COLORS.accent}` : 'none' }}
                    >
                      {v === 1 && <span className="je-x">✗</span>}
                      {v === 2 && <JesterMark size={Math.round(cellPx * 0.6)} conflict={conflict} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {playing && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0 6px' }}>
            <button type="button" className="je-btn" onClick={clearBoard}><Eraser size={14} /> Clear board</button>
            {!identity && !g.hintUsed && (
              <button type="button" className="je-btn" onClick={useHint} title="Seat one correct jester (one hint per day)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(124,58,237,0.5)', color: COLORS.accentDeep }}>
                <Lightbulb size={14} /> Hint: seat one jester
              </button>
            )}
            <button type="button" className="je-btn" onClick={reveal} style={{ borderColor: revealArmed ? COLORS.rust : '#c3c8cf', color: revealArmed ? COLORS.rust : COLORS.faded }}>
              <Eye size={14} /> {revealArmed ? 'Tap again to reveal (ends the day)' : 'Reveal'}
            </button>
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '12px 0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {won
                    ? <>The whole court is seated &mdash; {g.placements} placement{g.placements === 1 ? '' : 's'}, {elapsed}.{g.hintUsed ? ' (1 hint)' : ''}</>
                    : 'The court dissolved in quarrels — the seating was revealed.'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>A new court convenes in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new court convenes at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/jester?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        replay yesterday&rsquo;s court &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/jester" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s court &rarr;</a>
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
            self="jester"
            maxWidth={640}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share This Puzzle', onClick: copyShare }}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Jesters to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s court, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s court, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div style={{ margin: '18px auto 0', maxWidth: 640 }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}

        {/* your stats — sits directly above the leaderboard */}
        {!focusMode && identity && (
        <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'Solved' },
              { n: myStats.max, l: 'Best Streak' },
            ].map((st, i) => (
              <div key={i} style={{ flex: '1 1 0', minWidth: 54, background: '#fff', border: '1px solid rgba(28,30,36,0.12)', borderRadius: 7, padding: '6px 5px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{st.n}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.faded, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{st.l}</div>
              </div>
            ))}
          </div>
        </div>
        )}
        <div id="daily-leaderboard" style={{ display: focusMode ? 'none' : 'block', maxWidth: 640, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <DailyCombinedLeaderboard todayKey="jester" identity={identity} quizId={PUZZLE.quizId} />
        </div>
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="jester"
          won={won}
          headline={won ? <>The court is seated</> : <>The court dissolved</>}
          subline={<>Jesters #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.placements} placement{g.placements === 1 ? '' : 's'} &middot; {elapsed}</>}
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
            <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 9px' }}>Seat exactly <b>one jester</b> in every row, every column, and every colored court.</p>
              <p style={{ margin: '0 0 9px' }}>Jesters are jealous: <b>no two may touch</b>, not even diagonally. Quarrelling jesters glow red.</p>
              <p style={{ margin: '0 0 9px' }}>Tap a cell to cycle: blank &rarr; <b>✗</b> (ruled out) &rarr; <b>jester</b>. Leave auto-✗ on and seating a jester pencils out its row, column, court and neighbours for you.</p>
              <p style={{ margin: 0 }}>Every board has exactly one legal seating, reachable by pure deduction &mdash; no guessing needed. The board completes itself the moment the last jester is seated legally. Ties on the daily board break by fewest placements, then fastest time. A bigger 9&times;9 Jubilee board runs on Sundays.</p>
            </div>
            <button className="je-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Jester — crawlable prose for search, server-rendered */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Jesters</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Jesters is a free daily logic puzzle from Source of Truths &mdash; a one-per-row, one-per-column, one-per-region placement game in the classic Star Battle family. The royal court is divided into colored regions, and your job is to seat one jester in each: every row, every column and every court gets exactly one, and no two jesters may ever touch, not even at the corners.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every board is generated with a constraint solver and machine-verified twice over: once to guarantee exactly one legal seating, and once to confirm the whole board falls to pure step-by-step deduction &mdash; rule out cells, corner the possibilities, and the jesters seat themselves. No guessing, no trial and error, no app required.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new court convenes every day at midnight Eastern, with a bigger 9&times;9 Jubilee board on Sundays. Play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/sworn" style={{ color: COLORS.ink, fontWeight: 800 }}>Sworn</a>, our daily liars puzzle, <a href="/alibi" style={{ color: COLORS.ink, fontWeight: 800 }}>Alibi</a>, our nightly whodunit, and <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 && g.status !== 'playing' ? ` · streak ${myStats.cur}` : '';
    const solvedBit = g.status === 'done'
      ? `\u{1F0CF} Seated the court in ${elapsed} · ${g.placements} placements${hintBit}`
      : g.status === 'lost' ? '\u{1F0CF} The court dissolved' : '\u{1F0CF} Still seating the court…';
    const text = playing
      ? `Jesters #${PUZZLE.num} — the daily court-placement puzzle from Source of Truths.\nsourceoftruths.com/jester${isTodays ? '' : `?p=${PUZZLE.num}`}`
      : `Jesters — Court #${PUZZLE.num}\n${solvedBit}${streakBit}\nsourceoftruths.com/jester${isTodays ? '' : `?p=${PUZZLE.num}`}`;
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
