'use client';
import { useEffect, useState } from 'react';
import { DAILY_GAME_MAP } from '@/lib/daily-games';
import { savedIdentity } from '@/lib/saved-identity';

export default function useCategoryRank({ self, active }) {
  const [s, setS] = useState({ ready: false, rank: null, field: null, cat: null });
  useEffect(() => {
    if (!active || !self) return undefined;
    const cat = (DAILY_GAME_MAP[self] || {}).cat || null;
    if (!cat) { setS({ ready: true, rank: null, field: null, cat: null }); return undefined; }
    let alive = true;
    const me = String(savedIdentity().username || '').toLowerCase();
    fetch('/api/quiz/daily-combined')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const games = d && Array.isArray(d.games) ? d.games : [];
        const players = new Map();
        for (const g of games) {
          if (((DAILY_GAME_MAP[g.key] || {}).cat) !== cat) continue;
          for (const pl of (g.board || [])) {
            if (!pl || !pl.username) continue;
            const cur = players.get(pl.username) || { name: pl.username, pts: 0, n: 0 };
            cur.pts += Number(pl.points) || 0;
            cur.n += 1;
            players.set(pl.username, cur);
          }
        }
        // Points, then games played in the category, then name: the same
        // comparator the homepage uses, so a tie breaks identically there.
        const ranked = [...players.values()]
          .sort((a, b) => b.pts - a.pts || b.n - a.n || a.name.localeCompare(b.name));
        const i = me ? ranked.findIndex((p) => String(p.name).toLowerCase() === me) : -1;
        setS({ ready: true, cat, field: ranked.length, rank: i >= 0 ? i + 1 : null });
      })
      .catch(() => { if (alive) setS((p) => ({ ...p, ready: true })); });
    return () => { alive = false; };
  }, [self, active]);
  return s;
}
