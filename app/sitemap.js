import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';

export default function sitemap() {
  const baseUrl = 'https://sourceoftruths.com';

  // Newest list's publish time doubles as the homepage lastModified,
  // since the homepage changes whenever a list is added.
  const listDates = LISTS.map((list) =>
    new Date(list.publishedAt || `${list.publishedDate}T12:00:00Z`)
  );
  const newestList = new Date(Math.max(...listDates.map((d) => d.getTime())));

  // Quiz dates drive the /quizzes index lastModified and each /quiz/[id] entry.
  // Unlisted quizzes (mobile-preview clones) stay out of the sitemap so they
  // are reachable only by direct link.
  const visibleQuizzes = QUIZZES.filter((quiz) => !quiz.unlisted && (!quiz.publishedAt || Date.parse(quiz.publishedAt) <= Date.now()));
  const quizDates = visibleQuizzes.map((quiz) =>
    new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`)
  );
  const newestQuiz = quizDates.length
    ? new Date(Math.max(...quizDates.map((d) => d.getTime())))
    : newestList;

  // Daily word games live on evergreen URLs (/crux, /garble); their dated
  // catalog entries are thin client-side hops to those pages, so the game
  // URLs go in the sitemap (stamped with the newest live puzzle's date) and
  // the stubs stay out — they also canonicalize to the game pages.
  const WORD_GAME_FORMATS = new Set(['crux', 'garble']);
  const newestOfFormat = (format) => {
    const times = visibleQuizzes
      .filter((quiz) => quiz.format === format)
      .map((quiz) => new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`).getTime());
    return times.length ? new Date(Math.max(...times)) : newestQuiz;
  };
  const catalogQuizzes = visibleQuizzes.filter((quiz) => !WORD_GAME_FORMATS.has(quiz.format));

  const staticPages = [
    { url: baseUrl, lastModified: newestList, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/quizzes`, lastModified: newestQuiz, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/crux`, lastModified: newestOfFormat('crux'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/garble`, lastModified: newestOfFormat('garble'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/geo/nyc-restaurants`, lastModified: new Date('2026-06-25'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/sporcle-alternative`, lastModified: newestQuiz, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/experts-and-aggregators`, lastModified: newestList, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/request`, lastModified: new Date('2026-01-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclosure`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const listPages = LISTS.map((list, i) => ({
    url: `${baseUrl}/list/${list.id}`,
    lastModified: listDates[i],
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const quizPages = catalogQuizzes.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...listPages, ...quizPages];
}
