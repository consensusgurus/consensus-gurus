'use client';
import React from 'react';

// Fixed-size clue box (owner rule, 2026-07-02).
//
// Quizzes that reveal one clue at a time (map "find X", bank prompts, type-it
// labels, photo/scramble prompts, etc.) used to resize the clue container every
// time the clue changed length, which is visually jarring. ClueBox reserves the
// footprint of the LONGEST possible clue up front so the box never resizes: it
// stacks every candidate clue in a single CSS grid cell (all at grid-area 1/1,
// so the cell grows to the widest AND tallest of them) with only a hidden sizer
// contributing text; the visible current clue sits in the same cell on top.
//
// Props:
//   current   — the clue to show right now (any node/string; e.g. "Find Peru",
//               "Game over", "Press Play to start").
//   clues     — array of every clue string this quiz can show. The box is sized
//               to the longest of these (by rendered width/height, not by
//               character count, so proportional fonts and wrapping are exact).
//   style     — style for the box container (background, border, padding...).
//   textStyle — style applied to BOTH the sizer text and the visible clue, so
//               they measure identically (font, size, weight, line-height...).
//   align     — horizontal alignment of the visible clue ('center' default).

export default function ClueBox({ current, clues = [], style = {}, textStyle = {}, align = 'center' }) {
  // De-dupe to keep the hidden sizer small on long quizzes; a Set preserves the
  // distinct strings, which is all that matters for measuring the max box.
  const uniq = React.useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of clues) { const k = String(c); if (!seen.has(k)) { seen.add(k); out.push(c); } }
    return out;
  }, [clues]);

  const cellText = { ...textStyle, gridArea: '1 / 1', minWidth: 0 };

  return (
    <div style={{ display: 'grid', justifyItems: align === 'left' ? 'start' : align === 'right' ? 'end' : 'center', alignItems: 'center', ...style }}>
      {/* Hidden sizers: every distinct clue, all in the same grid cell, so the
          cell reserves the largest width and height. Not read by AT. */}
      {uniq.map((c, i) => (
        <span key={i} aria-hidden="true" style={{ ...cellText, visibility: 'hidden', pointerEvents: 'none' }}>{c}</span>
      ))}
      {/* The live clue, same cell, on top. */}
      <span style={cellText}>{current}</span>
    </div>
  );
}
