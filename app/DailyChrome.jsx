'use client';

// DailyChrome — the shared header frame for a daily game page (owner-approved
// mockup, 2026-08-04, "Direction C"). ONE component so all 42 games can share
// the same chrome instead of 42 near-copies of a bare text strip.
//
// It replaces DailyTopNav (the quiet "Puzzles & Quizzes / Top 10 Lists" line)
// with the SAME header the home page carries:
//
//   1. #1e3a8a masthead  ─┐ both from QuizCommandHeader variant="inner", via
//   2. #16307a stat bar  ─┘ QuizNavHeader, already in normal flow
//   3. #eef3ff slate rail  — DailySlateRail
//
// NOTHING IS PINNED (owner rule, 2026-08-04). No position:fixed, no sticky:
// every band scrolls away, because the board owning the viewport matters more
// than chrome staying put. QuizNavHeader's bar is the `inner` variant, which
// is explicitly in flow, and the rail is a plain block.
//
// COLLAPSE ON START: pass collapsed={started}. Once the clock is running the
// whole header shrinks to one ~31px navy line (mark, game name, the live
// figures the game passes in, and the slate count), so a tall board like Crux
// clears the fold with no scrolling. The chevron re-expands the full header
// inline, and the rail then offers a Hide chip to collapse it again. Because
// the collapse is state, not scroll position, it cannot fight the scroll.
//
// Placement: render it OUTSIDE the page's max-width wrapper, immediately after
// <Grain />, so the navy bands run full-bleed the way they do on the homepage.
//
// stats: optional [{ k: 'Guesses', v: 18 }, ...] shown on the collapsed line.
// Keep it to two or three short figures; it is a glance, not a scoreboard.

import React, { useState } from 'react';
import Link from 'next/link';
import QuizNavHeader from './quizzes/QuizNavHeader';
import DailySlateRail from './DailySlateRail';
import MindLoftMark from './MindLoftMark';
import { T } from '@/lib/theme';

const MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
const FONT = "'Manrope', system-ui, -apple-system, sans-serif";

export default function DailyChrome({ slug, name, collapsed = false, stats = null }) {
  const [open, setOpen] = useState(false);
  const full = !collapsed || open;

  if (full) {
    return (
      <>
        <QuizNavHeader />
        <DailySlateRail current={slug} />
        {collapsed ? (
          <div style={{ position: 'relative', zIndex: 2, background: 'var(--accent-soft)', borderBottom: '1px solid var(--accent-border)', textAlign: 'center' }}>
            <button type="button" onClick={() => setOpen(false)}
              style={{ font: 'inherit', fontFamily: FONT, fontSize: 10.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: T.accent, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px 6px' }}>
              Hide header &and;
            </button>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="dch">
      <style>{`
        .dch{background:var(--accent);color:var(--white);position:relative;z-index:2;font-family:${FONT};}
        .dch-in{max-width:1560px;margin:0 auto;padding:6px clamp(14px,2.5vw,34px);display:flex;align-items:center;gap:11px;}
        .dch-brand{display:flex;align-items:center;gap:8px;text-decoration:none;flex:none;}
        .dch-wm{font-size:12.5px;font-weight:800;letter-spacing:-.02em;color:var(--white);white-space:nowrap;}
        .dch-wm em{font-style:normal;color:var(--blue-400);}
        .dch-sep{width:1px;height:14px;background:rgba(255,255,255,.24);flex:none;}
        .dch-nm{font-size:13px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;}
        .dch-st{display:flex;align-items:center;gap:14px;margin-left:auto;}
        .dch-k{font-family:${MONO};font-size:9.5px;letter-spacing:.11em;text-transform:uppercase;color:#bacff5;white-space:nowrap;}
        .dch-k b{font-family:${FONT};font-size:12px;font-weight:800;color:var(--white);margin-left:5px;letter-spacing:0;}
        .dch-more{font-family:${FONT};font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--white);background:#2c4fa8;border:1px solid #4f74cc;border-radius:6px;padding:4px 9px;cursor:pointer;white-space:nowrap;}
        .dch-more:hover{background:#3a60c4;border-color:#7a99e0;}
        @media(max-width:620px){.dch-wm{display:none;}.dch-sep{display:none;}.dch-st{gap:10px;}.dch-in{gap:9px;padding-left:12px;padding-right:12px;}}
      `}</style>
      <div className="dch-in">
        <Link href="/" className="dch-brand" aria-label="Mind Loft home">
          <MindLoftMark size={19} ink="#ffffff" accent={T.blue400} />
          <span className="dch-wm">Mind <em>Loft</em></span>
        </Link>
        <span className="dch-sep" />
        <span className="dch-nm">{name}</span>
        <span className="dch-st">
          {Array.isArray(stats) ? stats.filter(Boolean).map((s) => (
            <span key={s.k} className="dch-k">{s.k}<b>{s.v}</b></span>
          )) : null}
          <button type="button" className="dch-more" onClick={() => setOpen(true)}>Slate &or;</button>
        </span>
      </div>
    </div>
  );
}
