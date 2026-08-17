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
//              dayField, done, total, ready }. Its `total` already excludes
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
import React, { useState } from 'react';
import useDailyRoster from './useDailyRoster';
import { Brain } from 'lucide-react';

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
  const [openArchive, setOpenArchive] = useState(false);
  // BROWSE EVERY GAME BY CATEGORY (owner). The next-up tiles offer a handful;
  // this opens the whole roster, starting on the category just played, because
  // that is the one the reader is already in the mood for.
  const [browse, setBrowse] = useState(false);
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
  const opts = sorted.filter((o) => o.tone !== 'main');
  // Which options span the full width: every primary, plus the last one when
  // the half-width ones would otherwise be odd.
  const wide = new Set();
  opts.forEach((o, i) => { if (o.kind === 'pri' || o.kind === 'gold') wide.add(i); });
  const narrow = opts.map((_, i) => i).filter((i) => !wide.has(i));
  // The Archive and the held-back 'main' options are narrow items too, so they
  // count toward the parity; otherwise the last option is forced wide and the
  // bottom row breaks apart.
  const archiveIsNarrow = !!(archive && archive.length);
  const tailNarrow = (archiveIsNarrow ? 1 : 0) + mains.length;
  if ((narrow.length + tailNarrow) % 2 === 1 && narrow.length) wide.add(narrow[narrow.length - 1]);

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
  if (openArchive && archive && archive.length) {
    return (
      <div className="loft-back">
        <div className="loft-backin">
          <div className="loft-res">
            <b>{name ? `${name} Archive` : 'Archive'}</b>
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

  return (
    <div className="loft-back">
      <div className="loft-backin">
      {/* THE VERDICT LIVES HERE NOW, not on the page cap (owner, 2026-08-14).
          Colouring both said it twice, and this is where the result is. */}
      <div className={outcome ? `loft-res loft-res-${outcome}` : 'loft-res'}><b>{name ? `${name} ${title.charAt(0).toLowerCase()}${title.slice(1)}` : title}</b><s>{detail}</s></div>

      <div className="loft-fiq">
        <Brain className="bi" size={26} strokeWidth={2.2} aria-hidden="true" />
        <span className="n">{iq && iq.gained != null ? `+${iq.gained}` : <Calculating />}</span>
        <span className="t">
          <span className="l">IQ points earned</span>
          <span className="m">
            {iq && iq.xp != null ? `${Number(iq.xp).toLocaleString()} total` : 'counting your run'}
            {iq && iq.rank != null
              ? ` \u00b7 rank #${Number(iq.rank).toLocaleString()}${iq.total != null ? ` of ${Number(iq.total).toLocaleString()}` : ''}`
              : ''}
          </span>
        </span>
        <span className="today"><b>{day && day.ready
          ? (day.todayXp != null ? `+${Number(day.todayXp).toLocaleString()}` : '\u2014')
          : <Calculating />}</b><i>IQ today</i></span>
      </div>
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
            : <button key={i} type="button" className={cls} onClick={o.onClick}>{inner}</button>;
        })}
        {archive && archive.length ? (
          <button type="button" className="loft-opt t-archive" onClick={() => setOpenArchive(true)}>
            {name ? `${name} Archive` : 'Archive'}
            <span className="sub">Every daily puzzle, by date</span>
          </button>
        ) : null}
        {mains.map((o, i) => {
          const cls = `loft-opt${o.kind ? ` ${o.kind}` : ''}${o.tone ? ` t-${o.tone}` : ''}`;
          const inner = <>{o.label}{o.sub ? <span className="sub">{o.sub}</span> : null}</>;
          return o.href
            ? <a key={`m${i}`} className={cls} href={o.href}>{inner}</a>
            : <button key={`m${i}`} type="button" className={cls} onClick={o.onClick}>{inner}</button>;
        })}
        {roster.cats.length ? (
          <button type="button" className="loft-opt wide t-browse" onClick={() => setBrowse((v) => !v)}>
            {browse ? 'Hide the other puzzles' : 'Show all puzzles by category'}
            <span className="sub">{browse ? 'Back to your options' : (shownCat ? `Starting with ${shownCat}` : 'Every daily')}</span>
          </button>
        ) : null}
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
