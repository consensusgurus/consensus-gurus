'use client';

// Venn — the daily three-circle sorting puzzle.
//
// Three labelled circles, twelve words, and every one of the seven regions is
// used. What stops it being a quiz is the counts: each region prints how many
// words belong in it, so a misfiled word always shows up as an arithmetic
// problem before it shows up as a wrong answer, and the board refuses to be
// submitted until your arrangement matches every printed count.
//
// The client never receives the answer. Rule specs ship as data and the browser
// recomputes each word's true region, the same way the generator proved the
// board sound (scripts/verify-venn.mjs).
//
// Scoring: 12 points, 3 off for each rejected sheet, floor of 1. Sundays run
// fifteen words and withhold two of the seven counts, so part of the check has
// to be reconstructed before it can be used.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Circle, Eraser } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import DailyMasthead from '../DailyMasthead';

const COLORS = {
  cream: '#f7f8fa', paper: '#eceef1', ink: '#1c1e24', ember: '#0e1d40', rust: '#c0392b', faded: '#262b35',
  accent: '#b45309', accentSoft: '#fef3c7', accentDeep: '#92400e', green: '#15803d', greenSoft: '#dcfce7',
  cA: '#2563eb', cB: '#be185d', cC: '#0f766e',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_venn_help_seen';
const STATS_KEY = 'sot_venn_stats';
const TOTAL = 12;

const VOW = new Set(['A','E','I','O','U']);
const nv = (w) => [...w].filter((c) => VOW.has(c)).length;
const HIDDEN = {
  animal: ['CAT','DOG','COW','OWL','BAT','APE','RAT','PIG','HEN','FOX','ANT','BEE','ELK','EWE','SOW','RAM'],
  body: ['EAR','RIB','HIP','ARM','LIP','GUM','JAW','TOE','EYE','SHIN','HEEL','CHIN','LUNG','SKIN','NECK','BONE'],
  number: ['ONE','TWO','SIX','TEN','NINE','FOUR','FIVE'],
};
const HIDDEN_NAME = { animal: 'an animal', body: 'a body part', number: 'a number' };
const NUMWORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
function ruleFn(r) {
  switch (r.k) {
    case 'alpha': return (w) => [...w].every((c,i) => i === 0 || c >= w[i-1]);
    case 'norepeat': return (w) => new Set(w).size === w.length;
    case 'dbl': return (w) => /(.)\1/.test(w);
    case 'len': return (w) => w.length === r.n;
    case 'lenGte': return (w) => w.length >= r.n;
    case 'vowels': return (w) => nv(w) === r.n;
    case 'onevowel': return (w) => new Set([...w].filter((c) => VOW.has(c))).size === 1;
    case 'sameends': return (w) => w[0] === w[w.length-1];
    case 'startvowel': return (w) => VOW.has(w[0]);
    case 'endvowel': return (w) => VOW.has(w[w.length-1]);
    case 'altvc': return (w) => [...w].every((c,i) => i === 0 || VOW.has(c) !== VOW.has(w[i-1]));
    case 'twinvowel': return (w) => [...w].some((c,i) => i > 0 && VOW.has(c) && VOW.has(w[i-1]));
    case 'nolet': return (w) => !w.includes(r.c);
    case 'hides': return (w) => HIDDEN[r.set].some((h) => w.includes(h));
    default: return () => false;
  }
}
function ruleLabel(r) {
  switch (r.k) {
    case 'alpha': return 'letters never go backwards';
    case 'norepeat': return 'no repeated letter';
    case 'dbl': return 'has a double letter';
    case 'len': return `exactly ${NUMWORD[r.n]} letters`;
    case 'lenGte': return `${NUMWORD[r.n]} letters or more`;
    case 'vowels': return `exactly ${NUMWORD[r.n]} vowels`;
    case 'onevowel': return 'only one distinct vowel';
    case 'sameends': return 'starts and ends alike';
    case 'startvowel': return 'starts with a vowel';
    case 'endvowel': return 'ends with a vowel';
    case 'altvc': return 'vowels and consonants alternate';
    case 'twinvowel': return 'two vowels side by side';
    case 'nolet': return `no letter ${r.c}`;
    case 'hides': return `hides ${HIDDEN_NAME[r.set]}`;
    default: return 'unknown';
  }
}

// region bits: 1 = in the first circle, 2 = the second, 4 = the third
const REGIONS = [1, 2, 4, 3, 5, 6, 7];
// where each region's tray sits on the diagram, and what to call it
const ZONE = {
  1: { x: 60,  y: 96,  label: 'A only' },
  2: { x: 260, y: 96,  label: 'B only' },
  4: { x: 160, y: 246, label: 'C only' },
  3: { x: 160, y: 74,  label: 'A + B' },
  5: { x: 96,  y: 186, label: 'A + C' },
  6: { x: 224, y: 186, label: 'B + C' },
  7: { x: 160, y: 146, label: 'all three' },
};

const isIosDevice = () => typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
function etToday() { try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); } catch (e) { return new Date().toISOString().slice(0,10); } }
function pickPuzzle(puzzles, forceNum) {
  if (forceNum) { const p = puzzles.find((x) => x.num === forceNum); if (p) return p; }
  const today = etToday();
  const open = puzzles.filter((p) => p.live <= today);
  return open.length ? open[open.length-1] : puzzles[0];
}
function fmtTime(ms) { const s = Math.max(0, Math.round(ms/1000)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function msToMidnightET() {
  try { const now = new Date(); const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })); const next = new Date(et); next.setHours(24,0,0,0); return next - et; }
  catch (e) { const now = new Date(); const next = new Date(now); next.setHours(24,0,0,0); return next - now; }
}
function fmtCountdown(ms) { const s = Math.max(0, Math.floor(ms/1000)); return `${Math.floor(s/3600)}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function getAnonId() {
  if (typeof window === 'undefined') return null;
  try { let a = localStorage.getItem('sot_quiz_anon');
    if (!a) { a = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`; localStorage.setItem('sot_quiz_anon', a); }
    return a; } catch (e) { return null; }
}
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

