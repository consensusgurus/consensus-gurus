'use client';

// Cipher — the daily cryptarithm (alphametic).
//
// One equation a day: WORD + WORD = WORD, where every letter stands for a
// different digit 0-9, leading letters are never zero, and there is exactly
// ONE solution (every banked equation is machine-verified unique, see
// scripts/verify-cipher.mjs). Tap a letter, tap a digit — or just type. The
// digit pad shows which letter owns each digit; shared digits flag red.
//
// The board carries the scratch work so the player doesn't have to (owner,
// 2026-08-04, "too much guess and check if you don't make hand notes"):
//   • a carry/borrow row above the columns, derived automatically as far as the
//     assignment allows and pencil-editable beyond that frontier;
//   • a free per-column ✓/✗ under the equation, so a wrong digit is caught at
//     the column that broke instead of by one all-or-nothing check;
//   • a letter key rack with candidate digits, auto-eliminating digits already
//     taken and 0 on leading letters, plus a Notes mode to cross off more.
// Column marks are FREE and never cost a point — only the scored Check does.
// They are also sound: a column is marked correct only when its carry-in is
// derived, and marked wrong only when no legal carry-in could satisfy it.
//
// Scoring mirrors Suds: solve it and the day scores max(1, 10 - failed
// checks) out of 10. Ties on the daily board break by fewest failed checks,
// then fastest time. Revealing the solution ends the day at 0.
//
// Same daily plumbing as Circa/Suds/Stet: banked equations gated by Eastern
// date on the server (app/cipher/page.js), per-puzzle localStorage saves,
// /cipher?p=N archive pinning, streaks + stats, and the shared /api/quiz/*
// board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Lock, Delete, Pencil } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import { T } from '@/lib/theme';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  accent: '#0f766e',        // Cipher identity — codebreaker teal
  accentSoft: '#d9f0ee',
  green: T.successDeep,
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_cipher_help_seen';
const STATS_KEY = 'sot_cipher_stats';
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

// ─── The unique solution, derived on demand (for Reveal only) ───────────────
// Every banked equation is verified unique, so this returns THE solution.
// Both ops are linear: the same signed-coefficient DFS the verifier uses.
// `signs` gives the coefficient sign per word: addition is [1,1,...,-1],
// subtraction A - B - ... = C is [1,-1,...,-1].
function solveLinear(words, signs) {
  const letters = [...new Set(words.join(''))];
  const coef = Object.fromEntries(letters.map((c) => [c, 0]));
  for (let w = 0; w < words.length; w++) { let m = 1; for (let i = words[w].length - 1; i >= 0; i--) { coef[words[w][i]] += signs[w] * m; m *= 10; } }
  const firsts = new Set(words.map((w) => w[0]));
  const order = letters.slice().sort((a, b) => Math.abs(coef[b]) - Math.abs(coef[a]));
  const cs = order.map((c) => coef[c]);
  const fs = order.map((c) => firsts.has(c));
  const n = order.length;
  const used = new Array(10).fill(false);
  const digits = new Array(n).fill(null);
  let found = null;
  const dfs = (i, acc) => {
    if (found) return;
    if (i === n) { if (acc === 0) { found = {}; order.forEach((c, k) => { found[c] = digits[k]; }); } return; }
    for (let d = 0; d < 10; d++) {
      if (used[d] || (d === 0 && fs[i])) continue;
      used[d] = true; digits[i] = d;
      let rem = 0;
      for (let k = i + 1; k < n; k++) rem += Math.abs(cs[k]);
      const next = acc + cs[i] * d;
      if (Math.abs(next) <= rem * 9) dfs(i + 1, next);
      used[d] = false;
      if (found) return;
    }
  };
  dfs(0, 0);
  return found;
}
function solveCipher(op, lhs, rhs) {
  if (op === 'sub') return solveLinear([...lhs, rhs], [1, ...lhs.slice(1).map(() => -1), -1]);
  return solveLinear([...lhs, rhs], [...lhs.map(() => 1), -1]);
}

