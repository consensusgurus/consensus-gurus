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
import { useHoverStale } from '@/lib/hover-armed';
import { ArrowRight, Pause, Play, Home, Share2, Check } from 'lucide-react';
import useAbandonFlush from '../../../quiz/[id]/useAbandonFlush';
import JoinLeaderboardForm from '../../../quiz/[id]/JoinLeaderboardForm';
import { savedIdentity } from '@/lib/saved-identity';
import { isMobileDevice } from '@/lib/is-mobile';
import { withRef } from '@/lib/referrals';
import { notifyShareCredit } from '../../../ShareCreditPop';
import { runSummaryHref, circuitShareUrl } from '@/lib/circuits';
import GauntletLadder, { rampFor } from '../../GauntletLadder';
import useGauntletField, { FIELD_FLOOR } from '../../useGauntletField';
import useCircuitBoard from '../../useCircuitBoard';
import { T } from '@/lib/theme';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";
const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";

const Q_SECONDS = 20;        // the same clock all five games run
// HOW LONG THE HANDOVER HOLDS. It ran 4.2s when the card between quizzes was
// two lines. It now carries the verdict, three figures about the quiz just
// finished and the handover to the next with three more, and 4.2s is not
// enough to read that, let alone take it in. Eight is: a fast player presses
// Next now and loses nothing, a slow one is no longer robbed of the screen,
// and seven handovers cost 56s of a run that runs several minutes. The drain
// bar reads its duration from this same constant (--dwell below) so the bar
// and the timeout cannot drift apart.
const VERDICT_MS = 8000;
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
  // Hover off until the pointer moves again: see lib/hover-armed.js. The key
  // is the section AND the question, since every section restarts at 0.
  const hovStale = useHoverStale(`${r.si}:${r.i}`);
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

  // THE BOARD IS PART OF THE ENDING, not a page you go to next (owner,
  // 2026-08-28). The card used to close with "See the board", which is a link
  // away at the moment a player most wants to know how that went against
  // everyone else. It is fetched by the same hook /daily-five uses, so the two
  // endings cannot ask the route different questions, and only once the run is
  // over: mid-run it would be a board the player is not on yet.
  const boardQ = useCircuitBoard(circuitId, done);
  // The same board, read once on the gate, for the headline. It stops when the
  // run starts and the call above takes over at the finish.
  const boardGate = useCircuitBoard(circuitId, hydrated && !done && r.phase === 'idle');

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
    const text = [
      `${circuitName} · ${cleared} of ${askable} questions`,
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
    // NOTHING ONCE THE RUN IS OVER (owner, 2026-08-28). The finish card below
    // carries these three figures, and by then the cap has swapped the game
    // name for the A-Z strip, so a second copy of them lands squeezed against
    // the right edge underneath it and reads as a glitch. The result belongs in
    // the box the player is reading, not in the header.
    if (done) return [];
    if (r.phase === 'verdict') return [
      { v: `${cleared}/${askable}`, k: 'questions' },
      { v: `${r.results.length}/${N}`, k: 'quizzes done' },
    ];
    // Three columns rather than two, and short labels: the cap gives each
    // figure a fixed 124px and centres it, so two long words ("quizzes",
    // "questions") sit shoulder to shoulder and read as one.
    return [
      { v: `${N}`, k: 'quizzes' },
      { v: `${askable}`, k: 'asked' },
      { v: '1', k: 'life each' },
    ];
  })();

  // ── the field ──────────────────────────────────────────────────────────
  // Today's survival curve per bank, from the score distribution the board
  // route already returns. Fetched once, on the gate, because the gate's own
  // headline is made of it. A bank with too small a field simply has no curve
  // and every surface below falls back to its plain form.
  // ══ RENDER BOUNDARY ══ everything below is presentation; the run's logic is
  // above and is never rewritten. scripts split the file here.

  // ── the field ──────────────────────────────────────────────────────────
  // Today's survival curve per bank, from the score distribution the board
  // route already returns. Fetched once, on the gate, because the gate's own
  // headline is made of it. A bank with too small a field simply has no curve
  // and every surface below falls back to its plain form.
  const field = useGauntletField(sections, hydrated);
  const fieldOn = !!(field && field.any);

  // How many ran every bank clean today. Not derivable from the per-bank
  // distributions (they cannot tell you it was the same person each time), so
  // it comes off the combined board, where a row carries its per-game score
  // and total.
  const standing = (() => {
    // boardGate, not boardQ: on the gate the finish-time call is still inactive
    // and holding null.
    const src = boardGate.data || boardQ.data;
    const rows = src && Array.isArray(src.overall) ? src.overall : null;
    if (!rows) return null;
    let n = 0;
    for (const row of rows) {
      const pg = row.perGame || {};
      let all = true;
      for (const s of sections) {
        const p = pg[s.key];
        if (!p || p.abandoned || !(p.total > 0) || p.score !== p.total) { all = false; break; }
      }
      if (all) n += 1;
    }
    return n;
  })();

  // CLAIM YOUR SPOT. The ladder pays REGISTERED positions only, and a finish is
  // where the attention is, so a guest's scorecard carries the canonical join
  // form inline. This surface needed it twice over: dropping the site header
  // took the only Sign Up control off the page with it. Identity is read in an
  // effect because localStorage does not exist on the server.
  const [guest, setGuest] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  useEffect(() => { if (!savedIdentity().username) setGuest(true); }, []);

  // THE LINE UNDER EACH GAME'S NAME. Normally the game's SUBJECT, per the note
  // in lib/daily-games. Deep is the exception the owner asked for here
  // (2026-08-30): its subject is the word "Trivia", which says nothing, while
  // its day TOPIC is the whole point of it. `topic` is only set by a game whose
  // day has one, so this reads as the subject everywhere else with no special
  // casing by key.
  const lineFor = (s) => s.topic || s.subject || s.cat || s.tag;

  const lastSec = last ? sections.find((s) => s.key === last.key) : null;
  const lastAvg = last && field && field.avg[last.key] != null ? field.avg[last.key] : null;
  const lastBeaten = last && field ? field.beaten(last.key, last.score) : null;

  return (
    // NO SITE CHROME AT ALL. Every other daily wears DailyChrome (the site
    // masthead plus the stat bar) over LoftCap, which on this page put two
    // full headers and a rank strip between the reader and the run, and a
    // footer of site links under it. The Gauntlet is a sitting rather than a
    // page you browse to, so it is the dark screen and nothing else: its own
    // one-line cap below, and no footer. That means this page owns its ground
    // and its ink outright, which the stylesheet does explicitly.
    <div className="rn" style={{ minHeight: '100vh', background: T.ground, position: 'relative', overflowX: 'hidden' }}>
      <style>{CSS}</style>

      {/* THE ONLY CHROME. Not LoftCap and not the site footer: the run is a
          sitting you sit down to, and every band above or below it was another
          thing between the reader and the question. This is the mockup's cap,
          which is all it ever had: what you are in, what today is, the three
          live figures, and the way out. Dropping LoftCap also drops the
          `loft-page` ground rules it injects, so this page paints its own
          background and its own ink, which it was doing already. */}
      <div className="rn-cap">
        <div className="rn-cid">
          <i>{done ? (perfect === N ? 'Run cleared' : 'Run complete') : `Trivia · ${dateLabel}`}</i>
          <b>{circuitName}</b>
        </div>
        {capFigures.length ? (
          <div className="rn-cf">
            {capFigures.map((f) => (
              <div key={f.k}><b>{f.v}</b><i>{f.k}</i></div>
            ))}
          </div>
        ) : null}
        <a className="rn-cx" href={`/circuits/${circuitId}`}>Leave</a>
      </div>
      <div className="rn-cprog">
        <span style={{ width: `${askable ? Math.round((answeredSoFar / askable) * 100) : 0}%` }} />
      </div>

      {/* THE CLOCK, full bleed on the stage's own top edge, so it sits in
          peripheral vision instead of competing with the question. Red under
          five seconds. It holds its lane at every phase so the stage does not
          jump by three pixels between question and verdict. */}
      <div className={`rn-tick${r.phase === 'playing' && remainFrac < 0.25 ? ' hot' : ''}`}>
        <span style={{
          width: r.phase === 'playing' ? `${remainFrac * 100}%` : '0%',
          background: sec ? sec.accent : 'transparent',
        }} />
      </div>

      <div className="rn-wrap">
        <div className="rn-stage">
          {/* THE LADDER, in its own gutter, the one thing on screen that
              persists across every quiz. It is what makes this read as one
              sitting rather than seven pages, and the scorecard draws the same
              object from the same state. On a phone it lies down across the
              top instead (the component's own media query). */}
          <div className="rn-gutter">
            <span className="rn-lcap">{done ? 'Your run' : fieldOn ? "Today's field" : 'Run'}</span>
            <GauntletLadder
              orientation="col"
              height={640}
              sections={sections}
              results={r.results}
              activeIndex={r.phase === 'playing' ? r.si : -1}
              activeAnswered={r.i}
              field={fieldOn ? field.curves : null}
              labels
            />
          </div>

          <div className="rn-body">
            {r.phase === 'idle' ? (
              <div className="rn-gate">
                <span className="rn-eye">{circuitName} · one long quiz</span>
                {/* The headline is the field when there is one, because
                    "four are still standing" is the most honest description of
                    what this is, and the rule when there is not. */}
                {fieldOn && field.started >= FIELD_FLOOR ? (
                  <h1 className="rn-h1">
                    <var>{field.started}</var> played today.<br />
                    {standing != null && standing > 0
                      ? <><var>{standing}</var> ran the whole thing clean.</>
                      : <>Nobody has cleared all <var>{N}</var> yet.</>}
                  </h1>
                ) : (
                  <h1 className="rn-h1">
                    <var>{askable}</var> questions.<br />
                    <var>{N}</var> quizzes.<br />
                    <u>One life each.</u>
                  </h1>
                )}
                <div className="rn-roster">
                  {sections.map((s) => (
                    <div key={s.key} className="rn-rrow" style={{ '--acc': rampFor(s.slot != null ? s.slot : 0) }}>
                      <b>{s.name}</b>
                      <i>{lineFor(s)}</i>
                      {fieldOn && field.avg[s.key] != null
                        ? <s>avg {field.avg[s.key].toFixed(1)}</s>
                        : <s />}
                      <em>{s.questions.length}</em>
                    </div>
                  ))}
                </div>
                <button type="button" className="rn-go" onClick={startRun}>
                  Take your run<ArrowRight size={17} strokeWidth={2.8} />
                </button>
                <p className="rn-fine">
                  Twenty seconds a question. Keys 1 to 4 answer.
                  {fieldOn ? <><br />The dim rungs beside you are where today&rsquo;s players fell, and the bright one on each block is the average.</> : null}
                </p>
              </div>
            ) : null}

            {r.phase === 'playing' && question ? (
              <div className="rn-play" style={{ '--acc': sec.accent }}>
                <div className="rn-meta">
                  <span className="rn-game">{sec.name}</span>
                  {question.cat ? <span className="rn-chip">{question.cat}</span> : null}
                  {tierName ? <span className="rn-chip tier">{tierName}</span> : null}
                  <span className="rn-count">{r.i + 1} of {sec.questions.length}</span>
                </div>
                <h2 className="rn-q">{question.q}</h2>
                <div className={`rn-ch${hovStale ? ' nohov' : ''}`}>
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
                <div className="rn-foot">
                  {/* THE LIFE TOKEN. One lit dot, always on screen, in the
                      quiz's own colour. The mechanic that separates this from
                      every other quiz on the site had no picture before it. */}
                  <span className="rn-life"><s />One life · {sec.name}</span>
                  {fieldOn && field.curves[sec.key] ? (
                    <span className="rn-chip alive">
                      {Math.round((field.curves[sec.key][r.i] || 0) * (field.plays[sec.key] || 0))} of {field.plays[sec.key]} still alive here
                    </span>
                  ) : null}
                  <span className="rn-tally">{answeredSoFar} right in the run · {fmtTime(Date.now() - r.t0)}</span>
                </div>
              </div>
            ) : null}

            {r.phase === 'verdict' && last ? (
              /* THE HANDOVER. The finished quiz's colour washes out to the
                 left, the next one's arrives on the right, and its name is set
                 large enough to be the thing you read. It is the same screen
                 the run always held between quizzes, doing more with it. */
              <div
                className="rn-chm"
                style={{ '--from': lastSec ? lastSec.accent : T.blue, '--to': upNext ? upNext.accent : T.blue }}
              >
                <span className={`rn-eye${last.status === 'won' ? ' ok' : ' out'}`}>
                  {last.status === 'won' ? 'Cleared · no misses' : 'Out · one wrong'}
                </span>
                <h2 className="rn-vh">
                  {lastSec ? lastSec.name : 'That quiz'}{last.status === 'won' ? ' run clean, ' : ' ends at '}
                  <u className={last.status === 'won' ? 'ok' : ''}>{last.score} of {last.total}</u>.
                </h2>
                <div className="rn-vfig">
                  {lastAvg != null ? (
                    <div>
                      <b className={last.score >= lastAvg ? 'up' : 'dn'}>
                        {last.score >= lastAvg ? '+' : '−'}{Math.abs(last.score - lastAvg).toFixed(1)}
                      </b>
                      <i>vs today&rsquo;s {lastAvg.toFixed(1)} average</i>
                    </div>
                  ) : null}
                  {lastBeaten != null ? (
                    <div><b className="up">{Math.round(lastBeaten * 100)}%</b><i>of the field beaten</i></div>
                  ) : null}
                  <div><b>{fmtTime(last.secs * 1000)}</b><i>your clock</i></div>
                  <div><b>{last.total - last.score}</b><i>never reached</i></div>
                </div>
                {upNext ? (
                  <div className="rn-hand">
                    <span className="rn-he">Next up · your life resets</span>
                    <span className="rn-hn">{upNext.name}</span>
                    <span className="rn-hs">{lineFor(upNext)} · {upNext.questions.length} questions</span>
                  </div>
                ) : (
                  <div className="rn-hand">
                    <span className="rn-he">That was the last one</span>
                    <span className="rn-hn">Results</span>
                  </div>
                )}
                {/* Keyed on the resume count so the bar RESTARTS with the fresh
                    timeout a resume starts. Without the key the animation picks
                    up where it paused while the timer runs the full dwell
                    again, and the bar empties while the card sits there. It
                    takes its duration from VERDICT_MS rather than a second copy
                    of the number in the stylesheet. */}
                <div className={`rn-vbar${hold ? ' held' : ''}`} style={{ '--dwell': `${VERDICT_MS}ms` }}>
                  <span key={resumes} />
                </div>
                <div className="rn-vacts">
                  <button type="button" className="rn-vb pri" onClick={() => { setHold(false); nextSection(); }}>
                    {upNext ? 'Next now' : 'See the run'}<ArrowRight size={15} strokeWidth={2.8} />
                  </button>
                  <button type="button" className="rn-vb" onClick={() => { if (hold) setResumes((k) => k + 1); setHold(!hold); }}>
                    {hold ? <><Play size={14} strokeWidth={2.8} />Resume</> : <><Pause size={14} strokeWidth={2.8} />Hold</>}
                  </button>
                  <a className="rn-vb" href={`/circuits/${circuitId}`}>Leave the run</a>
                </div>
              </div>
            ) : null}

            {done ? (
              <div className="rn-done">
                <div className="rn-sc-hero">
                  <div className="rn-sc-big">
                    {cleared}<small>/{askable}</small>
                    <i>questions cleared</i>
                  </div>
                  {/* NO "0 of 7 CLEARED" (owner, 2026-08-30). Clearing a
                      one-life quiz of twenty-five questions is rare, so for
                      almost everyone that figure is a zero, and a scorecard
                      that leads with a zero reads as a failure whatever the
                      real score was. The number right is the achievement and
                      the hero already carries it. */}
                  <div className="rn-sc-figs">
                    <div><b>{fmtTime(runSecs * 1000)}</b><i>on the clock</i></div>
                    {boardQ.data && boardQ.data.me && Number.isFinite(boardQ.data.me.rank)
                      ? <div><b>#{boardQ.data.me.rank}</b><i>of {boardQ.data.overallField || 0}</i></div> : null}
                    {boardQ.data && boardQ.data.me && Number.isFinite(boardQ.data.me.total)
                      ? <div><b>{Math.round(boardQ.data.me.total * 10) / 10}</b><i>of {(boardQ.data && boardQ.data.maxTotal) || N * 15} points</i></div> : null}
                  </div>
                </div>

                {guest && !claimed ? (
                  <div className="rn-claim">
                    <span className="rn-clabel">Playing as a guest</span>
                    <div className="rn-chd">
                      <span className="rn-cnm">Claim a free name to hold your spot</span>
                      {!claimOpen ? (
                        <button type="button" className="rn-cgo" onClick={() => setClaimOpen(true)}>
                          Claim my name
                        </button>
                      ) : null}
                    </div>
                    <p className="rn-ctg">
                      Ranks and points count for registered names only. A display name is enough, no
                      password, and every quiz you have already finished comes with you.
                    </p>
                    {claimOpen ? (
                      <div className="rn-cform">
                        <JoinLeaderboardForm
                          heading="Claim your name"
                          hideIcon
                          onJoined={() => {
                            setClaimed(true);
                            try { window.dispatchEvent(new Event('sot:daily-updated')); } catch (e) {}
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {claimed ? (
                  <div className="rn-claimed">
                    You&rsquo;re on the board. Every finish counts under your name now.
                  </div>
                ) : null}

                <span className="rn-lcap rn-scl">The run</span>
                <GauntletLadder
                  orientation="row"
                  sections={sections}
                  results={r.results}
                  field={fieldOn ? field.curves : null}
                  labels
                />

                <div className="rn-scrows">
                  {sections.map((sc) => {
                    const res = r.results.find((x) => x.key === sc.key);
                    const st = res ? res.status : null;
                    const bt = res && field ? field.beaten(sc.key, res.score) : null;
                    return (
                      <div key={sc.key} className="rn-scr" style={{ '--acc': rampFor(sc.slot != null ? sc.slot : 0) }}>
                        <b>{sc.name}</b>
                        <i>
                          {st === 'banked' ? 'played earlier today' : lineFor(sc)}
                          {st === 'lost' ? ` · out on Q${res.score + 1}` : ''}
                        </i>
                        <s>{bt != null ? `beat ${Math.round(bt * 100)}%` : ''}</s>
                        <span className={`rn-pill ${st === 'won' ? 'clean' : st ? 'out' : 'open'}`}>
                          {st === 'won' ? 'Clean' : st === 'banked' ? 'Banked' : st ? 'Out' : 'Not run'}
                        </span>
                        <em>{res ? res.score : 0}/{sc.questions.length}</em>
                      </div>
                    );
                  })}
                </div>

                <div className="rn-board">
                  <span className="rn-lcap">
                    Today&rsquo;s circuit board{boardQ.data && boardQ.data.overallField ? ` · ${boardQ.data.overallField} on it` : ''}
                  </span>
                  {boardQ.state === 'loading' ? (
                    <div className="rn-bmsg">Reading the board.</div>
                  ) : boardQ.state === 'error' ? (
                    <div className="rn-bmsg">The board could not be loaded just now.</div>
                  ) : (
                    <div className="rn-lb">
                      {((boardQ.data && boardQ.data.overall) || []).slice(0, 5).map((row, i) => (
                        <div key={row.userKey || i} className={`rn-brow${boardQ.data.me && row.userKey === boardQ.data.me.userKey ? ' me' : ''}`}>
                          <span className="rn-bp">{i + 1}</span>
                          <span className="rn-bn">{row.username || 'Guest'}</span>
                          <span className="rn-bs">{Math.round(row.total * 10) / 10}</span>
                        </div>
                      ))}
                      {boardQ.data && boardQ.data.me
                        && !((boardQ.data.overall || []).slice(0, 5).some((x) => x.userKey === boardQ.data.me.userKey)) ? (
                          <div className="rn-brow me">
                            <span className="rn-bp">{boardQ.data.me.rank || '—'}</span>
                            <span className="rn-bn">You</span>
                            <span className="rn-bs">{Math.round(boardQ.data.me.total * 10) / 10}</span>
                          </div>
                        ) : null}
                    </div>
                  )}
                </div>

                <div className="rn-vacts rn-sacts">
                  <button type="button" className="rn-vb pri" onClick={shareRun}>
                    {copied ? <Check size={15} strokeWidth={2.8} /> : <Share2 size={15} strokeWidth={2.8} />}
                    {copied ? 'Copied' : 'Share the run'}
                  </button>
                  <a className="rn-vb" href={runSummaryHref(circuitId)}>The full board</a>
                  <a className="rn-vb" href="/"><Home size={15} strokeWidth={2.8} />Home</a>
                </div>
                <p className="rn-fine">
                  Each quiz counted on its own board as you played it. The circuit board ranks the
                  combined placement across all {N}. Each quiz pays 15 points for a win down to 1
                  for finishing, and the run adds the {N} up.
                </p>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}
const CSS = `
/* THE RUN IS A DARK STAGE, not white cards on navy (owner, 2026-08-30, "it
   should look just like the mock-up"). Every other daily puts its board in a
   white card because the board is an object you manipulate; this is a question
   on a screen, and the mockup put it straight on the ground with the ladder
   beside it. That also means the loft ground's ink rules, which repaint text
   for a dark background and which the old white cards had to fight with
   three-class !important overrides, are now doing exactly what is wanted. The
   overrides are gone with the cards.

   Anything added here that must NOT be repainted has to carry its own colour:
   the rule catches every <p> that is a direct child of a direct div child of
   the page column, and every <section>. Nothing here is a section. */
.rn{font-family:${SANS};color:#eef2fa;}
.rn-wrap{max-width:1120px;margin:0 auto;padding:0 20px 40px;}

/* THE CAP, and the only band on the page. */
.rn-cap{background:${T.accent};display:flex;align-items:center;gap:16px;padding:12px 20px;}
.rn-cid{min-width:0;flex:1;}
.rn-cid i{display:block;font-style:normal;font-family:${MONO};font-size:9.5px;letter-spacing:.15em;
  text-transform:uppercase;color:#9fc2ff;margin-bottom:2px;}
.rn-cid b{display:block;font-size:16px;font-weight:800;letter-spacing:-.02em;color:#fff;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-cf{display:flex;gap:2px;flex:none;}
.rn-cf div{width:84px;text-align:center;}
.rn-cf div b{display:block;font-family:${MONO};font-size:16px;font-weight:500;color:#fff;
  line-height:1;font-variant-numeric:tabular-nums;}
.rn-cf div i{display:block;font-style:normal;font-size:8.5px;font-weight:800;letter-spacing:.1em;
  text-transform:uppercase;color:#8ea6d6;margin-top:5px;}
.rn-cx{flex:none;font-family:${MONO};font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:#9fc2ff;text-decoration:none;border:1px solid rgba(255,255,255,.2);border-radius:7px;
  padding:7px 11px;}
.rn-cx:hover{color:#fff;border-color:rgba(255,255,255,.4);}
.rn-cprog{height:2px;background:rgba(255,255,255,.1);}
.rn-cprog span{display:block;height:100%;background:${T.blue400};transition:width .3s ease;}

/* THE CLOCK, full bleed under the cap. It keeps its lane at every phase so the
   stage does not jump three pixels between a question and a verdict. */
.rn-tick{height:3px;background:rgba(255,255,255,.07);}
.rn-tick span{display:block;height:100%;transition:width .2s linear;}
.rn-tick.hot span{background:${T.danger}!important;}

/* THE STAGE: the ladder's gutter, then the run. */
.rn-stage{display:flex;gap:0;align-items:stretch;min-height:560px;}
.rn-gutter{flex:none;width:136px;padding:20px 16px 24px 0;margin-right:24px;
  border-right:1px solid rgba(255,255,255,.08);}
.rn-body{flex:1;min-width:0;padding:22px 0 30px;max-width:720px;}
.rn-lcap{display:block;font-family:${MONO};font-size:9px;letter-spacing:.13em;
  text-transform:uppercase;color:#66748f;margin-bottom:12px;}
.rn-scl{margin-top:26px;}

/* Shared type. */
.rn-eye{display:block;font-family:${MONO};font-size:10.5px;letter-spacing:.16em;
  text-transform:uppercase;font-weight:500;color:${T.blue400};margin-bottom:8px;}
.rn-eye.ok{color:${T.success};}
.rn-eye.out{color:#ef8577;}
.rn-h1{font-size:clamp(30px,4vw,44px);font-weight:800;letter-spacing:-.04em;line-height:1.03;
  margin:0;color:#fff;}
.rn-h1 var{font-style:normal;font-family:${MONO};font-weight:500;letter-spacing:-.03em;
  font-variant-numeric:tabular-nums;}
.rn-h1 u{text-decoration:none;color:#ef8577;}
.rn-lead{font-size:15px;line-height:1.55;font-weight:600;color:#9aa8c4;margin:16px 0 0;max-width:56ch;}
.rn-fine{font-size:12px;line-height:1.65;font-weight:600;color:#66748f;margin:16px 0 0;}

/* The start list. */
/* THE START LIST IS THE BODY OF THE GATE. The paragraph that used to sit above
   it restated the headline in grey, so it went and the list took the height:
   the seven quizzes are the thing a reader is actually deciding about, and at
   this size the names carry from across a room. */
.rn-roster{display:grid;margin:26px 0 0;border-top:1px solid rgba(255,255,255,.09);}
.rn-rrow{display:flex;align-items:center;gap:16px;padding:15px 0 15px 16px;
  border-bottom:1px solid rgba(255,255,255,.07);border-left:4px solid var(--acc);}
.rn-rrow b{font-size:19px;font-weight:800;letter-spacing:-.02em;color:#fff;width:96px;flex:none;}
.rn-rrow i{font-style:normal;font-size:15px;font-weight:600;color:#9aa8c4;flex:1;min-width:0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-rrow s{text-decoration:none;font-family:${MONO};font-size:12.5px;color:#66748f;
  width:78px;text-align:right;flex:none;}
.rn-rrow em{font-style:normal;font-family:${MONO};font-size:14px;color:#8ea6d6;
  font-variant-numeric:tabular-nums;width:34px;text-align:right;flex:none;}

.rn-go{display:inline-flex;align-items:center;gap:9px;background:${T.cta};color:#fff;border:0;
  border-radius:11px;padding:15px 22px;font-family:inherit;font-weight:800;font-size:15px;
  cursor:pointer;margin-top:24px;}
.rn-go:hover{filter:brightness(1.1);}

/* The question. */
.rn-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
.rn-game{font-size:12.5px;font-weight:800;color:var(--acc);}
.rn-chip{font-family:${MONO};font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;
  color:#9aa8c4;border:1px solid rgba(255,255,255,.12);border-radius:5px;padding:3px 7px;}
.rn-chip.tier{border-color:rgba(232,180,58,.42);color:${T.gold};}
.rn-chip.alive{border-color:rgba(96,165,250,.4);color:${T.blue200};}
.rn-count{margin-left:auto;font-family:${MONO};font-size:11.5px;color:#66748f;
  font-variant-numeric:tabular-nums;}
.rn-q{font-size:clamp(21px,2.7vw,29px);font-weight:800;letter-spacing:-.025em;line-height:1.28;
  color:#fff;margin:0 0 22px;max-width:28ch;}
.rn-ch{display:grid;gap:9px;}
.rn-c{display:flex;align-items:center;gap:12px;text-align:left;background:rgba(255,255,255,.045);
  border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:15px 16px;font-family:inherit;
  font-size:15.5px;font-weight:600;color:#eef2fa;cursor:pointer;transition:border-color .12s,background .12s;}
.rn-ch:not(.nohov) .rn-c:hover:not(:disabled){border-color:var(--acc);background:rgba(255,255,255,.08);}
.rn-c:disabled{cursor:default;}
.rn-c.ok{border-color:${T.successDeep};background:rgba(16,185,129,.16);color:#c6f5e2;}
.rn-c.ok .rn-k{border-color:${T.successDeep};color:#6ee7b7;}
.rn-k{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex:none;
  border-radius:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);
  font-family:${MONO};font-size:11px;font-weight:500;color:#66748f;}

.rn-foot{display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-top:22px;padding-top:16px;
  border-top:1px solid rgba(255,255,255,.08);}
.rn-life{display:inline-flex;align-items:center;gap:9px;padding:9px 13px;border-radius:9px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);
  font-family:${MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#9aa8c4;}
.rn-life s{text-decoration:none;width:9px;height:9px;border-radius:50%;background:var(--acc);flex:none;
  box-shadow:0 0 0 4px color-mix(in srgb,var(--acc) 22%,transparent);}
.rn-tally{margin-left:auto;font-family:${MONO};font-size:11.5px;color:#66748f;
  font-variant-numeric:tabular-nums;}

/* THE HANDOVER. The outgoing quiz's colour leaves on the left, the incoming
   one arrives on the right, and the name is the thing you read. */
.rn-chm{position:relative;border-radius:14px;border:1px solid rgba(255,255,255,.09);
  padding:26px 26px 24px;overflow:hidden;}
.rn-chm::before{content:'';position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(112deg,color-mix(in srgb,var(--from) 26%,transparent) 0%,
    ${T.ground} 48%,color-mix(in srgb,var(--to) 18%,transparent) 100%);}
.rn-chm > *{position:relative;}
.rn-vh{font-size:clamp(23px,3.2vw,34px);font-weight:800;letter-spacing:-.035em;line-height:1.08;
  color:#fff;margin:0;}
.rn-vh u{text-decoration:none;font-family:${MONO};font-weight:500;color:#ef8577;
  font-variant-numeric:tabular-nums;}
.rn-vh u.ok{color:${T.success};}
.rn-vfig{display:flex;gap:26px;flex-wrap:wrap;margin:20px 0 0;}
.rn-vfig div b{display:block;font-family:${MONO};font-size:21px;color:#fff;font-weight:500;
  line-height:1;font-variant-numeric:tabular-nums;}
.rn-vfig div b.up{color:${T.success};}
.rn-vfig div b.dn{color:#ef8577;}
.rn-vfig div i{display:block;font-style:normal;font-size:9px;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;color:#66748f;margin-top:6px;}
.rn-hand{margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,.11);}
.rn-he{display:block;font-family:${MONO};font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;
  color:#66748f;}
.rn-hn{display:block;font-size:clamp(34px,5.4vw,58px);font-weight:800;letter-spacing:-.05em;
  line-height:.92;text-transform:uppercase;color:var(--to);margin-top:8px;}
.rn-hs{display:block;font-size:12.5px;font-weight:600;color:#9aa8c4;margin-top:8px;}
.rn-vbar{height:3px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden;margin:22px 0 15px;}
.rn-vbar span{display:block;height:100%;background:var(--to);width:100%;transform-origin:left;
  animation:rnv var(--dwell,8000ms) linear forwards;}
.rn-vbar.held span{animation-play-state:paused;}
@keyframes rnv{from{transform:scaleX(1);}to{transform:scaleX(0);}}
@media (prefers-reduced-motion:reduce){.rn-vbar span{animation:none;transform:scaleX(0);}}

.rn-vacts{display:flex;gap:8px;flex-wrap:wrap;}
.rn-vb{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:11px 14px;font-family:inherit;
  font-weight:800;font-size:13.5px;color:#eef2fa;cursor:pointer;text-decoration:none;}
.rn-vb.pri{background:${T.cta};border-color:${T.cta};color:#fff;}
.rn-vb:hover{filter:brightness(1.1);}
.rn-sacts{margin-top:22px;}

/* The scorecard. */
.rn-sc-hero{display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap;padding-bottom:22px;
  border-bottom:1px solid rgba(255,255,255,.09);}
.rn-sc-big{font-family:${MONO};font-size:clamp(46px,7vw,64px);font-weight:500;color:#fff;
  line-height:.86;letter-spacing:-.04em;font-variant-numeric:tabular-nums;}
.rn-sc-big small{font-size:.36em;color:#66748f;letter-spacing:0;}
.rn-sc-big i{display:block;font-style:normal;font-family:${SANS};font-size:9.5px;font-weight:800;
  letter-spacing:.13em;text-transform:uppercase;color:#66748f;margin-top:10px;}
.rn-sc-figs{display:flex;gap:24px;margin-left:auto;flex-wrap:wrap;}
.rn-sc-figs div b{display:block;font-family:${MONO};font-size:21px;color:#fff;font-weight:500;
  line-height:1;font-variant-numeric:tabular-nums;}
.rn-sc-figs div i{display:block;font-style:normal;font-size:9px;font-weight:800;letter-spacing:.12em;
  text-transform:uppercase;color:#66748f;margin-top:6px;}
.rn-scrows{margin-top:20px;}
.rn-scr{display:flex;align-items:center;gap:12px;padding:10px 0 10px 12px;
  border-bottom:1px solid rgba(255,255,255,.06);border-left:3px solid var(--acc);}
.rn-scr b{font-size:14.5px;font-weight:800;color:#fff;width:66px;flex:none;}
.rn-scr i{font-style:normal;font-size:12.5px;font-weight:600;color:#66748f;flex:1;min-width:0;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-scr s{text-decoration:none;font-family:${MONO};font-size:11px;color:${T.blue200};
  width:74px;text-align:right;flex:none;}
.rn-pill{font-family:${MONO};font-size:9px;letter-spacing:.1em;text-transform:uppercase;
  padding:3px 8px;border-radius:999px;flex:none;width:62px;text-align:center;}
.rn-pill.clean{background:rgba(16,185,129,.16);color:#6ee7b7;}
.rn-pill.out{background:rgba(192,57,43,.16);color:#ef8577;}
.rn-pill.open{background:rgba(255,255,255,.06);color:#66748f;}
.rn-scr em{font-style:normal;font-family:${MONO};font-size:13px;color:#dce6f7;
  font-variant-numeric:tabular-nums;width:54px;text-align:right;flex:none;}

/* CLAIM YOUR SPOT, directly under the figures, because that is where the rank
   and the points the reader is about to lose are printed.
   The join form inks itself from --join-* custom properties. LoftFinish resets
   them to light values because its card is white; this card is dark, so they
   are set here for a dark ground or the heading ships black on near-black. */
.rn-claim{margin:20px 0 0;border:2px solid rgba(96,165,250,.34);border-radius:12px;
  background:rgba(47,111,228,.13);padding:14px 16px;
  --join-head:#ffffff;--join-body:#c6d2e8;--join-soft:#9aa8c4;
  --join-ok:${T.success};--join-err:#ef8577;}
.rn-clabel{display:block;font-family:${MONO};font-size:9.5px;letter-spacing:.13em;
  text-transform:uppercase;color:${T.blue200};margin-bottom:7px;}
.rn-chd{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.rn-cnm{flex:1;min-width:0;font-size:16.5px;font-weight:800;letter-spacing:-.02em;color:#fff;}
.rn-cgo{flex:none;border:0;background:${T.cta};color:#fff;border-radius:9px;padding:11px 15px;
  font-family:inherit;font-weight:800;font-size:13px;cursor:pointer;}
.rn-cgo:hover{filter:brightness(1.1);}
.rn-ctg{font-size:12.5px;font-weight:600;line-height:1.5;color:#9aa8c4;margin:8px 0 0;}
.rn-cform{margin-top:14px;}
.rn-claimed{margin:20px 0 0;border:2px solid rgba(16,185,129,.4);border-radius:12px;
  background:rgba(16,185,129,.1);padding:12px 15px;font-weight:800;font-size:13.5px;
  color:#6ee7b7;}

.rn-board{margin-top:24px;border-top:1px solid rgba(255,255,255,.09);padding-top:16px;}
.rn-lb{display:grid;gap:2px;}
.rn-brow{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:7px;
  font-size:13.5px;font-weight:600;color:#9aa8c4;}
.rn-brow .rn-bp{font-family:${MONO};font-size:11.5px;color:#66748f;width:26px;flex:none;}
.rn-brow .rn-bn{flex:1;min-width:0;color:#dce6f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.rn-brow .rn-bs{font-family:${MONO};font-size:13px;color:#fff;font-variant-numeric:tabular-nums;}
.rn-brow.me{background:rgba(47,111,228,.18);border:1px solid rgba(96,165,250,.35);color:#fff;}
.rn-brow.me .rn-bp,.rn-brow.me .rn-bn{color:#fff;}
.rn-bmsg{padding:16px;text-align:center;font-size:12.5px;font-weight:600;color:#66748f;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:11px;}

/* PHONE. The vertical gutter lies down into a single condensed strip, because
   a 640px column of rungs beside a question is most of a phone screen spent on
   furniture. Everything here is about giving the height back: the strip is
   26px of ladder plus its caption, the cap loses its figure columns (the same
   numbers are in the strip and the footer line), and the stage padding halves.
   The ladder's own media query does the flip; this trims what is around it. */
@media (max-width:820px){
  .rn-wrap{padding:0 14px 24px;}
  .rn-cap{padding:10px 14px;gap:10px;}
  .rn-cid b{font-size:14px;}
  .rn-cf{display:none;}
  .rn-stage{flex-direction:column;min-height:0;}
  .rn-gutter{width:auto;padding:12px 0 10px;margin:0;border-right:0;
    border-bottom:1px solid rgba(255,255,255,.08);}
  .rn-lcap{margin-bottom:7px;}
  .rn-body{padding:16px 0 22px;max-width:none;}
  .rn-h1{font-size:27px;}
  .rn-lead{font-size:13.5px;margin-top:12px;}
  .rn-roster{margin-top:18px;}
  .rn-rrow{gap:12px;padding:12px 0 12px 13px;}
  .rn-rrow b{width:74px;font-size:16px;}
  .rn-rrow i{font-size:13px;}
  .rn-rrow em{font-size:12.5px;}
  .rn-rrow s{display:none;}
  .rn-go{width:100%;justify-content:center;margin-top:18px;}
  .rn-q{font-size:20px;margin-bottom:16px;}
  .rn-c{padding:13px 14px;font-size:14.5px;}
  .rn-foot{margin-top:16px;padding-top:13px;gap:8px;}
  .rn-tally{margin-left:0;width:100%;}
  .rn-chm{padding:18px 15px;}
  .rn-vfig{gap:18px;}
  .rn-hn{font-size:34px;}
  .rn-sc-figs{margin-left:0;gap:18px;}
  .rn-scr s{display:none;}
  .rn-scr b{width:58px;}
}
`;
