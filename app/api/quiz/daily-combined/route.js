import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { scoreGame, combineDaily, guestProvisional, DAILY_KEYS, DAILY_MAX, GAME_MAX, bestNForSuffix } from '@/lib/daily-combined';
import { scoreOutwitGame } from '@/lib/outwit-score';
import { scoreOutrankGame } from '@/lib/outrank-score';
import { scoreFeudGame } from '@/lib/feud-score';

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
import { PUZZLES as P_outrank } from '@/app/outrank/puzzles';
import { PUZZLES as P_shards } from '@/app/shards/puzzles';
import { PUZZLES as P_axiom } from '@/app/axiom/puzzles';
import { PUZZLES as P_hearsay } from '@/app/hearsay/puzzles';
import { PUZZLES as P_venn } from '@/app/venn/puzzles';
import { PUZZLES as P_stands } from '@/app/stands/puzzles';
import { PUZZLES as P_bracket } from '@/app/bracket/puzzles';
import { PUZZLES as P_lode } from '@/app/lode/puzzles';
import { PUZZLES as P_etch } from '@/app/etch/puzzles';
import { PUZZLES as P_hedge } from '@/app/hedge/puzzles';
import { PUZZLES as P_listed } from '@/app/listed/puzzles';
import { PUZZLES as P_mate } from '@/app/mate/puzzles';
import { PUZZLES as P_four } from '@/app/four/puzzles';
import { PUZZLES as P_park } from '@/app/parker/puzzles';
import { PUZZLES as P_check } from '@/app/check/puzzles';
import { PUZZLES as P_rung } from '@/app/rung/puzzles';
import { PUZZLES as P_crunch } from '@/app/crunch/puzzles';
import { PUZZLES as P_taire } from '@/app/taire/puzzles';
import { PUZZLES as P_fib } from '@/app/fib/puzzles';
import { PUZZLES as P_streak } from '@/app/streak/puzzles';
import { PUZZLES as P_feud } from '@/app/feud/puzzles';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player payload (the `me` block folds in the viewer's identity), so it is
// safe to cache briefly at the edge — the query string is the player's own
// identity and never crosses users. Same pattern as /api/quiz/daily-status.
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };
// The finish flow passes ?fresh=1 to force an authoritative read; that response
// must never be edge-cached or it could hand back a pre-insert snapshot.
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

const GAME_PUZZLES = {
  crux: P_crux, emcee: P_emcee, garble: P_garble, links: P_links, span: P_span, dating: P_dating,
  tally: P_tally, suds: P_suds, circa: P_circa, extra: P_extra, carve: P_carve, stet: P_stet, outwit: P_outwit,
  tuck: P_tuck, alibi: P_alibi, cipher: P_cipher, ping: P_ping, warmer: P_warmer,
  jester: P_jester, sworn: P_sworn, outrank: P_outrank, shards: P_shards, axiom: P_axiom, hearsay: P_hearsay, venn: P_venn, stands: P_stands, bracket: P_bracket, lode: P_lode, etch: P_etch, hedge: P_hedge, listed: P_listed, mate: P_mate, four: P_four, park: P_park, check: P_check, rung: P_rung, crunch: P_crunch, taire: P_taire, fib: P_fib, streak: P_streak, feud: P_feud,
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
// Recompute Outwit's per-game board from outwit_picks (adaptive, live) instead of
// the frozen quiz_results snapshot, resolving registered names the same way
// /api/outwit does. Returns a scoreGame-shaped { field, plays, players:Map } or
// null if the picks table is unavailable (caller then falls back to quiz_results).
async function scoreOutwitLive(puzzle) {
  let rows = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('outwit_picks')
      .select('anon_id, user_id, answers, created_at')
      .eq('quiz_id', puzzle.quizId)
      .limit(20000);
    if (error || !Array.isArray(data)) return null;
    rows = data;
  } catch (e) { return null; }

  const picks = rows
    .filter((r) => Array.isArray(r.answers))
    .map((r) => ({ answers: r.answers, created: r.created_at || '', userId: r.user_id || null, anonId: r.anon_id || null }));

  // Resolve registered names (guests stay unnamed and rank out, but their picks
  // still count toward the pool — exactly like the live board).
  const userIds = [...new Set(picks.map((p) => p.userId).filter(Boolean))];
  const anonIds = [...new Set(picks.map((p) => p.anonId).filter(Boolean))];
  const nameByUser = new Map();
  const infoByAnon = new Map();
  try {
    if (userIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('id', userIds);
      for (const u of data || []) if (u.username) { nameByUser.set(u.id, u.username); if (u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id }); }
    }
    if (anonIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('anon_id', anonIds);
      for (const u of data || []) if (u.username && u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id });
    }
  } catch (e) { /* no names — board empty, pool still scores */ }

  const named = picks.map((p) => {
    let name = null, userId = p.userId;
    if (p.userId && nameByUser.has(p.userId)) name = nameByUser.get(p.userId);
    else if (p.anonId && infoByAnon.has(p.anonId)) { const info = infoByAnon.get(p.anonId); name = info.username; userId = info.id; }
    return { answers: p.answers, created: p.created, anonId: p.anonId, userId, name };
  });

  const gr = scoreOutwitGame(puzzle, named);
  return { field: gr.field, plays: picks.length, players: gr.players };
}

