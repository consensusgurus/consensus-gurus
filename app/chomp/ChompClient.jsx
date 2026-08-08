'use client';

// Chomp — the daily route puzzle.
//
// Seven mascots on a 13x13 board, eaten in order, one square per keypress. Two
// rules carry it, and everything else here serves them:
//
//   1. THE BODY NEVER RETRACTS. Every square the head touches is yours for the
//      rest of the run, so your trail is a permanent wall. The shortest hop to
//      the ibis is very often the move that strands the longhorn behind you.
//   2. A MASCOT IS SOLID UNTIL ITS TURN. You cannot cross the lion on the way to
//      the gamecock. That falls out of rule 1: with a permanent trail, crossing
//      one early would leave it stranded under your own body forever, and a
//      visible wall is fairer than a board ruined twenty moves before anyone
//      notices.
//
// YOU DO NOT NEED THEM ALL (owner, 2026-08-08). The score is how far down the
// cast you got, so a run that stalls on the fifth still scores five. That is
// what makes a hard board survivable.
//
// RESTART BOOKS THE RUN (owner, 2026-08-08, reversing an earlier free-replay
// call). Pressing Restart records the game exactly as it stood, then puts you
// back at the top of the same board to play it again. That is the house rule
// Four, Chain, Check and Mate already follow, and it is what keeps the daily
// leaderboard a measure of the first attempt rather than of patience. It is
// TWO-TAP ARMED and has no keyboard shortcut, because a control that costs you
// the day should not be one stray keypress away.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, RotateCcw } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyRules from '../DailyRules';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import DailyMasthead from '../DailyMasthead';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { notifyShareCredit } from '../ShareCreditPop';
import { T } from '@/lib/theme';
import { DIRS, freshState, applyMove, anyLegal, isCleared, fillOf } from '@/lib/chomp-engine';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const COLORS = {
  ink: T.ink, cream: '#f7f8fa', faded: '#3f4757', line: '#e5e7eb',
  accent: '#a8430f', accentSoft: '#fbeadf', block: '#dc2626',
};
const HELP_KEY = 'sot_chomp_help_seen';
const STATS_KEY = 'sot_chomp_stats';
const BLOCK_MS = 260;
const LABEL = {
  bulldog: 'Bulldog', ibis: 'Ibis', gamecock: 'Gamecock', lion: 'Lion',
  tiger: 'Tiger', eagle: 'Eagle', longhorn: 'Longhorn',
};

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
const nf = (n) => Number(n || 0).toLocaleString('en-US');
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
// How far down the cast you got, out of ten. Clearing every mascot is the only
// way to a 10; everything short of that scales.
function scoreOf(eaten, total) {
  if (eaten >= total) return 10;
  return Math.max(0, Math.min(9, Math.round((eaten / total) * 10)));
}

