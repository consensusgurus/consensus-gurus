import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { PUZZLES } from '@/app/outwit/puzzles';

// POST /api/outwit  { quizId, answers:[5], anonId, email? }
//
// Scores one Outwit run — and the whole field — against the day's pool.
//
// ADAPTIVE SCORING (owner ruling 2026-07-18): nothing is ever final. Every
// score is a pure function of ALL picks in the pool as they stand RIGHT NOW, so
// it is recomputed from scratch on every request. There is no score "frozen at
// play time": when a new player locks in, the field changes and everybody's
// score and rank move with it. A player who looked dead last against a tiny
// early crowd can end up first once the field fills in, and vice-versa. Because
// the pool is identical for everyone and the scoring is order-independent,
// replaying — or simply re-opening the result — re-scores you against the live
// field. The client re-asks this route on a timer while the result is on screen.
//
// POOL RULE: the pre-written ~48-answer "house crowd" (server-only, in
// app/outwit/puzzles.js) is in the pool ONLY while at most HOUSE_CUTOFF real
// players have locked in. From the 11th real player on, the pool is real picks
// only, for EVERYONE — the house retires pool-wide, and every earlier player is
// henceforth re-scored against the human field alone. This is a single
// pool-wide flag, never per-viewer, so the field one player sees is the field
// everyone sees.
//
// Picks are stored in `outwit_picks` (migration 35), one row per (quiz_id,
// anon_id) — a browser's pick is inserted once and never re-inserted, so nobody
// can stuff the ballot by replaying, but their score keeps updating as others
// arrive. If the table doesn't exist yet, the game still works: pool = house
// crowd only and the live board is empty.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const HOUSE_CUTOFF = 10; // house retires once MORE than this many real players are in

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  if (!n) return 0;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
const round1 = (x) => Math.round(x * 10) / 10;

function fmtNum(x) {
  const v = Math.round(x);
  if (Math.abs(v) >= 1e6) return `${Math.round(v / 1e5) / 10}M`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 1000)}k`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 100) / 10}k`;
  return String(v);
}

// Reveal histogram for numeric prompts: 8 equal buckets across the pool's
// 5th..95th percentile span (outliers clamp into the edge buckets).
function histogram(pool, you, target) {
  const s = [...pool].sort((a, b) => a - b);
  const lo = s[Math.floor(s.length * 0.05)];
  const hi = s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
  const span = Math.max(1, hi - lo);
  const N = 8;
  const idxOf = (v) => Math.max(0, Math.min(N - 1, Math.floor(((v - lo) / span) * N)));
  const buckets = Array.from({ length: N }, (_, i) => ({
    label: `${fmtNum(lo + (span * i) / N)}–${fmtNum(lo + (span * (i + 1)) / N)}`,
    count: 0, you: false, target: false,
  }));
  for (const v of pool) buckets[idxOf(v)].count++;
  buckets[idxOf(you)].you = true;
  buckets[idxOf(target)].target = true;
  return buckets;
}

// A per-prompt "context" is built ONCE from the current pool. It turns any
// single answer into its point value cheaply (binary search / precomputed
// ranks), so we can score the requester (with full reveal detail) AND every
// other player for the live board without re-walking the pool each time. This
// is what makes recomputing the entire field on every request cheap.
function buildContext(pr, pool) {
  if (pr.type === 'twothirds' || pr.type === 'herd') {
    const N = pool.length || 1;
    const target = pr.type === 'twothirds' ? (2 / 3) * mean(pool) : median(pool);
    const dists = pool.map((x) => Math.abs(x - target)).sort((a, b) => a - b);
    // # of pool entries strictly closer than distance dv (lower-bound search)
    const closerThan = (dv) => {
      let lo = 0, hi = dists.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (dists[m] < dv) lo = m + 1; else hi = m; }
      return lo;
    };
    // # strictly farther than dv (upper-bound search)
    const fartherThan = (dv) => {
      let lo = 0, hi = dists.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (dists[m] <= dv) lo = m + 1; else hi = m; }
      return dists.length - lo;
    };
    const ptsFor = (v) => {
      const frac = closerThan(Math.abs(v - target)) / N;
      return frac < 1 / 3 ? 2 : frac < 2 / 3 ? 1 : 0;
    };
    const beatPctFor = (v) => Math.round((fartherThan(Math.abs(v - target)) / N) * 100);
    return { kind: 'num', type: pr.type, target, med: median(pool), pool, ptsFor, beatPctFor };
  }
  if (pr.type === 'least' || pr.type === 'match') {
    const counts = new Array(pr.options.length).fill(0);
    for (const v of pool) if (Number.isInteger(v) && v >= 0 && v < counts.length) counts[v]++;
    const order = counts.map((c, i) => ({ c, i })).sort((a, b) => (pr.type === 'least' ? a.c - b.c : b.c - a.c) || a.i - b.i);
    const rankOf = new Array(counts.length).fill(Infinity);
    order.forEach((o, idx) => { rankOf[o.i] = idx; });
    const ptsFor = (v) => { const r = rankOf[v]; return r === 0 ? 2 : r === 1 ? 1 : 0; };
    return { kind: 'choice', type: pr.type, counts, winner: order[0].i, ptsFor };
  }
  // unique: rarest number in [min..max] wins, ties to the lower number
  const size = pr.max - pr.min + 1;
  const counts = new Array(size).fill(0);
  for (const v of pool) { const k = v - pr.min; if (Number.isInteger(v) && k >= 0 && k < size) counts[k]++; }
  const order = counts.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c || a.i - b.i);
  const rankOf = new Array(size).fill(Infinity);
  order.forEach((o, idx) => { rankOf[o.i] = idx; });
  const ptsFor = (v) => { const r = rankOf[v - pr.min]; return r < 4 ? 2 : r < 10 ? 1 : 0; };
  return { kind: 'unique', type: pr.type, counts, winner: order[0].i + pr.min, min: pr.min, max: pr.max, ptsFor };
}

