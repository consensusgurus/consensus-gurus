'use client';

// Hearsay — the daily puzzle of what other people don't know.
//
// A shortlist of cards is public. Each character is told, privately, ONE
// attribute of the secret card: on the harbour board Marisol is told the port
// and Ivo is told the day. Then they speak in turn, and every line is about
// their own ignorance. "I don't know it" is not an absence of evidence, it IS
// the evidence: it rules out every card whose value would have given the puzzle
// away.
//
// This is the Cheryl's Birthday family of puzzle, generated fresh daily and
// machine-verified (scripts/verify-hearsay.mjs) to leave exactly one card, to
// narrow at every line, and to stay ambiguous until the final one.
//
// The client never receives the answer: the server page ships the shortlist and
// the script, and this component replays the same public-announcement
// simulation the generator used to prove the board unique.
//
// Scoring: 12 points, minus 3 for each wrong card named, floor of 1 for anyone
// who names it at all. Revealing ends the day at 0. Ties on the daily board
// break by fewest wrong names, then fastest time.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, X, Smartphone, Ear, Eraser } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import useDuelContext, { DuelBanner } from '../quiz/[id]/useDuelContext';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import DailyGamesGrid from '../DailyGamesGrid';
import DailyEndCard from '../DailyEndCard';
import DailyChrome from '../DailyChrome';
import DailyMasthead from '../DailyMasthead';
import DailyRules from '../DailyRules';
import DailyBoardPanel from '../quiz/[id]/DailyBoardPanel';
import useAbandonFlush from '../quiz/[id]/useAbandonFlush';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../ShareCreditPop';
import { T } from '@/lib/theme';
import { meRequest } from '@/app/quizMeClient';

const COLORS = {
  cream: T.surface,
  paper: T.paper,
  ink: T.ink,
  ember: T.accent,
  rust: T.danger,
  faded: T.muted,
  accent: '#7c2d92',        // Hearsay identity — parlour violet
  accentSoft: '#f5e8fb',
  accentDeep: '#5b1d6d',
  green: T.successDeep,
  greenSoft: '#dcfce7',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const HELP_KEY = 'sot_hearsay_help_seen';
const STATS_KEY = 'sot_hearsay_stats';
const TOTAL = 12;

// ─── the announcement engine ────────────────────────────────────────────────
// Pure public-announcement logic over the live candidate set. The client runs
// it to derive the answer, so no board file ever stores one.
const countBy = (S, cards, attr, val) => S.filter((i) => cards[i][attr] === val).length;
function applyStatement(S, cards, st) {
  const a = st.who, b = st.other;
  // dontKnow and stillDontKnow filter identically; they differ only in wording,
  // because the second is said AFTER someone else has spoken and so carries
  // fresh information about a smaller list.
  if (st.type === 'dontKnow' || st.type === 'stillDontKnow') return S.filter((i) => countBy(S, cards, a, cards[i][a]) >= 2);
  if (st.type === 'know') return S.filter((i) => countBy(S, cards, a, cards[i][a]) === 1);
  if (st.type === 'knowOtherDoesnt') {
    return S.filter((i) => {
      if (countBy(S, cards, a, cards[i][a]) < 2) return false;
      return S.filter((j) => cards[j][a] === cards[i][a]).every((j) => countBy(S, cards, b, cards[j][b]) >= 2);
    });
  }
  // "I know now, but you still don't" cuts twice: it pins the speaker's value
  // and rules out anything that would already have settled it for the other.
  if (st.type === 'knowNowOtherStill') {
    return S.filter((i) => countBy(S, cards, a, cards[i][a]) === 1 && countBy(S, cards, b, cards[i][b]) >= 2);
  }
  return S;
}
function solveBoard(puzzle) {
  let S = puzzle.cards.map((_, i) => i);
  const steps = [];
  for (const st of puzzle.script) {
    const before = S;
    S = applyStatement(S, puzzle.cards, st);
    steps.push({ before, after: S });
  }
  return { answer: S.length === 1 ? S[0] : -1, steps };
}

const KEYS = ['a', 'b', 'c'];
const speakerOf = (puzzle, whoKey) => puzzle.who[KEYS.indexOf(whoKey)] || 'Someone';
const attrOf = (puzzle, whoKey) => puzzle.attrs[KEYS.indexOf(whoKey)] || 'value';

function statementText(puzzle, st) {
  const me = speakerOf(puzzle, st.who);
  const n = puzzle.noun;
  if (st.type === 'dontKnow') return `${me}: “I don't know which ${n} it is.”`;
  if (st.type === 'stillDontKnow') return `${me}: “I still don't know which ${n} it is.”`;
  if (st.type === 'know') return `${me}: “Now I know which ${n} it is.”`;
  if (st.type === 'knowOtherDoesnt') return `${me}: “I don't know which ${n} it is, and I know ${speakerOf(puzzle, st.other)} doesn't know either.”`;
  if (st.type === 'knowNowOtherStill') return `${me}: “Now I know which ${n} it is, but ${speakerOf(puzzle, st.other)} still doesn't.”`;
  return '';
}

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
    const sc = Math.max(0, Math.min(TOTAL, Math.round(((m.scorePct || 0) / 100) * TOTAL)));
    if (!changed) { rec = { ...rec }; changed = true; }
    rec[p.num] = { s: sc, t: TOTAL, g: null, won: !!m.perfect };
  }
  if (!changed) return s;
  const s2 = { ...s, rec };
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s2)); } catch (e) {}
  return s2;
}

