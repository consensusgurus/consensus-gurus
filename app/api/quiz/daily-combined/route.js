import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { scoreGame, combineDaily, DAILY_KEYS, DAILY_MAX, GAME_MAX, BEST_N } from '@/lib/daily-combined';

// Each game's puzzle list is server-only (answers never ship to the client). We
// read nothing but `live` and `quizId` off it, exactly like app/daily/page.js,
// so the combined board always scores whatever puzzle is CURRENTLY live in each
// game (gap days included), never a naively date-reconstructed id.
import { PUZZLES as P_crux } from '@/app/crux/puzzles';
import { PUZZLES as P_garble } from '@/app/garble/puzzles';
import { PUZZLES as P_links } from '@/app/links/puzzles';
import { PUZZLES as P_span } from '@/app/span/puzzles';
import { PUZZLES as P_dating } from '@/app/dating/puzzles';
import { PUZZLES as P_tally } from '@/app/tally/puzzles';
import { PUZZLES as P_suds } from '@/app/suds/puzzles';
import { PUZZLES as P_circa } from '@/app/circa/puzzles';
import { PUZZLES as P_extra } from '@/app/extra/puzzles';
import { PUZZLES as P_carve } from '@/app/carve/puzzles';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player payload (the `me` block folds in the viewer's identity), so it is
// safe to cache briefly at the edge — the query string is the player's own
// identity and never crosses users. Same pattern as /api/quiz/daily-status.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };

const GAME_PUZZLES = {
  crux: P_crux, garble: P_garble, links: P_links, span: P_span, dating: P_dating,
  tally: P_tally, suds: P_suds, circa: P_circa, extra: P_extra, carve: P_carve,
};

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// The puzzle currently live for a game: the last entry with live <= today, the
// same selection app/{game}/page.js pickPuzzle makes. Returns its quizId, or null.
function currentQuizId(puzzles, today) {
  const open = (puzzles || []).filter((p) => p && p.live <= today);
  const p = open.length ? open[open.length - 1] : null;
  return p && p.quizId ? p.quizId : null;
}

const DISPLAY = 10; // overall rows returned (viewer's own row is always appended via `me`)
const BOARD = 10;   // per-game rows returned per tab

// GET /api/quiz/daily-combined?anonId=&email=
//   -> { date, maxTotal, gameMax, bestN, games:[{key,quizId,field,board}], overall, me }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const today = etTodayServer();

  // Today's live quizId per game (skip a game with no live puzzle at all).
  const games = [];
  for (const key of DAILY_KEYS) {
    const quizId = currentQuizId(GAME_PUZZLES[key], today);
    if (quizId) games.push({ key, quizId });
  }
  const wanted = new Set(games.map((g) => g.quizId));

  const empty = { date: today, maxTotal: DAILY_MAX, gameMax: GAME_MAX, bestN: BEST_N, games: [], overall: [], me: null };
  try {
    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('daily-combined error', error);
      return NextResponse.json(empty);
    }

    // Bucket the (up to 10) relevant quizIds' rows in one pass over the cache.
    const rowsByQuiz = new Map();
    for (const r of (data || [])) {
      if (!r || !wanted.has(r.quiz_id)) continue;
      let arr = rowsByQuiz.get(r.quiz_id);
      if (!arr) { arr = []; rowsByQuiz.set(r.quiz_id, arr); }
      arr.push(r);
    }

    const gameResults = games.map((g) => {
      const gr = scoreGame(rowsByQuiz.get(g.quizId) || []);
      return { key: g.key, quizId: g.quizId, field: gr.field, players: gr.players };
    });

    const overallFull = combineDaily(gameResults);

    // Resolve the viewer so we can always surface THEIR standing, even outside
    // the top DISPLAY. email -> account, else this browser's anon.
    let myKey = null;
    try {
      const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
      if (ident && ident.id) myKey = `u:${ident.id}`;
      else if (anonId) myKey = `a:${anonId}`; // anon can't be on the registered board, but keep for parity
    } catch (e) { /* identity is best-effort */ }
    const me = myKey ? (overallFull.find((row) => row.userKey === myKey) || null) : null;

    // Per-game display boards (top BOARD by that game's own rank).
    const gameBoards = gameResults.map((g) => ({
      key: g.key,
      quizId: g.quizId,
      field: g.field,
      board: [...g.players.values()]
        .sort((a, b) => a.rank - b.rank || b.points - a.points || String(a.username || '').localeCompare(String(b.username || '')))
        .slice(0, BOARD)
        .map((p) => ({
          userKey: p.userKey,
          username: p.username,
          rank: p.rank,
          score: p.score,
          total: p.total,
          guessesUsed: p.guessesUsed,
          timeElapsed: p.timeElapsed,
          points: Math.round(p.points * 10) / 10,
          completion: Math.round(p.completion * 10) / 10,
          placement: Math.round(p.placement * 10) / 10,
        })),
    }));

    return NextResponse.json({
      date: today,
      maxTotal: DAILY_MAX,
      gameMax: GAME_MAX,
      bestN: BEST_N,
      games: gameBoards,
      overall: overallFull.slice(0, DISPLAY),
      me,
    }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-combined exception', e);
    return NextResponse.json(empty);
  }
}
