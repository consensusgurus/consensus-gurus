import { Suspense } from 'react';
import CruxClient from '../crux/CruxClient';
import { PUZZLES } from '../crux/puzzles';

// A LOOK AT THE LOFT FORMAT, on the live site but off the map.
//
// This renders today's Crux through the same client the real page uses, with
// `loft` on: compact brand bar, the blue cap carrying the live figures, no
// selector ribbon (puzzle choice sits below the board), and the board and all
// of its controls in one white card on a navy play stage.
//
// /crux is UNTOUCHED. The flag is a prop passed from here, and LOFT_GAMES in
// lib/loft.js is empty, so no game renders this way at its own URL.
//
// Not indexed and not in lib/sitemap-entries.js, so it is reachable only if
// you know the path. Delete this directory to retire it.

export const metadata = {
  title: 'Daily format preview | Mind Loft',
  description: 'An internal look at a redesigned daily puzzle page.',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export default function DailyFormatPreviewPage({ searchParams }) {
  const today = etTodayServer();
  const visiblePuzzles = PUZZLES.filter((p) => p.live <= today);
  const n = Number(searchParams && searchParams.p);
  const forceNum = Number.isInteger(n) && n > 0 ? n : null;
  return (
    <Suspense fallback={null}>
      <CruxClient key={forceNum || 'today'} puzzles={visiblePuzzles} forceNum={forceNum} loft />
    </Suspense>
  );
}
