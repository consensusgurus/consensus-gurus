import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Whole-table reads are paginated past PostgREST's silent 1000-row cap
    // (see lib/fetch-all.js). The trending RPC returns one row per list with
    // recent views and stays far below the cap.
    const [votesRes, viewsRes, extrasRes, userListsRes, trendingRes, quizViewsRes] = await Promise.all([
      fetchAllRows(supabase, 'votes', 'list_id,item_name,score', ['list_id', 'item_name']),
      fetchAllRows(supabase, 'views', 'list_id,count', ['list_id']),
      fetchAllRows(supabase, 'extras', 'list_id,item_name', ['list_id', 'item_name']),
      fetchAllRows(supabase, 'user_lists', '*', [['submitted_at', false], 'id'], (q) => q.eq('published', true)),
      supabase.rpc('trending_views', { p_hours: 24 }),
      // Quiz-page view totals (separate quiz_views table). Safe if the table
      // does not exist yet: fetchAllRows returns { data: [] } on error.
      fetchAllRows(supabase, 'quiz_views', 'quiz_id,count', ['quiz_id']),
    ]);

    // Vote scores keyed as `${listId}::${itemNameLowerCase}` to match client voteKey()
    const votes = {};
    (votesRes.data || []).forEach((row) => {
      // Legacy downvotes from the prior voting system left negative net scores.
      // Clamp to 0 so they never count toward consensus or display.
      votes[`${row.list_id}::${row.item_name.toLowerCase().trim()}`] = Math.max(0, row.score);
    });

    const views = {};
    (viewsRes.data || []).forEach((row) => {
      views[row.list_id] = row.count;
    });
    // Quiz-page views count toward the site visitor total in the homepage
    // header. Merge them under a namespaced key so they sum into the total
    // without overwriting a paired list's count (a quiz can share its list id).
    (quizViewsRes.data || []).forEach((row) => {
      views[`quiz::${row.quiz_id}`] = row.count;
    });

    const extras = {};
    (extrasRes.data || []).forEach((row) => {
      if (!extras[row.list_id]) extras[row.list_id] = [];
      extras[row.list_id].push(row.item_name);
    });

    // Reshape user lists to the shape the client expects
    const userLists = (userListsRes.data || []).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      type: row.type,
      linkType: row.link_type,
      blurb: row.blurb,
      isUserSubmitted: true,
      defaultSource: row.default_source || 'ai',
      sources: row.sources || {},
      vote: { items: row.vote_items || [] },
      links: row.links || undefined,
      submittedAt: row.submitted_at,
    }));

    // Rolling-24h view counts per list for the Trending sort.
    const trending = {};
    (trendingRes && trendingRes.data ? trendingRes.data : []).forEach((row) => {
      trending[row.list_id] = Number(row.cnt) || 0;
    });

    return NextResponse.json({ votes, views, extras, userLists, trending });
  } catch (e) {
    console.error('bootstrap error', e);
    return NextResponse.json(
      { votes: {}, views: {}, extras: {}, userLists: [], trending: {} },
      { status: 200 }
    );
  }
}
