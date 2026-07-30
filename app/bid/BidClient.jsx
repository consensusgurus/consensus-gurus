'use client';

// Bid — the daily sealed-bid auction.
//
// Five lots, a purse of a hundred credits, and one sealed allocation. You take a
// lot if your bid on it beats the median bid of everybody else who played today,
// so the price of a lot is whatever the crowd decides it is that morning.
//
// There is no correct answer and no solver. Your score is the total value of the
// lots you take, out of a hundred, mapped to a ten by the server, and it is a
// pure function of the whole pool as it stands right now. Every new bidder moves
// the medians, which moves everybody, which is why the reveal re-polls itself
// while you are looking at it.
//
// The median you are measured against on each lot leaves your own bid out, so
// your money can never be the thing that outbids you. Until ten real players
// have bid, a pre-written opening crowd sits in the pool to give the medians
// something to stand on; after that it retires pool-wide and the field is human.
//
// Same daily plumbing as Park/Four/Mate: banked sales gated by Eastern date on
// the server (app/bid/page.js), per-puzzle localStorage saves, /bid?p=N archive
// pinning, streaks + stats, and the shared /api/quiz/* board flow. The scoring
// itself lives in /api/bid and lib/bid-score.js.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { X, Smartphone, RotateCcw } from 'lucide-react';
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

const COLORS = {
  cream: '#f7f8fa', paper: '#eceef1', ink: '#1c1e24', ember: '#0e1d40',
  rust: '#c0392b', faded: '#262b35',
  accent: '#7c2d12',        // Bid identity — auction-house oxblood
  accentSoft: '#f7ece4', green: '#15803d',
};

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_bid_help_seen';
const STATS_KEY = 'sot_bid_stats';
const POLL_MS = 20000;

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

const freshState = () => ({ v: 1, bids: [0, 0, 0, 0, 0], submitted: false, result: null, status: 'playing', t0: null, tEnd: null });
const sum = (xs) => xs.reduce((a, b) => a + (Number(b) || 0), 0);
// The end card only knows won or not, and Bid has neither. Eight out of ten is
// the line: it means you took at least four fifths of the room's value.
const isGood = (score) => Number(score) >= 8;

