'use client';

import { useState, useEffect } from 'react';

// Viewport hook scoped to the quiz route (app/quiz/[id]) ONLY. Nothing outside
// this folder imports it, so the mobile/desktop split is confined to individual
// quiz pages and never touches the /quizzes index or any list page.
//
// Returns: null until mounted, then true (<= breakpoint) / false. Quiz boards are
// ssr:false, so there is no server render to mismatch; the null phase guards the
// first client frame. 760px matches the existing quiz ribbon @media breakpoint.
export default function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(null);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, [breakpoint]);
  return isMobile;
}
