// ONE SERVER PAGE FOR EVERY PUZZLE CATEGORY ROUTE.
//
// /sudoku, /crosswords, /word-games, /logic-puzzles, /number-puzzles,
// /trivia-games, /geography-games and /chess-puzzles are each a two-line
// page.js that calls categoryPage(slug). The routes are real folders rather
// than one app/[category] catch-all, because a root catch-all would shadow the
// 404 for every mistyped daily route and sit one line away from every game
// page in the router.
//
// force-dynamic for the same reason the circuit pages are: the roster is read
// off liveDailyKeys at Eastern midnight, and a statically rendered page would
// freeze the day it was built on (Extra retires 2026-09-29, and the page must
// drop it that morning without a deploy).

import { notFound } from 'next/navigation';
import CategoryLanding from './CategoryLanding';
import { puzzleCategory, categoryGames } from '@/lib/puzzle-categories';
import { SITE_URL } from '@/lib/site';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export function categoryPage(slug) {
  const cat = puzzleCategory(slug);
  if (!cat) throw new Error('unknown puzzle category ' + slug);
  const url = `/${slug}`;

  const metadata = {
    title: cat.title,
    description: cat.description,
    alternates: { canonical: url },
    openGraph: { title: cat.h1, description: cat.description, url, type: 'website', siteName: 'Mind Loft' },
    twitter: { card: 'summary_large_image', title: cat.h1, description: cat.description },
  };

  function Page() {
    const games = categoryGames(cat, etTodayServer());
    if (!games.length) notFound();
    const listJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: cat.h1,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: games.length,
      itemListElement: games.map((g, i) => ({
        '@type': 'ListItem', position: i + 1, name: `${g.name}: ${g.generic}`, url: `${SITE_URL}${g.href}`,
      })),
    };
    const crumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Mind Loft', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: cat.label, item: `${SITE_URL}${url}` },
      ],
    };
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: cat.faq.map(([q, a]) => ({
        '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <CategoryLanding cat={cat} games={games} />
      </>
    );
  }

  return { metadata, Page };
}
