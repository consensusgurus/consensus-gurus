'use client';

// Outwit — the daily crowd game. Your opponent is everyone else playing today.
//
// Five quick duels against the whole field: undercut the average, dodge the
// popular pick, read the herd, find the meeting point, be the rare bird. There
// are no right answers — only what the crowd does. Answer all five, then face
// the field: the server scores you against the pool (instant and final, owner
// ruling) — the pre-written "house crowd" seeds it until ten real players
// have picked; after that it is real picks only —
// and shows you the actual distributions — the payoff is seeing where the
// crowd really landed.
//
// Same daily plumbing as Circa/Stet: banked days gated by Eastern date on the
// server (app/outwit/page.js — which also strips the house answers before
// anything reaches the browser), per-puzzle localStorage saves, /outwit?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Users, Crown } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyTopNav from '../DailyTopNav';
import DailyCombinedLeaderboard from '../quiz/[id]/DailyCombinedLeaderboard';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#1f2937',       // Outwit identity — graphite, with the site gold
  accentSoft: '#eef1f5',
  gold: '#e8b43a',
  green: '#15803d',
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_outwit_help_seen';
const STATS_KEY = 'sot_outwit_stats';

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

// ─── Personal stats + streak (localStorage), Circa/Stet pattern ─────────────
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
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 10, g: null, won: sc >= 7 };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState() {
  return {
    v: 1,
    ans: {},                    // promptIdx -> value (number; option index for choices)
    status: 'playing',          // playing | done
    result: null,               // /api/outwit response
    t0: null,
    tEnd: null,
  };
}

