'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import Grain from '../../Grain';
import Footer from '../../Footer';
import { formatCount } from '../../Count';

// Kids Corner — Memory Match. A picture-matching (concentration) game: 20 cards,
// 10 pairs of kid-friendly snacks, drawn as inline SVG (no image files, no
// hosting, no licensing). One-player or two-player (turn-based) modes. The page
// view count is recorded through the quiz-view system (quizId 'kids-memory-match')
// so it surfaces in the admin Page Views / quiz analytics.
const C = { ink: '#1c1e24', accent: '#2563eb', muted: '#6b7280', soft: '#9aa0ab', line: 'rgba(20,22,28,0.09)' };
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

const FOODS = [
  { n: 'Chicken tenders', s: '<svg viewBox="0 0 100 100"><g><rect x="18" y="32" width="26" height="46" rx="13" fill="#d9933a" transform="rotate(-14 31 55)"/><rect x="40" y="26" width="26" height="50" rx="13" fill="#e6a94e" transform="rotate(8 53 51)"/><circle cx="30" cy="50" r="2" fill="#a9701f"/><circle cx="35" cy="62" r="2" fill="#a9701f"/><circle cx="52" cy="44" r="2" fill="#b87d28"/><circle cx="56" cy="58" r="2" fill="#b87d28"/></g></svg>' },
  { n: 'French fries', s: '<svg viewBox="0 0 100 100"><g><rect x="38" y="22" width="7" height="40" rx="2" fill="#f2c14e"/><rect x="47" y="16" width="7" height="46" rx="2" fill="#f7cf63"/><rect x="56" y="24" width="7" height="38" rx="2" fill="#f2c14e"/><rect x="30" y="30" width="7" height="34" rx="2" fill="#f7cf63"/><rect x="64" y="32" width="7" height="32" rx="2" fill="#f2c14e"/><path d="M28 56 h44 l-6 28 h-32 z" fill="#e24b4a"/><rect x="34" y="62" width="32" height="8" fill="#fff" opacity="0.85"/></g></svg>' },
  { n: 'Ketchup', s: '<svg viewBox="0 0 100 100"><g><rect x="40" y="14" width="20" height="10" rx="3" fill="#a32d2d"/><rect x="36" y="24" width="28" height="60" rx="12" fill="#e24b4a"/><rect x="40" y="44" width="20" height="22" rx="4" fill="#fff"/><circle cx="50" cy="55" r="6" fill="#e24b4a"/></g></svg>' },
  { n: 'Popsicle', s: '<svg viewBox="0 0 100 100"><g><rect x="46" y="64" width="8" height="24" rx="3" fill="#c79a5b"/><rect x="32" y="16" width="36" height="56" rx="18" fill="#ef6ea0"/><rect x="38" y="22" width="8" height="18" rx="4" fill="#fff" opacity="0.5"/></g></svg>' },
  { n: 'Hot dog', s: '<svg viewBox="0 0 100 100"><g><rect x="16" y="40" width="68" height="22" rx="11" fill="#e7b96a"/><rect x="22" y="46" width="56" height="12" rx="6" fill="#c0392b"/><path d="M26 52 q6 -6 12 0 q6 6 12 0 q6 -6 12 0 q6 6 10 0" fill="none" stroke="#f2c14e" stroke-width="3" stroke-linecap="round"/></g></svg>' },
  { n: 'Ice cream', s: '<svg viewBox="0 0 100 100"><g><path d="M38 50 h24 l-12 34 z" fill="#e0b070"/><path d="M42 56 l16 -8 M45 66 l13 -7" stroke="#c79a5b" stroke-width="2" fill="none"/><circle cx="50" cy="40" r="18" fill="#f7a6c4"/><circle cx="50" cy="22" r="4" fill="#c0392b"/></g></svg>' },
  { n: 'Smoothie', s: '<svg viewBox="0 0 100 100"><g><rect x="44" y="10" width="6" height="34" rx="3" fill="#7f77dd" transform="rotate(12 47 28)"/><path d="M34 34 h32 l-4 50 h-24 z" fill="#f4c0d1"/><path d="M34 34 h32 l-1 12 h-30 z" fill="#ed93b1"/><rect x="32" y="30" width="36" height="8" rx="3" fill="#d4537e"/></g></svg>' },
  { n: 'Dino nuggets', s: '<svg viewBox="0 0 100 100"><g fill="#d99a3e"><path d="M22 76 q-7 -2 -7 -11 q0 -11 11 -13 q2 -9 11 -11 q0 -19 17 -19 q13 0 13 15 q0 9 -9 13 q13 2 15 15 q1 9 -4 15 z"/><rect x="28" y="71" width="6" height="11" rx="3"/><rect x="52" y="73" width="6" height="11" rx="3"/></g><g fill="#b1772a"><circle cx="30" cy="58" r="1.6"/><circle cx="40" cy="50" r="1.6"/><circle cx="36" cy="64" r="1.6"/><circle cx="50" cy="44" r="1.6"/><circle cx="44" cy="38" r="1.6"/><circle cx="55" cy="61" r="1.6"/></g><circle cx="46" cy="27" r="2" fill="#6b4a17"/></svg>' },
  { n: 'Pizza', s: '<svg viewBox="0 0 100 100"><g><path d="M50 16 L78 78 H22 Z" fill="#f4d58a"/><path d="M22 78 H78 l-4 -9 H26 z" fill="#e0a85a"/><circle cx="44" cy="52" r="5" fill="#c0392b"/><circle cx="58" cy="60" r="5" fill="#c0392b"/><circle cx="50" cy="36" r="4" fill="#c0392b"/></g></svg>' },
  { n: 'Quesadilla', s: '<svg viewBox="0 0 100 100"><g><path d="M50 24 L80 76 H20 Z" fill="#e7b96a"/><path d="M50 24 L80 76 H20 Z" fill="none" stroke="#c79a5b" stroke-width="3" stroke-linejoin="round"/><path d="M50 24 V76" stroke="#c79a5b" stroke-width="2"/><path d="M40 60 q5 8 11 4" stroke="#f2c14e" stroke-width="3" fill="none"/><circle cx="42" cy="50" r="2" fill="#d9933a"/><circle cx="58" cy="58" r="2" fill="#d9933a"/></g></svg>' },
];

