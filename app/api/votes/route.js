import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-server';
import { LISTS } from '@/lib/data';
import { getSources, voteKey } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { listId, itemName, delta } = body || {};

    if (typeof listId !== 'string' || !listId.trim()) {
      return NextResponse.json({ error: 'listId required' }, { status: 400 });
    }
    if (typeof itemName !== 'string' || !itemName.trim()) {
      return NextResponse.json({ error: 'itemName required' }, { status: 400 });
    }
    if (typeof delta !== 'number' || !Number.isFinite(delta) || Math.abs(delta) > 3) {
      return NextResponse.json({ error: 'delta must be -3..3' }, { status: 400 });
    }
    if (listId.length > 100 || itemName.length > 100) {
      return NextResponse.json({ error: 'too long' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('apply_vote', {
      p_list_id: listId.trim(),
      p_item_name: itemName.trim(),
      p_delta: delta,
    });

    if (error) {
      console.error('apply_vote error', error);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    // Best-effort: record this vote as an event for the admin vote log.
    // Non-fatal — a logging failure must never block the vote itself.
    try {
      await supabase.from('vote_events').insert({
        list_id: listId.trim(),
        item_name: itemName.trim(),
        delta,
      });
    } catch (_) {
      // ignore logging errors
    }

    // Best-effort: persist this vote's ranking impact as consensus_alerts
    // rows (cause 'votes', resolved=true) so the activity ledgers show the
    // movement permanently. The feeds' live replay recomputes against the
    // CURRENT sources, so a later source edit silently changes (or erases)
    // what a past ballot did; these rows are the durable at-the-time record.
    // Cron rows and these rows collapse to one display row per item in the
    // ledgers (collapseMoves). Never blocks the vote on failure.
    try {
      const list = LISTS.find((l) => l.id === listId.trim());
      if (list && !list.mode) {
        const [vRes, eRes] = await Promise.all([
          supabaseAdmin.from('votes').select('item_name,score').eq('list_id', list.id),
          supabaseAdmin.from('extras').select('item_name').eq('list_id', list.id),
        ]);
        const totals = {};
        (vRes.data || []).forEach((r) => {
          totals[`${list.id}::${r.item_name.toLowerCase().trim()}`] = Math.max(0, r.score);
        });
        const extrasArr = (eRes.data || []).map((r) => r.item_name);
        const top10 = (t) => {
          const c = (getSources(list, t, extrasArr) || []).find((x) => x.id === 'consensus');
          return c ? c.items.slice(0, 10) : null;
        };
        const after = top10(totals);
        const k = voteKey(list.id, itemName.trim());
        const before = top10({ ...totals, [k]: Math.max(0, (totals[k] || 0) - delta) });
        if (before && after) {
          const rows = [];
          [...new Set([...before, ...after])].forEach((item) => {
            const p = before.indexOf(item) + 1; // 0 = unranked
            const q = after.indexOf(item) + 1;
            if (p === q) return;
            rows.push({
              list_id: list.id,
              item_name: item,
              change_type:
                q === 0
                  ? (p <= 3 ? 'exited_top3' : 'exited_top10')
                  : p === 0
                    ? (q <= 3 ? 'entered_top3' : 'entered_top10')
                    : (p <= 3 && q > 3 ? 'exited_top3' : 'moved'),
              rank: q,
              prev_rank: p,
              cause: 'votes',
              resolved: true,
            });
          });
          if (rows.length) await supabaseAdmin.from('consensus_alerts').insert(rows);
        }
      }
    } catch (_) {
      // ignore impact-logging errors
    }

    return NextResponse.json({ score: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
