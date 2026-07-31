// Traffic-source breakdown for one list over a rolling window.
// GET /api/admin/list-sources?listId=<id>&hours=24
//
// Auth: the admin cookie OR an "x-admin-token" header matching ADMIN_TASK_TOKEN
// (same pattern as /api/admin/summary). Reads the per-view rows from
// view_events with the service-role client (bypasses RLS) and aggregates in JS,
// mirroring how the summary route rolls up vote_events. Bot vs human is reported
// at the top; channel / referrer breakdowns cover HUMAN traffic only, since bots
// carry little referrer signal. Tolerates migration 31 not being applied yet.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

function isMissingColumn(err) {
  if (!err) return false;
  return err.code === '42703' || err.code === 'PGRST204' || /column|schema cache/i.test(err.message || '');
}

// Page through the window in <=1000-row batches (Supabase's per-request cap),
// bounded so a pathological window can't spin forever.
async function fetchRows(listId, sinceIso, cols) {
  const PAGE = 1000;
  const MAX = 50000;
  let rows = [];
  for (let from = 0; from < MAX; from += PAGE) {
    const { data, error } = await supabaseAdmin
      .from('view_events')
      .select(cols)
      .eq('list_id', listId)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return { error };
    rows = rows.concat(data || []);
    if (!data || data.length < PAGE) break;
  }
  return { rows };
}

function topN(rows, field, n) {
  const counts = new Map();
  for (const r of rows) {
    const v = r[field];
    if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export async function GET(request) {
  if (!isAdmin() && !tokenOk(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listId = (searchParams.get('listId') || '').trim();
  if (!listId || listId.length > 100) {
    return NextResponse.json({ error: 'listId required' }, { status: 400 });
  }
  const hours = Math.max(1, Math.min(24 * 14, Number(searchParams.get('hours')) || 24));
  const sinceIso = new Date(Date.now() - hours * 3600 * 1000).toISOString();

  // Prefer the full attribution column set (migration 31). If those columns are
  // not applied yet, fall back to the always-present country column so the panel
  // still renders (channels/bots reported as unavailable).
  let attribution = true;
  let res = await fetchRows(listId, sinceIso, 'is_bot, channel, referrer_host, country');
  if (res.error && isMissingColumn(res.error)) {
    attribution = false;
    res = await fetchRows(listId, sinceIso, 'country');
  }
  if (res.error) {
    console.error('list-sources error', res.error);
    return NextResponse.json({ error: 'failed to build breakdown' }, { status: 500 });
  }
  const rows = res.rows;

  if (!attribution) {
    return NextResponse.json({
      listId, hours, sinceIso, attribution: false,
      total: rows.length, humans: null, bots: null, botPct: null,
      channels: [], topReferrers: [],
      topCountries: topN(rows, 'country', 8).map((x) => ({ country: x.key, count: x.count })),
    });
  }

  // Null is_bot (rows logged before migration 31) counts as human.
  const bots = rows.filter((r) => r.is_bot === true);
  const humans = rows.filter((r) => r.is_bot !== true);

  const CHANNELS = ['direct', 'organic', 'social', 'referral', 'internal'];
  const cc = new Map(CHANNELS.map((c) => [c, 0]));
  let other = 0;
  for (const r of humans) {
    if (cc.has(r.channel)) cc.set(r.channel, cc.get(r.channel) + 1);
    else other += 1;
  }
  const channels = CHANNELS.map((c) => ({ channel: c, count: cc.get(c) }));
  if (other > 0) channels.push({ channel: 'unknown', count: other });

  return NextResponse.json({
    listId, hours, sinceIso, attribution: true,
    generatedAt: new Date().toISOString(),
    total: rows.length,
    humans: humans.length,
    bots: bots.length,
    botPct: rows.length ? Math.round((bots.length / rows.length) * 100) : 0,
    channels,
    topReferrers: topN(humans, 'referrer_host', 8).map((x) => ({ host: x.key, count: x.count })),
    topCountries: topN(humans, 'country', 8).map((x) => ({ country: x.key, count: x.count })),
  });
}
