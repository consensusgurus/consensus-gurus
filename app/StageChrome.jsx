'use client';

// THE STAGE, generalised off the Gauntlet run (/circuits/gauntlet/run).
//
// A daily is a SITTING, not a page you browse to, and the run proved what that
// means in practice: no site cap above, no footer below, one line of chrome,
// and the board on the ground rather than on a white card floating over a navy
// page. This component is that one line, plus the two things that hang off it.
//
// WHAT IT RENDERS, top to bottom:
//   1. THE CAP. Eyebrow, name, the live figures, a Rankings chip and a Home
//      glyph. Home gave up its words for its glyph on the run because "Back to
//      home" ran 110px against 32px, and the chip is the only exit on the page,
//      so the words were saying what the icon says. Rankings takes a PODIUM
//      mark rather than a second house: two identical glyphs side by side read
//      as one control drawn twice.
//   2. THE PROGRESS HAIRLINE, in the game's own category colour.
//   3. THE STRIP. One line carrying the two facts a player wants without
//      asking, what the best run today is and where they sit, and it is itself
//      the button for the panel.
//   4. THE PANEL, which EXPANDS IN FLOW. An overlay needs a scrim, a z-index, a
//      clipping parent and a focus trap to be honest, and all a reader asked
//      for was to see the board. Nothing is ever hidden behind it.
//
// TWO RULES THE CALLER OWNS:
//
//   * THE STRIP COMES DOWN while the player is working. A live figure about
//     other people is the one thing that should not sit over a clock, or over
//     a keyboard on a phone. Pass stripOn={false} then. It also draws nothing
//     at all without a leader, which is the honest rendering of a quiet day
//     rather than a gap to apologise for.
//   * ONE COLOUR. The stage is near-black plus this game's category step and
//     nothing else. That includes the primary button: see ctaFor in
//     lib/category-ramp.js for why the brand blue does not belong here.
import React, { useEffect, useRef, useState } from 'react';
import { Home } from 'lucide-react';
import { useStageTheme, useThemeQs } from '@/lib/stage-theme';
// The stage swaps LoftCap out, and LoftCap was carrying the whole .loft-*
// sheet that LoftFinish depends on, so the end card rendered unstyled.
import { LoftSheet } from './LoftCap';
import DailyBoardPanel from './quiz/[id]/DailyBoardPanel';
import { dailyMeIdentity } from './dailyMeClient';
import { gameColor, gameCategory, RAMP_INK, STAGE_GROUND } from '@/lib/category-ramp';
import { gameStatsShort } from '@/lib/daily-row-stats';

const ORD = ['th', 'st', 'nd', 'rd'];
function ord(n) {
  const v = Number(n) || 0;
  const s = v % 100;
  return v + (ORD[(s - 20) % 10] || ORD[s] || ORD[0]);
}

