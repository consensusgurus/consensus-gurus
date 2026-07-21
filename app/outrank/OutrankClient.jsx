'use client';

// Outrank — the daily crowd-ranking game. The answer key is everyone else.
//
// One themed slate a day (six items; seven in the Sunday Edition). Two moves:
// first VOTE — tap your personal favorite, which becomes part of the crowd —
// then CALL IT — put the whole slate in the order you think today's crowd
// ranks it by favorite votes. Lock in and face the field: the server grades
// your call against the crowd's real order as it stands right now, and keeps
// re-grading. Nothing is final — every new vote can reshuffle the order, so
// your score and rank move all day (same adaptive contract as Outwit). The
// pre-written house crowd seeds the pool until ten real players are in, then
// retires for everyone. Your prediction is always graded on the crowd MINUS
// your own vote, so your ballot never tips the order you're scored against.
//
// Same daily plumbing as Outwit: banked days gated by Eastern date on the
// server (app/outrank/page.js — which also strips the house votes before
// anything reaches the browser), per-puzzle localStorage saves, /outrank?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Users, Crown, RotateCcw } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { withRef } from '@/lib/referrals';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#4338ca',       // Outrank identity — indigo podium
  accentSoft: '#eef0fb',
  gold: '#e8b43a',
  green: '#15803d',
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_outrank_help_seen';
const STATS_KEY = 'sot_outrank_stats';

// "You outranked the crowd" threshold: ~70% of the day's max (8/12; 10/14 on
// Sundays), matching Outwit's 7/10 bar.
const winBar = (total) => Math.round(total * 0.7);

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

function fmtBig(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-US');
}

// Live standings — the board that re-shuffles as votes arrive. Fed straight
// from the /api/outrank response (result.board), which recomputes every
// registered player's total against the current field on every request.
function OutrankLiveBoard({ board, total }) {
  if (!board) return null;
  const top = Array.isArray(board.top) ? board.top : [];
  const youShown = top.some((r) => r.you);
  return (
    <div style={{ maxWidth: 472, margin: '0 auto 12px', background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '13px 15px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.accent }}>Live standings</span>
        <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: COLORS.faded, marginLeft: 'auto' }}>{fmtBig(board.field || 0)} in the field</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: COLORS.faded, lineHeight: 1.45, marginBottom: 10 }}>
        Nothing here is final. Every new vote can reshuffle the crowd&rsquo;s order &mdash; your place climbs or slips as the field fills in.
        {board.houseActive ? ' The house crowd is still seeding until ten players lock in.' : ''}
      </div>
      {top.length === 0 ? (
        <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: COLORS.faded, padding: '6px 0' }}>No one has joined the board yet &mdash; be the first name on it.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {top.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 6, background: r.you ? 'rgba(232,180,58,0.16)' : (i % 2 ? COLORS.cream : 'transparent'), border: r.you ? `1px solid ${COLORS.gold}` : '1px solid transparent' }}>
              <span style={{ flex: '0 0 26px', fontFamily: MONO, fontSize: 12, fontWeight: 500, color: r.rank <= 3 ? COLORS.ink : COLORS.faded, textAlign: 'right' }}>{r.rank}</span>
              <span style={{ flex: '1 1 auto', fontFamily: SANS, fontSize: 13, fontWeight: r.you ? 800 : 600, color: r.you ? '#8a6d1a' : COLORS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}{r.you ? ' · you' : ''}</span>
              <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 12.5, fontWeight: 500, color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{r.total}<span style={{ color: COLORS.faded, fontSize: 10.5 }}>/{total}</span></span>
            </div>
          ))}
        </div>
      )}
      {board.youRegistered && !youShown && board.you ? (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(28,30,36,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: '0 0 26px', fontFamily: MONO, fontSize: 12, fontWeight: 700, color: '#8a6d1a', textAlign: 'right' }}>{board.you.rank}</span>
          <span style={{ flex: '1 1 auto', fontFamily: SANS, fontSize: 13, fontWeight: 800, color: '#8a6d1a' }}>You</span>
          <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 12.5, fontWeight: 500, color: COLORS.ink }}>{board.you.total}<span style={{ color: COLORS.faded, fontSize: 10.5 }}>/{total}</span></span>
        </div>
      ) : null}
      {!board.youRegistered ? (
        <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: COLORS.faded }}>Join the leaderboard below to take your place as the field grows.</div>
      ) : null}
    </div>
  );
}

