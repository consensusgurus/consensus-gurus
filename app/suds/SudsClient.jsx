'use client';

// Suds — the daily 9×9 sudoku.
//
// Each day: a 9×9 grid with printed clues. Fill every empty cell 1–9 so no
// digit repeats in any row, column, or 3×3 box. There is exactly one solution.
// A wrong entry (a digit that isn't the solution's) counts as an error and
// glows red until you fix it. Score is 10 minus your errors, floor 1 — a clean
// solve is a perfect 10, and ties break on fewest errors then fastest time.
// Notes let you pencil candidates; one free hint fills a correct cell.
//
// Same daily plumbing as Tally/Span: banked boards gated by Eastern date on the
// server (app/suds/page.js), per-puzzle localStorage saves, /suds?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Weekdays are
// a standard board; Sundays step up to a harder Edition with fewer clues.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, Lightbulb, Eye, Smartphone, Pencil, Eraser } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#ea580c',       // Suds identity — orange
  accentSoft: '#fff5ed',
  green: '#15803d',        // correctness / solved
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_suds_help_seen';
const STATS_KEY = 'sot_suds_stats';

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

// ─── Personal stats + streak (localStorage), Tally/Span pattern ─────────────
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

function freshState() {
  return {
    v: 1,
    cells: Array(81).fill(0),   // player digit per cell (0 = empty; givens live in GIVEN)
    notes: Array(81).fill(0),   // pencil-mark bitmask per cell (bit d set = candidate d)
    errors: 0,                  // total wrong entries committed
    hintUsed: false,
    status: 'playing',          // playing | won | revealed
    t0: null,
    tEnd: null,
  };
}

const boxOf = (r, c) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

