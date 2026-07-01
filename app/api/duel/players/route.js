import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { guestHandleFromAnon } from '@/lib/quiz-elo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/players?q=&exclude=<anon>
// Distinct anon-identified players (guests + name-only accounts), newest first,
// so a challenge to one can surface as their login pop-up (which keys on anon).
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const exclude = (url.searchParams.get('exclude') || '').trim();
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('anon_id, username, id')
      .not('anon_id', 'is', null)
      .order('id', { ascending: false })
      .limit(4000);
    if (error) return NextResponse.json({ players: [] });
    const byAnon = new Map();
    for (const r of (data || [])) {
      if (!r.anon_id || r.anon_id === exclude) continue;
      if (byAnon.has(r.anon_id)) continue;
      const name = (r.username && r.username.trim()) ? r.username.trim() : guestHandleFromAnon(r.anon_id);
      byAnon.set(r.anon_id, { anon: r.anon_id, name });
    }
    let players = [...byAnon.values()];
    if (q) players = players.filter((p) => p.name.toLowerCase().includes(q));
    return NextResponse.json({ players: players.slice(0, 24) });
  } catch (e) {
    return NextResponse.json({ players: [] });
  }
}
