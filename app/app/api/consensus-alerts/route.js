// Read-only feed of unresolved consensus alerts, enriched with research
// status: whether the item already has a description (lib/descriptions.js)
// and, for top-3 entrants, a hero image (lib/hero-images.js). Contains no
// secrets (consensus and item names are public site data); used by the
// admin panel's Research tab and the weekly email summary task.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sinceDays = parseInt(searchParams.get('sinceDays') || '0', 10);

    let query = supabaseAdmin
      .from('consensus_alerts')
      .select('id,list_id,item_name,change_type,rank,detected_at,resolved')
      .eq('resolved', false)
      .order('detected_at', { ascending: false });

    if (sinceDays > 0) {
      const cutoff = new Date(Date.now() - sinceDays * 86400000).toISOString();
      query = query.gte('detected_at', cutoff);
    }

    const { data, error } = await query;
    if (error) throw error;

    const titles = new Map(LISTS.map((l) => [l.id, l.title]));

    const alerts = (data || []).map((row) => {
      const descs = DESCRIPTIONS[row.list_id] || {};
      const imgs = HERO_IMAGES[row.list_id] || {};
      return {
        id: row.id,
        listId: row.list_id,
        listTitle: titles.get(row.list_id) || row.list_id,
        itemName: row.item_name,
        changeType: row.change_type,
        rank: row.rank,
        detectedAt: row.detected_at,
        hasDescription: Boolean(descs[row.item_name]),
        hasHeroImage: Boolean(imgs[row.item_name]),
      };
    });

    return NextResponse.json({ alerts });
  } catch (err) {
    console.error('consensus-alerts error', err);
    return NextResponse.json({ error: 'failed to load alerts' }, { status: 500 });
  }
}
