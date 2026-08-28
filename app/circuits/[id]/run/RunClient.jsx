'use client';

// THE RUN — a circuit played as ONE LONG QUIZ.
//
// Every game in a runnable circuit is the same shape: a bank of four-choice
// questions in play order, twenty seconds each, one life. Played on their own
// pages that is five games with five start gates, five end cards and four page
// navigations between them. Played here it is one board: you answer, you are
// told in a line when a quiz has ended for you, and the next quiz starts on its
// own. Nothing is skipped and nothing is merged. It is the same five quizzes in
// the same order, with the furniture between them taken out.
//
// WHAT THIS IS NOT: a new game. It files exactly the rows the five clients
// file, one ordinary /api/quiz/result per section, with that section's own
// quizId, score, total, guesses and clock. So every per-game leaderboard, the
// circuit board, IQ Points, trophies, the archive and the slate all see a
// player who played those five games, because they did. There is no run row,
// no run table and no run scoring. The combined placement is computed the way
// it always was, by /api/quiz/daily-combined?circuit=<id>.
//
// THE SECTION CLOCK IS PER SECTION, NOT THE RUN. Each game posts the time from
// its own first question to its own last, so a run player's time is comparable
// with a solo player's on that game's board. The run's total clock is a display
// figure on the scorecard and is posted nowhere.
//
// A GAME ALREADY PLAYED TODAY IS BANKED, NOT REPLAYED. The daily board keeps a
// player's first attempt, so re-serving a game they already finished this
// morning could only produce a row that does not count and a score the board
// ignores. Those sections are marked banked at the start, their recorded score
// is read out of that game's own local stats, and the run steps over them.
//
// EVERY LOCAL WRITE THE SOLO CLIENT MAKES IS MADE HERE TOO, in finishSection:
// the per-puzzle save, the day breadcrumb, the write-once stats record and the
// abandon-dedupe key. Miss any one of them and the slate shows a game as
// unplayed that the server has a row for, which is the failure this file has to
// avoid rather than the one it is likely to notice.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowRight, Pause, Play, Home, Share2, Check } from 'lucide-react';
import Grain from '../../../Grain';
import Footer from '../../../Footer';
import DailyChrome from '../../../DailyChrome';
import LoftCap from '../../../LoftCap';
import useAbandonFlush from '../../../quiz/[id]/useAbandonFlush';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../../../ShareCreditPop';
import { runSummaryHref, circuitShareUrl } from '@/lib/circuits';
import { T } from '@/lib/theme';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";

const Q_SECONDS = 20;        // the same clock all five games run
const VERDICT_MS = 4200;     // how long a section verdict holds before the next starts
const RIGHT_MS = 420;        // the green flash between questions, as in the solo clients

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
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
function readJson(k) {
  try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
}
function writeJson(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}

// The write-once local stats record each solo client keeps, by that client's
// own key. Write-once per puzzle number is the rule there and the rule here:
// the first completed attempt is what the streak and the board keep.
function recordStatFor(gameKey, num, entry) {
  const K = `sot_${gameKey}_stats`;
  let s = readJson(K);
  if (!s || s.v !== 1 || !s.rec) s = { v: 1, rec: {} };
  if (s.rec[num]) return s.rec[num];
  writeJson(K, { ...s, rec: { ...s.rec, [num]: entry } });
  return entry;
}
function statFor(gameKey, num) {
  const s = readJson(`sot_${gameKey}_stats`);
  return (s && s.rec && s.rec[num]) || null;
}

// Has this game already been finished today, outside the run? The per-puzzle
// save is the authority, exactly as it is for the game's own page: a status
// other than 'playing' means the day is over for it.
function alreadyDone(gameKey, num) {
  const sv = readJson(`sot_${gameKey}_${num}`);
  return !!(sv && sv.status && sv.status !== 'playing');
}

// A SECTION IS AN ORDINARY PLAY OF THAT GAME, so it owes that game's view as
// well as its result (owner, 2026-08-27). Each solo client posts one view per
// page load; the run posts one per section, when the section actually starts.
// Without it a game's plays figure counts the run and its views does not, and
// the two disagree for no reason a reader could ever work out. A section never
// reached is never viewed, which is the same rule a page load follows.
function pingView(quizId) {
  try {
    fetch('/api/quiz/view', {
      method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId }),
    }).catch(() => {});
  } catch (e) {}
}

