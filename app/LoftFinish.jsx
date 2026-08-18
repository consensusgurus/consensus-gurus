'use client';

// The back of the board: what to do now that the game is over.
//
// It carries what the old DailyEndCard carried, in the new styling (owner,
// 2026-08-14): the verdict, the IQ you gained and how the DAY is going, today's
// board, and the things you might do next. Those used to live either in a
// separate modal or in a strip BELOW the stage; the end card is where a player
// looks for them, so they moved onto it.
//
// NOTHING HERE NAVIGATES AWAY THAT DOES NOT HAVE TO (owner, 2026-08-14). The
// archive used to be a link to /daily, which threw the player off the page they
// had just finished; it opens IN the card now. The leaderboard shows three and
// expands in place to the full board with its columns. Only actually playing
// another puzzle is worth a page load.
//
// EVERY LAGGING FIGURE SHOWS "CALCULATING", never a blank or a dash (owner,
// 2026-08-14). All three reads race the player's own result write and retry for
// several seconds, so the honest state while waiting is that the number is
// being worked out, not that it is missing or zero.
//
// Driven entirely by the `options` a game passes, because the sensible set
// genuinely differs per game. NOT EVERY GAME HAS A REVEAL: a game that hides a
// solution offers one, a game whose board was never hidden offers "See the
// board" or nothing at all. The component states none of that itself.
//
// THE REVEAL RULE (owner, 2026-08-14). A finish that was not a win must not
// give its answer away on its own: the board holds what the player left until
// they press Reveal here. A WIN has nothing hidden, so its option reads 'See
// the board' instead.
//
// Props beyond title/detail/options:
//   iq         from useIqStanding  — gained, xp, rank, total, todayGained
//   board      from useDailyBoard  — { plays, rows, mine, settled, myRank,
//              field, myRow }. Drives the leaderboard AND the first rank tile,
//              so the two read one order. `rows` is only the top ten; `myRank`
//              and `myRow` are the server's answer for a player below them.
//   day        from useDayStats    — the SHARED hook: { todayXp, dayRank,
//              dayField, done, total, ready }. BOTH day figures ride the blue
//              bar: the points banked today and the rank they bought.
//              Its `total` already excludes
//              retired games, and its fetch is memoized for the page load, so
//              the end card costs no extra request.
//   streak     the game's own current streak, or null
//   missLabel  what this game counts against you, from the daily registry's
//              `miss` field: Guesses, Errors, Moves, Tries... shown as a
//              leaderboard column, because it means something different in
//              every game and a shared header would be wrong. On the six End
//              Game titles the label is 'Tries' and the FIGURE comes from the
//              row's `tries`, not `guessesUsed` (see the cell below).
//   archive    [{ num, dateLabel, href, done, score, sunday }] newest first
//   gameRank   { value, label } this game's own standing, which replaced the
//              day's puzzle count on the tiles (owner, 2026-08-14): how you
//              rank AT THIS GAME is the more interesting figure on its own
//              end card, and the day count already sits on the home slate.
//
// An option is { label, sub, kind, href } plus either href or onClick:
//   kind 'pri'  the one thing most players want next (filled blue)
//   kind 'gold' share, because gold already means share-and-win on this site
// and an optional `tone` (another | similar | replay | archive) which tints the
// button and gives it a coloured left rule. The four secondary options were
// four identical outlined boxes and read as one undifferentiated block (owner,
// 2026-08-14); the tone is what tells them apart at a glance.
import React, { useEffect, useState } from 'react';
import useDailyRoster from './useDailyRoster';
import { Brain } from 'lucide-react';
import { circuitKeysFor, circuitHref, circuitName, readRunParam, runSummaryHref, isMarquee } from '@/lib/circuits';
import { DAILY_GAMES, DAILY_GAME_MAP } from '@/lib/daily-games';
import { fetchDailyMe, dailyMeQuery, dailyMeIdentity } from './dailyMeClient';

function fmtTime(s) {
  if (s == null) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;
}

