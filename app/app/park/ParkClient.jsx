'use client';

// Park — the daily sliding-block jam.
//
// Six by six, a dozen blocks, and the red one has to reach the gap in the right
// wall. Every block is locked to one axis. Tap a block, tap where you want it,
// and it slides there if the lane is clear.
//
// You are scored against PAR, the exact minimum number of moves, computed by
// breadth-first search and verified by a second independent solver before the
// board ever shipped. Solving at par is a ten and every two moves over costs a
// point, floor of one, so finishing always beats giving up.
//
// There is no undo, only a full restart, which is what keeps par meaningful:
// with a free take-back you could search the whole tree by hand. A restart puts
// the board back and resets the move count, but the clock keeps running.
//
// Same daily plumbing as Four/Mate/Etch: banked boards gated by Eastern date on
// the server (app/park/page.js), per-puzzle localStorage saves, /park?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Lightbulb, Eye, Smartphone, RotateCcw } from 'lucide-react';
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
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';
import { N, EXIT_ROW, fromData, grid, moves as legalSlides, apply, solved, solve } from './solver';

const COLORS = {
  cream: '#f7f8fa', paper: '#eceef1', ink: '#1c1e24', ember: '#0e1d40',
  rust: '#c0392b', faded: '#262b35',
  accent: '#7c5c2e',        // Park identity — weathered tarmac gold
  accentSoft: '#f6efe2', green: '#15803d',
};
const LOT = '#e7e2d8';        // the lot surface
const LOT_LINE = '#c9c2b4';
const WALL = '#2f2a24';
const RED_BLOCK = '#c0392b';
const RED_EDGE = '#7a2318';
// Muted paint for the other blocks, cycled by index so a board reads as traffic
// rather than as a colour test.
const PAINT = ['#6b7f9e', '#8a9a6b', '#a8846b', '#7f9e94', '#9e8a6b', '#6b8a9e', '#a89a6b', '#8a6b7f', '#7f8a6b', '#9e6b6b', '#6b9e8a', '#8a7f9e'];
const TRUCK = ['#3f4a5c', '#4c5c3f', '#5c4c3f', '#3f5c55', '#5c553f', '#3f4f5c'];

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_park_help_seen';
const STATS_KEY = 'sot_park_stats';

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

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

const freshState = () => ({ v: 1, moves: [], restarts: 0, hintUsed: false, status: 'playing', t0: null, tEnd: null });
const scoreFor = (used, par) => Math.max(1, Math.min(10, 10 - Math.floor(Math.max(0, used - par) / 2)));

