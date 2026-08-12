'use client';

// The game to offer after a finish: the first unplayed daily in the SAME
// category as the one just finished, falling back to the first unplayed of any
// category. Needs no new endpoint, since the daily registry and the played map
// both already exist.
//
// `perGame` marks an abandoned run as well as a finished one, and an abandon is
// not a completion, so the played test mirrors DailyGamesGrid exactly:
// played === entry exists AND it is not flagged abandoned. Getting this wrong
// would offer a player a game they are midway through as if it were new.
//
// Fetched fresh: the cached daily-me answer can predate the finish that just
// happened on this page, which is the case dailyMeClient's own comment warns of.
//
// Use DAILY_GAMES, the EXPORTED registry, which also drops retired games. The
// first cut imported ALL_DAILY_GAMES, which is module-private, so the import was
// undefined, .find threw inside the .then, and the catch swallowed it: the row
// simply never appeared. Hence the catch now logs instead of going quiet.
import { useEffect, useState } from 'react';
import { DAILY_GAMES } from './DailyEndCard';
import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';

export default function useNextUnplayed({ self = null, active = false }) {
  const [next, setNext] = useState(null);
  useEffect(() => {
    if (!active || !self) return undefined;
    let alive = true;
    fetchDailyMe(dailyMeQuery(dailyMeIdentity()), { fresh: true })
      .then((d) => {
        if (!alive) return;
        const per = (d && d.perGame) || {};
        const played = (k) => !!(per[k] && !per[k].abandoned);
        const mine = DAILY_GAMES.find((g) => g.key === self) || null;
        const open = DAILY_GAMES.filter((g) => g.key !== self && !played(g.key));
        const sameCat = mine ? open.filter((g) => g.cat === mine.cat) : [];
        setNext(sameCat[0] || open[0] || null);
      })
      .catch((e) => { if (typeof console !== 'undefined') console.warn('useNextUnplayed', e); });
    return () => { alive = false; };
  }, [self, active]);
  return next;
}
