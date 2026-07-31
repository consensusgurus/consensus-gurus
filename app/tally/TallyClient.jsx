'use client';

// Tally — the daily number ledger.
//
// Each day: an N×N grid with some cells inked out and a few printed givens.
// A rack of number tiles sits below. Fill every open square from the rack —
// each tile used exactly once — so that every row and column adds up to the
// target at its end. The rack is the twist: when the sums leave two ways to
// finish a line, the supply of tiles leaves you one. Score is 10 minus every
// placement over the minimum (the fewest possible = the rack size), floor 1 —
// so a clean, no-error solve is a perfect 10. Errors then time break ties.
//
// Same daily plumbing as Span: banked puzzles gated by Eastern date on the
// server (app/tally/page.js), per-puzzle localStorage saves, /tally?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.
// Weekdays are a 5×5 board; Sundays step up to 6×6.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, Lightbulb, Eye, Smartphone } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#262b35',
  green: '#15803d',
  greenSoft: '#eefaf1',
  amber: '#b45309',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_tally_help_seen';
const STATS_KEY = 'sot_tally_stats';

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

// ─── Personal stats + streak (localStorage), Span/Crux pattern ─────────────
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

function freshState(size) {
  return {
    v: 1,
    cells: Array(size * size).fill(0), // placed digit per grid cell (0 = empty/blocked/given)
    moves: 0,                          // total placements (lifting is free; extra placements = errors)
    hintUsed: false,
    status: 'playing',                 // playing | won | revealed
    t0: null,
    tEnd: null,
  };
}

