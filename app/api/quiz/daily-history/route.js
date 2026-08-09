import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { scoreGame, combineDaily, DAILY_KEYS, GAME_MAX, bestNForSuffix, etDayEndMs } from '@/lib/daily-combined';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Same numbers for every visitor (no per-player fold), so the CDN can absorb
// repeat hits. Winner history only changes at the Eastern day boundary.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' };

// Only true daily-game quizIds (`<game>-M-D-YY`); a normal quiz sharing a prefix
// can't leak in. Built from DAILY_KEYS so new dailies are picked up automatically
// (no more drift). Mirrors DAILY_RE in /api/quiz/daily-status.
const DAILY_RE = new RegExp(`^(${DAILY_KEYS.join('|')})-(\\d+)-(\\d+)-(\\d+)$`);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HISTORY_DAYS = 30;

// A crown is FINAL at Eastern midnight (see the day freeze in lib/daily-combined).
// Rows that land later still count on their game's own leaderboard; they just
// never re-open a day that is already crowned. Cutoffs are memoized per day, so
// this is one Intl format per day rather than one per row.
const dayEndCache = new Map();
function dayEndFor(iso) {
  let end = dayEndCache.get(iso);
  if (end === undefined) { end = etDayEndMs(iso); dayEndCache.set(iso, end); }
  return end;
}

// Today's date suffix ("M-D-YY") in US Eastern, matching the daily quizId scheme.
function etTodaySuffix() {
  let ymd;
  try { ymd = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { ymd = new Date().toISOString().slice(0, 10); }
  const [Y, M, D] = ymd.split('-').map(Number);
  return `${M}-${D}-${Y % 100}`;
}

// "M-D-YY" -> { iso:'YYYY-MM-DD' (sortable), label:'Jul 16' }.
function parseSuffix(suffix) {
  const [M, D, YY] = suffix.split('-').map(Number);
  const year = 2000 + YY;
  const iso = `${year}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`;
  return { iso, label: `${MONTHS[(M - 1) % 12] || '?'} ${D}` };
}

// GET /api/quiz/daily-history
//   -> { today, days, history:[{ date, dateISO, label, gameCount, maxTotal, field,
//        winner:{username,userKey,total,gamesPlayed}, runnerUp }], champions, games }
// The daily-games COMBINED-board champion for each completed Eastern day (the #1
// on that day's best-N-of-slate standings, same scoring the live board uses),
// plus an all-time per-game stat line. Today is excluded (still in progress).
export async function GET() {
  const todaySuffix = etTodaySuffix();
  // Eastern "today" as an ISO date. Used to drop today (still in progress) AND
  // any future-dated day, so a stray play on a pre-published future daily is
  // never crowned a champion.
  let todayISO;
  try { todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { todayISO = new Date().toISOString().slice(0, 10); }
  try {
    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('daily-history error', error);
      return NextResponse.json({ today: todaySuffix, days: 0, history: [], champions: [], games: [] });
    }

    // One pass: bucket completed-day daily rows by day -> game, and accumulate
    // per-game all-time aggregates over EVERY population (guests included).
    const byDay = new Map();   // suffix -> Map(gameKey -> rows[])
    const gameAgg = new Map(); // gameKey -> aggregate
    for (const r of (data || [])) {
      const qid = r && r.quiz_id;
      if (!qid) continue;
      const m = qid.match(DAILY_RE);
      if (!m) continue;
      const key = m[1];
      const suffix = `${m[2]}-${m[3]}-${m[4]}`;

      let ga = gameAgg.get(key);
      if (!ga) { ga = { plays: 0, signedPlays: 0, players: new Set(), days: new Set(), correct: 0, totalDen: 0, best: 0 }; gameAgg.set(key, ga); }
      ga.plays += 1;
      if (r.user_id) ga.signedPlays += 1;
      ga.players.add(r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`));
      ga.days.add(suffix);
      const score = Number(r.score) || 0;
      const total = Number(r.total) || 0;
      ga.correct += score;
      ga.totalDen += total;
      if (score > ga.best) ga.best = score;

      const { iso: rowDayISO } = parseSuffix(suffix);
      if (rowDayISO >= todayISO) continue; // skip today (in progress) and any future-dated day
      // Posted after that Eastern day ended: counts for the game board, never
      // for the crown. A row with no usable created_at is kept (fail open).
      if (r.created_at) {
        const t = Date.parse(r.created_at);
        if (!Number.isNaN(t) && t >= dayEndFor(rowDayISO)) continue;
      }
      let dm = byDay.get(suffix);
      if (!dm) { dm = new Map(); byDay.set(suffix, dm); }
      let arr = dm.get(key);
      if (!arr) { arr = []; dm.set(key, arr); }
      arr.push(r);
    }

    // Per-day champion via the same scoreGame + combineDaily the live board uses.
    const history = [];
    for (const [suffix, dm] of byDay.entries()) {
      const gameResults = [];
      for (const [key, rows] of dm.entries()) {
        const gr = scoreGame(rows);
        if (gr.field <= 0) continue; // no registered field that day for this game
        gameResults.push({ key, quizId: `${key}-${suffix}`, field: gr.field, players: gr.players });
      }
      if (!gameResults.length) continue;
      const dayBestN = bestNForSuffix(suffix);
      const overall = combineDaily(gameResults, dayBestN);
      if (!overall.length) continue;
      // Crown only REGISTERED players. A guest (anon userKey 'a:...') has no
      // account, profile, or stable identity, so it can't hold a Hall-of-Fame
      // crown or link to a player page. Guests still count on the live combined
      // board; they just aren't crowned as the day's champion here.
      const registered = overall.filter((o) => String(o.userKey || '').startsWith('u:'));
      if (!registered.length) continue; // no registered player that day -> no champion, skip the day
      const gameCount = gameResults.length;
      const maxTotal = Math.min(dayBestN, gameCount) * GAME_MAX;
      const w = registered[0];
      const ru = registered[1] || null;
      const { iso, label } = parseSuffix(suffix);
      history.push({
        date: suffix,
        dateISO: iso,
        label,
        gameCount,
        maxTotal,
        field: overall.length,
        winner: { username: w.username, userKey: w.userKey, total: w.total, gamesPlayed: w.gamesPlayed },
        runnerUp: ru ? { username: ru.username, userKey: ru.userKey, total: ru.total } : null,
      });
    }
    history.sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));
    const trimmed = history.slice(0, HISTORY_DAYS);

    // Crown tally over the shown window: who has won the most days.
    const crowns = new Map();
    for (const h of trimmed) {
      const k = h.winner.userKey;
      const c = crowns.get(k) || { username: h.winner.username, userKey: k, wins: 0 };
      c.wins += 1;
      c.username = h.winner.username;
      crowns.set(k, c);
    }
    const champions = [...crowns.values()].sort((a, b) => b.wins - a.wins || String(a.username).localeCompare(String(b.username)));

    // All-time per-game stat line, in canonical daily order.
    const games = DAILY_KEYS.filter((k) => gameAgg.has(k)).map((k) => {
      const g = gameAgg.get(k);
      return {
        key: k,
        plays: g.plays,
        signedPlays: g.signedPlays,
        players: g.players.size,
        days: g.days.size,
        avgCompletionPct: g.totalDen > 0 ? Math.round((g.correct / g.totalDen) * 100) : 0,
        bestScore: g.best,
      };
    });

    return NextResponse.json({ today: todaySuffix, days: trimmed.length, history: trimmed, champions, games }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-history exception', e);
    return NextResponse.json({ today: todaySuffix, days: 0, history: [], champions: [], games: [] });
  }
}