export default function OutwitClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const PROMPTS = PUZZLE.prompts;
  const TOTAL = PROMPTS.length * 2;
  const STORE_KEY = `sot_outwit_${PUZZLE.num}`;

  const [g, setG] = useState(freshState);
  const [numVals, setNumVals] = useState({}); // promptIdx -> raw input string
  const [sending, setSending] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
  const focusMode = playing && !showChrome;
  const answered = Object.keys(g.ans).length;
  const result = g.result;
  const score = result ? result.points : 0;
  const sharp = g.status === 'done' && score >= 7; // "outwitted the crowd" day

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
        if (saved && saved.v === 1 && saved.ans) {
          setG({ ...freshState(), ...saved });
          const nv = {};
          for (const [k, v] of Object.entries(saved.ans)) {
            if (!PROMPTS[k] || PROMPTS[k].options) continue;
            nv[k] = String(v);
          }
          setNumVals(nv);
        }
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
    try {
      if (PUZZLE.num === pickPuzzle(puzzles, null).num) {
        localStorage.setItem('sot_outwit_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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

  function postResult(g2, sc) {
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: 0, won: sc >= 7 })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = 0 for everyone (there are no wrong answers to count), so
        // the daily board's tiebreak falls through to fastest time.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc >= 7 ? 1 : 0, guessesUsed: 0, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function setAnswer(i, v) {
    if (!playing) return;
    setG((cur) => {
      const g2 = { ...cur, ans: { ...cur.ans, [i]: v } };
      if (!g2.t0) g2.t0 = Date.now();
      return g2;
    });
  }
  function setNumRaw(i, raw) {
    const cleaned = raw.replace(/[^0-9]/g, '').slice(0, 9);
    setNumVals((cur) => ({ ...cur, [i]: cleaned }));
    if (cleaned === '') {
      setG((cur) => { const a = { ...cur.ans }; delete a[i]; return { ...cur, ans: a }; });
      return;
    }
    const v = parseInt(cleaned, 10);
    const pr = PROMPTS[i];
    if (Number.isInteger(v) && v >= pr.min && v <= pr.max) setAnswer(i, v);
    else setG((cur) => { const a = { ...cur.ans }; delete a[i]; return { ...cur, ans: a }; });
  }

  async function faceTheCrowd() {
    if (!playing || sending) return;
    if (answered < PROMPTS.length) { say(`Answer all ${PROMPTS.length} first — ${PROMPTS.length - answered} to go.`); return; }
    setSending(true);
    try {
      const answers = PROMPTS.map((_, i) => g.ans[i]);
      const r = await fetch('/api/outwit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, answers, anonId: getAnonId(), email: identity?.email || undefined }),
      });
      const d = await r.json();
      if (!d || d.error || !Array.isArray(d.prompts)) {
        say('Couldn’t reach the crowd — try again in a moment.');
        setSending(false);
        return;
      }
      const g2 = { ...g, status: 'done', result: d, tEnd: Date.now() };
      if (!g2.t0) g2.t0 = Date.now();
      postResult(g2, d.points);
      setG(g2);
    } catch (e) {
      say('Couldn’t reach the crowd — try again in a moment.');
    }
    setSending(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setNumVals({}); setEndClosed(false);
  }

  function shareText() {
    const squares = (result ? result.prompts : []).map((p) => (p.pts === 2 ? '\u{1F7E9}' : p.pts === 1 ? '\u{1F7E8}' : '⬜')).join('');
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const crowdBit = result ? ` · crowd of ${fmtBig(result.poolSize)}` : '';
    return `Outwit #${PUZZLE.num} · ${score}/${TOTAL}${crowdBit}${streakBit}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/outwit${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Outwit #${PUZZLE.num} — the daily crowd game from Source of Truths.\n${shareUrl()}`
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
    <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontFamily: SANS, fontSize: 12, fontWeight: 800, borderRadius: 6, padding: '3px 9px', color: pts === 2 ? '#fff' : pts === 1 ? '#7c5a08' : COLORS.faded, background: pts === 2 ? COLORS.green : pts === 1 ? '#fdf0cd' : COLORS.paper }}>
      +{pts}
    </span>
  );

  // ---- reveal blocks ----
  function revealChoice(rp) {
    const maxC = Math.max(1, ...rp.counts);
    const totC = rp.counts.reduce((a, b) => a + b, 0) || 1;
    return (
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {rp.options.map((opt, oi) => {
          const you = rp.yourAnswer === oi;
          const win = rp.winner === oi;
          return (
            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: '0 0 108px', fontFamily: SANS, fontSize: 12, fontWeight: you ? 800 : 600, color: you ? COLORS.ink : COLORS.faded, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>{opt}</span>
              <div style={{ flex: '1 1 auto', height: 16, background: COLORS.paper, borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${Math.round((rp.counts[oi] / maxC) * 100)}%`, height: '100%', background: you ? COLORS.gold : win ? '#94a3b8' : '#c8cfd9', borderRadius: 5, minWidth: rp.counts[oi] ? 4 : 0 }} />
              </div>
              <span style={{ flex: '0 0 74px', fontFamily: MONO, fontSize: 10.5, color: COLORS.faded, whiteSpace: 'nowrap' }}>
                {Math.round((rp.counts[oi] / totC) * 100)}%{you ? ' · you' : win ? (rp.type === 'least' ? ' · fewest' : ' · crowd') : ''}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  function revealNumeric(rp) {
    const maxC = Math.max(1, ...rp.buckets.map((b) => b.count));
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 58 }}>
          {rp.buckets.map((b, bi) => (
            <div key={bi} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ width: '100%', height: `${Math.max(3, Math.round((b.count / maxC) * 100))}%`, background: b.you ? COLORS.gold : '#c8cfd9', borderRadius: '4px 4px 0 0', position: 'relative' }}>
                {b.target && <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `6px solid ${COLORS.rust}` }} />}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 9, color: COLORS.faded, marginTop: 3 }}>
          <span>{rp.buckets[0].label.split('–')[0]}</span>
          <span style={{ color: COLORS.rust }}>▾ target {fmtBig(rp.target)}</span>
          <span>{rp.buckets[rp.buckets.length - 1].label.split('–')[1]}</span>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 7, lineHeight: 1.5 }}>
          You said <b style={{ color: COLORS.ink }}>{fmtBig(rp.yourAnswer)}</b> — closer than <b style={{ color: COLORS.ink }}>{rp.beatPct}%</b> of the crowd.
          {rp.truth != null && (
            <> True answer: <b style={{ color: COLORS.ink }}>{fmtBig(rp.truth)}</b> (crowd median {fmtBig(rp.median)}).{rp.truthNote ? ` ${rp.truthNote}` : ''}</>
          )}
        </div>
      </div>
    );
  }
  function revealUnique(rp) {
    const maxC = Math.max(1, ...rp.counts);
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 52 }}>
          {rp.counts.map((c, ci) => {
            const n = ci + rp.min;
            const you = rp.yourAnswer === n;
            const win = rp.winner === n;
            return (
              <div key={ci} style={{ flex: '1 1 0', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div title={`${n}: ${c}`} style={{ width: '100%', height: `${Math.max(4, Math.round((c / maxC) * 100))}%`, background: you ? COLORS.gold : win ? COLORS.green : '#c8cfd9', borderRadius: '3px 3px 0 0' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
          {rp.counts.map((c, ci) => {
            const n = ci + rp.min;
            const you = rp.yourAnswer === n;
            const win = rp.winner === n;
            return <span key={ci} style={{ flex: '1 1 0', textAlign: 'center', fontFamily: MONO, fontSize: 8.5, fontWeight: you || win ? 700 : 500, color: you ? '#8a6d1a' : win ? COLORS.green : COLORS.faded }}>{n}</span>;
          })}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginTop: 6 }}>
          Rarest pick: <b style={{ color: COLORS.green }}>{rp.winner}</b> · you took <b style={{ color: COLORS.ink }}>{rp.yourAnswer}</b>.
        </div>
      </div>
    );
  }

  function renderPrompt(i) {
    const pr = PROMPTS[i];
    const rp = result ? result.prompts[i] : null;
    const val = g.ans[i];
    return (
      <div key={i} style={{ background: '#fff', border: `1.5px solid ${rp ? (rp.pts === 2 ? 'rgba(21,128,61,0.5)' : rp.pts === 1 ? 'rgba(202,138,4,0.5)' : 'rgba(28,30,36,0.18)') : 'rgba(28,30,36,0.2)'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 7px' }}>{i + 1} · {pr.tag}</span>
          {rp ? ptsChip(rp.pts) : (val != null ? <span style={{ marginLeft: 'auto', color: COLORS.green, display: 'flex' }}><Crown size={14} style={{ display: 'none' }} /><svg viewBox="0 0 12 12" width="14" height="14" fill="none"><path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span> : null)}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink, lineHeight: 1.4, marginBottom: 9 }}>
          {pr.q}
        </div>
        {!rp && pr.options && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {pr.options.map((opt, oi) => (
              <button key={oi} onClick={() => setAnswer(i, oi)} className={`ow-opt${val === oi ? ' ow-opt-on' : ''}`}>{opt}</button>
            ))}
          </div>
        )}
        {!rp && !pr.options && (
          <input
            className="ow-inp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={`${fmtBig(pr.min)}–${fmtBig(pr.max)}`}
            value={numVals[i] ?? ''}
            onChange={(e) => setNumRaw(i, e.target.value)}
            aria-label={pr.q}
          />
        )}
        {rp && (rp.options ? revealChoice(rp) : rp.buckets ? revealNumeric(rp) : revealUnique(rp))}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="ow-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.ow-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .ow-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .ow-btn:hover{background:${COLORS.paper};}
          .ow-opt{font-family:${SANS};font-weight:800;font-size:13.5px;border:2px solid rgba(28,30,36,0.3);background:#fff;color:${COLORS.ink};border-radius:9px;padding:9px 14px;cursor:pointer;}
          .ow-opt:hover{border-color:${COLORS.accent};}
          .ow-opt-on{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff;box-shadow:0 0 0 3px rgba(232,180,58,0.45);}
          .ow-inp{font-family:${MONO};font-weight:500;font-size:22px;letter-spacing:0.06em;width:200px;max-width:100%;border:2px solid ${COLORS.ink};border-radius:9px;padding:8px 12px;background:#fff;color:${COLORS.ink};outline:none;}
          .ow-inp:focus{border-color:${COLORS.accent};box-shadow:0 0 0 3px rgba(31,41,55,0.14);}
          .ow-face{font-family:${SANS};font-weight:800;font-size:15px;letter-spacing:0.05em;text-transform:uppercase;border:none;background:${COLORS.accent};color:#fff;border-radius:10px;padding:0 26px;height:56px;cursor:pointer;display:inline-flex;align-items:center;gap:10px;box-shadow:0 3px 0 rgba(20,22,28,0.25);}
          .ow-face:active{transform:translateY(1px);box-shadow:0 2px 0 rgba(20,22,28,0.25);}
          .ow-face:disabled{opacity:.55;cursor:default;}
          .ow-face .ow-gold{color:${COLORS.gold};}
          @media(max-width:560px){.ow-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.ow-ttl h1{font-size:21px;letter-spacing:0.02em;}.ow-ttl .ow-ttl-dt{font-size:15px;}.ow-ttl-dot{display:none;}}
        `}</style>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ display: focusMode ? 'none' : 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed OUTWIT tiles with No./date inline */}
        <div className="ow-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            {'OUTWIT'.split('').map((ch, i) => (
              <div key={i} style={{ width: 38, height: 38, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 22, background: i >= 3 ? COLORS.accent : COLORS.ink, color: i >= 3 ? COLORS.gold : '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="ow-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="ow-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="ow-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the five duels */}
        <div style={{ background: COLORS.accentSoft, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 12px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Users size={12} /> five duels vs. today&rsquo;s crowd</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>answered <b style={{ color: COLORS.ink, fontWeight: 500 }}>{answered}</b>/{PROMPTS.length}</span>
          </div>
          {PROMPTS.map((_, i) => renderPrompt(i))}
          {playing && (
            <div style={{ textAlign: 'center', margin: '14px 0 8px' }}>
              <button className="ow-face" onClick={faceTheCrowd} disabled={sending || answered < PROMPTS.length}>
                <Users size={17} className="ow-gold" /> {sending ? 'Facing the crowd…' : 'Face the crowd'}
              </button>
              <div style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 700, color: COLORS.faded, marginTop: 8 }}>
                No right answers — only what everyone else does. Lock all five, then see the real numbers.
              </div>
            </div>
          )}
        </div>

        {/* result */}
        {!playing && result && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: sharp ? COLORS.green : COLORS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {sharp ? 'You outwitted the crowd.' : score >= 4 ? 'You held your own against the crowd.' : 'The crowd got you today.'}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>A field of {fmtBig(result.poolSize)} &middot; {elapsed}</span>
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Outwit in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new crowd forms at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/outwit?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Outwit &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/outwit" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Outwit &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show navigation &amp; more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Other games, challenge, share &amp; leaderboard</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0' }}>
          <DailyGamesGrid
            self="outwit"
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Outwit to your Home Screen</div>
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
              { n: myStats.played ? `${Math.round((myStats.sharp / myStats.played) * 100)}%` : '—', l: 'Outwitted' },
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
          <DailyCombinedLeaderboard todayKey="outwit" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && result && !endClosed && (
        <DailyEndCard
          modal
          self="outwit"
          won={sharp}
          headline={<>You scored {Math.round((score / TOTAL) * 100)}%</>}
          subline={<>Outwit #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; crowd of {fmtBig(result.poolSize)} &middot; {elapsed}</>}
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
            <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 9px' }}>Your opponent is <b>everyone playing today</b>. Five quick duels, no right answers — you score by predicting what the crowd does.</p>
              <p style={{ margin: '0 0 9px' }}><b>Undercut</b>: closest to two-thirds of the average pick. <b>Road Less Traveled</b>: pick what the fewest pick. <b>Herd</b>: closest to the crowd&rsquo;s median guess — right or wrong. <b>Meeting Point</b>: match the most-picked answer. <b>Rare Bird</b>: the rarest number wins.</p>
              <p style={{ margin: '0 0 9px' }}>Each duel pays <b>0, 1, or 2 points</b> by where you land in the field. Your score is final the moment you play, measured against everyone before you. Overnight, the <b>house crowd</b> — four dozen pre-written picks — seeds the pool so the first player still faces a real field; once <b>ten real players</b> have locked in, the house steps aside and the crowd is entirely human.</p>
              <p style={{ margin: 0 }}>After you lock in, the real distributions are revealed — where the crowd actually went. Ties on the daily board break by fastest time. 7+ of 10 counts as outwitting the crowd.</p>
            </div>
            <button className="ow-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Outwit — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Outwit</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Outwit is a free daily game from Source of Truths where the puzzle is other people. Every day, five quick duels pit you against the entire field of players: undercut two-thirds of the crowd&rsquo;s average, pick the option the fewest will touch, guess where the herd&rsquo;s median lands, meet the crowd at its favorite answer, and find the number nobody else takes.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          There are no trivia answers to know — the classic game-theory twist is that everyone is reasoning about everyone else. When you lock in, your picks are scored against every player before you, and the real distributions are revealed: where the crowd actually went, versus where you thought it would. The crowd changes over the day — a pre-written house field seeds the small hours, then retires once ten real players are in, so by breakfast you're playing purely against people.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new crowd forms every day at midnight Eastern. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/tally" style={{ color: COLORS.ink, fontWeight: 800 }}>Tally</a>, our row-and-column logic game, <a href="/suds" style={{ color: COLORS.ink, fontWeight: 800 }}>Suds</a>, our daily sudoku, and <a href="/circa" style={{ color: COLORS.ink, fontWeight: 800 }}>Circa</a>, our year-guessing game.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
