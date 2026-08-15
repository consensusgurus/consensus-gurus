import QuizHomeClient from '../quizzes/QuizHomeClient';

/* HOME v3 PREVIEW. The decluttered homepage, rendered by the SAME client the
   real homepage uses, with variant="v3". It is a preview rather than a
   redesign in place so / cannot break while it is being judged: when it is
   approved, / switches to variant="v3" and this route is deleted.

   noindex, because it is a duplicate of the homepage and must never compete
   with it in search. */
export const metadata = {
  title: 'Home preview | Mind Loft',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

export default function HomePreviewPage() {
  return <QuizHomeClient variant="v3" />;
}
