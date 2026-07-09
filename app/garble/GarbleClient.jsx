'use client';

// Garble — five garbled words, one clued finale.
//
// Untangle each scrambled word using exactly the letters shown. The gold
// (marked) letters of every solution feed a final answer whose clue is
// printed from the start; solving the finale ends the game. Score is out of
// 10: one point per word untangled, five for the finale. Wrong tries are
// misses — fewest misses breaks leaderboard ties, then time.
//
// Soft launch: standalone page, not linked from the hub or homepage.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HelpCircle, Share2, RotateCcw, X, Trophy, Eye } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import SiteHeader from '../SiteHeader';
import QuizPlayerBar from '../quiz/[id]/QuizPlayerBar';
import QuizLeaderboard from '../quiz/[id]/QuizLeaderboard';
import JoinLeaderboardForm from '../quiz/[id]/JoinLeaderboardForm';
import { isMobileDevice } from '@/lib/is-mobile';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  faded: '#6b7280',
  gold: '#e6b93f',
  goldInk: '#5c4a06',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

const PUZZLES = [
  {
    num: 1,
    quizId: 'garble-7-9-26',
    live: '2026-07-09',
    dateLabel: 'July 9, 2026',
    clue: 'The only perfect vision — it just shows up too late.',
    final: 'HINDSIGHT',
    words: [
      { answer: 'HABIT', scramble: 'TABHI', marks: [0, 3] },
      { answer: 'DRESS', scramble: 'REDSS', marks: [0, 4] },
      { answer: 'GRAIN', scramble: 'NARGI', marks: [0, 4] },
      { answer: 'WEIGHT', scramble: 'HEWGIT', marks: [2, 4] },
      { answer: 'STRAND', scramble: 'DARNTS', marks: [1] },
    ],
  },
];
const HELP_KEY = 'sot_garble_help_seen';

