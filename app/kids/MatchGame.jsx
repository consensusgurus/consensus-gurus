'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import Grain from '../Grain';
import Footer from '../Footer';
import { formatCount } from '../Count';

// Generic Kids Corner matching (concentration) game engine. Pass a set of
// `items` ({ n: name, s: inline SVG string }); the board lays out two of each,
// face down, and the player finds the pairs. One- or two-player (turn based).
// `cols` sets the column count (5 for 10 pairs, 7 for 14 pairs); the board is
// sized to the viewport height so every card fits on one screen. The page-view
// count is recorded through the quiz-view system (the given `quizId`) so it
// surfaces in the admin Page Views / quiz analytics.
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const Star = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5 20.4l1.4-6.8L1.3 9l6.9-.7z" /></svg>
);
const Refresh = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);
const Eye = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
);
const Trophy = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#0f6e56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" /></svg>
);

export default function MatchGame({ items, title, intro, quizId, cols = 5, backLabel = 'Back to Kids Corner' }) {
  const N = items.length;
  const rows = Math.ceil((N * 2) / cols);
  const ratio = cols / rows;

  function orderedDeck() {
    const d = [];
    for (let i = 0; i < N; i++) { d.push({ pid: i }); d.push({ pid: i }); }
    return d.map((c, idx) => ({ pid: c.pid, key: idx }));
  }
  function buildDeck() {
    const d = orderedDeck();
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
    return d.map((c, idx) => ({ pid: c.pid, key: idx }));
  }

  const [mode, setMode] = useState(1);
  const [deck, setDeck] = useState(orderedDeck);
  const [flipped, setFlipped] = useState([]);
  const [done, setDone] = useState([]);
  const [cur, setCur] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [won, setWon] = useState(false);
  const [views, setViews] = useState(null);

  const flipRef = useRef([]);
  const doneRef = useRef([]);
  const lock = useRef(false);

  useEffect(() => {
    let on = true;
    fetch('/api/quiz/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId }) })
      .then((r) => r.json())
      .then((d) => { if (on && d && typeof d.count === 'number') setViews(d.count); })
      .catch(() => {});
    return () => { on = false; };
  }, [quizId]);

  // Shuffle on the client after mount. The initial render uses orderedDeck (the
  // same deterministic order on server and client), so hydration matches; the
  // shuffle is a post-hydration client update.
  useEffect(() => { setDeck(buildDeck()); }, []);

  function reset(nextMode) {
    const m = nextMode || mode;
    setMode(m);
    setDeck(buildDeck());
    flipRef.current = []; doneRef.current = []; lock.current = false;
    setFlipped([]); setDone([]); setCur(1); setScores({ 1: 0, 2: 0 }); setWon(false);
  }

  function onCard(i) {
    if (lock.current || won) return;
    if (flipRef.current.includes(i) || doneRef.current.includes(i)) return;
    const nf = [...flipRef.current, i];
    flipRef.current = nf;
    setFlipped(nf);
    if (nf.length < 2) return;
    lock.current = true;
    const [a, b] = nf;
    const player = cur;
    const m = mode;
    if (deck[a].pid === deck[b].pid) {
      setTimeout(() => {
        const nd = [...doneRef.current, a, b];
        doneRef.current = nd;
        setDone(nd);
        setScores((prev) => ({ ...prev, [player]: prev[player] + 1 }));
        flipRef.current = [];
        setFlipped([]);
        lock.current = false;
        if (nd.length === deck.length) setWon(true);
      }, 450);
    } else {
      setTimeout(() => {
        flipRef.current = [];
        setFlipped([]);
        if (m === 2) setCur((p) => (p === 1 ? 2 : 1));
        lock.current = false;
      }, 800);
    }
  }

  let winTitle = 'You found them all!';
  let winSub = 'Great matching.';
  if (won && mode === 2) {
    if (scores[1] > scores[2]) winTitle = 'Player 1 wins!';
    else if (scores[2] > scores[1]) winTitle = 'Player 2 wins!';
    else winTitle = "It's a tie!";
    winSub = `Player 1: ${scores[1]} pairs   ·   Player 2: ${scores[2]} pairs`;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', color: C.ink, position: 'relative', overflow: 'clip', fontFamily: FONT }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <SiteHeader active="" />
      </div>
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '18px 22px 70px' }}>
        <style>{`
          .mm-modes{display:inline-flex;border:1px solid ${C.line};border-radius:10px;overflow:hidden;background:#fff;}
          .mm-modes button{border:none;background:transparent;padding:8px 16px;font-size:13.5px;font-weight:700;cursor:pointer;color:${C.muted};font-family:${FONT};}
          .mm-modes button.on{background:${C.accent};color:#fff;}
          .mm-reset{display:inline-flex;align-items:center;gap:6px;border:1px solid ${C.line};background:#fff;color:${C.ink};font-family:${FONT};font-weight:700;font-size:13.5px;padding:8px 14px;border-radius:10px;cursor:pointer;}
          .mm-reset:hover{border-color:${C.accent};color:${C.accent};}
          .mm-scores{display:flex;gap:12px;margin:0 0 16px;}
          .mm-pl{flex:1;background:#fff;border:2px solid transparent;border-radius:12px;padding:10px 14px;}
          .mm-pl.on{border-color:${C.accent};background:#eef3fe;}
          .mm-pl .l{font-size:12px;font-weight:700;color:${C.soft};margin:0;text-transform:uppercase;letter-spacing:.05em;}
          .mm-pl.on .l{color:${C.accent};}
          .mm-pl .v{font-size:22px;font-weight:800;margin:2px 0 0;color:${C.ink};}
          .mm-board-wrap{position:relative;margin:0 auto;}
          .mm-board{display:grid;gap:12px;}
          .mm-card{position:relative;aspect-ratio:1;border:none;background:transparent;padding:0;cursor:pointer;perspective:700px;}
          .mm-inner{position:absolute;inset:0;transition:transform .35s;transform-style:preserve-3d;}
          .mm-card.flip .mm-inner,.mm-card.done .mm-inner{transform:rotateY(180deg);}
          .mm-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:14px;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 1px 3px rgba(20,22,28,0.08);}
          .mm-front{background:${C.accent};}
          .mm-back{background:#fff;border:2px solid ${C.line};transform:rotateY(180deg);}
          .mm-card.done .mm-back{border-color:#1d9e75;background:#e7f6ef;}
          .mm-card.done{cursor:default;}
          .mm-back svg{width:72%;height:72%;}
          .mm-win{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(231,246,239,.96);border-radius:16px;padding:1rem;}
          .mm-win h3{font-size:21px;font-weight:800;margin:8px 0 4px;color:#04342c;}
          .mm-win p{font-size:14px;color:#0f6e56;margin:0 0 16px;font-weight:600;}
          .mm-views{display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;color:${C.soft};font-weight:600;margin:20px 0 0;}
          @media(max-width:560px){.mm-board{grid-template-columns:repeat(4,1fr)!important;gap:9px;}.mm-board-wrap{width:100%!important;}}
        `}</style>

        <Link href="/kids" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: 'none', marginBottom: 12 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span> {backLabel}
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>{title}</h1>
        <p style={{ fontSize: 15.5, color: C.muted, margin: '0 0 18px', lineHeight: 1.5, maxWidth: 560 }}>
          {intro}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', margin: '0 0 16px' }}>
          <div className="mm-modes">
            <button className={mode === 1 ? 'on' : ''} onClick={() => reset(1)}>1 player</button>
            <button className={mode === 2 ? 'on' : ''} onClick={() => reset(2)}>2 players</button>
          </div>
          <button className="mm-reset" style={{ marginLeft: 'auto' }} onClick={() => reset()}><Refresh /> New game</button>
        </div>

        {mode === 2 && (
          <div className="mm-scores">
            <div className={`mm-pl${cur === 1 ? ' on' : ''}`}><p className="l">Player 1</p><p className="v">{scores[1]}</p></div>
            <div className={`mm-pl${cur === 2 ? ' on' : ''}`}><p className="l">Player 2</p><p className="v">{scores[2]}</p></div>
          </div>
        )}

        <div className="mm-board-wrap" style={{ width: `min(100%, calc((100vh - 320px) * ${ratio.toFixed(4)}))` }}>
          <div className="mm-board" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {deck.map((c, i) => {
              const up = flipped.includes(i) || done.includes(i);
              const isDone = done.includes(i);
              return (
                <button key={c.key} className={`mm-card${up ? ' flip' : ''}${isDone ? ' done' : ''}`} onClick={() => onCard(i)} aria-label={up ? items[c.pid].n : 'Hidden card'}>
                  <span className="mm-inner">
                    <span className="mm-face mm-front"><Star /></span>
                    <span className="mm-face mm-back" dangerouslySetInnerHTML={{ __html: items[c.pid].s }} />
                  </span>
                </button>
              );
            })}
          </div>
          {won && (
            <div className="mm-win">
              <Trophy />
              <h3>{winTitle}</h3>
              <p>{winSub}</p>
              <button className="mm-reset" onClick={() => reset()}><Refresh /> Play again</button>
            </div>
          )}
        </div>

        <div className="mm-views"><Eye /> {views == null ? '—' : formatCount(views)} views</div>
      </div>
      <Footer />
    </div>
  );
}
