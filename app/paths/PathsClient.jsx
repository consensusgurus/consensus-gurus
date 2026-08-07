'use client';

// Paths — the daily network puzzle.
//
// A lattice of dots, one depot, eight towns (ten on Sundays), a river and two
// ridges. Lay track along the lattice lines until every town is linked back to
// the depot, and do it for as little as you can. A plain lane costs 1, a ridge
// lane costs 2, a river crossing costs 3, and a spur that goes nowhere still
// costs you.
//
// PERFECT is the exact cheapest network that exists on the board, proved by a
// Dreyfus-Wagner Steiner-tree solve at bank time. PAR is the cushioned target
// from lib/par.js, so perfect is 10/10 and par is 8/10 on every board.
//
// Linking every town does NOT end the game, which is the whole point: the first
// network you find is never the cheapest one. Once everything is linked you can
// keep trimming, and you press Finish when you are done. The one exception is
// hitting perfect, which ends it there, since nothing better exists.
//
// Same daily plumbing as Hedge/Etch: banked boards gated by Eastern date on the
// server (app/paths/page.js), per-board localStorage saves, /paths?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { RotateCcw, X, Lightbulb, Eye, Smartphone, Trash2, Flag } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import DailyChrome from '../DailyChrome';
import DailyMasthead from '../DailyMasthead';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import { hintAllowed, spendHint } from '@/lib/hint-gate';
import { parFor, stepFor, scoreFor } from '@/lib/par';
import { T } from '@/lib/theme';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  accent: '#065f46',        // Paths identity — deep green
  accentSoft: '#e6f4ee',
  green: T.successDeep,
  track: T.accent,          // laid track reads as the brand navy
  ridge: '#e6dcc6',
  ridgeInk: '#8a6a2f',
  river: '#bfdbfe',
  riverInk: '#1d4ed8',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_paths_help_seen';
const STATS_KEY = 'sot_paths_stats';

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

