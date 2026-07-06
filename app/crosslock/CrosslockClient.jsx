'use client';

// Crosslock — a clue-less mini crossword with letter-feedback guessing and
// hidden category pairs.
//
// Eight hidden words interlock in a mini crossword grid. There are no clues:
// the only hints are four categories, each owning exactly two of the eight
// words (which slots? that's the puzzle). Every slot is solved by guessing —
// type any letters, get locked/close feedback per letter — and locked
// letters stay in the grid, bleeding into crossing slots. The whole
// board shares one guess budget. Solved words must then be filed under their
// category: completing a pair refunds a guess, filing wrong costs a strike
// (four strikes ends the game).
//
// Soft launch: this page is intentionally NOT linked from the homepage, the
// /quizzes hub, or the sitemap. Reachable only at /crosslock.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HelpCircle, Share2, RotateCcw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Grain from '../Grain';
import Footer from '../Footer';
import SiteHeader from '../SiteHeader';

const COLORS = {
  cream: '#f7f8fa',
  paper: '#eceef1',
  ink: '#1c1e24',
  ember: '#2563eb',
  rust: '#c0392b',
  faded: '#6b7280',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Same difficulty palette as the site's group-guessing quiz boards (easy -> hard).
const CAT_COLORS = [
  { bg: '#e6b93f', tc: '#5c4a06', sq: '\u{1F7E8}' },
  { bg: '#5aa96a', tc: '#173f1f', sq: '\u{1F7E9}' },
  { bg: '#5a97dd', tc: '#0c3a66', sq: '\u{1F7E6}' },
  { bg: '#9b82d8', tc: '#2e1f60', sq: '\u{1F7EA}' },
];

const PUZZLE = {
  num: 1,
  dateLabel: 'July 6, 2026',
  guesses: 16,
  categories: [
    { name: 'Card games', words: ['HEARTS', 'BRIDGE'] },
    { name: 'Musical instruments', words: ['ORGAN', 'VIOLA'] },
    { name: 'Body parts', words: ['SPLEEN', 'TEMPLE'] },
    { name: 'Structures', words: ['TOWER', 'STEEPLE'] },
  ],
  // 9x10 lattice, machine-searched: every crossing letter-checked, no
  // adjacent cells outside a shared slot, all eight words connected.
  slots: [
    { id: '1D', word: 'VIOLA', row: 0, col: 1, dir: 'D' },
    { id: '2D', word: 'HEARTS', row: 1, col: 3, dir: 'D' },
    { id: '3D', word: 'BRIDGE', row: 1, col: 9, dir: 'D' },
    { id: '4A', word: 'TOWER', row: 2, col: 0, dir: 'A' },
    { id: '5D', word: 'SPLEEN', row: 3, col: 5, dir: 'D' },
    { id: '6D', word: 'TEMPLE', row: 3, col: 7, dir: 'D' },
    { id: '7A', word: 'STEEPLE', row: 6, col: 3, dir: 'A' },
    { id: '8A', word: 'ORGAN', row: 8, col: 1, dir: 'A' },
  ],
};
const ROWS = 9;
const COLS = 10;
const STORE_KEY = `sot_crosslock_${PUZZLE.num}`;
const HELP_KEY = 'sot_crosslock_help_seen';

const SLOT = Object.fromEntries(PUZZLE.slots.map((s) => [s.id, s]));

function slotCells(s) {
  return s.word.split('').map((ch, i) => ({
    r: s.dir === 'A' ? s.row : s.row + i,
    c: s.dir === 'A' ? s.col + i : s.col,
    ch,
  }));
}

// key "r,c" -> { ch, slots: [slotIds] }
const CELLS = (() => {
  const m = new Map();
  for (const s of PUZZLE.slots) {
    for (const cl of slotCells(s)) {
      const k = `${cl.r},${cl.c}`;
      if (!m.has(k)) m.set(k, { ch: cl.ch, slots: [] });
      m.get(k).slots.push(s.id);
    }
  }
  return m;
})();

function catOfWord(w) {
  return PUZZLE.categories.findIndex((c) => c.words.includes(w));
}
function slotLabel(id) {
  return `${parseInt(id, 10)}-${id.endsWith('A') ? 'Across' : 'Down'}`;
}
function fmtTime(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Standard Wordle marking with duplicate handling.
export function computeMarks(guess, answer) {
  const n = answer.length;
  const marks = Array(n).fill('x');
  const rem = {};
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) marks[i] = 'g';
    else rem[answer[i]] = (rem[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < n; i++) {
    if (marks[i] !== 'g' && rem[guess[i]] > 0) {
      marks[i] = 'y';
      rem[guess[i]] -= 1;
    }
  }
  return marks;
}

const FRESH = {
  v: 1,
  greens: {},          // "r,c" -> true (letter is locked correct)
  solved: {},          // slotId -> true
  slotGuesses: {},     // slotId -> guesses spent on that slot
  present: {},         // slotId -> "ABC" letters known in word (yellow)
  absent: {},          // slotId -> "XYZ" letters known absent
  lastGuess: {},       // slotId -> { word, marks[] }
  assigned: {},        // WORD -> category index (correct filings only)
  order: [],           // slotIds in solve order
  strikes: 0,
  left: PUZZLE.guesses,
  status: 'playing',   // playing | won | lost
  t0: null,
  tEnd: null,
};

export default function CrosslockClient() {
  const [g, setG] = useState(FRESH);
  const [sel, setSel] = useState('1D');
  const [typed, setTyped] = useState('');
  const [pick, setPick] = useState(null); // solved word chosen for filing
  const [showHelp, setShowHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef(null);

  // ---- persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1) setG({ ...FRESH, ...saved });
      }
      if (!localStorage.getItem(HELP_KEY)) setShowHelp(true);
    } catch (e) {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(g)); } catch (e) {}
  }, [g, hydrated]);

  function say(msg) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  const slot = SLOT[sel];
  const cells = useMemo(() => (slot ? slotCells(slot) : []), [slot]);
  const editable = cells.filter((cl) => !g.greens[`${cl.r},${cl.c}`]);
  const playing = g.status === 'playing';

  // ---- input ----
  const onKey = useCallback((k) => {
    if (g.status !== 'playing') return;
    if (!slot || g.solved[sel]) return;
    if (k === 'ENTER') submit();
    else if (k === 'BACK') setTyped((t) => t.slice(0, -1));
    else if (/^[A-Z]$/.test(k)) setTyped((t) => (t.length < editable.length ? t + k : t));
  }, [g, sel, slot, typed, editable.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function sweepAutoSolve(g2) {
    for (const s of PUZZLE.slots) {
      if (g2.solved[s.id]) continue;
      const full = slotCells(s).every((cl) => g2.greens[`${cl.r},${cl.c}`]);
      if (full) {
        g2.solved = { ...g2.solved, [s.id]: true };
        g2.order = [...g2.order, s.id];
      }
    }
  }

  function nextUnsolved(g2, fromId) {
    const ids = PUZZLE.slots.map((s) => s.id);
    const start = Math.max(0, ids.indexOf(fromId));
    for (let i = 1; i <= ids.length; i++) {
      const id = ids[(start + i) % ids.length];
      if (!g2.solved[id]) return id;
    }
    return fromId;
  }

  function submit() {
    if (!playing || !slot || g.solved[sel]) return;
    if (typed.length < editable.length) { say('Not enough letters'); return; }
    let ti = 0;
    const letters = cells.map((cl) => (g.greens[`${cl.r},${cl.c}`] ? cl.ch : typed[ti++]));
    const guess = letters.join('');
    const marks = computeMarks(guess, slot.word);

    const g2 = { ...g };
    if (!g2.t0) g2.t0 = Date.now();
    g2.left = g.left - 1;
    g2.slotGuesses = { ...g.slotGuesses, [sel]: (g.slotGuesses[sel] || 0) + 1 };
    const greens2 = { ...g.greens };
    cells.forEach((cl, i) => { if (marks[i] === 'g') greens2[`${cl.r},${cl.c}`] = true; });
    g2.greens = greens2;

    const pres = new Set((g.present[sel] || '').split('').filter(Boolean));
    const abs = new Set((g.absent[sel] || '').split('').filter(Boolean));
    marks.forEach((m, i) => {
      const L = guess[i];
      if (m === 'y') pres.add(L);
      else if (m === 'x') {
        const elsewhere = marks.some((mm, j) => j !== i && guess[j] === L && mm !== 'x');
        if (!elsewhere) abs.add(L);
      }
    });
    g2.present = { ...g.present, [sel]: [...pres].join('') };
    g2.absent = { ...g.absent, [sel]: [...abs].join('') };
    g2.lastGuess = { ...g.lastGuess, [sel]: { word: guess, marks } };

    if (guess === slot.word) {
      g2.solved = { ...g2.solved, [sel]: true };
      g2.order = [...g2.order, sel];
      say(`${slot.word} — solved. File it under a category.`);
    }
    sweepAutoSolve(g2);

    const allSolved = PUZZLE.slots.every((s) => g2.solved[s.id]);
    if (!allSolved && g2.left <= 0) {
      g2.status = 'lost';
      g2.tEnd = Date.now();
    }
    setTyped('');
    if (g2.solved[sel] && g2.status === 'playing') setSel(nextUnsolved(g2, sel));
    setG(g2);
  }

  function fileWord(word, ci) {
    if (!playing) return;
    const correct = PUZZLE.categories[ci].words.includes(word);
    if (correct) {
      const assigned2 = { ...g.assigned, [word]: ci };
      const g2 = { ...g, assigned: assigned2 };
      const pairDone = PUZZLE.categories[ci].words.every((w) => assigned2[w] === ci);
      if (pairDone) {
        g2.left = g.left + 1;
        say(`${PUZZLE.categories[ci].name} complete — +1 guess back`);
      }
      const allFiled = PUZZLE.slots.every((s) => assigned2[s.word] !== undefined);
      if (allFiled && PUZZLE.slots.every((s) => g2.solved[s.id])) {
        g2.status = 'won';
        g2.tEnd = Date.now();
      }
      setG(g2);
    } else {
      const strikes2 = g.strikes + 1;
      const g2 = { ...g, strikes: strikes2 };
      if (strikes2 >= 4) { g2.status = 'lost'; g2.tEnd = Date.now(); }
      else say(`Not ${PUZZLE.categories[ci].name.toLowerCase()} — strike ${strikes2} of 4`);
      setG(g2);
    }
    setPick(null);
  }

  function cellClick(r, c) {
    const info = CELLS.get(`${r},${c}`);
    if (!info || !playing) return;
    const unsolvedIds = info.slots.filter((id) => !g.solved[id]);
    const pool = unsolvedIds.length ? unsolvedIds : info.slots;
    if (pool.length > 1 && pool.includes(sel)) setSel(pool.find((id) => id !== sel));
    else setSel(pool[0]);
    setTyped('');
  }

  function cycleSlot(dirn) {
    const ids = PUZZLE.slots.map((s) => s.id).filter((id) => !g.solved[id]);
    if (!ids.length) return;
    const i = Math.max(0, ids.indexOf(sel));
    setSel(ids[(i + (dirn === 1 ? 1 : ids.length - 1)) % ids.length]);
    setTyped('');
  }

  function resetGame() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    setG(FRESH); setSel('1D'); setTyped(''); setPick(null);
  }

  const guessesUsed = Object.values(g.slotGuesses).reduce((a, b) => a + b, 0);
  const elapsed = g.t0 ? fmtTime((g.tEnd || Date.now()) - g.t0) : '0:00';

  function shareText() {
    const squares = g.order
      .map((sid) => CAT_COLORS[catOfWord(SLOT[sid].word)].sq + (g.slotGuesses[sid] || 0))
      .join(' ');
    const head = g.status === 'won'
      ? `Solved in ${guessesUsed} guesses · ${g.strikes} strike${g.strikes === 1 ? '' : 's'} · ${elapsed}`
      : `${g.order.length}/8 words · ${g.strikes} strike${g.strikes === 1 ? '' : 's'}`;
    return `Crosslock #${PUZZLE.num}\n${head}\n${squares}${g.order.length < 8 ? ' ⬛'.repeat(8 - g.order.length) : ''}\nsourceoftruths.com/crosslock`;
  }
  function copyShare() {
    try {
      navigator.clipboard?.writeText(shareText()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } catch (e) {}
  }

  // next editable cell (cursor) in the selected slot
  const cursorKey = (() => {
    if (!playing || !slot || g.solved[sel]) return null;
    const cl = editable[typed.length];
    return cl ? `${cl.r},${cl.c}` : null;
  })();

  // typed letters mapped onto cells
  const typedAt = {};
  if (slot && !g.solved[sel]) editable.forEach((cl, i) => { if (typed[i]) typedAt[`${cl.r},${cl.c}`] = typed[i]; });

  const selCellKeys = new Set(cells.map((cl) => `${cl.r},${cl.c}`));

  // keyboard letter states for the selected slot
  const keyState = {};
  if (slot) {
    const presStr = g.present[sel] || '';
    const absStr = g.absent[sel] || '';
    for (const ch of absStr) keyState[ch] = 'x';
    for (const ch of presStr) keyState[ch] = 'y';
    cells.forEach((cl) => { if (g.greens[`${cl.r},${cl.c}`]) keyState[cl.ch] = 'g'; });
  }

  const solvedUnfiled = PUZZLE.slots
    .filter((s) => g.solved[s.id] && g.assigned[s.word] === undefined)
    .map((s) => s.word);

  const lost = g.status === 'lost';
  const won = g.status === 'won';

  function cellStyle(r, c, info) {
    const k = `${r},${c}`;
    const green = g.greens[k];
    // a cell owned by any solved+filed word takes that category's tint
    let cat = null;
    for (const id of info.slots) {
      const w = SLOT[id].word;
      if (g.solved[id] && g.assigned[w] !== undefined) { cat = CAT_COLORS[g.assigned[w]]; break; }
    }
    const inSel = playing && selCellKeys.has(k) && !g.solved[sel];
    const base = {
      width: 'var(--cs)', height: 'var(--cs)', borderRadius: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: SANS, fontWeight: 800, fontSize: 'calc(var(--cs) * 0.48)',
      cursor: playing ? 'pointer' : 'default', userSelect: 'none',
      gridRow: r + 1, gridColumn: c + 1, position: 'relative',
      transition: 'background .12s,border-color .12s',
    };
    if (cat) return { ...base, background: cat.bg, color: cat.tc, border: `1.5px solid ${cat.bg}` };
    if (green) return { ...base, background: COLORS.ink, color: '#fff', border: `1.5px solid ${COLORS.ink}` };
    if (lost) return { ...base, background: '#fff', color: COLORS.rust, border: '1.5px dashed rgba(192,57,43,0.55)' };
    if (inSel) {
      const isCursor = cursorKey === k;
      return {
        ...base,
        background: isCursor ? '#dbe7ff' : '#eef4ff',
        color: COLORS.ember,
        border: `2px solid ${isCursor ? COLORS.ember : 'rgba(37,99,235,0.55)'}`,
      };
    }
    return { ...base, background: '#fff', color: COLORS.ink, border: '1.5px solid rgba(20,22,28,0.18)' };
  }

  function cellLetter(r, c, info) {
    const k = `${r},${c}`;
    if (g.greens[k]) return info.ch;
    if (lost) return info.ch;
    if (typedAt[k]) return typedAt[k];
    return '';
  }

  const startNum = {};
  PUZZLE.slots.forEach((s) => {
    const k = `${s.row},${s.col}`;
    if (!startNum[k]) startNum[k] = parseInt(s.id, 10);
  });

  const KB = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  const kbColors = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#6b7280' } };

  const lastG = g.lastGuess[sel];
  const markColor = { g: { bg: COLORS.ink, fg: '#fff' }, y: { bg: '#e6b93f', fg: '#5c4a06' }, x: { bg: '#c9cdd4', fg: '#40434b' } };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.cream, position: 'relative' }}>
      <Grain />
      <div style={{ position: 'relative', zIndex: 3 }}><SiteHeader active="quizzes" /></div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 980, margin: '0 auto', padding: '14px 16px 70px', fontFamily: SANS }}>
        <style>{`
          .cl-cols{display:grid;grid-template-columns:minmax(0,auto) minmax(280px,1fr);gap:30px;align-items:start;}
          @media(max-width:860px){.cl-cols{grid-template-columns:1fr;gap:18px;}}
          .cl-grid{--cs:42px;}
          @media(max-width:560px){.cl-grid{--cs:calc((100vw - 62px)/10);}}
          .cl-key{border:none;font-family:${SANS};font-weight:800;cursor:pointer;border-radius:6px;padding:0;touch-action:manipulation;}
          .cl-grid > div{touch-action:manipulation;}
          .cl-key:active{transform:scale(0.94);}
          .cl-btn{font-family:${SANS};font-weight:800;font-size:14px;border:2px solid ${COLORS.ink};background:#fff;color:${COLORS.ink};border-radius:8px;padding:9px 16px;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
          .cl-btn:hover{background:${COLORS.paper};}
        `}</style>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 2 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: COLORS.ink }}>Crosslock</h1>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: COLORS.ember, borderRadius: 6, padding: '2px 8px' }}>#{PUZZLE.num}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.faded }}>{PUZZLE.dateLabel}</span>
          <button onClick={() => setShowHelp(true)} aria-label="How to play" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: COLORS.faded, display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontWeight: 700, fontSize: 13 }}>
            <HelpCircle size={18} /> How to play
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: COLORS.faded, fontWeight: 600 }}>
          A crossword with no clues &mdash; the four categories are the only hints. One shared guess budget.
        </p>

        {/* status strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded }}>Guesses</span>
            <span style={{ fontSize: 17, fontWeight: 800, color: g.left <= 3 ? COLORS.rust : COLORS.ink }}>{g.left}</span>
            <div style={{ width: 90, height: 7, background: '#e2e5ea', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, (g.left / PUZZLE.guesses) * 100))}%`, height: '100%', background: g.left <= 3 ? COLORS.rust : COLORS.ember, transition: 'width .2s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded }}>Strikes</span>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: i < g.strikes ? COLORS.rust : 'transparent', border: `2px solid ${i < g.strikes ? COLORS.rust : '#c3c8cf'}` }} />
            ))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.faded }}>{g.order.length}/8 words solved</div>
        </div>

        <div className="cl-cols">
          {/* left: board + input */}
          <div>
            <div className="cl-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(10, var(--cs))', gridTemplateRows: 'repeat(9, var(--cs))', gap: 3, marginBottom: 12 }}>
              {[...CELLS.entries()].map(([k, info]) => {
                const [r, c] = k.split(',').map(Number);
                return (
                  <div key={k} onClick={() => cellClick(r, c)} style={cellStyle(r, c, info)}>
                    {startNum[k] ? <span style={{ position: 'absolute', top: 1, left: 3, fontSize: 'calc(var(--cs) * 0.22)', fontWeight: 800, opacity: 0.65 }}>{startNum[k]}</span> : null}
                    {cellLetter(r, c, info)}
                  </div>
                );
              })}
            </div>

            {/* selected slot bar */}
            {playing && slot && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <button className="cl-key" onClick={() => cycleSlot(-1)} aria-label="Previous word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={17} /></button>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.ink }}>
                  {slotLabel(sel)} <span style={{ color: COLORS.faded, fontWeight: 700 }}>&middot; {slot.word.length} letters &middot; {(g.slotGuesses[sel] || 0)} guess{(g.slotGuesses[sel] || 0) === 1 ? '' : 'es'} spent</span>
                </div>
                <button className="cl-key" onClick={() => cycleSlot(1)} aria-label="Next word" style={{ background: COLORS.paper, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={17} /></button>
              </div>
            )}

            {/* last guess feedback for this slot */}
            {playing && lastG && !g.solved[sel] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginRight: 4 }}>Last try</span>
                {lastG.word.split('').map((ch, i) => {
                  const mc = markColor[lastG.marks[i]];
                  return <span key={i} style={{ width: 26, height: 26, borderRadius: 5, background: mc.bg, color: mc.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{ch}</span>;
                })}
                <span style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 700, marginLeft: 6 }}>
                  {(g.present[sel] || '') ? <>in word: <b style={{ color: '#8a6d1a' }}>{(g.present[sel] || '').split('').join(' ')}</b></> : null}
                </span>
              </div>
            )}

            {/* keyboard */}
            {playing && (
              <div style={{ maxWidth: 470 }}>
                {KB.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 5, justifyContent: 'center' }}>
                    {ri === 2 && (
                      <button className="cl-key" onClick={() => onKey('ENTER')} style={{ flex: '1.6 0 0', height: 44, background: COLORS.ember, color: '#fff', fontSize: 11.5 }}>ENTER</button>
                    )}
                    {row.split('').map((ch) => {
                      const st = keyState[ch];
                      const kc = st ? kbColors[st] : { bg: '#fff', fg: COLORS.ink };
                      return (
                        <button key={ch} className="cl-key" onClick={() => onKey(ch)} style={{ flex: '1 0 0', height: 44, background: kc.bg, color: kc.fg, fontSize: 15, border: st ? 'none' : '1.5px solid rgba(20,22,28,0.15)' }}>{ch}</button>
                      );
                    })}
                    {ri === 2 && (
                      <button className="cl-key" onClick={() => onKey('BACK')} aria-label="Delete" style={{ flex: '1.6 0 0', height: 44, background: COLORS.paper, color: COLORS.ink, fontSize: 16 }}>&#9003;</button>
                    )}
                  </div>
                ))}
                <p style={{ fontSize: 11.5, color: COLORS.faded, fontWeight: 600, margin: '6px 0 0', textAlign: 'center' }}>
                  Any letters make a legal guess &mdash; the budget is the constraint.
                </p>
              </div>
            )}
          </div>

          {/* right: categories + filing + result */}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: COLORS.faded, marginBottom: 8 }}>
              The categories &mdash; each hides two of the eight words
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {PUZZLE.categories.map((cat, ci) => {
                const cc = CAT_COLORS[ci];
                const filed = Object.keys(g.assigned).filter((w) => g.assigned[w] === ci);
                const clickable = playing && pick;
                return (
                  <div key={ci} onClick={clickable ? () => fileWord(pick, ci) : undefined}
                    style={{ background: cc.bg, borderRadius: 10, padding: '10px 12px', minHeight: 74, cursor: clickable ? 'pointer' : 'default', outline: clickable ? `2.5px dashed ${cc.tc}` : 'none', outlineOffset: 2 }}>
                    <div style={{ color: cc.tc, fontWeight: 800, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '.03em', lineHeight: 1.25, marginBottom: 7 }}>{cat.name}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {[0, 1].map((i) => {
                        const w = filed[i];
                        const revealed = !w && lost ? cat.words.filter((x) => !filed.includes(x))[i - filed.length] : null;
                        return w ? (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.6)', color: cc.tc, borderRadius: 6, padding: '3px 8px', fontWeight: 800, fontSize: 12.5 }}>{w}</span>
                        ) : revealed ? (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 8px', fontWeight: 700, fontSize: 12.5, opacity: 0.75, textDecoration: 'line-through' }}>{revealed}</span>
                        ) : (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.28)', color: cc.tc, borderRadius: 6, padding: '3px 14px', fontWeight: 800, fontSize: 12.5 }}>?</span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* filing tray */}
            {playing && solvedUnfiled.length > 0 && (
              <div style={{ background: '#fff', border: '1.5px solid rgba(20,22,28,0.12)', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.ink, marginBottom: 7 }}>
                  {pick ? <>Filing <span style={{ color: COLORS.ember }}>{pick}</span> &mdash; tap its category (wrong = strike)</> : 'Solved — tap a word, then its category. Complete a pair, get +1 guess.'}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {solvedUnfiled.map((w) => (
                    <button key={w} onClick={() => setPick(pick === w ? null : w)}
                      style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, padding: '6px 11px', borderRadius: 7, cursor: 'pointer', border: 'none', background: pick === w ? COLORS.ember : COLORS.ink, color: '#fff', boxShadow: pick === w ? '0 0 0 3px rgba(37,99,235,0.25)' : 'none' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* result */}
            {!playing && (
              <div style={{ background: '#fff', border: `2px solid ${COLORS.ink}`, borderRadius: 12, padding: '16px 16px 14px', marginBottom: 14 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: won ? COLORS.ink : COLORS.rust, marginBottom: 4 }}>
                  {won ? 'Locked it.' : g.strikes >= 4 ? 'Four strikes.' : 'Out of guesses.'}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.faded, marginBottom: 12 }}>
                  {won
                    ? <>{guessesUsed} guesses &middot; {g.strikes} strike{g.strikes === 1 ? '' : 's'} &middot; {elapsed}</>
                    : <>{g.order.length} of 8 words &middot; the reveal is on the board</>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="cl-btn" onClick={copyShare}><Share2 size={15} /> {copied ? 'Copied' : 'Share result'}</button>
                  <button className="cl-btn" onClick={resetGame} style={{ borderColor: '#c3c8cf', color: COLORS.faded }}><RotateCcw size={15} /> Replay</button>
                </div>
                <p style={{ fontSize: 12, color: COLORS.faded, fontWeight: 600, margin: '12px 0 0' }}>Puzzle #2 is coming. This one's a quiet launch &mdash; if you found it, you were meant to.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* toast */}
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
            <div style={{ fontSize: 14, lineHeight: 1.6, color: COLORS.ink, fontWeight: 600 }}>
              <p style={{ margin: '0 0 10px' }}><b>Eight words</b> interlock in the grid. There are no clues &mdash; the <b>four categories</b> are the only hints. Each category owns exactly <b>two</b> of the eight words.</p>
              <p style={{ margin: '0 0 10px' }}><b>Guess to reveal.</b> Tap a slot, type any letters, hit enter. <span style={{ background: COLORS.ink, color: '#fff', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Dark</span> = right letter, right square &mdash; it locks into the grid, including for the crossing word. <span style={{ background: '#e6b93f', color: '#5c4a06', borderRadius: 4, padding: '1px 6px', fontWeight: 800 }}>Yellow</span> = in this word, different square.</p>
              <p style={{ margin: '0 0 10px' }}><b>The whole board shares {PUZZLE.guesses} guesses.</b> Crossings are your friend: a locked letter narrows every word it touches.</p>
              <p style={{ margin: '0 0 10px' }}><b>File your solves.</b> After solving a word, tap it and file it under a category. Completing a pair correctly refunds <b>+1 guess</b>. Filing wrong costs a <b>strike</b> &mdash; four strikes and the game ends. Beware: some words look right in two categories.</p>
              <p style={{ margin: 0, color: COLORS.faded, fontSize: 12.5 }}>Win by solving all eight words and filing all four pairs. If every letter of a word gets locked by crossings, it solves itself &mdash; free.</p>
            </div>
            <button className="cl-btn" onClick={() => { setShowHelp(false); try { localStorage.setItem(HELP_KEY, '1'); } catch (e) {} }} style={{ marginTop: 14, background: COLORS.ink, color: '#fff' }}>Play</button>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 2 }}><Footer /></div>
    </div>
  );
}
