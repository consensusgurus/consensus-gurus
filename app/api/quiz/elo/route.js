import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { computeElo, rankPlayers } from '@/lib/quiz-elo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/elo[?scope=<dept>]
// Elo-RANKED leaderboard, position only — NO rating number is returned, so the
// /quizzes page can render rank + name (with a verified/guest tag) without ever
// exposing the underlying Elo (that lives only on the Stat Hub via /me).
// `scope` filters to one department's per-category Elo; omit/`all` for overall.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const scope = (searchParams.get('scope') || 'all').trim() || 'all';
  try {
    const { data, error } = await fetchAllRows(
      supabaseAdmin,
      'quiz_results',
      'id, user_id, username, quiz_id, score, total, anon_id, created_at',
      ['id'],
    );
    if (error) {
      console.error('quiz elo error', error);
      return NextResponse.json({ scope, total: 0, players: [] });
    }
    const { players } = computeElo(data || []);
    const ranked = rankPlayers(players, scope);
    // Attach per-player activity stats (NOT the rating number) so the /quizzes
    // leaderboard can cycle Correct / Completed / Days Played / Accuracy across
    // the FIXED Elo order without ever exposing the underlying Elo.
    const out = ranked.map((p, i) => {
      const full = players.get(p.key);
      const stats = full ? {
        correct: full.correct,
        completed: full.completed,
        daysPlayed: full.daysPlayed || 0,
        accuracy: full.accuracy,
      } : { correct: 0, completed: 0, daysPlayed: 0, accuracy: 0 };
      return {
        rank: i + 1,
        name: p.name,
        isAnon: p.isAnon,
        userKey: p.key,
        stats,
      };
    });
    return NextResponse.json({ scope, total: out.length, players: out });
  } catch (e) {
    console.error('quiz elo exception', e);
    return NextResponse.json({ scope, total: 0, players: [] });
  }
}
