import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [votesRes, viewsRes, extrasRes, userListsRes] = await Promise.all([
      supabase.from('votes').select('list_id,item_name,score'),
      supabase.from('views').select('list_id,count'),
      supabase.from('extras').select('list_id,item_name'),
      supabase
        .from('user_lists')
        .select('*')
        .eq('published', true)
        .order('submitted_at', { ascending: false }),
    ]);

    // Vote scores keyed as `${listId}::${itemNameLowerCase}` to match client voteKey()
    const votes = {};
    (votesRes.data || []).forEach((row) => {
      votes[`${row.list_id}::${row.item_name.toLowerCase().trim()}`] = row.score;
    });

    const views = {};
    (viewsRes.data || []).forEach((row) => {
      views[row.list_id] = row.count;
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

    return NextResponse.json({ votes, views, extras, userLists });
  } catch (e) {
    console.error('bootstrap error', e);
    return NextResponse.json(
      { votes: {}, views: {}, extras: {}, userLists: [] },
      { status: 200 }
    );
  }
}
