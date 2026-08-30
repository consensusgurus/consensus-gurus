'use client';

// useCircuitHistory — the completed-day archive for ONE circuit.
//
// /api/quiz/daily-history crowns every completed Eastern day and tallies the
// crowns over its window. Unnarrowed it answers that for the whole daily
// slate; ?circuit=<id> narrows it to that circuit's own roster, day by day,
// and quotes a winner's total in the unit that circuit's live board ranks on.
//
// FETCHED LAZILY, ONCE. Nothing on the run stage needs the archive until a
// player asks for it, so `active` is the panel being open rather than the page
// being mounted, and a payload already in hand is never re-fetched: the route
// is CDN-cached for two minutes and a day that is over cannot change anyway.
//
// It folds NO per-player data, which is what keeps it cacheable. "You took
// this day" is decided on the client by comparing the winner's name with the
// saved identity, never by asking the route who is looking.

import { useEffect, useState } from 'react';
import { isMarquee, CIRCUIT_PARAM } from '@/lib/circuits';

export default function useCircuitHistory(runId, active = true) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!active || !runId || data) return undefined;
    let alive = true;
    setState('loading');
    const qs = new URLSearchParams();
    if (isMarquee(runId)) qs.set('five', '1');
    else qs.set(CIRCUIT_PARAM, runId);
    fetch(`/api/quiz/daily-history?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d && !d.error) { setData(d); setState('ready'); } else { setState('error'); }
      })
      .catch(() => { if (alive) setState('error'); });
    return () => { alive = false; };
  }, [runId, active, data]);

  return { data, state };
}
