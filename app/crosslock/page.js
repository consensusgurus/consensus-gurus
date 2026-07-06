import CrosslockClient from './CrosslockClient';

// Crosslock soft launch: intentionally NOT in the sitemap, the /quizzes hub,
// or any homepage shelf. Reachable only by direct link until it graduates.

export const metadata = {
  title: 'Crosslock — Crossword × Wordle × Connections | Source of Truths',
  description:
    'Eight hidden words interlock in a mini crossword with no clues — only four Connections-style categories. Solve every slot Wordle-style on a shared 16-guess budget, then file each word under its category. Four strikes and it’s over.',
  alternates: { canonical: '/crosslock' },
  openGraph: {
    title: 'Crosslock — Crossword × Wordle × Connections',
    description:
      'Eight interlocking words, zero clues, four hidden categories, sixteen shared guesses. A new daily word game from Source of Truths.',
    url: '/crosslock',
    type: 'website',
    siteName: 'Source of Truths',
  },
  twitter: {
    card: 'summary',
    title: 'Crosslock — Crossword × Wordle × Connections',
    description:
      'Eight interlocking words, zero clues, four hidden categories, sixteen shared guesses.',
  },
};

export default function CrosslockPage() {
  return <CrosslockClient />;
}
