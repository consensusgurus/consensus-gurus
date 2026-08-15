'use client';

// This game's ALL-TIME standing, for the Loft end card's tile.
//
// The end card first showed today's placement here, because useDailyBoard only
// knows about today. The figure the owner actually wanted is the cumulative one,
// and it already exists: /api/quiz/daily-game is what the tail's "Your Stats"
// panel reads for its ALL TIME tile (see app/quiz/[id]/DailyBoardPanel.jsx),
// returning { allTime: { myRank, plays, field, provisional } }. So this is the
// same endpoint with the same query, not a new one.
//
// `fresh=1` and no-store for the same reason DailyBoardPanel uses them: the read
// races the result the player has just banked on this page, and a cached answer
// predates their own finish.
import { useEffect, useState } from 'react';

export default function useGameAllTime({ game = null, active = false }) {
  const [at, setAt] = useState(null);
  useEffect(() => {
    if (!active || !game) return undefined;
    let anonId = null, email = null;
    try { anonId = localStorage.getItem('sot_quiz_anon'); } catch (e) {}
    try {
      const id = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      email = id && id.email;
    } catch (e) {}
    const qs = new URLSearchParams({ game, fresh: '1' });
    if (anonId) qs.set('anonId', anonId);
    if (email) qs.set('email', email);
    let alive = true;
    fetch('/api/quiz/daily-game?' + qs.toString(), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        const a = d.allTime || null;
        setAt({
          rank: a && a.myRank != null ? a.myRank : null,
          field: a ? (a.plays != null ? a.plays : a.field) : null,
          provisional: !!(a && a.provisional),
          ready: true,
        });
      })
      .catch(() => { if (alive) setAt({ rank: null, field: null, provisional: false, ready: true }); });
    return () => { alive = false; };
  }, [game, active]);
  return at;
}
