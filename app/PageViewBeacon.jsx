'use client';
// Records a page view for a route that is not a list or a quiz.
//
// The site has NO path-based view tracking: every view is keyed on an opaque
// string in `views.list_id` or `quiz_views.quiz_id`. The established way to
// count an ordinary page is therefore to invent a RESERVED pseudo-id and post
// it to one of the two existing endpoints, which is what 'home', 'daily',
// 'kids' and 'exam-*' already do. This component is that idiom, generalised,
// so a server-rendered page can opt in with one line and stay a server
// component (a client child under a server parent, exactly like Footer).
//
// It posts to /api/quiz/view rather than /api/views ON PURPOSE, for two
// reasons that are both about the admin panel:
//
//   1. The admin's quiz row set unions the ALL-TIME views map as well as the
//      24h one, so a page keeps its row on a day with no traffic. The list row
//      set unions only the 24h map, so a quiet day makes the page disappear
//      from the panel entirely.
//   2. PageViewsPanel honours a quiz row's `href`, but hardcodes `/list/<id>`
//      for list rows. Only the quiz path can link an admin row to the real URL,
//      which is why the 'home' and 'daily' rows are dead links today.
//
// Give any new caller a title and href in TRACKED_PAGES in app/admin/page.js so
// the row reads properly, and never create a real quiz with the same id.
import { useEffect } from 'react';

export default function PageViewBeacon({ id }) {
  useEffect(() => {
    if (!id) return;
    // Once per browser session, matching the other hub pages. Without this a
    // reload or a back-navigation inflates the count.
    const key = `sot-viewed-${id}`;
    let seen = false;
    try {
      seen = sessionStorage.getItem(key) === '1';
      if (!seen) sessionStorage.setItem(key, '1');
    } catch {
      // sessionStorage unavailable (private mode, blocked cookies): count it.
    }
    if (seen) return;
    fetch('/api/quiz/view', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: id }),
    }).catch(() => {});
  }, [id]);

  return null;
}
