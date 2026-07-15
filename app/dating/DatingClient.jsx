'use client';

// Dating — put history in order.
//
// Each day: five historical events, shuffled. Arrange them oldest to newest
// and check your order — events in the right slot lock in with their year
// revealed. Three checks to date the whole board. Score is 10 for a perfect
// first check, minus one per extra check and two per event never placed.
// One free hint reveals the year of your most misplaced event.
//
// Same daily plumbing as Crux/Links/Span: banked puzzles gated by Eastern
// date on the server (app/dating/page.js), per-puzzle localStorage saves,
// /dating?p=N archive pinning, streaks + stats, and the shared /api/quiz/*
// board flow. The display shuffle is SEEDED (mulberry32) — Math.random would
// mismatch SSR/hydration AND leak the answer (authored order is the answer).
//
// DESKTOP DRAG: on non-mobile, unlocked cards can be pointer-dragged into any
// unlocked slot (locked slots never move; the dragged card is INSERTED among
// the unlocked cards, not swapped). The arrows stay everywhere and remain the
// only control on mobile, where dragging would fight page scroll.
//
// END-OF-GAME TIMELINE: every finish (won, lost, or revealed) shows the full
// dated timeline with each event's one-line story (`d` in puzzles.js).

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, RotateCcw, X, ArrowUp, ArrowDown, Swords, Smartphone, Lightbulb, Eye, Check } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import DailyGamesPromo from '../DailyGamesPromo';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import QuizLeaderboard from '../quiz/[id]/QuizLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  faded: '#6b7280',
  plum: '#7c3aed',
  plumInk: '#4c1d95',
  plumSoft: '#f5f0ff',
  lock: '#15803d',
  lockSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_dating_help_seen';
const STATS_KEY = 'sot_dating_stats';
const MAX_CHECKS = 3;

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

// seeded display shuffle (Links pattern) — deterministic per puzzle, never
// the solved order, never Math.random (SSR mismatch + answer leak).
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededOrder(num, n) {
  const rand = mulberry32(Math.imul(num, 2654435761));
  // keep drawing (deterministically) until at most one card starts in its
  // correct slot — a deal with several pre-placed cards is too generous
  for (let tries = 0; tries < 24; tries++) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.filter((v, i) => v === i).length <= 1) return arr;
  }
  const arr = Array.from({ length: n }, (_, i) => (i + 1) % n);
  return arr;
}

// ─── Personal stats + streak (localStorage), Crux pattern ──────────────────
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

function freshState(num, n) {
  return {
    v: 1,
    order: seededOrder(num, n), // order[slot] = event index currently in that slot
    rows: [],                   // one boolean[5] per check (true = correct slot)
    hintUsed: false,
    hintIdx: null,              // event index whose year the hint revealed
    status: 'playing',          // playing | won | lost | revealed
    t0: null,
    tEnd: null,
  };
}

