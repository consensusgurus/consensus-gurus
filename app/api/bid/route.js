import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { PUZZLES } from '@/app/bid/puzzles';
import { scoreField, validBids, HOUSE_CUTOFF } from '@/lib/bid-score';

// POST /api/bid  { quizId, bids:[5], anonId, email? }
//
// Scores one Bid allocation — and the whole field — against the day's pool.
// Deliberately built to the same shape as /api/outwit, because the two games
// have the same problem: there is no right answer, only the crowd.
//
// ADAPTIVE SCORING: nothing is final. A score is a pure function of every
// allocation in the pool as it stands right now, recomputed from scratch on each
// request, so when a new player bids the medians move and everybody's result
// moves with them. Re-opening your result re-scores you against the live field.
//
// LEAVE-ONE-OUT: the median you are measured against on each lot excludes your
// own bid, so your own money can never be the thing that outbids you.
//
// POOL RULE: the pre-written opening crowd (server-only, in app/bid/puzzles.js)
// is in the pool ONLY while fewer than HOUSE_CUTOFF real players have bid. From
// the 10th real player on it retires pool-wide, for everyone at once, and the
// field is humans alone.
//
// Bids are stored in `bid_picks` (migration 42), one row per (quiz_id, anon_id),
// so a browser's allocation is inserted once and replaying cannot stuff the
// ballot. If the table does not exist yet the game still works: the pool is the
// opening crowd alone and the live board is empty.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const anonId = typeof body.anonId === 'string' ? body.anonId.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const puzzle = PUZZLES.find((p) => p.quizId === quizId);
    if (!puzzle) return NextResponse.json({ error: 'unknown quizId' }, { status: 400 });

    const bids = Array.isArray(body.bids) ? body.bids.map((v) => Math.trunc(Number(v))) : null;
    if (!bids || !validBids(bids, puzzle)) {
      return NextResponse.json({ error: 'bids must be whole numbers within the purse' }, { status: 400 });
    }

    let ident = null;
    try { ident = await findQuizIdentity(supabaseAdmin, { email, anonId }); } catch (e) { /* best-effort */ }
    const myUserId = ident && ident.id ? ident.id : null;
    const myName = ident && ident.username ? ident.username : null;

    let rows = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('bid_picks')
        .select('id, anon_id, user_id, bids, created_at')
        .eq('quiz_id', quizId)
        .limit(20000);
      if (!error && Array.isArray(data)) rows = data;
    } catch (e) { /* table missing — opening crowd only */ }

    const players = rows
      .filter((r) => Array.isArray(r.bids) && r.bids.length === puzzle.lots.length)
      .map((r) => ({ anonId: r.anon_id, userId: r.user_id, bids: r.bids, created: r.created_at || '', isYou: !!anonId && r.anon_id === anonId }));
    const alreadyPlayed = !!anonId && players.some((p) => p.isYou);
    if (!alreadyPlayed) {
      players.push({ anonId: anonId || null, userId: myUserId, bids, created: '9999', isYou: true });
    }

    const { results, useHouse, realCount, poolSize, totalValue } = scoreField(puzzle, players, { houseCutoff: HOUSE_CUTOFF });
    const me = players.find((p) => p.isYou);
    const mine = results.get(me);

    // What each lot went for, so the reveal can show where the money was.
    const lots = puzzle.lots.map((l, i) => ({
      name: l.name,
      value: l.value,
      yourBid: bids[i],
      threshold: mine.thresholds[i],
      won: mine.won.includes(i),
    }));

    // LIVE STANDINGS, recomputed against the same pool. Registered players only,
    // the same population every other daily board shows.
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
    } catch (e) { /* no names — the board just comes back empty */ }

    const named = [];
    for (const p of players) {
      const name = (p.isYou && myName) || (p.userId && nameByUser.get(p.userId)) || (p.anonId && nameByAnon.get(p.anonId)) || null;
      if (!name) continue;
      const r = results.get(p);
      named.push({ name, points: r.points, lots: r.won.length, created: p.created, isYou: p.isYou });
    }
    named.sort((a, b) => b.points - a.points || String(a.created).localeCompare(String(b.created)));
    const ranked = named.map((e, i) => ({ ...e, rank: i + 1 }));
    const youEntry = ranked.find((e) => e.isYou) || null;

    if (anonId && !alreadyPlayed) {
      try {
        await supabaseAdmin
          .from('bid_picks')
          .upsert({ quiz_id: quizId, anon_id: anonId, user_id: myUserId, bids }, { onConflict: 'quiz_id,anon_id', ignoreDuplicates: true });
      } catch (e) { /* table missing — scoring still returned */ }
    }

    return NextResponse.json({
      ok: true,
      quizId,
      points: mine.points,
      totalValue,
      score: mine.score,
      lots,
      poolSize,
      realCount,
      houseActive: useHouse,
      replay: alreadyPlayed,
      board: {
        field: realCount,
        registered: ranked.length,
        houseActive: useHouse,
        top: ranked.slice(0, 25).map((e) => ({ rank: e.rank, name: e.name, points: e.points, lots: e.lots, you: e.isYou })),
        you: youEntry ? { rank: youEntry.rank, points: youEntry.points } : null,
        youRegistered: !!youEntry,
      },
    });
  } catch (e) {
    console.error('bid error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