const HAPT = { ok: [7], wrong: [0, 26, 34, 26], win: [10, 40, 20, 40, 20, 60] };
function vibrate(p) { try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

const freshRun = () => ({ v: 1, si: 0, i: 0, t0: null, sT0: null, phase: 'idle', results: [] });

export default function RunClient({ circuitId, circuitName, dateLabel, sections = [] }) {
  const N = sections.length;
  const STORE_KEY = `sot_run_${circuitId}_${etToday()}`;

  const [r, setR] = useState(() => freshRun());
  const rRef = useRef(r);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [qStart, setQStart] = useState(null);
  const [lock, setLock] = useState(false);
  const [hold, setHold] = useState(false);
  const [resumes, setResumes] = useState(0);
  const [identity, setIdentity] = useState(null);
  const [copied, setCopied] = useState(false);
  const lockRef = useRef(false);
  const holdRef = useRef(false);

  useEffect(() => { rRef.current = r; }, [r]);
  useEffect(() => { lockRef.current = lock; }, [lock]);
  useEffect(() => { holdRef.current = hold; }, [hold]);

  const sec = sections[r.si] || null;
  const question = r.phase === 'playing' && sec && r.i < sec.questions.length ? sec.questions[r.i] : null;
  const done = r.phase === 'done';

  // ── hydration ────────────────────────────────────────────────────────────
  // Restores a run in progress, and on a fresh one marks every game already
  // finished today as banked so the run steps over it rather than serving a
  // second attempt the board would ignore.
  useEffect(() => {
    const saved = readJson(STORE_KEY);
    if (saved && saved.v === 1 && Array.isArray(saved.results)) {
      const next = { ...freshRun(), ...saved };
      rRef.current = next;
      setR(next);
      if (next.phase === 'playing') setQStart(Date.now());
    } else {
      const banked = [];
      for (const s of sections) {
        if (!alreadyDone(s.key, s.num)) break;
        const st = statFor(s.key, s.num);
        banked.push({ key: s.key, score: st ? st.s : 0, total: s.questions.length, status: 'banked', secs: 0 });
      }
      if (banked.length) {
        const next = { ...freshRun(), si: banked.length, results: banked };
        rRef.current = next;
        setR(next);
      }
    }
    try {
      const id = readJson('sot_quiz_identity');
      if (id && id.email) setIdentity(id);
    } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(STORE_KEY, r);
  }, [r, hydrated, STORE_KEY]);

  // One ticker, and only while a question is actually on screen.
  useEffect(() => {
    if (r.phase !== 'playing' || !qStart) return;
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, [r.phase, qStart]);

  const remainMs = qStart ? Math.max(0, Q_SECONDS * 1000 - (now - qStart)) : Q_SECONDS * 1000;
  const remainFrac = remainMs / (Q_SECONDS * 1000);

  useEffect(() => {
    if (r.phase !== 'playing' || !qStart || lock) return;
    if (remainMs > 0) return;
    finishSection('lost', { pick: null, timedOut: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainMs, r.phase, qStart, lock]);

  // ── the abandon row ──────────────────────────────────────────────────────
  // Leaving mid-section files the same abandoned row the solo client files, so
  // a walked-away run is a started game rather than a game with no trace. The
  // dedupe key is that game's own, so the section cannot be posted twice.
  const abandon = useAbandonFlush(() => {
    const cur = rRef.current;
    if (cur.phase !== 'playing' || !cur.sT0) return null;
    const s = sections[cur.si];
    if (!s) return null;
    const REC = `sot_${s.key}_rec_${s.num}`;
    try { if (localStorage.getItem(REC)) return null; } catch (e) {}
    try { localStorage.setItem(REC, '1'); } catch (e) {}
    const el = Math.min(36000, Math.max(1, Math.round((Date.now() - cur.sT0) / 1000)));
    return {
      quizId: s.quizId, score: cur.i, total: s.questions.length, correct: cur.i,
      guessesUsed: cur.i, timeElapsed: el, abandoned: true,
      email: identity?.email || undefined, anonId: getAnonId(),
      isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
    };
  });

  function commit(next) { rRef.current = next; setR(next); }

  function startRun() {
    const cur = rRef.current;
    if (cur.t0 || cur.phase !== 'idle') return;
    const t = Date.now();
    commit({ ...cur, t0: t, sT0: t, phase: 'playing', i: 0 });
    if (sections[cur.si]) pingView(sections[cur.si].quizId);
    setQStart(t);
    setNow(t);
  }

  // Everything a finished section owes: the four local writes the solo client
  // makes, then the ordinary result post. Called exactly once per section.
  function finishSection(status, { pick = null, timedOut = false } = {}) {
    const cur = rRef.current;
    const s = sections[cur.si];
    if (!s || cur.phase !== 'playing') return;
    const total = s.questions.length;
    const score = status === 'won' ? total : cur.i;
    const end = Date.now();
    const secs = Math.min(36000, Math.max(1, Math.round((end - (cur.sT0 || end)) / 1000)));

    abandon.markFlushed();
    writeJson(`sot_${s.key}_${s.num}`, { v: 1, i: score, status, t0: cur.sT0, tEnd: end, pick, timedOut });
    writeJson(`sot_${s.key}_day`, { d: etToday(), done: true });
    try { localStorage.setItem(`sot_${s.key}_rec_${s.num}`, '1'); } catch (e) {}
    try { recordStatFor(s.key, s.num, { s: score, t: total, won: status === 'won' }); } catch (e) {}

    try {
      fetch('/api/quiz/result', {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: s.quizId, score, total, correct: score,
          guessesUsed: score + (status === 'lost' ? 1 : 0), timeElapsed: secs,
          email: identity?.email || undefined, anonId: getAnonId(),
          isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : ''),
        }),
      }).catch(() => {});
    } catch (e) {}

    vibrate(status === 'won' ? HAPT.win : HAPT.wrong);
    commit({
      ...cur, phase: 'verdict', i: score,
      results: [...cur.results, { key: s.key, score, total, status, secs }],
    });
    setQStart(null);
    setHold(false);
  }

  // The next section that has not already been played today. A run that finds
  // none is over.
  function nextSection() {
    const cur = rRef.current;
    let j = cur.si + 1;
    const banked = [];
    while (j < N && alreadyDone(sections[j].key, sections[j].num)) {
      const st = statFor(sections[j].key, sections[j].num);
      banked.push({ key: sections[j].key, score: st ? st.s : 0, total: sections[j].questions.length, status: 'banked', secs: 0 });
      j += 1;
    }
    const results = banked.length ? [...cur.results, ...banked] : cur.results;
    if (j >= N) { commit({ ...cur, si: N, phase: 'done', results }); return; }
    const t = Date.now();
    commit({ ...cur, si: j, i: 0, sT0: t, phase: 'playing', results });
    pingView(sections[j].quizId);
    setQStart(t);
    setNow(t);
  }

  // The verdict advances itself. Hold stops the clock, Next now skips the wait.
  useEffect(() => {
    if (r.phase !== 'verdict' || hold) return;
    const t = setTimeout(() => { if (!holdRef.current) nextSection(); }, VERDICT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.phase, r.si, hold]);

  function answer(k) {
    const cur = rRef.current;
    if (cur.phase !== 'playing' || !cur.t0 || lockRef.current) return;
    const s = sections[cur.si];
    const qq = s && s.questions[cur.i];
    if (!qq) return;
    if (k !== qq.correct) { finishSection('lost', { pick: k, timedOut: false }); return; }
    vibrate(HAPT.ok);
    if (cur.i + 1 >= s.questions.length) { finishSection('won'); return; }
    setLock(true);
    lockRef.current = true;
    commit({ ...cur, lastRight: k });
    setTimeout(() => {
      const c2 = rRef.current;
      if (c2.phase !== 'playing') { setLock(false); lockRef.current = false; return; }
      commit({ ...c2, i: c2.i + 1, lastRight: null });
      const t = Date.now();
      setQStart(t);
      setNow(t);
      setLock(false);
      lockRef.current = false;
    }, RIGHT_MS);
  }

  useEffect(() => {
    if (r.phase !== 'playing') return;
    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= 4) answer(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.phase, r.si, r.i, lock]);

  // ── figures ──────────────────────────────────────────────────────────────
  const cleared = r.results.reduce((a, x) => a + x.score, 0);
  const askable = sections.reduce((a, s) => a + s.questions.length, 0);
  // A game banked before the run that was itself run clean is cleared too. It
  // is the same feat whichever surface it happened on, and counting only the
  // sections played here would tell a player who aced Streak this morning that
  // they cleared one fewer than they did.
  const perfect = r.results.filter((x) => x.status === 'won' || (x.status === 'banked' && x.total > 0 && x.score === x.total)).length;
  // The run clock is the sum of the sections actually played, not wall time
  // from the first question: a run held on a verdict, or picked back up after
  // lunch, should not read as an hour. It is a display figure and is posted
  // nowhere; each section posts its own clock.
  const runSecs = r.results.reduce((a, x) => a + x.secs, 0);
  const answeredSoFar = r.results.reduce((a, x) => a + x.score, 0) + (r.phase === 'playing' ? r.i : 0);

  const last = r.results.length ? r.results[r.results.length - 1] : null;
  // Gated on hydration because it reads localStorage, and a render-time read
  // answers differently on the server than on the first client paint.
  const upNext = (() => {
    if (!hydrated) return null;
    let j = r.si + 1;
    while (j < N && alreadyDone(sections[j].key, sections[j].num)) j += 1;
    return j < N ? sections[j] : null;
  })();

  function shareRun() {
    const url = withRef(circuitShareUrl(circuitId));
    const bar = sections.map((s) => {
      const res = r.results.find((x) => x.key === s.key);
      if (!res) return '⬜';
      if (res.status === 'won') return '\u{1F7E9}';
      if (res.status === 'banked') return '\u{1F7E6}';
      return res.score >= Math.ceil(res.total / 2) ? '\u{1F7E8}' : '\u{1F7E5}';
    }).join('');
    const text = [
      `${circuitName} · ${cleared} of ${askable} questions · ${perfect} of ${N} cleared`,
      bar,
      'One long quiz, one life each.',
      url,
    ].join('\n');
    if (notifyShareCredit(text, `https://${circuitShareUrl(circuitId)}`)) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.share && isMobileDevice()) {
        navigator.share({ text }).catch(() => {});
        return;
      }
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {});
    } catch (e) {}
  }

  const tierName = sec && sec.tierNames && sec.tierNames.length
    ? sec.tierNames[Math.min(sec.tierNames.length - 1, Math.floor(r.i / Math.max(1, sec.perTier)))]
    : '';

  // The cap's live figures, in the same vocabulary every daily uses: how far
  // you are into the quiz on screen, the clock, and which quiz of the run this
  // is. It is the run's version of the strip Atlas and Streak carry.
  const capFigures = (() => {
    if (r.phase === 'playing' && sec) return [
      { v: `${r.i}/${sec.questions.length}`, k: 'straight' },
      { v: fmtTime(now - (r.sT0 || now)), k: 'time' },
      { v: `${r.si + 1}/${N}`, k: `quiz · ${sec.name}` },
    ];
    if (done) return [
      { v: `${cleared}/${askable}`, k: 'questions' },
      { v: `${perfect}/${N}`, k: 'cleared' },
      { v: fmtTime(runSecs * 1000), k: 'time' },
    ];
    if (r.phase === 'verdict') return [
      { v: `${cleared}/${askable}`, k: 'questions' },
      { v: `${r.results.length}/${N}`, k: 'quizzes done' },
    ];
    return [
      { v: `${N}`, k: 'quizzes' },
      { v: `${askable}`, k: 'questions' },
    ];
  })();

  return (
    // The daily ground, chrome and cap, so the run reads as one of our pages
    // rather than a page of its own: `loft-page` is what paints the navy, and
    // the rule that does it is injected by LoftCap, so the two go together.
    // DailyChrome sits OUTSIDE the column, like every daily client, so its
    // bands run full bleed. It takes no slug: the run is not one game, and
    // with none the slate rail stays off and the Five bar renders nothing.
    <div className="loft-page rn" style={{ minHeight: '100vh', background: T.surface, position: 'relative', overflowX: 'hidden' }}>
      <Grain />
      <DailyChrome loft />
      <LoftCap
        name={circuitName}
        cat="Trivia"
        dateLabel={done ? (perfect === N ? 'Run cleared' : 'Run complete') : dateLabel}
        outcome={done ? (perfect === N ? 'won' : (cleared > 0 ? 'part' : 'lost')) : null}
        progress={askable ? Math.round((answeredSoFar / askable) * 100) : null}
        figures={capFigures}
      />
      <style>{CSS}</style>

      <div className="rn-wrap">
        {/* The run rail. It is the only thing on screen that persists across
            all five quizzes, which is what makes this read as one sitting. */}
        <div className="rn-rail" style={{ '--n': N }}>
          {sections.map((s, idx) => {
            const res = r.results.find((x) => x.key === s.key);
            const state = res ? (res.status === 'won' ? 'won' : res.status === 'banked' ? 'bank' : 'out')
              : (idx === r.si && r.phase !== 'idle' ? 'now' : '');
            return (
              <div key={s.key} className={`rn-pip ${state}`} style={{ '--acc': s.accent }} title={s.name}>
                <span className="rn-pipn">{s.name}</span>
                <span className="rn-pips">{res ? `${res.score}/${res.total}` : (idx === r.si && r.phase === 'playing' ? `${r.i}/${s.questions.length}` : `${s.questions.length}`)}</span>
              </div>
            );
          })}
        </div>

        {r.phase === 'idle' ? (
          <section className="rn-card rn-gate">
            <span className="rn-eye">One long quiz</span>
            <h1 className="rn-h1">{circuitName}</h1>
            <p className="rn-lead">
              {N} quizzes, {askable} questions, one life in each. Answer wrong or run the clock
              out and that quiz is over for the day, but the run is not: the next one starts on
              its own. Every quiz still counts on its own board.
            </p>
            <ul className="rn-list">
              {sections.map((s) => (
                <li key={s.key} style={{ '--acc': s.accent }}>
                  <b>{s.name}</b>
                  <i>{s.topic ? s.topic : s.tag}</i>
                  <em>{s.questions.length}</em>
                </li>
              ))}
            </ul>
            <button type="button" className="rn-go" onClick={startRun}>
              Start the run<ArrowRight size={17} strokeWidth={2.8} />
            </button>
            <p className="rn-fine">Twenty seconds a question. Keys 1 to 4 answer.</p>
          </section>
        ) : null}

        {r.phase === 'playing' && question ? (
          <section className="rn-card rn-play" style={{ '--acc': sec.accent }}>
            <div className="rn-meta">
              <span className="rn-game">{sec.name}</span>
              {question.cat ? <span className="rn-cat">{question.cat}</span> : null}
              {tierName ? <span className="rn-tier">{tierName}</span> : null}
              <span className="rn-count">{r.i + 1} of {sec.questions.length}</span>
            </div>
            <div className="rn-bar"><span style={{ width: `${remainFrac * 100}%`, background: remainFrac < 0.25 ? T.danger : sec.accent }} /></div>
            <h2 className="rn-q">{question.q}</h2>
            <div className="rn-ch">
              {question.choices.map((c, k) => (
                <button
                  key={k}
                  type="button"
                  className={`rn-c${lock && k === question.correct ? ' ok' : ''}`}
                  onClick={() => answer(k)}
                  disabled={lock}
                >
                  <span className="rn-k">{k + 1}</span>{c}
                </button>
              ))}
            </div>
            <div className="rn-run">
              <span>{answeredSoFar} right in the run</span>
              <span>{fmtTime(Date.now() - r.t0)}</span>
            </div>
          </section>
        ) : null}

        {r.phase === 'verdict' && last ? (
          <section className="rn-card rn-verd" style={{ '--acc': (sections.find((s) => s.key === last.key) || {}).accent }}>
            <span className="rn-eye">{last.status === 'won' ? 'Cleared' : 'Out'}</span>
            <h2 className="rn-vh">
              {last.status === 'won'
                ? `You ran ${(sections.find((s) => s.key === last.key) || {}).name} clean.`
                : `${(sections.find((s) => s.key === last.key) || {}).name} ends at ${last.score} of ${last.total}.`}
            </h2>
            <p className="rn-vs">
              {upNext ? <>Next up is <b>{upNext.name}</b>, {upNext.questions.length} questions.</> : 'That was the last one. Here is how the run went.'}
            </p>
            {/* Keyed on the resume count so the bar RESTARTS with the fresh
                timeout a resume starts. Without the key the CSS animation
                picks up where it paused while the timer runs a full 4.2s
                again, and the bar empties while the card sits there. */}
            <div className={`rn-vbar${hold ? ' held' : ''}`}><span key={resumes} /></div>
            <div className="rn-vacts">
              <button type="button" className="rn-vb pri" onClick={() => { setHold(false); nextSection(); }}>
                {upNext ? 'Next now' : 'See the run'}<ArrowRight size={15} strokeWidth={2.8} />
              </button>
              <button type="button" className="rn-vb" onClick={() => { if (hold) setResumes((k) => k + 1); setHold(!hold); }}>
                {hold ? <><Play size={14} strokeWidth={2.8} />Resume</> : <><Pause size={14} strokeWidth={2.8} />Hold</>}
              </button>
              <a className="rn-vb" href={`/circuits/${circuitId}`}>Leave the run</a>
            </div>
          </section>
        ) : null}

        {done ? (
          <section className="rn-score">
            <div className="rn-sh">
              <span className="rn-eye">{circuitName} {'·'} {dateLabel}</span>
              <h1 className="rn-h1">{perfect === N ? 'You cleared the whole run.' : 'Run complete.'}</h1>
            </div>

            <div className="rn-figs">
              <div className="rn-fig big">
                <b>{cleared}</b><i>of {askable} questions</i>
              </div>
              <div className="rn-fig">
                <b>{perfect}</b><i>of {N} cleared</i>
              </div>
              <div className="rn-fig">
                <b>{fmtTime(runSecs * 1000)}</b><i>on the clock</i>
              </div>
            </div>

            <div className="rn-rows">
              {sections.map((s) => {
                const res = r.results.find((x) => x.key === s.key);
                const sc = res ? res.score : 0;
                const tot = s.questions.length;
                const pct = Math.round((sc / tot) * 100);
                return (
                  <div key={s.key} className={`rn-row${res && res.status === 'won' ? ' won' : ''}`} style={{ '--acc': s.accent }}>
                    <img className="rn-ic" src={`/games/btn-${s.key}.png`} alt="" width={44} height={44} />
                    <div className="rn-rt">
                      <b>{s.name}</b>
                      <i>{res && res.status === 'banked' ? 'played earlier today' : (s.topic || s.tag)}</i>
                    </div>
                    <div className="rn-rb"><span style={{ width: `${pct}%` }} /></div>
                    <div className="rn-rn">{sc}<em>/{tot}</em></div>
                    <div className="rn-rs">{res && res.status === 'won' ? 'clean' : (res && res.secs ? fmtTime(res.secs * 1000) : '')}</div>
                  </div>
                );
              })}
            </div>

            <div className="rn-acts">
              <a className="rn-go" href={runSummaryHref(circuitId)}>
                See the board<ArrowRight size={16} strokeWidth={2.8} />
              </a>
              <button type="button" className="rn-alt" onClick={shareRun}>
                {copied ? <Check size={15} strokeWidth={2.8} /> : <Share2 size={15} strokeWidth={2.8} />}
                {copied ? 'Copied' : 'Share the run'}
              </button>
              <a className="rn-alt" href="/"><Home size={15} strokeWidth={2.8} />Home</a>
            </div>
            <p className="rn-fine">
              Each quiz counted on its own board as you played it. The run board ranks the
              combined placement across all {N}.
            </p>
          </section>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}

const CSS = `
.rn{font-family:'Manrope',system-ui,sans-serif;color:var(--ink,#0b0d12);}
/* The page column carries NO top or bottom padding: on a loft page a rule in
   LoftCap zeroes padding on any direct child whose class ends in "-wrap", so
   the spacing has to be margin. That rule is also why this stays a single
   class: an attribute selector tests the whole string, so a second class here
   would silently stop matching it. */
.rn-wrap{max-width:760px;margin:0 auto;padding:0 16px;}

.rn-rail{display:grid;grid-template-columns:repeat(var(--n,5),1fr);gap:6px;margin:16px 0 14px;}
.rn-pip{border-radius:8px;background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);padding:7px 8px 8px;
  border-top:4px solid var(--border,#e5e7eb);min-width:0;}
.rn-pip.now{border-top-color:var(--acc);box-shadow:0 2px 10px rgba(15,23,42,.10);}
.rn-pip.won{border-top-color:#15803d;background:#f0fdf4;}
.rn-pip.out{border-top-color:#c0392b;}
.rn-pip.bank{opacity:.62;}
.rn-pipn{display:block;font-weight:800;font-size:11.5px;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.45;}
.rn-pips{display:block;font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;color:var(--muted,#3f4757);}

.rn-card{background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);border-radius:14px;padding:20px 18px 18px;}
.rn-eye{display:block;font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;font-weight:800;color:var(--acc,#233a63);margin-bottom:6px;}
.rn-h1{font-size:26px;font-weight:800;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em;}
.rn-lead{font-size:14.5px;line-height:1.55;color:var(--muted,#3f4757);font-weight:600;margin:0 0 14px;}
.rn-fine{font-size:12px;color:var(--muted,#3f4757);font-weight:600;margin:12px 0 0;}

.rn-list{list-style:none;margin:0 0 16px;padding:0;}
.rn-list li{display:flex;align-items:baseline;gap:9px;padding:9px 0 9px 11px;border-top:1px solid var(--border,#e5e7eb);
  border-left:4px solid var(--acc);}
.rn-list li b{font-size:14.5px;font-weight:800;}
.rn-list li i{flex:1;min-width:0;font-style:normal;font-size:12.5px;font-weight:600;color:var(--muted,#3f4757);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-list li em{font-style:normal;font-family:'DM Mono',ui-monospace,monospace;font-size:12px;color:var(--muted,#3f4757);}

.rn-go{display:inline-flex;align-items:center;gap:8px;background:var(--accent,#233a63);color:#fff;border:0;
  border-radius:10px;padding:13px 18px;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer;text-decoration:none;}
.rn-go:hover{filter:brightness(1.08);}

.rn-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.rn-game{font-weight:800;font-size:12.5px;color:var(--acc);}
.rn-cat,.rn-tier{font-family:'DM Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;
  color:var(--muted,#3f4757);background:var(--surface-alt,#eef2f7);border-radius:5px;padding:3px 6px;}
.rn-count{margin-left:auto;font-family:'DM Mono',ui-monospace,monospace;font-size:11.5px;color:var(--muted,#3f4757);}
.rn-bar{height:5px;border-radius:3px;background:var(--surface-alt,#eef2f7);overflow:hidden;margin-bottom:14px;}
.rn-bar span{display:block;height:100%;transition:width .2s linear;}
.rn-q{font-size:20px;line-height:1.35;font-weight:800;margin:0 0 16px;letter-spacing:-.01em;}
.rn-ch{display:grid;gap:8px;}
.rn-c{display:flex;align-items:center;gap:10px;text-align:left;background:var(--surface,#f7f8fa);
  border:1.5px solid var(--border,#e5e7eb);border-radius:10px;padding:13px 14px;font-family:inherit;
  font-size:15px;font-weight:700;color:var(--ink,#0b0d12);cursor:pointer;}
.rn-c:hover:not(:disabled){border-color:var(--acc);background:var(--white,#fff);}
.rn-c:disabled{cursor:default;}
.rn-c.ok{border-color:#15803d;background:#dcfce7;}
.rn-k{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;border-radius:6px;
  background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);font-family:'DM Mono',ui-monospace,monospace;
  font-size:11px;font-weight:700;color:var(--muted,#3f4757);}
.rn-run{display:flex;justify-content:space-between;margin-top:14px;font-family:'DM Mono',ui-monospace,monospace;
  font-size:11.5px;color:var(--muted,#3f4757);}

.rn-verd{border-top:5px solid var(--acc,#233a63);}
.rn-vh{font-size:21px;font-weight:800;line-height:1.3;margin:0 0 6px;letter-spacing:-.01em;}
.rn-vs{font-size:14px;font-weight:600;color:var(--muted,#3f4757);margin:0 0 14px;}
.rn-vbar{height:4px;border-radius:2px;background:var(--surface-alt,#eef2f7);overflow:hidden;margin-bottom:14px;}
.rn-vbar span{display:block;height:100%;background:var(--acc);width:100%;transform-origin:left;
  animation:rnv 4.2s linear forwards;}
.rn-vbar.held span{animation-play-state:paused;}
@keyframes rnv{from{transform:scaleX(1);}to{transform:scaleX(0);}}
@media (prefers-reduced-motion:reduce){.rn-vbar span{animation:none;}}
.rn-vacts{display:flex;gap:8px;flex-wrap:wrap;}
.rn-vb{display:inline-flex;align-items:center;gap:7px;background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);
  border-radius:9px;padding:10px 13px;font-family:inherit;font-weight:800;font-size:13.5px;color:var(--ink,#0b0d12);
  cursor:pointer;text-decoration:none;}
.rn-vb.pri{background:var(--acc);border-color:var(--acc);color:#fff;}
.rn-vb:hover{filter:brightness(1.05);}

.rn-card,.rn-score{margin-bottom:40px;}
.rn-score{background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);border-radius:14px;overflow:hidden;}
.rn-sh{padding:20px 18px 0;}
.rn-figs{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:1px;background:var(--border,#e5e7eb);
  margin:16px 0 0;border-top:1px solid var(--border,#e5e7eb);border-bottom:1px solid var(--border,#e5e7eb);}
.rn-fig{background:var(--white,#fff);padding:14px 16px;}
.rn-fig b{display:block;font-size:26px;font-weight:800;line-height:1.1;letter-spacing:-.02em;}
.rn-fig.big b{font-size:34px;color:var(--accent,#233a63);}
.rn-fig i{display:block;font-style:normal;font-size:11.5px;font-weight:700;color:var(--muted,#3f4757);margin-top:3px;}

.rn-rows{padding:6px 0;}
.rn-row{display:flex;align-items:center;gap:11px;padding:11px 18px;border-bottom:1px solid var(--border,#e5e7eb);}
.rn-row:last-child{border-bottom:0;}
.rn-ic{border-radius:8px;flex:none;object-fit:contain;}
.rn-rt{min-width:0;width:132px;flex:none;}
.rn-rt b{display:block;font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-rt i{display:block;font-style:normal;font-size:11.5px;font-weight:600;color:var(--muted,#3f4757);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-rb{flex:1;min-width:40px;height:8px;border-radius:4px;background:var(--surface-alt,#eef2f7);overflow:hidden;}
.rn-rb span{display:block;height:100%;background:var(--acc);}
.rn-rn{font-family:'DM Mono',ui-monospace,monospace;font-size:15px;font-weight:700;flex:none;}
.rn-rn em{font-style:normal;font-size:11.5px;color:var(--muted,#3f4757);}
.rn-rs{width:52px;flex:none;text-align:right;font-family:'DM Mono',ui-monospace,monospace;font-size:11px;
  color:var(--muted,#3f4757);}
.rn-row.won .rn-rs{color:#15803d;font-weight:700;}

.rn-acts{display:flex;gap:8px;flex-wrap:wrap;padding:16px 18px 0;}
.rn-alt{display:inline-flex;align-items:center;gap:7px;background:var(--white,#fff);border:1.5px solid var(--border,#e5e7eb);
  border-radius:10px;padding:12px 15px;font-family:inherit;font-weight:800;font-size:14px;color:var(--ink,#0b0d12);
  cursor:pointer;text-decoration:none;}
.rn-alt:hover{background:var(--surface,#f7f8fa);}
.rn-score .rn-fine{padding:0 18px 18px;}

@media (max-width:640px){
  .rn-rail{grid-template-columns:repeat(auto-fit,minmax(60px,1fr));}
  .rn-pipn{font-size:10.5px;}
  .rn-h1{font-size:22px;}
  .rn-q{font-size:18px;}
  .rn-figs{grid-template-columns:1fr 1fr;}
  .rn-fig.big{grid-column:1 / -1;}
  .rn-rt{width:auto;flex:1;}
  .rn-rb{display:none;}
}
`;
