import DailyArchiveClient from './DailyArchiveClient';
import { PUZZLES as CRUX } from '../crux/puzzles';
import { PUZZLES as EMCEE } from '../emcee/puzzles';
import { PUZZLES as GARBLE } from '../garble/puzzles';
import { PUZZLES as LINKS } from '../links/puzzles';
import { PUZZLES as SPAN } from '../span/puzzles';
import { PUZZLES as DATING } from '../dating/puzzles';
import { PUZZLES as TALLY } from '../tally/puzzles';
import { PUZZLES as SUDS } from '../suds/puzzles';
import { PUZZLES as CARVE } from '../carve/puzzles';
import { PUZZLES as CIRCA } from '../circa/puzzles';
import { PUZZLES as OUTRANK } from '../outrank/puzzles';
import { PUZZLES as EXTRA } from '../extra/puzzles';
import { PUZZLES as STET } from '../stet/puzzles';
import { PUZZLES as OUTWIT_FULL } from '../outwit/puzzles';
import { PUZZLES as TUCK } from '../tuck/puzzles';
import { PUZZLES as ALIBI_FULL } from '../alibi/puzzles';
import { PUZZLES as CIPHER } from '../cipher/puzzles';
import { PUZZLES as PING } from '../ping/puzzles';
import { PUZZLES as WARMER } from '../warmer/puzzles';
import { PUZZLES as JESTER_FULL } from '../jester/puzzles';
import { PUZZLES as SWORN_FULL } from '../sworn/puzzles';
import { PUZZLES as SHARDS } from '../shards/puzzles';
import { PUZZLES as AXIOM_FULL } from '../axiom/puzzles';
import { PUZZLES as HEARSAY_FULL } from '../hearsay/puzzles';
import { PUZZLES as VENN_FULL } from '../venn/puzzles';
import { PUZZLES as BRACKET_FULL } from '../bracket/puzzles';

// Outwit's bank is server-only in a stronger sense than the others: its
// `house` arrays and herd truths must never reach the client. This page only
// forwards answer-free fields, but strip the sensitive ones defensively.
const OUTWIT = OUTWIT_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));

// Alibi's bank stores each case's solution — strip it (and everything else the
// archive doesn't need) before it can reach a client bundle.
const ALIBI = ALIBI_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));

// Jester and Sworn store their solutions in the bank too — same strip.
const JESTER = JESTER_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const SWORN = SWORN_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
// Axiom and Hearsay ship their boards with verdicts and dialogue; the hub only
// ever needs the date shell, so strip everything else the same way.
const AXIOM = AXIOM_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const HEARSAY = HEARSAY_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const VENN = VENN_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));
const BRACKET = BRACKET_FULL.map(({ num, quizId, live, dateLabel, sunday }) => ({ num, quizId, live, dateLabel, sunday }));

// The daily-games hub + archive. One page listing every daily game, each with
// today's puzzle and its full back-catalog of past drops (live<=today only, so
// future puzzles and their answers never ship). Played/unplayed state is read
// client-side from each game's per-puzzle localStorage save.

