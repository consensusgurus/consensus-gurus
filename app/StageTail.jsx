'use client';

// THE FOOT OF A STAGE PAGE: the site footer, with the daily roster in it.
//
// WHY (Search Console audit, 2026-09-01). When every daily moved onto the
// stage (2026-08-31) each client kept its <Footer /> but wrapped it in
// display:(focusMode || STAGE) ? 'none' : 'block', so on the stage, which is
// now every visitor, no game page had a visible footer at all: the page ended
// at "Report an issue". Google saw ten internal links on the whole site. This
// puts a footer back under every daily, the STAGE footer this time, which the
// stage home and the circuit pages already draw, and which now carries a link
// to every live daily (app/DailyRoster.jsx).
//
// It is mounted from each game's page.js, AFTER the client, so it is in the
// server HTML on the first byte and needs nothing from the client's state. It
// sits outside the client's own .stage-page root, which is where the stage
// tokens (--stg-*) are scoped, so it carries a .stage-page root of its own,
// themed by the same hook the client uses; the server renders the same 'light'
// default the client hydrates against, exactly as the game root does.
//
// UX: nothing above the fold moves. The game root is min-height:100vh, so
// this lands below it, past "Report an issue", where the old footer used to
// be on the Loft page.

import { useStageTheme } from '@/lib/stage-theme';
import { gameColor, gameColorLight, gameOnrampLight, gameAccentInkLight } from '@/lib/category-ramp';
import StageFooter from './StageFooter';

export default function StageTail({ self, stage = true }) {
  const [theme] = useStageTheme();
  if (!stage) return null;
  const acc = {
    '--stg-acc-dk': gameColor(self),
    '--stg-acc-lt': gameColorLight(self),
    '--stg-onramp-lt': gameOnrampLight(self),
    '--stg-acc-ink-lt': gameAccentInkLight(self),
  };
  return (
    <div className="stage-page stage-tail" data-stage-theme={theme}
      style={{ ...acc, background: 'var(--stg-ground)', color: 'var(--stg-ink,#e9edf4)', position: 'relative', zIndex: 2 }}>
      <StageFooter />
    </div>
  );
}
