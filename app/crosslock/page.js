import CrosslockClient from './CrosslockClient';

// Crosslock soft launch: intentionally NOT in the sitemap, the /quizzes hub,
// or any homepage shelf. Reachable only by direct link until it graduates.

export const metadata = {
  title: 'Crosslock — A Daily Word Game | Source of Truths',
  description:
    'Eight hidden words interlock in a mini crossword with no clues — the only hints are four secret categories, each owning two of the words. Guess any letters on a shared 16-guess budget, lock letters into the grid, then file each solved word under its category. Four strikes and it’s over.',
  alternates: { canonical: '/crosslock' },
  openGraph: {
    title: 'Crosslock — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four secret categories, sixteen shared guesses. A new word game from Source of Truths.',
    url: '/crosslock',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary',
    title: 'Crosslock — A Daily Word Game',
    description:
      'Eight interlocking words, zero clues, four secret categories, sixteen shared guesses.',
  },
};

export default function CrosslockPage() {
  return <CrosslockClient />;
}