// One shared placeholder, so a figure that is still being fetched reads the
// same wherever it appears.
function Calculating({ wide = false }) {
  return <span className={wide ? 'loft-calc wide' : 'loft-calc'}>Calculating<i>.</i><i>.</i><i>.</i></span>;
}

export default function LoftFinish({
  title, detail, iq = null, board = null, day = null, streak = null,
  missLabel = null, archive = null, gameRank = null, outcome = null, options = [],
  name = null, catRank = null,
}) {
  const [showAll, setShowAll] = useState(false);
  // WHICH RUN is this finish part of — the marquee, one of the thirteen skill
  // circuits, or none? A circuit ID, not a boolean: it read the ?five=1 flag
  // alone until 2026-08-18, so finishing a game inside a skill circuit fell
  // through to the ordinary end card and the run silently ended there.
  //
  // Read in an effect, never during render: the server has no window and no
  // idea what today is in Eastern, so deriving either during render makes the
  // first client paint disagree with the server's. Null for the first paint,
  // which is the correct answer for every ordinary finish.
  const [inRun, setInRun] = useState(null);
  const [runDay, setRunDay] = useState(null);
  const [runPer, setRunPer] = useState(null);
  const [runSecs, setRunSecs] = useState(6);
  const [runStay, setRunStay] = useState(false);
  useEffect(() => {
    setInRun(readRunParam());
    try { setRunDay(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })); }
    catch (e) { setRunDay(new Date().toISOString().slice(0, 10)); }
  }, []);
  useEffect(() => {
    if (!inRun || !runDay) return undefined;
    const { anonId, email } = dailyMeIdentity();
    if (!anonId && !email) return undefined;
    let alive = true;
    // The shared client, so this joins the request the page is already making
    // rather than adding one. { fresh: true } because the row this finish just
    // wrote is the whole point of asking.
    const load = () => {
      fetchDailyMe(dailyMeQuery({ anonId, email }), { fresh: true })
        .then((d) => { if (alive && d && d.perGame) setRunPer(d.perGame); })
        .catch(() => {});
    };
    load();
    window.addEventListener('sot:daily-updated', load);
    return () => { alive = false; window.removeEventListener('sot:daily-updated', load); };
  }, [inRun, runDay]);
  const [openArchive, setOpenArchive] = useState(false);
  // BROWSE EVERY GAME BY CATEGORY (owner). The next-up tiles offer a handful;
  // this opens the whole roster, starting on the category just played, because
  // that is the one the reader is already in the mood for.
  const [browse, setBrowse] = useState(false);
  // ONE loading state for the whole IQ bar, with a ceiling (owner, 2026-08-17).
  // The bar itself carries the why. Ready means the gain AND the day figures
  // are in, because the bar prints all three on one nowrap row.
  const iqReady = !!(iq && iq.gained != null) && !!(day && day.ready);
  const [iqStalled, setIqStalled] = useState(false);
  useEffect(() => {
    if (iqReady) return undefined;
    // useIqStanding is five attempts over ~10s and then stops for good, so
    // without a ceiling a read that never lands says Calculating forever.
    const t = setTimeout(() => setIqStalled(true), 11000);
    return () => clearTimeout(t);
  }, [iqReady]);
  const iqShow = iqReady || iqStalled;
  const roster = useDailyRoster({ active: browse });
  const [pickCat, setPickCat] = useState(null);
  const myCat = (catRank && catRank.cat)
    || (roster.cats.find((c) => c.games.some((g) => g.name === name)) || {}).cat
    || (roster.cats[0] || {}).cat
    || null;
  const shownCat = pickCat || myCat;
  const shownGames = (roster.cats.find((c) => c.cat === shownCat) || {}).games || [];

  const optsRaw = options.filter(Boolean);
  // THE ROW ORDER IS DECIDED HERE, not by the order a client lists its options
  // (owner): Share spans the top, then Reveal beside Replay, then Play another
  // beside Play similar, and the Archive pairs with Back to main at the foot,
  // Back to main on the right. Ordering by tone means a client only declares
  // what it offers and never has to know the layout.
  const RANK = { reveal: 1, replay: 2, another: 3, similar: 4 };
  const rankOf = (o) => (o.kind === 'gold' ? 0 : o.tone === 'main' ? 9 : (RANK[o.tone] != null ? RANK[o.tone] : 5));
  const sorted = [...optsRaw].sort((a, b) => rankOf(a) - rankOf(b));
  // 'main' is held back so the Archive button, which this component renders
  // itself, can sit to its LEFT.
  const mains = sorted.filter((o) => o.tone === 'main');
  // UP NEXT LEADS THE CARD (owner, 2026-08-17). The 'similar' option comes OUT
  // of the options grid and renders as a band directly under the verdict, above
  // the IQ bar: it was a half tile in the third row, below the verdict, the IQ
  // bar, four day tiles and the whole board, so a finisher passed two exits
  // before reaching the one thing that hands them forward.
  //
  // No game client changes, because all 65 already pass the identical shape:
  //   { tone: 'similar', label: 'Play similar', sub: `${name} · ${tag}`, href }
  // so the game's name and tag are read back off `sub`. A client that passes a
  // `sub` with no middot still renders, using the label as the heading.
  //
  // Parity needs no help: dropping one item from `narrow` leaves the existing
  // tail-parity rule to widen the new last half tile. `RANK.similar` stays so
  // a client that somehow keeps it in the grid still sorts where it used to.
  const simOpt = sorted.find((o) => o.tone === 'similar') || null;
  const simBits = simOpt && simOpt.sub ? String(simOpt.sub).split('\u00b7') : [];
  const simName = simBits.length > 1 ? simBits[0].trim() : null;
  const simTag = simBits.length > 1 ? simBits.slice(1).join('\u00b7').trim() : null;
  const opts = sorted.filter((o) => o.tone !== 'main' && o.tone !== 'similar');
  // Which options span the full width: every primary, plus the last one when
  // the half-width ones would otherwise be odd.
  const wide = new Set();
  opts.forEach((o, i) => { if (o.kind === 'pri' || o.kind === 'gold') wide.add(i); });
  const narrow = opts.map((_, i) => i).filter((i) => !wide.has(i));
  // The Archive and the held-back 'main' options are narrow items too, so they
  // count toward the parity; otherwise the last option is forced wide and the
  // bottom row breaks apart.
  const archiveIsNarrow = !!(archive && archive.length);
  // The browse toggle is a half tile too now (owner, 2026-08-17), so it counts
  // toward the parity. With it and the Archive both narrow the grid pairs as
  // Reveal/Replay, Play another/Archive, Show all/Back to main.
  const browseIsNarrow = !!(roster.cats && roster.cats.length);
  const tailNarrow = (archiveIsNarrow ? 1 : 0) + (browseIsNarrow ? 1 : 0) + mains.length;
  if ((narrow.length + tailNarrow) % 2 === 1 && narrow.length) wide.add(narrow[narrow.length - 1]);

  // REPLAY PUTS THE READER BACK AT THE TOP OF THE PAGE (owner report,
  // 2026-08-18: "you can't actually replay Paths despite the button for
  // replay existing"). Both legacy replay surfaces already did this and said
  // why in the same words: goReplay in DailyEndCard and goReplay in
  // DailyGamesGrid each call the caller's resetGame and then scrollTo(0), "so
  // they land on the fresh board rather than halfway down the leaderboard".
  // This card was written fresh and dropped it, so when the whole roster moved
  // to the Loft format all 63 games with a Replay button lost the scroll. That
  // is the fifth-mirror trap this component has hit before: the behaviour is
  // documented against DailyEndCard, and this is the component on screen.
  //
  // It is not cosmetic, because a replay UNMOUNTS this card and, on any game
  // that gates a fresh board behind a start tile, unmounts the board with it.
  // Paths renders its entire board inside {!preStart && ...}, so the page
  // collapses from ~2300px to ~840px and a reader parked where the card used
  // to be is left on the page tail with no board and no Start button in sight.
  // Nothing appears to have happened. Paths is the worst case because its own
  // "Show a cheapest network" scrolls the reader DOWN to the board first, but
  // every game with a start gate has the same hole.
  //
  // Scoped to tone 'replay', so no other option's behaviour changes.
  const fire = (o) => (e) => {
    if (o.onClick) o.onClick(e);
    if (o.tone !== 'replay' || typeof window === 'undefined') return;
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch (err) { window.scrollTo(0, 0); }
  };

  const rows = board && Array.isArray(board.rows) ? board.rows : [];
  const mine = board ? board.mine : null;
  const isMe = (r) => mine && String(r.username || '').toLowerCase() === mine;
  const shown = showAll ? rows : rows.slice(0, 3);
  const myIdx = rows.findIndex(isMe);
  // THE FIRST TILE RANKS YOU ON THE BOARD PRINTED BELOW IT, not on the day's
  // combined board (owner, 2026-08-15). It used to show `day.dayRank`: your
  // place among everyone who banked ANY IQ today across all the dailies, which
  // is a real figure but reads as nonsense two inches above a header that says
  // "Today's board" and lists eight players. An owner report asked how a field
  // of 8 could put them 21st; it could not, and the tile was answering a
  // different question. The day-wide standing is still on the card as
  // "+N IQ today". Taken off the RENDERED rows so the tile and the row numbers
  // below can never disagree.
  //
  // BUT THE RENDERED ROWS ARE ONLY THE TOP TEN (owner, 2026-08-16), so an index
  // into them answers nothing for the player who came 25th: it returned -1 and
  // the tile printed a dash, which reads as "you did not place" rather than the
  // truth, which is that they placed outside the ten shown. The API now returns
  // the placement on the FULL board of that same axis, so `myRank` prefers it
  // and keeps the index only as the fallback for a stale payload. The two still
  // cannot disagree, because the server ranks the very board printed below.
  const myRank = board && board.myRank != null
    ? board.myRank
    : (myIdx >= 0 ? myIdx + 1 : null);
  const field = board && board.field != null ? board.field : null;
  // Pin the player's own row under the top three when it is not already up
  // there, whether it came out of the ten or off the server.
  const inShown = myIdx >= 0 && (showAll || myIdx < 3);
  const myRow = !inShown && myRank != null
    ? (myIdx >= 0 ? rows[myIdx] : (board && board.myRow) || null)
    : null;

  const lbRow = (r, i) => (
    <div key={i} className={`loft-lbr${i === 0 ? ' first' : ''}${isMe(r) ? ' me' : ''} cols`}>
      <span className="r">{i + 1}</span>
      <span className="n">{r.username || 'Anonymous'}</span>
      <span className="s">{r.score}</span>
      {/* END GAME prints TRIES here (owner, 2026-08-12): its registry label is
          'Tries' and its board ranks on how many runs the solve took, not on
          the per-run error count, which is 0 on every clean solve and printed
          a column of zeroes. Every other game has no `tries` and falls through
          to guessesUsed, so their column is unchanged. Same expression as
          DailyEndCard and DailyBoardPanel: keep the three in step. */}
      {missLabel ? <span className="c">{r.tries != null ? r.tries : (r.egTier != null ? '—' : (r.guessesUsed == null ? '—' : r.guessesUsed))}</span> : null}
      <span className="c">{fmtTime(r.timeElapsed) || '—'}</span>
    </div>
  );

  // THE ARCHIVE TAKES OVER THE WHOLE CARD (owner, 2026-08-14). It used to render
  // as a panel BELOW the options, which broke the layout outright: .loft-opts is
  // a flex child with flex:1, so it stretches to fill the card and the archive
  // was laid over the top of it, date rows sitting on the option buttons. A list
  // of fourteen dates also wants the whole face rather than a squeezed strip
  // under six buttons. So it replaces the content instead of joining it, and
  // Back returns.
  // ── the Daily Five run ────────────────────────────────────────────────────
  // LoftFinish is handed a display `name`, not a key, so the roster is matched
  // on it. Names are unique across the registry.
  const runSelf = (DAILY_GAMES.find((g) => g.name === name) || {}).key || null;
  const runMembers = inRun && runDay ? circuitKeysFor(inRun, runDay) : [];
  const runName = circuitName(inRun);
  const runMarq = isMarquee(inRun);
  // Where this run ends. Declared up here because the auto-advance effect
  // below names it in its dependency array, and a dep array is evaluated
  // during RENDER — a const declared under the hook that names it is a
  // temporal dead zone crash that esbuild accepts.
  const runSummary = runSummaryHref(inRun);
  // A stale or hand-typed flag must not put a game inside a run that does
  // not contain it.
  const runActive = runMembers.length >= 2 && !!runSelf && runMembers.includes(runSelf);
  // PLAYED, not SOLVED, and the game just finished always counts: its row may
  // not be readable yet, but the player is looking at its result.
  const runDone = new Set(runActive ? [runSelf] : []);
  if (runActive && runPer) {
    for (const [k, v] of Object.entries(runPer)) if (!(v && v.abandoned)) runDone.add(k);
  }
  const runN = runMembers.filter((k) => runDone.has(k)).length;
  // Only call a run complete once the day's completions have actually landed,
  // or the first finish of the run reports 1 of 1 and sends the player to the
  // summary after one game.
  const runComplete = runActive && !!runPer && runN === runMembers.length;
  const runNextKey = runActive ? (runMembers.find((k) => k !== runSelf && !runDone.has(k)) || null) : null;
  const runNext = runNextKey ? DAILY_GAME_MAP[runNextKey] : null;

  // The board is the thing the run was FOR, so completing the fifth goes there
  // rather than offering a button and waiting. Six seconds with a visible count
  // and an escape hatch, the same shape as the card's own 30s auto-advance. The
  // THIS WHOLE BLOCK MUST STAY ABOVE THE ARCHIVE EARLY RETURN (fixed
  // 2026-08-17). It used to sit below it, with a comment arguing the effect
  // is unconditional. It is, and that is not the test: an early return ABOVE
  // a hook makes the hook conditional, so opening the archive rendered one
  // fewer hook than the render before it and React threw "Rendered fewer
  // hooks than expected". The computations move with the effect because the
  // dependency array is evaluated during RENDER, so a hook placed above the
  // consts it names is a temporal dead zone crash that esbuild accepts.
  const runAuto = runComplete && !runStay;
  useEffect(() => {
    if (!runAuto) return undefined;
    if (runSecs <= 0) {
      if (typeof window !== 'undefined') window.location.href = runSummary;
      return undefined;
    }
    const t = setTimeout(() => setRunSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [runAuto, runSecs, runSummary]);

  if (openArchive && archive && archive.length) {
    return (
      <div className="loft-back">
        <div className="loft-backin">
          <div className="loft-res">
            <b>{name ? `${name} Archive` : 'Archive'}</b>
            {/* A scrolled list does not show its own length, so the header
                states it (owner, 2026-08-17). */}
            <s>{archive.length} puzzle{archive.length === 1 ? '' : 's'}</s>
            <button type="button" className="loft-back-btn" onClick={() => setOpenArchive(false)}>&#8592; Back</button>
          </div>
          <div className="loft-arch">
            {archive.map((a) => (
              <a key={a.num} className={`loft-archr${a.done ? ' done' : ''}${a.sunday ? ' sun' : ''}`} href={a.href}>
                <span className="d">
                  {a.dateLabel}
                  {a.sunday ? <i className="sunchip">Sunday</i> : null}
                </span>
                <span className="no">No. {a.num}</span>
                {/* Played is stated, not implied. A score alone reads as noise
                    next to a row that just says Play. */}
                <span className="v">{a.done
                  ? <>{a.score != null ? <b>{a.score}</b> : null}<em>Played</em></>
                  : 'Play'}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // IN A RUN, THIS IS THE WHOLE CARD. No IQ bar, no day tiles, no leaderboard,
  // no options grid, no browse-every-puzzle: the verdict, where you are in the
  // five, and one control. Five ordinary finishes in a row is the same page of
  // furniture five times, and every block on it points away from the run the
  // player is in the middle of. The summary arrives once, at /daily-five.
  if (runActive) {
    return (
      <div className="loft-back">
        <div className="loft-backin">
          <style>{`
            .d5f-run{display:flex;align-items:center;gap:10px;margin:12px 0 2px;}
            .d5f-eye{font-size:9.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#a98a2e;white-space:nowrap;}
            /* Gold for the marquee, blue for a skill circuit, green once the
               run is done — the console band's own three-state rule. */
            .d5f-run.circ .d5f-eye{color:#2563eb;}
            .d5f-run.done .d5f-eye,.d5f-run.circ.done .d5f-eye{color:#15803d;}
            .d5f-pips{display:flex;gap:4px;flex:1;min-width:0;}
            .d5f-pips span{flex:1;height:6px;border-radius:3px;background:#dbe2ee;}
            .d5f-pips span.on{background:#10b981;}
            .d5f-pips span.now{background:#2563eb;}
            .d5f-alt{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:14px;}
            .d5f-alt a{font-size:11.5px;font-weight:800;letter-spacing:.03em;color:#646c7a;text-decoration:none;}
            .d5f-alt a:hover{color:#0b0c0e;}
          `}</style>
          <div className={outcome ? `loft-res loft-res-${outcome}` : 'loft-res'}><b>{name ? `${name} ${title.charAt(0).toLowerCase()}${title.slice(1)}` : title}</b><s>{detail}</s></div>

          <div className={`d5f-run${runMarq ? '' : ' circ'}${runComplete ? ' done' : ''}`}>
            <span className="d5f-eye">{runName} {'\u00b7'} {runN} of {runMembers.length}</span>
            <span className="d5f-pips">
              {runMembers.map((k) => (
                <span key={k} className={runDone.has(k) ? 'on' : (k === runNextKey ? 'now' : '')} />
              ))}
            </span>
          </div>

          {runComplete ? (
            <a className="loft-next" href={runSummary}>
              <span className="t">
                <span className="eb">Run complete</span>
                <span className="nm">See how the run went</span>
                <span className="tg">The board for all {runMembers.length}, and every result</span>
              </span>
              <span className="go">{runAuto ? (runSecs > 0 ? `Opening in ${runSecs}s` : 'Opening\u2026') : 'Open'}</span>
            </a>
          ) : runNext ? (
            <a className="loft-next" href={circuitHref(runNextKey, inRun)}>
              <span className="t">
                <span className="eb">Next in the run {'\u00b7'} {runN + 1} of {runMembers.length}</span>
                <span className="nm">{runNext.name}</span>
                {runNext.tag ? <span className="tg">{runNext.tag}</span> : null}
              </span>
              <span className="go">Play</span>
            </a>
          ) : null}

          <div className="d5f-alt">
            {!runComplete ? <a href={runSummary}>Run summary</a> : null}
            {runAuto ? <a href="#" onClick={(e) => { e.preventDefault(); setRunStay(true); }}>Stay here</a> : null}
            <a href={(DAILY_GAME_MAP[runSelf] || {}).href || `/${runSelf}`}>Leave the run</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="loft-back">
      <div className="loft-backin">
      {/* THE VERDICT LIVES HERE NOW, not on the page cap (owner, 2026-08-14).
          Colouring both said it twice, and this is where the result is. */}
      <div className={outcome ? `loft-res loft-res-${outcome}` : 'loft-res'}><b>{name ? `${name} ${title.charAt(0).toLowerCase()}${title.slice(1)}` : title}</b><s>{detail}</s></div>

      {/* Up next. Sits between the verdict and the IQ bar so the result is
          still read first and the handoff is the second thing on the card. */}
      {simOpt ? (
        <a className="loft-next" href={simOpt.href || undefined} onClick={simOpt.onClick || undefined}>
          <span className="t">
            <span className="eb">Up next</span>
            <span className="nm">{simName || simOpt.label}</span>
            {simTag ? <span className="tg">{simTag}</span> : null}
          </span>
          <span className="go">Play</span>
        </a>
      ) : null}

      {/* ONE loading state for the WHOLE bar (owner, 2026-08-17). Each of the
          three figures used to carry its own <Calculating />, and this row is
          nowrap with only `.t` able to shrink (min-width:0), so three nowrap
          18px placeholders came to ~276px where the settled figures come to
          ~122px. `.t` collapsed to zero, the auto margin gave up its free
          space, the flex:none figures overflowed and the text collided, clipped
          by .loft-back's overflow:hidden.

          It showed on a phone and not on desktop because the max-width:560px
          block shrinks every real figure (.n to 23px, .today b to 15px, and it
          hides the em) and never touches `.loft-fiq .loft-calc`, which stays
          18px at every width. So the phone tightened the settled state and left
          the loading state at full size.

          The bar now says it once, on one line, and swaps to the figures when
          they are ALL in. Past the ceiling it lays out normally and prints a
          dash for whatever is missing, which is why no <Calculating /> is left
          inside it. */}
      {!iqShow ? (
        <div className="loft-fiq calc1">
          <Brain className="bi" size={26} strokeWidth={2.2} aria-hidden="true" />
          <span className="cc">Calculating IQ<i>.</i><i>.</i><i>.</i></span>
        </div>
      ) : (
      <div className="loft-fiq">
        <Brain className="bi" size={26} strokeWidth={2.2} aria-hidden="true" />
        <span className="n">{iq && iq.gained != null ? `+${iq.gained}` : '\u2014'}</span>
        <span className="t">
          <span className="l">IQ points earned</span>
          {/* RANK ONLY, no lifetime total (owner, 2026-08-17). This line
              led with a running total and the row is nowrap with only `.t`
              able to shrink, so the lifetime figure was spending width the
              rank needs. It is still on the player's profile and in the Stat
              Hub; what belongs beside a gain that was just earned is where
              that gain puts you, not a running sum. */}
          <span className="m">
            {iq && iq.rank != null
              ? `rank #${Number(iq.rank).toLocaleString()}${iq.total != null ? ` of ${Number(iq.total).toLocaleString()}` : ''}`
              : '\u2014'}
          </span>
        </span>
        <span className="today"><b>{day && day.ready
          ? (day.todayXp != null ? `+${Number(day.todayXp).toLocaleString()}` : '\u2014')
          : '\u2014'}</b><i>IQ today</i></span>
        {/* THE DAY'S IQ RANK SITS BESIDE THE DAY'S IQ (owner, 2026-08-17). This
            bar is the card's DAY-WIDE axis and it was carrying only a points
            figure: the tiles below rank the player on this game's board and in
            their category, and neither answers "where did today put me across
            all the dailies". The figure was on the card once, on the first tile,
            and was pulled on 2026-08-15 because it sat two inches above a header
            reading "Today's board" and a field of eight, so it read as a wrong
            answer to a different question. Beside "+N IQ today", off the SAME
            useDayStats payload, it is unambiguous and the two can never
            disagree. */}
        <span className="today rank"><b>{day && day.ready
          ? (day.dayRank != null
            ? <>#{Number(day.dayRank).toLocaleString()}{day.dayField != null ? <em>of {Number(day.dayField).toLocaleString()}</em> : null}</>
            : '\u2014')
          : '\u2014'}</b><i>IQ rank today</i></span>
      </div>
      )}
      {/* Each figure gets its OWN colour (owner, 2026-08-14): four identical grey
          tiles read as one block and nothing stands out. */}
      <div className="loft-day">
        {/* The field size goes in the LABEL, matching the tile beside it
            ("of 991 Crux all time"): a rank means little without the size of
            the thing it is a rank in, and it is what tells a player that 25th
            of 108 is a good day. */}
        <span className="d1"><b>{board && (myRank != null || board.settled)
          ? (myRank != null ? `#${myRank.toLocaleString()}` : '\u2014')
          : <Calculating />}</b>{myRank != null && field
            ? `of ${Number(field).toLocaleString()} on today\u2019s board`
            : <>on today&rsquo;s board</>}</span>
        <span className="d2"><b>{gameRank && gameRank.value != null
          ? gameRank.value
          : <Calculating />}</b>{gameRank ? gameRank.label : 'this game'}</span>
        <span className="d3"><b>{catRank && catRank.ready
          ? (catRank.rank != null ? `#${Number(catRank.rank).toLocaleString()}` : '\u2014')
          : <Calculating />}</b>{catRank && catRank.cat
            ? `${String(catRank.cat).toLowerCase()} today`
            : 'category today'}</span>
        <span className="d4"><b>{streak != null && streak >= 1 ? streak : '\u2014'}</b>day streak</span>
      </div>

      {/* `wait` reserves the block's height only until the rows land, so a
          settled board sizes to what it actually holds instead of leaving a run
          of white above the options (owner, 2026-08-15). */}
      <div className={rows.length ? 'loft-lb' : 'loft-lb wait'}>
        <div className="h">
          <b>Today&rsquo;s board</b>
          {board && board.plays ? <s>{Number(board.plays).toLocaleString()} played</s> : null}
        </div>
        {!board ? <Calculating wide /> : null}
        {board && !rows.length ? <span className="loft-empty">Nobody has finished this one yet.</span> : null}
        {rows.length ? (
          <div className="loft-lbr head cols">
            <span className="r" />
            <span className="n">Player</span>
            <span className="s">Score</span>
            {missLabel ? <span className="c">{missLabel}</span> : null}
            <span className="c">Time</span>
          </div>
        ) : null}
        {shown.map(lbRow)}
        {myRow ? lbRow(myRow, myRank - 1) : null}
        {rows.length > 3 ? (
          <button type="button" className="loft-more" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Show less' : `Show all ${rows.length}`}
          </button>
        ) : null}
      </div>

      <div className="loft-opts">
        {opts.map((o, i) => {
          const cls = `loft-opt${o.kind ? ` ${o.kind}` : ''}${o.tone ? ` t-${o.tone}` : ''}${wide.has(i) ? ' wide' : ''}`;
          const inner = <>{o.label}{o.sub ? <span className="sub">{o.sub}</span> : null}</>;
          return o.href
            ? <a key={i} className={cls} href={o.href}>{inner}</a>
            : <button key={i} type="button" className={cls} onClick={fire(o)}>{inner}</button>;
        })}
        {archive && archive.length ? (
          <button type="button" className="loft-opt t-archive" onClick={() => setOpenArchive(true)}>
            {name ? `${name} Archive` : 'Archive'}
            <span className="sub">Every daily puzzle, by date</span>
          </button>
        ) : null}
        {/* Half width and BEFORE the held-back 'main' options, so it pairs with
            Back to main on the last row (owner, 2026-08-17). The expanded panel
            below still renders last: it spans the grid, so between the two it
            would split the pair it belongs under. */}
        {roster.cats.length ? (
          <button type="button" className="loft-opt t-browse" onClick={() => setBrowse((v) => !v)}>
            {browse ? 'Hide the other puzzles' : 'Show all puzzles by category'}
            <span className="sub">{browse ? 'Back to your options' : (shownCat ? `Starting with ${shownCat}` : 'Every daily')}</span>
          </button>
        ) : null}
        {mains.map((o, i) => {
          const cls = `loft-opt${o.kind ? ` ${o.kind}` : ''}${o.tone ? ` t-${o.tone}` : ''}`;
          const inner = <>{o.label}{o.sub ? <span className="sub">{o.sub}</span> : null}</>;
          return o.href
            ? <a key={`m${i}`} className={cls} href={o.href}>{inner}</a>
            : <button key={`m${i}`} type="button" className={cls} onClick={fire(o)}>{inner}</button>;
        })}
        {browse && roster.cats.length ? (
          <div className="loft-browse">
            <div className="loft-cats">
              {roster.cats.map((c) => (
                <button key={c.cat} type="button"
                  className={c.cat === shownCat ? 'on' : undefined}
                  onClick={() => setPickCat(c.cat)}>{c.cat}<i>{c.games.length}</i></button>
              ))}
            </div>
            <div className="loft-gtiles">
              {shownGames.map((g) => (
                <a key={g.key} href={g.href} className={g.played ? 'played' : undefined}>
                  <img src={g.img} alt="" width={30} height={30} />
                  <span><b>{g.name}</b><i>{g.tag}</i></span>
                  {g.played ? <em>Played</em> : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
