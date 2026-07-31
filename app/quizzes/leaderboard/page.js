import { redirect } from 'next/navigation';
import { CHALLENGES } from '@/lib/challenges';

// /quizzes/leaderboard — the challenge-event URL printed on ads and social
// cards. It 307s to the Stat Hub Challenges tab, pre-selecting the static
// event whose window is open RIGHT NOW (so an ad printed today keeps working
// after this event closes: with no open event it lands on the tab's default,
// today's Daily Challenge).
export const dynamic = 'force-dynamic';

export default function QuizLeaderboardRedirect() {
  const now = Date.now();
  const open = CHALLENGES.find(
    (c) => c.since && Date.parse(c.since) <= now && (!c.until || now < Date.parse(c.until)),
  );
  redirect('/quizzes/hub?tab=challenges' + (open ? `&ch=${encodeURIComponent(open.id)}` : ''));
}
