'use client';

// Today's board for a just-finished daily, for the Loft end card.
//
// Reads the SHARED board API every quiz surface already uses,
// GET /api/quiz/board?quizId=<id> -> { plays, best, leaderboard }, where a row
// is { username, userKey, score, timeElapsed, tryNum, ... }. Nothing new is
// stored and no scoring lives here: the ordering is whatever the API returns,
// which is the one comparator in lib/quiz-anon.js.
//
// THE RETRY LADDER IS THE POINT, exactly as in useIqStanding, and for the same
// reason: this read races the player's own result write, so a single fetch
// often lands before their row exists and they see a board they are missing
// from. The delays are GAPS between attempts, not cumulative targets. It stops
// early once the player's own row shows up, so a player who was already on the
// board pays for one request.
import { useEffect, useState } from 'react';

const GAPS = [0, 1500, 2000, 2500, 4000];

export default function useDailyBoard({ quizId = null, active = false }) {
  const [board, setBoard] = useState(null);
  useEffect(() => {
    if (!active || !quizId) return undefined;
    let alive = true;
    let timer = null;
    let i = 0;

    // Who am I on this board? The API returns a userKey per row; the local
    // identity is either a signed-in email or the anon id, so match on the
    // name the server would have written.
    let mine = null;
    try {
      const ident = JSON.parse(localStorage.getItem('sot_quiz_identity') || 'null');
      if (ident && ident.username) mine = String(ident.username).toLowerCase();
    } catch (e) {}

    const attempt = () => {
      fetch(`/api/quiz/board?quizId=${encodeURIComponent(quizId)}${i > 0 ? `&_=${Date.now()}` : ''}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive || !d) return;
          const rows = Array.isArray(d.leaderboard) ? d.leaderboard : [];
          setBoard({ plays: d.plays || 0, rows, mine });
          // Keep asking only while the player is not on the board yet.
          const onIt = mine && rows.some((r) => String(r.username || '').toLowerCase() === mine);
          if (!onIt) schedule();
        })
        .catch(() => schedule());
    };
    const schedule = () => {
      i += 1;
      if (i < GAPS.length && alive) timer = setTimeout(attempt, GAPS[i]);
    };
    attempt();
    return () => { alive = false; clearTimeout(timer); };
  }, [quizId, active]);
  return board;
}
