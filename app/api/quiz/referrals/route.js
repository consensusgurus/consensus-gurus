import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ensureRefCode, topReferrers } from '@/lib/referrals-server';
import { refShareUrl } from '@/lib/referrals';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/referrals?anonId=...&days=30
//
// Powers the Top Community Member tile on /quizzes:
//   top : rolling-window referral board (username + credits)
//   me  : the viewer's own share code + link + credit count, when they have
//         joined the leaderboard. null for a visitor with no identity, which is
//         what makes the tile show the "register to get your link" state.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // days: 30 by default; a very large value (36500) is how the public board asks
    // for the all-time view. limit: 10 for the tile, up to 100 for that board.
    const days = Math.min(36500, Math.max(1, parseInt(searchParams.get('days'), 10) || 30));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit'), 10) || 10));
    const anonId =
      (searchParams.get('anonId') || '').trim().slice(0, 64) ||
      request.cookies.get('sot_vid')?.value ||
      '';

    const top = await topReferrers(supabaseAdmin, { days, limit });

    let me = null;
    if (anonId) {
      const { data: user } = await supabaseAdmin
        .from('quiz_users')
        .select('id, username, ref_code')
        .eq('anon_id', anonId)
        .maybeSingle();
      if (user) {
        const code = await ensureRefCode(supabaseAdmin, user);
        let credits = 0;
        if (code) {
          const since = new Date(Date.now() - days * 86400000).toISOString();
          const { count } = await supabaseAdmin
            .from('quiz_referrals')
            .select('id', { count: 'exact', head: true })
            .eq('referrer_user_id', user.id)
            .gte('created_at', since);
          credits = count || 0;
        }
        me = { username: user.username, code, shareUrl: refShareUrl(code), credits };
      }
    }

    return NextResponse.json({ top, me, days });
  } catch {
    // Never let the tile take the page down; it renders its empty state.
    return NextResponse.json({ top: [], me: null, days: 30 });
  }
}
