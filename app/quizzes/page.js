import { redirect } from 'next/navigation';

// The quizzes hub is now the site root (sourceoftruths.com). This legacy path
// permanently redirects to it — see also the 308 in next.config.js. The quiz
// sub-pages (/quizzes/hub, /quizzes/leaderboard, /quizzes/stats,
// /quizzes/business-news) are unaffected.
export default function QuizzesIndexRedirect() {
  redirect('/');
}
