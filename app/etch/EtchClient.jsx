'use client';

// Etch — the daily nonogram (picture logic).
//
// Each day: a grid whose row and column clues give the run lengths of filled
// squares, in order, separated by at least one gap. Fill every square the clues
// force and a picture appears. There is exactly one solution, and every board is
// reachable by pure line logic — no guessing is ever required.
//
// Filling a square that isn't part of the picture counts as an error and glows
// red until you clear it. Score is 10 minus half your errors, floor 1, so a
// clean solve is a perfect 10 and ties break on fewest errors then fastest time.
// Marks (×) are free: they're your own "definitely blank" notes.
//
// Same daily plumbing as Suds/Tally: banked boards gated by Eastern date on the
// server (app/etch/page.js), per-puzzle localStorage saves, /etch?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Weekdays are
// 10×10; Sundays step up to a 15×15 Edition.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, RotateCcw, X, Lightbulb, Eye, Smartphone, Square, Ban } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import DailyMasthead from '../DailyMasthead';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#4d7c0f',       // Etch identity — moss
  accentSoft: '#f3f8e8',
  green: '#15803d',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_etch_help_seen';
const STATS_KEY = 'sot_etch_stats';
const TOOL_KEY = 'sot_etch_tool';   // remembered tool: 'fill' | 'mark'

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

// ─── Personal stats + streak (localStorage), Suds/Tally pattern ─────────────
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
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 10, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

// cells: 0 = untouched, 1 = filled, 2 = marked blank (×, free, never scored)
function freshState(n) {
  return { v: 1, cells: Array(n).fill(0), errors: 0, hintUsed: false, status: 'playing', t0: null, tEnd: null };
}

// run lengths of a line of cell states (only 1 counts as filled)
function runsOf(vals) {
  const out = []; let c = 0;
  for (const v of vals) { if (v === 1) c++; else if (c) { out.push(c); c = 0; } }
  if (c) out.push(c);
  return out.length ? out : [0];
}
const sameRuns = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

