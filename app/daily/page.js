import DailyArchiveClient from './DailyArchiveClient';
import { PUZZLES as CRUX } from '../crux/puzzles';
import { PUZZLES as GARBLE } from '../garble/puzzles';
import { PUZZLES as LINKS } from '../links/puzzles';
import { PUZZLES as SPAN } from '../span/puzzles';
import { PUZZLES as DATING } from '../dating/puzzles';

// The daily-games hub + archive. One page listing every daily game, each with
// today's puzzle and its full back-catalog of past drops (live<=today only, so
// future puzzles and their answers never ship). Played/unplayed state is read
// client-side from each game's per-puzzle localStorage save.

export const metadata = {
  title: 'Daily Games — Crux, Garble, Links, Span & Dating | Source of Truths',
  description:
    "Every Source of Truths daily game in one place: today's puzzle and the full archive for Crux, Garble, Links, Span, and Dating. A new puzzle in each, every day.",
  alternates: { canonical: '/daily' },
  openGraph: {
    title: 'Daily Games — Source of Truths',
    description:
      "Today's puzzle and the full archive for every daily game: Crux, Garble, Links, Span, and Dating.",
    url: '/daily',
    type: 'website',
    siteName: 'Source of Truths',
  },
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

// Accents mirror DailyGamesPromo so each game reads the same across surfaces.
const GAMES = [
  { key: 'crux', name: 'Crux', path: '/crux', tag: 'A clueless crossword', accent: '#2563eb', bg: '#eef4ff', border: 'rgba(37,99,235,0.35)', src: CRUX },
  { key: 'garble', name: 'Garble', path: '/garble', tag: 'Five garbled words, one clued finale', accent: '#8a6d1a', bg: '#fdf6e3', border: 'rgba(230,185,63,0.6)', src: GARBLE },
  { key: 'links', name: 'Links', path: '/links', tag: 'Sixteen words, four hidden threads', accent: '#166534', bg: '#eefaf1', border: 'rgba(90,169,106,0.5)', src: LINKS },
  { key: 'span', name: 'Span', path: '/span', tag: 'Cross the map, border by border', accent: '#9d174d', bg: '#fdf0f6', border: 'rgba(217,99,153,0.45)', src: SPAN },
  { key: 'dating', name: 'Dating', path: '/dating', tag: 'Put five moments in order', accent: '#6d28d9', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)', src: DATING },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sourceoftruths.com' },
    { '@type': 'ListItem', position: 2, name: 'Quizzes', item: 'https://sourceoftruths.com/quizzes' },
    { '@type': 'ListItem', position: 3, name: 'Daily Games' },
  ],
};

export default function DailyPage() {
  const today = etTodayServer();
  // Slim, answer-free shape: only what the archive UI needs, so puzzle content
  // never reaches the client bundle.
  const games = GAMES.map((g) => ({
    key: g.key,
    name: g.name,
    path: g.path,
    tag: g.tag,
    accent: g.accent,
    bg: g.bg,
    border: g.border,
    puzzles: g.src
      .filter((p) => p.live <= today)
      .map((p) => ({ num: p.num, dateLabel: p.dateLabel, live: p.live, rev: p.rev || null, quizId: p.quizId }))
      .sort((a, b) => b.num - a.num),
  }));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <DailyArchiveClient games={games} today={today} />
    </>
  );
}
