'use client';

// Carve — the daily equal-sum partition puzzle.
//
// Each day: an NxN grid of digits and a set of colored anchors, one per region.
// Grow every region out from its anchor so the grid is carved into connected
// blocks that all sum to the same target. The moment a region hits the target
// it is checked: a true region locks in; a wrong one shakes red, clears back to
// its anchor, and counts as an error. Score is 10 minus your errors, floor 1 —
// a clean carve is a perfect 10, and ties break on fewest errors then fastest
// time. One free hint paints a correct square.
//
// Same daily plumbing as Tally/Suds: banked boards gated by Eastern date on the
// server (app/carve/page.js), per-puzzle localStorage saves, /carve?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. Weekdays are
// a 6x6 grid in six regions; Sundays step up to a 7x7 grid in nine regions.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, Lightbulb, Eye, Smartphone, Eraser } from 'lucide-react';
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
  faded: '#4b5563',
  accent: '#7c3aed',       // Carve identity — plum
  accentSoft: '#f5f0ff',
  green: '#15803d',
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_carve_help_seen';
const STATS_KEY = 'sot_carve_stats';

// Region palette — up to nine visually distinct hues. `soft` fills a painted
// square, `mid` fills a locked one, `line` draws the anchor ring and the carve
// borders. Digits stay ink on every fill.
const REGION_HUES = [
  { soft: '#ede4ff', mid: '#d9c8fb', line: '#7c3aed' }, // plum
  { soft: '#dcefff', mid: '#bcdcfa', line: '#0a1730' }, // sky
  { soft: '#ffefd6', mid: '#fcd9a4', line: '#c2700a' }, // amber
  { soft: '#ddf5e5', mid: '#b6e6c6', line: '#15803d' }, // green
  { soft: '#ffe3e0', mid: '#fac1bb', line: '#cc3527' }, // coral
  { soft: '#fde4f1', mid: '#f8c1dd', line: '#c02572' }, // pink
  { soft: '#e2f3f5', mid: '#bde3e8', line: '#0e7490' }, // teal
  { soft: '#f0ecd9', mid: '#e0d7ae', line: '#8a6d1a' }, // gold
  { soft: '#e8e9ef', mid: '#cfd2de', line: '#4b5563' }, // slate
];

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

// ─── Personal stats + streak (localStorage), Tally/Suds pattern ─────────────
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

function freshState(T) {
  return {
    v: 1,
    assign: Array(T).fill(-1),  // player region per cell (-1 = uncarved; anchors are pre-set on load)
    locked: [],                 // region indexes confirmed correct
    errors: 0,                  // wrong regions committed
    hintUsed: false,
    status: 'playing',          // playing | won | revealed
    t0: null,
    tEnd: null,
  };
}