function freshState() {
  return {
    v: 1,
    crossed: [],     // cards the player has struck off as scratch
    wrong: [],       // cards already named and rejected
    naming: false,
    status: 'playing',
    t0: null,
    tEnd: null,
  };
}

export default function HearsayClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const STORE_KEY = `sot_hearsay_${PUZZLE.num}`;
  const { answer: ANSWER, steps: STEPS } = useMemo(() => solveBoard(PUZZLE), [PUZZLE]);
  const three = PUZZLE.who.length > 2;

  const [g, setG] = useState(() => freshState());
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
  // eslint-disable-next-line no-unused-vars -- the player chip moved into
  // DailyChrome (QuizNavHeader fetches its own identity); the fetch below
  // stays for the cross-device stats merge.
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
  const liveScore = Math.max(1, TOTAL - 3 * g.wrong.length);
  const score = g.status === 'done' ? liveScore : 0;
  const won = g.status === 'done' && g.wrong.length === 0;

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
        if (saved && saved.v === 1 && Array.isArray(saved.crossed)) setG({ ...freshState(), ...saved });
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
        (function () { var _dn = g.status !== 'playing'; if (_dn || g.t0) localStorage.setItem('sot_hearsay_day', JSON.stringify({ d: etToday(), done: _dn })); else localStorage.removeItem('sot_hearsay_day'); })();
      }
    } catch (e) {}
  }, [g, hydrated, STORE_KEY, PUZZLE, puzzles]);

  // Live game clock. `elapsed` below is derived from the current time, and it
  // used to read Date.now() during render, so the displayed clock only advanced
  // when something else happened to re-render the board. This ticks a state
  // value while the game is actually running, so the readout moves on its own.
  // Display only: the elapsed time recorded on the result is still computed
  // from a real Date.now() delta at the moment the game ends.
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
        meRequest(`/api/quiz/me?anonId=${encodeURIComponent(anon || '')}${em}&history=1`)
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
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const elapsed = g.t0 ? fmtTime((g.tEnd || nowTick) - g.t0) : '0:00';
  const isTodays = PUZZLE.num === pickPuzzle(puzzles, null).num;
  const prevPuzzle = puzzles.find((x) => x.num === PUZZLE.num - 1) || null;
  const myStats = deriveStats(stats, pickPuzzle(puzzles, null).num);

  const REC_KEY = `sot_hearsay_rec_${PUZZLE.num}`;
  const abandon = useAbandonFlush(() => {
    const acted = g.crossed.length > 0 || g.wrong.length > 0;
    if (!acted || g.status !== 'playing') return null;
    try { if (localStorage.getItem(REC_KEY)) return null; } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - (g.t0 || Date.now())) / 1000)));
    try { localStorage.setItem(REC_KEY, '1'); } catch (e) {}
    return { quizId: PUZZLE.quizId, score: 0, total: TOTAL, correct: 0, guessesUsed: g.wrong.length, timeElapsed: el, abandoned: true, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') };
  });

  function postResult(g2, sc) {
    abandon.markFlushed();
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: g2.wrong.length, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: g2.wrong.length, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function startRun() {
    setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {}
  }

  function tapCard(i) {
    if (!playing) return;
    if (g.naming) { nameCard(i); return; }
    setG((cur) => ({
      ...cur,
      crossed: cur.crossed.includes(i) ? cur.crossed.filter((x) => x !== i) : [...cur.crossed, i],
      t0: cur.t0 || Date.now(),
    }));
  }
  function clearCrossed() {
    if (!playing) return;
    setG((cur) => ({ ...cur, crossed: [] }));
  }

  function nameCard(i) {
    if (!playing) return;
    if (g.wrong.includes(i)) { say('You already ruled that one out.'); return; }
    if (i === ANSWER) {
      const g2 = { ...g, status: 'done', naming: false, tEnd: Date.now(), t0: g.t0 || Date.now() };
      setG(g2);
      setVerdict(null);
      setEndClosed(false);
      postResult(g2, Math.max(1, TOTAL - 3 * g2.wrong.length));
    } else {
      const c = PUZZLE.cards[i];
      setG((cur) => ({ ...cur, wrong: [...cur.wrong, i], t0: cur.t0 || Date.now() }));
      setVerdict({ msg: `Not ${c.a}, ${c.b}. Somebody's line rules that one out. (−3)` });
    }
  }

  function reveal() {
    if (!playing) return;
    setG((cur) => {
      const g2 = { ...cur, status: 'lost', naming: false, tEnd: Date.now(), t0: cur.t0 || Date.now() };
      postResult(g2, 0);
      return g2;
    });
    setVerdict(null);
    setEndClosed(false);
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setVerdict(null); setEndClosed(false);
  }

  // cards grouped by the first attribute, which is how a shortlist like this
  // reads on paper
  const groups = useMemo(() => {
    const out = [];
    for (let i = 0; i < PUZZLE.cards.length; i++) {
      const c = PUZZLE.cards[i];
      let grp = out.find((x) => x.a === c.a);
      if (!grp) { grp = { a: c.a, items: [] }; out.push(grp); }
      grp.items.push(i);
    }
    return out;
  }, [PUZZLE]);

  const ans = PUZZLE.cards[ANSWER] || PUZZLE.cards[0];
  const ansText = `${ans.a}, ${ans.b}${ans.c ? `, ${ans.c}` : ''}`;

  // How to play. The old version buried the whole trick ("ignorance is the
  // evidence") in the middle of a paragraph, so the rules now state the goal,
  // show who knows what, and teach the trick with this board's own words.
  const rulesBody = (
    <DailyRules
      accent={COLORS.accent} accentSoft={COLORS.accentSoft} accentDeep={COLORS.accentDeep}
      lead={`Work out which ${PUZZLE.noun} is the secret one.`}
      chips={PUZZLE.who.map((w, i) => ({
        label: `${w} knows the ${PUZZLE.attrs[i]}`,
        style: { border: '1.5px solid rgba(124,45,146,0.4)' },
      }))}
      steps={[
        <>Each of them knows <b>only</b> that one detail. Nobody lies.</>,
        <>They speak in turn, and every line narrows the list.</>,
        <>Tap cards to cross them off as you rule them out.</>,
        <>Hit <b>Name the {PUZZLE.noun}</b> and pick the last one standing.</>,
      ]}
      knack={<>&ldquo;I don&rsquo;t know&rdquo; is the evidence. If the secret {PUZZLE.noun} were the only one with its {PUZZLE.attrs[0]}, {PUZZLE.who[0]} would have known straight away. {PUZZLE.who[0]} did not, so every {PUZZLE.attrs[0]} that appears just once is out. A line said <i>later</i> is sharper still: &ldquo;I still don&rsquo;t know&rdquo; is about the list as it stands after everything already said.</>}
      footer="12 points for a first-time pick, 3 off for each wrong name. Exactly one card survives every line."
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: T.surface, position: 'relative' }}>
      <Grain />
      {/* Shared daily chrome (app/DailyChrome.jsx): home masthead + stat bar +
          today's slate rail, collapsing to one line once the clock runs. Outside
          the page wrapper so the bands run full bleed; nothing here is pinned. */}
      <DailyChrome slug="hearsay" name="Hearsay" collapsed={started} />
      <div className="hs-wrap" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 38px 80px', fontFamily: SANS }}>
        <style>{`
          @media(max-width:560px){.hs-wrap{padding-left:12px !important;padding-right:12px !important;}}
          .hs-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid var(--blue-deep);background:var(--white);color:var(--blue-deep);border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .hs-btn:hover{background:var(--accent-soft);}
          .hs-row{display:flex;align-items:center;gap:10px;background:var(--white);border:1px solid rgba(28,30,36,0.14);border-left:3px solid ${COLORS.accent};border-radius:9px;padding:9px 12px;margin-bottom:7px;flex-wrap:wrap;}
          .hs-key{font-family:${MONO};font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.accentDeep};flex:0 0 auto;min-width:86px;}
          .hs-card{font-family:${SANS};font-weight:800;font-size:13px;border-radius:8px;padding:8px 11px;cursor:pointer;border:1.5px solid rgba(28,30,36,0.2);background:${COLORS.cream};color:${COLORS.ink};}
          .hs-card:hover:not(:disabled){border-color:${COLORS.accent};}
          .hs-card.off{opacity:0.4;text-decoration:line-through;}
          .hs-card.wrong{background:#fee2e2;border-color:#b91c1c;color:#7f1d1d;text-decoration:line-through;}
          .hs-card.win{background:${COLORS.greenSoft};border-color:${COLORS.green};color:#14532d;}
          .hs-card:disabled{cursor:default;}
          .hs-say{display:flex;align-items:flex-start;gap:11px;background:var(--white);border:1px solid rgba(28,30,36,0.14);border-radius:9px;padding:11px 13px;margin-bottom:7px;}
          .hs-num{flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:${COLORS.accent};color:var(--white);font-family:${MONO};font-size:12px;font-weight:500;display:flex;align-items:center;justify-content:center;}
        `}</style>

        <div style={{ maxWidth: 760, margin: '0 auto' }}>


        <DailyMasthead
          slug="hearsay"
          num={PUZZLE.num}
          dateLabel={PUZZLE.dateLabel}
          accent={COLORS.accent}
          blockGap={4}
          helpTop={8}
          onHelp={() => setShowHelp(true)}
          sunday={PUZZLE.sunday ? (
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: T.white, background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday Edition &middot; Three Voices</span>
          ) : null}
          blocks={'HEARSAY'.split('').map((ch, i) => (
            <div key={i} style={{ width: 34, height: 40, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 20, background: i === 0 ? COLORS.accent : COLORS.ink, color: T.white, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.65)' }}>{ch}</div>
          ))}
        />

        {!preStart && (
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14.5, lineHeight: 1.6, background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderLeft: `4px solid ${COLORS.accent}`, borderRadius: 8, padding: '12px 16px', margin: '0 0 12px', color: COLORS.ink }}>
          One {PUZZLE.noun} on {PUZZLE.listLabel} is the secret one. {PUZZLE.who.map((w, i) => (
            <span key={w}><b style={{ fontStyle: 'normal' }}>{w}</b> has been told only its {PUZZLE.attrs[i]}{i === PUZZLE.who.length - 1 ? '. ' : i === PUZZLE.who.length - 2 ? ', and ' : ', '}</span>
          ))}
          Nobody lies, and everybody hears everything said.
        </div>
        )}

        {started && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.faded }}>
          <span>on the list <b style={{ color: COLORS.ink, fontWeight: 500 }}>{PUZZLE.cards.length}</b></span>
          <span>crossed off <b style={{ color: COLORS.ink, fontWeight: 500 }}>{g.crossed.length}</b></span>
          <span>on the board <b style={{ color: g.wrong.length ? COLORS.rust : COLORS.green, fontWeight: 500 }}>{liveScore}</b>/{TOTAL}</span>
          {g.wrong.length > 0 && <span>wrong names <b style={{ color: COLORS.rust, fontWeight: 500 }}>{g.wrong.length}</b></span>}
        </div>
        )}

        {preStart && (
          <div style={{ background: COLORS.cream, border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '22px 22px', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, marginBottom: 10 }}>{gateRules ? 'How to play' : 'Nobody has spoken yet'}</div>
            {gateRules ? rulesBody : (
              <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
                <p style={{ margin: '0 0 6px' }}>{PUZZLE.cards.length} candidates on {PUZZLE.listLabel}, {PUZZLE.who.length} people who each know one detail, and {PUZZLE.script.length} lines of conversation. The list stays covered until you begin.</p>
              </div>
            )}
            <div style={{ marginTop: 'auto', paddingTop: 18 }}>
              <button className="hs-btn" onClick={startRun} style={{ background: T.cta, color: T.white, fontSize: 15, padding: '11px 22px' }}>Hear them out</button>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={() => setGateRules((v) => !v)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.faded, textDecoration: 'underline' }}>
                  {gateRules ? 'Hide detailed instructions' : 'Show detailed instructions'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!preStart && (
          <>
            <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 8 }}>{PUZZLE.listLabel}</div>
            {groups.map((grp) => (
              <div key={grp.a} className="hs-row">
                <span className="hs-key">{grp.a}</span>
                <span style={{ display: 'flex', gap: 7, flexWrap: 'wrap', flex: '1 1 auto' }}>
                  {grp.items.map((i) => {
                    const c = PUZZLE.cards[i];
                    const isAns = !playing && i === ANSWER;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`hs-card${g.wrong.includes(i) ? ' wrong' : g.crossed.includes(i) ? ' off' : ''}${isAns ? ' win' : ''}`}
                        onClick={() => tapCard(i)}
                        disabled={!playing}
                        title={g.naming ? 'Name this one' : 'Cross it off'}
                      >
                        {c.b}{c.c ? <span style={{ fontWeight: 600, color: COLORS.faded }}> &middot; {c.c}</span> : null}
                      </button>
                    );
                  })}
                </span>
              </div>
            ))}

            <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, margin: '18px 0 8px' }}>What was said</div>
            {PUZZLE.script.map((st, i) => (
              <div key={i} className="hs-say">
                <span className="hs-num">{i + 1}</span>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.5 }}>{statementText(PUZZLE, st)}</span>
              </div>
            ))}
          </>
        )}

        {verdict && (
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.rust, margin: '10px 0 0', lineHeight: 1.45 }}>
            {verdict.msg}
          </div>
        )}

        {started && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0 6px' }}>
            <button
              type="button"
              className="hs-btn"
              onClick={() => setG((cur) => ({ ...cur, naming: !cur.naming }))}
              style={g.naming ? { background: COLORS.accent, borderColor: COLORS.accent, color: T.white } : { background: COLORS.accentSoft, borderColor: 'rgba(124,45,146,0.5)', color: COLORS.accentDeep }}
            >
              <Ear size={14} /> {g.naming ? `Pick the ${PUZZLE.noun}…` : `Name the ${PUZZLE.noun}`}
            </button>
            {g.crossed.length > 0 && <button type="button" className="hs-btn" onClick={clearCrossed}><Eraser size={14} /> Clear cross-outs</button>}
            {g.wrong.length >= 2 && (
              <button type="button" className="hs-btn" style={{ borderColor: '#c3c8cf', color: COLORS.faded }} onClick={reveal}>Reveal (ends the day)</button>
            )}
          </div>
        )}

        {/* result + the line-by-line replay, which is the teaching moment */}
        {!playing && (
          <>
            <div style={{ maxWidth: 472, margin: '14px 0 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: T.white, border: '1.5px solid rgba(28,30,36,0.18)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontFamily: MONO, fontSize: 32, fontWeight: 500, color: won ? COLORS.green : g.status === 'done' ? COLORS.ink : COLORS.rust, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em', flex: '0 0 auto' }}>{score}/{TOTAL}</span>
                <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.45 }}>
                  {g.status === 'done'
                    ? (won ? <>It was <b>{ansText}</b>, named first time.</> : <>It was <b>{ansText}</b>, after {g.wrong.length} wrong name{g.wrong.length === 1 ? '' : 's'}.</>)
                    : <>It was <b>{ansText}</b> all along.</>}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
            </div>
            <div style={{ background: T.white, border: '1px solid rgba(28,30,36,0.14)', borderRadius: 10, padding: '12px 14px', margin: '0 0 12px', maxWidth: 472 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.faded, marginBottom: 8 }}>How the list collapsed</div>
              {PUZZLE.script.map((st, i) => (
                <div key={i} style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.5, marginBottom: 4 }}>
                  <b>{speakerOf(PUZZLE, st.who)}</b> ({attrOf(PUZZLE, st.who)}): {STEPS[i].before.length} &rarr; <b>{STEPS[i].after.length}</b>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>
              {isTodays ? (
                <>
                  {countdown ? <>A new case is heard in <b style={{ color: COLORS.ink, fontVariantNumeric: 'tabular-nums' }}>{countdown}</b>.</> : 'A new case is heard at midnight Eastern.'}
                  {prevPuzzle && (
                    <>
                      {' '}Meanwhile:{' '}
                      <a href={`/hearsay?p=${prevPuzzle.num}`} style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>
                        yesterday&rsquo;s case &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <>
                  You&rsquo;re playing the {PUZZLE.dateLabel.replace(', 2026', '')} archive.{' '}
                  <a href="/hearsay" style={{ color: COLORS.ember, fontWeight: 800, textDecoration: 'underline' }}>Back to today&rsquo;s case &rarr;</a>
                  {' · '}
                  <a href="/daily" style={{ color: COLORS.faded, fontWeight: 700, textDecoration: 'underline' }}>All daily puzzles</a>
                </>
              )}
            </p>
          </>
        )}

        {focusMode && (
          <div style={{ maxWidth: 640, margin: '30px auto 0', textAlign: 'center' }}>
            <button className="loft-showchrome" onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: T.blueDeep, background: 'none', border: '1.5px solid var(--accent-border)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show overview and more</button>
            <div style={{ fontFamily: SANS, fontSize: 11, color: COLORS.faded, fontWeight: 600, marginTop: 8 }}>Leaderboards, share for credit &amp; the other daily puzzles</div>
          </div>
        )}
        <div style={{ display: focusMode ? 'none' : 'block', margin: '30px auto 0', maxWidth: 640 }}>
          <DailyGamesGrid replay={!playing ? resetGame : null}
            self="hearsay"
            maxWidth={640}
            challengeHref={`/duel/new?quiz=${encodeURIComponent(PUZZLE.quizId)}`}
            share={{ label: copied ? 'Copied' : 'Share', onClick: copyShare }}
            light
            boardSlot={<DailyBoardPanel self="hearsay" quizId={PUZZLE.quizId} maxWidth={640} streak={{ current: myStats.cur, best: myStats.max }} />}
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
              <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.ink, marginBottom: 8 }}>Add Hearsay to your Home Screen</div>
              {isIosDevice() ? (
                <ol style={{ margin: '0 0 4px', paddingLeft: 20, color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  <li>Tap the <b>Share</b> button in Safari&apos;s toolbar.</li>
                  <li>Scroll down and tap <b>Add to Home Screen</b>.</li>
                  <li>Tap <b>Add</b> &mdash; the tile opens today&apos;s case, every day.</li>
                </ol>
              ) : (
                <p style={{ margin: '0 0 4px', color: COLORS.ink, fontSize: 14, lineHeight: 1.7 }}>
                  Open your browser&apos;s menu and choose <b>Add to Home Screen</b> (or <b>Install app</b>). The tile opens today&apos;s case, every day.
                </p>
              )}
              <button onClick={() => setShowA2hsHelp(false)} style={{ marginTop: 10, fontFamily: SANS, fontSize: 12.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700, height: 44, width: '100%', borderRadius: 10, border: 'none', background: COLORS.ink, color: T.white, cursor: 'pointer' }}>Got it</button>
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
        <DailyEndCard
          modal
          self="hearsay"
          won={won}
          completed={g.status === 'done'}
          headline={g.status === 'done' ? <>Named from what they didn&rsquo;t know</> : <>The room kept its secret</>}
          subline={<>Hearsay #{PUZZLE.num} &middot; {score}/{TOTAL} &middot; {g.wrong.length} wrong name{g.wrong.length === 1 ? '' : 's'} &middot; {elapsed}</>}
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
            <button className="hs-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: T.white }}>Play</button>
          </div>
        </div>
      )}

      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Hearsay</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Hearsay is a free daily logic puzzle from Mind Loft, in the family made famous by Cheryl&rsquo;s Birthday. A shortlist of candidates is public. Two people (three on Sundays) are each told one detail of the secret entry and nothing more, and then they talk. Your job is to work out which entry they are circling.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          The trick that makes it click is that ignorance carries information. When someone says they cannot work it out, every candidate that would have handed them the answer is gone. When someone says they now can, the survivors that stayed ambiguous fall away. Each line cuts the list, and exactly one entry lives through all of them.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new case is heard every day at midnight Eastern, with a third voice on Sundays. No app, no signup, play free in your browser, keep a streak and race the daily leaderboard. More dailies: <a href="/axiom" style={{ color: COLORS.ink, fontWeight: 800 }}>Axiom</a>, our hidden-rule puzzle, <a href="/sworn" style={{ color: COLORS.ink, fontWeight: 800 }}>Sworn</a>, our daily liars puzzle, and <a href="/alibi" style={{ color: COLORS.ink, fontWeight: 800 }}>Alibi</a>, our nightly whodunit.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );

  function copyShare() {
    const streakBit = isTodays && myStats.cur >= 2 && g.status !== 'playing' ? ` · streak ${myStats.cur}` : '';
    const solvedBit = g.status === 'done'
      ? (won ? `\u{1F5E3}\u{FE0F} Named it first time in ${elapsed}` : `\u{1F5E3}\u{FE0F} Named it in ${elapsed} · ${g.wrong.length} wrong name${g.wrong.length === 1 ? '' : 's'}`)
      : g.status === 'lost' ? '\u{1F5E3}\u{FE0F} The room kept its secret' : '\u{1F5E3}\u{FE0F} Still listening…';
    const text = playing
      ? `Hearsay #${PUZZLE.num} — the daily puzzle of what other people don't know, from Mind Loft.\n${withRef(`mindloftdaily.com/hearsay${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`
      : `Hearsay — Case #${PUZZLE.num}\n${solvedBit}${streakBit}\n${withRef(`mindloftdaily.com/hearsay${isTodays ? '' : `?p=${PUZZLE.num}`}`)}`;
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
}
