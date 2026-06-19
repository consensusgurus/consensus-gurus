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
  const quizDates = QUIZZES.map((quiz) =>
    new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`)
  );
  const newestQuiz = quizDates.length
    ? new Date(Math.max(...quizDates.map((d) => d.getTime())))
    : newestList;

  const staticPages = [
    { url: baseUrl, lastModified: newestList, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/quizzes`, lastModified: newestQuiz, changeFrequency: 'daily', priority: 0.8 },
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

  const quizPages = QUIZZES.map((quiz, i) => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: quizDates[i],
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...listPages, ...quizPages];
}
