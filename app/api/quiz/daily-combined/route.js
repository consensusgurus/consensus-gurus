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
import { PUZZLES as P_emcee } from '@/app/emcee/puzzles';
import { PUZZLES as P_garble } from '@/app/garble/puzzles';
import { PUZZLES as P_links } from '@/app/links/puzzles';
import { PUZZLES as P_span } from '@/app/span/puzzles';
import { PUZZLES as P_dating } from '@/app/dating/puzzles';
import { PUZZLES as P_tally } from '@/app/tally/puzzles';
import { PUZZLES as P_suds } from '@/app/suds/puzzles';
import { PUZZLES as P_circa } from '@/app/circa/puzzles';
import { PUZZLES as P_extra } from '@/app/extra/puzzles';
import { PUZZLES as P_carve } from '@/app/carve/puzzles';
import { PUZZLES as P_stet } from '@/app/stet/puzzles';
import { PUZZLES as P_outwit } from '@/app/outwit/puzzles';
import { PUZZLES as P_tuck } from '@/app/tuck/puzzles';
import { PUZZLES as P_alibi } from '@/app/alibi/puzzles';
import { PUZZLES as P_cipher } from '@/app/cipher/puzzles';
import { PUZZLES as P_ping } from '@/app/ping/puzzles';
import { PUZZLES as P_warmer } from '@/app/warmer/puzzles';
import { PUZZLES as P_jester } from '@/app/jester/puzzles';
import { PUZZLES as P_sworn } from '@/app/sworn/puzzles';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player payload (the `me` block folds in the viewer's identity), so it is
// safe to cache briefly at the edge — the query string is the player's own
// identity and never crosses users. Same pattern as /api/quiz/daily-status.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };

const GAME_PUZZLES = {
  crux: P_crux, emcee: P_emcee, garble: P_garble, links: P_links, span: P_span, dating: P_dating,
  tally: P_tally, suds: P_suds, circa: P_circa, extra: P_extra, carve: P_carve, stet: P_stet, outwit: P_outwit,
  tuck: P_tuck, alibi: P_alibi, cipher: P_cipher, ping: P_ping, warmer: P_warmer,
  jester: P_jester, sworn: P_sworn,
};

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

// Daily quizIds end in a `-M-D-YY` date suffix (e.g. crux-7-6-26 -> "7-6-26").
// The combined board is scoped to ONE day: every game that published a puzzle on
// that date, and only those. Older days therefore have fewer games (down to one),
// which is exactly what an archived-puzzle leaderboard should reflect.
function suffixOfDate(dateStr) {
  const [Y, M, D] = dateStr.split('-').map(Number); // dateStr = 'YYYY-MM-DD'
  return `${M}-${D}-${Y % 100}`;
}

// The game's puzzle object for a given date suffix, or null if it published none
// that day (game didn't exist yet, or a gap). Never expose a future day's board.
function puzzleForSuffix(puzzles, key, suffix, today) {
  const cand = `${key}-${suffix}`;
  const p = (puzzles || []).find((x) => x && x.quizId === cand);
  if (!p) return null;
  if (p.live && p.live > today) return null;
  return p;
}

const DISPLAY = 10; // overall rows returned (viewer's own row is always appended via `me`)
const BOARD = 10;   // per-game rows returned per tab

// GET /api/quiz/daily-combined?anonId=&email=&quizId=&date=
//   quizId (a daily quizId) or date ("M-D-YY") picks the day; default = today.
//   -> { date, maxTotal, gameMax, bestN, gameCount, games:[{key,quizId,field,board}], overall, me }
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const today = etTodayServer();

  // Which day's board? Prefer an explicit date suffix, else parse it off a passed
  // quizId, else today. This is the ONLY thing that decides the slate.
  let suffix = (searchParams.get('date') || '').trim();
  const qidParam = (searchParams.get('quizId') || '').trim();
  if (!/^\d+-\d+-\d+$/.test(suffix)) {
    const m = qidParam.match(/-(\d+-\d+-\d+)$/);
    suffix = m ? m[1] : suffixOfDate(today);
  }

  // The games that ran on that date (skip any that didn't publish that day). Each
  // game gets a play href for THAT date: today's slate links to the live game
  // (streak-counting), an archived day links to that exact puzzle via ?p=<num>.
  const isToday = suffix === suffixOfDate(today);
  const games = [];
  for (const key of DAILY_KEYS) {
    const p = puzzleForSuffix(GAME_PUZZLES[key], key, suffix, today);
    if (!p) continue;
    const href = isToday ? `/${key}` : `/${key}?p=${p.num}`;
    games.push({ key, quizId: p.quizId, num: p.num, href });
  }
  const wanted = new Set(games.map((g) => g.quizId));
  // Best-N and the ceiling scale to how many games existed that day (1..10).
  const gameCount = games.length;
  const effBestN = gameCount ? Math.min(BEST_N, gameCount) : BEST_N;
  const maxTotal = effBestN * GAME_MAX;

  const empty = { date: suffix, maxTotal, gameMax: GAME_MAX, bestN: effBestN, gameCount, games: [], overall: [], me: null };
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
      const gameRows = rowsByQuiz.get(g.quizId) || [];
      const gr = scoreGame(gameRows);
      // field = registered first-attempt players on the board; plays = EVERY
      // completion for that puzzle (guests + repeats included), so the header can
      // show both "X registered players · X total plays".
      return { key: g.key, quizId: g.quizId, href: g.href, field: gr.field, plays: gameRows.length, players: gr.players };
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
      href: g.href,
      field: g.field,
      plays: g.plays,
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
      date: suffix,
      maxTotal,
      gameMax: GAME_MAX,
      bestN: effBestN,
      gameCount,
      games: gameBoards,
      overall: overallFull.slice(0, DISPLAY),
      me,
    }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-combined exception', e);
    return NextResponse.json(empty);
  }
}