function etToday() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function pickPuzzle(forceNum) {
  if (forceNum) { const p = PUZZLES.find((x) => x.num === forceNum); if (p) return p; }
  const today = etToday();
  const open = PUZZLES.filter((p) => p.live <= today);
  return open.length ? open[open.length - 1] : PUZZLES[0];
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
function sameLetters(a, b) {
  if (a.length !== b.length) return false;
  return a.split('').sort().join('') === b.split('').sort().join('');
}
const EMPTY_BOARD = { plays: 0, best: null, topTime: null, leaderboard: [], leaderboardAll: [], leaderboardMobile: [], leaderboardFirst: [], leaderboards: {} };

function freshState(puzzle) {
  return { v: 1, solved: {}, misses: 0, finalSolved: false, status: 'playing', t0: null, tEnd: null };
}

export default function GarbleClient({ forceNum = null }) {
  const PUZZLE = useMemo(() => pickPuzzle(forceNum), [forceNum]);
  const STORE_KEY = `sot_garble_${PUZZLE.num}`;
  const bank = useMemo(() => PUZZLE.words.flatMap((w, wi) => w.marks.map((mi) => ({ ch: w.answer[mi], wi }))), [PUZZLE]);
  const [g, setG] = useState(() => freshState(PUZZLE));
  const [sel, setSel] = useState(0); // 0..4 word rows, 'final'
  const [typed, setTyped] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [justWon, setJustWon] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [identity, setIdentity] = useState(null);
  const toastTimer = useRef(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setG({ ...freshState(PUZZLE), ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
    } catch (e) {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
  }, [g, hydrated, STORE_KEY]);

  useEffect(() => {
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity'));
      if (id && id.email) setIdentity(id);
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

  const playing = g.status === 'playing';
  const solvedCount = Object.keys(g.solved).length;
  const targetLen = sel === 'final' ? PUZZLE.final.length : PUZZLE.words[sel] ? PUZZLE.words[sel].answer.length : 0;
  const guessesUsed = g.misses;
  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';

  function postResult(g2, score) {
    const el = g2.t0 ? Math.max(1, Math.round(((g2.tEnd || Date.now()) - g2.t0) / 1000)) : 1;
    try {
      fetch('/api/quiz/result', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: PUZZLE.quizId, score, total: 10, correct: score, guessesUsed: g2.misses, timeElapsed: el, email: identity?.email || undefined, anonId: getAnonId(), isMobile: isMobileDevice(), referrer: (typeof document !== 'undefined' ? document.referrer : '') }),
      })
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setBoard({ ...EMPTY_BOARD, ...d }); })
        .catch(() => {});
    } catch (e) {}
  }

  function endGame(won) {
    const score = Object.keys(g.solved).length + (won ? 5 : 0);
    const g2 = { ...g, finalSolved: won, status: won ? 'won' : 'done', tEnd: Date.now() };
    if (won) g2.solvedAtEnd = true;
    postResult(g2, score);
    setG(g2);
    if (won) setJustWon(true);
  }

  function submit() {
    if (!playing) return;
    if (sel === 'final') {
      if (typed.length < PUZZLE.final.length) { say('Not enough letters'); return; }
      const g2 = { ...g };
      if (!g2.t0) g2.t0 = Date.now();
      if (typed === PUZZLE.final) {
        setTyped('');
        const score = Object.keys(g2.solved).length + 5;
        const g3 = { ...g2, finalSolved: true, status: 'won', tEnd: Date.now() };
        postResult(g3, score);
        setG(g3);
        setJustWon(true);
      } else {
        g2.misses = g.misses + 1;
        say('Not the finale — that’s a miss');
        setG(g2);
      }
      return;
    }
    const w = PUZZLE.words[sel];
    if (!w || g.solved[sel]) return;
    if (typed.length < w.answer.length) { say('Not enough letters'); return; }
    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    if (!sameLetters(typed, w.answer)) {
      say('Use exactly the letters shown');
      setG(g2);
      return;
    }
    if (typed === w.answer) {
      g2.solved = { ...g.solved, [sel]: true };
      setTyped('');
      const next = PUZZLE.words.findIndex((_, i) => !g2.solved[i]);
      setSel(next === -1 ? 'final' : next);
      say(`${w.answer} — untangled`);
    } else {
      g2.misses = g.misses + 1;
      say('A real tangle — that’s a miss');
    }
    setG(g2);
  }

  const onKey = useCallback((k) => {
    if (!playing) return;
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else if (/^[A-Z]$/.test(k)) setTyped((t) => (t.length < targetLen ? t + k : t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, sel, typed, targetLen, g]);

  useEffect(() => {
    function onDown(e) {
      if (showHelp) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Enter') { e.preventDefault(); onKey('ENTER'); }
      else if (e.key === 'Backspace') { e.preventDefault(); onKey('BACK'); }
      else if (/^[a-zA-Z]$/.test(e.key)) onKey(e.key.toUpperCase());
    }
    window.addEventListener('keydown', onDown);
    return () => window.removeEventListener('keydown', onDown);
  }, [onKey, showHelp]);

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(freshState(PUZZLE)); setSel(0); setTyped(''); setJustWon(false);
  }

  function shareText() {
    const row = PUZZLE.words.map((_, i) => (g.solved[i] ? '\u{1F7E6}' : '⬛')).join('');
    const star = g.finalSolved ? '⭐' : '⬛';
    const score = solvedCount + (g.finalSolved ? 5 : 0);
    return `Garble #${PUZZLE.num} · ${score}/10 · ${g.misses} miss${g.misses === 1 ? '' : 'es'} · ${elapsed}\n${row}${star}\nsourceoftruths.com/garble`;
  }
  function copyShare() {
    const text = playing
      ? `Garble #${PUZZLE.num} — five garbled words, one clued finale. Can you untangle it?\nsourceoftruths.com/garble`
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

  const ended = !playing;
  const won = g.status === 'won';
  const score = solvedCount + (g.finalSolved ? 5 : 0);

  const cellBase = { display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, borderRadius: 6, userSelect: 'none' };

  function wordRow(w, i) {
    const isSel = playing && sel === i && !g.solved[i];
    const solvedRow = !!g.solved[i];
    return (
      <div key={i} onClick={() => { if (playing && !g.solved[i]) { setSel(i); setTyped(''); } }} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, cursor: playing && !g.solved[i] ? 'pointer' : 'default', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {w.scramble.split('').map((ch, j) => (
            <span key={j} style={{ ...cellBase, width: 30, height: 30, fontSize: 15, background: COLORS.paper, color: COLORS.faded }}>{ch}</span>
          ))}
        </div>
        <span style={{ color: '#c3c8cf', fontWeight: 800 }}>&rarr;</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {w.answer.split('').map((ch, j) => {
            const marked = w.marks.includes(j);
            let bg = '#fff', fg = COLORS.ink, border = '1.5px solid rgba(20,22,28,0.18)';
            let letter = '';
            if (solvedRow || ended) {
              letter = ch;
              if (marked) { bg = COLORS.gold; fg = COLORS.goldInk; border = `1.5px solid ${COLORS.gold}`; }
              else { bg = solvedRow ? COLORS.ink : '#fff'; fg = solvedRow ? '#fff' : COLORS.rust; border = solvedRow ? `1.5px solid ${COLORS.ink}` : '1.5px dashed rgba(192,57,43,0.55)'; }
            } else if (isSel) {
              letter = typed[j] || '';
              bg = typed.length === j ? '#dbe7ff' : '#eef4ff';
              fg = COLORS.ember;
              border = `2px solid ${typed.length === j ? COLORS.ember : 'rgba(37,99,235,0.55)'}`;
            } else if (marked) {
              border = `2px solid ${COLORS.gold}`;
            }
            return <span key={j} style={{ ...cellBase, width: 38, height: 38, fontSize: 18, background: bg, color: fg, border }}>{letter}</span>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, position: 'relative' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 3 }}><SiteHeader active="quizzes" flush inlay={<QuizPlayerBar />} /></div>

      <div className="qzf-w" style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '8px 38px 80px', fontFamily: SANS }}>
        <div className="qzf-line" aria-hidden="true" />
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <style>{`
            .gb-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
            .gb-btn:hover{background:${COLORS.paper};}
            .gb-key{border:none;font-family:${SANS};font-weight:800;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;}
            .gb-key:active{transform:scale(0.94);}
            @keyframes gbfall{0%{transform:translateY(-4vh) rotate(0deg);}100%{transform:translateY(108vh) rotate(680deg);}}
            .gb-conf{position:fixed;top:-3vh;z-index:86;pointer-events:none;border-radius:2px;animation:gbfall linear forwards;}
          `}</style>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: COLORS.ink }}>Garble</h1>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: COLORS.ember, borderRadius: 6, padding: '2px 8px' }}>#{PUZZLE.num}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
            <button onClick={() => setShowHelp(true)} aria-label="How to play" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontWeight: 700, fontSize: 13 }}>
              <HelpCircle size={18} /> How to play
            </button>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 13.5, color: COLORS.faded, fontWeight: 600 }}>
            Five garbled words. The gold letters feed the finale.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded }}>
              Misses <span style={{ fontSize: 17, color: g.misses > 5 ? COLORS.rust : COLORS.ink, marginLeft: 4 }}>{g.misses}</span>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>{solvedCount}/5 untangled {g.finalSolved ? '· finale solved' : ''}</div>
            {playing && (
              <button onClick={() => endGame(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, fontFamily: SANS, fontWeight: 700, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Eye size={14} /> Reveal &amp; end
              </button>
            )}
          </div>

          <div style={{ marginBottom: 6 }}>{PUZZLE.words.map((w, i) => wordRow(w, i))}</div>

          {/* the finale */}
          <div onClick={() => { if (playing) { setSel('final'); setTyped(''); } }} style={{ background: '#fff', border: `2px solid ${playing && sel === 'final' ? COLORS.ember : 'rgba(20,22,28,0.14)'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 16, cursor: playing ? 'pointer' : 'default' }}>
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: COLORS.goldInk, marginBottom: 4 }}>The finale</div>
            <div style={{ fontSize: 15.5, fontWeight: 700, fontStyle: 'italic', color: COLORS.ink, marginBottom: 10 }}>&ldquo;{PUZZLE.clue}&rdquo;</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
              {bank.map((b, i) => (
                <span key={i} style={{ ...cellBase, width: 26, height: 26, fontSize: 13, background: g.solved[b.wi] || ended ? COLORS.gold : COLORS.paper, color: g.solved[b.wi] || ended ? COLORS.goldInk : COLORS.faded }}>{g.solved[b.wi] || ended ? b.ch : '?'}</span>
              ))}
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.faded, alignSelf: 'center', marginLeft: 6 }}>your collected letters</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {PUZZLE.final.split('').map((ch, j) => {
                const isSel = playing && sel === 'final';
                let letter = '', bg = '#fff', fg = COLORS.ink, border = '1.5px solid rgba(20,22,28,0.18)';
                if (ended || g.finalSolved) {
                  letter = ch;
                  bg = g.finalSolved ? COLORS.gold : '#fff';
                  fg = g.finalSolved ? COLORS.goldInk : COLORS.rust;
                  border = g.finalSolved ? `1.5px solid ${COLORS.gold}` : '1.5px dashed rgba(192,57,43,0.55)';
                } else if (isSel) {
                  letter = typed[j] || '';
                  bg = typed.length === j ? '#dbe7ff' : '#eef4ff';
                  fg = COLORS.ember;
                  border = `2px solid ${typed.length === j ? COLORS.ember : 'rgba(37,99,235,0.55)'}`;
                }
                return <span key={j} style={{ ...cellBase, width: 38, height: 38, fontSize: 18, background: bg, color: fg, border }}>{letter}</span>;
              })}
            </div>
          </div>

          {/* keyboard */}
          {playing && (
            <div style={{ maxWidth: 470 }}>
              {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
                <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
                  {ri === 2 && <button className="gb-key" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: '#fff', fontSize: 11.5 }}>ENTER</button>}
                  {row.split('').map((ch) => (
                    <button key={ch} className="gb-key" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: '#fff', color: COLORS.ink, fontSize: 15, border: '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>
                  ))}
                  {ri === 2 && <button className="gb-key" onClick={() => onKey('BACK')} aria-label="Delete" style={{ flex: '1.6 0 0', height: 44, background: COLORS.paper, color: COLORS.ink, fontSize: 16 }}>&#9003;</button>}
                </div>
              ))}
              <p style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 600, margin: '6px 0 0', textAlign: 'center' }}>
                Use exactly the letters shown. The finale is fair game at any time.
              </p>
            </div>
          )}

          {/* result */}
          {ended && (
            <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 14, maxWidth: 470 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: won ? COLORS.ember : COLORS.rust, marginBottom: 4 }}>
                {won ? 'Untangled.' : 'Revealed.'}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.faded, marginBottom: 12 }}>
                {score}/10 &middot; {g.misses} miss{g.misses === 1 ? '' : 'es'} &middot; {elapsed}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="gb-btn" onClick={copyShare}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                <button className="gb-btn" onClick={resetGame} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><RotateCcw size={15} /> Replay</button>
              </div>
            </div>
          )}
        </div>

        {/* bottom: share invite + join + leaderboard */}
        <div style={{ maxWidth: 640, margin: '30px auto 0' }}>
          {playing && (
            <button className="gb-btn" onClick={copyShare} style={{ width: '100%', justifyContent: 'center', textTransform: 'uppercase', fontSize: 12.5, letterSpacing: '0.05em', height: 52 }}>
              <Share2 size={14} strokeWidth={2.5} /> {copied ? 'Copied' : 'Share This Puzzle'}
            </button>
          )}
        </div>
        {!identity && (
          <div style={{ maxWidth: 640, margin: '18px auto 0' }}>
            <JoinLeaderboardForm identity={identity} onJoined={(id) => setIdentity(id)} />
          </div>
        )}
        <div style={{ maxWidth: 760, margin: '26px auto 0', background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 12, padding: '14px 16px' }}>
          <QuizLeaderboard board={board} identity={identity} total={10} />
        </div>
      </div>

      {justWon && (
        <>
          {Array.from({ length: 80 }).map((_, i) => {
            const confColors = [COLORS.gold, '#5aa96a', '#5a97dd', '#d96363', COLORS.ember];
            const w = 7 + ((i * 13) % 8);
            return <span key={i} className="gb-conf" style={{ left: `${(i * 137) % 100}%`, width: w, height: Math.round(w * 1.5), background: confColors[i % confColors.length], animationDuration: `${2.1 + ((i * 29) % 12) / 10}s`, animationDelay: `${((i * 53) % 70) / 100}s` }} />;
          })}
          <div onClick={() => setJustWon(false)} style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(20,22,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', border: `3px solid ${COLORS.gold}`, borderRadius: 16, padding: '30px 28px 24px', maxWidth: 440, width: '100%', textAlign: 'center', fontFamily: SANS }}>
              <Trophy size={42} strokeWidth={2} style={{ color: COLORS.gold }} />
              <div style={{ fontSize: 27, fontWeight: 800, color: COLORS.ink, letterSpacing: '-0.01em', margin: '10px 0 6px', lineHeight: 1.2 }}>Untangled: {PUZZLE.final}.</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.faded, marginBottom: 18 }}>{score}/10 &middot; {g.misses} miss{g.misses === 1 ? '' : 'es'} &middot; {elapsed}</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="gb-btn" onClick={copyShare} style={{ background: COLORS.ember, color: '#fff', borderColor: COLORS.ember }}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                <button className="gb-btn" onClick={() => setJustWon(false)}>See the board</button>
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)', background: COLORS.ink, color: '#fff', fontFamily: SANS, fontWeight: 800, fontSize: 13.5, padding: '10px 18px', borderRadius: 9, zIndex: 60, boxShadow: '0 6px 18px rgba(20,22,28,0.25)', maxWidth: '86vw', textAlign: 'center' }}>
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
            <div style={{ fontSize: 14, lineHeight: 1.55, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 9px' }}><b>Untangle five garbled words</b> &mdash; tap a row, type the word using exactly the letters shown, hit enter. Wrong words are <b>misses</b>.</p>
              <p style={{ margin: '0 0 9px' }}>Each solution donates its <span style={{ background: COLORS.gold, color: COLORS.goldInk, borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>gold letters</span> to <b>the finale</b> &mdash; a last answer with its clue printed up top. Solve it whenever you see it; the finale ends the game.</p>
              <p style={{ margin: 0 }}>Score is out of 10: one per word, five for the finale. Fewest misses breaks ties, then time.</p>
            </div>
            <button className="gb-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
