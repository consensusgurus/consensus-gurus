// The sitemap URL SET, parameterised by origin.
//
// Extracted from app/sitemap.js on 2026-08-05 so the old hosts can serve the same set of
// pages under their own origin during the domain move (see app/legacy-sitemap). Keeping one
// generator means the old sitemap can never drift from the real one: add a page here and
// both sitemaps get it. app/sitemap.js is now a thin wrapper that passes the canonical
// origin, so nothing about the live sitemap itself changes.

import { LISTS } from '@/lib/data';
import { catalogQuizzes, visibleQuizzes } from '@/lib/quiz-catalog';

export function sitemapEntries(baseUrl) {

  // Newest list's publish time doubles as the homepage lastModified,
  // since the homepage changes whenever a list is added.
  const listDates = LISTS.map((list) =>
    new Date(list.publishedAt || `${list.publishedDate}T12:00:00Z`)
  );
  const newestList = new Date(Math.max(...listDates.map((d) => d.getTime())));

  // Quiz dates drive the /quizzes index lastModified and each /quiz/[id] entry.
  // The visible/catalog filters live in lib/quiz-catalog.js so this sitemap and the
  // /quizzes/all index are guaranteed to cover the SAME set: a sitemapped quiz url can
  // never exist without a crawlable link to it. Unlisted quizzes (mobile-preview clones)
  // stay out of both, so they are reachable only by direct link.
  const visible = visibleQuizzes();
  const quizDates = visible.map((quiz) =>
    new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`)
  );
  const newestQuiz = quizDates.length
    ? new Date(Math.max(...quizDates.map((d) => d.getTime())))
    : newestList;

  // Daily word games live on evergreen URLs (/crux, /garble); their dated
  // catalog entries are thin client-side hops to those pages, so the game
  // URLs go in the sitemap (stamped with the newest live puzzle's date) and
  // the stubs stay out — they also canonicalize to the game pages.
  const newestOfFormat = (format) => {
    const times = visible
      .filter((quiz) => quiz.format === format)
      .map((quiz) => new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`).getTime());
    return times.length ? new Date(Math.max(...times)) : newestQuiz;
  };
  const catalog = catalogQuizzes();

  const staticPages = [
    { url: baseUrl, lastModified: newestQuiz, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/lists`, lastModified: newestList, changeFrequency: 'daily', priority: 0.9 },
    // The full quiz index. High priority on purpose: it is the only crawlable link path
    // to most of the 1,851 /quiz/<id> pages below (see lib/quiz-catalog.js).
    { url: `${baseUrl}/quizzes/all`, lastModified: newestQuiz, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/crux`, lastModified: newestOfFormat('crux'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/emcee`, lastModified: newestOfFormat('emcee'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/garble`, lastModified: newestOfFormat('garble'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/links`, lastModified: newestOfFormat('links'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/span`, lastModified: newestOfFormat('span'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/dating`, lastModified: newestOfFormat('dating'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tally`, lastModified: newestOfFormat('tally'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/suds`, lastModified: newestOfFormat('suds'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/carve`, lastModified: newestOfFormat('carve'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/circa`, lastModified: newestOfFormat('circa'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/extra`, lastModified: newestOfFormat('extra'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stet`, lastModified: newestOfFormat('stet'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/outwit`, lastModified: newestOfFormat('outwit'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/outrank`, lastModified: newestOfFormat('outrank'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/shards`, lastModified: newestOfFormat('shards'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tuck`, lastModified: newestOfFormat('tuck'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/alibi`, lastModified: newestOfFormat('alibi'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/cipher`, lastModified: newestOfFormat('cipher'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/ping`, lastModified: newestOfFormat('ping'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/warmer`, lastModified: newestOfFormat('warmer'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/jesters`, lastModified: newestOfFormat('jester'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sworn`, lastModified: newestOfFormat('sworn'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/axiom`, lastModified: newestOfFormat('axiom'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hearsay`, lastModified: newestOfFormat('hearsay'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/venn`, lastModified: newestOfFormat('venn'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/stands`, lastModified: newestOfFormat('stands'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/bracket`, lastModified: newestOfFormat('bracket'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/pricer`, lastModified: newestOfFormat('pricer'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/lode`, lastModified: newestOfFormat('lode'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/etch`, lastModified: newestOfFormat('etch'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/glyph`, lastModified: newestOfFormat('glyph'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hedge`, lastModified: newestOfFormat('hedge'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/listed`, lastModified: newestOfFormat('listed'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/mate`, lastModified: newestOfFormat('mate'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/four`, lastModified: newestOfFormat('four'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/parker`, lastModified: newestOfFormat('park'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/check`, lastModified: newestOfFormat('check'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/rung`, lastModified: newestOfFormat('rung'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/crunch`, lastModified: newestOfFormat('crunch'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/taire`, lastModified: newestOfFormat('taire'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/fib`, lastModified: newestOfFormat('fib'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/streak`, lastModified: newestOfFormat('streak'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/feud`, lastModified: newestOfFormat('feud'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/babel`, lastModified: newestOfFormat('babel'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/chain`, lastModified: newestOfFormat('chain'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/turn`, lastModified: newestOfFormat('turn'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/suffice`, lastModified: newestOfFormat('suffice'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/docket`, lastModified: newestOfFormat('docket'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/strata`, lastModified: newestOfFormat('strata'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blocks`, lastModified: newestOfFormat('blocks'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/chomp`, lastModified: newestOfFormat('chomp'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sweep`, lastModified: newestOfFormat('sweep'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/redact`, lastModified: newestOfFormat('redact'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/paths`, lastModified: newestOfFormat('paths'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/deep`, lastModified: newestOfFormat('deep'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/anon`, lastModified: newestOfFormat('anon'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/hands`, lastModified: newestOfFormat('hands'), changeFrequency: 'daily', priority: 0.9 },
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

  const quizPages = catalog.map((quiz) => ({
    url: `${baseUrl}/quiz/${quiz.id}`,
    lastModified: new Date(quiz.publishedAt || `${quiz.publishedDate}T12:00:00Z`),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...listPages, ...quizPages];
}