export default function ParkClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_park_${PUZZLE.num}`;
  const START = useMemo(() => fromData(PUZZLE.pieces), [PUZZLE]);

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [sel, setSel] = useState(null);
  const [shake, setShake] = useState(0);
  const [hintBlock, setHintBlock] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [armReveal, setArmReveal] = useState(false);
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

  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const won = g.status === 'won';
  const used = g.moves.length;
  const par = PUZZLE.par;
  const finalScore = won ? scoreFor(used, par) : 0;

  const blocks = useMemo(() => {
    let ps = START;
    for (const mv of g.moves) ps = apply(ps, mv);
    return ps;
  }, [START, g.moves]);
  const occ = useMemo(() => grid(blocks), [blocks]);
  const slides = useMemo(() => (playing ? legalSlides(blocks) : []), [blocks, playing]);

  // For the selected block, the cell you tap to send it there. Each legal
  // distance gets exactly one target: the leading edge of where it would land,
  // so a tap is never ambiguous.
  const targets = useMemo(() => {
    if (sel == null || !playing) return new Map();
    const p = blocks[sel];
    const m = new Map();
    for (const [i, d] of slides) {
      if (i !== sel) continue;
      const np = p.pos + d;
      const lead = d < 0 ? np : np + p.len - 1;
      const cell = p.horiz ? p.fixed * N + lead : lead * N + p.fixed;
      m.set(cell, [i, d]);
    }
    return m;
  }, [sel, blocks, slides, playing]);

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
        if (saved && saved.v === 1 && Array.isArray(saved.moves)) {
          const next = { ...freshState(), ...saved };
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
        if (done || g.t0) localStorage.setItem('sot_park_day', JSON.stringify({ d: etToday(), done }));
        else localStorage.removeItem('sot_park_day');
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

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_park_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    if (!(cur.moves.length || cur.hintUsed) || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: cur.moves.length, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: g2.moves.length, won: g2.status === 'won' && g2.moves.length === par })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: g2.status === 'won' ? 1 : 0, guessesUsed: g2.moves.length, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
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

  function doMove(mv) {
    const cur = gRef.current;
    if (cur.status !== 'playing') return;
    const nextMoves = [...cur.moves, mv];
    let ps = START;
    for (const m of nextMoves) ps = apply(ps, m);
    const g2 = { ...cur, moves: nextMoves };
    if (!g2.t0) g2.t0 = Date.now();
    setSel(null); setHintBlock(null);
    if (solved(ps)) {
      const done = { ...g2, status: 'won', tEnd: Date.now() };
      vibrate(HAPT.win);
      postResult(done, scoreFor(done.moves.length, par));
      commit(done);
      return;
    }
    vibrate(HAPT.ok);
    commit(g2);
  }

  function onCell(cell) {
    if (!playing) return;
    if (!gRef.current.t0) { startGame(); return; }
    const mv = targets.get(cell);
    if (mv) { doMove(mv); return; }
    const r = Math.floor(cell / N), c = cell % N;
    const b = occ ? occ[r][c] : -1;
    if (b >= 0) {
      // Most blocks on a jammed board are wedged in. Picking one of those up and
      // then being told to tap a destination that does not exist reads as a bug,
      // so a boxed-in block is refused outright rather than selected.
      if (!slides.some(([i]) => i === b)) {
        setSel(null);
        setShake((k) => k + 1);
        say(b === 0 ? 'The red block is wedged in. Clear its lane first.' : 'That one is boxed in. Nothing can move it yet.');
        return;
      }
      setSel((v) => (v === b ? null : b));
      return;
    }
    setSel(null);
  }

  function restart() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.moves.length) return;
    commit({ ...cur, moves: [], restarts: cur.restarts + 1 });
    setSel(null); setHintBlock(null);
    say('Back to the start. Your move count is reset, the clock is not.');
  }

  function useHint() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || cur.hintUsed) return;
    const r = solve(blocks);
    if (!r || !r.next) return;
    const g2 = { ...cur, hintUsed: true };
    if (!g2.t0) g2.t0 = Date.now();
    commit(g2);
    setHintBlock(r.next[0]);
    setSel(r.next[0]);
    say(r.next[0] === 0 ? 'The red block itself moves next.' : 'That block moves next. Which way is still on you.');
  }

  function revealEnd() {
    const cur = gRef.current;
    if (cur.status !== 'playing') return;
    const g2 = { ...cur, status: 'gaveup', tEnd: Date.now() };
    if (!g2.t0) g2.t0 = Date.now();
    postResult(g2, 0);
    commit(g2);
    setSel(null);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    commit(freshState());
    setSel(null); setHintBlock(null); setEndClosed(false);
  }

  function shareUrl() { return withRef(`sourceoftruths.com/park${isTodays ? '' : `?p=${PUZZLE.num}`}`); }
  function shareText() {
    const over = used - par;
    const g5 = won ? Math.max(1, Math.round(scoreFor(used, par) / 2)) : 0;
    const squares = '\u{1F7EB}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const hintBit = g.hintUsed ? ' · \u{1F4A1}' : '';
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head = won
      ? `Park #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${used} moves (par ${par}${over > 0 ? `, +${over}` : ', on the nose'}) · ${elapsed}${hintBit}${streakBit}`
      : `Park #${PUZZLE.num} · gave up · par ${par}`;
    return `${head}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Park #${PUZZLE.num} — the daily sliding-block jam from Source of Truths. Par ${par}.\n${shareUrl()}`
      : shareText();
    if (notifyShareCredit(text)) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) { navigator.share({ text }).catch(() => {}); return; }
    } catch (e) {}
    try {
      navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
    } catch (e) {}
  }

  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>Get the <b>red block</b> out through the gap in the right-hand wall. <b>Tap a block</b> to pick it up, then <b>tap the square you want it to reach</b>, and it slides there if the lane is clear.</p>
      <p style={{ margin: '0 0 9px' }}>Every block is stuck on one axis. A block lying across slides left and right only, a block standing up slides only up and down. Nothing turns, nothing jumps.</p>
      <p style={{ margin: '0 0 9px' }}>Sliding one block any distance counts as <b>one move</b>. <b>Par is {par}</b> on this board, the true minimum, found by search rather than by hand. There is <b>no undo</b>, only a restart that puts the board back and zeroes your moves, though the clock keeps running.</p>
      <p style={{ margin: 0 }}>Par scores <b>10</b>, and every two moves over costs a point down to a floor of one, so finishing always beats walking away. One free <b>hint</b> names the block to move next. <b>Sundays</b> are a much longer jam.</p>
    </div>
  );

  const cellPct = 100 / N;

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="pk-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.pk-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .pk-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .pk-btn:hover{background:${COLORS.paper};}
          .pk-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .pk-lot{position:relative;width:100%;aspect-ratio:1 / 1;background:${LOT};border:10px solid ${WALL};border-radius:12px;touch-action:manipulation;overflow:visible;}
          .pk-cell{position:absolute;cursor:pointer;-webkit-tap-highlight-color:transparent;}
          .pk-blk{position:absolute;border-radius:9px;pointer-events:none;box-shadow:inset 0 -3px 6px rgba(0,0,0,0.22), inset 0 2px 3px rgba(255,255,255,0.28);transition:left .18s cubic-bezier(.3,.7,.4,1), top .18s cubic-bezier(.3,.7,.4,1);}
          .pk-dot{position:absolute;width:26%;height:26%;border-radius:50%;background:rgba(28,30,36,0.34);pointer-events:none;left:37%;top:37%;}
          .pk-lot.shake{animation:pkshake .34s ease;}
          @keyframes pkshake{0%,100%{transform:translateX(0);}22%{transform:translateX(-6px);}55%{transform:translateX(6px);}80%{transform:translateX(-3px);}}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="park" num={PUZZLE.num} dateLabel={PUZZLE.dateLabel} accent={COLORS.accent}
          blockGap={5} helpTop={13} marginBottom={16} onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Par {par}</span>}
          blocks={'PARK'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Park is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Slide the blocks and get the red one out of the gap on the right. Par is {par} moves, which is the proven minimum. No undo, only a restart.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="pk-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
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
            <span style={{ whiteSpace: 'nowrap' }}>moves <b style={{ color: used > par ? COLORS.rust : COLORS.ink, fontWeight: 500 }}>{used}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>par <b style={{ color: COLORS.accent, fontWeight: 500 }}>{par}</b></span>
          </div>

          <div style={{ maxWidth: 430, margin: '0 auto', position: 'relative' }}>
            <div key={shake} className={`pk-lot${shake ? ' shake' : ''}`}>
              {/* the exit gap, cut through the right wall on the escape row */}
              <div style={{ position: 'absolute', right: -10, top: `${EXIT_ROW * cellPct}%`, width: 10, height: `${cellPct}%`, background: LOT }} />
              <div aria-hidden="true" style={{ position: 'absolute', right: -34, top: `${EXIT_ROW * cellPct + cellPct / 2}%`, transform: 'translateY(-50%)', color: RED_BLOCK, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>OUT</div>
              {/* lot markings */}
              {Array.from({ length: N - 1 }).map((_, i) => (
                <React.Fragment key={i}>
                  <div style={{ position: 'absolute', left: `${(i + 1) * cellPct}%`, top: 0, bottom: 0, width: 1, background: LOT_LINE }} />
                  <div style={{ position: 'absolute', top: `${(i + 1) * cellPct}%`, left: 0, right: 0, height: 1, background: LOT_LINE }} />
                </React.Fragment>
              ))}
              {/* tap layer */}
              {Array.from({ length: N * N }).map((_, cell) => {
                const r = Math.floor(cell / N), c = cell % N;
                const isTarget = targets.has(cell);
                return (
                  <div key={cell} className="pk-cell" onClick={() => onCell(cell)} role="button" tabIndex={-1}
                    aria-label={`row ${r + 1} column ${c + 1}`}
                    style={{ left: `${c * cellPct}%`, top: `${r * cellPct}%`, width: `${cellPct}%`, height: `${cellPct}%`, zIndex: 3 }}>
                    {isTarget && <span className="pk-dot" />}
                  </div>
                );
              })}
              {/* blocks */}
              {blocks.map((p, i) => {
                const isRed = i === 0;
                const truck = p.len >= 3;
                const fill = isRed ? RED_BLOCK : truck ? TRUCK[i % TRUCK.length] : PAINT[i % PAINT.length];
                const top = p.horiz ? p.fixed : p.pos;
                const left = p.horiz ? p.pos : p.fixed;
                const w = p.horiz ? p.len : 1, h = p.horiz ? 1 : p.len;
                const on = sel === i;
                return (
                  <div key={i} className="pk-blk"
                    style={{
                      left: `calc(${left * cellPct}% + 3px)`, top: `calc(${top * cellPct}% + 3px)`,
                      width: `calc(${w * cellPct}% - 6px)`, height: `calc(${h * cellPct}% - 6px)`,
                      background: fill, zIndex: 2,
                      outline: on ? `3px solid ${COLORS.ink}` : hintBlock === i ? `3px solid ${COLORS.green}` : 'none',
                      outlineOffset: on || hintBlock === i ? '1px' : 0,
                      border: isRed ? `2px solid ${RED_EDGE}` : 'none',
                    }} />
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 12, minHeight: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: playing ? COLORS.accent : COLORS.faded }}>
              {!playing
                ? (won ? `Out in ${used}. Par was ${par}.` : 'You left it parked.')
                : sel != null ? 'Now tap where it goes.' : 'Tap a block to pick it up.'}
            </span>
            {g.restarts > 0 && playing && (
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: COLORS.faded, fontWeight: 500 }}>{g.restarts} restart{g.restarts === 1 ? '' : 's'}</span>
            )}
          </div>

          {playing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
              <button className="pk-tool" onClick={restart} disabled={!used} title="Put every block back and zero the move count" style={{ opacity: used ? 1 : 0.4, cursor: used ? 'pointer' : 'default' }}>
                <RotateCcw size={14} /> Restart board
              </button>
              {!g.hintUsed && (
                <button className="pk-tool" onClick={useHint} title="Name the block that moves next (one hint per board)" style={{ background: COLORS.accentSoft, borderColor: 'rgba(124,92,46,0.5)', color: '#6a4f27' }}>
                  <Lightbulb size={14} /> Hint
                </button>
              )}
            </div>
          )}
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              Tap a block, then tap where you want it. No undo.
            </span>
            <button onClick={() => { if (armReveal) { setArmReveal(false); revealEnd(); } else { setArmReveal(true); } }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 12, color: armReveal ? COLORS.rust : COLORS.faded, textDecoration: 'underline', textUnderlineOffset: 3, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Eye size={13} /> {armReveal ? 'Tap again — ends the board and scores nothing' : 'Give up'}
            </button>
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
              Par was <span style={{ color: COLORS.accent }}>{par} moves</span>.
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.faded, margin: '6px 0 0', lineHeight: 1.5 }}>
              {won
                ? used === par ? 'You matched the proven minimum, which is as good as this board gets.'
                  : `You got out in ${used}, ${used - par} over the minimum.`
                : 'The minimum was found by exhaustive search, so it is real, not an estimate.'}
            </div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition, a much longer jam.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Park in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new board drops at midnight Eastern.'}
                  {prevPuzzle && (<>{' '}Meanwhile: <a href={`/park?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>play yesterday&rsquo;s Park &rarr;</a></>)}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/park" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Park &rarr;</a>
                  {' · '}<a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </div>
        )}

        {focusMode && (
          <div style={{ maxWidth: 620, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other puzzles, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid self="park" maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }} light
            boardSlot={<DailyBoardPanel self="park" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
            divider />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Park to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s board, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s board, every day.</p>
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
        <DailyEndCard modal self="park" won={won}
          headline={won ? (used === par ? <>Par. Nothing wasted.</> : <>You&rsquo;re out.</>) : <>You scored 0%</>}
          subline={won
            ? <>{finalScore}/10 &middot; {used} moves, par {used === par ? 'matched' : `${par}`} &middot; {elapsed}{g.hintUsed ? <> &middot; 1 hint</> : null}</>
            : <>0/10 &middot; par on this board was {par}</>}
          onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'}
          onReplay={resetGame} onClose={() => setEndClosed(true)} />
      )}

      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>{toast}</div>
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
            <button className="pk-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Park</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Park is a free daily sliding-block puzzle from Source of Truths. A jammed six by six lot, a dozen blocks that each slide on one axis only, and a red block that has to reach the gap in the wall. Tap a block, tap where you want it, and it goes if the lane is clear.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Every board is machine generated and then solved exactly, so the par you are scored against is the true minimum rather than somebody&rsquo;s guess, and it was confirmed by a second solver written independently of the first. Boards climb through the week, from about a dozen moves on Monday to twenty by Saturday, and the Sunday Edition runs a good deal longer than any of them.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new board drops every day at midnight Eastern. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/check" style={{ color: COLORS.ink, fontWeight: 800 }}>Check</a>, our daily checkers shot, <a href="/four" style={{ color: COLORS.ink, fontWeight: 800 }}>Four</a>, our daily Connect Four position, and <a href="/mate" style={{ color: COLORS.ink, fontWeight: 800 }}>Mate</a>, our daily chess endgame.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}
