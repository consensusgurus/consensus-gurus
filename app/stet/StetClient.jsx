'use client';

// Stet — the daily copy-desk game.
//
// One news brief a day: five sentences (seven on Sundays). Most sentences hide
// exactly one wrong word — a real word (an eggcorn, a homophone, a malaprop, a
// grammar slip), so a spellchecker sails past it. But not all: some sentences
// are CLEAN, and the player earns their points by stamping them "stet" (the
// proofreader's mark for "let it stand"). Sundays are tougher, and a Sunday
// sentence can hide TWO errors — so Sundays let you flag up to two words
// before locking a sentence in.
//
// Scoring: each error is worth 2 (1 for flagging the right word, 1 for typing
// the right fix); a clean sentence is worth 2 for a correct stet. The day's
// total is the sum (a plain weekday is 10). Ties on the daily board break by
// fewest mis-flags (wrongly flagged words + wrongly stetted sentences), then
// fastest time.
//
// Same daily plumbing as Circa/Suds/Tally: banked briefs gated by Eastern date
// on the server (app/stet/page.js), per-puzzle localStorage saves, /stet?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Pencil, Stamp } from 'lucide-react';
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

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#0e1d40',
  rust: '#c0392b',
  faded: '#6b7280',
  accent: '#0369a1',       // Stet identity — the copy editor's blue pencil
  accentSoft: '#e8f3fa',
  green: '#15803d',
  greenSoft: '#eefaf1',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const PAPER = '#fbf9f4';
const HELP_KEY = 'sot_stet_help_seen';
const STATS_KEY = 'sot_stet_stats';

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

// strip a token down to its comparable word form (keeps inner hyphens/apostrophes)
const stripTok = (w) => (w || '').toLowerCase().replace(/^[^a-z0-9'’-]+|[^a-z0-9'’-]+$/g, '');
// normalize a typed fix for comparison (also fold curly apostrophes)
const normFix = (w) => stripTok(String(w || '').trim()).replace(/’/g, "'");

