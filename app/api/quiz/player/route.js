import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { computeElo, displayHandle } from '@/lib/quiz-elo';
import { buildProfile } from '@/lib/quiz-profile';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/player?key=u:123 | a:<anon>   (or ?username=Name)
// Any player's full Elo profile, same shape as /api/quiz/me. Lets the UI link a
// player name to their stat detail. Anonymous guests are addressable by a:<anon>.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = (searchParams.get('key') || '').trim() || null;
  const uname = (searchParams.get('username') || '').trim() || null;
  try {
    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) { console.error('quiz player error', error); return NextResponse.json({ found: false }); }
    const { players } = computeElo(data || [], { rankFor: key });

    let myKey = key;
    if (!myKey && uname) {
      // Resolve a (registered) display name to its key.
      for (const [k, p] of players) {
        if (!p.isAnon && (p.username || displayHandle(p)) === uname) { myKey = k; break; }
      }
    }
    return NextResponse.json(buildProfile(players, myKey));
  } catch (e) {
    console.error('quiz player exception', e);
    return NextResponse.json({ found: false });
  }
}
