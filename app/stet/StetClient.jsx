'use client';

// Stet — the daily copy-desk game.
//
// One news brief a day: five sentences (seven on Sundays), each hiding exactly
// ONE wrong word — a real word, so a spellchecker sails past it. Tap the word
// you think is wrong, type the one-word fix, and lock the sentence in. Two
// points per sentence: one for finding the word, one for fixing it. You can
// change your selection freely until you submit the fix — submitting locks it.
// "Stet" is the proofreader's mark for "let it stand"; here, nothing stands.
//
// Same daily plumbing as Circa/Suds/Tally: banked briefs gated by Eastern date
// on the server (app/stet/page.js), per-puzzle localStorage saves, /stet?p=N
// archive pinning, streaks + stats, and the shared /api/quiz/* board flow.
// Sundays are a longer brief with trickier, more contested errors.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { HelpCircle, Share2, X, Smartphone, Check, Pencil } from 'lucide-react';
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
    v: 1,
    sub: {},                    // itemIdx -> { pick, fix, gotWord, gotFix }
    status: 'playing',          // playing | done
    t0: null,
    tEnd: null,
  };
}

export default function StetClient({ puzzles = [], forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(puzzles, forceNum), [puzzles, forceNum]);
  const ITEMS = PUZZLE.items;
  const TOTAL = ITEMS.length * 2;
  const STORE_KEY = `sot_stet_${PUZZLE.num}`;

  const [g, setG] = useState(freshState);
  const [sel, setSel] = useState(null);       // { item, tok } — the armed pick (pre-submit)
  const [fixVal, setFixVal] = useState('');
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
  // index of the true wrong token per item
  const WRONG_TOK = useMemo(
    () => ITEMS.map((it, i) => TOKS[i].findIndex((t) => t.isWord && stripTok(t.raw) === it.wrong.toLowerCase())),
    [ITEMS, TOKS]
  );

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
        if (saved && saved.v === 1 && saved.sub) {
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

  const ptsOf = (sub) => (sub ? (sub.gotWord ? 1 : 0) + (sub.gotFix ? 1 : 0) : 0);
  const score = Object.values(g.sub).reduce((s, x) => s + ptsOf(x), 0);
  const misses = Object.values(g.sub).filter((x) => !x.gotWord).length;
  const perfect = g.status === 'done' && score === TOTAL;

  function postResult(g2, sc, ms) {
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try { setStats(recordStat(PUZZLE.num, { s: sc, t: TOTAL, g: ms, won: sc === TOTAL })); } catch (e) {}
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        // guessesUsed = sentences where the wrong word was mis-picked, so the
        // daily board (score, then guesses, then time) breaks ties by sharper eyes.
        body: JSON.stringify({ quizId: PUZZLE.quizId, score: sc, total: TOTAL, correct: sc === TOTAL ? 1 : 0, guessesUsed: ms, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function tapWord(itemIdx, tokIdx) {
    if (!playing || g.sub[itemIdx]) return;
    if (!g.t0) setG((cur) => (cur.t0 ? cur : { ...cur, t0: Date.now() }));
    if (sel && sel.item === itemIdx && sel.tok === tokIdx) { setSel(null); setFixVal(''); return; }
    setSel({ item: itemIdx, tok: tokIdx });
    setFixVal('');
    setTimeout(() => { try { fixRef.current && fixRef.current.focus(); } catch (e) {} }, 30);
  }

  function submitFix() {
    if (!playing || !sel) return;
    const it = ITEMS[sel.item];
    const fixTyped = normFix(fixVal);
    if (!fixTyped) { say('Type the replacement word first.'); return; }
    const gotWord = sel.tok === WRONG_TOK[sel.item];
    const accepted = [it.fix, ...(it.alts || [])].map(normFix);
    const gotFix = gotWord && accepted.includes(fixTyped);
    const sub = { pick: sel.tok, fix: fixVal.trim(), gotWord, gotFix };
    const nextSub = { ...g.sub, [sel.item]: sub };
    const g2 = { ...g, sub: nextSub };
    if (!g2.t0) g2.t0 = Date.now();
    const done = Object.keys(nextSub).length >= ITEMS.length;
    if (done) {
      g2.status = 'done';
      g2.tEnd = Date.now();
      const sc = Object.values(nextSub).reduce((s, x) => s + ptsOf(x), 0);
      const ms = Object.values(nextSub).filter((x) => !x.gotWord).length;
      postResult(g2, sc, ms);
    }
    setG(g2);
    setSel(null);
    setFixVal('');
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState()); setSel(null); setFixVal(''); setEndClosed(false);
  }

  function shareText() {
    const squares = ITEMS.map((_, i) => {
      const p = ptsOf(g.sub[i]);
      return p === 2 ? '\u{1F7E6}' : p === 1 ? '\u{1F7E8}' : '⬜';
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
    const armed = sel && sel.item === i ? sel.tok : null;
    const pts = ptsOf(sub);
    return (
      <div key={i} style={{ background: '#fff', border: `1.5px solid ${sub ? (pts === 2 ? 'rgba(21,128,61,0.5)' : pts === 1 ? 'rgba(202,138,4,0.5)' : 'rgba(192,57,43,0.5)') : 'rgba(28,30,36,0.2)'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.faded, flex: '0 0 auto' }}>{i + 1}</span>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 16.5, fontWeight: 600, lineHeight: 1.65, color: COLORS.ink }}>
            {TOKS[i].map((t, j) => {
              if (!t.isWord) return <span key={j}>{t.raw}</span>;
              if (!sub) {
                const isArmed = armed === j;
                return (
                  <span
                    key={j}
                    role="button"
                    tabIndex={0}
                    onClick={() => tapWord(i, j)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapWord(i, j); } }}
                    className={`st-w${isArmed ? ' st-w-on' : ''}`}
                  >{t.raw}</span>
                );
              }
              // scored render: strike the TRUE wrong word, insert the fix after it
              if (j === WRONG_TOK[i]) {
                const trail = t.raw.slice(t.raw.toLowerCase().indexOf(it.wrong.toLowerCase()) + it.wrong.length);
                return (
                  <span key={j}>
                    <s style={{ color: sub.gotWord ? COLORS.accent : COLORS.rust, textDecorationThickness: 2 }}>{it.wrong}</s>
                    {' '}<b style={{ color: COLORS.green }}>{it.fix}</b>{trail}
                  </span>
                );
              }
              const wasPick = !sub.gotWord && j === sub.pick;
              return <span key={j} style={wasPick ? { background: '#fdeeee', borderRadius: 3, boxShadow: '0 0 0 2px #fdeeee' } : undefined}>{t.raw}</span>;
            })}
          </p>
          {sub && (
            <span style={{ marginLeft: 'auto', flex: '0 0 auto', fontFamily: MONO, fontSize: 11, fontWeight: 500, color: pts === 2 ? COLORS.green : pts === 1 ? '#a16207' : COLORS.rust }}>
              +{pts}
            </span>
          )}
        </div>
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
              <button className="st-go" onClick={submitFix}>Fix it</button>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, color: COLORS.faded, marginTop: 6 }}>
              Tap a different word to change your pick — submitting locks this sentence.
            </div>
          </div>
        )}
        {sub && (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(28,30,36,0.14)', fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: COLORS.faded, lineHeight: 1.5 }}>
            {!sub.gotWord && <>You flagged &ldquo;{stripTok(TOKS[i][sub.pick].raw)}&rdquo; — the error was <b style={{ color: COLORS.ink }}>{it.wrong}</b>. </>}
            {sub.gotWord && !sub.gotFix && <>Right word, but the fix is <b style={{ color: COLORS.ink }}>{it.fix}</b>, not &ldquo;{sub.fix}&rdquo;. </>}
            {it.note}
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
          .st-inp{font-family:${SANS};font-weight:700;font-size:16px;flex:1 1 auto;min-width:0;border:2px solid ${COLORS.ink};border-radius:9px;padding:9px 12px;background:#fff;color:${COLORS.ink};outline:none;}
          .st-inp:focus{border-color:${COLORS.accent};box-shadow:0 0 0 3px rgba(3,105,161,0.16);}
          .st-go{font-family:${SANS};font-weight:800;font-size:13.5px;letter-spacing:0.04em;text-transform:uppercase;border:2px solid ${COLORS.accent};background:${COLORS.accent};color:#fff;border-radius:9px;padding:0 18px;cursor:pointer;}
          .st-go:active{transform:translateY(1px);}
          @media(max-width:560px){.st-ttl{flex-direction:column;align-items:flex-start;gap:1px;}.st-ttl h1{font-size:21px;letter-spacing:0.02em;}.st-ttl .st-ttl-dt{font-size:15px;}.st-ttl-dot{display:none;}}
        `}</style>

        <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ display: focusMode ? 'none' : 'block' }}><DailyTopNav player={player} compact={playing} /></div>

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
            {PUZZLE.sunday && <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: '#fff', background: COLORS.accent, borderRadius: 4, padding: '2px 6px' }}>Sunday &middot; Seven errors</span>}
          </div>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" title="How to play" style={{ position: 'absolute', top: 13, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, padding: 0, display: 'flex' }}>
            <HelpCircle size={20} />
          </button>
        </div>

        {/* the brief */}
        <div style={{ background: PAPER, border: `2px solid ${COLORS.ink}`, borderRadius: 10, padding: '15px 17px 12px', boxShadow: '5px 5px 0 rgba(28,30,36,0.16)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: COLORS.faded, borderBottom: '1px solid rgba(28,30,36,0.18)', paddingBottom: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}><Pencil size={12} /> one wrong word per sentence</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>fixed <b style={{ color: COLORS.ink, fontWeight: 500 }}>{solvedCount}</b>/{ITEMS.length}</span>
          </div>
          {ITEMS.map((_, i) => renderSentence(i))}
          {playing && (
            <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: COLORS.faded, margin: '2px 2px 6px' }}>
              Tap the word that doesn&rsquo;t belong. Every error is a real word — no typos, no spellcheck help.
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
                  {perfect ? 'A clean desk — every error found and fixed.' : misses === 0 ? 'Every error found — a fix or two got away.' : `${ITEMS.length - misses} of ${ITEMS.length} errors found.`}
                  {' '}<span style={{ color: COLORS.faded, fontWeight: 600 }}>{elapsed}</span>
                </span>
              </div>
              {PUZZLE.sunday && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.faded, fontStyle: 'italic', margin: '8px 0 0' }}>The Sunday Edition — seven errors, and the desk splits hairs.</div>
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
            <button onClick={() => setShowChrome(true)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, letterSpacing: '0.03em', color: COLORS.ink, background: 'none', border: '1.5px solid rgba(28,30,36,0.28)', borderRadius: 9, padding: '10px 20px', cursor: 'pointer' }}>Show navigation &amp; more</button>
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
          headline={<>{Math.round((score / TOTAL) * 100)}% Complete</>}
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
              <p style={{ margin: '0 0 9px' }}>You&rsquo;re the copy desk. Today&rsquo;s brief has {ITEMS.length} sentences, and every one hides <b>exactly one wrong word</b> &mdash; a real word, so spellcheck is no help. Think &ldquo;free reign&rdquo;, &ldquo;baited breath&rdquo;, &ldquo;mute point&rdquo;.</p>
              <p style={{ margin: '0 0 9px' }}><b>Tap the word</b> you think is wrong, then <b>type the fix</b>. You can move your pick around until you submit &mdash; submitting locks the sentence and scores it.</p>
              <p style={{ margin: '0 0 9px' }}>Each sentence is worth <b>2 points</b>: one for flagging the right word, one for the correct fix. {TOTAL} points is a clean desk.</p>
              <p style={{ margin: 0 }}>Ties on the daily board break by fewest mis-flagged words, then fastest time. Sundays run seven sentences, and the calls get finer.</p>
            </div>
            <button className="st-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      {/* About Stet — crawlable prose for search, server-rendered into the HTML */}
      <section style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2, maxWidth: 640, margin: '0 auto', padding: '10px 24px 42px', fontFamily: SANS }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: COLORS.ink }}>About Stet</h2>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Stet is a free daily word game from Source of Truths &mdash; the copy-desk game. Each day serves up a short news brief where every sentence hides exactly one wrong word: an eggcorn, a swapped homophone, a malaprop. The catch is that every error is a real English word, so a spellchecker would wave the whole brief through. Only a sharp eye catches &ldquo;free reign&rdquo;, &ldquo;baited breath&rdquo;, or a report that &ldquo;peaked&rdquo; someone&rsquo;s interest.
        </p>
        <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          Tap the word that doesn&rsquo;t belong, type the correction, and lock it in &mdash; a point for finding each error and a point for fixing it. Miss the word and the desk shows you what you should have caught, with a one-line note on why. The name is the proofreader&rsquo;s mark: <i>stet</i>, Latin for &ldquo;let it stand.&rdquo; Here, nothing stands.
        </p>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: COLORS.faded, fontWeight: 600 }}>
          A new brief lands every day at midnight Eastern, with a seven-sentence edition on Sundays. No app, no signup &mdash; play free in your browser, keep a streak, and race the daily leaderboard. More dailies: <a href="/crux" style={{ color: COLORS.ink, fontWeight: 800 }}>Crux</a>, our clueless crossword, <a href="/garble" style={{ color: COLORS.ink, fontWeight: 800 }}>Garble</a>, our unscrambling game, and <a href="/extra" style={{ color: COLORS.ink, fontWeight: 800 }}>Extra</a>, our front-page history game.
        </p>
      </section>

      <div style={{ display: focusMode ? 'none' : 'block', position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