export default function TallyClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const N = PUZZLE.size;
  const BLOCK = PUZZLE.blocked;
  const GIVEN = PUZZLE.given;
  const ROWT = PUZZLE.rowT;
  const COLT = PUZZLE.colT;
  const BANK = PUZZLE.bank;
  const FEWEST = PUZZLE.fewest;
  const STORE_KEY = `sot_tally_${PUZZLE.num}`;
  // every open cell the player fills (row-major), excluding blocked + givens
  const FREE = useMemo(() => {
    const out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!BLOCK[r][c] && !GIVEN[r][c]) out.push([r, c]);
    return out;
  }, [N, BLOCK, GIVEN]);

  const [g, setG] = useState(() => freshState(N));
  const [sel, setSel] = useState(-1);        // selected rack tile index (into BANK), -1 = none
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false); // start tile: full rules (first-timer) vs compact card
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shakeCell, setShakeCell] = useState(-1);
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
  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;   // not begun: show the start tile in place of the board
  const started = playing && !!g.t0;   // clock running: show the board
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
        if (saved && saved.v === 1 && Array.isArray(saved.cells) && saved.cells.length === N * N) setG({ ...freshState(N), ...saved });
      }
      // The start tile shows in place of the board until the player begins (t0
      // set on Start). First-timers see the full rules on the tile; a returning
      // player gets the compact start card with a "Show instructions" toggle.
      setGateRules(!localStorage.getItem(HELP_KEY));
    } catch (e) {}
    try { setStats(getStats()); } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    // same-device day breadcrumb for cross-puzzle recommendations — TODAY'S puzzle
    // only (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_tally_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_tally_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles, N]);

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
  const errors = g.moves > FEWEST ? g.moves - FEWEST : 0;
  const finalScore = won ? Math.max(1, Math.min(10, 10 - Math.ceil(errors / 2))) : 0;

  // per-rack-tile "used" flags: first usedCount[d] tiles of each value read used
  const used = useMemo(() => {
    const usedCount = {};
    for (const v of cells) { if (v) usedCount[v] = (usedCount[v] || 0) + 1; }
    const seen = {};
    return BANK.map((d) => { seen[d] = (seen[d] || 0) + 1; return seen[d] <= (usedCount[d] || 0); });
  }, [cells, BANK]);

  function lineState(i, isRow) {
    let sum = 0, empty = 0;
    for (let j = 0; j < N; j++) {
      const r = isRow ? i : j, c = isRow ? j : i;
      if (BLOCK[r][c]) continue;
      const v = GIVEN[r][c] || cells[r * N + c];
      if (v) sum += v; else empty += 1;
    }
    const tgt = isRow ? ROWT[i] : COLT[i];
    return { sum, empty, tgt, full: empty === 0, ok: empty === 0 && sum === tgt };
  }

  const linesOk = (() => { let n = 0; for (let i = 0; i < N; i++) { if (lineState(i, true).ok) n++; if (lineState(i, false).ok) n++; } return n; })();

  function isSolved(cs) {
    for (const [r, c] of FREE) { if (cs[r * N + c] === 0) return false; }
    for (let i = 0; i < N; i++) {
      let rs = 0, cs2 = 0;
      for (let j = 0; j < N; j++) {
        if (!BLOCK[i][j]) rs += GIVEN[i][j] || cs[i * N + j];
        if (!BLOCK[j][i]) cs2 += GIVEN[j][i] || cs[j * N + i];
      }
      if (rs !== ROWT[i] || cs2 !== COLT[i]) return false;
    }
    return true;
  }

  const REC_KEY = `sot_tally_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    // A play counts only once the player actually acts (placed a tile or took
    // the hint). Lifting is free, so it never sets moves; opening the puzzle and
    // dismissing the start gate does not log a 0-score attempt.
    const acted = g.moves > 0 || g.hintUsed;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    const errs = g2.moves > FEWEST ? g2.moves - FEWEST : 0;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: errs, won: g2.status === 'won' && errs === 0 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = errors, so the daily leaderboard (score, then guesses,
        // then time) resolves ties by fewest errors and then fastest finish.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: errs, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // Pressing Start begins the clock (sets t0) and marks the rules as seen. A
  // no-op once started, so re-reading the rules later never resets the timer.
  function startGame() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function commit(nextCells, extraMove) {
    const g2 = { ...g, cells: nextCells };
    if (extraMove) { g2.moves = g.moves + 1; if (!g2.t0) g2.t0 = Date.now(); }
    if (isSolved(nextCells)) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      const errs = g2.moves > FEWEST ? g2.moves - FEWEST : 0;
      postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(errs / 2))));
      setG(g2);
      setJustWon(true);
      return;
    }
    setG(g2);
  }

  function cellClick(r, c) {
    if (!playing || BLOCK[r][c] || GIVEN[r][c]) return;
    const i = r * N + c;
    if (cells[i]) {
      // lift the placed tile back to the rack (free — no move charged)
      const next = cells.slice(); next[i] = 0;
      commit(next, false);
      return;
    }
    if (sel < 0 || used[sel]) { say('Pick a tile first, then tap a square'); return; }
    const val = BANK[sel];
    const next = cells.slice(); next[i] = val;
    // advance selection to the next unused tile of the same value, for fast runs
    const usedCount = {};
    for (const v of next) { if (v) usedCount[v] = (usedCount[v] || 0) + 1; }
    let nextSel = -1, seenV = 0;
    for (let j = 0; j < BANK.length; j++) {
      if (BANK[j] !== val) continue;
      seenV += 1;
      if (seenV > (usedCount[val] || 0)) { nextSel = j; break; }
    }
    setSel(nextSel);
    commit(next, true);
  }

  function selectTile(j) {
    if (!playing || used[j]) return;
    setSel((cur) => (cur === j ? -1 : j));
  }

  // one free hint: place a correct tile in an empty cell whose value is still
  // free on the rack (safe even if the player has misplaced others)
  function useHint() {
    if (!playing || g.hintUsed) return;
    const freeAvail = {};
    BANK.forEach((d, j) => { if (!used[j]) freeAvail[d] = (freeAvail[d] || 0) + 1; });
    for (const [r, c] of FREE) {
      const i = r * N + c;
      if (cells[i]) continue;
      const d = PUZZLE.sol[r][c];
      if (freeAvail[d] > 0) {
        const next = cells.slice(); next[i] = d;
        const g2 = { ...g, cells: next, moves: g.moves + 1, hintUsed: true };
        if (!g2.t0) g2.t0 = Date.now();
        if (isSolved(next)) {
          g2.status = 'won'; g2.tEnd = Date.now();
          const errs = g2.moves > FEWEST ? g2.moves - FEWEST : 0;
          postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(errs / 2))));
          setG(g2); setJustWon(true); return;
        }
        setSel(-1);
        setG(g2);
        say('Hint placed — one square filled in.');
        return;
      }
    }
    say('No safe hint right now — lift a misplaced tile first.');
  }

  function revealEnd() {
    const next = Array(N * N).fill(0);
    for (const [r, c] of FREE) next[r * N + c] = PUZZLE.sol[r][c];
    const g2 = { ...g, cells: next, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setSel(-1);
    setG(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(N)); setSel(-1); setJustWon(false); setEndClosed(false);
  }

  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E9}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Tally #${PUZZLE.num} · ${PUZZLE.sunday ? '6×6 · ' : ''}${g.moves} moves${errors ? ` (${errors} error${errors === 1 ? '' : 's'})` : ' · clean'} · ${elapsed}${hintBit}${streakBit}`
      : `Tally #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return withRef(`sourceoftruths.com/tally${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function copyShare() {
    const text = playing
      ? `Tally #${PUZZLE.num} — balance every row and column from the rack. Fewest moves is ${FEWEST}.\n${shareUrl()}`
      : shareText();
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

  // ── board geometry: cells scale with the column, so it fits phone → desktop ──
  const BOARD_MAX = N === 6 ? 432 : 384;
  const TARGETW = 46;
  const gridTemplate = `repeat(${N}, minmax(0, 1fr)) ${TARGETW}px`;

  function targetChip(i, isRow, key) {
    const st = lineState(i, isRow);
    const bg = st.ok ? COLORS.green : '#fff';
    const bd = st.ok ? COLORS.green : st.full ? 'rgba(180,83,9,0.75)' : 'rgba(28,30,36,0.4)';
    const tc = st.ok ? '#fff' : st.full ? COLORS.amber : COLORS.ink;
    return (
      <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 13, border: `1.5px solid ${bd}`, background: bg, fontFamily: MONO, lineHeight: 1.02, padding: '2px 0', minHeight: 34 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: tc }}>{isRow ? ROWT[i] : COLT[i]}</span>
        {!st.ok && <span style={{ fontSize: 8.5, color: st.full ? COLORS.amber : '#262b35' }}>{st.full ? `${st.sum > st.tgt ? 'over' : 'under'} ${Math.abs(st.sum - st.tgt)}` : `now ${st.sum}`}</span>}
      </div>
    );
  }

  // Shared rules body — rendered in both the how-to-play modal and the start gate.
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>Fill every open square so each <b>row and column adds up to the target</b> at its end.</p>
      <p style={{ margin: '0 0 9px' }}>You may only use the <b>tiles on your rack</b>, and you must use <b>every one</b>. Digits repeat &mdash; the rack tells you how many of each you have. That supply is the trick: when the sums leave two ways to fill a line, the tiles left leave one.</p>
      <p style={{ margin: '0 0 9px' }}>Tap a tile, then a square. Tap a placed tile to <b>lift it back</b> &mdash; lifting is free. Dotted squares are yours; a square with a corner dot is a printed given; dark squares are out of play.</p>
      <p style={{ margin: 0 }}>A clean solve uses the <b>fewest possible</b> placements for a perfect 10 &mdash; every extra placement costs a point. Ties break on fewest errors, then fastest time. One free <b>hint</b> fills a correct square.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="tl-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.tl-wrap{padding-left:14px !important;padding-right:14px !important;}}
          .tl-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .tl-btn:hover{background:${COLORS.paper};}
          @keyframes tlshake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-4px);}40%,80%{transform:translateX(4px);}}
          .tl-shake{animation:tlshake .4s ease;}
          @keyframes tlfade{from{opacity:0;}}
          @keyframes tlstamp{from{opacity:0;transform:scale(.94);}}
          @media(max-width:520px){.tl-htp-f{display:none;}.tl-htp-s{display:inline;}}
          @media(max-width:560px){.tl-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.tl-ttl h1{font-size:21px;letter-spacing:0.02em;}.tl-ttl .tl-ttl-dt{font-size:15px;}.tl-ttl-dot{display:none;}}
          .tl-cell{aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:${MONO};font-size:21px;font-weight:500;color:${COLORS.ink};box-sizing:border-box;}
          .tl-blocked{background:${COLORS.ink};}
          .tl-given{background:#eef0f3;border:1.5px solid rgba(28,30,36,0.25);position:relative;}
          .tl-given::after{content:'';position:absolute;top:5px;right:5px;width:5px;height:5px;border-radius:50%;background:rgba(28,30,36,0.3);}
          .tl-empty{background:#fff;border:1.5px dashed rgba(28,30,36,0.4);cursor:pointer;}
          .tl-empty.hot{border:2px solid ${COLORS.green};box-shadow:0 0 0 3px rgba(21,128,61,0.16);}
          .tl-placed{background:#fff;border:1.5px solid rgba(28,30,36,0.55);cursor:pointer;box-shadow:0 2.5px 0 rgba(28,30,36,0.5), inset 0 -3px 0 rgba(28,30,36,0.07);}
          .tl-placed:active{transform:translateY(1px);}
          .tl-rtile{width:42px;height:42px;border-radius:8px;border:1.5px solid rgba(28,30,36,0.55);background:#fff;font-family:${MONO};font-size:20px;font-weight:500;color:${COLORS.ink};cursor:pointer;box-shadow:0 2.5px 0 rgba(28,30,36,0.5), inset 0 -3px 0 rgba(28,30,36,0.07);}
          .tl-rtile:active{transform:translateY(1px);box-shadow:0 1px 0 rgba(28,30,36,0.5);}
          .tl-rtile.sel{border:2px solid ${COLORS.green};box-shadow:0 0 0 3px rgba(21,128,61,0.2), 0 2.5px 0 rgba(28,30,36,0.5);}
          .tl-rtile.used{visibility:hidden;}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* puzzle-native top strip (Crux/Span pattern): quiet nav + player chip */}
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed TALLY tiles with No./date inline, one rule beneath */}
        <DailyMasthead
          slug="tally"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.green}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.green, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; 6&times;6</span>}
          blocks={'TALLY'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 4 ? COLORS.green : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {/* start tile — sits where the board goes until the player presses Start,
            which begins the clock. The ledger stays sealed until then. */}
        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Tally is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Fill the grid from the rack so every row and column adds up to its target.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="tl-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* the ledger */}
        {!preStart && (
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>moves <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{g.moves}</b> &middot; fewest <b style={{ color: COLORS.ink, fontWeight: 500 }}>{FEWEST}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>lines <b style={{ color: linesOk === 2 * N ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{linesOk}</b>/{2 * N}</span>
          </div>

          {/* board: N cells + a row-target column, then a col-target row beneath */}
          <div style={{ maxWidth: BOARD_MAX, margin: '0 auto' }}>
            <div className={shakeCell >= 0 ? 'tl-shake' : undefined} style={{ display: 'grid', gridTemplateColumns: gridTemplate, gap: 6 }}>
              {Array.from({ length: N }).map((_, r) => (
                <React.Fragment key={`row${r}`}>
                  {Array.from({ length: N }).map((__, c) => {
                    const i = r * N + c;
                    if (BLOCK[r][c]) return <div key={i} className="tl-cell tl-blocked" />;
                    if (GIVEN[r][c]) return <div key={i} className="tl-cell tl-given">{GIVEN[r][c]}</div>;
                    if (cells[i]) return <div key={i} className="tl-cell tl-placed" onClick={() => cellClick(r, c)}>{cells[i]}</div>;
                    return <div key={i} className={`tl-cell tl-empty${sel >= 0 && !used[sel] ? ' hot' : ''}`} onClick={() => cellClick(r, c)} />;
                  })}
                  {targetChip(r, true, `rt${r}`)}
                </React.Fragment>
              ))}
              {Array.from({ length: N }).map((_, c) => targetChip(c, false, `ct${c}`))}
              <div />
            </div>
          </div>

          {/* rack */}
          {playing && (
            <>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, margin: '16px 2px 8px' }}>Your tiles &middot; use every one</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {BANK.map((d, j) => (
                  <button key={j} className={`tl-rtile${used[j] ? ' used' : (j === sel ? ' sel' : '')}`} onClick={() => selectTile(j)} aria-label={`tile ${d}`}>{d}</button>
                ))}
              </div>
            </>
          )}
        </div>
        )}

        {/* controls */}
        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {!identity && !g.hintUsed && (
              <button className="tl-btn" onClick={useHint} title="Fill one correct square (one hint per puzzle)"
                style={{ background: '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.7)', color: '#8a6d1a', padding: '6px 12px', fontSize: 12.5 }}>
                <Lightbulb size={14} /> Hint
              </button>
            )}
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              {sel >= 0 && !used[sel] ? `Placing ${BANK[sel]} — tap a square` : 'Tap a tile, then a square. Tap a placed tile to lift it.'}
            </span>
            {identity && g.moves > 0 && (
              <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} /> {armReveal ? 'Tap again — ends the puzzle and fills the solution' : 'Reveal & end'}
              </button>
            )}
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
            {!isTodays && (
              <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
                You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                <a href="/tally" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Tally &rarr;</a>
                {' · '}
                <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
              </p>
            )}
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="tally"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="tally" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider
          />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: '#21b45e', color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Tally to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s ledger, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s ledger, every day.
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

        {/* Personal stats wiring (myStats) is retained for the share string and
            streak logic; the on-page "Your stats" tile row is no longer shown.
            The daily leaderboard now renders in DailyGamesGrid's boardSlot,
            directly under the Challenge / Share actions (owner, 2026-07-23). */}
      </div>

      {/* the end-of-puzzle popup: the shared DailyEndCard as a dismissible modal (win or loss) */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="tally"
          won={won}
          headline={won ? <>Grid balanced!</> : <>You scored {Math.round(((won ? finalScore : 0) / 10) * 100)}%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {g.moves} move{g.moves === 1 ? '' : 's'} &middot; {errors === 0 ? 'clean, no errors' : `${errors} error${errors === 1 ? '' : 's'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; the balanced grid is shown above</>}
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
            <button className="tl-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Tally — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Tally</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Tally is a free daily number puzzle from Source of Truths &mdash; a logic puzzle in the sudoku family with a ledger twist. Each day gives you a grid and a rack of number tiles. Place every tile so that each row and each column adds up to the target printed at its end.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          What sets it apart from kakuro or a magic square is the supply. You have exactly the tiles you need &mdash; no more, no fewer &mdash; so when the arithmetic alone leaves two ways to finish a line, counting what is left on the rack settles it. Every board has a single solution, and solving it with no wasted moves scores a perfect ten.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new ledger drops every day at midnight Eastern, and Sundays step up to a bigger 6&times;6 board. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our geography puzzle, and <a href="/dating" style={{ color: COLORS.ink, fontWeight: 800 }}>Dating</a>, our history puzzle.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}