export default function EtchClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const W = PUZZLE.w, H = PUZZLE.h, N = W * H;
  const STORE_KEY = `sot_etch_${PUZZLE.num}`;
  const SOL = useMemo(() => {
    const f = Array(N).fill(0);
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) f[r * W + c] = PUZZLE.sol[r][c] === '#' ? 1 : 0;
    return f;
  }, [PUZZLE, N, W, H]);
  const TOTAL = useMemo(() => SOL.reduce((a, b) => a + b, 0), [SOL]);
  const maxRowClue = useMemo(() => Math.max(...PUZZLE.rows.map((r) => r.length)), [PUZZLE]);
  const maxColClue = useMemo(() => Math.max(...PUZZLE.cols.map((c) => c.length)), [PUZZLE]);
  const gridCols = maxRowClue + W, gridRows = maxColClue + H;

  const [g, setG] = useState(() => freshState(N));
  const gRef = useRef(g);
  // Defaults to Mark (×) — most solving is ruling squares out, and a wrong fill
  // costs an error, so the safe default is the free mark. Remembers the last
  // choice across days; right-click a square to fill it directly in either mode.
  const [mode, setMode] = useState('mark');   // 'fill' | 'mark'
  const [canUndo, setCanUndo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  const [justWon, setJustWon] = useState(false);
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
  const [showChrome, setShowChrome] = useState(false);
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);
  const undoRef = useRef([]);
  const paintRef = useRef(null);

  const cells = g.cells;
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const errors = g.errors;
  const finalScore = won ? Math.max(1, Math.min(10, 10 - Math.ceil(errors / 2))) : 0;

  useEffect(() => { gRef.current = g; }, [g]);
  useEffect(() => {
    if (!armReveal) return undefined;
    const t = setTimeout(() => setArmReveal(false), 3500);
    return () => clearTimeout(t);
  }, [armReveal]);
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
        if (saved && saved.v === 1 && Array.isArray(saved.cells) && saved.cells.length === N) {
          const next = { ...freshState(N), ...saved };
          gRef.current = next;
          setG(next);
        }
      }
      setGateRules(!localStorage.getItem(HELP_KEY));
      const t = localStorage.getItem(TOOL_KEY);
      if (t === 'fill' || t === 'mark') setMode(t);
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
        const done = g.status !== 'playing';
        if (done || g.t0) localStorage.setItem('sot_etch_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_etch_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // remember the player's tool across days
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(TOOL_KEY, mode); } catch (e) {}
  }, [mode, hydrated]);

  useEffect(() => {
    if (g.status === 'playing') return;
    const tick = () => setCountdown(fmtCountdown(msToMidnightET()));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [g.status]);

  // ---- metrics + leaderboard (shared /api/quiz/* flow) ----
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
            if (d && Array.isArray(d.recent)) setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles));
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

  const filledRight = useMemo(() => {
    let k = 0;
    for (let i = 0; i < N; i++) if (SOL[i] === 1 && cells[i] === 1) k++;
    return k;
  }, [cells, SOL, N]);

  // per-line completion, for dimming a satisfied clue
  const rowDone = useMemo(() => PUZZLE.rows.map((clue, r) =>
    sameRuns(runsOf(cells.slice(r * W, r * W + W)), clue)), [cells, PUZZLE, W]);
  const colDone = useMemo(() => PUZZLE.cols.map((clue, c) => {
    const col = [];
    for (let r = 0; r < H; r++) col.push(cells[r * W + c]);
    return sameRuns(runsOf(col), clue);
  }), [cells, PUZZLE, W, H]);

  function isSolved(cs) {
    for (let i = 0; i < N; i++) {
      if (SOL[i] === 1 && cs[i] !== 1) return false;
      if (SOL[i] === 0 && cs[i] === 1) return false;
    }
    return true;
  }

  const REC_KEY = `sot_etch_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    const acted = cur.cells.some((v) => v) || cur.errors > 0 || cur.hintUsed;
    if (!acted || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.errors, won: g2.status === 'won' && g2.errors === 0 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.errors, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function commit(next) { gRef.current = next; setG(next); }

  function startGame() {
    const cur = gRef.current;
    if (cur.t0) return;
    commit({ ...cur, t0: Date.now() });
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function pushUndo(cs) {
    undoRef.current = [...undoRef.current.slice(-59), cs.slice()];
    if (!canUndo) setCanUndo(true);
  }
  function undo() {
    const st = undoRef.current;
    if (!st.length || gRef.current.status !== 'playing') return;
    const prev = st[st.length - 1];
    undoRef.current = st.slice(0, -1);
    setCanUndo(undoRef.current.length > 0);
    commit({ ...gRef.current, cells: prev.slice() });
  }

  // core write. `val` is the target state for the square (0/1/2).
  function applyPaint(idx, val) {
    const cur = gRef.current;
    if (cur.status !== 'playing' || idx < 0 || idx >= N) return;
    if (cur.cells[idx] === val) return;
    const nextCells = cur.cells.slice();
    nextCells[idx] = val;
    const wrong = val === 1 && SOL[idx] === 0;
    const g2 = { ...cur, cells: nextCells, errors: cur.errors + (wrong ? 1 : 0) };
    if (!g2.t0) g2.t0 = Date.now();
    if (!wrong && isSolved(nextCells)) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      vibrate(HAPT.win);
      postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(g2.errors / 2))));
      commit(g2);
      setJustWon(true);
      return;
    }
    if (wrong) vibrate(HAPT.wrong);
    commit(g2);
  }

  function cellFromPoint(x, y) {
    try {
      const el = document.elementFromPoint(x, y);
      const t = el && el.closest ? el.closest('[data-i]') : null;
      return t ? Number(t.getAttribute('data-i')) : -1;
    } catch (e) { return -1; }
  }
  function onCellDown(e, idx) {
    if (e.button === 2) return;   // right-click is handled by onContextMenu (fill)
    if (gRef.current.status !== 'playing') return;
    if (!gRef.current.t0) startGame();
    const cur = gRef.current.cells[idx];
    const val = mode === 'fill' ? (cur === 1 ? 0 : 1) : (cur === 2 ? 0 : 2);
    pushUndo(gRef.current.cells);
    paintRef.current = { val };
    applyPaint(idx, val);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  }
  // right-click fills a square directly, whatever the selected tool
  function fillDirect(idx) {
    if (gRef.current.status !== 'playing') return;
    if (!gRef.current.t0) startGame();
    const cur = gRef.current.cells[idx];
    const val = cur === 1 ? 0 : 1;
    pushUndo(gRef.current.cells);
    applyPaint(idx, val);
  }
  function onGridMove(e) {
    if (!paintRef.current) return;
    const idx = cellFromPoint(e.clientX, e.clientY);
    if (idx >= 0) applyPaint(idx, paintRef.current.val);
  }
  useEffect(() => {
    const stop = () => { paintRef.current = null; };
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => { window.removeEventListener('pointerup', stop); window.removeEventListener('pointercancel', stop); };
  }, []);

  // one free hint: fill a correct square that is still empty
  function useHint() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    let idx = -1;
    for (let i = 0; i < N; i++) if (SOL[i] === 1 && cur.cells[i] !== 1) { idx = i; break; }
    if (idx < 0) return;
    const nextCells = cur.cells.slice();
    nextCells[idx] = 1;
    pushUndo(cur.cells);
    const g2 = { ...cur, cells: nextCells, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    if (isSolved(nextCells)) {
      g2.status = 'won'; g2.tEnd = Date.now();
      vibrate(HAPT.win);
      postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(g2.errors / 2))));
      commit(g2); setJustWon(true); return;
    }
    vibrate(HAPT.ok);
    commit(g2);
    say('Hint placed, one square filled in.');
  }

  function revealEnd() {
    const cur = gRef.current;
    const g2 = { ...cur, cells: SOL.slice(), status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    commit(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    undoRef.current = []; setCanUndo(false);
    commit(freshState(N));
    setJustWon(false); setEndClosed(false);
  }

  // desktop keyboard: F/M switch tools, Ctrl+Z undoes
  const onKey = useCallback((e) => {
    if (gRef.current.status !== 'playing') return;
    const k = e.key;
    if ((k === 'z' || k === 'Z') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undo(); return; }
    if (k === 'f' || k === 'F') { setMode('fill'); return; }
    if (k === 'm' || k === 'M' || k === 'x' || k === 'X') { setMode('mark'); return; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  function shareUrl() {
    return withRef(`sourceoftruths.com/etch${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E9}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Etch #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${errors === 0 ? 'clean' : `${errors} error${errors === 1 ? '' : 's'}`} · ${elapsed}${hintBit}${streakBit}`
      : `Etch #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Etch #${PUZZLE.num} — the daily nonogram from Source of Truths.\n${shareUrl()}`
      : shareText();
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

  const clueFs = W > 12 ? 'clamp(7px, 1.5vw, 11px)' : 'clamp(9px, 2vw, 13px)';
  const boardMax = W > 12 ? 620 : 470;

  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>The numbers beside each <b>row</b> and above each <b>column</b> are the lengths of the filled runs in that line, in order, with at least one blank between them. A row clued <b>4 2</b> has four filled squares, then a gap, then two.</p>
      <p style={{ margin: '0 0 9px' }}>Pick what a tap places with the <b>Fill</b> / <b>Mark</b> buttons. It starts on <b>Mark</b> (press M), where a tap pencils a free × on a square you have ruled out, never scored, which is the safe way to work since a wrong fill costs an error. Switch to <b>Fill</b> (press F) to fill squares and <b>drag</b> to fill a run, or just <b>right-click</b> a square to fill it directly. Your choice is remembered next time, and a clue dims once its line matches.</p>
      <p style={{ margin: '0 0 9px' }}>Every board has exactly one solution and can be reached by pure logic, so you never have to guess. Filling a square that isn&rsquo;t part of the picture turns <b style={{ color: COLORS.rust }}>red</b> and counts as an error, clear it to carry on. <b>Undo</b> (or Ctrl+Z) takes back your last stroke, and one free <b>hint</b> fills a correct square.</p>
      <p style={{ margin: 0 }}>A clean solve with <b>no errors</b> scores a perfect 10, every two errors cost a point. Ties break on fewest errors, then fastest time. Sundays are a bigger 15&times;15 Edition.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="et-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.et-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .et-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .et-btn:hover{background:${COLORS.paper};}
          @media(max-width:560px){.et-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.et-ttl h1{font-size:21px;}.et-ttl-dot{display:none;}}
          .et-cell{box-sizing:border-box;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;position:relative;}
          .et-clue{display:flex;align-items:center;justify-content:center;font-family:${MONO};font-weight:500;color:${COLORS.ink};min-width:0;min-height:0;line-height:1;}
          .et-clue.done{color:#c3c8d4;}
          .et-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .et-tool.on{background:${COLORS.ink};color:#fff;border-color:${COLORS.ink};}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="etch"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; 15&times;15</span>}
          blocks={'ETCH'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Etch is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Fill the squares the row and column clues force, and a picture appears. {W}&times;{H} today.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="et-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>errors <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>filled <b style={{ color: filledRight === TOTAL ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{filledRight}</b>/{TOTAL}</span>
          </div>

          <div style={{ maxWidth: boardMax, margin: '0 auto' }}>
            <div
              onPointerMove={onGridMove}
              style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`, aspectRatio: `${gridCols} / ${gridRows}`, touchAction: 'none' }}
            >
              {Array.from({ length: gridRows * gridCols }).map((_, k) => {
                const gr = Math.floor(k / gridCols), gc = k % gridCols;
                const inClueTop = gr < maxColClue, inClueLeft = gc < maxRowClue;
                if (inClueTop && inClueLeft) return <div key={k} />;
                if (inClueTop) {
                  const c = gc - maxRowClue;
                  const list = PUZZLE.cols[c];
                  const off = maxColClue - list.length;
                  const v = gr >= off ? list[gr - off] : null;
                  return (
                    <div key={k} className={`et-clue${colDone[c] ? ' done' : ''}`} style={{ fontSize: clueFs, paddingBottom: 2, borderLeft: c % 5 === 0 && c !== 0 ? '2px solid rgba(28,30,36,0.35)' : undefined }}>
                      {v === null || v === 0 ? '' : v}
                    </div>
                  );
                }
                if (inClueLeft) {
                  const r = gr - maxColClue;
                  const list = PUZZLE.rows[r];
                  const off = maxRowClue - list.length;
                  const v = gc >= off ? list[gc - off] : null;
                  return (
                    <div key={k} className={`et-clue${rowDone[r] ? ' done' : ''}`} style={{ fontSize: clueFs, paddingRight: 3, justifyContent: 'flex-end', borderTop: r % 5 === 0 && r !== 0 ? '2px solid rgba(28,30,36,0.35)' : undefined }}>
                      {v === null || v === 0 ? '' : v}
                    </div>
                  );
                }
                const r = gr - maxColClue, c = gc - maxRowClue, idx = r * W + c;
                const v = cells[idx];
                const wrong = v === 1 && SOL[idx] === 0;
                const bg = wrong ? '#f4b8b8' : v === 1 ? COLORS.ink : '#fff';
                return (
                  <div
                    key={k}
                    data-i={idx}
                    className="et-cell"
                    onPointerDown={(e) => onCellDown(e, idx)}
                    onContextMenu={(e) => { e.preventDefault(); fillDirect(idx); }}
                    style={{
                      background: bg,
                      borderRight: `${c % 5 === 4 && c !== W - 1 ? 2 : 1}px solid ${c % 5 === 4 && c !== W - 1 ? 'rgba(28,30,36,0.75)' : 'rgba(28,30,36,0.22)'}`,
                      borderBottom: `${r % 5 === 4 && r !== H - 1 ? 2 : 1}px solid ${r % 5 === 4 && r !== H - 1 ? 'rgba(28,30,36,0.75)' : 'rgba(28,30,36,0.22)'}`,
                      borderLeft: c === 0 ? '2px solid rgba(28,30,36,0.75)' : undefined,
                      borderTop: r === 0 ? '2px solid rgba(28,30,36,0.75)' : undefined,
                    }}
                  >
                    {v === 2 && (
                      <span style={{ fontFamily: MONO, fontSize: clueFs, color: '#b9c0cc', lineHeight: 1 }}>&times;</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <button className={`et-tool${mode === 'fill' ? ' on' : ''}`} onClick={() => setMode('fill')} title="Fill squares (F)">
                <Square size={14} /> Fill
              </button>
              <button className={`et-tool${mode === 'mark' ? ' on' : ''}`} onClick={() => setMode('mark')} title="Mark a square blank (M)">
                <Ban size={14} /> Mark &times;
              </button>
              <button className="et-tool" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'default' }}>
                <RotateCcw size={14} /> Undo
              </button>
              {!identity && !g.hintUsed && (
                <button className="et-tool" onClick={useHint} title="Fill one correct square (one hint per puzzle)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(77,124,15,0.5)', color: '#3f6a0a' }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: mode === 'mark' ? COLORS.accent : COLORS.faded }}>
              {mode === 'mark'
                ? 'Marking: tap or drag to pencil × on squares you have ruled out.'
                : 'Filling: tap a square, or drag across a run to fill it.'}
            </span>
            {identity && (filledRight > 0 || errors > 0) && (
              <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} /> {armReveal ? 'Tap again — ends the game and shows the picture' : 'Reveal & end'}
              </button>
            )}
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
              The picture: <span style={{ color: COLORS.accent }}>{PUZZLE.subject}</span>.
            </div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition &mdash; a bigger 15&times;15 grid.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Etch in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new picture drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/etch?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Etch &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/etch" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Etch &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="etch"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="etch" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Etch to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s picture, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s picture, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div id="daily-join" style={{ margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>
      </div>

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="etch"
          won={won}
          headline={won ? <>Picture solved!</> : <>You scored {Math.round(((won ? finalScore : 0) / 10) * 100)}%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {errors === 0 ? 'clean, no errors' : `${errors} error${errors === 1 ? '' : 's'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; the picture is shown above</>}
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

      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button className="et-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Etch</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Etch is a free daily nonogram from Source of Truths, the picture-logic puzzle also known as a picross or griddler. The numbers along each row and column tell you how many squares are filled in a row, in order, and your job is to work out which ones. Get them all and a picture appears.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every board has exactly one solution and is reachable by pure line logic, so there is never a moment where you have to guess. Drag to fill a run, mark the squares you have ruled out with an ×, and watch each clue dim as its line falls into place. Fill a square that isn&rsquo;t part of the picture and it turns red, so you always know where you stand.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new picture drops every day at midnight Eastern, and Sundays step up to a 15&times;15 Edition. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/hedge" style={{ color: COLORS.ink, fontWeight: 800 }}>Hedge</a>, our loop puzzle, <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku, and <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}