// Build the requester's reveal object for one prompt from its context.
function reveal(pr, ctx, you, poolSize) {
  const base = { type: pr.type, tag: pr.tag, q: pr.q, yourAnswer: you, pts: ctx.ptsFor(you), poolSize };
  if (ctx.kind === 'num') {
    const out = {
      ...base,
      target: round1(ctx.target),
      median: round1(ctx.med),
      beatPct: ctx.beatPctFor(you),
      buckets: histogram(ctx.pool, you, ctx.target),
    };
    if (pr.type === 'herd' && pr.truth != null) { out.truth = pr.truth; out.truthNote = pr.truthNote || null; }
    return out;
  }
  if (ctx.kind === 'choice') return { ...base, options: pr.options, counts: ctx.counts, winner: ctx.winner };
  return { ...base, min: pr.min, max: pr.max, counts: ctx.counts, winner: ctx.winner };
}

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
    const answers = Array.isArray(body.answers) ? body.answers : null;

    const puzzle = PUZZLES.find((p) => p.quizId === quizId);
    if (!puzzle) return NextResponse.json({ error: 'unknown quizId' }, { status: 400 });
    if (puzzle.live > etTodayServer()) return NextResponse.json({ error: 'not live yet' }, { status: 400 });
    if (!answers || answers.length !== puzzle.prompts.length) {
      return NextResponse.json({ error: 'answers required' }, { status: 400 });
    }
    // validate each answer against its prompt
    const clean = [];
    for (let i = 0; i < puzzle.prompts.length; i++) {
      const pr = puzzle.prompts[i];
      const v = Number(answers[i]);
      if (!Number.isInteger(v)) return NextResponse.json({ error: `answer ${i + 1} invalid` }, { status: 400 });
      if (pr.options) {
        if (v < 0 || v >= pr.options.length) return NextResponse.json({ error: `answer ${i + 1} out of range` }, { status: 400 });
      } else if (v < pr.min || v > pr.max) {
        return NextResponse.json({ error: `answer ${i + 1} out of range` }, { status: 400 });
      }
      clean.push(v);
    }

    // Resolve the requester's identity once — used for both live-board
    // attribution and (if new) the stored row's user_id.
    let ident = null;
    try { ident = await findQuizIdentity(supabaseAdmin, { email, anonId }); } catch (e) { /* best-effort */ }
    const myUserId = ident && ident.id ? ident.id : null;
    const myName = ident && ident.username ? ident.username : null;

    // Every real pick so far. Table may not exist yet (migration 35 not run) —
    // the game degrades gracefully to the house pool alone with an empty board.
    let rows = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('outwit_picks')
        .select('id, anon_id, user_id, answers, created_at')
        .eq('quiz_id', quizId)
        .limit(20000);
      if (!error && Array.isArray(data)) rows = data;
    } catch (e) { /* table missing — house pool only */ }

    // One player object per stored row. Then make sure the requester is in the
    // field exactly once: an existing player (replay) already is; a brand-new
    // player (or a no-anonId ephemeral play) is added so they are scored as part
    // of the live field, symmetric with everyone else.
    const players = rows
      .filter((r) => Array.isArray(r.answers))
      .map((r) => ({ anonId: r.anon_id, userId: r.user_id, answers: r.answers, created: r.created_at || '', isYou: !!anonId && r.anon_id === anonId }));
    const alreadyPlayed = !!anonId && players.some((p) => p.isYou);
    if (!alreadyPlayed) {
      players.push({ anonId: anonId || null, userId: myUserId, answers: clean, created: '9999', isYou: true });
    }

    const realCount = players.length;
    const useHouse = realCount <= HOUSE_CUTOFF;

    // Build one scoring context per prompt from the current, identical-for-all
    // pool (house while seeding + every real pick).
    const contexts = puzzle.prompts.map((pr, i) => {
      const pool = [
        ...(useHouse ? pr.house : []),
        ...players.map((p) => Number(p.answers[i])).filter((x) => Number.isInteger(x)),
      ];
      return { ctx: buildContext(pr, pool), poolSize: pool.length };
    });

    // The requester's detailed, revealed result.
    const prompts = puzzle.prompts.map((pr, i) => reveal(pr, contexts[i].ctx, clean[i], contexts[i].poolSize));
    const points = prompts.reduce((s, p) => s + p.pts, 0);

    // LIVE STANDINGS: recompute every player's total against the same pool and
    // rank them. This is the board that visibly re-shuffles as picks arrive.
    // Names: registered players only (resolved by user_id or by anon_id), the
    // same population the rest of the daily leaderboards show.
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

    const totalFor = (p) => contexts.reduce((s, c, i) => s + c.ctx.ptsFor(Number(p.answers[i])), 0);
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

    // Record the pick (first submission per browser only; replays never insert).
    if (anonId && !alreadyPlayed) {
      try {
        await supabaseAdmin
          .from('outwit_picks')
          .upsert({ quiz_id: quizId, anon_id: anonId, user_id: myUserId, answers: clean }, { onConflict: 'quiz_id,anon_id', ignoreDuplicates: true });
      } catch (e) { /* table missing — scoring still returned */ }
    }

    return NextResponse.json({
      ok: true,
      quizId,
      points,
      total: puzzle.prompts.length * 2,
      poolSize: prompts[0] ? prompts[0].poolSize : 0,
      realCount,
      houseActive: useHouse,
      replay: alreadyPlayed,
      prompts,
      board,
    });
  } catch (e) {
    console.error('outwit error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
