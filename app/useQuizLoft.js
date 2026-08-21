'use client';

// Is this QUIZ page in the Loft format?
//
// The quiz twin of app/useLoft.js. The dailies finished their rollout on
// 2026-08-15 and every one of the 65 now carries the Loft chrome, the navy
// stage and the flip-to-finish; the ~1,200 quizzes were left on the old light
// page with their own inline results block, so the two halves of the site read
// as two different products. This is the switch that moves them over.
//
// Three ways in, checked in this order, deliberately the same three useLoft
// uses so there is one mental model for both surfaces:
//
//   1. an explicit prop, for a route that wants to force it
//   2. QUIZ_LOFT_ON below, which is the real rollout switch, one line
//   3. ?loft=1, a REVIEW override so any quiz can be looked at in the new
//      format before the switch is flipped
//
// WHY THERE IS NO PER-QUIZ LIST. A daily game is a hand-written client, so the
// rollout had to be per game and LOFT_GAMES earned its keep. Every quiz renders
// through one of twelve shared clients, so the unit of rollout is the CLIENT,
// not the quiz: converting QuizClient moves roughly a thousand quizzes at once
// and there is nothing per-id to gate. If a single quiz ever needs holding
// back, add the exception here rather than threading a flag through the client.
//
// THE QUERY CHECK RUNS IN AN EFFECT, never during render. The server has no
// search params, so reading them while rendering makes the server and client
// disagree and React throws a hydration error. The cost is that an overridden
// page paints the old format for one frame, which is the correct trade for a
// review flag; once QUIZ_LOFT_ON is true the format is known at first render
// and never flashes.
import { useEffect, useState } from 'react';

// THE ROLLOUT SWITCH. Flip to true to move every converted quiz client over.
// Until then the format is reachable only at ?loft=1, which is how the owner
// reviews it against the live page side by side.
export const QUIZ_LOFT_ON = false;

export default function useQuizLoft(force = false) {
  const [viaQuery, setViaQuery] = useState(false);
  useEffect(() => {
    try {
      setViaQuery(new URLSearchParams(window.location.search).get('loft') === '1');
    } catch (e) {}
  }, []);
  return force || QUIZ_LOFT_ON || viaQuery;
}