export default function CarveClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const N = PUZZLE.size;
  const R = PUZZLE.regions;
  const T = N * N;
  const TARGET = PUZZLE.target;
  const STORE_KEY = `sot_carve_${PUZZLE.num}`;
  const gridFlat = useMemo(() => PUZZLE.grid.flat(), [PUZZLE]);
  const solFlat = useMemo(() => PUZZLE.sol.flat(), [PUZZLE]);
  const seedIdx = useMemo(() => PUZZLE.seeds.map(([r, c]) => r * N + c), [PUZZLE, N]);
  const seedOf = useMemo(() => {
    const m = Array(T).fill(-1);
    seedIdx.forEach((s, g) => { m[s] = g; });
    return m;
  }, [seedIdx, T]);

  const seededFresh = useCallback(() => {
    const s = freshState(T);
    seedIdx.forEach((cell, g) => { s.assign[cell] = g; });
    return s;
  }, [T, seedIdx]);

  const [g, setG] = useState(seededFresh);
  const [cur, setCur] = useState(0);          // selected region (palette chip)
  const [flash, setFlash] = useState(null);   // {cells:[...]} briefly red after a wrong carve
  const [bounce, setBounce] = useState(-1);   // cell that refused a paint (over target)
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false); // start tile: full rules (first-timer) vs compact card
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
  const flashTimer = useRef(null);
  const viewedRef = useRef(false);

  const assign = g.assign;
  const locked = g.locked;
  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
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
        if (saved && saved.v === 1 && Array.isArray(saved.assign) && saved.assign.length === T) {
          setG({ ...seededFresh(), ...saved, locked: Array.isArray(saved.locked) ? saved.locked : [] });
        }
      }
      setGateRules(!localStorage.getItem(HELP_KEY));
    } catch (e) {}
    try { setStats(getStats()); } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
    // same-device day breadcrumb for cross-puzzle recs — TODAY'S puzzle only
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        (function(){ var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_carve_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_carve_day'); })();
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
              setStats((c) => mergeServerStats(c || getStats(), d.recent, puzzles));
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
  const finalScore = won ? Math.max(1, Math.min(10, 10 - Math.ceil(errors / 2))) : 0;
  const nbrsOf = useCallback((i) => {
    const r = Math.floor(i / N), c = i % N, out = [];
    if (r > 0) out.push(i - N);
    if (r < N - 1) out.push(i + N);
    if (c > 0) out.push(i - 1);
    if (c < N - 1) out.push(i + 1);
    return out;
  }, [N]);

  const regionSum = useCallback((asgn, reg) => {
    let s = 0;
    for (let i = 0; i < T; i++) if (asgn[i] === reg) s += gridFlat[i];
    return s;
  }, [T, gridFlat]);

  const sums = useMemo(() => {
    const out = Array(R).fill(0);
    for (let i = 0; i < T; i++) if (assign[i] >= 0) out[assign[i]] += gridFlat[i];
    return out;
  }, [assign, R, T, gridFlat]);

  const REC_KEY = `sot_carve_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const acted = g.errors > 0 || g.hintUsed || (Array.isArray(g.locked) && g.locked.length > 0) || g.assign.some((v, idx) => v >= 0 && seedOf[idx] < 0);
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
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

  // does removing `cell` keep region `reg` connected (anchor still reaches all)?
  function removalKeepsConnected(asgn, reg, cell) {
    const cells = [];
    for (let i = 0; i < T; i++) if (asgn[i] === reg && i !== cell) cells.push(i);
    if (!cells.length) return true;
    const set = new Set(cells);
    const start = seedIdx[reg];
    if (!set.has(start)) return false; // anchor can't be removed anyway
    const seen = new Set([start]);
    const st = [start];
    while (st.length) {
      const i = st.pop();
      for (const j of nbrsOf(i)) if (set.has(j) && !seen.has(j)) { seen.add(j); st.push(j); }
    }
    return seen.size === cells.length;
  }

  function commitCheck(g2, reg) {
    // region `reg` just hit the target — is it the true region?
    let ok = true;
    for (let i = 0; i < T; i++) {
      if ((g2.assign[i] === reg) !== (solFlat[i] === reg)) { ok = false; break; }
    }
    if (ok) {
      g2.locked = [...g2.locked, reg];
      if (g2.locked.length === R) {
        g2.status = 'won';
        g2.tEnd = Date.now();
      }
      return { ok: true };
    }
    // wrong carve: error, clear back to the anchor
    const cleared = [];
    const nextAssign = g2.assign.slice();
    for (let i = 0; i < T; i++) if (nextAssign[i] === reg && i !== seedIdx[reg]) { nextAssign[i] = -1; cleared.push(i); }
    g2.assign = nextAssign;
    g2.errors += 1;
    return { ok: false, cleared };
  }

  function cellClick(idx) {
    if (!playing) return;
    const here = assign[idx];
    // tap an anchor: select that region
    if (seedOf[idx] >= 0) { setCur(seedOf[idx]); return; }
    if (here >= 0) {
      // tap a painted square: un-carve it (locked regions stay put)
      if (locked.includes(here)) return;
      if (!removalKeepsConnected(assign, here, idx)) { say('Un-carve from the edges — that square holds the block together.'); return; }
      const nextAssign = assign.slice();
      nextAssign[idx] = -1;
      setG({ ...g, assign: nextAssign });
      setCur(here);
      return;
    }
    // paint into the selected region: must touch the block, must not overshoot
    const reg = cur;
    if (locked.includes(reg)) { say('That block is locked in — pick another color.'); return; }
    const touches = nbrsOf(idx).some((j) => assign[j] === reg);
    if (!touches) { say('Grow the block — carve squares that touch it.'); return; }
    const nextSum = sums[reg] + gridFlat[idx];
    if (nextSum > TARGET) {
      setBounce(idx);
      setTimeout(() => setBounce(-1), 420);
      say(`Too big — that square pushes the block past ${TARGET}.`);
      return;
    }
    const g2 = { ...g, assign: assign.slice(), locked: g.locked };
    g2.assign[idx] = reg;
    if (!g2.t0) g2.t0 = Date.now();
    if (nextSum === TARGET) {
      const res = commitCheck(g2, reg);
      if (!res.ok) {
        setFlash({ cells: [...res.cleared, idx] });
        if (flashTimer.current) clearTimeout(flashTimer.current);
        flashTimer.current = setTimeout(() => setFlash(null), 700);
        setG(g2);
        say('Right total, wrong cut — that block clears back to its anchor.');
        return;
      }
      setG(g2);
      if (g2.status === 'won') {
        postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(g2.errors / 2))));
        setJustWon(true);
      } else {
        // advance the brush to the next open region
        const nxt = [...Array(R).keys()].find((k) => !g2.locked.includes(k) && k !== reg);
        if (nxt != null) setCur(nxt);
      }
      return;
    }
    setG(g2);
  }

  // one free hint: paint one correct square of the selected (else first) open region
  function useHint() {
    if (!playing || g.hintUsed) return;
    let reg = !locked.includes(cur) ? cur : [...Array(R).keys()].find((k) => !locked.includes(k));
    if (reg == null) return;
    // first correct-but-unpainted cell of that region that touches its block
    let idx = -1;
    for (let i = 0; i < T; i++) {
      if (solFlat[i] === reg && assign[i] !== reg && nbrsOf(i).some((j) => assign[j] === reg)) { idx = i; break; }
    }
    if (idx < 0) return;
    const g2 = { ...g, assign: assign.slice(), locked: g.locked, hintUsed: true };
    // clear whoever held it (it can only be a not-yet-locked block)
    g2.assign[idx] = reg;
    if (!g2.t0) g2.t0 = Date.now();
    setCur(reg);
    if (regionSum(g2.assign, reg) === TARGET) {
      const res = commitCheck(g2, reg);
      if (res.ok && g2.status === 'won') {
        postResult(g2, Math.max(1, Math.min(10, 10 - Math.ceil(g2.errors / 2))));
        setG(g2); setJustWon(true); return;
      }
    }
    setG(g2);
    say('Hint carved — one square painted for you.');
  }

  function revealEnd() {
    const g2 = { ...g, assign: solFlat.slice(), locked: [...Array(R).keys()], status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setG(g2);
  }

  function startGame() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(seededFresh()); setCur(0); setJustWon(false); setEndClosed(false); setFlash(null);
  }

  // desktop keys: 1-9 select a region's brush
  const onKey = useCallback((e) => {
    if (!playing) return;
    const k = e.key;
    if (/^[1-9]$/.test(k)) {
      const reg = Number(k) - 1;
      if (reg < R && !locked.includes(reg)) setCur(reg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, R, locked]);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7EA}'.repeat(g5) + '⬜'.repeat(5 - g5); // plum squares
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Carve #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${errors === 0 ? 'clean cuts' : `${errors} error${errors === 1 ? '' : 's'}`} · ${elapsed}${hintBit}${streakBit}`
      : `Carve #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return withRef(`sourceoftruths.com/carve${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function copyShare() {
    const text = playing
      ? `Carve #${PUZZLE.num} — the daily equal-sum puzzle from Source of Truths.\n${shareUrl()}`
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

  // carve borders: a heavier edge wherever two different assignments meet
  function cellStyle(idx) {
    const r = Math.floor(idx / N), c = idx % N;
    const reg = assign[idx];
    const hue = reg >= 0 ? REGION_HUES[reg % REGION_HUES.length] : null;
    const isLocked = reg >= 0 && locked.includes(reg);
    let bg = '#fff';
    if (hue) bg = isLocked ? hue.mid : hue.soft;
    const edge = (j) => {
      if (j < 0) return true;
      return assign[j] !== reg;
    };
    const rightIdx = c < N - 1 ? idx + 1 : -1;
    const downIdx = r < N - 1 ? idx + N : -1;
    const thin = '1px solid rgba(28,30,36,0.16)';
    const thickColor = 'rgba(28,30,36,0.78)';
    return {
      background: bg,
      borderRight: c === N - 1 ? 'none' : (edge(rightIdx) && (reg >= 0 || (rightIdx >= 0 && assign[rightIdx] >= 0)) ? `2.5px solid ${thickColor}` : thin),
      borderBottom: r === N - 1 ? 'none' : (edge(downIdx) && (reg >= 0 || (downIdx >= 0 && assign[downIdx] >= 0)) ? `2.5px solid ${thickColor}` : thin),
    };
  }

  const lockedCount = locked.length;
  const cellPx = N === 7 ? 'clamp(15px, 4.6vw, 21px)' : 'clamp(16px, 5vw, 23px)';

  // Shared rules body — rendered in both the how-to-play modal and the start gate.
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>Carve the grid into <b>{R} connected blocks</b> that each add up to <b>{TARGET}</b>. Every block grows out from its <b>ringed anchor square</b>, and there is exactly one way to carve the board.</p>
      <p style={{ margin: '0 0 9px' }}>Pick a color below the board (or tap its anchor), then tap squares that <b>touch that block</b> to paint them in. Tap a painted square to un-carve it. The running total on each color chip shows how close its block is.</p>
      <p style={{ margin: '0 0 9px' }}>The moment a block hits {TARGET} it is checked: a true block <b>locks in</b>, a wrong one shakes <b style={{ color: COLORS.rust }}>red</b>, clears back to its anchor, and counts as an <b>error</b>. One free <b>hint</b> paints a correct square.</p>
      <p style={{ margin: 0 }}>Carve every block with <b>no errors</b> for a perfect 10 &mdash; every error costs a point. Ties break on fewest errors, then fastest time. Sundays go bigger: a 7&times;7 board in nine blocks.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="cv-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.cv-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .cv-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cv-btn:hover{background:${COLORS.paper};}
          @keyframes cvfade{from{opacity:0;}}
          @keyframes cvstamp{from{opacity:0;transform:scale(.94);}}
          @keyframes cvshake{0%,100%{transform:translateX(0);}25%{transform:translateX(-3px);}75%{transform:translateX(3px);}}
          @keyframes cvbounce{0%,100%{transform:scale(1);}50%{transform:scale(0.9);}}
          @media(max-width:560px){.cv-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.cv-ttl h1{font-size:21px;letter-spacing:0.02em;}.cv-ttl .cv-ttl-dt{font-size:15px;}.cv-ttl-dot{display:none;}}
          .cv-cell{display:flex;align-items:center;justify-content:center;font-family:${MONO};box-sizing:border-box;cursor:pointer;position:relative;user-select:none;-webkit-tap-highlight-color:transparent;min-width:0;min-height:0;overflow:hidden;transition:background .12s;}
          .cv-cell.cv-wrongflash{background:#fdecec !important;animation:cvshake .32s ease;}
          .cv-cell.cv-bounce{animation:cvbounce .3s ease;}
          .cv-seed-ring{position:absolute;inset:14%;border-radius:99px;pointer-events:none;}
          .cv-chip{position:relative;border:none;border-radius:9px;cursor:pointer;padding:7px 4px 6px;display:flex;flex-direction:column;align-items:center;gap:2px;font-family:${MONO};background:#fff;box-shadow:0 2px 0 rgba(28,30,36,0.35);border:1.5px solid rgba(28,30,36,0.4);min-width:0;}
          .cv-chip:active{transform:translateY(1px);box-shadow:0 1px 0 rgba(28,30,36,0.35);}
          .cv-chip.on{border-width:2.5px;}
          .cv-chip.done{opacity:.55;box-shadow:none;cursor:default;}
          .cv-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* puzzle-native top strip: quiet nav + player chip */}
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed CARVE tiles with No./date inline */}
        <DailyMasthead
          slug="carve"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Big Board</span>}
          blocks={'CARVE'.split('').map((ch, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 23, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {/* start tile — sits where the board goes; the board stays hidden until
            the player presses Start, which begins the clock. */}
        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Carve is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Carve the grid into connected blocks that each add up to the same target.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="cv-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* the board */}
        {!preStart && (
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>every block <b style={{ color: COLORS.accent, fontWeight: 500 }}>= {TARGET}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>errors <b style={{ color: errors > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{errors}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>blocks <b style={{ color: lockedCount === R ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{lockedCount}</b>/{R}</span>
          </div>

          {/* the grid */}
          <div style={{ maxWidth: N === 7 ? 476 : 456, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${N}, minmax(0, 1fr))`, aspectRatio: '1', border: `2.5px solid rgba(28,30,36,0.85)`, borderRadius: 4, overflow: 'hidden' }}>
              {Array.from({ length: T }).map((_, idx) => {
                const reg = assign[idx];
                const hue = reg >= 0 ? REGION_HUES[reg % REGION_HUES.length] : null;
                const isSeed = seedOf[idx] >= 0;
                const wrongFlash = flash && flash.cells.includes(idx);
                return (
                  <div key={idx} className={`cv-cell${wrongFlash ? ' cv-wrongflash' : ''}${bounce === idx ? ' cv-bounce' : ''}`} style={cellStyle(idx)} onClick={() => cellClick(idx)}>
                    {isSeed && hue && <span className="cv-seed-ring" style={{ border: `2.5px solid ${hue.line}` }} />}
                    <span style={{ fontSize: cellPx, fontWeight: isSeed ? 700 : 500, color: COLORS.ink, position: 'relative' }}>{gridFlat[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* region brushes */}
          {playing && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${R}, minmax(0, 1fr))`, gap: 5, maxWidth: N === 7 ? 476 : 456, margin: '16px auto 0' }}>
                {Array.from({ length: R }).map((_, k) => {
                  const hue = REGION_HUES[k % REGION_HUES.length];
                  const done = locked.includes(k);
                  const on = cur === k && !done;
                  return (
                    <button key={k} className={`cv-chip${on ? ' on' : ''}${done ? ' done' : ''}`} onClick={() => { if (!done) setCur(k); }}
                      aria-label={`carve block ${k + 1}`}
                      style={{ borderColor: on ? hue.line : undefined, background: done ? hue.mid : (on ? hue.soft : '#fff') }}>
                      <span style={{ width: 14, height: 14, borderRadius: 99, background: hue.line, display: 'inline-block' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 500, color: done ? COLORS.faded : COLORS.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {done ? '✓' : `${sums[k]}/${TARGET}`}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                {!identity && !g.hintUsed && (
                  <button className="cv-tool" onClick={useHint} title="Paint one correct square (one hint per puzzle)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(124,58,237,0.5)', color: '#5b21b6' }}>
                    <Lightbulb size={14} /> Hint
                  </button>
                )}
                <span className="cv-tool" style={{ cursor: 'default', borderStyle: 'dashed', color: COLORS.faded }}>
                  <Eraser size={14} /> Tap a painted square to un-carve it
                </span>
              </div>
            </>
          )}
        </div>
        )}

        {/* controls */}
        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              Pick a color, then tap squares next to its ringed anchor. A block locks when it hits {TARGET} on the nose.
            </span>
            {identity && (g.t0 || errors > 0) && (
              <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} /> {armReveal ? 'Tap again — ends the puzzle and shows the carving' : 'Reveal & end'}
              </button>
            )}
          </div>
        )}

        {/* result */}
        {!playing && (
          <>
          <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
            {isTodays ? (
              <>
                {countdown ? <>Next Carve in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new board drops at midnight Eastern.'}
                {prevPuzzle && (
                  <>
                    {' '}Meanwhile:{' '}
                    <a href={`/carve?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                      play yesterday&rsquo;s Carve &rarr;
                    </a>
                  </>
                )}
              </>
            ) : (
              <>
                You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                <a href="/carve" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Carve &rarr;</a>
                {' · '}
                <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
              </>
            )}
          </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other puzzles, challenge, share &amp; leaderboard</div>
          </div>
        )}
        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="carve"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="carve" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Carve to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s board, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s board, every day.
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
          self="carve"
          won={won}
          headline={won ? <>Board carved!</> : <>You scored {Math.round(((won ? finalScore : 0) / 10) * 100)}%</>}
          subline={<>{won
            ? <>{finalScore}/10 &middot; {errors === 0 ? 'clean cuts, no errors' : `${errors} error${errors === 1 ? '' : 's'}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; the finished carving is shown above</>}</>}
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
            <button className="cv-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Carve — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Carve</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Carve is a free daily number puzzle from Source of Truths. Each day gives you a fresh grid of digits and a handful of colored anchor squares. Slice the whole board into connected blocks, one grown from each anchor, so that every block adds up to the same target. There is always exactly one valid carving &mdash; the anchors pin it down.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          It plays like a knife-and-ledger cousin of sudoku: part arithmetic, part territory. Watch the running totals, spot the squares only one block can reach, and let each locked block squeeze the next. A wrong cut shakes red and costs an error &mdash; carve the whole board clean for a perfect score.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new board drops every day at midnight Eastern, and Sundays go bigger with a 7&times;7 grid in nine blocks. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our number ledger, and <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
