'use client';

// The IQ standing for a just-finished daily, for surfaces that show the result
// IN the page rather than through DailyEndCard's modal.
//
// The retry ladder is the point. This read races the player's own result write,
// so a single fetch often lands before the row exists and the number never
// appears. DailyEndCard learned this the hard way and its comment is worth
// repeating: the delays are GAPS between attempts, not cumulative targets.
// Passing cumulative values straight to setTimeout stretched a 10s ladder to
// 21s, so a player whose first read lost the race waited that long to see it.
//
// Duplicated from DailyEndCard on purpose while the Loft format is a preview:
// that component is 2,500 lines and pulling the fetch out of it is a refactor
// this does not need yet. If the format ships, unify these two.
import { useEffect, useState } from 'react';

const GAPS = [0, 1500, 2000, 2500, 4000];

export default function useIqStanding({ game = null, quizId = null, active = false }) {
  const [iq, setIq] = useState(null);
  useEffect(() => {
    if (!active) return undefined;
    let alive = true;
    let timer = null;
    let i = 0;
    const attempt = () => {
      const qs = new URLSearchParams();
      try {
        const anon = localStorage.getItem('sot_quiz_anon');
        if (anon) qs.set('anonId', anon);
        const ident = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
        if (ident && ident.email) qs.set('email', ident.email);
      } catch (e) {}
      if (game) qs.set('game', game);
      if (quizId) qs.set('quizId', quizId);
      if (i > 0) qs.set('_', String(Date.now()));   // bust the edge cache on retries
      fetch('/api/quiz/iq-standing?' + qs.toString())
        .then((r) => r.json())
        .then((d) => {
          if (!alive || !d) return;
          if (d.found) setIq(d);
          if (!d.found || d.gained == null) schedule();
        })
        .catch(() => schedule());
    };
    const schedule = () => {
      i += 1;
      if (i < GAPS.length && alive) timer = setTimeout(attempt, GAPS[i]);
    };
    attempt();
    return () => { alive = false; clearTimeout(timer); };
  }, [game, quizId, active]);
  return iq;
}