// Deterministic ordered deck for the FIRST (server + initial client) render, so
// the markup matches and React can hydrate. The cards are face down, so order is
// invisible; we shuffle on mount (see the effect below) for actual play. Doing
// the shuffle during render would make the server and client disagree and throw
// a hydration error.
function orderedDeck() {
  const d = [];
  for (let i = 0; i < FOODS.length; i++) { d.push({ pid: i }); d.push({ pid: i }); }
  return d.map((c, idx) => ({ pid: c.pid, key: idx }));
}

function buildDeck() {
  const d = orderedDeck();
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
  return d.map((c, idx) => ({ pid: c.pid, key: idx }));
}

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

export default function MemoryMatchClient() {
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
    fetch('/api/quiz/view', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId: 'kids-memory-match' }) })
      .then((r) => r.json())
      .then((d) => { if (on && d && typeof d.count === 'number') setViews(d.count); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

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
          .mm-board-wrap{position:relative;width:min(100%, calc((100vh - 320px) * 1.25));margin:0 auto;}
          .mm-board{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
          .mm-card{position:relative;aspect-ratio:1;border:none;background:transparent;padding:0;cursor:pointer;perspective:700px;}
          .mm-inner{position:absolute;inset:0;transition:transform .35s;transform-style:preserve-3d;}
          .mm-card.flip .mm-inner,.mm-card.done .mm-inner{transform:rotateY(180deg);}
          .mm-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:14px;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 1px 3px rgba(20,22,28,0.08);}
          .mm-front{background:${C.accent};}
          .mm-back{background:#fff;border:2px solid ${C.line};transform:rotateY(180deg);}
          .mm-card.done .mm-back{border-color:#1d9e75;background:#e7f6ef;}
          .mm-card.done{cursor:default;}
          .mm-back svg{width:68%;height:68%;}
          .mm-win{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(231,246,239,.96);border-radius:16px;padding:1rem;}
          .mm-win h3{font-size:21px;font-weight:800;margin:8px 0 4px;color:#04342c;}
          .mm-win p{font-size:14px;color:#0f6e56;margin:0 0 16px;font-weight:600;}
          .mm-views{display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;color:${C.soft};font-weight:600;margin:20px 0 0;}
          @media(max-width:560px){.mm-board{grid-template-columns:repeat(4,1fr);gap:9px;}.mm-board-wrap{width:100%;}}
        `}</style>

        <Link href="/kids" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.muted, textDecoration: 'none', marginBottom: 12 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span> Back to Kids Corner
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Memory Match</h1>
        <p style={{ fontSize: 15.5, color: C.muted, margin: '0 0 18px', lineHeight: 1.5, maxWidth: 560 }}>
          Flip the cards and find all ten matching snacks. Play on your own, or pass and play with a friend.
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

        <div className="mm-board-wrap">
          <div className="mm-board">
            {deck.map((c, i) => {
              const up = flipped.includes(i) || done.includes(i);
              const isDone = done.includes(i);
              return (
                <button key={c.key} className={`mm-card${up ? ' flip' : ''}${isDone ? ' done' : ''}`} onClick={() => onCard(i)} aria-label={up ? FOODS[c.pid].n : 'Hidden card'}>
                  <span className="mm-inner">
                    <span className="mm-face mm-front"><Star /></span>
                    <span className="mm-face mm-back" dangerouslySetInnerHTML={{ __html: FOODS[c.pid].s }} />
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
