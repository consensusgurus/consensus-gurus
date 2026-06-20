// Read-only admin activity summary for the daily Cowork research task.
// GET /api/admin/summary?sinceHours=24
//
// Auth: the admin cookie OR an "x-admin-token" header matching the
// ADMIN_TASK_TOKEN env var (same pattern as /api/admin/alerts). Returns
// the last-N-hours activity behind the admin tabs: new list submissions,
// new extras, new complaints, vote events, and per-list views, plus
// unresolved consensus alerts. Read-only; mutates nothing.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

export async function GET(request) {
  if (!isAdmin() && !tokenOk(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sinceHours = Math.max(
    1,
    Math.min(24 * 14, Number(searchParams.get('sinceHours')) || 24)
  );
  const sinceIso = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();

  try {
    const [
      submissionsRes,
      extrasRes,
      complaintsRes,
      voteEventsRes,
      alertsRes,
      trendingRes,
    ] = await Promise.all([
      supabaseAdmin
        .from('user_lists')
        .select('id, title, category, type, published, submitted_at')
        .gte('submitted_at', sinceIso)
        .order('submitted_at', { ascending: false }),
      supabaseAdmin
        .from('extras')
        .select('list_id, item_name, added_at')
        .gte('added_at', sinceIso)
        .order('added_at', { ascending: false }),
      supabaseAdmin
        .from('complaints')
        .select('id, list_id, list_title, message, name, email, created_at')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('vote_events')
        .select('list_id, item_name, delta, created_at')
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(500),
      supabaseAdmin
        .from('consensus_alerts')
        .select('id, list_id, item_name, change_type, rank, detected_at')
        .eq('resolved', false)
        .order('detected_at', { ascending: false }),
      supabaseAdmin.rpc('trending_views', { p_hours: sinceHours }),
    ]);

    const listTitles = new Map(LISTS.map((l) => [l.id, l.title]));
    const title = (id) => listTitles.get(id) || id;

    // Aggregate vote events per list+item so the digest is readable.
    const voteAgg = new Map();
    for (const ev of voteEventsRes.data || []) {
      const key = `${ev.list_id}::${ev.item_name}`;
      const cur = voteAgg.get(key) || {
        listId: ev.list_id,
        listTitle: title(ev.list_id),
        itemName: ev.item_name,
        votes: 0,
        net: 0,
      };
      cur.votes += 1;
      cur.net += Number(ev.delta) || 0;
      voteAgg.set(key, cur);
    }
    const voteActivity = Array.from(voteAgg.values()).sort(
      (a, b) => b.votes - a.votes
    );

    const views = ((trendingRes && trendingRes.data) || [])
      .map((row) => ({
        listId: row.list_id,
        listTitle: title(row.list_id),
        views: Number(row.cnt) || 0,
      }))
      .filter((v) => v.views > 0)
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({
      sinceHours,
      sinceIso,
      generatedAt: new Date().toISOString(),
      submissions: (submissionsRes.data || []).map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        type: row.type,
        published: row.published,
        submittedAt: row.submitted_at,
      })),
      extras: (extrasRes.data || []).map((row) => ({
        listId: row.list_id,
        listTitle: title(row.list_id),
        itemName: row.item_name,
        addedAt: row.added_at,
      })),
      complaints: (complaintsRes.data || []).map((row) => ({
        id: row.id,
        listId: row.list_id,
        listTitle: row.list_title || title(row.list_id),
        message: row.message,
        name: row.name,
        email: row.email,
        createdAt: row.created_at,
      })),
      voteActivity,
      views: {
        total: views.reduce((n, v) => n + v.views, 0),
        topLists: views.slice(0, 15),
      },
      unresolvedAlerts: (alertsRes.data || []).map((row) => ({
        id: row.id,
        listId: row.list_id,
        listTitle: title(row.list_id),
        itemName: row.item_name,
        changeType: row.change_type,
        rank: row.rank,
        detectedAt: row.detected_at,
      })),
    });
  } catch (err) {
    console.error('admin summary error', err);
    return NextResponse.json({ error: 'failed to build summary' }, { status: 500 });
  }
}
