// Public, read-only activity feed for a single list page (ActivityFeed.jsx).
// Anonymized streams; runs server-side with the service-role key.
//
// PRIVACY: manager notes come from `complaints` but this route selects ONLY
// message, created_at, and the editor_response -- never name or email.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = (searchParams.get('listId') || '').trim();
    if (!listId || listId.length > 100) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }

    const list = LISTS.find((l) => l.id === listId);

    const [votesRes, managerRes, researchRes, commentsRes, seenRes] = await Promise.all([
      supabaseAdmin.from('vote_events').select('item_name,delta,created_at').eq('list_id', listId).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('complaints').select('message,created_at,editor_response').eq('list_id', listId).eq('feed_hidden', false).order('created_at', { ascending: false }).limit(12),
      supabaseAdmin.from('consensus_alerts').select('item_name,change_type,rank,detected_at').eq('list_id', listId).order('detected_at', { ascending: false }).limit(12),
      supabaseAdmin.from('list_comments').select('id,name,body,created_at,editor_response').eq('list_id', listId).eq('hidden', false).order('created_at', { ascending: false }).limit(60),
      supabaseAdmin.from('list_sources_seen').select('source_id,first_seen_at').eq('list_id', listId),
    ]);

    const votes = (votesRes.data || []).map((r) => ({ itemName: r.item_name, delta: r.delta, createdAt: r.created_at }));
    const manager = (managerRes.data || []).map((r) => ({ message: r.message, createdAt: r.created_at, editorResponse: (r.editor_response && r.editor_response.trim()) || null }));
    const research = (researchRes.data || []).map((r) => ({ itemName: r.item_name, changeType: r.change_type, rank: r.rank, detectedAt: r.detected_at }));
    const comments = (commentsRes.data || []).map((r) => ({ id: r.id, name: (r.name && r.name.trim()) || null, body: r.body, createdAt: r.created_at, editorResponse: (r.editor_response && r.editor_response.trim()) || null }));

    // Source-added tracking, stamped on view so a newly added source surfaces
    // without waiting for the daily cron. The first time a list is seen we
    // backfill its whole current source set to the list's creation date (the
    // launch batch). After that, any source missing from the table is a genuine
    // later addition and is dated now() -- so it shows under "Research".
    const seenRows = seenRes.data || [];
    const seenMap = new Map(seenRows.map((r) => [r.source_id, r.first_seen_at]));
    const currentIds = list && list.sources
      ? Object.keys(list.sources).filter((id) => id !== 'ai' && list.sources[id] && list.sources[id].label)
      : [];
    const missing = currentIds.filter((id) => !seenMap.has(id));
    if (missing.length > 0) {
      const isInitial = seenRows.length === 0;
      const created = list && (list.publishedAt || list.publishedDate);
      const initialIso = created && !isNaN(Date.parse(created)) ? new Date(created).toISOString() : new Date().toISOString();
      const stampIso = isInitial ? initialIso : new Date().toISOString();
      const rows = missing.map((id) => ({ list_id: listId, source_id: id, first_seen_at: stampIso }));
      try {
        await supabaseAdmin.from('list_sources_seen').upsert(rows, { onConflict: 'list_id,source_id', ignoreDuplicates: true });
        missing.forEach((id) => seenMap.set(id, stampIso));
      } catch (_) {
        // non-fatal; fall back below
      }
    }

    const fallback = (list && (list.publishedAt || list.publishedDate)) || null;
    const sources = [];
    if (list && list.sources) {
      for (const [sid, s] of Object.entries(list.sources)) {
        if (sid === 'ai' || !s || !s.label) continue;
        sources.push({ id: sid, label: s.label, trueExpert: Boolean(s.trueExpert), addedAt: seenMap.get(sid) || fallback });
      }
    }
    sources.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));

    return NextResponse.json({ votes, manager, research, comments, sources });
  } catch (err) {
    console.error('list-feed error', err);
    return NextResponse.json({ votes: [], manager: [], research: [], comments: [], sources: [] });
  }
}