// ─── Column model: the scaffolding that replaces hand-written notes ────────
// Cryptarithms are solved column by column, right to left, carrying (addition)
// or borrowing (subtraction) into the next. buildColumns turns the displayed
// equation into that column view; deriveColumns walks it from the right as far
// as the current assignment allows.
function buildColumns(op, lhs, rhs) {
  const W = op === 'sub' ? lhs[0].length : rhs.length;
  const cols = [];
  for (let i = 0; i < W; i++) {
    const at = (w) => (i < w.length ? w[w.length - 1 - i] : null);
    cols.push({
      top: op === 'sub' ? [at(lhs[0])].filter(Boolean) : lhs.map(at).filter(Boolean),
      sub: op === 'sub' ? lhs.slice(1).map(at).filter(Boolean) : [],
      res: at(rhs),
    });
  }
  return cols;
}
// One column's arithmetic. Addition carries out 0-2 (three addends max);
// subtraction borrows 0-2 (two subtrahends max).
function stepColumn(c, carryIn, op) {
  const val = (ch) => (ch === null ? 0 : c._a[ch]);
  if (op === 'sub') {
    const t = val(c.top[0]) - c.sub.reduce((a, ch) => a + val(ch), 0) - carryIn;
    const borrow = t < 0 ? Math.ceil(-t / 10) : 0;
    return { digit: t + 10 * borrow, carryOut: borrow };
  }
  const s = c.top.reduce((a, ch) => a + val(ch), 0) + carryIn;
  return { digit: s % 10, carryOut: Math.floor(s / 10) };
}
// Per column: { carryIn, ok }. carryIn is the derived carry/borrow, or null
// where the chain has not reached that column. ok is true only for a column
// whose carry-in is derived and whose arithmetic lands; false either there or,
// past the frontier, when NO legal carry-in (0-2) could satisfy the column.
// Never guesses, so a ✓ is always earned and a ✗ is always real.
function deriveColumns(cols, assign, op) {
  const out = cols.map(() => ({ carryIn: null, ok: null }));
  const test = (c, k) => {
    const { digit, carryOut } = stepColumn(c, k, op);
    return { hit: digit === (c.res === null ? 0 : assign[c.res]), carryOut };
  };
  let carry = 0, live = true;
  for (let i = 0; i < cols.length; i++) {
    const c = { ...cols[i], _a: assign };
    const last = i === cols.length - 1;
    const full = [...c.top, ...c.sub, c.res].every((ch) => ch === null || assign[ch] !== undefined);
    if (live) {
      out[i].carryIn = carry;
      if (!full) { live = false; continue; }
      const r = test(c, carry);
      out[i].ok = r.hit && (!last || r.carryOut === 0);
      if (!out[i].ok) { live = false; continue; }
      carry = r.carryOut;
    } else if (full) {
      let any = false;
      for (let k = 0; k <= 2 && !any; k++) {
        const r = test(c, k);
        if (r.hit && (!last || r.carryOut === 0)) any = true;
      }
      if (!any) out[i].ok = false;
    }
  }
  return out;
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

function freshState() {
  return {
    v: 1,
    assign: {},               // letter -> digit
    excl: {},                 // letter -> [digits crossed off in Notes mode]
    carry: {},                // column index -> penciled carry/borrow (scratch only)
    status: 'playing',        // playing | done | lost
    fails: 0,
    t0: null,
    tEnd: null,
  };
}

export default function CipherClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_cipher_${PUZZLE.num}`;
  const LETTERS = useMemo(() => [...new Set((PUZZLE.lhs.join('') + PUZZLE.rhs).split(''))].sort(), [PUZZLE]);
  const FIRSTS = useMemo(() => new Set([...PUZZLE.lhs, PUZZLE.rhs].map((w) => w[0])), [PUZZLE]);
  const maxLen = Math.max(...PUZZLE.lhs.map((w) => w.length), PUZZLE.rhs.length);
  const OP = PUZZLE.op || 'add';
  const opGlyph = OP === 'sub' ? '−' : '+';
  const opWord = OP === 'sub' ? 'subtraction' : 'addition';
  const carryWord = OP === 'sub' ? 'borrow' : 'carry';
  const eqnText = `${PUZZLE.lhs.join(` ${opGlyph} `)} = ${PUZZLE.rhs}`;

  const COLS = useMemo(() => buildColumns(OP, PUZZLE.lhs, PUZZLE.rhs), [OP, PUZZLE]);

  const [g, setG] = useState(freshState);
  const [noteMode, setNoteMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [verdict, setVerdict] = useState(null);   // { good, msg }
  const [clearArmed, setClearArmed] = useState(false);
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
  const won = g.status === 'done' && g.fails === 0;
  const score = g.status === 'done' ? Math.max(1, TOTAL - g.fails) : 0;

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
        if (saved && saved.v === 1 && saved.assign) setG({ ...freshState(), ...saved });
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
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_cipher_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_cipher_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live game clock. `elapsed` below is derived from the current time, and it
  // used to read Date.now() during render, so the displayed clock only advanced
  // when something else happened to re-render the board. This ticks a state
  // value while the game is actually running, so the readout moves on its own.
  // Display only: the elapsed time recorded on the result is still computed
  // from a real Date.now() delta at the moment the game ends.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (g.status !== 'playing' || !g.t0 || g.tEnd) return undefined;
    setNowTick(Date.now());
    const iv = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(iv);
  }, [g.status, g.t0, g.tEnd]);

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

  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  // Live column read-out. Free, and recomputed on every assignment.
  const colInfo = useMemo(() => deriveColumns(COLS, g.assign, OP), [COLS, g.assign, OP]);
  const colsSolved = colInfo.every((c) => c.ok === true);
  const badCol = colInfo.some((c) => c.ok === false);

  const REC_KEY = `sot_cipher_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    // A play counts only once the player actually acts (assigns a digit or fails a
    // check). Merely opening the puzzle and dismissing the start gate does not log.
    const acted = Object.keys(g.assign).length > 0 || g.fails > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.fails, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = failed checks, so the daily board's ties break by the
        // cleaner solve.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.fails, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // Pressing Start begins the clock (sets t0) and marks the rules as seen.
  // A no-op once started, so re-reading the rules later never resets the timer.
  function startGame() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  // Tap to select. Tapping the letter that is already selected CLEARS its digit
  // when it has one (and keeps it selected, ready for a replacement), so fixing a
  // wrong digit takes a second tap on the cell instead of a trip to the erase
  // button. An empty selected cell still just deselects, as before.
  function tapLetter(ch) {
    if (!playing) return;
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    if (selected === ch && g.assign[ch] !== undefined) {
      setG((cur) => {
        const assign = { ...cur.assign };
        delete assign[ch];
        return { ...cur, assign };
      });
      setVerdict(null);
      return;
    }
    setSelected((s) => (s === ch ? null : ch));
  }
  // Assign a digit to a named letter, then jump to the next unassigned one.
  function assignTo(ch, d) {
    if (!playing) return;
    setG((prev) => ({ ...prev, assign: { ...prev.assign, [ch]: d }, t0: prev.t0 || Date.now() }));
    const after = { ...g.assign, [ch]: d };
    const next = LETTERS.find((l) => after[l] === undefined);
    setSelected(next !== undefined ? next : null);
    setVerdict(null);
  }
  // Notes mode: cross a candidate off a letter instead of assigning it. Purely
  // the player's bookkeeping, so it never costs a point and never blocks a move.
  function toggleExcl(ch, d) {
    if (!playing) return;
    setG((prev) => {
      const cur = prev.excl[ch] || [];
      const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d];
      return { ...prev, excl: { ...prev.excl, [ch]: next }, t0: prev.t0 || Date.now() };
    });
  }
  function setDigit(d) {
    if (!playing) return;
    if (selected === null) { say('Pick a letter first, then a digit.'); return; }
    if (noteMode) { toggleExcl(selected, d); return; }
    assignTo(selected, d);
  }
  // Pencil a carry the board cannot derive yet: blank -> 0 -> 1 -> 2 -> blank.
  // Scratch only, exactly like writing it above the column on paper: it is never
  // used to judge a column, so it can never mislead.
  function cycleCarry(i) {
    if (!playing) return;
    setG((prev) => {
      const cur = prev.carry[i];
      const carry = { ...prev.carry };
      if (cur === undefined) carry[i] = 0;
      else if (cur >= 2) delete carry[i];
      else carry[i] = cur + 1;
      return { ...prev, carry, t0: prev.t0 || Date.now() };
    });
  }
  function eraseSelected() {
    if (!playing || selected === null) return;
    setG((cur) => {
      const assign = { ...cur.assign };
      delete assign[selected];
      return { ...cur, assign };
    });
  }

  useEffect(() => {
    if (!playing) return undefined;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[0-9]$/.test(e.key)) { if (selected !== null) { setDigit(+e.key); e.preventDefault(); } }
      else if (/^[a-zA-Z]$/.test(e.key) && LETTERS.includes(e.key.toUpperCase())) { tapLetter(e.key.toUpperCase()); e.preventDefault(); }
      else if (e.key === 'Backspace') { eraseSelected(); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, selected, g.assign, LETTERS]);

  function check() {
    if (!playing) return;
    const missing = LETTERS.filter((l) => g.assign[l] === undefined);
    if (missing.length) { setVerdict({ good: false, soft: true, msg: `Still unassigned: ${missing.join(', ')}` }); return; }
    const failIt = (msg) => {
      setG((cur) => ({ ...cur, fails: cur.fails + 1, t0: cur.t0 || Date.now() }));
      setVerdict({ good: false, msg });
    };
    const digitsUsed = new Set(Object.values(g.assign));
    if (digitsUsed.size !== LETTERS.length) { setVerdict({ good: false, soft: true, msg: 'Two letters share a digit, every letter must be different.' }); return; }
    for (const f of FIRSTS) { if (g.assign[f] === 0) { setVerdict({ good: false, soft: true, msg: `${f} starts a word, so it can't be 0.` }); return; } }
    const num = (w) => [...w].reduce((acc, ch) => acc * 10 + g.assign[ch], 0);
    const rhsVal = num(PUZZLE.rhs);
    const lhsVal = OP === 'sub' ? PUZZLE.lhs.slice(1).reduce((a, w) => a - num(w), num(PUZZLE.lhs[0]))
      : PUZZLE.lhs.reduce((a, w) => a + num(w), 0);
    if (lhsVal !== rhsVal) {
      failIt(`${PUZZLE.lhs.map(num).join(` ${opGlyph} `)} = ${lhsVal}, not ${rhsVal}. Back to the columns…`);
      return;
    }
    const g2 = { ...g, status: 'done', tEnd: Date.now(), t0: g.t0 || Date.now() };
    setG(g2);
    setVerdict(null);
    setEndClosed(false);
    postResult(g2, Math.max(1, TOTAL - g2.fails));
  }

  function reveal() {
    if (!playing) return;
    const sol = solveCipher(PUZZLE.op || 'add', PUZZLE.lhs, PUZZLE.rhs);
    const g2 = { ...g, assign: sol || g.assign, status: 'lost', tEnd: Date.now(), t0: g.t0 || Date.now() };
    setG(g2);
    setVerdict(null);
    setEndClosed(false);
    postResult(g2, 0);
  }

  function clearAll() {
    if (!playing) return;
    if (Object.keys(g.assign).length === 0) { setClearArmed(false); return; }
    if (!clearArmed) { setClearArmed(true); setTimeout(() => setClearArmed(false), 3000); return; }
    setClearArmed(false);
    setG((cur) => ({ ...cur, assign: {}, excl: {}, carry: {} }));
    setSelected(null);
    setVerdict(null);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setSelected(null); setVerdict(null); setEndClosed(false);
  }

  function shareText() {
    const solvedBit = g.status === 'done'
      ? `🔐 Cracked in ${elapsed} · ${g.fails} failed check${g.fails === 1 ? '' : 's'}`
      : '🔒 The cipher beat me today';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    return `Cipher #${PUZZLE.num} · ${eqnText}\n${solvedBit}${streakBit}\n${shareUrl()}`;
  }
  function shareUrl() {
    return withRef(`mindloftdaily.com/cipher${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function copyShare() {
    const text = playing
      ? `Cipher #${PUZZLE.num} — the daily cryptarithm from Mind Loft.\n${shareUrl()}`
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

  // digit -> letters owning it
  const digitOwners = {};
  for (const [l, d] of Object.entries(g.assign)) { (digitOwners[d] = digitOwners[d] || []).push(l); }

  // The carry (addition) / borrow (subtraction) written above each column.
  // A derived value is shown solid and locked; beyond the derived frontier the
  // cell is an empty pencil slot the player can cycle through 0/1/2.
  function renderCarryRow() {
    const cells = [];
    for (let k = 0; k < maxLen; k++) {
      const i = maxLen - 1 - k;
      const usable = i >= 1 && i < COLS.length;
      const derived = usable && colInfo[i] && colInfo[i].carryIn !== null ? colInfo[i].carryIn : null;
      const penciled = g.carry[i];
      const shown = derived !== null ? derived : (penciled !== undefined ? penciled : '');
      cells.push(
        <button
          key={`k${k}`}
          type="button"
          className={`cf-carry${derived !== null ? ' fixed' : ''}${usable && playing ? '' : ' off'}`}
          disabled={!usable || derived !== null || !playing}
          onClick={() => cycleCarry(i)}
          aria-label={usable ? `${carryWord} into column ${i + 1}${shown === '' ? ', not set' : `, ${shown}`}` : undefined}
        >
          {shown}
        </button>
      );
    }
    return <div className="cf-row cf-carrow" key="carry"><span className="cf-op" />{cells}</div>;
  }
  // One free mark per column: ✓ when the column is fully determined and lands,
  // ✗ when it cannot land under any legal carry. Costs nothing.
  function renderMarkRow() {
    const cells = [];
    for (let k = 0; k < maxLen; k++) {
      const i = maxLen - 1 - k;
      const ok = i < COLS.length && colInfo[i] ? colInfo[i].ok : null;
      cells.push(
        <span key={`m${k}`} className={`cf-mk${ok === true ? ' good' : ok === false ? ' bad' : ''}`} aria-hidden={ok === null}>
          {ok === true ? '✓' : ok === false ? '✗' : ''}
        </span>
      );
    }
    return <div className="cf-row cf-mkrow" key="marks"><span className="cf-op" />{cells}</div>;
  }
  // Digits still open to a letter: everything not taken by another letter, minus
  // 0 on a leading letter. Player-crossed candidates stay visible but struck, so
  // a wrong elimination can be undone.
  function candidatesFor(ch) {
    const taken = new Set(Object.entries(g.assign).filter(([l]) => l !== ch).map(([, d]) => d));
    const out = [];
    for (let d = 0; d < 10; d++) {
      if (taken.has(d)) continue;
      if (d === 0 && FIRSTS.has(ch)) continue;
      out.push(d);
    }
    return out;
  }

  function renderRow(word, op, key) {
    const cells = [];
    for (let i = 0; i < maxLen - word.length; i++) cells.push(<span key={`sp${i}`} className="cf-cell" style={{ visibility: 'hidden' }} />);
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const d = g.assign[ch];
      const conflict = d !== undefined && digitOwners[d] && digitOwners[d].length > 1;
      cells.push(
        <button
          key={`c${i}`}
          type="button"
          className={`cf-cell${selected === ch ? ' on' : ''}${conflict ? ' bad' : ''}`}
          onClick={() => tapLetter(ch)}
          aria-label={`Letter ${ch}${d !== undefined ? `, digit ${d}` : ', unassigned'}`}
        >
          <span className="cf-ch">{ch}</span>
          <span className="cf-dg">{d !== undefined ? d : '·'}</span>
        </button>
      );
    }
    return (
      <div key={key} className="cf-row">
        <span className="cf-op">{op || ''}</span>
        {cells}
      </div>
    );
  }

  // Shared rules body — rendered in both the how-to-play modal and the start gate.
  const strategyLine = (<>There is <b>exactly one solution</b>, and you can reach it by pure logic &mdash; start with the leftmost column of the answer, and let the carries do the talking. No guessing required.</>);
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>Today&rsquo;s equation is a <b>cryptarithm</b>: every letter stands for a different digit, 0&ndash;9, and the {opWord} must work out. Letters that start a word are never zero.</p>
      <p style={{ margin: '0 0 9px' }}>Tap a letter, then tap a digit (or just type). Tap a filled letter again to clear it. The pad shows which letter owns each digit; if two letters share one, both flag red.</p>
      <p style={{ margin: '0 0 9px' }}>The board keeps the scratch work for you. The <b>key rack</b> lists the digits still open to each letter, dropping any digit taken elsewhere; hit <b>Notes</b> to cross off more. The <b>{carryWord} row</b> above the equation fills itself in as far as your digits allow, and you can pencil the rest. Under each column, a <b>✓ or ✗</b> tells you exactly which column works, so a wrong digit turns up where it happened.</p>
      <p style={{ margin: '0 0 9px' }}>Those column marks are <b>free</b>. Only the Check button is scored.</p>
      <p style={{ margin: '0 0 9px' }}>{strategyLine}</p>
      <p style={{ margin: 0 }}>Solve it for up to <b>10 points</b>: a clean first check is a perfect 10, and every failed check costs one. Ties on the daily board break by fewest failed checks, then fastest time.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      {/* Shared daily chrome (app/DailyChrome.jsx): home masthead + stat bar +
          today's slate rail, collapsing to one line once the clock runs. Outside
          the page wrapper so the bands run full bleed; nothing here is pinned. */}
      <DailyChrome slug="cipher" name="Cipher" collapsed={started} />
      <div className="cf-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.cf-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .cf-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cf-btn:hover{background:var(--accent-soft);}
          .cf-btn.primary{background:${COLORS.accent};border-color:${COLORS.accent};color:var(--white);}
          .cf-btn.primary:hover{background:#0c5f59;}
          .cf-btn.primary.ready{box-shadow:0 0 0 3px rgba(15,118,110,0.22);}
          .cf-row{display:flex;justify-content:flex-end;align-items:center;gap:4px;margin:3px 0;}
          .cf-op{width:26px;font-size:22px;font-weight:800;color:${COLORS.faded};text-align:center;flex:0 0 auto;}
          .cf-cell{width:46px;height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:9px;cursor:pointer;border:1.5px solid rgba(28,30,36,0.14);background:var(--white);padding:0;font-family:${SANS};}
          .cf-cell:hover{background:${COLORS.accentSoft};}
          .cf-cell.on{border-color:${COLORS.accent};background:${COLORS.accentSoft};box-shadow:0 0 0 2px rgba(15,118,110,0.25);}
          .cf-cell .cf-ch{font-size:21px;font-weight:800;color:${COLORS.ink};line-height:1.1;}
          .cf-cell .cf-dg{font-size:14px;font-weight:800;color:${COLORS.accent};height:17px;line-height:1.2;font-variant-numeric:tabular-nums;}
          .cf-cell.bad .cf-dg{color:${COLORS.rust};}
          .cf-rule{border-top:3px solid ${COLORS.ink};margin:7px 0 6px;}
          .cf-carrow,.cf-mkrow{margin:0;}
          .cf-carry{width:46px;height:20px;flex:0 0 auto;border-radius:5px;border:1px dashed rgba(28,30,36,0.22);background:transparent;font-family:${MONO};font-size:12px;font-weight:500;color:${COLORS.faded};cursor:pointer;padding:0;line-height:1;}
          .cf-carry:hover:not(:disabled){background:${COLORS.accentSoft};border-color:${COLORS.accent};}
          .cf-carry.fixed{border:1px solid transparent;color:${COLORS.accent};font-weight:700;cursor:default;}
          .cf-carry.off{border-color:transparent;cursor:default;}
          .cf-mk{width:46px;height:18px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;line-height:1;color:transparent;}
          .cf-mk.good{color:${COLORS.green};}
          .cf-mk.bad{color:${COLORS.rust};}
          .cf-rack{display:grid;grid-template-columns:repeat(auto-fill,minmax(164px,1fr));gap:6px;margin:0 0 12px;}
          .cf-chip{display:flex;align-items:center;gap:7px;border:1.5px solid rgba(28,30,36,0.14);border-radius:8px;background:var(--white);padding:5px 7px;cursor:pointer;min-height:34px;}
          .cf-chip:hover{border-color:${COLORS.accent};}
          .cf-chip.on{border-color:${COLORS.accent};background:${COLORS.accentSoft};}
          .cf-chip.lone{border-color:${COLORS.green};}
          .cf-chl{font-size:15px;font-weight:800;color:${COLORS.ink};width:14px;text-align:center;flex:0 0 auto;}
          .cf-chd{font-family:${MONO};font-size:16px;font-weight:500;color:${COLORS.accent};font-variant-numeric:tabular-nums;}
          .cf-cands{display:flex;flex-wrap:wrap;gap:1px;}
          .cf-cd{font-family:${MONO};font-size:11.5px;font-weight:500;line-height:1;color:${COLORS.faded};background:none;border:none;border-radius:3px;padding:3px 2.5px;cursor:pointer;font-variant-numeric:tabular-nums;}
          .cf-cd:hover{background:${COLORS.accentSoft};color:${COLORS.accent};}
          .cf-cd.out{color:rgba(28,30,36,0.24);text-decoration:line-through;}
          .cf-pad{display:grid;grid-template-columns:repeat(5,54px);gap:7px;justify-content:center;}
          .cf-pk{position:relative;height:50px;border-radius:9px;border:1.5px solid rgba(28,30,36,0.2);background:var(--white);font-size:19px;font-weight:800;cursor:pointer;font-family:${SANS};color:${COLORS.ink};}
          .cf-pk:hover{background:${COLORS.accentSoft};}
          .cf-pk .who{position:absolute;top:2px;right:5px;font-size:9px;color:${COLORS.accent};font-weight:800;letter-spacing:0.02em;}
          .cf-pk.foot{height:38px;font-size:11.5px;text-transform:uppercase;letter-spacing:0.06em;color:${COLORS.faded};display:inline-flex;align-items:center;justify-content:center;gap:6px;}
          .cf-pk.note{grid-column:span 2;}
          .cf-pk.foot:not(.note){grid-column:span 3;}
          .cf-pk.note.on{background:${COLORS.accent};border-color:${COLORS.accent};color:var(--white);}
          .cf-pad.notes .cf-pk:not(.foot){border-style:dashed;border-color:${COLORS.accent};}
          @media(max-width:560px){.cf-cell{width:40px;height:52px;}.cf-cell .cf-ch{font-size:18px;}.cf-pad{grid-template-columns:repeat(5,1fr);width:100%;}.cf-carry,.cf-mk{width:40px;}.cf-rack{grid-template-columns:repeat(auto-fill,minmax(148px,1fr));}}
        `}</style>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>


        {/* masthead: pressed CIPHER tiles with No./date inline */}
        <DailyMasthead
          slug="cipher"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={4}
          helpTop={8}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; {OP === 'sub' ? 'Three-term subtraction' : 'Three addends'}</span>}
          blocks={'CIPHER'.split('').map((ch, i) => (
              <div key={i} style={{ width: 38, height: 38, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 22, background: i === 0 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {/* start tile — sits where the board goes; the equation stays sealed
            (not rendered) until the player presses Start, which begins the clock. */}
        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', maxWidth: 472, margin: '0 auto 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Cipher is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Assign a different digit to every letter so the {opWord} works out. The equation stays sealed until you begin.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="cf-btn" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* the equation */}
        {!preStart && (
        <div style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '18px 20px 16px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12, maxWidth: 472, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.14)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>every letter is a digit · {opWord}</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>failed checks <b style={{ color: g.fails ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{g.fails}</b></span>
          </div>
          <div style={{ maxWidth: (maxLen + 1) * 50, margin: '0 auto' }}>
            {renderCarryRow()}
            {PUZZLE.lhs.map((w, i) => renderRow(w, (OP === 'sub' ? i > 0 : i === PUZZLE.lhs.length - 1) ? opGlyph : '', `l${i}`))}
            <div className="cf-rule" />
            {renderRow(PUZZLE.rhs, '', 'r')}
            {renderMarkRow()}
          </div>
          {playing && (
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.faded, textAlign: 'center', marginTop: 2 }}>
              {carryWord}s on top · column checks below · both free
            </div>
          )}
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, textAlign: 'center', margin: '10px 0 8px', minHeight: 16 }}>
            {playing
              ? (noteMode
                  ? (selected !== null
                      ? <>Notes on: crossing candidates off <b style={{ color: COLORS.accent }}>{selected}</b></>
                      : 'Notes on: pick a letter, then tap digits to cross them off.')
                  : (selected !== null
                      ? <>Assigning a digit to <b style={{ color: COLORS.accent }}>{selected}</b>{g.assign[selected] !== undefined ? <> · tap {selected} again to clear</> : null}</>
                      : 'Tap a letter, then a digit — or just type.'))
              : null}
          </div>

          {/* The key rack: every letter, its digit, and the digits still open to
              it. Digits taken elsewhere and 0 on a leading letter drop out on
              their own, which is the bookkeeping players were doing on paper. */}
          {playing && (
            <div className="cf-rack">
              {LETTERS.map((ch) => {
                const d = g.assign[ch];
                const ex = g.excl[ch] || [];
                const cands = candidatesFor(ch);
                const lone = d === undefined && cands.filter((n) => !ex.includes(n)).length === 1;
                return (
                  <div key={ch} className={`cf-chip${selected === ch ? ' on' : ''}${lone ? ' lone' : ''}`} onClick={() => tapLetter(ch)}>
                    <span className="cf-chl">{ch}</span>
                    {d !== undefined ? (
                      <span className="cf-chd">{d}</span>
                    ) : (
                      <span className="cf-cands">
                        {cands.map((n) => (
                          <button
                            key={n}
                            type="button"
                            className={`cf-cd${ex.includes(n) ? ' out' : ''}`}
                            onClick={(e) => { e.stopPropagation(); if (noteMode) toggleExcl(ch, n); else assignTo(ch, n); }}
                            aria-label={`${noteMode ? 'Cross off' : 'Set'} ${ch} = ${n}`}
                          >{n}</button>
                        ))}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {playing && (
            <div className={`cf-pad${noteMode ? ' notes' : ''}`}>
              {Array.from({ length: 10 }, (_, d) => (
                <button key={d} type="button" className="cf-pk" onClick={() => setDigit(d)}>
                  {d}
                  {digitOwners[d] && digitOwners[d].length ? <span className="who">{digitOwners[d].join('')}</span> : null}
                </button>
              ))}
              <button type="button" className={`cf-pk foot note${noteMode ? ' on' : ''}`} onClick={() => setNoteMode((v) => !v)} aria-pressed={noteMode}><Pencil size={13} /> notes {noteMode ? 'on' : 'off'}</button>
              <button type="button" className="cf-pk foot" onClick={eraseSelected}><Delete size={13} /> erase letter</button>
            </div>
          )}
          {verdict && (
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: verdict.soft ? COLORS.faded : COLORS.rust, textAlign: 'center', marginTop: 10, lineHeight: 1.45 }}>
              {verdict.msg}
            </div>
          )}
          {playing && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
              <button type="button" className={`cf-btn primary${colsSolved ? ' ready' : ''}`} onClick={check}><Lock size={14} strokeWidth={2.6} /> Check solution</button>
              <button type="button" className="cf-btn" onClick={clearAll} style={clearArmed ? { borderColor: COLORS.rust, color: COLORS.rust } : undefined}>{clearArmed ? 'Clear all — tap again' : 'Clear'}</button>
              {g.fails >= 3 && (
                <button type="button" className="cf-btn" style={{ borderColor: '#c3c8cf', color: COLORS.faded }} onClick={reveal}>Reveal (ends the day)</button>
              )}
            </div>
          )}
          {playing && (badCol || colsSolved) && (
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, textAlign: 'center', marginTop: 8, color: badCol ? COLORS.rust : COLORS.green }}>
              {badCol
                ? `A column is marked ✗ — checking now costs a point.`
                : `Every column checks out. Lock it in.`}
            </div>
          )}
        </div>
        )}

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.white, border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : g.status === 'done' ? COLORS.ink : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {g.status === 'done'
                    ? (won ? `${eqnText} — cracked clean, first check.` : `Cracked with ${g.fails} failed check${g.fails === 1 ? '' : 's'}.`)
                    : 'The cipher kept its secret today.'}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Cipher in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new equation drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/cipher?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Cipher &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/cipher" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Cipher &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="cipher"
            maxWidth={640}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="cipher" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider
          />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: T.white, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: T.white, borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Cipher to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s equation, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s equation, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: T.white, cursor: 'pointer' }}>Got it</button>
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

      {/* the end-of-puzzle popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="cipher"
          won={won}
          completed={g.status === 'done'}
          headline={g.status === 'done' ? <>You cracked the cipher</> : <>The cipher held</>}
          subline={<>Cipher #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.fails} failed check{g.fails === 1 ? '' : 's'} &middot; {elapsed}</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame}
          onClose={() => setEndClosed(true)}
        />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: T.white, fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
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
            <button className="cf-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      {/* About Cipher — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Cipher</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Cipher is a free daily cryptarithm puzzle from Mind Loft. Each day serves one alphametic equation &mdash; the classic puzzle form where SEND + MORE = MONEY and every letter hides a digit. Assign a different digit to each letter so the arithmetic works, and know that the puzzle is machine-verified to have exactly one solution: if your logic is sound, you never have to guess.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The craft is in the columns, and Cipher hands you the tools instead of asking you to reach for paper. A key rack tracks the digits still open to every letter, the carry row above the equation fills itself in as far as your digits reach, and each column carries its own &#10003; or &#10007; the moment it is decided &mdash; all of it free. The leftmost letter of the answer is usually forced by a carry; from there each column narrows the field until the whole equation clicks open. A clean solve on the first check is a perfect 10 &mdash; every failed check costs a point, and the daily leaderboard breaks ties by fewer failed checks, then time.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new equation drops every day at midnight Eastern, and the operation rotates so no two days repeat: addition and subtraction, with a bigger three-term equation in the Sunday Edition. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our number-balancing puzzle, and <a href="/alibi" style={{ color: COLORS.ink, fontWeight: 800 }}>Alibi</a>, our whodunit logic puzzle.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