export const metadata = {
  title: 'Daily Games — Crux, Emcee, Garble, Links, Span & More | Source of Truths',
  description:
    "Every Source of Truths daily game in one place: today's puzzle and the full archive for Crux, Emcee, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra, Carve, Stet, Outwit, Tuck, Alibi, Cipher, Ping, Warmer, Jesters, Sworn, Shards, Axiom, Hearsay, Venn, and Bracket. A new puzzle in each, every day.",
  alternates: { canonical: '/daily' },
  openGraph: {
    title: 'Daily Games — Source of Truths',
    description:
      "Today's puzzle and the full archive for every daily game: Crux, Emcee, Garble, Links, Span, Dating, Tally, Suds, Circa, Extra, Carve, Stet, Outwit, Tuck, Alibi, Cipher, Ping, Warmer, Jesters, Sworn, Shards, Axiom, Hearsay, Venn, and Bracket.",
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

// Which drops are the bigger/harder Sunday Edition. EVERY game that runs one
// flags it right on the puzzle (`sunday: true`) — that flag is the single
// source of truth site-wide, and Crux was converted to it (2026-07-20), so the
// old `guesses === 27` heuristic is gone. Games with no distinct Sunday
// (Garble, Links, Dating, Outwit, Tuck, Alibi, Cipher, Warmer) never set it,
// so they stay unmarked. See the Sunday Editions section of CLAUDE.md.
function isSundayEdition(key, p) {
  return p.sunday === true;
}

// Accents mirror DailyGamesPromo so each game reads the same across surfaces.
const GAMES = [
  { key: 'crux', name: 'Crux', path: '/crux', tag: 'A clueless crossword', accent: '#2563eb', bg: '#eef4ff', border: 'rgba(37,99,235,0.35)', src: CRUX },
  { key: 'emcee', name: 'Emcee', path: '/emcee', tag: 'The daily mini crossword', accent: '#c026d3', bg: '#fbeefc', border: 'rgba(192,38,211,0.4)', src: EMCEE },
  { key: 'shards', name: 'Shards', path: '/shards', tag: 'Reassemble the shattered crossword', accent: '#0d9488', bg: '#d9f0ee', border: 'rgba(13,148,136,0.4)', src: SHARDS },
  { key: 'garble', name: 'Garble', path: '/garble', tag: 'Five garbled words, one clued finale', accent: '#8a6d1a', bg: '#fdf6e3', border: 'rgba(230,185,63,0.6)', src: GARBLE },
  { key: 'links', name: 'Links', path: '/links', tag: 'Sixteen words, four hidden threads', accent: '#166534', bg: '#eefaf1', border: 'rgba(90,169,106,0.5)', src: LINKS },
  { key: 'span', name: 'Span', path: '/span', tag: 'Cross the map, border by border', accent: '#9d174d', bg: '#fdf0f6', border: 'rgba(217,99,153,0.45)', src: SPAN },
  { key: 'dating', name: 'Dating', path: '/dating', tag: 'Put five moments in order', accent: '#6d28d9', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)', src: DATING },
  { key: 'tally', name: 'Tally', path: '/tally', tag: 'Balance every row and column', accent: '#15803d', bg: '#eefaf1', border: 'rgba(21,128,61,0.45)', src: TALLY },
  { key: 'suds', name: 'Suds', path: '/suds', tag: 'Fill the 9×9 grid, 1–9', accent: '#ea580c', bg: '#fff5ed', border: 'rgba(234,88,12,0.4)', src: SUDS },
  { key: 'carve', name: 'Carve', path: '/carve', tag: 'Carve the grid into equal sums', accent: '#7c3aed', bg: '#f5f0ff', border: 'rgba(124,58,237,0.4)', src: CARVE },
  { key: 'circa', name: 'Circa', path: '/circa', tag: 'Pin the year of the moment', accent: '#0e7490', bg: '#e8f7fa', border: 'rgba(14,116,144,0.4)', src: CIRCA },
  { key: 'extra', name: 'Extra', path: '/extra', tag: 'Unredact the front page', accent: '#b91c1c', bg: '#fdeeee', border: 'rgba(185,28,28,0.4)', src: EXTRA },
  { key: 'stet', name: 'Stet', path: '/stet', tag: 'Spot the error, fix the copy', accent: '#0369a1', bg: '#e8f3fa', border: 'rgba(3,105,161,0.4)', src: STET },
  { key: 'outwit', name: 'Outwit', path: '/outwit', tag: 'Five duels against the crowd', accent: '#1f2937', bg: '#eef1f5', border: 'rgba(31,41,55,0.35)', src: OUTWIT },
  { key: 'outrank', name: 'Outrank', path: '/outrank', tag: "Call the crowd's order", accent: '#4338ca', bg: '#eef0fb', border: 'rgba(67,56,202,0.4)', src: OUTRANK },
  { key: 'tuck', name: 'Tuck', path: '/tuck', tag: 'Same letters, highest score wins', accent: '#92400e', bg: '#f5e9dc', border: 'rgba(146,64,14,0.35)', src: TUCK },
  { key: 'alibi', name: 'Alibi', path: '/alibi', tag: 'Solve the nightly whodunit', accent: '#8b1e2d', bg: '#f6e3e5', border: 'rgba(139,30,45,0.35)', src: ALIBI },
  { key: 'cipher', name: 'Cipher', path: '/cipher', tag: 'Crack the letter math', accent: '#0f766e', bg: '#d9f0ee', border: 'rgba(15,118,110,0.35)', src: CIPHER },
  { key: 'ping', name: 'Ping', path: '/ping', tag: 'Find the secret city', accent: '#0284c7', bg: '#e0f2fe', border: 'rgba(2,132,199,0.35)', src: PING },
  { key: 'warmer', name: 'Warmer', path: '/warmer', tag: 'Hotter or colder', accent: '#dc2626', bg: '#fef2f2', border: 'rgba(220,38,38,0.35)', src: WARMER },
  { key: 'jester', name: 'Jesters', path: '/jester', tag: 'Seat the court', accent: '#7c3aed', bg: '#f3e8ff', border: 'rgba(124,58,237,0.35)', src: JESTER },
  { key: 'sworn', name: 'Sworn', path: '/sworn', tag: 'Spot the liars', accent: '#be185d', bg: '#fce7f3', border: 'rgba(190,24,93,0.35)', src: SWORN },
  { key: 'axiom', name: 'Axiom', path: '/axiom', tag: 'Find the hidden rule', accent: '#0f766e', bg: '#ccfbf1', border: 'rgba(15,118,110,0.35)', src: AXIOM },
  { key: 'hearsay', name: 'Hearsay', path: '/hearsay', tag: "Deduce what they don't know", accent: '#7c2d92', bg: '#f5e8fb', border: 'rgba(124,45,146,0.35)', src: HEARSAY },
  { key: 'venn', name: 'Venn', path: '/venn', tag: 'Sort the overlaps', accent: '#b45309', bg: '#fef3c7', border: 'rgba(180,83,9,0.35)', src: VENN },
  { key: 'bracket', name: 'Bracket', path: '/bracket', tag: 'Rebuild the results', accent: '#1d4ed8', bg: '#dbeafe', border: 'rgba(29,78,216,0.35)', src: BRACKET },
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
      .map((p) => ({ num: p.num, dateLabel: p.dateLabel, live: p.live, rev: p.rev || null, quizId: p.quizId, sunday: isSundayEdition(g.key, p) }))
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
