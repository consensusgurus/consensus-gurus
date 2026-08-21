'use client';
// Shared "How to play" panel for every daily game.
//
// Until 2026-08-06 all 48 dailies hand-rolled their own rules body. Five of them
// (Axiom, Bracket, Hearsay, Stands, Venn) had converged on a good shape by
// copy-paste, and the other forty-three were undifferentiated walls of <p> tags
// running as long as 367 words with no structure and no colour. This component
// is that good shape, extracted once, so the look is enforced here rather than
// re-pasted a 49th time.
//
// THE SHAPE, top to bottom. Only `lead` and `steps` are required.
//
//   lead     one line, the mission. What the player is trying to do, in plain
//            words. Bold and slightly larger. Never more than a sentence.
//   banner   optional. The day's actual question or subject, when the game has
//            one worth hoisting (Bracket's metric, Extra's category).
//   chips    optional. A legend, and ONLY a real legend: scoring badges, piece
//            colours, key states. Do not invent decorative chips for a game
//            that has nothing to legend.
//   sub      optional. A small faded caption explaining whatever sits directly
//            above it: what the chips mean, the as-of date under a banner, a
//            conditional aside about today's board. Sits between the legend and
//            the steps, which is where all three of the original styled games
//            wanted one.
//   steps    three to five numbered steps. The verbs and the on-screen button
//            names go in <b>. This is what replaced the wall of text.
//   knack    optional but wanted on every game that has a strategy worth
//            teaching. Renders as the accent-bordered callout, prefixed "The
//            knack:". This is the sentence a good player would tell a new one.
//   note     optional second callout, in danger red, for a genuine warning or
//            an unusual scoring wrinkle. Use sparingly.
//   footer   the scoring and tie-break line, small and faded. Every game has
//            one, so every game should pass one.
//
// Colour: each client keeps its own local COLORS with its identity accent, so
// pass `accent`, `accentSoft` and `accentDeep`. A game with no identity accent
// can omit them and inherit the brand navy.
//
// Usage (replaces the old `const rulesBody = (...)` in each client):
//
//   const rulesBody = (
//     <DailyRules
//       accent={COLORS.accent} accentSoft={COLORS.accentSoft} accentDeep={COLORS.accentDeep}
//       lead="Rebuild the results sheet."
//       chips={[{ label: 'W = 3 points', tone: 'good' }, { label: 'L = 0', tone: 'bad' }]}
//       steps={[<>Tap any cell to <b>cycle</b> it.</>, <>Fill every cell, then <b>hand in</b>.</>]}
//       knack="Points are the lever. A team on 7 from four matches can only be two wins and a draw."
//       footer="12 points, 3 off for each sheet handed in wrong. Exactly one set of results fits."
//     />
//   );

import React from 'react';
import { T } from '@/lib/theme';

const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

// Chip tones. `accent` is the default and picks up the game's identity colour;
// the rest are fixed so that green always reads as good and red as bad across
// every game, which is the whole point of standardising.
const TONES = {
  good: { background: '#dcfce7', border: '1.5px solid #15803d', color: '#14532d' },
  warn: { background: '#fef3c7', border: '1.5px solid #b45309', color: '#78350f' },
  bad: { background: '#fee2e2', border: '1.5px solid #b91c1c', color: '#7f1d1d' },
  grey: { background: '#eef2f7', border: '1.5px solid #94a3b8', color: '#3f4757' },
};

export default function DailyRules({
  accent = T.accent,
  accentSoft = '#e8edfa',
  accentDeep = T.accent,
  lead,
  banner,
  chips,
  sub,
  steps = [],
  knack,
  knackLabel = 'The knack:',
  note,
  noteGap = 10,
  footer,
  children,
}) {
  const chipList = (chips || []).filter(Boolean);
  const stepList = (steps || []).filter(Boolean);

  return (
    <div style={{ fontSize: 14, lineHeight: 1.5, color: T.ink, fontWeight: 600 }}>
      {lead && (
        <p style={{ margin: '0 0 10px', fontSize: 15.5, fontWeight: 800 }}>{lead}</p>
      )}

      {banner && (
        <div
          style={{
            background: accentSoft,
            border: `1.5px solid ${accent}`,
            borderRadius: 8,
            padding: '9px 11px',
            marginBottom: 12,
            fontSize: 14,
            fontWeight: 800,
            color: accentDeep,
          }}
        >
          {banner}
        </div>
      )}

      {chipList.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {chipList.map((c, i) => {
            const tone = c.tone && TONES[c.tone]
              ? TONES[c.tone]
              : { background: accentSoft, border: `1.5px solid ${accent}`, color: accentDeep };
            return (
              <span
                key={i}
                style={{
                  fontFamily: SANS,
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 7,
                  padding: '7px 10px',
                  ...tone,
                  ...(c.style || {}),
                }}
              >
                {c.label}
              </span>
            );
          })}
        </div>
      )}

      {sub && (
        <div style={{ margin: '-4px 0 12px', fontSize: 12.5, fontWeight: 600, color: T.muted, lineHeight: 1.45 }}>
          {sub}
        </div>
      )}

      {stepList.length > 0 && (
        <ol style={{ margin: '0 0 12px', paddingLeft: 19 }}>
          {stepList.map((s, i) => (
            <li key={i} style={{ marginBottom: i === stepList.length - 1 ? 0 : 5 }}>{s}</li>
          ))}
        </ol>
      )}

      {children}

      {knack && (
        <div
          style={{
            background: T.white,
            border: '1px solid rgba(28,30,36,0.12)',
            borderLeft: `3px solid ${accent}`,
            borderRadius: 7,
            padding: '9px 11px',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          <b>{knackLabel}</b> {knack}
        </div>
      )}

      {note && (
        <div
          style={{
            background: T.white,
            border: '1px solid rgba(28,30,36,0.12)',
            borderLeft: `3px solid ${T.danger}`,
            borderRadius: 7,
            padding: '9px 11px',
            fontSize: 13,
            lineHeight: 1.45,
            marginTop: noteGap,
          }}
        >
          {note}
        </div>
      )}

      {footer && (
        <p style={{ margin: '10px 0 0', fontSize: 12.5, fontWeight: 600, color: T.muted }}>
          {footer}
        </p>
      )}
    </div>
  );
}
