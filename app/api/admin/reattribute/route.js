// Admin action: reattribute a player's ORPHANED anonymous game rows to their
// account. A daily result is only scored onto the combined/per-game leaderboard
// when its quiz_results row carries a user_id (see lib/daily-combined.js
// scoreGame, which skips rows with no user_id). A row that saved WITHOUT one
// (identity unresolved at submit time) is invisible to the board even though the
// play happened and the client showed a success screen. This endpoint resolves
// an account (by email or username), collects every browser anon_id that belongs
// to it, and — with apply:true — links its orphaned rows back to it, exactly the
// way attributeAnonGames does at join time.
//
// Auth: the admin cookie (/admin) OR an "x-admin-token" header matching the
// ADMIN_TASK_TOKEN env var. Default is a DRY RUN (diagnosis only, no writes);
// pass apply:true to actually attribute. Optionally scope with quizPrefix
// (e.g. "tuck-") to inspect a single game.
//
// POST { email?, username?, apply?, quizPrefix? }
//  -> { account, browsers, orphanCount, orphans:[...], applied, updated }

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

export async function POST(request) {
  if (!isAdmin() && !tokenOk(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = (await request.json()) || {};
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const apply = body.apply === true;
    const quizPrefix = typeof body.quizPrefix === 'string' ? body.quizPrefix.trim() : '';
    if (!email && !username) {
      return NextResponse.json({ error: 'email or username required' }, { status: 400 });
    }

    // Resolve the account. Email is authoritative; fall back to an exact
    // (case-insensitive) username match.
    let account = null;
    if (email) {
      const { data } = await supabaseAdmin
        .from('quiz_users')
        .select('id, username, email, anon_id')
        .ilike('email', email)
        .maybeSingle();
      account = data || null;
    }
    if (!account && username) {
      const { data } = await supabaseAdmin
        .from('quiz_users')
        .select('id, username, email, anon_id')
        .ilike('username', username);
      if (Array.isArray(data)) {
        account = data.find((u) => (u.username || '').trim().toLowerCase() === username.toLowerCase()) || data[0] || null;
      }
    }
    if (!account) {
      return NextResponse.json({ error: 'account not found', email: email || null, username: username || null }, { status: 404 });
    }

    // Every browser anon that belongs to this account: the one stored on the
    // account row, plus every anon seen on its already-attributed results. This
    // is the same account->browsers resolution resolveAnonSet uses.
    const anonSet = new Set();
    if (account.anon_id) anonSet.add(account.anon_id);
    {
      const { data } = await supabaseAdmin
        .from('quiz_results')
        .select('anon_id')
        .eq('user_id', account.id)
        .not('anon_id', 'is', null)
        .limit(5000);
      for (const r of (data || [])) if (r.anon_id) anonSet.add(r.anon_id);
    }
    const anonList = [...anonSet];

    // Orphaned rows: no user_id, but recorded on one of THIS account's browsers.
    // Restricting to the account's own anon_ids is what keeps the write safe: it
    // can never claim a row that isn't already tied to this player's browser.
    let orphans = [];
    if (anonList.length) {
      const { data } = await supabaseAdmin
        .from('quiz_results')
        .select('id, quiz_id, score, total, abandoned, anon_id, username, created_at')
        .is('user_id', null)
        .in('anon_id', anonList)
        .order('created_at', { ascending: false })
        .limit(5000);
      orphans = data || [];
    }
    if (quizPrefix) orphans = orphans.filter((r) => (r.quiz_id || '').startsWith(quizPrefix));

    const summary = {
      account: { id: account.id, username: account.username, email: account.email || null, anon_id: account.anon_id || null },
      browsers: anonList.length,
      orphanCount: orphans.length,
      orphans: orphans.map((r) => ({
        id: r.id,
        quiz_id: r.quiz_id,
        score: r.score,
        total: r.total,
        abandoned: !!r.abandoned,
        anon_id: r.anon_id,
        created_at: r.created_at,
      })),
      applied: false,
      updated: 0,
    };

    if (apply && orphans.length) {
      const ids = orphans.map((r) => r.id);
      const { data, error } = await supabaseAdmin
        .from('quiz_results')
        .update({ user_id: account.id, username: account.username })
        .in('id', ids)
        .is('user_id', null)
        .select('id');
      if (error) {
        console.error('reattribute update error', error);
        return NextResponse.json({ ...summary, error: 'update failed' }, { status: 500 });
      }
      summary.applied = true;
      summary.updated = (data || []).length;
    }

    return NextResponse.json(summary);
  } catch (e) {
    console.error('reattribute error', e);
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