// Outrank is adaptive exactly like Outwit: recompute its per-game board from
// outrank_picks (the live crowd) instead of the frozen quiz_results snapshot.
// Same name-resolution flow as scoreOutwitLive above.
async function scoreOutrankLive(puzzle) {
  let rows = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('outrank_picks')
      .select('anon_id, user_id, answers, created_at')
      .eq('quiz_id', puzzle.quizId)
      .limit(20000);
    if (error || !Array.isArray(data)) return null;
    rows = data;
  } catch (e) { return null; }

  const picks = rows
    .filter((r) => Array.isArray(r.answers))
    .map((r) => ({ answers: r.answers, created: r.created_at || '', userId: r.user_id || null, anonId: r.anon_id || null }));

  const userIds = [...new Set(picks.map((p) => p.userId).filter(Boolean))];
  const anonIds = [...new Set(picks.map((p) => p.anonId).filter(Boolean))];
  const nameByUser = new Map();
  const infoByAnon = new Map();
  try {
    if (userIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('id', userIds);
      for (const u of data || []) if (u.username) { nameByUser.set(u.id, u.username); if (u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id }); }
    }
    if (anonIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('anon_id', anonIds);
      for (const u of data || []) if (u.username && u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id });
    }
  } catch (e) { /* no names — board empty, pool still scores */ }

  const named = picks.map((p) => {
    let name = null, userId = p.userId;
    if (p.userId && nameByUser.has(p.userId)) name = nameByUser.get(p.userId);
    else if (p.anonId && infoByAnon.has(p.anonId)) { const info = infoByAnon.get(p.anonId); name = info.username; userId = info.id; }
    return { answers: p.answers, created: p.created, anonId: p.anonId, userId, name };
  });

  const gr = scoreOutrankGame(puzzle, named);
  return { field: gr.field, plays: picks.length, players: gr.players };
}

// Feud is adaptive exactly like Outwit/Outrank: recompute its per-game board
// from feud_picks (the live crowd) instead of the frozen quiz_results
// snapshot. Same name-resolution flow as scoreOutwitLive above.
async function scoreFeudLive(puzzle) {
  let rows = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('feud_picks')
      .select('anon_id, user_id, answers, created_at')
      .eq('quiz_id', puzzle.quizId)
      .limit(20000);
    if (error || !Array.isArray(data)) return null;
    rows = data;
  } catch (e) { return null; }

  const picks = rows
    .filter((r) => Array.isArray(r.answers))
    .map((r) => ({ answers: r.answers, created: r.created_at || '', userId: r.user_id || null, anonId: r.anon_id || null }));

  const userIds = [...new Set(picks.map((p) => p.userId).filter(Boolean))];
  const anonIds = [...new Set(picks.map((p) => p.anonId).filter(Boolean))];
  const nameByUser = new Map();
  const infoByAnon = new Map();
  try {
    if (userIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('id', userIds);
      for (const u of data || []) if (u.username) { nameByUser.set(u.id, u.username); if (u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id }); }
    }
    if (anonIds.length) {
      const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('anon_id', anonIds);
      for (const u of data || []) if (u.username && u.anon_id) infoByAnon.set(u.anon_id, { username: u.username, id: u.id });
    }
  } catch (e) { /* no names — board empty, pool still scores */ }

  const named = picks.map((p) => {
    let name = null, userId = p.userId;
    if (p.userId && nameByUser.has(p.userId)) name = nameByUser.get(p.userId);
    else if (p.anonId && infoByAnon.has(p.anonId)) { const info = infoByAnon.get(p.anonId); name = info.username; userId = info.id; }
    return { answers: p.answers, created: p.created, anonId: p.anonId, userId, name };
  });

  const gr = scoreFeudGame(puzzle, named);
  return { field: gr.field, plays: picks.length, players: gr.players };
}