export default function SudsClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const GIVEN = PUZZLE.given;
  const SOL = PUZZLE.sol;
  const STORE_KEY = `sot_suds_${PUZZLE.num}`;
  // flat given lookup + list of the cells the player must fill
  const givenFlat = useMemo(() => {
    const f = Array(81).fill(0);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) f[r * 9 + c] = GIVEN[r][c];
    return f;
  }, [GIVEN]);
  const solFlat = useMemo(() => {
    const f = Array(81).fill(0);
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) f[r * 9 + c] = SOL[r][c];
    return f;
  }, [SOL]);
  const FREE = useMemo(() => {
    const out = [];
    for (let i = 0; i < 81; i++) if (!givenFlat[i]) out.push(i);
    return out;
  }, [givenFlat]);

  const [g, setG] = useState(freshState);
  const [sel, setSel] = useState(-1);          // selected cell index, -1 = none
  const [noteMode, setNoteMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
  const searchParams = useSearchParams();
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);

  const cells = g.cells;
  const notes = g.notes;
  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';

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
        if (saved && saved.v === 1 && Array.isArray(saved.cells) && saved.cells.length === 81) {
          setG({ ...freshState(), ...saved, notes: Array.isArray(saved.notes) && saved.notes.length === 81 ? saved.notes : Array(81).fill(0) });
        }
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
    // same-device day breadcrumb for cross-game recs — TODAY'S puzzle only
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_suds_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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
  const errors = g.errors;
  const finalScore = won ? Math.max(1, Math.min(10, 10 - errors)) : 0;

  // digits fully placed (all 9 correct) → grey out on the pad
  const digitDone = useMemo(() => {
    const cnt = {};
    for (let i = 0; i < 81; i++) {
      const v = givenFlat[i] || cells[i];
      if (v && (givenFlat[i] || cells[i] === solFlat[i])) cnt[v] = (cnt[v] || 0) + 1;
    }
    const out = {};
    for (let d = 1; d <= 9; d++) out[d] = (cnt[d] || 0) >= 9;
    return out;
  }, [cells, givenFlat, solFlat]);

  const filledCount = useMemo(() => FREE.reduce((n, i) => n + (cells[i] ? 1 : 0), 0), [cells, FREE]);

  function isSolved(cs) {
    for (const i of FREE) if (cs[i] !== solFlat[i]) return false;
    return true;
  }

  const REC_KEY = `sot_suds_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
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
        // guessesUsed = errors, so the daily leaderboard (score, then guesses,
        // then time) resolves ties by fewest errors and then fastest finish.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.errors, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // remove a candidate from the notes of a cell's row/column/box peers
  function scrubPeerNotes(noteArr, idx, d) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c), m = 1 << d;
    for (let j = 0; j < 81; j++) {
      const rr = Math.floor(j / 9), cc = j % 9;
      if (rr === r || cc === c || boxOf(rr, cc) === b) { if (noteArr[j] & m) noteArr[j] = noteArr[j] & ~m; }
    }
  }

  function enterDigit(idx, d) {
    if (!playing || idx < 0 || givenFlat[idx]) return;
    if (noteMode) {
      if (cells[idx]) return; // no notes on a filled cell
      const nextNotes = notes.slice();
      nextNotes[idx] = nextNotes[idx] ^ (1 << d);
      setG({ ...g, notes: nextNotes });
      return;
    }
    if (cells[idx] === d) return; // no-op re-entry of the same digit
    const nextCells = cells.slice();
    const nextNotes = notes.slice();
    nextCells[idx] = d;
    nextNotes[idx] = 0; // a filled cell carries no pencil marks
    const wrong = d !== solFlat[idx];
    if (!wrong) scrubPeerNotes(nextNotes, idx, d);
    const g2 = { ...g, cells: nextCells, notes: nextNotes, errors: g.errors + (wrong ? 1 : 0) };
    if (!g2.t0) g2.t0 = Date.now();
    if (!wrong && isSolved(nextCells)) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      postResult(g2, Math.max(1, Math.min(10, 10 - g2.errors)));
      setG(g2);
      setJustWon(true);
      return;
    }
    setG(g2);
  }

  function eraseCell(idx) {
    if (!playing || idx < 0 || givenFlat[idx]) return;
    if (!cells[idx] && !notes[idx]) return;
    const nextCells = cells.slice();
    const nextNotes = notes.slice();
    nextCells[idx] = 0;
    nextNotes[idx] = 0;
    setG({ ...g, cells: nextCells, notes: nextNotes });
  }

  function cellClick(idx) {
    setSel(idx);
  }

  // one free hint: fill a correct digit into the selected empty cell, else the
  // first empty cell in reading order
  function useHint() {
    if (!playing || g.hintUsed) return;
    let idx = (sel >= 0 && !givenFlat[sel] && cells[sel] !== solFlat[sel]) ? sel : -1;
    if (idx < 0) idx = FREE.find((i) => cells[i] !== solFlat[i]);
    if (idx == null || idx < 0) return;
    const d = solFlat[idx];
    const nextCells = cells.slice();
    const nextNotes = notes.slice();
    nextCells[idx] = d;
    nextNotes[idx] = 0;
    scrubPeerNotes(nextNotes, idx, d);
    const g2 = { ...g, cells: nextCells, notes: nextNotes, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    setSel(idx);
    if (isSolved(nextCells)) {
      g2.status = 'won'; g2.tEnd = Date.now();
      postResult(g2, Math.max(1, Math.min(10, 10 - g2.errors)));
      setG(g2); setJustWon(true); return;
    }
    setG(g2);
    say('Hint placed — one square filled in.');
  }

  function revealEnd() {
    const next = solFlat.slice();
    const g2 = { ...g, cells: next.map((v, i) => (givenFlat[i] ? 0 : v)), notes: Array(81).fill(0), status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setSel(-1);
    setG(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setSel(-1); setJustWon(false); setNoteMode(false); setEndClosed(false);
  }

  // desktop keyboard: arrows move, 1–9 fill, 0/Backspace erase, N toggles notes
  const onKey = useCallback((e) => {
    if (!playing) return;
    const k = e.key;
    if (k === 'n' || k === 'N') { setNoteMode((m) => !m); return; }
    if (sel < 0) return;
    const r = Math.floor(sel / 9), c = sel % 9;
    if (k === 'ArrowUp') { e.preventDefault(); setSel(((r + 8) % 9) * 9 + c); return; }
    if (k === 'ArrowDown') { e.preventDefault(); setSel(((r + 1) % 9) * 9 + c); return; }
    if (k === 'ArrowLeft') { e.preventDefault(); setSel(r * 9 + (c + 8) % 9); return; }
    if (k === 'ArrowRight') { e.preventDefault(); setSel(r * 9 + (c + 1) % 9); return; }
    if (k === 'Backspace' || k === 'Delete' || k === '0') { eraseCell(sel); return; }
    if (/^[1-9]$/.test(k)) { enterDigit(sel, Number(k)); return; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sel, noteMode, g]);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E7}'.repeat(g5) + '⬜'.repeat(5 - g5); // orange squares
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Suds #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${errors === 0 ? 'clean' : `${errors} error${errors === 1 ? '' : 's'}`} · ${elapsed}${hintBit}${streakBit}`
      : `Suds #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/suds${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Suds #${PUZZLE.num} — the daily sudoku from Source of Truths.\n${shareUrl()}`
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

  // ── selection-aware highlighting ──
  const selVal = sel >= 0 ? (givenFlat[sel] || cells[sel]) : 0;
  const selR = sel >= 0 ? Math.floor(sel / 9) : -1;
  const selC = sel >= 0 ? sel % 9 : -1;
  const selB = sel >= 0 ? boxOf(selR, selC) : -1;

  function cellStyle(idx) {
    const r = Math.floor(idx / 9), c = idx % 9, b = boxOf(r, c);
    const isSel = idx === sel;
    const peer = sel >= 0 && !isSel && (r === selR || c === selC || b === selB);
    const val = givenFlat[idx] || cells[idx];
    const sameVal = selVal && val === selVal && !isSel;
    let bg = '#fff';
    if (peer) bg = '#f3f5f8';
    if (sameVal) bg = '#ffe9d8';
    if (isSel) bg = '#ffd9bd';
    return {
      background: bg,
      borderRight: `${c % 3 === 2 && c !== 8 ? 2.5 : 1}px solid ${c % 3 === 2 && c !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}`,
      borderBottom: `${r % 3 === 2 && r !== 8 ? 2.5 : 1}px solid ${r % 3 === 2 && r !== 8 ? 'rgba(28,30,36,0.85)' : 'rgba(28,30,36,0.18)'}`,
      borderLeft: c === 0 ? 'none' : undefined,
      borderTop: r === 0 ? 'none' : undefined,
    };
  }

  const wrongAt = (idx) => cells[idx] && cells[idx] !== solFlat[idx];

  const padCounts = useMemo(() => {
    const cnt = {};
    for (let i = 0; i < 81; i++) { const v = givenFlat[i] || (cells[i] === solFlat[i] ? cells[i] : 0); if (v) cnt[v] = (cnt[v] || 0) + 1; }
    return cnt;
  }, [cells, givenFlat, solFlat]);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="sd-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.sd-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .sd-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .sd-btn:hover{background:${COLORS.paper};}
          @keyframes sdfade{from{opacity:0;}}
          @keyframes sdstamp{from{opacity:0;transform:scale(.94);}}
          @media(max-width:520px){.sd-htp-f{display:none;}.sd-htp-s{display:inline;}}
          @media(max-width:560px){.sd-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.sd-ttl h1{font-size:21px;letter-spacing:0.02em;}.sd-ttl .sd-ttl-dt{font-size:15px;}.sd-ttl-dot{display:none;}}
          .sd-cell{display:flex;align-items:center;justify-content:center;font-family:${MONO};box-sizing:border-box;cursor:pointer;position:relative;user-select:none;-webkit-tap-highlight-color:transparent;min-width:0;min-height:0;overflow:hidden;}
          .sd-given{font-weight:700;color:${COLORS.ink};}
          .sd-user{font-weight:500;color:${COLORS.accent};}
          .sd-wrong{font-weight:600;color:${COLORS.rust};background:#fdecec !important;}
          .sd-notes{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);width:100%;height:100%;padding:2px;box-sizing:border-box;}
          .sd-note{display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:9px;line-height:1;color:#8a93a3;}
          .sd-pad{width:100%;aspect-ratio:1;border-radius:9px;border:1.5px solid rgba(28,30,36,0.5);background:#fff;font-family:${MONO};font-weight:500;color:${COLORS.ink};cursor:pointer;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 0 rgba(28,30,36,0.4);}
          .sd-pad:active{transform:translateY(1px);box-shadow:0 1px 0 rgba(28,30,36,0.4);}
          .sd-pad.done{color:#c3c8cf;box-shadow:none;background:#f4f5f7;cursor:default;}
          .sd-pad .sd-pad-n{position:absolute;bottom:2px;right:4px;font-size:8px;color:#aab0bb;font-weight:500;}
          .sd-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .sd-tool.on{background:${COLORS.ink};color:#fff;border-color:${COLORS.ink};}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* game-native top strip: quiet nav + player chip */}
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed SUDS tiles with No./date inline */}
        <div className="sd-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'SUDS'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="sd-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="sd-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="sd-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday &middot; Hard</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the board */}
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>errors <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>filled <b style={{ color: filledCount === FREE.length ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{filledCount}</b>/{FREE.length}</span>
          </div>

          {/* 9×9 grid with heavy 3×3 rules */}
          <div style={{ maxWidth: 468, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gridTemplateRows: 'repeat(9, minmax(0, 1fr))', aspectRatio: '1', border: `2.5px solid rgba(28,30,36,0.85)`, borderRadius: 4, overflow: 'hidden' }}>
              {Array.from({ length: 81 }).map((_, idx) => {
                const given = givenFlat[idx];
                const val = given || cells[idx];
                const wrong = wrongAt(idx);
                const base = cellStyle(idx);
                const cls = `sd-cell ${given ? 'sd-given' : wrong ? 'sd-wrong' : val ? 'sd-user' : ''}`;
                return (
                  <div key={idx} className={cls} style={base} onClick={() => cellClick(idx)}>
                    {val ? (
                      <span style={{ fontSize: 'clamp(16px, 5vw, 23px)' }}>{val}</span>
                    ) : notes[idx] ? (
                      <div className="sd-notes">
                        {Array.from({ length: 9 }).map((__, k) => (
                          <span key={k} className="sd-note">{(notes[idx] & (1 << (k + 1))) ? k + 1 : ''}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* number pad + tools */}
          {playing && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gap: 5, maxWidth: 468, margin: '16px auto 0' }}>
                {Array.from({ length: 9 }).map((_, k) => {
                  const d = k + 1;
                  const done = digitDone[d];
                  return (
                    <button key={d} className={`sd-pad${done ? ' done' : ''}`} onClick={() => { if (!done) enterDigit(sel, d); }} aria-label={`enter ${d}`}>
                      <span style={{ fontSize: 'clamp(15px, 4.5vw, 21px)' }}>{d}</span>
                      {!done && <span className="sd-pad-n">{9 - (padCounts[d] || 0)}</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                <button className={`sd-tool${noteMode ? ' on' : ''}`} onClick={() => setNoteMode((m) => !m)} title="Toggle pencil notes (N)">
                  <Pencil size={14} /> Notes {noteMode ? 'on' : 'off'}
                </button>
                <button className="sd-tool" onClick={() => eraseCell(sel)} title="Erase selected cell (Backspace)">
                  <Eraser size={14} /> Erase
                </button>
                {!identity && !g.hintUsed && (
                  <button className="sd-tool" onClick={useHint} title="Fill one correct square (one hint per puzzle)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(234,88,12,0.5)', color: '#9a3d0c' }}>
                    <Lightbulb size={14} /> Hint
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* controls */}
        {playing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              {sel >= 0 ? (noteMode ? 'Tap a number to pencil it in' : 'Tap a number to fill this square') : 'Tap a square, then a number. Toggle Notes to pencil.'}
            </span>
            {identity && (filledCount > 0 || errors > 0) && (
              <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} /> {armReveal ? 'Tap again — ends the game and fills the solution' : 'Reveal & end'}
              </button>
            )}
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '10px 0 0' }}>The Sunday Edition — a harder grid with fewer clues.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Suds in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new sudoku drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/suds?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Suds &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/suds" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Suds &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="suds"
            maxWidth={620}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Suds to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sudoku, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s sudoku, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div style={{ margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>

        {/* your stats — sits directly above the leaderboard */}
        {!focusMode && identity && (
        <div style={{ maxWidth: 620, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'Clean' },
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
        <div id="daily-leaderboard" style={{ display: focusMode ? 'none' : 'block', maxWidth: 620, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <DailyCombinedLeaderboard todayKey="suds" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="suds"
          won={won}
          headline={<>You scored {Math.round(((won ? finalScore : 0) / 10) * 100)}%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {errors === 0 ? 'clean, no errors' : `${errors} error${errors === 1 ? '' : 's'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; the solved grid is shown above</>}
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
              <p style={{ margin: '0 0 9px' }}>Fill every empty square so that each <b>row</b>, each <b>column</b>, and each <b>3×3 box</b> contains the digits <b>1–9</b> with no repeats. Every board has exactly one solution.</p>
              <p style={{ margin: '0 0 9px' }}>Tap a square, then tap a number to place it. A number that isn&rsquo;t part of the solution turns <b style={{ color: COLORS.rust }}>red</b> and counts as an error &mdash; fix it to keep going. On desktop you can also use the arrow keys and number keys.</p>
              <p style={{ margin: '0 0 9px' }}>Turn on <b>Notes</b> (or press N) to pencil small candidates into a square. One free <b>hint</b> fills a correct number.</p>
              <p style={{ margin: 0 }}>A clean solve with <b>no errors</b> scores a perfect 10 &mdash; every error costs a point. Ties break on fewest errors, then fastest time. Sundays are a harder Edition with fewer clues.</p>
            </div>
            <button className="sd-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Suds — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Suds</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Suds is a free daily sudoku from Source of Truths. Each day gives you a fresh 9×9 grid with a handful of printed clues. Fill in the rest so that every row, every column, and every 3×3 box holds the digits 1 through 9 exactly once. There is always a single, logical solution &mdash; no guessing required.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Play it your way: tap a square and a number, pencil in candidates with Notes when a square could go two ways, and lean on the arrow keys and number row on a desktop keyboard. A wrong number glows red so you always know where you stand, and a clean, error-free solve earns a perfect score.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new puzzle drops every day at midnight Eastern, and Sundays step up to a harder Edition with fewer clues. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our number ledger, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography game.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}