// ONE REQUEST, no retry ladder. useDailyBoard exists for the END CARD, where
// the read races the player's own result write and has to keep asking until
// their row lands. Nothing races here: the strip is up before a player has
// finished anything, so a second attempt could only return the same board.
function useStripBoard(quizId, on) {
  const [b, setB] = useState(null);
  const asked = useRef(null);
  useEffect(() => {
    if (!on || !quizId || asked.current === quizId) return undefined;
    asked.current = quizId;
    let alive = true;
    const { anonId, email } = dailyMeIdentity();
    const q = new URLSearchParams({ quizId });
    if (anonId) q.set('anonId', anonId);
    if (email) q.set('email', email);
    if (anonId || email) q.set('placeOn', 'registered:first');
    fetch('/api/quiz/board?' + q.toString())
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d) return;
        const lb = d.leaderboards || {};
        const rows = [lb['registered:first'], d.leaderboard].find((a) => Array.isArray(a)) || [];
        setB({
          rows,
          leader: rows[0] || null,
          field: (d.me && d.me.field) || d.plays || rows.length,
          myRank: d.me && d.me.placement != null ? d.me.placement : null,
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [quizId, on]);
  return b;
}

export default function StageChrome({
  gameKey,
  name,
  cat = null,
  dateLabel = null,
  sunday = null,
  figures = [],
  progress = 0,
  quizId = null,
  scoreWord = 'points',
  stripOn = true,
  boardOn = true,
  homeHref = '/',
  ladder = null,
}) {
  const [panel, setPanel] = useState(false);
  // The switch reads the SAME store the page root reads, so the glyph and the
  // ground can never disagree about which register is showing.
  const [theme, setTheme] = useStageTheme();
  // A ?theme= review override travels back to the home too, or the trip out
  // and the trip back disagree about the register.
  const tq = useThemeQs();
  // Kept for callers that need the literal; the CAP reads var(--stg-acc),
  // which the client's root publishes in both registers.
  const colour = gameColor(gameKey);
  const category = cat || gameCategory(gameKey) || '';
  const board = useStripBoard(quizId, boardOn);

  // A leader is the one thing the strip cannot be drawn without. No leader, no
  // strip: see the suppression rule at the top.
  const leader = board && board.leader;
  const showStrip = !!(stripOn && leader);
  const pct = Math.max(0, Math.min(100, Math.round((Number(progress) || 0) * 100)));

  return (
    <div className="stg-top">
      <style>{CSS}</style>

      <div className="stg-cap">
        <div className="stg-id">
          <i>{[category, dateLabel].filter(Boolean).join(' · ')}</i>
          <b>
            {name}
            {sunday ? <u>{sunday}</u> : null}
          </b>
        </div>

        {figures.length ? (
          <div className="stg-fg">
            {figures.map((f, i) => (
              <div key={f.k || i}><b>{f.v}</b><i>{f.k}</i></div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          className={'stg-cx stg-rank' + (panel ? ' on' : '')}
          onClick={() => setPanel((v) => !v)}
          aria-expanded={panel}
          aria-controls="stg-rankings"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 21v-7" /><path d="M12 21V4" /><path d="M20 21v-10" />
          </svg>
          <span>Rankings</span>
        </button>
        <button
          type="button"
          className="stg-cx stg-theme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
          title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}
        >
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
            </svg>
          )}
        </button>
        <a className="stg-cx stg-home" href={tq ? homeHref + (homeHref.includes('?') ? tq : '?' + tq.slice(1)) : homeHref} aria-label="Home" title="Home">
          <Home size={13} strokeWidth={2.4} />
        </a>
      </div>

      <LoftSheet />
      <div className="stg-prog"><span style={{ width: pct + '%' }} /></div>

      {showStrip ? (
        <button
          type="button"
          className={'stg-strip' + (panel ? ' on' : '')}
          onClick={() => setPanel((v) => !v)}
          aria-expanded={panel}
          aria-controls="stg-rankings"
        >
          <span className="stg-se">Today</span>
          <b className="stg-sn">{leader.username || 'Guest'}</b>
          {/* THE LEADER'S OWN RESULT, in the game's units. This used to render
              the row's score with the word "points" after it, which on Suds
              came out as "10 points" — a figure a player cannot translate back
              into the grid they just filled (owner, 2026-08-31). gameStatsShort
              reads the row the way the tile panel's board already does: score
              out of the board's total, then the clock. `scoreWord` stays as the
              fallback for a row too thin to say anything better. */}
          <span className="stg-sf">
            {gameStatsShort(leader) || `${Math.round(Number(leader.score) || 0)} ${scoreWord}`}
          </span>
          <span className="stg-sd">
            {'· '}{board.field} {board.field === 1 ? 'player' : 'players'}
          </span>
          <span className="stg-sy">
            {board.myRank ? 'You ' + ord(board.myRank) : 'Not played yet'}
            <i>{panel ? '‹' : '›'}</i>
          </span>
        </button>
      ) : null}

      {/* THE LADDER, as a full-width RAIL rather than a gutter.
          The run puts it in a 136px gutter because a question is one line of
          text with acres of space beside it. A board that already fills the
          column has no such gutter to give, so the same drawing runs the width
          under the cap, where it reads as the page's own progress. StageLadder
          renders either way (pass vertical for a gutter), and which one a game
          wants is a property of its BOARD, not of the stage. */}
      {ladder ? <div className="stg-rail">{ladder}</div> : null}

      {panel ? (
        <div className="stg-panel" id="stg-rankings" role="region" aria-label="Rankings">
          <div className="stg-pin">
            {/* The panel's dark styling has to follow the REGISTER, not the stage. It
                    was hardcoded, so on the light stage it drew the dark register's
                    near-white ink and pale sky tabs onto a near-white panel. */}
            <DailyBoardPanel self={gameKey} quizId={quizId} maxWidth={720} stage dark={theme !== 'light'} />
            <button type="button" className="stg-px" onClick={() => setPanel(false)}>Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SANS = "'Manrope',system-ui,-apple-system,sans-serif";
const MONO = "'DM Mono',ui-monospace,'SFMono-Regular',monospace";

// No backtick may appear anywhere in this string, comments included: one closes
// the template literal and the build fails with an error pointing somewhere
// else entirely. It has happened on this codebase before.
const CSS = `
.stg-top{background:var(--stg-ground,#0b0f1a);font-family:${SANS};color:var(--stg-ink,#e9edf4);}

.stg-cap{display:flex;align-items:center;gap:16px;padding:12px 20px;}
.stg-id{display:flex;flex-direction:column;gap:1px;min-width:0;}
.stg-id i{font-family:${MONO};font-style:normal;font-size:9.5px;letter-spacing:.15em;
  text-transform:uppercase;color:var(--stg-mute2,#66748f);}
.stg-id b{font-size:16px;font-weight:800;letter-spacing:-.01em;display:flex;align-items:center;gap:9px;}
.stg-id b u{text-decoration:none;font-family:${MONO};font-size:9px;letter-spacing:.11em;
  text-transform:uppercase;font-weight:500;color:var(--stg-onramp,#08222e);background:var(--stg-acc);
  border-radius:99px;padding:3px 8px;}
.stg-fg{display:flex;gap:20px;margin-left:22px;}
.stg-fg>div{display:flex;flex-direction:column;}
.stg-fg b{font-family:${MONO};font-size:14px;font-weight:500;line-height:1.15;
  font-variant-numeric:tabular-nums;}
.stg-fg i{font-family:${MONO};font-style:normal;font-size:9px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--stg-mute2,#66748f);}

.stg-cx{display:inline-flex;align-items:center;gap:6px;font-family:${MONO};font-size:10px;
  letter-spacing:.11em;text-transform:uppercase;color:var(--stg-ink2,#aab5c7);border:1px solid var(--stg-line);
  border-radius:99px;padding:5px 11px;background:none;cursor:pointer;text-decoration:none;}
.stg-rank{margin-left:auto;}
.stg-home{padding:5px 8px;}
.stg-theme{padding:5px 8px;}
.stg-cx:hover{border-color:var(--stg-line2,rgba(255,255,255,0.17));color:var(--stg-ink,#e9edf4);}
.stg-rank.on{color:var(--stg-onramp,#08222e);background:var(--stg-acc);border-color:var(--stg-acc);}
.stg-cx:focus-visible{outline:2px solid var(--stg-acc);outline-offset:2px;}

.stg-prog{height:2px;background:var(--stg-surf2,rgba(255,255,255,0.08));}
.stg-prog span{display:block;height:100%;background:var(--stg-acc);transition:width .3s ease;}

.stg-strip{display:flex;align-items:center;gap:11px;width:100%;text-align:left;cursor:pointer;
  background:var(--stg-surf,rgba(255,255,255,0.045));border:0;border-bottom:1px solid var(--stg-line);
  padding:9px 20px;font-family:${SANS};font-size:12.5px;color:var(--stg-ink,#e9edf4);}
.stg-strip:hover{background:var(--stg-surf,rgba(255,255,255,0.045));}
.stg-strip.on{background:var(--stg-surf2,rgba(255,255,255,0.08));}
.stg-strip:focus-visible{outline:2px solid var(--stg-acc);outline-offset:-2px;}
.stg-se{font-family:${MONO};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--stg-mute2,#66748f);}
.stg-sn{font-weight:800;}
.stg-sf{font-family:${MONO};font-size:11.5px;color:var(--stg-ink2,#aab5c7);}
.stg-sd{color:var(--stg-mute2,#66748f);font-size:11.5px;}
.stg-sy{margin-left:auto;flex:none;color:var(--stg-acc);font-family:${MONO};font-size:10px;
  letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:7px;}

/* IN FLOW, never over. Nothing is hidden behind it and it needs no scrim. */
.stg-rail{max-width:1180px;margin:0 auto;padding:14px 20px 2px;}
.stg-panel{border-bottom:1px solid var(--stg-line);background:var(--stg-panel,#0d1220);}
.stg-pin{max-width:1180px;margin:0 auto;padding:16px 20px 20px;}
.stg-px{display:block;margin:14px auto 0;background:none;border:1px solid var(--stg-line);
  border-radius:99px;color:var(--stg-mute2,#66748f);font-family:${MONO};font-size:9.5px;letter-spacing:.13em;
  text-transform:uppercase;padding:6px 16px;cursor:pointer;}

/* LAYOUT the game lays its board into: a gutter for the ladder and the board
   on the ground beside it. On a phone the gutter lies down above the board. */
.stg-body{display:flex;gap:26px;max-width:1180px;margin:0 auto;padding:26px 20px 40px;}
.stg-gut{flex:0 0 96px;display:flex;flex-direction:column;min-height:200px;}
.stg-play{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;align-items:center;}

@media(max-width:900px){
  /* TWO ROWS ON A PHONE (owner, 2026-08-31: "too much stuff mashed together").
     The cap was one flex line carrying the identity, up to four figures and
     three icon buttons; at 390 it wrapped into a 100px block against 59 on the
     desktop, and the wrap fell wherever it landed rather than where it means
     something. It is a grid now, split the way the site masthead splits: row 1
     is what the page IS and how to leave it, row 2 is how you are doing. The
     figures get the full width to themselves and space out evenly, so four fit
     without shrinking the title. */
  .stg-cap{gap:10px;padding:10px 13px;}
  .stg-id b{font-size:15px;}
  .stg-fg{margin-left:auto;gap:14px;}
  /* The second row is spent ONLY when it buys something. A game with one or two
     figures (Suds: time, filled) still fits beside its title, and forcing it
     onto its own line took that cap from 52px to 100px — a taller header to
     hold LESS. Three or more is where the one-line version starts wrapping
     where it lands rather than where it means something, so that is where the
     split earns its height. :has counts the figures for us. */
  .stg-cap:has(.stg-fg>div:nth-child(3)){
    display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;
    grid-template-areas:'id rank theme home' 'fg fg fg fg';
    align-items:center;gap:9px 8px;}
  .stg-cap:has(.stg-fg>div:nth-child(3)) .stg-id{grid-area:id;}
  .stg-cap:has(.stg-fg>div:nth-child(3)) .stg-rank{grid-area:rank;}
  .stg-cap:has(.stg-fg>div:nth-child(3)) .stg-theme{grid-area:theme;}
  .stg-cap:has(.stg-fg>div:nth-child(3)) .stg-home{grid-area:home;}
  .stg-cap:has(.stg-fg>div:nth-child(3)) .stg-fg{
    grid-area:fg;margin-left:0;gap:0;justify-content:space-between;
    border-top:1px solid var(--stg-line,rgba(255,255,255,0.09));padding-top:8px;}
  .stg-fg>div{min-width:0;}
  .stg-strip{padding:8px 13px;gap:8px;font-size:11.5px;}
  /* The player count is the first thing to go: the strip's job on a phone is
     the leader's result and your own place. */
  .stg-sd{display:none;}
  /* A long name yields to the figure beside it rather than pushing it out. */
  .stg-sn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
  .stg-sf{flex:none;}
  .stg-pin{padding:14px 13px 18px;}
  .stg-rail{padding:11px 13px 2px;}
}
@media(max-width:640px){
  .stg-body{flex-direction:column;gap:14px;padding:14px 12px 30px;}
  .stg-gut{flex:none;min-height:0;}
  .stg-rank{padding:5px 8px;}
  .stg-rank span{display:none;}
}
`;
