import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { ensureRefCode } from '@/lib/referrals-server';
import { refShareUrl } from '@/lib/referrals';
import { CONTEST, contestIsLive, contestHasEnded, daysLeft } from '@/lib/contest';
import { contestBoard, contestStanding, winEligibility, contestFullField } from '@/lib/contest-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Resolve the viewer to a quiz_users row across DEVICES, not just this browser.
// Same ladder as /api/quiz/referrals (email -> attributed games -> anon_id):
// quiz_users.anon_id only ever holds the FIRST browser that created the
// account, so keying off it alone strands every other device the player uses.
async function findViewer(admin, { anonId, email }) {
  const ident = await findQuizIdentity(admin, { email, anonId });
  let userId = ident && ident.id ? ident.id : null;

  if (!userId && anonId) {
    try {
      const { data } = await admin
        .from('quiz_results')
        .select('user_id')
        .eq('anon_id', anonId)
        .not('user_id', 'is', null)
        .limit(1);
      if (Array.isArray(data) && data[0] && data[0].user_id) userId = data[0].user_id;
    } catch { /* pre-migration columns may be absent */ }
  }
  if (!userId) return null;

  const { data: user } = await admin
    .from('quiz_users')
    .select('id, username, ref_code, email')
    .eq('id', userId)
    .maybeSingle();
  return user || null;
}

// GET /api/quiz/contest?anonId=...&email=...&limit=25
//
// Powers the contest surface, the pop-up and the end-card teaser:
//   contest  : the window, prize and formula, so no client hardcodes a date
//   board    : combined standings (pre-contest carry-in + earned in window)
//   me       : the viewer's own standing, share link and win-eligibility
//
// Never throws: the contest is a promo and must not be able to break the page
// it sits on. Any failure degrades to an empty board with live:false.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit'), 10) || 25));
    const anonId =
      (searchParams.get('anonId') || '').trim().slice(0, 64) ||
      request.cookies.get('sot_vid')?.value ||
      '';
    const email = (searchParams.get('email') || '').trim().slice(0, 120) || null;

    const live = contestIsLive();
    const meta = {
      id: CONTEST.id,
      live,
      ended: contestHasEnded(),
      daysLeft: daysLeft(),
      startsAt: CONTEST.startsAt,
      endsAt: CONTEST.endsAt,
      deadlineLabel: CONTEST.deadlineLabel,
      prizeLabel: CONTEST.prizeLabel,
      winners: CONTEST.winners,
      payoutOptions: CONTEST.payoutOptions,
      weights: {
        users: CONTEST.USER_WEIGHT,
        sessions: CONTEST.SESSION_WEIGHT,
        plays: CONTEST.PLAY_WEIGHT,
      },
    };

    const { rows, ready } = await contestBoard(supabaseAdmin, { limit });

    // Referrers who would place but have no email on file, each carrying the
    // rank they WOULD hold in the real field. Best-effort: this depends on
    // migration 47, and an empty list simply hides the tab.
    let unclaimed = [];
    try {
      const full = await contestFullField(supabaseAdmin);
      unclaimed = (full.unclaimed || []).slice(0, limit);
    } catch { /* pre-migration-47: no unclaimed view */ }

    let me = null;
    if (anonId || email) {
      const user = await findViewer(supabaseAdmin, { anonId: anonId || null, email });
      if (user) {
        const code = await ensureRefCode(supabaseAdmin, user);
        const standing = await contestStanding(supabaseAdmin, { ...user, ref_code: code });
        const { eligible, reason } = winEligibility(user);
        me = {
          username: user.username,
          code,
          shareUrl: refShareUrl(code),
          eligible,
          reason,
          // Zeroed rather than null when they have no referrals yet, so the
          // surface can render a real "0" instead of a loading dash.
          users: standing ? standing.users : 0,
          sessions: standing ? standing.sessions : 0,
          plays: standing ? standing.plays : 0,
          score: standing ? standing.score : 0,
          carryIn: standing ? standing.carryIn : 0,
          earned: standing ? standing.earned : 0,
          rank: standing ? standing.rank : null,
          fieldSize: standing ? standing.fieldSize : 0,
        };
      }
    }

    return NextResponse.json({ contest: meta, board: rows, unclaimed, me, ready });
  } catch {
    return NextResponse.json({
      contest: { id: CONTEST.id, live: false, ended: false, daysLeft: 0 },
      board: [],
      me: null,
      ready: false,
    });
  }
}
