// Public, read-only activity feed for a single list page (ActivityFeed.jsx).
// Returns four anonymized streams. Runs server-side with the service-role key
// so it can read tables that have no public select policy, while controlling
// exactly which columns are exposed.
//
// PRIVACY: manager notes come from the `complaints` table, but this route
// selects ONLY `message` and `created_at` -- never `name` or `email`. The
// reader's contact details stay private. `feed_hidden` notes are excluded.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = (searchParams.get('listId') || '').trim();
    if (!listId || listId.length > 100) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }

    const [votesRes, managerRes, researchRes, commentsRes] = await Promise.all([
      supabaseAdmin
        .from('vote_events')
        .select('item_name,delta,created_at')
        .eq('list_id', listId)
        .order('created_at', { ascending: false })
        .limit(20),
      // Manager notes: message + created_at ONLY. Never name/email.
      supabaseAdmin
        .from('complaints')
        .select('message,created_at')
        .eq('list_id', listId)
        .eq('feed_hidden', false)
        .not('message', 'is', null)
        .neq('message', '')
        .order('created_at', { ascending: false })
        .limit(12),
      supabaseAdmin
        .from('consensus_alerts')
        .select('item_name,change_type,rank,detected_at')
        .eq('list_id', listId)
        .order('detected_at', { ascending: false })
        .limit(12),
      supabaseAdmin
        .from('list_comments')
        .select('name,body,created_at')
        .eq('list_id', listId)
        .eq('hidden', false)
        .order('created_at', { ascending: false })
        .limit(60),
    ]);

    const votes = (votesRes.data || []).map((r) => ({
      itemName: r.item_name,
      delta: r.delta,
      createdAt: r.created_at,
    }));

    const manager = (managerRes.data || []).map((r) => ({
      message: r.message,
      createdAt: r.created_at,
    }));

    const research = (researchRes.data || []).map((r) => ({
      itemName: r.item_name,
      changeType: r.change_type,
      rank: r.rank,
      detectedAt: r.detected_at,
    }));

    const comments = (commentsRes.data || []).map((r) => ({
      name: (r.name && r.name.trim()) || null,
      body: r.body,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ votes, manager, research, comments });
  } catch (err) {
    console.error('list-feed error', err);
    // A feed failure should never break the page; return empty streams.
    return NextResponse.json({ votes: [], manager: [], research: [], comments: [] });
  }
}