// ---- the gator's head ------------------------------------------------------
// Drawn in LOCAL coordinates with +x pointing the way it is travelling, then
// rotated into place. Everything below is therefore written as if the gator
// always faces right, which is the only way jaw geometry stays readable.
//
// It is a long snout rather than a disc: two jaw halves hinged at the back, with
// teeth along the bite line, an eye ridge sitting proud on top, and a nostril at
// the tip. The jaws swing open on the move that swallows a mascot and clamp shut
// when the run ends.
const GATOR = { skin: '#3f8f3f', dark: '#2a6b2a', belly: '#8fca7a', teeth: '#ffffff' };
function drawHead(ctx, cellXY, facing, cell, dead, chewing) {
  const [hx, hy] = cellXY;
  const f = facing && (facing[0] || facing[1]) ? facing : [1, 0];
  const cx = hx * cell + cell / 2, cy = hy * cell + cell / 2;
  const c = cell;
  const gape = dead ? 0.04 : chewing ? 0.46 : 0.26;   // radians, per jaw

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.atan2(f[1], f[0]));

  // one jaw: a wedge from the hinge out to the snout, drawn either side of the
  // bite line. `sign` is -1 for the upper jaw, +1 for the lower.
  const jaw = (sign, len, thick, fill) => {
    ctx.save();
    ctx.rotate(sign * gape);
    ctx.beginPath();
    ctx.moveTo(-c * 0.34, 0);
    ctx.lineTo(len, 0);
    ctx.quadraticCurveTo(len + c * 0.05, sign * thick * 0.5, len - c * 0.06, sign * thick);
    ctx.lineTo(-c * 0.26, sign * thick * 1.05);
    ctx.quadraticCurveTo(-c * 0.40, sign * thick * 0.6, -c * 0.34, 0);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    // teeth along the bite line, biggest at the front
    if (gape > 0.10) {
      ctx.fillStyle = GATOR.teeth;
      for (let i = 0; i < 4; i++) {
        const x = len - c * 0.10 - i * c * 0.10;
        const w = c * (0.055 - i * 0.006);
        ctx.beginPath();
        ctx.moveTo(x - w, 0);
        ctx.lineTo(x + w, 0);
        ctx.lineTo(x, sign * c * 0.11);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  };

  jaw(1, c * 0.46, c * 0.20, GATOR.belly);   // lower jaw, paler, drawn first
  jaw(-1, c * 0.52, c * 0.26, GATOR.skin);   // upper jaw, on top

  // the eye ridge, sitting proud on the skull behind the snout
  ctx.save();
  ctx.rotate(-gape);
  const ex = -c * 0.14, ey = -c * 0.24;
  ctx.fillStyle = GATOR.skin;
  ctx.beginPath(); ctx.arc(ex, ey, c * 0.13, 0, 7); ctx.fill();
  ctx.fillStyle = dead ? GATOR.dark : '#ffffff';
  ctx.beginPath(); ctx.arc(ex, ey, c * 0.085, 0, 7); ctx.fill();
  if (dead) {
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, c * 0.035);
    ctx.beginPath();
    ctx.moveTo(ex - c * 0.05, ey - c * 0.05); ctx.lineTo(ex + c * 0.05, ey + c * 0.05);
    ctx.moveTo(ex + c * 0.05, ey - c * 0.05); ctx.lineTo(ex - c * 0.05, ey + c * 0.05);
    ctx.stroke();
  } else {
    // a slit pupil, because a round one reads as a frog
    ctx.fillStyle = '#0b0c0e';
    ctx.beginPath();
    ctx.ellipse(ex, ey, Math.max(0.7, c * 0.022), c * 0.062, 0, 0, 7);
    ctx.fill();
  }
  // nostril at the very tip of the snout
  ctx.fillStyle = GATOR.dark;
  ctx.beginPath(); ctx.arc(c * 0.40, -c * 0.13, Math.max(0.8, c * 0.032), 0, 7); ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ---- stats (identical shape to every other daily) --------------------------
function getStats() {
  try { const s = JSON.parse(localStorage.getItem(STATS_KEY)); if (s && s.v === 1 && s.rec) return s; } catch (e) {}
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
  const rec = (s && s.rec) || {};
  const nums = Object.keys(rec).map(Number).sort((a, b) => a - b);
  let max = 0, run = 0, prev = null;
  for (const n of nums) { run = prev != null && n === prev + 1 ? run + 1 : 1; if (run > max) max = run; prev = n; }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played: nums.length, perfect: nums.filter((n) => rec[n].won).length, cur, max };
}
function mergeServerStats(s, recent, puzzles) {
  if (!s || !Array.isArray(recent) || !recent.length) return s;
  const byQuiz = {};
  for (const p of puzzles) byQuiz[p.quizId] = p;
  let rec = s.rec, changed = false;
  for (const m of recent) {
    const p = m && byQuiz[m.quizId];
    if (!p || m.attempt !== 1 || rec[p.num]) continue;
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 10, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

export default function ChompClient({ puzzles = [], forceNum = null }) {
  const searchParams = useSearchParams();
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const CAST = PUZZLE.cast;
  const NPEL = CAST.length;
  const STORE_KEY = `sot_chomp_${PUZZLE.num}`;
  const REC_KEY = `sot_chomp_rec_${PUZZLE.num}`;
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;

  const [g, setG] = useState(() => freshState(PUZZLE));
  const gRef = useRef(g);
  const [hydrated, setHydrated] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(true);
  const [endClosed, setEndClosed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [stats, setStats] = useState(null);
  const [blocked, setBlocked] = useState(null);
  const [armRestart, setArmRestart] = useState(false);
  const [nowTick, setNowTick] = useState(0);
  const [sprites, setSprites] = useState({});
  const cvsRef = useRef(null);
  const boxRef = useRef(null);
  const cellRef = useRef(30);
  const blockRef = useRef(null);
  const viewedRef = useRef(false);
  const { duelToken, duelInfo, duelSubmitted } = useDuelContext(PUZZLE.quizId, searchParams);

  const commit = useCallback((next) => {
    gRef.current = next;
    setG(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) {}
  }, [STORE_KEY]);

  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const cleared = g.pi >= NPEL;
  const over = g.status !== 'playing';
  const score10 = scoreOf(g.pi, NPEL);
  const won = over && cleared;
  const myStats = useMemo(() => deriveStats(stats || { rec: {} }, PUZZLE.num), [stats, PUZZLE.num]);
  const elapsed = g.ms + (started && !over && g.tMark ? Date.now() - g.tMark : 0);
  const fillPct = Math.round(fillOf(PUZZLE, g) * 100);

  // the mascot art, loaded once
  useEffect(() => {
    let live = true;
    const out = {};
    let left = CAST.length;
    CAST.forEach((m) => {
      const im = new window.Image();
      im.src = `/games/chomp/${m}.png`;
      im.onload = im.onerror = () => { left -= 1; if (!left && live) setSprites({ ...out }); };
      out[m] = im;
    });
    return () => { live = false; };
  }, [CAST]);

  // ---- hydrate -------------------------------------------------------------
  useEffect(() => {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
    if (saved && saved.v === 2 && Array.isArray(saved.body) && saved.body.length) {
      const s = { ...freshState(PUZZLE), ...saved, tMark: Date.now() };
      gRef.current = s; setG(s);
    }
    try { setGateRules(!localStorage.getItem(HELP_KEY)); } catch (e) {}
    setStats(getStats());
    try { setIdentity(JSON.parse(localStorage.getItem('sot_quiz_identity'))); } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORE_KEY]);

  useEffect(() => {
    if (!started || over) return;
    const i = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(i);
  }, [started, over]);

  useEffect(() => {
    if (!hydrated) return;
    const anon = getAnonId();
    let em = '';
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity')); if (id && id.email) em = `&email=${encodeURIComponent(id.email)}`; } catch (e) {}
    fetch(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}`)
      .then((r) => r.json())
      .then((d) => { if (d && Array.isArray(d.recent)) setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles)); })
      .catch(() => {});
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}`)
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
      .catch(() => {});
    if (!viewedRef.current) {
      viewedRef.current = true;
      try {
        fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) });
      } catch (e) {}
    }
  }, [hydrated, PUZZLE.quizId, puzzles]);

  useEffect(() => {
    if (!hydrated || !isTodays) return;
    try {
      const done = g.status !== 'playing';
      if (done || g.t0) localStorage.setItem('sot_chomp_day', JSON.stringify({ d: etToday(), done }));
      else localStorage.removeItem('sot_chomp_day');
    } catch (e) {}
  }, [hydrated, isTodays, g.status, g.t0]);

  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.t0 || cur.moves === 0) return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round(cur.ms / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return {
      quizId: PUZZLE.quizId, score: scoreOf(cur.pi, NPEL), total: 10,
      correct: cur.pi >= NPEL ? 1 : 0, guessesUsed: cur.moves, timeElapsed: el, abandoned: true,
      email: (identity && identity.email) || undefined, anonId: getAnonId(),
      isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
    };
  });

  const postResult = useCallback((g2) => {
    abandon.markFlushed();
    const done = g2.pi >= NPEL;
    const sc = scoreOf(g2.pi, NPEL);
    const el = Math.max(1, Math.round(g2.ms / 1000));
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: 10, g: g2.moves, won: done })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: PUZZLE.quizId, score: sc, total: 10, correct: done ? 1 : 0,
          guessesUsed: g2.moves, timeElapsed: el,   // moves: ties break on fewest, then time
          email: (identity && identity.email) || undefined, anonId: getAnonId(),
          isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
        }),
      }).then((r) => r.json()).then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); }).catch(() => {});
    } catch (e) {}
  }, [abandon, PUZZLE.quizId, PUZZLE.num, NPEL, identity]);

  const finish = useCallback((st) => {
    commit({ ...st, status: 'over', tEnd: Date.now() });
    postResult({ ...st, status: 'over' });
  }, [commit, postResult]);

  // ---- moving --------------------------------------------------------------
  const move = useCallback((which) => {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !cur.t0) return;
    const d = DIRS[which];
    if (!d) return;
    const now = Date.now();
    const moved = applyMove(PUZZLE, cur, d);
    // an illegal move is REFUSED, never fatal, and never costs a move
    if (!moved) {
      const h = cur.body[0];
      setBlocked({ x: h[0] + d[0], y: h[1] + d[1], at: now });
      return;
    }
    // an idle stretch over two minutes is thinking, not playing, so the clock
    // that breaks leaderboard ties stops counting it
    const next = { ...moved, ms: cur.ms + Math.min(120000, now - (cur.tMark || now)), tMark: now };
    if (isCleared(PUZZLE, next) || !anyLegal(PUZZLE, next)) { finish(next); return; }
    commit(next);
  }, [PUZZLE, commit, finish]);

  const DAS = 250, ARR = 85;
  const repRef = useRef({ t: null, i: null });
  const stopRepeat = useCallback(() => {
    if (repRef.current.t) { clearTimeout(repRef.current.t); repRef.current.t = null; }
    if (repRef.current.i) { clearInterval(repRef.current.i); repRef.current.i = null; }
  }, []);
  const startRepeat = useCallback((which) => {
    stopRepeat();
    move(which);
    repRef.current.t = setTimeout(() => { repRef.current.i = setInterval(() => move(which), ARR); }, DAS);
  }, [move, stopRepeat]);
  useEffect(() => stopRepeat, [stopRepeat]);

  const holdProps = (which) => ({
    onPointerDown: (e) => { e.preventDefault(); e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); startRepeat(which); },
    onPointerUp: stopRepeat, onPointerLeave: stopRepeat, onPointerCancel: stopRepeat,
    onContextMenu: (e) => e.preventDefault(),
  });

  // NO drag-to-move on the board (owner, 2026-08-08). The swipe handler that
  // used to live here captured pointer events over the canvas, so a thumb trying
  // to SCROLL THE PAGE dragged the gator the length of the board instead. On a
  // phone the d-pad is the only movement control; the canvas is now inert and
  // `touchAction` is left alone so the page scrolls over it like any other
  // element.

  // ---- canvas --------------------------------------------------------------
  // sizeBoard redraws through drawRef rather than closing over `draw`. It only
  // depends on the board dimensions, so a captured `draw` would be the one from
  // first render, back when the mascot art had not loaded. On desktop nothing
  // resizes after that and the state-driven redraw covers it, but a phone fires
  // resize every time the address bar hides, which repainted the board with an
  // empty sprite table and made the mascots vanish mid-run.
  const drawRef = useRef(null);
  const sizeBoard = useCallback(() => {
    const box = boxRef.current, cvs = cvsRef.current;
    if (!box || !cvs) return;
    const fw = Math.max(140, box.clientWidth);
    const fh = (typeof window !== 'undefined' ? window.innerHeight : 800) - 330;
    const cell = Math.max(15, Math.min(36, Math.floor(Math.min(fw / PUZZLE.w, fh / PUZZLE.h))));
    cellRef.current = cell;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    cvs.width = PUZZLE.w * cell * dpr; cvs.height = PUZZLE.h * cell * dpr;
    cvs.style.width = `${PUZZLE.w * cell}px`; cvs.style.height = `${PUZZLE.h * cell}px`;
    cvs.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    if (drawRef.current) drawRef.current();
  }, [PUZZLE.w, PUZZLE.h]);

  const draw = useCallback(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const cell = cellRef.current, W = PUZZLE.w * cell, H = PUZZLE.h * cell;
    const st = gRef.current;
    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    };
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff'; rr(0, 0, W, H, 12); ctx.fill();
    ctx.strokeStyle = '#eef1f5'; ctx.lineWidth = 1;
    for (let i = 1; i < PUZZLE.w; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 5); ctx.lineTo(i * cell, H - 5); ctx.stroke(); }
    for (let i = 1; i < PUZZLE.h; i++) { ctx.beginPath(); ctx.moveTo(5, i * cell); ctx.lineTo(W - 5, i * cell); ctx.stroke(); }

    // the trail: flat and quiet, because it is scenery the player reads as walls
    for (let i = st.body.length - 1; i >= 1; i--) {
      const [bx, by] = st.body[i];
      ctx.globalAlpha = 0.26;
      ctx.fillStyle = COLORS.accent;
      rr(bx * cell + 2, by * cell + 2, cell - 4, cell - 4, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // the mascots still to eat, the next one lit
    for (let i = st.pi; i < PUZZLE.pellets.length; i++) {
      const [px, py] = PUZZLE.pellets[i];
      const next = i === st.pi;
      if (next) {
        ctx.fillStyle = COLORS.accentSoft;
        rr(px * cell + 1, py * cell + 1, cell - 2, cell - 2, 5); ctx.fill();
        ctx.strokeStyle = COLORS.accent; ctx.lineWidth = 2;
        rr(px * cell + 1, py * cell + 1, cell - 2, cell - 2, 5); ctx.stroke();
      }
      const im = sprites[CAST[i]];
      ctx.globalAlpha = next ? 1 : 0.7;
      if (im && im.complete && im.naturalWidth) {
        ctx.drawImage(im, px * cell + 2, py * cell + 2, cell - 4, cell - 4);
      } else {
        // never leave a mascot square blank: if the art has not landed yet, or
        // failed, fall back to a numbered disc so the board is always playable
        ctx.beginPath();
        ctx.arc(px * cell + cell / 2, py * cell + cell / 2, cell * 0.34, 0, 7);
        ctx.fillStyle = next ? COLORS.accent : '#c4ccd8';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${Math.round(cell * 0.44)}px ${SANS}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), px * cell + cell / 2, py * cell + cell / 2 + 0.5);
      }
      ctx.globalAlpha = 1;
    }

    drawHead(ctx, st.body[0], st.facing, cell, st.status !== 'playing', st.chewing);

    const bl = blockRef.current;
    if (bl && Date.now() - bl.at < BLOCK_MS && bl.x >= 0 && bl.y >= 0 && bl.x < PUZZLE.w && bl.y < PUZZLE.h) {
      ctx.strokeStyle = COLORS.block; ctx.lineWidth = 2;
      rr(bl.x * cell + 2, bl.y * cell + 2, cell - 4, cell - 4, 3); ctx.stroke();
    }
  }, [PUZZLE.w, PUZZLE.h, PUZZLE.pellets, CAST, sprites]);

  useEffect(() => { drawRef.current = draw; blockRef.current = blocked; draw(); }, [draw, g, blocked, sprites]);
  // the art arriving must repaint at the CURRENT size, not just on next state
  useEffect(() => { if (drawRef.current) drawRef.current(); }, [sprites]);
  useEffect(() => {
    if (!blocked) return;
    const t = setTimeout(() => setBlocked(null), BLOCK_MS);
    return () => clearTimeout(t);
  }, [blocked]);
  useEffect(() => {
    if (!hydrated) return;
    sizeBoard();
    const on = () => sizeBoard();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [hydrated, sizeBoard, started, preStart]);

  function startGame() {
    const cur = gRef.current;
    if (cur.t0) return;
    const now = Date.now();
    commit({ ...cur, t0: now, tMark: now });
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
    setTimeout(sizeBoard, 0);
  }
  // Restart records the run as it stands and then re-deals the same board.
  // postResult carries markFlushed (so no later abandon double-posts) and
  // recordStat is write-once (so a second restart cannot overwrite the first
  // result). Two-tap armed: the first press only arms it.
  const restartBoard = useCallback(() => {
    if (!armRestart) {
      setArmRestart(true);
      setTimeout(() => setArmRestart(false), 3200);
      return;
    }
    setArmRestart(false);
    const cur = gRef.current;
    const now = Date.now();
    if (cur.status === 'playing' && cur.t0) {
      postResult({ ...cur, ms: cur.ms + Math.min(120000, now - (cur.tMark || now)) });
    }
    // t0 is set straight away rather than dropping back to the start tile: the
    // tile exists to keep the FIRST attempt's clock honest, and this is not one.
    commit({ ...freshState(PUZZLE), t0: now, tMark: now });
    setBlocked(null);
    setEndClosed(true);
  }, [PUZZLE, commit, postResult, armRestart]);

  useEffect(() => {
    const onKey = (e) => {
      if (showHelp) { if (e.key === 'Escape') setShowHelp(false); return; }
      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
      };
      if (!map[e.key]) return;
      e.preventDefault();
      move(map[e.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, showHelp]);

  // ---- share ---------------------------------------------------------------
  // Counts only. Nothing here describes the route, so a shared result can never
  // hand somebody the board.
  function shareText() {
    const sun = PUZZLE.sunday ? ' · Sunday' : '';
    const line = cleared
      ? `all ${NPEL} in ${g.moves} moves`
      : `${g.pi}/${NPEL} · boxed in after ${g.moves} moves`;
    return `Chomp #${PUZZLE.num}${sun} · ${line}\nmindloftdaily.com/chomp`;
  }
  function copyShare() {
    const txt = shareText();
    if (notifyShareCredit(txt)) return;
    try {
      if (isMobileDevice() && navigator.share) { navigator.share({ text: txt }).catch(() => {}); return; }
      navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  }

  // ---- rules ---------------------------------------------------------------
  const rulesBody = (
    <DailyRules
      accent={COLORS.accent}
      accentSoft={COLORS.accentSoft}
      lead="Eat the seven mascots in order. Every square you touch stays yours, so your own trail is the maze."
      banner={`Everyone gets the same board today${PUZZLE.sunday ? ', with the mascots spread further apart' : ''}.`}
      sub={`Bulldog and ibis always lead. The other five change order daily.`}
      steps={[
        <>Move one square at a time with the <b>arrow keys</b> or the pad. Nothing moves until you do.</>,
        <>Your body <b>never shrinks</b>. Where you have been is a wall for the rest of the run.</>,
        <>A mascot whose turn has not come is <b>solid</b>. You cannot cross the lion to reach the gamecock.</>,
        <>Steering into a wall is <b>refused</b>, not punished, and costs no move. The run ends only when the head has nowhere legal left to go.</>,
        <><b>Restart</b> puts you back at the top of the same board, but it <b>records the run as it stood</b>, so the board you post is the one you were on. Press it twice to confirm.</>,
      ]}
      knack="Getting to the mascot in front of you is easy. The board is about the one after it: the shortest line to the fourth is very often the line that walls off the fifth. Look one mascot further than you want to."
      footer={`Scored on HOW FAR DOWN THE CAST YOU GOT, so you do not need all seven: stall on the fifth and you still score five. Clearing all ${NPEL} is a perfect 10. Ties break on fewest moves, then on time. Restarting records the run as it stood, so your first attempt is the one that counts. Sunday Editions use the same seven mascots but spread them further apart, so more of the board is wall by the time the last one is in reach.`}
    />
  );

  const btn = { fontFamily: SANS, fontWeight: 800, fontSize: 14, border: `2px solid ${COLORS.accent}`, background: '#fff', color: COLORS.accent, borderRadius: 8, padding: '9px 16px', cursor: 'pointer' };
  const dockBtn = { width: 46, height: 44, borderRadius: 9, border: `1px solid ${COLORS.line}`, background: '#fff', color: COLORS.faded, fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' };
  const stat = (label, value, tone) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: tone || COLORS.ink, lineHeight: 1.2 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, fontFamily: SANS }}>
      <Grain />
      <DailyChrome slug="chomp" name="Chomp" collapsed={started} />

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '18px 18px 40px', position: 'relative', zIndex: 2 }}>
        <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />

        <DailyMasthead
          slug="chomp"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          helpTop={13}
          marginBottom={16}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && (
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>
              Sunday Edition &middot; spread wide
            </span>
          )}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Chomp is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Eat the seven mascots in order. Every square you touch stays yours for the rest of the run, so your own trail is the only thing in your way. Replay is free.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button onClick={startGame} style={{ ...btn, background: T.cta, borderColor: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
          <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14 }}>
            {/* the cast, in eating order, with the next one lit */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', marginBottom: 11 }}>
              {CAST.map((m, i) => {
                const done = i < g.pi, next = i === g.pi;
                return (
                  <div key={m} style={{
                    display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px 2px 3px', borderRadius: 20,
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '0.02em',
                    background: next ? COLORS.accentSoft : done ? 'transparent' : '#f4f6f8',
                    color: next ? COLORS.accent : '#94a3b8',
                    opacity: done ? 0.4 : 1,
                  }}>
                    <img src={`/games/chomp/${m}.png`} alt="" width={18} height={18} style={{ display: 'block' }} />
                    {done ? '✓' : LABEL[m]}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, paddingBottom: 11, borderBottom: `1px solid ${COLORS.line}` }}>
              {stat('Eaten', `${g.pi}/${NPEL}`, COLORS.accent)}
              {stat('Moves', nf(g.moves))}
              {stat('Board', `${fillPct}%`)}
              {stat('Clock', fmtTime(elapsed))}
              <button
                onClick={restartBoard}
                title="Restart this board. The run so far is recorded."
                style={{ border: `1px solid ${armRestart ? COLORS.block : COLORS.line}`, background: armRestart ? '#fef2f2' : '#fff', color: armRestart ? COLORS.block : COLORS.faded, borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 'none', whiteSpace: 'nowrap' }}
              >
                <RotateCcw size={13} /> {armRestart ? 'Records this run' : 'Restart'}
              </button>
              <button onClick={() => setShowHelp(true)} aria-label="How to play" style={{ border: `1px solid ${COLORS.line}`, background: '#fff', color: COLORS.faded, borderRadius: 7, width: 30, height: 28, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <HelpCircle size={15} />
              </button>
            </div>

            <div ref={boxRef} style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas ref={cvsRef} style={{ display: 'block' }} />
            </div>

            <div className="ch-dock">
              <div className="ch-pad">
                <button className="ch-up" style={dockBtn} {...holdProps('up')} aria-label="Move up">&#9650;</button>
                <button className="ch-lf" style={dockBtn} {...holdProps('left')} aria-label="Move left">&#9664;</button>
                <button className="ch-dn" style={dockBtn} {...holdProps('down')} aria-label="Move down">&#9660;</button>
                <button className="ch-rt" style={dockBtn} {...holdProps('right')} aria-label="Move right">&#9654;</button>
              </div>
            </div>

            <div className="ch-keys" style={{ textAlign: 'center', marginTop: 9, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', color: '#9aa2b1' }}>
              &larr; &uarr; &darr; &rarr; or WASD &middot; hold to keep going &middot; a blocked move is refused, not fatal
            </div>
            <div className="ch-touchhint" style={{ display: 'none', textAlign: 'center', marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.03em', color: '#9aa2b1' }}>
Use the pad to move &middot; hold an arrow to keep going
            </div>
          </div>
        )}

        {/* Only for players who have not joined. Rendering this unconditionally
            is the bug that makes a signed-in player get asked to sign up on
            every board; Turn and Paths gate it on !identity and so does this. */}
        {!identity && (
          <div id="daily-join" style={{ marginTop: 20 }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(u) => setIdentity(u)} />
          </div>
        )}

        <DailyGamesGrid
          self="chomp"
          maxWidth={620}
          challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
          share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
          light
          divider
          boardSlot={<DailyBoardPanel self="chomp" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
        />

        <section style={{ maxWidth: 620, margin: '26px auto 0', fontSize: 13.5, lineHeight: 1.6, color: COLORS.faded }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '0 0 8px' }}>About Chomp</h2>
          <p style={{ margin: '0 0 9px' }}>
            Chomp is a daily route puzzle. Seven mascots sit on a thirteen by thirteen board and have to be eaten in order,
            and every square you touch belongs to you for the rest of the run. Nothing chases you and nothing is on a timer.
            The only obstacle is the trail you have already laid, which is why the shortest line to the fourth mascot is so
            often the line that walls off the fifth.
          </p>
          <p style={{ margin: '0 0 9px' }}>
            You do not need all seven. The score is how far down the cast you got, so a run that stalls still counts.
            Everybody plays the same board on the same day, ties break on fewest moves, and restarting records the run as it
            stood, so the first attempt is the one that counts. Sundays spread the mascots further apart.
          </p>
          <p style={{ margin: 0 }}>
            More daily puzzles: <a href="/parker" style={{ color: COLORS.accent }}>Parker</a>,{' '}
            <a href="/etch" style={{ color: COLORS.accent }}>Etch</a>,{' '}
            <a href="/hedge" style={{ color: COLORS.accent }}>Hedge</a>.
          </p>
        </section>
      </div>

      {/* OUTSIDE the page column on purpose: the column is a stacking context and
          the end card's backdrop paints under the header from inside it. */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="chomp"
          won={won}
          quizId={PUZZLE.quizId}
          headline={won ? <>All seven.</> : <>You got {g.pi} of {NPEL}</>}
          subline={won
            ? <>{nf(g.moves)} moves &middot; board {fillPct}% full &middot; {fmtTime(g.ms)}</>
            : <>Boxed in on the {LABEL[CAST[g.pi]] || 'next one'} &middot; {nf(g.moves)} moves &middot; board {fillPct}% full</>}
          onShare={copyShare}
          shareLabel={copied ? 'Copied' : 'Share Result'}
          onClose={() => setEndClosed(true)}
        />
      )}

      {showHelp && (
        <div
          onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ ...btn, marginTop: 14, background: COLORS.ink, borderColor: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <style>{`
        .ch-dock { display: flex; justify-content: center; margin-top: 12px; }
        .ch-pad {
          display: grid;
          grid-template-areas: ". up ." "lf dn rt";
          grid-template-columns: repeat(3, 58px);
          gap: 5px;
          justify-content: center;
        }
        .ch-up { grid-area: up; }
        .ch-lf { grid-area: lf; }
        .ch-dn { grid-area: dn; }
        .ch-rt { grid-area: rt; }
        .ch-pad button { width: 100% !important; }
        @media (max-width: 640px) {
          .ch-keys { display: none !important; }
          .ch-touchhint { display: block !important; }
          .ch-dock { margin-top: 10px; }
          .ch-pad { grid-template-columns: repeat(3, 64px); gap: 6px; }
          .ch-pad button { height: 58px !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}