function getStats() { try { const s = JSON.parse(localStorage.getItem(STATS_KEY)); if (s && s.v === 1 && s.rec) return s; } catch (e) {} return { v: 1, rec: {} }; }
function recordStat(num, entry) { const s = getStats(); if (s.rec[num]) return s; const s2 = { ...s, rec: { ...s.rec, [num]: entry } }; try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {} return s2; }
function deriveStats(s, todayNum) {
  const rec = s && s.rec ? s.rec : {};
  const nums = Object.keys(rec).map(Number).sort((a,b) => a-b);
  let max = 0, run = 0, prev = null;
  for (const n of nums) { run = prev != null && n === prev+1 ? run+1 : 1; if (run > max) max = run; prev = n; }
  let cur = 0, at = rec[todayNum] ? todayNum : todayNum-1;
  while (rec[at]) { cur++; at--; }
  return { played: nums.length, perfect: nums.filter((n) => rec[n].won).length, cur, max };
}
function mergeServerStats(s, recent, puzzles) {
  if (!s || !Array.isArray(recent) || !recent.length) return s;
  const byQuiz = {}; for (const p of puzzles) byQuiz[p.quizId] = p;
  let rec = s.rec, changed = false;
  for (const m of recent) {
    const p = m && byQuiz[m.quizId];
    if (!p || m.attempt !== 1 || rec[p.num]) continue;
    const sc = Math.max(0, Math.min(TOTAL, Math.round(((m.scorePct || 0)/100) * TOTAL)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: TOTAL, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState(n) {
  return { v: 1, place: Array(n).fill(0), rejected: 0, status: 'playing', t0: null, tEnd: null };
}

export default function VennClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_venn_${PUZZLE.num}`;
  const N = PUZZLE.items.length;

  // the truth, recomputed rather than shipped
  const TRUTH = useMemo(() => {
    const fns = PUZZLE.rules.map(ruleFn);
    return PUZZLE.items.map((w) => (fns[0](w) ? 1 : 0) | (fns[1](w) ? 2 : 0) | (fns[2](w) ? 4 : 0));
  }, [PUZZLE]);
  const COUNTS = useMemo(() => {
    const c = {}; REGIONS.forEach((r) => { c[r] = 0; });
    TRUTH.forEach((r) => { c[r]++; });
    return c;
  }, [TRUTH]);
  const hiddenSet = useMemo(() => new Set(PUZZLE.hiddenCounts || []), [PUZZLE]);

  const [g, setG] = useState(() => freshState(N));
  const [held, setHeld] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
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
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const placedCount = g.place.filter(Boolean).length;
  const liveScore = Math.max(1, TOTAL - 3 * g.rejected);
  const score = g.status === 'done' ? liveScore : 0;
  const won = g.status === 'done' && g.rejected === 0;

  const mine = useMemo(() => { const c = {}; REGIONS.forEach((r) => { c[r] = 0; }); g.place.forEach((r) => { if (r) c[r]++; }); return c; }, [g.place]);
  const countsMatch = REGIONS.every((r) => hiddenSet.has(r) || mine[r] === COUNTS[r]);
  const canSubmit = placedCount === N && countsMatch;

  useEffect(() => {
    try { setStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true); setMobileUi(isMobileDevice()); } catch {}
    const onBip = (e) => { e.preventDefault(); setInstallEvt(e); };
    const onInstalled = () => { setStandalone(true); setInstallEvt(null); };
    window.addEventListener('beforeinstallprompt', onBip); window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onBip); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  const a2hsClick = () => { const e = installEvt; if (e) { setInstallEvt(null); e.prompt(); } else { setShowA2hsHelp(true); } };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) { const saved = JSON.parse(raw); if (saved && saved.v === 1 && Array.isArray(saved.place) && saved.place.length === N) setG({ ...freshState(N), ...saved }); }
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
        (function () { var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_venn_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_venn_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  useEffect(() => {
    if (g.status === 'playing') return;
    const tick = () => setCountdown(fmtCountdown(msToMidnightET()));
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [g.status]);

  useEffect(() => {
    try { const id = JSON.parse(localStorage.getItem('sot_quiz_identity')); if (id && id.email) setIdentity(id); } catch (e) {}
    try {
      const anon = getAnonId(); let em = '';
      try { const idj = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null'); if (idj && idj.email) em = `&email=${encodeURIComponent(idj.email)}`; } catch (e) {}
      if (anon || em) {
        fetch(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}`).then((r) => r.json()).then((d) => {
          if (d && Array.isArray(d.recent)) setStats((cur) => mergeServerStats(cur || getStats(), d.recent, puzzles));
          if (d && d.found && d.name) setPlayer({ name: d.name, rank: (d.ranks && d.ranks.xp) || d.rank || null, key: d.userKey || null });
        }).catch(() => {});
      }
    } catch (e) {}
    fetch(`/api/quiz/board?quizId=${encodeURIComponent(PUZZLE.quizId)}`).then((r) => r.json()).then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); }).catch(() => {});
    if (!viewedRef.current) { viewedRef.current = true; fetch('/api/quiz/view', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: PUZZLE.quizId }) }).catch(() => {}); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function say(msg) { setToast(msg); if (toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2400); }

  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_venn_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const acted = placedCount > 0 || g.rejected > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now()))/1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: g.rejected, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0)/1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.rejected, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.rejected, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      }).then((r) => r.json()).then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); }).catch(() => {});
    } catch (e) {}
  }

  function startRun() { setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() })); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }

  function dropInto(region) {
    if (!playing || held == null) return;
    setG((cur) => { const place = cur.place.slice(); place[held] = region; return { ...cur, place, t0: cur.t0 || Date.now() }; });
    setHeld(null); setVerdict(null);
  }
  function liftFrom(i) {
    if (!playing) return;
    if (held === i) { setHeld(null); return; }
    if (g.place[i]) { setG((cur) => { const place = cur.place.slice(); place[i] = 0; return { ...cur, place }; }); setHeld(i); }
    else setHeld(i);
    setVerdict(null);
  }
  function clearAll() { if (!playing) return; setG((cur) => ({ ...cur, place: Array(N).fill(0) })); setHeld(null); }

  function submit() {
    if (!playing || !canSubmit) return;
    const wrong = g.place.map((r, i) => (r === TRUTH[i] ? null : i)).filter((x) => x != null);
    if (!wrong.length) {
      const g2 = { ...g, status: 'done', tEnd: Date.now(), t0: g.t0 || Date.now() };
      setG(g2); setVerdict(null); setEndClosed(false);
      postResult(g2, Math.max(1, TOTAL - 3 * g2.rejected));
    } else {
      setG((cur) => { const place = cur.place.slice(); wrong.forEach((i) => { place[i] = 0; }); return { ...cur, place, rejected: cur.rejected + 1 }; });
      setVerdict({ msg: `${wrong.length} word${wrong.length === 1 ? ' is' : 's are'} in the wrong region. They are back in the tray. (−3)` });
    }
  }
  function reveal() {
    if (!playing) return;
    setG((cur) => { const g2 = { ...cur, place: TRUTH.slice(), status: 'lost', tEnd: Date.now(), t0: cur.t0 || Date.now() }; postResult(g2, 0); return g2; });
    setHeld(null); setVerdict(null); setEndClosed(false);
  }
  function resetGame() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} setG(freshState(N)); setHeld(null); setVerdict(null); setEndClosed(false); }

  const circleColor = [COLORS.cA, COLORS.cB, COLORS.cC];
  const rulesBody = (
    <div style={{ fontSize: 14, lineHeight: 1.5, color: COLORS.ink, fontWeight: 600 }}>
      <p style={{ margin: '0 0 10px', fontSize: 15.5, fontWeight: 800 }}>File every word where it belongs.</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {PUZZLE.rules.map((r, i) => (
          <span key={i} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, borderRadius: 7, padding: '6px 10px', background: '#fff', border: `2px solid ${circleColor[i]}`, color: circleColor[i] }}>
            {String.fromCharCode(65 + i)}: {ruleLabel(r)}
          </span>
        ))}
      </div>
      <ol style={{ margin: '0 0 12px', paddingLeft: 19 }}>
        <li style={{ marginBottom: 5 }}>Tap a word, then tap the region it belongs in. Tap a filed word to pull it back.</li>
        <li style={{ marginBottom: 5 }}>Words can satisfy two circles, or all three. Every region here holds at least one.</li>
        <li style={{ marginBottom: 5 }}>Each region prints <b>how many</b> words belong in it.</li>
        <li>When your counts match, <b>File the sheet</b>.</li>
      </ol>
      <div style={{ background: '#fff', border: '1px solid rgba(28,30,36,0.12)', borderLeft: `3px solid ${COLORS.accent}`, borderRadius: 7, padding: '9px 11px', fontSize: 13, lineHeight: 1.45 }}>
        <b>The knack:</b> the counts are the proof. If a region wants two words and you can only find one for it, something you have already filed elsewhere belongs there, so go back and find it rather than guessing.
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12.5, fontWeight: 600, color: COLORS.faded }}>
        12 points, 3 off for each sheet that comes back wrong. Vowels are A, E, I, O, U, never Y.{PUZZLE.sunday ? ' Sunday withholds two of the counts.' : ''}
      </p>
    </div>
  );

  const trayItems = PUZZLE.items.map((w, i) => ({ w, i })).filter(({ i }) => !g.place[i]);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="vn-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.vn-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .vn-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .vn-btn:hover{background:${COLORS.paper};}
          .vn-chip{font-family:${SANS};font-weight:800;font-size:12.5px;letter-spacing:0.03em;border-radius:7px;padding:7px 10px;cursor:pointer;border:1.5px solid rgba(28,30,36,0.2);background:#fff;color:${COLORS.ink};}
          .vn-chip:hover{border-color:${COLORS.accent};}
          .vn-chip.held{background:${COLORS.accentSoft};border-color:${COLORS.accent};color:${COLORS.accentDeep};}
          .vn-zone{position:absolute;transform:translate(-50%,-50%);width:74px;min-height:34px;border-radius:8px;border:1.5px dashed rgba(28,30,36,0.3);background:rgba(255,255,255,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:3px 2px;cursor:pointer;}
          .vn-zone.ready{border-style:solid;border-color:${COLORS.green};background:${COLORS.greenSoft};}
          .vn-zone.over{border-color:${COLORS.rust};}
          .vn-zone .n{font-family:${MONO};font-size:9px;font-weight:500;color:${COLORS.faded};}
          .vn-zone .w{font-family:${SANS};font-size:8.5px;font-weight:800;letter-spacing:0.02em;color:${COLORS.ink};line-height:1.25;}
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="venn"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={4}
          helpTop={8}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Two Counts Missing</span>}
          blocks={'VENN'.split('').map((ch, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 23, background: i === 0 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px 22px', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'The sheet is face down'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>{N} words, three overlapping circles, and every one of the seven regions is used. The counts tell you the shape of the answer.</p>
              </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: 18 }}>
              <button className="vn-btn" onClick={startRun} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Turn the sheet over</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>{gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}</button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
          <>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
              <span>filed <b style={{ color: COLORS.ink, fontWeight: 500 }}>{placedCount}</b> of {N}</span>
              <span>counts <b style={{ color: countsMatch ? COLORS.green : COLORS.ink, fontWeight: 500 }}>{countsMatch ? 'match' : 'off'}</b></span>
              <span>on the board <b style={{ color: g.rejected ? COLORS.rust : COLORS.green, fontWeight: 500 }}>{liveScore}</b>/{TOTAL}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {PUZZLE.rules.map((r, i) => (
                <span key={i} style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800, borderRadius: 7, padding: '6px 10px', background: '#fff', border: `2px solid ${circleColor[i]}`, color: circleColor[i] }}>
                  {String.fromCharCode(65 + i)}: {ruleLabel(r)}
                </span>
              ))}
            </div>

            <div style={{ position: 'relative', width: 320, height: 300, margin: '0 auto 12px' }}>
              <svg viewBox="0 0 320 300" width="320" height="300" style={{ position: 'absolute', inset: 0 }}>
                <circle cx="112" cy="118" r="92" fill={COLORS.cA} fillOpacity="0.08" stroke={COLORS.cA} strokeWidth="2" />
                <circle cx="208" cy="118" r="92" fill={COLORS.cB} fillOpacity="0.08" stroke={COLORS.cB} strokeWidth="2" />
                <circle cx="160" cy="196" r="92" fill={COLORS.cC} fillOpacity="0.08" stroke={COLORS.cC} strokeWidth="2" />
                <text x="40" y="44" fill={COLORS.cA} fontSize="15" fontWeight="800" fontFamily="Manrope">A</text>
                <text x="272" y="44" fill={COLORS.cB} fontSize="15" fontWeight="800" fontFamily="Manrope">B</text>
                <text x="160" y="290" fill={COLORS.cC} fontSize="15" fontWeight="800" fontFamily="Manrope">C</text>
              </svg>
              {REGIONS.map((r) => {
                const words = PUZZLE.items.map((w, i) => ({ w, i })).filter(({ i }) => g.place[i] === r);
                const need = hiddenSet.has(r) && playing ? '?' : COUNTS[r];
                const ready = !hiddenSet.has(r) && words.length === COUNTS[r];
                const over = !hiddenSet.has(r) && words.length > COUNTS[r];
                return (
                  <div key={r} className={`vn-zone${ready ? ' ready' : ''}${over ? ' over' : ''}`} style={{ left: ZONE[r].x, top: ZONE[r].y }} onClick={() => dropInto(r)} title={ZONE[r].label}>
                    <span className="n">{words.length}/{need}</span>
                    {words.map(({ w, i }) => (
                      <span key={w} className="w" onClick={(e) => { if (held != null) { dropInto(r); e.stopPropagation(); return; } e.stopPropagation(); liftFrom(i); }} style={{ color: !playing ? (TRUTH[i] === g.place[i] ? COLORS.green : COLORS.rust) : COLORS.ink }}>{w}</span>
                    ))}
                  </div>
                );
              })}
            </div>

            {playing && (
              <>
                <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 7 }}>{held == null ? 'The tray' : 'Now tap a region'}</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', minHeight: 34, marginBottom: 10 }}>
                  {trayItems.map(({ w, i }) => (
                    <button key={w} type="button" className={`vn-chip${held === i ? ' held' : ''}`} onClick={() => liftFrom(i)}>{w}</button>
                  ))}
                  {!trayItems.length && <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>Tray empty. Check your counts, then file the sheet.</span>}
                </div>
              </>
            )}
          </>
        )}

        {verdict && <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.rust, margin: '4px 0 8px', lineHeight: 1.45 }}>{verdict.msg}</div>}

        {started && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '6px 0' }}>
            <button type="button" className="vn-btn" onClick={submit} disabled={!canSubmit} style={canSubmit ? { background: COLORS.accent, borderColor: COLORS.accent, color: '#fff' } : { opacity: 0.45, cursor: 'not-allowed' }}>
              <Circle size={14} /> File the sheet
            </button>
            {placedCount > 0 && <button type="button" className="vn-btn" onClick={clearAll}><Eraser size={14} /> Clear</button>}
            {g.rejected >= 2 && <button type="button" className="vn-btn" style={{ borderColor: '#c3c8cf', color: COLORS.faded }} onClick={reveal}>Reveal (ends the day)</button>}
          </div>
        )}

        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '10px 0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : g.status === 'done' ? COLORS.ink : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {g.status === 'done' ? (won ? <>Filed clean on the first sheet.</> : <>Filed after {g.rejected} rejected sheet{g.rejected === 1 ? '' : 's'}.</>) : <>The sheet beat you. The correct filing is shown above.</>}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>{countdown ? <>A new sheet lands in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new sheet lands at midnight Eastern.'}
                  {prevPuzzle && <>{' '}Meanwhile: <a href={`/venn?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>yesterday&rsquo;s sheet &rarr;</a></>}</>
              ) : (
                <>You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026','')} archive. <a href="/venn" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s sheet &rarr;</a>{' · '}<a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a></>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show leaderboard &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other puzzles, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0', maxWidth: 640 }}>
          <DailyGamesGrid replay={!playing ? resetGame : null} self="venn" maxWidth={640} challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`} share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }} light boardSlot={<DailyBoardPanel self="venn" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />} divider />
          {mobileUi && !standalone && (
            <button onClick={a2hsClick} style={{ marginTop: 10, width: '100%', fontFamily: SANS, fontSize: 13.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800, height: 54, borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <Smartphone size={15} strokeWidth={2.5} /> Add to Home Screen
            </button>
          )}
        </div>
        {showA2hsHelp && (
          <div onClick={() => setShowA2hsHelp(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, maxWidth: 430, width: '100%', padding: '22px 22px 16px', fontFamily: SANS, border: '1.5px solid rgba(20,22,28,0.12)' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Venn to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li><li>Scroll down and tap <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sheet, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s sheet, every day.</p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: '#fff', cursor: 'pointer' }}>Got it</button>
            </div>
          </div>
        )}
        {!focusMode && !identity && (
          <div id="daily-join" style={{ margin: '18px auto 0', maxWidth: 640 }}>
            <JoinLeaderboardForm hideIcon heading="See your stats and join the leaderboard" identity={identity} onJoined={(id) => { setIdentity(id); if (id && id.username) setPlayer((p) => p || { name: id.username, rank: null }); }} />
          </div>
        )}
        </div>
      </div>

      {!playing && !endClosed && (
        <DailyEndCard modal self="venn" won={won}
          headline={g.status === 'done' ? <>Every word filed</> : <>The sheet came back</>}
          subline={<>Venn #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.rejected} rejected sheet{g.rejected === 1 ? '' : 's'} &middot; {elapsed}</>}
          onShare={copyShare} shareLabel={copied ? 'Copied' : 'Share Result'} onReplay={resetGame} onClose={() => setEndClosed(true)} />
      )}
      <DuelBanner token={duelToken} info={duelInfo} submitted={duelSubmitted} />
      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>{toast}</div>
      )}
      {showHelp && (
        <div onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ position: 'fixed', inset: 0, background: 'rgba(20,22,28,0.55)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: COLORS.cream, borderRadius: 12, border: `2px solid ${COLORS.ink}`, padding: '20px 22px', fontFamily: SANS, maxHeight: '86vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: COLORS.ink }}>How to play</div>
              <button onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} aria-label="Close" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded }}><X size={20} /></button>
            </div>
            {rulesBody}
            <button className="vn-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Venn</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Venn is a free daily logic puzzle from Source of Truths. Three overlapping circles, each one a plain property of a word, and a tray of words that between them fill every region of the diagram, including the sliver in the middle where all three are true at once.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The counts are what turn sorting into deduction. Each region tells you how many words belong in it, so a word in the wrong place is never just a wrong answer, it is a number that refuses to add up. Work the shortfalls and the board corrects itself.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new sheet lands every day at midnight Eastern, and Sundays withhold two of the counts. More dailies: <a href="/axiom" style={{ color: COLORS.ink, fontWeight: 800 }}>Axiom</a>, our hidden-rule puzzle, <a href="/bracket" style={{ color: COLORS.ink, fontWeight: 800 }}>Bracket</a>, our results-table reconstruction, and <a href="/links" style={{ color: COLORS.ink, fontWeight: 800 }}>Links</a>, our four hidden threads.
        </p>
      </section>
      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const streakBit = isTodays && myStats.cur >= 2 && g.status !== 'playing' ? ` · streak ${myStats.cur}` : '';
    const solvedBit = g.status === 'done'
      ? (won ? `\u{25CE} Filed clean in ${elapsed}` : `\u{25CE} Filed in ${elapsed} · ${g.rejected} rejected sheet${g.rejected === 1 ? '' : 's'}`)
      : g.status === 'lost' ? '\u{25CE} The sheet won' : '\u{25CE} Still filing…';
    const text = playing
      ? `Venn #${PUZZLE.num} — the daily three-circle sorting puzzle from Source of Truths.\n${withRef(`sourceoftruths.com/venn${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`
      : `Venn — Sheet #${PUZZLE.num}\n${solvedBit}${streakBit}\n${withRef(`sourceoftruths.com/venn${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`;
    if (notifyShareCredit(text)) return;
    try { if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) { navigator.share({ text }).catch(() => {}); return; } } catch (e) {}
    try { navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); } catch (e) {}
  }
}
