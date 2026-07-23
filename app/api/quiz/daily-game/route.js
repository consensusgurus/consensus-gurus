import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { scoreGame, guestGameResult, DAILY_KEYS } from '@/lib/daily-combined';

// Each game's puzzle list is server-only (answers never ship to the client). We
// read nothing but `quizId`, `num`, and `live` off it — the same fields the
// other daily routes read — to enumerate a game's drops for the calendar.
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

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player answer (the drop calendar folds in the viewer's played set, and the
// all-time board marks the viewer's own row), so keep it fresh per viewer.
const CACHE_HEADERS = { 'Cache-Control': 'private, no-store' };

const GAME_PUZZLES = {
  crux: P_crux, emcee: P_emcee, garble: P_garble, links: P_links, span: P_span, dating: P_dating,
  tally: P_tally, suds: P_suds, circa: P_circa, extra: P_extra, carve: P_carve, stet: P_stet, outwit: P_outwit,
  tuck: P_tuck, alibi: P_alibi, cipher: P_cipher, ping: P_ping, warmer: P_warmer,
  jester: P_jester, sworn: P_sworn, outrank: P_outrank,
};

const BOARD = 10; // all-time rows returned (the viewer's own rank is always in `myRank`)

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}
function suffixOfDate(dateStr) { const [Y, M, D] = dateStr.split('-').map(Number); return `${M}-${D}-${Y % 100}`; }
// "M-D-YY" -> sortable ISO "YYYY-MM-DD".
function isoOfSuffix(suffix) {
  const [M, D, YY] = suffix.split('-').map(Number);
  return `${2000 + YY}-${String(M).padStart(2, '0')}-${String(D).padStart(2, '0')}`;
}

// The guest's single chosen row for one drop (their anon rows only), mirroring
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