// per-sentence point value: 2 per error; a clean sentence is worth 2 for the stet
const itemValue = (it) => (it.errors.length ? it.errors.length * 2 : 2);

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
    const sc = Math.max(0, Math.min(10, Math.round(((m.scorePct || 0) / 100) * 10)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: 10, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState() {
  return {
    v: 2,
    sub: {},                    // itemIdx -> { staged: [{tok, fix}], stet: bool }
    status: 'playing',          // playing | done
    t0: null,
    tEnd: null,
  };
}

export default function StetClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const ITEMS = PUZZLE.items;
  const TOTAL = ITEMS.reduce((s, it) => s + itemValue(it), 0);
  const MAX_FLAGS = PUZZLE.sunday ? 2 : 1;
  const STORE_KEY = `sot_stet_${PUZZLE.num}`;

  const [g, setG] = useState(freshState);
  const [sel, setSel] = useState(null);        // { item, tok } — the armed pick (pre-stage)
  const [fixVal, setFixVal] = useState('');
  const [pending, setPending] = useState({});  // itemIdx -> [{tok, fix}] staged (Sunday flow)
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
  const fixRef = useRef(null);

  const [showChrome, setShowChrome] = useState(false);
  const playing = g.status === 'playing';
  const focusMode = playing && !showChrome;
  const solvedCount = Object.keys(g.sub).length;

  // tokenized sentences: [{ raw, isWord }] — whitespace kept as its own parts
  const TOKS = useMemo(
    () => ITEMS.map((it) => it.text.split(/(\s+)/).filter((s) => s.length > 0).map((raw) => ({ raw, isWord: !/^\s+$/.test(raw) && stripTok(raw).length > 0 }))),
    [ITEMS]
  );
  // per item: each error's true token index (parallel to it.errors)
  const WRONG_TOKS = useMemo(
    () => ITEMS.map((it, i) => it.errors.map((e) => TOKS[i].findIndex((t) => t.isWord && stripTok(t.raw) === e.wrong.toLowerCase()))),
    [ITEMS, TOKS]
  );

  // Score one finalized sentence from its sub. Pure — recomputed at render.
  function scoreItem(i, sub) {
    const it = ITEMS[i];
    const staged = (sub && sub.staged) || [];
    let pts = 0, misses = 0;
    const errTok = WRONG_TOKS[i];
    for (let e = 0; e < it.errors.length; e++) {
      const s = staged.find((x) => x.tok === errTok[e]);
      if (s) {
        pts += 1;
        const accepted = [it.errors[e].fix, ...(it.errors[e].alts || [])].map(normFix);
        if (accepted.includes(normFix(s.fix))) pts += 1;
      }
    }
    for (const s of staged) { if (!errTok.includes(s.tok)) misses += 1; }
    if (!it.errors.length && sub && sub.stet && staged.length === 0) pts = 2;
    if (sub && sub.stet && it.errors.length) misses += 1;
    return { pts, misses, value: itemValue(it) };
  }

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

  // ---- persistence (v2 saves only; v1 pre-launch saves are discarded) ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 2 && saved.sub) {
          setG({ ...freshState(), ...saved });
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
        localStorage.setItem('sot_stet_day', JSON.stringify({ d: etToday(), done: g.status !== 'playing' }));
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

  const results = ITEMS.map((_, i) => (g.sub[i] ? scoreItem(i, g.sub[i]) : null));
  const score = results.reduce((s, r) => s + (r ? r.pts : 0), 0);
  const misses = results.reduce((s, r) => s + (r ? r.misses : 0), 0);
  const perfect = g.status === 'done' && score === TOTAL;

  const REC_KEY = `sot_stet_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    if (!g.t0 || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - g.t0) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: 0, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc, ms) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: ms, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = mis-flags (wrongly flagged words + wrongly stetted
        // sentences), so the daily board's ties break by sharper eyes.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: ms, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function startClock() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
  }

  function tapWord(itemIdx, tokIdx) {
    if (!playing || g.sub[itemIdx]) return;
    const staged = pending[itemIdx] || [];
    if (staged.some((s) => s.tok === tokIdx)) { say('Already flagged — remove it below to change the fix.'); return; }
    if (staged.length >= MAX_FLAGS) { say(`You can flag up to ${MAX_FLAGS} word${MAX_FLAGS > 1 ? 's' : ''} here. Remove one first.`); return; }
    startClock();
    if (sel && sel.item === itemIdx && sel.tok === tokIdx) { setSel(null); setFixVal(''); return; }
    setSel({ item: itemIdx, tok: tokIdx });
    setFixVal('');
    setTimeout(() => { try { fixRef.current && fixRef.current.focus(); } catch (e) {} }, 30);
  }

  function finalizeItem(i, staged, stet) {
    const sub = { staged, stet };
    const nextSub = { ...g.sub, [i]: sub };
    const g2 = { ...g, sub: nextSub };
    if (!g2.t0) g2.t0 = Date.now();
    const done = Object.keys(nextSub).length >= ITEMS.length;
    if (done) {
      g2.status = 'done';
      g2.tEnd = Date.now();
      let sc = 0, ms = 0;
      ITEMS.forEach((_, k) => { const r = scoreItem(k, nextSub[k]); sc += r.pts; ms += r.misses; });
      postResult(g2, sc, ms);
    }
    setG(g2);
    setSel(null);
    setFixVal('');
    setPending((cur) => { const c = { ...cur }; delete c[i]; return c; });
  }

  function submitFix() {
    if (!playing || !sel) return;
    const fixTyped = normFix(fixVal);
    if (!fixTyped) { say('Type the replacement word first.'); return; }
    const i = sel.item;
    const entry = { tok: sel.tok, fix: fixVal.trim() };
    const staged = [...(pending[i] || []), entry];
    if (MAX_FLAGS === 1) {
      finalizeItem(i, staged, false);
      return;
    }
    // Sunday: stage it; the sentence locks on "Lock it in"
    setPending((cur) => ({ ...cur, [i]: staged }));
    setSel(null);
    setFixVal('');
  }

  function unstage(i, tok) {
    setPending((cur) => ({ ...cur, [i]: (cur[i] || []).filter((s) => s.tok !== tok) }));
  }

  function stetItem(i) {
    if (!playing || g.sub[i]) return;
    if ((pending[i] || []).length) { say('You have a flag staged — remove it first to stet the sentence.'); return; }
    startClock();
    finalizeItem(i, [], true);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setSel(null); setFixVal(''); setPending({}); setEndClosed(false);
  }

  function shareText() {
    const squares = ITEMS.map((it, i) => {
      const r = results[i];
      if (!r) return '⬜';
      return r.pts === r.value ? '\u{1F7E6}' : r.pts > 0 ? '\u{1F7E8}' : '⬜';
    }).join('');
    const streakBit = isTodays && myStats.cur >= 2 ? ` · streak ${myStats.cur}` : '';
    const head2 = `Stet #${PUZZLE.num} · ${score}/${TOTAL}${perfect ? ' · clean desk' : ''}${streakBit}`;
    return `${head2}\n${squares}\n${shareUrl()}`;
  }
  function shareUrl() {
    return `sourceoftruths.com/stet${isTodays ? '' : `?p=${PUZZLE.num}`}`;
  }
  function copyShare() {
    const text = playing
      ? `Stet #${PUZZLE.num} — the daily copy-desk game from Source of Truths.\n${shareUrl()}`
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

  // Plain render helper (NOT a nested component — a nested component's identity
  // would change every render and remount the fix input on each keystroke).
  function renderSentence(i) {
    const it = ITEMS[i];
    const sub = g.sub[i] || null;
    const staged = pending[i] || [];
    const armed = sel && sel.item === i ? sel.tok : null;
    const r = sub ? scoreItem(i, sub) : null;
    const errTok = WRONG_TOKS[i];
    const borderCol = r
      ? (r.pts === r.value ? 'rgba(21,128,61,0.5)' : r.pts > 0 ? 'rgba(202,138,4,0.5)' : 'rgba(192,57,43,0.5)')
      : 'rgba(28,30,36,0.2)';
    return (
      <div key={i} style={{ background: '#fff', border: `1.5px solid ${borderCol}`, borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, flex: '0 0 auto' }}>{i + 1}</span>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 16.5, fontWeight: 600, lineHeight: 1.65, color: COLORS.ink }}>
            {TOKS[i].map((t, j) => {
              if (!t.isWord) return <span key={j}>{t.raw}</span>;
              if (!sub) {
                const isArmed = armed === j;
                const isStaged = staged.some((s) => s.tok === j);
                return (
                  <span
                    key={j}
                    role="button"
                    tabIndex={0}
                    onClick={() => tapWord(i, j)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapWord(i, j); } }}
                    className={`st-w${isArmed ? ' st-w-on' : ''}${isStaged ? ' st-w-staged' : ''}`}
                  >{t.raw}</span>
                );
              }
              // scored render: strike each TRUE wrong word, insert its fix after it
              const eIdx = errTok.indexOf(j);
              if (eIdx >= 0) {
                const e = it.errors[eIdx];
                const found = (sub.staged || []).some((s) => s.tok === j);
                const trail = t.raw.slice(t.raw.toLowerCase().indexOf(e.wrong.toLowerCase()) + e.wrong.length);
                return (
                  <span key={j}>
                    <s style={{ color: found ? COLORS.accent : COLORS.rust, textDecorationThickness: 2 }}>{e.wrong}</s>
                    {' '}<b style={{ color: COLORS.green }}>{e.fix}</b>{trail}
                  </span>
                );
              }
              const wasFlag = (sub.staged || []).some((s) => s.tok === j);
              return <span key={j} style={wasFlag ? { background: '#fdeeee', borderRadius: 3, boxShadow: '0 0 0 2px #fdeeee' } : undefined}>{t.raw}</span>;
            })}
            {sub && !it.errors.length && sub.stet && (
              <span style={{ marginLeft: 7, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.08em', color: COLORS.green, border: '1px solid rgba(21,128,61,0.45)', borderRadius: 4, padding: '1px 6px', whiteSpace: 'nowrap' }}>STET ✓</span>
            )}
          </p>
          {r && (
            <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontFamily: MONO, fontSize: 11, fontWeight: 500, color: r.pts === r.value ? COLORS.green : r.pts > 0 ? '#a16207' : COLORS.rust }}>
              +{r.pts}
            </span>
          )}
        </div>

        {/* staged flags (Sunday flow) */}
        {!sub && staged.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {staged.map((s) => (
              <span key={s.tok} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.ink, background: COLORS.accentSoft, border: `1.5px solid rgba(3,105,161,0.4)`, borderRadius: 7, padding: '3px 8px' }}>
                <s>{stripTok(TOKS[i][s.tok].raw)}</s> → <b style={{ color: COLORS.accent }}>{s.fix}</b>
                <button onClick={() => unstage(i, s.tok)} aria-label="Remove this flag" style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}><X size={13} /></button>
              </span>
            ))}
            {armed == null && (
              <>
                <button className="st-lock" onClick={() => finalizeItem(i, staged, false)}>Lock it in</button>
                {staged.length < MAX_FLAGS && (
                  <span style={{ fontFamily: SANS, fontSize: 11.5, fontWeight: 600, color: COLORS.faded }}>…or tap another word if you smell a second error.</span>
                )}
              </>
            )}
          </div>
        )}

        {!sub && armed != null && (
          <div style={{ marginTop: 9, paddingTop: 9, borderTop: '1px dashed rgba(28,30,36,0.16)' }}>
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, marginBottom: 6 }}>
              Replace <b style={{ color: COLORS.accent }}>&ldquo;{stripTok(TOKS[i][armed].raw)}&rdquo;</b> with:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={fixRef}
                className="st-inp"
                type="text"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={fixVal}
                onChange={(e) => setFixVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitFix(); }}
                placeholder="the correct word"
                aria-label="Your correction"
              />
              <button className="st-go" onClick={submitFix}>{MAX_FLAGS === 1 ? 'Fix it' : 'Flag it'}</button>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: COLORS.faded, marginTop: 6 }}>
              {MAX_FLAGS === 1
                ? 'Tap a different word to change your pick — submitting locks this sentence.'
                : 'Sunday desk: you can flag up to two words before locking the sentence.'}
            </div>
          </div>
        )}

        {/* stet control — only while open with nothing staged/armed */}
        {!sub && armed == null && staged.length === 0 && (
          <div style={{ marginTop: 8 }}>
            <button className="st-stet" onClick={() => stetItem(i)} title="Mark this sentence as clean — no errors">
              <Stamp size={13} strokeWidth={2.4} /> Stet — it&rsquo;s clean
            </button>
          </div>
        )}

        {sub && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(28,30,36,0.14)', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: COLORS.faded, lineHeight: 1.5 }}>
            {it.errors.length === 0 ? (
              <>
                {sub.stet
                  ? null
                  : <>Nothing was wrong here{(sub.staged || []).length ? <> &mdash; you flagged &ldquo;{stripTok(TOKS[i][sub.staged[0].tok].raw)}&rdquo;</> : null}. </>}
                {it.cleanNote}
              </>
            ) : (
              <>
                {sub.stet && <>You let it stand, but the desk didn&rsquo;t. </>}
                {it.errors.map((e, k) => {
                  const s = (sub.staged || []).find((x) => x.tok === errTok[k]);
                  const accepted = [e.fix, ...(e.alts || [])].map(normFix);
                  return (
                    <span key={k}>
                      {!s && !sub.stet && <>Missed: <b style={{ color: COLORS.ink }}>{e.wrong}</b> &rarr; {e.fix}. </>}
                      {s && !accepted.includes(normFix(s.fix)) && <>Right word, but the fix is <b style={{ color: COLORS.ink }}>{e.fix}</b>, not &ldquo;{s.fix}&rdquo;. </>}
                      {e.note}{' '}
                    </span>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', position: 'relative' }}>
      <Grain />
      <div className="st-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.st-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .st-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .st-btn:hover{background:${COLORS.paper};}
          .st-w{cursor:pointer;border-radius:4px;padding:0 1px;transition:background .1s;}
          .st-w:hover{background:${COLORS.accentSoft};box-shadow:0 0 0 2px ${COLORS.accentSoft};}
          .st-w-on{background:${COLORS.accentSoft};box-shadow:0 0 0 2px ${COLORS.accent};border-radius:4px;}
          .st-w-staged{background:${COLORS.accentSoft};box-shadow:0 0 0 2px rgba(3,105,161,0.35);border-radius:4px;text-decoration:line-through;}
          .st-inp{font-family:${SANS};font-weight:700;font-size:16px;flex:1 1 auto;min-width:0;border:2px solid ${COLORS.ink};border-radius:9px;padding:9px 12px;background:#fff;color:${COLORS.ink};outline:none;}
          .st-inp:focus{border-color:${COLORS.accent};box-shadow:0 0 0 3px rgba(3,105,161,0.16);}
          .st-go{font-family:${SANS};font-weight:800;font-size:13.5px;letter-spacing:0.04em;text-transform:uppercase;border:2px solid ${COLORS.accent};background:${COLORS.accent};color:#fff;border-radius:9px;padding:0 18px;cursor:pointer;}
          .st-go:active{transform:translateY(1px);}
          .st-lock{font-family:${SANS};font-weight:800;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;border:2px solid ${COLORS.ink};background:${COLORS.ink};color:#fff;border-radius:8px;padding:6px 13px;cursor:pointer;}
          .st-stet{font-family:${SANS};font-weight:800;font-size:11.5px;letter-spacing:0.05em;text-transform:uppercase;border:1.5px dashed rgba(28,30,36,0.35);background:none;color:${COLORS.faded};border-radius:7px;padding:5px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}
          .st-stet:hover{border-color:${COLORS.green};color:${COLORS.green};}
          @media(max-width:560px){.st-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.st-ttl h1{font-size:21px;letter-spacing:0.02em;}.st-ttl .st-ttl-dt{font-size:15px;}.st-ttl-dot{display:none;}}
        `}</style>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ display: 'block' }}><DailyTopNav player={player} compact={playing} /></div>

        {/* masthead: pressed STET tiles with No./date inline */}
        <div className="st-mh" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', position: 'relative', paddingRight: 28, marginBottom: 16, borderBottom: '2px solid rgba(28,30,36,0.8)', paddingBottom: 11 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end' }}>
            {'STET'.split('').map((ch, i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 26, background: i === 0 ? COLORS.accent : COLORS.ink, color: '#fff', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
            ))}
          </div>
          <div className="st-ttl" style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <h1 style={{ margin: 0, fontFamily: MONO, fontSize: 14, letterSpacing: '0.06em', fontWeight: 500, color: COLORS.ink }}>No. {PUZZLE.num}</h1>
            <span className="st-ttl-dot" style={{ color: COLORS.faded }}>&middot;</span>
            <span className="st-ttl-dt" style={{ fontFamily: SANS, fontStyle: 'italic', fontSize: 15, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Two errors</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the brief */}
        <div style={{ background: PAPER, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 12px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Pencil size={12} /> one wrong word per sentence &mdash; maybe</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>filed <b style={{ color: COLORS.ink, fontWeight: 500 }}>{solvedCount}</b>/{ITEMS.length}</span>
          </div>
          {ITEMS.map((_, i) => renderSentence(i))}
          {playing && (
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, margin: '2px 2px 6px' }}>
              Tap the word that doesn&rsquo;t belong and fix it &mdash; or stamp a clean sentence <i>stet</i>. Wrong words and grammar slips, but never typos: spellcheck is no help.
            </div>
          )}
        </div>

        {/* result */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: perfect ? COLORS.green : COLORS.ink, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {perfect ? 'A clean desk — every call was right.' : misses === 0 ? 'Sharp eyes — a fix or two got away.' : `${misses} mis-flag${misses === 1 ? '' : 's'} on the desk today.`}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
              {PUZZLE.sunday && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition — seven sentences, up to two errors each, and the desk splits hairs.</div>
              )}
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>Next Stet in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new brief lands at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/stet?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        play yesterday&rsquo;s Stet &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/stet" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s Stet &rarr;</a>
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
            self="stet"
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Stet to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s brief, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s brief, every day.
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
              { n: myStats.played ? `${Math.round((myStats.perfect / myStats.played) * 100)}%` : '—', l: 'Clean Desk' },
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
          <DailyCombinedLeaderboard todayKey="stet" identity={identity} quizId={PUZZLE.quizId} />
        </div>
      </div>

      {/* the end-of-game popup: the shared DailyEndCard as a dismissible modal */}
      {!playing && !endClosed && (
        <DailyEndCard
          modal
          self="stet"
          won={misses === 0}
          headline={<>You scored {Math.round((score / TOTAL) * 100)}%</>}
          subline={<>Stet #{PUZZLE.num} &middot; {score}/{TOTAL}{perfect ? <> &middot; clean desk</> : null} &middot; {elapsed}</>}
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
              <p style={{ margin: '0 0 9px' }}>You&rsquo;re the copy desk. Most sentences in today&rsquo;s brief hide <b>one wrong word</b> &mdash; a real word, so spellcheck is no help. Think &ldquo;free reign&rdquo;, &ldquo;should of&rdquo;, &ldquo;a mute point&rdquo;. Word choice <i>and</i> grammar are both fair game.</p>
              <p style={{ margin: '0 0 9px' }}>But some sentences are <b>clean</b>. If nothing&rsquo;s wrong, stamp it <b>Stet</b> &mdash; the proofreader&rsquo;s mark for &ldquo;let it stand&rdquo; &mdash; and take the points. Flag a word in clean copy and you get nothing.</p>
              <p style={{ margin: '0 0 9px' }}>Every error is worth <b>2 points</b>: one for flagging the right word, one for typing the right fix. A correct stet is worth 2. {PUZZLE.sunday ? <>It&rsquo;s Sunday, so a sentence can hide <b>two</b> errors &mdash; flag up to two words, then lock it in.</> : <>On Sundays the brief runs seven sentences and can hide two errors in one sentence.</>}</p>
              <p style={{ margin: 0 }}>Ties on the daily board break by fewest mis-flags, then fastest time.</p>
            </div>
            <button className="st-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Stet — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Stet</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Stet is a free daily word game from Source of Truths &mdash; the copy-desk game. Each day serves up a short news brief where almost every sentence hides one wrong word: an eggcorn, a swapped homophone, a malaprop, or a grammar slip like &ldquo;should of&rdquo; or &ldquo;had ran&rdquo;. The catch is that every error is a real English word, so a spellchecker would wave the whole brief through. Only a sharp eye catches &ldquo;free reign&rdquo;, &ldquo;baited breath&rdquo;, or a report that &ldquo;peaked&rdquo; someone&rsquo;s interest.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Tap the word that doesn&rsquo;t belong, type the correction, and lock it in &mdash; a point for finding each error and a point for fixing it. But stay honest: some sentences are perfectly clean, and the only way to score them is to stamp them <i>stet</i> &mdash; the proofreader&rsquo;s mark, Latin for &ldquo;let it stand.&rdquo; Miss a call either way and the desk shows you what you should have caught, with a one-line note on why.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new brief lands every day at midnight Eastern, with a seven-sentence Sunday edition where a single sentence can hide two errors. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our unscrambling game, and <a href="/extra" style={{ color: COLORS.ink, fontWeight: 800 }}>Extra</a>, our front-page history game.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
