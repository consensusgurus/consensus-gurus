import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { guestHandleFromAnon } from '@/lib/quiz-xp';
import { resolveAnonSet } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/players?q=&exclude=<anon>&email=
// Distinct anon-identified players (guests + name-only accounts), newest first,
// so a challenge to one can surface as their login pop-up (which keys on anon).
//
// `exclude` is expanded to the caller's WHOLE account (every browser anon they
// have played from), not just the current browser. Excluding a single anon let
// a player on a second device see their own other device listed as an opponent
// and challenge themselves.
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const exclude = (url.searchParams.get('exclude') || '').trim();
    const email = (url.searchParams.get('email') || '').trim().slice(0, 120) || null;
    let mine = new Set(exclude ? [exclude] : []);
    if (exclude || email) {
      try { mine = new Set(await resolveAnonSet(supabaseAdmin, { anonId: exclude || null, email })); }
      catch { /* fall back to the single anon */ }
    }
    const { data, error } = await supabaseAdmin
      .from('quiz_results')
      .select('anon_id, username, id')
      .not('anon_id', 'is', null)
      .order('id', { ascending: false })
      .limit(4000);
    if (error) return NextResponse.json({ players: [] });
    const byAnon = new Map();
    for (const r of (data || [])) {
      if (!r.anon_id || mine.has(r.anon_id)) continue;
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