export default function BidClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_bid_${PUZZLE.num}`;
  const LOTS = PUZZLE.lots;
  const BUDGET = PUZZLE.budget;

  const [g, setG] = useState(() => freshState());
  const gRef = useRef(g);
  const [showHelp, setShowHelp] = useState(false);
  const [gateRules, setGateRules] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);
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
  const identityRef = useRef(null);

  const playing = g.status === 'playing';
  const preStart = playing && !g.t0;
  const started = playing && !!g.t0;
  const focusMode = playing && !showChrome;
  const done = g.status === 'done';
  const result = g.result;
  const finalScore = result ? result.score : 0;
  const won = done && isGood(finalScore);

  const spent = sum(g.bids);
  const remaining = BUDGET - spent;
  const totalValue = LOTS.reduce((s, l) => s + l.value, 0);

  useEffect(() => { gRef.current = g; }, [g]);
  useEffect(() => { identityRef.current = identity; }, [identity]);
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
        if (saved && saved.v === 1 && Array.isArray(saved.bids) && saved.bids.length === LOTS.length) {
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
        const fin = g.status !== 'playing';
        if (fin || g.t0) localStorage.setItem('sot_bid_day', JSON.stringify({ d: etToday(), done: fin }));
        else localStorage.removeItem('sot_bid_day');
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

  const REC_KEY = `sot_bid_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const cur = gRef.current;
    if (!sum(cur.bids) || cur.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (cur.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: 10, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, score) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: score, t: 10, g: 0, won: isGood(score) })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: isGood(score) ? 1 : 0, guessesUsed: 0, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
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

  function setBid(i, raw, quiet) {
    const cur = gRef.current;
    if (cur.status !== 'playing') return;
    let v = Math.trunc(Number(raw));
    if (!Number.isFinite(v) || v < 0) v = 0;
    const others = cur.bids.reduce((s, b, j) => (j === i ? s : s + b), 0);
    const cap = Math.max(0, BUDGET - others);
    const overspent = v > cap;
    if (overspent) v = cap;
    if (v === cur.bids[i]) {
      if (overspent && !quiet) say(`The purse only has ${cap} left for that lot.`);
      return;
    }
    const next = cur.bids.slice();
    next[i] = v;
    const g2 = { ...cur, bids: next };
    if (!g2.t0) g2.t0 = Date.now();
    commit(g2);
    if (overspent && !quiet) say(`Trimmed to ${cap}. The purse is ${BUDGET} credits, no more.`);
  }

  function clearBids() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || !sum(cur.bids)) return;
    commit({ ...cur, bids: LOTS.map(() => 0) });
    say('Purse back to full. Spread it again.');
  }

  function bidBody(cur) {
    return JSON.stringify({
      quizId: PUZZLE.quizId,
      bids: cur.bids,
      anonId: getAnonId(),
      email: (identityRef.current && identityRef.current.email) || undefined,
    });
  }

  function submitBids() {
    const cur = gRef.current;
    if (cur.status !== 'playing' || submitting) return;
    if (!sum(cur.bids)) { say('Put something on at least one lot first.'); return; }
    setSubmitting(true);
    setErr(null);
    fetch('/api/bid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bidBody(cur) })
      .then((r) => r.json())
      .then((d) => {
        setSubmitting(false);
        if (!d || !d.ok) { setErr((d && d.error) || 'The sale would not take that. Try again in a moment.'); return; }
        const g2 = { ...gRef.current, bids: cur.bids, submitted: true, result: d, status: 'done', tEnd: Date.now() };
        vibrate(isGood(d.score) ? HAPT.win : HAPT.ok);
        postResult(g2, d.score);
        commit(g2);
      })
      .catch(() => { setSubmitting(false); setErr('Could not reach the saleroom. Check your connection and try again.'); });
  }

  // The scoring is adaptive, so a result on screen is a live figure rather than
  // a receipt. Re-ask the server on a timer and redraw with whatever the field
  // now says. The route treats a repeat allocation as a replay, so this never
  // stuffs the pool and never re-posts to the daily leaderboard.
  function refreshResult() {
    const cur = gRef.current;
    if (cur.status !== 'done' || !cur.result) return;
    fetch('/api/bid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bidBody(cur) })
      .then((r) => r.json())
      .then((d) => {
        if (!d || !d.ok) return;
        const now = gRef.current;
        if (now.status !== 'done') return;
        commit({ ...now, result: d });
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (!hydrated) return undefined;
    if (g.status !== 'done' || !g.result) return undefined;
    refreshResult();
    const iv = setInterval(refreshResult, POLL_MS);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, g.status, !!g.result]);

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    commit(freshState());
    setEndClosed(false);
    setErr(null);
  }

  function shareUrl() { return withRef(`sourceoftruths.com/bid${isTodays ? '' : `?p=${PUZZLE.num}`}`); }
  function shareText() {
    const g5 = done ? Math.max(0, Math.min(5, Math.round(finalScore / 2))) : 0;
    const squares = '\u{1F7EB}'.repeat(g5) + '⬜'.repeat(5 - g5);
    const takenCount = result ? result.lots.filter((l) => l.won).length : 0;
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head = done
      ? `Bid #${PUZZLE.num}${PUZZLE.sunday ? ' · Sunday' : ''} · ${finalScore}/10 · ${result ? result.points : 0} of ${totalValue} in lots · ${takenCount} of ${LOTS.length} taken${streakBit}`
      : `Bid #${PUZZLE.num} · unbid`;
    return `${head}\n${squares}\n${shareUrl()}`;
  }
  function copyShare() {
    const text = playing
      ? `Bid #${PUZZLE.num} — the daily sealed-bid auction from Source of Truths. ${BUDGET} credits, five lots, and the crowd sets every price.\n${shareUrl()}`
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
      <p style={{ margin: '0 0 9px' }}>You have a purse of <b>{BUDGET} credits</b> and there are <b>{LOTS.length} lots</b> in the sale. Split the purse across them however you like. You may leave a lot at zero, and you do not have to spend it all.</p>
      <p style={{ margin: '0 0 9px' }}>You <b>take a lot</b> when your bid on it beats the <b>median bid</b> of everyone else who played today. Your own bid is left out of that median, so your money can never be the thing that outbids you.</p>
      <p style={{ margin: '0 0 9px' }}>Your score is the <b>total value of the lots you take</b>, out of {totalValue}, mapped to a mark out of ten. The lots are not worth the same, and the purse will not stretch across all of them, so the whole game is picking where to be strong and where to walk away.</p>
      <p style={{ margin: 0 }}>There is <b>no correct answer</b>. You are bid against the crowd, not against a price list, and the crowd keeps arriving all day, so your <b>score moves after you place it</b>. Bids are whole credits and freely adjustable until you place them. You get one allocation per sale.</p>
    </div>
  );

  const lotRows = LOTS.map((lot, i) => {
    const others = g.bids.reduce((s, b, j) => (j === i ? s : s + b), 0);
    const cap = Math.max(0, BUDGET - others);
    return (
      <div key={lot.name} className="bd-row">
        <div className="bd-rowhead">
          <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: COLORS.ink }}>{lot.name}</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.accent, fontWeight: 500, whiteSpace: 'nowrap' }}>{lot.value} pts</span>
        </div>
        <div className="bd-rowctl">
          <input className="bd-range" type="range" min={0} max={cap} step={1} value={g.bids[i]}
            aria-label={`Bid on ${lot.name}`}
            onChange={(e) => setBid(i, e.target.value, true)} />
          <input className="bd-num" type="number" inputMode="numeric" min={0} max={cap} step={1} value={g.bids[i]}
            aria-label={`Bid on ${lot.name} in credits`}
            onChange={(e) => setBid(i, e.target.value === '' ? 0 : e.target.value, false)} />
        </div>
      </div>
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="bd-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.bd-wrap{padding-left:10px !important;padding-right:10px !important;}}
          .bd-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .bd-btn:hover{background:${COLORS.paper};}
          .bd-tool{font-family:${SANS};font-weight:800;font-size:12.5px;border:1.5px solid rgba(28,30,36,0.35);background:#fff;color:${COLORS.ink};border-radius:8px;padding:7px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .bd-row{border-top:1px solid rgba(28,30,36,0.14);padding:11px 2px 12px;}
          .bd-row:first-child{border-top:none;}
          .bd-rowhead{display:flex;align-items:baseline;gap:10px;margin-bottom:8px;}
          .bd-rowctl{display:flex;align-items:center;gap:12px;}
          .bd-range{flex:1 1 auto;min-width:0;height:26px;accent-color:${COLORS.accent};cursor:pointer;touch-action:manipulation;}
          .bd-num{width:74px;flex:0 0 auto;font-family:${MONO};font-size:15px;font-weight:500;color:${COLORS.ink};text-align:center;border:1.5px solid rgba(28,30,36,0.3);border-radius:8px;padding:7px 6px;background:#fff;}
          .bd-num:focus{outline:2px solid ${COLORS.accent};outline-offset:1px;}
          .bd-lotline{display:flex;align-items:center;gap:10px;padding:9px 2px;border-top:1px solid rgba(28,30,36,0.12);flex-wrap:wrap;}
          .bd-lotline:first-child{border-top:none;}
          .bd-stand{display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:6px;font-family:${SANS};font-size:13px;font-weight:700;color:${COLORS.ink};}
          .bd-stand.you{background:${COLORS.accentSoft};}
        `}</style>

        <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        <DailyMasthead
          slug="bid" num={PUZZLE.num} dateLabel={PUZZLE.dateLabel} accent={COLORS.accent}
          blockGap={5} helpTop={13} marginBottom={16} onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition</span>}
          blocks={'BID'.split('').map((ch, i) => (
            <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 2 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        />

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'The sale is open'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>Today it is <b>{PUZZLE.title}</b>. Split {BUDGET} credits across {LOTS.length} lots. You take a lot by beating the crowd&rsquo;s median bid on it, and your score is the value of what you take. There is no right answer, only the field.</p>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <button className="bd-btn" onClick={startGame} style={{ background: COLORS.ink, color: '#fff', fontSize: 15, padding: '11px 22px' }}>Start</button>
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
            <span style={{ whiteSpace: 'nowrap' }}>purse <b style={{ color: COLORS.ink, fontWeight: 500 }}>{BUDGET}</b></span>
            <span style={{ whiteSpace: 'nowrap' }}>time <b style={{ color: COLORS.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</b></span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>lots <b style={{ color: COLORS.accent, fontWeight: 500 }}>{LOTS.length}</b></span>
          </div>

          <div style={{ fontFamily: SANS, fontSize: 16.5, fontWeight: 800, color: COLORS.ink, marginBottom: 2 }}>{PUZZLE.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 500, marginBottom: 12 }}>
            {done ? 'Bids in · scored against the field' : `${totalValue} points on the table`}
          </div>

          {playing && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, background: remaining === 0 ? '#fdecea' : COLORS.accentSoft, border: `1.5px solid ${remaining === 0 ? 'rgba(192,57,43,0.45)' : 'rgba(124,45,18,0.28)'}`, borderRadius: 9, padding: '10px 13px', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 500 }}>Remaining purse</span>
                <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 26, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: remaining === 0 ? COLORS.rust : COLORS.accent }}>{remaining}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, fontWeight: 500 }}>of {BUDGET}</span>
              </div>

              <div>{lotRows}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="bd-btn" onClick={submitBids} disabled={spent <= 0 || submitting}
                  style={{ background: spent > 0 && !submitting ? COLORS.ink : COLORS.paper, color: spent > 0 && !submitting ? '#fff' : COLORS.faded, borderColor: spent > 0 && !submitting ? COLORS.ink : 'rgba(28,30,36,0.25)', cursor: spent > 0 && !submitting ? 'pointer' : 'default', fontSize: 15, padding: '11px 22px' }}>
                  {submitting ? 'Placing…' : 'Place bids'}
                </button>
                <button className="bd-tool" onClick={clearBids} disabled={!spent} style={{ opacity: spent ? 1 : 0.4, cursor: spent ? 'pointer' : 'default' }}>
                  <RotateCcw size={14} /> Clear
                </button>
                <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>
                  {spent > 0 ? `${spent} committed` : 'Nothing committed yet'}
                </span>
              </div>
              {err && (
                <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.rust }}>{err}</div>
              )}
            </>
          )}

          {done && result && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, background: COLORS.accentSoft, border: '1.5px solid rgba(124,45,18,0.28)', borderRadius: 9, padding: '10px 13px', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 500 }}>You took</span>
                <span style={{ marginLeft: 'auto', fontFamily: SANS, fontSize: 26, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: COLORS.accent }}>{result.points}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, fontWeight: 500 }}>of {result.totalValue} &middot; scores {result.score}/10</span>
              </div>

              <div>
                {result.lots.map((l) => (
                  <div key={l.name} className="bd-lotline">
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 800, color: l.won ? COLORS.ink : COLORS.faded }}>{l.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, fontWeight: 500 }}>{l.value} pts</span>
                    <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11.5, fontWeight: 500, color: COLORS.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                      you {l.yourBid} <span style={{ color: COLORS.faded }}>vs {l.threshold}</span>
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: l.won ? COLORS.green : 'rgba(28,30,36,0.32)', borderRadius: 4, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                      {l.won ? 'Taken' : 'Outbid'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: COLORS.faded, lineHeight: 1.55, marginTop: 12 }}>
                <p style={{ margin: '0 0 6px' }}>
                  You beat the crowd on {result.lots.filter((l) => l.won).length} of {result.lots.length} lots. The figure beside each bid is the median the rest of the field put on that lot, and you had to be strictly above it.
                </p>
                <p style={{ margin: '0 0 6px' }}>
                  {result.board.field === 1
                    ? 'You are the first bidder today, so every price here is provisional.'
                    : `${result.board.field} players have bid on this sale so far.`}
                  {' '}The medians move as more people arrive, so this result is live and will keep updating while it is on screen.
                </p>
                {result.houseActive && (
                  <p style={{ margin: '0 0 6px' }}>
                    The opening crowd is still in the pool. It stays until ten real players have bid, then it retires for everyone and you are measured against people alone.
                  </p>
                )}
                {result.replay && (
                  <p style={{ margin: 0 }}>This is the allocation you already placed on this sale. It stands, and it is being re-scored against the field as it fills in.</p>
                )}
              </div>

              {result.board.top && result.board.top.length > 0 && (
                <div style={{ marginTop: 14, borderTop: '1px solid rgba(28,30,36,0.18)', paddingTop: 10 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, fontWeight: 500, marginBottom: 6 }}>Today&rsquo;s saleroom</div>
                  {result.board.top.map((row) => (
                    <div key={`${row.rank}-${row.name}`} className={`bd-stand${row.you ? ' you' : ''}`}>
                      <span style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 500, color: COLORS.faded, width: 26, flex: '0 0 auto' }}>{row.rank}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.name}{row.you ? ' (you)' : ''}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11.5, fontWeight: 500, color: COLORS.faded, whiteSpace: 'nowrap' }}>{row.lots} lot{row.lots === 1 ? '' : 's'}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 500, color: COLORS.ink, fontVariantNumeric: 'tabular-nums', width: 34, textAlign: 'right', flex: '0 0 auto' }}>{row.points}</span>
                    </div>
                  ))}
                  {!result.board.youRegistered && (
                    <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: COLORS.faded, marginTop: 8 }}>
                      The saleroom lists named players only. Join the leaderboard below and your allocation appears here.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 12, minHeight: 22, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: playing ? COLORS.accent : COLORS.faded }}>
              {done
                ? `Bids placed. ${result ? result.points : 0} of ${totalValue} taken.`
                : remaining === 0 ? 'Purse spent. Place the bids or move money around.'
                  : spent > 0 ? `${remaining} credits still in hand.` : 'Spread the purse across the lots.'}
            </span>
          </div>
        </div>
        )}

        {started && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded }}>
              Adjust freely. Once you place the bids they are sealed for the day.
            </span>
          </div>
        )}

        {!playing && (
          <div style={{ maxWidth: 472, margin: '0 auto' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.ink, margin: '8px 0 0' }}>
              There was <span style={{ color: COLORS.accent }}>{totalValue} points</span> in the room.
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.faded, margin: '6px 0 0', lineHeight: 1.5 }}>
              No allocation is right or wrong here. The purse never stretches across all five lots, so the only question is which of them the rest of the field underrated.
            </div>
            {PUZZLE.sunday && (
              <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition, a fuller sale.</div>
            )}
            {isTodays && myStats.cur >= 2 && (
              <div style={{ fontSize: 13, fontWeight: 800, margin: '12px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#b45309' }}>{myStats.cur}-day streak</span>
              </div>
            )}
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Bid in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new sale drops at midnight Eastern.'}
                  {prevPuzzle && (<>{' '}Meanwhile: <a href={`/bid?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>play yesterday&rsquo;s Bid &rarr;</a></>)}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/bid" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Bid &rarr;</a>
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
          <DailyGamesGrid self="bid" maxWidth={620}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }} light
            boardSlot={<DailyBoardPanel self="bid" quizId={PUZZLE.quizId} maxWidth={620} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Bid to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s sale, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s sale, every day.</p>
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
        <DailyEndCard modal self="bid" won={won}
          headline={won ? <>You cleaned up.</> : <>Bids are in.</>}
          subline={<>{finalScore}/10 &middot; {result ? result.points : 0} of {totalValue} in lots &middot; {result ? result.lots.filter((l) => l.won).length : 0} of {LOTS.length} taken &middot; {elapsed}</>}
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
            <button className="bd-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ position: 'relative', display: focusMode ? 'none' : 'block', zIndex: 2, maxWidth: 620, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Bid</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Bid is a free daily sealed-bid auction from Source of Truths. Five lots, a purse of {BUDGET} credits, and one allocation. You take a lot by beating the median bid the rest of the field put on it, and your score is the value of what you carry out of the room.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          There is no solver and no right answer. The lots are worth what the sale says they are worth, but their prices are set entirely by what everybody else does, and the median you are measured against leaves your own bid out so your money can never beat you. Because every score is recomputed against the whole pool, results keep moving all day as more people bid.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new sale drops every day at midnight Eastern. No app, no signup, play free in your browser, keep a streak, and race the daily leaderboard. Our other crowd games: <a href="/outwit" style={{ color: COLORS.ink, fontWeight: 800 }}>Outwit</a>, where you are scored on guessing what everyone else guessed, and <a href="/outrank" style={{ color: COLORS.ink, fontWeight: 800 }}>Outrank</a>, where you rank against the room.
        </p>
      </section>

      <div style={{ position: 'relative', zIndex: 2, display: focusMode ? 'none' : 'block' }}><Footer /></div>
    </div>
  );
}
