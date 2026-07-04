// Public read-only feed for the homepage masthead ticker: the most recent
// consensus ranking movements across all lists, composed into short display
// lines. Reads consensus_alerts (movement rows are written by the daily
// consensus-check cron and by /api/votes vote-impact persistence). Contains
// no secrets; item names and rankings are public site data.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';

export const dynamic = 'force-dynamic';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

const MOVEMENT_TYPES = ['moved', 'entered_top10', 'entered_top3', 'exited_top10', 'exited_top3'];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('consensus_alerts')
      .select('list_id,item_name,change_type,rank,prev_rank,detected_at')
      .in('change_type', MOVEMENT_TYPES)
      .order('detected_at', { ascending: false })
      .limit(60);
    if (error) throw error;

    const titles = new Map(LISTS.map((l) => [l.id, l.title]));
    const seen = new Set();
    const entries = [];

    for (const row of data || []) {
      if (!titles.has(row.list_id)) continue;
      const key = `${row.list_id}::${row.item_name}`;
      if (seen.has(key)) continue;

      // Strip the trailing geographic parenthetical for a compact line.
      const item = row.item_name.replace(/\s*\([^)]*\)\s*$/, '');
      let dir = null;
      let label = null;

      if (row.change_type === 'moved') {
        // prev_rank 0 means previously unranked; only show real in-top-10 moves.
        if (row.prev_rank > 0 && row.rank > 0 && row.rank !== row.prev_rank) {
          dir = row.rank < row.prev_rank ? 'up' : 'down';
          label = `${item} ${dir === 'up' ? 'rises' : 'slips'} to #${row.rank}`;
        }
      } else if (row.change_type === 'entered_top3') {
        dir = 'up';
        label = `${item} enters the Top 3`;
      } else if (row.change_type === 'entered_top10') {
        dir = 'up';
        label = `${item} enters the Top 10`;
      } else if (row.change_type === 'exited_top3') {
        // Skip: an exited_top3 item usually also fires exited_top10 or a move;
        // "exits the Top 3" alone reads ambiguously, so only surface top-10 exits.
        continue;
      } else if (row.change_type === 'exited_top10') {
        dir = 'down';
        label = `${item} exits the Top 10`;
      }

      if (!label) continue;
      seen.add(key);
      entries.push({
        listId: row.list_id,
        listTitle: titles.get(row.list_id),
        dir,
        label,
      });
      if (entries.length >= 12) break;
    }

    // Fallback: on a quiet day with no ranking movements on record, tick
    // the newest published lists instead so the tape never runs empty.
    if (entries.length === 0) {
      const ts = (l) => Date.parse(l.publishedAt || `${l.publishedDate}T12:00:00Z`) || 0;
      const newest = [...LISTS].sort((a, b) => ts(b) - ts(a)).slice(0, 10);
      for (const l of newest) {
        entries.push({ listId: l.id, listTitle: l.title, dir: 'up', label: 'New list' });
      }
    }

    return NextResponse.json({ entries }, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error('ticker error', err);
    return NextResponse.json({ entries: [] });
  }
}
