'use client';

import React, { useMemo, useState, useEffect } from 'react';

// Photo MATCH board (`format: 'photo-match'`). A hybrid of the photo board and
// the two-column matching board: the prompts are PICTURES and the answers are
// TITLE BOXES. The deck is split into ROUNDS of five so the grid stays legible
// on a phone (matching twenty paintings at once would be an unreadable wall).
// In each round you tap a picture, then tap its title (or title-then-picture).
// A wrong title is struck through and locked for good — exactly like
// MatchQuizBoard — so the final matched count is (total − errors) and the
// leaderboard ranks fewest mistakes first. Reports up to QuizClient via
// onMatch/onWrong/onEnd/onHint, the same contract PhotoBoard uses, so it
// inherits the shared score block, game-over card, reveal and leaderboard.

const COLORS = {
  cream: '#f4ede0', paper: '#ebe2d0', ink: '#1a1611', ember: '#c0392b',
  rust: '#a44a26', forest: '#3d4f2b', faded: '#7a6f5e',
};
const MONO = 'DM Mono, monospace';
const SERIF = 'Fraunces, serif';
const SANS = 'DM Sans, sans-serif';
const ROUND_SIZE = 5;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function buzz(ok) {
  try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ok ? 18 : [0, 32, 48, 32]); } catch (e) {}
}

