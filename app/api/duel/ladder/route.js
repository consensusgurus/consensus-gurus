import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/ladder  -> standings from completed duels, by player (anon).
export async function GET(request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('challenger_anon, challenger_name, opponent_anon, opponent_name, winner')
      .eq('status', 'complete')
      .limit(5000);
    if (error) return NextResponse.json({ ladder: [] });
    const by = new Map();
    const bump = (anon, name, f) => {
      if (!anon) return;
      let g = by.get(anon);
      if (!g) { g = { anon, name: name || 'Player', wins: 0, losses: 0, ties: 0 }; by.set(anon, g); }
      if (name) g.name = name;
      g[f] += 1;
    };
    for (const d of (data || [])) {
      const cw = d.winner === 'challenger', ow = d.winner === 'opponent', tie = d.winner === 'tie';
      bump(d.challenger_anon, d.challenger_name, tie ? 'ties' : cw ? 'wins' : 'losses');
      bump(d.opponent_anon, d.opponent_name, tie ? 'ties' : ow ? 'wins' : 'losses');
    }
    const ladder = [...by.values()].map((g) => {
      const played = g.wins + g.losses + g.ties;
      return { ...g, played, winPct: played ? Math.round((g.wins / played) * 100) : 0 };
    }).sort((a, b) => b.wins - a.wins || b.winPct - a.winPct || b.played - a.played || a.name.localeCompare(b.name)).slice(0, 50);
    return NextResponse.json({ ladder });
  } catch (e) {
    return NextResponse.json({ ladder: [] });
  }
}
