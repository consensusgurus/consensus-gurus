import QuizHomeClient from './quizzes/QuizHomeClient';
import { QUIZZES } from '@/lib/quizzes';
import { getAllSources } from '@/lib/sources';

const SOURCE_COUNT = getAllSources().length;

export function generateMetadata() {
  const count = Array.isArray(QUIZZES) ? QUIZZES.filter((q) => !q.unlisted).length : 0;
  const title = 'Mind Loft | Elevate Your Thinking';
  const description = `Daily puzzles and quizzes to sharpen your brain. Word, number and logic games, plus ${count}+ timed quizzes across films, music, geography, sports, and brands, from name-them-all and matching to map and multiple-choice. Then browse consensus Top 10 Lists where ${SOURCE_COUNT} experts and aggregators agree.`;
  const ogTitle = 'Mind Loft: Elevate Your Thinking';

  return {
    title,
    description,
    alternates: { canonical: '/' },
    openGraph: {
      title: ogTitle,
      description,
      url: '/',
      type: 'website',
      siteName: 'Mind Loft',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
    },
  };
}

// Nothing on this page can request anything until the bundle has downloaded and
// hydrated: measured on the live site, the FIRST API call left the browser at
// 880ms, and the player stats could not land before that no matter how fast the
// endpoint got. This runs during HTML parse instead, off the identity already in
// localStorage, and parks the promise for the client to await.
//
// It must build byte-identically the same query string QuizHomeClient does
// (anonId, then email, then light=1), because the client only adopts the promise
// when the keys match; any mismatch simply falls through to a normal fetch, so
// the worst case is the behaviour we had before.
const ME_PRELOAD = `(function(){try{
var a=null,e=null;
try{a=localStorage.getItem('sot_quiz_anon')}catch(x){}
try{var i=JSON.parse(localStorage.getItem('sot_quiz_identity')||'null');e=i&&i.email}catch(x){}
if(!a&&!e)return;
var p=new URLSearchParams();
if(a)p.set('anonId',a);
if(e)p.set('email',e);
p.set('light','1');
var k=p.toString();
window.__sotMe={key:k,promise:fetch('/api/quiz/me?'+k).then(function(r){return r.json()}).catch(function(){return null})};
}catch(x){}})();`;

export default function HomePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: ME_PRELOAD }} />
      <QuizHomeClient variant="v3" />
    </>
  );
}