export default function PhotoMatchBoard({ items, started, ended, revealed, onMatch, onWrong, onEnd, onHint, answerNoun, stickyTop = 150 }) {
  const list = items || [];
  const total = list.length;
  const noun = answerNoun || 'picture';

  // A stable shuffle of the deck, chunked into rounds. Each round keeps its
  // pictures in one order and its titles in a DIFFERENT order so the answer is
  // never simply the box directly beneath the picture.
  const rounds = useMemo(() => {
    const order = shuffle(list.map((_, i) => i));
    const out = [];
    for (let i = 0; i < order.length; i += ROUND_SIZE) {
      const pics = order.slice(i, i + ROUND_SIZE);
      let titles = shuffle(pics);
      if (pics.length > 1) {
        // Avoid an identical title order (a free 1:1 read-down).
        let guard = 0;
        while (titles.every((t, k) => t === pics[k]) && guard++ < 8) titles = shuffle(pics);
      }
      out.push({ pics, titles });
    }
    return out;
  }, [list]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [matched, setMatched] = useState(() => new Set()); // picture indices solved
  const [dead, setDead] = useState(() => new Set());       // title indices struck out
  const [errors, setErrors] = useState(0);
  const [sel, setSel] = useState(null);   // { kind: 'pic' | 'title', id } | null
  const [flash, setFlash] = useState(null); // { id, ok, kind }

  const live = started && !ended;
  const round = rounds[roundIdx] || { pics: [], titles: [] };

  // Preconnect to the image hosts and warm the cache for the whole deck up front
  // (a match round shows several photos at once, so lazy per-photo loading would
  // leave blanks). Runs before Play so round one is ready instantly.
  useEffect(() => {
    const origins = new Set();
    for (const it of list) { try { origins.add(new URL(it.img).origin); } catch (e) {} }
    const links = [];
    origins.forEach((origin) => { const l = document.createElement('link'); l.rel = 'preconnect'; l.href = origin; document.head.appendChild(l); links.push(l); });
    list.forEach((it) => { if (it && it.img) { const im = new Image(); im.decoding = 'async'; im.src = it.img; } });
    return () => { links.forEach((l) => l.remove()); };
  }, [list]);

  function flashIt(id, ok, kind) {
    const key = Date.now();
    setFlash({ id, ok, kind, key });
    setTimeout(() => setFlash((f) => (f && f.key === key ? null : f)), 480);
  }

  function advanceIfRoundDone(nextMatched, nextDead) {
    const done = round.pics.every((p) => nextMatched.has(p) || nextDead.has(p));
    if (!done) return;
    const last = roundIdx >= rounds.length - 1;
    if (last) {
      if (onEnd) onEnd(nextMatched.size === total, nextMatched.size);
    } else {
      setTimeout(() => { setSel(null); setRoundIdx((r) => r + 1); if (onHint) onHint(`Round ${roundIdx + 2} of ${rounds.length} — match these.`, false); }, 650);
    }
  }

  // titleId is the picture index a title belongs to; picId is the picture tapped.
  function evaluate(titleId, picId) {
    if (titleId === picId) {
      const nm = new Set(matched); nm.add(picId);
      setMatched(nm); setSel(null); flashIt(picId, true, 'pic'); buzz(true);
      if (onMatch) onMatch(picId, nm.size, list[picId].t, list[picId].landmark);
      advanceIfRoundDone(nm, dead);
    } else {
      const nd = new Set(dead); nd.add(titleId);
      setDead(nd);
      const ne = errors + 1; setErrors(ne);
      flashIt(titleId, false, 'title'); buzz(false);
      if (onWrong) onWrong(ne, list[titleId].t);
      // Keep the tapped picture selected so the player can try again at once.
      setSel(matched.has(picId) ? null : { kind: 'pic', id: picId });
      advanceIfRoundDone(matched, nd);
    }
  }

  function tapPic(p) {
    if (!live || matched.has(p) || dead.has(p)) return;
    if (sel && sel.kind === 'title') { evaluate(sel.id, p); return; }
    setSel((s) => (s && s.kind === 'pic' && s.id === p ? null : { kind: 'pic', id: p }));
  }
  function tapTitle(t) {
    if (!live || matched.has(t) || dead.has(t)) return;
    if (sel && sel.kind === 'pic') { evaluate(t, sel.id); return; }
    setSel((s) => (s && s.kind === 'title' && s.id === t ? null : { kind: 'title', id: t }));
  }

  function picBorder(p) {
    if (flash && flash.kind === 'pic' && flash.id === p) return flash.ok ? COLORS.forest : COLORS.ember;
    if (matched.has(p)) return COLORS.forest;
    if (dead.has(p)) return COLORS.rust;
    if (sel && sel.kind === 'pic' && sel.id === p) return COLORS.ember;
    return COLORS.ink;
  }

  // ── Game-over grid: every picture with its title (matched green, missed rust). ──
  if (ended) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
        {list.map((it, i) => {
          const got = matched.has(i);
          const show = got || revealed;
          return (
            <div key={i} style={{ border: `1px solid ${got ? COLORS.forest : (revealed ? COLORS.rust : COLORS.faded + '55')}`, background: got ? '#fff' : (revealed ? '#f6ead9' : '#fbf7ef'), borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: COLORS.ink, overflow: 'hidden' }}>
                <img src={it.img} alt={show ? it.t : `Picture ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', opacity: show ? 1 : 0.5, filter: show ? 'none' : 'grayscale(0.5)' }} />
              </div>
              <div style={{ padding: '7px 9px 9px' }}>
                <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 14, lineHeight: 1.15, color: got ? COLORS.forest : (revealed ? COLORS.rust : COLORS.faded) }}>{got ? '✓ ' + it.t : (revealed ? it.t : '• • •')}</div>
                {show && it.landmark && <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.faded, marginTop: 2, lineHeight: 1.2 }}>{it.landmark}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Don't reveal the paintings until the clock is running.
  if (!started) {
    return (
      <div style={{ width: '100%', minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.ink, color: COLORS.faded, fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, border: `2px solid ${COLORS.ink}` }}>Press Play to start</div>
    );
  }

  const selPic = sel && sel.kind === 'pic' ? sel.id : null;
  const statusText = !live
    ? 'Press Play to start'
    : sel && sel.kind === 'pic' ? `Now tap the title for this ${noun}.`
    : sel && sel.kind === 'title' ? `Now tap the matching ${noun}.`
    : `Tap a ${noun}, then its title.`;

  return (
    <div>
      <style>{`
        .pm-grid{display:grid;grid-template-columns:repeat(${Math.min(round.pics.length || 1, 5)},1fr);gap:8px;}
        .pm-pic{position:relative;padding:0;border-width:2px;border-style:solid;background:${COLORS.ink};cursor:pointer;overflow:hidden;aspect-ratio:1/1;transition:border-color .15s,transform .08s;}
        .pm-pic:active{transform:scale(0.98);}
        .pm-pic img{width:100%;height:100%;object-fit:contain;display:block;}
        .pm-titles{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
        .pm-title{font-family:${SERIF};font-weight:700;font-size:15px;line-height:1.15;text-align:left;padding:11px 14px;min-height:44px;border:1.5px solid ${COLORS.ink};background:${COLORS.paper};color:${COLORS.ink};cursor:pointer;flex:1 1 auto;transition:background .12s,color .12s,border-color .12s;}
        .pm-title:active{transform:scale(0.99);}
        @media(max-width:560px){
          .pm-grid{grid-template-columns:repeat(${Math.min(round.pics.length || 1, 3)},1fr);}
          .pm-title{flex:1 1 100%;font-size:16px;}
        }
      `}</style>

      <div style={{ position: 'sticky', top: stickyTop, zIndex: 4, background: COLORS.cream, paddingTop: 4, paddingBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: live ? COLORS.ink : COLORS.faded }}>{statusText}</span>
        {rounds.length > 1 && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: COLORS.faded, flex: 'none' }}>Round {Math.min(roundIdx + 1, rounds.length)} / {rounds.length}</span>}
      </div>

      <div className="pm-grid">
        {round.pics.map((p) => {
          const it = list[p];
          const got = matched.has(p);
          const missed = dead.has(p) && !got;
          return (
            <button key={p} type="button" className="pm-pic" onClick={() => tapPic(p)} disabled={!live || got || missed}
              style={{ borderColor: picBorder(p), boxShadow: selPic === p ? `0 0 0 3px ${COLORS.ember}44` : 'none', cursor: !live || got || missed ? 'default' : 'pointer', opacity: missed ? 0.5 : 1 }}>
              <img src={it.img} alt={got || missed ? it.t : `${noun} to match`} />
              {got && (
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'rgba(61,79,43,0.92)', color: '#fff', fontFamily: SERIF, fontWeight: 800, fontSize: 12, lineHeight: 1.1, padding: '5px 7px', textAlign: 'left' }}>✓ {it.t}</span>
              )}
              {missed && (
                <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(164,74,38,0.78)', color: '#fff', fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>Missed</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pm-titles">
        {round.titles.map((t) => {
          if (matched.has(t)) return null; // its home is found; remove from the pool
          const isDead = dead.has(t);
          const isSel = sel && sel.kind === 'title' && sel.id === t;
          const flashBad = flash && flash.kind === 'title' && flash.id === t && !flash.ok;
          return (
            <button key={t} type="button" className="pm-title" onClick={() => tapTitle(t)} disabled={!live || isDead}
              style={{
                background: isSel ? COLORS.ember : (isDead ? '#efe6d2' : COLORS.paper),
                color: isDead ? COLORS.faded : (isSel ? COLORS.cream : COLORS.ink),
                borderColor: flashBad ? COLORS.ember : (isSel ? COLORS.ember : COLORS.ink),
                textDecoration: isDead ? 'line-through' : 'none',
                cursor: !live || isDead ? 'default' : 'pointer',
                opacity: isDead ? 0.6 : 1,
              }}>
              {list[t].t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