const HAPT = { ok: [6], lift: [4], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

const eKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
function freshState(count) {
  return { v: 1, e: Array(count).fill(0), hintUsed: false, status: 'playing', t0: null, tEnd: null };
}

export default function PathsClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const n = PUZZLE.n;
  const STORE_KEY = `sot_paths_${PUZZLE.num}`;
  const perfect = PUZZLE.par;
  const parTarget = parFor(perfect);
  const step = stepFor(perfect);

  const DEPOT = PUZZLE.terms[0];
  const TOWNS = useMemo(() => PUZZLE.terms.slice(1), [PUZZLE]);

  // Every lane on the lattice, priced once. Horizontal lanes come first, then
  // vertical, and the index into that list is the only handle the game state
  // keeps, so a saved board stays valid as long as the board size does.
  const LANES = useMemo(() => {
    const hills = new Set(PUZZLE.hills), bridges = new Set(PUZZLE.bridges);
    const out = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n - 1; x++) out.push([y * n + x, y * n + x + 1]);
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n; x++) out.push([y * n + x, (y + 1) * n + x]);
    return out.map(([a, b], i) => ({
      i, a, b,
      cost: bridges.has(eKey(a, b)) ? 3 : (hills.has(a) && hills.has(b)) ? 2 : 1,
      horiz: b - a === 1,
    }));
  }, [PUZZLE, n]);
  const LANE_BY_KEY = useMemo(() => {
    const m = {};
    LANES.forEach((l) => { m[eKey(l.a, l.b)] = l.i; });
    return m;
  }, [LANES]);
  const SOL = useMemo(() => PUZZLE.sol.map(([a, b]) => LANE_BY_KEY[eKey(a, b)]).filter((i) => i !== undefined), [PUZZLE, LANE_BY_KEY]);

  const [g, setG] = useState(() => freshState(LANES.length));
  const gRef = useRef(g);
  const [canUndo, setCanUndo] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  const [showPar, setShowPar] = useState(false);
  const [endClosed, setEndClosed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const [stats, setStats] = useState(null);
  const [hintOk, setHintOk] = useState(false);
  useEffect(() => { if (stats) setHintOk(hintAllowed('paths', stats)); }, [stats]);
  useEffect(() => { if (g.hintUsed) spendHint('paths'); }, [g.hintUsed]);
  // eslint-disable-next-line no-unused-vars
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
  const dragRef = useRef(null);
  const svgRef = useRef(null);

  const E = g.e;
  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && Array.isArray(saved.e) && saved.e.length === LANES.length) {
          const next = { ...freshState(LANES.length), ...saved };
          gRef.current = next;
          setG(next);
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
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        const done = g.status !== 'playing';
        if (done || g.t0) localStorage.setItem('sot_paths_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_paths_day');
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

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
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const cost = useMemo(() => LANES.reduce((s, l) => s + (E[l.i] ? l.cost : 0), 0), [E, LANES]);
  const reached = useMemo(() => {
    const adj = {};
    LANES.forEach((l) => {
      if (!E[l.i]) return;
      (adj[l.a] = adj[l.a] || []).push(l.b);
      (adj[l.b] = adj[l.b] || []).push(l.a);
    });
    const seen = new Set([DEPOT]), q = [DEPOT];
    while (q.length) { const u = q.pop(); (adj[u] || []).forEach((v) => { if (!seen.has(v)) { seen.add(v); q.push(v); } }); }
    return seen;
  }, [E, LANES, DEPOT]);
  const linked = TOWNS.filter((t) => reached.has(t)).length;
  const allLinked = linked === TOWNS.length;
  const over = Math.max(0, cost - perfect);
  const liveScore = allLinked ? scoreFor(cost, perfect) : 0;
  const finalScore = g.status === 'won' ? scoreFor(cost, perfect) : 0;

  const REC_KEY = `sot_paths_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    const acted = cur.e.some((v) => v) || cur.hintUsed;
    if (!acted || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score, spend) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: Math.max(0, spend - perfect), won: score === 10 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: Math.max(0, spend - perfect), timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
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

  function pushUndo(cur) {
    undoRef.current = [...undoRef.current.slice(-79), cur.e.slice()];
    if (!canUndo) setCanUndo(true);
  }
  function undo() {
    const st = undoRef.current;
    if (!st.length || gRef.current.status !== 'playing') return;
    const prev = st[st.length - 1];
    undoRef.current = st.slice(0, -1);
    setCanUndo(undoRef.current.length > 0);
    commit({ ...gRef.current, e: prev.slice() });
  }
  function clearAll() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.e.some((v) => v)) return;
    pushUndo(cur);
    commit({ ...cur, e: Array(LANES.length).fill(0) });
  }

  // Finishing the network exactly at perfect ends the board on the spot, because
  // nothing cheaper exists to look for. Anything else is the player's call.
  function laneCostSum(arr) { return LANES.reduce((s, l) => s + (arr[l.i] ? l.cost : 0), 0); }
  function allLinkedFor(arr) {
    const adj = {};
    LANES.forEach((l) => {
      if (!arr[l.i]) return;
      (adj[l.a] = adj[l.a] || []).push(l.b);
      (adj[l.b] = adj[l.b] || []).push(l.a);
    });
    const seen = new Set([DEPOT]), q = [DEPOT];
    while (q.length) { const u = q.pop(); (adj[u] || []).forEach((v) => { if (!seen.has(v)) { seen.add(v); q.push(v); } }); }
    return TOWNS.every((t) => seen.has(t));
  }

  function setLane(idx, on) {
    const cur = gRef.current;
    if (cur.status !== 'playing') return;
    if (cur.e[idx] === (on ? 1 : 0)) return;
    if (!cur.t0) startGame();
    const e = cur.e.slice();
    e[idx] = on ? 1 : 0;
    const g2 = { ...cur, e };
    if (!g2.t0) g2.t0 = Date.now();
    const spend = laneCostSum(e);
    if (on && spend === perfect && allLinkedFor(e)) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      vibrate(HAPT.win);
      postResult(g2, 10, spend);
      commit(g2);
      return;
    }
    vibrate(on ? HAPT.ok : HAPT.lift);
    commit(g2);
  }

  function finish() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !allLinkedFor(cur.e)) return;
    const spend = laneCostSum(cur.e);
    const g2 = { ...cur, status: 'won', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    vibrate(HAPT.win);
    postResult(g2, scoreFor(spend, perfect), spend);
    commit(g2);
  }

  function useHint() {
    if (!hintOk) return;
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    const missing = SOL.filter((i) => !cur.e[i]);
    if (!missing.length) { say('Your track already holds a whole cheapest network.'); return; }
    const idx = missing[Math.floor(Math.random() * missing.length)];
    pushUndo(cur);
    const e = cur.e.slice();
    e[idx] = 1;
    const g2 = { ...cur, e, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    vibrate(HAPT.ok);
    commit(g2);
    say('Hint laid: one lane of a cheapest network.');
  }

  function revealEnd() {
    const cur = gRef.current;
    const e = Array(LANES.length).fill(0);
    SOL.forEach((i) => { e[i] = 1; });
    const g2 = { ...cur, e, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0, perfect);
    commit(g2);
    setShowPar(true);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    undoRef.current = []; setCanUndo(false);
    commit(freshState(LANES.length));
    setEndClosed(false); setShowPar(false);
  }

  const onKey = useCallback((e) => {
    if (gRef.current.status !== 'playing') return;
    if ((e.key === 'z' || e.key === 'Z') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undo(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  // ---- drawing ----
  // One drag lays or lifts a run of track. The first lane you touch decides
  // which (touch a bare lane to lay, touch your own track to lift), and every
  // lane the finger crosses after that follows suit. The hit targets carry a
  // data-lane index and are read back with elementFromPoint, because a touch
  // drag keeps firing at the element it started on.
  function laneAt(ev) {
    const el = typeof document !== 'undefined' ? document.elementFromPoint(ev.clientX, ev.clientY) : null;
    if (!el || !el.dataset || el.dataset.lane === undefined) return -1;
    const i = Number(el.dataset.lane);
    return Number.isInteger(i) ? i : -1;
  }
  function onPointerDown(ev) {
    if (gRef.current.status !== 'playing') return;
    const i = laneAt(ev);
    if (i < 0) return;
    ev.preventDefault();
    try { svgRef.current && svgRef.current.setPointerCapture(ev.pointerId); } catch (e) {}
    const on = !gRef.current.e[i];
    dragRef.current = on;
    pushUndo(gRef.current);
    setLane(i, on);
  }
  function onPointerMove(ev) {
    if (dragRef.current === null || gRef.current.status !== 'playing') return;
    const i = laneAt(ev);
    if (i < 0) return;
    if (!!gRef.current.e[i] !== dragRef.current) setLane(i, dragRef.current);
  }
  function endDrag() { dragRef.current = null; }
  useEffect(() => {
    const up = () => { dragRef.current = null; };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);

  // ---- board geometry ----
  const CELL = n <= 9 ? 52 : 42;
  const PAD = 26;
  const SIZE = (n - 1) * CELL + PAD * 2;
  const X = (i) => PAD + (i % n) * CELL;
  const Y = (i) => PAD + Math.floor(i / n) * CELL;
  const HIT = Math.round(CELL * 0.42);
  const riverPath = useMemo(() => {
    const pts = [];
    for (let y = 0; y < n; y++) {
      const cx = PAD + (PUZZLE.rx[y] - 0.5) * CELL;
      pts.push([cx, PAD + (y - 0.5) * CELL], [cx, PAD + (y + 0.5) * CELL]);
    }
    return pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  }, [PUZZLE, n, CELL]);
  const townLetter = (i) => String.fromCharCode(65 + i);
  // A cell whose four corners all stand on the ridge has all four of its lanes
  // priced at 2, so filling it in is exactly as honest as the strips and reads
  // as one landform rather than a tan lattice with holes in it.
  const ridgeCells = useMemo(() => {
    const hills = new Set(PUZZLE.hills), out = [];
    for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) {
      const a = y * n + x;
      if (hills.has(a) && hills.has(a + 1) && hills.has(a + n) && hills.has(a + n + 1)) out.push(a);
    }
    return out;
  }, [PUZZLE, n]);

  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>Lay track along the lanes until <b>every town is linked back to the depot</b>. Drag along a lane to lay track, drag back over your own track to lift it. Towns turn green as they connect.</p>
      <p style={{ margin: '0 0 9px' }}>What it costs you: an open lane is <b>1</b>, a <b style={{ color: COLORS.ridgeInk }}>ridge lane</b> is <b>2</b>, and a <b style={{ color: COLORS.riverInk }}>river crossing</b> is <b>3</b>. The tan shading marks exactly the lanes that charge 2, and a lane only charges 2 when <b>both</b> of its ends stand on the ridge, so skirting the edge of one is free. The river is a solid barrier with no gap in it, so you pay to cross it somewhere.</p>
      <p style={{ margin: '0 0 9px' }}>Linking everything does not end the round. The first network you find is never the cheapest, so keep trimming and press <b>Finish</b> when you are happy. <b>Undo</b> (or Ctrl+Z) and <b>Clear</b> are free and unlimited, and one free <b>hint</b>, on your first ever play, lays a single lane of a cheapest network.</p>
      <p style={{ margin: 0 }}><b>Perfect</b> is the cheapest network that exists on the board, proved by an exact solver, and it scores 10. <b>Par</b> is {step} over perfect per point, so par lands on 8. Spurs that lead nowhere still cost you. Ties break on cost, then on time. Sundays are a bigger 11&times;11 Edition with ten towns.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      <DailyChrome slug="paths" name="Paths" collapsed={started} />
      <div className="pt-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.pt-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .pt-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .pt-btn:hover{background:var(--accent-soft);}
          .pt-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:var(--white);color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .pt-tool.on{background:${COLORS.accent};color:var(--white);border-color:${COLORS.accent};}
          .pt-hit{stroke:transparent;fill:none;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-touch-callout:none;}
          .pt-svg{touch-action:none;width:100%;height:auto;display:block;-webkit-user-select:none;-moz-user-select:none;user-select:none;-webkit-touch-callout:none;}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        <DailyMasthead
          slug="paths"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={5}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; 11&times;11</span>}
          blocks={'PATHS'.split('').map((ch, i) => (
            <div key={i} style={{ width: 40, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 24, background: i === 4 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Paths is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Link all {TOWNS.length} towns to the depot for as little as you can. Ridge lanes cost 2, river crossings cost 3. Perfect is <b>{perfect}</b> and par is <b>{parTarget}</b>.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="pt-btn" onClick={startGame} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
        <div style={{ background: T.white, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>cost <b style={{ color: allLinked && cost === perfect ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{cost}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>par <b style={{ color: COLORS.ink, fontWeight: 500 }}>{parTarget}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>linked <b style={{ color: allLinked ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{linked}</b>/{TOWNS.length}</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
          </div>

          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <svg ref={svgRef} className="pt-svg" viewBox={`0 -6 ${SIZE} ${SIZE + 12}`} role="img"
              aria-label={`Paths network puzzle, ${n} by ${n} lattice, ${TOWNS.length} towns`}
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag}>
              {/* ridge: painted on exactly the lanes that charge 2, plus the
                  cells those lanes enclose, so what you see is what you pay */}
              {ridgeCells.map((a) => (
                <rect key={`rc${a}`} x={X(a)} y={Y(a)} width={CELL} height={CELL} fill={COLORS.ridge} style={{ pointerEvents: 'none' }} />
              ))}
              {LANES.filter((l) => l.cost === 2).map((l) => (
                <line key={`r${l.i}`} x1={X(l.a)} y1={Y(l.a)} x2={X(l.b)} y2={Y(l.b)}
                  stroke={COLORS.ridge} strokeWidth={CELL * 0.44} strokeLinecap="round" style={{ pointerEvents: 'none' }} />
              ))}
              {/* the river, one continuous barrier */}
              <path d={riverPath} fill="none" stroke={COLORS.river} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" style={{ pointerEvents: 'none' }} />
              <path d={riverPath} fill="none" stroke="#7fb2f5" strokeWidth={2.4} opacity={0.7} strokeLinejoin="round" style={{ pointerEvents: 'none' }} />
              {/* bare lanes */}
              {LANES.map((l) => (
                <line key={`l${l.i}`} x1={X(l.a)} y1={Y(l.a)} x2={X(l.b)} y2={Y(l.b)}
                  stroke="#dfe4ec" strokeWidth={2} strokeLinecap="round" opacity={l.cost > 1 ? 0.5 : 1} style={{ pointerEvents: 'none' }} />
              ))}
              {/* a cheapest network, shown only after the round ends */}
              {showPar && SOL.map((i) => {
                const l = LANES[i];
                return <line key={`p${i}`} x1={X(l.a)} y1={Y(l.a)} x2={X(l.b)} y2={Y(l.b)}
                  stroke="#e8b43a" strokeWidth={4.5} strokeLinecap="round" strokeDasharray="2 7" style={{ pointerEvents: 'none' }} />;
              })}
              {/* laid track */}
              {LANES.map((l) => (E[l.i] ? (
                <line key={`t${l.i}`} x1={X(l.a)} y1={Y(l.a)} x2={X(l.b)} y2={Y(l.b)}
                  stroke={COLORS.track} strokeWidth={6} strokeLinecap="round" style={{ pointerEvents: 'none' }} />
              ) : null))}
              {/* what a crossing charges. The ridge says 2 with its shading */}
              {LANES.filter((l) => l.cost === 3).map((l) => (
                <text key={`c${l.i}`} x={(X(l.a) + X(l.b)) / 2 + (l.horiz ? 0 : 10)} y={(Y(l.a) + Y(l.b)) / 2 - (l.horiz ? 10 : 0)}
                  fill={l.cost === 3 ? COLORS.riverInk : COLORS.ridgeInk} fontFamily={MONO} fontSize={10} fontWeight="500"
                  textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none', userSelect: 'none' }}>{l.cost}</text>
              ))}
              {/* plain dots */}
              {Array.from({ length: n * n }).map((_, k) => (PUZZLE.terms.includes(k) ? null : (
                <circle key={`d${k}`} cx={X(k)} cy={Y(k)} r={2.6} fill="#b9c1cf" style={{ pointerEvents: 'none' }} />
              )))}
              {/* depot */}
              <g style={{ pointerEvents: 'none' }}>
                <rect x={X(DEPOT) - 15} y={Y(DEPOT) - 15} width={30} height={30} rx={9} fill={COLORS.ink} />
                <rect x={X(DEPOT) - 6} y={Y(DEPOT) - 6} width={12} height={12} rx={3} fill={T.white} />
              </g>
              {/* towns */}
              {TOWNS.map((t, k) => {
                const on = reached.has(t);
                return (
                  <g key={`t${t}`} style={{ pointerEvents: 'none' }}>
                    <circle cx={X(t)} cy={Y(t)} r={13} fill={on ? COLORS.green : T.white} stroke={on ? COLORS.green : COLORS.ink} strokeWidth={2.5} />
                    <text x={X(t)} y={Y(t)} fill={on ? T.white : COLORS.ink} fontFamily={SANS} fontSize={11.5} fontWeight="800" textAnchor="middle" dominantBaseline="central">{townLetter(k)}</text>
                  </g>
                );
              })}
              {/* hit targets last so they always take the drag */}
              {playing && LANES.map((l) => (
                <line key={`h${l.i}`} className="pt-hit" data-lane={l.i}
                  x1={X(l.a)} y1={Y(l.a)} x2={X(l.b)} y2={Y(l.b)} strokeWidth={HIT} />
              ))}
            </svg>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap', fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: COLORS.faded }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 15, height: 3, borderRadius: 2, background: '#c9d0dc' }} /> open 1</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 15, height: 9, borderRadius: 3, background: COLORS.ridge }} /> ridge 2</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 15, height: 5, borderRadius: 3, background: COLORS.river }} /> crossing 3</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: COLORS.ink }} /> depot</span>
          </div>
          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
              <button className="pt-tool" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'default' }}>
                <RotateCcw size={14} /> Undo
              </button>
              <button className="pt-tool" onClick={clearAll} title="Lift all your track" style={{ opacity: cost > 0 ? 1 : 0.4, cursor: cost > 0 ? 'pointer' : 'default' }}>
                <Trash2 size={14} /> Clear
              </button>
              {hintOk && !g.hintUsed && (
                <button className="pt-tool" onClick={useHint} title="Lay one lane of a cheapest network (one hint, first play only)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(6,95,70,0.5)', color: COLORS.accent }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
              {allLinked && (
                <button className="pt-tool on" onClick={finish} title="Lock in this network">
                  <Flag size={14} /> Finish for {cost}
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: allLinked ? COLORS.accent : COLORS.faded }}>
              {allLinked
                ? `Every town is linked for ${cost}. ${over === 0 ? 'That is perfect.' : `Perfect is ${perfect}, so there are ${over} to trim if you can find them.`}`
                : 'Drag along a lane to lay track, drag back over it to lift it. Every town has to reach the depot.'}
            </span>
            {identity && cost > 0 && (
              <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={13} /> {armReveal ? 'Tap again — ends the round and shows a cheapest network' : 'Reveal & end'}
              </button>
            )}
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <button className="pt-tool" onClick={() => setShowPar((v) => !v)} style={{ marginBottom: 4 }}>
              {showPar ? 'Hide the cheapest network' : 'Show a cheapest network'}
            </button>
            <div style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '8px 0 0' }}>
              Shown in gold, one network that costs {perfect}. Two staircases between the same dots always tie, so it is <i>a</i> cheapest network rather than the only one, but every ridge lane and crossing in it is forced.
            </div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '10px 0 0' }}>The Sunday Edition &mdash; a bigger 11&times;11 board with ten towns.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Paths in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new board drops at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/paths?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Paths &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/paths" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Paths &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="paths"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="paths" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Paths to your Home Screen</div>
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
      </div>

      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="paths"
          won={won}
          headline={won ? (over === 0 ? <>Perfect network!</> : <>Linked for {cost}</>) : <>You scored 0%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {over === 0 ? 'nothing cheaper exists' : `${over} over perfect ${perfect}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; a cheapest network is shown above</>}
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

      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button className="pt-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Paths</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Paths is a free daily network puzzle from Mind Loft. One depot, eight towns, a river and two ridges, and the job is to link every town back to the depot for as little as you can. Ridge lanes cost double and crossings cost triple, so the shortest route and the cheapest one are rarely the same thing.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The trick is that towns are cheaper to link in bunches than one at a time. A lane you lay to reach one town is free for the next town that runs along it, which is why the obvious connect-the-nearest-town network is always several over, and why one shared trunk line through a single crossing usually beats three separate detours around the river.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every board carries a proven cheapest network, so a perfect score is real and nobody beats it. A new board drops at midnight Eastern, and Sundays step up to an 11&times;11 Edition with ten towns. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/hedge" style={{ color: COLORS.ink, fontWeight: 800 }}>Hedge</a>, our daily loop, <a href="/parker" style={{ color: COLORS.ink, fontWeight: 800 }}>Parker</a>, our gridlock puzzle, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our border chain.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const text = playing
      ? `Paths #${PUZZLE.num} — the daily network puzzle from Mind Loft.\n${shareUrl()}`
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
  function shareUrl() {
    return withRef(`mindloftdaily.com/paths${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  // Five bands off the score, never the board: the shape of a network is the
  // answer, so nothing here can leak one.
  function shareText() {
    const g5 = won ? Math.max(1, Math.round(finalScore / 2)) : 0;
    const squares = '\u{1F7E9}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = won
      ? `Paths #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${cost}${over === 0 ? ' (perfect)' : ` · ${over} over`} · ${elapsed}${hintBit}${streakBit}`
      : `Paths #${PUZZLE.num} · gave up`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
}
