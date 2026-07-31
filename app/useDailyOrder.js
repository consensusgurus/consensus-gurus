'use client';

// Shared hook for the popularity-driven daily-games display order (owner
// ruling 2026-07-17): /api/quiz/daily-order ranks the games by YESTERDAY's
// play counts, canonical DAILY_KEYS order as the tiebreak. Surfaces render in
// canonical order on first paint (no layout jank from a blocking fetch), then
// re-sort when the order arrives. Used by DailyStrip, DailyGamesGrid, the
// /daily hub, and the home leaders bar — one fetch each, cached at the edge.

import { useState, useEffect } from 'react';

export default function useDailyOrder() {
  const [order, setOrder] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/quiz/daily-order')
      .then((r) => r.json())
      .then((d) => { if (alive && d && Array.isArray(d.order) && d.order.length) setOrder(d.order); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return order;
}

// Stable sort of any keyed list by the fetched order. Unknown keys keep their
// original relative position, after the known ones. No-op until order arrives.
export function sortByDailyOrder(list, order, keyOf = (x) => x.key) {
  if (!order || !Array.isArray(list)) return list;
  const idx = (k) => { const i = order.indexOf(k); return i === -1 ? order.length + 1 : i; };
  return [...list].sort((a, b) => idx(keyOf(a)) - idx(keyOf(b)));
}
