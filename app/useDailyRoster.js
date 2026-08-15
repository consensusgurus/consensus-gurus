'use client';
// THE WHOLE DAILY ROSTER, grouped by category, with what you have already
// played today. The end card's next-up tiles only ever offer a handful; this is
// for the reader who wants to see everything in a category and pick.
//
// It uses lib/daily-games rather than the copy exported from DailyEndCard,
// because that one lower-cases its categories ('word') while the registry and
// the rest of the site title-case them ('Word'), and these are shown to a
// reader. Retired games are dropped the same way the end card drops them.
//
// The played map is the SAME test the next-up hooks use: an entry exists and is
// not flagged abandoned. An abandoned run is not a completion, so a game you
// walked away from still reads as open.
import { useEffect, useMemo, useState } from 'react';
import { DAILY_GAMES, isRetiredDaily, etTodayISO } from '@/lib/daily-games';
import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';

export default function useDailyRoster({ active = false }) {
  const [played, setPlayed] = useState({});
  const live = useMemo(() => DAILY_GAMES.filter((g) => !isRetiredDaily(g.key)), []);
  const build = useMemo(() => (marks) => {
      const order = [];
      const byCat = new Map();
      for (const g of live) {
        const c = g.cat || 'Other';
        if (!byCat.has(c)) { byCat.set(c, []); order.push(c); }
        byCat.get(c).push({
          key: g.key, name: g.name, tag: g.tag, cat: c,
          href: g.href || `/${g.key}`,
          img: `/games/btn-${g.key}.png`,
          played: !!played[g.key],
        });
      }
      return order.map((c) => ({ cat: c, games: byCat.get(c) }));
    }, [live]);
  const cats = useMemo(() => build(played), [build, played]);
  useEffect(() => {
    if (!active) return undefined;
    let alive = true;
    fetchDailyMe(dailyMeQuery(dailyMeIdentity()), { fresh: true })
      .then((d) => {
        if (!alive) return;
        const per = (d && d.perGame) || {};
        const marks = {};
        for (const k of Object.keys(per)) {
          const g = per[k];
          if (!g || g.abandoned) continue;
          marks[k] = g.total > 0 && g.score === 0 ? 'fail' : 'done';
        }
        // Anything still open on this device, and not already finished.
        try {
          const today = etTodayISO();
          for (const g of live) {
            if (marks[g.key]) continue;
            const c = JSON.parse(localStorage.getItem(`sot_${g.key}_day`) || 'null');
            if (c && c.d === today && !c.done) marks[g.key] = 'open';
          }
        } catch (e) {}
        setPlayed(marks);
      })
      .catch((e) => { if (typeof console !== 'undefined') console.warn('useDailyRoster', e); });
    return () => { alive = false; };
  }, [active, live]);
  return { ready: true, cats, played };
}
