import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { PUZZLES } from '@/app/outrank/puzzles';
import { scoreOutrankField, validBallot, HOUSE_CUTOFF } from '@/lib/outrank-score';

// POST /api/outrank  { quizId, answers:[fav, r1..rN], anonId, email? }
//
// Scores one Outrank ballot — and the whole field — against the day's pool.
// Same adaptive contract as /api/outwit (see that route's header): nothing is
// ever final. The crowd order is a pure function of ALL favorite votes in the
// pool as they stand RIGHT NOW, recomputed from scratch on every request, so
// every new player re-scores everybody. The client re-asks this route on a
// timer while the result is on screen.
//
// LEAVE-ONE-OUT: every player's prediction is graded against the crowd MINUS
// their own favorite vote, so their own ballot never shifts the order they are
// being scored on (see lib/outrank-score.js).
//
// POOL RULE: the pre-written 40-vote house crowd (server-only, in
// app/outrank/puzzles.js) is in the pool ONLY while at most HOUSE_CUTOFF real
// players have locked in; from the 11th real player on, the pool is real votes
// only, for EVERYONE. Pool-wide flag, never per-viewer.
//
// Ballots are stored in `outrank_picks` (migration 36), one row per (quiz_id,
// anon_id) — a browser's ballot is inserted once and never re-inserted, so
// nobody can stuff the vote by replaying, but their score keeps updating as
// others arrive. If the table doesn't exist yet, the game still works: pool =
// house crowd only and the live board is empty.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;
    const answers = Array.isArray(body.answers) ? body.answers.map(Number) : null;

    const puzzle = PUZZLES.find((p) => p.quizId === quizId);
    if (!puzzle) return NextResponse.json({ error: 'unknown quizId' }, { status: 400 });
    if (puzzle.live > etTodayServer()) return NextResponse.json({ error: 'not live yet' }, { status: 400 });
    const K = puzzle.items.length;
    if (!answers || !validBallot(answers, K)) {
      return NextResponse.json({ error: 'ballot invalid' }, { status: 400 });
    }
    const clean = answers.map(Number);

    // Resolve the requester's identity once — used for both live-board
    // attribution and (if new) the stored row's user_id.
    let ident = null;
    try { ident = await findQuizIdentity(supabaseAdmin, { email, anonId }); } catch (e) { /* best-effort */ }
    const myUserId = ident && ident.id ? ident.id : null;
    const myName = ident && ident.username ? ident.username : null;

    // Every real ballot so far. Table may not exist yet (migration 36 not run)
    // — the game degrades gracefully to the house pool alone, empty board.
    let rows = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('outrank_picks')
        .select('id, anon_id, user_id, answers, created_at')
        .eq('quiz_id', quizId)
        .limit(20000);
      if (!error && Array.isArray(data)) rows = data;
    } catch (e) { /* table missing — house pool only */ }

    const players = rows
      .filter((r) => Array.isArray(r.answers))
      .map((r) => ({ anonId: r.anon_id, userId: r.user_id, answers: r.answers, created: r.created_at || '', isYou: !!anonId && r.anon_id === anonId }));
    const alreadyPlayed = !!anonId && players.some((p) => p.isYou);
    if (!alreadyPlayed) {
      players.push({ anonId: anonId || null, userId: myUserId, answers: clean, created: '9999', isYou: true });
    }

    // Score the whole field with the shared adaptive scorer (the same code the
    // daily/combined board uses, so the two boards can never disagree).
    const field = scoreOutrankField(puzzle, players, { houseCutoff: HOUSE_CUTOFF });
    const { counts, poolSize, detailFor, totalFor, useHouse, realCount } = field;

    // The requester's detailed, revealed result.
    const mine = detailFor(clean);
    const points = mine.total;
    const totalVotes = counts.reduce((a, b) => a + b, 0) || 1;
    const yourFav = clean[0];
    const predicted = clean.slice(1);
    const predictedPos = new Array(K).fill(-1);
    predicted.forEach((item, pos) => { predictedPos[item] = pos; });
    // Reveal rows in the ACTUAL crowd order (leave-one-out view for this
    // player, so the reveal always agrees with their per-slot points).
    const reveal = mine.actual.map((item, pos) => ({
      item: puzzle.items[item],
      idx: item,
      rank: pos + 1,
      yourRank: predictedPos[item] + 1,
      votes: counts[item],
      pct: Math.round((counts[item] / totalVotes) * 100),
      yourFav: item === yourFav,
      pts: mine.pts[predictedPos[item]] ?? 0,
    }));
    // Per predicted slot (for the share squares: slot 1..K in the player's order).
    const slotPts = mine.pts;

    // LIVE STANDINGS — registered players only, exactly like /api/outwit.
    const userIds = [...new Set(players.map((p) => p.userId).filter(Boolean))];
    const anonIds = [...new Set(players.map((p) => p.anonId).filter(Boolean))];
    const nameByUser = new Map();
    const nameByAnon = new Map();
    try {
      if (userIds.length) {
        const { data } = await supabaseAdmin.from('quiz_users').select('id, username, anon_id').in('id', userIds);
        for (const u of data || []) { if (u.username) { nameByUser.set(u.id, u.username); if (u.anon_id) nameByAnon.set(u.anon_id, u.username); } }
      }
      if (anonIds.length) {
        const { data } = await supabaseAdmin.from('quiz_users').select('username, anon_id').in('anon_id', anonIds);
        for (const u of data || []) { if (u.username && u.anon_id) nameByAnon.set(u.anon_id, u.username); }
      }
    } catch (e) { /* no names — board just comes back empty */ }

    const named = [];
    for (const p of players) {
      const name = (p.isYou && myName) || (p.userId && nameByUser.get(p.userId)) || (p.anonId && nameByAnon.get(p.anonId)) || null;
      if (!name) continue;
      named.push({ name, total: totalFor(p), created: p.created, isYou: p.isYou });
    }
    named.sort((a, b) => b.total - a.total || String(a.created).localeCompare(String(b.created)));
    const ranked = named.map((e, i) => ({ ...e, rank: i + 1 }));
    const youEntry = ranked.find((e) => e.isYou) || null;
    const board = {
      field: realCount,
      registered: ranked.length,
      houseActive: useHouse,
      top: ranked.slice(0, 25).map((e) => ({ rank: e.rank, name: e.name, total: e.total, you: e.isYou })),
      you: youEntry ? { rank: youEntry.rank, total: youEntry.total } : null,
      youTotal: points,
      youRegistered: !!youEntry,
    };

    // Record the ballot (first submission per browser only; replays never insert).
    if (anonId && !alreadyPlayed) {
      try {
        await supabaseAdmin
          .from('outrank_picks')
          .upsert({ quiz_id: quizId, anon_id: anonId, user_id: myUserId, answers: clean }, { onConflict: 'quiz_id,anon_id', ignoreDuplicates: true });
      } catch (e) { /* table missing — scoring still returned */ }
    }

    return NextResponse.json({
      ok: true,
      quizId,
      points,
      total: K * 2,
      poolSize,
      realCount,
      houseActive: useHouse,
      replay: alreadyPlayed,
      yourFav,
      favPct: Math.round((counts[yourFav] / totalVotes) * 100),
      reveal,
      slotPts,
      board,
    });
  } catch (e) {
    console.error('outrank error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