// The guest's single chosen row for a game (their anon rows only), mirroring
// scoreGame's selection: a completed attempt beats an abandoned one, then the
// first attempt (lowest id) wins. Returns null when the guest has no row.
function chooseGuestRow(rows, anonId) {
  let chosen = null;
  for (const r of (rows || [])) {
    if (!r || r.user_id || r.anon_id !== anonId) continue;
    if (!chosen) { chosen = r; continue; }
    const rDone = !r.abandoned, cDone = !chosen.abandoned;
    if (rDone !== cDone) { if (rDone) chosen = r; continue; }
    if ((r.id || 0) < (chosen.id || 0)) chosen = r;
  }
  return chosen;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  // `fresh=1` (sent by the just-finished flow) bypasses BOTH caches so the
  // player's own row is authoritative at once: force the in-process results
  // cache to run its delta, and return no-store so the edge CDN can't serve a
  // stale pre-insert snapshot. Routine background polls omit it and keep the
  // 30s edge cache, preserving the egress fix.
  const fresh = searchParams.get('fresh') === '1' || searchParams.get('fresh') === 'true';
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
    games.push({ key, quizId: p.quizId, num: p.num, rev: p.rev || null, href });
  }
  const wanted = new Set(games.map((g) => g.quizId));
  // Best-N and the ceiling scale to how many games existed that day (1..10).
  const gameCount = games.length;
  // best-N is per-day: best 10 from the 2026-07-24 slate on, best 5 before.
  const dayBestN = bestNForSuffix(suffix);
  const effBestN = gameCount ? Math.min(dayBestN, gameCount) : dayBestN;
  const maxTotal = effBestN * GAME_MAX;

  const empty = { date: suffix, maxTotal, gameMax: GAME_MAX, bestN: effBestN, gameCount, uniquePlayers: 0, games: [], overall: [], me: null, meProvisional: null };
  try {
    const { data, error } = await loadQuizResultsCached(supabaseAdmin, { force: fresh });
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

    // Unique players who touched ANY of today's daily games, guests included:
    // distinct by account (u:<user_id>) or, for a guest, by browser (a:<anon_id>).
    // A player who cleared ten games counts once. This is the headline "N players
    // today" number and intentionally includes non-registered guests.
    const uniqueSet = new Set();
    for (const arr of rowsByQuiz.values()) {
      for (const r of arr) {
        const k = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : null);
        if (k) uniqueSet.add(k);
      }
    }
    const uniquePlayers = uniqueSet.size;

    // OUTWIT OVERRIDE: Outwit is adaptively re-scored on every view (see
    // lib/outwit-score); its quiz_results snapshot is frozen at submission and
    // would disagree with the live result-page board. Recompute it from
    // outwit_picks so the per-game tab and the overall total track the live board.
    let outwitLive = null;
    const outwitGame = games.find((g) => g.key === 'outwit');
    if (outwitGame) {
      const op = (P_outwit || []).find((x) => x && x.quizId === outwitGame.quizId);
      if (op) outwitLive = await scoreOutwitLive(op);
    }
    // Same override for Outrank (also adaptive; see lib/outrank-score).
    let outrankLive = null;
    const outrankGame = games.find((g) => g.key === 'outrank');
    if (outrankGame) {
      const op = (P_outrank || []).find((x) => x && x.quizId === outrankGame.quizId);
      if (op) outrankLive = await scoreOutrankLive(op);
    }
    // Same override for Feud (live crowd-survey key; see lib/feud-score).
    let feudLive = null;
    const feudGame = games.find((g) => g.key === 'feud');
    if (feudGame) {
      const fp = (P_feud || []).find((x) => x && x.quizId === feudGame.quizId);
      if (fp) feudLive = await scoreFeudLive(fp);
    }

    const gameResults = games.map((g) => {
      if (g.key === 'outwit' && outwitLive) {
        return { key: g.key, quizId: g.quizId, num: g.num, rev: g.rev, href: g.href, field: outwitLive.field, plays: outwitLive.plays, players: outwitLive.players };
      }
      if (g.key === 'outrank' && outrankLive) {
        return { key: g.key, quizId: g.quizId, num: g.num, rev: g.rev, href: g.href, field: outrankLive.field, plays: outrankLive.plays, players: outrankLive.players };
      }
      if (g.key === 'feud' && feudLive) {
        return { key: g.key, quizId: g.quizId, num: g.num, rev: g.rev, href: g.href, field: feudLive.field, plays: feudLive.plays, players: feudLive.players };
      }
      const gameRows = rowsByQuiz.get(g.quizId) || [];
      const gr = scoreGame(gameRows);
      // field = all traceable first-attempt players (registered + guests); plays
      // = EVERY completion for that puzzle (repeats included).
      return { key: g.key, quizId: g.quizId, num: g.num, rev: g.rev, href: g.href, field: gr.field, plays: gameRows.length, players: gr.players };
    });

    const overallFull = combineDaily(gameResults, dayBestN);

    // Resolve the viewer so we can always surface THEIR standing, even outside
    // the top DISPLAY. email -> account, else this browser's anon.
    let myKey = null;
    try {
      const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
      if (ident && ident.id) myKey = `u:${ident.id}`;
      else if (anonId) myKey = `a:${anonId}`; // guests are scored into overallFull; myKey finds them directly
    } catch (e) { /* identity is best-effort */ }
    const me = myKey ? (overallFull.find((row) => row.userKey === myKey) || null) : null;

    // Fallback provisional standing: only reached when a guest is absent from
    // overallFull (e.g. no scored rows yet). After Part 3 guests appear in
    // overallFull directly via scoreGame(), so me is non-null for them.
    let meProvisional = null;
    if (!me && anonId) {
      const guestByGame = new Map();
      for (const g of games) {
        const gr = chooseGuestRow(rowsByQuiz.get(g.quizId) || [], anonId);
        if (gr) guestByGame.set(g.key, gr);
      }
      if (guestByGame.size) meProvisional = guestProvisional(guestByGame, gameResults, overallFull, dayBestN);
    }

    // Per-game display boards. Rows are the registered (named) players only, but
    // they are renumbered with a FRESH sequential competition rank (1,2,3...) so
    // the public board never shows gaps where unshown anonymous guests sit in the
    // full-field order (that produced boards reading #3, #9, #14...). `field`/
    // `plays` still count EVERYONE (guests included), so the "of today"
    // denominator stays the full pool. (owner rule 2026-07-26)
    const perGameRegRank = new Map(); // g.key -> Map(userKey -> registered board rank)
    const gameBoards = gameResults.map((g) => {
      const named = [...g.players.values()]
        .filter((p) => !!p.username)    // public board: named (registered) players only
        .sort((a, b) => a.rank - b.rank || b.points - a.points || String(a.username || '').localeCompare(String(b.username || '')));
      const rankByKey = new Map();
      let dr = 0, prevPts = null, seenN = 0;
      for (const p of named) {
        seenN += 1;
        const p10 = Math.round(p.points * 10); // one-decimal points; genuine ties share a rank
        if (prevPts === null || p10 !== prevPts) { dr = seenN; prevPts = p10; }
        rankByKey.set(p.userKey, dr);
      }
      perGameRegRank.set(g.key, rankByKey);
      return {
        key: g.key,
        quizId: g.quizId,
        num: g.num,
        rev: g.rev,
        href: g.href,
        field: g.field,
        plays: g.plays,
        registered: named.length,   // named (registered) players only, uncapped
        board: named.slice(0, BOARD).map((p) => ({
          userKey: p.userKey,
          username: p.username,
          rank: rankByKey.get(p.userKey),
          score: p.score,
          total: p.total,
          guessesUsed: p.guessesUsed,
          timeElapsed: p.timeElapsed,
          points: Math.round(p.points * 10) / 10,
          completion: Math.round(p.completion * 10) / 10,
          placement: Math.round(p.placement * 10) / 10,
        })),
      };
    });

    // Combined-today board: same treatment. Registered players only, renumbered
    // sequentially by best-N total, with the full pool still behind the "of N".
    const overallNamed = overallFull.filter((r) => !!r.username);
    const overallRankByKey = new Map();
    {
      let dr = 0, prevT = null, seenN = 0;
      for (const r of overallNamed) {
        seenN += 1;
        const t10 = Math.round((r.total || 0) * 10);
        if (prevT === null || t10 !== prevT) { dr = seenN; prevT = t10; }
        overallRankByKey.set(r.userKey, dr);
      }
    }
    const overallBoardOut = overallNamed.slice(0, DISPLAY).map((r) => ({ ...r, rank: overallRankByKey.get(r.userKey) }));

    // Personal rank tiles use the SAME registered board rank as the player's own
    // row, while the denominator (field/plays/uniquePlayers) stays the full pool,
    // so a registered player reads e.g. "#9 of 28" instead of a gappy "#23 of 28".
    if (me) {
      if (me.perGame) {
        for (const key of Object.keys(me.perGame)) {
          const rk = perGameRegRank.get(key);
          if (rk && me.userKey && rk.has(me.userKey)) me.perGame[key].rank = rk.get(me.userKey);
        }
      }
      if (me.userKey && overallRankByKey.has(me.userKey)) me.rank = overallRankByKey.get(me.userKey);
    }

    return NextResponse.json({
      date: suffix,
      maxTotal,
      gameMax: GAME_MAX,
      bestN: effBestN,
      gameCount,
      uniquePlayers,
      // overallField = full combined field (all players) for the end card's
      // "Combined today · of <field>". `overall` shows only named players but
      // ranks reflect the full pool (guests included).
      overallField: overallFull.length,
      games: gameBoards,
      overall: overallBoardOut,
      me,
      meProvisional,
    }, { headers: fresh ? NO_STORE_HEADERS : CACHE_HEADERS });
  } catch (e) {
    console.error('daily-combined exception', e);
    return NextResponse.json(empty);
  }
}
