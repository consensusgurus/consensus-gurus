import { notFound } from 'next/navigation';
import Grain from '../../Grain';
import NavyFrame from '../NavyFrame';
import QuizNavHeader from '../../quizzes/QuizNavHeader';
import CircuitLanding from './CircuitLanding';
import { ALL_CIRCUITS, circuitById, circuitGamesFor, circuitPageHref, isMarquee } from '@/lib/circuits';
import { SITE_URL } from '@/lib/site';

// /circuits/<id> — a circuit's own page, and the thing a shared circuit link
// lands on.
//
// WHY IT EXISTS (owner, 2026-08-18). Until this page, a circuit had two public
// faces and neither was shareable. The console band on the home page is the
// real one, but it is a band inside a much larger page and a link to it hands a
// recipient the whole homepage rather than the run. /daily-five?circuit=<id> is
// the run SUMMARY: noindex on purpose, one viewer's own results and an hourly
// leaderboard, and it reads as an ending. Sharing that to somebody who has
// never played is sharing them a stranger's scorecard.
//
// So this page answers the one question a recipient actually has: what IS this,
// and where do I start? Name, the line the circuit is shared with, the games in
// run order with what each one is, the trophy it pays, and a button that starts
// the run. It is the destination for share.invite, the crawlable link path to
// every daily in that circuit, and the only circuit surface a search engine can
// index.
//
// INDEXED, unlike the summary. Everything here is evergreen: the roster of a
// skill circuit is fixed, so this page says the same true thing tomorrow. The
// live parts (whether the viewer has played today, today's board) are a client
// island underneath, exactly so the server-rendered half stays cacheable and
// stays honest to a crawler.
//
// force-dynamic, for ONE reason: the marquee's roster is a daily read out of
// lib/daily-five and a statically rendered /circuits/five would freeze
// whichever day it was built on. The fourteen skill circuits would be happy
// static; they share the route, so they share the setting.

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return ALL_CIRCUITS.map((c) => ({ id: c.id }));
}

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export async function generateMetadata({ params }) {
  const c = circuitById(decodeURIComponent(params.id));
  if (!c) return {};
  const games = circuitGamesFor(c.id, etTodayServer());
  const n = games.length || 5;
  const names = games.map((g) => g.name).join(', ');
  const title = isMarquee(c.id)
    ? 'The Daily Five: Five Daily Puzzles, One Run | Mind Loft'
    : `The ${c.name} Circuit: ${n} Daily Puzzles, One Run | Mind Loft`;
  // The description is the share invite plus the roster, which is the pair a
  // searcher needs: what the run is, and which games are in it.
  const description = `${c.share.invite}${names ? ` Today: ${names}.` : ''} Free, no account needed, and ranked on your combined placement across all ${n}.`;
  const url = circuitPageHref(c.id);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: isMarquee(c.id) ? 'The Daily Five' : `The ${c.name} Circuit`,
      description: c.share.invite,
      url,
      type: 'website',
      siteName: 'Mind Loft',
    },
    twitter: {
      card: 'summary_large_image',
      title: isMarquee(c.id) ? 'The Daily Five' : `The ${c.name} Circuit`,
      description: c.share.invite,
    },
  };
}

export default function CircuitPage({ params }) {
  const c = circuitById(decodeURIComponent(params.id));
  if (!c) notFound();

  const day = etTodayServer();
  // Server-rendered so the roster is in the HTML: it is the crawlable link path
  // to every daily in the circuit, and it is the half of the page that is true
  // whether or not anyone is signed in.
  const games = circuitGamesFor(c.id, day).map((g) => ({
    key: g.key, name: g.name, cat: g.cat, tag: g.tag, how: g.how,
    href: g.href, img: g.img, color: g.colorNavy || g.color || '#c9d2e0',
  }));

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: isMarquee(c.id) ? 'The Daily Five' : `The ${c.name} Circuit`,
    description: c.share.invite,
    url: `${SITE_URL}${circuitPageHref(c.id)}`,
    numberOfItems: games.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: games.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.name,
      url: `${SITE_URL}${g.href}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Circuits', item: `${SITE_URL}/circuits` },
      { '@type': 'ListItem', position: 3, name: c.name },
    ],
  };

  return (
    <>
      <Grain />
      <QuizNavHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Plain serializable props only: this is the server/client boundary.
          The blurb is deliberately NOT passed. It says almost exactly what
          share.invite says, and the header can only carry one of them. */}
      {/* NavyFrame, not a bare <Footer />: this page's ground is the navy
          body, and the shared footer inks itself near-black for the light
          pages. See app/circuits/NavyFrame.jsx. */}
      <NavyFrame>
        <CircuitLanding circuit={{
          id: c.id, name: c.name, share: c.share,
          trophy: c.trophy || null, marquee: !!isMarquee(c.id),
        }} games={games} />
      </NavyFrame>
    </>
  );
}
