import { NextResponse } from 'next/server';
import { DAILY_GAME_MAP, liveDailyKeys } from '@/lib/daily-games';
import { etTodayServer, suffixOfDate, gamesForSuffix } from '@/lib/daily-slate';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// One shared answer for every visitor that only changes at Eastern midnight, so
// it holds at the edge. The picker fetches it on mount.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900' };

// A duel may be fought over a DAILY PUZZLE as well as a quiz, and this is where
// the duel picker learns which puzzles are on today.
//
// It exists because the picker is a CLIENT component and lib/daily-slate imports
// every game's puzzle file, answers and all. Resolving the slate here ships the
// names and ids and nothing else.
//
// The `quizId` is the DATED id ('crux-8-15-26'), and that is what makes a daily
// duel a fair fight: it pins both players to one specific board rather than to
// "whatever Crux you happened to play". It is also why only TODAY is offered.
// The game route serves a different puzzle after Eastern midnight, so a daily
// duel is live for the rest of the day and /duel/[token] shows it as expired
// afterwards.
//
// GARBLE IS EXCLUDED, deliberately and for the same reason it is excluded from
// the quiz pool: its client is the one daily that does not call useDuelContext,
// so a score would never attach to the duel.
const NO_DUEL = new Set(['garble']);

// GET /api/duel/subjects -> { date, subjects: [{ key, quizId, num, title, category, tag, href }] }
export async function GET() {
  try {
    const today = etTodayServer();
    const keys = liveDailyKeys(today).filter((k) => !NO_DUEL.has(k));
    const rows = gamesForSuffix(keys, suffixOfDate(today), today);
    const subjects = rows.map((r) => {
      const g = DAILY_GAME_MAP[r.key] || {};
      return {
        key: r.key,
        quizId: r.quizId,
        num: r.num,
        title: g.name || r.key,
        category: g.cat || 'Daily',
        tag: g.tag || '',
        // The registry href, never `/${key}`: Parker keeps the 'park' key and
        // lives at /parker, so a key-derived route would 404 that one game.
        href: g.href || `/${r.key}`,
      };
    });
    return NextResponse.json({ date: today, subjects }, { headers: CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ date: null, subjects: [] });
  }
}