// GET /api/quiz/daily-game?game=<key>&anonId=&email=&fresh=
//   -> { game,
//        allTime: { field, myRank, myPoints, board:[{ userKey, username, points, rank, isMe }] },
//        drops:   [{ date, dateISO, num, href, played, isToday }] }
//
// all-time = the game's OWN cumulative leaderboard: each registered player's
// per-drop daily points (first completion, scored exactly like the live per-game
// board via scoreGame) SUMMED across every drop of this game to date. This is the
// per-game all-time standing the end card's middle rank tile shows. Guests are
// never on it (scoreGame drops them), so a guest sees a dash.
// drops = every live drop of the game (today included), flagged as played by the
// viewer, for the end card's calendar.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const game = (searchParams.get('game') || '').trim();
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const fresh = searchParams.get('fresh') === '1' || searchParams.get('fresh') === 'true';

  const none = { game, allTime: { field: 0, myRank: null, myPoints: null, board: [] }, drops: [] };
  if (!DAILY_KEYS.includes(game)) return NextResponse.json(none, { headers: CACHE_HEADERS });

  const today = etTodayServer();
  const todayQuizId = `${game}-${suffixOfDate(today)}`;
  const DAILY_ONE_RE = new RegExp(`^${game}-(\\d+)-(\\d+)-(\\d+)$`);

  // Enumerate the game's live drops (today included; future-dated drops excluded).
  const puzzles = GAME_PUZZLES[game] || [];
  const liveDrops = (puzzles || []).filter((p) => p && p.quizId && (!p.live || p.live <= today));

  // Resolve the viewer: email -> account, else this browser's anon.
  let myKey = null;
  try {
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) myKey = `u:${ident.id}`;
    else if (anonId) myKey = `a:${anonId}`;
  } catch (e) { /* identity is best-effort */ }

  try {
    const { data, error } = await loadQuizResultsCached(supabaseAdmin, { force: fresh });
    if (error) {
      console.error('daily-game error', error);
      return NextResponse.json(none, { headers: CACHE_HEADERS });
    }

    // One pass: bucket this game's rows by drop (quizId), and record which drops
    // the viewer has a result row for (their played set for the calendar).
    const prefix = game + '-';
    const byDrop = new Map();  // quizId -> rows[]
    const played = new Set();  // quizIds the viewer has played
    for (const r of (data || [])) {
      const qid = r && r.quiz_id;
      if (!qid || qid.indexOf(prefix) !== 0 || !DAILY_ONE_RE.test(qid)) continue;
      let arr = byDrop.get(qid);
      if (!arr) { arr = []; byDrop.set(qid, arr); }
      arr.push(r);
      const pk = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : null);
      if (pk && myKey && pk === myKey) played.add(qid);
    }

    // A guest (anon viewer) is never on the registered cumulative board, but we
    // can show a PROVISIONAL all-time rank: sum the points their own drops would
    // earn (each inserted into that drop's registered field) and rank that total
    // against the registered cumulative totals, mirroring the today/combined tiles.
    const isGuestViewer = !!(myKey && myKey.indexOf('a:') === 0);
    let guestPts = 0, guestDrops = 0;

    // Cumulative per-registered-player points across every drop. scoreGame handles
    // first-completion selection and the 0..15 per-drop daily scale; we just sum.
    const cum = new Map(); // userKey -> { userKey, username, points, drops }
    for (const rows of byDrop.values()) {
      const gr = scoreGame(rows);
      for (const p of gr.players.values()) {
        let u = cum.get(p.userKey);
        if (!u) { u = { userKey: p.userKey, username: p.username, points: 0, drops: 0 }; cum.set(p.userKey, u); }
        u.username = p.username; // keep the latest label
        u.points += p.points;
        u.drops += 1;
      }
      if (isGuestViewer) {
        const grow = chooseGuestRow(rows, anonId);
        if (grow) { const res = guestGameResult(grow, { field: gr.field, players: gr.players }); guestPts += res.points; guestDrops += 1; }
      }
    }
    const ranked = [...cum.values()].sort((a, b) =>
      b.points - a.points
      || b.drops - a.drops
      || String(a.username || '').localeCompare(String(b.username || '')));
    // Shared competition rank on the cumulative total (ties share a rank), keyed
    // to one-decimal points so float noise never splits a genuine tie.
    let rank = 0, prev = null, seen = 0;
    for (const row of ranked) {
      seen += 1;
      const p10 = Math.round(row.points * 10);
      if (prev === null || p10 !== prev) { rank = seen; prev = p10; }
      row.rank = rank;
    }

    const meRow = myKey ? ranked.find((r) => r.userKey === myKey) : null;
    const board = ranked.slice(0, BOARD).map((r) => ({
      userKey: r.userKey,
      username: r.username,
      points: Math.round(r.points * 10) / 10,
      rank: r.rank,
      isMe: myKey ? r.userKey === myKey : false,
    }));
    const allTime = {
      field: ranked.length,
      myRank: meRow ? meRow.rank : null,
      myPoints: meRow ? Math.round(meRow.points * 10) / 10 : null,
      provisional: false,
      board,
    };
    // Guest provisional standing (only when the viewer isn't a registered board
    // member and their own drops scored something). `provisional` tells the end
    // card to badge the rank with "prov.", exactly like the today/combined tiles.
    if (!meRow && isGuestViewer && guestDrops > 0) {
      allTime.myRank = ranked.filter((r) => r.points > guestPts).length + 1;
      allTime.myPoints = Math.round(guestPts * 10) / 10;
      allTime.provisional = true;
    }

    const drops = liveDrops.map((p) => {
      const m = p.quizId.match(DAILY_ONE_RE);
      const suffix = m ? `${m[1]}-${m[2]}-${m[3]}` : '';
      const isToday = p.quizId === todayQuizId;
      return {
        date: suffix,
        dateISO: suffix ? isoOfSuffix(suffix) : '',
        num: p.num,
        href: isToday ? `/${game}` : `/${game}?p=${p.num}`,
        played: played.has(p.quizId),
        isToday,
      };
    }).sort((a, b) => (a.dateISO < b.dateISO ? -1 : a.dateISO > b.dateISO ? 1 : 0));

    return NextResponse.json({ game, allTime, drops }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-game exception', e);
    return NextResponse.json(none, { headers: CACHE_HEADERS });
  }
}