export default function DatingClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const N = PUZZLE.events.length;
  const STORE_KEY = `sot_dating_${PUZZLE.num}`;
  const [g, setG] = useState(() => freshState(PUZZLE.num, N));
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shake, setShake] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
  const [justWon, setJustWon] = useState(false);
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
  const rowRefs = useRef([]);
  const dragRef = useRef(null);
  const [drag, setDrag] = useState(null); // {from, dy, target} while a desktop drag is live

  const playing = g.status === 'playing';
  const won = g.status === 'won';
  const checksUsed = g.rows.length;
  const checksLeft = MAX_CHECKS - checksUsed;
  // a slot is locked once any check found it correct (locked cards never move)
  const lockedSlots = useMemo(() => {
    const l = Array(N).fill(false);
    for (const row of g.rows) for (let i = 0; i < N; i++) if (row[i]) l[i] = true;
    return l;
  }, [g.rows, N]);
  const lockedCount = lockedSlots.filter(Boolean).length;

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
        if (saved && saved.v === 1 && Array.isArray(saved.order) && saved.order.length === N) setG({ ...freshState(PUZZLE.num, N), ...saved });
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
    // same-device day breadcrumb for cross-game recommendations — only for
    // TODAY'S puzzle (archive replays must not mark today as played)
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_dating_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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

  // score: 10 for a perfect first check, -1 per extra check, -2 per event
  // never locked. Revealed = 0.
  function scoreOf(g2) {
    if (g2.status === 'revealed') return 0;
    const rows = g2.rows;
    if (!rows.length) return 0;
    const last = rows[rows.length - 1];
    const locked = last.filter(Boolean).length;
    return Math.max(0, Math.min(10, 10 - (rows.length - 1) - 2 * (N - locked)));
  }
  const finalScore = playing ? 0 : scoreOf(g);

  function postResult(g2, score) {
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.rows.length, won: score === 10 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.rows.length, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  // move the card in `slot` one step up/down, skipping locked slots
  function moveCard(slot, dir) {
    if (!playing || lockedSlots[slot]) return;
    let to = slot + dir;
    while (to >= 0 && to < N && lockedSlots[to]) to += dir;
    if (to < 0 || to >= N) return;
    const g2 = { ...g, order: [...g.order] };
    if (!g2.t0) g2.t0 = Date.now();
    [g2.order[slot], g2.order[to]] = [g2.order[to], g2.order[slot]];
    setG(g2);
  }

  // ─── desktop drag: insert the card from `from` at unlocked slot `to`,
  // shifting only the other unlocked cards (locked slots never move) ─────────
  function moveInsert(from, to) {
    if (!playing || from === to || lockedSlots[from] || lockedSlots[to]) return;
    const unlocked = [];
    for (let i = 0; i < N; i++) if (!lockedSlots[i]) unlocked.push(i);
    const seq = unlocked.map((s) => g.order[s]);
    const fi = unlocked.indexOf(from), ti = unlocked.indexOf(to);
    if (fi < 0 || ti < 0) return;
    const [ev] = seq.splice(fi, 1);
    seq.splice(ti, 0, ev);
    const g2 = { ...g, order: [...g.order] };
    if (!g2.t0) g2.t0 = Date.now();
    unlocked.forEach((s, i) => { g2.order[s] = seq[i]; });
    setG(g2);
  }
  // the unlocked slot whose row is vertically nearest the cursor. The dragged
  // row itself is measured at its UNTRANSFORMED spot (rect minus dy) — its
  // rendered rect follows the cursor, and would otherwise win every tie and
  // swallow downward drops.
  function dragTargetSlot(clientY, fromSlot, dy) {
    let best = null, bd = Infinity;
    for (let i = 0; i < N; i++) {
      if (lockedSlots[i]) continue;
      const el = rowRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      let mid = r.top + r.height / 2;
      if (i === fromSlot && dy != null) mid -= dy;
      const d = Math.abs(clientY - mid);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function startDrag(slot, e) {
    if (mobileUi || !playing || lockedSlots[slot]) return;
    if (e.button != null && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('button')) return; // arrows keep working
    e.preventDefault();
    dragRef.current = { from: slot, y0: e.clientY, active: false };
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dy = ev.clientY - d.y0;
      if (!d.active && Math.abs(dy) < 4) return; // don't kill plain clicks
      d.active = true;
      setDrag({ from: d.from, dy, target: dragTargetSlot(ev.clientY, d.from, dy) });
    };
    const onUp = (ev) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      const d = dragRef.current;
      dragRef.current = null;
      // resolve the drop BEFORE clearing the drag state — the transform is
      // still applied, so the dragged row needs its dy correction
      if (d && d.active && ev.type !== 'pointercancel') {
        const t = dragTargetSlot(ev.clientY, d.from, ev.clientY - d.y0);
        if (t != null && t !== d.from) moveInsert(d.from, t);
      }
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  function checkOrder() {
    if (!playing || checksLeft <= 0) return;
    const g2 = { ...g, rows: [...g.rows] };
    if (!g2.t0) g2.t0 = Date.now();
    const row = g2.order.map((v, i) => v === i);
    g2.rows.push(row);
    const right = row.filter(Boolean).length;
    if (right === N) {
      g2.status = 'won';
      g2.tEnd = Date.now();
      postResult(g2, scoreOf(g2));
      setG(g2);
      setJustWon(true);
      return;
    }
    if (g2.rows.length >= MAX_CHECKS) {
      g2.status = 'lost';
      g2.tEnd = Date.now();
      postResult(g2, scoreOf(g2));
      setG(g2);
      return;
    }
    setShake(true);
    setTimeout(() => setShake(false), 500);
    say(`${right} of ${N} locked in — ${MAX_CHECKS - g2.rows.length} check${MAX_CHECKS - g2.rows.length === 1 ? '' : 's'} left.`);
    setG(g2);
  }

  // One free hint: reveal the year of the most misplaced unlocked event.
  function useHint() {
    if (!playing || g.hintUsed) return;
    let best = null, bestDist = -1;
    for (let slot = 0; slot < N; slot++) {
      if (lockedSlots[slot]) continue;
      const ev = g.order[slot];
      const d = Math.abs(slot - ev);
      if (d > bestDist) { bestDist = d; best = ev; }
    }
    if (best == null) return;
    const g2 = { ...g, hintUsed: true, hintIdx: best };
    if (!g2.t0) g2.t0 = Date.now();
    say(`Hint: "${PUZZLE.events[best].t}" is ${PUZZLE.events[best].y}.`);
    setG(g2);
  }

  function revealEnd() {
    const g2 = { ...g, status: 'revealed', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    setG(g2);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE.num, N)); setJustWon(false);
  }

  const beatPct = (() => {
    if (g.status === 'playing') return null;
    const dist = board.scoreDist;
    if (!dist) return null;
    const my = finalScore;
    let below = 0, all = 0;
    for (const [k, v] of Object.entries(dist)) {
      const n = Number(v) || 0;
      all += n;
      if (Number(k) < my) below += n;
    }
    const others = all - 1;
    if (others < 10) return null;
    return Math.max(0, Math.min(100, Math.round((below / others) * 100)));
  })();

  function shareText() {
    const grid = g.rows.map((row) => row.map((ok) => (ok ? '\u{1F7E9}' : '⬜')).join('')).join('\n');
    const hintBit = g.hintUsed ? ' · 💡' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head = won
      ? `Dating #${PUZZLE.num} · ${finalScore}/10 · ${checksUsed} check${checksUsed === 1 ? '' : 's'} · ${elapsed}${hintBit}${streakBit}`
      : g.status === 'lost'
        ? `Dating #${PUZZLE.num} · ${finalScore}/10 · ${lockedCount}/${N} placed${hintBit}`
        : `Dating #${PUZZLE.num} · gave it up${hintBit}`;
    return grid ? `${head}\n${grid}\n${shareUrl()}` : `${head}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/dating${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Dating #${PUZZLE.num} — five moments in history, three checks to put them in order.\n${shareUrl()}`
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

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="dt-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.dt-wrap{padding-left:14px !important;padding-right:14px !important;}}
          .dt-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .dt-btn:hover{background:${COLORS.paper};}
          .dt-btn:disabled{opacity:.45;cursor:default;}
          @keyframes dtshake{0%,100%{transform:translateX(0);}20%,60%{transform:translateX(-5px);}40%,80%{transform:translateX(5px);}}
          .dt-shake{animation:dtshake .45s ease;}
          @keyframes dtfade{from{opacity:0;}}
          @keyframes dtstamp{from{opacity:0;transform:scale(.94);}}
          .dt-arrow{width:34px;height:31px;border-radius:7px;border:1.5px solid rgba(28,30,36,0.3);background:#fff;color:${COLORS.ink};cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;}
          .dt-arrow:hover{background:${COLORS.plumSoft};border-color:${COLORS.plum};color:${COLORS.plum};}
          .dt-arrow:disabled{opacity:.25;cursor:default;background:#fff;border-color:rgba(28,30,36,0.3);color:${COLORS.ink};}
          @media(max-width:520px){.dt-htp-f{display:none;}.dt-htp-s{display:inline;}}
          @media(max-width:560px){.dt-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.dt-ttl h1{font-size:21px;letter-spacing:0.02em;}.dt-ttl .dt-ttl-dt{font-size:15px;}.dt-ttl-dot{display:none;}}
          .dt-htp-s{display:none;}
        `}</style>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* game-native top strip (Crux pattern): quiet nav + player chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, flexWrap: 'wrap' }}>
          <a href="/quizzes" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, textDecoration: 'none', borderBottom: '1px solid rgba(28,30,36,0.25)', paddingBottom: 1 }}>Quizzes</a>
          <a href="/" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, textDecoration: 'none', borderBottom: '1px solid rgba(28,30,36,0.25)', paddingBottom: 1 }}>Top 10 Lists</a>
          {player && (
            <a href={player.key ? `/quizzes/hub?player=${encodeURIComponent(player.key)}` : '/quizzes/hub'} title="Your Stat Hub"
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: COLORS.ink, background: PAPER, border: '1.5px solid rgba(28,30,36,0.35)', borderRadius: 5, padding: '4px 10px', textDecoration: 'none' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150, fontWeight: 500 }}>{player.name}</span>
              {player.rank ? <span style={{ color: COLORS.ember, fontWeight: 500 }}>Rank #{player.rank}</span> : null}
            </a>
          )}
        </div>

        {/* masthead: pressed DATING tiles with No./date inline, one rule beneath */}
        <div className="dt-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'DATING'.split('').map((ch, i) => (
              <div key={i} style={{ width: 42, height: 42, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 25, background: i === 1 ? COLORS.plum : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="dt-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="dt-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="dt-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the board */}
        <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '13px 15px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{PUZZLE.theme ? <>today: <b style={{ color: COLORS.ink, fontWeight: 500 }}>{PUZZLE.theme}</b></> : <b style={{ color: COLORS.ink, fontWeight: 500 }}>five moments</b>}</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>checks <b style={{ color: checksUsed > 0 ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{checksUsed}/{MAX_CHECKS}</b> &middot; placed <b style={{ color: lockedCount > 0 ? COLORS.lock : COLORS.ink, fontWeight: 500 }}>{lockedCount}/{N}</b></span>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 7 }}>&uarr; Earliest{!mobileUi && playing ? <span style={{ color: '#a8adb8' }}> &middot; drag cards or use the arrows</span> : null}</div>
          <div className={shake ? 'dt-shake' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 7, userSelect: drag ? 'none' : undefined }}>
            {g.order.map((ev, slot) => {
              const locked = lockedSlots[slot];
              const showYear = locked || g.status !== 'playing' || (g.hintIdx === ev && g.hintUsed);
              const yearChip = showYear ? (
                <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 11.5, fontWeight: 500, color: locked ? '#14532d' : COLORS.plumInk, background: locked ? COLORS.lockSoft : COLORS.plumSoft, border: `1px solid ${locked ? 'rgba(21,128,61,0.4)' : 'rgba(124,58,237,0.35)'}`, borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap' }}>{PUZZLE.events[ev].y}</span>
              ) : null;
              const draggable = !mobileUi && playing && !locked;
              const dragging = drag && drag.from === slot;
              const dropHere = drag && !dragging && drag.target === slot;
              return (
                <div key={ev} ref={(el) => { rowRefs.current[slot] = el; }} onPointerDown={draggable ? (e) => startDrag(slot, e) : undefined} title={draggable ? 'Drag to reorder' : undefined}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, background: locked ? COLORS.lockSoft : dropHere ? COLORS.plumSoft : '#fff', border: locked ? '1.5px solid rgba(21,128,61,0.5)' : dropHere ? `1.5px solid ${COLORS.plum}` : '1.5px solid rgba(28,30,36,0.32)', borderRadius: 9, padding: '9px 11px', cursor: draggable ? (dragging ? 'grabbing' : 'grab') : undefined, position: dragging ? 'relative' : undefined, zIndex: dragging ? 5 : undefined, transform: dragging ? `translateY(${drag.dy}px)` : undefined, boxShadow: dragging ? '0 8px 20px rgba(20,22,28,0.22)' : undefined, opacity: dragging ? 0.96 : undefined, touchAction: draggable ? 'none' : undefined }}>
                  <span style={{ flex: '0 0 auto', width: 20, fontFamily: MONO, fontSize: 11, color: COLORS.faded, textAlign: 'center' }}>{locked ? <Check size={14} color={COLORS.lock} strokeWidth={3} /> : slot + 1}</span>
                  <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: SANS, fontWeight: 700, fontSize: 13.5, lineHeight: 1.35, color: locked ? '#14532d' : COLORS.ink }}>{PUZZLE.events[ev].t}</span>
                  {yearChip}
                  {playing && !locked && (
                    <span style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <button className="dt-arrow" onClick={() => moveCard(slot, -1)} disabled={slot === 0 || lockedSlots.slice(0, slot).every(Boolean)} aria-label="Move earlier"><ArrowUp size={15} strokeWidth={2.5} /></button>
                      <button className="dt-arrow" onClick={() => moveCard(slot, 1)} disabled={slot === N - 1 || lockedSlots.slice(slot + 1).every(Boolean)} aria-label="Move later"><ArrowDown size={15} strokeWidth={2.5} /></button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, marginTop: 7 }}>&darr; Latest</div>
          {won && <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.lock, fontWeight: 500, marginTop: 8 }}>Dated in {checksUsed} check{checksUsed === 1 ? '' : 's'}.</div>}
        </div>

        {/* controls */}
        {playing && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="dt-btn" onClick={checkOrder} style={{ background: COLORS.plum, color: '#fff', borderColor: COLORS.plum }}>
                <Check size={15} strokeWidth={3} /> Check my order ({checksLeft} left)
              </button>
              {!g.hintUsed && (
                <button className="dt-btn" onClick={useHint} title="Reveal the year of your most misplaced event (one hint per puzzle)"
                  style={{ background: '#fdf6e3', border: '1.5px solid rgba(230,185,63,0.7)', color: '#8a6d1a', padding: '6px 12px', fontSize: 12.5 }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
              {identity && checksUsed > 0 && (
                <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <Eye size={13} /> {armReveal ? 'Tap again — ends the game and shows the timeline' : 'Reveal the timeline & end'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* result */}
        {!playing && (
          <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 19, fontWeight: 800, color: won ? COLORS.lock : COLORS.rust, marginBottom: 4 }}>
              {Math.round((((won || g.status === 'lost') ? finalScore : 0) / 10) * 100)}% Complete
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.faded, marginBottom: 6 }}>
              {won
                ? <>{finalScore}/10 &middot; {checksUsed} check{checksUsed === 1 ? '' : 's'} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
                : g.status === 'lost'
                  ? <>{finalScore}/10 &middot; {lockedCount}/{N} placed &middot; the timeline is below</>
                  : <>0/10 &middot; the timeline is below</>}
            </div>
            {/* the dated timeline — the payoff for every finish. Each event
                carries its one-line story (`d` in puzzles.js). */}
            <div style={{ margin: '10px 0 4px' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: COLORS.faded, marginBottom: 7 }}>The timeline</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PUZZLE.events.map((evt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 11, fontWeight: 500, color: COLORS.plumInk, background: COLORS.plumSoft, border: '1px solid rgba(124,58,237,0.35)', borderRadius: 6, padding: '2px 7px', minWidth: 64, textAlign: 'center', whiteSpace: 'nowrap', marginTop: 1 }}>{evt.y}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontFamily: SANS, fontWeight: 700, fontSize: 12.5, lineHeight: 1.35, color: COLORS.ink }}>{evt.t}</span>
                      {evt.d ? <span style={{ display: 'block', fontFamily: SANS, fontWeight: 600, fontSize: 11.5, lineHeight: 1.45, color: COLORS.faded, marginTop: 1 }}>{evt.d}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {PUZZLE.note && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '6px 0 10px', lineHeight: 1.5 }}>{PUZZLE.note}</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="dt-btn" onClick={copyShare}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
              <button className="dt-btn" onClick={resetGame} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><RotateCcw size={15} /> Replay</button>
            </div>
            <DailyGamesPromo self="dating" refresh={g.status} />
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Dating in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'Five new moments drop at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/dating?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Dating &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/dating" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Dating &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {/* standard quiz-page bottom: challenge + stats + join + leaderboard */}
        <div style={{ margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="dating"
            maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share This Puzzle', onClick: copyShare }}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Dating to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the plum timeline tile opens today&apos;s puzzle, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The plum timeline tile opens today&apos;s puzzle, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!identity && (
          <div style={{ margin: '18px auto 0' }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>

        {/* your stats — sits directly above the leaderboard */}
        {identity && (
        <div style={{ maxWidth: 620, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'First check' },
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
        <div style={{ maxWidth: 620, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <QuizLeaderboard daily board={board} identity={identity} total={10} guessLabel="Checks" />
        </div>
      </div>

      {/* the win moment: keepsake card, Crux pattern */}
      {justWon && (
        <div onClick={() => setJustWon(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(28,30,36,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'dtfade .4s ease .3s backwards' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, border: `3px double ${COLORS.ink}`, borderRadius: 6, padding: '26px 30px 20px', maxWidth: 380, width: '100%', textAlign: 'center', fontFamily: SANS, boxShadow: '6px 6px 0 rgba(28,30,36,0.18)', animation: 'dtstamp .45s ease .3s backwards' }}>
            <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 12 }}>
              {'DATING'.split('').map((ch, i) => (
                <span key={i} style={{ width: 24, height: 24, borderRadius: 3, background: i === 1 ? COLORS.plum : COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>{ch}</span>
              ))}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 34, color: COLORS.ink, letterSpacing: '-0.01em', margin: '2px 0 6px', lineHeight: 1.15 }}>{checksUsed === 1 ? 'First check!' : 'Dated.'}</div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: COLORS.faded, marginBottom: 14 }}>No. {PUZZLE.num} &middot; {finalScore}/10 &middot; {checksUsed} check{checksUsed === 1 ? '' : 's'} &middot; {elapsed}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginBottom: 16 }}>
              {g.rows.map((row, r) => (
                <div key={r} style={{ display: 'flex', gap: 3 }}>
                  {row.map((ok, i) => (
                    <span key={i} style={{ width: 15, height: 15, borderRadius: 3, background: ok ? COLORS.lock : '#d5d9e0', border: '1px solid rgba(28,30,36,0.25)' }} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="dt-btn" onClick={copyShare} style={{ background: COLORS.plum, color: '#fff', borderColor: COLORS.plum }}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
              <button className="dt-btn" onClick={() => setJustWon(false)}>See the timeline</button>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: COLORS.faded, marginTop: 12 }}>sourceoftruths.com/dating</div>
          </div>
        </div>
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
              <p style={{ margin: '0 0 9px' }}><b>Five moments from history, shuffled.</b> Arrange them from earliest (top) to latest (bottom) &mdash; {mobileUi ? 'tap the arrows to move a card' : 'drag a card where it belongs, or use the arrows'}.</p>
              <p style={{ margin: '0 0 9px' }}><b>You get {MAX_CHECKS} checks.</b> Each check locks every event you&apos;ve placed correctly and reveals its year. Date the whole board on your first check for a perfect 10 &mdash; each extra check costs a point, and each event you never place costs two.</p>
              <p style={{ margin: 0 }}>One free <b>hint</b> reveals the year of your most misplaced event. New moments every day at midnight Eastern.</p>
            </div>
            <button className="dt-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Dating — crawlable prose for search, server-rendered into the initial HTML */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Dating</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Dating is a free daily history game from Source of Truths. Each day deals five moments from history, shuffled out of sequence; your job is to arrange them in chronological order. You get three checks &mdash; every event you place correctly locks in with its year revealed, and a perfect first check scores a flawless 10.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The fun is in the near-misses: history is full of events that happened far earlier, or far later, than they feel like they should have. Oxford was teaching students before the Aztecs had a capital; London had a subway before anyone had a car. Every puzzle ends with the full dated timeline, a one-line story for each moment, and one fact worth keeping.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Five new moments drop every day at midnight Eastern. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our word scramble, <a href="/links" style={{ color: COLORS.ink, fontWeight: 800 }}>Links</a>, our word grouping game, and <a href="/span" style={{ color: COLORS.ink, fontWeight: 800 }}>Span</a>, our border-hopping geography game.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