// ─── Personal stats + streak (localStorage), Outwit pattern ─────────────────
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
function recordLiveStat(num, sc, total) {
  const s = getStats();
  const prev = s.rec[num] || {};
  const rec = { ...s.rec, [num]: { s: sc, t: total, g: prev.g != null ? prev.g : 0, won: sc >= winBar(total) } };
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}
function deriveStats(s, todayNum) {
  const rec = s && s.rec ? s.rec : {};
  const nums = Object.keys(rec).map(Number).sort((a, b) => a - b);
  const played = nums.length;
  const sharp = nums.filter((n) => rec[n].won).length;
  let max = 0, run = 0, prev = null;
  for (const n of nums) {
    run = prev != null && n === prev + 1 ? run + 1 : 1;
    if (run > max) max = run;
    prev = n;
  }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum - 1;
  while (rec[at]) { cur++; at--; }
  return { played, sharp, cur, max };
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
    const t = p.items.length * 2;
    const sc = Math.max(0, Math.min(t, Math.round(((m.scorePct || 0) / 100) * t)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t, g: null, won: sc >= winBar(t) };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState() {
  return {
    v: 1,
    fav: null,                  // your favorite (item index) — your VOTE
    order: [],                  // your predicted crowd order (item indices, best first)
    status: 'playing',          // playing | done
    result: null,               // /api/outrank response
    t0: null,
    tEnd: null,
  };
}

export default function OutrankClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const ITEMS = PUZZLE.items;
  const K = ITEMS.length;
  const TOTAL = K * 2;
  const STORE_KEY = `sot_outrank_${PUZZLE.num}`;

  const [g, setG] = useState(freshState);
  const [sending, setSending] = useState(false);
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
  const result = g.result;
  const score = result ? result.points : 0;
  const sharp = g.status === 'done' && score >= winBar(TOTAL); // "outranked the crowd" day
  const placedAll = g.fav != null && g.order.length === K;

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
        if (saved && saved.v === 1 && Array.isArray(saved.order)) {
          setG({ ...freshState(), ...saved });
        }
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
        localStorage.setItem('sot_outrank_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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
    // Cross-device hydrate: if THIS ACCOUNT already locked in today (possibly on
    // another device), pull the graded result so we show the finished board
    // instead of the play screen. A local finish on this device always wins.
    try {
      const hyAnon = getAnonId();
      let hyMail = '';
      try { const idj = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); if (idj && idj.email) hyMail = idj.email; } catch (e) {}
      const hyQs = `quizId=${encodeURIComponent(PUZZLE.quizId)}&anonId=${encodeURIComponent(hyAnon || '')}${hyMail ? `&email=${encodeURIComponent(hyMail)}` : ''}`;
      fetch(`/api/outrank?${hyQs}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d || !d.played || !Array.isArray(d.answers) || d.answers.length < 2) return;
          const ans = d.answers.map(Number);
          setG((cur) => (cur.status === 'done' ? cur : { ...cur, status: 'done', fav: ans[0], order: ans.slice(1), result: d, tEnd: cur.tEnd || Date.now() }));
          try { setStats(recordLiveStat(PUZZLE.num, d.points, TOTAL)); } catch (e) {}
        })
        .catch(() => {});
    } catch (e) {}
    if (!viewedRef.current) {
      viewedRef.current = true;
      fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ADAPTIVE: a finished run is never frozen. While the result is on screen we
  // re-ask the server for the current score + live standings, so as new votes
  // land the order and the board move under you. This path never inserts (the
  // browser already has its row) — it only re-scores against the live field.
  async function refreshLive() {
    if (g.status !== 'done') return;
    try {
      if (g.fav == null || g.order.length !== K) return;
      const answers = [g.fav, ...g.order];
      const r = await fetch('/api/outrank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, answers, anonId: getAnonId(), email: identity?.email || undefined }),
      });
      const d = await r.json();
      if (d && !d.error && Array.isArray(d.reveal)) {
        setG((cur) => (cur.status === 'done' ? { ...cur, result: d } : cur));
        try { setStats(recordLiveStat(PUZZLE.num, d.points, TOTAL)); } catch (e) {}
      }
    } catch (e) {}
  }
  useEffect(() => {
    if (!hydrated || g.status !== 'done') return;
    let alive = true;
    const run = () => { if (alive && (typeof document === 'undefined' || document.visibilityState !== 'hidden')) refreshLive(); };
    run();
    const iv = setInterval(run, 25000);
    const onVis = () => { if (document.visibilityState === 'visible') run(); };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
    return () => { alive = false; clearInterval(iv); if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, g.status, PUZZLE.quizId, identity?.email]);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_outrank_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    // A play counts only once the player actually acts (casts a vote or places any
    // item in the order). Merely opening the puzzle and dismissing the start gate
    // does not log a 0-score attempt.
    const acted = g.fav != null || g.order.length > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc, exact) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: 0, won: sc >= winBar(TOTAL) })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = 0 for everyone (there are no wrong answers to count), so
        // the daily board's tiebreak falls through to fastest time.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: exact, guessesUsed: 0, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
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

  function pickFav(i) {
    if (!playing) return;
    setG((cur) => {
      const g2 = { ...cur, fav: cur.fav === i ? null : i };
      if (!g2.t0) g2.t0 = Date.now();
      return g2;
    });
  }
  function tapOrder(i) {
    if (!playing) return;
    setG((cur) => {
      const at = cur.order.indexOf(i);
      const order = at >= 0 ? cur.order.filter((x) => x !== i) : (cur.order.length < K ? [...cur.order, i] : cur.order);
      const g2 = { ...cur, order };
      if (!g2.t0) g2.t0 = Date.now();
      return g2;
    });
  }
  function resetOrder() {
    if (!playing) return;
    setG((cur) => ({ ...cur, order: [] }));
  }

  async function faceTheCrowd() {
    if (!playing || sending) return;
    if (g.fav == null) { say('Cast your vote first — tap your favorite.'); return; }
    if (g.order.length < K) { say(`Place all ${K} in order — ${K - g.order.length} to go.`); return; }
    setSending(true);
    try {
      const answers = [g.fav, ...g.order];
      const r = await fetch('/api/outrank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, answers, anonId: getAnonId(), email: identity?.email || undefined }),
      });
      const d = await r.json();
      if (!d || d.error || !Array.isArray(d.reveal)) {
        say('Couldn’t reach the crowd — try again in a moment.');
        setSending(false);
        return;
      }
      const g2 = { ...g, status: 'done', result: d, tEnd: Date.now() };
      if (!g2.t0) g2.t0 = Date.now();
      const exact = (d.slotPts || []).filter((p) => p === 2).length;
      postResult(g2, d.points, exact);
      setG(g2);
    } catch (e) {
      say('Couldn’t reach the crowd — try again in a moment.');
    }
    setSending(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setEndClosed(false);
  }

  function shareText() {
    const squares = (result ? result.slotPts || [] : []).map((p) => (p === 2 ? '\u{1F7E9}' : p === 1 ? '\u{1F7E8}' : '⬜')).join('');
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const crowdBit = result ? ` · crowd of ${fmtBig(result.poolSize)}` : '';
    return `Outrank #${PUZZLE.num} · ${score}/${TOTAL}${crowdBit}${streakBit}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return withRef(`sourceoftruths.com/outrank${isTodays ? '' : `?p=${PUZZLE.num}`}`);
  }
  function copyShare() {
    const text = playing
      ? `Outrank #${PUZZLE.num} — the daily crowd-ranking game from Source of Truths.\n${shareUrl()}`
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

  const ptsChip = (pts) => (
    <span style={{ flex: '0 0 auto', fontFamily: SANS, fontSize: 12, fontWeight: 800, borderRadius: 6, padding: '3px 9px', color: pts === 2 ? '#fff' : pts === 1 ? '#7c5a08' : COLORS.faded, background: pts === 2 ? COLORS.green : pts === 1 ? '#fdf0cd' : COLORS.paper }}>
      +{pts}
    </span>
  );

  // ---- the reveal: crowd order vs. your call ----
  function revealBoard() {
    const rows = result.reveal || [];
    const maxV = Math.max(1, ...rows.map((r) => r.votes));
    return (
      <div style={{ background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '13px 15px', maxWidth: 472, margin: '0 auto 12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 9 }}>
          <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.accent }}>The crowd&rsquo;s order</span>
          <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: COLORS.faded, marginLeft: 'auto' }}>{fmtBig(result.poolSize)} votes in</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((r, i) => {
            const off = Math.abs(r.yourRank - r.rank);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ flex: '0 0 20px', fontFamily: MONO, fontSize: 13, fontWeight: 700, color: r.rank <= 3 ? COLORS.ink : COLORS.faded, textAlign: 'right' }}>{r.rank}</span>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: r.yourFav ? 800 : 700, color: COLORS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.item}{r.yourFav ? ' ♥' : ''}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: COLORS.faded, whiteSpace: 'nowrap' }}>{r.pct}%</span>
                  </div>
                  <div style={{ height: 7, background: COLORS.paper, borderRadius: 4, overflow: 'hidden', marginTop: 3 }}>
                    <div style={{ width: `${Math.round((r.votes / maxV) * 100)}%`, height: '100%', background: r.yourFav ? COLORS.gold : '#b9c0f0', borderRadius: 4, minWidth: r.votes ? 4 : 0 }} />
                  </div>
                </div>
                <span style={{ flex: '0 0 auto', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: off === 0 ? COLORS.green : COLORS.faded, whiteSpace: 'nowrap' }}>
                  you: #{r.yourRank}
                </span>
                {ptsChip(r.pts)}
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 10, lineHeight: 1.5 }}>
          Your favorite: <b style={{ color: COLORS.ink }}>{ITEMS[result.yourFav]}</b> &mdash; you and <b style={{ color: COLORS.ink }}>{result.favPct}%</b> of the crowd.
        </div>
      </div>
    );
  }

  // Shared rules body — rendered in both the how-to-play modal and the start gate.
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 9px' }}>The answer key is <b>everyone playing today</b>. One themed slate, two moves.</p>
      <p style={{ margin: '0 0 9px' }}><b>Vote</b>: tap your honest favorite &mdash; your taste becomes part of the crowd. <b>Call it</b>: put the whole slate in the order you think today&rsquo;s crowd ranks it by favorite votes.</p>
      <p style={{ margin: 0 }}>Each item pays <b>2</b> in its exact slot, <b>1</b> one slot off, <b>0</b> otherwise. The twist: <b>nothing is final</b> &mdash; every new vote can reshuffle the crowd&rsquo;s order, so your score and rank move all day. <b>{winBar(TOTAL)} of {TOTAL}</b> means you outranked the crowd &mdash; for now.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="ork-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.ork-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .ork-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .ork-btn:hover{background:${COLORS.paper};}
          .ork-item{font-family:${SANS};font-weight:800;font-size:13.5px;border:2px solid rgba(28,30,36,0.3);background:#fff;color:${COLORS.ink};border-radius:9px;padding:9px 13px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;}
          .ork-item:hover{border-color:${COLORS.accent};}
          .ork-item-on{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;box-shadow:0 0 0 3px rgba(232,180,58,0.45);}
          .ork-slot{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;}
          .ork-face{font-family:${SANS};font-weight:800;font-size:15px;letter-spacing:0.05em;text-transform:uppercase;border:none;background:${COLORS.accent};color:#fff;border-radius:10px;padding:0 26px;height:56px;cursor:pointer;display:inline-flex;align-items:center;gap:10px;box-shadow:0 3px 0 rgba(20,22,28,0.25);}
          .ork-face:active{transform:translateY(1px);box-shadow:0 2px 0 rgba(20,22,28,0.25);}
          .ork-face:disabled{opacity:.55;cursor:default;}
          .ork-face .ork-gold{color:${COLORS.gold};}
          @media(max-width:560px){.ork-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.ork-ttl h1{font-size:21px;letter-spacing:0.02em;}.ork-ttl .ork-ttl-dt{font-size:15px;}.ork-ttl-dot{display:none;}.ork-mh-tile{width:30px !important;height:30px !important;font-size:17px !important;}}
        `}</style>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed OUTRANK tiles with No./date inline */}
        <div className="ork-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {'OUTRANK'.split('').map((ch, i) => (
              <div key={i} className="ork-mh-tile" style={{ width: 34, height: 34, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 20, background: i >= 3 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="ork-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="ork-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="ork-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Seven items</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* start tile — sits where the slate goes; the slate and its two moves
            stay sealed (not rendered) until the player presses Start, which begins the clock. */}
        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', margin: '0 auto 12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Outrank is ready'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Two moves: vote for your honest favorite, then predict how today&rsquo;s crowd ranks the whole slate. The slate stays sealed until you begin.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="ork-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide instructions' : 'Show instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* the day's slate */}
        {!preStart && (
        <div style={{ background: COLORS.accentSoft, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 12px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Users size={12} /> today&rsquo;s slate</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontWeight: 500, color: COLORS.ink }}>{PUZZLE.theme}</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, marginBottom: 12, lineHeight: 1.5 }}>{PUZZLE.flavor}</div>

          {playing ? (
            <>
              {/* step 1 — your vote */}
              <div style={{ background: '#fff', border: '1.5px solid rgba(28,30,36,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 7px' }}>1 &middot; Your vote</span>
                  {g.fav != null && <span style={{ marginLeft: 'auto', color: COLORS.green, display: 'flex' }}><svg viewBox="0 0 12 12" width="14" height="14" fill="none"><path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span>}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink, lineHeight: 1.4, marginBottom: 9 }}>
                  Tap your honest favorite. Your vote helps build the crowd&rsquo;s real order.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {ITEMS.map((it, i) => (
                    <button key={i} onClick={() => pickFav(i)} className={`ork-item${g.fav === i ? ' ork-item-on' : ''}`}>
                      {g.fav === i ? <Crown size={13} style={{ color: COLORS.gold }} /> : null}{it}
                    </button>
                  ))}
                </div>
              </div>

              {/* step 2 — call the crowd */}
              <div style={{ background: '#fff', border: '1.5px solid rgba(28,30,36,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 7px' }}>2 &middot; Call the crowd</span>
                  <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10.5, color: COLORS.faded }}>placed {g.order.length}/{K}</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink, lineHeight: 1.4, marginBottom: 9 }}>
                  Now forget your taste. Tap the items in the order TODAY&rsquo;S CROWD ranks them, favorite first.
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {ITEMS.map((it, i) => {
                    const pos = g.order.indexOf(i);
                    return (
                      <button key={i} onClick={() => tapOrder(i)} className={`ork-item${pos >= 0 ? ' ork-slot' : ''}`}>
                        {pos >= 0 ? <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.25)', borderRadius: 4, padding: '1px 6px' }}>#{pos + 1}</span> : null}{it}
                      </button>
                    );
                  })}
                </div>
                {g.order.length > 0 && (
                  <button onClick={resetOrder} style={{ marginTop: 9, fontFamily: SANS, fontSize: 11.5, fontWeight: 800, color: COLORS.faded, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}>
                    <RotateCcw size={12} /> Reset the order
                  </button>
                )}
              </div>

              <div style={{ textAlign: 'center', margin: '14px 0 8px' }}>
                <button className="ork-face" onClick={faceTheCrowd} disabled={sending || !placedAll}>
                  <Users size={17} className="ork-gold" /> {sending ? 'Facing the crowd…' : 'Face the crowd'}
                </button>
                <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: COLORS.faded, marginTop: 8 }}>
                  Exact slot pays 2, one off pays 1. The order is whatever today&rsquo;s players vote it to be.
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>
              Locked in. The crowd&rsquo;s order below keeps updating as votes arrive.
            </div>
          )}
        </div>
        )}

        {/* result */}
        {!playing && result && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: sharp ? COLORS.green : COLORS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {sharp ? 'You outranked the crowd.' : score >= TOTAL / 2 ? 'You read the room respectably.' : 'The crowd surprised you today.'}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{result.board && result.board.youRegistered && result.board.you ? <>Live rank #{result.board.you.rank} of {fmtBig(result.board.registered)} &middot; </> : null}A field of {fmtBig(result.realCount != null ? result.realCount : result.poolSize)} &middot; {elapsed}</span>
                </span>
              </div>
            </div>
            {revealBoard()}
            <OutrankLiveBoard board={result.board} total={TOTAL} />
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Outrank in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new crowd forms at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/outrank?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Outrank &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/outrank" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Outrank &rarr;</a>
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
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="outrank"
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Outrank to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s crowd, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s crowd, every day.
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
        <div style={{ maxWidth: 640, margin: '20px auto 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 9 }}>Your stats</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: myStats.cur, l: 'Streak' },
              { n: myStats.played, l: 'Played' },
              { n: myStats.played ? `${Math.round((myStats.sharp / myStats.played) * 100)}%` : '—', l: 'Outranked' },
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
          <DailyCombinedLeaderboard todayKey="outrank" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && result && !endClosed && (
        <DailyEndCard
          modal
          self="outrank"
          won={sharp}
          headline={<>You scored {Math.round((score / TOTAL) * 100)}%</>}
          subline={<>{score}/{TOTAL} &middot; crowd of {fmtBig(result.realCount != null ? result.realCount : result.poolSize)} &middot; {elapsed}</>}
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
            <button className="ork-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Outrank — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Outrank</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Outrank is a free daily game from Source of Truths where the crowd itself is the answer key. Every day brings a new themed slate &mdash; breakfast classics, candy bars, karaoke closers, the seven deadly sins &mdash; and every player makes two moves: vote for their honest favorite, then predict how the entire field of players ranks the whole list. Your vote helps build the real order; your prediction is scored against it.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          There is no trivia to know &mdash; the game is pure crowd-reading. Placing an item in its exact crowd slot pays two points, one slot off pays one, and the daily maximum is a perfect call of the whole board. And the score is alive: the crowd&rsquo;s order is recomputed from every vote as it arrives, so your points and your place on the live standings keep moving all day. A pre-written house crowd seeds the small hours, then retires once ten real players are in; your own prediction is always graded on the crowd minus your own vote, so you can never tip the order you&rsquo;re scored against. On Sundays the slate grows to seven items.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new crowd forms every day at midnight Eastern. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/outwit" style={{ color: COLORS.ink, fontWeight: 800 }}>Outwit</a>, our five-prompt crowd game, <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our row-and-column logic game, and <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
